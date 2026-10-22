import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ApplicationsList } from "../../components/ApplicationsList";
import { BookingsList } from "../../components/BookingsList";
import { ChevronRightIcon, UserIcon } from "../../components/Icons";
import { RidesList } from "../../components/RidesList";
import { SectionHeader } from "../../components/SectionHeader";

export const metadata: Metadata = {
  title: "Your profile — JobFinder",
};

const PAGE_TITLE = "Your profile";
const PAGE_SUB =
  "Your applications, bookings, and rides stay on this device until you sign in.";
const APPLICATIONS_TITLE = "Applications";
const BOOKINGS_TITLE = "Bookings";
const RIDES_TITLE = "Rides";
const HOME_LABEL = "Back to home";
const HOME_HREF = "/";
const SECTION_STAGGER_MS = 80;

function sectionDelay(offset: number): CSSProperties {
  return {
    "--hero-delay": `${offset * SECTION_STAGGER_MS}ms`,
  } as CSSProperties;
}

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="hero-rise flex items-center gap-3.5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-brand-soft">
          <UserIcon className="h-6 w-6 text-brand" />
        </span>
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {PAGE_TITLE}
          </h1>
          <p className="mt-1 text-[13px] text-muted">{PAGE_SUB}</p>
        </div>
      </div>
      <section className="hero-rise" style={sectionDelay(1)}>
        <SectionHeader title={APPLICATIONS_TITLE} />
        <ApplicationsList />
      </section>
      <section className="hero-rise" style={sectionDelay(2)}>
        <SectionHeader title={BOOKINGS_TITLE} />
        <BookingsList />
      </section>
      <section className="hero-rise" style={sectionDelay(3)}>
        <SectionHeader title={RIDES_TITLE} />
        <RidesList />
      </section>
      <section className="hero-rise" style={sectionDelay(4)}>
        <div className="divide-y divide-border overflow-hidden rounded-[16px] border border-border shadow-card">
          <Link
            href={HOME_HREF}
            className="flex items-center justify-between gap-3 p-4 text-[15px] font-medium transition-colors hover:bg-surface-alt/60"
          >
            {HOME_LABEL}
            <ChevronRightIcon className="h-4 w-4 text-muted" />
          </Link>
        </div>
      </section>
    </main>
  );
}
