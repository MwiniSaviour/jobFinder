import { getRaw, registerKey, writeRaw } from "./storage";

const DEVICE_KEY = "jobfinder_device_id";
registerKey(DEVICE_KEY, "persistent");

export type RideClass = "economy" | "comfort" | "suv";
export type ParcelTier = "small" | "medium" | "large";
export type PaymentMethod = "pod" | "momo" | "card";
export type RequestType = "ride" | "parcel";

const RIDE_CLASSES: readonly RideClass[] = ["economy", "comfort", "suv"];
const PARCEL_TIERS: readonly ParcelTier[] = ["small", "medium", "large"];
const PAYMENT_METHODS: readonly PaymentMethod[] = ["pod", "momo", "card"];

function resolveBase(): string {
  const base = (process.env.NEXT_PUBLIC_JOB_API_BASE ?? "").trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error(" JOB_API_BASE_MISSING");
  }
  return base;
}

function serviceKey(): string {
  const key = (process.env.NEXT_PUBLIC_JOBFINDER_API_KEY ?? "").trim();
  if (!key) {
    throw new Error("SERVICE_KEY_MISSING");
  }
  return key;
}

export class JobsApiError extends Error {
  readonly status: number | null;
  readonly issues: Record<string, unknown> | null;

  constructor(message: string, status: number | null, issues: Record<string, unknown> | null = null) {
    super(message);
    this.name = "JobsApiError";
    this.status = status;
    this.issues = issues;
  }
}

function generateId(): string {
  const cryptoRef = globalThis.crypto;
  if (typeof cryptoRef?.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  let suffix = "";
  for (let index = 0; index < 4; index += 1) {
    suffix += Math.floor(Math.random() * 0x1000000)
      .toString(36)
      .padStart(5, "0");
  }
  return `jf-${Date.now().toString(36)}-${suffix}`;
}

export function resolveDeviceId(): string {
  if (typeof window === "undefined") return "server-preview-device";
  const existing = getRaw(DEVICE_KEY, "persistent");
  if (existing) return existing;
  const id = generateId();
  writeRaw(DEVICE_KEY, id, "persistent");
  return id;
}

export function newIdempotencyKey(): string {
  return generateId().slice(0, 120);
}

export interface PlacePayload {
  name: string;
  address: string;
  area?: string;
  region: string;
  lat: number;
  lng: number;
  ghanaPost?: string;
}

export interface CreateRidePayload {
  requestType: RequestType;
  contact: { name: string; phone: string; email?: string };
  pickup: PlacePayload;
  dropoff: PlacePayload;
  rideClass?: RideClass;
  parcelTier?: ParcelTier;
  note?: string;
  scheduledFor?: string;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export interface TaskDto {
  id: string;
  appId: string;
  pickup: { name: string; address: string; hub: string | null; lat: number; lng: number };
  dropoff: { name: string; address: string; area: string | null; lat: number; lng: number };
  customer: string;
  phone: string;
  payment: "prepaid" | "COD";
  codAmount: string | null;
  itemsSummary: string;
  distanceKm: number;
  etaMin: number;
  earnings: string;
  status: string;
  pickupCode: string | null;
  dropoffCode?: string | null;
  offerExpiresAt: number | null;
  assignmentStatus: string | null;
  assignmentAttempt: number;
  history: { at: number; label: string }[];
}

export interface JobDto {
  jobId: string;
  status: string;
  requestType: RequestType | null;
  fare: string;
  currency: string;
  etaMinutes: number | null;
  pickup: PlacePayload | null;
  dropoff: PlacePayload | null;
  task: TaskDto | null;
  payment: {
    method: string;
    reference: string;
    status: string;
    checkoutUrl: string | null;
  } | null;
  guest: { id: string; email: string };
}

export type RequestTypeValue = RequestType;

function sanitizeNames(payload: CreateRidePayload): Record<string, unknown> | null {
  if (payload.requestType === "parcel" && payload.parcelTier && !PARCEL_TIERS.includes(payload.parcelTier)) {
    return null;
  }
  if (payload.rideClass && !RIDE_CLASSES.includes(payload.rideClass)) return null;
  if (payload.paymentMethod && !PAYMENT_METHODS.includes(payload.paymentMethod)) return null;
  const body: Record<string, unknown> = {
    deviceId: resolveDeviceId(),
    requestType: payload.requestType,
    contact: {
      name: payload.contact.name,
      phone: payload.contact.phone,
      ...(payload.contact.email ? { email: payload.contact.email } : {}),
    },
    pickup: { ...payload.pickup },
    dropoff: { ...payload.dropoff },
    paymentMethod: payload.paymentMethod ?? "pod",
  };
  if (payload.requestType === "ride" && payload.rideClass) {
    body.rideClass = payload.rideClass;
  }
  if (payload.requestType === "parcel" && payload.parcelTier) {
    body.parcelTier = payload.parcelTier;
  }
  if (payload.note) body.note = payload.note;
  if (payload.scheduledFor) body.scheduledFor = payload.scheduledFor;
  if (payload.idempotencyKey) body.idempotencyKey = payload.idempotencyKey;
  return body;
}

export async function createRide(
  payload: CreateRidePayload,
): Promise<{ ok: true; job: JobDto; status: number } | { ok: false; status: number | null; error: string; issues?: Record<string, unknown> }> {
  const body = sanitizeNames(payload);
  if (!body) {
    return { ok: false, status: null, error: "Invalid ride or parcel details." };
  }
  try {
    const base = resolveBase();
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-jobfinder-key": serviceKey(),
    };
    const response = await fetch(`${base}/v1/jobs`, { method: "POST", headers, body: JSON.stringify(body) });
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : null;
    if (!data) {
      return { ok: false, status: response.status, error: `Unexpected response status ${response.status}` };
    }
    if (!response.ok) {
      return { ok: false, status: response.status, error: describeApiError(data, response.status) };
    }
    return { ok: true, job: data as JobDto, status: response.status };
  } catch (error) {
    return { ok: false, status: null, error: extractNetworkError(error) };
  }
}

export async function getRide(
  jobId: string,
): Promise<{ ok: true; job: JobDto } | { ok: false; status: number | null; error: string }> {
  if (!jobId) return { ok: false, status: null, error: "Job id missing." };
  try {
    const base = resolveBase();
    const headers: Record<string, string> = { "x-jobfinder-key": serviceKey() };
    const response = await fetch(`${base}/v1/jobs/${encodeURIComponent(jobId)}`, { headers });
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json") ? await response.json() : null;
    if (!data) return { ok: false, status: response.status, error: `Unexpected response status ${response.status}` };
    if (!response.ok) return { ok: false, status: response.status, error: describeApiError(data, response.status) };
    return { ok: true, job: data as JobDto };
  } catch (error) {
    return { ok: false, status: null, error: extractNetworkError(error) };
  }
}

export interface PollRideResult {
  job: JobDto | null;
  error: string | null;
  status: number | null;
}

export async function pollRide(jobId: string): Promise<PollRideResult> {
  const outcome = await getRide(jobId);
  if (outcome.ok) return { job: outcome.job, error: null, status: null };
  return { job: null, error: outcome.error, status: outcome.status };
}

function describeApiError(data: Record<string, unknown> | null, status: number): string {
  if (data && typeof data.error === "string") {
    return status === 401
      ? "Ride service rejected the credentials."
      : data.error;
  }
  return `Request failed (status ${status})`;
}

function extractNetworkError(error: unknown): string {
  if (error instanceof TypeError) {
    return "Could not reach the ride service. Check your connection and try again.";
  }
  if (error instanceof Error) return error.message;
  return "Unknown ride service error.";
}

export type { RIDE_CLASSES, PARCEL_TIERS, PAYMENT_METHODS };
