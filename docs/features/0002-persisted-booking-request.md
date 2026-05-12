# Feature 0002: Persisted booking request

## Acceptance criteria

- Submitting the booking form creates a `Booking` row with property id, date range, guest count, guest name, email, optional message, and status suitable for a “request” flow.
- Server validates payload with **Zod**; invalid data returns field-level or general errors without creating a row.
- **No overlap** with existing confirmed (or pending) bookings for the same property; second concurrent submit for the same slot results in a friendly error, not a 500.
- Success shows a **booking reference** (public id) to the user.
- If the database is unavailable at runtime, the UI surfaces a clear error and does not claim success.

## Out of scope (this feature)

- Stripe, OAuth calendar sync, transactional email.
