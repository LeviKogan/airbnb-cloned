import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { AdminBlockedRange, AdminBooking } from "@/lib/types/admin";
import { requireAdmin } from "@/lib/server/authorization";

export async function getAdminBookings(): Promise<AdminBooking[]> {
  await requireAdmin();
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
    });
    return bookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      acceptedAt: booking.acceptedAt?.toISOString() ?? null,
      paymentEmailSentAt: booking.paymentEmailSentAt?.toISOString() ?? null,
      paidAt: booking.paidAt?.toISOString() ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getAdminBlockedRanges(): Promise<AdminBlockedRange[]> {
  await requireAdmin();
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
