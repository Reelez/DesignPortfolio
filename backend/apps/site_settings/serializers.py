from rest_framework import serializers

from apps.site_settings.models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "bio",
            "profile_photo",
            "instagram_url",
            "behance_url",
            "linkedin_url",
            "contact_email",
            "seo_title",
            "seo_description",
        ]
