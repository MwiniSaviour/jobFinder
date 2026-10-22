"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";
import { NoteField } from "./NoteField";
import { PromiseStrip } from "./PromiseStrip";
import { SavedListRow } from "./SavedListRow";
import { SearchBar } from "./SearchBar";
import { SectionHeader } from "./SectionHeader";
import {
  CarIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  MessageIcon,
  PencilIcon,
  PhoneIcon,
  ShareIcon,
  StarIcon,
} from "./Icons";
import {
  RIDE_CANCEL_WINDOW_MINUTES,
  RIDE_FREE_WAIT_MINUTES,
  isRideCancellable,
  rideBookings,
  rideCancelFee,
  rideRecents,
  rideTipAmount,
  rideTotal,
  rideWaitFee,
  type RideBooking,
} from "../lib/bookings";
import {
  DAY_LABEL,
  KNOWN_PLACES,
  RIDE_CLASSES,
  RIDE_DAYS,
  RIDE_ROUTES,
  alternativeClass,
  classOptions,
  findRoute,
  formatRideDate,
  isKnownPlace,
  maxSeatsFor,
  normalizePlace,
  quoteOptions,
  reserveDateBounds,
  rideDayForDate,
  vehicleFor,
  type RideClass,
  type RideDay,
} from "../lib/rides";

type Step = "search" | "choose" | "status";

const PAGE_TITLE = "Book a ride";
const PAGE_SUB =
  "Scheduled rides with local drivers across the metro. Prices and open seats are posted with each route.";
const PLACE_ERROR = "We couldn't find that place.";
const SAME_PLACE_ERROR = "Choose a drop-off different from your pickup.";
const FARE_NOTE = "Fare shown upfront — tolls and surcharges may apply.";
const SEAT_OPTIONS = [1, 2, 3];
const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;
const MATCHING_DELAY_MS = 1600;
const ARRIVAL_DELAY_MS = 20000;
const MATCHING_SUBTITLE = "Usually under a minute.";
const DRIVER_ASSIGNED_SUBTITLE = "Arriving in";
const ARRIVED_TITLE = "Your driver has arrived.";
const ARRIVED_SUBTITLE = `Free wait time: ${RIDE_FREE_WAIT_MINUTES} min.`;
const WAIT_OVER_SUBTITLE = "Free wait time is over. Waiting time is now charged per minute.";
const IN_TRIP_TITLE = "On the way.";
const FINAL_AMOUNT_NOTE = "Final amount set at drop-off.";
const CANCEL_COPY = "Free cancellation until your driver accepts.";
const CANCEL_COPY_ASSIGNED = `Free cancellation until ${RIDE_CANCEL_WINDOW_MINUTES} minutes after your driver accepts.`;
const CANCEL_FEE_COPY = "Cancelling now charges a cancellation fee.";
const CONTACT_COPY =
  "Calling and messaging your driver are available once the live ride service is connected.";
const SHARE_RIDE_COPY = "Ride link copied.";
const TIP_TITLE = "Rate your trip";
const TIP_SUBTITLE = "Tips stay editable for 30 days after the trip.";
const RATING_REQUIRED_COPY = "Pick a rating to finish.";
const TIP_CHIPS = [0, 10, 15, 20];
const RATING_VALUES = [1, 2, 3, 4, 5];
const RESERVE_LABEL = "Reserve a specific date";
const RESERVE_HINT = "Up to 90 days ahead.";
const PAST_RIDES_LABEL = "Past rides";
const NO_PAST_RIDES = "No rides yet.";
const NO_PAST_RIDES_ACTION = "Reserve a ride";
const NO_ACTIVE_RIDE_TITLE = "No active ride";
const NO_ACTIVE_RIDE_SUB = "Start a new ride and its status appears here.";
const BOOK_ANOTHER_RIDE = "Book another ride";
const BOOK_A_RIDE = "Book a ride";
const START_RIDE = "Start ride";
const END_RIDE = "End ride";
const CANCEL_RIDE = "Cancel ride";
const SUBMIT_RATING = "Submit";
const CHANGE_DESTINATION = "Add or change destination";
const DESTINATION_SAVED = "Destination updated. Fare re-quoted.";
const SHARE_RIDE_TITLE = "Share ride";
const CALL_DRIVER = "Call driver";
const MESSAGE_DRIVER = "Message driver";
const OPEN_STATUS_LABELS = ["matching", "assigned", "arrived", "in_trip"] as const;

let toastTimer: number | null = null;

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

function seatsLabel(count: number): string {
  return `${count} seat${count === 1 ? "" : "s"}`;
}

function tripDateLabel(booking: RideBooking): string {
  if (booking.reservedFor) return formatRideDate(booking.reservedFor);
  if (booking.dayLabel) return booking.dayLabel;
  return DAY_LABEL[booking.day];
}

function statusLabel(booking: RideBooking): string {
  if (booking.status === "matching") return "Finding your driver…";
  if (booking.status === "assigned") return `Arriving in ${booking.etaMinutes} min`;
  if (booking.status === "arrived") return ARRIVED_TITLE;
  if (booking.status === "in_trip") return `To ${booking.dropoff}`;
  if (booking.status === "completed") return "Trip completed";
  return "Cancelled";
}

function tipLabel(percent: number): string {
  if (percent === 0) return "None";
  return `${percent}%`;
}

export function RidesClient() {
  const bookings = useSyncExternalStore(
    rideBookings.subscribe,
    rideBookings.getSnapshot,
    rideBookings.getServerSnapshot,
  );
  const recents = useSyncExternalStore(
    rideRecents.subscribe,
    rideRecents.getSnapshot,
    rideRecents.getServerSnapshot,
  );

  const [step, setStep] = useState<Step>("search");
  const [pickup, setPickup] = useState("Riverside");
  const [dropoff, setDropoff] = useState("");
  const [day, setDay] = useState<RideDay>("Weekday");
  const [reservedDate, setReservedDate] = useState<string | null>(null);
  const [seats, setSeats] = useState(1);
  const [rideClass, setRideClass] = useState<RideClass>("Economy");
  const [note, setNote] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [tipPercent, setTipPercent] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const showToast = useCallback((message: string) => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
    }
    setToast(message);
    toastTimer = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const bounds = useMemo(() => reserveDateBounds(), []);

  const activeBooking = useMemo(() => {
    if (activeBookingId) {
      const found = bookings.find((booking) => booking.id === activeBookingId);
      if (found) return found;
    }
    const open = bookings.filter((booking) =>
      (OPEN_STATUS_LABELS as readonly string[]).includes(booking.status),
    );
    return open.length > 0 ? open[open.length - 1] : null;
  }, [activeBookingId, bookings]);

  const pastBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "completed" || booking.status === "cancelled")
        .slice()
        .reverse(),
    [bookings],
  );

  const effectiveDay: RideDay = useMemo(() => {
    if (!reservedDate) return day;
    const parsed = new Date(`${reservedDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return day;
    return rideDayForDate(parsed);
  }, [day, reservedDate]);

  const route = useMemo(
    () => findRoute(pickup, dropoff, effectiveDay),
    [dropoff, effectiveDay, pickup],
  );
  const quotes = useMemo(
    () => (route ? quoteOptions(route, rideClass, seats) : []),
    [rideClass, route, seats],
  );
  const driverCount = route ? classOptions(route, rideClass).length : 0;
  const maxSeats = route ? maxSeatsFor(route, rideClass) : 0;
  const alternate = route ? alternativeClass(route, rideClass) : null;

  const advanceBookings = useCallback(() => {
    const stamp = Date.now();
    let changed = false;
    const next = bookings.map((booking) => {
      if (
        booking.status === "matching" &&
        stamp - new Date(booking.createdAt).getTime() >= MATCHING_DELAY_MS
      ) {
        changed = true;
        return { ...booking, status: "assigned" as const, assignedAt: new Date(stamp).toISOString() };
      }
      if (
        booking.status === "assigned" &&
        booking.assignedAt &&
        stamp - new Date(booking.assignedAt).getTime() >= ARRIVAL_DELAY_MS
      ) {
        changed = true;
        return { ...booking, status: "arrived" as const, arrivedAt: new Date(stamp).toISOString() };
      }
      return booking;
    });
    if (changed) rideBookings.write(next);
  }, [bookings]);

  useEffect(() => {
    advanceBookings();
    const timer = window.setInterval(() => {
      advanceBookings();
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [advanceBookings]);

  const handleFindRides = useCallback(() => {
    if (!isKnownPlace(pickup) || !isKnownPlace(dropoff)) {
      setFormError(PLACE_ERROR);
      return;
    }
    if (normalizePlace(pickup) === normalizePlace(dropoff)) {
      setFormError(SAME_PLACE_ERROR);
      return;
    }
    setFormError(null);
    setSelectedOptionId(null);
    setStep("choose");
  }, [dropoff, pickup]);

  const handleRoutePick = useCallback(
    (routeId: number) => {
      const picked = RIDE_ROUTES.find((item) => item.id === routeId);
      if (!picked) return;
      setPickup(picked.from);
      setDropoff(picked.to);
      setDay(picked.day);
      setReservedDate(null);
      setFormError(null);
      setSelectedOptionId(null);
      setStep("choose");
    },
    [],
  );

  const confirmBooking = useCallback(() => {
    if (!route) return;
    const quote = quotes.find((item) => item.option.id === selectedOptionId);
    if (!quote) return;
    const vehicle = vehicleFor(rideClass);
    const booking: RideBooking = {
      id: `rb_${Date.now()}`,
      routeId: route.id,
      optionId: quote.option.id,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      day: effectiveDay,
      dayLabel: reservedDate ? formatRideDate(reservedDate) : route.dayLabel,
      time: route.time,
      seats,
      class: rideClass,
      driver: quote.option.driver,
      vehicle: vehicle.name,
      plate: vehicle.plate,
      fare: quote.fare,
      etaMinutes: quote.option.etaMinutes,
      note: note.trim(),
      status: "matching",
      createdAt: new Date().toISOString(),
      reservedFor: reservedDate,
      assignedAt: null,
      arrivedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelFee: 0,
      waitFee: 0,
      tipPercent: 0,
      rating: 0,
      destinationChanges: [],
    };
    rideBookings.write([...bookings, booking]);
    const destination = dropoff.trim();
    rideRecents.write(
      [destination, ...recents.filter((item) => item !== destination)].slice(0, 20),
    );
    setActiveBookingId(booking.id);
    setSelectedOptionId(null);
    setNote("");
    setTipPercent(null);
    setRating(null);
    setStep("status");
  }, [
    bookings,
    dropoff,
    effectiveDay,
    note,
    pickup,
    quotes,
    recents,
    reservedDate,
    rideClass,
    route,
    seats,
    selectedOptionId,
  ]);

  const updateBooking = useCallback(
    (id: string, patch: Partial<RideBooking>) => {
      rideBookings.write(
        bookings.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking)),
      );
    },
    [bookings],
  );

  const cancelBooking = useCallback(
    (booking: RideBooking) => {
      const fee = rideCancelFee(booking, new Date(now));
      updateBooking(booking.id, {
        status: "cancelled",
        cancelledAt: new Date(now).toISOString(),
        cancelFee: fee,
      });
      showToast(fee > 0 ? "Ride cancelled with a fee." : "Ride cancelled.");
    },
    [now, showToast, updateBooking],
  );

  const startTrip = useCallback(
    (booking: RideBooking) => {
      updateBooking(booking.id, {
        status: "in_trip",
        startedAt: new Date(now).toISOString(),
      });
    },
    [now, updateBooking],
  );

  const endTrip = useCallback(
    (booking: RideBooking) => {
      const completedAt = new Date(now).toISOString();
      updateBooking(booking.id, {
        status: "completed",
        completedAt,
        waitFee: rideWaitFee(booking, completedAt, new Date(now)),
      });
      setTipPercent(null);
      setRating(null);
    },
    [now, updateBooking],
  );

  const submitRating = useCallback(
    (booking: RideBooking) => {
      if (rating === null) {
        setNotice(RATING_REQUIRED_COPY);
        return;
      }
      updateBooking(booking.id, {
        rating,
        tipPercent: tipPercent ?? 0,
      });
      setNotice(null);
      showToast("Thanks for riding.");
    },
    [rating, showToast, tipPercent, updateBooking],
  );

  const shareRide = useCallback(
    (booking: RideBooking) => {
      const summary = `Ride on JobFinder: ${booking.pickup} to ${booking.dropoff}, ${tripDateLabel(booking)} at ${booking.time}, ${booking.class} with ${booking.driver}.`;
      if (typeof navigator.share === "function") {
        void navigator.share({ title: SHARE_RIDE_TITLE, text: summary }).catch(() => {});
        return;
      }
      navigator.clipboard
        .writeText(summary)
        .then(() => showToast(SHARE_RIDE_COPY))
        .catch((error) => {
          console.warn("JobFinder: unable to copy ride summary", error);
        });
    },
    [showToast],
  );

  const changeDestination = useCallback(
    (booking: RideBooking, place: string) => {
      if (!isKnownPlace(place)) {
        setFormError(PLACE_ERROR);
        return;
      }
      const nextRoute = findRoute(booking.pickup, place, booking.day);
      const nextQuotes = nextRoute ? quoteOptions(nextRoute, booking.class, booking.seats) : [];
      if (!nextRoute || nextQuotes.length === 0) {
        setFormError(PLACE_ERROR);
        return;
      }
      setFormError(null);
      setDestinationOpen(false);
      updateBooking(booking.id, {
        dropoff: place.trim(),
        fare: nextQuotes[0].fare,
        etaMinutes: nextQuotes[0].option.etaMinutes,
        driver: nextQuotes[0].option.driver,
        destinationChanges: [
          ...booking.destinationChanges,
          { place: place.trim(), at: new Date(now).toISOString() },
        ],
      });
      setNotice(DESTINATION_SAVED);
    },
    [now, updateBooking],
  );

  const renderSearch = () => (
    <>
      <div className="hero-rise">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {PAGE_TITLE}
        </h1>
        <p className="mt-2 text-[15px] text-muted">{PAGE_SUB}</p>
      </div>

      {activeBooking ? (
        <button
          type="button"
          onClick={() => {
            setActiveBookingId(activeBooking.id);
            setStep("status");
          }}
          className="mt-5 flex w-full items-center gap-3.5 rounded-[16px] border border-brand bg-surface p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
            <CarIcon className="size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold">
              {`${activeBooking.pickup} → ${activeBooking.dropoff}`}
            </span>
            <span className="mt-0.5 block truncate text-[13px] text-muted">
              {statusLabel(activeBooking)}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
            {seatsLabel(activeBooking.seats)}
          </span>
        </button>
      ) : null}

      <div className="mt-6 space-y-5">
        <SearchBar
          key={dropoff}
          onSearch={(value) => {
            setDropoff(value);
            setFormError(null);
          }}
          initialValue={dropoff}
          placeholder="Where to?"
          ariaLabel="Where to?"
        />

        <label className="block">
          <span className="text-[13px] font-semibold text-foreground">Pickup</span>
          <input
            type="text"
            value={pickup}
            aria-label="Pickup location"
            placeholder="Pickup location"
            onChange={(event) => {
              setPickup(event.target.value);
              setFormError(null);
            }}
            className="mt-1.5 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] outline-none transition-colors placeholder:text-muted focus:border-brand"
          />
        </label>

        <div>
          <span className="text-[13px] font-semibold text-foreground">When</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {RIDE_DAYS.map((option) => (
              <Chip
                key={option}
                active={reservedDate === null && option === day}
                onClick={() => {
                  setDay(option);
                  setReservedDate(null);
                  setFormError(null);
                }}
              >
                {option}
              </Chip>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-[13px] font-semibold text-foreground">{RESERVE_LABEL}</span>
            <span className="mt-0.5 block text-[12px] text-muted">{RESERVE_HINT}</span>
            <input
              type="date"
              value={reservedDate ?? ""}
              min={bounds.min}
              max={bounds.max}
              aria-label={RESERVE_LABEL}
              onChange={(event) => {
                setReservedDate(event.target.value || null);
                setFormError(null);
              }}
              className="mt-1.5 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] outline-none transition-colors focus:border-brand"
            />
          </label>
        </div>

        <div>
          <span className="text-[13px] font-semibold text-foreground">Seats</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SEAT_OPTIONS.map((option) => (
              <Chip key={option} active={option === seats} onClick={() => setSeats(option)}>
                {seatsLabel(option)}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="mt-3 text-[13px] font-semibold text-brand">
          {formError}
        </p>
      ) : null}

      <section className="mt-8">
        <SectionHeader title="Scheduled routes" />
        <ul className="space-y-2.5">
          {RIDE_ROUTES.map((item, index) => {
            const cheapest = item.options.reduce((best, option) =>
              option.fare < best.fare ? option : best,
            );
            return (
              <li key={item.id} className="hero-rise" style={rowDelay(index)}>
                <SavedListRow
                  icon={<MapPinIcon className="size-6" />}
                  primary={`${item.from} → ${item.to}`}
                  secondary={`${item.dayLabel} · ${item.time} · Driver ${cheapest.driver}`}
                  badge={`$${cheapest.fare}`}
                  onClick={() => handleRoutePick(item.id)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {recents.length > 0 ? (
        <section className="mt-8">
          <SectionHeader title="Recent destinations" />
          <ul className="space-y-2.5">
            {recents.map((item, index) => (
              <li key={item} className="hero-rise" style={rowDelay(index)}>
                <SavedListRow
                  icon={<CarIcon className="size-6" />}
                  primary={item}
                  secondary="Set as drop-off"
                  onClick={() => {
                    setDropoff(item);
                    setFormError(null);
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8">
          <EmptyState title="No saved places yet." description="Drop-offs you search for show up here." />
        </section>
      )}

      <section className="mt-8">
        <SectionHeader title={PAST_RIDES_LABEL} />
        {pastBookings.length === 0 ? (
          <EmptyState
            title={NO_PAST_RIDES}
            description="Every ride you book is kept here with its receipt."
            action={{ label: NO_PAST_RIDES_ACTION, href: "/rides" }}
          />
        ) : (
          <ul className="space-y-2.5">
            {pastBookings.slice(0, 3).map((booking, index) => (
              <li key={booking.id} className="hero-rise" style={rowDelay(index)}>
                <SavedListRow
                  icon={<CarIcon className="size-6" />}
                  primary={`${booking.pickup} → ${booking.dropoff}`}
                  secondary={`${tripDateLabel(booking)} · ${booking.time} · ${booking.class}`}
                  badge={`$${rideTotal(booking)}`}
                  onClick={() => {
                    setActiveBookingId(booking.id);
                    setStep("status");
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-20 z-30 mt-6">
        <button
          type="button"
          onClick={handleFindRides}
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Find rides
        </button>
      </div>
    </>
  );

  const renderChoose = () => {
    const vehicle = vehicleFor(rideClass);
    return (
      <>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back"
            onClick={() => setStep("search")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand/40"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              {`${pickup.trim()} → ${dropoff.trim()}`}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">
              {reservedDate ? formatRideDate(reservedDate) : route ? route.dayLabel : DAY_LABEL[effectiveDay]}
              {route ? ` · ${route.time}` : ""}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-muted">{FARE_NOTE}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {RIDE_CLASSES.map((option) => (
            <Chip
              key={option}
              active={option === rideClass}
              onClick={() => {
                setRideClass(option);
                setSelectedOptionId(null);
              }}
            >
              {option}
            </Chip>
          ))}
        </div>

        <div className="mt-5">
          {!route ? (
            <div className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-card">
              <p className="text-sm font-semibold">No rides found.</p>
              <p className="mt-1 text-[13px] text-muted">
                {`No scheduled rides from ${pickup.trim()} to ${dropoff.trim()} on ${DAY_LABEL[effectiveDay].toLowerCase()}.`}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {RIDE_DAYS.map((option) => (
                  <Chip key={option} active={option === effectiveDay} onClick={() => setDay(option)}>
                    {option}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDay("Weekday");
                  setStep("search");
                }}
                className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand/40"
              >
                Clear filters
              </button>
            </div>
          ) : driverCount === 0 ? (
            <div className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-card">
              <p className="text-sm font-semibold">{`No drivers near you for ${rideClass}.`}</p>
              {alternate ? (
                <>
                  <p className="mt-1 text-[13px] text-muted">
                    {`Try ${alternate.rideClass} — drivers ${alternate.etaMinutes} min away`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRideClass(alternate.rideClass);
                      setSelectedOptionId(null);
                    }}
                    className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                  >
                    {`Try ${alternate.rideClass}`}
                  </button>
                </>
              ) : (
                <p className="mt-1 text-[13px] text-muted">Try another day or route.</p>
              )}
            </div>
          ) : quotes.length === 0 ? (
            <div className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-card">
              <p className="text-sm font-semibold">{`No rides with ${seats} seats on this route.`}</p>
              <p className="mt-1 text-[13px] text-muted">{`${seatsLabel(maxSeats)} left on this route.`}</p>
              {maxSeats > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setSeats(maxSeats);
                    setSelectedOptionId(null);
                  }}
                  className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                >
                  {`Book ${seatsLabel(maxSeats)}`}
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {quotes.map((quote, index) => {
                const selected = quote.option.id === selectedOptionId;
                return (
                  <li key={quote.option.id} className="hero-rise" style={rowDelay(index)}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedOptionId(quote.option.id)}
                      className={`flex w-full items-center gap-3.5 rounded-[16px] border bg-surface p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-hover ${
                        selected ? "border-brand" : "border-border"
                      }`}
                    >
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
                        <CarIcon className="size-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">
                          {`${quote.option.driver} · ${rideClass}`}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-muted">{vehicle.name}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
                          <ClockIcon className="size-3.5" />
                          {`Arrives in ${quote.option.etaMinutes} min`}
                          <span aria-hidden="true">·</span>
                          {`${quote.option.seatsLeft} seat${quote.option.seatsLeft === 1 ? "" : "s"} left`}
                        </span>
                      </span>
                      <span className="shrink-0 text-[15px] font-semibold">{`$${quote.fare}`}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {route && driverCount > 0 && quotes.length > 0 ? (
          <NoteField
            label="Note for your driver"
            value={note}
            onChange={setNote}
            maxLength={150}
            placeholder="Gate code, luggage, or a stop along the way"
            className="mt-6"
          />
        ) : null}

        <div className="sticky bottom-20 z-30 mt-6">
          <button
            type="button"
            disabled={!selectedOptionId}
            onClick={confirmBooking}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
          >
            Confirm pickup
          </button>
        </div>
      </>
    );
  };

  const renderDriverCard = (booking: RideBooking) => (
    <div className="mt-5 rounded-[16px] border border-border bg-surface p-4 shadow-card">
      <p className="text-[15px] font-semibold">{`${booking.pickup} → ${booking.dropoff}`}</p>
      <p className="mt-1 text-[13px] text-muted">
        {`${tripDateLabel(booking)} · ${booking.time} · ${booking.class}`}
      </p>
      <p className="mt-1 text-[13px] text-muted">
        {`${booking.driver} · ${booking.vehicle} · Plate ${booking.plate}`}
      </p>
      <p className="mt-1 text-[13px] text-muted">{seatsLabel(booking.seats)}</p>
      <p className="mt-3 text-[15px] font-semibold">{`$${booking.fare} upfront`}</p>
      {booking.note ? (
        <p className="mt-2 text-[13px] text-muted">{`Note: ${booking.note}`}</p>
      ) : null}
      {booking.destinationChanges.length > 0 ? (
        <p className="mt-2 text-[13px] text-muted">
          {`Destination changed to ${booking.dropoff}. ${FINAL_AMOUNT_NOTE}`}
        </p>
      ) : null}
    </div>
  );

  const renderTripActions = (booking: RideBooking) => (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => setNotice(CONTACT_COPY)}
        className="flex flex-col items-center gap-1.5 rounded-[16px] border border-border bg-surface px-2 py-3 text-[12px] font-semibold transition-colors hover:border-brand/40"
      >
        <PhoneIcon className="size-5 text-brand" />
        {CALL_DRIVER}
      </button>
      <button
        type="button"
        onClick={() => setNotice(CONTACT_COPY)}
        className="flex flex-col items-center gap-1.5 rounded-[16px] border border-border bg-surface px-2 py-3 text-[12px] font-semibold transition-colors hover:border-brand/40"
      >
        <MessageIcon className="size-5 text-brand" />
        {MESSAGE_DRIVER}
      </button>
      <button
        type="button"
        onClick={() => shareRide(booking)}
        className="flex flex-col items-center gap-1.5 rounded-[16px] border border-border bg-surface px-2 py-3 text-[12px] font-semibold transition-colors hover:border-brand/40"
      >
        <ShareIcon className="size-5 text-brand" />
        {SHARE_RIDE_TITLE}
      </button>
    </div>
  );

  const renderDestinationEditor = (booking: RideBooking) => (
    <div className="mt-4 rounded-[16px] border border-border bg-surface p-4 shadow-card">
      <p className="text-[15px] font-semibold">{CHANGE_DESTINATION}</p>
      <p className="mt-1 text-[13px] text-muted">{FINAL_AMOUNT_NOTE}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {KNOWN_PLACES.filter((place) => normalizePlace(place) !== normalizePlace(booking.dropoff)).map(
          (place) => (
            <Chip key={place} onClick={() => changeDestination(booking, place)}>
              {place}
            </Chip>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => setDestinationOpen(false)}
        className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-brand/40"
      >
        Keep destination
      </button>
    </div>
  );

  const renderReceipt = (booking: RideBooking) => (
    <div className="mt-5 rounded-[16px] border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Receipt</p>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
          {`$${rideTotal(booking)}`}
        </span>
      </div>
      <dl className="mt-3 space-y-1.5 text-[13px]">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Fare</dt>
          <dd className="font-semibold">{`$${booking.fare}`}</dd>
        </div>
        {booking.waitFee > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted">Wait time fee</dt>
            <dd className="font-semibold">{`$${booking.waitFee}`}</dd>
          </div>
        ) : null}
        {booking.cancelFee > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted">Cancellation fee</dt>
            <dd className="font-semibold">{`$${booking.cancelFee}`}</dd>
          </div>
        ) : null}
        {booking.tipPercent > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted">Tip</dt>
            <dd className="font-semibold">{`$${rideTipAmount(booking)}`}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 text-[12px] text-muted">
        {booking.waitFee > 0
          ? "The wait time fee covers time past the free wait window."
          : "No extra charges were added to this trip."}
      </p>
    </div>
  );

  const renderStatus = () => {
    if (!activeBooking) {
      return (
        <>
          <div className="hero-rise">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              {NO_ACTIVE_RIDE_TITLE}
            </h1>
            <p className="mt-2 text-[15px] text-muted">{NO_ACTIVE_RIDE_SUB}</p>
          </div>
          <div className="sticky bottom-20 z-30 mt-6">
            <button
              type="button"
              onClick={() => setStep("search")}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {BOOK_A_RIDE}
            </button>
          </div>
        </>
      );
    }

    const booking = activeBooking;

    if (booking.status === "cancelled") {
      return (
        <>
          <div className="hero-rise">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Ride cancelled.
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              {`${booking.pickup} → ${booking.dropoff} · ${tripDateLabel(booking)} · ${booking.time}`}
            </p>
          </div>
          {booking.cancelFee > 0 ? (
            <div className="mt-4 rounded-[16px] border border-border bg-surface p-4 shadow-card">
              <p className="text-[15px] font-semibold">{`Cancellation fee $${booking.cancelFee}`}</p>
              <p className="mt-1 text-[13px] text-muted">{CANCEL_FEE_COPY}</p>
            </div>
          ) : null}
          <div className="sticky bottom-20 z-30 mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveBookingId(null);
                setStep("search");
              }}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {BOOK_ANOTHER_RIDE}
            </button>
          </div>
        </>
      );
    }

    if (booking.status === "completed") {
      if (booking.rating === 0) {
        return (
          <>
            <div className="hero-rise">
              <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                {TIP_TITLE}
              </h1>
              <p className="mt-2 text-[15px] text-muted">{TIP_SUBTITLE}</p>
            </div>
            {renderDriverCard(booking)}
            <div className="mt-5">
              <p className="text-[13px] font-semibold text-foreground">Tip</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIP_CHIPS.map((option) => (
                  <Chip
                    key={option}
                    active={tipPercent === option}
                    onClick={() => setTipPercent(option)}
                  >
                    {tipLabel(option)}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[13px] font-semibold text-foreground">Rating</p>
              <div className="mt-2 flex items-center gap-2">
                {RATING_VALUES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className={`flex size-10 items-center justify-center rounded-full border transition-colors ${
                      rating !== null && value <= rating
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    <StarIcon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
            {notice ? (
              <p role="alert" className="mt-3 text-[13px] font-semibold text-brand">
                {notice}
              </p>
            ) : null}
            <div className="sticky bottom-20 z-30 mt-6">
              <button
                type="button"
                onClick={() => submitRating(booking)}
                className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                {SUBMIT_RATING}
              </button>
            </div>
          </>
        );
      }
      return (
        <>
          <div className="hero-rise">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Trip completed.
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              {`${booking.pickup} → ${booking.dropoff} · ${tripDateLabel(booking)} · ${booking.time}`}
            </p>
          </div>
          {renderReceipt(booking)}
          <div className="sticky bottom-20 z-30 mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveBookingId(null);
                setStep("search");
              }}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {BOOK_ANOTHER_RIDE}
            </button>
          </div>
        </>
      );
    }

    const waitExpired =
      booking.arrivedAt !== null && now - new Date(booking.arrivedAt).getTime() >= RIDE_FREE_WAIT_MINUTES * 60_000;

    return (
      <>
        <div className="hero-rise">
          <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {booking.status === "matching"
              ? "Finding your driver…"
              : booking.status === "assigned"
                ? "Driver assigned"
                : booking.status === "arrived"
                  ? ARRIVED_TITLE
                  : IN_TRIP_TITLE}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            {booking.status === "matching"
              ? MATCHING_SUBTITLE
              : booking.status === "assigned"
                ? `${DRIVER_ASSIGNED_SUBTITLE} ${booking.etaMinutes} min`
                : booking.status === "arrived"
                  ? waitExpired
                    ? WAIT_OVER_SUBTITLE
                    : ARRIVED_SUBTITLE
                  : `${booking.dropoff} · ${FINAL_AMOUNT_NOTE}`}
          </p>
        </div>

        {renderDriverCard(booking)}

        {booking.status === "assigned" || booking.status === "arrived" ? (
          renderTripActions(booking)
        ) : null}

        {notice ? (
          <p role="status" className="mt-3 text-[13px] font-semibold text-brand">
            {notice}
          </p>
        ) : null}

        {booking.status === "assigned" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setDestinationOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold transition-colors hover:border-brand/40"
            >
              <PencilIcon className="size-4 text-brand" />
              {CHANGE_DESTINATION}
            </button>
            {destinationOpen ? renderDestinationEditor(booking) : null}
          </div>
        ) : null}

        <div className="mt-5">
          <PromiseStrip
            items={
              booking.status === "matching"
                ? [CANCEL_COPY, FARE_NOTE]
                : booking.status === "assigned"
                  ? [CANCEL_COPY_ASSIGNED, FARE_NOTE]
                  : booking.status === "arrived"
                    ? [ARRIVED_SUBTITLE, FARE_NOTE]
                    : [FINAL_AMOUNT_NOTE, FARE_NOTE]
            }
          />
        </div>

        <div className="sticky bottom-20 z-30 mt-6 space-y-2.5">
          {booking.status === "arrived" ? (
            <button
              type="button"
              onClick={() => startTrip(booking)}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {START_RIDE}
            </button>
          ) : null}
          {booking.status === "in_trip" ? (
            <button
              type="button"
              onClick={() => endTrip(booking)}
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              {END_RIDE}
            </button>
          ) : null}
          {isRideCancellable(booking, new Date(now)) ? (
            <button
              type="button"
              onClick={() => cancelBooking(booking)}
              className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-brand/40"
            >
              {CANCEL_RIDE}
            </button>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <>
      <main className="mx-auto max-w-lg px-5 pb-24 pt-6">
        {step === "search" ? renderSearch() : step === "choose" ? renderChoose() : renderStatus()}
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
