import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Stay Victoria: direct booking, curated homes, and how we host short stays across Victoria.",
};

export default function AboutPage() {
  return (
    <main className="pb-20">
      <section className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16">
        <Container>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">About us</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            Thoughtfully hosted stays with direct booking.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            Stay Victoria is a small, owner-led collection of holiday homes. We focus on clear
            information, fair pricing, and a booking flow you complete on our site—no marketplace
            middleman.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">What we offer</h2>
            <ul className="mt-6 space-y-4 text-neutral-700">
              <li className="leading-7">
                <span className="font-medium text-neutral-950">Curated listings.</span> Each property
                is presented with accurate photos, amenities, and capacity so you know what you are
                booking.
              </li>
              <li className="leading-7">
                <span className="font-medium text-neutral-950">Calendar-based availability.</span>{" "}
                Pick check-in and check-out dates, see night counts and totals, and avoid dates that
                are already held or blocked.
              </li>
              <li className="leading-7">
                <span className="font-medium text-neutral-950">Booking requests.</span> Submit your
                stay details through a secure form; we confirm by email before your visit (payments
                can be added as the product matures).
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">How booking works</h2>
            <ol className="mt-6 list-decimal space-y-4 pl-5 text-neutral-700">
              <li className="leading-7">
                Browse <Link href="/properties" className="font-medium text-neutral-950 underline">properties</Link>{" "}
                and open a listing you like.
              </li>
              <li className="leading-7">Choose dates and guest count; the site checks for overlaps with existing holds.</li>
              <li className="leading-7">Send a request with your contact details and any notes.</li>
              <li className="leading-7">We follow up to confirm house rules, arrival details, and payment if applicable.</li>
            </ol>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-14 sm:py-20">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-neutral-950">Questions?</h2>
          <p className="mt-4 leading-7 text-neutral-600">
            For general enquiries, partnerships, or help before you book, use our contact page—we
            read every message.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Contact us
          </Link>
        </Container>
      </section>
    </main>
  );
}
