import Link from "next/link";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-card">
      <p className="text-sm font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 text-[13px] text-muted">{description}</p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
