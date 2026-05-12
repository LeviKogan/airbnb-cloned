# Architecture — Stay Victoria (airbnb-cloned)

## Overview

Listings and marketing content are **static** TypeScript modules under `src/lib/data/`. **Availability** merges mock blocked ranges with **SQLite** bookings via Prisma. Guests submit **booking requests** through a **Server Action** that validates with Zod and writes inside a Prisma transaction.

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
    Mock[mockOccupiedRangesByPropertyId]
    Db[prisma.booking.findMany]
  end
  Page --> Occ
  Occ --> Mock
  Occ --> Db
  Page --> SidebarProps[PropertyBookingSection_props]
  SidebarProps --> Client[PropertyBookingSidebar_client]
```

If the database query throws (for example, missing `DATABASE_URL` or corrupt file), `getOccupiedRangesForProperty` falls back to **mock ranges only** so listing pages keep rendering.

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
