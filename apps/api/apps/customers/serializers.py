from rest_framework import serializers

from .models import Customer, CustomerUserLink


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "workspace",
            "company_name",
            "contact_name",
            "email",
            "phone",
            "billing_address",
            "tax_id",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "workspace", "created_at", "updated_at"]


class CustomerUserLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerUserLink
        fields = ["id", "customer", "user", "created_at"]
        read_only_fields = ["id", "created_at"]
