import { Hono } from "hono";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { toJobSummary, type JobSummary } from "../../serializers.js";

const savedJobs = new Hono<Env>();

savedJobs.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const prisma = getPrisma();

  const saved = await prisma.savedJob.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const postIds = saved.map((row) => row.postId);
  const posts = await prisma.jobPost.findMany({ where: { id: { in: postIds } } });
  const byId = new Map(posts.map((post) => [post.id, post]));

  const items: JobSummary[] = [];
  for (const row of saved) {
    const post = byId.get(row.postId);
    if (!post) continue;
    items.push(toJobSummary(post, { saved: true }));
  }

  return c.json({ items });
});

savedJobs.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const body = (await c.req.json().catch(() => null)) as unknown;
  const raw =
    typeof body === "object" && body !== null ? (body as { postId?: unknown }).postId : undefined;
  if (typeof raw !== "string" || raw.trim() === "") {
    return c.json({ error: "Invalid postId" }, 400);
  }
  const postId = raw.trim();

  const prisma = getPrisma();
  const post = await prisma.jobPost.findUnique({ where: { id: postId } });
  if (!post) return c.json({ error: "Job not found" }, 404);

  await prisma.savedJob.upsert({
    where: { userId_postId: { userId: user.id, postId } },
    create: { userId: user.id, postId },
    update: {},
  });

  return c.json({ postId, saved: true }, 201);
});

savedJobs.delete("/:postId", requireAuth, async (c) => {
  const user = c.get("user");
  const postId = c.req.param("postId");
  const prisma = getPrisma();

  await prisma.savedJob.deleteMany({ where: { userId: user.id, postId } });

  return c.body(null, 204);
});

export { savedJobs };
