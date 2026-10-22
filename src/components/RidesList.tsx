"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import {
  RIDE_STATUS_LABEL,
  rideBookings,
  rideTotal,
  type RideBooking,
} from "../lib/bookings";
import { useHydrated } from "../lib/hydration";
import { EmptyState } from "./EmptyState";
import { CarIcon } from "./Icons";
import { SavedListRow } from "./SavedListRow";

const EMPTY_TITLE = "No rides yet.";
const EMPTY_ACTION = { label: "Reserve a ride — up to 90 days ahead", href: "/rides" };
const LOADING_TITLE = "Loading your rides…";
const RIDES_HREF = "/rides";
const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

const SERVER_BOOKINGS: RideBooking[] = [];

function subscribe(onStoreChange: () => void): () => void {
  return rideBookings.subscribe(onStoreChange);
}

function getSnapshot(): RideBooking[] {
  return rideBookings.getSnapshot();
}

function getServerSnapshot(): RideBooking[] {
  return SERVER_BOOKINGS;
}

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

function rideDate(booking: RideBooking): string {
  if (booking.reservedFor) return booking.reservedFor;
  return booking.dayLabel;
}

export function RidesList() {
  const router = useRouter();
  const hydrated = useHydrated();
  const bookings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!hydrated) {
    return <EmptyState title={LOADING_TITLE} />;
  }

  if (bookings.length === 0) {
    return <EmptyState title={EMPTY_TITLE} action={EMPTY_ACTION} />;
  }

  const ordered = [...bookings].reverse();

  return (
    <ul className="space-y-2.5">
      {ordered.map((booking, index) => (
        <li key={booking.id} className="hero-rise" style={rowDelay(index)}>
          <SavedListRow
            icon={<CarIcon className="size-6" />}
            primary={`${booking.pickup} → ${booking.dropoff}`}
            secondary={`${rideDate(booking)} · ${booking.time} · ${RIDE_STATUS_LABEL[booking.status]}`}
            badge={`$${rideTotal(booking)}`}
            onClick={() => router.push(RIDES_HREF)}
          />
        </li>
      ))}
    </ul>
  );
}
