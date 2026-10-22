import type { RideClass, RideDay } from "./rides";
import { createCollectionStore } from "./store";

export type RideBookingStatus =
  | "matching"
  | "assigned"
  | "arrived"
  | "in_trip"
  | "completed"
  | "cancelled"
  | "canceled";

export type RideDestinationChange = {
  place: string;
  at: string;
};

export type RideBooking = {
  id: string;
  routeId?: number;
  optionId?: string;
  pickup: string;
  dropoff: string;
  day: RideDay;
  dayLabel: string;
  time: string;
  seats: number;
  class: RideClass;
  driver: string;
  vehicle: string;
  plate: string;
  fare: number;
  etaMinutes: number;
  note: string;
  requestType: "ride" | "parcel";
  weightTier: "small" | "medium" | "large" | null;
  pickupCoord: { lat: number; lng: number };
  dropoffCoord: { lat: number; lng: number };
  distanceKm: number;
  schedule: { mode: string; reservedFor: string | null };
  pinCode: string;
  pinAttempts: number;
  verifiedAt: string | null;
  failureReason: string | null;
  status: RideBookingStatus;
  createdAt: string;
  reservedFor?: string | null;
  assignedAt: string | null;
  arrivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelFee: number;
  waitFee: number;
  tipPercent: number;
  rating: number | null;
  destinationChanges: RideDestinationChange[];
};

export type ServiceBookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ServiceSchedule = "on_demand" | "scheduled";

export type ServiceBooking = {
  id: string;
  serviceId: number;
  serviceName: string;
  category: string;
  provider: string;
  providerRating: number;
  providerReviews: number;
  schedule: ServiceSchedule;
  address: string;
  date: string | null;
  time: string | null;
  note: string;
  price: number;
  priceLabel: string;
  status: ServiceBookingStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  rescheduledAt: string | null;
};

export const RIDE_STATUS_LABEL: Record<RideBookingStatus, string> = {
  matching: "Finding your driver",
  assigned: "Driver assigned",
  arrived: "Driver arrived",
  in_trip: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

export const SERVICE_STATUS_LABEL: Record<ServiceBookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SERVICE_CANCEL_WINDOW_HOURS = 2;
export const RIDE_CANCEL_WINDOW_MINUTES = 2;
export const RIDE_FREE_WAIT_MINUTES = 5;
export const RIDE_CANCEL_FEE = 5;
export const RIDE_WAIT_FEE_PER_MINUTE = 1;

const isString = (value: unknown): value is string => typeof value === "string";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isRideClass = (value: unknown): value is RideClass =>
  value === "Economy" || value === "Comfort" || value === "SUV";

const isRideDay = (value: unknown): value is RideDay =>
  value === "Weekday" || value === "Friday" || value === "Saturday" || value === "Sunday";

const isRideStatus = (value: unknown): value is RideBookingStatus =>
  value === "matching" ||
  value === "assigned" ||
  value === "arrived" ||
  value === "in_trip" ||
  value === "completed" ||
  value === "cancelled" ||
  value === "canceled";

const isServiceStatus = (value: unknown): value is ServiceBookingStatus =>
  value === "pending" ||
  value === "confirmed" ||
  value === "in_progress" ||
  value === "completed" ||
  value === "cancelled";

const isServiceSchedule = (value: unknown): value is ServiceSchedule =>
  value === "on_demand" || value === "scheduled";

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isDestinationChange(value: unknown): value is RideDestinationChange {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return isString(item.place) && isString(item.at);
}

function isPlainCoord(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return isNumber(item.lat) && isNumber(item.lng);
}

function isRideSchedule(
  value: unknown
): value is { mode: string; reservedFor: string | null } {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return isString(item.mode);
}

function normalizeRideBooking(value: unknown): RideBooking | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    !isString(item.id) ||
    !isString(item.pickup) ||
    !isString(item.dropoff) ||
    !isNumber(item.seats) ||
    !isRideClass(item.class) ||
    !isString(item.driver) ||
    !isNumber(item.fare) ||
    !isRideStatus(item.status) ||
    !isString(item.createdAt)
  ) {
    return null;
  }
  return {
    id: item.id,
    routeId: isNumber(item.routeId) ? item.routeId : undefined,
    optionId: isString(item.optionId) ? item.optionId : "",
    pickup: item.pickup,
    dropoff: item.dropoff,
    day: isRideDay(item.day) ? item.day : "Weekday",
    dayLabel: isString(item.dayLabel) ? item.dayLabel : "",
    time: isString(item.time) ? item.time : "",
    seats: item.seats,
    class: item.class,
    driver: item.driver,
    vehicle: isString(item.vehicle) ? item.vehicle : "",
    plate: isString(item.plate) ? item.plate : "",
    fare: item.fare,
    etaMinutes: isNumber(item.etaMinutes) ? item.etaMinutes : 0,
    note: isString(item.note) ? item.note : "",
    requestType: item.requestType === "parcel" ? "parcel" : "ride",
    weightTier:
      item.weightTier === "small" ||
      item.weightTier === "medium" ||
      item.weightTier === "large"
        ? item.weightTier
        : null,
    pickupCoord: isPlainCoord(item.pickupCoord) ? item.pickupCoord : { lat: 0, lng: 0 },
    dropoffCoord: isPlainCoord(item.dropoffCoord)
      ? item.dropoffCoord
      : { lat: 0, lng: 0 },
    distanceKm: isNumber(item.distanceKm) ? item.distanceKm : 0,
    schedule: isRideSchedule(item.schedule)
      ? {
          mode: item.schedule.mode,
          reservedFor: isNullableString(item.schedule.reservedFor)
            ? item.schedule.reservedFor
            : null,
        }
      : { mode: "now", reservedFor: null },
    pinCode: isString(item.pinCode) ? item.pinCode : "",
    pinAttempts: isNumber(item.pinAttempts) ? item.pinAttempts : 0,
    verifiedAt: isNullableString(item.verifiedAt) ? item.verifiedAt : null,
    failureReason: isNullableString(item.failureReason)
      ? item.failureReason
      : null,
    status: item.status,
    createdAt: item.createdAt,
    reservedFor: isNullableString(item.reservedFor) ? item.reservedFor : null,
    assignedAt: isNullableString(item.assignedAt) ? item.assignedAt : null,
    arrivedAt: isNullableString(item.arrivedAt) ? item.arrivedAt : null,
    startedAt: isNullableString(item.startedAt) ? item.startedAt : null,
    completedAt: isNullableString(item.completedAt) ? item.completedAt : null,
    cancelledAt: isNullableString(item.cancelledAt) ? item.cancelledAt : null,
    cancelFee: isNumber(item.cancelFee) ? item.cancelFee : 0,
    waitFee: isNumber(item.waitFee) ? item.waitFee : 0,
    tipPercent: isNumber(item.tipPercent) ? item.tipPercent : 0,
    rating: isNumber(item.rating) ? item.rating : null,
    destinationChanges: Array.isArray(item.destinationChanges)
      ? item.destinationChanges.filter(isDestinationChange)
      : [],
  };
}

function normalizeServiceBooking(value: unknown): ServiceBooking | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    !isString(item.id) ||
    !isNumber(item.serviceId) ||
    !isString(item.serviceName) ||
    !isString(item.address) ||
    !isNumber(item.price) ||
    !isServiceStatus(item.status) ||
    !isString(item.createdAt)
  ) {
    return null;
  }
  return {
    id: item.id,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    category: isString(item.category) ? item.category : "",
    provider: isString(item.provider) ? item.provider : "",
    providerRating: isNumber(item.providerRating) ? item.providerRating : 0,
    providerReviews: isNumber(item.providerReviews) ? item.providerReviews : 0,
    schedule: isServiceSchedule(item.schedule) ? item.schedule : "on_demand",
    address: item.address,
    date: isNullableString(item.date) ? item.date : null,
    time: isNullableString(item.time) ? item.time : null,
    note: isString(item.note) ? item.note : "",
    price: item.price,
    priceLabel: isString(item.priceLabel) ? item.priceLabel : "",
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: isString(item.updatedAt) ? item.updatedAt : item.createdAt,
    cancelledAt: isNullableString(item.cancelledAt) ? item.cancelledAt : null,
    rescheduledAt: isNullableString(item.rescheduledAt) ? item.rescheduledAt : null,
  };
}

function parseArray<T>(raw: string | null, normalize: (value: unknown) => T | null): T[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalize)
      .filter((item): item is T => item !== null);
  } catch {
    return [];
  }
}

function parseRecents(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isString).slice(0, 20);
  } catch {
    return [];
  }
}

function createRideBookingsStore() {
  const store = createCollectionStore<RideBooking[]>(
    "jf:bookings",
    (raw) => parseArray<RideBooking>(raw, normalizeRideBooking),
    "persistent",
  );
  const add = (booking: RideBooking): void => {
    store.write([...store.read(), booking]);
  };
  const update = (id: string, patch: Partial<RideBooking>): void => {
    store.write(
      store.read().map((booking) =>
        booking.id === id ? { ...booking, ...patch } : booking
      )
    );
  };
  return Object.assign(store, { add, update });
}

export const rideBookings = createRideBookingsStore();

export const serviceBookings = createCollectionStore<ServiceBooking[]>(
  "jf:service-bookings",
  (raw) => parseArray<ServiceBooking>(raw, normalizeServiceBooking),
  "persistent",
);

export const rideRecents = createCollectionStore<RideBooking[]>(
  "jf:rides-recents",
  (raw) => parseArray<RideBooking>(raw, normalizeRideBooking),
  "persistent",
);

export const serviceRecents = createCollectionStore<string[]>(
  "jf:services-recents",
  parseRecents,
  "persistent",
);

export function rideTotal(booking: RideBooking): number {
  const tip = Math.round(booking.fare * (booking.tipPercent / 100));
  return booking.fare + booking.waitFee + booking.cancelFee + tip;
}

export function rideTipAmount(booking: RideBooking, percent?: number): number {
  const pct = percent ?? booking.tipPercent;
  return Math.round(booking.fare * (pct / 100));
}

export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export type RideReceiptLine = { label: string; amount: number };

export type RideReceipt = {
  outcome: string;
  issuedAt: string;
  lines: RideReceiptLine[];
  total: number;
  note: string;
};

export function rideReceiptFor(booking: RideBooking): RideReceipt {
  const lines: RideReceiptLine[] = [
    { label: "Fare", amount: booking.fare },
  ];
  if (booking.cancelFee > 0) {
    lines.push({ label: "Cancellation fee", amount: booking.cancelFee });
  }
  if (booking.waitFee > 0) {
    lines.push({ label: "Waiting time", amount: booking.waitFee });
  }
  if (booking.tipPercent > 0) {
    lines.push({
      label: `Tip (${booking.tipPercent}%)`,
      amount: rideTipAmount(booking),
    });
  }
  const issuedAt =
    booking.completedAt ?? booking.cancelledAt ?? booking.createdAt;
  return {
    outcome: RIDE_STATUS_LABEL[booking.status],
    issuedAt,
    lines,
    total: rideTotal(booking),
    note: booking.note,
  };
}

export function isRideCancellable(booking: RideBooking, now: Date = new Date()): boolean {
  if (booking.status === "matching") return true;
  if (booking.status === "assigned") {
    const assigned = booking.assignedAt ? new Date(booking.assignedAt).getTime() : NaN;
    if (Number.isNaN(assigned)) return true;
    return now.getTime() - assigned <= RIDE_CANCEL_WINDOW_MINUTES * 60_000;
  }
  return false;
}

export function rideCancelFee(booking: RideBooking, now: Date = new Date()): number {
  if (booking.status === "matching") return 0;
  if (booking.status !== "assigned") return RIDE_CANCEL_FEE;
  const assigned = booking.assignedAt ? new Date(booking.assignedAt).getTime() : NaN;
  if (Number.isNaN(assigned)) return 0;
  const elapsed = now.getTime() - assigned;
  if (elapsed <= RIDE_CANCEL_WINDOW_MINUTES * 60_000) return 0;
  return RIDE_CANCEL_FEE;
}

export function rideWaitFee(
  booking: RideBooking,
  completedAt: string | null = booking.completedAt,
  now: Date = new Date(),
): number {
  if (!booking.arrivedAt) return 0;
  const arrived = new Date(booking.arrivedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : now.getTime();
  if (Number.isNaN(arrived) || Number.isNaN(end)) return 0;
  const overdueMinutes = Math.floor(
    (end - arrived) / 60_000 - RIDE_FREE_WAIT_MINUTES,
  );
  if (overdueMinutes <= 0) return 0;
  return overdueMinutes * RIDE_WAIT_FEE_PER_MINUTE;
}

export function serviceIsCancellable(
  booking: ServiceBooking,
  now: Date = new Date(),
): boolean {
  if (booking.status === "cancelled" || booking.status === "completed") return false;
  if (booking.schedule !== "scheduled" || !booking.date || !booking.time) return true;
  const start = new Date(`${booking.date}T${booking.time}`);
  if (Number.isNaN(start.getTime())) return true;
  const window = SERVICE_CANCEL_WINDOW_HOURS * 60 * 60_000;
  return start.getTime() - now.getTime() >= window;
}

export function serviceCancelWindowEnds(booking: ServiceBooking): Date | null {
  if (booking.schedule !== "scheduled" || !booking.date || !booking.time) return null;
  const start = new Date(`${booking.date}T${booking.time}`);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() - SERVICE_CANCEL_WINDOW_HOURS * 60 * 60_000);
}
