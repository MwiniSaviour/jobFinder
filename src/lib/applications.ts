export type ApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

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
  applied: "Applied",
  viewed: "Application viewed",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offer: "Job offer",
  hired: "Hired",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export const APPLICATION_STATUS_COPY: Record<ApplicationStatus, string> = {
  applied: "Your application is queued for the employer.",
  viewed: "The employer opened your application.",
  shortlisted: "The employer moved you forward.",
  interview: "The employer asked for an interview.",
  offer: "The employer made you an offer.",
  hired: "The employer hired you.",
  rejected: "The employer did not move forward.",
  withdrawn: "You withdrew this application.",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "applied",
  "viewed",
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

export const TERMINAL_APPLICATION_STATUSES: ApplicationStatus[] = [
  "hired",
  "rejected",
  "withdrawn",
];

export const APPLICATION_HISTORY_LIMIT = 50;

type SimulatedStep = {
  from: ApplicationStatus;
  to: ApplicationStatus;
  afterMs: number;
};

export const SIMULATED_RESPONSE_PLAN: SimulatedStep[] = [
  { from: "applied", to: "viewed", afterMs: 60_000 },
  { from: "viewed", to: "shortlisted", afterMs: 240_000 },
  { from: "shortlisted", to: "interview", afterMs: 480_000 },
  { from: "interview", to: "offer", afterMs: 780_000 },
  { from: "offer", to: "hired", afterMs: 1_200_000 },
];

export const REJECTION_PROBABILITY = 0.3;

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    value === "applied" ||
    value === "viewed" ||
    value === "shortlisted" ||
    value === "interview" ||
    value === "offer" ||
    value === "hired" ||
    value === "rejected" ||
    value === "withdrawn"
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

function isEvent(value: unknown): value is ApplicationEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item.at) &&
    isApplicationStatus(item.status) &&
    (item.source === "you" || item.source === "employer") &&
    isString(item.text)
  );
}

export function isApplicationRecord(value: unknown): value is ApplicationRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    isNumber(item.jobId) &&
    isApplicationStatus(item.status) &&
    isString(item.appliedAt) &&
    isString(item.updatedAt) &&
    Array.isArray(item.events) &&
    item.events.every(isEvent)
  );
}

export function parseApplications(raw: string | null): ApplicationRecord[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isApplicationRecord).slice(0, APPLICATION_HISTORY_LIMIT);
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
    return { status: "rejected", afterMs: plan.afterMs };
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
    status: "applied",
    appliedAt: at,
    updatedAt: at,
    startDate,
    note,
    events: [{ at, status: "applied", source: "you", text: "Application sent." }],
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
    { at, status: "withdrawn", source: "you", text: "You withdrew this application." },
  ];
  return {
    ...record,
    status: "withdrawn",
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

export function applicationForJob(
  records: ApplicationRecord[],
  jobId: number,
): ApplicationRecord | undefined {
  return records.find((record) => record.jobId === jobId);
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
