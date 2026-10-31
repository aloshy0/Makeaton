from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from apps.accounts.permissions import IsOwnerOrStaff, IsStaffOrAdmin

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["company_name", "contact_name", "email", "phone"]
    ordering_fields = ["company_name", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "destroy"]:
            return [IsStaffOrAdmin()]
        return [permissions.IsAuthenticated(), IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Customer.objects.none()
        if user.is_internal_staff:
            return Customer.objects.all()
        return Customer.objects.filter(user=user)
