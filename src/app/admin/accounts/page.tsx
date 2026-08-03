import { requireAdmin } from "@/lib/server/authorization";
import { prisma } from "@/lib/db/prisma";
import { isAdminEmail } from "@/auth";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(value);
}

export default async function AdminAccountsPage() {
  await requireAdmin();
  const [users, bookings] = await Promise.all([
    prisma.user.findMany({
      include: { accounts: { select: { provider: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      select: { userId: true, guestEmail: true, status: true, totalAmountCents: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-[#597068]">Guests</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#17231f] sm:text-4xl">Accounts</h1>
        <p className="mt-2 max-w-2xl text-[#6d7a75]">View customers who have signed in with Google and the bookings linked to their account.</p>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-[#e0e3dc] bg-white">
        <div className="flex items-center justify-between border-b border-[#eceee8] px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-semibold">Registered guests</h2>
            <p className="mt-1 text-sm text-[#7b8782]">{users.length} account{users.length === 1 ? "" : "s"}</p>
          </div>
          <span className="rounded-full bg-[#eef3ef] px-3 py-1.5 text-xs font-semibold text-[#365f55]">Google OAuth</span>
        </div>
        {users.length ? (
          <div className="divide-y divide-[#eceee8]">
            {users.map((user) => {
              const linked = bookings.filter((booking) => booking.userId === user.id || Boolean(user.email && booking.guestEmail === user.email));
              const confirmedValue = linked
                .filter((booking) => booking.status === "confirmed")
                .reduce((total, booking) => total + (booking.totalAmountCents ?? 0), 0);
              const admin = isAdminEmail(user.email) || user.role === "admin";
              return (
                <article key={user.id} className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#173a33] font-semibold text-[#d9ff75]">{(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{user.name ?? "Google customer"}</p>
                        {admin ? <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Admin</span> : null}
                      </div>
                      <p className="truncate text-sm text-[#6d7a75]">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm lg:text-right">
                    <p className="font-semibold">{linked.length} booking{linked.length === 1 ? "" : "s"}</p>
                    <p className="mt-1 text-[#7b8782]">{confirmedValue ? new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(confirmedValue / 100) : "$0.00"} confirmed</p>
                  </div>
                  <div className="text-sm lg:min-w-36 lg:text-right">
                    <p className="font-medium">{user.accounts[0]?.provider === "google" ? "Google" : user.accounts[0]?.provider ?? "Account"}</p>
                    <p className="mt-1 text-[#7b8782]">Joined {formatDate(user.createdAt)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-[#75817c]">Customer accounts will appear here after Google sign-in is configured.</div>
        )}
      </section>
    </div>
  );
}
