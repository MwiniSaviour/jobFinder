# JobFinder — Design System

Delivered design contract. This document describes the design as shipped; fight drift by updating it alongside visual changes.

## Design language

Warm paper: the shell is a soft paper surface (`#f3f1ea`) with white cards (`bg-surface`) sitting on it, one elevation step via `shadow-card`. Action color is a single teal family (`#0e7490` → `#155e75`); neutral text on paper uses the warm-tinted `muted` (`#6e6d64`) rather than pure gray. Typography is Geist Sans at compact mobile scale with `-0.01em` tracking; the system is tuned for a ~390px viewport with a mobile-first five-slot bottom nav (bar + raised teal Ride FAB, body reserves `pb-[5.5rem]` + safe-area) — each screen is a vertical card stack, no tabs. On desktop the same single column stays centered (`max-w-lg`), nothing widens.

## Token map (Tailwind v4, `@theme inline` in `src/app/globals.css`)

```css
--color-surface: #ffffff;
--color-surface-alt: #f8f7f1;
--color-border: #e5e2d7;
--color-muted: #6e6d64;
--color-brand: #0e7490;
--color-brand-strong: #155e75;
--color-brand-soft: #ecfeff;
--color-accent: #eab308;   /* rating star only */
--radius-*: xs 10px · sm 14px · lg 18px · xl 22px
--shadow-card: 0 1px 2px rgb(23 23 23 / 0.04), 0 4px 14px rgb(23 23 23 / 0.05);
--shadow-hover: 0 2px 4px rgb(23 23 23 / 0.06), 0 8px 22px rgb(23 23 23 / 0.08);
--shadow-nav: 0 -6px 20px rgb(23 23 23 / 0.06);
--shadow-raised: 0 4px 12px rgb(14 116 144 / 0.35);
```

## Shared primitives + APIs (`src/components/`)

- `Chip` — pill action/button. `<Chip active={boolean} className={string} {...buttonProps}>{children}</Chip>` — active: `bg-brand text-white`; idle: `bg-surface border border-border hover:border-brand/40`.
- `chipClass(state: "active" | "idle")` — class-string helper used by `Chip` and for stateful styling without a real button.
- `CategoryTile` — tinted category icon tile. `<CategoryTile category={string} size="md" | "lg" className={string} />` — md `w-14 h-14 rounded-[14px]`, lg `w-[72px] h-[72px] rounded-[18px]`; icon resolved by lowercase category name (delivery/driving/moving → Car, tech → Briefcase, repair/maintenance/home → Wrench), falls back to the first letter monogram; known tints in `#ecfeff / #e0f2fe / #ccfbf1 / #f1f5f9`, default `#eff6ff`.
- `SectionHeader` — section title row. `<SectionHeader title={string} action={{ href: string, label?: string }} />` — label defaults to "See All"; heading `text-[17px] font-semibold tracking-[-0.01em]`, action `text-[13px] text-muted hover:text-brand` with a 3.5px chevron.
- `TrustBadge` — trust pill. `<TrustBadge label={string} className={string} />` — default label "Background-checked"; `bg-brand-soft text-brand` with 3px ShieldCheck icon; exported `trustBadgeClass` for reuse.
- `HeroCarousel` — scroll-snap promo carousel. `<HeroCarousel />` — three full-bleed slides (`h-[168px]`, `rounded-[22px]`, teal gradients, decorative corner icon, inline CTA link), nearest-slide dot indicator synced from scroll position; slides defined in module scope. The ~12px next-slide peek clipped by the scroller edge is intentional (`-mx-5` bleed + `snap-x`) — it is not an overflow bug.

## Pinned constraints

- BottomNav: five slots (Home, Jobs, **Ride FAB**, Services, Categories), fixed `inset-x-0 bottom-0`, `border-t border-border bg-white/85 shadow-nav backdrop-blur-md`; inner grid `max-w-lg grid-cols-5 px-4`; active tab is `text-brand font-semibold` with no filled-icon variants; the raised Ride FAB is always teal (`bg-brand`, `shadow-raised`, `-mt-6`, `size-14`) regardless of active state.
- Report bodies sit on `body { pb-[5.5rem] }` (layout.tsx) so lists never hide under the fixed nav; do not re-add per-page padding hacks.
- Cards use `bg-surface border border-border rounded-[22px] shadow-card` — one elevation step only; hover lifts to `shadow-hover border-brand/30`.
- Every interactive element gets `transition-colors`; focus is always the global `:focus-visible` ring (`outline 2px --color-brand/60 offset 2px`) — no per-component ring overrides.
- Icon set is hand-drawn in `Icons.tsx` on `viewBox 0 0 24 24`, stroke ~1.8 (2 when active), round caps/joins, `aria-hidden` — never swap in a library.
- Warm-paper tokens are the source of truth in `globals.css`; no `@theme` token may be duplicated in component files (inline hex values allowed only for CategoryTile tints, which Tailwind cannot express as data-driven tokens).
- No emoji, no fake avatars or review counts; ratings appear only where real review data exists (yellow star uses `--color-accent`); all human-facing copy lives in string constants or props.

## Categories library + screen

- `src/lib/categories.ts` — canonical category registry. `CategoryDef` = `{ name: string; icon }` with hand-drawn icons from `Icons.tsx`. `JOB_CATEGORIES` (12: Delivery, Food & drink, Tech, Driving, Education, Warehouse, Retail, Cleaning, Office, Security, Caregiving, Events) and `SERVICE_CATEGORIES` (10: Home, Repair, Maintenance, Tech, Moving, Pet, Laundry & Dry Cleaning, Car Wash, Catering, Beauty & Wellness). `src/lib/jobs.ts` derives its `CATEGORIES` filter list from `JOB_CATEGORIES` — never hand-edit that list.
- Icons added to `Icons.tsx`: CategoriesGridIcon (nav tab), XIcon (chip remove), Coffee, Monitor, GraduationCap, Package, ShoppingBag, Sparkles, Clipboard, Paw.
- Home header now carries a profile avatar link (`size-10` round tile, `bg-brand-soft text-brand`, `aria-label="Your profile"`) → `/profile`.
- `/categories` — header (back chevron via `router.back()`, title "All categories", subtitle), then two `CategorySection`s (Jobs, Services): a full-width "All jobs"/"All services" row card (icon tile `bg-brand-soft text-brand` + trailing arrow) above a `grid grid-cols-3` of icon cards. Every card navigates to `/jobs?category=…` or `/services?category=…` (name `encodeURIComponent`-ed); +40ms per-card hero-rise stagger.
- Seeds expanded: jobs id 8–13 (Retail, Cleaning, Office, Security, Caregiving, Events — new categories, so `CategoryTile` falls back to its letter monogram), services id 7–12 (Laundry & Dry Cleaning, Car Wash, Catering, Beauty & Wellness, Pet, Maintenance), mirrored on the home page.

## `?category=` deep links

- Both listing screens preselect their category from the URL query: `/jobs?category=Delivery`, `/services?category=Car%20Wash`. On `/jobs` a module-scope `useSyncExternalStore` store seeds `?category` once (empty server snapshot) and filters the results memo + renders a removable `Chip` (XIcon) ahead of the category-filter chips; Clear all also clears it. On `/services` (server component) the query filters the list directly; a chip row of `Link`s built with `chipClass` marks the active category, and an empty match renders "No services found." + "Show all services".
- `ServiceFilter` rows now link to their own category (`/services?category=…`) instead of the bare list.
