import uuid
from decimal import Decimal

from django.db import models
from django.utils import timezone

from apps.billing.models import Invoice


class Payment(models.Model):
    class Method(models.TextChoices):
        CREDIT_CARD = "credit_card", "Credit Card"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        CASH = "cash", "Cash"
        CHECK = "check", "Check"
        ONLINE = "online", "Online Payment"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_number = models.CharField(max_length=50, unique=True, db_index=True)
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
        ordering = ["-payment_date"]

    def __str__(self):
        return f"{self.payment_number} - {self.invoice.invoice_number} (${self.amount})"

    def save(self, *args, **kwargs):
        if not self.payment_number:
            count = Payment.objects.count() + 1
            self.payment_number = f"PAY-{timezone.now().year}-{count:04d}"
        super().save(*args, **kwargs)

        # Update invoice totals
        inv = self.invoice
        total_paid = sum(p.amount for p in inv.payments.all())
        inv.paid_amount = total_paid
        inv.outstanding_balance = max(Decimal("0.00"), inv.total_amount - total_paid)
        if inv.outstanding_balance == Decimal("0.00") and inv.total_amount > Decimal("0.00"):
            inv.status = Invoice.Status.PAID
        elif inv.status == Invoice.Status.DRAFT:
            inv.status = Invoice.Status.CONFIRMED
        inv.save()
