import os

import redis
from django.db import connection
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_data = {
            "status": "healthy",
            "database": "unknown",
            "redis": "unknown",
            "environment": os.getenv("ENVIRONMENT", "development"),
        }

        # Check database
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            status_data["database"] = "connected"
        except Exception as e:
            status_data["database"] = f"error: {e!s}"
            status_data["status"] = "degraded"

        # Check redis
        try:
            r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=1)
            r.ping()
            status_data["redis"] = "connected"
        except Exception:
            status_data["redis"] = "disconnected"

        return Response(status_data)
