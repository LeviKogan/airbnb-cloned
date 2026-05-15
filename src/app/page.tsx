import Link from "next/link";
import Hero from "@/components/home/Hero";
import PropertyGrid from "@/components/home/PropertyGrid";
import Container from "@/components/layout/Container";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PropertyGrid />

      <section id="about" className="bg-neutral-50 py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
                About us
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                Thoughtfully hosted stays with direct booking.
              </h2>
            </div>

            <div className="space-y-5 text-neutral-600">
              <p className="leading-7">
                We offer two carefully presented holiday properties designed for
                comfort, simplicity, and memorable short stays.
              </p>
              <p className="leading-7">
                Guests can browse properties, view photos, pick dates with availability checks,
                and submit booking requests directly—without relying on third-party marketplaces.
              </p>
              <p className="leading-7">
                Coming next: payment capture, email confirmations, and an owner dashboard for
                managing availability at scale.
              </p>
              <p className="leading-7">
                <Link href="/about" className="font-medium text-neutral-950 underline">
                  Read more about how we host
                </Link>{" "}
                or{" "}
                <Link href="/contact" className="font-medium text-neutral-950 underline">
                  get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}