import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from "jose";
import { Prisma, type User } from "@prisma/client";
import { getPrisma } from "../db.js";

export type AuthUser = User;

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 409 | 503; error: string };

type JwtPayload = { sub?: unknown; email?: unknown; name?: unknown };

const remoteJwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
let localJwksCache: { raw: string; handle: ReturnType<typeof createLocalJWKSet> } | null = null;

function issuer(): string | null {
  const raw = process.env.CLERK_ISSUER_URL?.trim().replace(/\/+$/, "");
  return raw || null;
}

function verificationKey(iss: string) {
  const localRaw = process.env.CLERK_JWKS_JSON?.trim();
  if (localRaw) {
    if (!localJwksCache || localJwksCache.raw !== localRaw) {
      localJwksCache = { raw: localRaw, handle: createLocalJWKSet(JSON.parse(localRaw)) };
    }
    return localJwksCache.handle;
  }
  let handle = remoteJwksCache.get(iss);
  if (!handle) {
    handle = createRemoteJWKSet(new URL(`${iss}/.well-known/jwks.json`));
    remoteJwksCache.set(iss, handle);
  }
  return handle;
}

async function fetchClerkUser(sub: string): Promise<{ email: string | null; name: string | null } | null> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return null;
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(sub)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      first_name?: string | null;
      last_name?: string | null;
      primary_email_address_id?: string | null;
      email_addresses?: Array<{ id?: string; email_address?: string }> | null;
    };
    const list = Array.isArray(data.email_addresses) ? data.email_addresses : [];
    const primary = list.find(
      (entry) => entry?.id === data.primary_email_address_id && typeof entry.email_address === "string",
    );
    const first = list.find((entry) => typeof entry?.email_address === "string");
    const emailRaw = (primary ?? first)?.email_address;
    const email = typeof emailRaw === "string" && emailRaw.trim() ? emailRaw.trim().toLowerCase() : null;
    const parts = [data.first_name, data.last_name].filter(
      (part): part is string => typeof part === "string" && part.trim().length > 0,
    );
    const name = parts.length > 0 ? parts.join(" ") : null;
    return { email, name };
  } catch {
    return null;
  }
}

async function resolveIdentity(payload: JwtPayload, sub: string): Promise<{ email: string | null; apiName: string | null }> {
  const claimEmail = typeof payload.email === "string" && payload.email.trim() ? payload.email.trim().toLowerCase() : null;
  if (claimEmail) return { email: claimEmail, apiName: null };
  const fromApi = await fetchClerkUser(sub);
  if (!fromApi) return { email: null, apiName: null };
  return { email: fromApi.email, apiName: fromApi.name };
}

export async function authenticateToken(header: string | undefined): Promise<AuthResult> {
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  if (!token) {
    return { ok: false, status: 401, error: "Missing bearer token" };
  }

  const iss = issuer();
  if (!iss) {
    return { ok: false, status: 503, error: "Auth is not configured" };
  }

  let payload: JwtPayload;
  try {
    const verified = await jwtVerify(token, verificationKey(iss), {
      issuer: iss,
      algorithms: ["RS256"],
      clockTolerance: 30,
    });
    payload = verified.payload;
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }
  const sub = payload.sub;
  if (typeof sub !== "string" || !sub) {
    return { ok: false, status: 401, error: "Invalid or expired token" };
  }

  const prisma = getPrisma();
  const byClerk = await prisma.user.findUnique({ where: { clerkUserId: sub } });
  if (byClerk) return { ok: true, user: byClerk };

  const { email, apiName } = await resolveIdentity(payload, sub);
  if (!email) {
    return {
      ok: false,
      status: 401,
      error:
        "Clerk token has no email claim. Set CLERK_SECRET_KEY or add email to the Clerk session token template.",
    };
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    if (!byEmail.clerkUserId) {
      const updated = await prisma.user.update({ where: { id: byEmail.id }, data: { clerkUserId: sub } });
      return { ok: true, user: updated };
    }
    return { ok: false, status: 409, error: "Email already in use" };
  }

  const name =
    typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : apiName ?? email.split("@")[0];
  try {
    const created = await prisma.user.create({ data: { email, name, clerkUserId: sub } });
    return { ok: true, user: created };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const refetched = await prisma.user.findUnique({ where: { clerkUserId: sub } });
      if (refetched) return { ok: true, user: refetched };
      return { ok: false, status: 401, error: "Unable to sign in" };
    }
    throw error;
  }
}
