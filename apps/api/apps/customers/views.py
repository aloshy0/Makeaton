from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.models import Invoice
from apps.customers.models import Customer, CustomerUserLink
from apps.customers.serializers import CustomerSerializer
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
