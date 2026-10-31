import hashlib
import secrets
import uuid
from datetime import timedelta

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
    business_type = models.CharField(max_length=100, blank=True, default="SaaS & Cloud")
    business_email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, default="")
    logo_url = models.URLField(max_length=500, blank=True, null=True)
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
        # Enforce plan-based active owned workspaces per owner
        max_allowed = self._get_owner_workspace_limit()
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
                if active_count >= max_allowed:
                    raise ValidationError(
                        f"Workspace limit reached. Your FlowGrid plan allows a maximum of {max_allowed} active workspaces. Upgrade your plan to create more."
                    )

    def _get_owner_workspace_limit(self):
        if hasattr(self.owner, "get_flowgrid_plan"):
            return self.owner.get_flowgrid_plan().max_workspaces
        sub = getattr(self.owner, "flowgrid_subscriptions", None)
        if sub:
            active_sub = sub.filter(status="active").select_related("plan").first()
            if active_sub:
                return active_sub.plan.max_workspaces
        return 1

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "workspace"
            slug = base_slug
            counter = 1
            while Workspace.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        is_new = self._state.adding
        # Transactional plan-based workspace limit enforcement
        if is_new:
            max_allowed = self._get_owner_workspace_limit()
            with transaction.atomic():
                active_count = (
                    Workspace.objects.select_for_update()
                    .filter(owner=self.owner, is_active=True)
                    .count()
                )
                if active_count >= max_allowed:
                    raise ValidationError(
                        f"Workspace limit reached. Your FlowGrid plan allows a maximum of {max_allowed} active workspaces. Upgrade your plan to create more."
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


class StaffPermission(models.Model):
    class Profile(models.TextChoices):
        READ_ONLY = "READ_ONLY", "Read Only"
        OPERATIONS = "OPERATIONS", "Operations"
        CUSTOM = "CUSTOM", "Custom"

    membership = models.OneToOneField(
        WorkspaceMembership,
        on_delete=models.CASCADE,
        related_name="permissions",
        primary_key=True,
    )
    profile = models.CharField(max_length=20, choices=Profile.choices, default=Profile.OPERATIONS)
    can_manage_products = models.BooleanField(default=True)
    can_manage_subscriptions = models.BooleanField(default=True)
    can_manage_invoices = models.BooleanField(default=True)
    can_record_payments = models.BooleanField(default=True)
    can_manage_customers = models.BooleanField(default=True)
    can_view_reports = models.BooleanField(default=False)
    can_execute_restricted_actions = models.BooleanField(
        default=False,
        help_text="If False, actions like early cancellation and refunds require approval.",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Staff Permission"
        verbose_name_plural = "Staff Permissions"

    def __str__(self):
        return f"Permissions for {self.membership}"


class ApprovalRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="approval_requests",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="approval_requests",
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_approvals",
    )
    action_type = models.CharField(max_length=60)
    entity_type = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=100)
    payload = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Approval Request"
        verbose_name_plural = "Approval Requests"

    def __str__(self):
        return f"[{self.status}] {self.action_type} by {self.requested_by.email}"


def generate_webhook_secret():
    return secrets.token_hex(32)


class ApiKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="api_keys",
    )
    name = models.CharField(max_length=100)
    key_prefix = models.CharField(max_length=16, db_index=True)
    hashed_key = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"

    @classmethod
    def create_key(cls, workspace, name, expires_in_days=None):
        raw_secret = f"brk_live_{secrets.token_urlsafe(32)}"
        key_prefix = raw_secret[:12]
        hashed_key = hashlib.sha256(raw_secret.encode()).hexdigest()
        expires_at = timezone.now() + timedelta(days=expires_in_days) if expires_in_days else None
        instance = cls.objects.create(
            workspace=workspace,
            name=name,
            key_prefix=key_prefix,
            hashed_key=hashed_key,
            expires_at=expires_at,
        )
        return instance, raw_secret

    def rotate(self):
        raw_secret = f"brk_live_{secrets.token_urlsafe(32)}"
        self.key_prefix = raw_secret[:12]
        self.hashed_key = hashlib.sha256(raw_secret.encode()).hexdigest()
        self.save(update_fields=["key_prefix", "hashed_key"])
        return raw_secret

    def verify(self, raw_secret):
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return self.hashed_key == hashlib.sha256(raw_secret.encode()).hexdigest()


class WebhookEndpoint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="webhook_endpoints",
    )
    url = models.URLField(max_length=500)
    secret = models.CharField(max_length=64, default=generate_webhook_secret)
    events = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Webhook Endpoint"
        verbose_name_plural = "Webhook Endpoints"


class WebhookDelivery(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    endpoint = models.ForeignKey(
        WebhookEndpoint,
        on_delete=models.CASCADE,
        related_name="deliveries",
    )
    event_type = models.CharField(max_length=60)
    payload = models.JSONField(default=dict)
    status_code = models.IntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    delivered = models.BooleanField(default=False)
    attempt_count = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Webhook Delivery"
        verbose_name_plural = "Webhook Deliveries"


class FlowGridPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default="USD")
    billing_interval = models.CharField(max_length=20, default="monthly")
    max_workspaces = models.PositiveIntegerField(default=1)
    max_products_per_workspace = models.PositiveIntegerField(default=5)
    max_customers_per_workspace = models.PositiveIntegerField(default=50)
    max_team_members = models.PositiveIntegerField(default=1)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["price"]
        verbose_name = "FlowGrid Plan"
        verbose_name_plural = "FlowGrid Plans"

    def __str__(self):
        return f"{self.name} (${self.price}/{self.billing_interval})"


class FlowGridSubscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past Due"
        CANCELED = "canceled", "Canceled"
        TRIALING = "trialing", "Trialing"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flowgrid_subscriptions",
    )
    plan = models.ForeignKey(
        FlowGridPlan,
        on_delete=models.PROTECT,
        related_name="user_subscriptions",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    start_date = models.DateField(default=timezone.now)
    renewal_date = models.DateField(null=True, blank=True)
    next_billing_date = models.DateField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "FlowGrid Subscription"
        verbose_name_plural = "FlowGrid Subscriptions"

    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"


class FlowGridPaymentMethod(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flowgrid_payment_methods",
    )
    brand = models.CharField(max_length=50, default="Visa")
    last4 = models.CharField(max_length=4, default="4242")
    exp_month = models.PositiveIntegerField(default=12)
    exp_year = models.PositiveIntegerField(default=2028)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "FlowGrid Payment Method"
        verbose_name_plural = "FlowGrid Payment Methods"

    def __str__(self):
        return f"{self.brand} •••• {self.last4} ({self.user.email})"


class FlowGridInvoice(models.Model):
    class Status(models.TextChoices):
        PAID = "paid", "Paid"
        OPEN = "open", "Open"
        VOID = "void", "Void"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="flowgrid_invoices",
    )
    subscription = models.ForeignKey(
        FlowGridSubscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    invoice_number = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PAID)
    plan_name = models.CharField(max_length=100)
    paid_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "FlowGrid Platform Invoice"
        verbose_name_plural = "FlowGrid Platform Invoices"

    def __str__(self):
        return f"{self.invoice_number} - {self.user.email} (${self.amount})"
