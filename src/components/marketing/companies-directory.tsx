"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Search } from "lucide-react";
import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompaniesDirectory() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");

  const industries = useMemo(
    () => [
      "All",
      ...Array.from(new Set(companies.map((company) => company.industry))),
    ],
    [],
  );

  const visible = companies.filter((company) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      `${company.name} ${company.tagline} ${company.industry} ${company.locations.join(" ")}`
        .toLowerCase()
        .includes(q);
    const matchesIndustry = industry === "All" || company.industry === industry;
    return matchesQuery && matchesIndustry;
  });

  return (
    <>
      <section className="border-b border-line bg-cream/40 pb-10 pt-[calc(72px+3.5rem)]">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                {companies.length} considered teams
              </p>
              <h1 className="display mt-4 text-[clamp(2.4rem,4.8vw,3.7rem)] leading-[1] text-ink">
                The teams behind
                <br />
                the <em className="italic">work</em>.
              </h1>
              <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-stone">
                Studios, product teams, and a few quiet institutions. Each one
                reviewed by a person, each one clear about pay, pace, and how
                they hire.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper-raised p-4 lg:max-w-xs">
              <div className="flex -space-x-2">
                {companies.slice(0, 4).map((company) => (
                  <CompanyMark
                    key={company.slug}
                    monogram={company.monogram}
                    tone={company.tone}
                    size="sm"
                    className="h-8 w-8 rounded-full text-[10px] ring-2 ring-paper-raised"
                  />
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-stone">
                <span className="font-medium text-ink">
                  Every team is verified.
                </span>{" "}
                We check the pay range and the hiring process before a role goes
                live.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-8 lg:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams or industries"
              aria-label="Search companies"
              className="h-10 w-full rounded-full border border-line bg-paper-raised pl-10 pr-4 text-[12.5px] text-ink transition placeholder:text-stone-light focus:border-ink/60 focus:outline-none focus:ring-4 focus:ring-ink/5"
            />
          </div>
          <div className="no-scrollbar -mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-1 lg:flex-wrap lg:justify-start lg:overflow-visible">
            {industries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setIndustry(item)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                  industry === item
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-stone hover:border-line-strong hover:text-ink",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[11.5px] text-stone">
          <span className="font-medium text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "team" : "teams"}
          {industry !== "All" && <> in {industry.toLowerCase()}</>}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((company) => {
            const openRoles = jobs.filter(
              (job) => job.company === company.slug,
            ).length;
            return (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="group relative flex flex-col rounded-2xl border border-line bg-paper-raised p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
              >
                <div className="flex items-start justify-between">
                  <CompanyMark
                    monogram={company.monogram}
                    tone={company.tone}
                    size="lg"
                  />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-stone opacity-0 transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-paper group-hover:opacity-100">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <h2 className="text-[16px] font-medium tracking-[-0.015em] text-ink">
                    {company.name}
                  </h2>
                  {company.verified && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sage-soft text-sage-deep">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="display mt-1 text-[16px] italic leading-snug text-stone">
                  {company.tagline}
                </p>
                <p className="mt-3 line-clamp-2 text-[11.5px] leading-relaxed text-stone">
                  {company.about}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-stone">
                      {company.industry}
                    </span>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] text-stone">
                      {company.hq}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-stone-light">
                    {openRoles} {openRoles === 1 ? "role" : "roles"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-paper-raised/50 px-6 py-16 text-center">
            <p className="display text-[22px] text-ink">
              No teams match that yet.
            </p>
            <p className="mt-1.5 text-[12px] text-stone">
              Try a broader search, or meet everyone below.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIndustry("All");
              }}
              className="mt-5 inline-flex h-9 items-center rounded-full bg-ink px-4 text-[11.5px] font-medium text-paper"
            >
              Show all teams
            </button>
          </div>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-cream/50 px-6 py-7 sm:flex-row sm:items-center">
          <div>
            <p className="display text-[22px] text-ink">
              Building something worth joining?
            </p>
            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-stone">
              Tell us how you hire, and we&apos;ll tell you honestly whether
              Morrow is the right room for it.
            </p>
          </div>
          <ButtonLink href="/hire/jobs/new" size="sm" className="shrink-0">
            Add your team
            <ArrowRight className="h-3.5 w-3.5" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
