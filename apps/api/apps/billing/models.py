import uuid
from decimal import Decimal

from django.db import models
from django.utils import timezone

from apps.catalog.models import Product, ProductVariant
from apps.customers.models import Customer


class TaxRule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    rate_percent = models.DecimalField(max_digits=5, decimal_places=2)  # e.g. 10.00 for 10%
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.rate_percent}%)"


class DiscountRule(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED = "fixed", "Fixed Amount"

    class Scope(models.TextChoices):
        PRODUCT = "product", "Product Line"
        SUBSCRIPTION = "subscription", "Whole Subscription"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    min_purchase_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    min_quantity = models.PositiveIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    scope = models.CharField(max_length=20, choices=Scope.choices, default=Scope.SUBSCRIPTION)
    target_product = models.ForeignKey(Product, null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        symbol = "%" if self.discount_type == self.DiscountType.PERCENTAGE else "$"
        return f"{self.name} ({self.code}: {self.value}{symbol})"

    def is_valid(self, date=None):
        today = date or timezone.now().date()
        if not self.is_active:
            return False
        if self.start_date and today < self.start_date:
            return False
        if self.end_date and today > self.end_date:
            return False
        if self.max_uses is not None and self.times_used >= self.max_uses:
            return False
        return True

    def calculate_discount(self, amount, quantity=1, product=None):
        if not self.is_valid():
            return Decimal("0.00")
        if self.scope == self.Scope.PRODUCT and product != self.target_product:
            return Decimal("0.00")
        if amount < self.min_purchase_amount or quantity < self.min_quantity:
            return Decimal("0.00")

        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = (amount * self.value) / Decimal("100.00")
        else:
            discount = min(self.value, amount)
        return round(discount, 2)


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        PAID = "paid", "Paid"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    subscription = models.ForeignKey(
        "subscriptions.Subscription",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="invoices")
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    outstanding_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), db_index=True
    )

    # Idempotency token to guarantee nothing is billed twice
    idempotency_key = models.CharField(
        max_length=100, unique=True, null=True, blank=True, db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issue_date"]
        indexes = [
            models.Index(fields=["status", "due_date"]),
            models.Index(fields=["customer", "status"]),
        ]

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.company_name} (${self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            count = Invoice.objects.count() + 1
            self.invoice_number = f"INV-{timezone.now().year}-{count:04d}"
        if not self.due_date:
            self.due_date = self.issue_date + timezone.timedelta(days=30)
        self.outstanding_balance = max(Decimal("0.00"), self.total_amount - self.paid_amount)
        if (
            self.paid_amount >= self.total_amount
            and self.total_amount > 0
            and self.status == self.Status.CONFIRMED
        ):
            self.status = self.Status.PAID
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        return (
            self.status == self.Status.CONFIRMED
            and self.outstanding_balance > 0
            and self.due_date < timezone.now().date()
        )


class InvoiceLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="lines")
    description = models.CharField(max_length=255)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.line_total = max(
            Decimal("0.00"),
            (self.unit_price * self.quantity) + self.tax_amount - self.discount_amount,
        )
        super().save(*args, **kwargs)
