from django.db import models

from apps.common.models import UUIDModel
from apps.projects.models import Project


class MediaItem(UUIDModel):
    class Type(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="media_items",
    )
    type = models.CharField(max_length=8, choices=Type.choices)
    # File is stored via the storage-abstracted default backend (see config/settings/base.py):
    # FileSystemStorage locally, Cloudinary in production. No `storage=` kwarg here on purpose.
    file = models.FileField(upload_to="media_items/")
    thumbnail = models.ImageField(upload_to="thumbnails/", blank=True)
    order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=200)
    caption = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.project.title} - {self.get_type_display()} ({self.order})"
