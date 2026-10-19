import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rides",
};

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

export default function RidesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">Book a ride</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Scheduled rides with local drivers across the metro. Prices and open
        seats are posted with each route.
      </p>
      <ul className="mt-8 space-y-4">
        {rides.map((ride) => (
          <li
            key={ride.id}
            className="card flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <h2 className="text-base font-semibold">
                {ride.from} → {ride.to}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {ride.day} · {ride.time}
              </p>
              <p className="text-sm text-muted">Driver {ride.driver}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-brand">{ride.price}</p>
              <p className="text-xs text-muted">{ride.seats}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
