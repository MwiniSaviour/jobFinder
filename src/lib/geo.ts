import type { GhanaPostLocation } from "./ghanapost";
import {
  lookupDigitalAddress,
  lookupLocationForCoords,
} from "./ghanapost";
import type { RideClass } from "./rides";

export type LatLng = { lat: number; lng: number };
export type WeightTier = "small" | "medium" | "large";

export type Region = {
  id: string;
  name: string;
  label?: string;
  capital: string;
  center: LatLng;
};

export type PlaceResult = {
  addr: string;
  lat: number;
  lng: number;
  regionId: string | null;
  name?: string;
  detail?: string;
};

export const GH_REGIONS: Region[] = [
  {
    id: "ahafo",
    name: "Ahafo",
    capital: "Goaso",
    center: { lat: 6.98, lng: -2.51 },
  },
  {
    id: "ashanti",
    name: "Ashanti",
    capital: "Kumasi",
    center: { lat: 6.6885, lng: -1.6244 },
  },
  {
    id: "bono",
    name: "Bono",
    capital: "Sunyani",
    center: { lat: 7.3349, lng: -2.3268 },
  },
  {
    id: "bono-east",
    name: "Bono East",
    capital: "Techiman",
    center: { lat: 7.5878, lng: -1.9374 },
  },
  {
    id: "central",
    name: "Central",
    capital: "Cape Coast",
    center: { lat: 5.1315, lng: -1.2795 },
  },
  {
    id: "eastern",
    name: "Eastern",
    capital: "Koforidua",
    center: { lat: 6.0941, lng: -0.2591 },
  },
  {
    id: "greater-accra",
    name: "Greater Accra",
    capital: "Accra",
    center: { lat: 5.6037, lng: -0.187 },
  },
  {
    id: "north-east",
    name: "North East",
    capital: "Nalerigu",
    center: { lat: 10.279, lng: -0.417 },
  },
  {
    id: "northern",
    name: "Northern",
    capital: "Tamale",
    center: { lat: 9.4008, lng: -0.8393 },
  },
  {
    id: "oti",
    name: "Oti",
    capital: "Dambai",
    center: { lat: 7.833, lng: 0.167 },
  },
  {
    id: "savannah",
    name: "Savannah",
    capital: "Damongo",
    center: { lat: 9.1919, lng: -1.8306 },
  },
  {
    id: "upper-east",
    name: "Upper East",
    capital: "Bolgatanga",
    center: { lat: 10.7856, lng: -0.8514 },
  },
  {
    id: "upper-west",
    name: "Upper West",
    capital: "Wa",
    center: { lat: 10.0601, lng: -2.5099 },
  },
  {
    id: "volta",
    name: "Volta",
    capital: "Ho",
    center: { lat: 6.6116, lng: 0.4714 },
  },
  {
    id: "western",
    name: "Western",
    capital: "Sekondi-Takoradi",
    center: { lat: 4.8956, lng: -1.7554 },
  },
  {
    id: "western-north",
    name: "Western North",
    capital: "Sefwi Wiawso",
    center: { lat: 6.1878, lng: -2.4931 },
  },
];

export default GH_REGIONS;

const FARE_RULES: Record<RideClass, { base: number; perKm: number }> = {
  Economy: { base: 8, perKm: 2.2 },
  Comfort: { base: 12, perKm: 3 },
  SUV: { base: 18, perKm: 4 },
};

const WEIGHT_MULTIPLIER: Record<WeightTier, number> = {
  small: 1,
  medium: 1.15,
  large: 1.35,
};

type PlaceSeed = {
  addr: string;
  regionId: string;
  jitterLat: number;
  jitterLng: number;
};

const PLACE_SEEDS: PlaceSeed[] = [
  { addr: "Kotoka International Airport", regionId: "greater-accra", jitterLat: 0.0041, jitterLng: 0.0016 },
  { addr: "Makola Market, Accra", regionId: "greater-accra", jitterLat: -0.0035, jitterLng: 0.0028 },
  { addr: "Osu Oxford Street", regionId: "greater-accra", jitterLat: 0.0024, jitterLng: -0.0019 },
  { addr: "Tema Harbour", regionId: "greater-accra", jitterLat: 0.0008, jitterLng: 0.0013 },
  { addr: "Tema Motorway Roundabout", regionId: "greater-accra", jitterLat: -0.0011, jitterLng: -0.0014 },
  { addr: "Adum, Kumasi", regionId: "ashanti", jitterLat: 0.0018, jitterLng: 0.0011 },
  { addr: "Kwame Nkrumah University, Kumasi", regionId: "ashanti", jitterLat: -0.0012, jitterLng: -0.0023 },
  { addr: "Market Circle, Takoradi", regionId: "western", jitterLat: 0.0009, jitterLng: 0.0014 },
  { addr: "Sekondi Jetty", regionId: "western", jitterLat: -0.0017, jitterLng: -0.0008 },
  { addr: "Cape Coast Castle", regionId: "central", jitterLat: 0.0013, jitterLng: 0.0006 },
  { addr: "Kotokuraba Market", regionId: "central", jitterLat: -0.0007, jitterLng: 0.0012 },
  { addr: "Tamale Central Market", regionId: "northern", jitterLat: 0.001, jitterLng: 0.0015 },
];

const REGION_ALIASES: { match: string; regionId: string }[] = [
  { match: "western north", regionId: "western-north" },
  { match: "western", regionId: "western" },
  { match: "bono east", regionId: "bono-east" },
  { match: "bono", regionId: "bono" },
  { match: "north east", regionId: "north-east" },
  { match: "upper east", regionId: "upper-east" },
  { match: "upper west", regionId: "upper-west" },
  { match: "greater accra", regionId: "greater-accra" },
  { match: "takoradi", regionId: "western" },
  { match: "sekondi", regionId: "western" },
  { match: "koforidua", regionId: "eastern" },
  { match: "sunyani", regionId: "bono" },
  { match: "techiman", regionId: "bono-east" },
];

const MOCK_DRIVERS: Record<string, { name: string; vehicle: string; plate: string }> = {
  "greater-accra": { name: "Kwame Mensah", vehicle: "Toyota Corolla", plate: "GR 4821 V" },
  ashanti: { name: "Yaw Osei", vehicle: "Kia Rio", plate: "AS 7145 W" },
  western: { name: "Kojo Boateng", vehicle: "Toyota RAV4", plate: "WR 2093 X" },
  central: { name: "Ekow Asante", vehicle: "Nissan Kicks", plate: "CR 1167 Y" },
  northern: { name: "Abdul Fuseini", vehicle: "Toyota Vitz", plate: "GT 9088 Z" },
  eastern: { name: "Kofi Amoah", vehicle: "Hyundai Accent", plate: "GM 5534 A" },
};

const FALLBACK_DRIVER = { name: "Ama Serwaa", vehicle: "Toyota Vitz", plate: "GR 0071 B" };

const REGION_LETTERS: Record<string, string> = {
  G: "greater-accra",
  A: "ashanti",
  W: "western",
  C: "central",
  E: "eastern",
  N: "northern",
  V: "volta",
  B: "bono",
  U: "upper-east",
  O: "oti",
  S: "savannah",
};

function round2(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return Number.isFinite(rounded) ? rounded : 0;
}

export function haversineKm(from: LatLng, to: LatLng): number {
  const radius = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return round2(Math.max(0, 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)))));
}

export function etaMinutesFor(distanceKm: number): number {
  return Math.max(1, Math.ceil(distanceKm / 0.47));
}

export function fareBreakdown(
  distanceKm: number,
  rideClass: RideClass,
  weightTier: WeightTier | null,
): { total: number } {
  const rule = FARE_RULES[rideClass];
  const multiplier = weightTier ? WEIGHT_MULTIPLIER[weightTier] : 1;
  const total = round2(
    Math.max(0, (rule.base + Math.max(0, distanceKm) * rule.perKm) * multiplier),
  );
  return { total };
}

export function formatCedis(value: number): string {
  return `GH\u20B5 ${round2(value).toFixed(2)}`;
}

export function regionForName(value: string): Region | null {
  const query = value.trim().toLowerCase();
  if (!query) {
    return null;
  }
  const exact = GH_REGIONS.find((region) => region.name.toLowerCase() === query);
  if (exact) {
    return exact;
  }
  const partial = GH_REGIONS.find((region) => region.name.toLowerCase().includes(query));
  return partial ?? null;
}

export function nearestRegion(value: string): Region | null {
  const query = value.trim().toLowerCase();
  if (!query) {
    return null;
  }
  for (const alias of REGION_ALIASES) {
    if (query.includes(alias.match)) {
      const aliased = GH_REGIONS.find((region) => region.id === alias.regionId);
      return aliased ?? null;
    }
  }
  for (const region of GH_REGIONS) {
    if (query.includes(region.name.toLowerCase())) {
      return region;
    }
  }
  for (const region of GH_REGIONS) {
    if (region.name.toLowerCase().includes(query)) {
      return region;
    }
  }
  return null;
}

export function mockDriver(regionId: string): { name: string; vehicle: string; plate: string } {
  return MOCK_DRIVERS[regionId] ?? FALLBACK_DRIVER;
}

function placeFromSeed(seed: PlaceSeed): PlaceResult {
  const region = GH_REGIONS.find((entry) => entry.id === seed.regionId) ?? null;
  if (!region) {
    return { addr: seed.addr, lat: 0, lng: 0, regionId: null };
  }
  return {
    addr: seed.addr,
    lat: region.center.lat + seed.jitterLat,
    lng: region.center.lng + seed.jitterLng,
    regionId: region.id,
  };
}

export async function popularPlaces(regionIds: string[]): Promise<PlaceResult[]> {
  const scoped = PLACE_SEEDS.filter((seed) => regionIds.includes(seed.regionId));
  const global = PLACE_SEEDS.filter((seed) => !regionIds.includes(seed.regionId));
  return [...scoped, ...global].slice(0, 6).map(placeFromSeed);
}

export async function searchPlaces(
  query: string,
  opts?: { signal?: AbortSignal },
): Promise<PlaceResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || opts?.signal?.aborted) {
    return [];
  }
  const regionHits: PlaceResult[] = GH_REGIONS.filter(
    (region) =>
      region.name.toLowerCase().includes(trimmed) ||
      (region.label ? region.label.toLowerCase().includes(trimmed) : false),
  ).map((region) => ({
    addr: region.label ? `${region.name}, ${region.label}` : region.name,
    lat: region.center.lat,
    lng: region.center.lng,
    regionId: region.id,
  }));
  const placeHits: PlaceResult[] = PLACE_SEEDS.filter((seed) =>
    seed.addr.toLowerCase().includes(trimmed),
  ).map(placeFromSeed);
  return [...regionHits, ...placeHits].slice(0, 8);
}

export type GpsErrorKind = "denied" | "timeout" | "unavailable";

export class GpsError extends Error {
  kind: GpsErrorKind;

  constructor(kind: GpsErrorKind) {
    super(kind);
    this.name = "GpsError";
    this.kind = kind;
  }
}

export async function getGpsPosition(): Promise<LatLng> {
  if (typeof navigator === "undefined" || !navigator?.geolocation) {
    throw new GpsError("unavailable");
  }
  return new Promise<LatLng>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        if (error?.code === error?.PERMISSION_DENIED) {
          reject(new GpsError("denied"));
        } else if (error?.code === error?.TIMEOUT) {
          reject(new GpsError("timeout"));
        } else {
          reject(new GpsError("unavailable"));
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

function regionIdForGhanaPost(place: GhanaPostLocation): string | null {
  return (
    nearestRegion(`${place.region} ${place.district}`)?.id ??
    REGION_LETTERS[place.code?.[0] ?? ""] ??
    null
  );
}

function ghanapostLabel(place: GhanaPostLocation): string {
  const parts = [place.street, place.area, place.district, place.region];
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      lines.push(trimmed);
    }
    if (lines.length === 3) {
      break;
    }
  }
  return lines.join(", ") || place.code || "Ghana Post GPS";
}

export async function resolveDigitalAddress(value: string): Promise<PlaceResult | null> {
  try {
    const place = await lookupDigitalAddress(value);
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) {
      return null;
    }
    return {
      addr: ghanapostLabel(place),
      lat: place.lat,
      lng: place.lng,
      regionId: regionIdForGhanaPost(place),
      name: place.code ? `Ghana Post ${place.code}` : ghanapostLabel(place),
      detail: place.region,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ name?: string; digitalAddress?: string }> {
  try {
    const place = await lookupLocationForCoords(lat, lng);
    if (place && Number.isFinite(place.lat) && Number.isFinite(place.lng)) {
      const name =
        nearestRegion(`${place.region} ${place.district}`)?.name ?? place.district.trim();
      return place.code ? { name, digitalAddress: place.code } : { name };
    }
  } catch {}
  const point: LatLng = { lat, lng };
  let best: Region | null = null;
  let bestKm = Number.POSITIVE_INFINITY;
  for (const region of GH_REGIONS) {
    const km = haversineKm(point, region.center);
    if (km < bestKm) {
      best = region;
      bestKm = km;
    }
  }
  return best ? { name: best.name } : {};
}
