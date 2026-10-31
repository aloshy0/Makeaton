from rest_framework.routers import DefaultRouter

from .views import QuotationTemplateViewSet

router = DefaultRouter()
router.register(r"", QuotationTemplateViewSet, basename="workspace_quotation_template")

urlpatterns = router.urls
