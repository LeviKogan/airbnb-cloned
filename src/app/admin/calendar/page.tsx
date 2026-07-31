import { getAdminBlockedRanges, getAdminBookings } from "@/lib/server/admin";
import { getManagedProperties } from "@/lib/server/properties";
import BookingCalendar from "@/components/admin/BookingCalendar";

export default async function AdminCalendarPage() {
  const [properties, bookings, blockedRanges] = await Promise.all([
    getManagedProperties(),
    getAdminBookings(),
    getAdminBlockedRanges(),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-[#597068]">Availability</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-4xl">Booking calendar</h1>
        <p className="mt-2 max-w-2xl text-[#6d7a75]">View guest stays by property and close dates that should not be bookable.</p>
      </div>
      <BookingCalendar properties={properties} bookings={bookings} blockedRanges={blockedRanges} />
    </div>
  );
}
