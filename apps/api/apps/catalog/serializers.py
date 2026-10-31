from rest_framework import serializers

from .models import Product, ProductVariant, SubscriptionPlan


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "product", "attribute_name", "attribute_value", "price_delta"]
        read_only_fields = ["id"]


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "workspace",
            "name",
            "code",
            "product_type",
            "sales_price",
            "cost_price",
            "notes",
            "is_active",
            "variants",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "created_at", "updated_at"]


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "workspace",
            "name",
            "code",
            "billing_interval",
            "base_price",
            "min_seats",
            "start_date",
            "end_date",
            "auto_close_on_end",
            "allow_early_close",
            "allow_pause",
            "allow_renew",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "created_at", "updated_at"]
