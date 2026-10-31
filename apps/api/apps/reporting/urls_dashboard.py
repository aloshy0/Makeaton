from django.urls import path

from .views import DashboardMetricsView

urlpatterns = [
    path("", DashboardMetricsView.as_view(), name="workspace_dashboard_summary"),
]
