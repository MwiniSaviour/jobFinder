import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK } from "jose";
import { getPrisma, closePrisma } from "../src/db.js";
import { app } from "../src/app.js";

const live = process.env.JF_LIVE_DB_TESTS === "1";
const ISSUER = "https://clerk.live.test";

const APPLICANT_ID = "live-test-applicant";
const APPLICANT_CLERK_ID = "live-test-applicant-clerk";
const EMPLOYER_ID = "live-test-employer";
const EMPLOYER_CLERK_ID = "live-test-employer-clerk";
const PAID_JOB_ID = "live-test-job-paid";
const UNLISTED_JOB_ID = "live-test-job-unlisted";

let token = "";

async function makeToken(): Promise<string> {
  const keyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...(await exportJWK(keyPair.publicKey)), kid: "live-key", alg: "RS256", use: "sig" };
  process.env.CLERK_ISSUER_URL = ISSUER;
  process.env.CLERK_JWKS_JSON = JSON.stringify({ keys: [jwk] });
  return new SignJWT({ email: "live-test-applicant@jobfinder.dev" })
    .setProtectedHeader({ alg: "RS256", kid: "live-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setSubject(APPLICANT_CLERK_ID)
    .sign(keyPair.privateKey);
}

function authed(path: string, init: RequestInit = {}): Promise<Response> {
  return app.request(path, {
    ...init,
    headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` },
  });
}

describe.skipIf(!live)("jobs and applications against a live database", () => {
  beforeAll(async () => {
    token = await makeToken();
    const prisma = getPrisma();
    await prisma.jobApplication.deleteMany({ where: { applicantId: APPLICANT_ID } });
    await prisma.jobPost.deleteMany({ where: { id: { in: [PAID_JOB_ID, UNLISTED_JOB_ID] } } });
    await prisma.user.deleteMany({ where: { id: { in: [APPLICANT_ID, EMPLOYER_ID] } } });
    await prisma.user.create({
      data: {
        id: APPLICANT_ID,
        clerkUserId: APPLICANT_CLERK_ID,
        email: "live-test-applicant@jobfinder.dev",
        role: "CUSTOMER",
      },
    });
    await prisma.user.create({
      data: {
        id: EMPLOYER_ID,
        clerkUserId: EMPLOYER_CLERK_ID,
        email: "live-test-employer@jobfinder.dev",
        role: "PROVIDER",
      },
    });
    await prisma.jobPost.create({
      data: {
        id: PAID_JOB_ID,
        authorId: EMPLOYER_ID,
        title: "Zorblax Quantum Widget Engineer",
        description: "Harmonic flux calibration for Zorblax instrumentation.",
        company: "Zorblax Industries",
        jobType: "Full-time",
        category: "Tech",
        salaryAmount: 4200,
        salaryFrom: true,
        salaryEst: false,
        rating: 4.5,
        reviews: 12,
      },
    });
    await prisma.jobPost.create({
      data: {
        id: UNLISTED_JOB_ID,
        authorId: EMPLOYER_ID,
        title: "Zorblax Gallery Attendant",
        description: "Gallery stewardship for Zorblax exhibitions.",
        company: "Zorblax Industries",
        jobType: "Part-time",
        category: "Events",
      },
    });
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.jobApplication.deleteMany({ where: { applicantId: APPLICANT_ID } });
    await prisma.jobPost.deleteMany({ where: { id: { in: [PAID_JOB_ID, UNLISTED_JOB_ID] } } });
    await prisma.user.deleteMany({ where: { id: { in: [APPLICANT_ID, EMPLOYER_ID] } } });
    await closePrisma();
  });

  it("searches the generated tsvector column", async () => {
    const res = await authed("/v1/jobs?q=Zorblax&includeUnlistedPay=true");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ id: string; posted: string }> };
    const ids = body.items.map((item) => item.id);
    expect(ids).toContain(PAID_JOB_ID);
    expect(ids).toContain(UNLISTED_JOB_ID);
    expect(body.items[0].posted).toEqual(expect.any(String));
  });

  it("filters by category with a bound text array", async () => {
    const res = await authed("/v1/jobs?categories=Tech&categories=Events&includeUnlistedPay=true");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ id: string; category: string }> };
    const ids = body.items.map((item) => item.id);
    expect(ids).toContain(PAID_JOB_ID);
    expect(ids).toContain(UNLISTED_JOB_ID);
    expect(body.items.every((item) => item.category === "Tech" || item.category === "Events")).toBe(true);
  });

  it("excludes unlisted pay by default and includes it on request", async () => {
    const excluded = (await (await authed("/v1/jobs")).json()) as { items: Array<{ id: string }> };
    const included = (await (
      await authed("/v1/jobs?includeUnlistedPay=true")
    ).json()) as { items: Array<{ id: string }> };

    expect(excluded.items.map((item) => item.id)).not.toContain(UNLISTED_JOB_ID);
    expect(included.items.map((item) => item.id)).toContain(UNLISTED_JOB_ID);
  });

  it("orders by salary with nulls last", async () => {
    const body = (await (
      await authed("/v1/jobs?sort=pay&includeUnlistedPay=true&limit=50")
    ).json()) as { items: Array<{ id: string; salaryAmount: number | null }> };
    const ids = body.items.map((item) => item.id);

    expect(ids.indexOf(PAID_JOB_ID)).toBeLessThan(ids.indexOf(UNLISTED_JOB_ID));
  });

  it("walks every page exactly once with a real keyset cursor", async () => {
    const total = await getPrisma().jobPost.count();
    const seen: string[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < 50; page += 1) {
      const query = `includeUnlistedPay=true&limit=3${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const body = (await (await authed(`/v1/jobs?${query}`)).json()) as {
        items: Array<{ id: string }>;
        nextCursor: string | null;
      };
      seen.push(...body.items.map((item) => item.id));
      cursor = body.nextCursor;
      if (!cursor) break;
    }

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).toHaveLength(total);
  });

  it("walks every page exactly once when sorting by pay with unlisted jobs included", async () => {
    const total = await getPrisma().jobPost.count();
    const seen: string[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < 50; page += 1) {
      const query = `sort=pay&includeUnlistedPay=true&limit=3${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
      const body = (await (await authed(`/v1/jobs?${query}`)).json()) as {
        items: Array<{ id: string }>;
        nextCursor: string | null;
      };
      seen.push(...body.items.map((item) => item.id));
      cursor = body.nextCursor;
      if (!cursor) break;
    }

    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).toHaveLength(total);
    expect(seen).toContain(UNLISTED_JOB_ID);
  });

  it("does not fail on a cursor carrying an out-of-range date", async () => {
    const cursor = Buffer.from(
      JSON.stringify({ k: "new", v: "2026-02-30T00:00:00.000Z", i: "zzz" }),
      "utf8",
    ).toString("base64url");

    const res = await authed(`/v1/jobs?cursor=${encodeURIComponent(cursor)}`);

    expect(res.status).toBe(200);
    expect(await res.json()).toHaveProperty("items");
  });

  it("reads a job detail", async () => {
    const res = await authed(`/v1/jobs/${PAID_JOB_ID}`);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe(PAID_JOB_ID);
    expect(body.salaryAmount).toBe(4200);
    expect(body).not.toHaveProperty("authorId");
  });

  it("applies once, rejects the duplicate, lists and withdraws", async () => {
    const applied = await authed(`/v1/jobs/${PAID_JOB_ID}/applications`, { method: "POST" });
    expect(applied.status).toBe(201);
    const created = (await applied.json()) as { id: string; status: string; post: { id: string; company: string } };
    expect(created.status).toBe("SUBMITTED");
    expect(created.post).toEqual({ id: PAID_JOB_ID, title: "Zorblax Quantum Widget Engineer", company: "Zorblax Industries" });

    const duplicate = await authed(`/v1/jobs/${PAID_JOB_ID}/applications`, { method: "POST" });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ error: "Already applied" });

    const mine = (await (await authed("/v1/applications")).json()) as {
      items: Array<{ id: string; status: string; post: { id: string } }>;
    };
    expect(mine.items.map((item) => item.id)).toContain(created.id);
    expect(mine.items[0].post.id).toBe(PAID_JOB_ID);

    const withdrawn = await authed(`/v1/applications/${created.id}/withdraw`, { method: "POST" });
    expect(withdrawn.status).toBe(200);
    expect(((await withdrawn.json()) as { status: string }).status).toBe("WITHDRAWN");

    const again = await authed(`/v1/applications/${created.id}/withdraw`, { method: "POST" });
    expect(again.status).toBe(409);
    expect(await again.json()).toEqual({ error: "Application already withdrawn" });
  });
});
