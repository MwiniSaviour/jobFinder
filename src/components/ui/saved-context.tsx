"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "morrow.saved";

const DEFAULT_SAVED = [
  "terra/product-manager",
  "onward/learning-experience-designer",
  "northwind/customer-success-lead",
];

/**
 * Small external store so the saved list stays consistent across every
 * bookmark button, survives reloads, syncs between tabs, and hydrates without
 * a server/client mismatch (the server snapshot is always empty).
 */
const listeners = new Set<() => void>();

let snapshot: string[] | null = null;

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed))
      return parsed.filter((key): key is string => typeof key === "string");
    return DEFAULT_SAVED;
  } catch {
    return DEFAULT_SAVED;
  }
}

function getSnapshot(): string[] {
  snapshot ??= readStorage();
  return snapshot;
}

const EMPTY: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function writeSnapshot(next: string[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable (private mode, quota) */
  }
  listeners.forEach((listener) => listener());
}

type SavedContextValue = {
  saved: Set<string>;
  isSaved: (key: string) => boolean;
  toggle: (key: string) => boolean;
  count: number;
};

const SavedContext = createContext<SavedContextValue | null>(null);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = null;
    listeners.forEach((listener) => listener());
  });
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const keys = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((key: string) => {
    const current = getSnapshot();
    const nowSaved = !current.includes(key);
    writeSnapshot(
      nowSaved ? [...current, key] : current.filter((entry) => entry !== key),
    );
    return nowSaved;
  }, []);

  const value = useMemo(() => {
    const saved = new Set(keys);
    return {
      saved,
      isSaved: (key: string) => saved.has(key),
      toggle,
      count: keys.length,
    };
  }, [keys, toggle]);

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used inside SavedProvider");
  }
  return context;
}
