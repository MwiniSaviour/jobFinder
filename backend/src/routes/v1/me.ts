import { Hono } from "hono";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { rateLimit } from "../../rate-limit.js";

const me = new Hono<Env>();

me.post("/role", requireAuth, rateLimit({ limit: 10, windowSeconds: 60 }), async (c) => {
  const user = c.get("user");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid role" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid role" }, 400);
  }
  const role = (body as Record<string, unknown>).role;
  if (role !== "PROVIDER") {
    return c.json({ error: "Invalid role" }, 400);
  }
  if (user.role === "PROVIDER") {
    return c.json({ error: "Already an employer" }, 409);
  }
  if (user.role !== "CUSTOMER") {
    return c.json({ error: "Invalid role" }, 400);
  }

  const updated = await getPrisma().user.update({
    where: { id: user.id },
    data: { role: "PROVIDER" },
  });

  return c.json({ role: updated.role });
});

export { me };
