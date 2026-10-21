"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, DEFAULT_FILTERS, SORT_LABELS, type SortKey } from "../lib/jobs";
import type { Filters } from "../lib/state";
import { Chip } from "./Chip";

const SECTION_LABEL = "text-xs font-semibold uppercase tracking-wide text-muted";

function FilterSheetContent({
  filters,
  onChange,
  onClose,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleIncludeUnlisted = () => {
    setDraft((prev) => ({ ...prev, includeUnlisted: !prev.includeUnlisted }));
  };

  const toggleCategory = (category: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((name) => name !== category)
        : [...prev.categories, category],
    }));
  };

  const setSort = (sort: SortKey) => {
    setDraft((prev) => ({ ...prev, sort }));
  };

  const activeCount = draft.categories.length + (draft.includeUnlisted ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[60]">
      <style>{`@media (prefers-reduced-motion: no-preference) {
  @keyframes jf-sheet-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}`}</style>
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter jobs"
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md overflow-hidden rounded-t-[24px] border-t border-border bg-surface shadow-raised"
        style={{ animation: "jf-sheet-up 240ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <h2 className="text-[15px] font-semibold">Filters</h2>
          <button
            type="button"
            className="ml-auto rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-brand disabled:opacity-40"
            disabled={activeCount === 0}
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
              onChange(DEFAULT_FILTERS);
              onClose();
            }}
          >
            Reset
          </button>
          <button
            type="button"
            aria-label="Close filters"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-alt text-muted transition-colors hover:text-foreground"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto px-5 pb-4">
          <p className={SECTION_LABEL}>Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Chip
                key={category}
                active={draft.categories.includes(category)}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </div>
          <p className={`mt-5 ${SECTION_LABEL}`}>Pay</p>
          <div className="mt-2 flex items-center justify-between rounded-[14px] border border-border bg-surface-alt px-4 py-3">
            <span className="text-sm font-medium">Include jobs without listed pay</span>
            <button
              type="button"
              role="switch"
              aria-checked={draft.includeUnlisted}
              onClick={toggleIncludeUnlisted}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${draft.includeUnlisted ? "bg-brand" : "bg-border"}`}
            >
              <span aria-hidden="true" className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${draft.includeUnlisted ? "left-4.5" : "left-0.5"}`} />
            </button>
          </div>
          <p className={`mt-5 ${SECTION_LABEL}`}>Sort</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <Chip key={key} active={draft.sort === key} onClick={() => setSort(key)}>
                {SORT_LABELS[key]}
              </Chip>
            ))}
          </div>
        </div>
        <div className="border-t border-border bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="h-12 w-full rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-strong"
            onClick={() => {
              onChange(draft);
              onClose();
            }}
          >
            Apply filters ({activeCount})
          </button>
        </div>
      </div>
    </div>
  );
}

export function FilterSheet({ open, ...sheetProps }: { open?: boolean } & Parameters<typeof FilterSheetContent>[0]) {
  if (!open) return null;
  return <FilterSheetContent {...sheetProps} />;
}
