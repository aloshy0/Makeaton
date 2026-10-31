from django.urls import path

from .views import (
    PortalInvoicesView,
    PortalMeView,
    PortalOffersView,
    PortalPaymentsView,
    PortalSubscriptionsView,
)

urlpatterns = [
    path("me/", PortalMeView.as_view(), name="portal_me"),
    path("subscriptions/", PortalSubscriptionsView.as_view(), name="portal_subscriptions"),
    path("offers/", PortalOffersView.as_view(), name="portal_offers"),
    path("invoices/", PortalInvoicesView.as_view(), name="portal_invoices"),
    path("payments/", PortalPaymentsView.as_view(), name="portal_payments"),
]
