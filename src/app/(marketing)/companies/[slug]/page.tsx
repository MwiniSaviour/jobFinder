import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Globe2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { companies, getCompany } from "@/data/companies";
import { jobsByCompany } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";
import { JobRow } from "@/components/jobs/job-card";
import { FollowButton } from "@/components/marketing/follow-button";
import { ButtonLink } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: `${company.name} — hiring`,
    description: `${company.tagline} ${company.about}`,
  };
}

export default async function CompanyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();

  const roles = jobsByCompany(company.slug);
  const otherCompanies = companies
    .filter((item) => item.slug !== company.slug)
    .slice(0, 4);

  return (
    <div>
      <section className="border-b border-line bg-cream/40">
        <div className="container-x pb-10 pt-[calc(72px+2rem)]">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] text-stone"
          >
            <Link
              href="/companies"
              className="inline-flex items-center gap-1 transition hover:text-ink"
            >
              <ArrowLeft className="h-3 w-3" />
              Companies
            </Link>
            <span className="text-line-strong">/</span>
            <span className="text-ink">{company.name}</span>
          </nav>

          <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-4">
                <CompanyMark
                  monogram={company.monogram}
                  tone={company.tone}
                  size="xl"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="display text-[clamp(2.4rem,4.6vw,3.5rem)] leading-none tracking-[-0.03em] text-ink">
                      {company.name}
                    </h1>
                    {company.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-1 text-[9.5px] font-medium text-sage-deep">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-2 max-w-lg text-[15px] leading-snug text-stone">
                    {company.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-stone">
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5" />
                  {company.industry}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {company.headcount} people
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.hq}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Founded {company.founded}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FollowButton name={company.name} />
              <ButtonLink href="#roles" size="md">
                See {roles.length} open {roles.length === 1 ? "role" : "roles"}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {company.photo && (
        <div className="container-x pt-6">
          <div className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden rounded-2xl border border-line">
            <Image
              src={company.photo}
              alt={`Inside ${company.name}`}
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-5 text-[10px] font-medium uppercase tracking-[0.14em] text-paper/80">
              Inside {company.name}
            </p>
          </div>
        </div>
      )}

      <div className="container-x grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_312px] lg:gap-16 lg:py-14">
        <div className="min-w-0">
          <section>
            <p className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-clay" />
              The work
            </p>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
              {company.about}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="display text-[24px] text-ink">What they believe</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {company.principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-line bg-paper-raised p-4"
                >
                  <span className="font-mono text-[9px] tracking-[0.14em] text-stone-light">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-[13px] font-medium leading-snug text-ink">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-stone">
                    {principle.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="display text-[24px] text-ink">What they offer</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {company.perks.map((perk) => (
                <span
                  key={perk}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3 py-1.5 text-[11.5px] text-ink-soft"
                >
                  <Check className="h-3 w-3 text-sage" strokeWidth={2.5} />
                  {perk}
                </span>
              ))}
            </div>
          </section>

          <section id="roles" className="mt-12 scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="display text-[24px] text-ink">Open roles</h2>
                <p className="mt-1 text-[11.5px] text-stone">
                  {roles.length} {roles.length === 1 ? "role" : "roles"} · all
                  with published salary ranges
                </p>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-stone-light">
                Replies in{" "}
                {company.responseTime
                  .replace("Usually replies within ", "")
                  .replace(".", "")}
              </span>
            </div>
            <div className="mt-4 divide-y divide-line/70 overflow-hidden rounded-xl border border-line bg-paper-raised/60 p-1.5">
              {roles.map((job) => (
                <JobRow key={job.slug} job={job} />
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-line bg-paper-raised p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage-deep">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[13.5px] font-medium text-ink">
                  The Morrow hiring standard
                </h2>
                <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-stone">
                  {company.name} publishes a salary range, a four-step process,
                  and a reply commitment before a role goes live. We check both
                  before publishing — and follow up when timelines slip.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
              At a glance
            </p>
            <dl className="mt-4 space-y-3 text-[11.5px]">
              {[
                { label: "Industry", value: company.industry },
                { label: "Team size", value: `${company.headcount} people` },
                { label: "Founded", value: company.founded },
                { label: "Head office", value: company.hq },
                {
                  label: "Working style",
                  value: company.locations.includes("Remote")
                    ? "Remote-friendly"
                    : "In studio",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5 last:border-0 last:pb-0"
                >
                  <dt className="text-stone">{item.label}</dt>
                  <dd className="text-right font-medium text-ink">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <a
              href={`https://${company.website}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink transition hover:text-clay-deep"
            >
              {company.website}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-cream/50 p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-clay-deep" />
              <p className="text-[12px] font-medium text-ink">How they hire</p>
            </div>
            <ol className="mt-3.5 space-y-3">
              {[
                "Intro conversation",
                "Craft conversation",
                "Meet the team",
                "Decision & offer",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-2.5 text-[11px] text-stone"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper font-mono text-[8.5px]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-3.5 border-t border-line pt-3 text-[10px] leading-relaxed text-stone-light">
              {company.responseTime}. A reply either way.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-5">
            <p className="text-[12px] font-medium text-ink">
              Also hiring nearby
            </p>
            <div className="mt-3 space-y-1">
              {otherCompanies.map((item) => (
                <Link
                  key={item.slug}
                  href={`/companies/${item.slug}`}
                  className="flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition hover:bg-cream/70"
                >
                  <CompanyMark
                    monogram={item.monogram}
                    tone={item.tone}
                    size="sm"
                    className="h-8 w-8 rounded-lg text-[10px]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-ink">
                      {item.name}
                    </p>
                    <p className="truncate text-[9.5px] text-stone">
                      {item.industry}
                    </p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-stone-light" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
