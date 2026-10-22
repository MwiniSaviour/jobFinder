"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { jobs, salaryLabel, type JobListing } from "../lib/jobs";
import {
  freshState,
  onJobsChange,
  readJobsState,
  writeJobsState,
  type JobsState,
} from "../lib/state";
import {
  APPLICATION_STATUS_COPY,
  APPLICATION_STATUS_LABEL,
  applySimulatedResponse,
  applySimulatedResponseNow,
  formatEventTime,
  isTerminalStatus,
  withdrawApplication,
  type ApplicationRecord,
} from "../lib/applications";
import { useHydrated } from "../lib/hydration";
import { CategoryTile } from "./CategoryTile";
import { EmptyState } from "./EmptyState";
import { ChevronRightIcon } from "./Icons";

const EMPTY_TITLE = "No applications yet.";
const EMPTY_ACTION = { label: "Browse jobs", href: "/jobs" };
const LOADING_TITLE = "Loading your applications…";
const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;
const SIMULATION_NOTE =
  "Employer responses on this device are simulated for the demo. No employer has received these applications.";
const WITHDRAW_LABEL = "Withdraw application";
const SIMULATE_LABEL = "Simulate next response";
const TIMELINE_TITLE = "Status timeline";
const APPLIED_LABEL = "Applied";
const SOURCE_YOU = "You";
const SOURCE_EMPLOYER = "Simulated employer response";
const WITHDRAWN_COPY = "Application withdrawn.";
const NO_MORE_STATUS = "This application reached a final status.";

const SERVER_STATE = freshState();

let cachedState: JobsState | null = null;

function subscribe(onStoreChange: () => void): () => void {
  return onJobsChange(() => {
    cachedState = null;
    onStoreChange();
  });
}

function getSnapshot(): JobsState {
  cachedState ??= readJobsState();
  return cachedState;
}

function getServerSnapshot(): JobsState {
  return SERVER_STATE;
}

function rowDelay(index: number): CSSProperties {
  return {
    "--hero-delay": `${Math.min(index * ROW_STAGGER_MS, ROW_STAGGER_MAX_MS)}ms`,
  } as CSSProperties;
}

export function ApplicationsList() {
  const hydrated = useHydrated();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const applications = useMemo(
    () =>
      [...state.applications]
        .reverse()
        .map((record) => {
          const job = jobs.find((item) => item.id === record.jobId);
          return job ? { record, job } : null;
        })
        .filter((entry): entry is { record: ApplicationRecord; job: JobListing } => entry !== null),
    [state.applications],
  );

  const advanceDue = useCallback(() => {
    const now = new Date();
    const current = readJobsState();
    let changed = false;
    const next = current.applications.map((record) => {
      const advanced = applySimulatedResponse(record, now);
      if (advanced !== record) changed = true;
      return advanced;
    });
    if (changed) writeJobsState({ ...current, applications: next });
  }, []);

  useEffect(() => {
    advanceDue();
    const timer = window.setInterval(advanceDue, 15_000);
    return () => window.clearInterval(timer);
  }, [advanceDue]);

  const withdraw = useCallback((record: ApplicationRecord) => {
    const current = readJobsState();
    writeJobsState({
      ...current,
      applications: current.applications.map((item) =>
        item.jobId === record.jobId ? withdrawApplication(item) : item,
      ),
    });
    setNotice(WITHDRAWN_COPY);
  }, []);

  const simulateNext = useCallback((record: ApplicationRecord) => {
    const current = readJobsState();
    const next = current.applications.map((item) =>
      item.jobId === record.jobId ? applySimulatedResponseNow(item) : item,
    );
    writeJobsState({ ...current, applications: next });
    setNotice(null);
  }, []);

  if (!hydrated) {
    return <EmptyState title={LOADING_TITLE} />;
  }

  if (applications.length === 0) {
    return <EmptyState title={EMPTY_TITLE} action={EMPTY_ACTION} />;
  }

  return (
    <>
      <p className="mb-3 text-[12px] text-muted">{SIMULATION_NOTE}</p>
      {notice ? (
        <p role="status" className="mb-3 text-[13px] font-semibold text-brand">
          {notice}
        </p>
      ) : null}
      <ul className="space-y-2.5">
        {applications.map(({ record, job }, index) => {
          const expanded = expandedId === record.jobId;
          const salary = salaryLabel(job.salary);
          const terminal = isTerminalStatus(record.status);
          return (
            <li key={job.id} className="hero-rise" style={rowDelay(index)}>
              <div className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-nav motion-reduce:hover:translate-y-0">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId(expanded ? null : record.jobId)}
                  className="flex w-full items-center gap-3.5 text-left"
                >
                  <CategoryTile category={job.category} />
                  <span className="min-w-0 flex-1">
                    <span className="block w-fit rounded-full bg-brand-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      {APPLICATION_STATUS_LABEL[record.status]}
                    </span>
                    <span className="mt-1.5 block truncate text-[15px] font-semibold">{job.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted">
                      {`${job.company} · ${job.type}`}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted">
                      {`${APPLIED_LABEL} ${formatEventTime(record.appliedAt)}`}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    {salary ? <span className="text-[15px] font-semibold">{salary}</span> : null}
                    <ChevronRightIcon className="h-4 w-4 text-muted" />
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                      {TIMELINE_TITLE}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      {APPLICATION_STATUS_COPY[record.status]}
                    </p>
                    <ol className="mt-3 space-y-2.5">
                      {record.events.map((event, eventIndex) => (
                        <li key={`${event.at}-${eventIndex}`} className="flex gap-2.5">
                          <span
                            aria-hidden="true"
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                          />
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold">
                              {APPLICATION_STATUS_LABEL[event.status]}
                            </span>
                            <span className="block text-[12px] text-muted">
                              {`${event.source === "you" ? SOURCE_YOU : SOURCE_EMPLOYER} · ${formatEventTime(event.at)}`}
                            </span>
                            <span className="block text-[12px] text-muted">{event.text}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {terminal ? (
                        <span className="text-[12px] text-muted">{NO_MORE_STATUS}</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => simulateNext(record)}
                            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold transition-colors hover:border-brand/40"
                          >
                            {SIMULATE_LABEL}
                          </button>
                          <button
                            type="button"
                            onClick={() => withdraw(record)}
                            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:border-brand/40"
                          >
                            {WITHDRAW_LABEL}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
