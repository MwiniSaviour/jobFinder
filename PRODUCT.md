# JobFinder

## What it is
A consumer web app where everyday people handle three life errands in one place: find a job, book a household service, and call a ride. Mobile-phone-first layout (app-like column, bottom navigation), lightmode by default, web only.

## Who it's for
Household customers, job seekers, and riders who want the thing done in one tap from their phone.

## Version 1 scope
- **Frontend only.** No API routes, no server data, no database. All interaction is client-side mock state.
- Ride tracking GPS is simulated client-side.
- Three surfaces: `/jobs`, `/services`, `/rides`.

## Product priorities (from docs)
1. One shared design system across all three sections.
2. Upfront pricing on every listing. No-salary listings are hidden; "Contact for pricing" is banned.
3. One primary action per screen. Detail screens get at most two actions; the primary sticks to the bottom.
4. Alerts are saved-search emails only. No OS notifications in v1; follow-ups live in WhatsApp/mobile money.
5. Every provider card carries a TrustBadge; tapping it shows what was verified in plain language.

## Banned anti-patterns
- Multi-page wizards for booking/search.
- Forced account creation before the user sees value.
- Vague or hidden cancellation.
- Listings that omit price.
