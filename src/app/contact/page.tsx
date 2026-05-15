import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Stay Victoria about bookings, properties, or general enquiries.",
};

export default function ContactPage() {
  return (
    <main className="pb-20" id="contact">
      <section className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16">
        <Container>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Contact</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            We are here to help
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            Ask about availability, house rules, access, or anything else before you book. For the
            fastest answer on a specific stay, include property name and dates.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">Direct lines</h2>
            <dl className="mt-6 space-y-5 text-sm text-neutral-700">
              <div>
                <dt className="font-medium text-neutral-950">Email</dt>
                <dd className="mt-1">
                  <a href="mailto:hello@stayvictoria.com" className="underline hover:text-neutral-950">
                    hello@stayvictoria.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-950">Response time</dt>
                <dd className="mt-1 leading-6">We aim to reply within one business day, often sooner.</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-950">Booking support</dt>
                <dd className="mt-1 leading-6">
                  Use the form with your dates and guest count, or complete a booking request from a
                  property page—those requests include your stay details automatically when you use
                  the on-page form after choosing dates.
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">Send a message</h2>
            <p className="mt-2 text-sm text-neutral-600">
              This demo validates your message on the server. In production you would connect email or
              a ticketing system.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
