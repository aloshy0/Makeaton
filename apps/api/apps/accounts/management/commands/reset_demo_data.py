import uuid

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from apps.audit.models import AuditLog
from apps.billing.models import Invoice, InvoiceLine, TaxRule
from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer, CustomerUserLink
from apps.discounts.models import DiscountRule
from apps.invitations.models import StaffInvitation
from apps.payments.models import Payment
from apps.quotations.models import (
    Quotation,
    QuotationLine,
    QuotationTemplate,
    QuotationTemplateLine,
)
from apps.subscriptions.models import Subscription, SubscriptionEvent, SubscriptionLine
from apps.workspaces.models import (
    ApiKey,
    ApprovalRequest,
    StaffPermission,
    WebhookDelivery,
    WebhookEndpoint,
    Workspace,
    WorkspaceMembership,
)

User = get_user_model()

DEMO_WORKSPACE_IDS = [
    uuid.UUID("aac3abe7-18b7-4c5f-a29e-786b63476459"),
]
DEMO_WORKSPACE_SLUGS = [
    "brightloop-cloud",
    "brightloop-hardware",
    "bobs-retail-pos",
]
DEMO_USER_EMAILS = [
    "admin@brightloop.com",
    "staff@brightloop.com",
    "staff.ro@brightloop.com",
    "customer@acme.com",
    "billing@globex.org",
    "bob@retailstore.com",
]


class Command(BaseCommand):
    help = "Safely reset and re-seed Multi-Tenant SaaS demonstration records (demo workspaces only)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirmation flag required to prevent accidental data destruction",
        )

    def handle(self, *args, **options):
        if not options.get("confirm"):
            raise CommandError(
                "Resetting demo data requires the --confirm flag. Example: python manage.py reset_demo_data --confirm"
            )

        self.stdout.write("Targeting explicitly identified demo workspaces and users...")

        demo_workspaces = Workspace.objects.filter(
            id__in=DEMO_WORKSPACE_IDS
        ) | Workspace.objects.filter(slug__in=DEMO_WORKSPACE_SLUGS)
        ws_ids = list(demo_workspaces.values_list("id", flat=True))

        if ws_ids:
            # 1. Payments & Invoices
            Payment.objects.filter(workspace_id__in=ws_ids).delete()
            InvoiceLine.objects.filter(invoice__workspace_id__in=ws_ids).delete()
            Invoice.objects.filter(workspace_id__in=ws_ids).delete()

            # 2. Subscriptions
            SubscriptionLine.objects.filter(subscription__workspace_id__in=ws_ids).delete()
            SubscriptionEvent.objects.filter(subscription__workspace_id__in=ws_ids).delete()
            Subscription.objects.filter(workspace_id__in=ws_ids).delete()

            # 3. Quotations
            QuotationLine.objects.filter(quotation__workspace_id__in=ws_ids).delete()
            Quotation.objects.filter(workspace_id__in=ws_ids).delete()
            QuotationTemplateLine.objects.filter(template__workspace_id__in=ws_ids).delete()
            QuotationTemplate.objects.filter(workspace_id__in=ws_ids).delete()

            # 4. Customers & Customer User Links
            CustomerUserLink.objects.filter(customer__workspace_id__in=ws_ids).delete()
            Customer.objects.filter(workspace_id__in=ws_ids).delete()

            # 5. Catalog & Rules
            ProductVariant.objects.filter(product__workspace_id__in=ws_ids).delete()
            Product.objects.filter(workspace_id__in=ws_ids).delete()
            SubscriptionPlan.objects.filter(workspace_id__in=ws_ids).delete()
            TaxRule.objects.filter(workspace_id__in=ws_ids).delete()
            DiscountRule.objects.filter(workspace_id__in=ws_ids).delete()

            # 6. Integrations & Governance
            WebhookDelivery.objects.filter(endpoint__workspace_id__in=ws_ids).delete()
            WebhookEndpoint.objects.filter(workspace_id__in=ws_ids).delete()
            ApiKey.objects.filter(workspace_id__in=ws_ids).delete()
            ApprovalRequest.objects.filter(workspace_id__in=ws_ids).delete()
            StaffInvitation.objects.filter(workspace_id__in=ws_ids).delete()
            AuditLog.objects.filter(workspace_id__in=ws_ids).delete()
            StaffPermission.objects.filter(membership__workspace_id__in=ws_ids).delete()
            WorkspaceMembership.objects.filter(workspace_id__in=ws_ids).delete()

            # 7. Workspaces
            deleted_ws_count = demo_workspaces.count()
            demo_workspaces.delete()
            self.stdout.write(f"Removed {deleted_ws_count} demo business workspace(s).")

        # 8. Clean demo user accounts
        users_to_delete = User.objects.filter(email__in=DEMO_USER_EMAILS)
        deleted_user_count = users_to_delete.count()
        users_to_delete.delete()
        self.stdout.write(f"Removed {deleted_user_count} demo user(s).")

        # 9. Re-seed clean demo dataset
        self.stdout.write("Re-seeding clean demonstration dataset...")
        call_command("seed_demo_data")

        self.stdout.write(
            self.style.SUCCESS("Demo data reset and re-seeding completed successfully!")
        )
