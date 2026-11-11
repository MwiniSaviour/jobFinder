import { Hono } from "hono";
import { ApplicationStatus, Prisma } from "@prisma/client";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { rateLimit } from "../../rate-limit.js";
import { toApplication } from "../../serializers.js";
import { decodeCursor, encodeCursor, parseLimit } from "../../pagination.js";

const applications = new Hono<Env>();

const CURSOR_KEY = "new";

const postSummarySelect = { id: true, title: true, company: true } as const;

type NewCursor = { k: "new"; v: string; i: string };

type ApplicationRow = Prisma.JobApplicationGetPayload<{
  include: { post: { select: { id: true; title: true; company: true } } };
}>;

type RawApplicationRow = { id: string; createdAt: Date };

applications.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  const limit = parseLimit(c.req.query("limit"));
  if (limit === null) return c.json({ error: "Invalid limit" }, 400);

  const rawCursor = c.req.query("cursor");
  let cursor: NewCursor | null = null;
  if (rawCursor !== undefined && rawCursor !== "") {
    const decoded = decodeCursor(rawCursor);
    if (decoded === null || decoded.k !== "new" || typeof decoded.v !== "string") {
      return c.json({ error: "Invalid cursor" }, 400);
    }
    cursor = { k: "new", v: decoded.v, i: decoded.i };
  }

  const keyset = cursor
    ? Prisma.sql`AND ("createdAt" < (${cursor.v}::timestamptz AT TIME ZONE 'UTC') OR ("createdAt" = (${cursor.v}::timestamptz AT TIME ZONE 'UTC') AND "id" < ${cursor.i}))`
    : Prisma.empty;

  const query = Prisma.sql`
    SELECT "id", "createdAt"
    FROM "JobApplication"
    WHERE "applicantId" = ${user.id}
    ${keyset}
    ORDER BY "createdAt" DESC, "id" DESC
    LIMIT ${limit + 1}
  `;

  const prisma = getPrisma();
  const result = await prisma.$queryRaw<RawApplicationRow[]>(query);
  const rows = Array.isArray(result) ? result : [];

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const ids = page.map((row) => row.id);

  const hydrated = await prisma.jobApplication.findMany({
    where: { id: { in: ids } },
    include: { post: { select: postSummarySelect } },
  });
  const byId = new Map(hydrated.map((row) => [row.id, row]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((row): row is ApplicationRow => row !== undefined);

  const last = page.length > 0 ? page[page.length - 1] : undefined;
  const nextCursor =
    hasMore && last !== undefined
      ? encodeCursor({ k: CURSOR_KEY, v: new Date(last.createdAt).toISOString(), i: last.id })
      : null;

  return c.json({ items: ordered.map((row) => toApplication(row)), nextCursor });
});

applications.post("/:id/withdraw", requireAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const prisma = getPrisma();

  const updated = await prisma.jobApplication.updateMany({
    where: {
      id,
      applicantId: user.id,
      status: { in: [ApplicationStatus.SUBMITTED, ApplicationStatus.REVIEWING] },
    },
    data: { status: ApplicationStatus.WITHDRAWN },
  });

  if (updated.count === 1) {
    const withdrawn = await prisma.jobApplication.findFirst({
      where: { id, applicantId: user.id },
      include: { post: { select: postSummarySelect } },
    });
    if (withdrawn === null) return c.json({ error: "Application not found" }, 404);
    return c.json(toApplication(withdrawn));
  }

  const existing = await prisma.jobApplication.findFirst({
    where: { id, applicantId: user.id },
    include: { post: { select: postSummarySelect } },
  });

  if (existing === null) return c.json({ error: "Application not found" }, 404);
  if (existing.status === ApplicationStatus.WITHDRAWN) {
    return c.json({ error: "Application already withdrawn" }, 409);
  }
  return c.json({ error: "Application can no longer be withdrawn" }, 409);
});

const REVIEWABLE_STATUSES = ["REVIEWING", "ACCEPTED", "REJECTED"] as const;
const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  SUBMITTED: ["REVIEWING", "ACCEPTED", "REJECTED"],
  REVIEWING: ["ACCEPTED", "REJECTED"],
};

applications.patch("/:id", requireAuth, rateLimit({ limit: 60, windowSeconds: 60 }), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid status" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return c.json({ error: "Invalid status" }, 400);
  }
  const payload = body as Record<string, unknown>;
  const status = payload.status;
  if (typeof status !== "string" || !REVIEWABLE_STATUSES.includes(status as never)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const prisma = getPrisma();
  const existing = await prisma.jobApplication.findUnique({
    where: { id },
    include: { post: { select: { id: true, title: true, company: true, authorId: true } } },
  });
  if (!existing || existing.post.authorId !== user.id) {
    return c.json({ error: "Application not found" }, 404);
  }

  const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(status)) {
    return c.json({ error: "Application status cannot change" }, 409);
  }

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: { status: status as ApplicationStatus },
  });

  return c.json(
    toApplication({
      id: updated.id,
      postId: updated.postId,
      status: updated.status,
      answers: updated.answers,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      post: { id: existing.post.id, title: existing.post.title, company: existing.post.company },
    }),
  );
});

export { applications };
