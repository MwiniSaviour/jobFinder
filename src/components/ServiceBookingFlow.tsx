"use client";

import { useCallback, useMemo, useState } from "react";
import type { ServiceListing } from "../lib/services";
import {
  SERVICE_CANCEL_WINDOW_HOURS,
  serviceBookings,
  type ServiceBooking,
  type ServiceSchedule,
} from "../lib/bookings";
import { Chip } from "./Chip";
import { NoteField } from "./NoteField";
import { PromiseStrip } from "./PromiseStrip";
import { StarIcon } from "./Icons";

const STEP_DETAILS = "details";
const STEP_CONFIRM = "confirm";

const DETAILS_TITLE = "A few quick details";
const CONFIRM_TITLE = "Confirm your booking";
const SCHEDULE_LABEL = "When";
const ON_DEMAND_LABEL = "As soon as possible";
const SCHEDULED_LABEL = "Pick a date and time";
const ADDRESS_LABEL = "Address";
const ADDRESS_PLACEHOLDER = "Street, city, and any entry details";
const NOTE_LABEL = "Anything the provider should know?";
const NOTE_PLACEHOLDER = "Parking, pets, or what needs doing";
const CANCELLATION_COPY = `Free cancellation until ${SERVICE_CANCEL_WINDOW_HOURS} hours before the booking.`;
const CONFIRM_ACTION = "Confirm booking";
const CONTINUE_ACTION = "Continue";
const ADDRESS_ERROR = "Enter the address where the service happens.";
const SCHEDULE_ERROR = "Choose a date and a time for the booking.";
const PRICE_LABEL = "Price";
const PROVIDER_LABEL = "Provider";
const RATED_LABEL = "Rating";
const WHEN_LABEL = "When";
const SUMMARY_TITLE = "Summary";

type Step = typeof STEP_DETAILS | typeof STEP_CONFIRM;

type ServiceBookingFlowProps = {
  service: ServiceListing;
  onClose: () => void;
  onBooked: () => void;
};

function todayInput(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSchedule(booking: {
  schedule: ServiceSchedule;
  date: string | null;
  time: string | null;
}): string {
  if (booking.schedule === "on_demand" || !booking.date) return ON_DEMAND_LABEL;
  const parsed = new Date(`${booking.date}T00:00:00`);
  const label = Number.isNaN(parsed.getTime())
    ? booking.date
    : parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  return `${label} at ${booking.time ?? ""}`;
}

export function ServiceBookingFlow({ service, onClose, onBooked }: ServiceBookingFlowProps) {
  const [step, setStep] = useState<Step>(STEP_DETAILS);
  const [schedule, setSchedule] = useState<ServiceSchedule>("on_demand");
  const [date, setDate] = useState(todayInput());
  const [time, setTime] = useState("09:00");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const minDate = useMemo(() => todayInput(), []);

  const continueToConfirm = useCallback(() => {
    if (!address.trim()) {
      setError(ADDRESS_ERROR);
      return;
    }
    if (schedule === "scheduled" && (!date || !time)) {
      setError(SCHEDULE_ERROR);
      return;
    }
    setError(null);
    setStep(STEP_CONFIRM);
  }, [address, date, schedule, time]);

  const confirmBooking = useCallback(() => {
    if (!address.trim()) {
      setError(ADDRESS_ERROR);
      return;
    }
    const stamp = new Date().toISOString();
    const booking: ServiceBooking = {
      id: `sb_${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      provider: service.provider,
      providerRating: service.rating,
      providerReviews: service.reviews,
      schedule,
      address: address.trim(),
      date: schedule === "scheduled" ? date : null,
      time: schedule === "scheduled" ? time : null,
      note: note.trim(),
      price: service.price,
      priceLabel: service.priceLabel,
      status: "confirmed",
      createdAt: stamp,
      updatedAt: stamp,
      cancelledAt: null,
      rescheduledAt: null,
    };
    serviceBookings.write([...serviceBookings.getSnapshot(), booking]);
    onBooked();
  }, [address, date, note, onBooked, schedule, service, time]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">
          {service.category}
        </p>
        <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {step === STEP_DETAILS ? DETAILS_TITLE : CONFIRM_TITLE}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {`${service.name} · ${service.provider}`}
        </p>
      </header>

      <div className="rounded-[16px] border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold">{service.priceLabel}</span>
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <StarIcon className="size-3.5 text-accent" />
            {`${service.rating.toFixed(1)} (${service.reviews})`}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-muted">{`${service.duration} · ${service.location}`}</p>
      </div>

      {step === STEP_DETAILS ? (
        <>
          <div>
            <span className="text-[13px] font-semibold text-foreground">{SCHEDULE_LABEL}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip
                active={schedule === "on_demand"}
                onClick={() => {
                  setSchedule("on_demand");
                  setError(null);
                }}
              >
                {ON_DEMAND_LABEL}
              </Chip>
              <Chip
                active={schedule === "scheduled"}
                onClick={() => {
                  setSchedule("scheduled");
                  setError(null);
                }}
              >
                {SCHEDULED_LABEL}
              </Chip>
            </div>
            {schedule === "scheduled" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[13px] font-semibold text-foreground">Date</span>
                  <input
                    type="date"
                    value={date}
                    min={minDate}
                    aria-label="Booking date"
                    onChange={(event) => {
                      setDate(event.target.value);
                      setError(null);
                    }}
                    className="mt-1.5 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] outline-none transition-colors focus:border-brand"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-semibold text-foreground">Time</span>
                  <input
                    type="time"
                    value={time}
                    aria-label="Booking time"
                    onChange={(event) => {
                      setTime(event.target.value);
                      setError(null);
                    }}
                    className="mt-1.5 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] outline-none transition-colors focus:border-brand"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <label className="block">
            <span className="text-[13px] font-semibold text-foreground">{ADDRESS_LABEL}</span>
            <input
              type="text"
              value={address}
              placeholder={ADDRESS_PLACEHOLDER}
              aria-label={ADDRESS_LABEL}
              onChange={(event) => {
                setAddress(event.target.value);
                setError(null);
              }}
              className="mt-1.5 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-brand"
            />
          </label>

          <NoteField
            label={NOTE_LABEL}
            value={note}
            onChange={setNote}
            maxLength={150}
            placeholder={NOTE_PLACEHOLDER}
          />
        </>
      ) : (
        <div className="rounded-[16px] border border-border bg-surface p-4 shadow-card">
          <p className="text-[15px] font-semibold">{SUMMARY_TITLE}</p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted">{PROVIDER_LABEL}</dt>
              <dd className="text-right font-semibold">{service.provider}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted">{RATED_LABEL}</dt>
              <dd className="text-right font-semibold">{`${service.rating.toFixed(1)} (${service.reviews})`}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted">{WHEN_LABEL}</dt>
              <dd className="text-right font-semibold">
                {formatSchedule({ schedule, date, time })}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted">{ADDRESS_LABEL}</dt>
              <dd className="text-right font-semibold">{address.trim()}</dd>
            </div>
            {note.trim() ? (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Note</dt>
                <dd className="text-right font-semibold">{note.trim()}</dd>
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3 border-t border-border pt-2">
              <dt className="text-muted">{PRICE_LABEL}</dt>
              <dd className="text-right text-[15px] font-semibold">{service.priceLabel}</dd>
            </div>
          </dl>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-[13px] font-semibold text-brand">
          {error}
        </p>
      ) : null}

      <PromiseStrip items={[CANCELLATION_COPY]} />

      <div className="sticky bottom-20 z-30 mt-2 space-y-2.5">
        {step === STEP_CONFIRM ? (
          <button
            type="button"
            onClick={confirmBooking}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            {CONFIRM_ACTION}
          </button>
        ) : (
          <button
            type="button"
            onClick={continueToConfirm}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            {CONTINUE_ACTION}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-brand/40"
        >
          {step === STEP_CONFIRM ? "Back to details" : "Back to services"}
        </button>
      </div>
    </div>
  );
}
