import type { Context, Next } from "hono";
import type { Role } from "@prisma/client";
import { authenticateToken, type AuthUser } from "./clerk.js";

export type Env = { Variables: { user: AuthUser } };

export async function requireAuth(c: Context<Env>, next: Next): Promise<Response | void> {
  const result = await authenticateToken(c.req.header("authorization"));
  if (!result.ok) return c.json({ error: result.error }, result.status);
  c.set("user", result.user);
  await next();
}

export async function optionalAuth(c: Context<Env>, next: Next): Promise<void> {
  const result = await authenticateToken(c.req.header("authorization"));
  if (result.ok) c.set("user", result.user);
  await next();
}

export function requireRole(...roles: Role[]) {
  return async (c: Context<Env>, next: Next): Promise<Response | void> => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Missing bearer token" }, 401);
    if (!roles.includes(user.role)) return c.json({ error: "Forbidden" }, 403);
    await next();
  };
}
