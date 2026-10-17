import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Logo />
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone transition hover:text-ink"
        >
          Browse roles
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="container-x flex flex-1 items-center">
        <div className="grid w-full gap-12 pb-20 lg:grid-cols-2 lg:items-center">
          <div className="max-w-lg">
            <p className="eyebrow">
              <span className="h-1 w-1 rounded-full bg-clay" />
              Error 404
            </p>
            <h1 className="display mt-5 text-[clamp(2.6rem,5vw,4rem)] leading-[0.98] text-ink">
              This page has <em className="italic text-clay-deep">moved on</em>.
            </h1>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-stone">
              Either the link is old, the role has closed, or someone typed with
              cold hands. Either way — there&apos;s plenty worth opening just
              around the corner.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/jobs" size="md">
                Browse open roles
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="md">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </ButtonLink>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="ml-auto max-w-sm rounded-2xl border border-line bg-paper-raised p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-stone-light">
                A few good places
              </p>
              <div className="mt-4 space-y-1">
                {[
                  { label: "All 24 open roles", href: "/jobs", meta: "Roles" },
                  {
                    label: "The teams hiring",
                    href: "/companies",
                    meta: "Companies",
                  },
                  {
                    label: "What the work pays",
                    href: "/salaries",
                    meta: "Salaries",
                  },
                  {
                    label: "Your applications",
                    href: "/dashboard",
                    meta: "Dashboard",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between rounded-lg px-2.5 py-2.5 transition hover:bg-cream"
                  >
                    <span className="text-[12.5px] text-ink">{item.label}</span>
                    <span className="flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.12em] text-stone-light">
                      {item.meta}
                      <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <p
              className="display absolute -bottom-2 right-6 select-none text-[120px] leading-none text-clay/10"
              aria-hidden="true"
            >
              404
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex items-center justify-between py-5 text-[10.5px] text-stone-light">
          <span>© 2026 Morrow Labs</span>
          <span>Work worth wanting</span>
        </div>
      </div>
    </div>
  );
}
