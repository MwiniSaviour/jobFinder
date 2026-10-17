"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  jobs,
  departments,
  workModes,
  seniorities,
  employmentTypes,
} from "@/data/jobs";
import { companies } from "@/data/companies";
import { JobRow } from "@/components/jobs/job-card";
import { Checkbox } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type Filters = {
  q: string;
  where: string;
  departments: string[];
  modes: string[];
  levels: string[];
  types: string[];
  companySlugs: string[];
  minSalary: number;
};

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "salary", label: "Highest salary" },
  { value: "applicants", label: "Fewest applicants" },
];

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export type JobsExplorerInitial = {
  q?: string;
  where?: string;
  departments?: string[];
  modes?: string[];
  levels?: string[];
  types?: string[];
  companies?: string[];
  minSalary?: number;
};

export function JobsExplorer({
  initial = {},
}: {
  initial?: JobsExplorerInitial;
}) {
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    q: initial.q ?? "",
    where: initial.where ?? "",
    departments: initial.departments ?? [],
    modes: initial.modes ?? [],
    levels: initial.levels ?? [],
    types: initial.types ?? [],
    companySlugs: initial.companies ?? [],
    minSalary: initial.minSalary ?? 0,
  });
  const [sort, setSort] = useState("newest");
  const [mobileOpen, setMobileOpen] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.where) params.set("where", filters.where);
    filters.departments.forEach((item) => params.append("department", item));
    filters.modes.forEach((item) => params.append("mode", item));
    filters.levels.forEach((item) => params.append("level", item));
    filters.types.forEach((item) => params.append("type", item));
    filters.companySlugs.forEach((item) => params.append("company", item));
    if (filters.minSalary > 0) params.set("min", String(filters.minSalary));
    const url = params.toString() ? `/jobs?${params.toString()}` : "/jobs";
    window.history.replaceState(null, "", url);
  }, [filters]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const results = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    const where = filters.where.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const company = companies.find((item) => item.slug === job.company);
      if (!company) return false;
      const searchable = [
        job.title,
        company.name,
        job.summary,
        job.skills.join(" "),
        job.department,
        job.location,
      ]
        .join(" ")
        .toLowerCase();

      if (
        query &&
        !query.split(/\s+/).every((term) => searchable.includes(term))
      )
        return false;
      if (where) {
        const place = `${job.location} ${job.workMode}`.toLowerCase();
        if (!place.includes(where)) return false;
      }
      if (
        filters.departments.length &&
        !filters.departments.includes(job.department)
      )
        return false;
      if (filters.modes.length && !filters.modes.includes(job.workMode))
        return false;
      if (filters.levels.length && !filters.levels.includes(job.seniority))
        return false;
      if (filters.types.length && !filters.types.includes(job.employmentType))
        return false;
      if (
        filters.companySlugs.length &&
        !filters.companySlugs.includes(job.company)
      )
        return false;
      if (job.salaryMax < filters.minSalary) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "salary") return b.salaryMax - a.salaryMax;
      if (sort === "applicants") return a.applicants - b.applicants;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [filters, sort]);

  const activeCount =
    filters.departments.length +
    filters.modes.length +
    filters.levels.length +
    filters.types.length +
    filters.companySlugs.length +
    (filters.minSalary > 0 ? 1 : 0);

  const counts = useMemo(
    () => ({
      departments: Object.fromEntries(
        departments.map((department) => [
          department,
          jobs.filter((job) => job.department === department).length,
        ]),
      ),
      modes: Object.fromEntries(
        workModes.map((mode) => [
          mode,
          jobs.filter((job) => job.workMode === mode).length,
        ]),
      ),
      levels: Object.fromEntries(
        seniorities.map((level) => [
          level,
          jobs.filter((job) => job.seniority === level).length,
        ]),
      ),
      types: Object.fromEntries(
        employmentTypes.map((type) => [
          type,
          jobs.filter((job) => job.employmentType === type).length,
        ]),
      ),
      companies: Object.fromEntries(
        companies.map((company) => [
          company.slug,
          jobs.filter((job) => job.company === company.slug).length,
        ]),
      ),
    }),
    [],
  );

  const clearAll = () =>
    setFilters({
      q: "",
      where: "",
      departments: [],
      modes: [],
      levels: [],
      types: [],
      companySlugs: [],
      minSalary: 0,
    });

  const activeChips: { label: string; onRemove: () => void }[] = [
    ...filters.departments.map((value) => ({
      label: value,
      onRemove: () =>
        setFilters((f) => ({
          ...f,
          departments: toggleValue(f.departments, value),
        })),
    })),
    ...filters.modes.map((value) => ({
      label: value,
      onRemove: () =>
        setFilters((f) => ({ ...f, modes: toggleValue(f.modes, value) })),
    })),
    ...filters.levels.map((value) => ({
      label: value,
      onRemove: () =>
        setFilters((f) => ({ ...f, levels: toggleValue(f.levels, value) })),
    })),
    ...filters.types.map((value) => ({
      label: value,
      onRemove: () =>
        setFilters((f) => ({ ...f, types: toggleValue(f.types, value) })),
    })),
    ...filters.companySlugs.map((value) => ({
      label: companies.find((c) => c.slug === value)?.name ?? value,
      onRemove: () =>
        setFilters((f) => ({
          ...f,
          companySlugs: toggleValue(f.companySlugs, value),
        })),
    })),
    ...(filters.minSalary > 0
      ? [
          {
            label: `$${Math.round(filters.minSalary / 1000)}k+ base`,
            onRemove: () => setFilters((f) => ({ ...f, minSalary: 0 })),
          },
        ]
      : []),
  ];

  const filterPanel = (inSheet = false) => (
    <div className="space-y-7">
      {!inSheet && (
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[13px] font-medium text-ink">
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 font-mono text-[9.5px] text-paper">
                {activeCount}
              </span>
            )}
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11.5px] text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {inSheet && activeCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-stone">
            <span className="font-medium text-ink">{activeCount}</span>{" "}
            {activeCount === 1 ? "filter" : "filters"} active
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="text-[11.5px] text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
        <input
          value={filters.q}
          onChange={(event) =>
            setFilters((f) => ({ ...f, q: event.target.value }))
          }
          placeholder="Role, skill, or company"
          aria-label="Keyword search"
          className="h-10 w-full rounded-[10px] border border-line bg-paper-raised pl-9 pr-8 text-[12.5px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, q: "" }))}
            aria-label="Clear keyword"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-stone hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="relative mt-2">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
        <input
          value={filters.where}
          onChange={(event) =>
            setFilters((f) => ({ ...f, where: event.target.value }))
          }
          placeholder="Location or remote"
          aria-label="Location filter"
          className="h-10 w-full rounded-[10px] border border-line bg-paper-raised pl-9 pr-3 text-[12.5px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
        />
      </div>

      <FilterGroup title="Work mode">
        {workModes.map((mode) => (
          <Checkbox
            key={mode}
            label={mode}
            count={counts.modes[mode]}
            checked={filters.modes.includes(mode)}
            onChange={() =>
              setFilters((f) => ({ ...f, modes: toggleValue(f.modes, mode) }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Craft">
        {departments.map((department) => (
          <Checkbox
            key={department}
            label={department}
            count={counts.departments[department]}
            checked={filters.departments.includes(department)}
            onChange={() =>
              setFilters((f) => ({
                ...f,
                departments: toggleValue(f.departments, department),
              }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Experience">
        {seniorities.map((level) => (
          <Checkbox
            key={level}
            label={level}
            count={counts.levels[level]}
            checked={filters.levels.includes(level)}
            onChange={() =>
              setFilters((f) => ({
                ...f,
                levels: toggleValue(f.levels, level),
              }))
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Employment">
        {employmentTypes.map((type) => (
          <Checkbox
            key={type}
            label={type}
            count={counts.types[type]}
            checked={filters.types.includes(type)}
            onChange={() =>
              setFilters((f) => ({ ...f, types: toggleValue(f.types, type) }))
            }
          />
        ))}
      </FilterGroup>

      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-stone">
            Minimum base
          </h3>
          <span className="font-mono text-[11px] text-ink">
            {filters.minSalary > 0
              ? `$${Math.round(filters.minSalary / 1000)}k`
              : "Any"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={150000}
          step={5000}
          value={filters.minSalary}
          onChange={(event) =>
            setFilters((f) => ({ ...f, minSalary: Number(event.target.value) }))
          }
          className="range mt-4"
          aria-label="Minimum base salary"
        />
        <div className="mt-2 flex justify-between font-mono text-[9px] text-stone-light">
          <span>$0</span>
          <span>$150k+</span>
        </div>
      </div>

      <FilterGroup title="Company">
        {companies.map((company) => (
          <Checkbox
            key={company.slug}
            label={company.name}
            count={counts.companies[company.slug]}
            checked={filters.companySlugs.includes(company.slug)}
            onChange={() =>
              setFilters((f) => ({
                ...f,
                companySlugs: toggleValue(f.companySlugs, company.slug),
              }))
            }
          />
        ))}
      </FilterGroup>

      <div className="rounded-xl border border-line bg-paper-raised p-4">
        <Sparkles className="h-4 w-4 text-ochre" />
        <p className="mt-2.5 text-[12.5px] font-medium text-ink">
          The weekly letter
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-stone">
          Six roles worth opening, every Thursday. No noise.
        </p>
        <button
          type="button"
          onClick={() =>
            toast({
              title: "You're on the list",
              description: "The first letter arrives on Thursday.",
              tone: "success",
            })
          }
          className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink"
        >
          Subscribe
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section className="border-b border-line bg-cream/40 pb-9 pt-[calc(72px+3rem)] lg:pb-12 lg:pt-[calc(72px+4rem)]">
        <div className="container-x">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">
                <span className="h-1 w-1 rounded-full bg-clay" />
                {jobs.length} open roles · updated today
              </p>
              <h1 className="display mt-4 text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[1.0] text-ink">
                Find your next <em className="italic">good day</em> at work.
              </h1>
              <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-stone">
                Equal parts craft and honesty. Filter by the things that matter
                — the pay, the pace, and the way you want to work.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-line-strong bg-paper px-4 text-[12.5px] font-medium text-ink sm:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink font-mono text-[9px] text-paper">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="container-x py-8 lg:py-10">
        <div className="grid gap-10 lg:grid-cols-[248px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-1">
              {filterPanel()}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <p className="text-[12.5px] text-stone">
                <span className="font-medium text-ink">{results.length}</span>{" "}
                {results.length === 1 ? "role" : "roles"}
                {filters.q && (
                  <>
                    {" "}
                    for <span className="text-ink">“{filters.q}”</span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Search saved",
                      description: "We'll let you know when new roles match.",
                      tone: "success",
                    })
                  }
                  className="hidden text-[11.5px] text-stone transition hover:text-ink sm:block"
                >
                  Save search
                </button>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    aria-label="Sort roles"
                    className="h-9 appearance-none rounded-full border border-line bg-paper pl-3.5 pr-8 text-[11.5px] font-medium text-ink focus:border-ink focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-stone" />
                </div>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-4">
                {activeChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-raised py-1 pl-2.5 pr-1 text-[11px] text-ink-soft"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      aria-label={`Remove ${chip.label} filter`}
                      className="rounded-full p-0.5 text-stone transition hover:bg-cream hover:text-ink"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-1 text-[11px] text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
                >
                  Clear
                </button>
              </div>
            )}

            {results.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper-raised/60 p-1.5">
                <div className="divide-y divide-line/70">
                  {results.map((job) => (
                    <JobRow key={`${job.company}-${job.slug}`} job={job} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-paper-raised/50 px-6 py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream">
                  <Search className="h-5 w-5 text-stone" />
                </div>
                <h2 className="display mt-5 text-[24px] text-ink">
                  No roles match that combination
                </h2>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-stone">
                  Try widening the salary range or removing a filter. New roles
                  arrive every Tuesday.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[12.5px] font-medium text-paper transition hover:bg-ink-soft"
                >
                  Reset filters
                </button>
              </div>
            )}

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-cream/50 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[13px] font-medium text-ink">
                  Not seeing the right thing?
                </p>
                <p className="mt-1 text-[12px] text-stone">
                  Set a weekly note and we&apos;ll send the six roles worth your
                  attention.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Weekly note set",
                    description: "We'll be in touch on Thursday.",
                    tone: "success",
                  })
                }
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-paper px-4 text-[11.5px] font-medium text-ink transition hover:bg-white"
              >
                Get the weekly note
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[1.5rem] border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[15px] font-medium text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {filterPanel(true)}
            </div>
            <div className="border-t border-line bg-paper p-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-medium text-paper"
              >
                <Check className="h-4 w-4" />
                Show {results.length} {results.length === 1 ? "role" : "roles"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-stone">
        {title}
      </h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}
