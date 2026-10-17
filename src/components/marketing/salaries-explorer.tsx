"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  Info,
  ShieldCheck,
} from "lucide-react";
import { jobs, salaryLabel } from "@/data/jobs";
import { getCompany } from "@/data/companies";
import { CompanyMark } from "@/components/ui/company-mark";
import { ButtonLink } from "@/components/ui/button";
import { cn, salaryShort } from "@/lib/utils";

type Band = {
  mid: [number, number];
  senior: [number, number];
  lead: [number, number];
};

const bands: { role: string; craft: string; band: Band }[] = [
  {
    role: "Product Designer",
    craft: "Design",
    band: {
      mid: [60000, 80000],
      senior: [100000, 130000],
      lead: [130000, 160000],
    },
  },
  {
    role: "Design Engineer",
    craft: "Engineering",
    band: {
      mid: [90000, 110000],
      senior: [115000, 145000],
      lead: [150000, 175000],
    },
  },
  {
    role: "Frontend Engineer",
    craft: "Engineering",
    band: {
      mid: [85000, 105000],
      senior: [110000, 140000],
      lead: [145000, 170000],
    },
  },
  {
    role: "Product Manager",
    craft: "Product",
    band: {
      mid: [75000, 95000],
      senior: [105000, 135000],
      lead: [140000, 165000],
    },
  },
  {
    role: "Marketing Lead",
    craft: "Marketing",
    band: {
      mid: [60000, 80000],
      senior: [85000, 110000],
      lead: [120000, 150000],
    },
  },
  {
    role: "Customer Success",
    craft: "Customer Success",
    band: {
      mid: [50000, 65000],
      senior: [70000, 90000],
      lead: [95000, 115000],
    },
  },
  {
    role: "Data & Analytics",
    craft: "Data",
    band: {
      mid: [70000, 90000],
      senior: [95000, 120000],
      lead: [125000, 150000],
    },
  },
];

const SCALE_MAX = 180000;

const levelStyles = {
  mid: { label: "Mid", color: "bg-sand", text: "text-[#8a641f]" },
  senior: { label: "Senior", color: "bg-sage", text: "text-sage-deep" },
  lead: { label: "Lead", color: "bg-clay", text: "text-clay-deep" },
};

const median = (range: [number, number]) =>
  Math.round((range[0] + range[1]) / 2);

export function SalariesExplorer() {
  const [selected, setSelected] = useState(bands[0].role);
  const band = bands.find((item) => item.role === selected) ?? bands[0];
  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => b.salaryMax - a.salaryMax),
    [],
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-cream/40 pb-10 pt-[calc(72px+3.5rem)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-grid opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="container-x relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-clay" />
              Salary explorer · updated October 2026
            </p>
            <h1 className="display mt-4 text-[clamp(2.4rem,4.8vw,3.7rem)] leading-[1] text-ink">
              Know what the
              <br />
              work is <em className="italic">worth</em>.
            </h1>
            <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-stone">
              Every role on Morrow publishes a range. Here&apos;s what that adds
              up to — by craft, by level, and by the teams hiring right now.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage-deep">
              <Banknote className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="display text-[22px] leading-none text-ink">100%</p>
              <p className="mt-1 text-[10.5px] leading-snug text-stone">
                of open roles show a
                <br />
                verified salary range
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-8 lg:py-12">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-2">
          {bands.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => setSelected(item.role)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-[11.5px] font-medium transition",
                selected === item.role
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-stone hover:border-line-strong hover:text-ink",
              )}
            >
              {item.role}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
                  {band.craft} · annual base
                </p>
                <h2 className="display mt-2 text-[28px] leading-none text-ink">
                  {band.role}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone">Senior median</p>
                <p className="display mt-1 text-[24px] leading-none text-ink">
                  {salaryShort(median(band.band.senior))}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {(Object.keys(levelStyles) as (keyof typeof levelStyles)[]).map(
                (level) => {
                  const range = band.band[level];
                  const left = (range[0] / SCALE_MAX) * 100;
                  const width = ((range[1] - range[0]) / SCALE_MAX) * 100;
                  const style = levelStyles[level];
                  return (
                    <div key={level}>
                      <div className="mb-2 flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-ink">
                            {style.label}
                          </span>
                          <span className="font-mono text-[9px] text-stone-light">
                            median {salaryShort(median(range))}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-stone">
                          {salaryShort(range[0])} – {salaryShort(range[1])}
                        </span>
                      </div>
                      <div className="relative h-8 overflow-hidden rounded-lg bg-cream/80">
                        {[0.25, 0.5, 0.75].map((tick) => (
                          <span
                            key={tick}
                            className="absolute inset-y-0 w-px bg-line/80"
                            style={{ left: `${tick * 100}%` }}
                          />
                        ))}
                        <div
                          className={cn(
                            "absolute inset-y-0 rounded-md transition-all duration-700 ease-out",
                            style.color,
                          )}
                          style={{ left: `${left}%`, width: `${width}%` }}
                        >
                          <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/80" />
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <span className="flex items-center gap-1.5 text-[9.5px] text-stone-light">
                <Info className="h-3 w-3" />
                Drawn from published ranges on Morrow, October 2026
              </span>
              <Link
                href={`/jobs?q=${encodeURIComponent(band.role)}`}
                className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink transition hover:text-clay-deep"
              >
                See open roles
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-paper-raised p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
                By craft
              </p>
              <div className="mt-3 space-y-1">
                {bands.map((item) => {
                  const value = median(item.band.senior);
                  const active = item.role === selected;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelected(item.role)}
                      className={cn(
                        "group w-full rounded-lg px-2 py-2 text-left transition",
                        active ? "bg-cream" : "hover:bg-cream/60",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            active ? "text-ink" : "text-stone",
                          )}
                        >
                          {item.role}
                        </span>
                        <span className="font-mono text-[9.5px] text-ink">
                          {salaryShort(value)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-cream">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            active
                              ? "bg-clay"
                              : "bg-line-strong group-hover:bg-stone-light",
                          )}
                          style={{ width: `${(value / SCALE_MAX) * 100}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-ink p-5 text-paper">
              <ShieldCheck className="h-4 w-4 text-ochre" />
              <p className="mt-3 text-[12px] font-medium">
                No estimates. Ever.
              </p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-paper/55">
                Every range is supplied by the hiring team and checked by a
                person before publishing. If a team won&apos;t share pay, the
                role isn&apos;t listed.
              </p>
              <Link
                href="/hire"
                className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-paper/85 transition hover:text-paper"
              >
                How we verify
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              value: "2.4×",
              label: "more qualified applicants",
              detail: "on roles that publish a salary range.",
            },
            {
              value: "31%",
              label: "faster to first conversation",
              detail: "when the process is published up front.",
            },
            {
              value: "68%",
              label: "reply within three days",
              detail: "across every team on Morrow this quarter.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-line bg-paper-raised p-5"
            >
              <p className="display text-[30px] leading-none text-ink">
                {item.value}
              </p>
              <p className="mt-2 text-[12px] font-medium text-ink">
                {item.label}
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-stone">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                Live roles
              </p>
              <h2 className="display mt-3 text-[26px] text-ink">
                What teams are paying right now
              </h2>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink transition hover:text-clay-deep"
            >
              Browse all roles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper-raised">
            <div className="hidden grid-cols-[1.7fr_1fr_1fr_120px] gap-4 border-b border-line bg-cream/50 px-5 py-3 text-[9.5px] font-medium uppercase tracking-[0.12em] text-stone-light sm:grid">
              <span>Role</span>
              <span>Team</span>
              <span>Location</span>
              <span className="text-right">Base · annual</span>
            </div>
            <div className="divide-y divide-line/70">
              {sortedJobs.slice(0, 10).map((job) => {
                const company = getCompany(job.company);
                if (!company) return null;
                return (
                  <Link
                    key={`${job.company}-${job.slug}`}
                    href={`/jobs/${job.company}/${job.slug}`}
                    className="group grid gap-3 px-4 py-3.5 transition hover:bg-cream/40 sm:grid-cols-[1.7fr_1fr_1fr_120px] sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="flex items-center gap-2.5">
                      <CompanyMark
                        monogram={company.monogram}
                        tone={company.tone}
                        size="sm"
                        className="h-8 w-8 rounded-lg text-[10px]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink transition group-hover:text-clay-deep">
                          {job.title}
                        </p>
                        <p className="mt-0.5 text-[9.5px] text-stone-light sm:hidden">
                          {company.name}
                        </p>
                      </div>
                    </div>
                    <span className="hidden text-[11px] text-stone sm:block">
                      {company.name}
                    </span>
                    <span className="hidden text-[11px] text-stone sm:block">
                      {job.location}
                    </span>
                    <div className="flex items-center justify-between sm:justify-end sm:gap-2">
                      <span className="text-[11px] font-medium tabular-nums text-ink">
                        {salaryLabel(job)}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-stone-light transition group-hover:text-ink" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-cream/50 px-6 py-7 sm:flex-row sm:items-center">
          <div>
            <p className="display text-[22px] text-ink">Hiring this quarter?</p>
            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-stone">
              Publish a range and see what happens to the quality of your
              pipeline. It&apos;s free for your first role.
            </p>
          </div>
          <ButtonLink href="/hire/jobs/new" size="sm" className="shrink-0">
            Post a role
            <ArrowRight className="h-3.5 w-3.5" />
          </ButtonLink>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[10px] text-stone-light">
          <Check className="h-3 w-3 text-sage" />
          All figures are gross annual base salary in USD, converted on 1
          October 2026.
        </div>
      </section>
    </>
  );
}
