from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsOwnerOrStaff, IsStaffOrAdmin

from .models import Subscription, SubscriptionLine
from .serializers import (
    SubscriptionLineSerializer,
    SubscriptionSerializer,
    SubscriptionTransitionSerializer,
)


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = (
        Subscription.objects.select_related("customer", "plan")
        .prefetch_related("lines__product", "lines__variant")
        .all()
    )
    serializer_class = SubscriptionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "customer", "plan", "payment_terms"]
    search_fields = ["subscription_number", "customer__company_name", "customer__email"]
    ordering_fields = ["created_at", "start_date", "total_amount"]

    def get_permissions(self):
        if self.action in ["destroy"]:
            return [IsStaffOrAdmin()]
        return [permissions.IsAuthenticated(), IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Subscription.objects.none()
        if user.is_internal_staff:
            return self.queryset
        return self.queryset.filter(customer__user=user)

    @action(detail=True, methods=["post"], permission_classes=[IsStaffOrAdmin])
    def transition(self, request, pk=None):
        subscription = self.get_object()
        serializer = SubscriptionTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_status = serializer.validated_data["target_status"]
        try:
            subscription.transition_to(target_status)
            return Response(self.get_serializer(subscription).data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionLineViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionLine.objects.select_related("product", "variant", "subscription").all()
    serializer_class = SubscriptionLineSerializer
    permission_classes = [IsStaffOrAdmin]
