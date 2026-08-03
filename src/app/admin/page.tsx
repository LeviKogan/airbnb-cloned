import Link from "next/link";
import Image from "next/image";
import { getAdminBlockedRanges, getAdminBookings } from "@/lib/server/admin";
import { getManagedProperties } from "@/lib/server/properties";
import { getNights } from "@/lib/domain/dateRange";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export default async function AdminOverviewPage() {
  const [properties, bookings, blockedRanges] = await Promise.all([
    getManagedProperties(),
    getAdminBookings(),
    getAdminBlockedRanges(),
  ]);
  const activeBookings = bookings.filter((booking) => ["pending", "awaiting_payment", "confirmed"].includes(booking.status));
  const upcomingBookings = activeBookings
    .filter((booking) => booking.checkOut >= new Date().toISOString().slice(0, 10))
    .slice(0, 5);
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const blockedNights = blockedRanges.reduce((total, range) => total + getNights(range), 0);
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const todayLabel = new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Melbourne",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#597068]">{todayLabel}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-4xl">Good morning, Levi.</h1>
          <p className="mt-2 text-[#6d7a75]">Here’s what’s happening across your stays.</p>
        </div>
        <Link
          href="/admin/calendar"
          className="inline-flex w-fit items-center justify-center rounded-xl bg-[#173a33] px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          + Block dates
        </Link>
      </div>

      <section aria-label="Portfolio summary" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active listings", value: properties.length, detail: "All properties live" },
          { label: "Upcoming stays", value: upcomingBookings.length, detail: "Across all listings" },
          { label: "Pending requests", value: pendingCount, detail: pendingCount ? "Awaiting review" : "You’re all caught up" },
          { label: "Blocked nights", value: blockedNights, detail: `${blockedRanges.length} unavailable period${blockedRanges.length === 1 ? "" : "s"}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#e0e3dc] bg-white p-5 shadow-[0_1px_2px_rgba(23,58,51,0.03)]">
            <p className="text-sm text-[#66756f]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#173a33]">{stat.value}</p>
            <p className="mt-2 text-xs text-[#87918d]">{stat.detail}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-3xl border border-[#e0e3dc] bg-white">
          <div className="flex items-center justify-between border-b border-[#eceee8] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Upcoming bookings</h2>
              <p className="mt-1 text-sm text-[#7a8581]">The next arrivals across your properties</p>
            </div>
            <Link href="/admin/bookings" className="text-sm font-semibold text-[#365f55]">Manage bookings</Link>
          </div>
          {upcomingBookings.length ? (
            <div className="divide-y divide-[#eceee8]">
              {upcomingBookings.map((booking) => {
                const property = propertyById.get(booking.propertyId);
                return (
                  <div key={booking.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef3ef] font-semibold text-[#365f55]">
                        {booking.guestName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#24332e]">{booking.guestName}</p>
                        <p className="truncate text-sm text-[#78837f]">{property?.name ?? "Unknown property"} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <div className="pl-13 sm:pl-0 sm:text-right">
                      <p className="text-sm font-medium">{formatShortDate(booking.checkIn)} – {formatShortDate(booking.checkOut)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : booking.status === "awaiting_payment"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-[#7a8581]">No upcoming bookings yet.</div>
          )}
        </section>

        <section className="rounded-3xl border border-[#e0e3dc] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your properties</h2>
              <p className="mt-1 text-sm text-[#7a8581]">Quick listing overview</p>
            </div>
            <Link href="/admin/listings" className="text-sm font-semibold text-[#365f55]">Edit</Link>
          </div>
          <div className="mt-5 space-y-4">
            {properties.map((property) => (
              <Link key={property.id} href={`/admin/listings?property=${property.id}`} className="group flex items-center gap-4 rounded-2xl border border-[#eceee8] p-3 transition hover:border-[#b9c8c1]">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                  <Image src={property.heroImage} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{property.name}</p>
                  <p className="mt-1 truncate text-sm text-[#7a8581]">{property.location}</p>
                  <p className="mt-2 text-xs font-medium text-[#365f55]">${property.pricePerNight}/night · Sleeps {property.guests}</p>
                </div>
                <span className="text-[#a3aaa7] transition group-hover:translate-x-0.5">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
