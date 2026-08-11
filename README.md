# Design Portfolio

Personal portfolio site. Django (DRF, admin-managed content) + Next.js (public site).

## Backend Setup (Django)

Requires Python 3.12+.

1. Create and activate a virtual environment inside `backend/`:

   ```bash
   cd backend
   python -m venv venv
   # Windows (Git Bash):
   source venv/Scripts/activate
   # macOS/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy the environment template to the repo root and fill in values:

   ```bash
   cp ../env.example ../.env
   ```

   At minimum, set `DJANGO_SECRET_KEY` for local development. Local settings
   default to SQLite and `FileSystemStorage`, so `DATABASE_URL` and
   `CLOUDINARY_URL` can stay commented out.

4. Apply migrations:

   ```bash
   python manage.py migrate
   ```

5. Create an admin user (manual step, not automated by tooling):

   ```bash
   python manage.py createsuperuser
   ```

6. Run the dev server:

   ```bash
   python manage.py runserver
   ```

   Admin is available at `http://localhost:8000/admin/`.

`DJANGO_SETTINGS_MODULE` defaults to `config.settings.local`. Set it to
`config.settings.production` (and provide `DATABASE_URL`, `FRONTEND_BASE_URL`,
`DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`) when deploying.

### Running Tests

```bash
cd backend
source venv/Scripts/activate  # or venv/bin/activate on macOS/Linux
python manage.py test
```

Requires the same `.env` (or exported `DJANGO_SECRET_KEY`, etc.) as local
development — see step 3 above. `python manage.py test` is the project's
official test command as of Slice 2 (DRF read-only API layer).

## Frontend Setup (Next.js)

Requires Node.js 20+ (tested with Node v24 / npm 11).

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Set the API base URL. Copy `NEXT_PUBLIC_API_BASE_URL` from the root
   `env.example` into `frontend/.env.local` (defaults to
   `http://localhost:8000`, matching the Django dev server):

   ```bash
   echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   The app is available at `http://localhost:3000`. Routes: `/`, `/portfolio`,
   `/portfolio/[slug]`, `/about`, `/contact` (placeholder pages as of Slice 3 —
   real data wiring lands in Slice 4).

4. Production build check:

   ```bash
   npm run build
   ```

The typed API client lives in `frontend/lib/api/` (`client.ts`, `types.ts`,
`projects.ts`, `site.ts`) and mirrors the DRF serializer shapes from the
backend (see Slice 2).
