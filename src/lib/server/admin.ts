import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { AdminBlockedRange, AdminBooking } from "@/lib/types/admin";

export async function getAdminBookings(): Promise<AdminBooking[]> {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
    });
    return bookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getAdminBlockedRanges(): Promise<AdminBlockedRange[]> {
  try {
    const ranges = await prisma.blockedDateRange.findMany({
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
    });
    return ranges.map((range) => ({
      ...range,
      createdAt: range.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
