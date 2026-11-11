import type { MiddlewareHandler } from "hono";

const MAX_BODY_BYTES = 100_000;
const MAX_UPLOAD_BYTES = 10_000_000;
const UPLOAD_PATH = "/v1/uploads";

export { MAX_BODY_BYTES, MAX_UPLOAD_BYTES, UPLOAD_PATH };

export function isUploadPath(path: string): boolean {
  return path === UPLOAD_PATH || path === `${UPLOAD_PATH}/`;
}

export function bodyLimitFor(path: string): number {
  return isUploadPath(path) ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES;
}

export type ContentLength =
  | { kind: "absent" }
  | { kind: "invalid" }
  | { kind: "known"; bytes: number };

export function parseContentLength(value: string | undefined): ContentLength {
  if (value === undefined) return { kind: "absent" };
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return { kind: "invalid" };
  const bytes = Number(trimmed);
  if (!Number.isSafeInteger(bytes)) return { kind: "invalid" };
  return { kind: "known", bytes };
}

export async function readBodyWithLimit(
  body: ReadableStream<Uint8Array>,
  limit: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const merged = new Uint8Array(new ArrayBuffer(total));
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

export function bodyLimit(): MiddlewareHandler {
  return async (c, next) => {
    const limit = bodyLimitFor(c.req.path);
    const contentLength = parseContentLength(c.req.header("content-length"));

    if (contentLength.kind === "invalid") {
      return c.json({ error: "Invalid Content-Length" }, 400);
    }
    if (contentLength.kind === "known") {
      if (contentLength.bytes > limit) {
        return c.json({ error: "Payload too large" }, 413);
      }
      await next();
      return;
    }

    const body = c.req.raw.body;
    if (!body) {
      await next();
      return;
    }

    const bytes = await readBodyWithLimit(body, limit);
    if (bytes === null) {
      return c.json({ error: "Payload too large" }, 413);
    }

    const headers = new Headers(c.req.raw.headers);
    headers.delete("content-length");
    c.req.raw = new Request(c.req.url, {
      method: c.req.method,
      headers,
      body: bytes,
    });
    await next();
  };
}
