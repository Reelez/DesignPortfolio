# Design: Scaffold Portfolio App (Fase 1 + start of Fase 2)

## Technical Approach

Layered monorepo. Django owns the domain and is the only writer; DRF exposes a read-only projection; Next.js is a pure consumer. Environment differences (DB, storage, CORS, debug) are resolved **exclusively at the settings layer** — no domain or view code branches on environment. Delivery is 4 stacked-to-main PRs, backend-first.

```
Next.js (App Router, RSC fetch)
        │  GET /api/... (JSON, read-only)
        ▼
DRF ReadOnlyModelViewSets ── serializers ── Django ORM ── SQLite | Postgres
        ▲                                        │
Django Admin (session auth, writer)              ▼
                                    FileSystemStorage | Cloudinary
```

---

## 1. Settings Split

`backend/config/settings/{base,local,production}.py`, `django-environ` reads root `.env`. `DJANGO_SETTINGS_MODULE` defaults to `config.settings.local` in `manage.py`/`wsgi.py`.

| File | Contains |
|---|---|
| `base.py` | `INSTALLED_APPS` (django contrib, `rest_framework`, `corsheaders`, `cloudinary`, `cloudinary_storage`, `apps.projects`, `apps.media_items`, `apps.site_settings`), middleware (`corsheaders.middleware.CorsMiddleware` first), `ROOT_URLCONF`, templates, `REST_FRAMEWORK` dict, i18n/tz, `DEFAULT_AUTO_FIELD`, `SECRET_KEY = env("DJANGO_SECRET_KEY")`, `MEDIA_ROOT`, `STATIC_*`, and the storage gate (§3). |
| `local.py` | `DEBUG=True`, `ALLOWED_HOSTS=["localhost","127.0.0.1"]`, SQLite `BASE_DIR/db.sqlite3`, `CORS_ALLOWED_ORIGINS=["http://localhost:3000"]`, console email backend. |
| `production.py` | `DEBUG=False`, `ALLOWED_HOSTS=env.list("DJANGO_ALLOWED_HOSTS")`, `DATABASES={"default": env.db("DATABASE_URL")}`, `CORS_ALLOWED_ORIGINS=env.list("CORS_ALLOWED_ORIGINS")`, `SECURE_SSL_REDIRECT`, HSTS, `SECURE_PROXY_SSL_HEADER`, `CSRF_TRUSTED_ORIGINS`. |

Env vars (`.env.example`): `DJANGO_SECRET_KEY`, `DJANGO_SETTINGS_MODULE`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`, `CLOUDINARY_URL`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`.

---

## 2. Models

Shared base in `backend/apps/common/models.py`:

```python
class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class Meta:
        abstract = True
```

| Model | Fields | Meta |
|---|---|---|
| `Category` (projects) | `name: CharField(80)`, `slug: SlugField(unique=True)` | `ordering=["name"]`, `verbose_name_plural="Categories"` |
| `Tag` (projects) | `name: CharField(50)`, `slug: SlugField(unique=True)` | `ordering=["name"]` |
| `Project` (projects) | `title: CharField(160)`, `slug: SlugField(unique=True, db_index=True)`, `category: FK(Category, on_delete=PROTECT, related_name="projects")`, `description: TextField(blank=True)`, `cover_image: ImageField(upload_to="covers/", blank=True)`, `status: CharField(16, choices=Status, default=DRAFT, db_index=True)`, `order: PositiveIntegerField(default=0, db_index=True)`, `featured: BooleanField(default=False, db_index=True)`, `tags: M2M(Tag, blank=True, related_name="projects")`, `client_name: CharField(120, blank=True)`, `project_date: DateField(null=True, blank=True)`, `preview_token: UUIDField(default=uuid.uuid4, editable=False, unique=True)`, `created_at/updated_at: DateTimeField(auto_now_add/auto_now)` | `ordering=["order","-created_at"]` |
| `MediaItem` (media_items) | `project: FK(Project, on_delete=CASCADE, related_name="media_items")`, `type: CharField(8, choices=[image,video])`, `file: FileField(upload_to="media_items/")`, `thumbnail: ImageField(upload_to="thumbnails/", blank=True)`, `order: PositiveIntegerField(default=0)`, `alt_text: CharField(200)` (required, `blank=False`), `caption: CharField(255, blank=True)` | `ordering=["order","id"]` |
| `SiteSettings` (site_settings) | `bio: TextField`, `profile_photo: ImageField(blank=True)`, `contact_email: EmailField`, `instagram_url/behance_url/linkedin_url: URLField(blank=True)`, `seo_title: CharField(70)`, `seo_description: CharField(160)` | singleton via `pk` guard in `save()` + `has_add_permission` false when a row exists |

`file_url`/`thumbnail_url` from the PRD are **derived**, not stored: serializers emit `obj.file.url`, which resolves to a local path or a Cloudinary CDN URL depending on the active storage. This keeps the PRD's API contract while avoiding a denormalized URL column that would break on backend swap.

---

## 3. Storage Gate (settings-only)

In `base.py`:

```python
CLOUDINARY_URL = env("CLOUDINARY_URL", default="")
if CLOUDINARY_URL:
    STORAGES = {"default": {"BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"}, ...}
else:
    STORAGES = {"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"}, ...}
    MEDIA_URL = "/media/"
```

Model fields declare **no** `storage=` argument, so they bind to the default storage at runtime. Application code never imports Cloudinary. Swapping to R2/S3 later = one `STORAGES["default"]` line. (Django 5 `STORAGES`; `DEFAULT_FILE_STORAGE` is the deprecated equivalent.)

---

## 4. Draft Preview Token

- **Field**: `Project.preview_token = UUIDField(default=uuid.uuid4, editable=False, unique=True)`. Generated by the field default at instantiation — no signal, no `save()` override. Rotate by clearing/regenerating via an admin action (`Regenerate preview link`).
- **View**: a single `ProjectViewSet(ReadOnlyModelViewSet)` with `lookup_field="slug"`. `get_queryset()` returns `status=published`. `get_object()` is overridden: if `?preview=<uuid>` is present, look the project up by `slug` **and** `preview_token` across all statuses; otherwise use the published queryset. Any mismatch, malformed UUID, or missing token falls through to `Http404`.
- **List** never honors `preview`; drafts are only reachable by exact slug + token (unguessable, non-enumerable).
- **Admin**: read-only `preview_url` field on the Project change form rendering `{FRONTEND_URL}/portfolio/{slug}?preview={token}`.

---

## 5. DRF Shape

- All viewsets are `ReadOnlyModelViewSet` (structurally forbids writes → 405, satisfying the spec without permission gymnastics). Global `DEFAULT_PERMISSION_CLASSES = [AllowAny]`, `DEFAULT_PAGINATION_CLASS = PageNumberPagination`, `PAGE_SIZE = 24`.
- `ProjectListSerializer`: id, title, slug, category (nested `CategorySerializer`), cover_image url, featured, order, project_date, tags. **No** media items (keeps grid payload small).
- `ProjectDetailSerializer`: all list fields + description, client_name, `media_items = MediaItemSerializer(many=True, read_only=True)`. Selected via `get_serializer_class()` on action.
- `MediaItemSerializer`: id, type, `file_url` (`SerializerMethodField` → absolute URL), `thumbnail_url`, order, alt_text, caption. Not routed standalone — nested only.
- Routes (`/api/`): `projects/` (filters `?category=<slug>`, `?featured=true` via `django-filter` or manual `get_queryset` params), `projects/<slug>/`, `categories/`, `tags/`, `site-settings/` (custom `APIView`/`ListAPIView` returning the single object, not paginated).
- Queryset hygiene: `select_related("category").prefetch_related("tags")` on list; `+ prefetch_related("media_items")` on detail.

---

## 6. Frontend Architecture

```
frontend/
├─ app/
│  ├─ layout.tsx, globals.css, page.tsx              # /
│  ├─ portfolio/page.tsx                             # /portfolio
│  ├─ portfolio/[slug]/page.tsx                      # /portfolio/[slug]
│  ├─ about/page.tsx, contact/page.tsx
├─ components/                                       # Grid, ProjectCard, Gallery, CategoryFilter, Nav, Footer
├─ lib/api/
│  ├─ client.ts        # fetchJson<T>(path, init) wrapper: base URL, next.revalidate, error normalization
│  ├─ projects.ts      # getProjects(params), getProject(slug, previewToken?)
│  ├─ site.ts          # getSiteSettings(), getCategories()
│  └─ types.ts         # Project, ProjectDetail, MediaItem, Category, Tag, SiteSettings, Paginated<T>
└─ tailwind.config.ts  # theme tokens (fonts, editorial spacing/color scale)
```

- `client.ts` reads `process.env.NEXT_PUBLIC_API_BASE_URL`, throws a typed `ApiError` on non-2xx, and defaults to `{ next: { revalidate: 60 } }`.
- `types.ts` mirrors DRF serializer field names one-to-one (snake_case preserved) — no mapping layer in v1.
- Pages are **Server Components** fetching directly; only `CategoryFilter` and the video player are `"use client"`. `/portfolio/[slug]` reads `searchParams.preview` and forwards it to `getProject`, forcing `cache: "no-store"` when present.
- Tailwind v4: theme tokens live in `globals.css` via `@theme`; `tailwind.config.ts` kept minimal for content paths only.

---

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Preview mechanism | Persistent per-project `UUID` field | `django.core.signing.TimestampSigner` | Spec requires a stored `preview_token`; signed tokens need a secret-stable expiry policy and can't be revoked per project. UUID is revocable by regeneration and trivially testable. Expiry is not a v1 requirement. |
| Media URLs | Derived from `FileField.url` | Stored `file_url` CharField (PRD §7 literal) | A stored URL hard-codes the storage backend into the data and breaks on backend swap; derived URLs keep the same JSON contract. |
| Write protection | `ReadOnlyModelViewSet` | `ModelViewSet` + permissions | Structural safety beats configuration; no permission bug can open a write path. |
| Env switching | Settings-level `STORAGES`/`DATABASES` gate | Factory/adapter module in app code | Django already provides the abstraction seam; a custom adapter is duplicate indirection. |
| Category FK delete | `PROTECT` | `CASCADE` / `SET_NULL` | Deleting a category must never silently delete a portfolio project. |
| UUID PK | `UUIDField(primary_key=True, default=uuid.uuid4, editable=False)` | BigAutoField | PRD §7; non-enumerable IDs on a public API. |

---

## Data Flow — Draft Preview

```
Admin (draft) ──copies preview link──▶ /portfolio/slug?preview=<uuid>
                                              │
                            Next.js RSC (no-store) ──▶ GET /api/projects/<slug>/?preview=<uuid>
                                              │
                          ProjectViewSet.get_object(): slug + preview_token, any status
                                              │
                          match → 200 detail          mismatch → 404
```

---

## PR Slices (stacked-to-main, 4 PRs)

| # | Slice | Lands |
|---|---|---|
| 1 | Repo hygiene + Django skeleton + models/migrations + admin | `.gitignore`, `README.md`, `.env.example`, `backend/manage.py`, `requirements.txt`, `config/settings/{base,local,production}.py`, `config/urls.py`, `config/wsgi.py`, `apps/common/models.py`, `apps/{projects,media_items,site_settings}/{models,admin,apps}.py` + initial migrations |
| 2 | Public read API + preview endpoint + CORS | `apps/*/serializers.py`, `apps/*/views.py`, `apps/*/urls.py`, `config/urls.py` (modify), `REST_FRAMEWORK`/CORS settings, `apps/projects/tests/test_api.py` (published filter, draft 404, valid-token 200) |
| 3 | Next.js scaffold + typed API client | `frontend/` bootstrap (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`), `lib/api/{client,types,projects,site}.ts`, placeholder route files for the 5 paths |
| 4 | Page implementations wired to real data | `app/page.tsx`, `app/portfolio/page.tsx`, `app/portfolio/[slug]/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `components/*` |

Each slice is independently runnable and revertible: 1 → admin works; 2 → API answers; 3 → frontend boots; 4 → pages render live data. Estimated 300–500 changed lines per slice; slice 1 is the migration-heavy one and may need `size:exception` if generated migrations push it over budget.

---

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit | Slug uniqueness, default ordering, `alt_text` required, SiteSettings singleton | Django `TestCase` + `full_clean()` |
| Integration | Draft excluded from list, draft 404 without token, 200 with token, write → 405, nested media in detail, CORS header | DRF `APITestCase` |
| Manual | Admin login redirect, inline media upload, local file storage, responsive breakpoints | Checklist in each PR body |

No test runner is configured yet — Slice 2 introduces `python manage.py test` as the project's test command; Standard Mode applies until then.

## Migration / Rollout

Greenfield. Initial migrations only; no data migration. Cloudinary and Postgres paths remain unexercised until Fase 5 — accepted and tracked as a known risk.

## Open Questions

- [ ] `FRONTEND_URL` for admin preview links: env var (`FRONTEND_BASE_URL`) assumed; confirm default `http://localhost:3000`.
- [ ] Rich-text for `description`: plain `TextField` in v1 (no editor dependency). Confirm this is acceptable versus adding a WYSIWYG in Fase 3.
