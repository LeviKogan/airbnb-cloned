"use client";

import { useMemo, useState } from "react";
import type { DateRangeIso } from "@/lib/types/booking";
import { rangeOverlapsAny } from "@/lib/domain/dateRange";

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function accessibleDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

function calendarDays(month: Date) {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - offset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date;
  });
}

export default function DateRangeCalendar({
  checkIn,
  checkOut,
  onChange,
  disabledRanges,
  minDate,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (range: { checkIn: string; checkOut: string }) => void;
  disabledRanges: DateRangeIso[];
  minDate?: string;
}) {
  const initial = checkIn ? new Date(`${checkIn}T00:00:00Z`) : new Date();
  const [month, setMonth] = useState(() => new Date(Date.UTC(initial.getUTCFullYear(), initial.getUTCMonth(), 1)));
  const days = useMemo(() => calendarDays(month), [month]);

  function chooseDate(iso: string) {
    if (!checkIn || checkOut) {
      onChange({ checkIn: iso, checkOut: "" });
      return;
    }
    if (iso <= checkIn) {
      onChange({ checkIn: iso, checkOut: "" });
      return;
    }
    const proposed = { checkIn, checkOut: iso };
    if (!rangeOverlapsAny(proposed, disabledRanges)) onChange(proposed);
  }

  return (
    <div className="rounded-2xl border border-[#dfe3dc] bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <button type="button" aria-label="Previous calendar month" onClick={() => setMonth((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1)))} className="grid size-9 place-items-center rounded-lg border border-[#dfe3dc] text-[#52645d]">←</button>
        <p className="text-sm font-semibold text-[#26362f]">{monthLabel(month)}</p>
        <button type="button" aria-label="Next calendar month" onClick={() => setMonth((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)))} className="grid size-9 place-items-center rounded-lg border border-[#dfe3dc] text-[#52645d]">→</button>
      </div>
      <div className="mt-3 grid grid-cols-7">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <div key={`${day}-${index}`} className="py-1 text-center text-[10px] font-semibold text-[#8a9490]">{day}</div>
        ))}
        {days.map((date) => {
          const iso = toIso(date);
          const inMonth = date.getUTCMonth() === month.getUTCMonth();
          const occupied = disabledRanges.some((range) => range.checkIn <= iso && range.checkOut > iso);
          const isBeforeMinimum = Boolean(minDate && iso < minDate);
          const selectingEnd = Boolean(checkIn && !checkOut && iso > checkIn);
          const proposedInvalid = selectingEnd && rangeOverlapsAny({ checkIn, checkOut: iso }, disabledRanges);
          const disabled = isBeforeMinimum || (selectingEnd ? proposedInvalid : occupied);
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const isBetween = Boolean(checkIn && checkOut && iso > checkIn && iso < checkOut);
          return (
            <button
              type="button"
              key={iso}
              disabled={disabled}
              onClick={() => chooseDate(iso)}
              aria-label={`${accessibleDate(iso)}${occupied ? ", unavailable" : ""}`}
              className={`relative grid aspect-square place-items-center rounded-lg text-xs font-medium transition ${
                isStart || isEnd
                  ? "bg-[#173a33] text-white"
                  : isBetween
                    ? "rounded-none bg-[#e8f0eb] text-[#173a33]"
                    : occupied
                      ? "text-[#c0a27c] line-through"
                      : inMonth
                        ? "text-[#52645d] hover:bg-[#eef3ef]"
                        : "text-[#c0c6c2]"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {date.getUTCDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#edf0eb] pt-3 text-xs">
        <p className="text-[#6f7c77]">
          {checkIn ? (checkOut ? `${accessibleDate(checkIn)} – ${accessibleDate(checkOut)}` : "Now choose a checkout date") : "Choose your check-in date"}
        </p>
        {checkIn ? <button type="button" onClick={() => onChange({ checkIn: "", checkOut: "" })} className="shrink-0 font-semibold text-[#365f55] underline underline-offset-2">Clear</button> : null}
      </div>
    </div>
  );
}
