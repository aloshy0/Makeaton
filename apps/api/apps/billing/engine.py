import logging
from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.discounts.models import DiscountRule
from apps.subscriptions.models import Subscription

from .models import Invoice, InvoiceLine, TaxRule

logger = logging.getLogger(__name__)


def advance_billing_date(current_date, frequency):
    if frequency == "daily":
        return current_date + timedelta(days=1)
    elif frequency == "weekly":
        return current_date + timedelta(weeks=1)
    elif frequency == "monthly":
        year = current_date.year + (1 if current_date.month == 12 else 0)
        month = 1 if current_date.month == 12 else current_date.month + 1
        day = min(current_date.day, 28)
        return date(year, month, day)
    elif frequency == "yearly":
        try:
            return current_date.replace(year=current_date.year + 1)
        except ValueError:
            return current_date.replace(year=current_date.year + 1, day=28)
    return current_date + timedelta(days=30)


def run_automated_billing_cycle(workspace_id=None, target_date=None):
    """
    Automated recurring billing run:
    Finds all active subscriptions where next_billing_date <= target_date.
    Optionally scoped to a specific workspace_id.
    Generates an invoice with prefilled customer details, lines, taxes, and applicable discounts.
    Enforces idempotency using key format: ws_{workspace_id}_sub_{subscription.id}_{next_billing_date}.
    Advances next_billing_date.
    """
    today = target_date or timezone.now().date()
    qs = Subscription.objects.filter(
        status=Subscription.Status.ACTIVE, next_billing_date__lte=today
    )
    if workspace_id:
        qs = qs.filter(workspace_id=workspace_id)

    due_subscriptions = qs.select_related("customer", "plan").prefetch_related(
        "lines__product", "lines__variant"
    )

    created_invoices = []
    skipped_count = 0

    for sub in due_subscriptions:
        billing_date = sub.next_billing_date or today
        idempotency_key = f"ws_{sub.workspace_id}_sub_{sub.id}_{billing_date}"

        # 1. Idempotency Check
        if Invoice.objects.filter(idempotency_key=idempotency_key).exists():
            logger.info("Invoice for idempotency key %s already exists. Skipping.", idempotency_key)
            skipped_count += 1
            continue

        with transaction.atomic():
            # Get workspace-specific tax and discount rules
            tax_rules = list(TaxRule.objects.filter(workspace=sub.workspace, is_active=True))
            combined_tax_percent = sum((t.rate_percent for t in tax_rules), Decimal("0.00"))

            active_discounts = list(
                DiscountRule.objects.filter(workspace=sub.workspace, is_active=True)
            )

            # Compute payment due date based on payment terms
            due_days = 0
            if sub.payment_terms == Subscription.PaymentTerms.NET_15:
                due_days = 15
            elif sub.payment_terms == Subscription.PaymentTerms.NET_30:
                due_days = 30
            elif sub.payment_terms == Subscription.PaymentTerms.NET_60:
                due_days = 60
            due_date = billing_date + timedelta(days=due_days)

            # 2. Create Draft Invoice
            invoice = Invoice.objects.create(
                workspace=sub.workspace,
                subscription=sub,
                customer=sub.customer,
                issue_date=billing_date,
                due_date=due_date,
                status=Invoice.Status.CONFIRMED,
                idempotency_key=idempotency_key,
                notes=f"Recurring billing for plan '{sub.plan.name}'",
            )

            subtotal = Decimal("0.00")
            for line in sub.lines.all():
                line_amount = line.unit_price * line.quantity
                subtotal += line_amount

                InvoiceLine.objects.create(
                    invoice=invoice,
                    product=line.product,
                    variant=line.variant,
                    description=f"{line.product.name} ({line.variant.attribute_value})"
                    if line.variant
                    else line.product.name,
                    quantity=line.quantity,
                    unit_price=line.unit_price,
                    tax_amount=Decimal("0.00"),
                    discount_amount=Decimal("0.00"),
                    line_total=line_amount,
                )

            # If plan base price applies without separate lines
            if not sub.lines.exists():
                subtotal = sub.plan.base_price
                InvoiceLine.objects.create(
                    invoice=invoice,
                    description=f"Subscription: {sub.plan.name}",
                    quantity=1,
                    unit_price=sub.plan.base_price,
                    tax_amount=Decimal("0.00"),
                    discount_amount=Decimal("0.00"),
                    line_total=sub.plan.base_price,
                )

            # 3. Calculate Taxes
            tax_amount = (subtotal * combined_tax_percent / Decimal("100.00")).quantize(
                Decimal("0.01")
            )

            # 4. Calculate Discounts
            discount_amount = Decimal("0.00")
            for disc in active_discounts:
                if (
                    disc.start_date
                    and disc.start_date > billing_date
                    or disc.end_date
                    and disc.end_date < billing_date
                ):
                    continue
                if disc.max_uses and disc.times_used >= disc.max_uses:
                    continue
                if subtotal < disc.min_purchase_amount:
                    continue

                if disc.discount_type == DiscountRule.DiscountType.PERCENTAGE:
                    d_val = (subtotal * disc.value / Decimal("100.00")).quantize(Decimal("0.01"))
                else:
                    d_val = min(subtotal, disc.value)

                discount_amount += d_val
                disc.times_used += 1
                disc.save(update_fields=["times_used"])

            total_amount = max(Decimal("0.00"), subtotal + tax_amount - discount_amount)

            # 5. Finalize Invoice
            invoice.subtotal = subtotal
            invoice.tax_amount = tax_amount
            invoice.discount_amount = discount_amount
            invoice.total_amount = total_amount
            invoice.outstanding_balance = total_amount
            invoice.save(
                update_fields=[
                    "subtotal",
                    "tax_amount",
                    "discount_amount",
                    "total_amount",
                    "outstanding_balance",
                ]
            )

            # 6. Advance Subscription next_billing_date
            sub.next_billing_date = advance_billing_date(billing_date, sub.plan.billing_interval)
            sub.save(update_fields=["next_billing_date", "updated_at"])

            created_invoices.append(invoice)
            logger.info("Successfully generated invoice %s for %s", invoice.invoice_number, sub)

    return {
        "status": "success",
        "generated_count": len(created_invoices),
        "skipped_count": skipped_count,
        "invoice_ids": [str(inv.id) for inv in created_invoices],
        "target_date": str(today),
    }


# Backward-compatible alias
generate_invoices_for_due_subscriptions = run_automated_billing_cycle
