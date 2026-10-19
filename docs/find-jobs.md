# Find Jobs — UI spec (Course A)

Part of [JobFinder's UI spec v1](./ui-spec.md); read the shared system there first (components, final rules, copy conventions).

## Flow

```
[1] Home/intake → [2] Filter sheet → [3] Results
```

## State 1 — Home (intake)

- **Components:** `SearchBar` + `FilterSheet` entry + `EmptyState`.
- `SearchBar` sits on the persistent shell; placeholder text stays visible when the field is empty.
- Recent searches appear as `SavedListRow`s directly under `SearchBar`, capped at **20**.
- Empty applications list: **"No applications yet."** — the `EmptyState` carries exactly one next action.

## State 2 — Filter sheet

- `FilterSheet` opens over the results list (never a full-page wizard).
- Chips wrap category filters; confirm is **`Apply filters (n)`**, with the live count of applied filters.
- **Persistence rule:** filters and sort survive navigation within the session and reset on app restart.

## State 3 — Results

- Each `ResultCard` shows title, salary, rating fans where applicable, and the primary action.
- Salary is **mandatory** and always visible:
  - `$XX/hr` for hourly roles; `From $XX` for estimated totals.
  - Estimated figures are tagged **`est.`** next to the amount.
  - Listings without salary are hidden by default — no "Contact for pricing" cards exist in v1.
- Empty result set: **"No jobs found."** plus relevant chips and a **`Clear filters`** action (`EmptyState` + maybe chips, never footer pitfalls).
- Filter sheet returns behind "Results" so chips don't get lost.

## Job detail (from results)

- **CTAs:** one `PrimaryCTA` — **Apply** — that is the sole top-level CTA and also sticks to the bottom of the screen. ≤2 CTAs total; secondary actions are **Save · Share · Report**.
- `PromiseStrip` on detail shows application facts (e.g. response expectations) rather than hidden policies.

## Apply flow

- ≤3 questions, presented through `Stepper` with **`Continue`** — never a multi-page wizard beyond this cap.
- Candidates never face a forced account wall before they can see jobs; account creation happens at apply time.
- The flow ends in a toast: **"Application sent."** (≤3 words).

## After apply

- The job card in results and the detail screen instantly show an **`Applied`** badge · the same state appears in the profile.
- Profile section: **`Applications`** — a list of `SavedListRow`s for everything applied to (Application sent." state and status).
- The applications list is empty-state governed: **"No applications yet."** with one next action (start a search).

## Notes

- **Alerts are saved-search emails.** Saving a search produces a periodic email; v1 never sends OS notifications on `Applications` updates.
- Errors use the shared copy: **"Something went wrong. Please try again."** with a **`Try again`** action.
