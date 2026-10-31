from decimal import Decimal

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.models import Invoice
from apps.customers.models import Customer, CustomerUserLink
from apps.customers.serializers import CustomerSerializer
from apps.discounts.models import DiscountRule
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription
from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.permissions import IsWorkspaceMember


class CustomerViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filterset_fields = ["is_active"]
    search_fields = ["company_name", "contact_name", "email"]
    ordering_fields = ["company_name", "created_at"]

    def perform_create(self, serializer):
        from rest_framework import exceptions

        workspace = self.workspace
        plan = workspace.owner.get_flowgrid_plan()
        count = Customer.objects.filter(workspace=workspace).count()
        if count >= plan.max_customers_per_workspace:
            raise exceptions.ValidationError(
                {
                    "error": f"Customer limit reached ({plan.max_customers_per_workspace} max for your {plan.name} plan). Please upgrade your FlowGrid plan to add more customers."
                }
            )
        return super().perform_create(serializer)



class PortalMeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        link = (
            CustomerUserLink.objects.filter(user=request.user, customer__workspace_id=workspace_id)
            .select_related("customer")
            .first()
        )

        if not link:
            # Fallback check on customer email
            cust = Customer.objects.filter(
                workspace_id=workspace_id, email=request.user.email
            ).first()
            if cust:
                CustomerUserLink.objects.get_or_create(customer=cust, user=request.user)
                return Response(CustomerSerializer(cust).data)
            return Response(
                {"error": "No linked customer profile found for this workspace."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(CustomerSerializer(link.customer).data)


class PortalSubscriptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        from apps.subscriptions.serializers import SubscriptionSerializer

        customer_ids = CustomerUserLink.objects.filter(
            user=request.user, customer__workspace_id=workspace_id
        ).values_list("customer_id", flat=True)

        subs = (
            Subscription.objects.filter(workspace_id=workspace_id, customer_id__in=customer_ids)
            .select_related("plan", "customer")
            .prefetch_related("lines")
        )

        return Response(SubscriptionSerializer(subs, many=True).data)


class PortalOffersView(APIView):
    """Return active discount offers that match the signed-in customer's subscriptions."""

    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        today = timezone.now().date()
        customer_ids = CustomerUserLink.objects.filter(
            user=request.user, customer__workspace_id=workspace_id, customer__is_active=True
        ).values_list("customer_id", flat=True)
        subscriptions = list(
            Subscription.objects.filter(
                workspace_id=workspace_id,
                customer_id__in=customer_ids,
                status=Subscription.Status.ACTIVE,
            )
            .select_related("plan", "workspace")
            .prefetch_related("lines__product")
        )

        if not subscriptions:
            return Response([])

        offers = []
        rules = DiscountRule.objects.filter(
            workspace_id=workspace_id, is_active=True
        ).select_related("target_product")
        for rule in rules:
            if (rule.start_date and rule.start_date > today) or (rule.end_date and rule.end_date < today):
                continue
            if rule.max_uses is not None and rule.times_used >= rule.max_uses:
                continue

            for subscription in subscriptions:
                lines = list(subscription.lines.all())
                subtotal = subscription.subtotal or sum(
                    (line.unit_price * line.quantity for line in lines), start=Decimal("0.00")
                )
                if subtotal == 0 and not lines:
                    subtotal = subscription.plan.base_price
                if subtotal < rule.min_purchase_amount:
                    continue

                if rule.scope == DiscountRule.Scope.PRODUCT:
                    matching_lines = [
                        line for line in lines if line.product_id == rule.target_product_id
                    ]
                    if (
                        not matching_lines
                        or sum(line.quantity for line in matching_lines) < rule.min_quantity
                    ):
                        continue
                elif rule.min_quantity and sum(line.quantity for line in lines) < rule.min_quantity:
                    continue

                offers.append(
                    {
                        "id": str(rule.id),
                        "name": rule.name,
                        "code": rule.code,
                        "discount_type": rule.discount_type,
                        "value": str(rule.value),
                        "min_purchase_amount": str(rule.min_purchase_amount),
                        "start_date": rule.start_date.isoformat() if rule.start_date else None,
                        "end_date": rule.end_date.isoformat() if rule.end_date else None,
                        "scope": rule.scope,
                        "subscription_id": str(subscription.id),
                        "subscription_number": subscription.subscription_number,
                        "subscription_name": subscription.plan.name,
                        "workspace_id": str(workspace_id),
                        "workspace_name": subscription.workspace.name,
                    }
                )

        return Response(offers)


class PortalInvoicesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        from apps.billing.serializers import InvoiceSerializer

        customer_ids = CustomerUserLink.objects.filter(
            user=request.user, customer__workspace_id=workspace_id
        ).values_list("customer_id", flat=True)

        invoices = (
            Invoice.objects.filter(workspace_id=workspace_id, customer_id__in=customer_ids)
            .select_related("customer", "subscription")
            .prefetch_related("lines")
        )

        return Response(InvoiceSerializer(invoices, many=True).data)


class PortalPaymentsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get(self, request, workspace_id):
        from apps.payments.serializers import PaymentSerializer

        customer_ids = CustomerUserLink.objects.filter(
            user=request.user, customer__workspace_id=workspace_id
        ).values_list("customer_id", flat=True)

        payments = Payment.objects.filter(
            workspace_id=workspace_id, invoice__customer_id__in=customer_ids
        ).select_related("invoice")

        return Response(PaymentSerializer(payments, many=True).data)
