"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ApplicationsList } from "./ApplicationsList";
import { BookingsList } from "./BookingsList";
import { RidesList } from "./RidesList";
import { SectionHeader } from "./SectionHeader";
import { rideBookings, serviceBookings } from "../lib/bookings";
import { useHydrated } from "../lib/hydration";
import { jobsStore } from "../lib/state";

const APPLICATIONS_TITLE = "Applications";
const BOOKINGS_TITLE = "Bookings";
const RIDES_TITLE = "Rides";
const EMPTY_TITLE = "Nothing in progress yet";
const EMPTY_DESCRIPTION =
  "Browse jobs or services to get started; your activity shows up here.";
const EMPTY_PRIMARY_LABEL = "Browse jobs";
const EMPTY_PRIMARY_HREF = "/jobs";
const EMPTY_SECONDARY_LABEL = "Browse services";
const EMPTY_SECONDARY_HREF = "/services";
const SECTION_STAGGER_MS = 80;

function sectionDelay(offset: number): CSSProperties {
  return {
    "--hero-delay": `${offset * SECTION_STAGGER_MS}ms`,
  } as CSSProperties;
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ActivityClient() {
  const hydrated = useHydrated();
  const jobs = useSyncExternalStore(
    jobsStore.subscribe,
    jobsStore.getSnapshot,
    jobsStore.getServerSnapshot,
  );
  const services = useSyncExternalStore(
    serviceBookings.subscribe,
    serviceBookings.getSnapshot,
    serviceBookings.getServerSnapshot,
  );
  const rides = useSyncExternalStore(
    rideBookings.subscribe,
    rideBookings.getSnapshot,
    rideBookings.getServerSnapshot,
  );

  const applicationCount = jobs.applications.length;
  const bookingCount = services.length;
  const rideCount = rides.length;
  const activeRideCount = rides.filter(
    (ride) =>
      ride.status !== "completed" && ride.status !== "cancelled" && ride.status !== "canceled",
  ).length;

  const segments: string[] = [];
  if (applicationCount > 0) {
    segments.push(countLabel(applicationCount, "application", "applications"));
  }
  if (bookingCount > 0) {
    segments.push(countLabel(bookingCount, "booking", "bookings"));
  }
  if (rideCount > 0) {
    segments.push(
      activeRideCount > 0
        ? countLabel(activeRideCount, "ride in progress", "rides in progress")
        : countLabel(rideCount, "ride", "rides"),
    );
  }

  const hasAnyActivity = applicationCount > 0 || bookingCount > 0 || rideCount > 0;

  return (
    <div className="space-y-8">
      {hydrated && segments.length > 0 ? (
        <p
          className="hero-rise w-fit rounded-full bg-brand-soft px-3.5 py-2 text-[13px] font-semibold text-brand"
          style={sectionDelay(1)}
        >
          {segments.join(" · ")}
        </p>
      ) : null}
      {hydrated && !hasAnyActivity ? (
        <div
          className="hero-rise rounded-[16px] border border-border bg-surface p-6 text-center shadow-card"
          style={sectionDelay(1)}
        >
          <p className="text-sm font-semibold">{EMPTY_TITLE}</p>
          <p className="mt-1 text-[13px] text-muted">{EMPTY_DESCRIPTION}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              href={EMPTY_PRIMARY_HREF}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {EMPTY_PRIMARY_LABEL}
            </Link>
            <Link
              href={EMPTY_SECONDARY_HREF}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/40"
            >
              {EMPTY_SECONDARY_LABEL}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="hero-rise" style={sectionDelay(2)}>
            <SectionHeader title={APPLICATIONS_TITLE} />
            <ApplicationsList />
          </section>
          <section className="hero-rise" style={sectionDelay(3)}>
            <SectionHeader title={BOOKINGS_TITLE} />
            <BookingsList />
          </section>
          <section className="hero-rise" style={sectionDelay(4)}>
            <SectionHeader title={RIDES_TITLE} />
            <RidesList />
          </section>
        </>
      )}
    </div>
  );
}
