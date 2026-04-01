import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import PropertyCard from "@/components/home/PropertyCard";
import { properties } from "@/lib/data/properties";

export default function PropertyGrid() {
  return (
    <section id="properties" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Our stays"
          title="Choose from two beautiful properties"
          description="Each stay has its own personality, style, and atmosphere. Browse the homes, explore the details, and book directly through our site."
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </Container>
    </section>
  );
}