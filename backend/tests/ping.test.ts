import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("GET /ping", () => {
  it("returns ok without touching the database", async () => {
    const res = await app.request("/ping");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
