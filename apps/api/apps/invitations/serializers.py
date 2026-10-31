from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.invitations.models import StaffInvitation
from apps.workspaces.models import Workspace

User = get_user_model()


class StaffInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffInvitation
        fields = ["id", "email", "role", "token", "status", "expires_at", "created_at"]
        read_only_fields = ["id", "token", "status", "expires_at", "created_at"]


class StaffInvitationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffInvitation
        fields = ["email", "role"]

    def create(self, validated_data):
        workspace_id = self.context["workspace_id"]
        workspace = Workspace.objects.get(id=workspace_id)
        validated_data["workspace"] = workspace
        validated_data["invited_by"] = self.context["request"].user
        return super().create(validated_data)


class StaffInvitationAcceptSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    first_name = serializers.CharField(required=False, default="")
    last_name = serializers.CharField(required=False, default="")

    def validate_token(self, value):
        invitation = StaffInvitation.objects.filter(token=value).first()
        if not invitation:
            raise serializers.ValidationError("Invalid invitation token.")
        if not invitation.is_valid:
            raise serializers.ValidationError("Invitation is expired or has already been accepted.")
        return value

    def save(self):
        token = self.validated_data["token"]
        password = self.validated_data["password"]
        first_name = self.validated_data.get("first_name", "")
        last_name = self.validated_data.get("last_name", "")

        invitation = StaffInvitation.objects.get(token=token)

        # Get or create user
        user, created = User.objects.get_or_create(
            email=invitation.email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True,
            },
        )
        user.set_password(password)
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        user.save()

        # Accept invitation & link membership
        membership = invitation.accept(user)
        return user, membership
