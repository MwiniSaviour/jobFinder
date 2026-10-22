"use client";

import { useEffect, useId, useState, type JSX } from "react";
import { ClockIcon, MapPinIcon, SearchIcon, StarIcon, XIcon } from "./Icons";
import { searchPlaces } from "../lib/geo";
import type { PlaceResult } from "../lib/geo";

export type LocationSearchProps = {
  label: string;
  placeholder: string;
  value: string | null;
  recents?: string[];
  popular?: string[];
  showGps?: boolean;
  gpsState?: "idle" | "loading" | "denied";
  onGpsPick?: () => void;
  onPick: (pick: PlaceResult | string) => void;
  onClear?: () => void;
};

type SearchStatus = "idle" | "loading" | "error";

const EMPTY_MESSAGE = 'No matches. Try a landmark like "Circle" or "Osu".';
const ERROR_MESSAGE = "Search is unavailable right now. Check your connection and try again.";
const GPS_DENIED_MESSAGE = "Allow location access in your browser settings to use GPS.";

const ROW_CLASS =
  "flex h-12 w-full items-center gap-3 rounded-[16px] border border-border px-3 text-left transition-colors hover:border-brand/40 focus:border-brand disabled:cursor-not-allowed disabled:opacity-60";

const HEAD_CLASS = "px-1 pt-1 text-xs font-medium text-muted";

export default function LocationSearch(props: LocationSearchProps): JSX.Element {
  const {
    label,
    placeholder,
    value,
    recents = [],
    popular = [],
    showGps = false,
    gpsState = "idle",
    onGpsPick,
    onPick,
    onClear,
  } = props;

  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[] | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");

  const trimmed = query.trim();

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (!trimmed) {
        setResults(null);
        setStatus("idle");
        return;
      }
      setStatus("loading");
      searchPlaces(trimmed, { signal: controller.signal })
        .then((items) => {
          if (!controller.signal.aborted) {
            setResults(items);
            setStatus("idle");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults(null);
            setStatus("error");
          }
        });
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, trimmed]);

  function pick(payload: PlaceResult | string) {
    onPick(payload);
    setOpen(false);
    setQuery("");
  }

  function closeSheet() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="w-full">
      <div className="relative">
        {open ? (
          <div className="flex min-h-14 w-full items-center gap-3 rounded-[18px] border border-border bg-surface px-3 py-2 transition-colors focus-within:border-brand">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <SearchIcon className="size-4" />
            </span>
            <label className="min-w-0 flex-1">
              <span className="block truncate text-xs text-muted">{label}</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted"
              />
            </label>
            <button
              type="button"
              aria-label="Close suggestions"
              onClick={closeSheet}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-alt text-muted transition-colors hover:border-brand/40"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setOpen(true)}
              className="flex w-full items-center gap-3 rounded-[18px] border border-border bg-surface py-2 pl-3 pr-14 text-left transition-colors hover:border-brand/40 focus:border-brand"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-alt text-muted">
                <MapPinIcon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-muted">{label}</span>
                <span
                  className={`block truncate text-[15px] ${value ? "text-foreground" : "text-muted"}`}
                >
                  {value ?? placeholder}
                </span>
              </span>
            </button>
            {onClear && value ? (
              <button
                type="button"
                aria-label={`Clear ${label}`}
                onClick={() => onClear()}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-alt text-muted transition-colors hover:border-brand/40"
              >
                <XIcon className="size-4" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white"
              >
                <SearchIcon className="size-4" />
              </span>
            )}
          </>
        )}
      </div>

      {open && (
        <div id={listId} className="mt-2 rounded-[24px] border border-border bg-surface p-2">
          {trimmed && status === "loading" ? (
            <div className="space-y-2">
              {["a", "b", "c"].map((key) => (
                <div
                  key={key}
                  className="h-12 w-full animate-pulse rounded-[16px] border border-border bg-surface-alt"
                />
              ))}
            </div>
          ) : null}

          {trimmed && status !== "loading" ? (
            results && results.length > 0 ? (
              <div className="space-y-2">
                {results.map((item) => (
                  <button
                    type="button"
                    key={`${item.lat},${item.lng}`}
                    onClick={() => pick(item)}
                    className={ROW_CLASS}
                  >
                    <MapPinIcon className="size-4 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-foreground">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-muted">{item.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-2 py-2.5 text-xs text-muted">
                {status === "error" ? ERROR_MESSAGE : EMPTY_MESSAGE}
              </p>
            )
          ) : null}

          {!trimmed && (
            <div className="space-y-2">
              {showGps && gpsState === "denied" ? (
                <p className="px-2 py-2.5 text-xs text-muted">{GPS_DENIED_MESSAGE}</p>
              ) : showGps && onGpsPick ? (
                <button
                  type="button"
                  onClick={() => onGpsPick()}
                  disabled={gpsState === "loading"}
                  className={ROW_CLASS}
                >
                  <SearchIcon className="size-4 shrink-0 text-muted" />
                  <span className="truncate text-[15px] text-foreground">
                    {gpsState === "loading" ? "Getting your location…" : "Use my location"}
                  </span>
                </button>
              ) : null}

              {recents.length > 0 ? (
                <div className="space-y-2">
                  <p className={HEAD_CLASS}>Recent</p>
                  {recents.map((recent) => (
                    <button
                      type="button"
                      key={`recent-${recent}`}
                      onClick={() => pick(recent)}
                      className={ROW_CLASS}
                    >
                      <ClockIcon className="size-4 shrink-0 text-muted" />
                      <span className="truncate text-[15px] text-foreground">{recent}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {popular.length > 0 ? (
                <div className="space-y-2">
                  <p className={HEAD_CLASS}>Popular</p>
                  {popular.map((spot) => (
                    <button
                      type="button"
                      key={`popular-${spot}`}
                      onClick={() => pick(spot)}
                      className={ROW_CLASS}
                    >
                      <StarIcon className="size-4 shrink-0 text-muted" />
                      <span className="truncate text-[15px] text-foreground">{spot}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
