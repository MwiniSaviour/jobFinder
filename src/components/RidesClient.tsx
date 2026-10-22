"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import { onProfileChange, profileStore } from "@/lib/profile";
import {
  RIDE_CLASSES,
  formatRideDate,
  reserveDateBounds,
  rideDayForDate,
} from "@/lib/rides";
import type { RideClass } from "@/lib/rides";
import {
  RIDE_CANCEL_WINDOW_MINUTES,
  RIDE_FREE_WAIT_MINUTES,
  generatePin,
  isRideCancellable,
  rideBookings,
  rideCancelFee,
  rideRecents,
  rideTipAmount,
  rideTotal,
  rideWaitFee,
} from "@/lib/bookings";
import type { RideBooking } from "@/lib/bookings";
import {
  GH_REGIONS,
  etaMinutesFor,
  fareBreakdown,
  formatCedis,
  getGpsPosition,
  haversineKm,
  mockDriver,
  nearestRegion,
  popularPlaces,
  regionForName,
  reverseGeocode,
  searchPlaces,
} from "@/lib/geo";
import type { LatLng, PlaceResult, Region, WeightTier } from "@/lib/geo";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";
import LocationSearch from "./LocationSearch";
import { NoteField } from "./NoteField";
import PinCodeSheet from "./PinCodeSheet";
import { PromiseStrip } from "./PromiseStrip";
import { SavedListRow } from "./SavedListRow";
import { SectionHeader } from "./SectionHeader";
import {
  CalendarIcon,
  CarIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  MessageIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  ShareIcon,
  ShieldCheckIcon,
  StarIcon,
  XIcon,
} from "./Icons";

const RideMap = dynamic(() => import("./RideMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type BookingStep = "search" | "confirm" | "status";
type ScheduleMode = "now" | "later";
type SavedRow = {
  key: string;
  icon: "pin" | "clock";
  primary: string;
  secondary: string;
  target: "pickup" | "dropoff";
  place: PlaceResult | null;
};

const SAVED_PLACE_TITLE = "Saved places";
const CHOOSE_PLACE_TITLE = "Choose destination";
const PICKUP_PROMPT = "Where are you now?";
const DROPOFF_PROMPT = "Where are you headed?";
const PLACE_ERROR = "We couldn't find that place.";
const DESTINATION_SAVED = "Destination updated. Fare re-quoted.";
const SHARE_RIDE_TITLE = "Share ride";
const SHARE_RIDE_COPY = "Where I'm headed, on JobFinder.";
const GPS_NOTE = "Allow location access, or set pickup manually.";
const GPS_ERROR = "We couldn't reach your location.";
const GPS_PICKUP_LABEL = "Set pickup manually";
const MATCH_DELAY_SECONDS = 6;
const DRIVER_ARRIVES_AFTER_SECONDS = 25;
const PIN_STRIKE_LIMIT = 3;
const BASE_ETA_MINUTES = 5;
const TIP_CHIPS = [0, 10, 15, 20];
const RATING_VALUES = [1, 2, 3, 4, 5];

const TRIP_PROMISES = [
  "Driver matched in under 2 minutes",
  "Live tracking from pickup to dropoff",
  "Fare shown before you confirm",
];

const DRIVER_FALLBACK = { name: "Kwame", vehicle: "Silver Honda Civic", plate: "GR 0000-24" };

const CLASS_FALLBACK: RideClass[] = ["Economy", "Comfort", "SUV"];

const FAILURE_COPY: Record<string, string> = {
  pickup_code: "Ride cancelled. The pickup code was entered wrong three times.",
  no_receiver: "Driver waited, but no one shared the pickup code in time.",
  changed_mind: "Ride cancelled by you.",
};

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function rowStyle(index: number): CSSProperties {
  return { "--hero-delay": `${Math.min(index * 80, 400)}ms` } as CSSProperties;
}

function clockLabel(value: string): string {
  const [hours, minutes] = value.split(":");
  const hour = Number.parseInt(hours ?? "0", 10);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minutes ?? "00"} ${suffix}`;
}

function isoAt(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function safeDistanceKm(from: LatLng, to: LatLng): number | null {
  try {
    const value = haversineKm(from, to);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function etaFor(distanceKm: number | null): number | null {
  if (distanceKm === null) return null;
  try {
    const value = etaMinutesFor(distanceKm);
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function fareAmount(distanceKm: number | null, rideClass: RideClass, weightTier: WeightTier | null): number | null {
  if (distanceKm === null) return null;
  try {
    const detail = fareBreakdown(distanceKm, rideClass, weightTier);
    const total = detail && typeof detail.total === "number" ? detail.total : null;
    return total !== null && Number.isFinite(total) && total > 0 ? total : null;
  } catch {
    return null;
  }
}

function moneyLabel(value: number | null): string {
  if (value === null) return "--";
  try {
    const text = formatCedis(value);
    if (typeof text === "string" && text.trim().length > 0) return text;
  } catch {
    return `GH₵ ${value.toFixed(2)}`;
  }
  return `GH₵ ${value.toFixed(2)}`;
}

function regionForPlaceText(value: string | null | undefined): Region | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  try {
    return regionForName(value) ?? null;
  } catch {
    return null;
  }
}

function nearestRegionForText(value: string | null | undefined): Region | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  try {
    return nearestRegion(value) ?? null;
  } catch {
    return null;
  }
}

function driverFor(region: Region | null): { name: string; vehicle: string; plate: string } {
  if (!region) return DRIVER_FALLBACK;
  try {
    const info = mockDriver(region.id);
    if (info && typeof info.name === "string" && info.name.trim().length > 0) {
      return {
        name: info.name,
        vehicle: typeof info.vehicle === "string" && info.vehicle ? info.vehicle : DRIVER_FALLBACK.vehicle,
        plate: typeof info.plate === "string" && info.plate ? info.plate : DRIVER_FALLBACK.plate,
      };
    }
  } catch {
    return DRIVER_FALLBACK;
  }
  return DRIVER_FALLBACK;
}

function etaMinutesOf(booking: RideBooking): number {
  const value = booking.etaMinutes;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : BASE_ETA_MINUTES;
}

function statusLabel(booking: RideBooking): string {
  switch (booking.status) {
    case "matching":
      return "Finding your driver…";
    case "assigned":
      return `Arriving soon · To ${booking.pickup}`;
    case "arrived":
      return "Driver is at your pickup point";
    case "in_trip":
      return `Heading to ${booking.dropoff}`;
    case "completed":
      return "Trip completed";
    default:
      return "Trip cancelled";
  }
}

function classList(): { id: RideClass; label: string }[] {
  try {
    const entries = RIDE_CLASSES;
    if (Array.isArray(entries)) {
      const mapped = entries
        .map((entry) => {
          const record = entry as { id?: unknown; label?: unknown };
          if (typeof record.id === "string" && typeof record.label === "string") {
            return { id: record.id as RideClass, label: record.label };
          }
          return null;
        })
        .filter((entry): entry is { id: RideClass; label: string } => entry !== null);
      if (mapped.length > 0) return mapped;
    }
  } catch {
    return CLASS_FALLBACK.map((id) => ({ id, label: id }));
  }
  return CLASS_FALLBACK.map((id) => ({ id, label: id }));
}

function parseLocationValue(value: unknown): PlaceResult | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<PlaceResult> & { name?: unknown; label?: unknown };
  const addr =
    typeof candidate.addr === "string" && candidate.addr.trim().length > 0
      ? candidate.addr
      : typeof candidate.name === "string" && candidate.name.length > 0
        ? candidate.name
        : typeof candidate.label === "string" && candidate.label.length > 0
          ? candidate.label
          : null;
  const lat = typeof candidate.lat === "number" ? candidate.lat : null;
  const lng = typeof candidate.lng === "number" ? candidate.lng : null;
  if (addr === null || lat === null || lng === null) return null;
  return {
    addr,
    lat,
    lng,
    regionId: typeof candidate.regionId === "string" ? candidate.regionId : null,
  };
}

function placeFromRegionCenter(placeName: string, region: Region): PlaceResult {
  return { addr: placeName, lat: region.center.lat, lng: region.center.lng, regionId: region.id };
}

async function resolveSelection(value: unknown): Promise<PlaceResult | null> {
  const direct = parseLocationValue(value);
  if (direct) return direct;
  if (typeof value !== "string") return null;
  try {
    const results = (await searchPlaces(value)) as unknown;
    if (Array.isArray(results)) {
      for (const candidate of results) {
        const place = parseLocationValue(candidate);
        if (place) return place;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function safePopular(region: Region): Promise<PlaceResult[]> {
  try {
    const entries = (await popularPlaces([region.id])) as unknown;
    if (!Array.isArray(entries)) return [];
    const places: PlaceResult[] = [];
    for (const entry of entries.slice(0, 6)) {
      const place = parseLocationValue(entry);
      if (place) {
        places.push({ ...place, regionId: place.regionId ?? region.id });
      } else if (typeof entry === "string") {
        places.push(placeFromRegionCenter(entry, region));
      }
    }
    return places.slice(0, 4);
  } catch {
    return [];
  }
}

function reserveBounds(): { min: string; max: string } | null {
  try {
    const bounds = reserveDateBounds();
    if (
      bounds &&
      typeof bounds === "object" &&
      typeof bounds.min === "string" &&
      typeof bounds.max === "string"
    ) {
      return { min: bounds.min, max: bounds.max };
    }
  } catch {
    return null;
  }
  return null;
}

function MapSkeleton() {
  return (
    <div className="mt-5 h-72 overflow-hidden rounded-[16px] border border-border bg-surface">
      <div className="h-full w-full animate-pulse bg-brand-soft" />
    </div>
  );
}

type ProfileSnapshot = {
  city: string | null;
  savedPlaces?: string[];
};

function readProfile(): ProfileSnapshot {
  return profileStore.getSnapshot() as unknown as ProfileSnapshot;
}

function getServerProfile(): ProfileSnapshot {
  return profileStore.getServerSnapshot() as unknown as ProfileSnapshot;
}

const EMPTY_BOOKINGS: RideBooking[] = [];
const EMPTY_RECENTS: string[] = [];

const recentsMemo = new WeakMap<unknown[], string[]>();

function deriveRecents(snapshot: unknown): string[] {
  if (!Array.isArray(snapshot)) {
    return EMPTY_RECENTS;
  }
  const cached = recentsMemo.get(snapshot);
  if (cached) {
    return cached;
  }
  const derived = snapshot
    .map((entry) => (entry && typeof entry === "object" ? (entry as { id?: unknown }).id : entry))
    .filter((id): id is string => typeof id === "string");
  recentsMemo.set(snapshot, derived);
  return derived;
}

function readBookings(): RideBooking[] {
  const snapshot = rideBookings.getSnapshot();
  return Array.isArray(snapshot) ? snapshot : EMPTY_BOOKINGS;
}

function getServerBookings(): RideBooking[] {
  const snapshot = rideBookings.getServerSnapshot();
  return Array.isArray(snapshot) ? snapshot : EMPTY_BOOKINGS;
}

function readRecents(): string[] {
  return deriveRecents(rideRecents.getSnapshot() as unknown);
}

function getServerRecents(): string[] {
  return deriveRecents(rideRecents.getServerSnapshot() as unknown);
}

function safeCancellable(booking: RideBooking): boolean {
  try {
    return Boolean(isRideCancellable(booking));
  } catch {
    return false;
  }
}

function safeCancelFee(booking: RideBooking): number {
  try {
    const value = rideCancelFee(booking);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function safeWaitFee(booking: RideBooking): number {
  try {
    const value = rideWaitFee(booking);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function safeTipAmount(booking: RideBooking, percent: number): number {
  try {
    const value = rideTipAmount(booking, percent);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function safeTotal(booking: RideBooking): number | null {
  try {
    const value = rideTotal(booking);
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function rememberRide(booking: RideBooking): void {
  try {
    const store = rideRecents as {
      add?: (entry: RideBooking) => unknown;
      write?: (entries: RideBooking[]) => unknown;
    };
    if (typeof store.add === "function") {
      store.add(booking);
      return;
    }
    if (typeof store.write === "function") {
      store.write([booking]);
    }
  } catch {
    return;
  }
}

export default function RidesClient() {
  const profile = useSyncExternalStore(onProfileChange, readProfile, getServerProfile);
  const bookings = useSyncExternalStore(rideBookings.subscribe, readBookings, getServerBookings);
  const recents = useSyncExternalStore(rideRecents.subscribe, readRecents, getServerRecents);

  const [step, setStep] = useState<BookingStep>("search");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [pickupPlace, setPickupPlace] = useState<PlaceResult | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<PlaceResult | null>(null);
  const [saveTarget, setSaveTarget] = useState<"pickup" | "dropoff" | null>(null);
  const [popular, setPopular] = useState<PlaceResult[]>([]);
  const [gpsState, setGpsState] = useState<"unknown" | "granted" | "denied">("unknown");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [rideClass, setRideClass] = useState<RideClass>("Economy");
  const [parcelMode, setParcelMode] = useState(false);
  const [weightTier, setWeightTier] = useState<WeightTier | null>(null);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [laterTime, setLaterTime] = useState("18:00");
  const [laterDate, setLaterDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [pinDismissedKey, setPinDismissedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tipPercent, setTipPercent] = useState(0);
  const [rating, setRating] = useState(0);
  const [tick, setTick] = useState(0);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);

  const activeRegion = useMemo(() => {
    const fromState = regionForPlaceText(regionId);
    if (fromState) return fromState;
    const fromProfile = regionForPlaceText(profile?.city);
    if (fromProfile) return fromProfile;
    const nearest = nearestRegionForText(profile?.city);
    if (nearest) return nearest;
    return GH_REGIONS[0] ?? null;
  }, [regionId, profile?.city]);

  const regionList = useMemo(() => (Array.isArray(GH_REGIONS) ? GH_REGIONS : []), []);

  const dateBounds = useMemo(() => reserveBounds(), []);

  useEffect(() => {
    if (!activeRegion) return;
    if (profile?.city !== activeRegion.name && activeRegion.name) {
      const snapshot = profileStore.getSnapshot();
      profileStore.write({ ...snapshot, city: activeRegion.name, region: activeRegion.id });
    }
  }, [activeRegion, profile?.city]);

  useEffect(() => {
    if (!activeRegion) return;
    let cancelled = false;
    safePopular(activeRegion).then((places) => {
      if (!cancelled) setPopular(places);
    });
    return () => {
      cancelled = true;
    };
  }, [activeRegion]);

  const showToast = useCallback((message: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => setToast(null), 2600);
    setToast(message);
  }, []);

  const savedRows = useMemo<SavedRow[]>(() => {
    const rows: SavedRow[] = [];
    const savedNames = Array.isArray(profile?.savedPlaces) ? profile!.savedPlaces! : [];
    for (const name of savedNames.slice(0, 3)) {
      if (typeof name !== "string" || name.trim().length === 0) continue;
      const region = regionForPlaceText(name) ?? activeRegion;
      rows.push({
        key: `saved-${name}`,
        icon: "pin",
        primary: name,
        secondary: region ? `${region.capital} · ${region.name}` : "",
        target: "pickup",
        place: region ? placeFromRegionCenter(name, region) : null,
      });
    }
    if (rows.length < 3 && activeRegion) {
      for (const place of popular.slice(0, 3 - rows.length)) {
        if (savedNames.some((name) => typeof name === "string" && name.trim() === place.addr)) continue;
        rows.push({
          key: `popular-${place.addr}`,
          icon: "pin",
          primary: place.addr,
          secondary: `${activeRegion.capital} · ${activeRegion.name}`,
          target: "dropoff",
          place,
        });
      }
    }
    return rows;
  }, [profile, popular, activeRegion]);

  const recentRows = useMemo<SavedRow[]>(() => {
    const rows: SavedRow[] = [];
    for (const id of recents.slice(0, 3)) {
      const found = bookings.find((entry) => entry.id === id);
      if (!found) continue;
      rows.push({
        key: `recent-${found.id}`,
        icon: "clock",
        primary: found.dropoff,
        secondary: `${found.dayLabel} · ${found.time}`,
        target: "dropoff",
        place: {
          addr: found.dropoff,
          lat: found.dropoffCoord.lat,
          lng: found.dropoffCoord.lng,
          regionId: null,
        },
      });
    }
    return rows;
  }, [recents, bookings]);

  const activeBooking = useMemo(() => {
    if (activeBookingId === null) return null;
    return bookings.find((entry) => entry.id === activeBookingId) ?? null;
  }, [bookings, activeBookingId]);

  const pinOpen =
    activeBooking !== null &&
    (activeBooking.status === "assigned" || activeBooking.status === "arrived") &&
    pinDismissedKey !== `${activeBooking.id}|${activeBooking.status}`;

  const dismissPin = useCallback(() => {
    const found = activeBooking;
    if (!found) return;
    setPinDismissedKey(`${found.id}|${found.status}`);
  }, [activeBooking]);

  const pickup = pickupPlace;
  const dropoff = dropoffPlace;

  const distanceKm = useMemo(() => {
    if (!pickup || !dropoff) return null;
    return safeDistanceKm(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: dropoff.lat, lng: dropoff.lng },
    );
  }, [pickup, dropoff]);

  const etaMinutes = etaFor(distanceKm);
  const requestClass = rideClass;
  const fareEstimate = fareAmount(distanceKm, requestClass, parcelMode ? weightTier : null);

  const advanceRide = useCallback((found: RideBooking | undefined) => {
    if (!found) return;
    const now = Date.now();
    if (
      found.status === "matching" &&
      now - isoAt(found.createdAt) > MATCH_DELAY_SECONDS * 1000 &&
      !found.failureReason
    ) {
      const driver = driverFor(nearestRegionForText(found.pickup) ?? regionForPlaceText(found.pickup));
      rideBookings.update(found.id, {
        status: "assigned",
        driver: driver.name,
        vehicle: driver.vehicle,
        plate: driver.plate,
        assignedAt: new Date(now).toISOString(),
      });
      return;
    }
    if (
      found.status === "assigned" &&
      now - isoAt(found.assignedAt) > DRIVER_ARRIVES_AFTER_SECONDS * 1000
    ) {
      rideBookings.update(found.id, {
        status: "arrived",
        arrivedAt: new Date(now).toISOString(),
      });
      return;
    }
    if (found.status === "in_trip" && found.startedAt) {
      const tripMs = etaMinutesOf(found) * 60 * 1000;
      if (now - isoAt(found.startedAt) >= tripMs) {
        rideBookings.update(found.id, {
          status: "completed",
          completedAt: new Date(now).toISOString(),
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!activeBookingId) return;
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [activeBookingId]);

  useEffect(() => {
    const found = activeBooking;
    advanceRide(found ?? undefined);
  }, [tick, activeBooking, advanceRide]);

  const commitPlace = useCallback(
    async (value: unknown, target: "pickup" | "dropoff") => {
      let place = await resolveSelection(value);
      if (!place && typeof value === "string" && activeRegion) {
        place = placeFromRegionCenter(value.trim(), activeRegion);
      }
      if (!place) {
        showToast(PLACE_ERROR);
        setSaveTarget(null);
        setDestinationOpen(false);
        return;
      }
      const region = regionForPlaceText(place.regionId) ?? activeRegion;
      const stamped: PlaceResult = region ? { ...place, regionId: region.id } : place;
      if (target === "pickup") setPickupPlace(stamped);
      else setDropoffPlace(stamped);
      setSaveTarget(null);
    },
    [activeRegion, showToast],
  );

  const changeDestination = useCallback(
    async (value: unknown) => {
      const found = activeBooking;
      if (!found) return;
      const place = await resolveSelection(value);
      if (!place) {
        showToast(PLACE_ERROR);
        setDestinationOpen(false);
        return;
      }
      const nextKm = safeDistanceKm(found.pickupCoord, { lat: place.lat, lng: place.lng });
      const eta = etaFor(nextKm);
      const fare = fareAmount(nextKm, found.class, found.weightTier);
      const patch: Partial<RideBooking> = {
        dropoff: place.addr,
        dropoffCoord: { lat: place.lat, lng: place.lng },
        destinationChanges: [
          ...found.destinationChanges,
          { place: place.addr, at: new Date().toISOString() },
        ],
      };
      if (nextKm !== null) patch.distanceKm = nextKm;
      if (eta !== null) patch.etaMinutes = eta;
      if (fare !== null) patch.fare = fare;
      rideBookings.update(found.id, patch);
      setDropoffPlace(place);
      setDestinationOpen(false);
      showToast(DESTINATION_SAVED);
    },
    [activeBooking, showToast],
  );

  const beginRide = useCallback(() => {
    if (!pickup || !dropoff) {
      showToast(PLACE_ERROR);
      return;
    }
    if (parcelMode && weightTier === null) {
      showToast("Choose a parcel size first.");
      return;
    }
    const now = new Date();
    const hour = Number.parseInt(laterTime.split(":")[0] ?? "18", 10);
    const minute = Number.parseInt(laterTime.split(":")[1] ?? "0", 10);
    const safeHour = Number.isFinite(hour) ? hour : 18;
    const safeMinute = Number.isFinite(minute) ? minute : 0;
    const reservedFor =
      scheduleMode === "later"
        ? (laterDate && /^\d{4}-\d{2}-\d{2}$/.test(laterDate)
            ? new Date(`${laterDate}T${String(safeHour).padStart(2, "0")}:${String(safeMinute).padStart(2, "0")}:00`)
            : new Date(now.getFullYear(), now.getMonth(), now.getDate(), safeHour, safeMinute)
          ).toISOString()
        : null;
    if (fareEstimate === null) {
      showToast("We couldn't price this trip yet. Try again.");
      return;
    }
    const booking: RideBooking = {
      id: `rb_${Date.now()}`,
      requestType: parcelMode ? "parcel" : "ride",
      weightTier,
      pickup: pickup.addr,
      dropoff: dropoff.addr,
      pickupCoord: { lat: pickup.lat, lng: pickup.lng },
      dropoffCoord: { lat: dropoff.lat, lng: dropoff.lng },
      distanceKm: distanceKm ?? 0,
      day: rideDayForDate(now),
      dayLabel: scheduleMode === "later" && reservedFor ? formatRideDate(new Date(reservedFor)) : formatRideDate(now),
      time: scheduleMode === "later" ? clockLabel(laterTime) : now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      etaMinutes: etaMinutes ?? BASE_ETA_MINUTES,
      fare: fareEstimate,
      note,
      status: "matching",
      createdAt: new Date(now).toISOString(),
      assignedAt: null,
      arrivedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelFee: 0,
      waitFee: 0,
      tipPercent: 0,
      rating: null,
      driver: "",
      vehicle: "",
      plate: "",
      class: rideClass,
      schedule: { mode: scheduleMode, reservedFor },
      destinationChanges: [],
      pinCode: generatePin(),
      pinAttempts: 0,
      verifiedAt: null,
      failureReason: null,
      seats: 1,
    };
    rideBookings.add(booking);
    setActiveBookingId(booking.id);
    setStep("status");
  }, [pickup, dropoff, distanceKm, rideClass, parcelMode, weightTier, scheduleMode, laterTime, laterDate, note, etaMinutes, fareEstimate, showToast]);

  const cancelRide = useCallback(() => {
    const found = activeBooking;
    if (!found) return;
    if (!safeCancellable(found)) {
      showToast("This ride can no longer be cancelled in the app.");
      return;
    }
    const fee = safeCancelFee(found);
    rideBookings.update(found.id, {
      status: "canceled",
      cancelledAt: new Date().toISOString(),
      cancelFee: fee,
      failureReason: "changed_mind",
    });
    setActiveBookingId(null);
    setStep("search");
    if (fee === 0) showToast("No cancellation charge.");
    else showToast(`Cancellation fee: ${moneyLabel(fee)}`);
  }, [activeBooking, showToast]);

  const verifyPin = useCallback(() => {
    const found = activeBooking;
    if (!found || found.verifiedAt || found.status !== "arrived") return;
    rideBookings.update(found.id, {
      status: "in_trip",
      startedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    });
    showToast("Code confirmed. Off to your destination.");
  }, [activeBooking, showToast]);

  const completeTrip = useCallback(() => {
    const found = activeBooking;
    if (!found) return;
    rideBookings.update(found.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }, [activeBooking]);

  const pinWrongAttempt = useCallback(() => {
    const found = activeBooking;
    if (!found) return;
    const attempts = found.pinAttempts + 1;
    if (attempts >= PIN_STRIKE_LIMIT) {
      rideBookings.update(found.id, {
        status: "canceled",
        cancelledAt: new Date().toISOString(),
        cancelFee: 0,
        waitFee: 0,
        tipPercent: 0,
        pinAttempts: attempts,
        failureReason: "pickup_code",
      });
      setActiveBookingId(null);
      setStep("search");
      showToast("Too many wrong codes. Ride cancelled.");
      return;
    }
    rideBookings.update(found.id, { pinAttempts: attempts });
  }, [activeBooking, showToast]);

  const pinFailHandoff = useCallback(() => {
    const found = activeBooking;
    if (!found) return;
    rideBookings.update(found.id, {
      status: "canceled",
      cancelledAt: new Date().toISOString(),
      cancelFee: 0,
      waitFee: safeWaitFee(found),
      tipPercent: 0,
      failureReason: "no_receiver",
    });
    showToast("Driver waited, but no one shared the code. Ride cancelled.");
  }, [activeBooking, showToast]);

  const submitRating = useCallback(() => {
    const found = activeBooking;
    if (!found || found.rating !== null) return;
    if (rating <= 0) {
      showToast("Pick a star rating to finish.");
      return;
    }
    const waitFee = safeWaitFee(found);
    const updated: RideBooking = {
      ...found,
      rating,
      tipPercent,
      waitFee,
      cancelFee: 0,
    };
    rideBookings.update(found.id, {
      rating,
      tipPercent,
      waitFee,
      cancelFee: 0,
    });
    const tip = safeTipAmount(updated, tipPercent);
    const totalDue = safeTotal({ ...updated, tipPercent: tip > 0 ? tipPercent : 0 });
    rememberRide(updated);
    setActiveBookingId(null);
    setStep("search");
    setTipPercent(0);
    setRating(0);
    setNote("");
    showToast(`Thanks for riding. Total ${moneyLabel(totalDue)}.`);
  }, [activeBooking, rating, tipPercent, showToast]);

  const shareRide = useCallback(async () => {
    const found = activeBooking;
    if (!found) return;
    const summary = `${SHARE_RIDE_COPY}\npickup: ${found.pickup}\ndropoff: ${found.dropoff}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: SHARE_RIDE_TITLE, text: summary });
        return;
      }
    } catch {
      try {
        await navigator.clipboard.writeText(summary);
        showToast("Ride summary copied.");
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(summary);
      showToast("Ride summary copied.");
    } catch {
      return;
    }
  }, [activeBooking, showToast]);

  const retryBooking = useCallback(() => {
    const found = activeBooking ?? null;
    if (!found) return;
    setPickupPlace({
      addr: found.pickup,
      lat: found.pickupCoord.lat,
      lng: found.pickupCoord.lng,
      regionId: regionForPlaceText(found.pickup)?.id ?? activeRegion?.id ?? null,
    });
    setDropoffPlace({
      addr: found.dropoff,
      lat: found.dropoffCoord.lat,
      lng: found.dropoffCoord.lng,
      regionId: regionForPlaceText(found.dropoff)?.id ?? activeRegion?.id ?? null,
    });
    setRideClass(found.class);
    setParcelMode(found.requestType === "parcel");
    setWeightTier(found.weightTier);
    setNote(found.note);
    setActiveBookingId(null);
    setStep("confirm");
  }, [activeBooking, activeRegion]);

  const laterLabel = useMemo(() => {
    if (scheduleMode === "now") return "Now";
    const hour = Number.parseInt(laterTime.split(":")[0] ?? "18", 10);
    if (!Number.isFinite(hour)) return "Later";
    return laterDate ? `${laterDate} ${clockLabel(laterTime)}` : `Today ${clockLabel(laterTime)}`;
  }, [scheduleMode, laterTime, laterDate]);

  const rowsForSearch = [...savedRows, ...recentRows];

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col">
      <header className="flex items-center justify-between px-5 pt-6">
        <a
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand"
          aria-label="Back to profile"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </a>
        <div className="text-center">
          <p className="text-sm font-semibold text-muted">{activeRegion ? activeRegion.name : "JobFinder"}</p>
          <h1 className="text-lg font-bold text-ink">Rides &amp; trips</h1>
        </div>
        <button
          type="button"
          onClick={() => setRegionOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand"
          aria-label="Change region"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
      </header>

      {regionOpen && (
        <section className="mx-5 mt-4 rounded-[16px] border border-border bg-surface p-4">
          <SectionHeader title="Region" />
          <p className="mt-1 text-xs text-muted">Choose your region for better suggestions.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {regionList.slice(0, 8).map((region) => (
              <Chip
                key={region.id}
                active={activeRegion?.id === region.id}
                onClick={() => {
                  setRegionId(region.id);
                  setRegionOpen(false);
                }}
              >
                {region.name}
              </Chip>
            ))}
          </div>
        </section>
      )}

      <main className="flex-1 px-5 pb-32">
        {step !== "search" && !activeBooking && <RideMap pickup={pickup} dropoff={dropoff} onPickupMove={(next) => setPickupPlace((prev) => (prev ? { ...prev, lat: next.lat, lng: next.lng } : prev))} onDropoffMove={(next) => setDropoffPlace((prev) => (prev ? { ...prev, lat: next.lat, lng: next.lng } : prev))} />}

        {step === "search" && (
          <>
            {!pickup || !dropoff ? (
              <div className="mt-4">
                <EmptyState title="Plan your next trip" description={GPS_NOTE} />
              </div>
            ) : null}
            <RideMap pickup={pickup} dropoff={dropoff} onPickupMove={(next) => setPickupPlace((prev) => (prev ? { ...prev, lat: next.lat, lng: next.lng } : prev))} onDropoffMove={(next) => setDropoffPlace((prev) => (prev ? { ...prev, lat: next.lat, lng: next.lng } : prev))} />
            <div className="mt-4 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSaveTarget("pickup")}
                className="rounded-[16px] border border-border bg-surface px-4 py-3 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Pickup</span>
                <span className="mt-1 block text-sm font-semibold text-ink">{pickup ? pickup.addr : GPS_PICKUP_LABEL}</span>
              </button>
              <button
                type="button"
                onClick={() => setSaveTarget("dropoff")}
                className="flex items-center justify-between rounded-[16px] border border-border bg-surface px-4 py-3 text-left"
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Dropoff</span>
                  <span className="mt-1 block text-sm font-semibold text-ink">{dropoff ? dropoff.addr : "Choose destination"}</span>
                </span>
                <PencilIcon className="h-4 w-4 text-brand" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  let coords: LatLng | null = null;
                  try {
                    const position = await getGpsPosition() as unknown;
                    if (
                      position &&
                      typeof position === "object" &&
                      typeof (position as { lat?: unknown }).lat === "number" &&
                      typeof (position as { lng?: unknown }).lng === "number"
                    ) {
                      coords = { lat: (position as { lat: number }).lat, lng: (position as { lng: number }).lng };
                    }
                  } catch {
                    coords = null;
                  }
                  if (!coords) {
                    setGpsState("denied");
                    setGpsError(GPS_ERROR);
                    showToast(GPS_ERROR);
                    return;
                  }
                  let addr = GPS_PICKUP_LABEL;
                  try {
                    const label = (await reverseGeocode(coords.lat, coords.lng)) as unknown;
                    if (typeof label === "string" && label.trim().length > 0) addr = label.trim();
                    else if (
                      label &&
                      typeof label === "object" &&
                      typeof (label as { name?: unknown }).name === "string" &&
                      (label as { name: string }).name.trim().length > 0
                    ) {
                      addr = (label as { name: string }).name.trim();
                    }
                  } catch {
                    setGpsError(GPS_ERROR);
                  }
                  const region = activeRegion;
                  setPickupPlace(region ? { addr, ...coords, regionId: region.id } : { addr, ...coords, regionId: null });
                  setGpsState("granted");
                  setGpsError(null);
                }}
                className="flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand"
              >
                <MapPinIcon className="h-4 w-5" />
                Use my location
              </button>
              {gpsState === "denied" && gpsError ? <p className="text-xs text-muted">{gpsError}</p> : null}
            </div>

            <SectionHeader title={SAVED_PLACE_TITLE} />
            {rowsForSearch.length > 0 ? (
              <div className="mt-3 space-y-2">
                {rowsForSearch.map((row, index) => (
                  <div key={row.key} style={rowStyle(index)}>
                    <SavedListRow
                      key={row.key}
                      icon={row.icon === "clock" ? <ClockIcon className="h-5 w-5" /> : <MapPinIcon className="h-5 w-5" />}
                      primary={row.primary}
                      secondary={row.secondary || undefined}
                      onClick={() => {
                        if (row.place) {
                          if (row.target === "dropoff") setDropoffPlace(row.place);
                          else setPickupPlace(row.place);
                        } else {
                          setSaveTarget(row.target);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted">Save a place to see it here.</p>
            )}

            <label className="mt-4 flex items-center justify-between rounded-[16px] border border-border bg-surface px-4 py-3">
              <span className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-brand" />
                <span className="text-sm font-semibold text-ink">Send a parcel</span>
              </span>
              <input
                type="checkbox"
                checked={parcelMode}
                onChange={(event) => {
                  setParcelMode(event.target.checked);
                  if (!event.target.checked) setWeightTier(null);
                  else showToast("Choose a parcel size below.");
                }}
              />
            </label>
            {parcelMode && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(["small", "medium", "large"] as WeightTier[]).map((tier) => (
                  <Chip key={tier} active={weightTier === tier} onClick={() => setWeightTier(tier)}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Chip>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {classList().map((entry) => (
                <Chip
                  key={entry.id}
                  active={rideClass === entry.id}
                  onClick={() => setRideClass(entry.id)}
                >
                  {entry.label}
                </Chip>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep("confirm")}
              disabled={!pickup || !dropoff}
              className="sticky bottom-20 z-30 mx-auto mt-5 block w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-50"
            >
              Find rides
            </button>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="mt-4 rounded-[16px] border border-border bg-surface p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-ink">{pickup ? pickup.addr : "--"}</p>
                <button type="button" onClick={() => setStep("search")} className="flex items-center gap-1 text-xs font-semibold text-brand">
                  <PencilIcon className="h-3 w-3" /> Edit
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink">{dropoff ? dropoff.addr : "--"}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <CarIcon className="h-4 w-4" /> {classList().find((entry) => entry.id === rideClass)?.label ?? rideClass}
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" /> ETA {etaMinutes === null ? "--" : `${etaMinutes} min`}
                </span>
                {parcelMode ? (
                  <span className="flex items-center gap-1">
                    <PackageIcon className="h-4 w-4" /> {weightTier ?? "size"}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-2xl font-bold text-ink">
                {fareEstimate === null ? "--" : moneyLabel(fareEstimate)}
              </p>
              <p className="text-xs text-muted">Estimated fare before confirmation.</p>
            </div>

            <div className="mt-3 flex gap-2">
              <Chip active={scheduleMode === "now"} onClick={() => setScheduleMode("now")}>
                Now
              </Chip>
              <Chip active={scheduleMode === "later"} onClick={() => setScheduleMode("later")}>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> {laterLabel}
                </span>
              </Chip>
            </div>
            {scheduleMode === "later" && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="rounded-[16px] border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Time
                  </span>
                  <input
                    type="time"
                    value={laterTime}
                    onChange={(event) => setLaterTime(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-ink"
                  />
                </label>
                <label className="rounded-[16px] border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Date
                  </span>
                  <input
                    type="date"
                    min={dateBounds?.min}
                    max={dateBounds?.max}
                    value={laterDate ?? ""}
                    onChange={(event) => setLaterDate(event.target.value)}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-ink"
                  />
                </label>
              </div>
            )}

            <NoteField
              label="Add a note"
              value={note}
              onChange={setNote}
              maxLength={150}
              placeholder="Gate code, luggage, or a stop along the way"
              className="mt-3"
            />

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-2 font-semibold text-brand">
                <ShieldCheckIcon className="h-3 w-3" /> Free wait {RIDE_FREE_WAIT_MINUTES} min
              </span>
              <span className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-2 font-semibold text-brand">
                <ShieldCheckIcon className="h-3 w-3" /> Free cancel {RIDE_CANCEL_WINDOW_MINUTES} min
              </span>
            </div>

            <PromiseStrip items={TRIP_PROMISES} />

            <button
              type="button"
              onClick={beginRide}
              className="sticky bottom-20 z-30 mx-auto mt-5 block w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Request driver
            </button>
          </>
        )}

        {step === "status" && activeBooking && (
          <>
            <section className="mt-4 rounded-[16px] border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-ink">{statusLabel(activeBooking)}</p>
              {activeBooking.status === "matching" && (
                <p className="mt-1 text-xs text-muted">Matching you with the closest driver.</p>
              )}
              {activeBooking.status === "canceled" && activeBooking.failureReason && (
                <p className="mt-1 text-xs text-muted">{FAILURE_COPY[activeBooking.failureReason] ?? FAILURE_COPY.changed_mind}</p>
              )}
              {(activeBooking.status === "assigned" || activeBooking.status === "arrived") && (
                <button
                  type="button"
                  onClick={() => setPinDismissedKey(null)}
                  className="mt-3 flex items-center gap-1 w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  <ShieldCheckIcon className="h-4 w-4" /> Show pickup code
                </button>
              )}
              {activeBooking.status === "in_trip" && (
                <button
                  type="button"
                  onClick={completeTrip}
                  className="mt-3 w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  Complete dropoff
                </button>
              )}
            </section>

            {activeBooking.status === "canceled" && (
              <section className="mt-3 rounded-[16px] border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {activeBooking.cancelFee > 0 ? `Cancellation fee ${moneyLabel(activeBooking.cancelFee)}` : "No cancellation fee."}
                  </div>
                  <button type="button" onClick={retryBooking} className="text-xs font-semibold text-brand">
                    Ride again
                  </button>
                </div>
              </section>
            )}

            {activeBooking.status !== "completed" && activeBooking.status !== "canceled" && (
              <section className="mt-3 flex items-center justify-between rounded-[16px] border border-border bg-surface px-4 py-3">
                <span className="text-sm text-ink">{moneyLabel(activeBooking.fare)} booked</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void shareRide()}
                    className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-2 text-xs font-semibold text-brand"
                  >
                    <ShareIcon className="h-4 w-4" /> Share
                  </button>
                  <button
                    type="button"
                    onClick={cancelRide}
                    className="flex items-center gap-1 rounded-full bg-brand-soft px-3 py-2 text-xs font-semibold text-brand"
                  >
                    <XIcon className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </section>
            )}

            {(activeBooking.status === "assigned" || activeBooking.status === "arrived" || activeBooking.status === "in_trip") && (
              <section className="mt-3 rounded-[16px] border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-ink">{activeBooking.driver || DRIVER_FALLBACK.name}</p>
                    <p className="text-xs text-muted">
                      {activeBooking.vehicle || DRIVER_FALLBACK.vehicle} · Plate {activeBooking.plate || DRIVER_FALLBACK.plate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => showToast("Driver calls aren't available yet.")}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand"
                      aria-label="Call driver"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast("Driver chat isn't available yet.")}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand"
                      aria-label="Message driver"
                    >
                      <MessageIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDestinationOpen(true)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand"
                >
                  <PencilIcon className="h-4 w-4" /> Change destination
                </button>
              </section>
            )}

            {activeBooking.status === "completed" && (
              <section className="mt-3 rounded-[16px] border border-border bg-surface p-4">
                <p className="text-sm font-bold text-ink">Trip completed</p>
                <p className="mt-1 text-xs text-muted">
                  {activeBooking.pickup} → {activeBooking.dropoff}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">Fare</span>
                  <span className="font-semibold text-ink">{moneyLabel(activeBooking.fare)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Wait fee</span>
                  <span className="font-semibold text-ink">{moneyLabel(activeBooking.waitFee)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted">Tip {activeBooking.tipPercent}%</span>
                  <span className="font-semibold text-ink">{moneyLabel(safeTipAmount(activeBooking, activeBooking.tipPercent))}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-bold text-ink">{moneyLabel(safeTotal(activeBooking))}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {TIP_CHIPS.map((chip) => (
                    <Chip
                      key={chip}
                      active={tipPercent === chip}
                      onClick={() => setTipPercent(chip)}
                    >
                      {chip === 0 ? "No tip" : `${chip}%`}
                    </Chip>
                  ))}
                </div>
                <div className="mt-3 flex gap-1">
                  {RATING_VALUES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="text-xl"
                      aria-label={`Rate ${value} stars`}
                    >
                      <StarIcon className={value <= rating ? "h-6 w-6 text-amber-400" : "h-6 w-6 text-muted"} />
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button type="button" onClick={retryBooking} className="text-xs font-semibold text-brand">
                    Ride again
                  </button>
                  <button
                    type="button"
                    onClick={submitRating}
                    className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-strong"
                  >
                    Send rating
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {saveTarget && (
        <section className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <SectionHeader title={saveTarget === "pickup" ? PICKUP_PROMPT : CHOOSE_PLACE_TITLE} />
            <button type="button" onClick={() => setSaveTarget(null)} aria-label="Close">
              <XIcon className="h-5 w-5 text-muted" />
            </button>
          </div>
          <LocationSearch
            label={saveTarget === "pickup" ? "Pickup" : "Dropoff"}
            placeholder={saveTarget === "pickup" ? PICKUP_PROMPT : DROPOFF_PROMPT}
            showGps={saveTarget === "pickup"}
            popular={popular.map((place) => place.addr)}
            onPick={(value) => {
              const target = saveTarget;
              void (target ? commitPlace(value, target) : Promise.resolve());
            }}
            value={saveTarget === "pickup" ? (pickup?.addr ?? null) : (dropoff?.addr ?? null)}
          />
        </section>
      )}

      {destinationOpen && (
        <section className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <SectionHeader title={CHOOSE_PLACE_TITLE} />
            <button type="button" onClick={() => setDestinationOpen(false)} aria-label="Close">
              <XIcon className="h-5 w-5 text-muted" />
            </button>
          </div>
          <LocationSearch
            label="Dropoff"
            placeholder={DROPOFF_PROMPT}
            showGps={false}
            popular={popular.map((place) => place.addr)}
            onPick={(value) => {
              void changeDestination(value);
            }}
            value={activeBooking?.dropoff ?? null}
          />
        </section>
      )}

      {activeBooking && (activeBooking.status === "assigned" || activeBooking.status === "arrived" || activeBooking.status === "in_trip") && (
        <PinCodeSheet
          booking={activeBooking}
          open={pinOpen}
          step="code"
          mode="start"
          attemptsLeft={Math.max(0, PIN_STRIKE_LIMIT - activeBooking.pinAttempts)}
          onDismiss={dismissPin}
          onPinSuccess={verifyPin}
          onWrongAttempt={pinWrongAttempt}
          onCompleteTrip={completeTrip}
          onFailHandoff={pinFailHandoff}
        />
      )}

      {toast && (
        <div className="fixed inset-x-6 bottom-24 z-40 rounded-[16px] bg-surface px-4 py-3 text-center text-sm font-semibold text-ink shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {toast}
        </div>
      )}
    </div>
  );
}
