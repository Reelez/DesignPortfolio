from django.contrib import admin

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fields = (
        "bio", "profile_photo", "instagram_url", "behance_url",
        "linkedin_url", "contact_email", "seo_title", "seo_description",
    )

    def has_add_permission(self, request):
        # Only allow adding the first row; once one exists, edit-only via change form.
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
