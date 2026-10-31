from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_internal_staff
        )


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == "CUSTOMER"
        )


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Staff and Admin have full access.
    Customers have read access only to their own resources.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_internal_staff:
            return True
        # Check customer relation
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "customer") and obj.customer and hasattr(obj.customer, "user"):
            return obj.customer.user == request.user
        return False
