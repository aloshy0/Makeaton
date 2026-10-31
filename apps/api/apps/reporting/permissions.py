from apps.workspaces.models import StaffPermission, Workspace
from apps.workspaces.permissions import IsWorkspaceMember


class CanViewWorkspaceReports(IsWorkspaceMember):
    """Allow workspace owners/admins and staff explicitly granted report access."""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        workspace_id = view.kwargs.get("workspace_id") or view.kwargs.get("id")
        if Workspace.objects.filter(id=workspace_id, owner=request.user, is_active=True).exists():
            return True

        membership = getattr(request, "workspace_membership", None)
        if membership is None:
            return False

        if membership.role in {"OWNER", "ADMIN"}:
            return True
        if membership.role == "STAFF":
            return StaffPermission.objects.filter(
                membership=membership,
                can_view_reports=True,
            ).exists()
        return False
