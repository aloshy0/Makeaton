import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from django.utils.text import slugify


class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name="owned_workspaces",
    )
    currency = models.CharField(max_length=3, default="USD")
    timezone = models.CharField(max_length=50, default="UTC")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Workspace"
        verbose_name_plural = "Workspaces"

    def __str__(self):
        return f"{self.name} ({self.slug})"

    def clean(self):
        super().clean()
        # Enforce maximum 5 active owned workspaces per owner
        if (
            not self.pk or "owner_id" in self.get_dirty_fields(check_relationship=True)
            if hasattr(self, "get_dirty_fields")
            else False
        ):
            with transaction.atomic():
                active_count = (
                    Workspace.objects.select_for_update()
                    .filter(owner=self.owner, is_active=True)
                    .exclude(pk=self.pk)
                    .count()
                )
                if active_count >= 5:
                    raise ValidationError(
                        "Workspace limit reached. A user can own a maximum of 5 active workspaces."
                    )

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "workspace"
            slug = base_slug
            counter = 1
            while Workspace.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Transactional 5-workspace limit enforcement
        if not self.pk:
            with transaction.atomic():
                active_count = (
                    Workspace.objects.select_for_update()
                    .filter(owner=self.owner, is_active=True)
                    .count()
                )
                if active_count >= 5:
                    raise ValidationError(
                        "Workspace limit reached. A user can own a maximum of 5 active workspaces."
                    )
                super().save(*args, **kwargs)
                # Automatically add creator as OWNER in WorkspaceMembership
                WorkspaceMembership.objects.get_or_create(
                    workspace=self,
                    user=self.owner,
                    defaults={
                        "role": WorkspaceMembership.Role.OWNER,
                        "status": WorkspaceMembership.Status.ACTIVE,
                    },
                )
        else:
            super().save(*args, **kwargs)


class WorkspaceMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "OWNER", "Workspace Owner"
        ADMIN = "ADMIN", "Administrator"
        STAFF = "STAFF", "Internal Staff"
        CUSTOMER = "CUSTOMER", "Customer"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        SUSPENDED = "SUSPENDED", "Suspended"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workspace_memberships",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("workspace", "user")
        ordering = ["joined_at"]
        verbose_name = "Workspace Membership"
        verbose_name_plural = "Workspace Memberships"

    def __str__(self):
        return f"{self.user.email} - {self.workspace.name} ({self.role})"
