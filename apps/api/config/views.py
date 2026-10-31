import os

import redis
from django.db import connection
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthLiveView(APIView):
    """
    Application process liveness probe.
    Returns HTTP 200 if the process is responsive.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "live"}, status=status.HTTP_200_OK)


class HealthReadyView(APIView):
    """
    Application readiness probe.
    Verifies that required backing services (database and redis) are accessible.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        readiness = {
            "status": "ready",
            "database": "unknown",
            "redis": "unknown",
        }
        all_ready = True

        # Check database
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            readiness["database"] = "connected"
        except Exception as e:
            readiness["database"] = f"error: {e!s}"
            readiness["status"] = "not_ready"
            all_ready = False

        # Check redis
        try:
            r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=1)
            r.ping()
            readiness["redis"] = "connected"
        except Exception:
            readiness["redis"] = "disconnected"

        http_status = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(readiness, status=http_status)


class HealthCheckView(APIView):
    """
    Consolidated health inspection endpoint.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_data = {
            "status": "healthy",
            "database": "unknown",
            "redis": "unknown",
            "environment": os.getenv("ENVIRONMENT", "development"),
        }

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            status_data["database"] = "connected"
        except Exception as e:
            status_data["database"] = f"error: {e!s}"
            status_data["status"] = "degraded"

        try:
            r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=1)
            r.ping()
            status_data["redis"] = "connected"
        except Exception:
            status_data["redis"] = "disconnected"

        return Response(status_data)
