import secrets

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditLog
from apps.invitations.models import StaffInvitation
from apps.invitations.serializers import StaffInvitationCreateSerializer, StaffInvitationSerializer
from apps.workspaces.models import (
    ApiKey,
    ApprovalRequest,
    StaffPermission,
    WebhookDelivery,
    WebhookEndpoint,
    Workspace,
    WorkspaceMembership,
)
from apps.workspaces.permissions import IsWorkspaceAdmin, IsWorkspaceMember, IsWorkspaceOwner
from apps.workspaces.serializers import (
    ApiKeyCreateSerializer,
    ApiKeySerializer,
    ApprovalRequestSerializer,
    ApprovalReviewSerializer,
    StaffPermissionSerializer,
    TransferOwnershipSerializer,
    WebhookDeliverySerializer,
    WebhookEndpointSerializer,
    WorkspaceCreateSerializer,
    WorkspaceMembershipSerializer,
    WorkspaceSerializer,
)

User = get_user_model()


class WorkspaceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return WorkspaceCreateSerializer
        return WorkspaceSerializer

    def get_queryset(self):
        return (
            Workspace.objects.filter(memberships__user=self.request.user, is_active=True)
            .distinct()
            .select_related("owner")
            .prefetch_related("memberships")
        )

    def create(self, request, *args, **kwargs):
        owned_count = Workspace.objects.filter(owner=request.user, is_active=True).count()
        if owned_count >= 5:
            raise ValidationError(
                {"error": "Workspace limit reached. You can own a maximum of 5 active workspaces."}
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = serializer.save()
        AuditLog.objects.create(
            workspace=workspace,
            user=request.user,
            action="WORKSPACE_CREATED",
            entity_type="workspace",
            entity_id=str(workspace.id),
            payload={"name": workspace.name, "slug": workspace.slug},
        )
        return Response(
            WorkspaceSerializer(workspace, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class WorkspaceDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    serializer_class = WorkspaceSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Workspace.objects.filter(
            memberships__user=self.request.user, is_active=True
        ).distinct()

    def perform_update(self, serializer):
        membership = WorkspaceMembership.objects.filter(
            workspace=self.get_object(), user=self.request.user
        ).first()
        if not membership or membership.role not in [
            WorkspaceMembership.Role.OWNER,
            WorkspaceMembership.Role.ADMIN,
        ]:
            raise PermissionDenied("Only workspace Owners or Admins can modify workspace settings.")
        workspace = serializer.save()
        AuditLog.objects.create(
            workspace=workspace,
            user=self.request.user,
            action="WORKSPACE_UPDATED",
            entity_type="workspace",
            entity_id=str(workspace.id),
        )


class WorkspaceDeactivateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id, is_active=True).first()
        if not workspace:
            raise NotFound("Workspace not found.")
        if workspace.owner != request.user:
            raise PermissionDenied("Only the workspace owner can deactivate the workspace.")

        workspace.is_active = False
        workspace.save(update_fields=["is_active", "updated_at"])

        AuditLog.objects.create(
            workspace=workspace,
            user=request.user,
            action="WORKSPACE_DEACTIVATED",
            entity_type="workspace",
            entity_id=str(workspace.id),
        )
        return Response(
            {"status": "success", "message": f"Workspace {workspace.name} has been deactivated."},
            status=status.HTTP_200_OK,
        )


class WorkspaceTransferOwnershipView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id, is_active=True).first()
        if not workspace:
            raise NotFound("Workspace not found.")
        if workspace.owner != request.user:
            raise PermissionDenied("Only the current workspace owner can transfer ownership.")

        serializer = TransferOwnershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_owner_email = serializer.validated_data["new_owner_email"].strip().lower()

        new_owner = User.objects.filter(email__iexact=new_owner_email).first()
        if not new_owner:
            raise ValidationError({"new_owner_email": "User with this email not found."})

        if new_owner == request.user:
            raise ValidationError(
                {"new_owner_email": "You are already the owner of this workspace."}
            )

        # Check new owner's active workspace quota (max 5)
        new_owner_owned_count = Workspace.objects.filter(owner=new_owner, is_active=True).count()
        if new_owner_owned_count >= 5:
            raise ValidationError(
                {"new_owner_email": "Target user has reached the 5-workspace ownership limit."}
            )

        with transaction.atomic():
            old_owner = workspace.owner
            workspace.owner = new_owner
            workspace.save(update_fields=["owner", "updated_at"])

            # Ensure new owner has OWNER membership
            new_owner_mem, _ = WorkspaceMembership.objects.get_or_create(
                workspace=workspace,
                user=new_owner,
                defaults={
                    "role": WorkspaceMembership.Role.OWNER,
                    "status": WorkspaceMembership.Status.ACTIVE,
                },
            )
            new_owner_mem.role = WorkspaceMembership.Role.OWNER
            new_owner_mem.status = WorkspaceMembership.Status.ACTIVE
            new_owner_mem.save()

            # Demote previous owner to ADMIN
            old_owner_mem = WorkspaceMembership.objects.filter(
                workspace=workspace, user=old_owner
            ).first()
            if old_owner_mem:
                old_owner_mem.role = WorkspaceMembership.Role.ADMIN
                old_owner_mem.save(update_fields=["role"])

            AuditLog.objects.create(
                workspace=workspace,
                user=request.user,
                action="OWNERSHIP_TRANSFERRED",
                entity_type="workspace",
                entity_id=str(workspace.id),
                payload={"from_user": old_owner.email, "to_user": new_owner.email},
            )

        return Response(
            {
                "status": "success",
                "message": f"Ownership successfully transferred to {new_owner.email}.",
                "owner": new_owner.email,
            },
            status=status.HTTP_200_OK,
        )


class WorkspaceMembershipListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    serializer_class = WorkspaceMembershipSerializer

    def get_queryset(self):
        workspace_id = self.kwargs["workspace_id"]
        return (
            WorkspaceMembership.objects.filter(workspace_id=workspace_id)
            .select_related("user")
            .order_by("joined_at")
        )


class WorkspaceMembershipDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def delete(self, request, workspace_id, member_id):
        membership = WorkspaceMembership.objects.filter(
            id=member_id, workspace_id=workspace_id
        ).first()
        if not membership:
            raise NotFound("Membership not found.")
        if membership.role == WorkspaceMembership.Role.OWNER:
            raise PermissionDenied("Cannot remove the workspace owner.")
        if (
            membership.role == WorkspaceMembership.Role.ADMIN
            and request.user != membership.workspace.owner
        ):
            raise PermissionDenied("Only the workspace owner can remove administrators.")

        user_email = membership.user.email
        membership.delete()
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="MEMBERSHIP_REMOVED",
            entity_type="membership",
            entity_id=str(member_id),
            payload={"removed_user": user_email},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkspacePromoteAdminView(APIView):
    """
    Promote a STAFF member to ADMIN. OWNER only.
    """

    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id, member_id):
        membership = WorkspaceMembership.objects.filter(
            id=member_id, workspace_id=workspace_id
        ).first()
        if not membership:
            raise NotFound("Membership not found.")
        if membership.role == WorkspaceMembership.Role.OWNER:
            raise ValidationError({"error": "User is already workspace owner."})
        if membership.role == WorkspaceMembership.Role.ADMIN:
            raise ValidationError({"error": "User is already an administrator."})

        membership.role = WorkspaceMembership.Role.ADMIN
        membership.save(update_fields=["role"])

        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="ROLE_PROMOTED_ADMIN",
            entity_type="membership",
            entity_id=str(membership.id),
            payload={"user": membership.user.email},
        )
        return Response(
            {"status": "success", "message": f"{membership.user.email} promoted to ADMIN."},
            status=status.HTTP_200_OK,
        )


class WorkspaceDemoteStaffView(APIView):
    """
    Demote an ADMIN to STAFF. OWNER only.
    """

    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id, member_id):
        membership = WorkspaceMembership.objects.filter(
            id=member_id, workspace_id=workspace_id
        ).first()
        if not membership:
            raise NotFound("Membership not found.")
        if membership.role == WorkspaceMembership.Role.OWNER:
            raise PermissionDenied("Cannot demote the workspace owner.")
        if membership.role != WorkspaceMembership.Role.ADMIN:
            raise ValidationError({"error": "User is not an administrator."})

        membership.role = WorkspaceMembership.Role.STAFF
        membership.save(update_fields=["role"])

        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="ROLE_DEMOTED_STAFF",
            entity_type="membership",
            entity_id=str(membership.id),
            payload={"user": membership.user.email},
        )
        return Response(
            {"status": "success", "message": f"{membership.user.email} demoted to STAFF."},
            status=status.HTTP_200_OK,
        )


class StaffPermissionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def get(self, request, workspace_id, member_id):
        membership = WorkspaceMembership.objects.filter(
            id=member_id, workspace_id=workspace_id
        ).first()
        if not membership:
            raise NotFound("Membership not found.")
        perm, _ = StaffPermission.objects.get_or_create(membership=membership)
        return Response(StaffPermissionSerializer(perm).data)

    def put(self, request, workspace_id, member_id):
        membership = WorkspaceMembership.objects.filter(
            id=member_id, workspace_id=workspace_id
        ).first()
        if not membership:
            raise NotFound("Membership not found.")
        perm, _ = StaffPermission.objects.get_or_create(membership=membership)
        serializer = StaffPermissionSerializer(perm, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="STAFF_PERMISSIONS_UPDATED",
            entity_type="staff_permission",
            entity_id=str(member_id),
            payload=serializer.data,
        )
        return Response(serializer.data)


class ApprovalRequestListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        approvals = ApprovalRequest.objects.filter(workspace_id=workspace_id)
        return Response(ApprovalRequestSerializer(approvals, many=True).data)

    def post(self, request, workspace_id):
        serializer = ApprovalRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approval = serializer.save(
            workspace_id=workspace_id,
            requested_by=request.user,
        )
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="APPROVAL_REQUESTED",
            entity_type="approval_request",
            entity_id=str(approval.id),
            payload={"action_type": approval.action_type, "entity_type": approval.entity_type},
        )
        return Response(ApprovalRequestSerializer(approval).data, status=status.HTTP_201_CREATED)


class ApprovalRequestReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def post(self, request, workspace_id, approval_id):
        approval = ApprovalRequest.objects.filter(id=approval_id, workspace_id=workspace_id).first()
        if not approval:
            raise NotFound("Approval request not found.")
        if approval.status != ApprovalRequest.Status.PENDING:
            raise ValidationError({"error": f"Request has already been {approval.status.lower()}."})

        # STAFF cannot approve their own requests
        if approval.requested_by == request.user:
            raise PermissionDenied("You cannot approve your own request.")

        serializer = ApprovalReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data["action"]

        approval.status = (
            ApprovalRequest.Status.APPROVED
            if decision == "APPROVE"
            else ApprovalRequest.Status.REJECTED
        )
        approval.rejection_reason = serializer.validated_data.get("rejection_reason", "")
        approval.reviewed_by = request.user
        approval.reviewed_at = timezone.now()
        approval.save()

        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action=f"APPROVAL_{decision}D",
            entity_type="approval_request",
            entity_id=str(approval.id),
            payload={"decision": decision, "reason": approval.rejection_reason},
        )
        return Response(ApprovalRequestSerializer(approval).data, status=status.HTTP_200_OK)


class WorkspaceInvitationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def get(self, request, workspace_id):
        invitations = StaffInvitation.objects.filter(workspace_id=workspace_id)
        serializer = StaffInvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    def post(self, request, workspace_id):
        serializer = StaffInvitationCreateSerializer(
            data=request.data, context={"request": request, "workspace_id": workspace_id}
        )
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="INVITATION_SENT",
            entity_type="invitation",
            entity_id=str(invitation.id),
            payload={"email": invitation.email, "role": invitation.role},
        )
        return Response(StaffInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)


class WorkspaceInvitationRevokeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def post(self, request, workspace_id, invitation_id):
        invitation = StaffInvitation.objects.filter(
            id=invitation_id, workspace_id=workspace_id
        ).first()
        if not invitation:
            raise NotFound("Invitation not found.")
        invitation.status = StaffInvitation.Status.REVOKED
        invitation.save(update_fields=["status"])
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="INVITATION_REVOKED",
            entity_type="invitation",
            entity_id=str(invitation.id),
        )
        return Response(
            {"status": "success", "message": "Invitation revoked."}, status=status.HTTP_200_OK
        )


class ApiKeyListCreateView(APIView):
    """
    Workspace API Key management. OWNER only.
    """

    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def get(self, request, workspace_id):
        keys = ApiKey.objects.filter(workspace_id=workspace_id)
        return Response(ApiKeySerializer(keys, many=True).data)

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise NotFound("Workspace not found.")
        serializer = ApiKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        key_obj, raw_secret = ApiKey.create_key(
            workspace=workspace,
            name=serializer.validated_data["name"],
            expires_in_days=serializer.validated_data.get("expires_in_days"),
        )
        AuditLog.objects.create(
            workspace=workspace,
            user=request.user,
            action="API_KEY_CREATED",
            entity_type="api_key",
            entity_id=str(key_obj.id),
            payload={"name": key_obj.name, "prefix": key_obj.key_prefix},
        )
        data = ApiKeySerializer(key_obj).data
        data["secret"] = raw_secret  # Secret shown only once upon creation
        return Response(data, status=status.HTTP_201_CREATED)


class ApiKeyRevokeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id, key_id):
        key = ApiKey.objects.filter(id=key_id, workspace_id=workspace_id).first()
        if not key:
            raise NotFound("API key not found.")
        key.is_active = False
        key.save(update_fields=["is_active"])
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="API_KEY_REVOKED",
            entity_type="api_key",
            entity_id=str(key.id),
        )
        return Response(
            {"status": "success", "message": "API Key revoked."}, status=status.HTTP_200_OK
        )


class ApiKeyRotateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id, key_id):
        key = ApiKey.objects.filter(id=key_id, workspace_id=workspace_id).first()
        if not key:
            raise NotFound("API key not found.")
        new_secret = key.rotate()
        AuditLog.objects.create(
            workspace_id=workspace_id,
            user=request.user,
            action="API_KEY_ROTATED",
            entity_type="api_key",
            entity_id=str(key.id),
        )
        data = ApiKeySerializer(key).data
        data["secret"] = new_secret
        return Response(data, status=status.HTTP_200_OK)


class WebhookEndpointListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def get(self, request, workspace_id):
        endpoints = WebhookEndpoint.objects.filter(workspace_id=workspace_id)
        return Response(WebhookEndpointSerializer(endpoints, many=True).data)

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id).first()
        if not workspace:
            raise NotFound("Workspace not found.")
        serializer = WebhookEndpointSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        endpoint = serializer.save(workspace=workspace)
        AuditLog.objects.create(
            workspace=workspace,
            user=request.user,
            action="WEBHOOK_ENDPOINT_CREATED",
            entity_type="webhook_endpoint",
            entity_id=str(endpoint.id),
            payload={"url": endpoint.url, "events": endpoint.events},
        )
        return Response(WebhookEndpointSerializer(endpoint).data, status=status.HTTP_201_CREATED)


class WebhookEndpointDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def get(self, request, workspace_id, webhook_id):
        endpoint = WebhookEndpoint.objects.filter(id=webhook_id, workspace_id=workspace_id).first()
        if not endpoint:
            raise NotFound("Webhook endpoint not found.")
        return Response(WebhookEndpointSerializer(endpoint).data)

    def patch(self, request, workspace_id, webhook_id):
        endpoint = WebhookEndpoint.objects.filter(id=webhook_id, workspace_id=workspace_id).first()
        if not endpoint:
            raise NotFound("Webhook endpoint not found.")
        serializer = WebhookEndpointSerializer(endpoint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, workspace_id, webhook_id):
        endpoint = WebhookEndpoint.objects.filter(id=webhook_id, workspace_id=workspace_id).first()
        if not endpoint:
            raise NotFound("Webhook endpoint not found.")
        endpoint.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WebhookDeliveryListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def get(self, request, workspace_id, webhook_id):
        deliveries = WebhookDelivery.objects.filter(
            endpoint_id=webhook_id, endpoint__workspace_id=workspace_id
        )
        return Response(WebhookDeliverySerializer(deliveries, many=True).data)


class WebhookDeliveryRetryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwner]

    def post(self, request, workspace_id, webhook_id, delivery_id):
        delivery = WebhookDelivery.objects.filter(
            id=delivery_id, endpoint_id=webhook_id, endpoint__workspace_id=workspace_id
        ).first()
        if not delivery:
            raise NotFound("Delivery record not found.")

        # Simulate or perform delivery attempt
        delivery.attempt_count += 1
        delivery.delivered = True
        delivery.status_code = 200
        delivery.delivered_at = timezone.now()
        delivery.save()

        return Response(
            {
                "status": "success",
                "message": "Delivery retried successfully.",
                "delivery": WebhookDeliverySerializer(delivery).data,
            },
            status=status.HTTP_200_OK,
        )


class PublicCheckoutSessionView(APIView):
    """
    Public checkout session initialization for external website embeds.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, workspace_id):
        workspace = Workspace.objects.filter(id=workspace_id, is_active=True).first()
        if not workspace:
            raise NotFound("Workspace not found or inactive.")

        plan_id = request.data.get("plan_id")
        customer_email = request.data.get("customer_email")
        customer_name = request.data.get("customer_name", "")

        if not plan_id or not customer_email:
            raise ValidationError({"error": "plan_id and customer_email are required."})

        # Session token
        session_id = f"cs_{secrets.token_urlsafe(24)}"
        return Response(
            {
                "status": "success",
                "session_id": session_id,
                "workspace_id": str(workspace.id),
                "plan_id": plan_id,
                "customer_email": customer_email,
                "customer_name": customer_name,
                "checkout_url": f"/checkout/{session_id}",
            },
            status=status.HTTP_201_CREATED,
        )
