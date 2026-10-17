# Morrow — work worth wanting

A production-grade, UI/UX-first job discovery and application platform — a deliberately calmer take on the professional job network. Built with **Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript**, designed and engineered as a real product with three connected experiences: **candidate discovery**, a **candidate application tracker**, and a **recruiter hiring workspace**.

> The focus of this repository is UI/UX craft: information architecture, interaction design, typography, motion, accessibility, and realistic production states.

---

## The product idea

Most job boards optimise for volume. Morrow optimises for the moment someone decides.

Three principles shaped every screen:

1. **Salary transparency is structural, not decorative.** Every listing carries a real range; the salary explorer derives its bands from the same data. A role without a range cannot exist in the model.
2. **The timeline is part of the listing.** Teams publish their process and reply commitment before someone applies, and the candidate tracker mirrors the same stages.
3. **Fewer, better surfaces.** One strong profile reused with care, an application that takes a minute, and a pipeline that updates in one click.

## Experiences

### Candidate
| Route | What it demonstrates |
| --- | --- |
| `/` | Editorial marketing page: hero search, featured roles, product proof, company spotlight, testimonials, employer CTA |
| `/jobs` | Faceted search: keyword, location, work mode, craft, experience, employment, salary slider, company — live counts, active filter chips, URL state, sort, mobile filter sheet, empty state |
| `/jobs/[company]/[slug]` | Full job detail: salary panel, responsibilities, process timeline, company profile, structured `JobPosting` JSON-LD, sticky mobile apply bar |
| Application dialog | Two-step apply flow with review, contact details, optional note, privacy control, loading and success states |
| `/companies` · `/companies/[slug]` | Company directory and editorial company profiles with open roles |
| `/salaries` | Salary explorer with role/level range visualisation and live listings |
| `/login` | Split-screen authentication with social providers, validation, password visibility, demo entry |
| `/dashboard` | Application tracker: summary stats, offer banner, expandable timelines with next steps, profile strength, reminders, saved roles |
| `/dashboard/saved` | Shortlist with live save state (persisted) and saved searches |
| `/dashboard/profile` | Sectioned profile editor with unsaved-changes bar, skills, experience, preferences, visibility controls |

### Recruiter
| Route | What it demonstrates |
| --- | --- |
| `/hire` | Workspace overview: KPI cards with sparklines, pipeline funnel, roles table, to-dos, activity, week calendar |
| `/hire/pipeline` | Drag-and-drop Kanban board + list view, filtering, candidate drawer with rating, stage controls, notes, timeline |
| `/hire/roles` | Role management with stage distribution bars and per-role metrics |
| `/hire/jobs/new` | Three-step post-a-role wizard with validation, live preview, and publish success state |

## Design system

**Colour — a warm paper palette.** `#fbfaf6` paper, ink `#1a1b17`, clay `#bf5b3a` (primary accent), sage `#476b58` (progress/positive), ochre `#d9a852` (warm highlight), plus sand/cream/line neutrals. Every accent has a soft tint for badges and surfaces.

**Type — editorial contrast.** `Fraunces` (variable, SOFT/WONK axes) for display: set tight, with true italics for emphasis. `Instrument Sans` for UI text at a compact 13–15px scale. `JetBrains Mono` for eyebrows, metadata and figures. This pairing carries the "considered, human, professional" tone without resorting to gradients or glassmorphism.

**Layout & rhythm.** 4/8px spacing scale, 76rem content container, hairline `#e5dfd2` borders instead of heavy shadows, and generous vertical rhythm (`py-20 → py-28`). Cards use a single subtle shadow that lifts on hover.

**Components.** Buttons (6 variants × 6 sizes), badges, company monograms, avatars/stacks, inputs, selects, checkboxes, radios, toggles, menus, dialog, drawer, toast, command palette, skeletons, and empty states — all token-driven via Tailwind v4 `@theme`.

**Motion.** One easing family (`cubic-bezier(.22,1,.36,1)`), 150–400ms micro-interactions, scroll reveals via `IntersectionObserver`, a slow stamp rotation in the hero, and full `prefers-reduced-motion` support.

## Accessibility & quality

- Semantic landmarks, a skip link, labelled controls, `aria-pressed` / `aria-expanded` / `aria-modal` on interactive patterns.
- Visible `:focus-visible` rings; keyboard support in the command palette (⌘K, arrows, enter, escape) and candidate drawer (escape to close).
- Colour pairings checked for contrast; body copy ≥ 4.5:1 on paper.
- Responsive from 360px to 1600px: mobile filter sheets, sticky apply bar, bottom account nav, stacked dashboards.
- Metadata, Open Graph, JSON-LD `JobPosting`, `sitemap.xml`, `robots.txt`, deterministic dates (no hydration mismatches), and static prerendering for all marketing and detail routes.

## Technical notes

```
src/
├── app/                  # App Router routes (marketing, dashboard, hire)
├── components/
│   ├── ui/               # design-system primitives
│   ├── layout/           # header, footer, app shell, command palette
│   ├── jobs/             # cards, explorer, apply flow
│   ├── app/              # candidate dashboard & profile
│   ├── hire/             # recruiter workspace
│   └── marketing/        # directory, salaries, sections
├── data/                 # companies, jobs, candidate, pipeline (typed fixtures)
└── lib/                  # formatting utilities, deterministic dates
```

- **Fonts are self-hosted** via Fontsource variable packages — no external font requests, no layout shift.
- **Images are local** (`public/images`), brand-matched editorial photography and portraits, served through `next/image`.
- **State** is intentionally local (React state + localStorage for saved jobs) with realistic transitions, so every flow can be exercised without a backend.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Requires Node 20+.

---

Designed and built with care. All companies, people, roles, and salaries in this repository are fictional and used as realistic product content.
