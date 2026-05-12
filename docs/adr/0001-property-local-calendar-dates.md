# ADR 0001: Property-local calendar dates (Australia/Melbourne)

## Status

Accepted

## Context

Stays are priced and reserved by **calendar night**, not UTC instant. Guests and hosts reason about check-in/check-out in the property’s timezone.

## Decision

- Represent guest selections as **ISO calendar date strings** (`YYYY-MM-DD`) with no time-of-day component in the UI or API payload.
- Document business rules (minimum nights, overlap) in terms of those calendar dates, aligned with **Australia/Melbourne** for Victoria listings.
- Compute night counts and ordering using **UTC midnight** derived from parsed `Y-M-D` components so behavior is stable and does not depend on the visitor’s local timezone.

## Consequences

- Correct for same-day semantics across browsers; not a full iCal timezone engine.
- If listings span multiple timezones later, introduce explicit `timezone` per property and centralize parsing.
