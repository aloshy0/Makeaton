import logging
from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.subscriptions.models import Subscription

from .models import DiscountRule, Invoice, InvoiceLine, TaxRule

logger = logging.getLogger(__name__)


def advance_billing_date(current_date, frequency):
    if frequency == "daily":
        return current_date + timedelta(days=1)
    elif frequency == "weekly":
        return current_date + timedelta(weeks=1)
    elif frequency == "monthly":
        # approximate 30 days or next month
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


def generate_invoices_for_due_subscriptions(target_date=None):
    """
    Automated recurring billing run:
    Finds all active subscriptions where next_billing_date <= target_date.
    Generates an invoice with prefilled customer details, lines, taxes, and applicable discounts.
    Enforces idempotency using key format: sub_{subscription.id}_{next_billing_date}.
    Advances next_billing_date.
    Guarantees nothing is billed twice or skipped.
    """
    today = target_date or timezone.now().date()
    due_subscriptions = (
        Subscription.objects.filter(status=Subscription.Status.ACTIVE, next_billing_date__lte=today)
        .select_related("customer", "plan")
        .prefetch_related("lines__product", "lines__variant")
    )

    created_invoices = []
    skipped_count = 0

    # Get active tax rules
    tax_rules = list(TaxRule.objects.filter(is_active=True))
    combined_tax_percent = sum(t.rate_percent for t in tax_rules)

    # Get active discount rules
    active_discounts = list(DiscountRule.objects.filter(is_active=True))

    for sub in due_subscriptions:
        idempotency_key = f"sub_{sub.id}_{sub.next_billing_date}"

        # Idempotency check: Skip if already billed for this date
        if Invoice.objects.filter(idempotency_key=idempotency_key).exists():
            skipped_count += 1
            continue

        with transaction.atomic():
            # Determine due date based on payment terms
            days_map = {
                Subscription.PaymentTerms.DUE_ON_RECEIPT: 0,
                Subscription.PaymentTerms.NET_15: 15,
                Subscription.PaymentTerms.NET_30: 30,
                Subscription.PaymentTerms.NET_60: 60,
            }
            term_days = days_map.get(sub.payment_terms, 30)
            due_date = sub.next_billing_date + timedelta(days=term_days)

            invoice = Invoice.objects.create(
                subscription=sub,
                customer=sub.customer,
                issue_date=sub.next_billing_date,
                due_date=due_date,
                status=Invoice.Status.DRAFT,
                idempotency_key=idempotency_key,
            )

            # 1. Base Plan Line
            plan_line_tax = round((sub.plan.cost * combined_tax_percent) / Decimal("100.00"), 2)
            InvoiceLine.objects.create(
                invoice=invoice,
                description=f"Subscription Plan: {sub.plan.name} ({sub.plan.billing_frequency.capitalize()})",
                quantity=1,
                unit_price=sub.plan.cost,
                tax_amount=plan_line_tax,
                discount_amount=Decimal("0.00"),
            )

            # 2. Product Lines
            for s_line in sub.lines.all():
                line_subtotal = s_line.unit_price * s_line.quantity

                # Check line-level discount
                line_discount = Decimal("0.00")
                for disc in active_discounts:
                    if (
                        disc.scope == DiscountRule.Scope.PRODUCT
                        and disc.target_product == s_line.product
                    ):
                        calc = disc.calculate_discount(
                            line_subtotal, s_line.quantity, s_line.product
                        )
                        line_discount = max(line_discount, calc)

                line_tax = round(
                    ((line_subtotal - line_discount) * combined_tax_percent) / Decimal("100.00"), 2
                )
                variant_label = f" ({s_line.variant.attribute_value})" if s_line.variant else ""

                InvoiceLine.objects.create(
                    invoice=invoice,
                    description=f"{s_line.product.name}{variant_label}",
                    product=s_line.product,
                    variant=s_line.variant,
                    quantity=s_line.quantity,
                    unit_price=s_line.unit_price,
                    tax_amount=line_tax,
                    discount_amount=line_discount,
                )

            # 3. Whole subscription level discounts
            all_lines = invoice.lines.all()
            total_subtotal = sum(line.unit_price * line.quantity for line in all_lines)
            total_line_tax = sum(line.tax_amount for line in all_lines)
            total_line_discount = sum(line.discount_amount for line in all_lines)

            sub_discount = Decimal("0.00")
            for disc in active_discounts:
                if disc.scope == DiscountRule.Scope.SUBSCRIPTION:
                    calc = disc.calculate_discount(total_subtotal, 1)
                    if calc > sub_discount:
                        sub_discount = calc
                        # Increment usage count if capped
                        if disc.max_uses:
                            disc.times_used += 1
                            disc.save(update_fields=["times_used"])

            combined_discount = total_line_discount + sub_discount
            invoice.subtotal = total_subtotal
            invoice.tax_amount = total_line_tax
            invoice.discount_amount = combined_discount
            invoice.total_amount = max(
                Decimal("0.00"), total_subtotal + total_line_tax - combined_discount
            )
            invoice.outstanding_balance = invoice.total_amount
            invoice.save()

            # Advance subscription next_billing_date
            next_date = advance_billing_date(sub.next_billing_date, sub.plan.billing_frequency)

            # Check if plan expires or auto closes
            if sub.expiry_date and next_date > sub.expiry_date and sub.plan.auto_close_on_end:
                sub.status = Subscription.Status.CLOSED

            sub.next_billing_date = next_date
            sub.save(update_fields=["next_billing_date", "status"])

            created_invoices.append(invoice)

    return {
        "generated_count": len(created_invoices),
        "skipped_count": skipped_count,
        "invoice_ids": [str(inv.id) for inv in created_invoices],
    }
