"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  SquareKanban,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { CompanyMark } from "@/components/ui/company-mark";
import { Avatar } from "@/components/ui/avatar";
import {
  Menu as Dropdown,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "@/components/ui/menu";
import { cn } from "@/lib/utils";

const workspaceNav = [
  { href: "/hire", label: "Overview", icon: LayoutDashboard },
  { href: "/hire/pipeline", label: "Pipeline", icon: SquareKanban },
  { href: "/hire/roles", label: "Roles", icon: Briefcase },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Logo />
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-stone-light">
          Preview
        </span>
      </div>

      <div className="px-3">
        <Dropdown
          align="left"
          className="w-full"
          panelClassName="w-[224px]"
          trigger={({ toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-paper-raised p-2.5 text-left transition hover:border-line-strong"
            >
              <CompanyMark monogram="L" tone="ink" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-ink">
                  Lumen
                </p>
                <p className="truncate text-[9.5px] text-stone">
                  Recruiter workspace
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-stone" />
            </button>
          )}
        >
          {({ close }) => (
            <>
              <MenuLabel>Workspaces</MenuLabel>
              <MenuItem onClick={close}>
                <CompanyMark
                  monogram="L"
                  tone="ink"
                  size="sm"
                  className="h-6 w-6 rounded-md text-[9px]"
                />
                Lumen
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sage" />
              </MenuItem>
              <MenuSeparator />
              <MenuItem href="/dashboard" onClick={close}>
                <UserRound className="h-3.5 w-3.5" />
                Candidate dashboard
              </MenuItem>
              <MenuItem href="/" onClick={close}>
                <ExternalLink className="h-3.5 w-3.5" />
                morrow.work
              </MenuItem>
              <MenuSeparator />
              <MenuItem href="/login" onClick={close} danger>
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </MenuItem>
            </>
          )}
        </Dropdown>
      </div>

      <nav aria-label="Workspace" className="mt-6 flex-1 overflow-y-auto px-3">
        <p className="px-2 pb-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-stone-light">
          Workspace
        </p>
        <div className="space-y-0.5">
          {workspaceNav.map((item) => {
            const active =
              item.href === "/hire"
                ? pathname === "/hire"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition",
                  active
                    ? "bg-cream text-ink"
                    : "text-stone hover:bg-cream/60 hover:text-ink",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[15px] w-[15px]",
                    active
                      ? "text-clay-deep"
                      : "text-stone-light group-hover:text-stone",
                  )}
                  strokeWidth={1.8}
                />
                {item.label}
                {item.label === "Pipeline" && (
                  <span className="ml-auto rounded-full bg-paper px-1.5 py-0.5 font-mono text-[8.5px] text-stone">
                    24
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <p className="mt-6 px-2 pb-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-stone-light">
          Create
        </p>
        <Link
          href="/hire/jobs/new"
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium transition",
            pathname === "/hire/jobs/new"
              ? "bg-ink text-paper"
              : "border border-dashed border-line-strong text-stone hover:border-ink/30 hover:text-ink",
          )}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Post a role
        </Link>

        <div className="mt-8 rounded-xl border border-line bg-paper-raised/70 p-3.5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-stone-light">
            This cycle
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-ink">
            Your first role is free
          </p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-stone">
            Two more roles included in the preview workspace.
          </p>
          <Link
            href="/hire/jobs/new"
            onClick={onNavigate}
            className="mt-2.5 inline-flex items-center gap-1 text-[9.5px] font-medium text-ink"
          >
            Post a role
            <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-1.5">
          <Avatar name="Maya Chen" src="/images/avatar-mei.jpg" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-ink">
              Maya Chen
            </p>
            <p className="truncate text-[9px] text-stone">
              Head of Design · Lumen
            </p>
          </div>
          <Link
            href="/dashboard"
            aria-label="Candidate view"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone transition hover:bg-cream hover:text-ink"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function HireShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f6f0]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-paper xl:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-line bg-paper px-4 xl:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/hire/jobs/new"
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-ink px-3 text-[11px] font-medium text-paper"
          >
            <Plus className="h-3 w-3" />
            Post
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open workspace menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="animate-slide-left absolute inset-y-0 left-0 w-[268px] border-r border-line bg-paper">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-line text-stone"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="xl:pl-[248px]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[280px] bg-cream/50" />
          <main
            id="main"
            className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
