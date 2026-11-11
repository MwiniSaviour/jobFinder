import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";
import { Prisma } from "@prisma/client";

const userApi = { findUnique: vi.fn() };
const jobPostApi = { findUnique: vi.fn(), findMany: vi.fn() };
const jobApplicationApi = { create: vi.fn() };
const savedJobApi = { findMany: vi.fn() };

type RawJobRow = {
  id: string;
  createdAt: Date | string;
  salaryAmount: number | null;
};

const queryRaw = vi.fn<(query: Prisma.Sql) => Promise<RawJobRow[]>>();

vi.mock("../src/db.js", () => ({
  getPrisma: vi.fn(),
  closePrisma: vi.fn(),
}));

import { getPrisma } from "../src/db.js";
import { app } from "../src/app.js";

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
  createdAt: new Date(),
  updatedAt: new Date(),
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
  createdAt: Date;
  updatedAt: Date;
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
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    updatedAt: new Date("2026-11-01T00:00:00.000Z"),
    ...overrides,
  };
}

function rawRow(id: string, overrides: Partial<RawJobRow> = {}): RawJobRow {
  return {
    id,
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    salaryAmount: 2200,
    ...overrides,
  };
}

let signingKeyPair: ReturnType<typeof generateKeyPairSync>;

async function makeToken(claims: JWTPayload): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .sign(signingKeyPair.privateKey);
}

const stub = {
  user: userApi,
  jobPost: jobPostApi,
  jobApplication: jobApplicationApi,
  savedJob: savedJobApi,
  $queryRaw: queryRaw,
} as unknown as ReturnType<typeof getPrisma>;

function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

function boundValues(): unknown[] {
  const call = queryRaw.mock.calls[0];
  if (!call) throw new Error("expected $queryRaw to be called");
  return call[0].values as unknown[];
}

function rawQueryText(): string {
  const call = queryRaw.mock.calls[0];
  if (!call) throw new Error("expected $queryRaw to be called");
  return call[0].text;
}

function encodeCursor(payload: { k: string; v: string | number | null; i: string }): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursorPayload(cursor: string): { k: string; v: string | number | null; i: string } {
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
    k: string;
    v: string | number | null;
    i: string;
  };
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
  vi.stubGlobal("fetch", vi.fn());
  vi.mocked(getPrisma).mockReturnValue(stub);
  userApi.findUnique.mockReset();
  userApi.findUnique.mockResolvedValue(userRow);
  jobPostApi.findUnique.mockReset();
  jobPostApi.findUnique.mockResolvedValue(null);
  jobPostApi.findMany.mockReset();
  jobPostApi.findMany.mockResolvedValue([]);
  jobApplicationApi.create.mockReset();
  jobApplicationApi.create.mockResolvedValue(null);
  savedJobApi.findMany.mockReset();
  savedJobApi.findMany.mockResolvedValue([]);
  queryRaw.mockReset();
  queryRaw.mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /v1/jobs", () => {
  it("returns the list to an anonymous caller", async () => {
    const res = await app.request("/v1/jobs");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [], nextCursor: null });
    expect(queryRaw).toHaveBeenCalled();
  });

  it("marks the caller's saved jobs", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    queryRaw.mockResolvedValue([rawRow("job1")]);
    jobPostApi.findMany.mockResolvedValue([
      {
        id: "job1",
        authorId: "u2",
        title: "Delivery Driver",
        description: "Deliver food",
        company: "FreshCart",
        jobType: "Full-time",
        category: "Delivery",
        salaryAmount: 2200,
        salaryFrom: null,
        salaryEst: null,
        rating: 4.5,
        reviews: 12,
        locationText: "Riverside",
        status: "PUBLISHED",
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
        updatedAt: new Date("2026-11-01T00:00:00.000Z"),
      },
    ]);
    savedJobApi.findMany.mockResolvedValue([{ postId: "job1" }]);

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { id: string; saved: boolean }[] };
    expect(body.items[0].saved).toBe(true);
    expect(savedJobApi.findMany).toHaveBeenCalledWith({ where: { userId: "u1" }, select: { postId: true } });
  });

  it("leaves the saved flag false for an anonymous caller", async () => {
    queryRaw.mockResolvedValue([rawRow("job1")]);
    jobPostApi.findMany.mockResolvedValue([
      {
        id: "job1",
        authorId: "u2",
        title: "Delivery Driver",
        description: "Deliver food",
        company: "FreshCart",
        jobType: "Full-time",
        category: "Delivery",
        salaryAmount: 2200,
        salaryFrom: null,
        salaryEst: null,
        rating: 4.5,
        reviews: 12,
        locationText: "Riverside",
        status: "PUBLISHED",
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
        updatedAt: new Date("2026-11-01T00:00:00.000Z"),
      },
    ]);

    const res = await app.request("/v1/jobs");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: { saved: boolean }[] };
    expect(body.items[0].saved).toBe(false);
    expect(savedJobApi.findMany).not.toHaveBeenCalled();
  });

  it("only lists published jobs", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain("\"status\" = 'PUBLISHED'");
  });

  it("rejects an incomplete radius filter with 400", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?lat=5.6", { headers: authHeaders(token) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid radius" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("rejects an out of range radius with 400", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?lat=5.6&lng=-0.2&radiusKm=500", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid radius" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("binds the radius filter as a distance predicate", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?lat=5.6037&lng=-0.187&radiusKm=10", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain("ST_DWithin");
    const values = boundValues();
    expect(values).toContain(10_000);
  });

  it("binds the q filter as a plainto_tsquery argument", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?q=freshcart", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain("plainto_tsquery('english'");
    expect(boundValues()).toContain("freshcart");
  });

  it("truncates the q filter to 200 characters", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const long = "a".repeat(250);

    const res = await app.request(`/v1/jobs?q=${long}`, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(boundValues()).toContain("a".repeat(200));
    expect(boundValues()).not.toContain(long);
  });

  it("skips the q filter when the query is empty", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?q=", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).not.toContain("plainto_tsquery");
  });

  it("dedupes repeated categories into a single bound array", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?categories=Delivery&categories=Delivery&categories=Tech", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const arrays = boundValues().filter((value) => Array.isArray(value));
    expect(arrays).toEqual([["Delivery", "Tech"]]);
    expect(rawQueryText()).toContain('"category" = ANY(');
  });

  it("returns 400 when more than ten categories are requested", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const categories = Array.from({ length: 11 }, (_, index) => `Category${index}`).join("&categories=");

    const res = await app.request(`/v1/jobs?categories=${categories}`, { headers: authHeaders(token) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Too many categories" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("filters out unlisted pay by default", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('"salaryAmount" IS NOT NULL');
  });

  it("drops the salary filter when includeUnlistedPay is true", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?includeUnlistedPay=true", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).not.toContain('"salaryAmount" IS NOT NULL');
    expect(rawQueryText()).toContain("WHERE \"status\" = 'PUBLISHED'");
  });

  it("orders by createdAt desc for sort=new", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?sort=new", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('"createdAt" DESC');
  });

  it("orders by salaryAmount desc nulls last for sort=pay", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?sort=pay", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('"salaryAmount" DESC');
    expect(rawQueryText()).toContain("NULLS LAST");
  });

  it("selects the sort key columns so the cursor can be built from the ordered row", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('SELECT "id", "createdAt", "salaryAmount" FROM "JobPost"');
  });

  it("applies the keyset predicate for a valid cursor", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const cursor = encodeCursor({ k: "new", v: "2026-11-01T00:00:00.000Z", i: "job9" });

    const res = await app.request(`/v1/jobs?cursor=${cursor}`, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toMatch(
      /\("createdAt" < \(\$\d+::timestamptz AT TIME ZONE 'UTC'\) OR \("createdAt" = \(\$\d+::timestamptz AT TIME ZONE 'UTC'\) AND "id" < \$\d+\)\)/,
    );
    expect(boundValues()).toContain("2026-11-01T00:00:00.000Z");
    expect(boundValues()).toContain("job9");
  });

  it("includes the null-salary rows in the pay keyset predicate for a numeric cursor", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const cursor = encodeCursor({ k: "pay", v: 2200, i: "job9" });

    const res = await app.request(`/v1/jobs?sort=pay&includeUnlistedPay=true&cursor=${cursor}`, {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('"salaryAmount" IS NOT NULL AND ("salaryAmount" <');
    expect(rawQueryText()).toContain('OR "salaryAmount" IS NULL');
    expect(boundValues()).toContain(2200);
    expect(boundValues()).toContain("job9");
  });

  it("uses the null-only pay keyset predicate when the cursor carries a null salary", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const cursor = encodeCursor({ k: "pay", v: null, i: "job9" });

    const res = await app.request(`/v1/jobs?sort=pay&includeUnlistedPay=true&cursor=${cursor}`, {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    expect(rawQueryText()).toContain('"salaryAmount" IS NULL AND "id" <');
    expect(rawQueryText()).not.toContain('"salaryAmount" IS NOT NULL AND');
    expect(boundValues()).toContain("job9");
    expect(boundValues()).not.toContain(null);
  });

  it("normalises an out-of-range cursor date to a canonical instant", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const cursor = encodeCursor({ k: "new", v: "2026-02-30T00:00:00.000Z", i: "job9" });

    const res = await app.request(`/v1/jobs?cursor=${cursor}`, { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(boundValues()).toContain("2026-03-02T00:00:00.000Z");
    expect(boundValues()).not.toContain("2026-02-30T00:00:00.000Z");
  });

  it("returns 400 for a malformed cursor", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?cursor=%25%25%25not-a-cursor%25%25%25", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid cursor" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 400 when the cursor sort does not match the request sort", async () => {
    const token = await makeToken({ sub: "user_clerk1" });
    const cursor = encodeCursor({ k: "pay", v: 2200, i: "job9" });

    const res = await app.request(`/v1/jobs?sort=new&cursor=${cursor}`, { headers: authHeaders(token) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid cursor" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid limit", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    for (const limit of ["0", "51", "abc", "20.5"]) {
      const res = await app.request(`/v1/jobs?limit=${limit}`, { headers: authHeaders(token) });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid limit" });
    }
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 400 for a present but empty limit and binds 21 when the limit is absent", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const empty = await app.request("/v1/jobs?limit=", { headers: authHeaders(token) });
    expect(empty.status).toBe(400);
    expect(await empty.json()).toEqual({ error: "Invalid limit" });
    expect(queryRaw).not.toHaveBeenCalled();

    const absent = await app.request("/v1/jobs", { headers: authHeaders(token) });
    expect(absent.status).toBe(200);
    expect(boundValues()).toContain(21);
  });

  it("returns 400 for an invalid includeUnlistedPay", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?includeUnlistedPay=yes", { headers: authHeaders(token) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid includeUnlistedPay" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid sort", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?sort=cheapest", { headers: authHeaders(token) });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid sort" });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("requests one row more than the limit", async () => {
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    expect(boundValues()).toContain(21);
  });

  it("returns the hydrated rows in the raw sql id order", async () => {
    const first = makeJob({ id: "job2", title: "Second" });
    const second = makeJob({ id: "job1", title: "First" });
    queryRaw.mockResolvedValue([rawRow("job2"), rawRow("job1")]);
    jobPostApi.findMany.mockResolvedValue([second, first]);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.map((item: { id: string }) => item.id)).toEqual(["job2", "job1"]);
    expect(body.nextCursor).toBeNull();
  });

  it("returns a next cursor built from the last raw ordered row", async () => {
    const first = makeJob({ id: "job1", createdAt: new Date("2026-11-10T00:00:00.000Z") });
    const second = makeJob({ id: "job2", createdAt: new Date("2026-11-09T00:00:00.000Z") });
    const extra = makeJob({ id: "job3", createdAt: new Date("2026-11-08T00:00:00.000Z") });
    queryRaw.mockResolvedValue([
      rawRow("job1", { createdAt: new Date("2026-11-10T00:00:00.000Z") }),
      rawRow("job2", { createdAt: new Date("2026-11-09T00:00:00.000Z") }),
      rawRow("job3", { createdAt: new Date("2026-11-08T00:00:00.000Z") }),
    ]);
    jobPostApi.findMany.mockResolvedValue([first, second, extra]);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?limit=2", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.map((item: { id: string }) => item.id)).toEqual(["job1", "job2"]);
    expect(decodeCursorPayload(body.nextCursor)).toEqual({
      k: "new",
      v: "2026-11-09T00:00:00.000Z",
      i: "job2",
    });
  });

  it("builds the next cursor from the raw ordered row instead of the hydrated row", async () => {
    queryRaw.mockResolvedValue([
      rawRow("job1", { createdAt: new Date("2026-11-10T00:00:00.000Z") }),
      rawRow("job2", { createdAt: new Date("2026-11-09T00:00:00.000Z") }),
    ]);
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job1", createdAt: new Date("2026-11-01T00:00:00.000Z") }),
    ]);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?limit=1", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(decodeCursorPayload(body.nextCursor)).toEqual({
      k: "new",
      v: "2026-11-10T00:00:00.000Z",
      i: "job1",
    });
  });

  it("emits a next cursor that encodes a null salary for the last pay row", async () => {
    const first = makeJob({ id: "job1", salaryAmount: 100 });
    const second = makeJob({ id: "job2", salaryAmount: null });
    queryRaw.mockResolvedValue([
      rawRow("job1", { salaryAmount: 100 }),
      rawRow("job2", { salaryAmount: null }),
      rawRow("job3", { salaryAmount: null }),
    ]);
    jobPostApi.findMany.mockResolvedValue([first, second]);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?sort=pay&includeUnlistedPay=true&limit=2", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.map((item: { id: string }) => item.id)).toEqual(["job1", "job2"]);
    expect(body.nextCursor).not.toBeNull();
    expect(decodeCursorPayload(body.nextCursor)).toEqual({ k: "pay", v: null, i: "job2" });
  });

  it("builds the pay cursor from the raw ordered row instead of the hydrated row", async () => {
    queryRaw.mockResolvedValue([
      rawRow("job1", { salaryAmount: 100 }),
      rawRow("job2", { salaryAmount: 50 }),
    ]);
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job1", salaryAmount: 900 }),
    ]);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs?sort=pay&includeUnlistedPay=true&limit=1", {
      headers: authHeaders(token),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(decodeCursorPayload(body.nextCursor)).toEqual({ k: "pay", v: 100, i: "job1" });
  });
});

describe("GET /v1/jobs/:id", () => {
  it("returns the job summary", async () => {
    jobPostApi.findUnique.mockResolvedValue(
      makeJob({ salaryAmount: null, salaryFrom: null, salaryEst: null }),
    );
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/job1", { headers: authHeaders(token) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: "job1",
      title: "Delivery Rider",
      description: "Deliver food across Accra",
      company: "FreshCart",
      jobType: "Full-time",
      category: "Delivery",
      salaryAmount: null,
      salaryFrom: null,
      salaryEst: null,
      rating: 4.5,
      reviews: 12,
      createdAt: "2026-11-01T00:00:00.000Z",
      posted: expect.stringMatching(/^(\d+ (minute|hour|day|week|month|year)s? ago|just now)$/),
      locationText: null,
      status: "PUBLISHED",
      saved: false,
    });
    expect(Object.keys(body)).not.toContain("authorId");
    expect("salaryAmount" in body).toBe(true);
    expect("salaryFrom" in body).toBe(true);
    expect("salaryEst" in body).toBe(true);
  });

  it("returns 404 for an unknown job", async () => {
    jobPostApi.findUnique.mockResolvedValue(null);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/missing", { headers: authHeaders(token) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
  });
});

describe("POST /v1/jobs/:id/applications", () => {
  const createdApplication = {
    id: "app1",
    postId: "job1",
    applicantId: "u1",
    status: "SUBMITTED",
    createdAt: new Date("2026-11-11T00:00:00.000Z"),
    updatedAt: new Date("2026-11-11T00:00:00.000Z"),
  };

  it("returns 401 without a bearer token", async () => {
    const res = await app.request("/v1/jobs/job1/applications", { method: "POST" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobPostApi.findUnique).not.toHaveBeenCalled();
    expect(jobApplicationApi.create).not.toHaveBeenCalled();
  });

  it("creates the application and returns it with the post summary", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob());
    jobApplicationApi.create.mockResolvedValue(createdApplication);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/job1/applications", {
      method: "POST",
      headers: authHeaders(token),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      id: "app1",
      postId: "job1",
      status: "SUBMITTED",
      answers: null,
      createdAt: "2026-11-11T00:00:00.000Z",
      updatedAt: "2026-11-11T00:00:00.000Z",
      post: { id: "job1", title: "Delivery Rider", company: "FreshCart" },
    });
    expect(jobPostApi.findUnique).toHaveBeenCalledTimes(1);
    expect(jobApplicationApi.create).toHaveBeenCalledWith({
      data: { postId: "job1", applicantId: "u1", status: "SUBMITTED" },
    });
  });

  it("returns 404 when the job does not exist", async () => {
    jobPostApi.findUnique.mockResolvedValue(null);
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/missing/applications", {
      method: "POST",
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(jobApplicationApi.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the application already exists", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob());
    jobApplicationApi.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/job1/applications", {
      method: "POST",
      headers: authHeaders(token),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Already applied" });
  });

  it("returns 404 when the job is deleted before the application is created", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob());
    jobApplicationApi.create.mockRejectedValue(Object.assign(new Error("fk"), { code: "P2003" }));
    const token = await makeToken({ sub: "user_clerk1" });

    const res = await app.request("/v1/jobs/job1/applications", {
      method: "POST",
      headers: authHeaders(token),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
  });
});
