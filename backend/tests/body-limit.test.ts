import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { bodyLimit } from "../src/body-limit.js";

function makeApp() {
  const app = new Hono();
  app.use("*", bodyLimit());
  app.post("/echo", async (c) => {
    const body = await c.req.text();
    return c.json({ length: body.length, query: c.req.query("q") ?? null });
  });
  return app;
}

const app = makeApp();

describe("body limit middleware", () => {
  it("rejects a declared body over the limit with 413", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "content-length": "101000" },
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Payload too large" });
  });

  it("rejects a malformed content-length with 400", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "content-length": "not-a-number" },
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid Content-Length" });
  });

  it("rejects a negative content-length with 400", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "content-length": "-1" },
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid Content-Length" });
  });

  it("rejects a chunked body over the limit with 413", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "transfer-encoding": "chunked" },
      body: new Uint8Array(200000),
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Payload too large" });
  });

  it("allows a chunked body under the limit", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "transfer-encoding": "chunked" },
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 10, query: null });
  });

  it("reads the body of a request that declares no length", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 10, query: null });
  });

  it("leaves requests without a body untouched", async () => {
    const res = await app.request("/echo", { method: "POST" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 0, query: null });
  });

  it("preserves the request method, path and headers", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { authorization: "Bearer token", "content-type": "application/json" },
      body: new Uint8Array(10),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 10, query: null });
  });

  it("keeps the body readable after the middleware rewrote the request", async () => {
    const res = await app.request("/echo", {
      method: "POST",
      headers: { "transfer-encoding": "chunked" },
      body: new Uint8Array(64),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 64, query: null });
  });

  it("keeps query parameters intact after the middleware rewrote the request", async () => {
    const res = await app.request("/echo?q=hello", {
      method: "POST",
      headers: { "transfer-encoding": "chunked" },
      body: new Uint8Array(8),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ length: 8, query: "hello" });
  });
});
