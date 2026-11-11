export type ApplicationStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type ApplicationEventSource = "you" | "employer";

export type ApplicationEvent = {
  at: string;
  status: ApplicationStatus;
  source: ApplicationEventSource;
  text: string;
};

export type ApplicationRecord = {
  jobId: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  startDate: string | null;
  note: string;
  events: ApplicationEvent[];
  simulatedNextAt: string | null;
  simulatedNextStatus: ApplicationStatus | null;
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  SUBMITTED: "Applied",
  REVIEWING: "In review",
  ACCEPTED: "Accepted",
  REJECTED: "Not selected",
  WITHDRAWN: "Withdrawn",
};

export const APPLICATION_STATUS_COPY: Record<ApplicationStatus, string> = {
  SUBMITTED: "Your application is queued for the employer.",
  REVIEWING: "The employer is reviewing your application.",
  ACCEPTED: "The employer accepted your application.",
  REJECTED: "The employer did not move forward.",
  WITHDRAWN: "You withdrew this application.",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = ["SUBMITTED", "REVIEWING"];

export const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export const APPLICATION_HISTORY_LIMIT = 50;

type SimulatedStep = {
  from: ApplicationStatus;
  to: ApplicationStatus;
  afterMs: number;
};

export const SIMULATED_RESPONSE_PLAN: SimulatedStep[] = [
  { from: "SUBMITTED", to: "REVIEWING", afterMs: 60_000 },
  { from: "REVIEWING", to: "ACCEPTED", afterMs: 480_000 },
];

export const REJECTION_PROBABILITY = 0.3;

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    value === "SUBMITTED" ||
    value === "REVIEWING" ||
    value === "ACCEPTED" ||
    value === "REJECTED" ||
    value === "WITHDRAWN"
  );
}

export function isTerminalStatus(status: ApplicationStatus): boolean {
  return TERMINAL_APPLICATION_STATUSES.includes(status);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const LEGACY_STATUS_MAP = new Map<string, ApplicationStatus>([
  ["applied", "SUBMITTED"],
  ["viewed", "REVIEWING"],
  ["shortlisted", "REVIEWING"],
  ["interview", "REVIEWING"],
  ["offer", "REVIEWING"],
  ["hired", "ACCEPTED"],
  ["rejected", "REJECTED"],
  ["withdrawn", "WITHDRAWN"],
]);

function normalizeLegacyStatus(value: unknown): ApplicationStatus | null {
  if (isApplicationStatus(value)) return value;
  if (!isString(value)) return null;
  return LEGACY_STATUS_MAP.get(value) ?? null;
}

function normalizeEventSource(value: unknown): ApplicationEventSource | null {
  if (value === "you") return "you";
  if (value === "employer") return "employer";
  return null;
}

function normalizeEvent(value: unknown): ApplicationEvent | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const status = normalizeLegacyStatus(item.status);
  const source = normalizeEventSource(item.source);
  if (!status || !source) return null;
  if (!isString(item.at) || !isString(item.text)) return null;
  const text = isApplicationStatus(item.status) ? item.text : APPLICATION_STATUS_COPY[status];
  return { at: item.at, status, source, text };
}

function normalizeApplicationRecord(value: unknown): ApplicationRecord | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const status = normalizeLegacyStatus(item.status);
  if (!status) return null;
  if (!isNumber(item.jobId)) return null;
  if (!isString(item.appliedAt) || !isString(item.updatedAt)) return null;
  if (!Array.isArray(item.events)) return null;
  const events: ApplicationEvent[] = [];
  for (const entry of item.events) {
    const event = normalizeEvent(entry);
    if (!event) return null;
    events.push(event);
  }
  const record: ApplicationRecord = {
    jobId: item.jobId,
    status,
    appliedAt: item.appliedAt,
    updatedAt: item.updatedAt,
    startDate: isString(item.startDate) ? item.startDate : null,
    note: isString(item.note) ? item.note : "",
    events,
    simulatedNextAt: null,
    simulatedNextStatus: null,
  };
  return withNextSchedule(record);
}

export function parseApplications(raw: string | null): ApplicationRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const records = parsed
      .map((item) => normalizeApplicationRecord(item))
      .filter((record): record is ApplicationRecord => record !== null);
    return records.slice(0, APPLICATION_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function hash(value: number): number {
  let x = value | 0;
  x = (x ^ 61) ^ (x >>> 16);
  x = (x + (x << 3)) | 0;
  x = x ^ (x >>> 4);
  x = Math.imul(x, 0x27d4eb2d);
  x = x ^ (x >>> 15);
  return (x >>> 0) / 4294967296;
}

export function nextSimulatedResponse(
  current: ApplicationStatus,
  jobId: number,
): { status: ApplicationStatus; afterMs: number } | null {
  const planIndex = SIMULATED_RESPONSE_PLAN.findIndex((step) => step.from === current);
  if (planIndex < 0) return null;
  const plan = SIMULATED_RESPONSE_PLAN[planIndex];
  const roll = hash(jobId * 31 + planIndex * 7919 + 17);
  if (roll < REJECTION_PROBABILITY) {
    return { status: "REJECTED", afterMs: plan.afterMs };
  }
  return { status: plan.to, afterMs: plan.afterMs };
}

function withNextSchedule(record: ApplicationRecord): ApplicationRecord {
  if (isTerminalStatus(record.status)) {
    return { ...record, simulatedNextAt: null, simulatedNextStatus: null };
  }
  const next = nextSimulatedResponse(record.status, record.jobId);
  if (!next) {
    return { ...record, simulatedNextAt: null, simulatedNextStatus: null };
  }
  const base = new Date(record.updatedAt).getTime();
  const safeBase = Number.isNaN(base) ? Date.now() : base;
  return {
    ...record,
    simulatedNextAt: new Date(safeBase + next.afterMs).toISOString(),
    simulatedNextStatus: next.status,
  };
}

export function createApplication(
  jobId: number,
  startDate: string | null,
  note: string,
  now: Date = new Date(),
): ApplicationRecord {
  const at = now.toISOString();
  const record: ApplicationRecord = {
    jobId,
    status: "SUBMITTED",
    appliedAt: at,
    updatedAt: at,
    startDate,
    note,
    events: [{ at, status: "SUBMITTED", source: "you", text: "Application sent." }],
    simulatedNextAt: null,
    simulatedNextStatus: null,
  };
  return withNextSchedule(record);
}

export function withdrawApplication(
  record: ApplicationRecord,
  now: Date = new Date(),
): ApplicationRecord {
  if (isTerminalStatus(record.status)) return record;
  const at = now.toISOString();
  const events: ApplicationEvent[] = [
    ...record.events,
    { at, status: "WITHDRAWN", source: "you", text: "You withdrew this application." },
  ];
  return {
    ...record,
    status: "WITHDRAWN",
    updatedAt: at,
    events,
    simulatedNextAt: null,
    simulatedNextStatus: null,
  };
}

export function applySimulatedResponse(
  record: ApplicationRecord,
  now: Date = new Date(),
): ApplicationRecord {
  if (isTerminalStatus(record.status)) return record;
  if (!record.simulatedNextAt || !record.simulatedNextStatus) return record;
  const due = new Date(record.simulatedNextAt).getTime();
  if (Number.isNaN(due) || now.getTime() < due) return record;
  const at = new Date(due).toISOString();
  const status = record.simulatedNextStatus;
  const events: ApplicationEvent[] = [
    ...record.events,
    { at, status, source: "employer", text: APPLICATION_STATUS_COPY[status] },
  ];
  return withNextSchedule({
    ...record,
    status,
    updatedAt: at,
    events,
  });
}

export function applySimulatedResponseNow(
  record: ApplicationRecord,
  now: Date = new Date(),
): ApplicationRecord {
  if (isTerminalStatus(record.status)) return record;
  if (!record.simulatedNextStatus) return record;
  const at = now.toISOString();
  const status = record.simulatedNextStatus;
  const events: ApplicationEvent[] = [
    ...record.events,
    { at, status, source: "employer", text: APPLICATION_STATUS_COPY[status] },
  ];
  return withNextSchedule({
    ...record,
    status,
    updatedAt: at,
    events,
  });
}

export function formatEventTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
