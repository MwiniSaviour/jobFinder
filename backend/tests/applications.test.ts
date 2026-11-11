import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";
import type { Prisma } from "@prisma/client";

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
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

type StatusName = "SUBMITTED" | "REVIEWING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type ApplicationRow = {
  id: string;
  postId: string;
  applicantId: string;
  status: StatusName;
  createdAt: Date;
  updatedAt: Date;
  post: { id: string; title: string; company: string | null };
};

type RawApplicationRow = { id: string; createdAt: Date };

function applicationRow(overrides: Partial<ApplicationRow> = {}): ApplicationRow {
  return {
    id: "app1",
    postId: "post1",
    applicantId: "u1",
    status: "SUBMITTED",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    post: { id: "post1", title: "Backend Engineer", company: "Acme" },
    ...overrides,
  };
}

function rawRow(id: string, createdAt: string): RawApplicationRow {
  return { id, createdAt: new Date(createdAt) };
}

const older = applicationRow({ id: "app1", createdAt: new Date("2026-01-01T00:00:00.000Z") });
const newer = applicationRow({
  id: "app2",
  postId: "post2",
  createdAt: new Date("2026-01-02T00:00:00.000Z"),
  post: { id: "post2", title: "Platform Engineer", company: "Globex" },
});

const userApi = { findUnique: vi.fn() };
const jobApplicationApi = {
  findFirst: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
};
const rawApi = vi.fn();

const stub = {
  user: userApi,
  jobApplication: jobApplicationApi,
  $queryRaw: rawApi,
} as unknown as ReturnType<typeof getPrisma>;

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

function listApplications(query = "", headers: Record<string, string>) {
  return app.request(`/v1/applications${query}`, { headers });
}

function withdrawApplication(id: string, headers: Record<string, string>) {
  return app.request(`/v1/applications/${id}/withdraw`, { method: "POST", headers });
}

function encodeCursor(payload: { k: string; v: string; i: string }): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function lastRawQuery(): Prisma.Sql {
  const call = rawApi.mock.calls[0];
  expect(call, "expected $queryRaw to have been called").toBeDefined();
  return call?.[0] as Prisma.Sql;
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
  jobApplicationApi.findFirst.mockReset();
  jobApplicationApi.findMany.mockReset();
  jobApplicationApi.update.mockReset();
  jobApplicationApi.updateMany.mockReset();
  rawApi.mockReset();
  rawApi.mockResolvedValue([]);
  jobApplicationApi.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /v1/applications", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await app.request("/v1/applications");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("returns the caller's applications in sql id order with post summaries", async () => {
    rawApi.mockResolvedValue([
      rawRow("app2", "2026-01-02T00:00:00.000Z"),
      rawRow("app1", "2026-01-01T00:00:00.000Z"),
    ]);
    jobApplicationApi.findMany.mockResolvedValue([older, newer]);
    const headers = await authHeaders();

    const res = await listApplications("", headers);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      items: [
        {
          id: "app2",
          postId: "post2",
          status: "SUBMITTED",
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          answers: null,
          post: { id: "post2", title: "Platform Engineer", company: "Globex" },
        },
        {
          id: "app1",
          postId: "post1",
          status: "SUBMITTED",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          answers: null,
          post: { id: "post1", title: "Backend Engineer", company: "Acme" },
        },
      ],
      nextCursor: null,
    });
    expect(jobApplicationApi.findMany).toHaveBeenCalledTimes(1);
    const [findArgs] = jobApplicationApi.findMany.mock.calls[0] as [
      { where: { id: { in: string[] } }; include: unknown },
    ];
    expect(findArgs.where).toEqual({ id: { in: ["app2", "app1"] } });
    expect(findArgs.include).toEqual({
      post: { select: { id: true, title: true, company: true } },
    });
  });

  it("scopes the raw query to the caller and orders by createdAt and id descending", async () => {
    rawApi.mockResolvedValue([rawRow("app1", "2026-01-01T00:00:00.000Z")]);
    jobApplicationApi.findMany.mockResolvedValue([older]);
    const headers = await authHeaders();

    const res = await listApplications("", headers);

    expect(res.status).toBe(200);
    const query = lastRawQuery();
    expect(query.text).toContain('SELECT "id", "createdAt"');
    expect(query.text).toContain('"applicantId" =');
    expect(query.text).toContain('ORDER BY "createdAt" DESC, "id" DESC');
    expect(query.text).toContain("LIMIT");
    expect(query.values).toContain("u1");
  });

  it("uses exactly two database calls per list request", async () => {
    rawApi.mockResolvedValue([rawRow("app1", "2026-01-01T00:00:00.000Z")]);
    jobApplicationApi.findMany.mockResolvedValue([older]);
    const headers = await authHeaders();

    const res = await listApplications("", headers);

    expect(res.status).toBe(200);
    expect(rawApi).toHaveBeenCalledTimes(1);
    expect(jobApplicationApi.findMany).toHaveBeenCalledTimes(1);
  });

  it("binds the keyset predicate and its cursor values when a cursor is present", async () => {
    rawApi.mockResolvedValue([rawRow("app1", "2026-01-01T00:00:00.000Z")]);
    jobApplicationApi.findMany.mockResolvedValue([older]);
    const headers = await authHeaders();
    const cursor = encodeCursor({ k: "new", v: "2026-01-02T00:00:00.000Z", i: "app2" });

    const res = await listApplications(`?cursor=${encodeURIComponent(cursor)}`, headers);

    expect(res.status).toBe(200);
    const query = lastRawQuery();
    expect(query.text).toContain('"createdAt" <');
    expect(query.text).toContain("::timestamptz AT TIME ZONE 'UTC'");
    expect(query.text).toContain('"id" <');
    expect(query.values).toContain("2026-01-02T00:00:00.000Z");
    expect(query.values).toContain("app2");
  });

  it("returns 400 for a malformed cursor", async () => {
    const headers = await authHeaders();

    const res = await listApplications("?cursor=not-a-valid-cursor!!", headers);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid cursor" });
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("returns 400 for a cursor whose key is not new", async () => {
    const headers = await authHeaders();
    const cursor = encodeCursor({ k: "pay", v: "2026-01-02T00:00:00.000Z", i: "app2" });

    const res = await listApplications(`?cursor=${encodeURIComponent(cursor)}`, headers);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid cursor" });
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid limit", async () => {
    const headers = await authHeaders();

    for (const limit of ["0", "51", "abc"]) {
      const res = await listApplications(`?limit=${limit}`, headers);

      expect(res.status, `limit=${limit}`).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid limit" });
    }
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("returns 400 for a limit that is present but empty", async () => {
    const headers = await authHeaders();

    const res = await listApplications("?limit=", headers);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid limit" });
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("returns 400 for a limit that is present but padded with whitespace", async () => {
    const headers = await authHeaders();

    const res = await listApplications("?limit=%20", headers);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid limit" });
    expect(rawApi).not.toHaveBeenCalled();
  });

  it("binds a limit of 21 by default", async () => {
    rawApi.mockResolvedValue([rawRow("app1", "2026-01-01T00:00:00.000Z")]);
    jobApplicationApi.findMany.mockResolvedValue([older]);
    const headers = await authHeaders();

    const res = await listApplications("", headers);

    expect(res.status).toBe(200);
    expect(lastRawQuery().values).toContain(21);
  });

  it("normalises an out-of-range cursor date before binding it", async () => {
    rawApi.mockResolvedValue([rawRow("app1", "2026-01-01T00:00:00.000Z")]);
    jobApplicationApi.findMany.mockResolvedValue([older]);
    const headers = await authHeaders();
    const cursor = encodeCursor({ k: "new", v: "2026-02-30T00:00:00.000Z", i: "app2" });

    const res = await listApplications(`?cursor=${encodeURIComponent(cursor)}`, headers);

    expect(res.status).toBe(200);
    const query = lastRawQuery();
    expect(query.values).toContain("2026-03-02T00:00:00.000Z");
    expect(query.values).not.toContain("2026-02-30T00:00:00.000Z");
  });

  it("returns a next cursor built from the last returned row when more rows exist", async () => {
    rawApi.mockResolvedValue([
      rawRow("app2", "2026-01-02T00:00:00.000Z"),
      rawRow("app1", "2026-01-01T00:00:00.000Z"),
      rawRow("app0", "2025-12-31T00:00:00.000Z"),
    ]);
    jobApplicationApi.findMany.mockResolvedValue([
      older,
      newer,
      applicationRow({ id: "app0", createdAt: new Date("2025-12-31T00:00:00.000Z") }),
    ]);
    const headers = await authHeaders();

    const res = await listApplications("?limit=2", headers);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: ApplicationRow[]; nextCursor: string | null };
    expect(body.items).toHaveLength(2);
    expect(body.items.map((item) => item.id)).toEqual(["app2", "app1"]);
    expect(body.nextCursor).not.toBeNull();
    const decoded = JSON.parse(
      Buffer.from(String(body.nextCursor), "base64url").toString("utf8"),
    ) as { k: string; v: string; i: string };
    expect(decoded).toEqual({ k: "new", v: "2026-01-01T00:00:00.000Z", i: "app1" });
  });

  it("builds the next cursor from the raw ordered row", async () => {
    rawApi.mockResolvedValue([
      rawRow("app2", "2026-01-02T00:00:00.000Z"),
      rawRow("app1", "2026-01-01T00:00:00.000Z"),
      rawRow("app0", "2025-12-31T00:00:00.000Z"),
    ]);
    jobApplicationApi.findMany.mockResolvedValue([
      applicationRow({ id: "app2", createdAt: new Date("2026-01-02T00:00:00.000Z") }),
      applicationRow({
        id: "app1",
        createdAt: new Date("2026-05-05T00:00:00.000Z"),
        post: { id: "post1", title: "Backend Engineer", company: "Acme" },
      }),
      applicationRow({ id: "app0", createdAt: new Date("2025-12-31T00:00:00.000Z") }),
    ]);
    const headers = await authHeaders();

    const res = await listApplications("?limit=2", headers);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { nextCursor: string | null };
    const decoded = JSON.parse(
      Buffer.from(String(body.nextCursor), "base64url").toString("utf8"),
    ) as { k: string; v: string; i: string };
    expect(decoded).toEqual({ k: "new", v: "2026-01-01T00:00:00.000Z", i: "app1" });
  });
});

describe("POST /v1/applications/:id/withdraw", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await app.request("/v1/applications/app1/withdraw", { method: "POST" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobApplicationApi.findFirst).not.toHaveBeenCalled();
    expect(jobApplicationApi.updateMany).not.toHaveBeenCalled();
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
  });

  it("withdraws a submitted application and returns the updated row", async () => {
    const withdrawn = applicationRow({
      status: "WITHDRAWN",
      updatedAt: new Date("2026-01-05T00:00:00.000Z"),
    });
    jobApplicationApi.updateMany.mockResolvedValue({ count: 1 });
    jobApplicationApi.findFirst.mockResolvedValue(withdrawn);
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: "app1",
      postId: "post1",
      status: "WITHDRAWN",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
      answers: null,
      post: { id: "post1", title: "Backend Engineer", company: "Acme" },
    });
    expect(jobApplicationApi.updateMany).toHaveBeenCalledTimes(1);
    expect(jobApplicationApi.findFirst).toHaveBeenCalledTimes(1);
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
    const [findArgs] = jobApplicationApi.findFirst.mock.calls[0] as [
      { where: { id: string; applicantId: string }; include: unknown },
    ];
    expect(findArgs.where).toEqual({ id: "app1", applicantId: "u1" });
    expect(findArgs.include).toEqual({
      post: { select: { id: true, title: true, company: true } },
    });
  });

  it("withdraws a reviewing application", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 1 });
    jobApplicationApi.findFirst.mockResolvedValue(
      applicationRow({ status: "WITHDRAWN", updatedAt: new Date("2026-01-05T00:00:00.000Z") }),
    );
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("WITHDRAWN");
  });

  it("ignores the request body", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 1 });
    jobApplicationApi.findFirst.mockResolvedValue(applicationRow({ status: "WITHDRAWN" }));
    const headers = await authHeaders();

    const res = await app.request("/v1/applications/app1/withdraw", {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ reason: "found something else" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("WITHDRAWN");
  });

  it("enforces ownership and the allowed source states in the write itself", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 1 });
    jobApplicationApi.findFirst.mockResolvedValue(applicationRow({ status: "WITHDRAWN" }));
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(200);
    const [updateArgs] = jobApplicationApi.updateMany.mock.calls[0] as [
      {
        where: { id: string; applicantId: string; status: { in: string[] } };
        data: { status: string };
      },
    ];
    expect(updateArgs.where).toEqual({
      id: "app1",
      applicantId: "u1",
      status: { in: ["SUBMITTED", "REVIEWING"] },
    });
    expect(updateArgs.data).toEqual({ status: "WITHDRAWN" });
  });

  it("returns 404 when the application is missing or owned by someone else", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 0 });
    jobApplicationApi.findFirst.mockResolvedValue(null);
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Application not found" });
    expect(jobApplicationApi.findFirst).toHaveBeenCalledTimes(1);
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
  });

  it("returns 409 when the application is already withdrawn", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 0 });
    jobApplicationApi.findFirst.mockResolvedValue(applicationRow({ status: "WITHDRAWN" }));
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Application already withdrawn" });
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
  });

  it("returns 409 when the application is accepted", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 0 });
    jobApplicationApi.findFirst.mockResolvedValue(applicationRow({ status: "ACCEPTED" }));
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Application can no longer be withdrawn" });
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
  });

  it("returns 409 when the application is rejected", async () => {
    jobApplicationApi.updateMany.mockResolvedValue({ count: 0 });
    jobApplicationApi.findFirst.mockResolvedValue(applicationRow({ status: "REJECTED" }));
    const headers = await authHeaders();

    const res = await withdrawApplication("app1", headers);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Application can no longer be withdrawn" });
    expect(jobApplicationApi.update).not.toHaveBeenCalled();
  });
});
