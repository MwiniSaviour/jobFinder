# JobFinder Backend

Standalone Hono API for JobFinder: Prisma with Neon Postgres, Clerk authentication, and Cloudinary image uploads.

## Requirements

- Node.js 20+
- Neon Postgres database
- Clerk application with a custom JWT template (RS256)
- Cloudinary account for image uploads

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string, e.g. `postgresql://user:password@host/dbname?sslmode=require`. |
| `PORT` | HTTP port. Defaults to `4002`. |
| `JF_CORS_ORIGINS` | Comma-separated allowed origins (web dev + Capacitor). |
| `CLERK_ISSUER_URL` | Clerk issuer for the custom JWT template. |
| `CLERK_SECRET_KEY` | Clerk Backend API key, used for user lookups. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name. Leave blank to disable uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `CLERK_JWKS_JSON` | Test-only local JWKS document; keeps the test suite offline. |

Uploads require all three `CLOUDINARY_*` values. When any is missing, `POST /v1/uploads` returns `503 { "error": "Uploads are not configured" }`.

## Database

```bash
npm run db:generate
npm run db:migrate
```

`db:migrate` runs `prisma migrate dev` and owns all migrations. `db:generate` regenerates the Prisma client.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode. |
| `npm run build` | Type-check and compile to `dist/`. |
| `npm run start` | Run the compiled server from `dist/server.js`. |
| `npm test` | Run the vitest suite. |
| `npm run smoke` | Run end-to-end smoke checks against a running server. |

## Smoke checks

Start the server in one terminal, then run the checks in another:

```bash
npm run dev
npm run smoke
```

Checks target `http://localhost:4002` by default; override with `JF_SMOKE_BASE`:

```bash
JF_SMOKE_BASE=http://localhost:4100 npm run smoke
```

The script verifies that `GET /health` returns `{ "ok": true }` and that unauthenticated `POST /v1/uploads` requests are rejected with `401`. It exits non-zero on any failure.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/ping` | No | Liveness probe returning `{ "ok": true }`. |
| `GET` | `/health` | No | Database health probe; returns `503` when the database is unreachable. |
| `POST` | `/v1/uploads` | Yes | Upload an image (`Content-Type: image/*`); returns `{ "url": "..." }`. |

All error responses use the shape `{ "error": "..." }`.
