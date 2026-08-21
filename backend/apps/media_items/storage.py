"""Bunny.net storage gate for video MediaItems (see models.py:VideoAwareFileField).

Mirrors the Cloudinary gate in config/settings/base.py: active only when the
BUNNY_STORAGE_ZONE env var is set, otherwise callers fall back to whatever
the default storage is (local disk or Cloudinary) so video import/upload
doesn't break before Bunny credentials exist.
"""
from functools import lru_cache

from django.conf import settings


@lru_cache(maxsize=1)
def get_video_storage():
    if not settings.BUNNY_STORAGE_ZONE:
        return None

    from django_bunny.storage import BunnyStorage

    return BunnyStorage(
        username=settings.BUNNY_STORAGE_ZONE,
        password=settings.BUNNY_STORAGE_PASSWORD,
        region=settings.BUNNY_STORAGE_REGION,
        hostname=settings.BUNNY_PULL_ZONE_HOSTNAME or None,
    )
