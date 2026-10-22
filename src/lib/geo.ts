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
    id: "accra",
    name: "Accra",
    label: "Greater Accra",
    capital: "Accra",
    center: { lat: 5.6037, lng: -0.187 },
  },
  {
    id: "kumasi",
    name: "Kumasi",
    label: "Ashanti",
    capital: "Kumasi",
    center: { lat: 6.6885, lng: -1.6244 },
  },
  {
    id: "takoradi",
    name: "Takoradi",
    label: "Western",
    capital: "Sekondi-Takoradi",
    center: { lat: 4.8956, lng: -1.7554 },
  },
  {
    id: "cape-coast",
    name: "Cape Coast",
    label: "Central",
    capital: "Cape Coast",
    center: { lat: 5.1315, lng: -1.2795 },
  },
  {
    id: "tamale",
    name: "Tamale",
    label: "Northern",
    capital: "Tamale",
    center: { lat: 9.4008, lng: -0.8393 },
  },
  {
    id: "tema",
    name: "Tema",
    label: "Greater Accra",
    capital: "Accra",
    center: { lat: 5.6698, lng: -0.0166 },
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
  { addr: "Kotoka International Airport", regionId: "accra", jitterLat: 0.0041, jitterLng: 0.0016 },
  { addr: "Makola Market, Accra", regionId: "accra", jitterLat: -0.0035, jitterLng: 0.0028 },
  { addr: "Osu Oxford Street", regionId: "accra", jitterLat: 0.0024, jitterLng: -0.0019 },
  { addr: "Adum, Kumasi", regionId: "kumasi", jitterLat: 0.0018, jitterLng: 0.0011 },
  { addr: "Kwame Nkrumah University, Kumasi", regionId: "kumasi", jitterLat: -0.0012, jitterLng: -0.0023 },
  { addr: "Market Circle, Takoradi", regionId: "takoradi", jitterLat: 0.0009, jitterLng: 0.0014 },
  { addr: "Sekondi Jetty", regionId: "takoradi", jitterLat: -0.0017, jitterLng: -0.0008 },
  { addr: "Cape Coast Castle", regionId: "cape-coast", jitterLat: 0.0013, jitterLng: 0.0006 },
  { addr: "Kotokuraba Market", regionId: "cape-coast", jitterLat: -0.0007, jitterLng: 0.0012 },
  { addr: "Tamale Central Market", regionId: "tamale", jitterLat: 0.001, jitterLng: 0.0015 },
  { addr: "Tema Harbour", regionId: "tema", jitterLat: 0.0008, jitterLng: 0.0013 },
  { addr: "Tema Motorway Roundabout", regionId: "tema", jitterLat: -0.0011, jitterLng: -0.0014 },
];

const REGION_ALIASES: { match: string; regionId: string }[] = [
  { match: "greater accra", regionId: "accra" },
  { match: "sekondi", regionId: "takoradi" },
  { match: "cape coast", regionId: "cape-coast" },
];

const MOCK_DRIVERS: Record<string, { name: string; vehicle: string; plate: string }> = {
  accra: { name: "Kwame Mensah", vehicle: "Toyota Corolla", plate: "GR 4821 V" },
  kumasi: { name: "Yaw Osei", vehicle: "Kia Rio", plate: "AS 7145 W" },
  takoradi: { name: "Kojo Boateng", vehicle: "Toyota RAV4", plate: "WR 2093 X" },
  "cape-coast": { name: "Ekow Asante", vehicle: "Nissan Kicks", plate: "CR 1167 Y" },
  tamale: { name: "Abdul Fuseini", vehicle: "Toyota Vitz", plate: "GT 9088 Z" },
  tema: { name: "Kofi Amoah", vehicle: "Hyundai Accent", plate: "GM 5534 A" },
};

const FALLBACK_DRIVER = { name: "Ama Serwaa", vehicle: "Toyota Vitz", plate: "GR 0071 B" };

const GPS_FIX: LatLng = { lat: 5.6037, lng: -0.187 };

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

export async function getGpsPosition(): Promise<LatLng> {
  return { ...GPS_FIX };
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ name?: string }> {
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
