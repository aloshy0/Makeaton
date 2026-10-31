from rest_framework.routers import DefaultRouter

from .views import TaxRuleViewSet

router = DefaultRouter()
router.register(r"", TaxRuleViewSet, basename="workspace_tax_rule")

urlpatterns = router.urls
