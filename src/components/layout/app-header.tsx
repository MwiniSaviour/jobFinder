"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  Compass,
  LayoutGrid,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { SearchTrigger } from "./search-trigger";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="container-x flex h-[64px] items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <Logo />
            <nav
              aria-label="Account"
              className="hidden items-center gap-1 md:flex"
            >
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-8 items-center px-3 text-[13px] font-medium transition-colors",
                      active ? "text-ink" : "text-stone hover:text-ink",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[17px] h-px bg-ink" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SearchTrigger className="hidden sm:inline-flex" />
            <Menu
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Notifications"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone transition hover:bg-cream hover:text-ink"
                >
                  <Bell className="h-[17px] w-[17px]" strokeWidth={1.8} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-clay ring-2 ring-paper" />
                </button>
              )}
              panelClassName="w-[310px] p-0"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[12.5px] font-medium text-ink">
                  Notifications
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-stone-light">
                  3 new
                </span>
              </div>
              <div className="p-1.5">
                <MenuItem onClick={() => undefined}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft text-[10px] font-medium text-sage-deep">
                    L
                  </span>
                  <span>
                    <span className="block text-[12px] font-medium text-ink">
                      Lumen viewed your profile
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-stone">
                      2 hours ago · Senior Product Designer
                    </span>
                  </span>
                </MenuItem>
                <MenuItem onClick={() => undefined}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-soft text-[10px] font-medium text-clay-deep">
                    B
                  </span>
                  <span>
                    <span className="block text-[12px] font-medium text-ink">
                      Offer received from Basin
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-stone">
                      Yesterday · respond by 22 Oct
                    </span>
                  </span>
                </MenuItem>
                <MenuItem onClick={() => undefined}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ochre-soft text-[10px] font-medium text-[#8a641f]">
                    V
                  </span>
                  <span>
                    <span className="block text-[12px] font-medium text-ink">
                      Vela moved you to review
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-stone">
                      3 days ago · Design Engineer
                    </span>
                  </span>
                </MenuItem>
              </div>
              <div className="border-t border-line px-4 py-2.5">
                <Link
                  href="/dashboard"
                  className="text-[11px] font-medium text-ink"
                >
                  View your activity
                </Link>
              </div>
            </Menu>

            <ButtonLink
              href="/jobs"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Compass className="h-3.5 w-3.5" />
              Browse roles
            </ButtonLink>

            <Menu
              trigger={({ toggle }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Your account"
                  className="ml-0.5 rounded-full ring-2 ring-transparent transition hover:ring-line"
                >
                  <Avatar
                    name="Amara Mensah"
                    src="/images/avatar-amara.jpg"
                    size="sm"
                  />
                </button>
              )}
              panelClassName="w-[220px]"
            >
              {({ close }) => (
                <>
                  <MenuLabel>Signed in as</MenuLabel>
                  <div className="flex items-center gap-2.5 px-2.5 pb-2.5">
                    <Avatar
                      name="Amara Mensah"
                      src="/images/avatar-amara.jpg"
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-ink">
                        Amara Mensah
                      </p>
                      <p className="truncate text-[10px] text-stone">
                        amara.mensah@hey.com
                      </p>
                    </div>
                  </div>
                  <MenuSeparator />
                  <MenuItem href="/dashboard/profile" onClick={close}>
                    <UserRound className="h-3.5 w-3.5" />
                    Profile
                  </MenuItem>
                  <MenuItem href="/dashboard/saved" onClick={close}>
                    <Bookmark className="h-3.5 w-3.5" />
                    Saved jobs
                  </MenuItem>
                  <MenuItem href="/dashboard/profile" onClick={close}>
                    <Settings className="h-3.5 w-3.5" />
                    Preferences
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem href="/login" onClick={close} danger>
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile account navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-4">
          {[...nav, { href: "/jobs", label: "Discover", icon: Compass }].map(
            (item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[9.5px] font-medium",
                    active ? "text-ink" : "text-stone",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      active && "text-clay-deep",
                    )}
                    strokeWidth={1.8}
                  />
                  {item.label}
                  <span
                    className={cn(
                      "h-0.5 w-0.5 rounded-full",
                      active ? "bg-clay" : "bg-transparent",
                    )}
                  />
                </Link>
              );
            },
          )}
        </div>
      </nav>
    </>
  );
}
