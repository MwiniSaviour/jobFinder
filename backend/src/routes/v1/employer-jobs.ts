import { Hono, type Context } from "hono";
import { JobPostStatus, Prisma, type PrismaClient } from "@prisma/client";
import type { Env } from "../../auth/middleware.js";
import { requireAuth, requireRole } from "../../auth/middleware.js";
import { getPrisma } from "../../db.js";
import { rateLimit } from "../../rate-limit.js";
import { toApplicantSummary, toJobSummary, type JobSummary } from "../../serializers.js";

const employerJobs = new Hono<Env>();

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_TEXT_LENGTH = 120;
const MAX_SALARY_AMOUNT = 10_000_000;

const JOB_PAYLOAD_KEYS = new Set([
  "title",
  "description",
  "company",
  "jobType",
  "category",
  "salaryAmount",
  "salaryFrom",
  "salaryEst",
  "locationText",
  "lat",
  "lng",
  "status",
]);

const ALLOWED_STATUS_TRANSITIONS: Record<string, readonly string[] | undefined> = {
  DRAFT: ["DRAFT", "PUBLISHED", "CLOSED"],
  PUBLISHED: ["PUBLISHED", "CLOSED"],
  CLOSED: ["CLOSED", "PUBLISHED"],
};

const INVALID = Symbol("invalid");

type OptionalText = string | null | undefined | typeof INVALID;
type OptionalNumber = number | null | undefined | typeof INVALID;
type OptionalBoolean = boolean | null | undefined | typeof INVALID;

type OptionalFields = {
  company?: string | null;
  jobType?: string | null;
  category?: string | null;
  salaryAmount?: number | null;
  salaryFrom?: boolean | null;
  salaryEst?: boolean | null;
  locationText?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: JobPostStatus;
};

type CreatePayload = {
  title: string;
  description: string;
  company: string | null;
  jobType: string | null;
  category: string | null;
  salaryAmount: number | null;
  salaryFrom: boolean | null;
  salaryEst: boolean | null;
  locationText: string | null;
  lat: number | null;
  lng: number | null;
  status: JobPostStatus;
};

type PatchPayload = {
  title?: string;
  description?: string;
  company?: string | null;
  jobType?: string | null;
  category?: string | null;
  salaryAmount?: number | null;
  salaryFrom?: boolean | null;
  salaryEst?: boolean | null;
  locationText?: string | null;
  lat?: number | null;
  lng?: number | null;
  status?: JobPostStatus;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredText(value: unknown, maxLength: number): string | typeof INVALID {
  if (typeof value !== "string") return INVALID;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return INVALID;
  return trimmed;
}

function readOptionalText(value: unknown, maxLength: number): OptionalText {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return INVALID;
  if (value.length > maxLength) return INVALID;
  return value;
}

function readOptionalInteger(value: unknown, maxValue: number): OptionalNumber {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) return INVALID;
  if (value < 0 || value > maxValue) return INVALID;
  return value;
}

function readOptionalBoolean(value: unknown): OptionalBoolean {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "boolean") return INVALID;
  return value;
}

function readOptionalCoordinate(value: unknown, min: number, max: number): OptionalNumber {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return INVALID;
  if (value < min || value > max) return INVALID;
  return value;
}

function readStatus(value: unknown): JobPostStatus | undefined | typeof INVALID {
  if (value === undefined) return undefined;
  if (value === "DRAFT") return JobPostStatus.DRAFT;
  if (value === "PUBLISHED") return JobPostStatus.PUBLISHED;
  if (value === "CLOSED") return JobPostStatus.CLOSED;
  return INVALID;
}

function readOptionalFields(body: Record<string, unknown>): OptionalFields | null {
  const fields: OptionalFields = {};

  const company = readOptionalText(body.company, MAX_TEXT_LENGTH);
  if (company === INVALID) return null;
  if (company !== undefined) fields.company = company;

  const jobType = readOptionalText(body.jobType, MAX_TEXT_LENGTH);
  if (jobType === INVALID) return null;
  if (jobType !== undefined) fields.jobType = jobType;

  const category = readOptionalText(body.category, MAX_TEXT_LENGTH);
  if (category === INVALID) return null;
  if (category !== undefined) fields.category = category;

  const locationText = readOptionalText(body.locationText, MAX_TEXT_LENGTH);
  if (locationText === INVALID) return null;
  if (locationText !== undefined) fields.locationText = locationText;

  const salaryAmount = readOptionalInteger(body.salaryAmount, MAX_SALARY_AMOUNT);
  if (salaryAmount === INVALID) return null;
  if (salaryAmount !== undefined) fields.salaryAmount = salaryAmount;

  const salaryFrom = readOptionalBoolean(body.salaryFrom);
  if (salaryFrom === INVALID) return null;
  if (salaryFrom !== undefined) fields.salaryFrom = salaryFrom;

  const salaryEst = readOptionalBoolean(body.salaryEst);
  if (salaryEst === INVALID) return null;
  if (salaryEst !== undefined) fields.salaryEst = salaryEst;

  const lat = readOptionalCoordinate(body.lat, -90, 90);
  if (lat === INVALID) return null;
  if (lat !== undefined) fields.lat = lat;

  const lng = readOptionalCoordinate(body.lng, -180, 180);
  if (lng === INVALID) return null;
  if (lng !== undefined) fields.lng = lng;

  const status = readStatus(body.status);
  if (status === INVALID) return null;
  if (status !== undefined) fields.status = status;

  const hasLat = fields.lat !== undefined && fields.lat !== null;
  const hasLng = fields.lng !== undefined && fields.lng !== null;
  if (hasLat !== hasLng) return null;

  return fields;
}

function parseCreatePayload(body: unknown): CreatePayload | null {
  if (!isRecord(body)) return null;
  for (const key of Object.keys(body)) {
    if (!JOB_PAYLOAD_KEYS.has(key)) return null;
  }

  const title = readRequiredText(body.title, MAX_TITLE_LENGTH);
  if (title === INVALID) return null;
  const description = readRequiredText(body.description, MAX_DESCRIPTION_LENGTH);
  if (description === INVALID) return null;

  const optional = readOptionalFields(body);
  if (optional === null) return null;

  return {
    title,
    description,
    company: optional.company ?? null,
    jobType: optional.jobType ?? null,
    category: optional.category ?? null,
    salaryAmount: optional.salaryAmount ?? null,
    salaryFrom: optional.salaryFrom ?? null,
    salaryEst: optional.salaryEst ?? null,
    locationText: optional.locationText ?? null,
    lat: optional.lat ?? null,
    lng: optional.lng ?? null,
    status: optional.status ?? JobPostStatus.PUBLISHED,
  };
}

function parsePatchPayload(body: unknown): PatchPayload | null {
  if (!isRecord(body)) return null;
  const keys = Object.keys(body);
  for (const key of keys) {
    if (!JOB_PAYLOAD_KEYS.has(key)) return null;
  }
  if (keys.length === 0) return null;

  const optional = readOptionalFields(body);
  if (optional === null) return null;

  const payload: PatchPayload = { ...optional };

  if (keys.includes("title")) {
    const title = readRequiredText(body.title, MAX_TITLE_LENGTH);
    if (title === INVALID) return null;
    payload.title = title;
  }
  if (keys.includes("description")) {
    const description = readRequiredText(body.description, MAX_DESCRIPTION_LENGTH);
    if (description === INVALID) return null;
    payload.description = description;
  }

  return payload;
}

function isAllowedTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_STATUS_TRANSITIONS[from];
  if (allowed === undefined) return false;
  return allowed.includes(to);
}

async function readJsonBody(c: Context<Env>): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return undefined;
  }
}

async function writeLocation(
  prisma: PrismaClient,
  id: string,
  lat: number,
  lng: number,
): Promise<void> {
  await prisma.$executeRaw`UPDATE "JobPost" SET "location" = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography WHERE "id" = ${id}`;
}

async function clearLocation(prisma: PrismaClient, id: string): Promise<void> {
  await prisma.$executeRaw`UPDATE "JobPost" SET "location" = NULL WHERE "id" = ${id}`;
}

employerJobs.post("/jobs", requireAuth, requireRole("PROVIDER", "ADMIN"), rateLimit({ limit: 20, windowSeconds: 60 }), async (c) => {
  const user = c.get("user");
  const payload = parseCreatePayload(await readJsonBody(c));
  if (payload === null) return c.json({ error: "Invalid job payload" }, 400);

  const prisma = getPrisma();
  const created = await prisma.jobPost.create({
    data: {
      authorId: user.id,
      title: payload.title,
      description: payload.description,
      company: payload.company,
      jobType: payload.jobType,
      category: payload.category,
      salaryAmount: payload.salaryAmount,
      salaryFrom: payload.salaryFrom,
      salaryEst: payload.salaryEst,
      locationText: payload.locationText,
      lat: payload.lat,
      lng: payload.lng,
      status: payload.status,
    },
  });

  if (payload.lat !== null && payload.lng !== null) {
    await writeLocation(prisma, created.id, payload.lat, payload.lng);
  }

  return c.json(toJobSummary(created, { saved: false }), 201);
});

employerJobs.patch("/jobs/:id", requireAuth, rateLimit({ limit: 60, windowSeconds: 60 }), async (c) => {
  const user = c.get("user");
  const payload = parsePatchPayload(await readJsonBody(c));
  if (payload === null) return c.json({ error: "Invalid job payload" }, 400);

  const prisma = getPrisma();
  const id = c.req.param("id");
  if (!id) return c.json({ error: "Job not found" }, 404);
  const post = await prisma.jobPost.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) return c.json({ error: "Job not found" }, 404);

  if (payload.status !== undefined && !isAllowedTransition(post.status, payload.status)) {
    return c.json({ error: "Invalid status transition" }, 409);
  }

  const data: Prisma.JobPostUncheckedUpdateInput = {};
  if (payload.title !== undefined) data.title = payload.title;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.company !== undefined) data.company = payload.company;
  if (payload.jobType !== undefined) data.jobType = payload.jobType;
  if (payload.category !== undefined) data.category = payload.category;
  if (payload.salaryAmount !== undefined) data.salaryAmount = payload.salaryAmount;
  if (payload.salaryFrom !== undefined) data.salaryFrom = payload.salaryFrom;
  if (payload.salaryEst !== undefined) data.salaryEst = payload.salaryEst;
  if (payload.locationText !== undefined) data.locationText = payload.locationText;
  if (payload.lat !== undefined) data.lat = payload.lat;
  if (payload.lng !== undefined) data.lng = payload.lng;
  if (payload.status !== undefined) data.status = payload.status;

  const updated = await prisma.jobPost.update({ where: { id }, data });

  if (payload.lat !== undefined || payload.lng !== undefined) {
    if (payload.lat !== undefined && payload.lng !== undefined && payload.lat !== null && payload.lng !== null) {
      await writeLocation(prisma, id, payload.lat, payload.lng);
    } else {
      await clearLocation(prisma, id);
    }
  }

  return c.json(toJobSummary(updated, { saved: false }));
});

employerJobs.get("/jobs/mine", requireAuth, requireRole("PROVIDER", "ADMIN"), async (c) => {
  const user = c.get("user");
  const prisma = getPrisma();

  const posts = await prisma.jobPost.findMany({
    where: { authorId: user.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const items: JobSummary[] = posts.map((post) => toJobSummary(post, { saved: false }));
  return c.json({ items });
});

employerJobs.get("/jobs/:id/applications", requireAuth, async (c) => {
  const user = c.get("user");
  const prisma = getPrisma();

  const id = c.req.param("id");
  if (!id) return c.json({ error: "Job not found" }, 404);
  const post = await prisma.jobPost.findUnique({ where: { id } });
  if (!post || post.authorId !== user.id) return c.json({ error: "Job not found" }, 404);

  const applications = await prisma.jobApplication.findMany({
    where: { postId: post.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      applicant: { select: { id: true, name: true, email: true } },
      post: { select: { id: true, title: true, company: true } },
    },
  });

  const items = applications.map((application) => toApplicantSummary(application));
  return c.json({ items });
});

export { employerJobs };
