"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  BriefcaseIcon,
  CarIcon,
  CategoriesGridIcon,
  HomeIcon,
  WrenchIcon,
} from "./Icons";

type NavLinkProps = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${
        active ? "text-brand" : "text-muted hover:text-foreground"
      }`}
    >
      <Icon className="size-[22px]" strokeWidth={active ? 2 : 1.75} />
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/85 shadow-nav backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.6rem)]">
        <NavLink href="/" label="Home" icon={HomeIcon} />
        <NavLink href="/jobs" label="Jobs" icon={BriefcaseIcon} />
        <Link
          href="/rides"
          aria-label="Book a ride"
          title="Book a ride"
          className="flex flex-col items-center"
        >
          <span className="-mt-6 grid size-14 place-items-center rounded-full bg-brand text-white shadow-raised transition-colors hover:bg-brand-strong active:scale-95">
            <CarIcon className="size-6" />
          </span>
          <span className="mt-0.5 text-[11px] font-semibold text-brand">Ride</span>
        </Link>
        <NavLink href="/services" label="Services" icon={WrenchIcon} />
        <NavLink href="/categories" label="Categories" icon={CategoriesGridIcon} />
      </div>
    </nav>
  );
}
