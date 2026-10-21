"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { jobs, salaryLabel, type JobListing } from "../lib/jobs";
import {
  freshState,
  onJobsChange,
  readJobsState,
  type JobsState,
} from "../lib/state";
import { CategoryTile } from "./CategoryTile";
import { EmptyState } from "./EmptyState";
import { ChevronRightIcon } from "./Icons";

const EMPTY_TITLE = "No applications yet.";
const EMPTY_ACTION = { label: "Browse jobs", href: "/jobs" };
const JOBS_HREF = "/jobs";
const ROW_STAGGER_MS = 80;
const ROW_STAGGER_MAX_MS = 400;

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
  const router = useRouter();
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const applications = [...state.appliedIds]
    .reverse()
    .map((id) => jobs.find((job) => job.id === id))
    .filter((job): job is JobListing => job !== undefined);

  if (applications.length === 0) {
    return <EmptyState title={EMPTY_TITLE} action={EMPTY_ACTION} />;
  }

  return (
    <ul className="space-y-2.5">
      {applications.map((job, index) => {
        const salary = salaryLabel(job.salary);
        return (
          <li key={job.id} className="hero-rise" style={rowDelay(index)}>
            <button
              type="button"
              onClick={() => router.push(JOBS_HREF)}
              className="flex w-full items-center gap-3.5 rounded-[16px] border border-border bg-surface p-3.5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <CategoryTile category={job.category} />
              <span className="min-w-0 flex-1">
                <span className="block w-fit rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {job.category}
                </span>
                <span className="mt-1.5 block truncate text-[15px] font-semibold">
                  {job.title}
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-muted">
                  {`${job.company} · ${job.type}`}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                {salary ? (
                  <span className="text-[15px] font-semibold">{salary}</span>
                ) : null}
                <ChevronRightIcon className="h-4 w-4 text-muted" />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
