from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from apps.media_items.models import MediaItem
from apps.projects.models import Category, Project
from apps.site_settings.models import SiteSettings


class ProjectSlugUniquenessTests(TestCase):
    def test_duplicate_slug_rejected(self):
        category = Category.objects.create(name="Branding", slug="branding")
        Project.objects.create(title="First", slug="dup-slug", category=category)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Project.objects.create(title="Second", slug="dup-slug", category=category)


class ProjectDefaultOrderingTests(TestCase):
    def test_projects_ordered_by_order_ascending(self):
        category = Category.objects.create(name="Branding", slug="branding")
        p2 = Project.objects.create(title="B", slug="b", category=category, order=2)
        p1 = Project.objects.create(title="A", slug="a", category=category, order=1)
        p3 = Project.objects.create(title="C", slug="c", category=category, order=3)

        ordered = list(Project.objects.all())
        self.assertEqual(ordered, [p1, p2, p3])


class MediaItemAltTextRequiredTests(TestCase):
    def test_alt_text_required(self):
        category = Category.objects.create(name="Branding", slug="branding")
        project = Project.objects.create(title="A", slug="a", category=category)
        media_item = MediaItem(project=project, type=MediaItem.Type.IMAGE, alt_text="")

        with self.assertRaises(ValidationError):
            media_item.full_clean(exclude=["file"])


class SiteSettingsSingletonTests(TestCase):
    def test_second_instance_reuses_existing_pk(self):
        first = SiteSettings.objects.create(
            bio="Bio one",
            contact_email="a@example.com",
            seo_title="Title",
            seo_description="Description",
        )
        second = SiteSettings(
            bio="Bio two",
            contact_email="b@example.com",
            seo_title="Title 2",
            seo_description="Description 2",
        )
        second.save()

        self.assertEqual(SiteSettings.objects.count(), 1)
        self.assertEqual(second.pk, first.pk)
        self.assertEqual(SiteSettings.objects.first().bio, "Bio two")
