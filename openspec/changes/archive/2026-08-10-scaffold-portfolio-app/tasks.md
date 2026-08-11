# Tasks: Scaffold Portfolio App

Delivery: 4 chained PRs, stacked-to-main (each merges to main before the next starts). Backend-first ordering. Legend: `[P]` = can run in parallel within its slice; unmarked = sequential/depends on a prior item in the same slice.

Resolved open questions (applied directly, not re-asked):
- `Project.description` → plain Django `TextField(blank=True)`, no rich-text/WYSIWYG in v1.
- `FRONTEND_BASE_URL` → required env var, present in `.env.example`, `local.py` (default `http://localhost:3000`), and `production.py` (no default, must be set); used to build `{FRONTEND_BASE_URL}/portfolio/{slug}?preview={token}` in the admin `preview_url` field.

---

## Slice 1 — Django skeleton, models, migrations, admin

**PR risk flag:** this slice is migration-heavy (design.md explicitly calls this out). Estimated 300–500 changed lines; initial migrations for 5 models across 3 apps can push it past the 400-line budget. **`size:exception` may be needed for this PR** — if the migration diff alone exceeds budget, request the exception up front in the PR description rather than splitting models mid-flight (splitting models across PRs breaks FK ordering and migration dependency graphs).

- [x] Initialize repo hygiene: `.gitignore` (Python, Node, `.env`, `db.sqlite3`, media/static dirs), `README.md` stub — Req: (scaffold, no spec req)
- [x] Write `.env.example` with `DJANGO_SECRET_KEY`, `DJANGO_SETTINGS_MODULE`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL`, `CLOUDINARY_URL`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`, `FRONTEND_BASE_URL` — Req: Environment-Gated Storage Backend (RA08), Draft Preview Token (note: filesystem sandbox blocked writing/renaming dotfiles matching `.env*`; content lives at root `env.example` — rename to `.env.example` manually, see apply-progress.md)
- [x] Scaffold `backend/` Django project (`manage.py`, `config/` package) via `django-admin startproject`, wire `DJANGO_SETTINGS_MODULE` default to `config.settings.local` in `manage.py`/`wsgi.py` — Req: (infra)
- [x] Add `requirements.txt`: `django`, `djangorestframework`, `django-environ`, `django-cors-headers`, `cloudinary`, `django-cloudinary-storage`, `Pillow` — Req: Environment-Gated Storage Backend (RA08)
- [x] Create `config/settings/base.py`: `INSTALLED_APPS` (contrib + `rest_framework`, `corsheaders`, `cloudinary`, `cloudinary_storage`, `apps.projects`, `apps.media_items`, `apps.site_settings`), middleware with `CorsMiddleware` first, `ROOT_URLCONF`, `REST_FRAMEWORK` dict, i18n/tz, `DEFAULT_AUTO_FIELD`, `SECRET_KEY = env("DJANGO_SECRET_KEY")`, `MEDIA_ROOT`, `STATIC_*` — Req: (infra)
- [x] Add storage gate to `base.py`: `CLOUDINARY_URL = env("CLOUDINARY_URL", default="")`; `if CLOUDINARY_URL:` set `STORAGES["default"]` to `MediaCloudinaryStorage`, else `FileSystemStorage` + `MEDIA_URL = "/media/"` — Req: Environment-Gated Storage Backend (RA08)
- [x] Create `config/settings/local.py`: `DEBUG=True`, `ALLOWED_HOSTS=["localhost","127.0.0.1"]`, SQLite at `BASE_DIR/db.sqlite3`, `CORS_ALLOWED_ORIGINS=["http://localhost:3000"]`, console email backend, `FRONTEND_BASE_URL = env("FRONTEND_BASE_URL", default="http://localhost:3000")` — Req: CORS for Local Frontend
- [x] Create `config/settings/production.py`: `DEBUG=False`, `ALLOWED_HOSTS=env.list(...)`, `DATABASES` from `env.db("DATABASE_URL")`, `CORS_ALLOWED_ORIGINS=env.list(...)`, `SECURE_SSL_REDIRECT`, HSTS, `SECURE_PROXY_SSL_HEADER`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_BASE_URL = env("FRONTEND_BASE_URL")` (required, no default) — Req: (infra)
- [x] Create `apps/common/models.py` with abstract `UUIDModel` (`id = UUIDField(primary_key=True, default=uuid.uuid4, editable=False)`) — Req: (shared, used by all UUID-PK requirements)
- [x] `[P]` Scaffold `apps/projects` app (`apps.py`, `models.py`, `admin.py`, `migrations/`): `Category`, `Tag`, `Project` models per design.md §2, `description` as plain `TextField(blank=True)` — Req: Project Entity, Category and Tag Entities, Draft Preview Token
- [x] `[P]` Scaffold `apps/media_items` app: `MediaItem` model with FK to `Project`, `type` choices (`image`/`video`, no embed-URL field), required `alt_text`, `order` — Req: MediaItem Entity
- [x] `[P]` Scaffold `apps/site_settings` app: `SiteSettings` model with singleton enforcement in `save()` — Req: SiteSettings Singleton
- [x] Register `Category`, `Tag`, `Project` (with `MediaItem` as inline) in `apps/projects/admin.py`; make `order` editable in list view — Req: Project CRUD and Media Inline (RA02-RA04, RA06)
- [x] Add read-only `preview_url` field to `ProjectAdmin` rendering `{FRONTEND_BASE_URL}/portfolio/{slug}?preview={token}`, plus a `Regenerate preview link` admin action — Req: Draft Preview Token
- [x] Register `SiteSettings` in admin with `has_add_permission` returning `False` when a row exists (singleton form only) — Req: SiteSettings Editable (RA07)
- [x] Generate initial migrations for all 3 apps (`makemigrations`) — Req: Project Entity, MediaItem Entity, Category and Tag Entities, SiteSettings Singleton (⚠ largest contributor to PR line count — flag in PR body if `size:exception` is needed)
- [x] Verify `python manage.py migrate` runs clean on a fresh SQLite DB — Req: (verification, no new spec req)
- [ ] Manual check: create superuser, log into `/admin`, confirm anonymous request to `/admin` redirects to login — Req: Authenticated Admin Access (RA01) — NOT run (interactive step, requires `createsuperuser` prompts and a running dev server per apply instructions; left as manual step in README)
- [ ] Manual check: create a Project + inline MediaItem, confirm slug uniqueness constraint and default `order` ascending listing — Req: Slug uniqueness enforced, Default ordering — NOT run (requires running admin UI interactively; model-level constraints verified structurally via `manage.py check` + clean migration instead)

---

## Slice 2 — DRF read-only API, preview endpoint, CORS, test scaffolding

Depends on Slice 1 merged to main. This slice also introduces the project's test runner (`python manage.py test`) — Standard Mode applies until this task completes, then strict TDD status should be re-evaluated by `sdd-apply`/`sdd-init` tooling if applicable.

- [x] Add `REST_FRAMEWORK` settings: `DEFAULT_PERMISSION_CLASSES = [AllowAny]`, `DEFAULT_PAGINATION_CLASS = PageNumberPagination`, `PAGE_SIZE = 24` in `base.py` — Req: Read-Only Project Endpoints (RF01-RF03) (already present from Slice 1 base.py)
- [x] `[P]` Write `apps/projects/serializers.py`: `CategorySerializer`, `TagSerializer`, `ProjectListSerializer` (id, title, slug, category, cover_image url, featured, order, project_date, tags — no media items), `ProjectDetailSerializer` (list fields + description, client_name, nested `media_items`) — Req: Read-Only Project Endpoints, Category/Tag/SiteSettings Endpoints
- [x] `[P]` Write `apps/media_items/serializers.py`: `MediaItemSerializer` (id, type, `file_url` via `SerializerMethodField`, `thumbnail_url`, order, alt_text, caption); nested-only, not routed standalone — Req: MediaItem Entity
- [x] `[P]` Write `apps/site_settings/serializers.py`: `SiteSettingsSerializer` (bio, profile_photo, social links, contact_email, seo_title, seo_description) — Req: SiteSettings Editable (RA07), Category/Tag/SiteSettings Endpoints
- [x] Write `apps/projects/views.py`: `ProjectViewSet(ReadOnlyModelViewSet)` with `lookup_field="slug"`; `get_queryset()` filters `status=published`, supports `?category=<slug>` and `?featured=true`; `select_related("category").prefetch_related("tags")` on list, `+ prefetch_related("media_items")` on detail; `get_serializer_class()` switches list/detail serializer — Req: Read-Only Project Endpoints (RF01-RF03), Default ordering
- [x] Override `get_object()` on `ProjectViewSet` for `?preview=<uuid>`: look up by `slug` + `preview_token` across all statuses when present; otherwise use published queryset; malformed/missing/mismatched token → 404 — Req: Draft Preview Token (valid token bypass, missing/wrong token rejected)
- [x] Write `CategoryViewSet`/`TagViewSet` (`ReadOnlyModelViewSet`, list-only is fine) — Req: Category, Tag Entities; Category/Tag/SiteSettings Endpoints
- [x] Write `SiteSettingsView` (custom `APIView`/`ListAPIView` returning the single object, not paginated) — Req: SiteSettings endpoint returns bio
- [x] Wire `apps/*/urls.py` + root `config/urls.py`: `/api/projects/`, `/api/projects/<slug>/`, `/api/categories/`, `/api/tags/`, `/api/site-settings/` — Req: Read-Only Project Endpoints, Category/Tag/SiteSettings Endpoints
- [x] Add `django-cors-headers` config confirmation (middleware already added in Slice 1; verify `CORS_ALLOWED_ORIGINS` from `local.py` is honored) — Req: CORS for Local Frontend (confirmed via `test_cors_header_present`)
- [x] Confirm `ReadOnlyModelViewSet` structurally rejects `POST`/`PUT`/`DELETE` with 405 (no extra permission code needed) — Req: Write attempt rejected
- [x] Introduce test scaffolding: `apps/projects/tests/__init__.py`, `apps/projects/tests/test_models.py` (slug uniqueness, default ordering, `alt_text` required, SiteSettings singleton via `full_clean()`) — Req: Slug uniqueness enforced, Default ordering, Alt text required, Second instance blocked
- [x] `apps/projects/tests/test_api.py`: published-only filter, draft excluded from list, draft 404 without token, 200 with valid token, write → 405, nested media items present in detail response, CORS header present on a sample response — Req: Draft excluded from public list, Missing or wrong token rejected, Valid token bypasses draft filter, Write attempt rejected, Frontend fetch succeeds
- [x] Confirm `python manage.py test` runs green locally and document it as the project test command (README + note for future TDD tooling) — Req: (test infra, no single spec req) — 11/11 tests pass

---

## Slice 3 — Next.js scaffold + typed API client

Depends on Slice 2 merged to main (frontend needs a live API to point at, though it can be built against a stub base URL first).

- [x] Bootstrap `frontend/` via `create-next-app` (TypeScript, App Router, Tailwind, ESLint) — Req: Structural Routes (RF01-RF04, RF06)
- [x] `[P]` Create placeholder route files: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/portfolio/page.tsx`, `app/portfolio/[slug]/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` (no data wiring yet — Slice 4) — Req: Structural Routes (RF01-RF04, RF06)
- [x] `[P]` Configure `tailwind.config.ts` with minimal content paths; theme tokens (fonts, editorial spacing/color scale) via `@theme` in `globals.css` — Req: (styling infra) (Tailwind v4 template uses `@import "tailwindcss"` + `@theme inline` in `globals.css`, no separate `tailwind.config.ts` file generated by this create-next-app version — CSS-based config confirmed working via `npm run build`)
- [x] Add `NEXT_PUBLIC_API_BASE_URL` to `.env.example` (frontend section) and read it in `lib/api/client.ts` — Req: Frontend fetch succeeds (already present in root `env.example` from Slice 1; documented in README frontend setup)
- [x] Write `lib/api/client.ts`: `fetchJson<T>(path, init)` wrapper, base URL from `NEXT_PUBLIC_API_BASE_URL`, typed `ApiError` thrown on non-2xx, defaults to `{ next: { revalidate: 60 } }` — Req: Portfolio grid renders API data
- [x] Write `lib/api/types.ts`: `Project`, `ProjectDetail`, `MediaItem`, `Category`, `Tag`, `SiteSettings`, `Paginated<T>` mirroring DRF serializer field names (snake_case, no mapping layer) — Req: (typed contract, supports all frontend reqs)
- [x] `[P]` Write `lib/api/projects.ts`: `getProjects(params)`, `getProjectBySlug(slug, previewToken?)` (forces `cache: "no-store"` when `previewToken` present) — Req: Portfolio grid renders API data, Category filter, Draft Preview Token (frontend side)
- [x] `[P]` Write `lib/api/site.ts`: `getSiteSettings()`, `getCategories()` — Req: SiteSettings endpoint returns bio, Category referenced by multiple projects
- [x] Verify `npm run build` succeeds (clean production build) and each placeholder route compiles/renders without errors — Req: (verification) (all 5 routes + `/_not-found` built successfully; `npm run dev` not run per apply instructions to avoid a hanging background process)

---

## Slice 4 — Page implementations wired to real API

Depends on Slice 3 merged to main.

- [x] `[P]` Build `components/Nav.tsx`, `components/Footer.tsx` — Req: (shell, supports all routes)
- [x] Build `app/page.tsx` (Home) using `getProjects({ featured: true })` for a featured-projects grid — Req: Structural Routes (RF01-RF04, RF06) (design listed `getSiteSettings()`; Home actually needed the featured-projects list, so `getProjects({ featured: true })` was used instead — backend already supports `?featured=true` from Slice 2, see deviation note in apply-progress.md)
- [x] `[P]` Build `components/ProjectCard.tsx`, `components/Grid.tsx`, `components/CategoryFilter.tsx` — Req: Portfolio grid renders API data, Category filter (all server components; `CategoryFilter` uses `<Link>`-based query-param navigation, no client JS needed for filtering — see deviation note)
- [x] Build `app/portfolio/page.tsx` using `getProjects()` + `getCategories()`, wired to `CategoryFilter` — Req: Portfolio grid renders API data, Category filter
- [x] `[P]` Build `components/Gallery.tsx` (image render + inline-playable video via plain `<video controls>`) — Req: Project detail gallery
- [x] Build `app/portfolio/[slug]/page.tsx` using `getProjectBySlug(slug, searchParams.preview)`, forcing `no-store` when `preview` present, `notFound()` on 404 — Req: Project detail gallery, Draft Preview Token (valid token bypass)
- [x] Build `app/about/page.tsx` using `getSiteSettings()` — Req: Structural Routes (RF01-RF04, RF06)
- [x] Build `app/contact/page.tsx`: render contact form UI fields only, no submission handler wired to any backend endpoint — Req: Contact Form UI Only (RF06), Form present, no submission handler
- [ ] Manual check: verify responsive layout at mobile and desktop breakpoints for all 5 routes — Req: Structural Routes (RF01-RF04, RF06) — NOT run (requires interactive `npm run dev` + visual inspection, out of scope per apply instructions which explicitly said not to run `npm run dev`; layout uses standard Tailwind responsive utility classes (`sm:`/`lg:` grid breakpoints) but visual confirmation is deferred)
- [ ] Manual check: confirm draft preview link from admin (`{FRONTEND_BASE_URL}/portfolio/{slug}?preview={token}`) renders the draft project; wrong/missing token shows 404 — Req: Valid token bypasses draft filter, Missing or wrong token rejected — NOT run (requires interactive `runserver` + `npm run dev` end-to-end; backend-side preview-token logic already covered by Slice 2's passing test suite, and the frontend `getProjectBySlug`/`notFound()` wiring was verified structurally via `npm run build` with a live-but-empty backend, not an actual draft project)

---

## Review Workload Forecast

| Slice | Est. changed lines | 400-line budget risk | Chained PR | Decision needed before apply |
|---|---|---|---|---|
| 1 | 300–500+ (migrations included) | **High** — flagged explicitly in design.md; initial migrations for 5 models/3 apps likely push past 400 | Yes (PR #1, merges to main first) | **Yes** — confirm `size:exception` up front if migration diff exceeds budget; do not split models across PRs to dodge the count |
| 2 | 300–450 | Medium — serializers + views + tests across 3 apps | Yes (PR #2, targets main after #1 merges) | No — proceed, monitor diff size during apply |
| 3 | 250–400 | Low-Medium — mostly scaffolded boilerplate from `create-next-app`, some auto-generated | Yes (PR #3, targets main after #2 merges) | No |
| 4 | 300–450 | Medium — 5 pages + several components | Yes (PR #4, targets main after #3 merges) | No |

Chained PRs already decided (stacked-to-main); this forecast is informational for `sdd-apply` batching and PR-size monitoring, not a re-ask of delivery strategy. Slice 1 is the only slice where a `size:exception` conversation may be needed before or during apply.
