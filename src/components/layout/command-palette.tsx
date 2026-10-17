"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Building2,
  CornerDownLeft,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";
import { salaryLabel } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  label: string;
  meta?: string;
  href: string;
  group: "Jobs" | "Companies" | "Pages";
  icon:
    "job" | "company" | "page" | "salary" | "profile" | "settings" | "saved";
  monogram?: string;
  tone?: "clay" | "sage" | "ochre" | "ink" | "stone" | "plum";
};

const pages: Result[] = [
  {
    id: "p-jobs",
    label: "Browse all roles",
    meta: "24 open roles",
    href: "/jobs",
    group: "Pages",
    icon: "job",
  },
  {
    id: "p-companies",
    label: "Companies",
    meta: "12 teams hiring",
    href: "/companies",
    group: "Pages",
    icon: "company",
  },
  {
    id: "p-salaries",
    label: "Salary explorer",
    meta: "Compare pay by role",
    href: "/salaries",
    group: "Pages",
    icon: "salary",
  },
  {
    id: "p-dashboard",
    label: "Your applications",
    meta: "Tracker & next steps",
    href: "/dashboard",
    group: "Pages",
    icon: "profile",
  },
  {
    id: "p-saved",
    label: "Saved jobs",
    meta: "Your shortlist",
    href: "/dashboard/saved",
    group: "Pages",
    icon: "saved",
  },
  {
    id: "p-profile",
    label: "Profile settings",
    meta: "Experience, skills, visibility",
    href: "/dashboard/profile",
    group: "Pages",
    icon: "settings",
  },
  {
    id: "p-post",
    label: "Post a role",
    meta: "For hiring teams",
    href: "/hire/jobs/new",
    group: "Pages",
    icon: "settings",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        setQuery("");
        setActive(0);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("morrow:command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("morrow:command", onOpen);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const jobResults: Result[] = jobs.map((job) => {
      const company = companies.find((item) => item.slug === job.company);
      return {
        id: `job-${job.company}-${job.slug}`,
        label: job.title,
        meta: `${company?.name} · ${job.location} · ${salaryLabel(job)}`,
        href: `/jobs/${job.company}/${job.slug}`,
        group: "Jobs" as const,
        icon: "job" as const,
        monogram: company?.monogram,
        tone: company?.tone,
      };
    });
    const companyResults: Result[] = companies.map((company) => ({
      id: `company-${company.slug}`,
      label: company.name,
      meta: company.tagline,
      href: `/companies/${company.slug}`,
      group: "Companies" as const,
      icon: "company" as const,
      monogram: company.monogram,
      tone: company.tone,
    }));

    if (!q) {
      return [
        ...jobResults.filter((job) =>
          job.id.includes("senior-product-designer"),
        ),
        ...pages.slice(0, 3),
        ...companyResults.slice(0, 3),
      ].slice(0, 8);
    }

    const match = (value: string) => value.toLowerCase().includes(q);
    return [
      ...jobResults.filter((job) => match(job.label) || match(job.meta ?? "")),
      ...companyResults.filter(
        (company) => match(company.label) || match(company.meta ?? ""),
      ),
      ...pages.filter((page) => match(page.label) || match(page.meta ?? "")),
    ].slice(0, 10);
  }, [query]);

  const grouped = useMemo(() => {
    const order: Result["group"][] = ["Jobs", "Companies", "Pages"];
    return order
      .map((group) => ({
        group,
        items: results.filter((item) => item.group === group),
      }))
      .filter((section) => section.items.length > 0);
  }, [results]);

  const flat = grouped.flatMap((section) => section.items);
  const go = (result: Result) => {
    close();
    router.push(result.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]">
      <button
        type="button"
        aria-label="Close search"
        className="animate-fade-in absolute inset-0 bg-ink/35 backdrop-blur-[3px]"
        onClick={() => close()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Morrow"
        className="animate-scale-in relative w-full max-w-[36rem] overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-panel"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search
            className="h-[18px] w-[18px] shrink-0 text-stone"
            strokeWidth={1.9}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => (value + 1) % Math.max(flat.length, 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive(
                  (value) =>
                    (value - 1 + flat.length) % Math.max(flat.length, 1),
                );
              }
              if (event.key === "Enter" && flat[active]) {
                event.preventDefault();
                go(flat[active]);
              }
            }}
            placeholder="Search roles, companies, or pages…"
            aria-label="Search"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-stone-light"
          />
          <kbd className="rounded-md border border-line bg-cream px-1.5 py-1 font-mono text-[10px] leading-none text-stone">
            ESC
          </kbd>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-2">
          {grouped.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="display text-[20px] text-ink">
                No matches for “{query}”
              </p>
              <p className="mt-1.5 text-[13px] text-stone">
                Try a role, a company, or a city.
              </p>
              <p className="mx-auto mt-4 max-w-[15rem] rounded-lg bg-cream/70 px-3 py-2 text-[10.5px] leading-relaxed text-stone-light">
                Tip: press{" "}
                <kbd className="rounded border border-line bg-paper px-1 font-mono text-[9px]">
                  ⌘
                </kbd>
                <kbd className="ml-0.5 rounded border border-line bg-paper px-1 font-mono text-[9px]">
                  K
                </kbd>{" "}
                anywhere to open this search.
              </p>
            </div>
          )}
          {grouped.map((section) => (
            <div key={section.group} className="mb-1">
              <p className="px-3 pb-1 pt-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-stone-light">
                {section.group}
              </p>
              {section.items.map((item) => {
                const index = flat.findIndex((entry) => entry.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                      index === active ? "bg-cream" : "hover:bg-cream/60",
                    )}
                  >
                    {item.group === "Jobs" && item.monogram ? (
                      <CompanyMark
                        monogram={item.monogram}
                        tone={item.tone}
                        size="sm"
                      />
                    ) : item.group === "Companies" && item.monogram ? (
                      <CompanyMark
                        monogram={item.monogram}
                        tone={item.tone}
                        size="sm"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-cream text-stone">
                        {item.icon === "salary" ? (
                          <Banknote className="h-4 w-4" />
                        ) : item.icon === "profile" ? (
                          <UserRound className="h-4 w-4" />
                        ) : item.icon === "settings" ? (
                          <Settings className="h-4 w-4" />
                        ) : item.icon === "saved" ? (
                          <Sparkles className="h-4 w-4" />
                        ) : item.icon === "company" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Briefcase className="h-4 w-4" />
                        )}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-ink">
                        {item.label}
                      </span>
                      {item.meta && (
                        <span className="mt-0.5 block truncate text-[11.5px] text-stone">
                          {item.meta}
                        </span>
                      )}
                    </span>
                    {index === active ? (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-stone" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-transparent" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-cream/40 px-4 py-2.5 text-[11px] text-stone">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-paper px-1 py-0.5 font-mono text-[9px]">
                ↑
              </kbd>
              <kbd className="rounded border border-line bg-paper px-1 py-0.5 font-mono text-[9px]">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-paper px-1 py-0.5 font-mono text-[9px]">
                ↵
              </kbd>
              to open
            </span>
          </span>
          <span className="hidden sm:inline">Search across Morrow</span>
        </div>
      </div>
    </div>
  );
}
