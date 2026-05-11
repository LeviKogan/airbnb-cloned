import type { StaticImageData } from "next/image";

export type Property = {
    id: string;
    slug: string;
    name: string;
    location: string;
    tagline: string;
    description: string;
    heroImage: StaticImageData;
    images: StaticImageData[];
    amenities: string[];
    bedrooms: number;
    bathrooms: number;
    guests: number;
    pricePerNight: number;
    featured?: boolean;
  };