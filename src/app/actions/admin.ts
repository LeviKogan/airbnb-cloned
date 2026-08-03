"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { properties } from "@/lib/data/properties";
import { getNights, isValidDateOrder } from "@/lib/domain/dateRange";
import { isCurrentUserAdmin } from "@/lib/server/authorization";
import { getManagedPropertyById } from "@/lib/server/properties";
import {
  createBookingCheckoutSession,
  IntegrationConfigurationError,
  sendPaymentRequestEmail,
} from "@/lib/server/payments";

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

const listingSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(160),
  tagline: z.string().trim().min(2).max(240),
  description: z.string().trim().min(20).max(3000),
  amenities: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().int().min(0).max(30),
  guests: z.coerce.number().int().min(1).max(60),
  pricePerNight: z.coerce.number().int().min(1).max(100000),
  featured: z.boolean(),
});

const blockSchema = z.object({
  propertyId: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().trim().max(240).optional(),
});

function revalidateProperty(propertyId: string) {
  const property = properties.find((item) => item.id === propertyId);
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/account");
  if (property) revalidatePath(`/properties/${property.slug}`);
}

export async function updatePropertyListing(input: unknown): Promise<AdminActionResult> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin access is required." };
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the listing details." };
  }

  const data = parsed.data;
  if (!properties.some((property) => property.id === data.propertyId)) {
    return { ok: false, error: "That property does not exist." };
  }

  try {
    await prisma.propertyOverride.upsert({
      where: { propertyId: data.propertyId },
      create: {
        propertyId: data.propertyId,
        name: data.name,
        location: data.location,
        tagline: data.tagline,
        description: data.description,
        amenitiesJson: JSON.stringify(data.amenities),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        guests: data.guests,
        pricePerNight: data.pricePerNight,
        featured: data.featured,
      },
      update: {
        name: data.name,
        location: data.location,
        tagline: data.tagline,
        description: data.description,
        amenitiesJson: JSON.stringify(data.amenities),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        guests: data.guests,
        pricePerNight: data.pricePerNight,
        featured: data.featured,
      },
    });
    revalidateProperty(data.propertyId);
    return { ok: true, message: "Listing changes are live." };
  } catch {
    return { ok: false, error: "The listing could not be saved. Please try again." };
  }
}

export async function createBlockedRange(input: unknown): Promise<AdminActionResult> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin access is required." };
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Choose a valid start and end date." };
  }
  const data = parsed.data;
  const range = { checkIn: data.checkIn, checkOut: data.checkOut };

  if (!properties.some((property) => property.id === data.propertyId)) {
    return { ok: false, error: "That property does not exist." };
  }
  if (!isValidDateOrder(range)) {
    return { ok: false, error: "The end date must be after the start date." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const [bookingConflict, existingBlock] = await Promise.all([
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
      if (bookingConflict) return "booking-conflict";
      if (existingBlock) return "block-conflict";

      await tx.blockedDateRange.create({
        data: {
          propertyId: data.propertyId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          note: data.note || null,
        },
      });
      return "created";
    });
    if (result === "booking-conflict") return { ok: false, error: "That range overlaps an existing booking." };
    if (result === "block-conflict") return { ok: false, error: "That range is already blocked." };
    revalidateProperty(data.propertyId);
    return { ok: true, message: "Dates blocked and removed from guest availability." };
  } catch {
    return { ok: false, error: "The dates could not be blocked. Please try again." };
  }
}

export async function removeBlockedRange(id: string): Promise<AdminActionResult> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin access is required." };
  if (!id) return { ok: false, error: "Missing blocked range." };

  try {
    const range = await prisma.blockedDateRange.delete({ where: { id } });
    revalidateProperty(range.propertyId);
    return { ok: true, message: "Dates are available to guests again." };
  } catch {
    return { ok: false, error: "The blocked range could not be removed." };
  }
}

async function deliverPaymentEmail(bookingId: string, idempotencyKey: string): Promise<AdminActionResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || !booking.paymentUrl || !booking.totalAmountCents) {
    return { ok: false, error: "This booking does not have an active payment link." };
  }
  const property = await getManagedPropertyById(booking.propertyId);
  if (!property) return { ok: false, error: "The booking property could not be found." };

  try {
    await sendPaymentRequestEmail({
      booking,
      property,
      paymentUrl: booking.paymentUrl,
      totalAmountCents: booking.totalAmountCents,
      idempotencyKey,
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentEmailSentAt: new Date() },
    });
    revalidateProperty(booking.propertyId);
    return { ok: true, message: `Payment email sent to ${booking.guestEmail}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed.";
    return { ok: false, error: `The booking was accepted, but the email was not sent. ${message}` };
  }
}

export async function acceptBooking(bookingId: string): Promise<AdminActionResult> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin access is required." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { ok: false, error: "Booking not found." };
  if (booking.status === "confirmed") return { ok: false, error: "This booking is already confirmed." };
  if (booking.status === "cancelled") return { ok: false, error: "A cancelled booking cannot be accepted." };

  if (booking.status === "awaiting_payment" && booking.paymentUrl) {
    return deliverPaymentEmail(booking.id, `booking-payment-resend-${booking.id}-${Date.now()}`);
  }
  if (booking.status !== "pending") {
    return { ok: false, error: "Only pending bookings can be accepted." };
  }

  const property = await getManagedPropertyById(booking.propertyId);
  if (!property) return { ok: false, error: "The booking property could not be found." };
  const nights = getNights({ checkIn: booking.checkIn, checkOut: booking.checkOut });
  const totalAmountCents = Math.round(nights * property.pricePerNight * 100);
  if (!Number.isFinite(totalAmountCents) || totalAmountCents < 50) {
    return { ok: false, error: "The booking total could not be calculated." };
  }

  try {
    const session = await createBookingCheckoutSession({ booking, property, totalAmountCents });
    if (!session.url) return { ok: false, error: "Stripe did not return a payment link." };

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "awaiting_payment",
        paymentStatus: "pending",
        totalAmountCents,
        stripeCheckoutSessionId: session.id,
        paymentUrl: session.url,
        acceptedAt: new Date(),
      },
    });
    revalidateProperty(booking.propertyId);
    return deliverPaymentEmail(booking.id, `booking-payment-${booking.id}-${session.id}`);
  } catch (error) {
    const message =
      error instanceof IntegrationConfigurationError || error instanceof Error
        ? error.message
        : "The payment request could not be created.";
    return { ok: false, error: message };
  }
}

export async function resendPaymentEmail(bookingId: string): Promise<AdminActionResult> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admin access is required." };
  return deliverPaymentEmail(bookingId, `booking-payment-resend-${bookingId}-${Date.now()}`);
}
