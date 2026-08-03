"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types/property";
import type { AdminBlockedRange, AdminBooking } from "@/lib/types/admin";
import { createBlockedRange, removeBlockedRange } from "@/app/actions/admin";
import DateRangeCalendar from "@/components/ui/DateRangeCalendar";

type CalendarItem =
  | { id: string; kind: "booking"; checkIn: string; checkOut: string; label: string; status: string }
  | { id: string; kind: "block"; checkIn: string; checkOut: string; label: string; status: "blocked" };

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isoFromUtcDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function buildMonthDays(month: Date) {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return date;
  });
}

export default function BookingCalendar({
  properties,
  bookings,
  blockedRanges,
}: {
  properties: Property[];
  bookings: AdminBooking[];
  blockedRanges: AdminBlockedRange[];
}) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedProperty = properties.find((property) => property.id === propertyId);
  const items = useMemo<CalendarItem[]>(() => [
    ...bookings
      .filter((booking) => booking.propertyId === propertyId && booking.status !== "cancelled")
      .map((booking): CalendarItem => ({
        id: booking.id,
        kind: "booking",
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        label: booking.guestName,
        status: booking.status,
      })),
    ...blockedRanges
      .filter((range) => range.propertyId === propertyId)
      .map((range): CalendarItem => ({
        id: range.id,
        kind: "block",
        checkIn: range.checkIn,
        checkOut: range.checkOut,
        label: range.note || "Unavailable",
        status: "blocked",
      })),
  ], [bookings, blockedRanges, propertyId]);
  const monthDays = useMemo(() => buildMonthDays(month), [month]);
  const currentMonth = month.getUTCMonth();
  const today = new Date().toISOString().slice(0, 10);
  const upcomingBookings = bookings
    .filter((booking) => booking.propertyId === propertyId && booking.status !== "cancelled" && booking.checkOut >= today)
    .slice(0, 8);
  const propertyBlocks = blockedRanges.filter((range) => range.propertyId === propertyId && range.checkOut >= today);

  function shiftMonth(offset: number) {
    setMonth((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1)));
  }

  function submitBlock(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await createBlockedRange({ propertyId, checkIn, checkOut, note: note.trim() || undefined });
      setFeedback({ kind: result.ok ? "success" : "error", message: result.ok ? result.message : result.error });
      if (result.ok) {
        setCheckIn("");
        setCheckOut("");
        setNote("");
        router.refresh();
      }
    });
  }

  function unblock(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const result = await removeBlockedRange(id);
      setFeedback({ kind: result.ok ? "success" : "error", message: result.ok ? result.message : result.error });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="mt-8">
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
        {properties.map((property) => (
          <button
            type="button"
            key={property.id}
            onClick={() => { setPropertyId(property.id); setFeedback(null); }}
            className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${property.id === propertyId ? "border-[#173a33] bg-[#173a33] text-white" : "border-[#dce1da] bg-white text-[#52645d] hover:border-[#9fb0a8]"}`}
          >
            {property.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-[#e0e3dc] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceee8] px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">{formatMonth(month)}</h2>
              <p className="mt-0.5 text-xs text-[#818b87]">{selectedProperty?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMonth(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 1)))} className="rounded-lg border border-[#dce1da] px-3 py-2 text-xs font-semibold text-[#52645d]">Today</button>
              <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className="grid size-9 place-items-center rounded-lg border border-[#dce1da] text-[#52645d]">←</button>
              <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className="grid size-9 place-items-center rounded-lg border border-[#dce1da] text-[#52645d]">→</button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[#eceee8] bg-[#fafbf8]">
            {weekdayLabels.map((day) => <div key={day} className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#89938f] sm:text-xs">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((date) => {
              const iso = isoFromUtcDate(date);
              const dayItems = items.filter((item) => item.checkIn <= iso && item.checkOut > iso);
              const inMonth = date.getUTCMonth() === currentMonth;
              const isToday = iso === today;
              return (
                <div key={iso} className={`min-h-20 border-b border-r border-[#eceee8] p-1 sm:min-h-28 sm:p-2 ${inMonth ? "bg-white" : "bg-[#fafbf8]"}`}>
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] font-medium sm:size-7 sm:text-xs ${isToday ? "bg-[#173a33] text-white" : inMonth ? "text-[#52645d]" : "text-[#b0b7b4]"}`}>
                    {date.getUTCDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayItems.slice(0, 2).map((item) => (
                      <div
                        key={`${item.kind}-${item.id}`}
                        title={`${item.label}: ${item.checkIn} to ${item.checkOut}`}
                        className={`truncate rounded px-1 py-1 text-[9px] font-semibold leading-none sm:px-1.5 sm:text-[10px] ${item.kind === "block" ? "bg-[#fff0d8] text-[#935d17]" : item.status === "confirmed" ? "bg-[#dff2e8] text-[#23644d]" : "bg-[#e8e5fb] text-[#554a91]"}`}
                      >
                        <span className="hidden sm:inline">{item.kind === "block" ? "Blocked · " : ""}</span>{item.label}
                      </div>
                    ))}
                    {dayItems.length > 2 ? <p className="px-1 text-[9px] font-medium text-[#7d8883]">+{dayItems.length - 2} more</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 px-4 py-3 text-xs text-[#6f7c77] sm:px-6">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#dff2e8]" /> Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#e8e5fb]" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#fff0d8]" /> Blocked</span>
          </div>
        </section>

        <aside className="space-y-5">
          <form onSubmit={submitBlock} className="rounded-3xl border border-[#e0e3dc] bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff0d8] text-lg text-[#935d17]">×</span>
              <div>
                <h2 className="font-semibold">Block dates</h2>
                <p className="text-xs text-[#7b8782]">Instantly hides dates from guests</p>
              </div>
            </div>
            <div className="mt-5">
              <DateRangeCalendar
                checkIn={checkIn}
                checkOut={checkOut}
                minDate={today}
                disabledRanges={items.map((item) => ({ checkIn: item.checkIn, checkOut: item.checkOut }))}
                onChange={(range) => {
                  setCheckIn(range.checkIn);
                  setCheckOut(range.checkOut);
                  setFeedback(null);
                }}
              />
            </div>
            <label className="mt-3 block text-sm font-medium text-[#52645d]">Reason <span className="font-normal text-[#929a97]">(optional)</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Owner stay, maintenance" className="mt-1.5 w-full rounded-xl border border-[#dfe3dc] px-3 py-2.5 text-sm" />
            </label>
            <button disabled={isPending || !checkIn || !checkOut} className="mt-4 w-full rounded-xl bg-[#173a33] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {isPending ? "Updating…" : "Block selected dates"}
            </button>
            {feedback ? <p aria-live="polite" className={`mt-3 text-sm ${feedback.kind === "error" ? "text-red-700" : "text-emerald-700"}`}>{feedback.message}</p> : null}
          </form>

          <section className="rounded-3xl border border-[#e0e3dc] bg-white p-5">
            <h2 className="font-semibold">Upcoming blocked dates</h2>
            <div className="mt-4 space-y-3">
              {propertyBlocks.length ? propertyBlocks.map((range) => (
                <div key={range.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#fffaf1] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#704c20]">{formatDate(range.checkIn)} – {formatDate(range.checkOut)}</p>
                    <p className="mt-1 truncate text-xs text-[#957651]">{range.note || "Unavailable"}</p>
                  </div>
                  <button type="button" disabled={isPending} onClick={() => unblock(range.id)} className="shrink-0 text-xs font-semibold text-[#935d17] underline underline-offset-2">Unblock</button>
                </div>
              )) : <p className="py-3 text-sm text-[#89938f]">No upcoming dates are blocked.</p>}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-[#e0e3dc] bg-white">
        <div className="border-b border-[#eceee8] px-5 py-5 sm:px-6">
          <h2 className="font-semibold">Upcoming booking details</h2>
          <p className="mt-1 text-sm text-[#7b8782]">{selectedProperty?.name}</p>
        </div>
        {upcomingBookings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#fafbf8] text-xs uppercase tracking-wide text-[#84908b]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Guest</th>
                  <th className="px-6 py-3 font-semibold">Stay</th>
                  <th className="px-6 py-3 font-semibold">Guests</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceee8]">
                {upcomingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 font-semibold">{booking.guestName}</td>
                    <td className="px-6 py-4 text-[#66756f]">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</td>
                    <td className="px-6 py-4 text-[#66756f]">{booking.guests}</td>
                    <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>{booking.status}</span></td>
                    <td className="px-6 py-4"><a href={`mailto:${booking.guestEmail}`} className="text-[#365f55] underline underline-offset-2">{booking.guestEmail}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="px-6 py-12 text-center text-sm text-[#89938f]">No upcoming bookings for this property.</div>}
      </section>
    </div>
  );
}
