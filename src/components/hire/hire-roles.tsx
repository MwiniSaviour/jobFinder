"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  MoreHorizontal,
  Pause,
  Pencil,
  Plus,
  Users,
} from "lucide-react";
import { pipelineRoles, recruiterCandidates } from "@/data/pipeline";
import { jobs, timeAgo } from "@/data/jobs";
import { CompanyMark } from "@/components/ui/company-mark";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { salaryShort } from "@/lib/utils";

const stageColors = {
  Applied: "bg-line-strong",
  Screening: "bg-ochre",
  Interview: "bg-sage",
  Offer: "bg-clay",
  Hired: "bg-ink",
};

export function HireRoles() {
  const { toast } = useToast();

  const roles = pipelineRoles.map((role) => {
    const job = jobs.find(
      (item) => item.slug === role.slug && item.company === "lumen",
    );
    const candidates = recruiterCandidates.filter(
      (candidate) => candidate.job === role.slug,
    );
    const byStage = {
      Applied: candidates.filter((c) => c.stage === "Applied").length,
      Screening: candidates.filter((c) => c.stage === "Screening").length,
      Interview: candidates.filter((c) => c.stage === "Interview").length,
      Offer: candidates.filter((c) => c.stage === "Offer").length,
      Hired: candidates.filter((c) => c.stage === "Hired").length,
    };
    return { ...role, job, candidates, byStage };
  });

  const totalCandidates = recruiterCandidates.length;

  return (
    <>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">
            <span className="h-1 w-1 rounded-full bg-clay" />
            Lumen · design hiring
          </p>
          <h1 className="display mt-2.5 text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-ink">
            Roles
          </h1>
          <p className="mt-2 text-[12px] text-stone">
            Three live roles. Each with a published range and a real hiring
            process.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/hire/pipeline"
            className="inline-flex h-9 items-center rounded-lg border border-line bg-paper px-3.5 text-[11.5px] font-medium text-ink transition hover:bg-cream"
          >
            Open pipeline
          </Link>
          <ButtonLink href="/hire/jobs/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Post a role
          </ButtonLink>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Live roles", value: "3", icon: Briefcase },
          {
            label: "Candidates in play",
            value: String(totalCandidates),
            icon: Users,
          },
          { label: "Avg. days open", value: "12", icon: Clock3 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-line bg-paper p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-stone">{stat.label}</p>
              <stat.icon className="h-3.5 w-3.5 text-stone-light" />
            </div>
            <p className="display mt-1.5 text-[24px] leading-none text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {roles.map((role) => {
          const candidates = role.candidates;
          const inInterview = candidates.filter(
            (c) => c.stage === "Interview",
          ).length;
          const offers = candidates.filter((c) => c.stage === "Offer").length;
          return (
            <section
              key={role.slug}
              className="rounded-xl border border-line bg-paper"
            >
              <div className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CompanyMark monogram="L" tone="ink" size="md" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[14px] font-medium tracking-[-0.01em] text-ink">
                          {role.label}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-0.5 text-[9px] font-medium text-sage-deep">
                          <span className="h-1 w-1 rounded-full bg-sage" />
                          Live
                        </span>
                      </div>
                      <p className="mt-1 text-[10.5px] text-stone">
                        {role.job?.location} · {role.job?.workMode} ·{" "}
                        {role.job?.employmentType} ·{" "}
                        {role.job
                          ? `${salaryShort(role.job.salaryMin)} – ${salaryShort(role.job.salaryMax)}`
                          : "—"}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.08em] text-stone-light">
                        <CalendarDays className="h-2.5 w-2.5" />
                        Published {timeAgo(
                          role.job?.postedAt ?? "2026-10-01",
                        )}{" "}
                        · updated today
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/lumen/${role.slug}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[10px] font-medium text-ink transition hover:bg-cream"
                    >
                      <Eye className="h-3 w-3" />
                      Public listing
                    </Link>
                    <Menu
                      trigger={({ toggle }) => (
                        <button
                          type="button"
                          onClick={toggle}
                          aria-label={`Actions for ${role.label}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-stone transition hover:bg-cream hover:text-ink"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      )}
                      panelClassName="w-[200px]"
                    >
                      {({ close }) => (
                        <>
                          <MenuItem
                            onClick={() => {
                              toast({
                                title: "Edit role",
                                description: "The role editor would open here.",
                              });
                              close();
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit role
                          </MenuItem>
                          <MenuItem
                            href={`/jobs/lumen/${role.slug}`}
                            onClick={close}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View listing
                          </MenuItem>
                          <MenuSeparator />
                          <MenuItem
                            onClick={() => {
                              toast({
                                title: "Role paused",
                                description:
                                  "It's no longer visible to candidates.",
                              });
                              close();
                            }}
                          >
                            <Pause className="h-3.5 w-3.5" />
                            Pause role
                          </MenuItem>
                        </>
                      )}
                    </Menu>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-cream">
                      {Object.entries(role.byStage).map(([stage, count]) => (
                        <span
                          key={stage}
                          className={`${stageColors[stage as keyof typeof stageColors]} h-full transition-all`}
                          style={{
                            width: `${(count / candidates.length) * 100}%`,
                          }}
                          title={`${stage}: ${count}`}
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {Object.entries(role.byStage).map(([stage, count]) => (
                        <span
                          key={stage}
                          className="flex items-center gap-1.5 text-[9px] text-stone"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${stageColors[stage as keyof typeof stageColors]}`}
                          />
                          {stage}{" "}
                          <span className="font-mono text-stone-light">
                            {count}
                          </span>
                        </span>
                      ))}
                      <span className="ml-auto flex items-center gap-1.5 text-[9px] text-stone">
                        <Avatar
                          name="Amara Mensah"
                          src="/images/avatar-amara.jpg"
                          size="xs"
                          className="h-5 w-5 ring-1 ring-paper"
                        />
                        <Avatar
                          name="Theo Lindqvist"
                          size="xs"
                          className="h-5 w-5 ring-1 ring-paper"
                        />
                        <Avatar
                          name="Priya Raman"
                          src="/images/avatar-priya.jpg"
                          size="xs"
                          className="h-5 w-5 ring-1 ring-paper"
                        />
                        +{Math.max(candidates.length - 3, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div>
                      <p className="font-mono text-[13px] text-ink">
                        {candidates.length}
                      </p>
                      <p className="text-[8px] uppercase tracking-[0.08em] text-stone-light">
                        candidates
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[13px] text-ink">
                        {inInterview}
                      </p>
                      <p className="text-[8px] uppercase tracking-[0.08em] text-stone-light">
                        interview
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[13px] text-ink">{offers}</p>
                      <p className="text-[8px] uppercase tracking-[0.08em] text-stone-light">
                        offers
                      </p>
                    </div>
                    <Link
                      href={`/hire/pipeline?role=${role.slug}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-ink px-3 text-[10px] font-medium text-paper transition hover:bg-ink-soft"
                    >
                      Pipeline
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-cream/50 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper text-sage-deep">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[12px] font-medium text-ink">
              Your roles meet the Morrow standard
            </p>
            <p className="mt-1 max-w-md text-[10.5px] leading-relaxed text-stone">
              Salary range published, four-step process, and a reply commitment.
              This is why your listings get 2.4× more qualified applicants.
            </p>
          </div>
        </div>
        <Link
          href="/hire/jobs/new"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 text-[11px] font-medium text-ink transition hover:bg-cream"
        >
          Post another role
          <Plus className="h-3.5 w-3.5" />
        </Link>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-3.5 w-3.5 text-stone" />
            <p className="text-[11px] font-medium text-ink">Closed roles</p>
            <span className="rounded-full bg-cream px-1.5 py-0.5 font-mono text-[8.5px] text-stone">
              2
            </span>
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-stone-light">
            This year
          </span>
        </div>
        <div className="divide-y divide-line/60">
          {[
            {
              title: "Interaction Designer",
              closed: "Sep 2026",
              hired: "Grace Otieno",
              time: "31 days",
            },
            {
              title: "Brand Designer, Part-time",
              closed: "Jul 2026",
              hired: "Nadia Farouk",
              time: "24 days",
            },
          ].map((role) => (
            <div
              key={role.title}
              className="flex flex-wrap items-center gap-3 px-5 py-3"
            >
              <p className="flex-1 text-[11px] text-stone">{role.title}</p>
              <span className="text-[9.5px] text-stone-light">
                Closed {role.closed}
              </span>
              <span className="text-[9.5px] text-stone">
                Hired {role.hired}
              </span>
              <span className="rounded-full bg-cream px-2 py-0.5 font-mono text-[8.5px] text-stone">
                {role.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
