from django.db import models

from apps.common.models import UUIDModel


class SiteSettings(UUIDModel):
    """Singleton model holding portfolio-wide bio, socials, and SEO metadata.

    Enforced as a singleton via `save()` (only one row is ever allowed) and
    via `has_add_permission` in the admin (see apps/site_settings/admin.py).
    """

    bio = models.TextField()
    profile_photo = models.ImageField(upload_to="profile/", blank=True)
    instagram_url = models.URLField(blank=True)
    behance_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    contact_email = models.EmailField()
    seo_title = models.CharField(max_length=70)
    seo_description = models.CharField(max_length=160)

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def save(self, *args, **kwargs):
        # Force a single row: reuse the first existing row's pk if one already exists,
        # so any "new" instance overwrites the singleton instead of creating a second row.
        existing = self.__class__.objects.exclude(pk=self.pk).first()
        if existing is not None:
            self.pk = existing.pk
            # Django 5 skips the UPDATE-then-INSERT probe for new (`_state.adding`)
            # instances whose pk field has a default (our UUID pk always does),
            # forcing an INSERT even though we just reassigned `pk` to an existing
            # row. `force_update=True` makes it take the UPDATE path instead.
            kwargs["force_update"] = True
        super().save(*args, **kwargs)

    def __str__(self):
        return "Site Settings"
