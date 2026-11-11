# Phase 1 — Backend Foundation

Status: approved (sections 1–4). Scope: foundation only — jobs/services/rides routes, engine port, dashboards, push, and seed data are later phases.

## 1. Repo layout & schema ownership

- New `backend/` directory in JobFinder (mirrors `ecommerce/backend/`):

  ```
  backend/
    package.json        # jobfinder-backend, ESM ("type": "module"), scripts: dev/build/start/test/smoke/db:migrate/db:generate
    tsconfig.json       # ES2022, NodeNext, strict (mirrors ecommerce)
    .env.example        # committed; .env copied from it (gitignored)
    .gitignore          # node_modules/, dist/, .env
    README.md           # env vars, run commands
    prisma/schema.prisma  # schema MOVED here from repo root; backend owns migrations
    src/
      app.ts            # Hono app (routes, middleware, onError) — exported for tests
      server.ts         # dotenv, @hono/node-server listen, graceful shutdown
      db.ts             # lazy PrismaClient singleton: getPrisma() / closePrisma()
      auth/clerk.ts     # Clerk token verification + user sync
      auth/middleware.ts# requireAuth / optionalAuth / requireRole
      uploads/cloudinary.ts
      routes/v1/uploads.ts
      smoke.ts          # end-to-end smoke checks
      tests/            # vitest (app.request() based, no live server)
  ```

- **Schema move:** `prisma/schema.prisma` moves from repo root to `backend/prisma/schema.prisma`. Revisions before first migration:
  - Drop NextAuth models `Account`, `Session`, `VerificationToken` and the `accounts`/`sessions` relations on `User`.
  - Add `User.clerkUserId String? @unique`.
  - Keep everything else (incl. `passwordHash`, `emailVerified`, `image`, `idDocumentUrl`) unchanged.
- **Frontend cleanup:** remove dead deps from root `package.json`: `@auth/prisma-adapter`, `@prisma/client`, `prisma` (no imports exist under `src/` — verified).

## 2. Server core

- Stack: Hono + `@hono/node-server` + `dotenv` + `zod` + Prisma. TypeScript, ESM, NodeNext.
- Response envelope: errors always `{ error: string }`. `app.onError` → 500 `{ error: "Internal server error" }` (logged).
- CORS: `JF_CORS_ORIGINS` (comma list). Default: `http://localhost:3000,capacitor://localhost,https://localhost`. `credentials: true`, allowHeaders `Authorization, Content-Type`.
- Body limit middleware: global 100 KB → 413 `{ error: "Payload too large" }`; `/v1/uploads` exempted up to 10 MB.
- `GET /health` → `{ ok: true }` after Prisma `SELECT 1`; 503 `{ error: "Database unavailable" }` on failure. `GET /ping` → `{ ok: true }` (no DB) for scaffold checks.
- `src/app.ts` / `src/server.ts` split so tests can call `app.request()` without a listener.
- Graceful shutdown: SIGINT/SIGTERM → `server.close()` → `prisma.$disconnect()` → exit 0.
- Default port: `PORT=4002` (ecommerce keeps 4001).
- Env (`backend/.env`, mirrored in `.env.example`):

  | Var | Purpose |
  | --- | --- |
  | `DATABASE_URL` | Neon Postgres connection string |
  | `PORT` | default 4002 |
  | `JF_CORS_ORIGINS` | comma-separated allowed origins |
  | `CLERK_ISSUER_URL` | e.g. `https://xyz.clerk.accounts.dev` |
  | `CLERK_SECRET_KEY` | Clerk backend API key (email fallback) |
  | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | uploads |
  | `CLERK_JWKS_JSON` | test-only JWKS override (local key set, no network) |

  Frontend env: `NEXT_PUBLIC_API_BASE` (default `http://localhost:4002`), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Root `.gitignore`: add `!.env.example` so `.env*` still ignores real env files but the template is committed. `backend/.gitignore` ignores `node_modules/`, `dist/`, `.env`.

## 3. Auth

- `auth/clerk.ts` (port of ecommerce pattern, Prisma-backed):
  - `createRemoteJWKSet(CLERK_ISSUER_URL + "/.well-known/jwks.json")`; `jwtVerify` with `issuer`, `algorithms: ["RS256"]`. `CLERK_JWKS_JSON` env switches to `createLocalJWKSet` for tests.
  - `authenticateToken(header)` → `AuthResult` = `{ ok: true, user }` | `{ ok: false, status: 401|409|503, error }`.
  - Unconfigured `CLERK_ISSUER_URL` → 503 `{ error: "Auth is not configured" }`.
  - User sync on first login: match `clerkUserId` → else link by verified email (409 if email belongs to a different `clerkUserId`) → else create `User` (role defaults `CUSTOMER`, `email`, optional `name` from Clerk API fallback).
  - Email fallback: if the token has no email claim, `fetchPrimaryEmail(sub)` calls `https://api.clerk.com/v1/users/{sub}` with `CLERK_SECRET_KEY`; also picks up `first_name`/`last_name` when present.
- `auth/middleware.ts` (Prisma-backed port of `jwt.ts`):
  - `requireAuth` — 401 `{ error }` on missing/invalid token, else `c.set("user", …)`.
  - `optionalAuth` — anonymous pass-through; sets user only if token valid.
  - `requireRole(...roles: Role[])` — 401 if no user on context, 403 if role not in list.
- Frontend: `@clerk/clerk-react` (static-export-safe; no Next server integration).
  - `src/components/Providers.tsx` — client component wrapping `<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>`; renders children unwrapped when the key is absent (keeps build green before Clerk keys exist).
  - `src/app/layout.tsx` wraps children in `<Providers>`.
  - `src/lib/api/http.ts` — `apiBase()`, `apiFetch<T>(path, { method, body, token })` with `ApiError(status, message)` thrown from `{ error }` payloads.
  - `src/lib/api/useApiToken.ts` — `useApiToken()` hook returning Clerk `getToken()` callback.
  - No sign-in UI in Phase 1 (sign-in ships with the first authenticated feature in Phase 2).

## 4. Uploads & verification

- `POST /v1/uploads` (auth required via `requireAuth`):
  - Raw body bytes; requires `Content-Type: image/*` (415 otherwise); > 10 MB → 413. Narrowed to an explicit allowlist in the phase-2 review hardening pass — see the phase-2 spec §10.
  - Cloudinary signed upload (`uploader.upload` with data URI, folder `jobfinder`, resource_type `image`) → `{ url: secure_url }`.
  - Cloudinary env incomplete → 503 `{ error: "Uploads are not configured" }` (dev-safe).
- Smoke script `src/smoke.ts` (`npm run smoke` in backend): expects base URL `JF_SMOKE_BASE` (default `http://localhost:4002`); checks `GET /health` → `{ok:true}`, unauthenticated request to an auth-gated route → 401, unauthenticated upload → 401.
- Migration: `npx prisma migrate dev --name init` against `DATABASE_URL` (Neon dev branch).

## Verification (definition of done)

1. `npm test` (backend) — all vitest suites pass: ping, health (mocked db), auth (real RS256 token via `CLERK_JWKS_JSON` + mocked db incl. sync/conflict paths), uploads (401/415/503).
2. `prisma migrate status` → up to date (requires `DATABASE_URL`).
3. Frontend `npm run build` (static export) and `npm run lint` pass with Clerk provider wired.
4. `npm run smoke` against a running dev server (health + 401 gates).

## Deferred (later phases)

Domain routes (jobs, services, rides), ride engine port to Prisma, role dashboards wiring, push notifications, seed data, rate limiting (add with first public booking route), PRODUCT.md v1-scope update.
