import type { Metadata } from "next";
import { ActivityClient } from "../../components/ActivityClient";
import { ClipboardIcon } from "../../components/Icons";

export const metadata: Metadata = {
  title: "Your activity — JobFinder",
};

const PAGE_TITLE = "Your activity";
const PAGE_SUB = "Applications, bookings, and rides in one place.";

export default function ActivityPage() {
  return (
    <main className="mx-auto max-w-lg space-y-8 px-5 pb-10 pt-6">
      <div className="hero-rise flex items-center gap-3.5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-brand-soft">
          <ClipboardIcon className="h-6 w-6 text-brand" />
        </span>
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {PAGE_TITLE}
          </h1>
          <p className="mt-1 text-[13px] text-muted">{PAGE_SUB}</p>
        </div>
      </div>
      <ActivityClient />
    </main>
  );
}
