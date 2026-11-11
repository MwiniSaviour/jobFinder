# JobFinder Backend

Standalone Hono API for JobFinder: Prisma with Postgres, Clerk authentication, and Cloudinary image uploads.

## Requirements

- Node.js 20+
- Postgres database (Neon for hosted environments, Docker for local dev — see [Local database](#local-database))
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
| `DATABASE_URL` | Postgres connection string. Local dev: `postgresql://jobfinder:jobfinder_dev@127.0.0.1:5434/jobfinder?sslmode=disable`. |
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

### Local database

The bundled Compose stack provisions the dev database from the `backend/` directory:

```bash
cd backend
docker compose up -d --wait
npm run db:migrate
```

`docker compose up -d --wait` returns once the container's `pg_isready` healthcheck passes. Postgres is published on `127.0.0.1:5434` only, so `.env` needs:

```bash
DATABASE_URL="postgresql://jobfinder:jobfinder_dev@127.0.0.1:5434/jobfinder?sslmode=disable"
```

PostGIS is required: `Provider.location`, `Driver.location` and `JobPost.location` are `geography(Point,4326)` columns, so a plain `postgres` image fails the migration with `type "geography" does not exist`. The stack therefore runs `postgis/postgis:17-3.5` and keeps its data in the `jobfinder-db-data` volume.

Stop it with `docker compose down` (add `-v` to drop the volume). Any other container already bound to port `5434` has to be removed first — Docker cannot bind the port twice.

### Seed data

`npm run db:seed` is a **dev-only, opt-in** script. It upserts 3 employers (`seed-employer-1..3`) and 14 jobs (`seed-job-1..14`) with fixed absolute timestamps, so re-running it rewrites the same values and stays a no-op. It seeds no applications. The test suite never depends on seed data.

```bash
npm run db:seed
```

### Search column

`JobPost.search` is a Postgres-generated column:

```sql
"search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("company",'') || ' ' || "description")) STORED
```

It is GIN-indexed (`JobPost_search_idx`) and maintained by the database — the application never writes it. Prisma cannot model `GENERATED ALWAYS` columns, so `search` is invisible to the client except through raw SQL, which is how the `q` filter on `GET /v1/jobs` uses it.

The `GENERATED ALWAYS` clause exists only in the migration SQL, which is hand-maintained: the schema declares the column with `@default(dbgenerated(...))` so Prisma reports no drift, but regenerating the migration from the schema would emit a plain `DEFAULT` and the column would stop tracking edits to `title` and `company`. Do not regenerate `migrations/20261111110100_phase2_jobs/migration.sql` from the schema without re-applying the `GENERATED ALWAYS` form by hand.

`GET /v1/jobs?sort=pay` orders by `"salaryAmount" DESC NULLS LAST, "id" DESC`. Postgres can only serve that ordering from an index declared `DESC NULLS LAST`, which the Prisma schema language cannot express, so the pay path uses `JobPost_salaryAmount_id_idx` to select the rows and still sorts them. The `createdAt`, `category` and `applicantId` paths are served directly by their indexes.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode. |
| `npm run build` | Type-check and compile to `dist/`. |
| `npm run start` | Run the compiled server from `dist/server.js`. |
| `npm test` | Run the vitest suite. |
| `JF_LIVE_DB_TESTS=1 npm test` | Run the vitest suite with the opt-in live database integration suite enabled. |
| `npm run smoke` | Run end-to-end smoke checks against a running server. |
| `npm run db:migrate` | Apply Prisma migrations to `DATABASE_URL`. |
| `npm run db:generate` | Regenerate the Prisma client. |
| `npm run db:seed` | Dev-only, opt-in seed data (3 employers, 14 jobs). |

## Tests

`npm test` runs the vitest suite: 91 tests across 7 files. `tests/integration.live.test.ts` is reported as skipped.

### Live integration tests

`tests/integration.live.test.ts` runs the real HTTP routes against a real Postgres database instead of a mocked Prisma client. It covers the list, detail, apply and withdraw flows, creates its own rows, and deletes everything it created.

It is skipped unless `JF_LIVE_DB_TESTS` is exactly `1`. It needs the dev database running and migrated (`npm run db:migrate`) with `DATABASE_URL` set in `backend/.env`; it does not need the seed data, because it creates and removes its own fixtures. Running it is the guard against SQL-level mistakes that mocked unit tests cannot catch.

```bash
JF_LIVE_DB_TESTS=1 npm test
```

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

The script verifies that `GET /health` returns `{ "ok": true }` and that unauthenticated `POST /v1/uploads` requests are rejected with `401`. It also verifies that the jobs and applications routes are auth-gated: `GET /v1/jobs` returns `401 { "error": "Missing bearer token" }`, and `POST /v1/jobs/smoke-nonexistent/applications` returns `401` — the auth gate runs before the job-existence check, so a nonexistent job id still yields `401`, not `404`. It exits non-zero on any failure.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/ping` | No | Liveness probe returning `{ "ok": true }`. |
| `GET` | `/health` | No | Database health probe; returns `503` when the database is unreachable. |
| `POST` | `/v1/uploads` | Yes | Upload an image (`Content-Type: image/*`); returns `{ "url": "..." }`. |
| `GET` | `/v1/jobs` | Yes | Filtered, sorted, cursor-paginated job list. |
| `GET` | `/v1/jobs/:id` | Yes | Single job detail. |
| `POST` | `/v1/jobs/:id/applications` | Yes | Apply to a job. |
| `GET` | `/v1/applications` | Yes | The caller's applications, newest first. |
| `POST` | `/v1/applications/:id/withdraw` | Yes | Withdraw one of the caller's applications. |

Every `/v1/jobs` and `/v1/applications` route requires a bearer token — there is no anonymous browsing.

List cursors are base64url-encoded JSON; the `createdAt` value they carry is compared in UTC.

All error responses use the shape `{ "error": "..." }`.
