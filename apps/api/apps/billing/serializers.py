from rest_framework import serializers

from apps.catalog.serializers import ProductSerializer, ProductVariantSerializer
from apps.customers.serializers import CustomerSerializer

from .models import DiscountRule, Invoice, InvoiceLine, TaxRule


class TaxRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRule
        fields = ["id", "name", "rate_percent", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class DiscountRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountRule
        fields = [
            "id",
            "name",
            "code",
            "discount_type",
            "value",
            "min_purchase_amount",
            "min_quantity",
            "start_date",
            "end_date",
            "max_uses",
            "times_used",
            "scope",
            "target_product",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "times_used", "created_at"]


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
        ]
        read_only_fields = ["id", "line_total"]


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source="customer", read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
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
            "is_overdue",
            "idempotency_key",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "invoice_number",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "paid_amount",
            "outstanding_balance",
            "is_overdue",
            "created_at",
            "updated_at",
        ]
