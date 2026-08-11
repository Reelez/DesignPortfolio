# Proposal: Scaffold Portfolio App (Fase 1 + start of Fase 2)

## Intent

Nothing exists but the PRD. The owner cannot publish or manage work, and no code foundation exists to build on. This change creates the runnable full-stack skeleton: a Django admin the owner can use to manage projects/media, a read-only public API, and a Next.js frontend wired to that API. Local development must work with zero external accounts (no Postgres, no Cloudinary).

## Scope

### In Scope
- Monorepo root hygiene: `.gitignore`, `README.md`, `.env.example`.
- Django 5.x project with split settings and three apps: `projects`, `media_items`, `site_settings` (models + migrations).
- Django Admin customization covering RA01-RA08 (inlines, ordering, draft/published, singleton settings).
- DRF read-only public endpoints: projects list/detail-by-slug, categories, tags, site settings; CORS for `localhost:3000`.
- Storage abstraction with Cloudinary backend gated by `CLOUDINARY_URL`, FileSystemStorage fallback.
- Next.js 14+ App Router + TS + Tailwind scaffold with typed API client and routes: `/`, `/portfolio`, `/portfolio/[slug]`, `/about`, `/contact` (structural, not visually polished).

### Out of Scope
- Contact form email delivery + captcha (RF05 backend) — Fase 2 change.
- Custom admin panel / JWT auth — Fase 3.
- SEO, sitemap, analytics, Lighthouse tuning (RF07 partial, RF08 polish) — Fase 4.
- Deploy to Render/Vercel/Supabase — Fase 5.
- Visual design fidelity to the reference site.

## Capabilities

### New Capabilities
- `portfolio-content-model`: Project, Category, Tag, MediaItem, SiteSettings entities and invariants.
- `admin-content-management`: authenticated admin CRUD, media upload, ordering, publish state.
- `public-content-api`: read-only DRF endpoints exposing published content.
- `media-storage`: environment-gated storage backend abstraction.
- `public-site-shell`: Next.js routes consuming the public API.

### Modified Capabilities
- None (greenfield).

## Locked Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Monorepo `/backend` + `/frontend` in one repo | PRD §13; single history, atomic cross-stack changes, solo dev |
| 2 | Split settings; SQLite + FileSystemStorage local, Postgres + Cloudinary only in `production.py` via `DATABASE_URL` / `CLOUDINARY_URL` | Dev works with no accounts/credentials; prod parity kept behind env gates |
| 3 | Django session auth for `/admin` only | Frontend is read-only public; JWT is unjustified complexity until a custom panel exists (RA01) |
| 4 | App boundaries `projects` / `media_items` / `site_settings` | Screaming-architecture boundaries; media storage concerns isolated from domain |

## Approach

Backend first, bottom-up: settings skeleton → models + migrations → admin → serializers/read-only viewsets → `.env.example`. Then frontend scaffold with a typed fetch client against the running API, verified end-to-end with seeded local data. Storage is injected via a `DEFAULT_FILE_STORAGE` setting so swapping Cloudinary for R2/S3 later touches one module.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/config/settings/` | New | `base.py`, `local.py`, `production.py` |
| `backend/apps/projects/` | New | Project, Category, Tag + admin + API |
| `backend/apps/media_items/` | New | MediaItem + storage abstraction |
| `backend/apps/site_settings/` | New | SiteSettings singleton |
| `frontend/app/` | New | App Router routes + API client |
| repo root | New | `.gitignore`, `README.md`, `.env.example` |

## Acceptance Criteria (PRD mapping)

- [ ] RA01: `/admin` requires login; anonymous access redirects.
- [ ] RA02: Project create/edit/delete works from admin.
- [ ] RA03: Multiple MediaItems attachable per project via inline upload.
- [ ] RA04: `order` field on Project and MediaItem drives listing order.
- [ ] RA05: `draft` projects are excluded from all public API responses; `published` appear.
- [ ] RA06: Category and Tag manageable from admin.
- [ ] RA07: SiteSettings (bio, photo, socials, contact email, SEO meta) editable from admin, exposed via API.
- [ ] RA08: Uploads route through Cloudinary when `CLOUDINARY_URL` is set; local files otherwise (optimization verified in Fase 5 env).
- [ ] RF01/RF02: `/` and `/portfolio` render live API data, including a category filter.
- [ ] RF03: `/portfolio/[slug]` renders gallery with images and inline-playable video.
- [ ] RF04: `/about` renders SiteSettings bio content.
- [ ] RF06: Layout is responsive at mobile and desktop breakpoints (structural, unpolished).
- [ ] Accessibility: `alt_text` required on MediaItem at the model level.
- [ ] Fresh clone runs `python manage.py migrate && runserver` and `npm run dev` with no external services.

Deferred criteria: RF05, RF07, RF08 (full).

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Cloudinary path untested locally | High | Interface-level tests + explicit env-gate; verify in Fase 5 |
| SQLite/Postgres divergence (JSONField, constraints) | Med | Avoid Postgres-only features in Fase 1 models |
| Python PATH not persisted | Med | `sdd-apply` re-verifies `python --version` before Django commands |
| Scope creep into visual polish | Med | Frontend acceptance is structural data-binding only |

## Review Workload Forecast

Two full project scaffolds in one change. Estimated 1500-3000 changed lines across ~40 files.
- **Chained PRs recommended: Yes**
- **400-line budget risk: High**
- **Decision needed before apply: Yes**

Suggested slices: (1) repo hygiene + Django settings skeleton; (2) models + migrations + admin; (3) DRF read API + CORS; (4) Next.js scaffold + API client + routes.

## Rollback Plan

Greenfield with no commits yet. Per-slice rollback = revert that slice's commit/PR. Full rollback = delete `backend/` and `frontend/` and reset to the pre-scaffold commit; no data migration or external state to unwind (local SQLite file and media folder are gitignored).

## Dependencies

- Python 3.12 + pip on PATH; Node 24 + npm 11 (confirmed in exploration).
- No external accounts required for this change.

## Success Criteria

- [ ] Fresh clone reaches a running admin and a running frontend with no external services.
- [ ] All in-scope RA/RF criteria above pass manual verification.
- [ ] Swapping storage or database requires changing only settings/env, not domain code.
