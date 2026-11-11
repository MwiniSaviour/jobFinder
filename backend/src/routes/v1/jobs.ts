import { Hono } from "hono";
import { Prisma, type JobPost } from "@prisma/client";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { toApplication, toJobSummary, type JobSummary } from "../../serializers.js";
import {
  decodeCursor,
  encodeCursor,
  parseLimit,
  type Cursor,
  type CursorSort,
} from "../../pagination.js";

const jobs = new Hono<Env>();

const MAX_CATEGORIES = 10;
const MAX_QUERY_LENGTH = 200;

type RouteCursor =
  | { k: "new"; v: string; i: string }
  | { k: "pay"; v: number | null; i: string };

type RawJobRow = {
  id: string;
  createdAt: Date | string;
  salaryAmount: number | null;
};

function parseCategories(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    categories.push(trimmed);
  }
  return categories;
}

function narrowCursor(cursor: Cursor, sort: CursorSort): RouteCursor | null {
  if (cursor.k !== sort) return null;
  if (sort === "new") {
    if (typeof cursor.v !== "string") return null;
    return { k: "new", v: cursor.v, i: cursor.i };
  }
  const value = cursor.v;
  if (value === null) return { k: "pay", v: null, i: cursor.i };
  if (typeof value !== "number") return null;
  return { k: "pay", v: value, i: cursor.i };
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (error as { code?: unknown }).code === "P2002";
}

jobs.get("/", requireAuth, async (c) => {
  const categories = parseCategories(c.req.queries("categories") ?? []);
  if (categories.length > MAX_CATEGORIES) {
    return c.json({ error: "Too many categories" }, 400);
  }

  const includeUnlistedPayRaw = c.req.query("includeUnlistedPay") ?? "false";
  if (includeUnlistedPayRaw !== "true" && includeUnlistedPayRaw !== "false") {
    return c.json({ error: "Invalid includeUnlistedPay" }, 400);
  }
  const includeUnlistedPay = includeUnlistedPayRaw === "true";

  const sortRaw = c.req.query("sort") ?? "new";
  if (sortRaw !== "new" && sortRaw !== "pay") {
    return c.json({ error: "Invalid sort" }, 400);
  }
  const sort: CursorSort = sortRaw;

  const limit = parseLimit(c.req.query("limit"));
  if (limit === null) {
    return c.json({ error: "Invalid limit" }, 400);
  }

  const cursorRaw = c.req.query("cursor") ?? "";
  let cursor: RouteCursor | null = null;
  if (cursorRaw !== "") {
    const decoded = decodeCursor(cursorRaw);
    const narrowed = decoded === null ? null : narrowCursor(decoded, sort);
    if (narrowed === null) {
      return c.json({ error: "Invalid cursor" }, 400);
    }
    cursor = narrowed;
  }

  const qRaw = c.req.query("q");
  const q = qRaw !== undefined && qRaw.trim() !== "" ? qRaw.slice(0, MAX_QUERY_LENGTH) : null;

  const conditions: Prisma.Sql[] = [];
  if (q !== null) {
    conditions.push(Prisma.sql`"search" @@ plainto_tsquery('english', ${q})`);
  }
  if (categories.length > 0) {
    conditions.push(Prisma.sql`"category" = ANY(${categories}::text[])`);
  }
  if (!includeUnlistedPay) {
    conditions.push(Prisma.sql`"salaryAmount" IS NOT NULL`);
  }
  if (cursor) {
    if (cursor.k === "new") {
      conditions.push(
        Prisma.sql`("createdAt" < (${cursor.v}::timestamptz AT TIME ZONE 'UTC') OR ("createdAt" = (${cursor.v}::timestamptz AT TIME ZONE 'UTC') AND "id" < ${cursor.i}))`,
      );
    } else if (cursor.v === null) {
      conditions.push(Prisma.sql`("salaryAmount" IS NULL AND "id" < ${cursor.i})`);
    } else {
      conditions.push(
        Prisma.sql`(("salaryAmount" IS NOT NULL AND ("salaryAmount" < ${cursor.v} OR ("salaryAmount" = ${cursor.v} AND "id" < ${cursor.i}))) OR "salaryAmount" IS NULL)`,
      );
    }
  }

  const where =
    conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
  const orderBy =
    sort === "new"
      ? Prisma.sql`"createdAt" DESC, "id" DESC`
      : Prisma.sql`"salaryAmount" DESC NULLS LAST, "id" DESC`;

  const query = Prisma.sql`
    SELECT "id", "createdAt", "salaryAmount" FROM "JobPost"
    ${where}
    ORDER BY ${orderBy}
    LIMIT ${limit + 1}
  `;

  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<RawJobRow[]>(query);
  const rawRows = Array.isArray(rows) ? rows : [];
  const hasMore = rawRows.length > limit;
  const pageRows = hasMore ? rawRows.slice(0, limit) : rawRows;
  const pageIds = pageRows.map((row) => row.id);

  const posts = await prisma.jobPost.findMany({ where: { id: { in: pageIds } } });
  const byId = new Map(posts.map((post) => [post.id, post]));
  const ordered: JobPost[] = [];
  for (const id of pageIds) {
    const post = byId.get(id);
    if (post) ordered.push(post);
  }

  let nextCursor: string | null = null;
  const lastRaw = pageRows[pageRows.length - 1];
  if (hasMore && lastRaw) {
    if (sort === "new") {
      nextCursor = encodeCursor({
        k: "new",
        v: new Date(lastRaw.createdAt).toISOString(),
        i: lastRaw.id,
      });
    } else {
      nextCursor = encodeCursor({ k: "pay", v: lastRaw.salaryAmount, i: lastRaw.id });
    }
  }

  const items: JobSummary[] = ordered.map((post) => toJobSummary(post));
  return c.json({ items, nextCursor });
});

jobs.get("/:id", requireAuth, async (c) => {
  const prisma = getPrisma();
  const post = await prisma.jobPost.findUnique({ where: { id: c.req.param("id") } });
  if (!post) return c.json({ error: "Job not found" }, 404);
  return c.json(toJobSummary(post));
});

jobs.post("/:id/applications", requireAuth, async (c) => {
  const prisma = getPrisma();
  const user = c.get("user");
  const job = await prisma.jobPost.findUnique({ where: { id: c.req.param("id") } });
  if (!job) return c.json({ error: "Job not found" }, 404);

  try {
    const created = await prisma.jobApplication.create({
      data: { postId: job.id, applicantId: user.id, status: "SUBMITTED" },
    });

    const application = toApplication({
      id: created.id,
      postId: created.postId,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      post: { id: job.id, title: job.title, company: job.company },
    });

    return c.json(application, 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return c.json({ error: "Already applied" }, 409);
    }
    throw error;
  }
});

export { jobs };
