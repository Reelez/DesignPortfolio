from django.http import Http404
from rest_framework import viewsets

from apps.projects.models import Category, Project, Tag
from apps.projects.serializers import (
    CategorySerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    TagSerializer,
)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Public, read-only project endpoints.

    `ReadOnlyModelViewSet` structurally forbids write methods (POST/PUT/
    PATCH/DELETE all 405) so no permission bug can open a write path.
    """

    lookup_field = "slug"

    def get_queryset(self):
        queryset = Project.objects.filter(status=Project.Status.PUBLISHED)

        if self.action == "retrieve":
            queryset = queryset.prefetch_related("media_items")
        else:
            category_slug = self.request.query_params.get("category")
            if category_slug:
                queryset = queryset.filter(category__slug=category_slug)

            featured = self.request.query_params.get("featured")
            if featured is not None and featured.lower() == "true":
                queryset = queryset.filter(featured=True)

        return queryset.select_related("category").prefetch_related("tags")

    def get_object(self):
        """Override to support the preview-token bypass on retrieve.

        `?preview=<uuid>` looks the project up by slug + preview_token
        across ALL statuses (draft included). Any missing/malformed/
        mismatched token falls through to the published-only queryset,
        which raises Http404 if there's no match.
        """
        preview_token = self.request.query_params.get("preview")
        slug = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)

        if preview_token:
            try:
                obj = Project.objects.select_related("category").prefetch_related(
                    "tags", "media_items"
                ).get(slug=slug, preview_token=preview_token)
            except (Project.DoesNotExist, ValueError, TypeError):
                raise Http404
            self.check_object_permissions(self.request, obj)
            return obj

        return super().get_object()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    pagination_class = None
