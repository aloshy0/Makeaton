import uuid
from decimal import Decimal

from django.db import models

from apps.catalog.models import Product
from apps.workspaces.models import Workspace


class DiscountRule(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED = "fixed", "Fixed Amount"

    class Scope(models.TextChoices):
        PRODUCT = "product", "Product Line"
        SUBSCRIPTION = "subscription", "Whole Subscription"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="discount_rules",
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
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

    class Meta:
        ordering = ["name"]
        unique_together = ("workspace", "code")
        indexes = [
            models.Index(fields=["workspace", "code"]),
            models.Index(fields=["workspace", "is_active"]),
        ]
        verbose_name = "Discount Rule"
        verbose_name_plural = "Discount Rules"

    def __str__(self):
        val = (
            f"{self.value}%"
            if self.discount_type == self.DiscountType.PERCENTAGE
            else f"${self.value}"
        )
        return f"{self.name} ({self.code}) - {val}"
