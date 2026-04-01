import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/types/property";

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.heroImage}
          alt={property.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-950">{property.name}</h3>
            <p className="mt-1 text-sm text-neutral-500">{property.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500">From</p>
            <p className="text-lg font-semibold text-neutral-950">
              ${property.pricePerNight}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-neutral-600">{property.description}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-sm text-neutral-600">
          <span className="rounded-full bg-neutral-100 px-3 py-1">
            {property.bedrooms} bedrooms
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">
            {property.bathrooms} bathrooms
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">
            Sleeps {property.guests}
          </span>
        </div>

        <div className="mt-6 text-sm font-medium text-neutral-950">View property →</div>
      </div>
    </Link>
  );
}