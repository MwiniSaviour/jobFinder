import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
    >
      <path
        d="M2.5 22.5h23"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 22.5a7 7 0 0 1 14 0Z"
        fill="currentColor"
        className="text-clay"
      />
      <circle cx="21.4" cy="7.6" r="2.4" className="fill-current text-ochre" />
      <path
        d="M4 17.2h3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  tone = "ink",
}: {
  className?: string;
  href?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 focus-visible:outline-offset-4",
        tone === "ink" ? "text-ink" : "text-paper",
        className,
      )}
      aria-label="Morrow — home"
    >
      <LogoMark className="h-[26px] w-[26px] transition-transform duration-500 group-hover:-rotate-6" />
      <span className="display text-[1.45rem] leading-none tracking-[-0.03em]">
        morrow
      </span>
    </Link>
  );
}
