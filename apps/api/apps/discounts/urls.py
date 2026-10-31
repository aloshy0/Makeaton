from rest_framework.routers import DefaultRouter

from .views import DiscountRuleViewSet

router = DefaultRouter()
router.register(r"", DiscountRuleViewSet, basename="workspace_discount_rule")

urlpatterns = router.urls
