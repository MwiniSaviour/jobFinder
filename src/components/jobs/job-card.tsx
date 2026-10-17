import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getCompany } from "@/data/companies";
import { salaryLabel, timeAgo, type Job } from "@/data/jobs";
import { Badge, workModeTone } from "@/components/ui/badge";
import { CompanyMark } from "@/components/ui/company-mark";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { cn } from "@/lib/utils";

export function JobCard({ job, className }: { job: Job; className?: string }) {
  const company = getCompany(job.company);
  if (!company) return null;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-line bg-paper-raised p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/jobs/${company.slug}/${job.slug}`}
          className="flex min-w-0 items-center gap-2.5"
          tabIndex={-1}
          aria-hidden="true"
        >
          <CompanyMark
            monogram={company.monogram}
            tone={company.tone}
            size="sm"
          />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium leading-tight text-ink">
              {company.name}
            </span>
            <span className="mt-0.5 block text-[10.5px] text-stone-light">
              {company.industry}
            </span>
          </span>
        </Link>
        <BookmarkButton
          jobKey={`${company.slug}/${job.slug}`}
          title={job.title}
          className="relative z-10 -mr-1 -mt-1 shrink-0"
        />
      </div>

      <Link href={`/jobs/${company.slug}/${job.slug}`} className="mt-4 block">
        <h3 className="text-[17px] font-medium leading-snug tracking-[-0.015em] text-ink transition-colors group-hover:text-clay-deep">
          {job.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-stone">
          {job.tagline ?? job.summary}
        </p>
      </Link>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={workModeTone(job.workMode)}>{job.workMode}</Badge>
        <Badge tone="outline">{job.seniority}</Badge>
        <Badge tone="outline">{job.employmentType}</Badge>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-stone-light">
            Base salary
          </p>
          <p className="mt-1 text-[13px] font-medium tracking-[-0.01em] text-ink">
            {salaryLabel(job)}{" "}
            <span className="font-normal text-stone-light">/ year</span>
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-[11px] text-stone">
            <MapPin className="h-3 w-3" />
            {job.location}
          </p>
          <p className="mt-1 text-[10.5px] text-stone-light">
            {timeAgo(job.postedAt)}
          </p>
        </div>
      </div>
      <span className="pointer-events-none absolute right-5 top-[58px] hidden h-7 w-7 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition-all duration-300 group-hover:opacity-100 sm:flex">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

export function JobRow({ job }: { job: Job }) {
  const company = getCompany(job.company);
  if (!company) return null;

  return (
    <div className="group relative flex items-start gap-4 rounded-xl border border-transparent px-4 py-4 transition-all duration-200 hover:border-line hover:bg-paper-raised sm:gap-5 sm:px-5 sm:py-5">
      <Link
        href={`/jobs/${company.slug}/${job.slug}`}
        className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
      >
        <CompanyMark
          monogram={company.monogram}
          tone={company.tone}
          size="md"
          className="hidden sm:flex"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-medium text-stone">
              {company.name}
            </span>
            <span
              className="h-0.5 w-0.5 rounded-full bg-stone-light"
              aria-hidden="true"
            />
            <span className="text-[11px] text-stone-light">
              {timeAgo(job.postedAt)}
            </span>
          </div>
          <h3 className="mt-1 text-[16px] font-medium tracking-[-0.015em] text-ink transition-colors group-hover:text-clay-deep">
            {job.title}
          </h3>
          <p className="mt-1 hidden text-[12px] leading-relaxed text-stone lg:line-clamp-1">
            {job.tagline ?? job.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-stone">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-stone-light" />
              {job.workMode}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-stone-light" />
              {job.seniority}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:gap-1.5">
          <p className="text-[12.5px] font-medium tabular-nums text-ink">
            {salaryLabel(job)}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-1 text-[10px] font-medium text-stone">
            {job.applicants} applied
          </span>
        </div>
      </Link>
      <BookmarkButton
        jobKey={`${company.slug}/${job.slug}`}
        title={job.title}
        className="relative z-10 mt-0.5 shrink-0 sm:mt-1"
      />
    </div>
  );
}
