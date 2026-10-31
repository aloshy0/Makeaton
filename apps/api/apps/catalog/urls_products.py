from rest_framework.routers import DefaultRouter

from .views import ProductViewSet

router = DefaultRouter()
router.register(r"", ProductViewSet, basename="workspace_product")

urlpatterns = router.urls
