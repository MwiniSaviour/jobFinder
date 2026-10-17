"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaved } from "./saved-context";
import { useToast } from "./toast";

export function BookmarkButton({
  jobKey,
  title,
  variant = "icon",
  className,
  label,
}: {
  jobKey: string;
  title: string;
  variant?: "icon" | "button" | "inline";
  className?: string;
  label?: string;
}) {
  const { isSaved, toggle } = useSaved();
  const { toast } = useToast();
  const saved = isSaved(jobKey);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggle(jobKey);
    toast({
      title: nowSaved ? "Saved to your list" : "Removed from saved",
      description: nowSaved ? `${title} is waiting in your dashboard.` : title,
      tone: nowSaved ? "success" : "default",
    });
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
        className={cn(
          "inline-flex items-center gap-2 text-[13px] font-medium text-stone transition hover:text-ink",
          saved && "text-clay-deep",
          className,
        )}
      >
        <Bookmark
          className={cn("h-4 w-4", saved && "fill-current")}
          strokeWidth={1.8}
        />
        {label ?? (saved ? "Saved" : "Save")}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-line-strong bg-transparent px-4 text-[14px] font-medium text-ink transition hover:border-ink/40 hover:bg-cream/60",
          saved && "border-clay/30 bg-clay-soft/50 text-clay-deep",
          className,
        )}
      >
        <Bookmark
          className={cn("h-4 w-4", saved && "fill-current")}
          strokeWidth={1.8}
        />
        {saved ? "Saved" : (label ?? "Save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
      title={saved ? "Remove from saved" : "Save job"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper/80 text-stone backdrop-blur transition hover:border-ink/30 hover:text-ink",
        saved && "border-clay/30 bg-clay-soft text-clay-deep",
        className,
      )}
    >
      <Bookmark
        className={cn("h-4 w-4", saved && "fill-current")}
        strokeWidth={1.8}
      />
    </button>
  );
}
