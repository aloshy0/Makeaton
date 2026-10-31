from rest_framework import serializers

from apps.catalog.serializers import ProductSerializer, ProductVariantSerializer

from .models import QuotationTemplate, QuotationTemplateLine


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
        ]
        read_only_fields = ["id"]


class QuotationTemplateSerializer(serializers.ModelSerializer):
    lines = QuotationTemplateLineSerializer(many=True, read_only=True)

    class Meta:
        model = QuotationTemplate
        fields = ["id", "name", "plan", "validity_days", "lines", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
