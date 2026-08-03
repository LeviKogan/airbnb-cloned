import type { Property } from "@/lib/types/property";
import { getOccupiedRangesForProperty } from "@/lib/server/occupancy";
import PropertyBookingSidebar from "@/components/properties/PropertyBookingSidebar";
import { auth } from "@/auth";

type PropertyBookingSectionProps = {
  property: Property;
};

export default async function PropertyBookingSection({ property }: PropertyBookingSectionProps) {
  const [occupiedRanges, session] = await Promise.all([getOccupiedRangesForProperty(property.id), auth()]);

  return (
    <PropertyBookingSidebar
      propertyId={property.id}
      propertyName={property.name}
      pricePerNight={property.pricePerNight}
      maxGuests={property.guests}
      occupiedRanges={occupiedRanges}
      initialGuestName={session?.user?.name ?? ""}
      initialGuestEmail={session?.user?.email ?? ""}
    />
  );
}
