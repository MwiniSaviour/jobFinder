"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useSaved } from "@/components/ui/saved-context";
import { JobCard } from "@/components/jobs/job-card";
import { ButtonLink } from "@/components/ui/button";
import { getJob } from "@/data/jobs";
import { useToast } from "@/components/ui/toast";

export function SavedView() {
  const { saved } = useSaved();
  const { toast } = useToast();

  const jobs = [...saved]
    .map((key) => {
      const [company, slug] = key.split("/");
      return getJob(company, slug);
    })
    .filter((job): job is NonNullable<typeof job> => Boolean(job));

  return (
    <>
      <section className="border-b border-line bg-cream/30">
        <div className="container-x pb-8 pt-9 lg:pt-11">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                Your shortlist
              </p>
              <h1 className="display mt-4 text-[clamp(2.2rem,4vw,3rem)] leading-[1.02] text-ink">
                Saved for <em className="italic">later</em>.
              </h1>
              <p className="mt-2.5 max-w-lg text-[13px] leading-relaxed text-stone">
                The roles that caught your eye. Take your time — we&apos;ll flag
                anything that changes, and quietly close the ones that do.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ButtonLink href="/jobs" variant="outline" size="sm">
                <Search className="h-3.5 w-3.5" />
                Browse roles
              </ButtonLink>
              <ButtonLink href="/dashboard" size="sm">
                Your applications
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-8 lg:py-10">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <p className="text-[12px] text-stone">
            <span className="font-medium text-ink">{jobs.length}</span>{" "}
            {jobs.length === 1 ? "role" : "roles"} saved
          </p>
          <div className="flex items-center gap-4 text-[11.5px] text-stone">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Bell className="h-3.5 w-3.5" />
              Alerts on for changes
            </span>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Saved view refreshed",
                  description: "Everything is up to date.",
                })
              }
              className="inline-flex items-center gap-1.5 transition hover:text-ink"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>

        {jobs.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={`${job.company}-${job.slug}`} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-paper-raised/50 px-6 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream">
              <Bookmark className="h-5 w-5 text-stone" />
            </div>
            <h2 className="display mt-5 text-[24px] text-ink">
              An empty shortlist, for now
            </h2>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-stone">
              Tap the bookmark on any role worth a second look. We&apos;ll keep
              it here, and keep you posted on changes.
            </p>
            <ButtonLink href="/jobs" size="sm" className="mt-6">
              Find something worth saving
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                Saved searches
              </p>
              <h2 className="display mt-3 text-[23px] text-ink">
                Your standing brief
              </h2>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-paper-raised p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-medium text-ink">
                Senior product design · remote · $110k+
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Product design", "Remote", "Senior", "$110k+"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-line px-2 py-0.5 text-[10px] text-stone"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-stone-light">
                Every Thursday
              </span>
              <Link
                href="/jobs?q=Product%20design&mode=Remote&level=Senior&min=110000"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[11px] font-medium text-ink transition hover:bg-cream"
              >
                View results
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
