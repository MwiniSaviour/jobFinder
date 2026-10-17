"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchTrigger({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("morrow:command"))}
      aria-label="Search jobs, companies, and pages"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised/60 text-stone transition hover:border-line-strong hover:text-ink",
        compact ? "h-9 w-9 justify-center" : "h-9 pl-3 pr-2.5 text-[12.5px]",
        className,
      )}
    >
      <Search className="h-[15px] w-[15px]" strokeWidth={1.9} />
      {!compact && (
        <>
          <span className="hidden xl:inline">Search</span>
          <kbd className="ml-1 hidden rounded-[5px] border border-line bg-cream px-1.5 py-0.5 font-mono text-[10px] leading-none text-stone-light xl:inline-block">
            ⌘K
          </kbd>
        </>
      )}
    </button>
  );
}
