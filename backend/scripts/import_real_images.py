"""Import real portfolio images from a local folder into Project/MediaItem rows.

Source layout expected (see D:\\Pictures\\Portfolio):
    <CATEGORY DIR>/<Project Dir>/<image files>

Each category dir maps to a Category (created if missing). Each project dir
becomes one Project, with its images (sorted by filename) saved as
MediaItem rows; the first image also becomes the Project's cover_image.

Uploads go through the storage-abstracted `ImageField`/`FileField.save()`,
so they land on local disk or Cloudinary automatically depending on whether
CLOUDINARY_URL is set (see config/settings/base.py).

Idempotent: re-running clears and recreates MediaItems for projects it
touches, matched by slug, so new/changed images can be re-imported safely.

Run with:
    python manage.py shell -c "exec(open('scripts/import_real_images.py', encoding='utf-8').read())"
(piping via `shell < script` breaks on nested blocks in the interactive REPL.)
Override the source folder with the PORTFOLIO_IMAGES_DIR env var.
"""
import io
import os
from pathlib import Path

import cloudinary
from django.core.files.base import ContentFile
from django.db import connection
from django.utils.text import slugify
from PIL import Image

# Cloudinary's SDK has no default network timeout, so a stalled upload can
# hang forever instead of failing. Bound it so the per-project retry below
# actually gets a chance to kick in on a flaky connection.
cloudinary.config().timeout = 30

from apps.media_items.models import MediaItem
from apps.projects.models import Category, Project

SOURCE_DIR = Path(os.environ.get("PORTFOLIO_IMAGES_DIR", r"D:\Pictures\Portfolio"))

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Cloudinary's free plan rejects uploads over 10 MB. Camera-original photos
# routinely exceed that, so anything too big gets re-encoded as a
# high-quality JPEG (quality/size stepped down only as far as needed to fit)
# instead of failing the import. Visually lossless, not bit-for-bit —
# see the media-hosting decision memory for why that distinction is fine here.
CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024


def prepare_upload(path: Path) -> tuple[bytes, str]:
    """Returns (bytes, extension) ready to upload, shrinking oversized files."""
    raw = path.read_bytes()
    if len(raw) <= CLOUDINARY_MAX_BYTES:
        return raw, path.suffix.lower()

    img = Image.open(io.BytesIO(raw))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    quality = 92
    scale = 1.0
    while True:
        w, h = img.size
        candidate = img.resize((max(1, int(w * scale)), max(1, int(h * scale)))) if scale < 1.0 else img
        buf = io.BytesIO()
        candidate.save(buf, format="JPEG", quality=quality, optimize=True)
        data = buf.getvalue()
        if len(data) <= CLOUDINARY_MAX_BYTES or (quality <= 60 and scale <= 0.5):
            return data, ".jpg"
        if quality > 60:
            quality -= 8
        else:
            scale *= 0.85

# Maps source category folder name -> (Category name, slug). Reuses the
# slugs already seeded by scripts/seed_demo_data.py where they overlap.
CATEGORY_MAP = {
    "MURALS": ("Murals", "murals"),
    "FINE ARTS": ("Fine Art", "fine-art"),
    "GRAPHIC DESIGN": ("Graphic Design", "graphic-design"),
    "BRAND DESIGN": ("Brand Design", "brand-design"),
    "PRODUCT DESIGN": ("Product Design", "product-design"),
    "WEB DESIGN": ("Web Design", "web-design"),
}


def iter_project_dirs(category_dir: Path):
    for entry in sorted(category_dir.iterdir()):
        if entry.is_dir():
            yield entry


def iter_images(project_dir: Path):
    files = [
        f for f in project_dir.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    ]
    return sorted(files, key=lambda f: f.name.lower())


if not SOURCE_DIR.exists():
    raise SystemExit(f"Source folder not found: {SOURCE_DIR}")

print(f"Importing real images from {SOURCE_DIR}...")

total_projects = 0
total_media = 0

for category_dir_name, (cat_name, cat_slug) in CATEGORY_MAP.items():
    category_dir = SOURCE_DIR / category_dir_name
    if not category_dir.exists():
        print(f"  (skip) category folder not found: {category_dir_name}")
        continue

    project_dirs = list(iter_project_dirs(category_dir))
    if not project_dirs:
        print(f"  (skip) no project folders in: {category_dir_name}")
        continue

    category, _ = Category.objects.update_or_create(
        slug=cat_slug, defaults={"name": cat_name}
    )

    for order, project_dir in enumerate(project_dirs):
        images = iter_images(project_dir)
        if not images:
            print(f"    (skip) no images in: {project_dir}")
            continue

        title = project_dir.name
        slug = f"{cat_slug}-{slugify(title)}"

        # Uploading each image (Cloudinary network round-trip) leaves the DB
        # connection idle in between — long enough over a remote/proxied
        # Postgres connection that it can get dropped mid-import. Retry the
        # whole project (idempotent: delete+recreate) on a stale connection.
        for attempt in range(1, 4):
            try:
                connection.close()  # force a fresh connection for this project

                project, created = Project.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": title,
                        "category": category,
                        "status": Project.Status.PUBLISHED,
                        "order": order,
                    },
                )

                # Clean re-run: drop existing media items before re-importing,
                # so removed/renamed files don't leave stale rows.
                project.media_items.all().delete()

                cover_bytes, cover_ext = prepare_upload(images[0])
                project.cover_image.save(
                    f"{slug}-cover{cover_ext}",
                    ContentFile(cover_bytes, name=images[0].name),
                    save=True,
                )

                media_count = 0
                for i, image_path in enumerate(images):
                    data, ext = prepare_upload(image_path)
                    mi = MediaItem(
                        project=project,
                        type=MediaItem.Type.IMAGE,
                        order=i,
                        alt_text=f"{title} — image {i + 1}",
                    )
                    mi.file.save(
                        f"{slug}-img-{i + 1}{ext}",
                        ContentFile(data, name=image_path.name),
                        save=False,
                    )
                    mi.save()
                    media_count += 1

                total_media += media_count
                total_projects += 1
                verb = "Created" if created else "Updated"
                print(f"    {verb}: {title} ({media_count} images)")
                break
            except Exception as exc:
                connection.close()
                if attempt == 3:
                    print(f"    (FAILED after 3 attempts) {title}: {exc}")
                else:
                    print(f"    (retry {attempt}/3) {title}: {exc}")

print(f"Done. Projects touched: {total_projects} | MediaItems created: {total_media}")
