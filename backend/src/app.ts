import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPrisma } from "./db.js";
import type { Env } from "./auth/middleware.js";
import { bodyLimit } from "./body-limit.js";
import { rateLimit } from "./rate-limit.js";
import { uploads } from "./routes/v1/uploads.js";
import { jobs } from "./routes/v1/jobs.js";
import { applications } from "./routes/v1/applications.js";
import { employerJobs } from "./routes/v1/employer-jobs.js";
import { savedJobs } from "./routes/v1/saved-jobs.js";
import { recentSearches } from "./routes/v1/recent-searches.js";
import { me } from "./routes/v1/me.js";

const corsOrigins = (process.env.JF_CORS_ORIGINS ?? "http://localhost:3000,capacitor://localhost,https://localhost")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = new Hono<Env>();

app.use("*", cors({ origin: corsOrigins, credentials: true, allowHeaders: ["Authorization", "Content-Type"], allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));

app.use("*", bodyLimit());

app.get("/ping", (c) => c.json({ ok: true }));

app.route("/v1/uploads", uploads);
app.route("/v1/jobs", jobs);
app.route("/v1/applications", applications);
app.route("/v1/saved-jobs", savedJobs);
app.route("/v1/recent-searches", recentSearches);
app.route("/v1/me", me);
app.route("/v1", employerJobs);

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
