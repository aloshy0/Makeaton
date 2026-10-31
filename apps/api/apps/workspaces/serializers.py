from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.workspaces.models import (
    ApiKey,
    ApprovalRequest,
    StaffPermission,
    WebhookDelivery,
    WebhookEndpoint,
    Workspace,
    WorkspaceMembership,
)


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = WorkspaceMembership
        fields = ["id", "workspace", "user", "user_id", "role", "status", "joined_at"]
        read_only_fields = ["id", "workspace", "joined_at"]


class WorkspaceSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    user_role = serializers.SerializerMethodField()
    active_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "slug",
            "owner",
            "currency",
            "timezone",
            "is_active",
            "user_role",
            "active_members_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "owner", "created_at", "updated_at"]

    def get_user_role(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            return membership.role if membership else None
        return None

    def get_active_members_count(self, obj):
        return obj.memberships.filter(status=WorkspaceMembership.Status.ACTIVE).count()


class WorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["id", "name", "slug", "currency", "timezone"]
        read_only_fields = ["id", "slug"]

    def validate(self, attrs):
        user = self.context["request"].user
        # Transactional 5-workspace limit enforcement
        owned_count = Workspace.objects.filter(owner=user, is_active=True).count()
        if owned_count >= 5:
            raise serializers.ValidationError(
                {"error": "Workspace limit reached. You can own a maximum of 5 active workspaces."}
            )
        return attrs

    def create(self, validated_data):
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class StaffPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffPermission
        fields = [
            "membership",
            "profile",
            "can_manage_products",
            "can_manage_subscriptions",
            "can_manage_invoices",
            "can_record_payments",
            "can_manage_customers",
            "can_view_reports",
            "can_execute_restricted_actions",
            "updated_at",
        ]
        read_only_fields = ["membership", "updated_at"]


class ApprovalRequestSerializer(serializers.ModelSerializer):
    requested_by_email = serializers.EmailField(source="requested_by.email", read_only=True)
    reviewed_by_email = serializers.EmailField(source="reviewed_by.email", read_only=True)

    class Meta:
        model = ApprovalRequest
        fields = [
            "id",
            "workspace",
            "requested_by",
            "requested_by_email",
            "reviewed_by",
            "reviewed_by_email",
            "action_type",
            "entity_type",
            "entity_id",
            "payload",
            "status",
            "rejection_reason",
            "created_at",
            "reviewed_at",
        ]
        read_only_fields = [
            "id",
            "workspace",
            "requested_by",
            "reviewed_by",
            "status",
            "rejection_reason",
            "created_at",
            "reviewed_at",
        ]


class ApprovalReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["APPROVE", "REJECT"])
    rejection_reason = serializers.CharField(required=False, default="")


class ApiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKey
        fields = [
            "id",
            "name",
            "key_prefix",
            "is_active",
            "created_at",
            "expires_at",
        ]
        read_only_fields = ["id", "key_prefix", "created_at"]


class ApiKeyCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    expires_in_days = serializers.IntegerField(required=False, default=None)


class WebhookEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEndpoint
        fields = ["id", "url", "secret", "events", "is_active", "created_at"]
        read_only_fields = ["id", "secret", "created_at"]


class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = [
            "id",
            "endpoint",
            "event_type",
            "payload",
            "status_code",
            "response_body",
            "delivered",
            "attempt_count",
            "created_at",
            "delivered_at",
        ]
        read_only_fields = ["id", "created_at", "delivered_at"]


class TransferOwnershipSerializer(serializers.Serializer):
    new_owner_email = serializers.EmailField(required=True)
