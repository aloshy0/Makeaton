from django.contrib import admin

from .models import (
    ApiKey,
    ApprovalRequest,
    StaffPermission,
    WebhookDelivery,
    WebhookEndpoint,
    Workspace,
    WorkspaceMembership,
)


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "owner", "currency", "timezone", "is_active", "created_at")
    search_fields = ("name", "slug", "owner__email")
    list_filter = ("is_active", "currency")


@admin.register(WorkspaceMembership)
class WorkspaceMembershipAdmin(admin.ModelAdmin):
    list_display = ("workspace", "user", "role", "status", "joined_at")
    search_fields = ("workspace__name", "user__email")
    list_filter = ("role", "status")


@admin.register(StaffPermission)
class StaffPermissionAdmin(admin.ModelAdmin):
    list_display = (
        "membership",
        "profile",
        "can_manage_products",
        "can_manage_subscriptions",
        "can_view_reports",
    )
    list_filter = ("profile",)


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = (
        "action_type",
        "workspace",
        "requested_by",
        "reviewed_by",
        "status",
        "created_at",
    )
    list_filter = ("status", "action_type")
    search_fields = ("workspace__name", "requested_by__email", "action_type")


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ("name", "workspace", "key_prefix", "is_active", "created_at", "expires_at")
    list_filter = ("is_active",)
    search_fields = ("name", "key_prefix", "workspace__name")


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ("workspace", "url", "is_active", "created_at")
    list_filter = ("is_active",)


@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    list_display = (
        "endpoint",
        "event_type",
        "status_code",
        "delivered",
        "attempt_count",
        "created_at",
    )
    list_filter = ("delivered", "event_type")
