from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.accounts.permissions import IsOwnerOrStaff, IsStaffOrAdmin

from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("invoice__customer").all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["invoice", "payment_method", "payment_date"]
    search_fields = [
        "payment_number",
        "reference",
        "invoice__invoice_number",
        "invoice__customer__company_name",
    ]
    ordering_fields = ["payment_date", "amount", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsStaffOrAdmin()]
        return [permissions.IsAuthenticated(), IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Payment.objects.none()
        if user.is_internal_staff:
            return self.queryset
        return self.queryset.filter(invoice__customer__user=user)
