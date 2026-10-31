from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.workspaces.models import WorkspaceMembership

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, email=email, password=password)
        if not user or not user.is_active:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Retrieve user memberships
        memberships = WorkspaceMembership.objects.filter(
            user=user, status=WorkspaceMembership.Status.ACTIVE
        ).select_related("workspace")
        workspaces_data = [
            {
                "id": str(m.workspace.id),
                "name": m.workspace.name,
                "slug": m.workspace.slug,
                "role": m.role,
                "currency": m.workspace.currency,
            }
            for m in memberships
        ]

        response = Response(
            {
                "status": "success",
                "access": access_token,
                "user": UserSerializer(user).data,
                "workspaces": workspaces_data,
            },
            status=status.HTTP_200_OK,
        )

        # Set secure httpOnly refresh cookie
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response(
            {"status": "success", "message": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )
        response.delete_cookie("refresh_token")
        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data

        # Add workspaces
        memberships = WorkspaceMembership.objects.filter(
            user=request.user, status=WorkspaceMembership.Status.ACTIVE
        ).select_related("workspace")
        data["workspaces"] = [
            {
                "id": str(m.workspace.id),
                "name": m.workspace.name,
                "slug": m.workspace.slug,
                "role": m.role,
                "currency": m.workspace.currency,
            }
            for m in memberships
        ]
        return Response(data)


class UserContextsView(APIView):
    """
    Returns the user's global identity and all authorized account contexts:
    - Business workspaces (with roles: OWNER, ADMIN, STAFF)
    - Personal customer account (with linked customer profiles across workspaces)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.customers.models import CustomerUserLink

        # 1. Business Workspace Contexts
        memberships = WorkspaceMembership.objects.filter(
            user=user,
            status=WorkspaceMembership.Status.ACTIVE,
            role__in=[
                WorkspaceMembership.Role.OWNER,
                WorkspaceMembership.Role.ADMIN,
                WorkspaceMembership.Role.STAFF,
            ],
        ).select_related("workspace")

        business_contexts = [
            {
                "id": str(m.workspace.id),
                "name": m.workspace.name,
                "slug": m.workspace.slug,
                "role": m.role,
                "currency": m.workspace.currency,
                "timezone": m.workspace.timezone,
            }
            for m in memberships
        ]

        # 2. Personal Customer Relationships
        customer_links = CustomerUserLink.objects.filter(
            user=user, customer__is_active=True
        ).select_related("customer", "customer__workspace")

        linked_businesses = [
            {
                "workspace_id": str(link.customer.workspace.id),
                "workspace_name": link.customer.workspace.name,
                "customer_id": str(link.customer.id),
                "company_name": link.customer.company_name,
                "contact_name": link.customer.contact_name,
            }
            for link in customer_links
            if link.customer.workspace
        ]

        # Determine current active context
        requested_type = request.headers.get("X-Context-Type") or request.query_params.get(
            "context_type"
        )
        requested_ws = request.headers.get("X-Workspace-ID") or request.query_params.get(
            "workspace_id"
        )

        active_context = {}
        if requested_type == "PERSONAL_CUSTOMER":
            target_ws_id = requested_ws or (
                linked_businesses[0]["workspace_id"] if linked_businesses else None
            )
            active_context = {
                "type": "PERSONAL_CUSTOMER",
                "role": "CUSTOMER",
                "name": "Personal Customer Account",
                "workspace_id": target_ws_id,
            }
        else:
            selected_m = None
            if requested_ws:
                selected_m = next(
                    (m for m in memberships if str(m.workspace.id) == requested_ws), None
                )
            if not selected_m and memberships.exists():
                selected_m = memberships.first()

            if selected_m:
                active_context = {
                    "type": "BUSINESS",
                    "role": selected_m.role,
                    "workspace_id": str(selected_m.workspace.id),
                    "workspace_name": selected_m.workspace.name,
                    "workspace_slug": selected_m.workspace.slug,
                    "currency": selected_m.workspace.currency,
                }
            elif linked_businesses:
                active_context = {
                    "type": "PERSONAL_CUSTOMER",
                    "role": "CUSTOMER",
                    "name": "Personal Customer Account",
                    "workspace_id": linked_businesses[0]["workspace_id"],
                }
            else:
                active_context = {
                    "type": "NONE",
                    "role": "NONE",
                }

        return Response(
            {
                "global_user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone": user.phone,
                    "owned_workspaces_count": user.owned_workspaces.filter(is_active=True).count(),
                    "available_workspace_slots": max(
                        0, 5 - user.owned_workspaces.filter(is_active=True).count()
                    ),
                },
                "active_context": active_context,
                "business_contexts": business_contexts,
                "personal_customer_context": {
                    "type": "PERSONAL_CUSTOMER",
                    "name": "Personal Customer Account",
                    "email": user.email,
                    "linked_businesses": linked_businesses,
                    "has_customer_relationship": len(linked_businesses) > 0,
                },
            }
        )


class ActiveContextSwitchView(APIView):
    """
    Validates and performs an authoritative backend context switch.
    Rejects unauthorized business workspace access or unlinked customer access.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        from apps.customers.models import Customer, CustomerUserLink

        context_type = request.data.get("context_type")  # "BUSINESS" | "PERSONAL_CUSTOMER"
        workspace_id = request.data.get("workspace_id")

        if not context_type or context_type not in ("BUSINESS", "PERSONAL_CUSTOMER"):
            return Response(
                {"error": "Invalid context_type. Must be 'BUSINESS' or 'PERSONAL_CUSTOMER'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if context_type == "BUSINESS":
            if not workspace_id:
                return Response(
                    {"error": "workspace_id is required for BUSINESS context."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            membership = (
                WorkspaceMembership.objects.filter(
                    user=user,
                    workspace_id=workspace_id,
                    status=WorkspaceMembership.Status.ACTIVE,
                    role__in=[
                        WorkspaceMembership.Role.OWNER,
                        WorkspaceMembership.Role.ADMIN,
                        WorkspaceMembership.Role.STAFF,
                    ],
                )
                .select_related("workspace")
                .first()
            )

            if not membership:
                return Response(
                    {
                        "error": "Unauthorized: You do not have an active business membership in this workspace."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            return Response(
                {
                    "status": "success",
                    "active_context": {
                        "type": "BUSINESS",
                        "role": membership.role,
                        "workspace_id": str(membership.workspace.id),
                        "workspace_name": membership.workspace.name,
                        "workspace_slug": membership.workspace.slug,
                        "currency": membership.workspace.currency,
                    },
                    "message": f"Switched to business context: {membership.workspace.name} ({membership.role})",
                }
            )

        else:
            # PERSONAL_CUSTOMER context
            target_ws = None
            if workspace_id:
                has_link = CustomerUserLink.objects.filter(
                    user=user, customer__workspace_id=workspace_id, customer__is_active=True
                ).exists()
                if not has_link:
                    # Check if customer record exists with matching email
                    cust = Customer.objects.filter(
                        workspace_id=workspace_id, email=user.email, is_active=True
                    ).first()
                    if cust:
                        CustomerUserLink.objects.get_or_create(customer=cust, user=user)
                    else:
                        return Response(
                            {
                                "error": "Unauthorized: No personal customer relationship exists for this workspace."
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                target_ws = str(workspace_id)
            else:
                first_link = CustomerUserLink.objects.filter(
                    user=user, customer__is_active=True
                ).first()
                if first_link and first_link.customer.workspace:
                    target_ws = str(first_link.customer.workspace.id)

            return Response(
                {
                    "status": "success",
                    "active_context": {
                        "type": "PERSONAL_CUSTOMER",
                        "role": "CUSTOMER",
                        "name": "Personal Customer Account",
                        "workspace_id": target_ws,
                    },
                    "message": "Switched to personal customer account context.",
                }
            )


class ContextPermissionsView(APIView):
    """
    Returns authoritative backend permissions for the requested or active context.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        context_type = request.headers.get("X-Context-Type") or request.query_params.get(
            "context_type", "BUSINESS"
        )
        workspace_id = request.headers.get("X-Workspace-ID") or request.query_params.get(
            "workspace_id"
        )

        if context_type == "PERSONAL_CUSTOMER":
            return Response(
                {
                    "context_type": "PERSONAL_CUSTOMER",
                    "role": "CUSTOMER",
                    "is_owner": False,
                    "is_admin": False,
                    "is_staff": False,
                    "is_customer": True,
                    "can_access_portal": True,
                    "can_manage_workspace": False,
                    "can_manage_products": False,
                    "can_manage_subscriptions": False,
                    "can_manage_invoices": False,
                    "can_record_payments": False,
                    "can_manage_customers": False,
                    "can_view_reports": False,
                    "can_manage_staff": False,
                    "can_manage_integrations": False,
                }
            )

        # BUSINESS Context
        if not workspace_id:
            membership = WorkspaceMembership.objects.filter(
                user=user,
                status=WorkspaceMembership.Status.ACTIVE,
                role__in=[
                    WorkspaceMembership.Role.OWNER,
                    WorkspaceMembership.Role.ADMIN,
                    WorkspaceMembership.Role.STAFF,
                ],
            ).first()
        else:
            membership = WorkspaceMembership.objects.filter(
                user=user,
                workspace_id=workspace_id,
                status=WorkspaceMembership.Status.ACTIVE,
                role__in=[
                    WorkspaceMembership.Role.OWNER,
                    WorkspaceMembership.Role.ADMIN,
                    WorkspaceMembership.Role.STAFF,
                ],
            ).first()

        if not membership:
            return Response(
                {"error": "No active business workspace membership found."},
                status=status.HTTP_403_FORBIDDEN,
            )

        role = membership.role
        is_owner = role == WorkspaceMembership.Role.OWNER
        is_admin = role == WorkspaceMembership.Role.ADMIN

        if is_owner:
            return Response(
                {
                    "context_type": "BUSINESS",
                    "workspace_id": str(membership.workspace_id),
                    "role": "OWNER",
                    "is_owner": True,
                    "is_admin": True,
                    "is_staff": True,
                    "is_customer": False,
                    "can_access_portal": False,
                    "can_manage_workspace": True,
                    "can_manage_products": True,
                    "can_manage_subscriptions": True,
                    "can_manage_invoices": True,
                    "can_record_payments": True,
                    "can_manage_customers": True,
                    "can_view_reports": True,
                    "can_manage_staff": True,
                    "can_manage_integrations": True,
                    "can_execute_restricted_actions": True,
                }
            )

        if is_admin:
            return Response(
                {
                    "context_type": "BUSINESS",
                    "workspace_id": str(membership.workspace_id),
                    "role": "ADMIN",
                    "is_owner": False,
                    "is_admin": True,
                    "is_staff": True,
                    "is_customer": False,
                    "can_access_portal": False,
                    "can_manage_workspace": False,
                    "can_manage_products": True,
                    "can_manage_subscriptions": True,
                    "can_manage_invoices": True,
                    "can_record_payments": True,
                    "can_manage_customers": True,
                    "can_view_reports": True,
                    "can_manage_staff": True,
                    "can_manage_integrations": False,
                    "can_execute_restricted_actions": True,
                }
            )

        # STAFF Role
        perms = getattr(membership, "permissions", None)
        return Response(
            {
                "context_type": "BUSINESS",
                "workspace_id": str(membership.workspace_id),
                "role": "STAFF",
                "is_owner": False,
                "is_admin": False,
                "is_staff": True,
                "is_customer": False,
                "can_access_portal": False,
                "can_manage_workspace": False,
                "can_manage_products": perms.can_manage_products if perms else True,
                "can_manage_subscriptions": perms.can_manage_subscriptions if perms else True,
                "can_manage_invoices": perms.can_manage_invoices if perms else True,
                "can_record_payments": perms.can_record_payments if perms else True,
                "can_manage_customers": perms.can_manage_customers if perms else True,
                "can_view_reports": perms.can_view_reports if perms else False,
                "can_manage_staff": False,
                "can_manage_integrations": False,
                "can_execute_restricted_actions": perms.can_execute_restricted_actions
                if perms
                else False,
            }
        )
