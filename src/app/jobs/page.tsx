"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ChevronLeftIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  HeartIcon,
  ShareIcon,
  SlidersIcon,
  StarIcon,
  XIcon,
} from "../../components/Icons";
import { FilterSheet } from "../../components/FilterSheet";
import { SearchBar } from "../../components/SearchBar";
import { SavedListRow } from "../../components/SavedListRow";
import { PromiseStrip } from "../../components/PromiseStrip";
import { Chip } from "../../components/Chip";
import { CategoryTile } from "../../components/CategoryTile";
import { CategoryTileRow, ChipRow } from "../../components/FilterChips";
import { SectionHeader } from "../../components/SectionHeader";
import {
  CATEGORIES,
  SORT_LABELS,
  jobs,
  salaryLabel,
  type JobListing,
} from "../../lib/jobs";
import {
  freshFilters,
  freshState,
  onFiltersChange,
  onJobsChange,
  readFilters,
  readJobsState,
  writeFilters,
  writeJobsState,
  type Filters,
  type JobsState,
} from "../../lib/state";
import {
  createApplication,
  withdrawApplication,
  isTerminalStatus,
  APPLICATION_STATUS_COPY,
  APPLICATION_STATUS_LABEL,
} from "../../lib/applications";

type View = "intake" | "results" | "detail";

const START_OPTIONS = ["Today", "This week", "Next few weeks"];
const PROMISES = ["Pay listed upfront", "Reply within 3 days", "No account needed"];
const SUGGESTIONS = ["Barista", "Delivery driver", "Warehouse"];

const SERVER_JOBS_SNAPSHOT = freshState();
const SERVER_FILTERS_SNAPSHOT = freshFilters();

let toastTimer: number | null = null;

function getJobsSnapshot(): JobsState {
  if (typeof window === "undefined") {
    return SERVER_JOBS_SNAPSHOT;
  }
  return readJobsState();
}

function getJobsServerSnapshot(): JobsState {
  return SERVER_JOBS_SNAPSHOT;
}

function getFiltersSnapshot(): Filters {
  if (typeof window === "undefined") {
    return SERVER_FILTERS_SNAPSHOT;
  }
  return readFilters();
}

function getFiltersServerSnapshot(): Filters {
  return SERVER_FILTERS_SNAPSHOT;
}

let jobQuery = "";
let urlQuerySeeded = false;
const jobQueryListeners = new Set<() => void>();

function readUrlQuery(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
}

function getJobQuerySnapshot(): string {
  return jobQuery;
}

function getJobQueryServerSnapshot(): string {
  return "";
}

function subscribeToJobQuery(listener: () => void): () => void {
  jobQueryListeners.add(listener);
  if (!urlQuerySeeded) {
    urlQuerySeeded = true;
    const seeded = readUrlQuery();
    if (seeded && seeded !== jobQuery) {
      jobQuery = seeded;
      listener();
    }
  }
  return () => {
    jobQueryListeners.delete(listener);
  };
}

function setJobQuery(next: string): void {
  if (next === jobQuery) {
    return;
  }
  jobQuery = next;
  jobQueryListeners.forEach((listener) => listener());
}

let jobDetailId: number | null = null;
let jobDetailIdSeeded = false;
const jobDetailIdListeners = new Set<() => void>();

function readUrlJobId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("id");
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return null;
  return jobs.some((job) => job.id === parsed) ? parsed : null;
}

function getJobDetailIdSnapshot(): number | null {
  return jobDetailId;
}

function getJobDetailIdServerSnapshot(): number | null {
  return null;
}

function subscribeToJobDetailId(listener: () => void): () => void {
  jobDetailIdListeners.add(listener);
  if (!jobDetailIdSeeded) {
    jobDetailIdSeeded = true;
    const seeded = readUrlJobId();
    if (seeded !== null && seeded !== jobDetailId) {
      jobDetailId = seeded;
      listener();
    }
  }
  return () => {
    jobDetailIdListeners.delete(listener);
  };
}

function clearUrlJobId(): void {
  if (jobDetailId === null) return;
  jobDetailId = null;
  jobDetailIdListeners.forEach((listener) => listener());
}

let jobCategory = "";
const jobCategoryListeners = new Set<() => void>();

function readUrlCategory(): string {
  return typeof window === "undefined"
    ? ""
    : (new URLSearchParams(window.location.search).get("category")?.trim() ?? "");
}

function getJobCategorySnapshot(): string {
  return jobCategory;
}

function getJobCategoryServerSnapshot(): string {
  return "";
}

function subscribeToJobCategory(listener: () => void): () => void {
  jobCategoryListeners.add(listener);
  const seeded = readUrlCategory();
  if (seeded !== jobCategory) {
    jobCategory = seeded;
    listener();
  }
  return () => {
    jobCategoryListeners.delete(listener);
  };
}

function setJobCategory(next: string): void {
  if (next === jobCategory) {
    return;
  }
  jobCategory = next;
  jobCategoryListeners.forEach((listener) => listener());
}

type ResultCardProps = {
  job: JobListing;
  applied: boolean;
  entranceDelay?: number;
  onOpen: () => void;
  onApply: () => void;
};

function ResultCard({ job, applied, entranceDelay, onOpen, onApply }: ResultCardProps) {
  const style = entranceDelay === undefined ? undefined : ({ "--hero-delay": `${entranceDelay}ms` } as CSSProperties);

  return (
    <article
      className="hero-rise rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-nav motion-reduce:hover:translate-y-0"
      style={style}
    >
      <button className="flex w-full items-start gap-3 text-left" onClick={onOpen}>
        <CategoryTile category={job.category} size="md" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{job.title}</span>
          <span className="mt-0.5 block text-xs font-medium text-muted">{job.type}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {job.company} · {job.location} · {job.posted}
          </span>
          <span className="mt-2 line-clamp-2 block text-[13px] text-muted">{job.blurb}</span>
        </span>
      </button>
      <div className="mt-3 flex items-center gap-2">
        {job.salary ? (
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
            {salaryLabel(job.salary)}
          </span>
        ) : (
          <span className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[12px] font-medium text-muted">
            Pay not listed
          </span>
        )}
        <span className="text-[12px] text-muted">
          <StarIcon className="size-3.5 text-accent" /> {job.rating.toFixed(1)} ({job.reviews})
        </span>
        {applied ? (
          <span className="ml-auto rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white">
            Applied
          </span>
        ) : (
          <button
            className="ml-auto rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-strong"
            onClick={onApply}
          >
            Apply
          </button>
        )}
      </div>
    </article>
  );
}

export default function JobsPage() {
  const state = useSyncExternalStore(onJobsChange, getJobsSnapshot, getJobsServerSnapshot);
  const filters = useSyncExternalStore(
    onFiltersChange,
    getFiltersSnapshot,
    getFiltersServerSnapshot,
  );
  const query = useSyncExternalStore(subscribeToJobQuery, getJobQuerySnapshot, getJobQueryServerSnapshot);
  const [view, setView] = useState<View>("intake");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [returnTo, setReturnTo] = useState<View>("intake");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [startChoice, setStartChoice] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer !== null) {
      window.clearTimeout(toastTimer);
    }
    setToast(message);
    toastTimer = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const updateJobsState = useCallback((updater: (prev: JobsState) => JobsState) => {
    writeJobsState(updater(readJobsState()));
  }, []);

  const updateFilters = useCallback((updater: (prev: Filters) => Filters) => {
    writeFilters(updater(readFilters()));
  }, []);

  const appliedIds = useMemo(
    () => state.applications.map((application) => application.jobId),
    [state.applications],
  );

  const deepLinkId = useSyncExternalStore(
    subscribeToJobDetailId,
    getJobDetailIdSnapshot,
    getJobDetailIdServerSnapshot,
  );

  const effectiveDetailId = detailId ?? deepLinkId;

  const applicationRecord = useMemo(
    () =>
      state.applications.find((application) => application.jobId === effectiveDetailId) ?? null,
    [effectiveDetailId, state.applications],
  );

  const runSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) {
        return;
      }
      updateJobsState((prev) => ({
        ...prev,
        recents: [q, ...prev.recents.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 20),
      }));
      setJobQuery(q);
      setView("results");
    },
    [updateJobsState],
  );

  const openDetail = useCallback((jobId: number, from: View) => {
    setDetailId(jobId);
    setReturnTo(from);
    setApplying(false);
    setApplyStep(1);
    setStartChoice(null);
    setNote("");
    setView("detail");
  }, []);

  const startApply = useCallback(
    (jobId: number, from: View) => {
      openDetail(jobId, from);
      setApplying(true);
    },
    [openDetail],
  );

  const goBack = useCallback(() => {
    const target = deepLinkId !== null && returnTo === "intake" ? "results" : returnTo;
    clearUrlJobId();
    setView(target);
  }, [deepLinkId, returnTo]);

  const toggleSave = useCallback(
    (jobId: number) => {
      updateJobsState((prev) => ({
        ...prev,
        savedIds: prev.savedIds.includes(jobId)
          ? prev.savedIds.filter((id) => id !== jobId)
          : [...prev.savedIds, jobId],
      }));
    },
    [updateJobsState],
  );

  const submitApply = useCallback(
    (jobId: number) => {
      const existing = readJobsState().applications.find(
        (application) => application.jobId === jobId,
      );
      if (existing && existing.status !== "withdrawn") return;
      const record = createApplication(jobId, startChoice, note.trim());
      updateJobsState((prev) => ({
        ...prev,
        applications: [
          ...prev.applications.filter((application) => application.jobId !== jobId),
          record,
        ],
      }));
      setApplying(false);
      showToast("Application sent.");
    },
    [note, showToast, startChoice, updateJobsState],
  );

  const withdrawApplicationFor = useCallback(
    (jobId: number) => {
      updateJobsState((prev) => ({
        ...prev,
        applications: prev.applications.map((application) =>
          application.jobId === jobId ? withdrawApplication(application) : application,
        ),
      }));
    },
    [updateJobsState],
  );

  const toggleCategoryFilter = useCallback(
    (category: string) => {
      updateFilters((prev) => ({
        ...prev,
        categories: prev.categories.includes(category)
          ? prev.categories.filter((item) => item !== category)
          : [...prev.categories, category],
      }));
      setView("results");
    },
    [updateFilters],
  );

  const clearFilters = useCallback(() => {
    updateFilters(() => ({
      categories: [],
      includeUnlisted: false,
      sort: "new",
    }));
    setJobQuery("");
    setJobCategory("");
  }, [updateFilters]);

  const openSheet = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const shareJob = useCallback(
    (job: JobListing) => {
      const url = `${window.location.origin}/jobs?id=${job.id}`;
      if (typeof navigator.share === "function") {
        void navigator.share({ title: job.title, url }).catch(() => {});
        return;
      }
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showToast("Link copied.");
        })
        .catch((error) => {
          console.warn("JobFinder: unable to copy share link", error);
        });
    },
    [showToast],
  );

  const urlCategory = useSyncExternalStore(
    subscribeToJobCategory,
    getJobCategorySnapshot,
    getJobCategoryServerSnapshot,
  );

  const { results, activeFilterCount } = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = jobs.filter((job) => {
      if (q) {
        const haystack = `${job.title} ${job.company} ${job.location} ${job.blurb}`.toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      if (urlCategory && urlCategory !== job.category) {
        return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(job.category)) {
        return false;
      }
      if (!filters.includeUnlisted && job.salary === null) {
        return false;
      }
      return true;
    });
    const sorted =
      filters.sort === "pay"
        ? [...filtered].sort((a, b) => (b.salary?.amount ?? -1) - (a.salary?.amount ?? -1))
        : filtered;
    return {
      results: sorted,
      activeFilterCount:
        filters.categories.length +
        (filters.includeUnlisted ? 1 : 0) +
        (urlCategory && !filters.categories.includes(urlCategory) ? 1 : 0),
    };
  }, [filters, query, urlCategory]);

  const detailJob =
    effectiveDetailId === null
      ? null
      : (jobs.find((job) => job.id === effectiveDetailId) ?? null);
  const effectiveView =
    view === "intake" && (query !== "" || urlCategory !== "") ? "results" : view;

  const renderIntake = () => (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.01em]">Find work nearby</h1>
        <p className="mt-1 text-[15px] text-muted">Search gigs and part-time jobs you can start fast.</p>
      </div>
      <section className="space-y-3">
        <SectionHeader title="Recently searched" />
        {state.recents.length > 0 ? (
          <div className="space-y-2.5">
            {state.recents.map((recent) => (
              <SavedListRow
                key={recent}
                icon={<ClockIcon className="size-5 text-muted" />}
                primary={recent}
                onClick={() => runSearch(recent)}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-[16px] border border-border bg-surface p-4 text-[13px] text-muted">
            Searches you run show up here.
          </p>
        )}
      </section>
      <section className="space-y-3">
        <SectionHeader title="Categories" />
        <CategoryTileRow categories={CATEGORIES} onSelect={toggleCategoryFilter} />
      </section>
      <section className="space-y-3">
        <SectionHeader title="Browse all openings" />
        <div className="space-y-3">
          {jobs
            .filter((job) => job.salary !== null || filters.includeUnlisted)
            .map((job) => (
              <ResultCard
                key={job.id}
                job={job}
                applied={appliedIds.includes(job.id)}
                onOpen={() => openDetail(job.id, "intake")}
                onApply={() => startApply(job.id, "intake")}
              />
            ))}
        </div>
      </section>
    </div>
  );

  const renderResults = () => (
    <div className="flex flex-col gap-4 pb-4">
      <SearchBar onSearch={runSearch} initialValue={query} placeholder="Search job title or company" />
      <ChipRow label="Filters">
        <Chip active={activeFilterCount > 0} onClick={openSheet}>
          <SlidersIcon className="size-3.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Chip>
        {filters.sort === "pay" ? (
          <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-muted">
            {SORT_LABELS[filters.sort]}
          </span>
        ) : null}
        {filters.includeUnlisted ? (
          <Chip
            active
            onClick={() => updateFilters((prev) => ({ ...prev, includeUnlisted: false }))}
          >
            Unlisted pay
            <XIcon className="size-3.5" />
          </Chip>
        ) : null}
        {urlCategory ? (
          <Chip active onClick={() => setJobCategory("")}>
            <XIcon className="size-3.5" />
            {urlCategory}
          </Chip>
        ) : null}
        {filters.categories.map((category) => (
          <Chip key={category} active onClick={() => toggleCategoryFilter(category)}>
            {category}
            <XIcon className="size-3.5" />
          </Chip>
        ))}
        {activeFilterCount > 0 || query || urlCategory !== "" ? (
          <button
            className="shrink-0 rounded-full px-2 py-1.5 text-[12px] font-semibold text-muted hover:text-brand hover:underline"
            onClick={clearFilters}
          >
            Clear all
          </button>
        ) : null}
      </ChipRow>
      <p aria-live="polite" className="text-[13px] text-muted">
        {results.length} {results.length === 1 ? "job" : "jobs"} · {SORT_LABELS[filters.sort]}
      </p>
      {results.length === 0 ? (
        <div className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-card">
          <p className="text-sm font-semibold">No jobs found.</p>
          <p className="mt-1 text-xs text-muted">Try different words or widen your filters.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Chip key={suggestion} onClick={() => runSearch(suggestion)}>
                {suggestion}
              </Chip>
            ))}
          </div>
          <button
            className="mt-4 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((job, index) => (
            <ResultCard
              key={job.id}
              job={job}
              applied={appliedIds.includes(job.id)}
              entranceDelay={index < 6 ? index * 60 : undefined}
              onOpen={() => openDetail(job.id, "results")}
              onApply={() => startApply(job.id, "results")}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!detailJob) {
      return null;
    }
    const job = detailJob;
    const saved = state.savedIds.includes(job.id);
    const applied = applicationRecord !== null;

    return (
      <div className="flex flex-col gap-4 pb-4">
        <button
          className="self-start rounded-full border border-border bg-surface p-2 text-muted shadow-card hover:text-brand"
          aria-label="Go back"
          onClick={goBack}
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{job.category}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.01em]">{job.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {job.company} · {job.location} · {job.type}
          </p>
          <p className="mt-1 text-xs text-muted">Posted {job.posted}</p>
        </header>
        <div className="flex items-center gap-3">
          {job.salary ? (
            <span className="text-lg font-bold text-brand">{salaryLabel(job.salary)}</span>
          ) : (
            <span className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[12px] font-medium text-muted">
              Pay not listed
            </span>
          )}
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <StarIcon className="size-3.5 text-accent" />
            {`${job.rating.toFixed(1)} (${job.reviews} reviews)`}
          </span>
        </div>
        <PromiseStrip items={[...PROMISES]} />
        <section className="rounded-[16px] border border-border bg-surface p-4 shadow-card">
          <h2 className="text-[15px] font-semibold">About this job</h2>
          <p className="mt-2 text-[13px] text-muted">{job.blurb}</p>
        </section>
        {applicationRecord ? (
          <div className="rounded-[16px] bg-brand-soft px-4 py-3">
            <p className="text-sm font-semibold text-brand">
              {APPLICATION_STATUS_LABEL[applicationRecord.status]}
            </p>
            <p className="mt-1 text-[13px] text-foreground">
              {APPLICATION_STATUS_COPY[applicationRecord.status]}
            </p>
            {!isTerminalStatus(applicationRecord.status) ? (
              <button
                type="button"
                onClick={() => {
                  withdrawApplicationFor(job.id);
                  showToast("Application withdrawn.");
                }}
                className="mt-2.5 rounded-full border border-brand bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-brand transition-colors hover:border-brand/50"
              >
                Withdraw application
              </button>
            ) : null}
          </div>
        ) : null}
        {!applied && applying ? (
          <section className="rounded-[16px] border border-border bg-surface p-4 shadow-card">
            {applyStep === 1 ? (
              <div>
                <h2 className="text-[15px] font-semibold">When can you start?</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(START_OPTIONS as unknown as readonly string[]).map((option) => (
                    <Chip
                      key={option}
                      active={startChoice === option}
                      onClick={() => setStartChoice(option)}
                    >
                      {option}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-[15px] font-semibold">Add a short note for the employer</h2>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Anything the employer should know?"
                  className="mt-3 w-full rounded-[14px] border border-border bg-surface-alt p-3 text-sm outline-none placeholder:text-muted focus:border-brand"
                />
              </div>
            )}
          </section>
        ) : null}
        {!applying ? (
          <div className="flex items-center gap-4">
            <button
              aria-pressed={saved}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${saved ? "text-brand" : "text-muted hover:text-brand"}`}
              onClick={() => toggleSave(job.id)}
            >
              <HeartIcon className={`size-4 ${saved ? "fill-brand" : ""}`} />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand"
              onClick={() => void shareJob(job)}
            >
              <ShareIcon className="size-4" />
              Share
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-brand"
              onClick={() => showToast("Reported. Thanks.")}
            >
              <FlagIcon className="size-4" />
              Report
            </button>
          </div>
        ) : null}
        <div className="sticky bottom-20 z-30 mt-6">
          {applied ? (
            <div className="flex items-center justify-center gap-2 rounded-full bg-brand-soft px-5 py-3 text-sm font-semibold text-brand">
              <CheckIcon className="size-4" />
              {applied}
            </div>
          ) : applying ? (
            <button
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
              disabled={applying && applyStep === 1 && !startChoice}
              onClick={() => {
                if (applyStep === 1) {
                  if (!startChoice) {
                    return;
                  }
                  setApplyStep(2);
                  return;
                }
                submitApply(job.id);
              }}
            >
              {applyStep === 1 ? "Continue" : "Send application"}
            </button>
          ) : (
            <button
              className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              onClick={() => setApplying(true)}
            >
              Apply for this job
            </button>
          )}
        </div>
      </div>
    );
  };

  let body: ReactNode;
  if (view === "detail" || (deepLinkId !== null && detailId === null)) {
    body = renderDetail();
  } else if (effectiveView === "results") {
    body = renderResults();
  } else {
    body = renderIntake();
  }

  return (
    <>
      <main className="relative mx-auto max-w-lg px-5 pb-24 pt-6">{body}</main>
      <FilterSheet
        open={sheetOpen}
        filters={filters}
        onChange={(next) => updateFilters(() => next)}
        onClose={closeSheet}
      />
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-24 z-[80] mx-auto max-w-md rounded-full bg-brand-strong px-5 py-3 text-center text-sm font-semibold text-white shadow-raised"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
