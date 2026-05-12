import type { Property } from "@/lib/types/property";
import { getOccupiedRangesForProperty } from "@/lib/server/occupancy";
import PropertyBookingSidebar from "@/components/properties/PropertyBookingSidebar";

type PropertyBookingSectionProps = {
  property: Property;
};

export default async function PropertyBookingSection({ property }: PropertyBookingSectionProps) {
  const occupiedRanges = await getOccupiedRangesForProperty(property.id);

  return (
    <PropertyBookingSidebar
      propertyId={property.id}
      propertyName={property.name}
      pricePerNight={property.pricePerNight}
      maxGuests={property.guests}
      occupiedRanges={occupiedRanges}
    />
  );
}
