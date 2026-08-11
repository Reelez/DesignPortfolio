"""One-off local dev seed script — creates sample categories, projects, and media.

Run with: python manage.py shell < scripts/seed_demo_data.py
Safe to re-run: clears existing demo rows first (matched by slug) before recreating them.
"""
import io
import random

from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont

from apps.media_items.models import MediaItem
from apps.projects.models import Category, Project, Tag
from apps.site_settings.models import SiteSettings

PALETTE = [
    (233, 69, 96), (15, 52, 96), (83, 52, 131),
    (0, 173, 181), (247, 183, 51), (34, 40, 49),
]


def make_placeholder_image(label: str, size=(1200, 800)) -> ContentFile:
    color = random.choice(PALETTE)
    img = Image.new("RGB", size, color=color)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 64)
    except OSError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), label, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size[0] - w) / 2, (size[1] - h) / 2), label, fill="white", font=font)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return ContentFile(buf.getvalue(), name=f"{label.lower().replace(' ', '-')}.jpg")


def get_sample_video_bytes() -> bytes:
    path = r"C:\Users\relez\AppData\Local\Temp\claude\D--Documents-PROYECTS-DESIGN-PORTFOLIO\45194284-a267-4f40-9d22-477ec98d50b5\scratchpad\sample.mp4"
    with open(path, "rb") as f:
        return f.read()


VIDEO_BYTES = get_sample_video_bytes()

CATEGORIES = [
    ("Murals", "murals"),
    ("Fine Art", "fine-art"),
    ("Graphic Design", "graphic-design"),
    ("Brand Design", "brand-design"),
]

TAGS = ["acrylic", "digital", "client-work", "personal", "outdoor"]

PROJECTS = [
    {
        "title": "Coastal Mural",
        "slug": "coastal-mural",
        "category": "murals",
        "description": "A large-scale mural inspired by coastal wildlife, painted with exterior acrylic.",
        "featured": True,
        "status": Project.Status.PUBLISHED,
        "client_name": "City Council",
        "n_images": 3,
        "n_videos": 1,
    },
    {
        "title": "Portrait Series",
        "slug": "portrait-series",
        "category": "fine-art",
        "description": "A series of oil portraits exploring identity and memory.",
        "featured": True,
        "status": Project.Status.PUBLISHED,
        "client_name": "",
        "n_images": 4,
        "n_videos": 0,
    },
    {
        "title": "Andina Coffee Identity",
        "slug": "andina-coffee-identity",
        "category": "brand-design",
        "description": "Full brand system for a coffee shop chain: logo, packaging, and signage.",
        "featured": False,
        "status": Project.Status.PUBLISHED,
        "client_name": "Andina Coffee",
        "n_images": 3,
        "n_videos": 0,
    },
    {
        "title": "Sonoro Festival Poster",
        "slug": "sonoro-festival-poster",
        "category": "graphic-design",
        "description": "Poster and supporting graphics for an independent music festival.",
        "featured": False,
        "status": Project.Status.DRAFT,
        "client_name": "Sonoro Festival",
        "n_images": 2,
        "n_videos": 1,
    },
]

print("Seeding categories...")
categories = {}
for name, slug in CATEGORIES:
    cat, _ = Category.objects.update_or_create(slug=slug, defaults={"name": name})
    categories[slug] = cat

print("Seeding tags...")
tags = {}
for name in TAGS:
    tag, _ = Tag.objects.update_or_create(slug=name, defaults={"name": name.capitalize()})
    tags[name] = tag

print("Seeding site settings...")
SiteSettings.objects.update_or_create(
    contact_email="hello@example.com",
    defaults={
        "bio": "Visual artist and designer specializing in murals, fine art, and brand design.",
        "instagram_url": "https://instagram.com/example",
        "behance_url": "https://behance.net/example",
        "linkedin_url": "https://linkedin.com/in/example",
        "seo_title": "Portfolio — Visual Artist",
        "seo_description": "Portfolio of murals, fine art, graphic design, and brand design.",
    },
)

print("Seeding projects + media...")
for i, p in enumerate(PROJECTS):
    Project.objects.filter(slug=p["slug"]).delete()  # clean re-run
    project = Project.objects.create(
        title=p["title"],
        slug=p["slug"],
        category=categories[p["category"]],
        description=p["description"],
        status=p["status"],
        featured=p["featured"],
        order=i,
        client_name=p["client_name"],
    )
    project.cover_image.save(
        f"{p['slug']}-cover.jpg",
        make_placeholder_image(p["title"]),
        save=True,
    )
    project.tags.add(random.choice(list(tags.values())))

    order = 0
    for n in range(p["n_images"]):
        mi = MediaItem(
            project=project,
            type=MediaItem.Type.IMAGE,
            order=order,
            alt_text=f"{p['title']} — imagen {n + 1}",
        )
        mi.file.save(
            f"{p['slug']}-img-{n + 1}.jpg",
            make_placeholder_image(f"{p['title']} {n + 1}"),
            save=False,
        )
        mi.save()
        order += 1

    for n in range(p["n_videos"]):
        mi = MediaItem(
            project=project,
            type=MediaItem.Type.VIDEO,
            order=order,
            alt_text=f"{p['title']} — video {n + 1}",
        )
        mi.file.save(
            f"{p['slug']}-video-{n + 1}.mp4",
            ContentFile(VIDEO_BYTES, name=f"{p['slug']}-video-{n + 1}.mp4"),
            save=False,
        )
        mi.save()
        order += 1

    print(f"  - {project.title}: {order} media items")

print("Done. Projects:", Project.objects.count(), "| MediaItems:", MediaItem.objects.count())
