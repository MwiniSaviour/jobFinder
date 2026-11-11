# Phase 2 completion: jobs platform (authoring, review, saved jobs, geo, answers, rate limiting)

> Status: Approved 2026-11-11 — closes the phase-2 deferred list so phase 3 (services) starts on a finished jobs platform. Supersedes the "Deferred (later phases)" section of `2026-11-11-phase2-jobs-backend.md`; services (phase 3) and rides (phase 4) remain deferred.

## 1. Scope

Phase 2 shipped read + apply for jobs against a mock-free backend, but the whole platform was still local to the device. This phase closes the seven deferred items:

| # | Item | Delivered by |
| --- | --- | --- |
| 1 | Real-API wiring for the jobs page | §6 frontend |
| 2 | Employer authoring | §4 authoring |
| 3 | Employer-side application review | §5 review |
| 4 | Saved jobs & recent searches | §4.3 |
| 5 | Location text column + radius filtering | §3.3, §4.1 |
| 6 | Application answer persistence | §3.2, §4.2 |
| 7 | Rate limiting | §4.4 |

Explicitly still deferred: services (phase 3), rides (phase 4), saved-search email alerts, push notifications, admin surfaces.

## 2. Auth model (amends phase-2 spec §1)

Phase 2 made every `/v1` route auth-gated ("no anonymous browsing"). That conflicts with `PRODUCT.md`, which bans forced account creation before value: a job board must be browsable without an account.

- `GET /v1/jobs` and `GET /v1/jobs/:id` use `optionalAuth` — anonymous callers get the public listing; a valid token additionally resolves the caller (used for the "saved" flag).
- Every other route keeps `requireAuth`: apply, withdraw, saved jobs, recent searches, authoring, review, uploads, role upgrade.
- `POST /v1/me/role` upgrades `CUSTOMER → PROVIDER` only. It can never grant or change `ADMIN`, and never downgrades. A user who is already `PROVIDER` gets `409 { error: "Already an employer" }`.
- Anonymous browsing is what rate limiting protects (§4.4).

## 3. Schema (one migration)

### 3.1 `JobPost.status`

```prisma
enum JobPostStatus { DRAFT PUBLISHED CLOSED }
```

- `status JobPostStatus @default(PUBLISHED)` — existing and seeded rows stay visible without a data backfill.
- `DRAFT` is visible only to its author; `CLOSED` is visible to nobody in the public listing but stays readable by the author.
- Transitions are author-only: `DRAFT → PUBLISHED`, `PUBLISHED → CLOSED`, `CLOSED → PUBLISHED` (reopen). `DRAFT → CLOSED` is allowed (discard).

### 3.2 `JobApplication.answers`

```prisma
answers Json?
```

Shape: `{ "startDate": string | null, "note": string | null }` — the two answers the frontend already collects (`docs/find-jobs.md` caps the apply flow at three questions; the third slot stays free). The apply route accepts `{ answers?: { startDate?: string | null, note?: string | null } }`; an absent body is still valid (empty body accepted). Both fields are length-capped server-side (`startDate` 64 chars, `note` 1000 chars) and unknown keys are rejected.

### 3.3 `JobPost.locationText` + geo

- `locationText String?` — the human-readable area ("Riverside, Accra"). The frontend's `JobListing.location` maps from it.
- `lat`/`lng`/`location geography(Point,4326)` already exist and are now written: when a job is created or updated with coordinates, `location` is set to `ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography` through raw SQL (the column is `Unsupported`, so Prisma cannot write it).
- A GiST index on `location` backs the radius filter.

### 3.4 New models

```prisma
model SavedJob   { id, userId, postId, createdAt }   @@unique([userId, postId])
model RecentSearch { id, userId, query, createdAt }   @@unique([userId, query])
model RateLimitBucket { key, windowStart, count }     @@id([key, windowStart])
```

`RateLimitBucket` backs the fixed-window limiter (§4.4). Stale windows are pruned by the limiter itself.

## 4. Backend routes

### 4.1 Listing — `GET /v1/jobs` (optionalAuth)

Adds to the phase-2 contract:

- `status` — always `PUBLISHED` in the public listing; the author-only `GET /v1/jobs/mine` exposes `DRAFT`/`CLOSED`.
- `lat`, `lng`, `radiusKm` — radius filter. `radiusKm` must be 1..100; `lat` must be -90..90; `lng` -180..180. All three must be supplied together, else `400 { error: "Invalid radius" }`. The filter is `ST_DWithin("location", ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radiusKm * 1000)`.
- `locationText` is exposed on `JobSummary`.
- A `saved` boolean per item: `true` when the caller has the job saved. Anonymous callers always get `false`.

### 4.2 Authoring

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/v1/jobs` | `requireAuth` + `requireRole("PROVIDER", "ADMIN")` | Creates a job; `201` + `JobSummary`. `403 { error: "Forbidden" }` for a non-employer. |
| `PATCH` | `/v1/jobs/:id` | `requireAuth`, author only | Partial update (title, description, company, jobType, category, salary fields, locationText, lat/lng, status). `404 { error: "Job not found" }` for a non-author (no existence leak). |
| `GET` | `/v1/jobs/mine` | `requireAuth` + `requireRole("PROVIDER", "ADMIN")` | The caller's own posts, newest first, including `DRAFT`/`CLOSED`. |

`POST /v1/jobs` body: `{ title, description, company?, jobType?, category?, salaryAmount?, salaryFrom?, salaryEst?, locationText?, lat?, lng?, status? }`. `title` and `description` are required and non-empty; the rest are optional. Unknown keys are rejected with `400 { error: "Invalid job payload" }`.

### 4.3 Saved jobs & recent searches

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/v1/saved-jobs` | `requireAuth` | The caller's saved jobs, newest first, each with the full `JobSummary`. |
| `POST` | `/v1/saved-jobs` | `requireAuth` | `{ postId }` — saves (or re-saves) a job. `201` + `{ postId, saved: true }`. |
| `DELETE` | `/v1/saved-jobs/:postId` | `requireAuth` | Unsaves. `204`. Idempotent. |
| `GET` | `/v1/recent-searches` | `requireAuth` | The caller's recent searches, newest first, capped at 20. |
| `POST` | `/v1/recent-searches` | `requireAuth` | `{ query }` — records a search (deduped, case-insensitive, capped at 20). `201`. |
| `DELETE` | `/v1/recent-searches` | `requireAuth` | Clears all of the caller's recent searches. `204`. |

A saved job that is later closed or deleted by its author stays in the saved list but is returned without a job payload.

### 4.4 Rate limiting

- Fixed window per key, backed by `RateLimitBucket` (one `INSERT … ON CONFLICT … DO UPDATE` per request), so limits hold across server instances without Redis.
- `rateLimit({ limit, windowSeconds, key })` returns `429 { error: "Too many requests" }` with a `Retry-After` header when the window's count exceeds the limit.
- Keys: the authenticated user id when a token is present, otherwise the client IP (`x-forwarded-for` → `x-real-ip` → the socket address).
- Applied limits:

| Route | Limit | Window |
| --- | --- | --- |
| `GET /v1/jobs` | 120 | 60 s |
| `GET /v1/jobs/:id` | 120 | 60 s |
| `POST /v1/jobs/:id/applications` | 10 | 60 s |
| `POST /v1/uploads` | 20 | 60 s |
| `POST /v1/jobs` | 20 | 60 s |
| `PATCH /v1/jobs/:id` | 60 | 60 s |
| `PATCH /v1/applications/:id` | 60 | 60 s |

- Buckets older than one hour are pruned opportunistically by the limiter (at most one prune per 100 requests).

### 4.5 Employer-side application review

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/v1/jobs/:id/applications` | `requireAuth`, author only | The applicants for the caller's own job, newest first. Each item is an application summary plus the applicant name, the answers, and the status. `404 { error: "Job not found" }` for a non-author. |
| `PATCH` | `/v1/applications/:id` | `requireAuth`, author of the applied-to job only | `{ status }` — moves the application along the employer state machine. |

State machine (§4.5): `SUBMITTED → REVIEWING | ACCEPTED | REJECTED`, `REVIEWING → ACCEPTED | REJECTED`. `ACCEPTED`, `REJECTED` and `WITHDRAWN` are terminal: any transition out of them → `409 { error: "Application status cannot change" }`. An unknown status → `400 { error: "Invalid status" }`.

## 5. Application summary changes

`ApplicationSummary` gains `answers` (`{ startDate, note }` or `null`) so the employer sees what the applicant answered. The applicant-facing list keeps the same shape plus `answers`.

## 6. Frontend

- **API-backed, no mock fallback.** The jobs page fetches from `/v1/jobs`; when the backend is unreachable the page shows an error state with a retry action, never mock jobs. `src/lib/jobs.ts` stops being the data source for the jobs page and survives only as the category list and the type definitions the adapter targets.
- **Adapter** `src/lib/api/jobs.ts`: `JobSummary → JobListing` (string id, `description → blurb`, `jobType → type`, the three salary columns → the `salary` object, `locationText → location`, `posted` from the server, `createdAt` kept for re-derivation).
- **Pagination**: the list is cursor-paginated; "Load more" appends the next page.
- **Filters** map to the server: `q`, `categories`, `includeUnlistedPay`, `sort`, plus the radius filter (location text + radius from the filter sheet).
- **Sign-in surface**: Clerk sign-in/sign-up, reachable from the apply and save actions; the jobs list stays public.
- **Saved jobs** get a list view (the profile or a jobs-intake panel) reading `/v1/saved-jobs`.
- **Recent searches** read `/v1/recent-searches` and write through it, so they follow the account across devices.
- **Employer surface** (`/employer`): post a job, list own jobs, open a job's applicants, and move an application along the state machine.
- **Applications** read `/v1/applications`; apply posts to `/v1/jobs/:id/applications` with the answers; withdraw posts to `/v1/applications/:id/withdraw`.

## 7. Tests

- `backend/tests/authoring.test.ts` — create/update/mine, role gates, ownership, status transitions.
- `backend/tests/review.test.ts` — applicant listing, status machine, terminal states, ownership.
- `backend/tests/saved-jobs.test.ts` — save/unsave/list/recents.
- `backend/tests/rate-limit.test.ts` — the limiter against a mocked db, plus `429` + `Retry-After` through a route.
- `backend/tests/radius.test.ts` — radius parameter validation and the bound `ST_DWithin` predicate.
- `backend/tests/answers.test.ts` — answer persistence, validation and length caps.
- The live suite gains authoring → review → saved → withdraw coverage.

## 8. Verification (definition of done)

1. `npm run build` (backend) — clean.
2. `npm test` (backend) — all suites pass, including the new ones.
3. `JF_LIVE_DB_TESTS=1 npm test` — the live suite passes against a real Postgres (migration applied).
4. `npm run smoke` — all checks pass, plus the new public-browse and rate-limit checks.
5. Root `npm run build` + `npm run lint` pass.
6. `docs/specs/2026-11-11-phase2-jobs-backend.md` §1 and §Deferred are amended to point here; `PRODUCT.md` v1 scope no longer says "frontend only".

## Deferred (still later)

Services (phase 3), rides (phase 4), saved-search email alerts, push notifications, admin surfaces, job posting moderation.
