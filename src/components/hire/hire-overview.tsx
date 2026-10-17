"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  Check,
  Clock3,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { StageBadge } from "@/components/ui/badge";
import {
  recruiterCandidates,
  pipelineStages,
  pipelineRoles,
} from "@/data/pipeline";
import { jobs } from "@/data/jobs";
import { todayLabel, salaryShort } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const stageOrder = pipelineStages;

const statCards = [
  {
    label: "Open roles",
    value: "3",
    delta: "+1 this month",
    icon: Briefcase,
    trend: [2, 2, 2, 3, 3, 3, 3],
  },
  {
    label: "Candidates",
    value: "24",
    delta: "+6 this week",
    icon: Users,
    trend: [12, 14, 15, 17, 19, 22, 24],
  },
  {
    label: "In interview",
    value: "5",
    delta: "2 need feedback",
    icon: CalendarClock,
    trend: [2, 3, 3, 4, 4, 5, 5],
  },
  {
    label: "Median time to hire",
    value: "21d",
    delta: "−4 days vs last cycle",
    icon: TrendingUp,
    trend: [32, 30, 28, 27, 25, 23, 21],
  },
];

export function HireOverview() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([
    {
      id: "t1",
      label: "Approve Priya's offer letter",
      detail: "Senior Product Designer · due today",
      done: false,
    },
    {
      id: "t2",
      label: "Review 4 new portfolios",
      detail: "Senior Product Designer · due today",
      done: false,
    },
    {
      id: "t3",
      label: "Confirm Thursday's panel",
      detail: "Design Systems Lead · due tomorrow",
      done: false,
    },
  ]);

  const counts = stageOrder.map((stage) => ({
    stage,
    count: recruiterCandidates.filter((candidate) => candidate.stage === stage)
      .length,
  }));
  const total = recruiterCandidates.length;

  const roleStats = pipelineRoles.map((role) => {
    const job = jobs.find(
      (item) => item.slug === role.slug && item.company === "lumen",
    );
    const candidates = recruiterCandidates.filter(
      (candidate) => candidate.job === role.slug,
    );
    return {
      ...role,
      job,
      total: candidates.length,
      inInterview: candidates.filter((c) => c.stage === "Interview").length,
      offers: candidates.filter((c) => c.stage === "Offer").length,
      newThisWeek: candidates.filter((c) => c.stage === "Applied").length,
      hired: candidates.filter((c) => c.stage === "Hired").length,
    };
  });

  return (
    <>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone">
            {todayLabel()}
          </p>
          <h1 className="display mt-2 text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-ink">
            Morning, Maya.
          </h1>
          <p className="mt-2 text-[12px] text-stone">
            Your pipeline moved 6 times since yesterday. Two candidates are
            waiting on you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Report queued",
                description: "A weekly hiring summary is on its way.",
              })
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 text-[11.5px] font-medium text-ink transition hover:bg-cream"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            This week
          </button>
          <ButtonLink href="/hire/jobs/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Post a role
          </ButtonLink>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-line bg-paper p-4"
          >
            <div className="flex items-start justify-between">
              <p className="text-[10.5px] text-stone">{stat.label}</p>
              <stat.icon
                className="h-3.5 w-3.5 text-stone-light"
                strokeWidth={1.7}
              />
            </div>
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="display text-[27px] leading-none text-ink">
                {stat.value}
              </p>
              <svg
                viewBox="0 0 72 24"
                className="h-6 w-[64px] overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={`M ${stat.trend.map((value, index) => `${(index / (stat.trend.length - 1)) * 68 + 2},${22 - (value / Math.max(...stat.trend)) * 18}`).join(" L ")}`}
                  fill="none"
                  stroke="#476b58"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.75"
                />
              </svg>
            </div>
            <p className="mt-1.5 text-[9.5px] text-stone-light">{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_302px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <h2 className="text-[12.5px] font-medium text-ink">
                  Hiring pipeline
                </h2>
                <p className="mt-0.5 text-[10px] text-stone">
                  {total} candidates across 3 roles
                </p>
              </div>
              <Link
                href="/hire/pipeline"
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-medium text-ink transition hover:bg-cream"
              >
                Open pipeline
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
              {counts.map((column, index) => {
                const people = recruiterCandidates
                  .filter((candidate) => candidate.stage === column.stage)
                  .slice(0, 3);
                return (
                  <Link
                    href="/hire/pipeline"
                    key={column.stage}
                    className="group bg-paper p-4 transition hover:bg-cream/30"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          index === 0 && "bg-stone-light",
                          index === 1 && "bg-ochre",
                          index === 2 && "bg-sage",
                          index === 3 && "bg-clay",
                          index === 4 && "bg-ink",
                        )}
                      />
                      <p className="text-[10px] font-medium text-stone">
                        {column.stage}
                      </p>
                    </div>
                    <p className="display mt-2 text-[24px] leading-none text-ink">
                      {column.count}
                    </p>
                    <div className="mt-3 flex items-center">
                      {people.length > 0 ? (
                        <div className="flex -space-x-1.5">
                          {people.map((person) => (
                            <Avatar
                              key={person.id}
                              name={person.name}
                              src={person.avatar}
                              size="xs"
                              className="ring-2 ring-paper"
                            />
                          ))}
                          {column.count > 3 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream font-mono text-[8px] text-stone ring-2 ring-paper">
                              +{column.count - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] text-stone-light">
                          Nobody yet
                        </span>
                      )}
                    </div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-cream">
                      <div
                        className="h-full rounded-full bg-ink/70 transition-all duration-700"
                        style={{ width: `${(column.count / total) * 100}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <h2 className="text-[12.5px] font-medium text-ink">
                  Open roles
                </h2>
                <p className="mt-0.5 text-[10px] text-stone">
                  Live for candidates right now
                </p>
              </div>
              <Link
                href="/hire/roles"
                className="text-[10px] font-medium text-stone underline decoration-line-strong underline-offset-4 transition hover:text-ink"
              >
                Manage roles
              </Link>
            </div>
            <div className="divide-y divide-line/70">
              {roleStats.map((role) => (
                <div
                  key={role.slug}
                  className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-cream/25"
                >
                  <CompanyMark monogram="L" tone="ink" size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/jobs/lumen/${role.slug}`}
                      className="truncate text-[12px] font-medium text-ink transition hover:text-clay-deep"
                    >
                      {role.label}
                    </Link>
                    <p className="mt-0.5 text-[9.5px] text-stone">
                      {role.job?.location} ·{" "}
                      {role.job
                        ? `${salaryShort(role.job.salaryMin)} – ${salaryShort(role.job.salaryMax)}`
                        : "—"}
                    </p>
                  </div>
                  <div className="hidden items-center gap-5 sm:flex">
                    <div className="text-right">
                      <p className="font-mono text-[11px] text-ink">
                        {role.total}
                      </p>
                      <p className="text-[8.5px] uppercase tracking-[0.08em] text-stone-light">
                        candidates
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[11px] text-ink">
                        {role.inInterview}
                      </p>
                      <p className="text-[8.5px] uppercase tracking-[0.08em] text-stone-light">
                        interview
                      </p>
                    </div>
                    <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[8.5px] font-medium text-sage-deep">
                      Active
                    </span>
                  </div>
                  <Link
                    href={`/hire/pipeline?role=${role.slug}`}
                    aria-label={`Open pipeline for ${role.label}`}
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-stone transition group-hover:border-line group-hover:bg-paper hover:text-ink"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <p className="text-[9.5px] text-stone-light">
                Roles include a salary range and a published process.
              </p>
              <Link
                href="/hire/jobs/new"
                className="inline-flex items-center gap-1 text-[10px] font-medium text-ink"
              >
                <Plus className="h-3 w-3" />
                Add a role
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-paper p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[12.5px] font-medium text-ink">
                  Recent activity
                </h2>
                <p className="mt-0.5 text-[10px] text-stone">
                  The last three days, as it happened
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Activity log",
                    description: "Showing everything from this hiring cycle.",
                  })
                }
                className="text-[10px] font-medium text-stone transition hover:text-ink"
              >
                See all
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              {[
                {
                  name: "Amara Mensah",
                  detail: "moved to Craft session",
                  meta: "2h ago",
                  stage: "Interview" as const,
                },
                {
                  name: "Priya Raman",
                  detail: "received an offer",
                  meta: "Yesterday",
                  stage: "Offer" as const,
                },
                {
                  name: "Yara Saleh",
                  detail: "offer approved by finance",
                  meta: "Yesterday",
                  stage: "Offer" as const,
                },
                {
                  name: "Ravi Shah",
                  detail: "applied via Morrow",
                  meta: "2d ago",
                  stage: "Applied" as const,
                },
              ].map((event) => (
                <div
                  key={`${event.name}-${event.meta}`}
                  className="flex items-center gap-3"
                >
                  <CompanyMark
                    monogram={event.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                    tone="stone"
                    size="sm"
                    className="h-7 w-7 rounded-full text-[9px]"
                  />
                  <p className="flex-1 text-[10.5px] text-stone">
                    <span className="font-medium text-ink">{event.name}</span>{" "}
                    {event.detail}
                  </p>
                  <StageBadge stage={event.stage} />
                  <span className="w-12 text-right font-mono text-[8.5px] text-stone-light">
                    {event.meta}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-paper">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[11.5px] font-medium text-ink">
                Needs you today
              </p>
              <span className="rounded-full bg-clay-soft px-1.5 py-0.5 font-mono text-[8.5px] text-clay-deep">
                3
              </span>
            </div>
            <div className="p-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setTasks(
                      tasks.map((item) =>
                        item.id === task.id
                          ? { ...item, done: !item.done }
                          : item,
                      ),
                    );
                    toast({
                      title: task.done ? "Back on your list" : "Nicely done",
                      description: task.done
                        ? task.label
                        : "That's one thing off your plate.",
                      tone: task.done ? "default" : "success",
                    });
                  }}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition hover:bg-cream/60"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition",
                      task.done
                        ? "border-sage bg-sage text-white"
                        : "border-line-strong bg-paper",
                    )}
                  >
                    {task.done && (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-[10.5px] font-medium",
                        task.done
                          ? "text-stone-light line-through"
                          : "text-ink",
                      )}
                    >
                      {task.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-stone-light">
                      {task.detail}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-stone" />
              <p className="text-[11.5px] font-medium text-ink">This week</p>
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                {
                  day: "TUE",
                  date: "20",
                  title: "Craft session · Amara",
                  meta: "14:00 · 90 min",
                },
                {
                  day: "THU",
                  date: "22",
                  title: "Final panel · Marcus",
                  meta: "11:00 · 2 hrs",
                },
                {
                  day: "FRI",
                  date: "23",
                  title: "Hiring sync · Design",
                  meta: "15:30 · 30 min",
                },
              ].map((event) => (
                <div key={event.title} className="flex items-center gap-3">
                  <div className="flex h-9 w-8 shrink-0 flex-col items-center justify-center rounded-md border border-line bg-paper">
                    <span className="font-mono text-[7px] tracking-[0.1em] text-stone-light">
                      {event.day}
                    </span>
                    <span className="text-[12px] font-medium leading-none text-ink">
                      {event.date}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink">
                      {event.title}
                    </p>
                    <p className="truncate text-[9px] text-stone-light">
                      {event.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-ink p-4 text-paper">
            <Sparkles className="h-4 w-4 text-ochre" />
            <p className="mt-2 text-[11.5px] font-medium">Two offers out</p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-paper/55">
              Priya and Yara are deciding. A short, warm note today tends to
              help — and it&apos;s the sort of thing people remember.
            </p>
            <button
              type="button"
              onClick={() =>
                toast({
                  title: "Reminder set",
                  description: "We'll nudge you on Thursday morning.",
                })
              }
              className="mt-3 inline-flex h-7 items-center gap-1 rounded-md border border-paper/20 px-2.5 text-[9.5px] font-medium text-paper transition hover:bg-paper/10"
            >
              Remind me
              <Clock3 className="h-2.5 w-2.5" />
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
