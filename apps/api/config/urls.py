from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from apps.billing.views import BillingRunView, DiscountRuleViewSet, InvoiceViewSet, TaxRuleViewSet
from apps.catalog.views import ProductVariantViewSet, ProductViewSet, SubscriptionPlanViewSet
from apps.customers.views import CustomerViewSet
from apps.payments.views import PaymentViewSet
from apps.quotations.views import QuotationTemplateLineViewSet, QuotationTemplateViewSet
from apps.reporting.views import DashboardMetricsView
from apps.subscriptions.views import SubscriptionLineViewSet, SubscriptionViewSet
from config.views import HealthCheckView

router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"catalog/products", ProductViewSet, basename="product")
router.register(r"catalog/variants", ProductVariantViewSet, basename="variant")
router.register(r"catalog/plans", SubscriptionPlanViewSet, basename="plan")
router.register(r"quotations/templates", QuotationTemplateViewSet, basename="quotation-template")
router.register(
    r"quotations/template-lines", QuotationTemplateLineViewSet, basename="quotation-template-line"
)
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")
router.register(r"subscriptions/lines", SubscriptionLineViewSet, basename="subscription-line")
router.register(r"billing/taxes", TaxRuleViewSet, basename="tax-rule")
router.register(r"billing/discounts", DiscountRuleViewSet, basename="discount-rule")
router.register(r"billing/invoices", InvoiceViewSet, basename="invoice")
router.register(r"payments", PaymentViewSet, basename="payment")

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI 3 Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # Health Check
    path("api/v1/health/", HealthCheckView.as_view(), name="health-check"),
    # Authentication & Accounts
    path("api/v1/auth/", include("apps.accounts.urls")),
    # Specialized Business Actions
    path("api/v1/billing/run/", BillingRunView.as_view(), name="billing-run"),
    path("api/v1/reporting/dashboard/", DashboardMetricsView.as_view(), name="reporting-dashboard"),
    # REST Resource Router
    path("api/v1/", include(router.urls)),
]
