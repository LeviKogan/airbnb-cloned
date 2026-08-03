import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/authorization";
import { prisma } from "@/lib/db/prisma";
import { getManagedProperties } from "@/lib/server/properties";
import { signOutCurrentUser } from "@/app/actions/auth";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "My account",
  description: "Review your Stay Victoria bookings and payment status.",
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [properties, bookings] = await Promise.all([
    getManagedProperties(),
    prisma.booking.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ guestEmail: user.email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const propertyById = new Map(properties.map((property) => [property.id, property]));

  return (
    <main className="min-h-[70vh] bg-[#f5f5f1] py-10 sm:py-14">
      <Container>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#597068]">Guest account</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {user.name?.split(" ")[0] ?? "traveller"}.</h1>
            <p className="mt-2 text-[#6d7a75]">{user.email}</p>
          </div>
          <form action={signOutCurrentUser}>
            <button className="rounded-xl border border-[#cfd6d0] bg-white px-4 py-2.5 text-sm font-semibold text-[#365f55]">Sign out</button>
          </form>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your bookings</h2>
              <p className="mt-1 text-sm text-[#7b8782]">Requests, payments, and confirmed stays</p>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[#365f55]">Book another stay</Link>
          </div>

          {bookings.length ? (
            <div className="mt-5 grid gap-4">
              {bookings.map((booking) => {
                const property = propertyById.get(booking.propertyId);
                return (
                  <article key={booking.id} className="rounded-3xl border border-[#dfe3dc] bg-white p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#82908a]">{booking.id}</p>
                        <h3 className="mt-2 text-xl font-semibold">{property?.name ?? "Stay Victoria property"}</h3>
                        <p className="mt-2 text-sm text-[#66756f]">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</p>
                      </div>
                      <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : booking.status === "awaiting_payment"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {booking.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    {booking.status === "awaiting_payment" && booking.paymentUrl ? (
                      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#eef3ef] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">Payment is ready</p>
                          <p className="mt-1 text-sm text-[#66756f]">Complete payment to confirm your booking.</p>
                        </div>
                        <a href={booking.paymentUrl} className="rounded-xl bg-[#173a33] px-4 py-3 text-center text-sm font-semibold text-white">Pay securely</a>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-[#ccd4cd] bg-white px-6 py-14 text-center">
              <p className="font-semibold">No bookings linked to this account yet.</p>
              <p className="mt-2 text-sm text-[#75817c]">Bookings made with {user.email} will appear here.</p>
              <Link href="/properties" className="mt-5 inline-flex rounded-xl bg-[#173a33] px-5 py-3 text-sm font-semibold text-white">Explore properties</Link>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
