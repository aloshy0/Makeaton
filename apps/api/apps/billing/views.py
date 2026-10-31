from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdmin, IsOwnerOrStaff, IsStaffOrAdmin

from .engine import generate_invoices_for_due_subscriptions
from .models import DiscountRule, Invoice, TaxRule
from .serializers import (
    DiscountRuleSerializer,
    InvoiceSerializer,
    TaxRuleSerializer,
)


class TaxRuleViewSet(viewsets.ModelViewSet):
    queryset = TaxRule.objects.all()
    serializer_class = TaxRuleSerializer
    permission_classes = [IsAdmin]


class DiscountRuleViewSet(viewsets.ModelViewSet):
    queryset = DiscountRule.objects.all()
    serializer_class = DiscountRuleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["scope", "discount_type", "is_active"]
    search_fields = ["name", "code"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return [IsStaffOrAdmin()]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = (
        Invoice.objects.select_related("customer", "subscription")
        .prefetch_related("lines__product", "lines__variant")
        .all()
    )
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer", "subscription"]
    search_fields = ["invoice_number", "customer__company_name", "customer__email"]
    ordering_fields = ["issue_date", "due_date", "total_amount", "outstanding_balance"]

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [IsAdmin()]
        return [permissions.IsAuthenticated(), IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Invoice.objects.none()

        qs = self.queryset
        # Check overdue query parameter
        overdue_param = self.request.query_params.get("overdue")
        if overdue_param in ["true", "1"]:
            qs = qs.filter(
                status=Invoice.Status.CONFIRMED,
                outstanding_balance__gt=0,
                due_date__lt=timezone.now().date(),
            )

        if user.is_internal_staff:
            return qs
        return qs.filter(customer__user=user)

    @action(detail=True, methods=["post"], permission_classes=[IsStaffOrAdmin])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != Invoice.Status.DRAFT:
            return Response(
                {"error": f"Cannot confirm invoice in {invoice.status} status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        invoice.status = Invoice.Status.CONFIRMED
        invoice.save()
        return Response(self.get_serializer(invoice).data)

    @action(detail=True, methods=["post"], permission_classes=[IsStaffOrAdmin])
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == Invoice.Status.PAID:
            return Response(
                {"error": "Cannot cancel a paid invoice."}, status=status.HTTP_400_BAD_REQUEST
            )
        invoice.status = Invoice.Status.CANCELLED
        invoice.save()
        return Response(self.get_serializer(invoice).data)


class BillingRunView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        target_date_str = request.data.get("target_date")
        target_date = None
        if target_date_str:
            try:
                target_date = timezone.datetime.strptime(target_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        result = generate_invoices_for_due_subscriptions(target_date)
        return Response(
            {
                "status": "success",
                "message": f"Billing run executed. Generated {result['generated_count']} invoices. Skipped {result['skipped_count']} already-billed subscriptions.",
                "data": result,
            }
        )
