from rest_framework import exceptions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.models import WorkspaceMembership
from apps.workspaces.permissions import IsWorkspaceAdmin, IsWorkspaceMember

from .engine import run_automated_billing_cycle
from .models import Invoice, TaxRule
from .serializers import InvoiceSerializer, TaxRuleSerializer


class TaxRuleViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = TaxRule.objects.all()
    serializer_class = TaxRuleSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsWorkspaceAdmin()]
        return [IsWorkspaceMember()]


class InvoiceViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = (
        Invoice.objects.select_related("customer", "subscription").prefetch_related("lines").all()
    )
    serializer_class = InvoiceSerializer
    filterset_fields = ["status", "customer", "subscription"]
    search_fields = ["invoice_number", "customer__company_name"]
    ordering_fields = ["issue_date", "due_date", "total_amount", "outstanding_balance"]

    @action(detail=True, methods=["post"], url_path="actions/confirm")
    def confirm(self, request, workspace_id, pk=None):
        invoice = self.get_object()
        if invoice.status != Invoice.Status.DRAFT:
            raise exceptions.ValidationError(
                {"error": f"Only draft invoices can be confirmed. Current status: {invoice.status}"}
            )
        invoice.status = Invoice.Status.CONFIRMED
        invoice.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(invoice).data)

    @action(detail=True, methods=["post"], url_path="actions/cancel")
    def cancel(self, request, workspace_id, pk=None):
        invoice = self.get_object()
        membership = getattr(request, "workspace_membership", None)

        # Staff limited power: cancelling confirmed invoice requires Admin approval
        if invoice.status == Invoice.Status.CONFIRMED and membership:
            if membership.role == WorkspaceMembership.Role.STAFF:
                raise exceptions.PermissionDenied(
                    "Cancelling an active confirmed invoice requires Workspace Admin or Owner approval."
                )

        invoice.status = Invoice.Status.CANCELLED
        invoice.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(invoice).data)


class TriggerBillingRunView(APIView):
    permission_classes = [IsWorkspaceAdmin]

    def post(self, request, workspace_id):
        results = run_automated_billing_cycle(workspace_id=workspace_id)
        return Response(results, status=status.HTTP_200_OK)
