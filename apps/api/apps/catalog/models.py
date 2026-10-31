import uuid
from decimal import Decimal

from django.db import models

from apps.workspaces.models import Workspace


class Product(models.Model):
    class ProductType(models.TextChoices):
        SOFTWARE = "software", "Software"
        ADDON = "addon", "Add-on"
        SERVICE = "service", "Service"
        PHYSICAL = "physical", "Physical"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    product_type = models.CharField(
        max_length=20, choices=ProductType.choices, default=ProductType.SOFTWARE
    )
    sales_price = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("workspace", "code")
        indexes = [
            models.Index(fields=["workspace", "code"]),
            models.Index(fields=["workspace", "is_active"]),
        ]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return f"{self.name} ({self.code})"


class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    attribute_name = models.CharField(max_length=100)  # e.g., "Brand"
    attribute_value = models.CharField(max_length=100)  # e.g., "Odoo"
    price_delta = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )  # e.g., +560.00
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("product", "attribute_name", "attribute_value")
        ordering = ["attribute_name", "attribute_value"]
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"

    def __str__(self):
        prefix = "+" if self.price_delta >= 0 else ""
        return f"{self.product.name} - {self.attribute_name}: {self.attribute_value} ({prefix}{self.price_delta})"


class SubscriptionPlan(models.Model):
    class BillingFrequency(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="plans",
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    billing_interval = models.CharField(
        max_length=20, choices=BillingFrequency.choices, default=BillingFrequency.MONTHLY
    )
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    min_seats = models.PositiveIntegerField(default=1)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    auto_close_on_end = models.BooleanField(default=True)
    allow_early_close = models.BooleanField(default=True)
    allow_pause = models.BooleanField(default=True)
    allow_renew = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("workspace", "code")
        indexes = [
            models.Index(fields=["workspace", "code"]),
            models.Index(fields=["workspace", "is_active"]),
        ]
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"

    def __str__(self):
        return f"{self.name} ({self.get_billing_interval_display()}) - ${self.base_price}"
