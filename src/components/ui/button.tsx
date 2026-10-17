import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "clay" | "outline" | "soft" | "ghost" | "paper";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-ink-soft active:bg-ink",
  clay: "bg-clay text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-clay-deep",
  outline:
    "border border-line-strong bg-transparent text-ink hover:border-ink/40 hover:bg-cream/60",
  soft: "bg-cream text-ink hover:bg-sand/80",
  ghost: "bg-transparent text-ink-soft hover:bg-cream hover:text-ink",
  paper: "bg-paper text-ink hover:bg-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[9px]",
  md: "h-11 px-5 text-[14px] gap-2 rounded-[11px]",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
  icon: "h-11 w-11 rounded-[11px] justify-center",
  "icon-sm": "h-9 w-9 rounded-[9px] justify-center",
};

const base =
  "inline-flex select-none items-center justify-center font-medium tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px [&_svg]:shrink-0";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  ariaLabel,
  onClick,
}: CommonProps & {
  href: string;
  target?: string;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      target={target}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
