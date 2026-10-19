# Book a Ride — UI spec (Course C)

Part of [JobFinder's UI spec v1](./ui-spec.md); read the shared system there first (components, final rules, copy conventions).

## Flow

```
[1] Home → [2] Choose ride → [3] Matching → [4] Driver assigned → [5] In-trip (destination edit) → [6] Tip & rating → [7] Receipt
```

## State 1 — Home

**Components:** `SearchBar`, `EmptyState`, `SavedListRow`

- A `SearchBar` asking "**Where to?**" — the screen leads with destination, not with product choice.
- Saved places and recents as `SavedListRow`; empty state "**No saved places yet.**".
- Destination error: "**We couldn't find that place.**"
- Rides history is a Profile concern; its empty state reads "**No rides yet.**" and offers one next action: "**Reserve a ride — up to 90 days ahead**" (Bolt supports reservations from 30 minutes to 90 days ahead).
- No email alerts on this course.

## State 2 — Choose ride

**Components:** `PrimaryCTA`, `NoteField`, `ResultCard`

- Product chips: **Economy · Comfort · SUV**.
- Quote banner: "**Fare shown upfront — tolls and surcharges may apply.**"
- `ResultCard` list, cheapest-first; re-ranks fastest-first when an option's ETA is ≥ 2 minutes better, with the ETA visible on the card.
- `NoteField` "**Note for your driver**" before confirming.
- Primary CTA **Confirm pickup**; the card-hold footnote is pattern-derived (no platform copy used verbatim).

## State 3 — Matching

- Title "**Finding your driver…**", subtitle "**Usually under a minute.**"
- Cancellation before assignment is free and always available in the stepper's place.
- No drivers available: "**No drivers near you for [Product].**" with an alternative: "**Try [Alternate] — drivers 3 min away**".

## State 4 — Driver assigned 🚧

**Components:** `PromiseStrip`

- Vehicle line: "**Silver Honda Civic · Plate 7KJD382**"; ETA line: "**Arriving in 3 min**". ETA from assignment to arrival mirrors a driver-accept flow; it is adapted, not a verified Uber string.
- Actions: **Call · Message · Share ride** (SOS is deferred to the safety round).
- Free-cancel copy (verified pattern): "**2 minutes after your driver accepts**" — beyond that, the cancellation fee applies (Uber's service-fee rule; exact string is the v1 commitment).
- On arrival the banner becomes "**Your driver has arrived. Free wait time: 5 min.**"; on expiry "**Free wait time is over. Waiting time is now charged per minute.**"
- No OS push notifications in v1 — live status is the in-app banner only (deferred).

## State 5 — In-trip (destination edit)

- "**Add or change destination**" is available until the driver announces arrival; changing it re-quotes the new fare immediately.
- Payment note: "**Final amount set at drop-off.**" (verified). The card-hold can move for destination edits — pattern-derived, not verified.

## State 6 — Tip & rating

**Components:** `PrimaryCTA`

- Tip chips: **None · 10% · 15% · 20%** plus `Submit`; no custom tip amount in v1.
- Tips remain changeable up to **30 days** after the trip.
- Toast on submit: "**Thanks for riding.**"

## State 7 — Receipt

- Lines: **Fare · Wait time fee · Cancellation fee**.
- Any added charge is explained on the receipt before the profile view — no hidden fees.

## Notes

- Tips: chip percentages are a documented default (an industry pattern matching DoorDash/Lyft) rather than a verified Uber screen; the underlying flow — upfront quote, changeable tip up to 30 of the ride's days — is verified (Uber tips help page). Chip sourcing is disclosed there, not silently claimed.
- SOS, OS notifications and multi-vehicle comparison beyond Showcase are deferred; they are candidates for a later pick.
- Course C's free-cancel window (driver-accept based) is much shorter than Course B's 2-hour window — see the Divergences in the shared spec.
