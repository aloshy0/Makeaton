import uuid
from datetime import timedelta
from decimal import Decimal

from django.db import models
from django.utils import timezone

from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer
from apps.workspaces.models import Workspace


def default_quote_validity():
    return timezone.now().date() + timedelta(days=30)


class QuotationTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="quotation_templates",
    )
    name = models.CharField(max_length=255)
    validity_days = models.PositiveIntegerField(default=30)
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Quotation Template"
        verbose_name_plural = "Quotation Templates"

    def __str__(self):
        return f"{self.name} ({self.workspace.name})"


class QuotationTemplateLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        QuotationTemplate,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        verbose_name = "Quotation Template Line"
        verbose_name_plural = "Quotation Template Lines"


class Quotation(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Sent"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED = "EXPIRED", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="quotations",
    )
    reference = models.CharField(max_length=50, db_index=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name="quotations")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.RESTRICT, related_name="quotations")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    valid_until = models.DateField(default=default_quote_validity)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("workspace", "reference")
        indexes = [
            models.Index(fields=["workspace", "reference"]),
            models.Index(fields=["workspace", "status"]),
        ]
        verbose_name = "Quotation"
        verbose_name_plural = "Quotations"

    def __str__(self):
        return f"{self.reference} - {self.customer.company_name} (${self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.reference:
            count = Quotation.objects.filter(workspace=self.workspace).count() + 1
            self.reference = f"QUO-{timezone.now().year}-{count:04d}"
        super().save(*args, **kwargs)


class QuotationLine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name="lines")
    product = models.ForeignKey(Product, on_delete=models.RESTRICT)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "Quotation Line"
        verbose_name_plural = "Quotation Lines"

    def save(self, *args, **kwargs):
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)
