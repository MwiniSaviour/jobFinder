import { Hono } from "hono";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";

const MAX_QUERY_LENGTH = 120;
const MAX_RECENT_SEARCHES = 20;

const recentSearches = new Hono<Env>();

recentSearches.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const prisma = getPrisma();

  const rows = await prisma.recentSearch.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MAX_RECENT_SEARCHES,
  });

  const items = rows.map((row) => ({
    query: row.query,
    createdAt: row.createdAt.toISOString(),
  }));

  return c.json({ items });
});

recentSearches.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const body = (await c.req.json().catch(() => null)) as unknown;
  const raw =
    typeof body === "object" && body !== null ? (body as { query?: unknown }).query : undefined;
  if (typeof raw !== "string") {
    return c.json({ error: "Invalid query" }, 400);
  }
  const query = raw.trim();
  if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    return c.json({ error: "Invalid query" }, 400);
  }
  const queryKey = query.toLowerCase();

  const prisma = getPrisma();
  const row = await prisma.recentSearch.upsert({
    where: { userId_queryKey: { userId: user.id, queryKey } },
    create: { userId: user.id, query, queryKey },
    update: { query, createdAt: new Date() },
  });

  return c.json({ query, createdAt: row.createdAt.toISOString() }, 201);
});

recentSearches.delete("/", requireAuth, async (c) => {
  const user = c.get("user");
  const prisma = getPrisma();

  await prisma.recentSearch.deleteMany({ where: { userId: user.id } });

  return c.body(null, 204);
});

export { recentSearches };
