import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";
import { Hono } from "hono";

const userApi = { findUnique: vi.fn() };
const rateLimitBucketApi = { upsert: vi.fn(), deleteMany: vi.fn() };

vi.mock("../src/db.js", () => ({
  getPrisma: vi.fn(),
  closePrisma: vi.fn(),
}));

import { getPrisma } from "../src/db.js";
import type { AuthUser } from "../src/auth/clerk.js";
import type { Env } from "../src/auth/middleware.js";
import { optionalAuth, requireAuth } from "../src/auth/middleware.js";
import { defaultRateLimitKey, rateLimit } from "../src/rate-limit.js";

const ISSUER = "https://clerk.test";

const FIXED_NOW = new Date("2026-11-11T12:34:56.789Z");
const WINDOW_START = new Date("2026-11-11T12:34:00.000Z");
const PRUNE_CUTOFF = new Date("2026-11-11T11:34:56.789Z");

const userRow: AuthUser = {
  id: "u1",
  clerkUserId: "user_clerk1",
  name: null,
  email: "ada@example.com",
  emailVerified: null,
  image: null,
  passwordHash: null,
  role: "CUSTOMER",
  createdAt: new Date("2026-11-01T00:00:00.000Z"),
  updatedAt: new Date("2026-11-01T00:00:00.000Z"),
};

const stub = {
  user: userApi,
  rateLimitBucket: rateLimitBucketApi,
} as unknown as ReturnType<typeof getPrisma>;

let signingKeyPair: ReturnType<typeof generateKeyPairSync>;
let bucketCounts: Map<string, number>;

async function makeToken(claims: JWTPayload): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .sign(signingKeyPair.privateKey);
}

function makeLimitedApp(limit: number, windowSeconds = 60): Hono<Env> {
  const app = new Hono<Env>();
  app.use("*", rateLimit({ limit, windowSeconds }));
  app.get("/probe", (c) => c.json({ ok: true }));
  return app;
}

function makeKeyApp(): Hono<Env> {
  const app = new Hono<Env>();
  app.get("/key", (c) => c.json({ key: defaultRateLimitKey(c) }));
  app.get("/user-key", (c) => {
    c.set("user", userRow);
    return c.json({ key: defaultRateLimitKey(c) });
  });
  return app;
}

function makeAuthApp(): Hono<Env> {
  const app = new Hono<Env>();
  app.get("/public", optionalAuth, rateLimit({ limit: 10, windowSeconds: 60 }), (c) => c.json({ ok: true }));
  app.get("/private", requireAuth, rateLimit({ limit: 10, windowSeconds: 60 }), (c) => c.json({ ok: true }));
  return app;
}

async function freshLimiter(): Promise<(limit: number) => Hono<Env>> {
  vi.resetModules();
  const freshDb = await import("../src/db.js");
  const freshModule = await import("../src/rate-limit.js");
  vi.mocked(freshDb.getPrisma).mockReturnValue(stub);
  return (limit: number) => {
    const app = new Hono<Env>();
    app.use("*", freshModule.rateLimit({ limit, windowSeconds: 60 }));
    app.get("/probe", (c) => c.json({ ok: true }));
    return app;
  };
}

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FIXED_NOW);
  signingKeyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  vi.stubEnv("CLERK_ISSUER_URL", ISSUER);
  const jwk = {
    ...(await exportJWK(signingKeyPair.publicKey)),
    kid: "test-key",
    alg: "RS256",
    use: "sig",
  };
  vi.stubEnv("CLERK_JWKS_JSON", JSON.stringify({ keys: [jwk] }));
  vi.stubGlobal("fetch", vi.fn());
  vi.mocked(getPrisma).mockReturnValue(stub);
  userApi.findUnique.mockReset();
  userApi.findUnique.mockResolvedValue(userRow);
  rateLimitBucketApi.upsert.mockReset();
  rateLimitBucketApi.deleteMany.mockReset();
  rateLimitBucketApi.deleteMany.mockResolvedValue({ count: 0 });
  bucketCounts = new Map();
  rateLimitBucketApi.upsert.mockImplementation(async (args) => {
    const key = args.create.key as string;
    const windowStart = args.create.windowStart as Date;
    const bucketId = `${key}|${windowStart.toISOString()}`;
    const count = (bucketCounts.get(bucketId) ?? 0) + 1;
    bucketCounts.set(bucketId, count);
    return { key, windowStart, count };
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("rate limit middleware", () => {
  it("lets a request under the limit reach the route handler", async () => {
    const app = makeLimitedApp(2);

    const res = await app.request("/probe");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 429 with the error body once the window count exceeds the limit", async () => {
    const app = makeLimitedApp(1);

    const first = await app.request("/probe");
    expect(first.status).toBe(200);

    const second = await app.request("/probe");
    expect(second.status).toBe(429);
    expect(await second.json()).toEqual({ error: "Too many requests" });
  });

  it("returns a Retry-After header with the whole seconds left in the window", async () => {
    const app = makeLimitedApp(1);

    await app.request("/probe");
    const res = await app.request("/probe");

    const retryAfter = res.headers.get("retry-after");
    expect(retryAfter).not.toBeNull();
    const seconds = Number(retryAfter);
    expect(Number.isInteger(seconds)).toBe(true);
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBe(4);
  });

  it("counts the request that is rejected as well", async () => {
    const app = makeLimitedApp(1);

    await app.request("/probe");
    await app.request("/probe");
    const res = await app.request("/probe");

    expect(res.status).toBe(429);
    expect(rateLimitBucketApi.upsert).toHaveBeenCalledTimes(3);
  });

  it("upserts the bucket with the computed key and window start", async () => {
    const app = makeLimitedApp(5);

    const res = await app.request("/probe", {
      headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" },
    });

    expect(res.status).toBe(200);
    expect(rateLimitBucketApi.upsert).toHaveBeenCalledWith({
      where: { key_windowStart: { key: "ip:203.0.113.5", windowStart: WINDOW_START } },
      create: { key: "ip:203.0.113.5", windowStart: WINDOW_START, count: 1 },
      update: { count: { increment: 1 } },
    });
  });

  it("uses a custom key function when one is given", async () => {
    const app = new Hono<Env>();
    app.use("*", rateLimit({ limit: 5, windowSeconds: 60, key: () => "custom:1" }));
    app.get("/probe", (c) => c.json({ ok: true }));

    const res = await app.request("/probe");

    expect(res.status).toBe(200);
    expect(rateLimitBucketApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ key: "custom:1" }) }),
    );
  });

  it("prunes stale buckets once per 100 invocations", async () => {
    const makeApp = await freshLimiter();
    const app = makeApp(1000);

    for (let i = 0; i < 99; i += 1) {
      await app.request("/probe");
    }
    expect(rateLimitBucketApi.deleteMany).not.toHaveBeenCalled();

    await app.request("/probe");

    expect(rateLimitBucketApi.deleteMany).toHaveBeenCalledTimes(1);
    expect(rateLimitBucketApi.deleteMany).toHaveBeenCalledWith({
      where: { windowStart: { lt: PRUNE_CUTOFF } },
    });
  });

  it("keeps serving requests when the prune fails", async () => {
    const makeApp = await freshLimiter();
    const app = makeApp(1000);
    rateLimitBucketApi.deleteMany.mockRejectedValue(new Error("prune failed"));

    for (let i = 0; i < 100; i += 1) {
      await app.request("/probe");
    }
    const res = await app.request("/probe");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe("defaultRateLimitKey", () => {
  const app = makeKeyApp();

  it("keys an authenticated request by the user id", async () => {
    const res = await app.request("/user-key");
    expect(await res.json()).toEqual({ key: "user:u1" });
  });

  it("keys an anonymous request by the first x-forwarded-for entry", async () => {
    const res = await app.request("/key", {
      headers: { "x-forwarded-for": " 203.0.113.5 , 70.41.3.18" },
    });
    expect(await res.json()).toEqual({ key: "ip:203.0.113.5" });
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    const res = await app.request("/key", { headers: { "x-real-ip": "198.51.100.7" } });
    expect(await res.json()).toEqual({ key: "ip:198.51.100.7" });
  });

  it("falls back to the socket address when no forwarding header is present", async () => {
    const res = await app.request("/key", {}, { incoming: { socket: { remoteAddress: "203.0.113.90" } } });
    expect(await res.json()).toEqual({ key: "ip:203.0.113.90" });
  });

  it("falls back to anonymous when no address is available", async () => {
    const res = await app.request("/key");
    expect(await res.json()).toEqual({ key: "anonymous" });
  });
});

describe("rate limit mounted with the auth middleware", () => {
  const app = makeAuthApp();

  it("keys a request with a valid bearer token by the user id", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/public", { headers: { authorization: `Bearer ${token}` } });

    expect(res.status).toBe(200);
    expect(rateLimitBucketApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ key: "user:u1" }) }),
    );
  });

  it("keys an anonymous request by the client ip", async () => {
    const res = await app.request("/public", { headers: { "x-forwarded-for": "203.0.113.11" } });

    expect(res.status).toBe(200);
    expect(rateLimitBucketApi.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ key: "ip:203.0.113.11" }) }),
    );
  });

  it("does not consume a bucket when requireAuth rejects the request", async () => {
    const res = await app.request("/private");

    expect(res.status).toBe(401);
    expect(rateLimitBucketApi.upsert).not.toHaveBeenCalled();
  });
});
