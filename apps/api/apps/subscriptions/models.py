import uuid
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer
from apps.workspaces.models import Workspace


class Subscription(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        QUOTATION = "quotation", "Quotation"
        CONFIRMED = "confirmed", "Confirmed"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past Due"
        PAUSED = "paused", "Paused"
        CLOSED = "closed", "Closed"
        EXPIRED = "expired", "Expired"

    class PaymentTerms(models.TextChoices):
        DUE_ON_RECEIPT = "due_on_receipt", "Due on Receipt"
        NET_15 = "net_15", "Net 15 Days"
        NET_30 = "net_30", "Net 30 Days"
        NET_60 = "net_60", "Net 60 Days"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subscriptions",
    )
    subscription_number = models.CharField(max_length=50, db_index=True)
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
        unique_together = ("workspace", "subscription_number")
        indexes = [
            models.Index(fields=["workspace", "subscription_number"]),
            models.Index(fields=["workspace", "status"]),
            models.Index(fields=["workspace", "next_billing_date"]),
        ]
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"

    def __str__(self):
        return f"{self.subscription_number} - {self.customer.company_name} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.subscription_number:
            count = Subscription.objects.filter(workspace=self.workspace).count() + 1
            self.subscription_number = f"SUB-{timezone.now().year}-{count:04d}"
        if not self.next_billing_date and self.status in [
            self.Status.CONFIRMED,
            self.Status.ACTIVE,
        ]:
            self.next_billing_date = self.start_date
        super().save(*args, **kwargs)

    def transition_to(self, new_status, user=None, reason=""):
        valid_transitions = {
            self.Status.DRAFT: [
                self.Status.QUOTATION,
                self.Status.CONFIRMED,
                self.Status.ACTIVE,
                self.Status.CLOSED,
            ],
            self.Status.QUOTATION: [self.Status.CONFIRMED, self.Status.CLOSED],
            self.Status.CONFIRMED: [self.Status.ACTIVE, self.Status.CLOSED],
            self.Status.ACTIVE: [
                self.Status.PAST_DUE,
                self.Status.PAUSED,
                self.Status.CLOSED,
                self.Status.EXPIRED,
            ],
            self.Status.PAST_DUE: [self.Status.ACTIVE, self.Status.CLOSED],
            self.Status.PAUSED: [self.Status.ACTIVE, self.Status.CLOSED],
            self.Status.CLOSED: [],
            self.Status.EXPIRED: [self.Status.ACTIVE],
        }

        if new_status not in valid_transitions.get(self.status, []):
            raise ValidationError(
                f"Invalid state transition from '{self.status}' to '{new_status}'."
            )

        prev = self.status
        self.status = new_status
        self.save(update_fields=["status", "updated_at"])

        SubscriptionEvent.objects.create(
            subscription=self,
            previous_status=prev,
            new_status=new_status,
            changed_by=user,
            reason=reason,
        )


class SubscriptionLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "Subscription Line"
        verbose_name_plural = "Subscription Lines"

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class SubscriptionEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="events")
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Subscription Event"
        verbose_name_plural = "Subscription Events"

    def __str__(self):
        return (
            f"{self.subscription.subscription_number}: {self.previous_status} -> {self.new_status}"
        )
