import { Hono, type Context } from "hono";
import { Prisma, type JobPost } from "@prisma/client";
import type { Env } from "../../auth/middleware.js";
import { optionalAuth, requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { rateLimit } from "../../rate-limit.js";
import {
  toApplication,
  toJobSummary,
  type ApplicationAnswers,
  type JobSummary,
} from "../../serializers.js";
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

function prismaErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

type RadiusFilter =
  | { ok: true; value: { lat: number; lng: number; meters: number } | null }
  | { ok: false };

function parseRadius(
  latRaw: string | undefined,
  lngRaw: string | undefined,
  radiusRaw: string | undefined,
): RadiusFilter {
  const provided = [latRaw, lngRaw, radiusRaw].filter((value) => value !== undefined);
  if (provided.length === 0) return { ok: true, value: null };
  if (provided.length !== 3) return { ok: false };

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  const radiusKm = Number(radiusRaw);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { ok: false };
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return { ok: false };
  if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 100) return { ok: false };
  return { ok: true, value: { lat, lng, meters: radiusKm * 1000 } };
}

const ANSWER_KEYS = new Set(["startDate", "note"]);
const MAX_START_DATE_LENGTH = 64;
const MAX_NOTE_LENGTH = 1000;

async function readAnswers(c: Context<Env>): Promise<{ ok: true; value: ApplicationAnswers | null } | { ok: false }> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return { ok: true, value: null };
  }
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ok: false };

  const body = raw as Record<string, unknown>;
  for (const key of Object.keys(body)) {
    if (key !== "answers") return { ok: false };
  }

  const answersRaw = body.answers;
  if (answersRaw === undefined || answersRaw === null) return { ok: true, value: null };
  if (typeof answersRaw !== "object" || Array.isArray(answersRaw)) return { ok: false };

  const answers = answersRaw as Record<string, unknown>;
  for (const key of Object.keys(answers)) {
    if (!ANSWER_KEYS.has(key)) return { ok: false };
  }

  const startDate = answers.startDate;
  const note = answers.note;
  if (startDate !== undefined && startDate !== null && typeof startDate !== "string") return { ok: false };
  if (note !== undefined && note !== null && typeof note !== "string") return { ok: false };
  if (typeof startDate === "string" && startDate.length > MAX_START_DATE_LENGTH) return { ok: false };
  if (typeof note === "string" && note.length > MAX_NOTE_LENGTH) return { ok: false };

  const value: ApplicationAnswers = {
    startDate: typeof startDate === "string" && startDate.length > 0 ? startDate : null,
    note: typeof note === "string" && note.length > 0 ? note : null,
  };
  if (value.startDate === null && value.note === null) return { ok: true, value: null };
  return { ok: true, value };
}

jobs.get("/", optionalAuth, rateLimit({ limit: 120, windowSeconds: 60 }), async (c) => {
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

  const radius = parseRadius(
    c.req.query("lat"),
    c.req.query("lng"),
    c.req.query("radiusKm"),
  );
  if (!radius.ok) {
    return c.json({ error: "Invalid radius" }, 400);
  }

  const conditions: Prisma.Sql[] = [];
  conditions.push(Prisma.sql`"status" = 'PUBLISHED'`);
  if (q !== null) {
    conditions.push(Prisma.sql`"search" @@ plainto_tsquery('english', ${q})`);
  }
  if (categories.length > 0) {
    conditions.push(Prisma.sql`"category" = ANY(${categories}::text[])`);
  }
  if (!includeUnlistedPay) {
    conditions.push(Prisma.sql`"salaryAmount" IS NOT NULL`);
  }
  if (radius.value !== null) {
    conditions.push(
      Prisma.sql`ST_DWithin("location", ST_SetSRID(ST_MakePoint(${radius.value.lng}, ${radius.value.lat}), 4326)::geography, ${radius.value.meters})`,
    );
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

  const items: JobSummary[] = await (async () => {
    const user = c.get("user");
    const savedIds = new Set<string>();
    if (user) {
      const saved = await prisma.savedJob.findMany({
        where: { userId: user.id },
        select: { postId: true },
      });
      for (const row of saved) savedIds.add(row.postId);
    }
    return ordered.map((post) => toJobSummary(post, { saved: savedIds.has(post.id) }));
  })();

  return c.json({ items, nextCursor });
});
jobs.get("/:id", optionalAuth, rateLimit({ limit: 120, windowSeconds: 60 }), async (c) => {
  const prisma = getPrisma();
  const post = await prisma.jobPost.findUnique({ where: { id: c.req.param("id") } });
  if (!post) return c.json({ error: "Job not found" }, 404);
  const status = post.status ?? "PUBLISHED";
  if (status !== "PUBLISHED") {
    const user = c.get("user");
    if (!user || user.id !== post.authorId) return c.json({ error: "Job not found" }, 404);
  }
  return c.json(toJobSummary(post));
});

jobs.post(
  "/:id/applications",
  requireAuth,
  rateLimit({ limit: 10, windowSeconds: 60 }),
  async (c) => {
    const prisma = getPrisma();
    const user = c.get("user");
    const job = await prisma.jobPost.findUnique({ where: { id: c.req.param("id") } });
    if (!job) return c.json({ error: "Job not found" }, 404);

    const answers = await readAnswers(c);
    if (!answers.ok) return c.json({ error: "Invalid answers" }, 400);

    try {
      const created = await prisma.jobApplication.create({
        data: {
          postId: job.id,
          applicantId: user.id,
          status: "SUBMITTED",
          ...(answers.value ? { answers: answers.value } : {}),
        },
      });

      const application = toApplication({
        id: created.id,
        postId: created.postId,
        status: created.status,
        answers: created.answers,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        post: { id: job.id, title: job.title, company: job.company },
      });

      return c.json(application, 201);
    } catch (error) {
      const code = prismaErrorCode(error);
      if (code === "P2002") {
        return c.json({ error: "Already applied" }, 409);
      }
      if (code === "P2003") {
        return c.json({ error: "Job not found" }, 404);
      }
      throw error;
    }
  },
);

export { jobs };
