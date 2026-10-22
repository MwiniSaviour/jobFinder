import Link from "next/link";
import type { CSSProperties } from "react";
import { Greeting } from "../components/Greeting";
import { HeroCarousel } from "../components/HeroCarousel";
import { SectionHeader } from "../components/SectionHeader";
import { ServiceFilter, type HomeService } from "../components/ServiceFilter";
import {
  BriefcaseIcon,
  CarIcon,
  SlidersIcon,
  StarIcon,
  UserIcon,
  WrenchIcon,
} from "../components/Icons";
import { jobs, salaryLabel } from "../lib/jobs";
import { SERVICE_LISTINGS } from "../lib/services";

const homeServices: HomeService[] = SERVICE_LISTINGS.map((service) => ({
  id: service.id,
  name: service.name,
  category: service.category,
  price: service.priceLabel,
  duration: service.duration,
}));

const PAGE_TITLE = "What do you need today?";
const PAGE_SUBTITLE =
  "Jobs, home services, and rides with upfront pricing — pick where to start.";
const SEARCH_PLACEHOLDER = "Search jobs";
const SEARCH_INPUT_LABEL = "Search jobs";
const SEARCH_BUTTON_LABEL = "Search";
const JOBS_HEADER = "Featured jobs";
const SERVICES_HEADER = "Top services near you";
const TILE_JOB_LABEL = "Find a job";
const TILE_JOB_SUB = `${jobs.length} open jobs`;
const TILE_SERVICE_LABEL = "Hire a pro";
const TILE_SERVICE_SUB = `${homeServices.length} top services`;
const TILE_RIDE_LABEL = "Book a ride";
const TILE_RIDE_SUB = "5 rides posted · from $10";

const featuredJobs = jobs
  .filter((job) => job.salary !== null)
  .slice(0, 3);

const heroDelay = (ms: number): CSSProperties =>
  ({ "--hero-delay": `${ms}ms` }) as CSSProperties;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Greeting />
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {PAGE_TITLE}
          </h1>
          <p className="mt-2 text-[15px] text-muted">{PAGE_SUBTITLE}</p>
        </div>
        <Link
          href="/profile"
          aria-label="Your profile"
          title="Your profile"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-brand-soft text-brand"
        >
          <UserIcon className="size-5" />
        </Link>
      </div>

      <div className="hero-rise" style={heroDelay(0)}>
        <HeroCarousel />
      </div>

      <form action="/jobs" method="get" className="flex gap-2.5">
        <input
          type="search"
          name="q"
          placeholder={SEARCH_PLACEHOLDER}
          aria-label={SEARCH_INPUT_LABEL}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-muted focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          aria-label={SEARCH_BUTTON_LABEL}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong"
        >
          <SlidersIcon className="size-5" />
        </button>
      </form>

      <div className="hero-rise grid grid-cols-3 gap-3" style={heroDelay(80)}>
        <Link
          href="/jobs"
          className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-shadow hover:shadow-hover"
        >
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
            <BriefcaseIcon className="size-6" />
          </span>
          <span className="mt-2.5 block text-[13px] font-semibold text-foreground">
            {TILE_JOB_LABEL}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted">
            {TILE_JOB_SUB}
          </span>
        </Link>
        <Link
          href="/services"
          className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-shadow hover:shadow-hover"
        >
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
            <WrenchIcon className="size-6" />
          </span>
          <span className="mt-2.5 block text-[13px] font-semibold text-foreground">
            {TILE_SERVICE_LABEL}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted">
            {TILE_SERVICE_SUB}
          </span>
        </Link>
        <Link
          href="/rides"
          className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-shadow hover:shadow-hover"
        >
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
            <CarIcon className="size-6" />
          </span>
          <span className="mt-2.5 block text-[13px] font-semibold text-foreground">
            {TILE_RIDE_LABEL}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted">
            {TILE_RIDE_SUB}
          </span>
        </Link>
      </div>

      <section className="hero-rise space-y-3" style={heroDelay(160)}>
        <SectionHeader title={JOBS_HEADER} action={{ href: "/jobs" }} />
        <div className="space-y-3">
          {featuredJobs.map((job) => (
            <Link
              key={job.id}
              href="/jobs"
              className="block rounded-[16px] border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 text-[15px] font-semibold text-foreground">
                  {job.title}
                </h3>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
                  {salaryLabel(job.salary)}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {job.company} · {job.location}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {job.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <StarIcon className="size-3.5 text-accent" />
                  <span className="text-[13px] font-semibold text-foreground">
                    {job.rating}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="hero-rise space-y-3" style={heroDelay(240)}>
        <SectionHeader title={SERVICES_HEADER} action={{ href: "/services" }} />
        <ServiceFilter services={homeServices} />
      </section>
    </main>
  );
}
