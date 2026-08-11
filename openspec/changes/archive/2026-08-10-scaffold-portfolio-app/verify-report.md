# Verify Report: Scaffold Portfolio App

## Verdict: DONE — CRITICAL: 0, WARNING: 1, SUGGESTION: 2

## Checks Performed

### 1. Data models
`Project`, `MediaItem`, `Category`, `Tag`, `SiteSettings` in `backend/apps/*/models.py` match spec.md/design.md field-by-field: UUID PKs via `UUIDModel`, `preview_token` UUID with `unique=True`, `PROTECT` FK from Project to Category, required `alt_text` (no `blank=True`), M2M tags, singleton `SiteSettings.save()` override. Confirmed correct.

### 2. Storage abstraction
`backend/config/settings/base.py` implements the env-gated `STORAGES["default"]` swap (Cloudinary when `CLOUDINARY_URL` set, else `FileSystemStorage`). No model field declares a `storage=` kwarg; no application code imports Cloudinary directly. Matches design.md §3.

### 3. Preview-token bypass
`ProjectViewSet.get_object()` in `backend/apps/projects/views.py` correctly restricts the bypass to slug+token match across all statuses (draft included); missing/malformed/mismatched token falls through to 404. Cross-checked against `backend/apps/projects/tests/test_api.py`: `test_draft_detail_returns_404_without_token`, `test_draft_detail_returns_404_with_wrong_token`, `test_draft_detail_returns_200_with_valid_token` — all pass.

### 4. Public API read-only
All viewsets (`ProjectViewSet`, `CategoryViewSet`, `TagViewSet`) are `ReadOnlyModelViewSet`; `SiteSettingsView` is `RetrieveAPIView`. No POST/PUT/PATCH/DELETE routes exposed. `test_write_methods_rejected` confirms 405 on POST/DELETE.

### 5. Frontend-backend contract
`frontend/lib/api/types.ts` matches DRF serializer output shapes in `backend/apps/*/serializers.py` field-for-field (snake_case preserved, no mapping layer), with one minor drift noted below (WARNING/SUGGESTION section).

### 6. Test suite
Ran `python manage.py test` in `backend/venv` (Python 3.12, Django 5.2.17): **11/11 passing**, confirmed real — not a stale claim from apply-progress.md.

### 7. Frontend build
Ran `npm run build` in `frontend/` with a temporary local `manage.py runserver 8000` (stopped immediately after, per apply-progress.md's documented approach for SSG fetches): clean production build, 0 errors, 0 TypeScript errors. Routes matched expected static/dynamic split (`/`, `/about`, `/contact` static; `/portfolio`, `/portfolio/[slug]` dynamic).

### 8. tasks.md completeness
All checkable items are checked off. The 4 deferred manual items (2 in Slice 1 — admin login redirect check, slug/ordering UI check; 2 in Slice 4 — responsive layout visual check, end-to-end preview-link click-through) each carry an honest "NOT run" annotation explaining why (interactive `runserver`/`npm run dev` steps explicitly excluded per apply instructions), backed by structural/automated equivalents where possible (migration validity, passing test suite).

### 9. Scope discipline
Confirmed no contact-form backend wiring (`frontend/app/contact/page.tsx` has an explicit code comment marking RF05 as deferred), no rich-text editor dependency (`description` is a plain `TextField`), no custom admin panel beyond standard `ModelAdmin`/inlines, no deploy-specific config beyond the in-scope `production.py` settings module.

## Findings

### WARNING
1. **`.env` file was never actually materialized.** The sandbox blocked writing `.env*` files; content lives at root `env.example` (not `.env.example`), and no real `.env` exists in the repo. Tests were run via a manually-exported `DJANGO_SECRET_KEY` shell variable rather than the documented `.env` flow. This means a fresh clone cannot run `manage.py runserver`/`manage.py test` out of the box without a manual rename + populate step. Low severity (packaging/onboarding gap, not a logic defect) but should be resolved before calling the scaffold "ready to run" for a new contributor.

### SUGGESTION
1. `SiteSettingsSerializer` exposes `id` but `frontend/lib/api/types.ts`'s `SiteSettings` interface omits it. Harmless (frontend never reads `.id`) but a minor drift from the stated "mirrors DRF serializer field names one-to-one" contract.
2. The `SiteSettings.save()` singleton-reuse fix (`force_update=True` to counter a Django 5 auto-insert-on-default-pk optimization) is subtle and framework-version-specific. It's explained in `apply-progress.md` but not in a code comment inside `models.py` itself — worth adding a comment there so a future Django upgrade doesn't silently reintroduce the bug without an obvious pointer.

## Status
status: done
next_recommended: sdd-archive
risks: none blocking archive; `.env` packaging gap should be resolved by a human before onboarding a new contributor
