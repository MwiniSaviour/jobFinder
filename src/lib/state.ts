import { DEFAULT_FILTERS } from "./jobs";
import type { SortKey } from "./jobs";

export type Filters = {
  categories: string[];
  includeUnlisted: boolean;
  sort: SortKey;
};

export type JobsState = {
  recents: string[];
  appliedIds: number[];
  savedIds: number[];
  filters: Filters;
};

const STORAGE_KEY = "jf:jobs";
const CHANGE_EVENT = "jf:jobs-changed";

export function freshState(): JobsState {
  return {
    recents: [],
    appliedIds: [],
    savedIds: [],
    filters: {
      categories: [...DEFAULT_FILTERS.categories],
      includeUnlisted: DEFAULT_FILTERS.includeUnlisted,
      sort: DEFAULT_FILTERS.sort,
    },
  };
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item): item is string => typeof item === "string");

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item): item is number => typeof item === "number");

const isSortKey = (value: unknown): value is SortKey => value === "new" || value === "pay";

export function readJobsState(): JobsState {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return freshState();
    const source = parsed as Record<string, unknown>;
    const filterSource = (typeof source.filters === "object" && source.filters !== null
      ? source.filters
      : {}) as Record<string, unknown>;
    return {
      recents: isStringArray(source.recents) ? source.recents : [],
      appliedIds: isNumberArray(source.appliedIds) ? source.appliedIds : [],
      savedIds: isNumberArray(source.savedIds) ? source.savedIds : [],
      filters: {
        categories: isStringArray(filterSource.categories) ? filterSource.categories : [],
        includeUnlisted:
          typeof filterSource.includeUnlisted === "boolean" ? filterSource.includeUnlisted : false,
        sort: isSortKey(filterSource.sort) ? filterSource.sort : "new",
      },
    };
  } catch {
    return freshState();
  }
}

export function writeJobsState(state: JobsState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    if (typeof console !== "undefined") {
      console.warn("JobFinder: session storage unavailable, keeping in-memory state");
    }
  }
}

export function onJobsChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
