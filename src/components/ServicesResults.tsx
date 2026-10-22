"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { Chip } from "./Chip";
import { ChipRow } from "./FilterChips";
import { CategoryTile } from "./CategoryTile";
import { ServiceBookingFlow } from "./ServiceBookingFlow";
import { CheckIcon, ClockIcon, StarIcon } from "./Icons";
import { SavedListRow } from "./SavedListRow";
import { SearchBar } from "./SearchBar";
import { SERVICE_CATEGORIES } from "../lib/categories";
import type { ServiceListing } from "../lib/services";
import { serviceBookings, serviceRecents } from "../lib/bookings";

export type { ServiceListing };

let serviceCategory = "";
const serviceCategoryListeners = new Set<() => void>();

function readUrlCategory(): string {
  return typeof window === "undefined"
    ? ""
    : (new URLSearchParams(window.location.search).get("category")?.trim() ?? "");
}

function getServiceCategorySnapshot(): string {
  return serviceCategory;
}

function getServiceCategoryServerSnapshot(): string {
  return "";
}

function subscribeToServiceCategory(listener: () => void): () => void {
  serviceCategoryListeners.add(listener);
  const seeded = readUrlCategory();
  if (seeded !== serviceCategory) {
    serviceCategory = seeded;
    listener();
  }
  return () => {
    serviceCategoryListeners.delete(listener);
  };
}

function setServiceCategory(next: string): void {
  if (next === serviceCategory) {
    return;
  }
  serviceCategory = next;
  serviceCategoryListeners.forEach((cb) => cb());
}

const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

const PAGE_TITLE = "Book a service";
const PAGE_SUB =
  "Trusted local pros for home, tech, and everyday tasks — with rates and time estimates shown up front.";
const ALL_SERVICES_LABEL = "All services";
const SEARCH_PLACEHOLDER = "What service do you need?";
const SEARCH_LABEL = "Search services";
const EMPTY_TITLE = "No service providers found.";
const BOOK_LABEL = "Book";
const BOOKED_LABEL = "Booked";
const VERIFIED_TITLE = "What was verified";
const VERIFIED_EMPTY = "This provider has no verification on file yet.";
const TRUST_LABEL = "Background-checked";
const BOOKING_CONFIRMED = "Booking confirmed.";
const RECENT_SEARCHES_TITLE = "Recent searches";
const DETAILS_TITLE = "Provider details";

export function ServicesResults({ services }: { services: ServiceListing[] }) {
  const urlCategory = useSyncExternalStore(
    subscribeToServiceCategory,
    getServiceCategorySnapshot,
    getServiceCategoryServerSnapshot,
  );
  const bookings = useSyncExternalStore(
    serviceBookings.subscribe,
    serviceBookings.getSnapshot,
    serviceBookings.getServerSnapshot,
  );
  const recents = useSyncExternalStore(
    serviceRecents.subscribe,
    serviceRecents.getSnapshot,
    serviceRecents.getServerSnapshot,
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [verifiedId, setVerifiedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const runSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    serviceRecents.write(
      [trimmed, ...serviceRecents.getSnapshot().filter((item) => item !== trimmed)].slice(0, 20),
    );
  }, []);

  const shown = useMemo(
    () =>
      urlCategory === ""
        ? services
        : services.filter((service) => service.category === urlCategory),
    [services, urlCategory],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return shown;
    return shown.filter((service) =>
      `${service.name} ${service.category} ${service.provider}`.toLowerCase().includes(needle),
    );
  }, [query, shown]);

  const bookedServiceIds = useMemo(
    () =>
      new Set(
        bookings
          .filter((booking) => booking.status !== "cancelled")
          .map((booking) => booking.serviceId),
      ),
    [bookings],
  );

  const selected = useMemo(
    () => services.find((service) => service.id === selectedId) ?? null,
    [selectedId, services],
  );

  const handleBooked = useCallback(() => {
    setToast(BOOKING_CONFIRMED);
    window.setTimeout(() => setToast(null), 2200);
    setSelectedId(null);
  }, []);

  if (selected) {
    return (
      <>
        <main className="mx-auto max-w-lg px-5 pb-24 pt-6">
          <ServiceBookingFlow
            service={selected}
            onClose={() => setSelectedId(null)}
            onBooked={handleBooked}
          />
        </main>
        {toast ? (
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-4 bottom-24 z-[80] mx-auto max-w-md rounded-full bg-brand-strong px-5 py-3 text-center text-sm font-semibold text-white shadow-raised"
          >
            {toast}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-lg px-5 pb-24 pt-6">
        <div className="hero-rise">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {PAGE_TITLE}
          </h1>
          <p className="mt-2 text-[15px] text-muted">{PAGE_SUB}</p>
          <div className="mt-4">
            <SearchBar
              onSearch={runSearch}
              initialValue={query}
              placeholder={SEARCH_PLACEHOLDER}
              ariaLabel={SEARCH_LABEL}
            />
          </div>
          <ChipRow label="Service categories" className="mt-4">
            <Chip active={urlCategory === ""} onClick={() => setServiceCategory("")}>
              {ALL_SERVICES_LABEL}
            </Chip>
            {SERVICE_CATEGORIES.map((category) => (
              <Chip
                key={category.name}
                active={urlCategory === category.name}
                onClick={() => setServiceCategory(category.name)}
              >
                {category.name}
              </Chip>
            ))}
          </ChipRow>
        </div>

        {filtered.length === 0 ? (
          <div className="hero-rise mt-5 flex flex-col items-center gap-3 rounded-[16px] border border-border bg-surface p-6 text-center">
            <p className="text-[15px] font-semibold">{EMPTY_TITLE}</p>
            <Chip
              onClick={() => {
                setQuery("");
                setServiceCategory("");
              }}
            >
              {ALL_SERVICES_LABEL}
            </Chip>
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {filtered.map((service, index) => {
              const booked = bookedServiceIds.has(service.id);
              const verified = verifiedId === service.id;
              return (
                <li key={service.id} className="hero-rise" style={rowDelay(index)}>
                  <article className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover">
                    <div className="flex items-start gap-3.5">
                      <CategoryTile category={service.category} />
                      <div className="min-w-0 flex-1">
                        <span className="block w-fit rounded-full bg-brand-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                          {service.category}
                        </span>
                        <h2 className="mt-1.5 truncate text-[15px] font-semibold">{service.name}</h2>
                        <p className="mt-0.5 truncate text-[13px] text-muted">{service.provider}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted">
                          <StarIcon className="size-3.5 text-accent" />
                          {`${service.rating.toFixed(1)} (${service.reviews}) · ${service.duration}`}
                        </p>
                      </div>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="text-[15px] font-semibold">{service.priceLabel}</span>
                        {booked ? (
                          <span className="rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white">
                            {BOOKED_LABEL}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedId(service.id)}
                            className="rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-strong"
                          >
                            {BOOK_LABEL}
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        aria-expanded={verified}
                        onClick={() => setVerifiedId(verified ? null : service.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand"
                      >
                        <CheckIcon className="size-3" />
                        {TRUST_LABEL}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedId(service.id)}
                        className="ml-auto text-[12px] font-semibold text-muted transition-colors hover:text-brand"
                      >
                        {DETAILS_TITLE}
                      </button>
                    </div>
                    {verified ? (
                      <div
                        role="region"
                        aria-label={`${VERIFIED_TITLE} for ${service.provider}`}
                        className="mt-2.5 rounded-[14px] border border-border bg-surface-alt px-3.5 py-3"
                      >
                        <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                          {VERIFIED_TITLE}
                        </p>
                        {service.verified.length === 0 ? (
                          <p className="mt-1 text-[13px] text-muted">{VERIFIED_EMPTY}</p>
                        ) : (
                          <ul className="mt-1.5 space-y-1">
                            {service.verified.map((item) => (
                              <li key={item} className="text-[13px] text-foreground">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {recents.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.01em] text-foreground">
              {RECENT_SEARCHES_TITLE}
            </h2>
            <ul className="space-y-2.5">
              {recents.map((item, index) => (
                <li key={item} className="hero-rise" style={rowDelay(index)}>
                  <SavedListRow
                    icon={<ClockIcon className="size-6" />}
                    primary={item}
                    secondary="Run this search again"
                    onClick={() => runSearch(item)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-[80] mx-auto max-w-md rounded-full bg-brand-strong px-5 py-3 text-center text-sm font-semibold text-white shadow-raised"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
