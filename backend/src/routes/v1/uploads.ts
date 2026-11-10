import { Hono } from "hono";
import type { Env } from "../../auth/middleware.js";
import { requireAuth } from "../../auth/middleware.js";
import { isUploadsConfigured, uploadImage } from "../../uploads/cloudinary.js";

const uploads = new Hono<Env>();

uploads.post("/", requireAuth, async (c) => {
  const contentType = (c.req.header("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!contentType.startsWith("image/")) {
    return c.json({ error: "Unsupported media type" }, 415);
  }

  if (!isUploadsConfigured()) {
    return c.json({ error: "Uploads are not configured" }, 503);
  }

  const body = await c.req.arrayBuffer();
  if (body.byteLength === 0) {
    return c.json({ error: "Empty upload" }, 400);
  }

  try {
    const url = await uploadImage(new Uint8Array(body), contentType);
    return c.json({ url });
  } catch (error) {
    console.error("Upload failed", error);
    return c.json({ error: "Upload failed" }, 502);
  }
});

export { uploads };
