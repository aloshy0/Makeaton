import uuid
from decimal import Decimal

from django.db import models
from django.utils import timezone

from apps.catalog.models import Product, ProductVariant
from apps.customers.models import Customer
from apps.workspaces.models import Workspace


class TaxRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tax_rules",
    )
    name = models.CharField(max_length=100)
    rate_percent = models.DecimalField(max_digits=5, decimal_places=2)  # e.g. 10.00 for 10%
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Tax Rule"
        verbose_name_plural = "Tax Rules"

    def __str__(self):
        return f"{self.name} ({self.rate_percent}%)"


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="invoices",
    )
    subscription = models.ForeignKey(
        "subscriptions.Subscription",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="invoices")
    invoice_number = models.CharField(max_length=50, db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    idempotency_key = models.CharField(
        max_length=128, unique=True, db_index=True, null=True, blank=True
    )

    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(db_index=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    outstanding_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issue_date", "-created_at"]
        unique_together = ("workspace", "invoice_number")
        indexes = [
            models.Index(fields=["workspace", "invoice_number"]),
            models.Index(fields=["workspace", "status"]),
            models.Index(fields=["workspace", "due_date"]),
        ]
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.company_name} (${self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            count = Invoice.objects.filter(workspace=self.workspace).count() + 1
            self.invoice_number = f"INV-{timezone.now().year}-{count:04d}"
        if not self.outstanding_balance and self.status != self.Status.PAID:
            self.outstanding_balance = self.total_amount - self.paid_amount
        super().save(*args, **kwargs)


class InvoiceLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        verbose_name = "Invoice Line"
        verbose_name_plural = "Invoice Lines"

    @property
    def subtotal(self):
        return self.line_total

    def save(self, *args, **kwargs):
        if not self.line_total:
            self.line_total = self.unit_price * self.quantity
        super().save(*args, **kwargs)
