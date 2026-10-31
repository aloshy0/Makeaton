from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.billing.engine import run_automated_billing_cycle
from apps.billing.models import Invoice, TaxRule
from apps.catalog.models import SubscriptionPlan
from apps.customers.models import Customer, CustomerUserLink
from apps.subscriptions.models import Subscription
from apps.workspaces.models import (
    ApiKey,
    WebhookDelivery,
    Workspace,
    WorkspaceMembership,
)


@pytest.mark.django_db
class TestMultiTenantSaaS:
    @pytest.fixture(autouse=True)
    def setup_fixtures(self):
        self.client = APIClient()

        # Users
        self.owner_a = User.objects.create_user(
            email="owner_a@brightloop.com", password="StrongPassword123!"
        )
        self.admin_a = User.objects.create_user(
            email="admin_a@brightloop.com", password="StrongPassword123!"
        )
        self.staff_a = User.objects.create_user(
            email="staff_a@brightloop.com", password="StrongPassword123!"
        )
        self.customer_user_a = User.objects.create_user(
            email="customer_a@clientcorp.com", password="StrongPassword123!"
        )

        self.owner_b = User.objects.create_user(
            email="owner_b@competitor.com", password="StrongPassword123!"
        )

        # Workspaces
        self.ws_a = Workspace.objects.create(name="Workspace Alpha", owner=self.owner_a)
        self.ws_b = Workspace.objects.create(name="Workspace Beta", owner=self.owner_b)

        # Memberships for Workspace A
        self.mem_admin_a = WorkspaceMembership.objects.create(
            workspace=self.ws_a,
            user=self.admin_a,
            role=WorkspaceMembership.Role.ADMIN,
        )
        self.mem_staff_a = WorkspaceMembership.objects.create(
            workspace=self.ws_a,
            user=self.staff_a,
            role=WorkspaceMembership.Role.STAFF,
        )
        self.mem_customer_a = WorkspaceMembership.objects.create(
            workspace=self.ws_a,
            user=self.customer_user_a,
            role=WorkspaceMembership.Role.CUSTOMER,
        )

        # Customer & Subscription in Workspace A
        self.customer_a = Customer.objects.create(
            workspace=self.ws_a,
            company_name="Client Corp",
            contact_name="Alice Client",
            email="customer_a@clientcorp.com",
        )
        CustomerUserLink.objects.create(user=self.customer_user_a, customer=self.customer_a)

        self.plan_a = SubscriptionPlan.objects.create(
            workspace=self.ws_a,
            name="Pro Plan",
            code="PRO-01",
            base_price=Decimal("150.00"),
            billing_interval=SubscriptionPlan.BillingFrequency.MONTHLY,
            allow_early_close=False,  # Restricted early close
        )

        self.sub_a = Subscription.objects.create(
            workspace=self.ws_a,
            customer=self.customer_a,
            plan=self.plan_a,
            status=Subscription.Status.ACTIVE,
            next_billing_date=timezone.now().date(),
        )

        # Customer & Subscription in Workspace B
        self.customer_b = Customer.objects.create(
            workspace=self.ws_b,
            company_name="Competitor Client",
            contact_name="Bob Competitor",
            email="bob@competitor.com",
        )
        self.plan_b = SubscriptionPlan.objects.create(
            workspace=self.ws_b,
            name="Beta Plan",
            code="BETA-01",
            base_price=Decimal("200.00"),
            billing_interval=SubscriptionPlan.BillingFrequency.MONTHLY,
        )
        self.sub_b = Subscription.objects.create(
            workspace=self.ws_b,
            customer=self.customer_b,
            plan=self.plan_b,
            status=Subscription.Status.ACTIVE,
            next_billing_date=timezone.now().date(),
        )

    # 1. 5-Workspace Quota
    def test_owner_workspace_quota_enforcement(self):
        # owner_a already owns 1 workspace (ws_a). Let's create 4 more (total 5).
        for i in range(2, 6):
            Workspace.objects.create(name=f"Workspace {i}", owner=self.owner_a)

        assert Workspace.objects.filter(owner=self.owner_a, is_active=True).count() == 5

        # 6th active workspace creation must raise ValidationError
        with pytest.raises(ValidationError) as exc_info:
            Workspace.objects.create(name="Workspace 6", owner=self.owner_a)
        assert "Workspace limit reached" in str(exc_info.value)

        # Deactivating one workspace frees up a slot
        self.ws_a.is_active = False
        self.ws_a.save()

        # Now creating a 5th active workspace succeeds
        ws_new = Workspace.objects.create(name="Workspace 5 New", owner=self.owner_a)
        assert ws_new.pk is not None

        # Verify staff/admin memberships do not consume owner slots
        assert (
            WorkspaceMembership.objects.filter(
                user=self.staff_a, role=WorkspaceMembership.Role.STAFF
            ).count()
            >= 1
        )
        assert Workspace.objects.filter(owner=self.staff_a, is_active=True).count() == 0

    # 2. Multi-Tenant Data Isolation
    def test_tenant_isolation_cross_workspace_denial(self):
        self.client.force_authenticate(user=self.owner_a)

        # User A accessing Workspace A subscriptions succeeds
        res_a = self.client.get(f"/api/v1/workspaces/{self.ws_a.id}/subscriptions/")
        assert res_a.status_code == status.HTTP_200_OK

        # User A attempting to access Workspace B subscriptions is DENIED (403)
        res_b = self.client.get(f"/api/v1/workspaces/{self.ws_b.id}/subscriptions/")
        assert res_b.status_code == status.HTTP_403_FORBIDDEN

        # User A attempting to access Workspace B customers is DENIED (403)
        res_cust_b = self.client.get(f"/api/v1/workspaces/{self.ws_b.id}/customers/")
        assert res_cust_b.status_code == status.HTTP_403_FORBIDDEN

    # 3. RBAC & Staff Operations vs Admin Powers
    def test_role_based_access_control_and_staff_limits(self):
        # Staff attempts to cancel subscription early with allow_early_close=False -> 403 Forbidden
        self.client.force_authenticate(user=self.staff_a)
        res_staff_cancel = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/subscriptions/{self.sub_a.id}/actions/close/"
        )
        assert res_staff_cancel.status_code == status.HTTP_403_FORBIDDEN
        assert "requires Workspace Admin or Owner approval" in str(res_staff_cancel.data)

        # Admin attempts to cancel subscription -> Succeeds
        self.client.force_authenticate(user=self.admin_a)
        res_admin_cancel = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/subscriptions/{self.sub_a.id}/actions/close/"
        )
        assert res_admin_cancel.status_code == status.HTTP_200_OK
        self.sub_a.refresh_from_db()
        assert self.sub_a.status == Subscription.Status.CLOSED

        # Admin attempting to promote staff to admin -> 403 Forbidden (OWNER only)
        res_admin_promote = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/memberships/{self.mem_staff_a.id}/promote-admin/"
        )
        assert res_admin_promote.status_code == status.HTTP_403_FORBIDDEN

        # Owner promoting staff to admin -> Succeeds
        self.client.force_authenticate(user=self.owner_a)
        res_owner_promote = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/memberships/{self.mem_staff_a.id}/promote-admin/"
        )
        assert res_owner_promote.status_code == status.HTTP_200_OK
        self.mem_staff_a.refresh_from_db()
        assert self.mem_staff_a.role == WorkspaceMembership.Role.ADMIN

        # Owner demoting admin to staff -> Succeeds
        res_owner_demote = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/memberships/{self.mem_staff_a.id}/demote-staff/"
        )
        assert res_owner_demote.status_code == status.HTTP_200_OK
        self.mem_staff_a.refresh_from_db()
        assert self.mem_staff_a.role == WorkspaceMembership.Role.STAFF

    # 4. Approval Request Workflow
    def test_approval_request_workflow(self):
        self.client.force_authenticate(user=self.staff_a)
        # Staff requests approval for early subscription closure
        res_req = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/approval-requests/",
            data={
                "action_type": "EARLY_CANCEL_SUBSCRIPTION",
                "entity_type": "subscription",
                "entity_id": str(self.sub_a.id),
                "payload": {"reason": "Customer hardship"},
            },
            format="json",
        )
        assert res_req.status_code == status.HTTP_201_CREATED
        approval_id = res_req.data["id"]

        # Staff cannot self-approve their own request
        res_self_approve = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/approval-requests/{approval_id}/review/",
            data={"action": "APPROVE"},
        )
        assert res_self_approve.status_code == status.HTTP_403_FORBIDDEN

        # Admin approves the request
        self.client.force_authenticate(user=self.admin_a)
        res_admin_approve = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/approval-requests/{approval_id}/review/",
            data={"action": "APPROVE"},
        )
        assert res_admin_approve.status_code == status.HTTP_200_OK
        assert res_admin_approve.data["status"] == "APPROVED"

    # 5. Staff & Customer Invitation Acceptance
    def test_invitation_acceptance(self):
        # Admin creates invitation
        self.client.force_authenticate(user=self.admin_a)
        res_inv = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/invitations/",
            data={"email": "newbie_staff@brightloop.com", "role": "STAFF"},
        )
        assert res_inv.status_code == status.HTTP_201_CREATED
        token = res_inv.data["token"]

        # Unauthenticated invitee accepts token
        self.client.logout()
        res_accept = self.client.post(
            "/api/v1/invitations/accept/",
            data={
                "token": token,
                "password": "SecurePassword2026!",
                "first_name": "New",
                "last_name": "Operator",
            },
        )
        assert res_accept.status_code == status.HTTP_200_OK
        assert "access" in res_accept.data

        # Check membership created
        new_user = User.objects.get(email="newbie_staff@brightloop.com")
        membership = WorkspaceMembership.objects.filter(workspace=self.ws_a, user=new_user).first()
        assert membership is not None
        assert membership.role == WorkspaceMembership.Role.STAFF

        # Accepting token second time must fail
        res_reuse = self.client.post(
            "/api/v1/invitations/accept/",
            data={"token": token, "password": "SecurePassword2026!"},
        )
        assert res_reuse.status_code == status.HTTP_400_BAD_REQUEST

    # 6. API Key and Webhook Integrations
    def test_api_keys_and_webhooks(self):
        self.client.force_authenticate(user=self.owner_a)

        # Create API Key
        res_key = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/integrations/api-keys/",
            data={"name": "Production Storefront Key", "expires_in_days": 30},
        )
        assert res_key.status_code == status.HTTP_201_CREATED
        raw_secret = res_key.data["secret"]
        key_id = res_key.data["id"]
        assert raw_secret.startswith("brk_live_")

        key_obj = ApiKey.objects.get(id=key_id)
        assert key_obj.verify(raw_secret) is True

        # Rotate API Key
        res_rotate = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/integrations/api-keys/{key_id}/rotate/"
        )
        assert res_rotate.status_code == status.HTTP_200_OK
        new_secret = res_rotate.data["secret"]
        assert new_secret != raw_secret
        key_obj.refresh_from_db()
        assert key_obj.verify(new_secret) is True

        # Webhook Endpoint creation
        res_hook = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/integrations/webhooks/",
            data={
                "url": "https://clientapp.com/webhook",
                "events": ["subscription.activated", "invoice.paid"],
            },
            format="json",
        )
        assert res_hook.status_code == status.HTTP_201_CREATED
        hook_id = res_hook.data["id"]

        delivery = WebhookDelivery.objects.create(
            endpoint_id=hook_id,
            event_type="subscription.activated",
            payload={"sub_id": str(self.sub_a.id)},
        )

        # Retry Webhook delivery
        res_retry = self.client.post(
            f"/api/v1/workspaces/{self.ws_a.id}/integrations/webhooks/{hook_id}/deliveries/{delivery.id}/retry/"
        )
        assert res_retry.status_code == status.HTTP_200_OK
        assert res_retry.data["delivery"]["delivered"] is True

    # 7. Customer Portal Scoping
    def test_customer_portal_scoping(self):
        self.client.force_authenticate(user=self.customer_user_a)

        # Customer accesses their portal subscriptions
        res = self.client.get(f"/api/v1/workspaces/{self.ws_a.id}/portal/subscriptions/")
        assert res.status_code == status.HTTP_200_OK
        # Must only contain subscriptions belonging to Client Corp (sub_a), not sub_b
        results = res.data if isinstance(res.data, list) else res.data.get("results", [])
        sub_ids = [s["id"] for s in results]
        assert str(self.sub_a.id) in sub_ids
        assert str(self.sub_b.id) not in sub_ids

    # 8. Idempotent Recurring Billing
    def test_idempotent_recurring_billing_cycle(self):
        today = timezone.now().date()
        TaxRule.objects.create(workspace=self.ws_a, name="VAT 10%", rate_percent=Decimal("10.00"))

        # First run: Generates invoice
        result_1 = run_automated_billing_cycle(workspace_id=self.ws_a.id, target_date=today)
        assert result_1["generated_count"] == 1
        assert result_1["skipped_count"] == 0

        inv = Invoice.objects.filter(workspace=self.ws_a, subscription=self.sub_a).first()
        assert inv is not None
        assert inv.subtotal == Decimal("150.00")
        assert inv.tax_amount == Decimal("15.00")
        assert inv.total_amount == Decimal("165.00")
        assert inv.outstanding_balance == Decimal("165.00")

        # Set next_billing_date back to today to simulate re-running billing cycle for the same billing date
        self.sub_a.next_billing_date = today
        self.sub_a.save(update_fields=["next_billing_date"])

        # Second run: Must skip duplicate invoice creation
        result_2 = run_automated_billing_cycle(workspace_id=self.ws_a.id, target_date=today)
        assert result_2["generated_count"] == 0
        assert result_2["skipped_count"] == 1
        assert Invoice.objects.filter(workspace=self.ws_a, subscription=self.sub_a).count() == 1
