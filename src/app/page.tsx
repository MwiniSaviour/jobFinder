import Link from "next/link";
import type { CSSProperties } from "react";
import { Greeting } from "../components/Greeting";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CarIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchIcon,
} from "../components/Icons";

const heroDelay = (ms: number): CSSProperties =>
  ({ "--hero-delay": `${ms}ms` }) as CSSProperties;

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5">
      <div className="flex items-center justify-between pt-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-brand shadow-card">
            <SendIcon className="size-[18px] text-white" />
          </span>
          <span className="text-[17px] font-bold tracking-tight">JobFinder</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/jobs"
            aria-label="Search jobs and services"
            className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
          >
            <SearchIcon className="size-5" />
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-alt hover:text-foreground"
          >
            <UserIcon className="size-5" />
          </Link>
        </div>
      </div>

      <section className="mt-12">
        <div className="hero-rise" style={heroDelay(0)}>
          <Greeting />
        </div>
        <h1
          className="hero-rise mt-2 text-balance text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.02em]"
          style={heroDelay(80)}
        >
          What do you need today?
        </h1>
        <p className="hero-rise mt-3 text-[15px] text-muted" style={heroDelay(160)}>
          Jobs, home services, and rides with upfront pricing — pick where to start.
        </p>

        <Link
          href="/rides"
          style={heroDelay(240)}
          className="hero-rise group mt-9 flex items-center justify-between rounded-[20px] bg-brand p-5 text-white shadow-raised transition-colors hover:bg-brand-strong active:scale-[0.99]"
        >
          <span>
            <span className="block font-semibold">Book a ride</span>
            <span className="mt-0.5 block text-[13px] text-white">From $6.00 · ~3 min away</span>
          </span>
          <span className="grid size-11 place-items-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25">
            <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/services"
          style={heroDelay(320)}
          className="hero-rise mt-3 flex items-center justify-between rounded-pill border border-border bg-surface px-5 py-3 shadow-card transition-shadow hover:border-brand/40 hover:shadow-hover"
        >
          <span>
            <span className="block font-semibold">Find a pro</span>
            <span className="mt-0.5 block text-[13px] text-muted">Vetted for your home errands</span>
          </span>
          <ArrowRightIcon className="size-4 text-muted" />
        </Link>

        <div className="hero-rise mt-8 flex flex-wrap gap-2" style={heroDelay(400)}>
          <Link
            href="/services"
            className="flex h-9 items-center gap-1.5 rounded-full bg-surface-alt px-3.5 text-[13px] font-medium transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <WrenchIcon className="size-4" />
            Services
          </Link>
          <Link
            href="/jobs"
            className="flex h-9 items-center gap-1.5 rounded-full bg-surface-alt px-3.5 text-[13px] font-medium transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <BriefcaseIcon className="size-4" />
            Jobs
          </Link>
        </div>
      </section>

      <section className="mt-10 pb-12">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Trending near you
        </h2>

        <Link
          href="/jobs"
          className="group mt-3 block rounded-[20px] bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-[15px] font-bold text-brand">
              FS
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">Fjord Studio</span>
              <span className="block text-[13px] text-muted">Part-time · Hybrid · Lisbon</span>
            </span>
          </div>
          <p className="mt-3 text-[14px] text-muted">UX designer for a growing product team.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[13px] text-muted">
              <span className="text-[17px] font-semibold tabular-nums text-brand">$19/hr</span> est.
            </span>
            <span className="rounded-pill bg-brand-soft px-3 py-1.5 text-[12.5px] font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              Apply
            </span>
          </div>
        </Link>

        <Link
          href="/services"
          className="group mt-3 block rounded-[20px] border border-brand/15 bg-brand-soft p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-card">
              <WrenchIcon className="size-5 text-brand" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">Everyday home help</span>
              <span className="block text-[13px] text-muted">Plumbing · Assembly · Moving</span>
            </span>
          </div>
          <p className="mt-3 text-[14px] text-muted">Handyman, deep cleaning, and more.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-brand">
              <ShieldCheckIcon className="size-4" />
              Background-checked
            </span>
            <span className="rounded-pill bg-white px-3 py-1.5 text-[12.5px] font-semibold shadow-card">
              From $45
            </span>
          </div>
        </Link>

        <Link
          href="/rides"
          className="group mt-3 block rounded-[20px] border border-border bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-alt">
              <CarIcon className="size-5 text-brand" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">Need a ride later?</span>
              <span className="block text-[13px] text-muted">Fare shown upfront, always</span>
            </span>
          </div>
          <p className="mt-3 text-[14px] text-muted">Reserve a pickup up to 90 days ahead.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[17px] font-semibold tabular-nums text-brand">From $6.00</span>
            <span className="rounded-pill bg-surface-alt px-3 py-1.5 text-[12.5px] font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              Reserve
            </span>
          </div>
        </Link>
      </section>
    </main>
  );
}
