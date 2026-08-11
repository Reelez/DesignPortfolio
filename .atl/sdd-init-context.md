# sdd-init/design-portfolio

**Type**: architecture
**Detected**: 2026-08-10

## Project

- Name: design-portfolio
- Root: D:\Documents\PROYECTS\DESIGN PORTFOLIO
- Git repo: No (not yet initialized; `git rev-parse --show-toplevel` fails)
- Current files: `PRD_Portafolio_Personal.md` (Spanish PRD), `.atl/skill-registry.md`
- Nothing scaffolded yet: no package.json, no requirements.txt, no backend/frontend folders

## Stack (planned per PRD, not yet implemented)

- Backend: Django 5.x + Django REST Framework, PostgreSQL, media via Cloudinary (django-cloudinary-storage)
- Frontend: Next.js 14+ (App Router) + TypeScript + TailwindCSS
- Hosting: Render/Railway (backend), Vercel (frontend), Supabase Postgres (DB)
- Domain: personal portfolio site — public module (landing, gallery, project detail, about, contact) + admin module (CRUD projects/media, ordering, categories, draft/published)
- Scope v1 explicitly excludes: e-commerce, public comments, multi-admin roles, blog

## Conventions to establish

- No code conventions exist yet (empty project). Once scaffolded: standard Django app structure + DRF serializers/viewsets; Next.js App Router conventions, TypeScript strict mode, TailwindCSS utility-first styling.
- PRD is authoritative source of truth in Spanish; generated code/artifacts should default to English per SDD language contract.

## Testing Capabilities

**Strict TDD Mode**: disabled (no test runner exists yet)
**Detected**: 2026-08-10

### Test Runner
- Command: none configured
- Framework: none

### Test Layers

| Layer       | Available | Tool |
| ----------- | --------- | ---- |
| Unit        | ❌        | —    |
| Integration | ❌        | —    |
| E2E         | ❌        | —    |

### Coverage
- Available: ❌
- Command: —

### Quality Tools

| Tool         | Available | Command |
| ------------ | --------- | ------- |
| Linter       | ❌        | —       |
| Type checker | ❌        | —       |
| Formatter    | ❌        | —       |

## Environment / Risks

- **BLOCKER**: No working Python installation. `python`/`python3` resolve to the broken Windows Store alias stub. Backend scaffolding (Django/DRF) cannot proceed until Python is installed properly (and the Store alias disabled, or PATH reordered).
- Node v24.14.1 and npm 11.11.0 are available — frontend (Next.js) scaffolding can proceed without additional runtime setup.
- Project is not yet a git repository — recommend `git init` before first commit-producing SDD phase.
- No CI/CD configured yet.

## Persistence

- Artifact store mode: engram (requested)
- **Note**: Engram MCP tools (`mem_save`, `mem_search`, etc.) were not exposed to this execution context, so the mandatory Engram save could not be performed. This context was instead written to `.atl/sdd-init-context.md` as a local fallback so it is not lost. A future session with Engram tools available should read this file and call `mem_save` with topic_key `sdd-init/design-portfolio`, type `architecture`, to complete persistence.

## Skill Registry

- Already exists at `.atl/skill-registry.md` (last updated 2026-08-10), scanned from user-level skill directories. No project-level skills detected yet (none scaffolded). Registry left unchanged as it is current.
