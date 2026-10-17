"use client";

import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ShareButton({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link copied",
            description: `Ready to share ${title}.`,
            tone: "success",
          });
        } catch {
          toast({
            title: "Couldn't copy the link",
            description: "Copy it from your address bar.",
          });
        }
      }}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-[11px] border border-line-strong px-4 text-[13px] font-medium text-ink transition hover:border-ink/40 hover:bg-cream/60",
        className,
      )}
    >
      <Share2 className="h-4 w-4" strokeWidth={1.8} />
      Share
    </button>
  );
}
