import { DEFAULT_FILTERS } from "./jobs";
import type { SortKey } from "./jobs";
import { createCollectionStore } from "./store";
import {
  readLocalRaw,
  readSessionRaw,
  removeRaw,
  writeRaw,
  type StorageScope,
} from "./storage";
import {
  createApplication,
  parseApplications,
  type ApplicationRecord,
} from "./applications";

export type Filters = {
  categories: string[];
  includeUnlisted: boolean;
  sort: SortKey;
};

export type JobsState = {
  version: number;
  recents: string[];
  savedIds: number[];
  applications: ApplicationRecord[];
};

export const STORAGE_KEY = "jf:jobs";
export const FILTERS_STORAGE_KEY = "jf:jobs:filters";
export const STATE_VERSION = 2;
export const RECENTS_LIMIT = 20;

export function freshState(): JobsState {
  return {
    version: STATE_VERSION,
    recents: [],
    savedIds: [],
    applications: [],
  };
}

export function freshFilters(): Filters {
  return {
    categories: [...DEFAULT_FILTERS.categories],
    includeUnlisted: DEFAULT_FILTERS.includeUnlisted,
    sort: DEFAULT_FILTERS.sort,
  };
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item): item is string => typeof item === "string");

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item): item is number => typeof item === "number");

const isSortKey = (value: unknown): value is SortKey => value === "new" || value === "pay";

function parseFilters(raw: string | null): Filters {
  if (!raw) return freshFilters();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return freshFilters();
    const source = parsed as Record<string, unknown>;
    return {
      categories: isStringArray(source.categories) ? source.categories : [],
      includeUnlisted:
        typeof source.includeUnlisted === "boolean" ? source.includeUnlisted : false,
      sort: isSortKey(source.sort) ? source.sort : "new",
    };
  } catch {
    return freshFilters();
  }
}

function parseJobsState(raw: string | null): JobsState {
  if (!raw) return freshState();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return freshState();
    const source = parsed as Record<string, unknown>;
    const applications = parseApplications(
      Array.isArray(source.applications) ? JSON.stringify(source.applications) : null,
    );
    const legacyApplied = isNumberArray(source.appliedIds) ? source.appliedIds : [];
    const recents = isStringArray(source.recents)
      ? source.recents.slice(0, RECENTS_LIMIT)
      : [];
    const savedIds = isNumberArray(source.savedIds) ? source.savedIds : [];
    if (applications.length > 0) {
      return { version: STATE_VERSION, recents, savedIds, applications };
    }
    if (legacyApplied.length > 0) {
      const migrated = legacyApplied.map((jobId) => createApplication(jobId, null, ""));
      return { version: STATE_VERSION, recents, savedIds, applications: migrated };
    }
    return { version: STATE_VERSION, recents, savedIds, applications: [] };
  } catch {
    return freshState();
  }
}

export const jobsStore = createCollectionStore<JobsState>(
  STORAGE_KEY,
  parseJobsState,
  "persistent",
);

export const filtersStore = createCollectionStore<Filters>(
  FILTERS_STORAGE_KEY,
  parseFilters,
  "session",
);

type LegacySource = {
  scope: StorageScope;
  key: string;
  removable: boolean;
  parsed: Record<string, unknown>;
};

function legacySources(): LegacySource[] {
  const candidates: {
    scope: StorageScope;
    key: string;
    removable: boolean;
    raw: string | null;
  }[] = [
    { scope: "session", key: STORAGE_KEY, removable: true, raw: readSessionRaw(STORAGE_KEY) },
    {
      scope: "persistent",
      key: `CapacitorStorage.${STORAGE_KEY}`,
      removable: true,
      raw: readLocalRaw(`CapacitorStorage.${STORAGE_KEY}`),
    },
    { scope: "persistent", key: STORAGE_KEY, removable: false, raw: readLocalRaw(STORAGE_KEY) },
  ];
  const sources: LegacySource[] = [];
  for (const candidate of candidates) {
    if (typeof candidate.raw !== "string" || candidate.raw.length === 0) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate.raw);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object") continue;
    sources.push({ ...candidate, parsed: parsed as Record<string, unknown> });
  }
  return sources;
}

function hasJobsFields(source: LegacySource): boolean {
  return (
    isStringArray(source.parsed.recents) ||
    isNumberArray(source.parsed.appliedIds) ||
    isNumberArray(source.parsed.savedIds)
  );
}

export async function migrateLegacyState(): Promise<void> {
  const sources = legacySources();
  if (sources.length === 0) return;

  const hasJobs = readLocalRaw(STORAGE_KEY) !== null;
  const hasFilters = readSessionRaw(FILTERS_STORAGE_KEY) !== null;

  let jobsSource: LegacySource | null = null;
  if (!hasJobs) {
    for (const source of sources) {
      const recents = isStringArray(source.parsed.recents)
        ? source.parsed.recents.slice(0, RECENTS_LIMIT)
        : [];
      const savedIds = isNumberArray(source.parsed.savedIds) ? source.parsed.savedIds : [];
      const appliedIds = isNumberArray(source.parsed.appliedIds) ? source.parsed.appliedIds : [];
      const applications = appliedIds.map((jobId) => createApplication(jobId, null, ""));
      writeRaw(
        STORAGE_KEY,
        JSON.stringify({ version: STATE_VERSION, recents, savedIds, applications }),
        "persistent",
      );
      jobsSource = source;
      break;
    }
  }

  let filtersSource: LegacySource | null = null;
  if (!hasFilters) {
    const preferred =
      sources.find((source) => typeof source.parsed.filters === "object" && source.parsed.filters !== null) ??
      sources[0];
    const filterSource = (typeof preferred.parsed.filters === "object" && preferred.parsed.filters !== null
      ? preferred.parsed.filters
      : {}) as Record<string, unknown>;
    writeRaw(
      FILTERS_STORAGE_KEY,
      JSON.stringify({
        categories: isStringArray(filterSource.categories) ? filterSource.categories : [],
        includeUnlisted:
          typeof filterSource.includeUnlisted === "boolean" ? filterSource.includeUnlisted : false,
        sort: isSortKey(filterSource.sort) ? filterSource.sort : "new",
      }),
      "session",
    );
    filtersSource = preferred;
  }

  const consumed = new Set<LegacySource>();
  if (jobsSource) consumed.add(jobsSource);
  if (filtersSource) consumed.add(filtersSource);

  for (const source of consumed) {
    if (!source.removable) continue;
    if (source !== jobsSource && hasJobsFields(source)) continue;
    await removeRaw(source.key, source.scope);
  }
}

export function readJobsState(): JobsState {
  return jobsStore.getSnapshot();
}

export function writeJobsState(state: JobsState): void {
  jobsStore.write(state);
}

export function onJobsChange(callback: () => void): () => void {
  return jobsStore.subscribe(callback);
}

export function readFilters(): Filters {
  return filtersStore.getSnapshot();
}

export function writeFilters(filters: Filters): void {
  filtersStore.write(filters);
}

export function onFiltersChange(callback: () => void): () => void {
  return filtersStore.subscribe(callback);
}
