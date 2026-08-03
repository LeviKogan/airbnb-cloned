"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getNights, isValidDateOrder, rangeOverlapsAny } from "@/lib/domain/dateRange";
import { getManagedPropertyById } from "@/lib/server/properties";
import { getOccupiedRangesForProperty } from "@/lib/server/occupancy";
import { auth } from "@/auth";

const bookingSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1),
  guestName: z.string().trim().min(1).max(120),
  guestEmail: z.string().trim().email().max(320),
  message: z.string().trim().max(2000).optional(),
  agreedToHouseRules: z.literal(true),
});

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createBooking(input: unknown): Promise<CreateBookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_form";
      fieldErrors[path] = fieldErrors[path] ?? [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const session = await auth();
  const property = await getManagedPropertyById(data.propertyId);
  if (!property) {
    return { ok: false, error: "This listing is not available." };
  }

  if (data.guests > property.guests) {
    return { ok: false, error: `Guest count cannot exceed ${property.guests}.`, fieldErrors: { guests: ["Too many guests"] } };
  }

  const range = { checkIn: data.checkIn, checkOut: data.checkOut };
  if (!isValidDateOrder(range)) {
    return { ok: false, error: "Check-out must be after check-in.", fieldErrors: { checkOut: ["Invalid range"] } };
  }

  const nights = getNights(range);
  if (!Number.isFinite(nights) || nights < 1) {
    return { ok: false, error: "Please select at least one night." };
  }

  const occupiedRanges = await getOccupiedRangesForProperty(data.propertyId);
  if (rangeOverlapsAny(range, occupiedRanges)) {
    return { ok: false, error: "Those dates overlap an unavailable period." };
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const [bookingConflict, blockedConflict] = await Promise.all([
        tx.booking.findFirst({
          where: {
            propertyId: data.propertyId,
            status: { in: ["pending", "awaiting_payment", "confirmed"] },
            checkIn: { lt: data.checkOut },
            checkOut: { gt: data.checkIn },
          },
        }),
        tx.blockedDateRange.findFirst({
          where: {
            propertyId: data.propertyId,
            checkIn: { lt: data.checkOut },
            checkOut: { gt: data.checkIn },
          },
        }),
      ]);

      if (bookingConflict || blockedConflict) {
        return null;
      }

      return tx.booking.create({
        data: {
          propertyId: data.propertyId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          guestName: data.guestName,
          guestEmail: (session?.user?.email ?? data.guestEmail).toLowerCase(),
          userId: session?.user?.id,
          message: data.message,
          status: "pending",
        },
      });
    });

    if (!booking) {
      return { ok: false, error: "Those dates were just booked. Please pick different dates." };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/account");
    revalidatePath(`/properties/${property.slug}`);
    return { ok: true, bookingId: booking.id };
  } catch {
    return { ok: false, error: "We could not reach the booking service. Try again shortly." };
  }
}
