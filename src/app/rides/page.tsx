import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CategoryTile } from "../../components/CategoryTile";

export const metadata: Metadata = {
  title: "Rides",
};

const PAGE_TITLE = "Book a ride";
const PAGE_SUB =
  "Scheduled rides with local drivers across the metro. Prices and open seats are posted with each route.";

type RideListing = {
  id: number;
  from: string;
  to: string;
  day: string;
  time: string;
  driver: string;
  price: string;
  seats: string;
};

const rides: RideListing[] = [
  {
    id: 1,
    from: "Riverside",
    to: "City Center",
    day: "Fridays",
    time: "7:30 AM",
    driver: "Dana K.",
    price: "$12",
    seats: "2 seats left",
  },
  {
    id: 2,
    from: "City Center",
    to: "Airport",
    day: "Saturdays",
    time: "5:00 AM",
    driver: "Miguel R.",
    price: "$22",
    seats: "1 seat left",
  },
  {
    id: 3,
    from: "College Hill",
    to: "Dev District",
    day: "Weekdays",
    time: "8:15 AM",
    driver: "Priya S.",
    price: "$10",
    seats: "3 seats left",
  },
  {
    id: 4,
    from: "Dev District",
    to: "College Hill",
    day: "Weekdays",
    time: "6:30 PM",
    driver: "Priya S.",
    price: "$10",
    seats: "3 seats left",
  },
  {
    id: 5,
    from: "Downtown",
    to: "Riverside",
    day: "Sundays",
    time: "9:00 AM",
    driver: "Elena V.",
    price: "$14",
    seats: "2 seats left",
  },
];

const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

export default function RidesPage() {
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="hero-rise">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {PAGE_TITLE}
        </h1>
        <p className="mt-2 text-[15px] text-muted">{PAGE_SUB}</p>
      </div>
      <ul className="space-y-2.5">
        {rides.map((ride, index) => (
          <li key={ride.id} className="hero-rise" style={rowDelay(index)}>
            <article className="flex items-center gap-3.5 rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover">
              <CategoryTile category={ride.to} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">
                  {`${ride.from} → ${ride.to}`}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-muted">
                  {`${ride.day} · ${ride.time}`}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-muted">
                  {`Driver ${ride.driver}`}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[15px] font-semibold">{ride.price}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted">
                  {ride.seats}
                </span>
              </span>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
