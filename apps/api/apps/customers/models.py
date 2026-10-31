import uuid

from django.conf import settings
from django.db import models

from apps.workspaces.models import Workspace


class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="customers",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="legacy_customer_profile",
    )
    company_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    billing_address = models.TextField(blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_name"]
        unique_together = ("workspace", "email")
        indexes = [
            models.Index(fields=["workspace", "email"]),
            models.Index(fields=["workspace", "is_active"]),
        ]
        verbose_name = "Customer"
        verbose_name_plural = "Customers"

    def __str__(self):
        return f"{self.company_name} ({self.contact_name}) - {self.workspace.name}"


class CustomerUserLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="user_links",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_links",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "user")
        verbose_name = "Customer User Link"
        verbose_name_plural = "Customer User Links"

    def __str__(self):
        return f"{self.user.email} <-> {self.customer.company_name}"
