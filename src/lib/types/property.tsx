export type Property = {
    id: string;
    slug: string;
    name: string;
    location: string;
    tagline: string;
    description: string;
    heroImage: string;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    guests: number;
    pricePerNight: number;
    featured?: boolean;
  };