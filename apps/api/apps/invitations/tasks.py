import logging

from celery import shared_task
from django.utils import timezone

from apps.invitations.models import StaffInvitation

logger = logging.getLogger(__name__)


@shared_task
def expire_stale_invitations_task():
    """
    Finds pending staff invitations that exceeded their 72-hour validity and marks them EXPIRED.
    """
    now = timezone.now()
    updated_count = StaffInvitation.objects.filter(
        status=StaffInvitation.Status.PENDING,
        expires_at__lte=now,
    ).update(status=StaffInvitation.Status.EXPIRED)

    logger.info("Expired %s stale invitations", updated_count)
    return {"expired_count": updated_count}
