# Architecture — Stay Victoria (airbnb-cloned)

## Overview

Listing image assets and stable slugs live in **static** TypeScript modules under `src/lib/data/`; admin edits are persisted as `PropertyOverride` rows and merged on read. **Availability** merges active SQLite bookings with admin-managed `BlockedDateRange` rows via Prisma. Guests submit **booking requests** through a **Server Action** that validates with Zod and writes inside a Prisma transaction.

## Request path: booking request

```mermaid
sequenceDiagram
  participant Browser
  participant Sidebar as PropertyBookingSidebar
  participant Action as createBooking_server_action
  participant Prisma as Prisma_SQLite
  participant Static as properties_ts

  Browser->>Sidebar: Dates_guests_form
  Sidebar->>Action: createBooking_payload
  Action->>Static: Resolve_property_limits
  Action->>Action: Zod_validate_overlap_mock_blocks
  Action->>Prisma: transaction_find_conflict_create
  Prisma-->>Action: booking_or_null
  Action-->>Sidebar: ok_with_bookingId_or_error
  Sidebar-->>Browser: Confirmation_or_inline_error
```

## Read path: property page

```mermaid
flowchart TB
  subgraph ssr [Server]
    Page[property_slug_page]
    Occ[getOccupiedRangesForProperty]
    Db[prisma.booking.findMany]
    Blocks[prisma.blockedDateRange.findMany]
  end
  Page --> Occ
  Occ --> Db
  Occ --> Blocks
  Page --> SidebarProps[PropertyBookingSection_props]
  SidebarProps --> Client[PropertyBookingSidebar_client]
```

If the database query throws (for example, missing `DATABASE_URL` or corrupt file), listing pages keep rendering with an empty availability set and booking submissions return a friendly service error.

## Admin workspace

The `/admin` route contains a responsive overview, listing editor, and per-property calendar. Mutations use Server Actions with Zod validation and call `revalidatePath` for both admin and guest routes. Blocking and booking creation repeat overlap checks inside Prisma transactions so an admin block cannot silently conflict with a guest reservation.

## Identity and payment lifecycle

- Auth.js persists Google OAuth users, accounts, and database sessions through the Prisma adapter.
- `ADMIN_EMAILS` grants host access; admin pages, data-access functions, and every admin Server Action verify authorization independently.
- A new request starts as `pending`.
- Admin acceptance calculates the total from server-side listing data, creates a Stripe Checkout Session, changes the request to `awaiting_payment`, and sends the URL through Resend.
- `/api/stripe/webhook` verifies Stripe's signature and changes the booking to `confirmed` only when the matching Checkout Session reports a paid payment status.
- Google sign-in links historical bookings whose guest email matches the account email, allowing `/account` to show booking and payment state.

## Folder conventions

| Area | Location |
|------|-----------|
| Domain pure logic | `src/lib/domain/` |
| Shared types | `src/lib/types/` |
| Static seed data | `src/lib/data/` |
| Server-only data access | `src/lib/server/` |
| Prisma client | `src/lib/db/prisma.ts` |
| Server Actions | `src/app/actions/` |
| UI components | `src/app/components/` |

## Decisions

See [docs/adr](./adr/) for timezone and persistence choices.
