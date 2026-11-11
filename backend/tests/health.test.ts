import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db.js", () => {
  return {
    getPrisma: vi.fn(),
    closePrisma: vi.fn(),
  };
});

import { app } from "../src/app.js";
import { getPrisma } from "../src/db.js";

const queryRaw = vi.fn(async () => []);
const prismaStub = { $queryRaw: queryRaw };

beforeEach(() => {
  queryRaw.mockClear();
  vi.mocked(getPrisma).mockReturnValue(prismaStub as unknown as ReturnType<typeof getPrisma>);
});

describe("GET /ping", () => {
  it("returns ok without touching the database", async () => {
    const res = await app.request("/ping");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(queryRaw).not.toHaveBeenCalled();
  });
});

describe("GET /health", () => {
  it("returns ok when the database responds", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(queryRaw).toHaveBeenCalledOnce();
  });

  it("returns 503 when the database is unavailable", async () => {
    queryRaw.mockRejectedValueOnce(new Error("connection refused"));
    const res = await app.request("/health");
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Database unavailable" });
  });
});

describe("body size limit", () => {
  it("rejects oversized bodies with 413", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "content-length": "101000" },
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Payload too large" });
  });

  it("allows bodies at or under the limit", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "content-length": "100000" },
    });
    expect(res.status).not.toBe(413);
  });

  it("rejects oversized uploads with 413", async () => {
    const res = await app.request("/v1/uploads", {
      method: "POST",
      headers: { "content-length": "10000001" },
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "Payload too large" });
  });

  it("allows large uploads under the upload limit", async () => {
    const res = await app.request("/v1/uploads", {
      method: "POST",
      headers: { "content-length": "5000000" },
    });
    expect(res.status).not.toBe(413);
  });

  it("rejects a malformed content-length with 400", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "content-length": "not-a-number" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid Content-Length" });
  });

  it("rejects a negative content-length with 400", async () => {
    const res = await app.request("/", {
      method: "POST",
      headers: { "content-length": "-1" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid Content-Length" });
  });
});
