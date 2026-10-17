"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  GripVertical,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Send,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  pipelineStages,
  pipelineRoles,
  recruiterCandidates,
  type Candidate,
  type PipelineStage,
} from "@/data/pipeline";
import { getJob, timeAgo } from "@/data/jobs";
import { Avatar } from "@/components/ui/avatar";
import { StageBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate } from "@/lib/utils";

const stageMeta: Record<PipelineStage, { dot: string; soft: string }> = {
  Applied: { dot: "bg-stone-light", soft: "bg-cream text-stone" },
  Screening: { dot: "bg-ochre", soft: "bg-ochre-soft text-[#8a641f]" },
  Interview: { dot: "bg-sage", soft: "bg-sage-soft text-sage-deep" },
  Offer: { dot: "bg-clay", soft: "bg-clay-soft text-clay-deep" },
  Hired: { dot: "bg-ink", soft: "bg-ink text-paper" },
};

export function PipelineBoard({
  initialRole = "all",
}: {
  initialRole?: string;
}) {
  const [candidates, setCandidates] =
    useState<Candidate[]>(recruiterCandidates);
  const [role, setRole] = useState(initialRole);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<PipelineStage | null>(null);
  const { toast } = useToast();

  const selected =
    candidates.find((candidate) => candidate.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (role !== "all" && candidate.job !== role) return false;
      if (!q) return true;
      return `${candidate.name} ${candidate.currentRole} ${candidate.currentCompany} ${candidate.skills.join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [candidates, role, query]);

  const move = (candidateId: string, stage: PipelineStage) => {
    const person = candidates.find((candidate) => candidate.id === candidateId);
    if (!person || person.stage === stage) return;
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, stage } : candidate,
      ),
    );
    toast({
      title: `${person.name.split(" ")[0]} moved to ${stage}`,
      description: "Their timeline was updated, and the team can see it.",
      tone: "success",
    });
  };

  const updateNote = (candidateId: string, note: string) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, note } : candidate,
      ),
    );
  };

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const roleLabel = (slug: string) =>
    pipelineRoles.find((item) => item.slug === slug)?.label ?? slug;

  return (
    <>
      <header>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-clay" />
              Lumen · design hiring
            </p>
            <h1 className="display mt-2.5 text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-ink">
              Pipeline
            </h1>
            <p className="mt-2 text-[12px] text-stone">
              Drag a card to move someone forward. Everyone here has been told
              where they stand.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/hire/roles"
              className="inline-flex h-9 items-center rounded-lg border border-line bg-paper px-3.5 text-[11.5px] font-medium text-ink transition hover:bg-cream"
            >
              Manage roles
            </Link>
            <Link
              href="/hire/jobs/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[11.5px] font-medium text-paper transition hover:bg-ink-soft"
            >
              <Plus className="h-3.5 w-3.5" />
              Post a role
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidates"
              aria-label="Search candidates"
              className="h-9 w-[220px] rounded-lg border border-line bg-paper pl-8.5 pr-3 text-[11.5px] text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
              style={{ paddingLeft: "2.1rem" }}
            />
          </div>
          <div className="relative">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Filter by role"
              className="h-9 appearance-none rounded-lg border border-line bg-paper pl-3 pr-8 text-[11.5px] font-medium text-ink focus:border-ink focus:outline-none"
            >
              <option value="all">All roles</option>
              {pipelineRoles.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-stone" />
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-line bg-paper p-0.5">
            <button
              type="button"
              onClick={() => setView("board")}
              aria-pressed={view === "board"}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-medium transition",
                view === "board"
                  ? "bg-cream text-ink"
                  : "text-stone hover:text-ink",
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-medium transition",
                view === "list"
                  ? "bg-cream text-ink"
                  : "text-stone hover:text-ink",
              )}
            >
              <Users className="h-3 w-3" />
              List
            </button>
          </div>
        </div>
      </header>

      {view === "board" ? (
        <div className="no-scrollbar scroll-px-4 mt-5 flex snap-x gap-2.5 overflow-x-auto pb-4 lg:gap-3 lg:overflow-x-visible">
          {pipelineStages.map((stage) => {
            const people = visible.filter(
              (candidate) => candidate.stage === stage,
            );
            const meta = stageMeta[stage];
            return (
              <section
                key={stage}
                aria-label={stage}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTarget(stage);
                }}
                onDragLeave={() =>
                  setDropTarget((current) =>
                    current === stage ? null : current,
                  )
                }
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggingId) move(draggingId, stage);
                  setDraggingId(null);
                  setDropTarget(null);
                }}
                className={cn(
                  "flex min-w-[85%] flex-1 shrink-0 snap-start flex-col rounded-xl border bg-[#f6f3ec] transition-colors sm:min-w-[300px] lg:min-w-0 lg:shrink",
                  dropTarget === stage
                    ? "border-clay/50 bg-clay-soft/30"
                    : "border-line",
                )}
              >
                <div className="flex items-center justify-between border-b border-line/80 px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", meta.dot)}
                    />
                    <h2 className="text-[11px] font-medium text-ink">
                      {stage}
                    </h2>
                    <span className="rounded-full bg-paper px-1.5 py-0.5 font-mono text-[8.5px] text-stone">
                      {people.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Add candidate",
                        description: `Invite someone into ${stage.toLowerCase()}.`,
                      })
                    }
                    aria-label={`Add candidate to ${stage}`}
                    className="flex h-5 w-5 items-center justify-center rounded-md text-stone-light transition hover:bg-paper hover:text-ink"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div
                  className="flex-1 space-y-2 overflow-y-auto p-2"
                  style={{ maxHeight: "calc(100vh - 250px)", minHeight: 160 }}
                >
                  {people.map((candidate) => {
                    const job = getJob("lumen", candidate.job);
                    return (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={() => {
                          setDraggingId(candidate.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        onClick={() => setSelectedId(candidate.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(candidate.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          "group cursor-grab rounded-lg border border-line bg-paper p-3 transition hover:border-line-strong hover:shadow-soft focus-visible:border-ink focus-visible:outline-none active:cursor-grabbing",
                          draggingId === candidate.id && "opacity-40",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar
                            name={candidate.name}
                            src={candidate.avatar}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 truncate text-[11px] font-medium text-ink">
                              {candidate.name}
                              {candidate.tags?.includes("Top pick") && (
                                <span className="rounded bg-clay-soft px-1 py-0.5 font-mono text-[7px] uppercase tracking-[0.06em] text-clay-deep">
                                  Top
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[9px] leading-[1.35] text-stone">
                              {candidate.currentRole} ·{" "}
                              {candidate.currentCompany}
                            </p>
                          </div>
                          <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-line-strong opacity-0 transition group-hover:opacity-100" />
                        </div>

                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <Rating value={candidate.rating} />
                          <span className="rounded-full bg-cream px-1.5 py-0.5 text-[8px] font-medium text-stone">
                            {candidate.source}
                          </span>
                        </div>

                        {role === "all" && (
                          <p className="mt-2 truncate rounded bg-cream/60 px-1.5 py-1 text-[8px] text-stone">
                            {job?.title ?? roleLabel(candidate.job)}
                          </p>
                        )}

                        <div className="mt-2 flex items-center justify-between font-mono text-[8px] text-stone-light">
                          <span>{timeAgo(candidate.appliedAt)}</span>
                          <span>{candidate.years} yrs exp</span>
                        </div>
                      </div>
                    );
                  })}

                  {people.length === 0 && (
                    <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-line-strong p-4 text-center">
                      <p className="text-[9px] leading-relaxed text-stone-light">
                        No candidates here
                        <br />
                        Drop someone in
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-line bg-paper">
          <div className="hidden grid-cols-[1.6fr_1.1fr_110px_80px_100px_80px] gap-3 border-b border-line bg-cream/40 px-4 py-2.5 text-[8.5px] font-medium uppercase tracking-[0.1em] text-stone-light md:grid">
            <span>Candidate</span>
            <span>Role</span>
            <span>Stage</span>
            <span>Rating</span>
            <span>Applied</span>
            <span>Source</span>
          </div>
          <div className="divide-y divide-line/70">
            {visible.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setSelectedId(candidate.id)}
                className="grid w-full grid-cols-[1.5fr_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-cream/30 md:grid-cols-[1.6fr_1.1fr_110px_80px_100px_80px]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    name={candidate.name}
                    src={candidate.avatar}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-ink">
                      {candidate.name}
                    </p>
                    <p className="truncate text-[9px] text-stone">
                      {candidate.currentRole} · {candidate.currentCompany}
                    </p>
                  </div>
                </div>
                <span className="hidden truncate text-[10px] text-stone md:block">
                  {roleLabel(candidate.job)}
                </span>
                <span className="hidden md:block">
                  <StageBadge stage={candidate.stage} />
                </span>
                <span className="hidden md:block">
                  <Rating value={candidate.rating} />
                </span>
                <span className="hidden text-[9px] text-stone md:block">
                  {timeAgo(candidate.appliedAt)}
                </span>
                <span className="hidden text-[9px] text-stone md:block">
                  {candidate.source}
                </span>
                <span className="md:hidden">
                  <StageBadge stage={candidate.stage} />
                </span>
              </button>
            ))}
            {visible.length === 0 && (
              <div className="px-4 py-16 text-center">
                <p className="text-[12px] font-medium text-ink">
                  No candidates match that search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setRole("all");
                  }}
                  className="mt-3 text-[10.5px] font-medium text-stone underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate drawer */}
      {selected && (
        <div className="fixed inset-0 z-[80]">
          <button
            type="button"
            aria-label="Close candidate panel"
            onClick={() => setSelectedId(null)}
            className="animate-fade-in absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Candidate ${selected.name}`}
            className="animate-slide-left absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col border-l border-line bg-paper shadow-panel"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-stone">
                Candidate
              </p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-stone transition hover:bg-cream hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-line px-5 py-5">
                <div className="flex items-start gap-3.5">
                  <Avatar
                    name={selected.name}
                    src={selected.avatar}
                    size="xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[17px] font-medium tracking-[-0.01em] text-ink">
                        {selected.name}
                      </h2>
                      {selected.tags?.includes("Top pick") && (
                        <span className="rounded bg-clay-soft px-1.5 py-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em] text-clay-deep">
                          Top pick
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-stone">
                      {selected.currentRole} at {selected.currentCompany}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Rating value={selected.rating} />
                      <span className="text-[9.5px] text-stone-light">
                        {selected.years} years · {selected.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3.5 flex items-center gap-2">
                  <StageBadge stage={selected.stage} />
                  <span className="text-[9.5px] text-stone">
                    Applied {formatDate(selected.appliedAt)}
                  </span>
                  <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[9px] text-stone">
                    via {selected.source}
                  </span>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="grid gap-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2.5 rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-[11px] text-ink-soft transition hover:border-line-strong"
                  >
                    <Mail className="h-3.5 w-3.5 text-stone" />
                    {selected.email}
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-[10px] text-stone">
                      <Phone className="h-3 w-3" />
                      <span className="truncate">{selected.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-[10px] text-stone">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{selected.location}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-light">
                    Summary
                  </p>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
                    {selected.summary}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-light">
                    Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-line bg-paper px-2.5 py-1 text-[10px] text-stone"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-paper-raised p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-clay-deep" />
                    <p className="text-[10.5px] font-medium text-ink">
                      {selected.resume}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Resume opened",
                          description: `${selected.resume} · 214 KB`,
                        })
                      }
                      className="ml-auto text-[9.5px] font-medium text-ink underline decoration-line-strong underline-offset-4"
                    >
                      Open
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-light">
                    Stage
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pipelineStages.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => move(selected.id, stage)}
                        aria-pressed={selected.stage === stage}
                        className={cn(
                          "rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition",
                          selected.stage === stage
                            ? "border-ink bg-ink text-paper"
                            : "border-line bg-paper text-stone hover:border-line-strong hover:text-ink",
                        )}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-light">
                      Team note
                    </p>
                    <span className="text-[8.5px] text-stone-light">
                      Visible to Lumen hiring team
                    </span>
                  </div>
                  <textarea
                    value={selected.note}
                    onChange={(event) =>
                      updateNote(selected.id, event.target.value)
                    }
                    placeholder="Add context for the panel…"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-[11px] leading-relaxed text-ink placeholder:text-stone-light focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Note saved",
                        description: "The hiring team will see it right away.",
                      })
                    }
                    className="mt-1.5 inline-flex items-center gap-1 text-[9.5px] font-medium text-ink"
                  >
                    <Check className="h-3 w-3" />
                    Save note
                  </button>
                </div>

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-stone-light">
                    Timeline
                  </p>
                  <div className="mt-2 space-y-2.5 border-l border-line pl-3">
                    {[
                      {
                        title: `Applied via ${selected.source}`,
                        date: formatDate(selected.appliedAt),
                      },
                      {
                        title: `Moved to ${selected.stage}`,
                        date: "This week",
                      },
                      {
                        title: "Profile viewed by Maya Chen",
                        date: "This week",
                      },
                    ].map((event) => (
                      <div key={event.title} className="relative">
                        <span className="absolute -left-[17px] top-1 h-1.5 w-1.5 rounded-full bg-line-strong" />
                        <p className="text-[10px] text-ink">{event.title}</p>
                        <p className="font-mono text-[8px] text-stone-light">
                          {event.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line bg-paper px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  toast({
                    title: "Candidate archived",
                    description:
                      "They'll receive a thoughtful note from Lumen.",
                  });
                  setSelectedId(null);
                }}
                className="h-9 rounded-lg border border-line px-3 text-[10.5px] font-medium text-stone transition hover:border-clay/30 hover:text-clay-deep"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Message drafted",
                    description: `A short note to ${selected.name.split(" ")[0]} is ready.`,
                  })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[10.5px] font-medium text-ink transition hover:bg-cream"
              >
                <Send className="h-3 w-3" />
                Message
              </button>
              <Button
                size="sm"
                className="ml-auto h-9"
                onClick={() => {
                  const index = pipelineStages.indexOf(selected.stage);
                  const next =
                    index < pipelineStages.length - 1
                      ? pipelineStages[index + 1]
                      : selected.stage;
                  move(selected.id, next);
                }}
              >
                {selected.stage === "Hired" ? "Send a note" : "Advance stage"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-2.5 w-2.5",
            star <= value
              ? "fill-ochre text-ochre"
              : "fill-transparent text-line-strong",
          )}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 font-mono text-[8.5px] text-stone-light">
        {value.toFixed(1)}
      </span>
    </div>
  );
}
