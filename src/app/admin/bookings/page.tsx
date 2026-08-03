import { getAdminBookings } from "@/lib/server/admin";
import { getManagedProperties } from "@/lib/server/properties";
import BookingManager from "@/components/admin/BookingManager";

export default async function AdminBookingsPage() {
  const [bookings, properties] = await Promise.all([getAdminBookings(), getManagedProperties()]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-[#597068]">Reservations</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-4xl">Bookings</h1>
        <p className="mt-2 max-w-2xl text-[#6d7a75]">Accept requests, send secure payment links, and follow every booking through to confirmation.</p>
      </div>
      <BookingManager bookings={bookings} properties={properties} />
    </div>
  );
}
