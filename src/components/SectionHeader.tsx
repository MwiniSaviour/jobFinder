import Link from "next/link";
import { ChevronRightIcon } from "./Icons";

type SectionHeaderProps = {
  title: string;
  action?: {
    href: string;
    label?: string;
  };
};

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-3">
      <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-muted hover:text-brand"
        >
          {action.label ?? "See All"}
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
