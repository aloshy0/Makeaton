from rest_framework import serializers

from apps.catalog.serializers import ProductSerializer, ProductVariantSerializer
from apps.customers.serializers import CustomerSerializer

from .models import Invoice, InvoiceLine, TaxRule


class TaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRule
        fields = ["id", "workspace", "name", "rate_percent", "is_active", "created_at"]
        read_only_fields = ["id", "workspace", "created_at"]


class InvoiceLineSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source="product", read_only=True)
    variant_details = ProductVariantSerializer(source="variant", read_only=True)

    class Meta:
        model = InvoiceLine
        fields = [
            "id",
            "invoice",
            "description",
            "product",
            "product_details",
            "variant",
            "variant_details",
            "quantity",
            "unit_price",
            "tax_amount",
            "discount_amount",
            "line_total",
            "subtotal",
        ]
        read_only_fields = ["id", "line_total", "subtotal"]


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source="customer", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "workspace",
            "invoice_number",
            "subscription",
            "customer",
            "customer_details",
            "issue_date",
            "due_date",
            "status",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "paid_amount",
            "outstanding_balance",
            "notes",
            "idempotency_key",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "workspace",
            "invoice_number",
            "idempotency_key",
            "paid_amount",
            "outstanding_balance",
            "created_at",
            "updated_at",
        ]
