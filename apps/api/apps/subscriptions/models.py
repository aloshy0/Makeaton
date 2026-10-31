import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer


class Subscription(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        QUOTATION = "quotation", "Quotation"
        CONFIRMED = "confirmed", "Confirmed"
        ACTIVE = "active", "Active"
        PAUSED = "paused", "Paused"
        CLOSED = "closed", "Closed"

    class PaymentTerms(models.TextChoices):
        DUE_ON_RECEIPT = "due_on_receipt", "Due on Receipt"
        NET_15 = "net_15", "Net 15 Days"
        NET_30 = "net_30", "Net 30 Days"
        NET_60 = "net_60", "Net 60 Days"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="subscriptions")
    plan = models.ForeignKey(
        SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    start_date = models.DateField(default=timezone.now)
    expiry_date = models.DateField(null=True, blank=True)
    next_billing_date = models.DateField(null=True, blank=True, db_index=True)
    payment_terms = models.CharField(
        max_length=20, choices=PaymentTerms.choices, default=PaymentTerms.DUE_ON_RECEIPT
    )

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "next_billing_date"]),
            models.Index(fields=["customer", "status"]),
        ]

    def __str__(self):
        return f"{self.subscription_number} - {self.customer.company_name} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.subscription_number:
            count = Subscription.objects.count() + 1
            self.subscription_number = f"SUB-{timezone.now().year}-{count:04d}"
        if not self.next_billing_date and self.status == self.Status.ACTIVE:
            self.next_billing_date = self.start_date
        super().save(*args, **kwargs)

    def calculate_totals(self):
        lines_total = sum(line.subtotal for line in self.lines.all())
        # Base plan cost plus product lines
        self.subtotal = self.plan.cost + lines_total
        # Recalculate total after tax and discount
        self.total_amount = max(
            Decimal("0.00"), self.subtotal + self.tax_amount - self.discount_amount
        )
        self.save(update_fields=["subtotal", "total_amount", "tax_amount", "discount_amount"])

    def transition_to(self, target_status):
        """
        State Machine:
        Draft -> Quotation -> Confirmed -> Active <-> Paused -> Closed
        """
        valid_transitions = {
            self.Status.DRAFT: [self.Status.QUOTATION, self.Status.CLOSED],
            self.Status.QUOTATION: [self.Status.CONFIRMED, self.Status.CLOSED],
            self.Status.CONFIRMED: [self.Status.ACTIVE, self.Status.CLOSED],
            self.Status.ACTIVE: [self.Status.PAUSED, self.Status.CLOSED],
            self.Status.PAUSED: [self.Status.ACTIVE, self.Status.CLOSED],
            self.Status.CLOSED: [self.Status.DRAFT] if self.plan.allow_renew else [],
        }

        # Policy checks from Plan
        if target_status == self.Status.PAUSED and not self.plan.allow_pause:
            raise ValidationError("This plan does not permit pausing.")
        if (
            target_status == self.Status.CLOSED
            and self.status == self.Status.ACTIVE
            and not self.plan.allow_early_close
        ):
            raise ValidationError("This plan does not permit early closure.")

        if target_status not in valid_transitions.get(self.status, []):
            raise ValidationError(f"Invalid transition from {self.status} to {target_status}.")

        self.status = target_status
        if target_status == self.Status.ACTIVE and not self.next_billing_date:
            self.next_billing_date = timezone.now().date()
        self.save()


class SubscriptionLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal("0.00")
    )  # e.g. 18.00%
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        base_price = self.product.sales_price
        if self.variant:
            base_price += self.variant.price_delta
        self.unit_price = base_price
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        self.subscription.calculate_totals()
