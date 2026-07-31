"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { properties } from "@/lib/data/properties";
import { isValidDateOrder } from "@/lib/domain/dateRange";

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
  if (property) revalidatePath(`/properties/${property.slug}`);
}

export async function updatePropertyListing(input: unknown): Promise<AdminActionResult> {
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
            status: { in: ["pending", "confirmed"] },
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
  if (!id) return { ok: false, error: "Missing blocked range." };

  try {
    const range = await prisma.blockedDateRange.delete({ where: { id } });
    revalidateProperty(range.propertyId);
    return { ok: true, message: "Dates are available to guests again." };
  } catch {
    return { ok: false, error: "The blocked range could not be removed." };
  }
}
