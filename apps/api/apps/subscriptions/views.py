from rest_framework import exceptions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.workspaces.mixins import TenantScopedMixin
from apps.workspaces.models import WorkspaceMembership

from .models import Subscription
from .serializers import SubscriptionSerializer


class SubscriptionViewSet(TenantScopedMixin, viewsets.ModelViewSet):
    queryset = (
        Subscription.objects.select_related("customer", "plan")
        .prefetch_related("lines", "events")
        .all()
    )
    serializer_class = SubscriptionSerializer
    filterset_fields = ["status", "customer", "plan", "payment_terms"]
    search_fields = ["subscription_number", "customer__company_name", "customer__email"]
    ordering_fields = ["created_at", "next_billing_date", "total_amount"]

    @action(detail=True, methods=["post"], url_path="actions/confirm")
    def confirm(self, request, workspace_id, pk=None):
        subscription = self.get_object()
        subscription.transition_to(
            Subscription.Status.ACTIVE,
            user=request.user,
            reason="Confirmed and activated by operator",
        )
        return Response(self.get_serializer(subscription).data)

    @action(detail=True, methods=["post"], url_path="actions/pause")
    def pause(self, request, workspace_id, pk=None):
        subscription = self.get_object()
        if not subscription.plan.allow_pause:
            raise exceptions.ValidationError(
                {"error": "This subscription plan policy does not permit pausing."}
            )
        subscription.transition_to(
            Subscription.Status.PAUSED,
            user=request.user,
            reason=request.data.get("reason", "Suspended per request"),
        )
        return Response(self.get_serializer(subscription).data)

    @action(detail=True, methods=["post"], url_path="actions/resume")
    def resume(self, request, workspace_id, pk=None):
        subscription = self.get_object()
        subscription.transition_to(
            Subscription.Status.ACTIVE,
            user=request.user,
            reason="Resumed by operator",
        )
        return Response(self.get_serializer(subscription).data)

    @action(detail=True, methods=["post"], url_path="actions/close")
    def close(self, request, workspace_id, pk=None):
        subscription = self.get_object()
        membership = getattr(request, "workspace_membership", None)
        if not membership:
            membership = WorkspaceMembership.objects.filter(
                workspace_id=workspace_id,
                user=request.user,
                status=WorkspaceMembership.Status.ACTIVE,
            ).first()

        # Staff limited power: if plan does not allow early close, staff cannot close without admin approval
        if not subscription.plan.allow_early_close and membership:
            if membership.role == WorkspaceMembership.Role.STAFF:
                raise exceptions.PermissionDenied(
                    "Early cancellation for this plan requires Workspace Admin or Owner approval."
                )

        subscription.transition_to(
            Subscription.Status.CLOSED,
            user=request.user,
            reason=request.data.get("reason", "Terminated"),
        )
        return Response(self.get_serializer(subscription).data)
