from django.conf import settings
from django.contrib import admin, messages

from apps.media_items.models import MediaItem

from .models import Category, Project, Tag


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "slug")


class MediaItemInline(admin.TabularInline):
    model = MediaItem
    extra = 1
    fields = ("type", "file", "thumbnail", "order", "alt_text", "caption")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "featured", "order")
    list_editable = ("order",)
    list_filter = ("status", "category", "featured")
    search_fields = ("title", "slug", "client_name")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    readonly_fields = ("preview_url",)
    inlines = [MediaItemInline]
    actions = ["regenerate_preview_link"]

    fieldsets = (
        (None, {
            "fields": (
                "title", "slug", "category", "tags", "description",
                "cover_image", "status", "order", "featured",
                "client_name", "project_date",
            )
        }),
        ("Preview", {"fields": ("preview_url",)}),
    )

    @admin.display(description="Preview URL")
    def preview_url(self, obj):
        if not obj.pk:
            return "-"
        return f"{settings.FRONTEND_BASE_URL}/portfolio/{obj.slug}?preview={obj.preview_token}"

    @admin.action(description="Regenerate preview link")
    def regenerate_preview_link(self, request, queryset):
        import uuid

        updated = 0
        for project in queryset:
            project.preview_token = uuid.uuid4()
            project.save(update_fields=["preview_token"])
            updated += 1
        self.message_user(
            request,
            f"Regenerated preview token for {updated} project(s).",
            level=messages.SUCCESS,
        )
