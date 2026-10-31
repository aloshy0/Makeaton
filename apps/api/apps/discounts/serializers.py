from rest_framework import serializers

from .models import DiscountRule


class DiscountRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountRule
        fields = [
            "id",
            "workspace",
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
        read_only_fields = ["id", "workspace", "times_used", "created_at"]
