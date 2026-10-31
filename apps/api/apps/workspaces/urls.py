from django.urls import include, path

from .views import (
    ApiKeyListCreateView,
    ApiKeyRevokeView,
    ApiKeyRotateView,
    ApprovalRequestListCreateView,
    ApprovalRequestReviewView,
    PublicCheckoutSessionView,
    StaffPermissionDetailView,
    WebhookDeliveryListView,
    WebhookDeliveryRetryView,
    WebhookEndpointDetailView,
    WebhookEndpointListCreateView,
    WorkspaceDeactivateView,
    WorkspaceDemoteStaffView,
    WorkspaceDetailView,
    WorkspaceInvitationListCreateView,
    WorkspaceInvitationRevokeView,
    WorkspaceListCreateView,
    WorkspaceMembershipDetailView,
    WorkspaceMembershipListView,
    WorkspacePromoteAdminView,
    WorkspaceTransferOwnershipView,
)

urlpatterns = [
    path("", WorkspaceListCreateView.as_view(), name="workspace_list_create"),
    path("<uuid:id>/", WorkspaceDetailView.as_view(), name="workspace_detail"),
    path(
        "<uuid:workspace_id>/deactivate/",
        WorkspaceDeactivateView.as_view(),
        name="workspace_deactivate",
    ),
    path(
        "<uuid:workspace_id>/transfer-ownership/",
        WorkspaceTransferOwnershipView.as_view(),
        name="workspace_transfer_ownership",
    ),
    # Memberships
    path(
        "<uuid:workspace_id>/memberships/",
        WorkspaceMembershipListView.as_view(),
        name="workspace_membership_list",
    ),
    path(
        "<uuid:workspace_id>/memberships/<uuid:member_id>/",
        WorkspaceMembershipDetailView.as_view(),
        name="workspace_membership_detail",
    ),
    path(
        "<uuid:workspace_id>/memberships/<uuid:member_id>/promote-admin/",
        WorkspacePromoteAdminView.as_view(),
        name="workspace_promote_admin",
    ),
    path(
        "<uuid:workspace_id>/memberships/<uuid:member_id>/demote-staff/",
        WorkspaceDemoteStaffView.as_view(),
        name="workspace_demote_staff",
    ),
    path(
        "<uuid:workspace_id>/memberships/<uuid:member_id>/permissions/",
        StaffPermissionDetailView.as_view(),
        name="workspace_staff_permissions",
    ),
    # Invitations
    path(
        "<uuid:workspace_id>/invitations/",
        WorkspaceInvitationListCreateView.as_view(),
        name="workspace_invitation_list_create",
    ),
    path(
        "<uuid:workspace_id>/invitations/<uuid:invitation_id>/revoke/",
        WorkspaceInvitationRevokeView.as_view(),
        name="workspace_invitation_revoke",
    ),
    # Approval Requests
    path(
        "<uuid:workspace_id>/approval-requests/",
        ApprovalRequestListCreateView.as_view(),
        name="approval_request_list_create",
    ),
    path(
        "<uuid:workspace_id>/approval-requests/<uuid:approval_id>/review/",
        ApprovalRequestReviewView.as_view(),
        name="approval_request_review",
    ),
    # External Integrations: API Keys
    path(
        "<uuid:workspace_id>/integrations/api-keys/",
        ApiKeyListCreateView.as_view(),
        name="api_key_list_create",
    ),
    path(
        "<uuid:workspace_id>/integrations/api-keys/<uuid:key_id>/revoke/",
        ApiKeyRevokeView.as_view(),
        name="api_key_revoke",
    ),
    path(
        "<uuid:workspace_id>/integrations/api-keys/<uuid:key_id>/rotate/",
        ApiKeyRotateView.as_view(),
        name="api_key_rotate",
    ),
    # External Integrations: Webhooks
    path(
        "<uuid:workspace_id>/integrations/webhooks/",
        WebhookEndpointListCreateView.as_view(),
        name="webhook_list_create",
    ),
    path(
        "<uuid:workspace_id>/integrations/webhooks/<uuid:webhook_id>/",
        WebhookEndpointDetailView.as_view(),
        name="webhook_detail",
    ),
    path(
        "<uuid:workspace_id>/integrations/webhooks/<uuid:webhook_id>/deliveries/",
        WebhookDeliveryListView.as_view(),
        name="webhook_delivery_list",
    ),
    path(
        "<uuid:workspace_id>/integrations/webhooks/<uuid:webhook_id>/deliveries/<uuid:delivery_id>/retry/",
        WebhookDeliveryRetryView.as_view(),
        name="webhook_delivery_retry",
    ),
    # External Checkout Session
    path(
        "<uuid:workspace_id>/checkout/sessions/",
        PublicCheckoutSessionView.as_view(),
        name="public_checkout_session",
    ),
    # Scoped domain modules routed under /workspaces/<uuid:workspace_id>/...
    path("<uuid:workspace_id>/customers/", include("apps.customers.urls")),
    path("<uuid:workspace_id>/products/", include("apps.catalog.urls_products")),
    path("<uuid:workspace_id>/plans/", include("apps.catalog.urls_plans")),
    path("<uuid:workspace_id>/quotations/", include("apps.quotations.urls")),
    path("<uuid:workspace_id>/quotation-templates/", include("apps.quotations.urls_templates")),
    path("<uuid:workspace_id>/subscriptions/", include("apps.subscriptions.urls")),
    path("<uuid:workspace_id>/invoices/", include("apps.billing.urls_invoices")),
    path("<uuid:workspace_id>/tax-rules/", include("apps.billing.urls_taxes")),
    path("<uuid:workspace_id>/discount-rules/", include("apps.discounts.urls")),
    path("<uuid:workspace_id>/payments/", include("apps.payments.urls")),
    path("<uuid:workspace_id>/dashboard/summary/", include("apps.reporting.urls_dashboard")),
    path("<uuid:workspace_id>/reports/", include("apps.reporting.urls_reports")),
    path("<uuid:workspace_id>/audit-logs/", include("apps.audit.urls")),
    path("<uuid:workspace_id>/portal/", include("apps.customers.urls_portal")),
]
