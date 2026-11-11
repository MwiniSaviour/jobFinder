import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";
import { Hono } from "hono";
import type { Env } from "../src/auth/middleware.js";

vi.mock("../src/db.js", () => ({
  getPrisma: vi.fn(),
  closePrisma: vi.fn(),
}));

import { getPrisma } from "../src/db.js";
import { savedJobs } from "../src/routes/v1/saved-jobs.js";
import { recentSearches } from "../src/routes/v1/recent-searches.js";

const ISSUER = "https://clerk.test";

const userRow = {
  id: "u1",
  clerkUserId: "user_clerk1",
  name: null,
  email: "ada@example.com",
  emailVerified: null,
  image: null,
  passwordHash: null,
  role: "CUSTOMER",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

type JobRow = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  company: string | null;
  jobType: string | null;
  category: string | null;
  salaryAmount: number | null;
  salaryFrom: boolean | null;
  salaryEst: boolean | null;
  rating: number | null;
  reviews: number | null;
  lat: number | null;
  lng: number | null;
  locationText: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type SavedJobRow = { id: string; userId: string; postId: string; createdAt: Date };

type RecentSearchRow = {
  id: string;
  userId: string;
  query: string;
  queryKey: string;
  createdAt: Date;
};

function makeJob(overrides: Partial<JobRow> = {}): JobRow {
  return {
    id: "job1",
    authorId: "u2",
    title: "Delivery Rider",
    description: "Deliver food across Accra",
    company: "FreshCart",
    jobType: "Full-time",
    category: "Delivery",
    salaryAmount: 2200,
    salaryFrom: true,
    salaryEst: false,
    rating: 4.5,
    reviews: 12,
    lat: null,
    lng: null,
    locationText: "Riverside, Accra",
    status: "PUBLISHED",
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    updatedAt: new Date("2026-11-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeSavedJob(overrides: Partial<SavedJobRow> = {}): SavedJobRow {
  return {
    id: "s1",
    userId: "u1",
    postId: "job1",
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeRecentSearch(overrides: Partial<RecentSearchRow> = {}): RecentSearchRow {
  return {
    id: "r1",
    userId: "u1",
    query: "delivery",
    queryKey: "delivery",
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    ...overrides,
  };
}

const userApi = { findUnique: vi.fn() };
const savedJobApi = { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() };
const recentSearchApi = { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() };
const jobPostApi = { findMany: vi.fn(), findUnique: vi.fn() };

const stub = {
  user: userApi,
  savedJob: savedJobApi,
  recentSearch: recentSearchApi,
  jobPost: jobPostApi,
} as unknown as ReturnType<typeof getPrisma>;

const testApp = new Hono<Env>();
testApp.route("/v1/saved-jobs", savedJobs);
testApp.route("/v1/recent-searches", recentSearches);

let signingKeyPair: ReturnType<typeof generateKeyPairSync>;

async function makeToken(claims: JWTPayload): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .sign(signingKeyPair.privateKey);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await makeToken({ sub: "user_clerk1" });
  return { authorization: `Bearer ${token}` };
}

function jsonHeaders(headers: Record<string, string>): Record<string, string> {
  return { ...headers, "content-type": "application/json" };
}

beforeEach(async () => {
  signingKeyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  vi.stubEnv("CLERK_ISSUER_URL", ISSUER);
  const jwk = {
    ...(await exportJWK(signingKeyPair.publicKey)),
    kid: "test-key",
    alg: "RS256",
    use: "sig",
  };
  vi.stubEnv("CLERK_JWKS_JSON", JSON.stringify({ keys: [jwk] }));
  vi.mocked(getPrisma).mockReturnValue(stub);
  userApi.findUnique.mockReset();
  userApi.findUnique.mockResolvedValue(userRow);
  savedJobApi.findMany.mockReset();
  savedJobApi.findMany.mockResolvedValue([]);
  savedJobApi.upsert.mockReset();
  savedJobApi.upsert.mockResolvedValue(makeSavedJob());
  savedJobApi.deleteMany.mockReset();
  savedJobApi.deleteMany.mockResolvedValue({ count: 1 });
  recentSearchApi.findMany.mockReset();
  recentSearchApi.findMany.mockResolvedValue([]);
  recentSearchApi.upsert.mockReset();
  recentSearchApi.upsert.mockResolvedValue(makeRecentSearch());
  recentSearchApi.deleteMany.mockReset();
  recentSearchApi.deleteMany.mockResolvedValue({ count: 2 });
  jobPostApi.findMany.mockReset();
  jobPostApi.findMany.mockResolvedValue([]);
  jobPostApi.findUnique.mockReset();
  jobPostApi.findUnique.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /v1/saved-jobs", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/saved-jobs");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(savedJobApi.findMany).not.toHaveBeenCalled();
  });

  it("returns the saved jobs in saved order with saved true", async () => {
    savedJobApi.findMany.mockResolvedValue([
      makeSavedJob({ id: "s2", postId: "job2", createdAt: new Date("2026-11-02T00:00:00.000Z") }),
      makeSavedJob({ id: "s1", postId: "job1", createdAt: new Date("2026-11-01T00:00:00.000Z") }),
    ]);
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job2", title: "Second" }),
      makeJob({ id: "job1", title: "First" }),
    ]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", { headers });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { id: string; saved: boolean }[] };
    expect(body.items.map((item) => item.id)).toEqual(["job2", "job1"]);
    expect(body.items.every((item) => item.saved)).toBe(true);
    expect(body.items[0]).toEqual(
      expect.objectContaining({
        id: "job2",
        title: "Second",
        company: "FreshCart",
        locationText: "Riverside, Accra",
        status: "PUBLISHED",
        saved: true,
      }),
    );
  });

  it("reads the saved rows for the caller ordered by createdAt and id descending", async () => {
    savedJobApi.findMany.mockResolvedValue([makeSavedJob()]);
    jobPostApi.findMany.mockResolvedValue([makeJob()]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", { headers });

    expect(res.status).toBe(200);
    expect(savedJobApi.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  });

  it("loads the saved posts by id and rebuilds the items in the saved order", async () => {
    savedJobApi.findMany.mockResolvedValue([
      makeSavedJob({ id: "s2", postId: "job2" }),
      makeSavedJob({ id: "s1", postId: "job1" }),
    ]);
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job1" }),
      makeJob({ id: "job2" }),
    ]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", { headers });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { id: string }[] };
    expect(body.items.map((item) => item.id)).toEqual(["job2", "job1"]);
    const [postArgs] = jobPostApi.findMany.mock.calls[0] as [
      { where: { id: { in: string[] } } },
    ];
    expect(postArgs.where).toEqual({ id: { in: ["job2", "job1"] } });
  });

  it("skips a saved row whose post no longer exists", async () => {
    savedJobApi.findMany.mockResolvedValue([
      makeSavedJob({ id: "s3", postId: "job3" }),
      makeSavedJob({ id: "s2", postId: "job2" }),
      makeSavedJob({ id: "s1", postId: "job1" }),
    ]);
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job2", title: "Second" }),
      makeJob({ id: "job1", title: "First" }),
    ]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", { headers });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { id: string }[] };
    expect(body.items.map((item) => item.id)).toEqual(["job2", "job1"]);
  });

  it("returns an empty list when nothing is saved", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", { headers });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [] });
  });
});

describe("POST /v1/saved-jobs", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: "job1" }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(savedJobApi.upsert).not.toHaveBeenCalled();
  });

  it("upserts the saved row with the caller id and the post id", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1" }));
    savedJobApi.upsert.mockResolvedValue(makeSavedJob({ postId: "job1" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ postId: "job1" }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ postId: "job1", saved: true });
    expect(savedJobApi.upsert).toHaveBeenCalledTimes(1);
    expect(savedJobApi.upsert).toHaveBeenCalledWith({
      where: { userId_postId: { userId: "u1", postId: "job1" } },
      create: { userId: "u1", postId: "job1" },
      update: {},
    });
  });

  it("is idempotent when the same job is saved twice", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1" }));
    const headers = await authHeaders();

    const first = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ postId: "job1" }),
    });
    const second = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ postId: "job1" }),
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(await second.json()).toEqual({ postId: "job1", saved: true });
    expect(savedJobApi.upsert).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = savedJobApi.upsert.mock.calls as [
      [{ where: { userId_postId: { userId: string; postId: string } } }],
      [{ where: { userId_postId: { userId: string; postId: string } } }],
    ];
    expect(firstCall[0].where).toEqual(secondCall[0].where);
    expect(savedJobApi.deleteMany).not.toHaveBeenCalled();
  });

  it("returns 404 when the post does not exist", async () => {
    jobPostApi.findUnique.mockResolvedValue(null);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ postId: "missing" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(savedJobApi.upsert).not.toHaveBeenCalled();
  });

  it("returns 400 for a missing, empty, blank or non-string postId", async () => {
    const headers = await authHeaders();

    const bodies = [
      JSON.stringify({}),
      JSON.stringify({ postId: "" }),
      JSON.stringify({ postId: "   " }),
      JSON.stringify({ postId: 42 }),
      JSON.stringify({ postId: null }),
      JSON.stringify({ postId: ["job1"] }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/saved-jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid postId" });
    }
    expect(jobPostApi.findUnique).not.toHaveBeenCalled();
    expect(savedJobApi.upsert).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed json body", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: "not-json",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid postId" });
    expect(savedJobApi.upsert).not.toHaveBeenCalled();
  });
});

describe("DELETE /v1/saved-jobs/:postId", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/saved-jobs/job1", { method: "DELETE" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(savedJobApi.deleteMany).not.toHaveBeenCalled();
  });

  it("removes the saved row for the caller and returns 204", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs/job1", { method: "DELETE", headers });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(savedJobApi.deleteMany).toHaveBeenCalledTimes(1);
    expect(savedJobApi.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", postId: "job1" },
    });
  });

  it("returns 204 when the job was not saved", async () => {
    savedJobApi.deleteMany.mockResolvedValue({ count: 0 });
    const headers = await authHeaders();

    const res = await testApp.request("/v1/saved-jobs/never-saved", {
      method: "DELETE",
      headers,
    });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(savedJobApi.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", postId: "never-saved" },
    });
  });
});

describe("GET /v1/recent-searches", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/recent-searches");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(recentSearchApi.findMany).not.toHaveBeenCalled();
  });

  it("returns the recent searches newest first with the createdAt timestamp", async () => {
    recentSearchApi.findMany.mockResolvedValue([
      makeRecentSearch({
        id: "r2",
        query: "driver",
        queryKey: "driver",
        createdAt: new Date("2026-11-02T00:00:00.000Z"),
      }),
      makeRecentSearch({
        id: "r1",
        query: "delivery",
        queryKey: "delivery",
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
      }),
    ]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", { headers });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      items: [
        { query: "driver", createdAt: "2026-11-02T00:00:00.000Z" },
        { query: "delivery", createdAt: "2026-11-01T00:00:00.000Z" },
      ],
    });
  });

  it("reads the caller's searches ordered by createdAt and id descending and capped at 20", async () => {
    recentSearchApi.findMany.mockResolvedValue([makeRecentSearch()]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", { headers });

    expect(res.status).toBe(200);
    expect(recentSearchApi.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20,
    });
  });

  it("returns an empty list when there are no recent searches", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", { headers });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [] });
  });
});

describe("POST /v1/recent-searches", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "delivery" }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(recentSearchApi.upsert).not.toHaveBeenCalled();
  });

  it("stores the trimmed query with a lowercased query key", async () => {
    recentSearchApi.upsert.mockResolvedValue(
      makeRecentSearch({
        query: "Delivery",
        queryKey: "delivery",
        createdAt: new Date("2026-11-11T00:00:00.000Z"),
      }),
    );
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ query: "  Delivery  " }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      query: "Delivery",
      createdAt: "2026-11-11T00:00:00.000Z",
    });
    expect(recentSearchApi.upsert).toHaveBeenCalledWith({
      where: { userId_queryKey: { userId: "u1", queryKey: "delivery" } },
      create: { userId: "u1", query: "Delivery", queryKey: "delivery" },
      update: { query: "Delivery", createdAt: expect.any(Date) },
    });
  });

  it("dedupes repeated searches case insensitively on the same query key", async () => {
    const headers = await authHeaders();

    const first = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ query: "Delivery" }),
    });
    const second = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ query: "delivery" }),
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(recentSearchApi.upsert).toHaveBeenCalledTimes(2);
    const calls = recentSearchApi.upsert.mock.calls as [
      [{ where: { userId_queryKey: { userId: string; queryKey: string } } }],
      [{ where: { userId_queryKey: { userId: string; queryKey: string } } }],
    ];
    expect(calls[0][0].where.userId_queryKey).toEqual({ userId: "u1", queryKey: "delivery" });
    expect(calls[1][0].where.userId_queryKey).toEqual({ userId: "u1", queryKey: "delivery" });
  });

  it("returns 400 for a missing, empty, blank or non-string query", async () => {
    const headers = await authHeaders();

    const bodies = [
      JSON.stringify({}),
      JSON.stringify({ query: "" }),
      JSON.stringify({ query: "   " }),
      JSON.stringify({ query: 42 }),
      JSON.stringify({ query: null }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/recent-searches", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid query" });
    }
    expect(recentSearchApi.upsert).not.toHaveBeenCalled();
  });

  it("returns 400 for a query longer than 120 characters", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ query: "a".repeat(121) }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid query" });
    expect(recentSearchApi.upsert).not.toHaveBeenCalled();
  });

  it("accepts a query of exactly 120 characters", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ query: "a".repeat(120) }),
    });

    expect(res.status).toBe(201);
    expect(recentSearchApi.upsert).toHaveBeenCalledTimes(1);
  });
});

describe("DELETE /v1/recent-searches", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/recent-searches", { method: "DELETE" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(recentSearchApi.deleteMany).not.toHaveBeenCalled();
  });

  it("clears every recent search of the caller and returns 204", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/recent-searches", { method: "DELETE", headers });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(recentSearchApi.deleteMany).toHaveBeenCalledTimes(1);
    expect(recentSearchApi.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
  });
});
