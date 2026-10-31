import uuid
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.billing.models import Invoice, InvoiceLine, TaxRule
from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer, CustomerUserLink
from apps.discounts.models import DiscountRule
from apps.invitations.models import StaffInvitation
from apps.payments.models import Payment
from apps.quotations.models import Quotation, QuotationLine
from apps.subscriptions.models import Subscription, SubscriptionLine
from apps.workspaces.models import (
    ApiKey,
    ApprovalRequest,
    FlowGridInvoice,
    FlowGridPaymentMethod,
    FlowGridPlan,
    FlowGridSubscription,
    StaffPermission,
    WebhookDelivery,
    WebhookEndpoint,
    Workspace,
    WorkspaceMembership,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with realistic, relationally consistent Multi-Tenant SaaS demonstration records"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Multi-Tenant SaaS demonstration records...")

        # --------------------------------------------------------------------------
        # 1. Global Users
        # --------------------------------------------------------------------------
        # Alexander Wright: Multi-Context User (Owner of ws1, Admin of ws2, Customer in ws_b)
        # Dedicated Demo Persona: demo@flowgrid.local
        demo_user, _ = User.objects.get_or_create(
            email="demo@flowgrid.local",
            defaults={
                "first_name": "Demo",
                "last_name": "User",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        demo_user.set_password("FlowGrid2026!Demo")
        demo_user.first_name = "Demo"
        demo_user.last_name = "User"
        demo_user.save()

        admin_user, _ = User.objects.get_or_create(
            email="owner@flowgrid.com",
            defaults={
                "first_name": "Alexander",
                "last_name": "Wright",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("StrongPassword123!")
        admin_user.first_name = "Alexander"
        admin_user.last_name = "Wright"
        admin_user.save()

        # Operations Staff User
        staff_ops, _ = User.objects.get_or_create(
            email="staff@flowgrid.com",
            defaults={
                "first_name": "Marcus",
                "last_name": "Vance",
                "role": User.Role.STAFF,
                "is_staff": True,
            },
        )
        staff_ops.set_password("StrongPassword123!")
        staff_ops.save()

        # Read-Only Staff User
        staff_ro, _ = User.objects.get_or_create(
            email="staff.ro@flowgrid.com",
            defaults={
                "first_name": "Elena",
                "last_name": "Rostova",
                "role": User.Role.STAFF,
                "is_staff": True,
            },
        )
        staff_ro.set_password("StrongPassword123!")
        staff_ro.save()

        # Customer User (David Miller - Acme Corp)
        cust_user, _ = User.objects.get_or_create(
            email="customer@acme.com",
            defaults={
                "first_name": "David",
                "last_name": "Miller",
                "role": User.Role.CUSTOMER,
            },
        )
        cust_user.set_password("StrongPassword123!")
        cust_user.save()

        # Customer User 2 (Hank Scorpio - Globex)
        cust_globex_user, _ = User.objects.get_or_create(
            email="billing@globex.org",
            defaults={
                "first_name": "Hank",
                "last_name": "Scorpio",
                "role": User.Role.CUSTOMER,
            },
        )
        cust_globex_user.set_password("GlobexCustomer2026!")
        cust_globex_user.save()

        # Independent Tenant B Creator
        tenant_b_owner, _ = User.objects.get_or_create(
            email="bob@retailstore.com",
            defaults={
                "first_name": "Robert",
                "last_name": "Patterson",
                "role": User.Role.ADMIN,
            },
        )
        tenant_b_owner.set_password("RetailVance2026!")
        tenant_b_owner.save()

        # --------------------------------------------------------------------------
        # 2. FlowGrid Platform Plans & Personal Subscriptions
        # --------------------------------------------------------------------------
        plan_basic, _ = FlowGridPlan.objects.get_or_create(
            slug="basic",
            defaults={
                "name": "Basic",
                "price": Decimal("0.00"),
                "currency": "USD",
                "billing_interval": "monthly",
                "max_workspaces": 1,
                "max_products_per_workspace": 5,
                "max_customers_per_workspace": 50,
                "max_team_members": 1,
                "features": [
                    "1 Business Workspace",
                    "5 Products per business",
                    "50 Customers per business",
                    "Basic Analytics",
                    "1 Team Member",
                ],
            },
        )

        plan_pro, _ = FlowGridPlan.objects.get_or_create(
            slug="pro",
            defaults={
                "name": "Pro",
                "price": Decimal("49.00"),
                "currency": "USD",
                "billing_interval": "monthly",
                "max_workspaces": 3,
                "max_products_per_workspace": 25,
                "max_customers_per_workspace": 500,
                "max_team_members": 5,
                "features": [
                    "3 Business Workspaces",
                    "25 Products per business",
                    "500 Customers per business",
                    "Advanced Analytics",
                    "5 Team Members",
                    "Automated Billing Engine",
                ],
            },
        )

        plan_business, _ = FlowGridPlan.objects.get_or_create(
            slug="business",
            defaults={
                "name": "Business",
                "price": Decimal("149.00"),
                "currency": "USD",
                "billing_interval": "monthly",
                "max_workspaces": 9999,
                "max_products_per_workspace": 9999,
                "max_customers_per_workspace": 99999,
                "max_team_members": 9999,
                "features": [
                    "Unlimited Business Workspaces",
                    "Unlimited Products",
                    "Unlimited Customers",
                    "Advanced Analytics & Data Exports",
                    "Unlimited Team Members",
                    "Priority 24/7 Dedicated Support",
                ],
            },
        )

        # Assign Alexander Wright (owner@flowgrid.com) to Pro Plan (allows 3 workspaces)
        admin_sub, _ = FlowGridSubscription.objects.get_or_create(
            user=admin_user,
            status=FlowGridSubscription.Status.ACTIVE,
            defaults={
                "plan": plan_pro,
                "start_date": timezone.now().date() - timedelta(days=60),
                "renewal_date": timezone.now().date() + timedelta(days=24),
                "next_billing_date": timezone.now().date() + timedelta(days=24),
            },
        )
        admin_sub.plan = plan_pro
        admin_sub.save()

        # Seed FlowGrid Payment Method for admin_user
        FlowGridPaymentMethod.objects.get_or_create(
            user=admin_user,
            last4="4242",
            defaults={
                "brand": "Visa",
                "exp_month": 12,
                "exp_year": 2028,
                "is_default": True,
            },
        )

        # Seed FlowGrid Platform Invoices
        FlowGridInvoice.objects.get_or_create(
            invoice_number="FG-INV-2026-0001",
            defaults={
                "user": admin_user,
                "subscription": admin_sub,
                "amount": Decimal("49.00"),
                "currency": "USD",
                "status": FlowGridInvoice.Status.PAID,
                "plan_name": "FlowGrid Pro Subscription",
                "paid_at": timezone.now() - timedelta(days=60),
            },
        )
        FlowGridInvoice.objects.get_or_create(
            invoice_number="FG-INV-2026-0002",
            defaults={
                "user": admin_user,
                "subscription": admin_sub,
                "amount": Decimal("49.00"),
                "currency": "USD",
                "status": FlowGridInvoice.Status.PAID,
                "plan_name": "FlowGrid Pro Subscription",
                "paid_at": timezone.now() - timedelta(days=30),
            },
        )

        # Assign tenant_b_owner to Basic Plan
        FlowGridSubscription.objects.get_or_create(
            user=tenant_b_owner,
            status=FlowGridSubscription.Status.ACTIVE,
            defaults={
                "plan": plan_basic,
                "start_date": timezone.now().date() - timedelta(days=15),
                "renewal_date": timezone.now().date() + timedelta(days=15),
                "next_billing_date": timezone.now().date() + timedelta(days=15),
            },
        )

        # --------------------------------------------------------------------------
        # 3. Workspaces
        # --------------------------------------------------------------------------
        ws1_id = uuid.UUID("aac3abe7-18b7-4c5f-a29e-786b63476459")
        ws1, _ = Workspace.objects.get_or_create(
            id=ws1_id,
            defaults={
                "name": "FlowGrid Cloud Technologies",
                "slug": "flowgrid-cloud",
                "owner": admin_user,
                "currency": "USD",
                "timezone": "America/New_York",
                "business_type": "Cloud Software & SaaS",
                "business_email": "operations@flowgrid.com",
                "phone": "+1 (555) 234-5678",
                "address": "100 Innovation Way, Suite 400, San Francisco, CA 94105",
            },
        )
        ws1.name = "FlowGrid Cloud Technologies"
        ws1.business_type = "Cloud Software & SaaS"
        ws1.business_email = "operations@flowgrid.com"
        ws1.phone = "+1 (555) 234-5678"
        ws1.address = "100 Innovation Way, Suite 400, San Francisco, CA 94105"
        ws1.save()

        ws2, _ = Workspace.objects.get_or_create(
            slug="flowgrid-hardware",
            defaults={
                "name": "FlowGrid Hardware Labs",
                "owner": admin_user,
                "currency": "EUR",
                "timezone": "Europe/London",
                "business_type": "Hardware & IoT",
                "business_email": "labs@flowgrid.com",
                "phone": "+1 (555) 876-5432",
                "address": "200 Tech Boulevard, Boston, MA 02110",
            },
        )
        ws2.business_type = "Hardware & IoT"
        ws2.business_email = "labs@flowgrid.com"
        ws2.phone = "+1 (555) 876-5432"
        ws2.address = "200 Tech Boulevard, Boston, MA 02110"
        ws2.save()

        ws_b, _ = Workspace.objects.get_or_create(
            slug="bobs-retail-pos",
            defaults={
                "name": "Bob's Retail Cloud",
                "owner": tenant_b_owner,
                "currency": "USD",
                "timezone": "America/Chicago",
                "business_type": "Retail & Commerce",
                "business_email": "bob@retailstore.com",
                "phone": "+1 (555) 998-1122",
                "address": "45 Market Square, Chicago, IL 60601",
            },
        )
        ws_b.business_type = "Retail & Commerce"
        ws_b.business_email = "bob@retailstore.com"
        ws_b.phone = "+1 (555) 998-1122"
        ws_b.address = "45 Market Square, Chicago, IL 60601"
        ws_b.save()

        # --------------------------------------------------------------------------
        # 3. Memberships & Permissions
        # --------------------------------------------------------------------------
        m_admin_ws1, _ = WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=admin_user,
            defaults={
                "role": WorkspaceMembership.Role.OWNER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=demo_user,
            defaults={
                "role": WorkspaceMembership.Role.OWNER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        WorkspaceMembership.objects.get_or_create(
            workspace=ws2,
            user=demo_user,
            defaults={
                "role": WorkspaceMembership.Role.ADMIN,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        m_admin_ws2, _ = WorkspaceMembership.objects.get_or_create(
            workspace=ws2,
            user=admin_user,
            defaults={
                "role": WorkspaceMembership.Role.ADMIN,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        m_staff_ops, _ = WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=staff_ops,
            defaults={
                "role": WorkspaceMembership.Role.STAFF,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        StaffPermission.objects.get_or_create(
            membership=m_staff_ops,
            defaults={
                "profile": StaffPermission.Profile.OPERATIONS,
                "can_manage_products": True,
                "can_manage_subscriptions": True,
                "can_manage_invoices": True,
                "can_record_payments": True,
                "can_manage_customers": True,
                "can_view_reports": True,
                "can_execute_restricted_actions": False,
            },
        )

        m_staff_ro, _ = WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=staff_ro,
            defaults={
                "role": WorkspaceMembership.Role.STAFF,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        StaffPermission.objects.get_or_create(
            membership=m_staff_ro,
            defaults={
                "profile": StaffPermission.Profile.READ_ONLY,
                "can_manage_products": False,
                "can_manage_subscriptions": False,
                "can_manage_invoices": False,
                "can_record_payments": False,
                "can_manage_customers": False,
                "can_view_reports": True,
                "can_execute_restricted_actions": False,
            },
        )

        # Customer memberships in ws1
        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=cust_user,
            defaults={
                "role": WorkspaceMembership.Role.CUSTOMER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=cust_globex_user,
            defaults={
                "role": WorkspaceMembership.Role.CUSTOMER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        # --------------------------------------------------------------------------
        # 4. Personal Customer Relationships (Essential Account Separation Scenario)
        # --------------------------------------------------------------------------
        # Alexander Wright is a personal customer of Bob's Retail Cloud (ws_b)
        alex_cust_in_b, _ = Customer.objects.get_or_create(
            workspace=ws_b,
            email=admin_user.email,
            defaults={
                "company_name": "Peak Ventures (Personal)",
                "contact_name": "Alexander Wright",
                "phone": "+1-555-0100",
                "billing_address": "500 Madison Ave, New York, NY 10022",
                "tax_id": "US-99102834",
            },
        )
        CustomerUserLink.objects.get_or_create(customer=alex_cust_in_b, user=admin_user)

        # Customers in Workspace 1 (FlowGrid Cloud Technologies)
        acme, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="customer@acme.com",
            defaults={
                "company_name": "Acme Corporation",
                "contact_name": "David Miller",
                "phone": "+1-555-0199",
                "billing_address": "100 Enterprise Way, Suite 400, Austin, TX 78701",
                "tax_id": "US-88291039",
            },
        )
        CustomerUserLink.objects.get_or_create(customer=acme, user=cust_user)

        globex, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="billing@globex.org",
            defaults={
                "company_name": "Globex Solutions LLC",
                "contact_name": "Hank Scorpio",
                "phone": "+1-555-0144",
                "billing_address": "742 Evergreen Terrace, Springfield, OR 97477",
                "tax_id": "US-44910283",
            },
        )
        CustomerUserLink.objects.get_or_create(customer=globex, user=cust_globex_user)

        cyberdyne, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="ops@cyberdyne.com",
            defaults={
                "company_name": "Cyberdyne Systems",
                "contact_name": "Miles Dyson",
                "phone": "+1-555-0188",
                "billing_address": "2144 Tech Parkway, Sunnyvale, CA 94086",
                "tax_id": "US-55102948",
            },
        )

        stellar, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="dispatch@stellarlogistics.io",
            defaults={
                "company_name": "Stellar Logistics",
                "contact_name": "Sarah Connor",
                "phone": "+1-555-0177",
                "billing_address": "88 Harbor View Rd, Seattle, WA 98101",
                "tax_id": "US-33291048",
            },
        )

        apex, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="contact@apexdigital.co",
            defaults={
                "company_name": "Apex Digital",
                "contact_name": "Arthur Pendelton",
                "phone": "+1-555-0166",
                "billing_address": "12 Innovation Square, Boston, MA 02110",
                "tax_id": "US-11294820",
            },
        )

        vertex, _ = Customer.objects.get_or_create(
            workspace=ws1,
            email="team@vertexanalytics.net",
            defaults={
                "company_name": "Vertex Analytics",
                "contact_name": "Rachel Green",
                "phone": "+1-555-0155",
                "billing_address": "404 Data Lane, Denver, CO 80202",
                "tax_id": "US-77391029",
            },
        )

        # --------------------------------------------------------------------------
        # 5. Catalog Products & Variants in Workspace 1
        # --------------------------------------------------------------------------
        core_software, _ = Product.objects.get_or_create(
            workspace=ws1,
            code="SW-BL-CORE",
            defaults={
                "name": "Brightloop Core Platform",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("249.00"),
                "cost_price": Decimal("40.00"),
                "notes": "Modular monolith subscription license",
            },
        )

        v_odoo, _ = ProductVariant.objects.get_or_create(
            product=core_software,
            attribute_name="Brand Integration",
            attribute_value="Odoo Connector",
            defaults={"price_delta": Decimal("560.00")},
        )

        ProductVariant.objects.get_or_create(
            product=core_software,
            attribute_name="Brand Integration",
            attribute_value="Salesforce Sync",
            defaults={"price_delta": Decimal("750.00")},
        )

        addon_storage, _ = Product.objects.get_or_create(
            workspace=ws1,
            code="ADD-TB-STORAGE",
            defaults={
                "name": "High-Throughput 1TB Storage Tier",
                "product_type": Product.ProductType.ADDON,
                "sales_price": Decimal("49.00"),
                "cost_price": Decimal("10.00"),
            },
        )

        prod_ent_suite, _ = Product.objects.get_or_create(
            workspace=ws1,
            code="SW-BL-ENTERPRISE",
            defaults={
                "name": "Brightloop Enterprise Suite",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("1499.00"),
                "cost_price": Decimal("250.00"),
            },
        )

        # --------------------------------------------------------------------------
        # 6. Subscription Plans in Workspace 1 (All 4 Tiers)
        # --------------------------------------------------------------------------
        plan_starter, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws1,
            code="PLAN-STARTER-MO",
            defaults={
                "name": "Starter Tier (Monthly)",
                "billing_interval": SubscriptionPlan.BillingFrequency.MONTHLY,
                "base_price": Decimal("49.00"),
                "min_seats": 1,
                "auto_close_on_end": True,
                "allow_early_close": True,
                "allow_pause": True,
                "allow_renew": True,
                "is_active": True,
            },
        )

        plan_pro, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws1,
            code="PLAN-PRO-MO",
            defaults={
                "name": "Professional Tier (Monthly)",
                "billing_interval": SubscriptionPlan.BillingFrequency.MONTHLY,
                "base_price": Decimal("249.00"),
                "min_seats": 5,
                "auto_close_on_end": True,
                "allow_early_close": True,
                "allow_pause": True,
                "allow_renew": True,
                "is_active": True,
            },
        )

        plan_biz, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws1,
            code="PLAN-BIZ-MO",
            defaults={
                "name": "Business Tier (Monthly)",
                "billing_interval": SubscriptionPlan.BillingFrequency.MONTHLY,
                "base_price": Decimal("599.00"),
                "min_seats": 10,
                "auto_close_on_end": True,
                "allow_early_close": False,
                "allow_pause": True,
                "allow_renew": True,
                "is_active": True,
            },
        )

        plan_ent, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws1,
            code="PLAN-ENT-MO",
            defaults={
                "name": "Enterprise Infinite (Monthly)",
                "billing_interval": SubscriptionPlan.BillingFrequency.MONTHLY,
                "base_price": Decimal("1499.00"),
                "min_seats": 25,
                "auto_close_on_end": True,
                "allow_early_close": False,
                "allow_pause": False,
                "allow_renew": True,
                "is_active": True,
            },
        )

        # --------------------------------------------------------------------------
        # 7. Taxes & Discounts in Workspace 1
        # --------------------------------------------------------------------------
        TaxRule.objects.get_or_create(
            workspace=ws1,
            name="Standard Tech VAT",
            defaults={"rate_percent": Decimal("10.00"), "is_active": True},
        )

        DiscountRule.objects.get_or_create(
            workspace=ws1,
            code="WELCOME15",
            defaults={
                "name": "New Tenant Welcome 15%",
                "discount_type": DiscountRule.DiscountType.PERCENTAGE,
                "value": Decimal("15.00"),
                "min_purchase_amount": Decimal("100.00"),
                "is_active": True,
            },
        )

        # --------------------------------------------------------------------------
        # 8. Subscriptions Across All 6 Required States
        # --------------------------------------------------------------------------
        today = timezone.now().date()

        # 1. ACTIVE: Acme Corporation
        sub_acme, _ = Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0001",
            defaults={
                "customer": acme,
                "plan": plan_pro,
                "status": Subscription.Status.ACTIVE,
                "start_date": today - timedelta(days=60),
                "next_billing_date": today + timedelta(days=30),
                "subtotal": Decimal("858.00"),
                "tax_amount": Decimal("85.80"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("943.80"),
            },
        )
        SubscriptionLine.objects.get_or_create(
            subscription=sub_acme,
            product=core_software,
            variant=v_odoo,
            defaults={
                "quantity": 1,
                "unit_price": Decimal("809.00"),
                "subtotal": Decimal("809.00"),
            },
        )
        SubscriptionLine.objects.get_or_create(
            subscription=sub_acme,
            product=addon_storage,
            defaults={"quantity": 1, "unit_price": Decimal("49.00"), "subtotal": Decimal("49.00")},
        )

        # 2. TRIALING: Cyberdyne Systems
        Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0002",
            defaults={
                "customer": cyberdyne,
                "plan": plan_ent,
                "status": Subscription.Status.DRAFT,  # Trialing/Draft state
                "start_date": today,
                "next_billing_date": today + timedelta(days=14),
                "subtotal": Decimal("1499.00"),
                "tax_amount": Decimal("149.90"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("1648.90"),
            },
        )

        # 3. PAUSED: Stellar Logistics
        Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0003",
            defaults={
                "customer": stellar,
                "plan": plan_biz,
                "status": Subscription.Status.PAUSED,
                "start_date": today - timedelta(days=120),
                "next_billing_date": today + timedelta(days=60),
                "subtotal": Decimal("599.00"),
                "tax_amount": Decimal("59.90"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("658.90"),
            },
        )

        # 4. PAST DUE: Globex Solutions LLC
        sub_globex, _ = Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0004",
            defaults={
                "customer": globex,
                "plan": plan_ent,
                "status": Subscription.Status.ACTIVE,
                "start_date": today - timedelta(days=90),
                "next_billing_date": today - timedelta(days=15),
                "subtotal": Decimal("1200.00"),
                "tax_amount": Decimal("120.00"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("1320.00"),
            },
        )

        # 5. CANCELLED / CLOSED: Apex Digital
        Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0005",
            defaults={
                "customer": apex,
                "plan": plan_starter,
                "status": Subscription.Status.CLOSED,
                "start_date": today - timedelta(days=200),
                "expiry_date": today - timedelta(days=30),
                "subtotal": Decimal("49.00"),
                "tax_amount": Decimal("4.90"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("53.90"),
            },
        )

        # 6. EXPIRED: Vertex Analytics
        Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0006",
            defaults={
                "customer": vertex,
                "plan": plan_starter,
                "status": Subscription.Status.EXPIRED,
                "start_date": today - timedelta(days=365),
                "expiry_date": today - timedelta(days=10),
                "subtotal": Decimal("49.00"),
                "tax_amount": Decimal("4.90"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("53.90"),
            },
        )

        # --------------------------------------------------------------------------
        # 9. Invoices & Payments in Workspace 1
        # --------------------------------------------------------------------------
        # PAID Invoice (Acme)
        inv1, _ = Invoice.objects.get_or_create(
            workspace=ws1,
            invoice_number="INV-2026-0001",
            defaults={
                "customer": acme,
                "subscription": sub_acme,
                "status": Invoice.Status.PAID,
                "idempotency_key": f"ws_{ws1.id}_sub_{sub_acme.id}_cycle_1",
                "issue_date": today - timedelta(days=30),
                "due_date": today - timedelta(days=15),
                "subtotal": Decimal("858.00"),
                "tax_amount": Decimal("85.80"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("943.80"),
                "paid_amount": Decimal("943.80"),
                "outstanding_balance": Decimal("0.00"),
            },
        )
        InvoiceLine.objects.get_or_create(
            invoice=inv1,
            description="Brightloop Core Platform + Odoo Connector",
            defaults={
                "quantity": 1,
                "unit_price": Decimal("809.00"),
                "line_total": Decimal("809.00"),
            },
        )
        InvoiceLine.objects.get_or_create(
            invoice=inv1,
            description="High-Throughput 1TB Storage Tier",
            defaults={
                "quantity": 1,
                "unit_price": Decimal("49.00"),
                "line_total": Decimal("49.00"),
            },
        )

        # Settled Payment
        Payment.objects.get_or_create(
            workspace=ws1,
            payment_number="PAY-2026-0001",
            defaults={
                "invoice": inv1,
                "amount": Decimal("943.80"),
                "payment_method": Payment.Method.CREDIT_CARD,
                "payment_date": today - timedelta(days=28),
                "reference": "ch_acme_card_9921",
                "notes": "Electronic card charge settled successfully",
            },
        )

        # OVERDUE Invoice (Globex)
        Invoice.objects.get_or_create(
            workspace=ws1,
            invoice_number="INV-2026-0002",
            defaults={
                "customer": globex,
                "subscription": sub_globex,
                "status": Invoice.Status.CONFIRMED,
                "idempotency_key": f"ws_{ws1.id}_sub_{sub_globex.id}_overdue_cycle",
                "issue_date": today - timedelta(days=45),
                "due_date": today - timedelta(days=15),
                "subtotal": Decimal("1200.00"),
                "tax_amount": Decimal("120.00"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("1320.00"),
                "paid_amount": Decimal("0.00"),
                "outstanding_balance": Decimal("1320.00"),
                "notes": "Overdue enterprise subscription cycle",
            },
        )

        # PENDING / DRAFT Invoice (Cyberdyne)
        Invoice.objects.get_or_create(
            workspace=ws1,
            invoice_number="INV-2026-0003",
            defaults={
                "customer": cyberdyne,
                "status": Invoice.Status.DRAFT,
                "idempotency_key": f"ws_{ws1.id}_cyberdyne_provisional",
                "issue_date": today,
                "due_date": today + timedelta(days=15),
                "subtotal": Decimal("1499.00"),
                "tax_amount": Decimal("149.90"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("1648.90"),
                "paid_amount": Decimal("0.00"),
                "outstanding_balance": Decimal("1648.90"),
                "notes": "Provisional onboarding invoice",
            },
        )

        # --------------------------------------------------------------------------
        # 10. Quotations Across All 5 States
        # --------------------------------------------------------------------------
        # 1. DRAFT
        q1, _ = Quotation.objects.get_or_create(
            workspace=ws1,
            reference="QUO-2026-0001",
            defaults={
                "customer": acme,
                "plan": plan_pro,
                "status": Quotation.Status.DRAFT,
                "subtotal": Decimal("809.00"),
                "tax_amount": Decimal("80.90"),
                "total_amount": Decimal("889.90"),
                "notes": "Expansion proposal for auxiliary development team",
            },
        )
        QuotationLine.objects.get_or_create(
            quotation=q1,
            product=core_software,
            defaults={
                "quantity": 1,
                "unit_price": Decimal("809.00"),
                "subtotal": Decimal("809.00"),
            },
        )

        # 2. SENT
        Quotation.objects.get_or_create(
            workspace=ws1,
            reference="QUO-2026-0002",
            defaults={
                "customer": cyberdyne,
                "plan": plan_ent,
                "status": Quotation.Status.SENT,
                "subtotal": Decimal("1499.00"),
                "tax_amount": Decimal("149.90"),
                "total_amount": Decimal("1648.90"),
                "notes": "Enterprise multi-region cloud deployment proposal",
            },
        )

        # 3. APPROVED
        Quotation.objects.get_or_create(
            workspace=ws1,
            reference="QUO-2026-0003",
            defaults={
                "customer": globex,
                "plan": plan_biz,
                "status": Quotation.Status.APPROVED,
                "subtotal": Decimal("599.00"),
                "tax_amount": Decimal("59.90"),
                "total_amount": Decimal("658.90"),
                "notes": "Approved business subscription tier upgrade",
            },
        )

        # 4. REJECTED
        Quotation.objects.get_or_create(
            workspace=ws1,
            reference="QUO-2026-0004",
            defaults={
                "customer": stellar,
                "plan": plan_starter,
                "status": Quotation.Status.REJECTED,
                "subtotal": Decimal("49.00"),
                "tax_amount": Decimal("4.90"),
                "total_amount": Decimal("53.90"),
                "notes": "Custom contract pricing declined by procurement",
            },
        )

        # 5. EXPIRED
        Quotation.objects.get_or_create(
            workspace=ws1,
            reference="QUO-2026-0005",
            defaults={
                "customer": vertex,
                "plan": plan_starter,
                "status": Quotation.Status.EXPIRED,
                "valid_until": today - timedelta(days=15),
                "subtotal": Decimal("49.00"),
                "tax_amount": Decimal("4.90"),
                "total_amount": Decimal("53.90"),
                "notes": "Validity expired pending client signature",
            },
        )

        # --------------------------------------------------------------------------
        # 11. Staff Invitations & Approvals
        # --------------------------------------------------------------------------
        StaffInvitation.objects.get_or_create(
            workspace=ws1,
            email="developer@brightloop.com",
            defaults={
                "invited_by": admin_user,
                "role": WorkspaceMembership.Role.STAFF,
                "token": "token_demo_valid_72h_invitation",
                "status": StaffInvitation.Status.PENDING,
                "expires_at": timezone.now() + timedelta(hours=72),
            },
        )

        ApprovalRequest.objects.get_or_create(
            workspace=ws1,
            action_type="subscription.early_close",
            entity_type="Subscription",
            entity_id=str(sub_acme.id),
            defaults={
                "requested_by": staff_ops,
                "status": ApprovalRequest.Status.PENDING,
                "payload": {"reason": "Customer requesting contract buyout"},
            },
        )

        ApprovalRequest.objects.get_or_create(
            workspace=ws1,
            action_type="invoice.custom_refund",
            entity_type="Invoice",
            entity_id=str(inv1.id),
            defaults={
                "requested_by": staff_ops,
                "reviewed_by": admin_user,
                "status": ApprovalRequest.Status.APPROVED,
                "reviewed_at": timezone.now() - timedelta(hours=5),
                "payload": {"refund_amount": "150.00", "reason": "SLA courtesy credit"},
            },
        )

        # --------------------------------------------------------------------------
        # 12. External Integrations (API Keys & Webhooks)
        # --------------------------------------------------------------------------
        if not ApiKey.objects.filter(workspace=ws1, name="Production Storefront API Key").exists():
            ApiKey.create_key(
                workspace=ws1, name="Production Storefront API Key", expires_in_days=365
            )

        wh, _ = WebhookEndpoint.objects.get_or_create(
            workspace=ws1,
            url="https://store.brightloop.com/api/webhooks/listener",
            defaults={
                "events": ["subscription.activated", "invoice.paid", "payment.recorded"],
                "is_active": True,
            },
        )

        WebhookDelivery.objects.get_or_create(
            endpoint=wh,
            event_type="subscription.activated",
            defaults={
                "payload": {"subscription_id": str(sub_acme.id), "customer": "Acme Corporation"},
                "status_code": 200,
                "response_body": '{"status": "received"}',
                "delivered": True,
                "attempt_count": 1,
                "delivered_at": timezone.now() - timedelta(days=28),
            },
        )

        # --------------------------------------------------------------------------
        # 13. Audit Trail
        # --------------------------------------------------------------------------
        audit_events = [
            ("workspace.created", "Workspace", str(ws1.id), {"name": ws1.name}, admin_user),
            (
                "product.created",
                "Product",
                str(core_software.id),
                {"code": core_software.code},
                admin_user,
            ),
            (
                "subscription.activated",
                "Subscription",
                str(sub_acme.id),
                {"number": sub_acme.subscription_number},
                admin_user,
            ),
            (
                "invoice.issued",
                "Invoice",
                str(inv1.id),
                {"number": inv1.invoice_number, "total": str(inv1.total_amount)},
                admin_user,
            ),
            (
                "payment.recorded",
                "Payment",
                "PAY-2026-0001",
                {"amount": "943.80", "method": "credit_card"},
                staff_ops,
            ),
            (
                "invitation.dispatched",
                "Invitation",
                "developer@brightloop.com",
                {"role": "STAFF"},
                admin_user,
            ),
            (
                "approval.requested",
                "ApprovalRequest",
                "early_close",
                {"entity_id": str(sub_acme.id)},
                staff_ops,
            ),
            (
                "approval.reviewed",
                "ApprovalRequest",
                "custom_refund",
                {"decision": "APPROVED"},
                admin_user,
            ),
        ]
        for action, entity_type, entity_id, payload, actor in audit_events:
            AuditLog.objects.get_or_create(
                workspace=ws1,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                defaults={"user": actor, "payload": payload},
            )

        # --------------------------------------------------------------------------
        # 14. Sample Data in Independent Workspace B (Personal Customer Proof)
        # --------------------------------------------------------------------------
        b_prod, _ = Product.objects.get_or_create(
            workspace=ws_b,
            code="POS-BAKERY",
            defaults={
                "name": "Bakery POS Touch System",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("89.00"),
            },
        )
        b_plan, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws_b,
            code="PLAN-POS-MO",
            defaults={
                "name": "Point of Sale Basic",
                "billing_interval": SubscriptionPlan.BillingFrequency.MONTHLY,
                "base_price": Decimal("89.00"),
                "is_active": True,
            },
        )

        # Alexander Wright's personal subscription in Bob's Retail Cloud
        sub_alex_in_b, _ = Subscription.objects.get_or_create(
            workspace=ws_b,
            subscription_number="SUB-RETAIL-0001",
            defaults={
                "customer": alex_cust_in_b,
                "plan": b_plan,
                "status": Subscription.Status.ACTIVE,
                "start_date": today - timedelta(days=45),
                "next_billing_date": today + timedelta(days=15),
                "subtotal": Decimal("89.00"),
                "tax_amount": Decimal("0.00"),
                "total_amount": Decimal("89.00"),
            },
        )

        inv_alex_b, _ = Invoice.objects.get_or_create(
            workspace=ws_b,
            invoice_number="INV-RETAIL-0001",
            defaults={
                "customer": alex_cust_in_b,
                "subscription": sub_alex_in_b,
                "status": Invoice.Status.PAID,
                "idempotency_key": f"ws_{ws_b.id}_alex_cycle_1",
                "issue_date": today - timedelta(days=30),
                "due_date": today - timedelta(days=15),
                "subtotal": Decimal("89.00"),
                "total_amount": Decimal("89.00"),
                "paid_amount": Decimal("89.00"),
                "outstanding_balance": Decimal("0.00"),
            },
        )

        Payment.objects.get_or_create(
            workspace=ws_b,
            payment_number="PAY-RETAIL-0001",
            defaults={
                "invoice": inv_alex_b,
                "amount": Decimal("89.00"),
                "payment_method": Payment.Method.CREDIT_CARD,
                "reference": "ch_alex_retail_card",
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Multi-Tenant SaaS Demo Data successfully seeded with complete business and customer separation!\n"
                f"Workspaces created: {ws1.name} (ID: {ws1.id}), {ws2.name}, {ws_b.name}\n"
                "Demonstration Accounts:\n"
                "- Owner/Multi-Context: owner@flowgrid.com (StrongPassword123!) [Owner ws1, Admin ws2, Customer in ws_b]\n"
                "- Operations Staff:    staff@flowgrid.com (StrongPassword123!) [Staff ws1]\n"
                "- Read-Only Staff:     staff.ro@flowgrid.com (StrongPassword123!) [Staff ws1]\n"
                "- Customer 1:          customer@acme.com (StrongPassword123!) [Customer ws1]\n"
                "- Customer 2:          billing@globex.org (GlobexCustomer2026!) [Customer ws1]\n"
                "- Independent Owner:   bob@retailstore.com (RetailVance2026!) [Owner ws_b]"
            )
        )
