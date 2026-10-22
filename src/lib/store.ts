import {
  getRaw,
  onStorageKeyChange,
  registerKey,
  writeRaw,
  type StorageScope,
} from "./storage";

export type CollectionStore<T> = {
  read: () => T;
  write: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
};

export function createCollectionStore<T>(
  key: string,
  parse: (raw: string | null) => T,
  scope: StorageScope = "persistent",
): CollectionStore<T> {
  registerKey(key, scope);

  const serverSnapshot = parse(null);
  let rawCache: string | null | undefined = undefined;
  let valueCache: T = serverSnapshot;

  const getSnapshot = (): T => {
    if (typeof window === "undefined") return serverSnapshot;
    const raw = getRaw(key, scope);
    if (rawCache === raw) return valueCache;
    const next = parse(raw);
    rawCache = raw;
    valueCache = next;
    return next;
  };

  const write = (next: T): void => {
    writeRaw(key, JSON.stringify(next), scope);
    getSnapshot();
  };

  const subscribe = (listener: () => void): () => void =>
    onStorageKeyChange(key, listener);

  return {
    read: getSnapshot,
    write,
    subscribe,
    getSnapshot,
    getServerSnapshot: () => serverSnapshot,
  };
}
