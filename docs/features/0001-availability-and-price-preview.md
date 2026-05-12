# Feature 0001: Availability and price preview

## Acceptance criteria

- Guest can select check-in and check-out using date inputs; checkout must be strictly after check-in.
- Guest count is capped at the property’s `guests` maximum with a clear control.
- Subtotal shows **nights × price per night** and updates when dates change.
- **Reserve** is disabled until the range is valid, guest count is valid, and the range does not overlap any occupied range (mock blocks and, when configured, existing DB bookings).
- Overlapping ranges show an inline message explaining unavailability (not a silent failure).

## Out of scope (this feature)

- Payment capture, emails, host dashboard.
