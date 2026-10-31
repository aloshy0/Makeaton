from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.billing.models import Invoice, TaxRule
from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer, CustomerUserLink
from apps.discounts.models import DiscountRule
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription, SubscriptionEvent, SubscriptionLine
from apps.workspaces.models import Workspace, WorkspaceMembership

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with Multi-Tenant SaaS demonstration and benchmark records"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Multi-Tenant SaaS demonstration records...")

        # 1. Global Users
        admin_user, _ = User.objects.get_or_create(
            email="admin@brightloop.com",
            defaults={
                "first_name": "Alexander",
                "last_name": "Brightloop",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("BrightloopAdmin2026!")
        admin_user.save()

        staff_user, _ = User.objects.get_or_create(
            email="staff@brightloop.com",
            defaults={
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "role": User.Role.STAFF,
                "is_staff": True,
            },
        )
        staff_user.set_password("BrightloopStaff2026!")
        staff_user.save()

        cust_user, _ = User.objects.get_or_create(
            email="customer@acme.com",
            defaults={"first_name": "David", "last_name": "Miller", "role": User.Role.CUSTOMER},
        )
        cust_user.set_password("AcmeCustomer2026!")
        cust_user.save()

        # Workspace B Creator (independent business owner)
        tenant_b_owner, _ = User.objects.get_or_create(
            email="bob@retailstore.com",
            defaults={"first_name": "Robert", "last_name": "Vance", "role": User.Role.ADMIN},
        )
        tenant_b_owner.set_password("RetailVance2026!")
        tenant_b_owner.save()

        # 2. Workspaces
        ws1, _ = Workspace.objects.get_or_create(
            slug="brightloop-cloud",
            defaults={
                "name": "Brightloop Cloud Services",
                "owner": admin_user,
                "currency": "USD",
                "timezone": "America/New_York",
            },
        )

        ws2, _ = Workspace.objects.get_or_create(
            slug="brightloop-hardware",
            defaults={
                "name": "Brightloop Hardware Labs",
                "owner": admin_user,
                "currency": "EUR",
                "timezone": "Europe/London",
            },
        )

        # Independent Tenant B Workspace
        ws_b, _ = Workspace.objects.get_or_create(
            slug="bobs-retail-pos",
            defaults={
                "name": "Bob's Retail Cloud",
                "owner": tenant_b_owner,
                "currency": "USD",
                "timezone": "America/Chicago",
            },
        )

        # 3. Memberships
        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=admin_user,
            defaults={
                "role": WorkspaceMembership.Role.OWNER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=staff_user,
            defaults={
                "role": WorkspaceMembership.Role.STAFF,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )
        WorkspaceMembership.objects.get_or_create(
            workspace=ws1,
            user=cust_user,
            defaults={
                "role": WorkspaceMembership.Role.CUSTOMER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        WorkspaceMembership.objects.get_or_create(
            workspace=ws2,
            user=admin_user,
            defaults={
                "role": WorkspaceMembership.Role.OWNER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        WorkspaceMembership.objects.get_or_create(
            workspace=ws_b,
            user=tenant_b_owner,
            defaults={
                "role": WorkspaceMembership.Role.OWNER,
                "status": WorkspaceMembership.Status.ACTIVE,
            },
        )

        # 4. Customers in Workspace 1
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

        # 5. Catalog Products in Workspace 1
        core_software, _ = Product.objects.get_or_create(
            workspace=ws1,
            code="SW-BL-CORE",
            defaults={
                "name": "Brightloop Core Platform",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("249.00"),
                "cost_price": Decimal("40.00"),
                "notes": "Base modular monolith SaaS subscription license",
            },
        )

        # Variant with Odoo integration delta (+560.00)
        v_odoo, _ = ProductVariant.objects.get_or_create(
            product=core_software,
            attribute_name="Brand Integration",
            attribute_value="Odoo Connector",
            defaults={"price_delta": Decimal("560.00")},
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

        # 6. Subscription Plans in Workspace 1
        plan_monthly, _ = SubscriptionPlan.objects.get_or_create(
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
            },
        )

        plan_annual, _ = SubscriptionPlan.objects.get_or_create(
            workspace=ws1,
            code="PLAN-ENT-YR",
            defaults={
                "name": "Enterprise Infinite (Annual)",
                "billing_interval": SubscriptionPlan.BillingFrequency.YEARLY,
                "base_price": Decimal("2490.00"),
                "min_seats": 25,
                "auto_close_on_end": True,
                "allow_early_close": False,
                "allow_pause": False,
                "allow_renew": True,
            },
        )

        # 7. Taxes & Discounts in Workspace 1
        tax_standard, _ = TaxRule.objects.get_or_create(
            workspace=ws1,
            name="Standard Tech VAT",
            defaults={"rate_percent": Decimal("10.00"), "is_active": True},
        )

        disc_intro, _ = DiscountRule.objects.get_or_create(
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

        # 8. Subscriptions in Workspace 1
        today = timezone.now().date()
        sub_acme, _ = Subscription.objects.get_or_create(
            workspace=ws1,
            subscription_number="SUB-2026-0001",
            defaults={
                "customer": acme,
                "plan": plan_monthly,
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

        # Subscription Events
        SubscriptionEvent.objects.get_or_create(
            subscription=sub_acme,
            previous_status=Subscription.Status.DRAFT,
            new_status=Subscription.Status.ACTIVE,
            defaults={"changed_by": admin_user, "reason": "Initial activation"},
        )

        # 9. Invoices & Payments in Workspace 1
        inv1, _ = Invoice.objects.get_or_create(
            workspace=ws1,
            invoice_number="INV-2026-0001",
            defaults={
                "customer": acme,
                "subscription": sub_acme,
                "status": Invoice.Status.PAID,
                "idempotency_key": f"ws_{ws1.id}_sub_{sub_acme.id}_first_cycle",
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

        Payment.objects.get_or_create(
            workspace=ws1,
            payment_number="PAY-2026-0001",
            defaults={
                "invoice": inv1,
                "amount": Decimal("943.80"),
                "payment_method": Payment.Method.CREDIT_CARD,
                "payment_date": today - timedelta(days=28),
                "reference": "ch_acme_card_9921",
                "notes": "Card charge settled",
            },
        )

        # Overdue Invoice for Globex
        inv_overdue, _ = Invoice.objects.get_or_create(
            workspace=ws1,
            invoice_number="INV-2026-0002",
            defaults={
                "customer": globex,
                "status": Invoice.Status.CONFIRMED,
                "idempotency_key": f"ws_{ws1.id}_manual_overdue_sample",
                "issue_date": today - timedelta(days=45),
                "due_date": today - timedelta(days=15),
                "subtotal": Decimal("1200.00"),
                "tax_amount": Decimal("120.00"),
                "discount_amount": Decimal("0.00"),
                "total_amount": Decimal("1320.00"),
                "paid_amount": Decimal("0.00"),
                "outstanding_balance": Decimal("1320.00"),
                "notes": "Enterprise custom consult",
            },
        )

        # 10. Sample Data in Independent Workspace B (Proving Tenant Isolation)
        b_cust, _ = Customer.objects.get_or_create(
            workspace=ws_b,
            email="manager@dunedinbakery.com",
            defaults={
                "company_name": "Dunedin Artisan Bakery",
                "contact_name": "Clara Higgins",
                "phone": "+1-555-8833",
            },
        )
        b_prod, _ = Product.objects.get_or_create(
            workspace=ws_b,
            code="POS-BAKERY",
            defaults={
                "name": "Bakery POS Touch System",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("89.00"),
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Multi-Tenant SaaS Demo Data successfully seeded!\n"
                f"Workspaces created: {ws1.name} (ID: {ws1.id}), {ws2.name}, {ws_b.name}\n"
                f"Users: admin@brightloop.com, staff@brightloop.com, customer@acme.com, bob@retailstore.com"
            )
        )
