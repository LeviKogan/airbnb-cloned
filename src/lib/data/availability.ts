import type { DateRangeIso } from "@/lib/types/booking";

/**
 * Mock occupied ranges for demos and tests before DB bookings exist.
 * Half-open [checkIn, checkOut) per ADR 0001.
 */
export const mockOccupiedRangesByPropertyId: Record<string, DateRangeIso[]> = {
  "1": [
    { checkIn: "2026-06-10", checkOut: "2026-06-14" },
    { checkIn: "2026-07-01", checkOut: "2026-07-05" },
  ],
  "2": [{ checkIn: "2026-08-01", checkOut: "2026-08-03" }],
};
