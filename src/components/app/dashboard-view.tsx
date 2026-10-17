"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Sparkles,
  Video,
} from "lucide-react";
import {
  applications,
  candidate,
  savedJobs,
  type Application,
} from "@/data/candidate";
import { getCompany } from "@/data/companies";
import { getJob, salaryLabel } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";
import { Avatar } from "@/components/ui/avatar";
import { StageBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useSaved } from "@/components/ui/saved-context";
import { formatDate, todayLabel, cn } from "@/lib/utils";

const tabs = ["All", "Active", "Offers", "Closed"] as const;
type Tab = (typeof tabs)[number];

function matchesTab(application: Application, tab: Tab) {
  if (tab === "All") return true;
  if (tab === "Active")
    return ["Applied", "In review", "Interview"].includes(application.stage);
  if (tab === "Offers") return application.stage === "Offer";
  return application.stage === "Closed";
}

export function DashboardView() {
  const [tab, setTab] = useState<Tab>("All");
  const [openId, setOpenId] = useState<string | null>("app-lumen-spd");
  const { toast } = useToast();
  const { count } = useSaved();

  const visible = applications.filter((application) =>
    matchesTab(application, tab),
  );
  const activeCount = applications.filter((application) =>
    matchesTab(application, "Active"),
  ).length;
  const stats = [
    {
      label: "Active applications",
      value: String(activeCount),
      hint: "2 updated this week",
      icon: FileText,
    },
    {
      label: "Interviews",
      value: String(applications.filter((a) => a.stage === "Interview").length),
      hint: "Next: 21 October",
      icon: Video,
    },
    {
      label: "Offers",
      value: String(applications.filter((a) => a.stage === "Offer").length),
      hint: "Respond by 22 Oct",
      icon: Sparkles,
    },
    { label: "Profile views", value: "48", hint: "+12 this week", icon: Eye },
  ];

  return (
    <>
      <section className="border-b border-line bg-cream/30">
        <div className="container-x pb-7 pt-8 lg:pt-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
                <CalendarDays className="h-3 w-3" />
                {todayLabel()}
              </p>
              <h1 className="display mt-3 text-[clamp(2.1rem,3.6vw,2.8rem)] leading-[1.02] text-ink">
                Morning, {candidate.firstName}.
              </h1>
              <p className="mt-2 text-[13px] text-stone">
                Four applications in motion — one offer waiting, and a craft
                session on Tuesday.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ButtonLink href="/dashboard/profile" variant="outline" size="sm">
                Edit profile
              </ButtonLink>
              <ButtonLink href="/jobs" size="sm">
                Browse roles
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-paper px-4 py-4 lg:px-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-stone">{stat.label}</p>
                  <stat.icon
                    className="h-3.5 w-3.5 text-stone-light"
                    strokeWidth={1.7}
                  />
                </div>
                <p className="display mt-2 text-[26px] leading-none text-ink">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10.5px] text-stone-light">
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_322px] lg:gap-10">
        <div className="min-w-0">
          {/* Offer banner */}
          <div className="relative overflow-hidden rounded-2xl border border-clay/25 bg-clay-soft/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <CompanyMark monogram="B" tone="ochre" size="md" />
                <div>
                  <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-clay-deep">
                    <Sparkles className="h-3 w-3" />
                    An offer is waiting
                  </p>
                  <p className="mt-1 text-[14.5px] font-medium text-ink">
                    Senior Product Designer · Basin
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-stone">
                    $138,000 base · Hybrid, Toronto · respond by 22 October
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Offer opened",
                      description:
                        "Your offer letter and equity summary are ready to review.",
                    })
                  }
                  className="inline-flex h-9 items-center rounded-[9px] bg-ink px-4 text-[12px] font-medium text-paper transition hover:bg-ink-soft"
                >
                  Review offer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Message drafted",
                      description:
                        "Nadia from Basin usually replies within a day.",
                    })
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-clay/25 bg-paper/60 px-3.5 text-[12px] font-medium text-ink transition hover:bg-paper"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Ask
                </button>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="display text-[23px] text-ink">
                  Your applications
                </h2>
                <p className="mt-1 text-[11.5px] text-stone">
                  Every step, in one honest timeline.
                </p>
              </div>
              <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper p-0.5">
                {tabs.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    aria-pressed={tab === item}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                      tab === item
                        ? "bg-ink text-paper"
                        : "text-stone hover:text-ink",
                    )}
                  >
                    {item}
                    {item === "All" && (
                      <span className="ml-1 font-mono text-[9px] opacity-60">
                        {applications.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {visible.length === 0 && (
                <div className="rounded-xl border border-dashed border-line-strong bg-paper-raised/50 px-6 py-14 text-center">
                  <p className="display text-[20px] text-ink">
                    Nothing in this view yet.
                  </p>
                  <p className="mt-1.5 text-[12px] text-stone">
                    Try another tab, or find a role worth opening.
                  </p>
                  <ButtonLink
                    href="/jobs"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Browse roles
                  </ButtonLink>
                </div>
              )}
              {visible.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  open={openId === application.id}
                  onToggle={() =>
                    setOpenId(openId === application.id ? null : application.id)
                  }
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-paper-raised/60 px-4 py-3.5">
              <p className="text-[11.5px] text-stone">
                Looking for something that fits better?
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink transition hover:text-clay-deep"
              >
                Explore 24 roles
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Rail */}
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
            <div className="border-b border-line bg-cream/50 px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
                Next up
              </p>
            </div>
            <div className="p-4">
              <div className="flex gap-3.5">
                <div className="flex h-[58px] w-[52px] shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-paper">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-clay-deep">
                    Oct
                  </span>
                  <span className="display text-[24px] leading-none text-ink">
                    21
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-snug text-ink">
                    Craft session · Lumen
                  </p>
                  <p className="mt-1 text-[11px] text-stone">
                    14:00 – 15:30 UTC · Video call
                  </p>
                  <div className="mt-2 flex items-center -space-x-1.5">
                    <Avatar
                      name="Maya Chen"
                      src="/images/avatar-mei.jpg"
                      size="xs"
                      className="ring-2 ring-paper"
                    />
                    <Avatar
                      name="Noah Williams"
                      src="/images/avatar-noah.jpg"
                      size="xs"
                      className="ring-2 ring-paper"
                    />
                    <span className="pl-2.5 text-[10px] text-stone">
                      Maya + 2 others
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Calendar file downloaded",
                      description: "Lumen craft session · 21 Oct, 14:00 UTC.",
                    })
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] border border-line-strong text-[11px] font-medium text-ink transition hover:bg-cream"
                >
                  <CalendarDays className="h-3 w-3" />
                  Add to calendar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Ready when you are",
                      description: "The call link is in your email.",
                    })
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[9px] bg-ink text-[11px] font-medium text-paper transition hover:bg-ink-soft"
                >
                  <Video className="h-3 w-3" />
                  Join call
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-4">
            <div className="flex items-center gap-3.5">
              <ProgressRing value={candidate.completeness} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-ink">
                  Profile strength
                </p>
                <p className="mt-0.5 text-[10.5px] leading-snug text-stone">
                  Add two more portfolio links to reach 100%.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-3">
              {[
                { label: "About & headline", done: true },
                { label: "Experience", done: true },
                { label: "Portfolio links", done: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <span
                    className={cn(
                      "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                      item.done
                        ? "bg-sage-soft text-sage-deep"
                        : "border border-line-strong text-transparent",
                    )}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span
                    className={
                      item.done ? "text-stone" : "font-medium text-ink"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-ink transition hover:text-clay-deep"
            >
              Finish your profile
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-paper-raised p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-medium text-ink">
                Saved for later
              </p>
              <span className="font-mono text-[9.5px] text-stone-light">
                {count} {count === 1 ? "role" : "roles"}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              {savedJobs.map((saved) => {
                const job = getJob(saved.company, saved.job);
                const company = getCompany(saved.company);
                if (!job || !company) return null;
                return (
                  <Link
                    key={`${saved.company}-${saved.job}`}
                    href={`/jobs/${saved.company}/${saved.job}`}
                    className="group flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition hover:bg-cream/70"
                  >
                    <CompanyMark
                      monogram={company.monogram}
                      tone={company.tone}
                      size="sm"
                      className="h-8 w-8 rounded-lg text-[11px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-medium text-ink">
                        {job.title}
                      </p>
                      <p className="truncate text-[10px] text-stone-light">
                        {company.name} · {salaryLabel(job)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-stone-light transition group-hover:text-ink" />
                  </Link>
                );
              })}
            </div>
            <Link
              href="/dashboard/saved"
              className="mt-2 inline-flex items-center gap-1 border-t border-line pt-3 text-[11px] font-medium text-ink transition hover:text-clay-deep"
            >
              View all saved
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-ink p-4 text-paper">
            <Sparkles className="h-4 w-4 text-ochre" />
            <p className="mt-2.5 text-[12px] font-medium">
              Six new matches this week
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-paper/55">
              Roles that fit your craft and salary expectations, chosen by a
              person.
            </p>
            <Link
              href="/jobs"
              className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-medium text-paper/90 transition hover:text-paper"
            >
              See matches
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

function ApplicationRow({
  application,
  open,
  onToggle,
}: {
  application: Application;
  open: boolean;
  onToggle: () => void;
}) {
  const company = getCompany(application.company);
  const job = getJob(application.company, application.job);
  const { toast } = useToast();
  if (!company || !job) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-raised transition-shadow hover:shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <CompanyMark
          monogram={company.monogram}
          tone={company.tone}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-medium text-ink">
              {job.title}
            </p>
            {application.stage === "Offer" && (
              <span className="rounded-full bg-clay px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-white">
                New
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[10.5px] text-stone">
            {company.name} · {job.location} · applied{" "}
            {formatDate(application.appliedAt, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <StageBadge stage={application.stage} />
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <div className="flex items-center gap-2 px-4 pb-3 sm:hidden">
        <StageBadge stage={application.stage} />
        {application.nextStep && (
          <span className="text-[10px] text-stone">
            Next:{" "}
            {formatDate(application.nextStep.date, {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {open && (
        <div className="animate-fade-in border-t border-line bg-cream/20 px-4 py-4">
          {application.nextStep && (
            <div className="mb-4 rounded-lg border border-line bg-paper px-3.5 py-3">
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-3 w-3 text-clay-deep" />
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-stone">
                  Next step
                </p>
                <span className="ml-auto font-mono text-[9px] text-stone">
                  {formatDate(application.nextStep.date, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] font-medium text-ink">
                {application.nextStep.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                {application.nextStep.detail}
              </p>
            </div>
          )}

          <ol className="relative space-y-3.5 border-l border-line pl-4">
            {application.events.map((event) => (
              <li key={`${event.date}-${event.title}`} className="relative">
                <span
                  className={cn(
                    "absolute -left-[21px] top-1 h-[7px] w-[7px] rounded-full border-2 border-paper",
                    event.tone === "positive" ? "bg-sage" : "bg-line-strong",
                  )}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[11.5px] font-medium text-ink">
                    {event.title}
                  </p>
                  <span className="font-mono text-[9px] text-stone-light">
                    {formatDate(event.date, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-stone">
                  {event.detail}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
            <Link
              href={`/jobs/${application.company}/${application.job}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-[10.5px] font-medium text-paper transition hover:bg-ink-soft"
            >
              View role
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Message drafted",
                  description: "A short, polite follow-up is ready to send.",
                })
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-[10.5px] font-medium text-ink transition hover:bg-cream"
            >
              <MessageSquare className="h-3 w-3" />
              Message team
            </button>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-stone-light">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-[58px] w-[58px] shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#ebe4d6"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#476b58"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-medium text-ink">
        {value}%
      </span>
    </div>
  );
}
