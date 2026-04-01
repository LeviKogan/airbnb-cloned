import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Stay Victoria
        </Link>

        <nav className="hidden gap-6 text-sm text-neutral-700 md:flex">
          <a href="#properties" className="transition hover:text-black">
            Properties
          </a>
          <a href="#about" className="transition hover:text-black">
            About
          </a>
          <a href="#contact" className="transition hover:text-black">
            Contact
          </a>
        </nav>

        <Link
          href="#properties"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Book your stay
        </Link>
      </Container>
    </header>
  );
}