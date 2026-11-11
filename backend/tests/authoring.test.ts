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
import { employerJobs } from "../src/routes/v1/employer-jobs.js";

const ISSUER = "https://clerk.test";

type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

type UserRow = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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

type ApplicationRow = {
  id: string;
  postId: string;
  applicantId: string;
  status: string;
  answers: unknown;
  createdAt: Date;
  updatedAt: Date;
  applicant: { id: string; name: string | null; email: string | null };
  post: { id: string; title: string; company: string | null };
};

function makeUser(role: UserRole, id = "u1"): UserRow {
  return {
    id,
    clerkUserId: "user_clerk1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: null,
    image: null,
    passwordHash: null,
    role,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function makeJob(overrides: Partial<JobRow> = {}): JobRow {
  return {
    id: "job1",
    authorId: "u1",
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

function makeApplication(overrides: Partial<ApplicationRow> = {}): ApplicationRow {
  return {
    id: "app1",
    postId: "job1",
    applicantId: "u2",
    status: "SUBMITTED",
    answers: { startDate: "2026-12-01", note: "Available weekends" },
    createdAt: new Date("2026-11-11T00:00:00.000Z"),
    updatedAt: new Date("2026-11-11T00:00:00.000Z"),
    applicant: { id: "u2", name: "Grace Hopper", email: "grace@example.com" },
    post: { id: "job1", title: "Delivery Rider", company: "FreshCart" },
    ...overrides,
  };
}

const userApi = { findUnique: vi.fn() };
const jobPostApi = { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() };
const jobApplicationApi = { findMany: vi.fn() };
const executeRaw = vi.fn<(query: TemplateStringsArray, ...values: unknown[]) => Promise<number>>();

const stub = {
  user: userApi,
  jobPost: jobPostApi,
  jobApplication: jobApplicationApi,
  $executeRaw: executeRaw,
} as unknown as ReturnType<typeof getPrisma>;

const testApp = new Hono<Env>();
testApp.route("/v1", employerJobs);

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

function rawSqlText(callIndex: number): string {
  const call = executeRaw.mock.calls[callIndex];
  if (!call) throw new Error("expected $executeRaw to be called");
  return call[0].join("?");
}

function rawSqlValues(callIndex: number): unknown[] {
  const call = executeRaw.mock.calls[callIndex];
  if (!call) throw new Error("expected $executeRaw to be called");
  return call.slice(1);
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
  userApi.findUnique.mockResolvedValue(makeUser("PROVIDER"));
  jobPostApi.findUnique.mockReset();
  jobPostApi.findUnique.mockResolvedValue(null);
  jobPostApi.findMany.mockReset();
  jobPostApi.findMany.mockResolvedValue([]);
  jobPostApi.create.mockReset();
  jobPostApi.create.mockResolvedValue(makeJob());
  jobPostApi.update.mockReset();
  jobPostApi.update.mockResolvedValue(makeJob());
  jobApplicationApi.findMany.mockReset();
  jobApplicationApi.findMany.mockResolvedValue([]);
  executeRaw.mockReset();
  executeRaw.mockResolvedValue(1);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /v1/jobs", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Rider", description: "Deliver food" }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("creates the job for the caller and returns 201 with the job summary", async () => {
    jobPostApi.create.mockResolvedValue(
      makeJob({ id: "job9", title: "Delivery Rider", status: "PUBLISHED" }),
    );
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({
        title: "Delivery Rider",
        description: "Deliver food across Accra",
        company: "FreshCart",
        jobType: "Full-time",
        category: "Delivery",
        salaryAmount: 2200,
        salaryFrom: true,
        salaryEst: false,
        locationText: "Riverside, Accra",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; title: string; saved: boolean; status: string };
    expect(body.id).toBe("job9");
    expect(body.title).toBe("Delivery Rider");
    expect(body.status).toBe("PUBLISHED");
    expect(body.saved).toBe(false);
    expect(jobPostApi.create).toHaveBeenCalledTimes(1);
    expect(jobPostApi.create).toHaveBeenCalledWith({
      data: {
        authorId: "u1",
        title: "Delivery Rider",
        description: "Deliver food across Accra",
        company: "FreshCart",
        jobType: "Full-time",
        category: "Delivery",
        salaryAmount: 2200,
        salaryFrom: true,
        salaryEst: false,
        locationText: "Riverside, Accra",
        lat: null,
        lng: null,
        status: "PUBLISHED",
      },
    });
  });

  it("defaults the status to PUBLISHED and stores the optional fields as null", async () => {
    jobPostApi.create.mockResolvedValue(makeJob({ id: "job9" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Rider", description: "Deliver food" }),
    });

    expect(res.status).toBe(201);
    expect(jobPostApi.create).toHaveBeenCalledWith({
      data: {
        authorId: "u1",
        title: "Rider",
        description: "Deliver food",
        company: null,
        jobType: null,
        category: null,
        salaryAmount: null,
        salaryFrom: null,
        salaryEst: null,
        locationText: null,
        lat: null,
        lng: null,
        status: "PUBLISHED",
      },
    });
  });

  it("writes the geography column with raw sql when lat and lng are given", async () => {
    jobPostApi.create.mockResolvedValue(makeJob({ id: "job9" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({
        title: "Rider",
        description: "Deliver food",
        lat: 5.6037,
        lng: -0.187,
      }),
    });

    expect(res.status).toBe(201);
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(rawSqlText(0)).toContain(
      'UPDATE "JobPost" SET "location" = ST_SetSRID(ST_MakePoint(',
    );
    expect(rawSqlText(0)).toContain('4326)::geography WHERE "id" = ');
    expect(rawSqlValues(0)).toEqual([-0.187, 5.6037, "job9"]);
  });

  it("does not write the geography column when no coordinates are given", async () => {
    jobPostApi.create.mockResolvedValue(makeJob({ id: "job9" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Rider", description: "Deliver food" }),
    });

    expect(res.status).toBe(201);
    expect(executeRaw).not.toHaveBeenCalled();
  });

  it("returns 400 when the title is missing or blank", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ description: "Deliver food" }),
      JSON.stringify({ title: "", description: "Deliver food" }),
      JSON.stringify({ title: "   ", description: "Deliver food" }),
      JSON.stringify({ title: 42, description: "Deliver food" }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 when the description is missing or blank", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "Rider" }),
      JSON.stringify({ title: "Rider", description: "" }),
      JSON.stringify({ title: "Rider", description: "  " }),
      JSON.stringify({ title: "Rider", description: 42 }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 when a text field is longer than the allowed length", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "a".repeat(121), description: "Deliver food" }),
      JSON.stringify({ title: "Rider", description: "a".repeat(5001) }),
      JSON.stringify({ title: "Rider", description: "Deliver food", company: "a".repeat(121) }),
      JSON.stringify({ title: "Rider", description: "Deliver food", jobType: "a".repeat(121) }),
      JSON.stringify({ title: "Rider", description: "Deliver food", category: "a".repeat(121) }),
      JSON.stringify({
        title: "Rider",
        description: "Deliver food",
        locationText: "a".repeat(121),
      }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 for an out of range salary amount", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "Rider", description: "Deliver food", salaryAmount: -1 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", salaryAmount: 10_000_001 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", salaryAmount: 12.5 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", salaryAmount: "2200" }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 when only one coordinate is supplied", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "Rider", description: "Deliver food", lat: 5.6 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", lng: -0.18 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", lat: 5.6, lng: null }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 for an out of range coordinate", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "Rider", description: "Deliver food", lat: 90.1, lng: 0 }),
      JSON.stringify({ title: "Rider", description: "Deliver food", lat: 0, lng: -180.1 }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown status", async () => {
    const headers = await authHeaders();
    const bodies = [
      JSON.stringify({ title: "Rider", description: "Deliver food", status: "ARCHIVED" }),
      JSON.stringify({ title: "Rider", description: "Deliver food", status: 1 }),
    ];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 when the payload carries an unknown key", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Rider", description: "Deliver food", search: "hack" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid job payload" });
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed or empty body", async () => {
    const headers = await authHeaders();
    const bodies = ["not-json", "", "[]", '"a string"', "42", "null"];

    for (const body of bodies) {
      const res = await testApp.request("/v1/jobs", {
        method: "POST",
        headers: jsonHeaders(headers),
        body,
      });
      expect(res.status, body).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid job payload" });
    }
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("returns 403 Forbidden when the caller is a customer", async () => {
    userApi.findUnique.mockResolvedValue(makeUser("CUSTOMER"));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Rider", description: "Deliver food" }),
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
    expect(jobPostApi.create).not.toHaveBeenCalled();
  });

  it("allows an admin to create a job", async () => {
    userApi.findUnique.mockResolvedValue(makeUser("ADMIN"));
    jobPostApi.create.mockResolvedValue(makeJob({ id: "job9" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs", {
      method: "POST",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Rider", description: "Deliver food" }),
    });

    expect(res.status).toBe(201);
    expect(jobPostApi.create).toHaveBeenCalledTimes(1);
  });
});

describe("PATCH /v1/jobs/:id", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Senior Rider" }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("returns 404 when the job does not exist", async () => {
    jobPostApi.findUnique.mockResolvedValue(null);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/missing", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Senior Rider" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("returns 404 when the job belongs to another author", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u2" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Senior Rider" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("updates only the provided fields for the author", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1" }));
    jobPostApi.update.mockResolvedValue(
      makeJob({ authorId: "u1", title: "Senior Rider", salaryAmount: 3000 }),
    );
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Senior Rider", salaryAmount: 3000 }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { title: string; salaryAmount: number; saved: boolean };
    expect(body.title).toBe("Senior Rider");
    expect(body.salaryAmount).toBe(3000);
    expect(body.saved).toBe(false);
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { title: "Senior Rider", salaryAmount: 3000 },
    });
    expect(executeRaw).not.toHaveBeenCalled();
  });

  it("clears a nullable field when it is set to null", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", company: null }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ company: null }),
    });

    expect(res.status).toBe(200);
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { company: null },
    });
  });

  it("returns 400 for an empty patch body", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid job payload" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("returns 400 when the patch carries an unknown key", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ title: "Senior Rider", authorId: "u2" }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid job payload" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed patch body", async () => {
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: "not-json",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid job payload" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("rewrites the geography column when new coordinates are supplied", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", lat: 5.6, lng: -0.18 }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ lat: 5.6, lng: -0.18 }),
    });

    expect(res.status).toBe(200);
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(rawSqlText(0)).toContain(
      'UPDATE "JobPost" SET "location" = ST_SetSRID(ST_MakePoint(',
    );
    expect(rawSqlValues(0)).toEqual([-0.18, 5.6, "job1"]);
  });

  it("clears the geography column when the coordinates are set to null", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", lat: null, lng: null }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ lat: null, lng: null }),
    });

    expect(res.status).toBe(200);
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(rawSqlText(0)).toContain('UPDATE "JobPost" SET "location" = NULL WHERE "id" = ');
    expect(rawSqlValues(0)).toEqual(["job1"]);
  });

  it("returns 409 when a published job is moved back to draft", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "DRAFT" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Invalid status transition" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("returns 409 when a closed job is moved back to draft", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "CLOSED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "DRAFT" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Invalid status transition" });
    expect(jobPostApi.update).not.toHaveBeenCalled();
  });

  it("publishes a draft job", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "DRAFT" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "PUBLISHED" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("PUBLISHED");
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { status: "PUBLISHED" },
    });
  });

  it("closes a published job", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", status: "CLOSED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "CLOSED" }),
    });

    expect(res.status).toBe(200);
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { status: "CLOSED" },
    });
  });

  it("reopens a closed job", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "CLOSED" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "PUBLISHED" }),
    });

    expect(res.status).toBe(200);
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { status: "PUBLISHED" },
    });
  });

  it("keeps the same status as a no-op", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    jobPostApi.update.mockResolvedValue(makeJob({ authorId: "u1", status: "PUBLISHED" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1", {
      method: "PATCH",
      headers: jsonHeaders(headers),
      body: JSON.stringify({ status: "PUBLISHED" }),
    });

    expect(res.status).toBe(200);
    expect(jobPostApi.update).toHaveBeenCalledWith({
      where: { id: "job1" },
      data: { status: "PUBLISHED" },
    });
  });
});

describe("GET /v1/jobs/mine", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/jobs/mine");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobPostApi.findMany).not.toHaveBeenCalled();
  });

  it("returns the caller's own posts newest first with saved false", async () => {
    jobPostApi.findMany.mockResolvedValue([
      makeJob({ id: "job2", title: "Second", status: "DRAFT" }),
      makeJob({ id: "job1", title: "First", status: "PUBLISHED" }),
    ]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/mine", { headers });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: { id: string; status: string; saved: boolean }[];
    };
    expect(body.items.map((item) => item.id)).toEqual(["job2", "job1"]);
    expect(body.items.map((item) => item.status)).toEqual(["DRAFT", "PUBLISHED"]);
    expect(body.items.every((item) => item.saved)).toBe(false);
  });

  it("reads the caller's posts ordered by createdAt and id descending", async () => {
    jobPostApi.findMany.mockResolvedValue([]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/mine", { headers });

    expect(res.status).toBe(200);
    expect(jobPostApi.findMany).toHaveBeenCalledWith({
      where: { authorId: "u1" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  });

  it("returns an empty list when the caller has no posts", async () => {
    jobPostApi.findMany.mockResolvedValue([]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/mine", { headers });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [] });
  });

  it("returns 403 Forbidden when the caller is a customer", async () => {
    userApi.findUnique.mockResolvedValue(makeUser("CUSTOMER"));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/mine", { headers });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
    expect(jobPostApi.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /v1/jobs/:id/applications", () => {
  it("returns 401 without a bearer token", async () => {
    const res = await testApp.request("/v1/jobs/job1/applications");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(jobApplicationApi.findMany).not.toHaveBeenCalled();
  });

  it("returns the applicants with the applicant details and the answers", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1", authorId: "u1" }));
    jobApplicationApi.findMany.mockResolvedValue([makeApplication()]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1/applications", { headers });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      items: {
        id: string;
        status: string;
        answers: { startDate: string | null; note: string | null } | null;
        applicant: { id: string; name: string | null; email: string | null };
        post: { id: string; title: string; company: string | null };
      }[];
    };
    expect(body.items).toHaveLength(1);
    expect(body.items[0].applicant).toEqual({
      id: "u2",
      name: "Grace Hopper",
      email: "grace@example.com",
    });
    expect(body.items[0].answers).toEqual({
      startDate: "2026-12-01",
      note: "Available weekends",
    });
    expect(body.items[0].status).toBe("SUBMITTED");
    expect(body.items[0].post).toEqual({
      id: "job1",
      title: "Delivery Rider",
      company: "FreshCart",
    });
  });

  it("reads the applications of the caller's job newest first", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1", authorId: "u1" }));
    jobApplicationApi.findMany.mockResolvedValue([]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1/applications", { headers });

    expect(res.status).toBe(200);
    expect(jobApplicationApi.findMany).toHaveBeenCalledWith({
      where: { postId: "job1" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, title: true, company: true } },
      },
    });
  });

  it("returns an empty list when nobody applied", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1", authorId: "u1" }));
    jobApplicationApi.findMany.mockResolvedValue([]);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1/applications", { headers });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [] });
  });

  it("returns 404 when the job does not exist", async () => {
    jobPostApi.findUnique.mockResolvedValue(null);
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/missing/applications", { headers });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(jobApplicationApi.findMany).not.toHaveBeenCalled();
  });

  it("returns 404 when the job belongs to another author", async () => {
    jobPostApi.findUnique.mockResolvedValue(makeJob({ id: "job1", authorId: "u2" }));
    const headers = await authHeaders();

    const res = await testApp.request("/v1/jobs/job1/applications", { headers });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Job not found" });
    expect(jobApplicationApi.findMany).not.toHaveBeenCalled();
  });
});
