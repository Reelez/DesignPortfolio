from rest_framework.generics import RetrieveAPIView

from apps.site_settings.models import SiteSettings
from apps.site_settings.serializers import SiteSettingsSerializer


class SiteSettingsView(RetrieveAPIView):
    """Returns the single SiteSettings row, not paginated, not list-shaped."""

    serializer_class = SiteSettingsSerializer
    pagination_class = None

    def get_object(self):
        return SiteSettings.objects.first()
