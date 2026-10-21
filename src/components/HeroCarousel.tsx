"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { BriefcaseIcon, CarIcon, WrenchIcon } from "./Icons";

type Slide = {
  title: string;
  sub: string;
  cta: string;
  href: string;
  bg: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const SLIDES: Slide[] = [
  {
    title: "Book a ride",
    sub: "From $6.00 · ~3 min away. Fare shown upfront, always.",
    cta: "Get started",
    href: "/rides",
    bg: "bg-[radial-gradient(130%_150%_at_88%_-10%,#0891b2_0%,#0e7490_48%,#155e75_100%)]",
    Icon: CarIcon,
  },
  {
    title: "Find a pro",
    sub: "Vetted local pros for home errands — rates shown up front.",
    cta: "Browse services",
    href: "/services",
    bg: "bg-[radial-gradient(130%_150%_at_12%_-10%,#0e7490_0%,#155e75_50%,#083344_100%)]",
    Icon: WrenchIcon,
  },
  {
    title: "Find work nearby",
    sub: "Gigs and part-time jobs with pay listed upfront.",
    cta: "Browse jobs",
    href: "/jobs",
    bg: "bg-[linear-gradient(120deg,#155e75_0%,#0e7490_55%,#0891b2_100%)]",
    Icon: BriefcaseIcon,
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const row = scrollRef.current;
    if (!row) return;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < row.children.length; i += 1) {
      const child = row.children[i];
      if (!(child instanceof HTMLElement)) continue;
      const offset = Math.abs(row.scrollLeft - child.offsetLeft);
      if (offset < distance) {
        distance = offset;
        nearest = i;
      }
    }
    if (nearest !== index) setIndex(nearest);
  }

  function scrollToIndex(target: number) {
    const row = scrollRef.current;
    if (!row) return;
    const slideEl = row.children[target];
    if (slideEl instanceof HTMLElement) {
      row.scrollTo({ left: slideEl.offsetLeft, behavior: "smooth" });
    }
  }

  return (
    <section aria-label="Featured actions" className="hero-rise relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5"
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.href}
            className={`relative h-[168px] w-full shrink-0 snap-center overflow-hidden rounded-[22px] ${slide.bg}`}
          >
            <slide.Icon
              className="pointer-events-none absolute -right-5 -top-6 h-36 w-36 text-white opacity-20"
              aria-hidden
            />
            <div className="relative z-10 flex h-full flex-col justify-end gap-2 p-5">
              <h2 className="text-xl font-semibold text-white">{slide.title}</h2>
              <p className="text-[13px] leading-snug text-white">{slide.sub}</p>
              <Link
                href={slide.href}
                className="inline-flex w-fit items-center rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-brand"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-5 z-10 flex gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.href}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`pointer-events-auto ${
              i === index ? "h-2 w-5 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
