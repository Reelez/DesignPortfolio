"""Upload real portfolio images to Cloudinary and write a JSON manifest —
no database access at all (works with any DJANGO_SETTINGS_MODULE, local or
production; only CLOUDINARY_URL needs to be set).

Why this exists: writing DB rows AND uploading images in the same pass
against the production Postgres proxy kept dying mid-import (flaky public
proxy connection). Splitting upload (this script) from DB writes
(apply_manifest.py) means the slow/heavy network work (image bytes) never
has to survive alongside a fragile remote DB connection — only the tiny
JSON manifest this script produces needs to reach production.

Resumable: manifest.json is written after every project (not just at the
end), and a project already present in it is skipped on the next run — a
killed/crashed run only redoes work from the point it stopped, since a
home upload connection can stall on an arbitrary file for no clear reason.

Source layout expected (see D:\\Pictures\\Portfolio):
    <CATEGORY DIR>/<Project Dir>/<image files>

Run with:
    python manage.py shell -c "exec(open('scripts/upload_to_cloudinary.py', encoding='utf-8').read())"
Writes manifest.json in the current directory. Override source folder with
PORTFOLIO_IMAGES_DIR, output path with MANIFEST_OUT.
"""
import io
import json
import os
from pathlib import Path

import cloudinary
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.utils.text import slugify
from PIL import Image

cloudinary.config().timeout = 60

SOURCE_DIR = Path(os.environ.get("PORTFOLIO_IMAGES_DIR", r"D:\Pictures\Portfolio"))
MANIFEST_OUT = Path(os.environ.get("MANIFEST_OUT", "manifest.json"))
# Comma-separated subset of CATEGORY_MAP keys, e.g. "MURALS" — for quick
# canary runs before committing to the full ~130-image upload.
CATEGORY_FILTER = os.environ.get("CATEGORY_FILTER")
# Cap new projects processed per invocation, then exit cleanly. Throughput
# was observed to degrade the longer a single process stayed alive (fast at
# first, crawling after a while) — looping fresh processes from the shell
# avoids whatever that is, at the cost of Django/Cloudinary re-init overhead
# per project (a few seconds, negligible next to multi-minute uploads).
MAX_PROJECTS_PER_RUN = int(os.environ.get("MAX_PROJECTS_PER_RUN", "0")) or None

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
CLOUDINARY_MAX_BYTES = 10 * 1024 * 1024

CATEGORY_MAP = {
    "MURALS": ("Murals", "murals"),
    "FINE ARTS": ("Fine Art", "fine-art"),
    "GRAPHIC DESIGN": ("Graphic Design", "graphic-design"),
    "BRAND DESIGN": ("Brand Design", "brand-design"),
    "PRODUCT DESIGN": ("Product Design", "product-design"),
    "WEB DESIGN": ("Web Design", "web-design"),
}


def prepare_upload(path: Path) -> tuple[bytes, str]:
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


def upload_one(path: Path, folder: str, base_name: str) -> dict:
    """Retries a single file's upload a few times before giving up on it."""
    data, ext = prepare_upload(path)
    last_exc = None
    for attempt in range(1, 4):
        try:
            name = default_storage.save(f"{folder}/{base_name}{ext}", ContentFile(data))
            return {"name": name}
        except Exception as exc:  # noqa: BLE001 — any network hiccup, retry
            last_exc = exc
            print(f"      (retry {attempt}/3 on {path.name}) {exc}", flush=True)
    raise last_exc


if not SOURCE_DIR.exists():
    raise SystemExit(f"Source folder not found: {SOURCE_DIR}")

if MANIFEST_OUT.exists():
    manifest = json.loads(MANIFEST_OUT.read_text(encoding="utf-8"))
else:
    manifest = {"categories": []}

done_slugs = {
    p["slug"]
    for cat in manifest["categories"]
    for p in cat["projects"]
}
if done_slugs:
    print(f"Resuming — {len(done_slugs)} project(s) already in manifest, will skip those.", flush=True)

cat_by_slug = {c["slug"]: c for c in manifest["categories"]}


def save_manifest():
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


print(f"Uploading images from {SOURCE_DIR} to Cloudinary...", flush=True)

active_categories = CATEGORY_MAP
if CATEGORY_FILTER:
    wanted = {c.strip() for c in CATEGORY_FILTER.split(",")}
    active_categories = {k: v for k, v in CATEGORY_MAP.items() if k in wanted}

processed_this_run = 0
hit_limit = False

for category_dir_name, (cat_name, cat_slug) in active_categories.items():
    if hit_limit:
        break
    category_dir = SOURCE_DIR / category_dir_name
    if not category_dir.exists():
        print(f"  (skip) category folder not found: {category_dir_name}", flush=True)
        continue

    project_dirs = list(iter_project_dirs(category_dir))
    if not project_dirs:
        print(f"  (skip) no project folders in: {category_dir_name}", flush=True)
        continue

    cat_entry = cat_by_slug.get(cat_slug)
    if cat_entry is None:
        cat_entry = {"name": cat_name, "slug": cat_slug, "projects": []}
        manifest["categories"].append(cat_entry)
        cat_by_slug[cat_slug] = cat_entry

    for order, project_dir in enumerate(project_dirs):
        images = iter_images(project_dir)
        if not images:
            print(f"    (skip) no images in: {project_dir}", flush=True)
            continue

        title = project_dir.name
        slug = f"{cat_slug}-{slugify(title)}"

        if slug in done_slugs:
            print(f"    (already done, skipping) {title}", flush=True)
            continue

        print(f"    {title}: uploading cover...", flush=True)
        cover = upload_one(images[0], "covers", f"{slug}-cover")
        print(f"    {title}: cover done -> {cover['name']}", flush=True)

        media_names = []
        for i, image_path in enumerate(images):
            m = upload_one(image_path, "media_items", f"{slug}-img-{i + 1}")
            media_names.append({"name": m["name"], "alt_text": f"{title} — image {i + 1}"})
            print(f"    {title}: image {i + 1}/{len(images)} -> {m['name']}", flush=True)

        cat_entry["projects"].append(
            {
                "title": title,
                "slug": slug,
                "order": order,
                "cover_image": cover["name"],
                "media": media_names,
            }
        )
        done_slugs.add(slug)
        save_manifest()
        print(f"    Uploaded: {title} ({len(media_names)} images)", flush=True)

        processed_this_run += 1
        if MAX_PROJECTS_PER_RUN and processed_this_run >= MAX_PROJECTS_PER_RUN:
            hit_limit = True
            break

if hit_limit:
    print(f"Stopping after {processed_this_run} project(s) this run (MAX_PROJECTS_PER_RUN). Re-run to continue.", flush=True)
else:
    print(f"Done. Manifest written to {MANIFEST_OUT.resolve()}", flush=True)
