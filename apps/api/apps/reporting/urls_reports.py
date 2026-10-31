from django.urls import path

from .views import DetailedReportsView

urlpatterns = [
    path("", DetailedReportsView.as_view(), name="workspace_detailed_reports"),
]
