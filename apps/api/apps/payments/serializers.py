from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source="invoice.invoice_number", read_only=True)
    customer_name = serializers.CharField(source="invoice.customer.company_name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "payment_number",
            "invoice",
            "invoice_number",
            "customer_name",
            "amount",
            "payment_method",
            "payment_date",
            "reference",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "payment_number", "created_at", "updated_at"]
