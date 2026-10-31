from rest_framework import serializers

from apps.catalog.serializers import (
    ProductSerializer,
    ProductVariantSerializer,
    SubscriptionPlanSerializer,
)
from apps.customers.serializers import CustomerSerializer

from .models import Subscription, SubscriptionLine


class SubscriptionLineSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source="product", read_only=True)
    variant_details = ProductVariantSerializer(source="variant", read_only=True)

    class Meta:
        model = SubscriptionLine
        fields = [
            "id",
            "subscription",
            "product",
            "product_details",
            "variant",
            "variant_details",
            "quantity",
            "unit_price",
            "tax_rate",
            "subtotal",
        ]
        read_only_fields = ["id", "unit_price", "subtotal"]


class SubscriptionSerializer(serializers.ModelSerializer):
    lines = SubscriptionLineSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source="customer", read_only=True)
    plan_details = SubscriptionPlanSerializer(source="plan", read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "subscription_number",
            "customer",
            "customer_details",
            "plan",
            "plan_details",
            "status",
            "start_date",
            "expiry_date",
            "next_billing_date",
            "payment_terms",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "notes",
            "lines",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "subscription_number",
            "subtotal",
            "tax_amount",
            "discount_amount",
            "total_amount",
            "created_at",
            "updated_at",
        ]


class SubscriptionTransitionSerializer(serializers.Serializer):
    target_status = serializers.ChoiceField(choices=Subscription.Status.choices)
