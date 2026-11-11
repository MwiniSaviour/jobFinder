# Phase 2: Jobs & applications backend

> Status: Approved 2026-11-11 — implemented

## 1. Scope

- Backend only. Five auth-gated routes under `/v1` (every route uses `requireAuth` — no anonymous browsing):
  - `GET /v1/jobs` — filtered, sorted, cursor-paginated listing.
  - `GET /v1/jobs/:id` — single listing detail.
  - `POST /v1/jobs/:id/applications` — apply to a job.
  - `GET /v1/applications` — the caller's applications, newest first.
  - `POST /v1/applications/:id/withdraw` — withdraw an application.
- Schema extension + one Prisma migration; serializers module; idempotent seed; vitest suites; smoke additions.
- `src/app/jobs/page.tsx` stays on the `src/lib/jobs.ts` mock in this phase. Frontend work is vocabulary-only (§9) and lands as a separate commit set after the backend commits.
- Non-goals: employer authoring, employer-side application review, saved jobs & recent searches, location text column + radius filter, application answer persistence, rate limiting, services, rides.

## 2. Schema changes (one migration)

- `enum ApplicationStatus` gains `WITHDRAWN`. Final vocabulary: `SUBMITTED | REVIEWING | ACCEPTED | REJECTED | WITHDRAWN`.
- `JobPost` gains eight nullable columns:
  - `company String?`, `jobType String?`, `category String?`
  - `salaryAmount Int?` (whole cedis — `2200` renders as `GH₵ 2200.00` on the frontend, no unit conversion)
  - `salaryFrom Boolean?`, `salaryEst Boolean?`
  - `rating Float?`, `reviews Int?`
- `JobPost` gains `search Unsupported("tsvector")?` — DB-generated over title + company + description, GIN-indexed. Prisma cannot model `GENERATED ALWAYS`, so the migration SQL is hand-edited:
  - `npm run db:migrate -- --create-only --name phase2_jobs`, then append to the generated `migration.sql` (after Prisma's own statements):
    ```sql
    ALTER TABLE "JobPost" ADD COLUMN "search" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("company",'') || ' ' || "description")) STORED;
    CREATE INDEX "JobPost_search_idx" ON "JobPost" USING gin ("search");
    ```
  - Apply with `prisma migrate deploy` (or a second `npm run db:migrate`). DB-maintained — no triggers. Known caveat: Prisma manages `Unsupported` columns manually; `search` is invisible to the client except through raw SQL, which is exactly how it is used (§3).
- Run `npm run db:generate` after editing `schema.prisma` so `WITHDRAWN` is in the client types.

## 3. List & detail API

### GET /v1/jobs (requireAuth)

Query params:
- `q` — FTS over title/company/description: `"search" @@ plainto_tsquery('english', $q)`. Values longer than 200 chars are truncated to 200.
- `categories` — repeated param, deduped, at most 10; more → 400 `{ error: "Too many categories" }`. Unknown values simply match nothing. SQL: `category = ANY($n::text[])` (Prisma `$queryRaw` tagged template binds arrays).
- `includeUnlistedPay` — `"true"`/`"false"`, default `false`; anything else → 400 `{ error: "Invalid includeUnlistedPay" }`. `false` adds `salary_amount IS NOT NULL` to the list filter.
- `sort` — `new` (default) or `pay`; anything else → 400 `{ error: "Invalid sort" }`.
- `limit` — integer 1..50, default 20; anything else → 400 `{ error: "Invalid limit" }`.
- `cursor` — opaque (below); malformed → 400 `{ error: "Invalid cursor" }`.

Execution (every list request, with or without a cursor):
1. One raw-SQL query (Prisma `$queryRaw` tagged template) selecting `id` with the filters + ordering + keyset predicate, `LIMIT (limit + 1)`.
2. Hydrate: `prisma.jobPost.findMany({ where: { id: { in: ids } } })`, remapped to the SQL order.
3. If `limit + 1` rows returned, drop the extra row and set `nextCursor` from the last returned row's sort values; otherwise `nextCursor: null`.

Ordering & keyset predicates:
- `new`: `ORDER BY created_at DESC, id DESC`; predicate `(created_at < $v OR (created_at = $v AND id < $i))`.
- `pay`: `ORDER BY salary_amount DESC NULLS LAST, id DESC`; predicate `(salary_amount < $v OR (salary_amount = $v AND id < $i))`.

Cursor codec: base64url of JSON `{ k: "new" | "pay", v: createdAt ISO string | salaryAmount number, i: id }`, unsigned. `k` must equal the request's `sort`; mismatch → 400 "Invalid cursor". `pay` cursors are only emitted from non-null salary rows (`NULLS LAST` puts null-salary rows after every non-null row, so they are never the last returned row).

Response: `{ items: JobSummary[], nextCursor: string | null }` (§5).

### GET /v1/jobs/:id (requireAuth)

- `prisma.jobPost.findUnique` → 404 `{ error: "Job not found" }` when absent, else `JobSummary`. Salary fields are always present on detail (even null) — `includeUnlistedPay` never applies here.

## 4. Applications API

| Endpoint | Success | Errors |
| --- | --- | --- |
| `POST /v1/jobs/:id/applications` | 201 + `Application` | 401 unauth; 404 "Job not found"; 409 "Already applied" (catch P2002 on `@@unique([postId, applicantId])`) |
| `GET /v1/applications` | 200 `{ items: Application[], nextCursor }`, newest first (`createdAt DESC, id DESC`), same cursor codec with `k: "new"` | 401 unauth |
| `POST /v1/applications/:id/withdraw` | 200 + updated `Application` | 401 unauth; 404 "Application not found" (missing **or** not owner — no existence leak); 409 "Application already withdrawn"; 409 "Application can no longer be withdrawn" |

- Apply consumes no body fields in Phase 2 (empty body accepted; the ≤3-question apply answers ship with a later phase). The 201 body's `post` summary (`id`, `title`, `company`) is derived from the job already fetched for the 404 check — no second read.
- State machine — employer transitions ship with employer authoring, so only `withdraw` mutates status in this phase:
  - `SUBMITTED` → `REVIEWING | ACCEPTED | REJECTED` (employer actions, deferred).
  - Withdraw allowed from `SUBMITTED | REVIEWING` → `WITHDRAWN` (sets `updatedAt`).
  - `ACCEPTED | REJECTED | WITHDRAWN` are terminal → withdraw returns 409.

## 5. Serializers & posted derivation

`backend/src/serializers.ts` exports:
- `formatPosted(createdAt: Date): string` — deterministic strings: `< 60s` "just now"; minutes/hours/days/weeks/months/years as `"1 X ago"` / `"N Xs ago"` (singular exactly when the value is `1`); month buckets are 30 days, year buckets 365 days.
- `toJobSummary(post)` — `{ id, title, description, company, jobType, category, salaryAmount, salaryFrom, salaryEst, rating, reviews, createdAt: ISO, posted }` (authorId omitted).
- `toApplication(app)` — `{ id, postId, status, createdAt: ISO, updatedAt: ISO, post: { id, title, company } }` from an `include: { post: ... }` read (no N+1).

`posted` is never a column — `createdAt` (ISO) is returned alongside the derived string so the frontend can re-derive when it wants.

## 6. Seed

**Adopted assumption (flagged for review):** seed option 2 — dev seed data ships in Phase 2 as an opt-in script; veto here if you want it later.

- `backend/src/seed.ts`, new script `db:seed` = `tsx src/seed.ts` (no `prisma.seed` key). Dev-only, opt-in; tests never depend on seed data.
- Fixed absolute timestamps in the recent past (minutes → months back) so a re-run re-asserts identical values — upserts rewrite every scalar (including `createdAt`) and the re-run is a true no-op.
- Employers `seed-employer-1..3`: `clerkId: "seed-employer-N"`, role `PROVIDER`, email `seed-employer-N@jobfinder.dev`; upsert create uses `{ author: { connect: { id } } }` for jobs.
- Jobs `seed-job-1..14`: at least one per `JOB_CATEGORIES` entry (12), extras in high-volume categories; some `salaryAmount` null; varied `jobType` / `rating` / `reviews` / `company`. No applications seeded.

## 7. Tests

`backend/tests/jobs.test.ts` — mock `../src/db.js` (`getDb` → prisma mock exposing `jobPost.findUnique/findMany` + `$queryRaw`); real RS256 token via `vi.stubEnv` `CLERK_JWKS_JSON` (kid `test-key`, ISSUER `https://clerk.test`):
- 401 without a bearer token.
- `q` reaches `$queryRaw` as a `plainto_tsquery('english', …)` argument.
- `categories` dedupe; >10 → 400 "Too many categories".
- Default `includeUnlistedPay=false` produces the `salary_amount IS NOT NULL` filter.
- `sort=new` → `created_at DESC` order; `sort=pay` → `salary_amount DESC NULLS LAST`.
- Valid cursor → keyset predicate bound in the SQL.
- Invalid base64 → 400 "Invalid cursor"; `k` mismatch → 400 "Invalid cursor".
- Invalid limit → 400 "Invalid limit"; invalid `includeUnlistedPay` value → 400 "Invalid includeUnlistedPay"; default limit 20 (observed as `LIMIT 21`).
- Detail 200 → serializer shape; detail 404 → "Job not found".
- `formatPosted` unit cases (just now, 1 minute vs N minutes, hours, days, weeks, months, years, singular-vs-plural).

`backend/tests/applications.test.ts`:
- 401s for apply / list-mine / withdraw.
- Apply → 201 with `{ id, postId, status: "SUBMITTED", post: { id, title, company } }`.
- Apply to a missing job → 404 "Job not found".
- Duplicate apply → 409 "Already applied" (injected `P2002` error object: `Object.assign(new Error(…), { code: "P2002" })`).
- List-mine newest-first, includes post summaries, honors cursor.
- Withdraw `SUBMITTED` → 200 `WITHDRAWN` + new `updatedAt`.
- Withdraw missing or foreign application → 404 "Application not found".
- Withdraw `WITHDRAWN` → 409 "Application already withdrawn".
- Withdraw `ACCEPTED`/`REJECTED` → 409 "Application can no longer be withdrawn".

## 8. Smoke & README

- `backend/src/smoke.ts` additions: `GET /v1/jobs` unauth → 401; `POST /v1/jobs/:id/applications` unauth → 401 with any id (e.g. `smoke-nonexistent` — the auth gate precedes the existence check).
- `backend/README.md`: rows for the five endpoints plus `npm run db:seed` with a dev-only note.

## 9. Frontend vocabulary (separate commit set, after backend commits)

- `src/lib/applications.ts` rewrite to uppercase keys:
  - Statuses: `SUBMITTED | REVIEWING | ACCEPTED | REJECTED | WITHDRAWN`.
  - Labels: "Applied" / "In review" / "Accepted" / "Not selected" / "Withdrawn".
  - Copy: SUBMITTED "Your application is queued for the employer." / REVIEWING "The employer is reviewing your application." / ACCEPTED "The employer accepted your application." / REJECTED "The employer did not move forward." / WITHDRAWN "You withdrew this application."
  - `APPLICATION_STATUS_ORDER = ["SUBMITTED", "REVIEWING"]`; `TERMINAL_APPLICATION_STATUSES = ["ACCEPTED", "REJECTED", "WITHDRAWN"]`.
- Jobs-page copy drops the viewed/shortlisted/interview/offer/hired vocabulary. The page stays on the mock; real-API wiring (camelCase → `JobListing` adapter, `posted`/currency mapping, `includeUnlistedPay` param) is later UI work.

## Verification (definition of done)

1. `npm run build` (backend) — clean; `tsc` typechecks `seed.ts` (inside `include: ["src"]`).
2. `npm test` (backend) — new jobs/applications suites pass alongside the existing 30 tests.
3. `npm run db:migrate` applies the phase-2 migration against `DATABASE_URL`; `prisma migrate status` up to date; `JobPost_search_idx` present.
4. `npm run smoke` — all checks pass (health, uploads 401s, jobs 401s).
5. After the frontend vocabulary commits: root `npm run build` + `npm run lint` pass (retry once on the known `3221226505` flake).

## Deferred (later phases)

Real-API wiring for the jobs page (adapter, posted/currency mapping, `includeUnlistedPay`), employer authoring + employer-side application review, saved jobs & recent searches, location text column + radius filtering, application answer persistence, rate limiting (with the first public booking route), services (Phase 3), rides (Phase 4).
