from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsStaffOrAdmin
from apps.billing.models import Invoice
from apps.payments.models import Payment
from apps.subscriptions.models import Subscription


class DashboardMetricsView(APIView):
    """
    Consolidated Executive Reporting API:
    Designed for sub-2-second response times with database-level aggregations.
    """

    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        today = timezone.now().date()

        # 1. Subscriptions Aggregations
        sub_stats = Subscription.objects.aggregate(
            total_count=Count("id"),
            active_count=Count("id", filter=Q(status=Subscription.Status.ACTIVE)),
            paused_count=Count("id", filter=Q(status=Subscription.Status.PAUSED)),
            quotation_count=Count("id", filter=Q(status=Subscription.Status.QUOTATION)),
            closed_count=Count("id", filter=Q(status=Subscription.Status.CLOSED)),
            active_revenue=Sum("total_amount", filter=Q(status=Subscription.Status.ACTIVE)),
        )

        total_subscriptions = sub_stats["total_count"] or 0
        active_subscriptions = sub_stats["active_count"] or 0

        # Calculate MRR based on active subscriptions billing intervals
        # For performance, calculate via simple aggregation query
        active_subs = Subscription.objects.filter(status=Subscription.Status.ACTIVE).values(
            "plan__billing_frequency", "total_amount"
        )
        mrr = Decimal("0.00")
        for s in active_subs:
            freq = s["plan__billing_frequency"]
            amt = s["total_amount"] or Decimal("0.00")
            if freq == "monthly":
                mrr += amt
            elif freq == "yearly":
                mrr += amt / Decimal("12.00")
            elif freq == "weekly":
                mrr += amt * Decimal("4.33")
            elif freq == "daily":
                mrr += amt * Decimal("30.00")
        mrr = round(mrr, 2)
        arr = round(mrr * Decimal("12.00"), 2)

        # 2. Invoices & Overdue Aggregations
        inv_stats = Invoice.objects.aggregate(
            total_invoices=Count("id"),
            total_outstanding=Sum(
                "outstanding_balance", filter=~Q(status=Invoice.Status.CANCELLED)
            ),
            overdue_count=Count(
                "id",
                filter=Q(
                    status=Invoice.Status.CONFIRMED, outstanding_balance__gt=0, due_date__lt=today
                ),
            ),
            overdue_amount=Sum(
                "outstanding_balance",
                filter=Q(
                    status=Invoice.Status.CONFIRMED, outstanding_balance__gt=0, due_date__lt=today
                ),
            ),
        )

        # 3. Payments Aggregations
        pay_stats = Payment.objects.aggregate(total_collected=Sum("amount"))

        # 4. Revenue Trend (Last 6 months)
        six_months_ago = today.replace(day=1) - timezone.timedelta(days=150)
        recent_payments = Payment.objects.filter(payment_date__gte=six_months_ago).values(
            "payment_date", "amount"
        )

        monthly_map = {}
        for p in recent_payments:
            month_key = p["payment_date"].strftime("%b %Y")
            monthly_map[month_key] = monthly_map.get(month_key, Decimal("0.00")) + p["amount"]

        trend = [{"month": k, "revenue": float(v)} for k, v in monthly_map.items()]
        if not trend:
            # Default empty trend for visualization
            trend = [
                {
                    "month": today.strftime("%b %Y"),
                    "revenue": float(pay_stats["total_collected"] or 0),
                }
            ]

        return Response(
            {
                "kpis": {
                    "active_subscriptions": active_subscriptions,
                    "total_subscriptions": total_subscriptions,
                    "mrr": float(mrr),
                    "arr": float(arr),
                    "total_revenue_collected": float(pay_stats["total_collected"] or 0.00),
                    "total_outstanding": float(inv_stats["total_outstanding"] or 0.00),
                    "overdue_invoices_count": inv_stats["overdue_count"] or 0,
                    "overdue_amount": float(inv_stats["overdue_amount"] or 0.00),
                },
                "status_distribution": {
                    "active": active_subscriptions,
                    "paused": sub_stats["paused_count"] or 0,
                    "quotation": sub_stats["quotation_count"] or 0,
                    "closed": sub_stats["closed_count"] or 0,
                },
                "revenue_trend": trend,
            }
        )
