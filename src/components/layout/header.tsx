"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Menu,
  Search,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { SearchTrigger } from "./search-trigger";
import { cn } from "@/lib/utils";

const links = [
  { href: "/jobs", label: "Find work" },
  { href: "/companies", label: "Companies" },
  { href: "/salaries", label: "Salaries" },
  { href: "/hire", label: "For teams" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled || open
            ? "border-b border-line/80 bg-paper/85 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/70"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav
              aria-label="Main"
              className="hidden items-center gap-1 lg:flex"
            >
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                const isTeams = link.href === "/hire";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium transition-colors",
                      active ? "text-ink" : "text-stone hover:text-ink",
                    )}
                  >
                    {link.label}
                    {isTeams && (
                      <ChevronDown
                        className="h-3 w-3 text-stone-light"
                        strokeWidth={2}
                      />
                    )}
                    {active && (
                      <span
                        className="absolute inset-x-3.5 -bottom-[2px] h-px bg-ink"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <SearchTrigger className="hidden sm:inline-flex" />
            <Link
              href="/dashboard/saved"
              aria-label="Saved jobs"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-stone transition hover:bg-cream hover:text-ink sm:inline-flex"
            >
              <Bookmark className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </Link>
            <span
              className="mx-1 hidden h-4 w-px bg-line-strong sm:block"
              aria-hidden="true"
            />
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-full px-3.5 text-[13.5px] font-medium text-ink-soft transition hover:bg-cream hover:text-ink sm:inline-flex"
            >
              Log in
            </Link>
            <ButtonLink
              href="/login?mode=create"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Join Morrow
            </ButtonLink>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:bg-cream lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="animate-fade-in fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-line bg-paper px-5 pb-10 pt-6 lg:hidden">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-cream/50 px-3 py-2.5">
            <span className="text-[12px] text-stone">
              Looking for something specific?
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.setTimeout(
                  () => window.dispatchEvent(new CustomEvent("morrow:command")),
                  120,
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-[11px] font-medium text-ink"
            >
              <Search className="h-3 w-3" />
              Search
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between border-b border-line/70 py-4 text-[22px] tracking-[-0.02em] text-ink"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-stone-light">
                    0{index + 1}
                  </span>
                  {link.label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-stone" />
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-2.5">
            <ButtonLink
              href="/login"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Log in
            </ButtonLink>
            <ButtonLink
              href="/login?mode=create"
              size="lg"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Create your account
            </ButtonLink>
          </div>
          <p className="mt-8 text-[12.5px] leading-relaxed text-stone">
            Morrow is a quieter place to find work — and to hire people who
            care. Roles with salary ranges, honest timelines, and no black
            holes.
          </p>
        </div>
      )}
    </>
  );
}
