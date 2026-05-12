import { describe, expect, it } from "vitest";
import { getNights, isValidDateOrder, rangeOverlapsAny, rangesOverlapHalfOpen } from "@/lib/domain/dateRange";

describe("dateRange", () => {
  it("computes nights for half-open stay", () => {
    expect(getNights({ checkIn: "2026-06-01", checkOut: "2026-06-04" })).toBe(3);
  });

  it("detects invalid ordering", () => {
    expect(isValidDateOrder({ checkIn: "2026-06-04", checkOut: "2026-06-01" })).toBe(false);
    expect(isValidDateOrder({ checkIn: "2026-06-01", checkOut: "2026-06-02" })).toBe(true);
  });

  it("detects overlap for half-open ranges", () => {
    const a = { checkIn: "2026-06-10", checkOut: "2026-06-14" };
    const b = { checkIn: "2026-06-12", checkOut: "2026-06-13" };
    expect(rangesOverlapHalfOpen(a, b)).toBe(true);
  });

  it("allows adjacent non-overlapping stays", () => {
    const a = { checkIn: "2026-06-10", checkOut: "2026-06-14" };
    const b = { checkIn: "2026-06-14", checkOut: "2026-06-16" };
    expect(rangesOverlapHalfOpen(a, b)).toBe(false);
  });

  it("flags overlap against any occupied range", () => {
    const range = { checkIn: "2026-06-11", checkOut: "2026-06-12" };
    const occupied = [{ checkIn: "2026-06-10", checkOut: "2026-06-14" }];
    expect(rangeOverlapsAny(range, occupied)).toBe(true);
  });
});
