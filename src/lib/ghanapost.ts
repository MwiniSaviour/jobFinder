const UPSTREAM_BASE = "https://ghanapostgps.sperixlabs.org";
const DIGITAL_ADDRESS_PATTERN = /^[A-Z]{2}\d{7}$/;
const TIMEOUT_MS = 8000;

export type GhanaPostLocation = {
  code: string | null;
  region: string;
  district: string;
  area: string;
  street: string;
  lat: number;
  lng: number;
};

export function normalizeDigitalAddress(value: string): string | null {
  const compact = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!DIGITAL_ADDRESS_PATTERN.test(compact)) {
    return null;
  }
  return `${compact.slice(0, 2)}-${compact.slice(2, 5)}-${compact.slice(5, 9)}`;
}

type UpstreamRow = Record<string, unknown>;

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function mean(a: number | null, b: number | null): number | null {
  if (a !== null && b !== null) {
    return (a + b) / 2;
  }
  return a ?? b;
}

function centerFromRow(row: UpstreamRow): { lat: number; lng: number } | null {
  const lat = toNumber(row.CenterLatitude) ?? mean(toNumber(row.NLat), toNumber(row.Slat));
  const lng =
    toNumber(row.CenterLongitude) ??
    mean(toNumber(row.WLong), toNumber(row.Elong)) ??
    mean(toNumber(row.NorthLong), toNumber(row.SouthLong));
  if (lat === null || lng === null) {
    return null;
  }
  return { lat, lng };
}

async function askUpstream(path: string, fields: string): Promise<UpstreamRow | null> {
  try {
    const response = await fetch(`${UPSTREAM_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fields,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    const answer = (await response.json()) as { data?: { Table?: unknown } };
    const table = answer?.data?.Table;
    if (!Array.isArray(table) || table.length === 0) {
      return null;
    }
    const row = table[0];
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      return null;
    }
    return row as UpstreamRow;
  } catch {
    return null;
  }
}

function toLocation(row: UpstreamRow): GhanaPostLocation | null {
  const center = centerFromRow(row);
  if (!center) {
    return null;
  }
  return {
    code: toText(row.GPSName) || toText(row.AddressV1) || null,
    region: toText(row.Region),
    district: toText(row.District),
    area: toText(row.Area),
    street: toText(row.Street),
    lat: center.lat,
    lng: center.lng,
  };
}

export async function lookupDigitalAddress(code: string): Promise<GhanaPostLocation | null> {
  const normalized = normalizeDigitalAddress(code);
  if (!normalized) {
    return null;
  }
  const row = await askUpstream(
    "/get-location",
    new URLSearchParams({ address: normalized }).toString(),
  );
  return row ? toLocation(row) : null;
}

export async function lookupLocationForCoords(
  lat: number,
  lng: number,
): Promise<GhanaPostLocation | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  const row = await askUpstream(
    "/get-address",
    new URLSearchParams({ lat: lat.toFixed(7), long: lng.toFixed(7) }).toString(),
  );
  return row ? toLocation(row) : null;
}
