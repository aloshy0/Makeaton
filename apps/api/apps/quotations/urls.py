from rest_framework.routers import DefaultRouter

from .views import QuotationViewSet

router = DefaultRouter()
router.register(r"", QuotationViewSet, basename="workspace_quotation")

urlpatterns = router.urls
