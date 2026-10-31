from rest_framework import serializers

from apps.catalog.serializers import ProductSerializer, ProductVariantSerializer
from apps.customers.serializers import CustomerSerializer

from .models import Quotation, QuotationLine, QuotationTemplate, QuotationTemplateLine


class QuotationTemplateLineSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source="product", read_only=True)
    variant_details = ProductVariantSerializer(source="variant", read_only=True)

    class Meta:
        model = QuotationTemplateLine
        fields = [
            "id",
            "template",
            "product",
            "product_details",
            "variant",
            "variant_details",
            "quantity",
            "unit_price",
        ]
        read_only_fields = ["id"]


class QuotationTemplateSerializer(serializers.ModelSerializer):
    lines = QuotationTemplateLineSerializer(many=True, read_only=True)

    class Meta:
        model = QuotationTemplate
        fields = [
            "id",
            "workspace",
            "name",
            "plan",
            "validity_days",
            "notes",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "created_at", "updated_at"]


class QuotationLineSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source="product", read_only=True)
    variant_details = ProductVariantSerializer(source="variant", read_only=True)

    class Meta:
        model = QuotationLine
        fields = [
            "id",
            "product",
            "product_details",
            "variant",
            "variant_details",
            "quantity",
            "unit_price",
            "subtotal",
        ]
        read_only_fields = ["id", "subtotal"]


class QuotationSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source="customer", read_only=True)
    lines = QuotationLineSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            "id",
            "workspace",
            "reference",
            "customer",
            "customer_details",
            "plan",
            "status",
            "valid_until",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "notes",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "reference", "created_at", "updated_at"]
