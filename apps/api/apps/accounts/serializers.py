from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "company_name"]

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "")
        password = validated_data.pop("password")
        user = User.objects.create_user(role=User.Role.CUSTOMER, **validated_data)
        user.set_password(password)
        user.save()

        # Automatically create customer profile
        from apps.customers.models import Customer

        Customer.objects.create(
            user=user,
            email=user.email,
            company_name=company_name or f"{user.first_name}'s Account"
            if user.first_name
            else user.email,
            contact_name=f"{user.first_name} {user.last_name}".strip() or user.email,
            phone=user.phone or "",
        )
        return user
