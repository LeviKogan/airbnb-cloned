import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import { getPropertyBySlug, properties } from "@/lib/data/properties";

type PropertyPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <main className="bg-white pb-20">
      <section className="border-b border-neutral-200 bg-neutral-50 py-12 sm:py-16">
        <Container>
          <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">
            {property.location}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            {property.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            {property.tagline}
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {property.images.map((image, index) => (
              <div
                key={`${property.id}-image-${index}`}
                className={`relative overflow-hidden rounded-2xl ${
                  index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
              >
                <div className={`relative ${index === 0 ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                  <Image
                    src={image}
                    alt={`${property.name} photo ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">About this stay</h2>
            <p className="mt-4 leading-7 text-neutral-700">{property.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-neutral-100 p-4">
                <p className="text-sm text-neutral-500">Guests</p>
                <p className="text-lg font-semibold text-neutral-950">{property.guests}</p>
              </div>
              <div className="rounded-2xl bg-neutral-100 p-4">
                <p className="text-sm text-neutral-500">Bedrooms</p>
                <p className="text-lg font-semibold text-neutral-950">{property.bedrooms}</p>
              </div>
              <div className="rounded-2xl bg-neutral-100 p-4">
                <p className="text-sm text-neutral-500">Bathrooms</p>
                <p className="text-lg font-semibold text-neutral-950">{property.bathrooms}</p>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-semibold text-neutral-950">Amenities</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="rounded-xl border border-neutral-200 px-4 py-3 text-neutral-700">
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-neutral-200 p-6 shadow-sm">
              <p className="text-sm text-neutral-500">From</p>
              <p className="mt-1 text-3xl font-semibold text-neutral-950">
                ${property.pricePerNight}
                <span className="ml-1 text-base font-normal text-neutral-500">/ night</span>
              </p>
              <p className="mt-6 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
                Booking sidebar placeholder: calendar and checkout flow will be added in the next stage.
              </p>
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white opacity-70"
              >
                Reserve (coming soon)
              </button>
            </div>
          </aside>
        </Container>
      </section>
    </main>
  );
}
