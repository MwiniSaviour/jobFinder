"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ChevronLeftIcon,
  ClockIcon,
  FlagIcon,
  HeartIcon,
  ShareIcon,
  SlidersIcon,
  StarIcon,
} from "../../components/Icons";
import { FilterSheet } from "../../components/FilterSheet";
import { SearchBar } from "../../components/SearchBar";
import { SavedListRow } from "../../components/SavedListRow";
import { PromiseStrip } from "../../components/PromiseStrip";
import { Chip } from "../../components/Chip";
import { CategoryTile } from "../../components/CategoryTile";
import { SectionHeader } from "../../components/SectionHeader";
import {
  CATEGORIES,
  SORT_LABELS,
  jobs,
  salaryLabel,
  type JobListing,
} from "../../lib/jobs";
import {
  freshState,
  onJobsChange,
  readJobsState,
  writeJobsState,
  type JobsState,
} from "../../lib/state";

type View = "intake" | "results" | "detail";

const START_OPTIONS = ["Today", "This week", "Next few weeks"];
const PROMISES = ["Pay listed upfront", "Reply within 3 days", "No account needed"];
const SUGGESTIONS = ["Barista", "Delivery driver", "Warehouse"];

const STORAGE_KEY = "jf:jobs";

const SERVER_JOBS_SNAPSHOT = freshState();

let clientJobsSnapshot = SERVER_JOBS_SNAPSHOT;
let clientJobsRaw: string | null = null;

function getJobsSnapshot(): JobsState {
  if (typeof window === "undefined") {
    return SERVER_JOBS_SNAPSHOT;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw !== clientJobsRaw) {
      clientJobsRaw = raw;
      clientJobsSnapshot = raw === null ? freshState() : readJobsState();
    }
  } catch (error) {
    console.warn("JobFinder: unable to read jobs snapshot", error);
  }
  return clientJobsSnapshot;
}

function getJobsServerSnapshot(): JobsState {
  return SERVER_JOBS_SNAPSHOT;
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
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const updateJobsState = useCallback((updater: (prev: JobsState) => JobsState) => {
    writeJobsState(updater(readJobsState()));
  }, []);

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
    setView(returnTo);
  }, [returnTo]);

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
      updateJobsState((prev) => ({
        ...prev,
        appliedIds: prev.appliedIds.includes(jobId) ? prev.appliedIds : [...prev.appliedIds, jobId],
      }));
      setApplying(false);
      showToast("Application sent.");
    },
    [showToast, updateJobsState],
  );

  const toggleCategoryFilter = useCallback(
    (category: string) => {
      updateJobsState((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          categories: prev.filters.categories.includes(category)
            ? prev.filters.categories.filter((item) => item !== category)
            : [...prev.filters.categories, category],
        },
      }));
      setView("results");
    },
    [updateJobsState],
  );

  const clearFilters = useCallback(() => {
    updateJobsState((prev) => ({
      ...prev,
      filters: { ...prev.filters, categories: [], includeUnlisted: false, sort: "new" },
    }));
    setJobQuery("");
  }, [updateJobsState]);

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

  const { results, activeFilterCount } = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = jobs.filter((job) => {
      if (q) {
        const haystack = `${job.title} ${job.company} ${job.location} ${job.blurb}`.toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      if (state.filters.categories.length > 0 && !state.filters.categories.includes(job.category)) {
        return false;
      }
      if (!state.filters.includeUnlisted && job.salary === null) {
        return false;
      }
      return true;
    });
    const sorted =
      state.filters.sort === "pay"
        ? [...filtered].sort((a, b) => (b.salary?.amount ?? -1) - (a.salary?.amount ?? -1))
        : filtered;
    return {
      results: sorted,
      activeFilterCount: state.filters.categories.length + (state.filters.includeUnlisted ? 1 : 0),
    };
  }, [state, query]);

  const detailJob = detailId === null ? null : (jobs.find((job) => job.id === detailId) ?? null);
  const effectiveView = view === "intake" && query !== "" ? "results" : view;

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
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className="flex flex-col items-center gap-2"
              onClick={() => toggleCategoryFilter(category)}
            >
              <CategoryTile category={category} size="lg" />
              <span className="text-xs font-medium text-muted">{category}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <SectionHeader title="Browse all openings" />
        <div className="space-y-3">
          {jobs.map((job) => (
            <ResultCard
              key={job.id}
              job={job}
              applied={state.appliedIds.includes(job.id)}
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
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={activeFilterCount > 0} onClick={openSheet}>
          <SlidersIcon className="size-3.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Chip>
        {state.filters.sort === "pay" ? (
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-muted">
            {SORT_LABELS[state.filters.sort]}
          </span>
        ) : null}
        {state.filters.includeUnlisted ? (
          <Chip
            active
            onClick={() => updateJobsState((prev) => ({ ...prev, filters: { ...prev.filters, includeUnlisted: false } }))}
          >
            Unlisted pay ✕
          </Chip>
        ) : null}
        {state.filters.categories.map((category) => (
          <Chip key={category} active onClick={() => toggleCategoryFilter(category)}>
            {category} ✕
          </Chip>
        ))}
        {activeFilterCount > 0 || query ? (
          <button
            className="rounded-full px-2 py-1.5 text-[12px] font-semibold text-muted hover:text-brand hover:underline"
            onClick={clearFilters}
          >
            Clear all
          </button>
        ) : null}
      </div>
      <p aria-live="polite" className="text-[13px] text-muted">
        {results.length} {results.length === 1 ? "job" : "jobs"} · {SORT_LABELS[state.filters.sort]}
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
              applied={state.appliedIds.includes(job.id)}
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
    const applied = state.appliedIds.includes(job.id);

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
          <span className="text-sm text-muted">
            ★ {job.rating.toFixed(1)} ({job.reviews} reviews)
          </span>
        </div>
        <PromiseStrip items={[...PROMISES]} />
        <section className="rounded-[16px] border border-border bg-surface p-4 shadow-card">
          <h2 className="text-[15px] font-semibold">About this job</h2>
          <p className="mt-2 text-[13px] text-muted">{job.blurb}</p>
        </section>
        {applied ? (
          <p className="rounded-[16px] bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
            Application sent.
          </p>
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
            <div className="flex items-center justify-center rounded-full bg-brand-soft px-5 py-3 text-sm font-semibold text-brand">
              ✓ Applied
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
  if (view === "detail") {
    body = renderDetail();
  } else if (effectiveView === "results") {
    body = renderResults();
  } else {
    body = renderIntake();
  }

  return (
    <>
      <main className="relative mx-auto w-full max-w-md px-6 pb-24 pt-6">{body}</main>
      <FilterSheet
        open={sheetOpen}
        filters={state.filters}
        onChange={(next) => updateJobsState((prev) => ({ ...prev, filters: next }))}
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
