from rest_framework.routers import DefaultRouter

from .views import PaymentViewSet

router = DefaultRouter()
router.register(r"", PaymentViewSet, basename="workspace_payment")

urlpatterns = router.urls
