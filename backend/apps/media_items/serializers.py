from rest_framework import serializers

from apps.media_items.models import MediaItem


class MediaItemSerializer(serializers.ModelSerializer):
    """Nested-only serializer; not routed standalone.

    `file_url`/`thumbnail_url` are derived from the storage-abstracted
    `FileField`/`ImageField` `.url` property rather than stored columns, so
    the API contract stays stable across FileSystemStorage <-> Cloudinary.
    """

    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaItem
        fields = [
            "id",
            "type",
            "file_url",
            "thumbnail_url",
            "order",
            "alt_text",
            "caption",
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return None
        return self._absolute(obj.file.url)

    def get_thumbnail_url(self, obj):
        # Fall back to the main file URL when no dedicated thumbnail was
        # uploaded (e.g. local dev without a Cloudinary transformation).
        if obj.thumbnail:
            return self._absolute(obj.thumbnail.url)
        return self.get_file_url(obj)

    def _absolute(self, url):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url
