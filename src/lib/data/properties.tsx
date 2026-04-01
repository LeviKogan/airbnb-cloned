import { Property } from "@/lib/types/property";

export const properties: Property[] = [
  {
    id: "1",
    slug: "phillip-island-house",
    name: "Phillip Island House",
    location: "Phillip Island, Victoria",
    tagline: "A warm country escape for couples and slow weekends.",
    description:
      "A cosy, beautifully styled house with a beautiful garden, charming interiors, and a peaceful atmosphere for a relaxed getaway.",
    heroImage: "/images/properties/phillip-island-house-1.jpg",
    images: [
      "/images/properties/phillip-island-house-1.jpg",
      "/images/properties/phillip-island-house-1.jpg",
    ],
    bedrooms: 3,
    bathrooms: 2,
    guests: 9,
    pricePerNight: 200,
    featured: true,
  },
  {
    id: "2",
    slug: "stkilda-apartment",
    name: "St Kilda Apartment",
    location: "St Kilda, Victoria",
    tagline: "A stylish city retreat with modern amenities.",
    description:
      "A calm and elegant retreat near the coast, ideal for a weekend away with beautiful natural light and relaxing outdoor spaces.",
    heroImage: "/images/properties/stkilda-apartment-1.jpg",
    images: [
      "/images/properties/stkilda-apartment-1.jpg",
      "/images/properties/stkilda-apartment-1.jpg",
    ],
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    pricePerNight: 250,
    featured: true,
  },
];