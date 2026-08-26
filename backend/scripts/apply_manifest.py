"""Create Category/Project/MediaItem rows from a manifest.json produced by
upload_to_cloudinary.py. Pure DB writes — no image bytes, no Cloudinary
calls — so this is safe/fast to run against production even over a
less-than-perfect connection (see scripts/upload_to_cloudinary.py for why
upload and DB-write were split into two passes).

Run with:
    python manage.py shell -c "exec(open('scripts/apply_manifest.py', encoding='utf-8').read())"
Reads manifest.json from the current directory; override with MANIFEST_IN.
"""
import json
import os
from pathlib import Path

from apps.media_items.models import MediaItem
from apps.projects.models import Category, Project

MANIFEST_IN = Path(os.environ.get("MANIFEST_IN", "manifest.json"))

manifest = json.loads(MANIFEST_IN.read_text(encoding="utf-8"))

total_projects = 0
total_media = 0

for cat_entry in manifest["categories"]:
    category, _ = Category.objects.update_or_create(
        slug=cat_entry["slug"], defaults={"name": cat_entry["name"]}
    )

    for p in cat_entry["projects"]:
        project, created = Project.objects.update_or_create(
            slug=p["slug"],
            defaults={
                "title": p["title"],
                "category": category,
                "status": Project.Status.PUBLISHED,
                "order": p["order"],
            },
        )
        project.cover_image.name = p["cover_image"]
        project.save(update_fields=["cover_image"])

        project.media_items.all().delete()
        for i, m in enumerate(p["media"]):
            mi = MediaItem(
                project=project,
                type=MediaItem.Type.IMAGE,
                order=i,
                alt_text=m["alt_text"],
            )
            mi.file.name = m["name"]
            mi.save()
            total_media += 1

        total_projects += 1
        verb = "Created" if created else "Updated"
        print(f"  {verb}: {p['title']} ({len(p['media'])} images)")

print(f"Done. Projects touched: {total_projects} | MediaItems created: {total_media}")
