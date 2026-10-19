# JobFinder — UI spec (v1)

Companion specs:

- [Find Jobs](./find-jobs.md) — job search, apply, tracking
- [Find Services](./find-services.md) — service discovery and booking
- [Book a Ride](./book-a-ride.md) — ride hailing and reserved rides

## How to read this spec

Every decision traces to a researched real-world source. Copy marked **verified** is verbatim from a platform help page or product; every other string extends the shared conventions in this file and is pattern-derived, not a claimed product quote.

## Product context

JobFinder is a consumer web app (Next.js App Router · TypeScript · Tailwind CSS · light mode only) serving three audiences from one design system:

- **Find Jobs** — job seekers browse company listings and apply.
- **Find Services** — customers book local service providers.
- **Book a Ride** — riders book trips and reserve rides up to 90 days ahead.

## Product priorities

1. **One shared design system.** All three features share components, spacing, copy conventions, and empty-state rules.
2. **Upfront price everywhere.** Jobs show salary; services show price; rides show fare. Listings without salary are hidden by default; "Contact for pricing" is banned.
3. **One primary CTA per screen.** Detail screens allow at most 2 CTAs; the primary action sticks to the bottom.
4. **Alerts are saved-search emails — not notifications.** No notification permissions or OS banners in v1.
5. **Trust badges on every provider card.** Each badge opens a plain-language "what was verified" explanation on tap.

## Anti-patterns (banned in v1)

- Multi-page wizards.
- Forced account creation before any value is shown.
- Hidden or vague cancellation policies.
- Listings omitting salary/price, or cost behind "Contact for pricing".

## Shared components

| Component | Contract |
| --- | --- |
| `SearchBar` | Persistent on list homes; visible placeholder; `SavedListRow` recents capped at 20. |
| `FilterSheet` | Sheet over the list; chips plus `Apply filters (n)`; filters and sort survive navigation, reset on restart. |
| `ResultCard` | Title, price always visible, rating + count, badges, primary action. |
| `TrustBadge` | On every provider card; tap opens what was verified. |
| `PrimaryCTA` | One per screen; sticky/following at bottom. |
| `Stepper` | ≤3 steps; progress visible; `Continue` advances. |
| `NoteField` | Free-text note (e.g. "Note for your driver"). |
| `SavedListRow` | Row in Profile's `Applications` / `Bookings` / `Rides`. |
| `EmptyState` | Title plus exactly one next action. |
| `PromiseStrip` | Plain-language policy strip on detail screens (e.g. "Free cancellation until …"). |

## Final cross-cutting rules

1. Any flow longer than one screen collapses to ≤3 steps (`Stepper`).
2. Price is visible before any commitment is requested.
3. Detail screens carry one `PrimaryCTA` (sticky bottom) and at most 2 CTAs total.
4. Alerts are saved-search emails; saved filters produce periodic emails. Never OS notifications.
5. `TrustBadge` appears on every provider card and explains itself on tap.
6. Empty lists read "No X yet." with one next action.
7. Empty result sets read "No X found." plus relevant chips and `Clear filters`.
8. Shared error: "Something went wrong. Please try again." with a `Try again` action.
9. Toasts are ≤3 words: `Application sent.`, `Booking confirmed.`, `Thanks for riding.`
10. Filters and sort survive navigation within the session and reset on app restart.
11. Recents (`SavedListRow`) cap at 20 entries everywhere.

## Copy conventions

- Price format: `From $XX` for estimated prices; salary as `$XX/hr` or `From $XX`; unverified estimates tagged `est.`
- Post-action badges: `Applied`, `Booked`.
- Profile sections: `Applications`, `Bookings`, `Rides`.

## Intentional divergences between features

| Divergence | Rationale |
| --- | --- |
| B and C use different cancellation windows | Real platforms differ; each feature shows its own true window in `PromiseStrip`. |
| Email alerts are A-only | Jobs recur on demand; services and rides are one-off transactions. |
| OS notifications deferred | Out of v1 scope; all statuses surface in Profile and in-app banners. |

## Verification ledger — the 11 accepted picks

| # | Decision | Status | Source |
| --- | --- | --- | --- |
| 1 | C free-cancel copy: "2 minutes after your driver accepts" | Picked — corrected, defensible | Uber cancel-fee help page; Bolt cancellation article |
| 2 | C free-wait = 5 min (see footnote) | Picked — defensible | Uber ride-cancel help page; Bolt no-show article |
| 3 | Tip chips `None · 10% · 15% · 20%`; flow verified, percentages are a documented default | Picked | Uber tips help page (flow verified); chip percentages = industry-standard pattern, not verified against Uber's current screen |
| 4 | C tracking v1 = `Call · Message · Share ride` (Share only); SOS deferred | Picked — accepted | Report decision |
| 5 | Mid-trip destination edit allowed until driver announces arrival; fare replaced by time + distance; "Final amount set at drop-off." | Picked — **fully verified** | Uber "review the price for a trip" + "upfront fare not honored" help pages |
| 6 | C matching copy: "Finding your driver…" + no-drivers retry line | Picked — accepted | Report copy set |
| 7 | Ride chips Economy · Comfort · SUV; cheapest-first sort; fastest-first re-rank at ETA gap ≥ 2 min | Picked — defensible | Report decision |
| 8 | B cancellation window: "Free cancellation until 2 hours before the booking." | Picked — defensible | Report decision |
| 9 | C live driver status v1 = in-app banner only; OS notification deferred | Picked — accepted | Report decision |
| 10 | Recents cap = 20, shared by A and B | Picked — defensible | Report decision |
| 11 | B empty state: "No bookings yet." | Picked — accepted | Report copy set |

### Verification source URLs

- Pick 1 — `https://help.uber.com/driving-and-delivering/article/cancellation-fee?nodeId=67ced539-6a40-45bc-a1ff-10f72fbcd098` (2 min after request, economy; 5 min premium) and `https://bolt.eu/en/support/articles/360009457274/` (2 min after driver accepts; drivers wait 3–8 min).
- Pick 2 — `https://wait-window sources: Uber ride-cancel help page (economy 7 min, premium 15 min) and Bolt no-show article (drivers wait 3–8 min): `https://bolt.eu/en/support/articles/360019510579/`.
- Pick 3 (flow) — `https://www.uber.com/us/en/ride/how-it-works/tips/`; chip search only hit: `https://medium.com/uber-under-the-hood/our-approach-to-tipping-aa0074c0fddc` (2016, no chip percentages).
- Pick 5 — `https://help.uber.com/riders/article/i-want-to-review-the-price-for-a-trip?nodeId=f5a6c432-2a21-431e-966d-623087cb24e2` and `https://help.uber.com/en/riders/article/my-upfront-fare-was-not-honored?nodeId=ff65490e-2ffb-41cf-a709-4611521c7b24`.
- Reserve range — `https://bolt.eu/en/support/articles/7392556548114/` (Bolt: reserve 30 min to 90 days ahead).
- Lyft cancellation grounding — `https://help.lyft.com/hc/en-us/all/articles/115012922687-How-to-cancel-a-ride`.
- B on-demand booking grounding — `https://help.thumbtack.com/article/on-demand-bookings`.
