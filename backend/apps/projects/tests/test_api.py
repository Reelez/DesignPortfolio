from rest_framework import status
from rest_framework.test import APITestCase

from apps.media_items.models import MediaItem
from apps.projects.models import Category, Project


class ProjectListApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Branding", slug="branding")
        self.published = Project.objects.create(
            title="Published Project",
            slug="published-project",
            category=self.category,
            status=Project.Status.PUBLISHED,
        )
        self.draft = Project.objects.create(
            title="Draft Project",
            slug="draft-project",
            category=self.category,
            status=Project.Status.DRAFT,
        )

    def test_list_only_returns_published(self):
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [item["slug"] for item in response.data["results"]]
        self.assertIn("published-project", slugs)
        self.assertNotIn("draft-project", slugs)

    def test_draft_detail_returns_404_without_token(self):
        response = self.client.get(f"/api/projects/{self.draft.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_draft_detail_returns_404_with_wrong_token(self):
        response = self.client.get(
            f"/api/projects/{self.draft.slug}/", {"preview": "00000000-0000-0000-0000-000000000000"}
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_draft_detail_returns_200_with_valid_token(self):
        response = self.client.get(
            f"/api/projects/{self.draft.slug}/", {"preview": str(self.draft.preview_token)}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], "draft-project")

    def test_write_methods_rejected(self):
        response = self.client.post("/api/projects/", {"title": "New"})
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.delete(f"/api/projects/{self.published.slug}/")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_detail_includes_nested_media_items(self):
        MediaItem.objects.create(
            project=self.published,
            type=MediaItem.Type.IMAGE,
            alt_text="A sample image",
        )
        response = self.client.get(f"/api/projects/{self.published.slug}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["media_items"]), 1)
        self.assertEqual(response.data["media_items"][0]["alt_text"], "A sample image")

    def test_cors_header_present(self):
        response = self.client.get(
            "/api/projects/", HTTP_ORIGIN="http://localhost:3000"
        )
        self.assertEqual(
            response.get("Access-Control-Allow-Origin"), "http://localhost:3000"
        )
