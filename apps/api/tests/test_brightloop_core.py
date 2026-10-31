from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.accounts.models import User
from apps.billing.engine import generate_invoices_for_due_subscriptions
from apps.billing.models import Invoice, TaxRule
from apps.catalog.models import Product, ProductVariant, SubscriptionPlan
from apps.customers.models import Customer
from apps.subscriptions.models import Subscription


@pytest.mark.django_db
class TestBrightloopCore:
    def test_password_policy_enforcement(self):
        user = User(email="test@brightloop.com")
        from apps.accounts.validators import ComplexPasswordValidator

        validator = ComplexPasswordValidator()

        # Missing uppercase
        with pytest.raises(ValidationError):
            validator.validate("lowercase!123", user)

        # Missing lowercase
        with pytest.raises(ValidationError):
            validator.validate("UPPERCASE!123", user)

        # Missing special character
        with pytest.raises(ValidationError):
            validator.validate("Uppercase123", user)

        # Valid password
        validator.validate("StrongPass123!", user)

    def test_product_variant_pricing(self):
        product = Product.objects.create(
            name="Brightloop Suite", code="SUITE-01", sales_price=Decimal("100.00")
        )
        variant = ProductVariant.objects.create(
            product=product,
            attribute_name="Brand",
            attribute_value="Odoo",
            price_delta=Decimal("560.00"),
        )
        assert product.sales_price == Decimal("100.00")
        assert product.sales_price + variant.price_delta == Decimal("660.00")

    def test_subscription_state_machine(self):
        customer = Customer.objects.create(
            company_name="Acme", contact_name="John", email="john@acme.com"
        )
        plan = SubscriptionPlan.objects.create(
            name="Pro Monthly",
            code="PRO-M",
            cost=Decimal("50.00"),
            billing_frequency=SubscriptionPlan.BillingFrequency.MONTHLY,
            allow_pause=True,
            allow_early_close=True,
        )
        sub = Subscription.objects.create(
            customer=customer, plan=plan, status=Subscription.Status.DRAFT
        )

        # Valid state transitions
        sub.transition_to(Subscription.Status.QUOTATION)
        assert sub.status == Subscription.Status.QUOTATION

        sub.transition_to(Subscription.Status.CONFIRMED)
        assert sub.status == Subscription.Status.CONFIRMED

        sub.transition_to(Subscription.Status.ACTIVE)
        assert sub.status == Subscription.Status.ACTIVE

        sub.transition_to(Subscription.Status.PAUSED)
        assert sub.status == Subscription.Status.PAUSED

        sub.transition_to(Subscription.Status.ACTIVE)
        assert sub.status == Subscription.Status.ACTIVE

        sub.transition_to(Subscription.Status.CLOSED)
        assert sub.status == Subscription.Status.CLOSED

    def test_automated_billing_and_idempotency(self):
        today = timezone.now().date()
        customer = Customer.objects.create(
            company_name="IdemCorp", contact_name="Alice", email="alice@idem.com"
        )
        plan = SubscriptionPlan.objects.create(
            name="Standard",
            code="STD",
            cost=Decimal("100.00"),
            billing_frequency=SubscriptionPlan.BillingFrequency.MONTHLY,
        )
        TaxRule.objects.create(name="Tax 10%", rate_percent=Decimal("10.00"))

        sub = Subscription.objects.create(
            customer=customer,
            plan=plan,
            status=Subscription.Status.ACTIVE,
            start_date=today,
            next_billing_date=today,
        )

        # First billing run: creates invoice
        run_1 = generate_invoices_for_due_subscriptions(target_date=today)
        assert run_1["generated_count"] == 1
        assert run_1["skipped_count"] == 0

        inv = Invoice.objects.get(id=run_1["invoice_ids"][0])
        assert inv.subtotal == Decimal("100.00")
        assert inv.tax_amount == Decimal("10.00")
        assert inv.total_amount == Decimal("110.00")

        # Second billing run with same date: MUST NOT duplicate invoice
        run_2 = generate_invoices_for_due_subscriptions(target_date=today)
        assert run_2["generated_count"] == 0
        assert Invoice.objects.filter(subscription=sub).count() == 1
