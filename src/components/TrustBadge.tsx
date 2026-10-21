import { ShieldCheckIcon } from "./Icons";

export const trustBadgeClass =
  "inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand";

type TrustBadgeProps = {
  label?: string;
  className?: string;
};

export function TrustBadge({ label = "Background-checked", className }: TrustBadgeProps) {
  return (
    <span className={`${trustBadgeClass} ${className ?? ""}`}>
      <ShieldCheckIcon className="h-3 w-3" />
      {label}
    </span>
  );
}
