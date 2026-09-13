# Team workflow

This repo is a student/team MERN project. Keep each sprint as a working slice that the frontend and backend can exercise together.

## Branches

- `main` — stable, deployable work
- `feature/<sprint-or-topic>` — one piece of work, for example `feature/sprint-2-auth`
- `fix/<short-name>` — bug fixes

Do not commit directly to `main` unless the team agrees that is how you are working locally.

```bash
git checkout main
git pull
git checkout -b feature/sprint-2-auth
```

## Commits

Write short commits that explain why the change exists.

```text
Add health endpoint so Sprint 1 can prove API and MongoDB are connected
```

Do not commit:

- `.env` or other secrets
- `node_modules`
- editor or OS junk

Copy env files from the `.env.example` files instead.

## Pull requests

1. Keep the branch focused on one sprint item or bug.
2. Describe what a reviewer should click or call.
3. For UI work, include the route you verified.
4. Do not mix Sprint 2 auth work into a Sprint 1 foundation PR.

## Code conventions

Follow the architecture in `docs/system architecture.docx`.

Backend flow:

```text
Route → controller → service → model → MongoDB
```

Frontend flow:

```text
Page → feature API helper → src/services/axios.js → Express
```

- Put session/user state in `AppContext` only.
- Keep jobs, applications, and profiles inside their own features.
- Return the shared `{ success, message, data }` API shape.
- Throw `ApiError` from services/controllers and let `errorHandler` format the response.

## Local checks before you share work

- Backend starts with `npm run dev:backend`
- Frontend starts with `npm run dev:frontend`
- `/status` still reaches `/api/v1/health`
- `npm test` passes
- No `.env` files are staged (`git status`)
