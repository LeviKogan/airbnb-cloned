import Link from "next/link";
import Container from "@/components/layout/Container";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-[70vh] bg-[#f5f5f1] py-16">
      <Container className="max-w-2xl">
        <div className="rounded-3xl border border-[#dfe3dc] bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Payment received</h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-[#66756f]">Stripe is confirming your payment. Your booking status will update automatically, and we’ll email your confirmation.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/account" className="rounded-xl bg-[#173a33] px-5 py-3 text-sm font-semibold text-white">View my bookings</Link>
            <Link href="/" className="rounded-xl border border-[#d5dbd5] px-5 py-3 text-sm font-semibold text-[#365f55]">Back to homepage</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
