import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export type StorageScope = "persistent" | "session";

type StorageListener = () => void;
type Migration = () => Promise<void> | void;

const PERSISTENT_CACHE = new Map<string, string | null>();
const SESSION_CACHE = new Map<string, string | null>();
const LISTENERS = new Map<string, Set<StorageListener>>();
const REGISTERED: { key: string; scope: StorageScope }[] = [];
const REGISTERED_IDS = new Set<string>();
const PENDING_WRITES = new Set<string>();
const MIGRATIONS: Migration[] = [];
const HYDRATION_LISTENERS = new Set<() => void>();

let hydrated = false;
let nativeWarningShown = false;

function cacheFor(scope: StorageScope): Map<string, string | null> {
  return scope === "persistent" ? PERSISTENT_CACHE : SESSION_CACHE;
}

function emitChange(key: string): void {
  const listeners = LISTENERS.get(key);
  if (!listeners) return;
  for (const listener of [...listeners]) {
    listener();
  }
}

function emitHydration(): void {
  for (const listener of [...HYDRATION_LISTENERS]) {
    listener();
  }
}

export function nativePreferencesEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Preferences");
  } catch {
    return false;
  }
}

function localStore(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function sessionStore(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readLocalRaw(key: string): string | null {
  const store = localStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function readSessionRaw(key: string): string | null {
  const store = sessionStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalRaw(key: string, value: string): void {
  const store = localStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch (error) {
    console.warn(`JobFinder: unable to persist "${key}"`, error);
  }
}

function writeSessionRaw(key: string, value: string): void {
  const store = sessionStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch (error) {
    console.warn(`JobFinder: unable to keep "${key}" for this session`, error);
  }
}

async function readPersistentRaw(key: string): Promise<string | null> {
  if (nativePreferencesEnabled()) {
    try {
      const { value } = await Preferences.get({ key });
      return value ?? null;
    } catch (error) {
      console.warn(`JobFinder: unable to read "${key}" from native storage`, error);
      return readLocalRaw(key);
    }
  }
  return readLocalRaw(key);
}

async function writePersistentRaw(key: string, value: string): Promise<void> {
  if (nativePreferencesEnabled()) {
    try {
      await Preferences.set({ key, value });
      return;
    } catch (error) {
      console.warn(`JobFinder: unable to write "${key}" to native storage`, error);
    }
  }
  writeLocalRaw(key, value);
}

export function registerKey(key: string, scope: StorageScope = "persistent"): void {
  const id = `${scope}:${key}`;
  if (REGISTERED_IDS.has(id)) return;
  REGISTERED_IDS.add(id);
  REGISTERED.push({ key, scope });
  const cache = cacheFor(scope);
  if (!cache.has(key)) {
    cache.set(key, null);
  }
  if (hydrated) {
    void refreshKey(key, scope);
  }
}

async function refreshKey(key: string, scope: StorageScope): Promise<void> {
  const raw = scope === "persistent" ? await readPersistentRaw(key) : readSessionRaw(key);
  const cache = cacheFor(scope);
  if (cache.get(key) === raw) return;
  cache.set(key, raw);
  emitChange(key);
}

export function getRaw(key: string, scope: StorageScope = "persistent"): string | null {
  return cacheFor(scope).get(key) ?? null;
}

export function writeRaw(key: string, value: string, scope: StorageScope = "persistent"): void {
  if (typeof window === "undefined") return;
  const cache = cacheFor(scope);
  if (cache.get(key) === value) return;
  cache.set(key, value);
  if (!hydrated) {
    PENDING_WRITES.add(`${scope}:${key}`);
  }
  emitChange(key);
  if (scope === "persistent") {
    void writePersistentRaw(key, value);
  } else {
    writeSessionRaw(key, value);
  }
}

export async function removeRaw(key: string, scope: StorageScope = "persistent"): Promise<void> {
  if (typeof window === "undefined") return;
  if (scope === "persistent" && nativePreferencesEnabled()) {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.warn(`JobFinder: unable to remove "${key}" from native storage`, error);
    }
  }
  const store = scope === "persistent" ? localStore() : sessionStore();
  try {
    store?.removeItem(key);
  } catch (error) {
    console.warn(`JobFinder: unable to remove "${key}"`, error);
  }
  cacheFor(scope).set(key, null);
  emitChange(key);
}

export function onStorageKeyChange(key: string, listener: StorageListener): () => void {
  if (typeof window === "undefined") return () => undefined;
  let listeners = LISTENERS.get(key);
  if (!listeners) {
    listeners = new Set();
    LISTENERS.set(key, listeners);
  }
  listeners.add(listener);
  return () => {
    const current = LISTENERS.get(key);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      LISTENERS.delete(key);
    }
  };
}

export function registerMigration(migration: Migration): void {
  MIGRATIONS.push(migration);
}

export function isHydrated(): boolean {
  return hydrated;
}

export function onHydrated(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  HYDRATION_LISTENERS.add(listener);
  return () => {
    HYDRATION_LISTENERS.delete(listener);
  };
}

export async function hydrateStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  if (hydrated) return;
  if (Capacitor.isNativePlatform() && !nativePreferencesEnabled() && !nativeWarningShown) {
    nativeWarningShown = true;
    console.warn(
      "JobFinder: native storage plugin unavailable, falling back to WebView localStorage. Run `npx cap sync android` to register @capacitor/preferences.",
    );
  }
  for (const migration of MIGRATIONS) {
    try {
      await migration();
    } catch (error) {
      console.warn("JobFinder: storage migration failed", error);
    }
  }
  for (const entry of REGISTERED) {
    const id = `${entry.scope}:${entry.key}`;
    if (PENDING_WRITES.has(id)) {
      PENDING_WRITES.delete(id);
      continue;
    }
    await refreshKey(entry.key, entry.scope);
  }
  hydrated = true;
  emitHydration();
}
