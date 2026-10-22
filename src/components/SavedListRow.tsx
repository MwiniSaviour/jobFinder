import type { ReactNode } from "react";

export function SavedListRow({
  icon,
  primary,
  secondary,
  badge,
  onClick,
  children,
}: {
  icon: ReactNode;
  primary: string;
  secondary?: string;
  badge?: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-nav motion-reduce:hover:translate-y-0">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full min-h-12 items-center gap-3.5 text-left"
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{primary}</span>
          {secondary ? (
            <span className="mt-0.5 block truncate text-[13px] text-muted">{secondary}</span>
          ) : null}
        </span>
        {badge ? (
          <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-semibold text-brand">
            {badge}
          </span>
        ) : null}
      </button>
      {children ? (
        <div className="mt-3 border-t border-border pt-3">{children}</div>
      ) : null}
    </div>
  );
}
