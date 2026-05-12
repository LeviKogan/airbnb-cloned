import type { DateRangeIso } from "@/lib/types/booking";

/** Parse YYYY-MM-DD to UTC midnight for stable night math (see ADR 0001). */
export function utcMidnightFromIsoDate(isoDate: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return Date.UTC(year, month - 1, day);
}

/** Half-open nights: [checkIn, checkOut). */
export function getNights(range: DateRangeIso): number {
  const start = utcMidnightFromIsoDate(range.checkIn);
  const end = utcMidnightFromIsoDate(range.checkOut);
  const diffDays = (end - start) / 86_400_000;
  return diffDays;
}

/** Half-open intervals [aStart, aEnd) and [bStart, bEnd). */
export function rangesOverlapHalfOpen(a: DateRangeIso, b: DateRangeIso): boolean {
  const aStart = utcMidnightFromIsoDate(a.checkIn);
  const aEnd = utcMidnightFromIsoDate(a.checkOut);
  const bStart = utcMidnightFromIsoDate(b.checkIn);
  const bEnd = utcMidnightFromIsoDate(b.checkOut);
  return aStart < bEnd && bStart < aEnd;
}

export function rangeOverlapsAny(range: DateRangeIso, occupied: DateRangeIso[]): boolean {
  return occupied.some((block) => rangesOverlapHalfOpen(range, block));
}

export function isValidDateOrder(range: DateRangeIso): boolean {
  return utcMidnightFromIsoDate(range.checkIn) < utcMidnightFromIsoDate(range.checkOut);
}
