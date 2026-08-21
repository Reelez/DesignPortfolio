from django.db import models

from apps.common.models import UUIDModel
from apps.media_items.storage import get_video_storage
from apps.projects.models import Project


class VideoAwareFileField(models.FileField):
    """FileField that routes video MediaItems to Bunny.net, images to the
    default storage (Cloudinary/local — see config/settings/base.py).

    Storage choice has to happen in pre_save (before the upload is
    committed), since by the time Model.save() runs the file may already be
    written. Falls back to the default storage if BUNNY_STORAGE_ZONE isn't
    set yet, so video uploads don't break before Bunny credentials exist.
    """

    def pre_save(self, model_instance, add):
        file = getattr(model_instance, self.attname)
        if model_instance.type == MediaItem.Type.VIDEO and file and not file._committed:
            video_storage = get_video_storage()
            if video_storage:
                file.storage = video_storage
        return super().pre_save(model_instance, add)


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
    file = VideoAwareFileField(upload_to="media_items/")
    thumbnail = models.ImageField(upload_to="thumbnails/", blank=True)
    order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=200)
    caption = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.project.title} - {self.get_type_display()} ({self.order})"
