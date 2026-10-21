"use client";

import { useSyncExternalStore } from "react";

function subscribeClock(onStoreChange: () => void) {
  const interval = window.setInterval(onStoreChange, 60_000);
  window.addEventListener("focus", onStoreChange);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener("focus", onStoreChange);
  };
}

function greetingFor(hour: number): string {
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const SERVER_HOUR = Number.NaN;

export function Greeting() {
  const hour = useSyncExternalStore(
    subscribeClock,
    () => new Date().getHours(),
    () => SERVER_HOUR,
  );
  const greeting = Number.isNaN(hour) ? "\u00a0" : greetingFor(hour);

  return <p className="text-[13px] font-semibold text-brand">{greeting}</p>;
}
