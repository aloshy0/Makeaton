from rest_framework import generics

from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.permissions import IsWorkspaceAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(TenantScopedMixin, generics.ListAPIView):
    permission_classes = [IsWorkspaceAdmin]
    serializer_class = AuditLogSerializer
    filterset_fields = ["action", "entity_type"]
    search_fields = ["action", "entity_id", "entity_type"]
    ordering_fields = ["timestamp"]

    def get_queryset(self):
        return AuditLog.objects.filter(workspace_id=self.workspace_id).select_related("user")
