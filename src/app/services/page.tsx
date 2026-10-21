import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CategoryTile } from "../../components/CategoryTile";
import { TrustBadge } from "../../components/TrustBadge";

export const metadata: Metadata = {
  title: "Services",
};

const PAGE_TITLE = "Book a service";
const PAGE_SUB =
  "Trusted local pros for home, tech, and everyday tasks — with rates and time estimates shown up front.";

type ServiceListing = {
  id: number;
  name: string;
  category: string;
  price: string;
  duration: string;
};

const services: ServiceListing[] = [
  {
    id: 1,
    name: "Deep House Cleaning",
    category: "Home",
    price: "$95 flat",
    duration: "3-4 hours",
  },
  {
    id: 2,
    name: "Appliance Repair",
    category: "Repair",
    price: "$60+",
    duration: "1-2 hours",
  },
  {
    id: 3,
    name: "Bike Tune-Up",
    category: "Maintenance",
    price: "$40",
    duration: "1 hour",
  },
  {
    id: 4,
    name: "IT Home Visit",
    category: "Tech",
    price: "$75",
    duration: "2 hours",
  },
  {
    id: 5,
    name: "Moving Help",
    category: "Moving",
    price: "$25/hr",
    duration: "2+ hours",
  },
  {
    id: 6,
    name: "Dog Walking",
    category: "Pet",
    price: "$20",
    duration: "30 minutes",
  },
];

const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="hero-rise">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          {PAGE_TITLE}
        </h1>
        <p className="mt-2 text-[15px] text-muted">{PAGE_SUB}</p>
      </div>
      <ul className="space-y-2.5">
        {services.map((service, index) => (
          <li key={service.id} className="hero-rise" style={rowDelay(index)}>
            <article className="flex items-center gap-3.5 rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover">
              <CategoryTile category={service.category} />
              <span className="min-w-0 flex-1">
                <span className="block w-fit rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {service.category}
                </span>
                <span className="mt-1.5 block truncate text-[15px] font-semibold">
                  {service.name}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-muted">
                  {service.duration}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[15px] font-semibold">
                  {service.price}
                </span>
                <TrustBadge />
              </span>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
