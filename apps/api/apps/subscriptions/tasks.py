import logging

from celery import shared_task
from django.utils import timezone

from apps.subscriptions.models import Subscription

logger = logging.getLogger(__name__)


@shared_task
def process_subscription_renewals_and_expirations_task(workspace_id=None):
    """
    Evaluates contract expiry dates:
    - Auto-closes subscriptions if policy `auto_close_on_end` is True.
    - Transitions to EXPIRED if contract ended without auto-close.
    """
    today = timezone.now().date()
    qs = Subscription.objects.filter(
        status=Subscription.Status.ACTIVE,
        expiry_date__lte=today,
    ).select_related("plan")

    if workspace_id:
        qs = qs.filter(workspace_id=workspace_id)

    closed_count = 0
    expired_count = 0

    for sub in qs:
        if sub.plan.auto_close_on_end:
            sub.transition_to(
                Subscription.Status.CLOSED,
                reason="Automatic closure upon reaching contract expiry date.",
            )
            closed_count += 1
        else:
            sub.transition_to(
                Subscription.Status.EXPIRED,
                reason="Contract period expired.",
            )
            expired_count += 1

    return {
        "closed_count": closed_count,
        "expired_count": expired_count,
        "date": str(today),
    }
