import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
};

type ServiceListing = {
  id: number;
  name: string;
  category: string;
  price: string;
  duration: string;
  blurb: string;
};

const services: ServiceListing[] = [
  {
    id: 1,
    name: "Deep House Cleaning",
    category: "Home",
    price: "$95 flat",
    duration: "3-4 hours",
    blurb:
      "Whole-home kitchen, bath, and floor cleaning by a background-checked pro.",
  },
  {
    id: 2,
    name: "Appliance Repair",
    category: "Repair",
    price: "$60+",
    duration: "1-2 hours",
    blurb: "Diagnose and fix washers, dryers, and ovens on-site at your home.",
  },
  {
    id: 3,
    name: "Bike Tune-Up",
    category: "Maintenance",
    price: "$40",
    duration: "1 hour",
    blurb: "Brakes, gears, and tires adjusted and road-ready within the hour.",
  },
  {
    id: 4,
    name: "IT Home Visit",
    category: "Tech",
    price: "$75",
    duration: "2 hours",
    blurb:
      "Wi-Fi, smart TV, and laptop setup with no-jargon troubleshooting for each device.",
  },
  {
    id: 5,
    name: "Moving Help",
    category: "Moving",
    price: "$25/hr",
    duration: "2+ hours",
    blurb: "Two movers for loading, unloading, or room-to-room rearranging.",
  },
  {
    id: 6,
    name: "Dog Walking",
    category: "Pet",
    price: "$20",
    duration: "30 minutes",
    blurb: "Neighborhood walks with photo updates and a fresh water bowl.",
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">Book a service</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Trusted local pros for home, tech, and everyday tasks — with rates and
        time estimates shown up front.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id} className="card">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold">{service.name}</h2>
              <span className="rounded-pill bg-brand-soft px-2.5 py-0.5 text-xs text-brand">
                {service.category}
              </span>
            </div>
            <p className="mt-3 text-sm">
              <span className="font-semibold text-brand">{service.price}</span>
              <span className="text-muted"> · {service.duration}</span>
            </p>
            <p className="mt-2 text-sm">{service.blurb}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
