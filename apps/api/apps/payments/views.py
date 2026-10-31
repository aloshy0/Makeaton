from rest_framework import viewsets

from apps.workspaces.mixins import TenantScopedMixin

from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("invoice__customer").all()
    serializer_class = PaymentSerializer
    filterset_fields = ["payment_method", "invoice"]
    search_fields = ["payment_number", "invoice__invoice_number", "reference"]
    ordering_fields = ["payment_date", "amount"]
