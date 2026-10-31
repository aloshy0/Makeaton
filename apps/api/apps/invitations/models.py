import secrets
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.workspaces.models import Workspace, WorkspaceMembership


def default_invitation_expiry():
    return timezone.now() + timedelta(hours=72)


def generate_invitation_token():
    return secrets.token_urlsafe(48)


class StaffInvitation(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        STAFF = "STAFF", "Internal Staff"
        CUSTOMER = "CUSTOMER", "Customer"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        EXPIRED = "EXPIRED", "Expired"
        REVOKED = "REVOKED", "Revoked"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="staff_invitations",
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_invitations",
    )
    email = models.EmailField(db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    token = models.CharField(
        max_length=128,
        unique=True,
        db_index=True,
        default=generate_invitation_token,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    expires_at = models.DateTimeField(default=default_invitation_expiry)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["workspace", "email", "status"]),
        ]
        verbose_name = "Staff Invitation"
        verbose_name_plural = "Staff Invitations"

    def __str__(self):
        return f"Invite for {self.email} to {self.workspace.name} ({self.role})"

    @property
    def is_valid(self):
        return self.status == self.Status.PENDING and self.expires_at > timezone.now()

    def accept(self, user):
        if not self.is_valid:
            raise ValueError("Invitation is no longer valid or has expired.")

        # Create or update membership
        membership, _ = WorkspaceMembership.objects.update_or_create(
            workspace=self.workspace,
            user=user,
            defaults={
                "role": self.role,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        self.status = self.Status.ACCEPTED
        self.save(update_fields=["status", "updated_at"])
        return membership
