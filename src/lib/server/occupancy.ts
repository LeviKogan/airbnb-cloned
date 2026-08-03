import type { DateRangeIso } from "@/lib/types/booking";
import { prisma } from "@/lib/db/prisma";

function activeDbStatuses(): string[] {
  return ["pending", "awaiting_payment", "confirmed"];
}

export async function getOccupiedRangesForProperty(propertyId: string): Promise<DateRangeIso[]> {
  try {
    const [bookings, blocks] = await Promise.all([
      prisma.booking.findMany({
        where: {
          propertyId,
          status: { in: activeDbStatuses() },
        },
        select: { checkIn: true, checkOut: true },
      }),
      prisma.blockedDateRange.findMany({
        where: { propertyId },
        select: { checkIn: true, checkOut: true },
      }),
    ]);
    const fromBookings: DateRangeIso[] = bookings.map((row) => ({
      checkIn: row.checkIn,
      checkOut: row.checkOut,
    }));
    return [...fromBookings, ...blocks];
  } catch {
    return [];
  }
}
