from django.db import transaction
from django.utils import timezone
from rest_framework import exceptions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.subscriptions.models import Subscription, SubscriptionLine
from apps.workspaces.mixins import TenantScopedMixin

from .models import Quotation, QuotationTemplate
from .serializers import QuotationSerializer, QuotationTemplateSerializer


class QuotationTemplateViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.prefetch_related("lines").all()
    serializer_class = QuotationTemplateSerializer


class QuotationViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = Quotation.objects.select_related("customer", "plan").prefetch_related("lines").all()
    serializer_class = QuotationSerializer
    filterset_fields = ["status", "customer", "plan"]
    search_fields = ["reference", "customer__company_name"]
    ordering_fields = ["created_at", "total_amount", "valid_until"]

    @action(detail=True, methods=["post"], url_path="actions/send")
    def send_quote(self, request, workspace_id, pk=None):
        quotation = self.get_object()
        quotation.status = Quotation.Status.SENT
        quotation.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(quotation).data)

    @action(detail=True, methods=["post"], url_path="actions/approve")
    def approve_quote(self, request, workspace_id, pk=None):
        quotation = self.get_object()
        if quotation.status in [Quotation.Status.APPROVED, Quotation.Status.REJECTED]:
            raise exceptions.ValidationError(
                {"error": f"Cannot approve quotation currently in '{quotation.status}' state."}
            )

        with transaction.atomic():
            quotation.status = Quotation.Status.APPROVED
            quotation.save(update_fields=["status", "updated_at"])

            # Convert to Subscription
            subscription = Subscription.objects.create(
                workspace=quotation.workspace,
                customer=quotation.customer,
                plan=quotation.plan,
                status=Subscription.Status.CONFIRMED,
                start_date=timezone.now().date(),
                subtotal=quotation.subtotal,
                tax_amount=quotation.tax_amount,
                discount_amount=quotation.discount_amount,
                total_amount=quotation.total_amount,
                notes=f"Created from approved quotation {quotation.reference}",
            )

            # Copy lines
            for q_line in quotation.lines.all():
                SubscriptionLine.objects.create(
                    subscription=subscription,
                    product=q_line.product,
                    variant=q_line.variant,
                    quantity=q_line.quantity,
                    unit_price=q_line.unit_price,
                    subtotal=q_line.subtotal,
                )

        from apps.subscriptions.serializers import SubscriptionSerializer

        return Response(
            {
                "status": "success",
                "message": "Quotation approved and converted to confirmed subscription.",
                "subscription": SubscriptionSerializer(subscription).data,
            },
            status=status.HTTP_201_CREATED,
        )
