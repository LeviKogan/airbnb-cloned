import { mockOccupiedRangesByPropertyId } from "@/lib/data/availability";
import type { DateRangeIso } from "@/lib/types/booking";
import { prisma } from "@/lib/db/prisma";

function activeDbStatuses(): string[] {
  return ["pending", "confirmed"];
}

export async function getOccupiedRangesForProperty(propertyId: string): Promise<DateRangeIso[]> {
  const mock = mockOccupiedRangesByPropertyId[propertyId] ?? [];

  try {
    const rows = await prisma.booking.findMany({
      where: {
        propertyId,
        status: { in: activeDbStatuses() },
      },
      select: { checkIn: true, checkOut: true },
    });
    const fromDb: DateRangeIso[] = rows.map((row) => ({
      checkIn: row.checkIn,
      checkOut: row.checkOut,
    }));
    return [...mock, ...fromDb];
  } catch {
    return mock;
  }
}
