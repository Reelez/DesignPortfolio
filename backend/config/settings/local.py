from .base import *  # noqa: F401,F403
from .base import BASE_DIR, env

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

FRONTEND_BASE_URL = env("FRONTEND_BASE_URL", default="http://localhost:3000")
