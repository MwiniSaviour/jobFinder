import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  tone = "ink",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p
            className={cn("eyebrow mb-4", tone === "paper" && "text-paper/50")}
          >
            <span
              className={cn(
                "h-1 w-1 rounded-full",
                tone === "paper" ? "bg-ochre" : "bg-clay",
              )}
            />
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "display text-[clamp(2rem,3.6vw,2.9rem)] leading-[1.02]",
            tone === "paper" ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-xl text-[14.5px] leading-relaxed",
              tone === "paper" ? "text-paper/60" : "text-stone",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-[13.5px] font-medium",
            tone === "paper" ? "text-paper" : "text-ink",
          )}
        >
          <span className="link-underline">{action.label}</span>
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5",
              tone === "paper" ? "border-paper/25" : "border-line-strong",
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}
    </div>
  );
}
