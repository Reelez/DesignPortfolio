# Exploration: Scaffold brand-new full-stack portfolio app from PRD

## Current State
Repo initialized (`git init` done), empty except `PRD_Portafolio_Personal.md` and `.atl/`. No `requirements.txt`, `manage.py`, `package.json`, `/backend` or `/frontend` folders. Python 3.12 + pip confirmed working (session PATH only — not yet persisted system-wide). Node v24 / npm 11 available.

## PRD Gap Check (sections 7-9)
Data model and functional requirements are unambiguous enough to scaffold directly for Fase 1. Four decisions the proposal should lock in:

1. **Auth (RA01)**: Django built-in session auth for `/admin` in v1 — no JWT needed since frontend is read-only public. Defer JWT to a hypothetical Fase 3 custom panel.
2. **Monorepo vs separate repos**: monorepo, `/backend` + `/frontend` top-level folders in this single git repo.
3. **Cloudinary now vs stub**: install `django-cloudinary-storage` and wire storage abstraction now, but gate real Cloudinary calls behind `CLOUDINARY_URL` env var; fall back to Django `FileSystemStorage` when unset.
4. **PostgreSQL now vs local dev fallback**: SQLite locally via split settings modules, Postgres only in production settings.

Non-blocking notes:
- `order` fields: plain `IntegerField` + `Meta.ordering` sufficient for MVP; bulk-reorder endpoint (RA04) is a later concern.
- Contact form email delivery (RF05): deferred to Fase 2, not part of backend scaffold.

## Recommended Repo Layout

```
DESIGN PORTFOLIO/
├── .env.example
├── .gitignore
├── README.md
├── PRD_Portafolio_Personal.md
├── .atl/
├── openspec/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── local.py        # SQLite + local media storage
│   │   │   └── production.py   # Postgres + Cloudinary
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
│       ├── projects/           # Project, Category, Tag models + admin + DRF viewsets
│       ├── media_items/        # MediaItem model + admin + storage abstraction
│       └── site_settings/      # SiteSettings singleton model + admin
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── app/                    # App Router: home, portfolio, project/[slug], about, contact
```

## Scaffolding Order (MVP-first, Fase 1 -> start of Fase 2)

1. `.gitignore`, root `README.md`
2. Backend project (`config/settings/{base,local,production}.py`), `requirements.txt` (Django 5.x, djangorestframework, django-cloudinary-storage, django-environ, django-cors-headers, psycopg2-binary as prod-only)
3. Apps: `projects` (Project, Category, Tag), `media_items` (MediaItem + storage field), `site_settings` (singleton)
4. Django Admin customization satisfying RA01-RA08
5. DRF serializers + read-only viewsets/routers for public GET endpoints
6. `.env.example`
7. Frontend: `create-next-app` with TypeScript + Tailwind + App Router; typed API client; Home, Portfolio grid, Project detail, About, Contact routes
8. CORS wiring (`django-cors-headers`) for localhost:3000 <-> localhost:8000

## Approaches Compared

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| Monorepo (recommended) | Single git history, matches PRD section 13, simplest for solo dev | Slightly larger checkout | Low |
| Separate repos | Cleaner deploy boundaries | Two PRs for cross-cutting changes; overkill for <50-project portfolio | Low-Medium |

## Risks
- No Postgres/Cloudinary credentials locally — mitigated via SQLite + FileSystemStorage fallback in `local.py`.
- Python PATH not yet permanently configured — `sdd-apply` must re-verify `python --version` before running Django commands.
- No test runner configured yet — Strict TDD Mode disabled, Standard Mode applies.

## Recommendation
Proceed to `sdd-propose`. Lock in: monorepo layout, SQLite/local-storage dev fallback, Django session auth for v1, and the three initial app boundaries (`projects`, `media_items`, `site_settings`).
