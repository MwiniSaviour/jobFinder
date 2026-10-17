import { cn } from "@/lib/utils";
import type { CompanyTone } from "@/data/companies";

const tones: Record<CompanyTone, string> = {
  clay: "bg-clay-soft text-clay-deep",
  sage: "bg-sage-soft text-sage-deep",
  ochre: "bg-ochre-soft text-[#8a641f]",
  ink: "bg-ink text-paper",
  stone: "bg-cream text-ink-soft",
  plum: "bg-plum-soft text-plum",
};

export function CompanyMark({
  monogram,
  tone = "ink",
  className,
  size = "md",
}: {
  monogram: string;
  tone?: CompanyTone;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "h-9 w-9 rounded-[10px] text-[13px]",
    md: "h-11 w-11 rounded-xl text-[15px]",
    lg: "h-14 w-14 rounded-[14px] text-lg",
    xl: "h-20 w-20 rounded-2xl text-2xl",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold tracking-[-0.04em]",
        sizes[size],
        tones[tone],
        className,
      )}
      aria-hidden="true"
    >
      {monogram}
    </span>
  );
}
