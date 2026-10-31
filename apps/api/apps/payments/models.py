import uuid
from decimal import Decimal

from django.db import models, transaction
from django.utils import timezone

from apps.billing.models import Invoice
from apps.workspaces.models import Workspace


class Payment(models.Model):
    class Method(models.TextChoices):
        CREDIT_CARD = "credit_card", "Credit Card"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        CASH = "cash", "Cash"
        CHECK = "check", "Check"
        ONLINE = "online", "Online Payment"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="payments",
    )
    payment_number = models.CharField(max_length=50, db_index=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(
        max_length=20, choices=Method.choices, default=Method.BANK_TRANSFER
    )
    payment_date = models.DateField(default=timezone.now, db_index=True)
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-payment_date", "-created_at"]
        unique_together = ("workspace", "payment_number")
        indexes = [
            models.Index(fields=["workspace", "payment_number"]),
            models.Index(fields=["workspace", "payment_date"]),
        ]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"{self.payment_number} - {self.invoice.invoice_number} (${self.amount})"

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.payment_number:
                count = Payment.objects.filter(workspace=self.workspace).count() + 1
                self.payment_number = f"PAY-{timezone.now().year}-{count:04d}"
            super().save(*args, **kwargs)

            # Atomically reconcile invoice totals
            inv = Invoice.objects.select_for_update().get(pk=self.invoice_id)
            total_paid = sum(p.amount for p in inv.payments.all())
            inv.paid_amount = total_paid
            inv.outstanding_balance = max(Decimal("0.00"), inv.total_amount - total_paid)
            if inv.outstanding_balance == Decimal("0.00") and inv.total_amount > Decimal("0.00"):
                inv.status = Invoice.Status.PAID
            inv.save(update_fields=["paid_amount", "outstanding_balance", "status", "updated_at"])
