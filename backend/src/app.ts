import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPrisma } from "./db.js";
import type { Env } from "./auth/middleware.js";
import { uploads } from "./routes/v1/uploads.js";
import { jobs } from "./routes/v1/jobs.js";
import { applications } from "./routes/v1/applications.js";

const corsOrigins = (process.env.JF_CORS_ORIGINS ?? "http://localhost:3000,capacitor://localhost,https://localhost")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const MAX_BODY_BYTES = 100_000;
const MAX_UPLOAD_BYTES = 10_000_000;
const UPLOAD_PATH = "/v1/uploads";

const app = new Hono<Env>();

app.use("*", cors({ origin: corsOrigins, credentials: true, allowHeaders: ["Authorization", "Content-Type"], allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));

app.use("*", async (c, next) => {
  const contentLength = Number(c.req.header("content-length") ?? 0);
  const path = c.req.path;
  const isUpload = path === UPLOAD_PATH || path === `${UPLOAD_PATH}/`;
  const maxBytes = isUpload ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES;
  if (contentLength > maxBytes) {
    return c.json({ error: "Payload too large" }, 413);
  }
  await next();
});

app.get("/ping", (c) => c.json({ ok: true }));

app.route("/v1/uploads", uploads);
app.route("/v1/jobs", jobs);
app.route("/v1/applications", applications);

app.get("/health", async (c) => {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return c.json({ ok: true });
  } catch (error) {
    console.error("Health check failed", error);
    return c.json({ error: "Database unavailable" }, 503);
  }
});

app.onError((err, c) => {
  console.error(`Unhandled error for ${c.req.method} ${c.req.path}`, err);
  return c.json({ error: "Internal server error" }, 500);
});

export { app };
