import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Briefcase,
  CalendarDays,
  Check,
  Clock3,
  Flag,
  Globe2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getJob, jobs, jobsByCompany, salaryLabel, timeAgo } from "@/data/jobs";
import { getCompany } from "@/data/companies";
import { Badge, workModeTone } from "@/components/ui/badge";
import { CompanyMark } from "@/components/ui/company-mark";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ApplyQuiz } from "@/components/jobs/apply-panel";
import { ShareButton } from "@/components/jobs/share-button";
import { JobCard } from "@/components/jobs/job-card";
import { Avatar } from "@/components/ui/avatar";

type Params = Promise<{ company: string; slug: string }>;

export function generateStaticParams() {
  return jobs.map((job) => ({ company: job.company, slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { company: companySlug, slug } = await params;
  const job = getJob(companySlug, slug);
  const company = getCompany(companySlug);
  if (!job || !company) return { title: "Role not found" };
  return {
    title: `${job.title} at ${company.name}`,
    description: `${job.summary} ${salaryLabel(job)} · ${job.location} · ${job.workMode}.`,
    openGraph: {
      title: `${job.title} — ${company.name}`,
      description: job.summary,
      type: "article",
    },
  };
}

export default async function JobDetailPage({ params }: { params: Params }) {
  const { company: companySlug, slug } = await params;
  const job = getJob(companySlug, slug);
  const company = getCompany(companySlug);
  if (!job || !company) notFound();

  const companyRoles = jobsByCompany(company.slug);
  const similar = jobs
    .filter(
      (item) =>
        item.slug !== job.slug &&
        (item.department === job.department ||
          item.workMode === job.workMode) &&
        item.company !== job.company,
    )
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary,
    datePosted: job.postedAt,
    employmentType: job.employmentType.toUpperCase().replace("-", "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: `https://${company.website}`,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location },
    },
    jobLocationType: job.workMode === "Remote" ? "TELECOMMUTE" : undefined,
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: "YEAR",
      },
    },
  };

  const process = job.process ?? [
    {
      title: "Intro conversation",
      detail:
        "A 30-minute call with the hiring manager about the role and your work.",
      duration: "30 min",
    },
    {
      title: "Craft conversation",
      detail:
        "Walk the team through a project you're proud of. No unpaid take-homes.",
      duration: "60 min",
    },
    {
      title: "Meet the team",
      detail: "Two conversations with the people you'd work with day to day.",
      duration: "2 × 45 min",
    },
    {
      title: "Decision & offer",
      detail:
        "A written decision within three working days, with room for your questions.",
      duration: "Within 3 days",
    },
  ];

  return (
    <div className="pt-[72px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-line bg-cream/30">
        <div className="container-x pb-8 pt-6 lg:pb-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] text-stone"
          >
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 transition hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" />
              All roles
            </Link>
            <span className="text-line-strong">/</span>
            <Link
              href={`/jobs?department=${job.department}`}
              className="transition hover:text-ink"
            >
              {job.department}
            </Link>
            <span className="text-line-strong">/</span>
            <span className="text-ink">{job.title}</span>
          </nav>

          <div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <CompanyMark
                  monogram={company.monogram}
                  tone={company.tone}
                  size="lg"
                />
                <div>
                  <Link
                    href={`/companies/${company.slug}`}
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink transition hover:text-clay-deep"
                  >
                    {company.name}
                    {company.verified && (
                      <span
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sage-soft text-sage-deep"
                        title="Verified company"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                    <ArrowUpRight className="h-3 w-3 text-stone-light" />
                  </Link>
                  <p className="mt-0.5 text-[11.5px] text-stone">
                    {company.industry} · {company.locations.join(" · ")}
                  </p>
                </div>
              </div>

              <h1 className="display mt-6 max-w-3xl text-[clamp(2.2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.025em] text-ink">
                {job.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[12.5px] text-stone">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {job.employmentType}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Banknote className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {salaryLabel(job)}{" "}
                  <span className="text-stone-light">/ year</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Posted {timeAgo(job.postedAt)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                <Badge tone={workModeTone(job.workMode)}>{job.workMode}</Badge>
                <Badge tone="outline">{job.seniority} level</Badge>
                <Badge tone="outline">{job.department}</Badge>
                {job.applicants < 60 && (
                  <Badge tone="clay">Actively reviewing</Badge>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <BookmarkButton
                jobKey={`${company.slug}/${job.slug}`}
                title={job.title}
                variant="button"
              />
              <ShareButton title={job.title} className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_352px] lg:gap-16 lg:py-14">
        <article className="min-w-0 max-w-[46rem]">
          <p className="text-[17px] leading-relaxed tracking-[-0.005em] text-ink-soft">
            {job.summary}
          </p>

          <Section number="01" title="What you'll do">
            <ul className="space-y-3.5">
              {job.responsibilities.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-relaxed text-ink-soft"
                >
                  <span className="mt-[0.62rem] h-1 w-1 shrink-0 rounded-full bg-clay" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section number="02" title="What we're looking for">
            <ul className="space-y-3.5">
              {job.requirements.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[14px] leading-relaxed text-ink-soft"
                >
                  <Check
                    className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-sage"
                    strokeWidth={2.4}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-line bg-cream/40 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone">
                Nice to have, not required
              </p>
              <ul className="mt-2 grid gap-1.5">
                {job.niceToHave.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[12px] leading-relaxed text-stone"
                  >
                    <span className="mt-[0.55rem] h-0.5 w-0.5 shrink-0 rounded-full bg-stone" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section number="03" title="Skills for the role">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-paper-raised px-3 py-1.5 text-[12px] text-ink-soft"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section number="04" title="What you'll get">
            <div className="grid gap-2 sm:grid-cols-2">
              {job.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-2.5 rounded-xl border border-line bg-paper-raised px-4 py-3.5"
                >
                  <HeartHandshake
                    className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep"
                    strokeWidth={1.8}
                  />
                  <p className="text-[12.5px] leading-snug text-ink-soft">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section number="05" title="How the hiring works">
            <p className="mb-6 max-w-xl text-[13px] leading-relaxed text-stone">
              Four steps, published in advance. The same process for every
              candidate, with feedback either way.
            </p>
            <ol className="relative space-y-0 border-l border-line pl-6">
              {process.map((step, index) => (
                <li key={step.title} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[31px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-line-strong bg-paper font-mono text-[8px] text-stone">
                    {index + 1}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-[14px] font-medium text-ink">
                      {step.title}
                    </h3>
                    <span className="rounded-full bg-cream px-2 py-0.5 font-mono text-[9px] text-stone">
                      {step.duration}
                    </span>
                  </div>
                  <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-stone">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
            {job.teamNote && (
              <div className="mt-6 rounded-xl bg-sage-soft/60 p-4 text-[12px] leading-relaxed text-sage-deep">
                {job.teamNote}
              </div>
            )}
          </Section>

          <Section number="06" title={`About ${company.name}`}>
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
              {company.photo && (
                <div className="relative aspect-[16/7] w-full">
                  <Image
                    src={company.photo}
                    alt={`Inside ${company.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CompanyMark
                      monogram={company.monogram}
                      tone={company.tone}
                      size="sm"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-ink">
                        {company.name}
                      </p>
                      <p className="text-[10.5px] text-stone">
                        {company.tagline}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/companies/${company.slug}`}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink transition hover:text-clay-deep"
                  >
                    Company profile
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-stone">
                  {company.about}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
                  <div>
                    <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-stone-light">
                      <Users className="h-3 w-3" /> Team
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-ink">
                      {company.headcount}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-stone-light">
                      <CalendarDays className="h-3 w-3" /> Founded
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-ink">
                      {company.founded}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-stone-light">
                      <Globe2 className="h-3 w-3" /> Based in
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-ink">
                      {company.hq}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <div className="flex items-center gap-1.5 text-[10.5px] text-stone-light">
              <ShieldCheck className="h-3.5 w-3.5 text-sage" />
              Salary and process verified by Morrow on {job.postedAt}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[10.5px] text-stone transition hover:text-clay-deep"
            >
              <Flag className="h-3 w-3" />
              Report this role
            </button>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-[96px] lg:self-start">
          <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-soft">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
              Base salary
            </p>
            <p className="display mt-2 text-[28px] tracking-[-0.03em] text-ink">
              {salaryLabel(job)}
            </p>
            <p className="mt-1 text-[10.5px] text-stone">
              {job.currency} · gross annual · reviewed {timeAgo(job.postedAt)}
            </p>

            <div className="mt-5">
              <ApplyQuiz job={job} company={company} variant="sidebar" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <BookmarkButton
                jobKey={`${company.slug}/${job.slug}`}
                title={job.title}
                variant="button"
                className="w-full"
              />
              <ShareButton title={job.title} className="w-full" />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[11.5px]">
              <div className="flex items-center justify-between">
                <dt className="text-stone">Applications</dt>
                <dd className="font-medium text-ink">{job.applicants}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-stone">Typical reply</dt>
                <dd className="font-medium text-ink">3 working days</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-stone">Interview rounds</dt>
                <dd className="font-medium text-ink">{process.length}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-stone">Open roles here</dt>
                <dd className="font-medium text-ink">{companyRoles.length}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name="Amara Mensah"
                src="/images/avatar-amara.jpg"
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-ink">
                  Your profile is 92% ready
                </p>
                <p className="mt-0.5 text-[10.5px] text-stone">
                  Apply in one minute with Morrow
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-cream">
              <div className="h-full w-[92%] rounded-full bg-sage" />
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-ink transition hover:text-clay-deep"
            >
              Review your profile
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-paper">
            <ShieldCheck className="h-4 w-4 text-ochre" />
            <p className="mt-3 text-[12.5px] font-medium">
              The Morrow hiring standard
            </p>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-paper/60">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-ochre" /> Salary
                verified before publishing
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-ochre" /> Process
                shared with every candidate
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-ochre" /> A
                reply, even when it&apos;s a no
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-line bg-cream/30">
          <div className="container-x py-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">
                  <span className="h-1 w-1 rounded-full bg-clay" />
                  Keep looking
                </p>
                <h2 className="display mt-3 text-[26px] text-ink">
                  Similar roles
                </h2>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink transition hover:text-clay-deep"
              >
                All roles
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {similar.map((item) => (
                <JobCard key={`${item.company}-${item.slug}`} job={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium leading-tight text-ink">
              {salaryLabel(job)}
            </p>
            <p className="text-[10px] text-stone">/ year · {job.location}</p>
          </div>
          <ApplyQuiz job={job} company={company} variant="mobile" />
        </div>
      </div>
      <div className="h-[68px] lg:hidden" aria-hidden="true" />
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-line pt-7">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-[9.5px] tracking-[0.16em] text-stone-light">
          {number}
        </span>
        <h2 className="display text-[23px] tracking-[-0.02em] text-ink">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
