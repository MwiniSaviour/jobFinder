export type RideClass = "Economy" | "Comfort" | "SUV";

export type RideDay = "Weekday" | "Friday" | "Saturday" | "Sunday";

export type RideOption = {
  id: string;
  driver: string;
  fare: number;
  etaMinutes: number;
  seatsLeft: number;
  classes: RideClass[];
};

export type RideRoute = {
  id: number;
  from: string;
  to: string;
  day: RideDay;
  dayLabel: string;
  time: string;
  options: RideOption[];
};

export type RideQuote = {
  option: RideOption;
  fare: number;
};

export const RIDE_CLASSES: RideClass[] = ["Economy", "Comfort", "SUV"];

export const RIDE_DAYS: RideDay[] = ["Weekday", "Friday", "Saturday", "Sunday"];

export const DAY_LABEL: Record<RideDay, string> = {
  Weekday: "Weekdays",
  Friday: "Fridays",
  Saturday: "Saturdays",
  Sunday: "Sundays",
};

export const RIDE_ROUTES: RideRoute[] = [
  {
    id: 1,
    from: "Riverside",
    to: "City Center",
    day: "Friday",
    dayLabel: "Fridays",
    time: "7:30 AM",
    options: [
      {
        id: "r1-dana",
        driver: "Dana K.",
        fare: 12,
        etaMinutes: 6,
        seatsLeft: 2,
        classes: ["Economy", "Comfort"],
      },
      {
        id: "r1-sam",
        driver: "Sam T.",
        fare: 10,
        etaMinutes: 11,
        seatsLeft: 1,
        classes: ["Economy"],
      },
    ],
  },
  {
    id: 2,
    from: "City Center",
    to: "Airport",
    day: "Saturday",
    dayLabel: "Saturdays",
    time: "5:00 AM",
    options: [
      {
        id: "r2-miguel",
        driver: "Miguel R.",
        fare: 22,
        etaMinutes: 4,
        seatsLeft: 1,
        classes: ["Economy", "Comfort", "SUV"],
      },
      {
        id: "r2-nina",
        driver: "Nina P.",
        fare: 20,
        etaMinutes: 9,
        seatsLeft: 3,
        classes: ["Economy", "Comfort"],
      },
    ],
  },
  {
    id: 3,
    from: "College Hill",
    to: "Dev District",
    day: "Weekday",
    dayLabel: "Weekdays",
    time: "8:15 AM",
    options: [
      {
        id: "r3-priya",
        driver: "Priya S.",
        fare: 10,
        etaMinutes: 5,
        seatsLeft: 3,
        classes: ["Economy", "Comfort", "SUV"],
      },
      {
        id: "r3-leo",
        driver: "Leo M.",
        fare: 9,
        etaMinutes: 8,
        seatsLeft: 2,
        classes: ["Economy"],
      },
    ],
  },
  {
    id: 4,
    from: "Dev District",
    to: "College Hill",
    day: "Weekday",
    dayLabel: "Weekdays",
    time: "6:30 PM",
    options: [
      {
        id: "r4-priya",
        driver: "Priya S.",
        fare: 10,
        etaMinutes: 7,
        seatsLeft: 3,
        classes: ["Economy", "Comfort"],
      },
      {
        id: "r4-leo",
        driver: "Leo M.",
        fare: 9,
        etaMinutes: 10,
        seatsLeft: 2,
        classes: ["Economy"],
      },
    ],
  },
  {
    id: 5,
    from: "Downtown",
    to: "Riverside",
    day: "Sunday",
    dayLabel: "Sundays",
    time: "9:00 AM",
    options: [
      {
        id: "r5-elena",
        driver: "Elena V.",
        fare: 14,
        etaMinutes: 6,
        seatsLeft: 2,
        classes: ["Economy", "Comfort", "SUV"],
      },
      {
        id: "r5-tara",
        driver: "Tara B.",
        fare: 12,
        etaMinutes: 12,
        seatsLeft: 1,
        classes: ["Economy"],
      },
    ],
  },
];

export const KNOWN_PLACES: string[] = Array.from(
  new Set(RIDE_ROUTES.flatMap((route) => [route.from, route.to])),
);

export const RESERVE_MAX_DAYS = 90;

export function rideDayForDate(value: Date): RideDay {
  const weekday = value.getDay();
  if (weekday === 5) return "Friday";
  if (weekday === 6) return "Saturday";
  if (weekday === 0) return "Sunday";
  return "Weekday";
}

export function reserveDateBounds(now: Date = new Date()): { min: string; max: string } {
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const max = new Date(min.getTime());
  max.setDate(max.getDate() + RESERVE_MAX_DAYS);
  return { min: toDateInput(min), max: toDateInput(max) };
}

export function toDateInput(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatRideDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const CLASS_MULTIPLIER: Record<RideClass, number> = {
  Economy: 1,
  Comfort: 1.3,
  SUV: 1.7,
};

const CLASS_VEHICLE: Record<RideClass, { name: string; plate: string }> = {
  Economy: { name: "Silver Honda Civic", plate: "7KJD382" },
  Comfort: { name: "Black Toyota Camry", plate: "4TRG118" },
  SUV: { name: "White Subaru Outback", plate: "9WQD204" },
};

export function vehicleFor(rideClass: RideClass): { name: string; plate: string } {
  return CLASS_VEHICLE[rideClass];
}

export function fareFor(option: RideOption, rideClass: RideClass): number {
  return Math.round(option.fare * CLASS_MULTIPLIER[rideClass]);
}

export function normalizePlace(value: string): string {
  return value.trim().toLowerCase();
}

export function isKnownPlace(value: string): boolean {
  const normalized = normalizePlace(value);
  if (!normalized) return false;
  return KNOWN_PLACES.some((place) => normalizePlace(place) === normalized);
}

export function findRoute(from: string, to: string, day: RideDay): RideRoute | undefined {
  const fromKey = normalizePlace(from);
  const toKey = normalizePlace(to);
  return RIDE_ROUTES.find(
    (route) =>
      route.day === day &&
      normalizePlace(route.from) === fromKey &&
      normalizePlace(route.to) === toKey,
  );
}

export function classOptions(route: RideRoute, rideClass: RideClass): RideOption[] {
  return route.options.filter((option) => option.classes.includes(rideClass));
}

export function maxSeatsFor(route: RideRoute, rideClass: RideClass): number {
  return classOptions(route, rideClass).reduce(
    (best, option) => Math.max(best, option.seatsLeft),
    0,
  );
}

export function quoteOptions(
  route: RideRoute,
  rideClass: RideClass,
  seats: number,
): RideQuote[] {
  const quotes = classOptions(route, rideClass)
    .filter((option) => option.seatsLeft >= seats)
    .map((option) => ({ option, fare: fareFor(option, rideClass) }));
  if (quotes.length === 0) return [];
  const byFare = [...quotes].sort(
    (a, b) => a.fare - b.fare || a.option.etaMinutes - b.option.etaMinutes,
  );
  const cheapest = byFare[0];
  const fastest = byFare.reduce((best, quote) =>
    quote.option.etaMinutes < best.option.etaMinutes ? quote : best,
  );
  if (fastest.option.etaMinutes <= cheapest.option.etaMinutes - 2) {
    return [...byFare].sort(
      (a, b) => a.option.etaMinutes - b.option.etaMinutes || a.fare - b.fare,
    );
  }
  return byFare;
}

export function alternativeClass(
  route: RideRoute,
  rideClass: RideClass,
): { rideClass: RideClass; etaMinutes: number } | null {
  for (const candidate of RIDE_CLASSES) {
    if (candidate === rideClass) continue;
    const options = classOptions(route, candidate);
    if (options.length === 0) continue;
    const fastest = options.reduce((best, option) =>
      option.etaMinutes < best.etaMinutes ? option : best,
    );
    return { rideClass: candidate, etaMinutes: fastest.etaMinutes };
  }
  return null;
}
