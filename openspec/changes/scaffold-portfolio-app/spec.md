# Delta Specs: Scaffold Portfolio App (Fase 1 + start of Fase 2)

## Capability: portfolio-content-model (New)

### Purpose
Data model for Project, Category, Tag, MediaItem, SiteSettings per PRD §7, with UUID primary keys and a public draft-preview mechanism.

### Requirement: Project Entity
The system MUST define a `Project` model with UUID primary key, `title`, unique `slug`, FK `category`, `description` (rich text), `cover_image`, `status` (`draft`/`published`), `order` (integer), `featured` (boolean), M2M `tags`, `created_at`/`updated_at`, optional `client_name`, optional `project_date`.

#### Scenario: Slug uniqueness enforced
- GIVEN two projects are created with the same slug value
- WHEN the second project is saved
- THEN the database MUST reject it via a unique constraint

#### Scenario: Default ordering
- GIVEN multiple published projects exist with different `order` values
- WHEN projects are queried without explicit ordering
- THEN they MUST be returned ordered by `order` ascending

### Requirement: Draft Preview Token
The system MUST provide a `preview_token` UUID field on `Project`, auto-generated on creation, allowing a draft project to be viewed publicly via a dedicated read-only endpoint that bypasses the published-only filter when the correct token is presented.

#### Scenario: Valid token bypasses draft filter
- GIVEN a project has `status=draft` and a known `preview_token`
- WHEN the preview endpoint is requested with that token
- THEN the project detail MUST be returned regardless of status

#### Scenario: Missing or wrong token rejected
- GIVEN a project has `status=draft`
- WHEN the preview endpoint is requested with no token or an incorrect token
- THEN the system MUST respond 404

### Requirement: MediaItem Entity
The system MUST define a `MediaItem` model with UUID primary key, FK `project`, `type` (`image`/`video`), `file_url`, `thumbnail_url`, `order`, required `alt_text`, optional `caption`.

#### Scenario: Alt text required
- GIVEN an admin creates a MediaItem without `alt_text`
- WHEN the record is saved
- THEN validation MUST fail with a required-field error

#### Scenario: Video type has no embed field
- GIVEN a MediaItem with `type=video`
- WHEN it is saved
- THEN the system MUST NOT expose or accept any external embed URL field (Cloudinary-hosted only)

### Requirement: Category and Tag Entities
The system MUST define `Category` (`id`, `name`, `slug`) and `Tag` (`id`, `name`, `slug`) with unique slugs, referenced by `Project`.

#### Scenario: Category referenced by multiple projects
- GIVEN a category exists
- WHEN multiple projects assign that category
- THEN all MUST resolve to the same Category record

### Requirement: SiteSettings Singleton
The system MUST define a `SiteSettings` model restricted to a single row, holding bio text, profile photo, social links, contact email, and SEO meta (title/description).

#### Scenario: Second instance blocked
- GIVEN a SiteSettings row already exists
- WHEN a second SiteSettings row is created
- THEN the system MUST prevent it (singleton enforcement at model or admin level)

## Capability: admin-content-management (New)

### Requirement: Authenticated Admin Access (RA01)
The system MUST require Django session authentication for `/admin`; anonymous requests MUST redirect to login.

#### Scenario: Anonymous redirect
- GIVEN no active session
- WHEN a user requests `/admin`
- THEN the system MUST redirect to the login page

### Requirement: Project CRUD and Media Inline (RA02, RA03, RA04, RA06)
The admin MUST support create/edit/delete of Project, Category, Tag, with MediaItem managed as an inline on the Project admin page, and `order` fields editable to control listing sequence.

#### Scenario: Inline media upload
- GIVEN an admin is editing a Project
- WHEN they add a MediaItem inline and save
- THEN the MediaItem MUST persist linked to that Project

### Requirement: Draft/Published Workflow (RA05)
The admin MUST allow setting Project `status` to `draft` or `published`, and draft projects MUST be excluded from all non-preview public API responses.

#### Scenario: Draft excluded from public list
- GIVEN a project has `status=draft`
- WHEN the public project list endpoint is requested (no token)
- THEN that project MUST NOT appear in the results

### Requirement: SiteSettings Editable (RA07)
The admin MUST expose a single SiteSettings edit form (no add/delete beyond the singleton).

#### Scenario: Bio update reflected
- GIVEN an admin updates the bio field
- WHEN saved
- THEN the API-exposed SiteSettings MUST return the updated bio

## Capability: media-storage (New)

### Requirement: Environment-Gated Storage Backend (RA08)
The system MUST use Cloudinary storage when `CLOUDINARY_URL` is set, and Django `FileSystemStorage` otherwise, switchable purely via settings/env without touching domain code.

#### Scenario: Local dev without Cloudinary
- GIVEN `CLOUDINARY_URL` is unset
- WHEN a MediaItem file is uploaded
- THEN it MUST be stored via FileSystemStorage on local disk

#### Scenario: Production with Cloudinary
- GIVEN `CLOUDINARY_URL` is set
- WHEN a MediaItem file is uploaded
- THEN it MUST be stored via Cloudinary

## Capability: public-content-api (New)

### Requirement: Read-Only Project Endpoints (RF01-RF03)
The system MUST expose `GET` endpoints for project list and detail-by-slug, returning only `published` projects unless a valid `preview_token` is supplied, with no write methods available.

#### Scenario: Write attempt rejected
- GIVEN an anonymous client
- WHEN it sends `POST`/`PUT`/`DELETE` to a project endpoint
- THEN the system MUST respond 405 or 403

### Requirement: Category, Tag, SiteSettings Endpoints (RF01, RF04, RF07)
The system MUST expose read-only `GET` endpoints for category list and the singleton SiteSettings.

#### Scenario: SiteSettings endpoint returns bio
- GIVEN SiteSettings has bio content saved
- WHEN `GET /api/site-settings/` is requested
- THEN the response MUST include the bio field

### Requirement: CORS for Local Frontend
The system MUST allow CORS requests from `http://localhost:3000` in local development settings.

#### Scenario: Frontend fetch succeeds
- GIVEN the Next.js dev server runs on `localhost:3000`
- WHEN it fetches a public API endpoint
- THEN the response MUST include CORS headers permitting that origin

## Capability: public-site-shell (New)

### Requirement: Structural Routes (RF01-RF04, RF06)
The frontend MUST implement routes `/`, `/portfolio`, `/portfolio/[slug]`, `/about`, `/contact`, each rendering live data from the public API, responsive at mobile and desktop breakpoints (structural, not visually polished).

#### Scenario: Portfolio grid renders API data
- GIVEN published projects exist
- WHEN a visitor loads `/portfolio`
- THEN the grid MUST display those projects fetched from the API

#### Scenario: Category filter
- GIVEN projects with different categories exist
- WHEN a visitor selects a category filter on `/portfolio`
- THEN only matching projects MUST display

#### Scenario: Project detail gallery
- GIVEN a published project has image and video MediaItems
- WHEN a visitor loads `/portfolio/[slug]`
- THEN images MUST render and video MUST be inline-playable

### Requirement: Contact Form UI Only (RF06)
The `/contact` route MUST render a contact form UI without wiring form submission to any backend endpoint in this change.

#### Scenario: Form present, no submission handler
- GIVEN a visitor loads `/contact`
- WHEN they view the page
- THEN the form fields MUST render but submitting MUST NOT call an email-delivery API (out of scope)
