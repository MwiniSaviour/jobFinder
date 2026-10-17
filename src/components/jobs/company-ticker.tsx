import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { companies } from "@/data/companies";
import { jobs } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";

export function CompanyTicker() {
  const featured = companies.slice(0, 7);

  return (
    <div className="border-y border-line bg-paper-raised/40">
      <div className="container-x flex items-center gap-5 py-4 sm:gap-6">
        <p className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light xl:block">
          Hiring with care
        </p>
        <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-x-5 overflow-x-auto px-1 py-1 md:gap-x-7">
          {featured.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap opacity-70 transition-opacity duration-300 hover:opacity-100"
              aria-label={`${company.name} — ${jobs.filter((job) => job.company === company.slug).length} open roles`}
            >
              <CompanyMark
                monogram={company.monogram}
                tone={company.tone}
                size="sm"
                className="h-7 w-7 rounded-lg text-[10px]"
              />
              <span className="text-[13px] font-medium tracking-[-0.02em] text-ink-soft">
                {company.name}
              </span>
            </Link>
          ))}
        </div>
        <Link
          href="/companies"
          className="group inline-flex shrink-0 items-center gap-1.5 text-[11.5px] font-medium text-stone transition hover:text-ink"
        >
          All {companies.length} teams
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line-strong transition group-hover:border-ink/40">
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
