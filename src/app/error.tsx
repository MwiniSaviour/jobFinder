"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-paper px-5 py-24">
      <div className="max-w-md text-center">
        <p className="eyebrow justify-center">
          <span className="h-1 w-1 rounded-full bg-clay" />
          Something went sideways
        </p>
        <h1 className="display mt-4 text-[clamp(2rem,4vw,2.8rem)] leading-tight text-ink">
          A small hiccup, not a <em className="italic">setback</em>.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-stone">
          This page ran into an unexpected problem. Try again — and if it keeps
          happening, your applications are still safe.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[13px] font-medium text-paper transition hover:bg-ink-soft"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong px-5 text-[13px] font-medium text-ink transition hover:bg-cream"
          >
            Back home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
