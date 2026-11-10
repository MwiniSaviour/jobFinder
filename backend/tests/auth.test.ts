import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { SignJWT, exportJWK, type JWTPayload } from "jose";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";

const userApi = { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() };

vi.mock("../src/db.js", () => ({
  getPrisma: vi.fn(),
  closePrisma: vi.fn(),
}));

import { getPrisma } from "../src/db.js";
import type { Env } from "../src/auth/middleware.js";
import { requireAuth, optionalAuth, requireRole } from "../src/auth/middleware.js";

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

let signingKeyPair: ReturnType<typeof generateKeyPairSync>;

async function makeToken(claims: JWTPayload): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .sign(signingKeyPair.privateKey);
}

const stub = { user: userApi } as unknown as ReturnType<typeof getPrisma>;

function makeApp() {
  const app = new Hono<Env>();
  app.get("/me", requireAuth, (c) => c.json({ ok: true, user: c.get("user") }));
  app.get("/maybe", optionalAuth, (c) => c.json({ ok: true, user: c.get("user") ?? null }));
  app.get("/admin", requireAuth, requireRole("ADMIN"), (c) => c.json({ ok: true }));
  return app;
}

const app = makeApp();

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
  userApi.update.mockReset();
  userApi.create.mockReset();
  userApi.findUnique.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("requireAuth", () => {
  it("returns 401 when the Authorization header is missing", async () => {
    const res = await app.request("/me");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Missing bearer token" });
    expect(userApi.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed bearer token", async () => {
    const res = await app.request("/me", { headers: { authorization: "Bearer not-a-jwt" } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid or expired token" });
  });

  it("returns 503 when auth is not configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("CLERK_ISSUER_URL", "");
    const res = await app.request("/me", { headers: { authorization: `Bearer ${await makeToken({ sub: "user_x" })}` } });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Auth is not configured" });
  });

  it("returns 401 for a token from an untrusted issuer", async () => {
    const otherKeyPair = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const token = await new SignJWT({ sub: "user_x" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer("https://evil.test")
      .sign(otherKeyPair.privateKey);
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(401);
  });

  it("resolves an existing Clerk user", async () => {
    userApi.findUnique
      .mockResolvedValueOnce(userRow)
      .mockResolvedValue(userRow);
    const token = await makeToken({ sub: "user_clerk1", email: "ada@example.com", email_verified: true });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.clerkUserId).toBe("user_clerk1");
    expect(userApi.create).not.toHaveBeenCalled();
    expect(userApi.update).not.toHaveBeenCalled();
  });

  it("creates a new user with the email local part as name", async () => {
    const created = { ...userRow, clerkUserId: "user_new", name: "grace" };
    userApi.create.mockResolvedValueOnce(created);
    const token = await makeToken({ sub: "user_new", email: "grace@example.com", email_verified: true });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(userApi.create).toHaveBeenCalledWith({ data: { email: "grace@example.com", name: "grace", clerkUserId: "user_new" } });
    expect(await res.json()).toEqual(JSON.parse(JSON.stringify({ ok: true, user: created })));
  });

  it("links an existing email-only user to the Clerk id", async () => {
    const linked = { ...userRow, clerkUserId: "user_link" };
    userApi.findUnique
      .mockResolvedValueOnce(null) // clerkUserId lookup
      .mockResolvedValueOnce({ ...userRow, clerkUserId: null }); // email lookup
    userApi.update.mockResolvedValueOnce(linked);
    const token = await makeToken({ sub: "user_link", email: "ada@example.com", email_verified: true });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(userApi.update).toHaveBeenCalledWith({ where: { id: userRow.id }, data: { clerkUserId: "user_link" } });
    expect(userApi.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the email already belongs to another Clerk account", async () => {
    userApi.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ ...userRow, clerkUserId: "user_other" });
    const token = await makeToken({ sub: "user_new2", email: "ada@example.com", email_verified: true });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Email already in use" });
  });

  it("falls back to the Clerk API for email and name", async () => {
    vi.stubEnv("CLERK_SECRET_KEY", "sk_test_secret");
    const mockedFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ first_name: "Ada", last_name: "Lovelace", email_addresses: [
        { id: "e1", email_address: "API@example.com", verification: { status: "verified" } },
      ] }), { status: 200 })
    );
    vi.stubGlobal("fetch", mockedFetch);
    const created = { ...userRow, clerkUserId: "user_api", name: "Ada Lovelace", email: "api@example.com" };
    userApi.create.mockResolvedValueOnce(created);
    const token = await makeToken({ sub: "user_api" });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith("https://api.clerk.com/v1/users/user_api", {
      headers: { Authorization: "Bearer sk_test_secret" },
    });
    expect(userApi.create).toHaveBeenCalledWith({ data: { email: "api@example.com", name: "Ada Lovelace", clerkUserId: "user_api" } });
  });

  it("returns 401 when there is no email claim and no CLERK_SECRET_KEY", async () => {
    const token = await makeToken({ sub: "user_noemail" });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Clerk token has no email claim. Set CLERK_SECRET_KEY or add email to the Clerk session token template." });
  });

  it("refetches by clerkUserId after a P2002 race on create", async () => {
    const created = { ...userRow, clerkUserId: "user_race" };
    userApi.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "test" })
    );
    userApi.findUnique.mockResolvedValueOnce(created);
    const token = await makeToken({ sub: "user_race", email: "ada@example.com", email_verified: true });
    const res = await app.request("/me", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(JSON.parse(JSON.stringify({ ok: true, user: created })));
  });
});

describe("optionalAuth", () => {
  it("passes through anonymously without a token", async () => {
    const res = await app.request("/maybe");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, user: null });
  });

  it("sets the user on a valid token", async () => {
    userApi.findUnique.mockResolvedValueOnce(userRow).mockResolvedValue(userRow);
    const token = await makeToken({ sub: "user_clerk1", email: "ada@example.com", email_verified: true });
    const res = await app.request("/maybe", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    expect((await res.json()).user.clerkUserId).toBe("user_clerk1");
  });
});

describe("requireRole", () => {
  it("allows matching roles", async () => {
    const admin = { ...userRow, role: "ADMIN" };
    userApi.findUnique.mockResolvedValueOnce(admin).mockResolvedValue(admin);
    const token = await makeToken({ sub: "user_clerk1", email: "ada@example.com", email_verified: true });
    const res = await app.request("/admin", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
  });

  it("returns 403 on a role mismatch", async () => {
    userApi.findUnique.mockResolvedValueOnce(userRow).mockResolvedValue(userRow);
    const token = await makeToken({ sub: "user_clerk1", email: "ada@example.com", email_verified: true });
    const res = await app.request("/admin", { headers: { authorization: `Bearer ${token}` } });
    expect(res.status).toBe(403);
  });

  it("returns 401 when no user is set", async () => {
    const res = await app.request("/admin");
    expect(res.status).toBe(401);
  });
});
