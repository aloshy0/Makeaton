from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.billing.models import DiscountRule, Invoice, TaxRule
from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription, SubscriptionLine

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with Brightloop Software demonstration and benchmark records"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Brightloop demonstration data...")

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            email="admin@brightloop.com",
            defaults={
                "first_name": "Admin",
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
        cust_user.set_password("BrightloopCustomer2026!")
        cust_user.save()

        # 2. Customers
        acme, _ = Customer.objects.get_or_create(
            email="customer@acme.com",
            defaults={
                "user": cust_user,
                "company_name": "Acme Software Corp",
                "contact_name": "David Miller",
                "phone": "+1 555-019-2834",
                "billing_address": "742 Evergreen Terrace, Springfield, OR",
                "tax_id": "US-987654321",
            },
        )

        techtrend, _ = Customer.objects.get_or_create(
            email="finance@techtrend.io",
            defaults={
                "company_name": "TechTrend Dynamics",
                "contact_name": "Elena Rostova",
                "phone": "+1 555-018-9922",
                "billing_address": "100 Market St, Suite 400, San Francisco, CA",
                "tax_id": "US-123456789",
            },
        )

        blossom, _ = Customer.objects.get_or_create(
            email="orders@blossomretail.com",
            defaults={
                "company_name": "Blossom Retail Shops",
                "contact_name": "Chloe Bennett",
                "phone": "+1 555-014-4321",
                "billing_address": "12 Flower Ave, Austin, TX",
                "tax_id": "US-443322110",
            },
        )

        # 3. Products
        core_app, _ = Product.objects.get_or_create(
            code="CORE-APP",
            defaults={
                "name": "Brightloop Enterprise Suite",
                "product_type": Product.ProductType.SOFTWARE,
                "sales_price": Decimal("299.00"),
                "cost_price": Decimal("50.00"),
                "notes": "Primary SaaS platform license.",
            },
        )

        addon_ai, _ = Product.objects.get_or_create(
            code="ADDON-AI",
            defaults={
                "name": "AI Predictive Analytics Add-on",
                "product_type": Product.ProductType.ADDON,
                "sales_price": Decimal("99.00"),
                "cost_price": Decimal("15.00"),
                "notes": "Modular add-on customer can toggle on/off.",
            },
        )

        addon_sla, _ = Product.objects.get_or_create(
            code="ADDON-SLA",
            defaults={
                "name": "24/7 Dedicated Support SLA",
                "product_type": Product.ProductType.SERVICE,
                "sales_price": Decimal("150.00"),
                "cost_price": Decimal("40.00"),
            },
        )

        # 4. Product Variants (per PDF: Brand variant with Odoo adding +560.00)
        odoo_variant, _ = ProductVariant.objects.get_or_create(
            product=core_app,
            attribute_name="Brand",
            attribute_value="Odoo Integration",
            defaults={"price_delta": Decimal("560.00")},
        )

        std_variant, _ = ProductVariant.objects.get_or_create(
            product=core_app,
            attribute_name="Brand",
            attribute_value="Standard Edition",
            defaults={"price_delta": Decimal("0.00")},
        )

        # 5. Subscription Plans
        monthly_plan, _ = SubscriptionPlan.objects.get_or_create(
            code="PLAN-MONTHLY-BIZ",
            defaults={
                "name": "Business Pro (Monthly)",
                "billing_frequency": SubscriptionPlan.BillingFrequency.MONTHLY,
                "cost": Decimal("199.00"),
                "minimum_quantity": 1,
                "auto_close_on_end": True,
                "allow_early_close": True,
                "allow_pause": True,
                "allow_renew": True,
            },
        )

        yearly_plan, _ = SubscriptionPlan.objects.get_or_create(
            code="PLAN-YEARLY-ENT",
            defaults={
                "name": "Enterprise Annual (Yearly)",
                "billing_frequency": SubscriptionPlan.BillingFrequency.YEARLY,
                "cost": Decimal("1990.00"),
                "minimum_quantity": 5,
                "auto_close_on_end": True,
                "allow_early_close": False,
                "allow_pause": False,
                "allow_renew": True,
            },
        )

        # 6. Tax and Discount Rules
        tax_standard, _ = TaxRule.objects.get_or_create(
            name="Standard Sales Tax",
            defaults={"rate_percent": Decimal("10.00"), "is_active": True},
        )

        discount_seats, _ = DiscountRule.objects.get_or_create(
            code="SEATS20",
            defaults={
                "name": "Volume Seats Discount (20%)",
                "discount_type": DiscountRule.DiscountType.PERCENTAGE,
                "value": Decimal("20.00"),
                "min_quantity": 5,
                "scope": DiscountRule.Scope.SUBSCRIPTION,
                "is_active": True,
            },
        )

        # 7. Subscriptions
        today = timezone.now().date()

        # Active Subscription for Acme
        sub_acme, created = Subscription.objects.get_or_create(
            subscription_number="SUB-2026-0001",
            defaults={
                "customer": acme,
                "plan": monthly_plan,
                "status": Subscription.Status.ACTIVE,
                "start_date": today - timedelta(days=45),
                "next_billing_date": today + timedelta(days=15),
                "payment_terms": Subscription.PaymentTerms.NET_30,
            },
        )
        if created:
            SubscriptionLine.objects.create(
                subscription=sub_acme,
                product=core_app,
                variant=odoo_variant,
                quantity=1,
                unit_price=core_app.sales_price + odoo_variant.price_delta,
                subtotal=core_app.sales_price + odoo_variant.price_delta,
            )
            SubscriptionLine.objects.create(
                subscription=sub_acme,
                product=addon_ai,
                quantity=2,
                unit_price=addon_ai.sales_price,
                subtotal=addon_ai.sales_price * 2,
            )
            sub_acme.calculate_totals()

        # Quotation for TechTrend
        sub_tt, created = Subscription.objects.get_or_create(
            subscription_number="SUB-2026-0002",
            defaults={
                "customer": techtrend,
                "plan": yearly_plan,
                "status": Subscription.Status.QUOTATION,
                "start_date": today,
                "expiry_date": today + timedelta(days=30),
                "payment_terms": Subscription.PaymentTerms.NET_15,
            },
        )
        if created:
            SubscriptionLine.objects.create(
                subscription=sub_tt,
                product=core_app,
                variant=std_variant,
                quantity=5,
                unit_price=core_app.sales_price,
                subtotal=core_app.sales_price * 5,
            )
            sub_tt.calculate_totals()

        # Confirmed Subscription for Blossom
        sub_blossom, created = Subscription.objects.get_or_create(
            subscription_number="SUB-2026-0003",
            defaults={
                "customer": blossom,
                "plan": monthly_plan,
                "status": Subscription.Status.CONFIRMED,
                "start_date": today,
                "next_billing_date": today,
                "payment_terms": Subscription.PaymentTerms.DUE_ON_RECEIPT,
            },
        )
        if created:
            SubscriptionLine.objects.create(
                subscription=sub_blossom,
                product=addon_sla,
                quantity=1,
                unit_price=addon_sla.sales_price,
                subtotal=addon_sla.sales_price,
            )
            sub_blossom.calculate_totals()

        # 8. Invoices and Payments
        # Paid Invoice for Acme
        inv_acme_paid, _ = Invoice.objects.get_or_create(
            invoice_number="INV-2026-0001",
            defaults={
                "subscription": sub_acme,
                "customer": acme,
                "issue_date": today - timedelta(days=40),
                "due_date": today - timedelta(days=10),
                "status": Invoice.Status.PAID,
                "subtotal": Decimal("1057.00"),
                "tax_amount": Decimal("105.70"),
                "total_amount": Decimal("1162.70"),
                "paid_amount": Decimal("1162.70"),
                "outstanding_balance": Decimal("0.00"),
                "idempotency_key": f"sub_{sub_acme.id}_{today - timedelta(days=40)}",
            },
        )
        Payment.objects.get_or_create(
            payment_number="PAY-2026-0001",
            defaults={
                "invoice": inv_acme_paid,
                "amount": Decimal("1162.70"),
                "payment_method": Payment.Method.BANK_TRANSFER,
                "payment_date": today - timedelta(days=20),
                "reference": "WIRE-REF-9021",
                "notes": "Acme monthly payment cleared.",
            },
        )

        # Overdue Invoice for Blossom
        inv_blossom_overdue, _ = Invoice.objects.get_or_create(
            invoice_number="INV-2026-0002",
            defaults={
                "subscription": sub_blossom,
                "customer": blossom,
                "issue_date": today - timedelta(days=35),
                "due_date": today - timedelta(days=5),  # Past due!
                "status": Invoice.Status.CONFIRMED,
                "subtotal": Decimal("349.00"),
                "tax_amount": Decimal("34.90"),
                "total_amount": Decimal("383.90"),
                "paid_amount": Decimal("0.00"),
                "outstanding_balance": Decimal("383.90"),
                "idempotency_key": f"sub_{sub_blossom.id}_{today - timedelta(days=35)}",
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo database successfully seeded with users, products, plans, subscriptions, and invoices."
            )
        )
