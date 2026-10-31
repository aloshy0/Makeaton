from rest_framework.routers import DefaultRouter

from .views import SubscriptionPlanViewSet

router = DefaultRouter()
router.register(r"", SubscriptionPlanViewSet, basename="workspace_plan")

urlpatterns = router.urls
