import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", _("Administrator")
        STAFF = "STAFF", _("Internal Staff")
        CUSTOMER = "CUSTOMER", _("Customer")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # Use email as unique identifier
    email = models.EmailField(_("email address"), unique=True, db_index=True)
    google_sub = models.CharField(max_length=255, unique=True, null=True, blank=True)
    profile_picture = models.URLField(max_length=1000, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_internal_staff(self):
        return self.role in (self.Role.ADMIN, self.Role.STAFF) or self.is_staff

    def get_flowgrid_plan(self):
        from apps.workspaces.models import FlowGridPlan, FlowGridSubscription

        sub = (
            self.flowgrid_subscriptions.filter(status=FlowGridSubscription.Status.ACTIVE)
            .select_related("plan")
            .first()
        )
        if sub:
            return sub.plan
        basic = FlowGridPlan.objects.filter(slug="basic", is_active=True).first()
        if not basic:
            basic = FlowGridPlan.objects.create(
                name="Basic",
                slug="basic",
                price=0,
                max_workspaces=1,
                max_products_per_workspace=5,
                max_customers_per_workspace=50,
                max_team_members=1,
                features=["1 Business Workspace", "5 Products", "50 Customers", "1 Team Member"],
            )
        return basic

    def get_flowgrid_subscription(self):
        from apps.workspaces.models import FlowGridSubscription

        return (
            self.flowgrid_subscriptions.filter(status=FlowGridSubscription.Status.ACTIVE)
            .select_related("plan")
            .first()
        )

    def get_available_workspace_slots(self):
        plan = self.get_flowgrid_plan()
        owned = self.owned_workspaces.filter(is_active=True).count()
        return max(0, plan.max_workspaces - owned)

