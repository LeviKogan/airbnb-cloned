"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types/property";
import type { AdminBooking } from "@/lib/types/admin";
import { acceptBooking, resendPaymentEmail } from "@/app/actions/admin";

const filters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "confirmed", label: "Confirmed" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function formatMoney(cents: number | null) {
  if (cents === null) return null;
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
}

function statusClass(status: string) {
  if (status === "confirmed") return "bg-emerald-50 text-emerald-700";
  if (status === "awaiting_payment") return "bg-blue-50 text-blue-700";
  if (status === "cancelled") return "bg-neutral-100 text-neutral-600";
  return "bg-amber-50 text-amber-700";
}

export default function BookingManager({ bookings, properties }: { bookings: AdminBooking[]; properties: Property[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { kind: "success" | "error"; message: string }>>({});
  const [isPending, startTransition] = useTransition();
  const propertyById = useMemo(() => new Map(properties.map((property) => [property.id, property])), [properties]);
  const filtered = useMemo(
    () =>
      bookings
        .filter((booking) => filter === "all" || booking.status === filter)
        .sort((a, b) => {
          const priority: Record<string, number> = { pending: 0, awaiting_payment: 1, confirmed: 2, cancelled: 3 };
          return (priority[a.status] ?? 4) - (priority[b.status] ?? 4) || b.createdAt.localeCompare(a.createdAt);
        }),
    [bookings, filter],
  );

  function runAction(bookingId: string, mode: "accept" | "resend") {
    setActiveBookingId(bookingId);
    setFeedback((current) => {
      const next = { ...current };
      delete next[bookingId];
      return next;
    });
    startTransition(async () => {
      const result = mode === "accept" ? await acceptBooking(bookingId) : await resendPaymentEmail(bookingId);
      setFeedback((current) => ({
        ...current,
        [bookingId]: { kind: result.ok ? "success" : "error", message: result.ok ? result.message : result.error },
      }));
      setActiveBookingId(null);
      if (result.ok || result.error.startsWith("The booking was accepted")) router.refresh();
    });
  }

  return (
    <div className="mt-8">
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => {
          const count = item.value === "all" ? bookings.length : bookings.filter((booking) => booking.status === item.value).length;
          return (
            <button
              type="button"
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                filter === item.value ? "border-[#173a33] bg-[#173a33] text-white" : "border-[#dce1da] bg-white text-[#52645d]"
              }`}
            >
              {item.label} <span className="ml-1 opacity-65">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4">
        {filtered.map((booking) => {
          const property = propertyById.get(booking.propertyId);
          const busy = isPending && activeBookingId === booking.id;
          const result = feedback[booking.id];
          return (
            <article key={booking.id} className="overflow-hidden rounded-3xl border border-[#e0e3dc] bg-white">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.15fr_1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{booking.guestName}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(booking.status)}`}>
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <a href={`mailto:${booking.guestEmail}`} className="mt-1 block truncate text-sm text-[#597068] underline underline-offset-2">{booking.guestEmail}</a>
                  <p className="mt-3 text-xs text-[#8a9490]">Reference {booking.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#8a9490]">Property</p>
                    <p className="mt-1 font-semibold">{property?.name ?? "Unknown property"}</p>
                    <p className="mt-1 text-[#6d7a75]">{booking.guests} guest{booking.guests === 1 ? "" : "s"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#8a9490]">Stay</p>
                    <p className="mt-1 font-semibold">{formatDate(booking.checkIn)}</p>
                    <p className="mt-1 text-[#6d7a75]">to {formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-44">
                  {booking.totalAmountCents ? <p className="mb-1 text-right text-sm font-semibold">{formatMoney(booking.totalAmountCents)}</p> : null}
                  {booking.status === "pending" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(booking.id, "accept")}
                      className="rounded-xl bg-[#173a33] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {busy ? "Creating payment…" : "Accept & send payment"}
                    </button>
                  ) : null}
                  {booking.status === "awaiting_payment" ? (
                    <>
                      {booking.paymentUrl ? <a href={booking.paymentUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#173a33] px-4 py-3 text-center text-sm font-semibold text-white">Open payment link ↗</a> : null}
                      <button type="button" disabled={busy} onClick={() => runAction(booking.id, "resend")} className="rounded-xl border border-[#ccd5ce] px-4 py-2.5 text-sm font-semibold text-[#365f55] disabled:opacity-50">
                        {busy ? "Sending…" : "Resend email"}
                      </button>
                    </>
                  ) : null}
                  {booking.status === "confirmed" ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">Paid & confirmed</p> : null}
                </div>
              </div>

              {booking.message || result ? (
                <div className="border-t border-[#eceee8] bg-[#fafbf8] px-5 py-3 text-sm sm:px-6">
                  {booking.message ? <p className="text-[#66756f]"><span className="font-semibold text-[#43534d]">Guest note:</span> {booking.message}</p> : null}
                  {result ? <p aria-live="polite" className={`mt-1 font-medium ${result.kind === "error" ? "text-red-700" : "text-emerald-700"}`}>{result.message}</p> : null}
                </div>
              ) : null}
            </article>
          );
        })}
        {!filtered.length ? <div className="rounded-3xl border border-dashed border-[#ccd4cd] bg-white px-6 py-14 text-center text-sm text-[#75817c]">No bookings in this view.</div> : null}
      </div>
    </div>
  );
}
