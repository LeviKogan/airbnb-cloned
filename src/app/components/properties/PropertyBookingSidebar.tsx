"use client";

import { useMemo, useState, useTransition } from "react";
import type { DateRangeIso } from "@/lib/types/booking";
import { getNights, isValidDateOrder, rangeOverlapsAny } from "@/lib/domain/dateRange";
import { createBooking } from "@/app/actions/booking";

type PropertyBookingSidebarProps = {
  propertyId: string;
  propertyName: string;
  pricePerNight: number;
  maxGuests: number;
  occupiedRanges: DateRangeIso[];
};

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatUnavailableRange(range: DateRangeIso): string {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${range.checkIn}T00:00:00Z`))} – ${formatter.format(
    new Date(`${range.checkOut}T00:00:00Z`),
  )}`;
}

export default function PropertyBookingSidebar({
  propertyId,
  propertyName,
  pricePerNight,
  maxGuests,
  occupiedRanges,
}: PropertyBookingSidebarProps) {
  const todayYmd = useMemo(() => formatLocalYmd(new Date()), []);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreedToHouseRules, setAgreedToHouseRules] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const range: DateRangeIso | null =
    checkIn && checkOut ? { checkIn, checkOut } : null;

  const rangeValid = range ? isValidDateOrder(range) : false;
  const nights = range && rangeValid ? getNights(range) : 0;
  const nightsValid = Number.isFinite(nights) && nights >= 1;
  const overlaps = range && rangeValid && nightsValid ? rangeOverlapsAny(range, occupiedRanges) : false;
  const guestsValid = guests >= 1 && guests <= maxGuests;
  const canPreview = Boolean(range && rangeValid && nightsValid && !overlaps && guestsValid);
  const subtotal = canPreview ? Math.round(nights * pricePerNight) : null;

  const canSubmit =
    canPreview &&
    guestName.trim().length > 0 &&
    guestEmail.trim().length > 0 &&
    agreedToHouseRules &&
    !isPending;
  const upcomingUnavailable = occupiedRanges
    .filter((occupied) => occupied.checkOut >= todayYmd)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 4);

  const rangeHint = (() => {
    if (!range || !rangeValid) {
      return checkIn && checkOut ? "Check-out must be after check-in." : null;
    }
    if (!nightsValid) {
      return "Select at least one night.";
    }
    if (overlaps) {
      return "Those dates overlap an unavailable period.";
    }
    if (!guestsValid) {
      return `Guest count must be between 1 and ${maxGuests}.`;
    }
    return null;
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!range || !canSubmit) {
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        propertyId,
        checkIn: range.checkIn,
        checkOut: range.checkOut,
        guests,
        guestName,
        guestEmail,
        message: message.trim() || undefined,
        agreedToHouseRules,
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      setSuccessBookingId(result.bookingId);
    });
  }

  if (successBookingId) {
    return (
      <div className="rounded-3xl border border-neutral-200 p-6 shadow-sm">
        <p className="text-sm font-medium text-emerald-700">Request received</p>
        <p className="mt-2 text-lg font-semibold text-neutral-950">Thank you for choosing {propertyName}</p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Your booking reference is <span className="font-mono text-neutral-950">{successBookingId}</span>. We will follow
          up by email to confirm details.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          onClick={() => {
            setSuccessBookingId(null);
            setCheckIn("");
            setCheckOut("");
            setGuests(1);
            setGuestName("");
            setGuestEmail("");
            setMessage("");
            setAgreedToHouseRules(false);
          }}
        >
          Book another stay
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200 p-6 shadow-sm">
      <p className="text-sm text-neutral-500">From</p>
      <p className="mt-1 text-3xl font-semibold text-neutral-950">
        ${pricePerNight}
        <span className="ml-1 text-base font-normal text-neutral-500">/ night</span>
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-amber-50 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-amber-950">Unavailable dates</p>
            <span className="size-2.5 rounded-full bg-amber-400" aria-hidden />
          </div>
          {upcomingUnavailable.length ? (
            <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800">
              {upcomingUnavailable.map((occupied) => (
                <li key={`${occupied.checkIn}-${occupied.checkOut}`}>{formatUnavailableRange(occupied)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-amber-800">The calendar is currently open.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-neutral-700">
            Check-in
            <input
              type="date"
              min={todayYmd}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value && checkOut <= e.target.value) {
                  setCheckOut("");
                }
              }}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
              required
            />
          </label>
          <label className="block text-sm text-neutral-700">
            Check-out
            <input
              type="date"
              min={checkIn ? formatLocalYmd(new Date(new Date(`${checkIn}T12:00:00`).getTime() + 86_400_000)) : todayYmd}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
              required
            />
          </label>
        </div>

        <label className="block text-sm text-neutral-700">
          Guests
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
          />
        </label>

        {subtotal !== null ? (
          <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
            <p>
              <span className="font-medium text-neutral-900">{nights}</span> night{nights === 1 ? "" : "s"} × ${pricePerNight}{" "}
              / night
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-950">${subtotal} total (before taxes & fees)</p>
          </div>
        ) : null}

        {rangeHint ? <p className="text-sm text-red-600">{rangeHint}</p> : null}

        <div className="border-t border-neutral-200 pt-4">
          <p className="text-sm font-medium text-neutral-900">Guest details</p>
          <div className="mt-3 space-y-3">
            <label className="block text-sm text-neutral-700">
              Full name
              <input
                type="text"
                autoComplete="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
              />
            </label>
            <label className="block text-sm text-neutral-700">
              Email
              <input
                type="email"
                autoComplete="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
              />
            </label>
            <label className="block text-sm text-neutral-700">
              Message (optional)
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={agreedToHouseRules}
                onChange={(e) => setAgreedToHouseRules(e.target.checked)}
                className="mt-1"
              />
              <span>I agree to the house rules and cancellation policy (placeholder text).</span>
            </label>
          </div>
        </div>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Sending…" : "Request to book"}
        </button>
      </form>
    </div>
  );
}
