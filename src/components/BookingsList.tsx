"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import {
  SERVICE_CANCEL_WINDOW_HOURS,
  SERVICE_STATUS_LABEL,
  serviceBookings,
  serviceCancelWindowEnds,
  serviceIsCancellable,
  type ServiceBooking,
} from "../lib/bookings";
import { useHydrated } from "../lib/hydration";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";
import { CategoryTile } from "./CategoryTile";

const EMPTY_TITLE = "No bookings yet.";
const EMPTY_ACTION = { label: "Browse services", href: "/services" };
const LOADING_TITLE = "Loading your bookings…";
const CANCEL_LABEL = "Cancel booking";
const RESCHEDULE_LABEL = "Reschedule";
const SAVE_LABEL = "Save new time";
const KEEP_LABEL = "Keep booking";
const CANCELLED_COPY = "Booking cancelled.";
const RESCHEDULED_COPY = "Booking rescheduled.";
const WINDOW_CLOSED_COPY = `Free cancellation ended ${SERVICE_CANCEL_WINDOW_HOURS} hours before the booking.`;
const RESCHEDULE_TITLE = "Pick a new date and time";
const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

const SERVER_BOOKINGS: ServiceBooking[] = [];

function subscribe(onStoreChange: () => void): () => void {
  return serviceBookings.subscribe(onStoreChange);
}

function getSnapshot(): ServiceBooking[] {
  return serviceBookings.getSnapshot();
}

function getServerSnapshot(): ServiceBooking[] {
  return SERVER_BOOKINGS;
}

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

function scheduleLabel(booking: ServiceBooking): string {
  if (booking.schedule === "on_demand" || !booking.date) return "As soon as possible";
  const parsed = new Date(`${booking.date}T00:00:00`);
  const label = Number.isNaN(parsed.getTime())
    ? booking.date
    : parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return `${label} at ${booking.time ?? ""}`;
}

export function BookingsList() {
  const hydrated = useHydrated();
  const bookings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const ordered = useMemo(() => [...bookings].reverse(), [bookings]);

  const startReschedule = useCallback((booking: ServiceBooking) => {
    setEditingId(booking.id);
    setDate(booking.date ?? "");
    setTime(booking.time ?? "09:00");
    setNotice(null);
  }, []);

  const saveReschedule = useCallback(
    (booking: ServiceBooking) => {
      if (!date || !time) {
        setNotice("Choose a date and a time for the booking.");
        return;
      }
      const stamp = new Date().toISOString();
      serviceBookings.write(
        serviceBookings.getSnapshot().map((item) =>
          item.id === booking.id
            ? { ...item, date, time, updatedAt: stamp, rescheduledAt: stamp }
            : item,
        ),
      );
      setEditingId(null);
      setNotice(RESCHEDULED_COPY);
    },
    [date, time],
  );

  const cancelBooking = useCallback((booking: ServiceBooking) => {
    if (!serviceIsCancellable(booking)) {
      setNotice(WINDOW_CLOSED_COPY);
      return;
    }
    const stamp = new Date().toISOString();
    serviceBookings.write(
      serviceBookings.getSnapshot().map((item) =>
        item.id === booking.id ? { ...item, status: "cancelled", updatedAt: stamp, cancelledAt: stamp } : item,
      ),
    );
    setNotice(CANCELLED_COPY);
  }, []);

  if (!hydrated) {
    return <EmptyState title={LOADING_TITLE} />;
  }

  if (bookings.length === 0) {
    return <EmptyState title={EMPTY_TITLE} action={EMPTY_ACTION} />;
  }

  return (
    <>
      {notice ? (
        <p role="status" className="mb-3 text-[13px] font-semibold text-brand">
          {notice}
        </p>
      ) : null}
      <ul className="space-y-2.5">
        {ordered.map((booking, index) => {
          const windowEnds = serviceCancelWindowEnds(booking);
          const cancellable = serviceIsCancellable(booking);
          const editing = editingId === booking.id;
          return (
            <li key={booking.id} className="hero-rise" style={rowDelay(index)}>
              <article className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card">
                <div className="flex items-start gap-3.5">
                  <CategoryTile category={booking.category} />
                  <div className="min-w-0 flex-1">
                    <span className="block w-fit rounded-full bg-brand-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      {SERVICE_STATUS_LABEL[booking.status]}
                    </span>
                    <h3 className="mt-1.5 truncate text-[15px] font-semibold">{booking.serviceName}</h3>
                    <p className="mt-0.5 truncate text-[13px] text-muted">{booking.provider}</p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">{scheduleLabel(booking)}</p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">{booking.address}</p>
                  </div>
                  <span className="shrink-0 text-[15px] font-semibold">{booking.priceLabel}</span>
                </div>

                {editing ? (
                  <div className="mt-3 rounded-[14px] border border-border bg-surface-alt p-3.5">
                    <p className="text-[13px] font-semibold text-foreground">{RESCHEDULE_TITLE}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[12px] font-semibold text-foreground">Date</span>
                        <input
                          type="date"
                          value={date}
                          aria-label="New booking date"
                          onChange={(event) => setDate(event.target.value)}
                          className="mt-1 h-11 w-full rounded-[16px] border border-border bg-surface px-3 text-[14px] outline-none focus:border-brand"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[12px] font-semibold text-foreground">Time</span>
                        <input
                          type="time"
                          value={time}
                          aria-label="New booking time"
                          onChange={(event) => setTime(event.target.value)}
                          className="mt-1 h-11 w-full rounded-[16px] border border-border bg-surface px-3 text-[14px] outline-none focus:border-brand"
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip active onClick={() => saveReschedule(booking)}>
                        {SAVE_LABEL}
                      </Chip>
                      <Chip onClick={() => setEditingId(null)}>{KEEP_LABEL}</Chip>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {booking.status !== "cancelled" && booking.status !== "completed" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startReschedule(booking)}
                          className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold transition-colors hover:border-brand/40"
                        >
                          {RESCHEDULE_LABEL}
                        </button>
                        {cancellable ? (
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking)}
                            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-brand/40"
                          >
                            {CANCEL_LABEL}
                          </button>
                        ) : (
                          <span className="text-[12px] text-muted">{WINDOW_CLOSED_COPY}</span>
                        )}
                      </>
                    ) : null}
                    {windowEnds ? (
                      <span className="text-[12px] text-muted">
                        {`Free cancellation until ${windowEnds.toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}`}
                      </span>
                    ) : null}
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
