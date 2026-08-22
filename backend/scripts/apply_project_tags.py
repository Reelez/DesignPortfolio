"""Tag every project with a slug/name derived from its own title.

Project titles already mirror the source folder name they were imported
from (see import_real_images.py — `title = project_dir.name`), e.g. the
Drizzle project's title is literally "Drizzle". This gives each project a
tag matching that folder name, scoped by category (slug is
`<category-slug>-<slugified-title>` to avoid collisions between same-named
folders in different categories, e.g. "DearDads" under both Murals and
Product Design). The portfolio filter dropdown reads these tags per
category, so selecting one narrows the collage to just that project's
images.

Idempotent: get_or_create + tags.set(), safe to re-run.

Run with:
    python manage.py shell -c "exec(open('scripts/apply_project_tags.py', encoding='utf-8').read())"
"""
from django.utils.text import slugify

from apps.projects.models import Project, Tag

total = 0
for project in Project.objects.select_related("category").all():
    tag_slug = f"{project.category.slug}-{slugify(project.title)}"
    tag, _ = Tag.objects.get_or_create(
        slug=tag_slug, defaults={"name": project.title}
    )
    project.tags.set([tag])
    total += 1
    print(f"  {project.category.slug}: {project.title} -> tag '{tag.name}' ({tag.slug})")

print(f"Done. Tagged {total} projects.")
