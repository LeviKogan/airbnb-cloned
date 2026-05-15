import type { Metadata } from "next";
import PropertyGrid from "@/components/home/PropertyGrid";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse boutique holiday stays in Victoria. View details, check availability, and request a booking directly.",
};

export default function PropertiesPage() {
  return (
    <main>
      <PropertyGrid />
    </main>
  );
}
