# ILO Job Linkage

A MERN platform that connects youth, refugees, and other job seekers — especially in North Eastern Kenya — with employers offering local and remote work. Programme administrators can verify employers, approve jobs, manage users, and track placements.

Sprint 8 adds tests, security hardening, monitoring, and a Docker launch path.

## Sprint 8 vertical slice

1. From the repo root, run `npm test`. Backend integration tests and frontend unit tests should pass.
2. Open `/status` — the page should show API health, MongoDB, uptime, and environment.
3. Register and login stay rate-limited. Sessions stay in an httpOnly cookie. Production refuses to start without `JWT_SECRET`, `MONGODB_URI`, and `CLIENT_ORIGIN`.
4. Optional launch: set `JWT_SECRET`, then run `docker compose up --build` and open [http://localhost:8080](http://localhost:8080).

## Tests

```bash
npm test
npm run test:backend
npm run test:frontend
```

Backend tests use a separate MongoDB database: `ilo-job-linkage-test`.

## Security

- Helmet, CORS with credentials, and a 100kb JSON limit
- bcrypt passwords and JWT in an httpOnly cookie
- Rate limits on register and login
- Stack traces only in development
- Suspended accounts cannot sign in
- Production requires `JWT_SECRET`, `MONGODB_URI`, and `CLIENT_ORIGIN`, and will not start if MongoDB is down

## Deploy

```bash
set JWT_SECRET=a-long-random-string
docker compose up --build
```

The web container serves the React build and proxies `/api` to the API. Point `CLIENT_ORIGIN` at the public site URL in a real environment.

## Sprint 7 vertical slice

1. Sign in as the seeded admin (`admin@ilo.local` / `Admin12345`).
2. You should land on `/admin` with counts for users, employers, jobs, applications, interviews, and placements.
3. Open `/admin/users`, suspend a job seeker, then try to sign in as that person — it should be blocked.
4. Open `/admin/applications` and filter to Hired to see placements.
5. Employer and job review still live at `/admin/employers` and `/admin/jobs`.

## Sprint 6 vertical slice

1. Sign in as a job seeker and open a published job.
2. Submit an application with a cover letter.
3. Open `/applications` — the job should show status `Applied`.
4. Sign in as the employer, open Applicants, and move the candidate to Shortlisted.
5. Sign back in as the job seeker — the application should now say Shortlisted.

A person cannot apply to the same job twice. After the deadline, new applications are blocked.

## Sprint 5 vertical slice

1. Sign in as a verified employer and post a job at `/employer/jobs/new`.
2. The job stays `pending` and does not appear on `/jobs`.
3. Sign in as admin and approve it at `/admin/jobs`.
4. Open `/jobs` — the role should appear. Filter by skill or work type.
5. Open the job details page.

Unverified employers cannot post. Editing a published job sends it back for review.

## Sprint 4 vertical slice

1. Register as an employer and land on `/employer/dashboard` with status `pending`.
2. Complete `/employer/company`.
3. Sign in as the seeded admin (`admin@ilo.local` / `Admin12345`).
4. Open `/admin/employers` and approve the company.
5. Sign back in as the employer — the dashboard should show `approved`.

Job posting stays in Sprint 5. Only approved employers will be allowed to publish.

## Sprint 3 vertical slice

1. Register or sign in as a job seeker.
2. You should land on `/dashboard` with profile completion at 0%.
3. Open `/profile` and add skills, education, experience, and CV/portfolio URLs.
4. Save, then return to the dashboard — completion and counts should update.

Employers cannot open these routes. `GET /api/v1/profile` and `PATCH /api/v1/profile` require the `job_seeker` role. `GET /api/v1/job-seekers/:id` is the public profile.

## Sprint 2 vertical slice

1. Start MongoDB, the API, and the React app.
2. Open [http://localhost:5173/register](http://localhost:5173/register).
3. Create a job seeker or employer account.
4. You should land on `/account` with your name, email, and role.
5. Refresh the page — the httpOnly cookie should keep you signed in.
6. Sign out, then sign in again from `/login`.

`/account` is a protected frontend route. `GET /api/v1/auth/me` is a protected API route. Admin-only access is enforced with `authorize('admin')` on `GET /api/v1/admin/health`.

## Sprint 1 vertical slice

1. Start MongoDB.
2. Start the API and the React app.
3. Open [http://localhost:5173/status](http://localhost:5173/status).
4. The page should report API health and whether MongoDB is connected.

That path is React → Axios → `GET /api/v1/health` → Express → MongoDB.

## Prerequisites

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas URI

## Setup

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Edit `backend/.env` if your MongoDB URI is not `mongodb://127.0.0.1:27017/ilo-job-linkage`.

## Run

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

- API: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- App: [http://localhost:5173](http://localhost:5173)

## API response format

Success:

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

Validation errors also include an `errors` object.

## Project layout

```text
backend/src/
  config/          env + MongoDB
  middleware/      auth, notFound, errorHandler
  modules/         health, auth, users, profiles, employers, jobs, applications, admin
  utils/           ApiError, sendSuccess, asyncHandler, JWT, cookies
  app.js
  server.js

frontend/src/
  features/        home, health, auth, profile, employers, jobs, applications, admin
  components/      shared UI
  layouts/         AppLayout, RequireAuth, RequireRole
  routes/          AppRoutes
  services/        Axios client
  store/           AppContext (session only)
```

See `docs/Sprints.docx` and `CONTRIBUTING.md`.
