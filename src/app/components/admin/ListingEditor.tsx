"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types/property";
import { updatePropertyListing } from "@/app/actions/admin";

type EditableListing = {
  name: string;
  location: string;
  tagline: string;
  description: string;
  amenitiesText: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  pricePerNight: number;
  featured: boolean;
};

function toEditable(property: Property): EditableListing {
  return {
    name: property.name,
    location: property.location,
    tagline: property.tagline,
    description: property.description,
    amenitiesText: property.amenities.join("\n"),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    guests: property.guests,
    pricePerNight: property.pricePerNight,
    featured: Boolean(property.featured),
  };
}

export default function ListingEditor({
  properties,
  initialPropertyId,
}: {
  properties: Property[];
  initialPropertyId?: string;
}) {
  const router = useRouter();
  const initialIndex = Math.max(0, properties.findIndex((property) => property.id === initialPropertyId));
  const [selectedId, setSelectedId] = useState(properties[initialIndex]?.id ?? "");
  const selected = useMemo(() => properties.find((property) => property.id === selectedId) ?? properties[0], [properties, selectedId]);
  const [drafts, setDrafts] = useState<Record<string, EditableListing>>(() =>
    Object.fromEntries(properties.map((property) => [property.id, toEditable(property)])),
  );
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const draft = selected ? drafts[selected.id] : undefined;

  if (!selected || !draft) return null;

  function update<K extends keyof EditableListing>(key: K, value: EditableListing[K]) {
    setDrafts((current) => ({
      ...current,
      [selected.id]: { ...current[selected.id], [key]: value },
    }));
    setFeedback(null);
  }

  function save() {
    const currentDraft = drafts[selected.id];
    if (!currentDraft) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await updatePropertyListing({
        propertyId: selected.id,
        ...currentDraft,
        amenities: currentDraft.amenitiesText.split("\n").map((item) => item.trim()).filter(Boolean),
      });
      setFeedback({ kind: result.ok ? "success" : "error", message: result.ok ? result.message : result.error });
      if (result.ok) router.refresh();
    });
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-[#dfe3dc] bg-white px-3.5 py-3 text-sm text-[#21302b] outline-none transition focus:border-[#365f55] focus:ring-2 focus:ring-[#365f55]/10";

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-3 xl:sticky xl:top-8 xl:self-start">
        <label className="block text-sm font-medium text-[#52645d] xl:hidden">
          Choose property
          <select value={selected.id} onChange={(event) => setSelectedId(event.target.value)} className={inputClass}>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
        </label>
        <div className="hidden rounded-3xl border border-[#e0e3dc] bg-white p-3 xl:block">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a9490]">Properties</p>
          {properties.map((property) => (
            <button
              type="button"
              key={property.id}
              onClick={() => { setSelectedId(property.id); setFeedback(null); }}
              className={`mt-1 flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${property.id === selected.id ? "bg-[#eef3ef]" : "hover:bg-[#f7f8f5]"}`}
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                <Image src={property.heroImage} alt="" fill className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{property.name}</span>
                <span className="mt-0.5 block truncate text-xs text-[#7b8782]">{property.location}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="hidden rounded-2xl bg-[#e8f0eb] p-4 text-sm text-[#52645d] xl:block">
          Images are managed from the project asset library. This editor controls all guest-facing listing details.
        </div>
      </aside>

      <section className="overflow-hidden rounded-3xl border border-[#e0e3dc] bg-white">
        <div className="relative h-48 sm:h-60">
          <Image src={selected.heroImage} alt={selected.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white sm:bottom-6 sm:left-6 sm:right-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">Editing listing</p>
              <p className="mt-1 text-xl font-semibold sm:text-2xl">{draft.name}</p>
            </div>
            <Link href={`/properties/${selected.slug}`} className="rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-[#173a33]">Preview ↗</Link>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#52645d]">Property name
              <input value={draft.name} onChange={(event) => update("name", event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-medium text-[#52645d]">Location
              <input value={draft.location} onChange={(event) => update("location", event.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="mt-5 block text-sm font-medium text-[#52645d]">Short tagline
            <input value={draft.tagline} onChange={(event) => update("tagline", event.target.value)} className={inputClass} />
          </label>
          <label className="mt-5 block text-sm font-medium text-[#52645d]">Description
            <textarea rows={5} value={draft.description} onChange={(event) => update("description", event.target.value)} className={inputClass} />
          </label>

          <div className="mt-7 border-t border-[#eceee8] pt-7">
            <h2 className="font-semibold">Stay details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {([
                ["bedrooms", "Bedrooms"],
                ["bathrooms", "Bathrooms"],
                ["guests", "Max guests"],
                ["pricePerNight", "Nightly rate ($)"],
              ] as const).map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-[#52645d]">{label}
                  <input type="number" min={key === "bathrooms" || key === "bedrooms" ? 0 : 1} value={draft[key]} onChange={(event) => update(key, Number(event.target.value))} className={inputClass} />
                </label>
              ))}
            </div>
          </div>

          <label className="mt-7 block border-t border-[#eceee8] pt-7 text-sm font-medium text-[#52645d]">
            Amenities <span className="font-normal text-[#8a9490]">— one per line</span>
            <textarea rows={7} value={draft.amenitiesText} onChange={(event) => update("amenitiesText", event.target.value)} className={`${inputClass} font-mono`} />
          </label>

          <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-[#f4f6f2] p-4">
            <span>
              <span className="block text-sm font-semibold">Featured listing</span>
              <span className="mt-1 block text-xs text-[#78837f]">Show this property in prominent guest-facing sections.</span>
            </span>
            <input type="checkbox" checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} className="size-5 accent-[#173a33]" />
          </label>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eceee8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className={`text-sm ${feedback?.kind === "error" ? "text-red-700" : "text-emerald-700"}`}>
              {feedback?.message}
            </div>
            <button type="button" onClick={save} disabled={isPending} className="rounded-xl bg-[#173a33] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
