"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Progressive-enhancement scroll reveal.
 *
 * Content is visible by default. Only elements that start below the fold are
 * marked `pending` (hidden) and then revealed as they enter the viewport.
 * Anything already on screen is shown immediately, and a failsafe timer
 * guarantees nothing can stay invisible if the observer never fires.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reveal = () => {
      node.removeAttribute("data-reveal");
      node.classList.add("is-visible");
    };

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const rect = node.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 1.02 && rect.bottom > 0;
    if (alreadyVisible) {
      reveal();
      return;
    }

    node.setAttribute("data-reveal", "pending");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    observer.observe(node);

    // Failsafe: never leave content hidden, whatever happens to the observer.
    const failsafe = window.setTimeout(reveal, 3000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
