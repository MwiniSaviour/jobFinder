"use client";

import { useSyncExternalStore } from "react";
import { isHydrated, onHydrated } from "./storage";

function subscribe(listener: () => void): () => void {
  return onHydrated(listener);
}

function getSnapshot(): boolean {
  return isHydrated();
}

function getServerSnapshot(): boolean {
  return false;
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
