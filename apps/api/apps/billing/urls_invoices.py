from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import InvoiceViewSet, TriggerBillingRunView

router = DefaultRouter()
router.register(r"", InvoiceViewSet, basename="workspace_invoice")

urlpatterns = [
    path("trigger-run/", TriggerBillingRunView.as_view(), name="trigger_billing_run"),
] + router.urls
