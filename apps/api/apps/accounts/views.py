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
