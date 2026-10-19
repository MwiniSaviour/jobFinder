# Find Services — UI spec (Course B)

Part of [JobFinder's UI spec v1](./ui-spec.md); read the shared system there first (components, final rules, copy conventions).

## Flow

```
[1] Search home → [2] Results → [3] Provider detail → [4] Booking stepper → [5] After booking
```

## State 1 — Search home (intake)

**Components:** `SearchBar`, `SavedListRow`, `TrustBadge`, `EmptyState`

- `SearchBar` placeholder visible when empty: "**What service do you need?**" — the empty screen states the primary action, as in Course A.
- Recents under the search bar as `SavedListRow` items, capped at **20**.
- `TrustBadge` appears on every provider result from this screen onward.
- No alerts on this course. Email alerts are a jobs feature (Course A); one-off service searches don't justify subscription-style alerting in v1.
- Empty history: `EmptyState` "**No searches yet.**" with exactly one next action.

## State 2 — Results

**Components:** `ResultCard`, `FilterSheet`, `TrustBadge`, `EmptyState`

- One `ResultCard` per provider: name, one category chip, rating, `TrustBadge`, price, primary **Book** action.
- Price is mandatory and always visible, same as salary in Course A (`$XX/hr` hourly; `From $XX` estimated with the `est.` tag). Provider search never surfaces cards without price.
- `FilterSheet` opens over the results (never a full-page wizard), chips plus "**Apply filters (n)**" with a live count; filters persist per Course A rules.
- Empty state: "**No service providers found.**" + active chips + `Clear filters`.

## State 3 — Provider detail

**Components:** `PromiseStrip`, `PrimaryCTA`, `TrustBadge`

- Sole top-level CTA is **Book**, stuck to the bottom bar (mirrors Course A's Apply). At most 2 CTAs on screen.
- `PromiseStrip`: "**Free cancellation until 2 hours before the booking.**" — the cancellation window is stated before the user commits, never discovered later.
- **Message** is a post-booking feature only; it is never offered from the detail screen. One booking step, conversations only inside `Bookings`.
- `TrustBadge` tap opens the same plain-language card as everywhere: what was verified, what wasn't.

## State 4 — Booking stepper 🚧

**Components:** `Stepper`, `NoteField`, `PrimaryCTA`, `PromiseStrip`

- Step 1 — "**A few quick details**": at most 3 fields, `Continue` advances; `NoteField` for "Anything the provider should know?" lives here.
- Step 2 — "**Confirm your booking**": full summary rendered, confirm submits.
- Submit state: "**Confirming…**" — a single spinner, nothing else moves.
- `PromiseStrip` stays visible on every step; the free-cancellation window never leaves the user's sight during commitment.
- `Stepper` is capped at 2 steps in v1 (shared-space rule of ≤3).

## State 5 — After booking

**Components:** `Profile`, `EmptyState`

- `Booked` badge on the provider card, same recognition model as `Applied` in Course A.
- Confirmation is a bottom-sheet summary at booking time; the long-term home is `Profile` → **Bookings**.
- Chat with the provider opens only after the booking exists.
- Profile empty state: "**No bookings yet.**" with exactly one next action.

## Notes

- Scheduled future bookings are a natural next pick for Course B (Bolt-style "reserve" windows), but v1 ships on-demand instant booking only.
- Email alerts remain Course A only — see the Divergences in the shared spec.
- The 2-hour free-cancel window is Course B's; Course C's ride window is driver-accept based and much shorter (see the shared-spec table).
