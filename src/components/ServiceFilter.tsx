"use client";

import Link from "next/link";
import { useState } from "react";
import { chipClass } from "./Chip";
import { ChipRow } from "./FilterChips";
import { CategoryTile } from "./CategoryTile";

export type HomeService = {
  id: number;
  name: string;
  category: string;
  price: string;
  duration: string;
  [key: string]: unknown;
};

const ALL_LABEL = "All";

export function ServiceFilter({ services }: { services: HomeService[] }) {
  const [category, setCategory] = useState(ALL_LABEL);
  const categories = [
    ALL_LABEL,
    ...Array.from(new Set(services.map((service) => service.category))),
  ];
  const shown =
    category === ALL_LABEL
      ? services
      : services.filter((service) => service.category === category);

  return (
    <div className="space-y-3">
      <ChipRow label="Service categories">
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
            className={chipClass(category === name ? "active" : "idle")}
          >
            {name}
          </button>
        ))}
      </ChipRow>
      <ul className="space-y-3">
        {shown.map((service) => (
          <li key={service.id}>
            <Link
              href={`/services?category=${encodeURIComponent(service.category)}`}
              className="flex items-center gap-3.5 rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <CategoryTile category={service.category} />
              <span className="min-w-0 flex-1">
                <span className="inline-flex w-fit rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {service.category}
                </span>
                <span className="mt-1 block truncate text-[15px] font-semibold text-foreground">
                  {service.name}
                </span>
                <span className="mt-0.5 block text-[13px] text-muted">
                  {service.duration}
                </span>
              </span>
              <span className="shrink-0 text-[15px] font-semibold text-foreground">
                {service.price}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
