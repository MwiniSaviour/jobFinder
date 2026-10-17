"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Menu({
  trigger,
  children,
  align = "right",
  className,
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((props: { close: () => void }) => ReactNode);
  align?: "left" | "right";
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={cn("relative", className)} ref={ref}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "animate-scale-in absolute z-50 mt-2 min-w-[12rem] origin-top rounded-xl border border-line bg-paper-raised p-1.5 shadow-panel",
            align === "right" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  href,
  danger = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  className?: string;
}) {
  const classes = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-soft transition hover:bg-cream focus-visible:bg-cream focus-visible:outline-none",
    danger && "text-clay-deep hover:bg-clay-soft/60",
    className,
  );

  if (href) {
    return (
      <a href={href} role="menuitem" className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-light">
      {children}
    </p>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-line" />;
}
