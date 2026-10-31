from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.workspaces.models import (
    FlowGridInvoice,
    FlowGridPaymentMethod,
    FlowGridPlan,
    FlowGridSubscription,
    Workspace,
    WorkspaceMembership,
)
from apps.workspaces.serializers import (
    FlowGridInvoiceSerializer,
    FlowGridPaymentMethodSerializer,
    FlowGridPlanSerializer,
    FlowGridSubscriptionSerializer,
    WorkspaceSerializer,
)

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()
GOOGLE_LINK_TOKEN_SALT = "flowgrid.google-account-link"


def _auth_response(user, *, response_status=status.HTTP_200_OK, is_new_user=None):
    refresh = RefreshToken.for_user(user)
    memberships = WorkspaceMembership.objects.filter(
        user=user, status=WorkspaceMembership.Status.ACTIVE
    ).select_related("workspace")
    data = {
        "status": "success",
        "access": str(refresh.access_token),
        "user": UserSerializer(user).data,
        "workspaces": [
            {
                "id": str(membership.workspace_id),
                "name": membership.workspace.name,
                "slug": membership.workspace.slug,
                "role": membership.role,
                "currency": membership.workspace.currency,
                "timezone": membership.workspace.timezone,
                "is_active": membership.workspace.is_active,
                "user_role": membership.role,
                "active_members_count": membership.workspace.memberships.filter(
                    status=WorkspaceMembership.Status.ACTIVE
                ).count(),
                "created_at": membership.workspace.created_at.isoformat(),
            }
            for membership in memberships
        ],
    }
    if is_new_user is not None:
        data["is_new_user"] = is_new_user

    response = Response(data, status=response_status)
    response.set_cookie(
        key="refresh_token",
        value=str(refresh),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
    )
    return response


class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return _auth_response(user, response_status=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Both email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, email=email, password=password)
        if not user or not user.is_active:
            return Response(
                {"error": "Invalid email or password.", "code": "invalid_credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return _auth_response(user)


class GoogleProviderError(Exception):
    pass


def exchange_google_code(code, redirect_uri):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise GoogleProviderError("Google sign-in is not configured on the server.")

    import requests

    try:
        response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        response.raise_for_status()
        token_data = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise GoogleProviderError("Google could not complete sign-in. Please try again.") from exc

    id_token = token_data.get("id_token")
    if not id_token:
        raise GoogleProviderError("Google did not return a verified identity token.")
    return id_token


def verify_google_id_token(token):
    from google.auth.exceptions import GoogleAuthError
    from google.auth.transport.requests import Request as GoogleRequest
    from google.oauth2 import id_token

    try:
        claims = id_token.verify_oauth2_token(
            token,
            GoogleRequest(),
            audience=settings.GOOGLE_CLIENT_ID,
        )
    except GoogleAuthError as exc:
        raise ValueError("Google identity token verification failed.") from exc
    if claims.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError("Invalid Google token issuer.")
    if claims.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise ValueError("Invalid Google token audience.")
    if claims.get("email_verified") is not True:
        raise ValueError("A verified Google email is required.")

    email = (claims.get("email") or "").strip().lower()
    try:
        validate_email(email)
    except ValidationError as exc:
        raise ValueError("Google did not return a valid email address.") from exc

    subject = claims.get("sub")
    if not subject:
        raise ValueError("Google did not return a stable account identifier.")

    return {
        "sub": subject,
        "email": email,
        "first_name": claims.get("given_name", "")[:150],
        "last_name": claims.get("family_name", "")[:150],
        "name": claims.get("name", "")[:300],
        "picture": claims.get("picture", "")[:1000],
    }


def _update_google_profile(user, profile):
    changed_fields = []
    if profile["picture"] and user.profile_picture != profile["picture"]:
        user.profile_picture = profile["picture"]
        changed_fields.append("profile_picture")
    if not user.first_name and profile["first_name"]:
        user.first_name = profile["first_name"]
        changed_fields.append("first_name")
    if not user.last_name and profile["last_name"]:
        user.last_name = profile["last_name"]
        changed_fields.append("last_name")
    if changed_fields:
        changed_fields.append("updated_at")
        user.save(update_fields=changed_fields)


def _google_link_required(profile):
    return Response(
        {
            "code": "account_link_required",
            "error": "An account already uses this verified email. Enter its FlowGrid password to link Google securely.",
            "link_token": signing.dumps(profile, salt=GOOGLE_LINK_TOKEN_SALT),
        },
        status=status.HTTP_409_CONFLICT,
    )


class GoogleSignInView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        link_token = request.data.get("link_token")
        if link_token:
            return self._link_existing_account(link_token, request.data.get("password"))

        origin = request.headers.get("Origin", "")
        if (
            request.headers.get("X-Requested-With") != "XmlHttpRequest"
            or origin not in settings.CORS_ALLOWED_ORIGINS
        ):
            return Response(
                {
                    "error": "The Google sign-in request could not be verified.",
                    "code": "invalid_request",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        code = request.data.get("code")
        if not isinstance(code, str) or not code:
            return Response(
                {"error": "Google did not return an authorization code.", "code": "invalid_code"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = exchange_google_code(code, origin)
        except GoogleProviderError as exc:
            return Response(
                {"error": str(exc), "code": "google_exchange_failed"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            profile = verify_google_id_token(token)
        except ImportError:
            return Response(
                {
                    "error": "Google sign-in dependencies are not installed on the server.",
                    "code": "google_unavailable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ValueError:
            return Response(
                {
                    "error": "Google sign-in could not verify this account.",
                    "code": "invalid_google_identity",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            with transaction.atomic():
                user = User.objects.select_for_update().filter(google_sub=profile["sub"]).first()
                if user:
                    if not user.is_active:
                        return Response(
                            {
                                "error": "This FlowGrid account is disabled.",
                                "code": "account_disabled",
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                    _update_google_profile(user, profile)
                    is_new_user = False
                else:
                    user = (
                        User.objects.select_for_update()
                        .filter(email__iexact=profile["email"])
                        .first()
                    )
                    if user:
                        if user.google_sub:
                            return Response(
                                {
                                    "error": "This email is already linked to a different Google account.",
                                    "code": "google_account_conflict",
                                },
                                status=status.HTTP_409_CONFLICT,
                            )
                        return _google_link_required(profile)

                    user = User.objects.create_user(
                        email=profile["email"],
                        first_name=profile["first_name"],
                        last_name=profile["last_name"],
                        google_sub=profile["sub"],
                        profile_picture=profile["picture"],
                    )
                    is_new_user = True
        except IntegrityError:
            # Concurrent callbacks must resolve to one account, never two.
            user = User.objects.filter(google_sub=profile["sub"]).first()
            if not user:
                if User.objects.filter(email__iexact=profile["email"]).exists():
                    return _google_link_required(profile)
                return Response(
                    {
                        "error": "This Google account is already linked.",
                        "code": "google_account_conflict",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            if not user.is_active:
                return Response(
                    {"error": "This FlowGrid account is disabled.", "code": "account_disabled"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            is_new_user = False

        return _auth_response(user, is_new_user=is_new_user)

    def _link_existing_account(self, link_token, password):
        if not isinstance(password, str) or not password:
            return Response(
                {
                    "error": "Enter the existing FlowGrid password to link accounts.",
                    "code": "password_required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            profile = signing.loads(link_token, salt=GOOGLE_LINK_TOKEN_SALT, max_age=300)
        except signing.SignatureExpired:
            return Response(
                {
                    "error": "The account-link request expired. Start Google sign-in again.",
                    "code": "link_expired",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except signing.BadSignature:
            return Response(
                {
                    "error": "The account-link request is invalid. Start Google sign-in again.",
                    "code": "invalid_link_token",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User.objects.select_for_update().get(email__iexact=profile["email"])
                if not user.is_active:
                    return Response(
                        {"error": "This FlowGrid account is disabled.", "code": "account_disabled"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                if user.google_sub == profile["sub"]:
                    return _auth_response(user)
                if user.google_sub:
                    return Response(
                        {
                            "error": "This email is already linked to a different Google account.",
                            "code": "google_account_conflict",
                        },
                        status=status.HTTP_409_CONFLICT,
                    )
                if not user.check_password(password):
                    return Response(
                        {
                            "error": "That password did not match this FlowGrid account.",
                            "code": "invalid_password",
                        },
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
                if User.objects.filter(google_sub=profile["sub"]).exclude(pk=user.pk).exists():
                    return Response(
                        {
                            "error": "This Google account is already linked to another FlowGrid account.",
                            "code": "google_account_conflict",
                        },
                        status=status.HTTP_409_CONFLICT,
                    )

                user.google_sub = profile["sub"]
                user.profile_picture = profile["picture"]
                if not user.first_name:
                    user.first_name = profile["first_name"]
                if not user.last_name:
                    user.last_name = profile["last_name"]
                user.save(
                    update_fields=[
                        "google_sub",
                        "profile_picture",
                        "first_name",
                        "last_name",
                        "updated_at",
                    ]
                )
        except User.DoesNotExist:
            return Response(
                {"error": "This FlowGrid account no longer exists.", "code": "account_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except IntegrityError:
            return Response(
                {
                    "error": "This Google account is already linked to another FlowGrid account.",
                    "code": "google_account_conflict",
                },
                status=status.HTTP_409_CONFLICT,
            )

        return _auth_response(user)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass
        response = Response(
            {"status": "success", "message": "Successfully logged out."},
            status=status.HTTP_200_OK,
        )
        response.delete_cookie("refresh_token")
        return response


class CookieTokenRefreshView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "A refresh token is required."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response(
                {"detail": "The refresh session is invalid or expired."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        data = dict(serializer.validated_data)
        rotated_refresh = data.pop("refresh", None)
        response = Response(data, status=status.HTTP_200_OK)
        if rotated_refresh:
            response.set_cookie(
                key="refresh_token",
                value=rotated_refresh,
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            )
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


class PlatformPlansListView(APIView):
    """
    Public / Authenticated endpoint to list all available FlowGrid platform subscription plans.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        plans = FlowGridPlan.objects.filter(is_active=True).order_by("price")
        if not plans.exists():
            # Auto-seed standard plans if empty
            FlowGridPlan.objects.create(
                name="Basic",
                slug="basic",
                price=0,
                max_workspaces=1,
                max_products_per_workspace=5,
                max_customers_per_workspace=50,
                max_team_members=1,
                features=[
                    "1 Business Workspace",
                    "5 Products per business",
                    "50 Customers per business",
                    "Basic Analytics",
                    "1 Team Member",
                ],
            )
            FlowGridPlan.objects.create(
                name="Pro",
                slug="pro",
                price=49,
                max_workspaces=3,
                max_products_per_workspace=25,
                max_customers_per_workspace=500,
                max_team_members=5,
                features=[
                    "3 Business Workspaces",
                    "25 Products per business",
                    "500 Customers per business",
                    "Advanced Analytics",
                    "5 Team Members",
                ],
            )
            FlowGridPlan.objects.create(
                name="Business",
                slug="business",
                price=149,
                max_workspaces=9999,
                max_products_per_workspace=9999,
                max_customers_per_workspace=99999,
                max_team_members=9999,
                features=[
                    "Unlimited Business Workspaces",
                    "Unlimited Products",
                    "Unlimited Customers",
                    "Advanced Analytics & Exports",
                    "Unlimited Team Members",
                ],
            )
            plans = FlowGridPlan.objects.filter(is_active=True).order_by("price")
        return Response(FlowGridPlanSerializer(plans, many=True).data)


class PersonalDashboardView(APIView):
    """
    Returns the personal FlowGrid account overview for the authenticated user:
    - User Profile & Settings
    - FlowGrid Subscription details & renewal
    - Usage limits (workspaces, products, customers)
    - Available business workspace slots
    - Payment methods & Billing history (FlowGrid platform invoices)
    - List of owned workspaces
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import date, timedelta

        from apps.catalog.models import Product
        from apps.customers.models import Customer

        user = request.user
        plan = user.get_flowgrid_plan()
        sub = user.get_flowgrid_subscription()

        owned_workspaces = Workspace.objects.filter(owner=user, is_active=True).order_by(
            "-created_at"
        )
        owned_count = owned_workspaces.count()
        available_slots = max(0, plan.max_workspaces - owned_count)

        # Count total products and customers across all owned workspaces
        total_products = Product.objects.filter(
            workspace__owner=user, workspace__is_active=True
        ).count()
        total_customers = Customer.objects.filter(
            workspace__owner=user, workspace__is_active=True
        ).count()

        payment_methods = FlowGridPaymentMethod.objects.filter(user=user).order_by(
            "-is_default", "-created_at"
        )
        invoices = FlowGridInvoice.objects.filter(user=user).order_by("-created_at")

        renewal_date = (
            sub.renewal_date if sub and sub.renewal_date else (date.today() + timedelta(days=30))
        )
        sub_status = sub.status if sub else "active"

        return Response(
            {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}".strip() or user.email,
                    "phone": user.phone,
                    "created_at": user.created_at,
                },
                "flowgrid_plan": FlowGridPlanSerializer(plan).data,
                "flowgrid_subscription": {
                    "id": str(sub.id) if sub else None,
                    "status": sub_status,
                    "renewal_date": renewal_date,
                    "next_billing_date": renewal_date,
                    "cancel_at_period_end": sub.cancel_at_period_end if sub else False,
                },
                "usage_limits": {
                    "workspaces": {
                        "current": owned_count,
                        "max": plan.max_workspaces,
                        "available_slots": available_slots,
                        "percentage": min(100, int((owned_count / plan.max_workspaces) * 100))
                        if plan.max_workspaces < 9999
                        else 0,
                    },
                    "products_per_workspace": {
                        "max": plan.max_products_per_workspace,
                        "total_across_workspaces": total_products,
                    },
                    "customers_per_workspace": {
                        "max": plan.max_customers_per_workspace,
                        "total_across_workspaces": total_customers,
                    },
                },
                "owned_workspaces": WorkspaceSerializer(
                    owned_workspaces, many=True, context={"request": request}
                ).data,
                "payment_methods": FlowGridPaymentMethodSerializer(payment_methods, many=True).data,
                "invoices": FlowGridInvoiceSerializer(invoices, many=True).data,
            }
        )


class UpgradePlanView(APIView):
    """
    Upgrades or changes the user's personal FlowGrid platform subscription.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from datetime import date, timedelta

        from django.utils import timezone

        user = request.user
        plan_slug = request.data.get("plan_slug", "").lower().strip()
        if not plan_slug:
            return Response({"error": "plan_slug is required."}, status=status.HTTP_400_BAD_REQUEST)

        plan = FlowGridPlan.objects.filter(slug=plan_slug, is_active=True).first()
        if not plan:
            return Response(
                {"error": f"Plan '{plan_slug}' does not exist."}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if downgrading and has more workspaces than the target plan allows
        owned_count = Workspace.objects.filter(owner=user, is_active=True).count()
        if owned_count > plan.max_workspaces:
            return Response(
                {
                    "error": f"Cannot change to {plan.name} plan because you currently have {owned_count} active workspaces (limit is {plan.max_workspaces}). Deactivate workspaces before downgrading."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            sub = FlowGridSubscription.objects.filter(
                user=user, status=FlowGridSubscription.Status.ACTIVE
            ).first()
            if sub:
                sub.plan = plan
                sub.renewal_date = date.today() + timedelta(days=30)
                sub.next_billing_date = sub.renewal_date
                sub.cancel_at_period_end = False
                sub.save()
            else:
                sub = FlowGridSubscription.objects.create(
                    user=user,
                    plan=plan,
                    status=FlowGridSubscription.Status.ACTIVE,
                    start_date=date.today(),
                    renewal_date=date.today() + timedelta(days=30),
                    next_billing_date=date.today() + timedelta(days=30),
                )

            # Generate FlowGrid billing invoice if paid plan
            if plan.price > 0:
                inv_count = FlowGridInvoice.objects.filter(user=user).count() + 1
                FlowGridInvoice.objects.create(
                    user=user,
                    subscription=sub,
                    invoice_number=f"FG-INV-{timezone.now().year}-{inv_count:04d}",
                    amount=plan.price,
                    currency=plan.currency,
                    status=FlowGridInvoice.Status.PAID,
                    plan_name=f"FlowGrid {plan.name} Subscription",
                    paid_at=timezone.now(),
                )

        return Response(
            {
                "status": "success",
                "message": f"Successfully upgraded to FlowGrid {plan.name} plan.",
                "flowgrid_plan": FlowGridPlanSerializer(plan).data,
                "subscription": FlowGridSubscriptionSerializer(sub).data,
            }
        )


class PaymentMethodListCreateView(APIView):
    """
    List and create saved payment methods for FlowGrid platform billing.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pms = FlowGridPaymentMethod.objects.filter(user=request.user).order_by(
            "-is_default", "-created_at"
        )
        return Response(FlowGridPaymentMethodSerializer(pms, many=True).data)

    def post(self, request):
        user = request.user
        brand = request.data.get("brand", "Visa")
        last4 = request.data.get("last4", "4242")
        exp_month = int(request.data.get("exp_month", 12))
        exp_year = int(request.data.get("exp_year", 2028))
        is_default = bool(request.data.get("is_default", True))

        if is_default:
            FlowGridPaymentMethod.objects.filter(user=user).update(is_default=False)

        pm = FlowGridPaymentMethod.objects.create(
            user=user,
            brand=brand,
            last4=last4,
            exp_month=exp_month,
            exp_year=exp_year,
            is_default=is_default,
        )
        return Response(FlowGridPaymentMethodSerializer(pm).data, status=status.HTTP_201_CREATED)


class CancelSubscriptionView(APIView):
    """
    Cancels the user's active FlowGrid platform subscription at the end of the current billing cycle.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        sub = user.get_flowgrid_subscription()
        if not sub:
            return Response(
                {"error": "No active FlowGrid subscription found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        sub.cancel_at_period_end = True
        sub.save()
        return Response(
            {
                "status": "success",
                "message": "Your FlowGrid subscription has been scheduled for cancellation at the end of the current billing period.",
                "subscription": FlowGridSubscriptionSerializer(sub).data,
            }
        )
