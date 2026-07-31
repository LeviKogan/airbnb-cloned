import { getManagedProperties } from "@/lib/server/properties";
import ListingEditor from "@/components/admin/ListingEditor";

type ListingsPageProps = {
  searchParams: Promise<{ property?: string }>;
};

export default async function AdminListingsPage({ searchParams }: ListingsPageProps) {
  const [properties, query] = await Promise.all([getManagedProperties(), searchParams]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-[#597068]">Property management</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-4xl">Listings</h1>
        <p className="mt-2 max-w-2xl text-[#6d7a75]">Keep the details guests see accurate. Saved changes appear on the live property pages immediately.</p>
      </div>
      <ListingEditor properties={properties} initialPropertyId={query.property} />
    </div>
  );
}
