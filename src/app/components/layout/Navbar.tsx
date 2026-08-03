import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3 md:flex-nowrap md:py-0">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Stay Victoria
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-700 md:order-none md:flex md:w-auto md:gap-6">
          <Link href="/properties" className="transition hover:text-black">
            Properties
          </Link>
          <Link href="/about" className="transition hover:text-black">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-black">
            Contact
          </Link>
          <Link href="/account" className="transition hover:text-black">
            Account
          </Link>
        </nav>

        <Link
          href="/properties"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Book your stay
        </Link>
      </Container>
    </header>
  );
}
