import logging

from celery import shared_task
from django.db.models import F, Q
from django.utils import timezone

from apps.discounts.models import DiscountRule

logger = logging.getLogger(__name__)


@shared_task
def deactivate_expired_discount_rules_task():
    """
    Deactivates discount rules that reached end_date or met max_uses limit.
    """
    today = timezone.now().date()
    updated = (
        DiscountRule.objects.filter(
            is_active=True,
        )
        .filter(
            Q(end_date__lt=today) | (Q(max_uses__isnull=False) & Q(times_used__gte=F("max_uses")))
        )
        .update(is_active=False)
    )

    logger.info("Deactivated %s expired or exhausted discount rules", updated)
    return {"deactivated_count": updated}
