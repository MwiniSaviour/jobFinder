import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "ink" | "clay" | "sage" | "ochre" | "plum" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-cream text-ink-soft",
  ink: "bg-ink text-paper",
  clay: "bg-clay-soft text-clay-deep",
  sage: "bg-sage-soft text-sage-deep",
  ochre: "bg-ochre-soft text-[#8a641f]",
  plum: "bg-plum-soft text-plum",
  outline: "border border-line bg-transparent text-stone",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot = false,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none tracking-[-0.005em]",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}

export function workModeTone(mode: string): Tone {
  if (mode === "Remote") return "sage";
  if (mode === "Hybrid") return "ochre";
  return "neutral";
}

export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { tone: Tone; dot: string }> = {
    Saved: { tone: "neutral", dot: "bg-stone-light" },
    Applied: { tone: "neutral", dot: "bg-stone" },
    "In review": { tone: "ochre", dot: "bg-ochre" },
    Interview: { tone: "sage", dot: "bg-sage" },
    Offer: { tone: "clay", dot: "bg-clay" },
    Closed: { tone: "outline", dot: "bg-stone-light" },
    Screening: { tone: "ochre", dot: "bg-ochre" },
    Hired: { tone: "sage", dot: "bg-sage" },
  };
  const config = map[stage] ?? { tone: "neutral" as Tone, dot: "bg-stone" };
  return (
    <Badge tone={config.tone} className="gap-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {stage}
    </Badge>
  );
}
