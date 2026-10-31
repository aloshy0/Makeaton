from rest_framework import viewsets

from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.permissions import IsWorkspaceAdmin, IsWorkspaceMember

from .models import DiscountRule
from .serializers import DiscountRuleSerializer


class DiscountRuleViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = DiscountRule.objects.all()
    serializer_class = DiscountRuleSerializer
    filterset_fields = ["discount_type", "scope", "is_active"]
    search_fields = ["name", "code"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsWorkspaceAdmin()]
        return [IsWorkspaceMember()]
