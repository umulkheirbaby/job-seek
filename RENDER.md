# Deploy EmpoweWithIT on Render

This app is a MERN split: Express API in `backend/` and Vite React app in `frontend/`. On Render, run them as **two services** and keep MongoDB on **Atlas**.

Do not commit `.env` files. Set secrets in the Render dashboard.

## Quick path (Blueprint)

1. Push this repo to GitHub (include `render.yaml`).
2. In Atlas **Network Access**, allow `0.0.0.0/0`.
3. In Render: **New → Blueprint** → select the repo.
4. Fill the prompted secrets (see tables below).
5. After both services are live, set API `CLIENT_ORIGIN` to the exact static-site URL (no trailing slash) and redeploy the API.
6. Set static-site `VITE_API_URL` to `https://<api-host>/api/v1` and trigger a static rebuild if that value was wrong on first build.

## Manual path (two services)

Create the **API first**, then the static site, then update `CLIENT_ORIGIN` on the API.

### Before Render

1. Push this repo to GitHub.
2. In Atlas, use database name `ilo-job-linkage`.
3. In Atlas **Network Access**, allow `0.0.0.0/0`.
4. Confirm the Atlas user can read and write that database.

### 1. API web service

| Setting | Value |
| --- | --- |
| Name | `empoweewithit-api` |
| Language | Node |
| Root directory | `backend` |
| Branch | `main` |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check path | `/api/v1/health` |
| Instance | Free is fine for a trial |

Leave `PORT` unset. Render sets it.

#### API environment variables

| Key | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | Atlas `mongodb+srv://.../ilo-job-linkage?...` |
| `JWT_SECRET` | Yes | Long random string |
| `CLIENT_ORIGIN` | Yes | Static site origin only, e.g. `https://empoweewithit.onrender.com` (no trailing slash) |
| `JWT_EXPIRES_IN` | No | `7d` |
| `AUTH_COOKIE_NAME` | No | `empoweewithit_session` |
| `ADMIN_EMAIL` | Recommended | Seeded once if missing |
| `ADMIN_PASSWORD` | Recommended | Strong password |
| `CLOUDINARY_CLOUD_NAME` | Yes, for PDFs | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes, for PDFs | |
| `CLOUDINARY_API_SECRET` | Yes, for PDFs | |

Smoke check:

```text
https://<your-api>.onrender.com/api/v1/health
```

### 2. Frontend static site

| Setting | Value |
| --- | --- |
| Name | `empoweewithit` |
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

#### Frontend environment variable

Set **before** the first build (Vite bakes it into the bundle):

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-api>.onrender.com/api/v1` |

No trailing slash after `v1`.

#### SPA rewrite

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

## Cookies and CORS

Production cookies are `Secure` and `SameSite=None` across the two Render hostnames. That only works if:

- Both URLs are `https://`
- `CLIENT_ORIGIN` is exactly the static-site origin
- `VITE_API_URL` points at the API `/api/v1` path
- The browser is not blocking third-party cookies

If sign-in looks successful but `/auth/me` returns 401, fix `CLIENT_ORIGIN` (trailing slash, `http` vs `https`, or API URL used by mistake).

## Combined PDF uploads

Profile and application PDFs are stored on **Cloudinary**. Set the three `CLOUDINARY_*` vars on the API. No Render disk is required.

PDFs are still served through authenticated API routes. Do not put Cloudinary secrets in the frontend.

## First login after deploy

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the API seeds that admin when the user does not already exist.

1. Open the static site.
2. Sign in with that admin email and password.
3. Approve employers, jobs, and job seekers as usual.

Change the seeded admin password after the first login.

## Redeploys

- API code: push `backend/` → web service auto-deploys.
- Frontend code or `VITE_API_URL`: rebuild the static site. Changing `VITE_API_URL` always needs a new frontend build.

Free instances sleep after idle time. The first request can take 30–60 seconds.

## Checklist if something fails

| Symptom | What to check |
| --- | --- |
| API crash on boot | `NODE_ENV=production` plus `JWT_SECRET`, `MONGODB_URI`, and `CLIENT_ORIGIN` |
| `MongoDB connection failed` | Atlas URI, password, Network Access `0.0.0.0/0` |
| Frontend loads, API calls fail | `VITE_API_URL` and a rebuilt static site |
| CORS error | `CLIENT_ORIGIN` matches static origin, no trailing slash |
| Login does not stick | HTTPS on both; `CLIENT_ORIGIN`; third-party cookies |
| `/jobs` 404 on refresh | SPA rewrite `/*` → `/index.html` |
| PDFs fail to upload | Cloudinary env vars on the API |
| Health check red | Path is `/api/v1/health` |

## Local vs Render

Locally, Vite proxies `/api`, so `VITE_API_URL=/api/v1` is enough.

On Render there is no proxy. The static site must call the API through the full `VITE_API_URL`.
