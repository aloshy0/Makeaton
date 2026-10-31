from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_number",
        "invoice",
        "amount",
        "payment_method",
        "payment_date",
        "created_at",
    )
    list_filter = ("payment_method", "payment_date")
    search_fields = ("payment_number", "reference", "invoice__invoice_number")
