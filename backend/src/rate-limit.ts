import type { Context, MiddlewareHandler } from "hono";
import type { Env } from "./auth/middleware.js";
import { getPrisma } from "./db.js";

export type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
  key?: (c: Context<Env>) => string;
};

const PRUNE_EVERY = 100;
const PRUNE_MAX_AGE_MS = 3600 * 1000;

let invocations = 0;

export function defaultRateLimitKey(c: Context<Env>): string {
  const userId = c.get("user")?.id;
  if (userId) return `user:${userId}`;

  const forwardedFor = c.req.header("x-forwarded-for");
  const forwardedIp = forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined;
  if (forwardedIp) return `ip:${forwardedIp}`;

  const realIp = c.req.header("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;

  const remoteAddress = c.env?.incoming?.socket?.remoteAddress;
  if (remoteAddress) return `ip:${remoteAddress}`;

  return "anonymous";
}

async function pruneStaleBuckets(prisma: ReturnType<typeof getPrisma>): Promise<void> {
  try {
    await prisma.rateLimitBucket.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - PRUNE_MAX_AGE_MS) } },
    });
  } catch {
    return;
  }
}

export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const windowMs = options.windowSeconds * 1000;
  const keyOf = options.key ?? defaultRateLimitKey;

  const handler: MiddlewareHandler<Env> = async (c, next) => {
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
    const key = keyOf(c);

    const prisma = getPrisma();
    let count: number;
    try {
      const bucket = await prisma.rateLimitBucket.upsert({
        where: { key_windowStart: { key, windowStart } },
        create: { key, windowStart, count: 1 },
        update: { count: { increment: 1 } },
      });
      count = bucket.count;
    } catch (error) {
      console.error("Rate limit store unavailable, allowing the request", error);
      await next();
      return;
    }

    invocations += 1;
    if (invocations % PRUNE_EVERY === 0) {
      await pruneStaleBuckets(prisma);
    }

    if (count > options.limit) {
      const remainingMs = windowStart.getTime() + windowMs - now;
      const retryAfter = Math.max(1, Math.ceil(remainingMs / 1000));
      return c.json({ error: "Too many requests" }, 429, { "Retry-After": String(retryAfter) });
    }

    await next();
  };

  return handler;
}
