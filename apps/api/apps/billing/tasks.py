import logging
from decimal import Decimal

from celery import shared_task
from django.utils import timezone

from apps.billing.engine import run_automated_billing_cycle
from apps.billing.models import Invoice
from apps.workspaces.models import Workspace

logger = logging.getLogger(__name__)


@shared_task
def generate_recurring_invoices_task(workspace_id=None):
    """
    Scheduled task to bill due subscriptions across active workspaces.
    """
    today = timezone.now().date()
    if workspace_id:
        workspaces = Workspace.objects.filter(id=workspace_id, is_active=True)
    else:
        workspaces = Workspace.objects.filter(is_active=True)

    total_generated = 0
    for ws in workspaces:
        res = run_automated_billing_cycle(workspace_id=ws.id, target_date=today)
        total_generated += res["generated_count"]
        logger.info(
            "Billing cycle completed for workspace %s: %s invoices generated",
            ws.name,
            res["generated_count"],
        )

    return {"total_generated": total_generated, "date": str(today)}


@shared_task
def detect_overdue_invoices_task(workspace_id=None):
    """
    Identifies confirmed invoices past their due date with open balances.
    """
    today = timezone.now().date()
    qs = Invoice.objects.filter(
        status=Invoice.Status.CONFIRMED,
        due_date__lt=today,
        outstanding_balance__gt=Decimal("0.00"),
    )
    if workspace_id:
        qs = qs.filter(workspace_id=workspace_id)

    overdue_count = qs.count()
    logger.info("Found %s overdue invoices as of %s", overdue_count, today)
    return {"overdue_count": overdue_count, "date": str(today)}
