from django.shortcuts import get_object_or_404
from rest_framework import exceptions

from apps.audit.models import AuditLog
from apps.customers.models import CustomerUserLink
from apps.workspaces.models import Workspace, WorkspaceMembership
from apps.workspaces.permissions import IsWorkspaceStaff


class TenantScopedMixin:
    """
    Mixin for DRF ViewSets and Views enforcing multi-tenant isolation.
    - Resolves workspace_id from URL kwargs.
    - Asserts user possesses active business membership (Owner, Admin, or Staff).
    - Automatically filters querysets by workspace_id.
    - Injects workspace_id into serializer saves.
    """

    permission_classes = [IsWorkspaceStaff]

    @property
    def workspace_id(self):
        ws_id = self.kwargs.get("workspace_id")
        if not ws_id:
            raise exceptions.ValidationError({"error": "Missing workspace_id in URL."})
        return ws_id

    @property
    def workspace(self):
        if not hasattr(self, "_cached_workspace"):
            self._cached_workspace = get_object_or_404(
                Workspace, id=self.workspace_id, is_active=True
            )
        return self._cached_workspace

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(qs.model, "workspace"):
            qs = qs.filter(workspace_id=self.workspace_id)

        # Scoping for Customer Portal users
        membership = getattr(self.request, "workspace_membership", None)
        if membership and membership.role == WorkspaceMembership.Role.CUSTOMER:
            links = CustomerUserLink.objects.filter(
                user=self.request.user, customer__workspace_id=self.workspace_id
            ).values_list("customer_id", flat=True)
            if hasattr(qs.model, "customer"):
                qs = qs.filter(customer_id__in=links)
            elif qs.model.__name__ == "Customer":
                qs = qs.filter(id__in=links)

        return qs

    def perform_create(self, serializer):
        kwargs = {}
        if hasattr(serializer.Meta.model, "workspace"):
            kwargs["workspace_id"] = self.workspace_id

        instance = serializer.save(**kwargs)

        # Audit Logging
        if self.request.user and self.request.user.is_authenticated:
            AuditLog.objects.create(
                workspace_id=self.workspace_id,
                user=self.request.user,
                action=f"CREATE_{instance.__class__.__name__.upper()}",
                entity_type=instance.__class__.__name__,
                entity_id=str(instance.pk),
                payload={"action": "create"},
            )
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        if self.request.user and self.request.user.is_authenticated:
            AuditLog.objects.create(
                workspace_id=self.workspace_id,
                user=self.request.user,
                action=f"UPDATE_{instance.__class__.__name__.upper()}",
                entity_type=instance.__class__.__name__,
                entity_id=str(instance.pk),
                payload={"action": "update"},
            )
        return instance

    def perform_destroy(self, instance):
        entity_id = str(instance.pk)
        entity_type = instance.__class__.__name__
        super().perform_destroy(instance)
        if self.request.user and self.request.user.is_authenticated:
            AuditLog.objects.create(
                workspace_id=self.workspace_id,
                user=self.request.user,
                action=f"DELETE_{entity_type.upper()}",
                entity_type=entity_type,
                entity_id=entity_id,
                payload={"action": "delete"},
            )
