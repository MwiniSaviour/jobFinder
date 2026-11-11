# Drift audit — Phase 2: Jobs & applications backend

> Audit of 2026-11-11: code as committed vs. `docs/specs/2026-11-11-phase2-jobs-backend.md` (Approved 2026-11-11 — implemented). Read-only comparison of declared-vs-present behavior; findings only, no recommendations.

Accepted deviations already on record (not reported here): camelCase quoted columns; `formatPosted` tests inside `serializers.test.ts`; apply-route tests inside `jobs.test.ts`; `getPrisma`/`closePrisma` exports; split migrations `20261111110000_init` + `20261111110100_phase2_jobs`; residual "Sort" in README pay-sort copy; hand-maintained `search` tsvector; flexible seed content; deferred features absent. The simulated application behavior in `src/lib/applications.ts` (`SIMULATED_RESPONSE_PLAN`, `REJECTION_PROBABILITY 0.3`, `APPLICATION_HISTORY_LIMIT 50`) is spec-silent: §9 only says "The page stays on the mock," and the spec mandates no timings or probabilities.

## Findings

1. [drift: spec-extra] Spec §4 ↔ `backend/src/routes/v1/applications.ts:26-27` — `limit` query param on `GET /v1/applications`. The route parses `limit` with `parseLimit(c.req.query("limit"))` and returns 400 `{ error: "Invalid limit" }` when invalid, applied as `LIMIT ${limit + 1}` in the raw keyset query (applications.ts:49). `applications.test.ts` covers invalid values and the default (observed `LIMIT 21`). §4 documents the endpoint with "same cursor codec" but never mentions `limit`; §3 defines it only for `GET /v1/jobs`.

2. [drift: spec-extra] Spec §3 (line 55) ↔ `backend/src/routes/v1/jobs.ts:22,49,159` — pay cursors from null-salary rows. Spec: "`pay` cursors are only emitted from non-null salary rows (`NULLS LAST` puts null-salary rows after every non-null row, so they are never the last returned row)." Code: `RouteCursor` declares `v: number | null` for `pay`, `narrowCursor` accepts `value === null`, and emission is `encodeCursor({ k: "pay", v: lastRaw.salaryAmount, i: lastRaw.id })` — a page boundary into the null tail yields a `v: null` cursor. Spec-side wording is wrong; the code is correct.

3. [drift: spec-extra] Spec §3 (line 53) ↔ `backend/src/routes/v1/jobs.ts:111-117` — the `pay` keyset literal is incomplete. Spec literal: `(salary_amount < $v OR (salary_amount = $v AND id < $i))`. Code branches on the cursor value: non-null `v` → `(("salaryAmount" IS NOT NULL AND ("salaryAmount" < $v OR ("salaryAmount" = $v AND "id" < $i))) OR "salaryAmount" IS NULL)`; null `v` → `("salaryAmount" IS NULL AND "id" < $i)`. Both branches are required by `ORDER BY salary_amount DESC NULLS LAST, id DESC`; the spec's single literal is incomplete. Spec-side error; code is correct.

4. [ambiguous] Spec §3 ↔ `backend/src/routes/v1/jobs.ts:93-94` — whitespace-only `q` ignored. `qRaw.trim() !== ""` gates the FTS condition, so a present-but-blank value behaves like an absent one. The spec only documents the 200-char truncation and is silent on blank values.

5. [drift: spec-extra, minor] Spec §5 ↔ `backend/src/serializers.ts` — `formatPosted` takes an optional `now`. Spec signature: `formatPosted(createdAt: Date): string`. Code: `formatPosted(createdAt: Date, now: Date = new Date()): string` (determinism hook for tests; call sites use the default).

6. [drift: spec-extra, minor] Spec §8 ↔ `backend/src/smoke.ts` — three extra 401 checks. §8 names exactly two smoke additions; the code also has `checkJobDetailRequiresAuth` (`GET /v1/jobs/:id`), `checkMyApplicationsRequireAuth` (`GET /v1/applications`), and `checkWithdrawRequiresAuth` (`POST /v1/applications/:id/withdraw`), each asserting the middleware's `{ error: "Missing bearer token" }` body (`middleware.ts:23`, `clerk.ts:79` — wording matches word-for-word).

7. [drift: spec-extra, minor] Spec ↔ `backend/tests/integration.live.test.ts` — undocumented opt-in live-DB suite. §7 documents only the vitest mock suites. The code adds an integration suite gated on `process.env.JF_LIVE_DB_TESTS === "1"` (skipped otherwise), running against a real `DATABASE_URL` with `CLERK_ISSUER_URL`/`CLERK_JWKS_JSON` overridden (kid `live-key`, ISSUER `https://clerk.live.test`) and `live-test-*` fixtures.

8. [ambiguous] Spec §9 (line 132) ↔ `src/lib/applications.ts:92-96` — `LEGACY_STATUS_MAP`. §9 requires jobs-page copy to drop the viewed/shortlisted/interview/offer/hired vocabulary — satisfied: a repo-wide grep shows the old words only as lowercase parse keys in `LEGACY_STATUS_MAP`, which normalizes pre-rewrite localStorage records into the new uppercase statuses; no user-facing copy uses them. The spec doesn't state whether keeping the legacy normalizer is in or out of scope.

Net: eight minor items; no spec-missing findings; no functional regressions. Items 2-3 are spec-side errors (the code is right); items 1, 5-8 are shipped extras the spec doesn't record; items 4 and 8 are spec-silent judgment calls.

## Checked and matching

- §1 — all five routes mounted under `/v1` in `backend/src/app.ts`, each behind `requireAuth`; unauth 401 body `{ error: "Missing bearer token" }` everywhere.
- §2 — `WITHDRAWN` added to `ApplicationStatus`; eight nullable `JobPost` columns as declared; `search` tsvector `GENERATED ALWAYS` + GIN index `JobPost_search_idx` in the hand-edited migration SQL.
- §3 — `q` truncated to 200; `categories` deduped, >10 → 400 "Too many categories"; `includeUnlistedPay` validated, `false` adds the `salaryAmount IS NOT NULL` filter; `sort` `new`/`pay` with `NULLS LAST`; `limit` 1..50, default 20 (observed `LIMIT 21`); cursor codec base64url `{k, v, i}` unsigned, `k` mismatch → 400 "Invalid cursor"; last page returns `nextCursor: null`; raw id query then hydrate-by-id remap preserving SQL order (jobs.ts:127-147).
- §4 — apply returns 201 with `post` summary derived from the already-fetched job (no second read); 404 "Job not found", 409 "Already applied" via P2002 catch; withdraw is a single `updateMany` guarded on `SUBMITTED|REVIEWING`, 404 "Application not found" for missing-or-foreign (no existence leak), 409 "Application already withdrawn", 409 "Application can no longer be withdrawn" for terminal states.
- §5 — `formatPosted` buckets: months = 30 days, years = 365 days, singular exactly when the value is 1; `toJobSummary` shape with `createdAt` ISO + derived `posted`, `authorId` omitted; `toApplication` from an `include` read (no N+1).
- §6 — `db:seed` = `tsx src/seed.ts`, no `prisma.seed` key; fixed absolute timestamps, upsert re-run is a true no-op; `seed-employer-1..3`; `seed-job-1..14`, at least one per category (12), some `salaryAmount` null; no applications seeded.
- §7 — `jobs.test.ts` 33 its (27 list / 2 detail / 4 apply; deviation 3 accepted); `applications.test.ts` covers every §7 bullet plus spec-consistent extras (P2002 injection, raw-SQL argument assertions); backend README reports 91 tests across 7 files.
- §8 — both named smoke additions present exactly as written; README has the five endpoint rows plus the `db:seed` row with the dev-only note.
- §9 — `src/lib/applications.ts` uppercase rewrite matches the spec word-for-word (statuses, labels "Applied"/"In review"/"Accepted"/"Not selected"/"Withdrawn", the five copy strings, `APPLICATION_STATUS_ORDER`, `TERMINAL_APPLICATION_STATUSES`); `JOB_CATEGORIES` matches the seed's 12 categories; jobs-page copy is clean of the old vocabulary; the page stays on the `src/lib/jobs.ts` mock.
