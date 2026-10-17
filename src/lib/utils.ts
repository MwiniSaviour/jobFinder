import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Fixed reference date keeps server-rendered relative dates stable and deterministic. */
export const TODAY = new Date("2026-10-17T09:00:00Z");

export function daysSince(iso: string) {
  const then = new Date(`${iso}T09:00:00Z`).getTime();
  return Math.max(0, Math.round((TODAY.getTime() - then) / 86_400_000));
}

export function relativeDate(iso: string) {
  const days = daysSince(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return formatDate(iso, { month: "short", day: "numeric" });
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}

export function formatSalary(
  min: number,
  max: number,
  currency = "USD",
  period = "year",
) {
  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: value >= 1000 ? "compact" : "standard",
    }).format(value);

  const unit =
    period === "year" ? "" : `/${period === "month" ? "mo" : period}`;
  return `${fmt(min)} – ${fmt(max)}${unit}`;
}

export function salaryShort(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(TODAY);
}
