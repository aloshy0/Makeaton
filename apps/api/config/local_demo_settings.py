"""Isolated SQLite settings for a local FlowGrid presentation/demo database.

Keep this opt-in module separate from the default PostgreSQL-backed settings so
local rehearsals never write to the configured application database.
"""

import os
import tempfile
from pathlib import Path

from .settings import *  # noqa: F403

DATABASES = {  # noqa: F405
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.environ.get(
            "FLOWGRID_SQLITE_DB",
            str(Path(tempfile.gettempdir()) / "flowgrid-teacher-demo.sqlite3"),
        ),
    }
}
CORS_ALLOWED_ORIGINS = list(CORS_ALLOWED_ORIGINS) + ["http://localhost:3002"]  # noqa: F405
ALLOWED_HOSTS = list(ALLOWED_HOSTS) + ["localhost", "127.0.0.1"]  # noqa: F405
