from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.workspaces.models import (
    ApiKey,
    ApprovalRequest,
    FlowGridInvoice,
    FlowGridPaymentMethod,
    FlowGridPlan,
    FlowGridSubscription,
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
    permissions = serializers.SerializerMethodField()
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
            "business_type",
            "business_email",
            "phone",
            "address",
            "logo_url",
            "is_active",
            "user_role",
            "permissions",
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

    def get_permissions(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            if not membership:
                return None
            if membership.role in [WorkspaceMembership.Role.OWNER, WorkspaceMembership.Role.ADMIN]:
                return {
                    "can_manage_products": True,
                    "can_manage_subscriptions": True,
                    "can_manage_invoices": True,
                    "can_record_payments": True,
                    "can_manage_customers": True,
                    "can_view_reports": True,
                    "can_manage_team": True,
                    "can_manage_settings": True,
                }
            if hasattr(membership, "permissions"):
                p = membership.permissions
                return {
                    "can_manage_products": p.can_manage_products,
                    "can_manage_subscriptions": p.can_manage_subscriptions,
                    "can_manage_invoices": p.can_manage_invoices,
                    "can_record_payments": p.can_record_payments,
                    "can_manage_customers": p.can_manage_customers,
                    "can_view_reports": p.can_view_reports,
                    "can_manage_team": False,
                    "can_manage_settings": False,
                }
            return {
                "can_manage_products": True,
                "can_manage_subscriptions": True,
                "can_manage_invoices": True,
                "can_record_payments": True,
                "can_manage_customers": True,
                "can_view_reports": False,
                "can_manage_team": False,
                "can_manage_settings": False,
            }
        return None

    def get_active_members_count(self, obj):
        return obj.memberships.filter(status=WorkspaceMembership.Status.ACTIVE).count()


class WorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "slug",
            "currency",
            "timezone",
            "business_type",
            "business_email",
            "phone",
            "address",
            "logo_url",
        ]
        read_only_fields = ["id", "slug"]

    def validate(self, attrs):
        user = self.context["request"].user
        plan = user.get_flowgrid_plan()
        max_allowed = plan.max_workspaces
        owned_count = Workspace.objects.filter(owner=user, is_active=True).count()
        if owned_count >= max_allowed:
            raise serializers.ValidationError(
                {
                    "error": f"Workspace limit reached. Your {plan.name} plan allows a maximum of {max_allowed} active workspaces. Please upgrade your FlowGrid plan to create more businesses."
                }
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


class FlowGridPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlowGridPlan
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "currency",
            "billing_interval",
            "max_workspaces",
            "max_products_per_workspace",
            "max_customers_per_workspace",
            "max_team_members",
            "features",
            "is_active",
        ]


class FlowGridSubscriptionSerializer(serializers.ModelSerializer):
    plan = FlowGridPlanSerializer(read_only=True)

    class Meta:
        model = FlowGridSubscription
        fields = [
            "id",
            "plan",
            "status",
            "start_date",
            "renewal_date",
            "next_billing_date",
            "cancel_at_period_end",
            "created_at",
        ]


class FlowGridPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlowGridPaymentMethod
        fields = [
            "id",
            "brand",
            "last4",
            "exp_month",
            "exp_year",
            "is_default",
            "created_at",
        ]


class FlowGridInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlowGridInvoice
        fields = [
            "id",
            "invoice_number",
            "amount",
            "currency",
            "status",
            "plan_name",
            "paid_at",
            "created_at",
        ]

