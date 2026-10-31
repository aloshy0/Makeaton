from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from config.views import HealthCheckView, HealthLiveView, HealthReadyView

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI 3 Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # Operational Health Probes
    path("api/v1/health/", HealthCheckView.as_view(), name="health_check"),
    path("api/v1/health/live/", HealthLiveView.as_view(), name="health_live"),
    path("api/v1/health/ready/", HealthReadyView.as_view(), name="health_ready"),
    # Global Authentication & Account Routes
    path("api/v1/auth/", include("apps.accounts.urls")),
    # Multi-Tenant Workspaces (and all workspace-scoped modules)
    path("api/v1/workspaces/", include("apps.workspaces.urls")),
    # Staff Invitation Acceptance
    path("api/v1/invitations/", include("apps.invitations.urls")),
]
