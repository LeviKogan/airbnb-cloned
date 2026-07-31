import "server-only";

import type { Property } from "@/lib/types/property";
import { properties } from "@/lib/data/properties";
import { prisma } from "@/lib/db/prisma";

type PropertyOverrideRow = {
  propertyId: string;
  name: string;
  location: string;
  tagline: string;
  description: string;
  amenitiesJson: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  pricePerNight: number;
  featured: boolean;
};

function mergeProperty(property: Property, override?: PropertyOverrideRow): Property {
  if (!override) return property;

  let amenities = property.amenities;
  try {
    const parsed = JSON.parse(override.amenitiesJson);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      amenities = parsed;
    }
  } catch {
    // Keep the static amenities if an old row contains malformed JSON.
  }

  return {
    ...property,
    name: override.name,
    location: override.location,
    tagline: override.tagline,
    description: override.description,
    amenities,
    bedrooms: override.bedrooms,
    bathrooms: override.bathrooms,
    guests: override.guests,
    pricePerNight: override.pricePerNight,
    featured: override.featured,
  };
}

export async function getManagedProperties(): Promise<Property[]> {
  try {
    const overrides = await prisma.propertyOverride.findMany();
    const byPropertyId = new Map(overrides.map((row) => [row.propertyId, row]));
    return properties.map((property) => mergeProperty(property, byPropertyId.get(property.id)));
  } catch {
    return properties;
  }
}

export async function getManagedPropertyBySlug(slug: string): Promise<Property | undefined> {
  const managed = await getManagedProperties();
  return managed.find((property) => property.slug === slug);
}

export async function getManagedPropertyById(id: string): Promise<Property | undefined> {
  const managed = await getManagedProperties();
  return managed.find((property) => property.id === id);
}
