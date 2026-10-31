from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    owned_workspaces_count = serializers.SerializerMethodField()
    available_workspace_slots = serializers.SerializerMethodField()
    max_workspaces = serializers.SerializerMethodField()
    flowgrid_plan = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_picture",
            "role",
            "phone",
            "is_active",
            "owned_workspaces_count",
            "available_workspace_slots",
            "max_workspaces",
            "flowgrid_plan",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_owned_workspaces_count(self, obj):
        return obj.owned_workspaces.filter(is_active=True).count()

    def get_available_workspace_slots(self, obj):
        return obj.get_available_workspace_slots()

    def get_max_workspaces(self, obj):
        return obj.get_flowgrid_plan().max_workspaces

    def get_flowgrid_plan(self, obj):
        plan = obj.get_flowgrid_plan()
        return {
            "name": plan.name,
            "slug": plan.slug,
            "price": str(plan.price),
            "currency": plan.currency,
            "billing_interval": plan.billing_interval,
            "max_workspaces": plan.max_workspaces,
            "max_products_per_workspace": plan.max_products_per_workspace,
            "max_customers_per_workspace": plan.max_customers_per_workspace,
            "max_team_members": plan.max_team_members,
            "features": plan.features,
        }



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "phone", "company_name"]

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "").strip()
        password = validated_data.pop("password")
        user = User.objects.create_user(role=User.Role.CUSTOMER, **validated_data)
        user.set_password(password)
        user.save()

        # If business name supplied during "Start Your Business", bootstrap initial workspace
        if company_name:
            from apps.workspaces.models import Workspace

            Workspace.objects.create(
                name=company_name,
                owner=user,
            )

        return user
