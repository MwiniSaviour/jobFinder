import type { ComponentPropsWithoutRef } from "react";

const CHIP_BASE =
  "inline-flex shrink-0 snap-start items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap";

export function chipClass(state: "active" | "idle"): string {
  if (state === "active") {
    return `${CHIP_BASE} bg-brand text-white`;
  }
  return `${CHIP_BASE} bg-surface text-foreground border border-border hover:border-brand/40`;
}

type ChipProps = { active?: boolean } & ComponentPropsWithoutRef<"button">;

export function Chip({ active = false, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={`${chipClass(active ? "active" : "idle")} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
