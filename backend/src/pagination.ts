export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export type CursorSort = "new" | "pay";

export type Cursor = {
  k: CursorSort;
  v: string | number | null;
  i: string;
};

export function parseLimit(raw: string | undefined): number | null {
  if (raw === undefined) return DEFAULT_PAGE_SIZE;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > MAX_PAGE_SIZE) return null;
  return value;
}

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Cursor | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const candidate = parsed as { k?: unknown; v?: unknown; i?: unknown };
  if (candidate.k !== "new" && candidate.k !== "pay") return null;
  if (typeof candidate.i !== "string" || candidate.i === "") return null;

  if (candidate.k === "new") {
    if (typeof candidate.v !== "string") return null;
    const instant = new Date(candidate.v);
    if (Number.isNaN(instant.getTime())) return null;
    return { k: "new", v: instant.toISOString(), i: candidate.i };
  }

  if (candidate.v === null) return { k: "pay", v: null, i: candidate.i };
  if (typeof candidate.v !== "number" || !Number.isFinite(candidate.v)) return null;
  return { k: "pay", v: candidate.v, i: candidate.i };
}
