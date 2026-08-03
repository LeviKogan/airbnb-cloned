import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/server/authorization";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage Stay Victoria listings, bookings, accounts, and availability.",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f5f5f1] text-[#1f2925]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-[#dfe2da] bg-[#173a33] px-5 py-7 text-white lg:flex lg:flex-col">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#d9ff75] text-lg font-bold text-[#173a33]">S</span>
            <span>
              <span className="block text-sm font-semibold">Stay Victoria</span>
              <span className="block text-xs text-white/55">Host workspace</span>
            </span>
          </Link>
          <AdminNav variant="sidebar" />
          <div className="mt-auto rounded-2xl bg-white/8 p-4 text-sm text-white/70">
            <p className="truncate font-medium text-white">{admin.name ?? admin.email}</p>
            <p className="mt-0.5 text-xs text-white/50">Administrator</p>
            <Link href="/" className="mt-3 inline-flex font-medium text-[#d9ff75]">Open guest website ↗</Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-[#dfe2da] bg-[#f5f5f1]/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/admin" className="flex items-center gap-2 font-semibold">
                <span className="grid size-9 place-items-center rounded-xl bg-[#173a33] text-sm text-[#d9ff75]">S</span>
                Host workspace
              </Link>
              <Link href="/" className="text-sm font-medium text-[#365f55]">Guest site ↗</Link>
            </div>
            <AdminNav variant="mobile" />
          </header>
          <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
