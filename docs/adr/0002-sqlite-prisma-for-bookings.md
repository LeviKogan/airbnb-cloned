# ADR 0002: SQLite + Prisma for booking persistence

## Status

Accepted

## Context

Feature 2 requires durable bookings, overlap checks, and a path toward concurrency-safe writes without operating a remote database during early development.

## Decision

Use **Prisma** with **SQLite** (`file:./dev.db`) for the `Booking` table. Listings remain static TypeScript data keyed by `property.id` strings; bookings reference that same id.

## Consequences

- Local `npm run dev` works offline; `DATABASE_URL` documented in `.env.example`.
- Production would move to Postgres with minimal Prisma schema change.
- Application code treats missing `DATABASE_URL` as “bookings unavailable” and falls back to mock-only availability for reads where appropriate.
