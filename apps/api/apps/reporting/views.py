from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.models import Invoice
from apps.catalog.models import SubscriptionPlan
from apps.payments.models import Payment
from apps.reporting.permissions import CanViewWorkspaceReports
from apps.subscriptions.models import Subscription
from apps.workspaces.mixins import TenantScopedMixin


def serialize_money(amount):
    return format(amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP), ".2f")


class DashboardMetricsView(TenantScopedMixin, APIView):
    """
    Consolidated Workspace Executive Reporting API:
    Designed for sub-2-second response times with database-level aggregations.
    """

    permission_classes = [CanViewWorkspaceReports]

    def get(self, request, workspace_id):
        today = timezone.now().date()

        # 1. Subscriptions Aggregations
        sub_stats = Subscription.objects.filter(workspace_id=workspace_id).aggregate(
            total_count=Count("id"),
            active_count=Count("id", filter=Q(status=Subscription.Status.ACTIVE)),
            paused_count=Count("id", filter=Q(status=Subscription.Status.PAUSED)),
            quotation_count=Count("id", filter=Q(status=Subscription.Status.QUOTATION)),
            closed_count=Count("id", filter=Q(status=Subscription.Status.CLOSED)),
            active_revenue=Sum("total_amount", filter=Q(status=Subscription.Status.ACTIVE)),
        )

        total_subscriptions = sub_stats["total_count"] or 0
        active_subscriptions = sub_stats["active_count"] or 0

        # Calculate MRR based on active subscriptions
        active_subs = Subscription.objects.filter(
            workspace_id=workspace_id, status=Subscription.Status.ACTIVE
        ).values("plan__billing_interval", "total_amount")

        mrr = Decimal("0.00")
        for s in active_subs:
            interval = s.get("plan__billing_interval") or "monthly"
            amt = s.get("total_amount") or Decimal("0.00")
            if interval == SubscriptionPlan.BillingFrequency.MONTHLY:
                mrr += amt
            elif interval == SubscriptionPlan.BillingFrequency.YEARLY:
                mrr += amt / Decimal("12.00")
            elif interval == SubscriptionPlan.BillingFrequency.WEEKLY:
                mrr += amt * Decimal("4.33")
            elif interval == SubscriptionPlan.BillingFrequency.DAILY:
                mrr += amt * Decimal("30.00")
        mrr = mrr.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        arr = (mrr * Decimal("12.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # 2. Invoices & Overdue Aggregations
        inv_stats = Invoice.objects.filter(workspace_id=workspace_id).aggregate(
            total_invoices=Count("id"),
            total_outstanding=Sum(
                "outstanding_balance",
                filter=Q(status=Invoice.Status.CONFIRMED, outstanding_balance__gt=0),
            ),
            overdue_count=Count(
                "id",
                filter=Q(
                    status=Invoice.Status.CONFIRMED,
                    outstanding_balance__gt=0,
                    due_date__lt=today,
                ),
            ),
            overdue_amount=Sum(
                "outstanding_balance",
                filter=Q(
                    status=Invoice.Status.CONFIRMED,
                    outstanding_balance__gt=0,
                    due_date__lt=today,
                ),
            ),
        )

        total_invoices = inv_stats["total_invoices"] or 0
        total_outstanding = inv_stats["total_outstanding"] or Decimal("0.00")
        overdue_invoices_count = inv_stats["overdue_count"] or 0
        total_overdue_amount = inv_stats["overdue_amount"] or Decimal("0.00")

        # 3. Payments / Collected Revenue
        pay_stats = Payment.objects.filter(workspace_id=workspace_id).aggregate(
            total_collected=Sum("amount")
        )
        total_collected_revenue = pay_stats["total_collected"] or Decimal("0.00")

        # 4. Recent Cashflow (last 6 calendar months)
        cashflow_trends = []
        current_month_index = today.year * 12 + today.month - 1
        for months_ago in range(5, -1, -1):
            year, month_index = divmod(current_month_index - months_ago, 12)
            month_date = date(year, month_index + 1, 1)
            month_name = month_date.strftime("%b %Y")
            month_payments = Payment.objects.filter(
                workspace_id=workspace_id,
                payment_date__year=month_date.year,
                payment_date__month=month_date.month,
            ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
            cashflow_trends.append({"month": month_name, "amount": serialize_money(month_payments)})

        return Response(
            {
                "status": "success",
                "workspace_id": str(workspace_id),
                "data": {
                    "mrr": serialize_money(mrr),
                    "arr": serialize_money(arr),
                    "total_subscriptions": total_subscriptions,
                    "active_subscriptions": active_subscriptions,
                    "paused_subscriptions": sub_stats["paused_count"] or 0,
                    "quotations_count": sub_stats["quotation_count"] or 0,
                    "closed_subscriptions": sub_stats["closed_count"] or 0,
                    "total_invoices": total_invoices,
                    "total_collected_revenue": serialize_money(total_collected_revenue),
                    "total_outstanding_receivables": serialize_money(total_outstanding),
                    "overdue_invoices_count": overdue_invoices_count,
                    "total_overdue_amount": serialize_money(total_overdue_amount),
                    "cashflow_trends": cashflow_trends,
                },
            }
        )


class DetailedReportsView(TenantScopedMixin, APIView):
    permission_classes = [CanViewWorkspaceReports]

    def get(self, request, workspace_id):
        # Revenue by Plan breakdown
        plans_data = (
            Subscription.objects.filter(workspace_id=workspace_id)
            .values("plan__name")
            .annotate(
                count=Count("id"),
                total_rev=Sum("total_amount"),
            )
            .order_by("-total_rev")
        )

        return Response(
            {
                "status": "success",
                "workspace_id": str(workspace_id),
                "plans_breakdown": list(plans_data),
            }
        )
