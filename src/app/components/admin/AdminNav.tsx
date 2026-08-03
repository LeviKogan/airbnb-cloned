"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin", label: "Overview", icon: "O" },
  { href: "/admin/bookings", label: "Bookings", icon: "B" },
  { href: "/admin/calendar", label: "Calendar", icon: "C" },
  { href: "/admin/listings", label: "Listings", icon: "L" },
  { href: "/admin/accounts", label: "Accounts", icon: "A" },
];

export default function AdminNav({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className={cn(
        variant === "sidebar" && "mt-10 space-y-1",
        variant === "mobile" && "scrollbar-none mt-3 flex gap-1 overflow-x-auto pb-1",
      )}
    >
      {links.map((link) => {
        const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              variant === "sidebar" && (active ? "bg-white text-[#173a33]" : "text-white/65 hover:bg-white/8 hover:text-white"),
              variant === "mobile" && (active ? "bg-[#173a33] text-white" : "whitespace-nowrap text-[#597068]"),
            )}
          >
            <span aria-hidden className="grid size-6 place-items-center rounded-lg border border-current/20 text-[10px] font-bold">
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
