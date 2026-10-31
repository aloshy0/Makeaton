from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import UserSerializer

from .serializers import StaffInvitationAcceptSerializer


class InvitationAcceptView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StaffInvitationAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, membership = serializer.save()

        # Issue access token immediately so invitee is logged in directly
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "status": "success",
                "message": f"Successfully joined workspace {membership.workspace.name} as {membership.role}.",
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
                "workspace": {
                    "id": str(membership.workspace.id),
                    "name": membership.workspace.name,
                    "slug": membership.workspace.slug,
                    "role": membership.role,
                },
            },
            status=status.HTTP_200_OK,
        )
