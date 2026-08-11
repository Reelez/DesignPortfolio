from rest_framework import serializers

from apps.media_items.serializers import MediaItemSerializer
from apps.projects.models import Category, Project, Tag


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class ProjectListSerializer(serializers.ModelSerializer):
    """Grid/list payload — intentionally excludes media items to stay small."""

    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "cover_image",
            "featured",
            "order",
            "project_date",
            "tags",
        ]


class ProjectDetailSerializer(ProjectListSerializer):
    media_items = MediaItemSerializer(many=True, read_only=True)

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + [
            "description",
            "client_name",
            "media_items",
        ]
