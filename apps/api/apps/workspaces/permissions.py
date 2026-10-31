from rest_framework import permissions

from apps.workspaces.models import Workspace, WorkspaceMembership


class IsWorkspaceMember(permissions.BasePermission):
    """
    Ensures that the authenticated user is an active member or owner of the workspace
    identified by `workspace_id` in the URL kwargs.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        workspace_id = (
            view.kwargs.get("workspace_id") or view.kwargs.get("id") or view.kwargs.get("pk")
        )
        if not workspace_id:
            return True

        is_owner = Workspace.objects.filter(
            id=workspace_id, owner=request.user, is_active=True
        ).exists()

        membership = WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            status=WorkspaceMembership.Status.ACTIVE,
        ).first()

        if not membership and not is_owner:
            return False

        if membership:
            request.workspace_membership = membership
        return True


class IsWorkspaceOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        workspace_id = (
            view.kwargs.get("workspace_id") or view.kwargs.get("id") or view.kwargs.get("pk")
        )
        return (
            Workspace.objects.filter(id=workspace_id, owner=request.user, is_active=True).exists()
            or WorkspaceMembership.objects.filter(
                workspace_id=workspace_id,
                user=request.user,
                role=WorkspaceMembership.Role.OWNER,
                status=WorkspaceMembership.Status.ACTIVE,
            ).exists()
        )


class IsWorkspaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        workspace_id = (
            view.kwargs.get("workspace_id") or view.kwargs.get("id") or view.kwargs.get("pk")
        )
        if Workspace.objects.filter(id=workspace_id, owner=request.user, is_active=True).exists():
            return True
        return WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            role__in=[WorkspaceMembership.Role.OWNER, WorkspaceMembership.Role.ADMIN],
            status=WorkspaceMembership.Status.ACTIVE,
        ).exists()


class IsWorkspaceStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        workspace_id = (
            view.kwargs.get("workspace_id") or view.kwargs.get("id") or view.kwargs.get("pk")
        )
        if not workspace_id:
            return True

        membership = WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            role__in=[
                WorkspaceMembership.Role.OWNER,
                WorkspaceMembership.Role.ADMIN,
                WorkspaceMembership.Role.STAFF,
            ],
            status=WorkspaceMembership.Status.ACTIVE,
        ).first()

        is_owner = Workspace.objects.filter(
            id=workspace_id, owner=request.user, is_active=True
        ).exists()

        if membership:
            request.workspace_membership = membership
            return True
        if is_owner:
            return True
        return False


class IsWorkspaceCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        workspace_id = (
            view.kwargs.get("workspace_id") or view.kwargs.get("id") or view.kwargs.get("pk")
        )
        return WorkspaceMembership.objects.filter(
            workspace_id=workspace_id,
            user=request.user,
            role=WorkspaceMembership.Role.CUSTOMER,
            status=WorkspaceMembership.Status.ACTIVE,
        ).exists()
