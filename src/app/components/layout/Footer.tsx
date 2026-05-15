import Link from "next/link";
import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-neutral-50">
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Stay Victoria</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">
              Boutique stays in Victoria with direct booking and clear availability.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
            <Link href="/properties" className="hover:text-neutral-950">
              Properties
            </Link>
            <Link href="/about" className="hover:text-neutral-950">
              About
            </Link>
            <Link href="/contact" className="hover:text-neutral-950">
              Contact
            </Link>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-8 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Stay Victoria. All rights reserved.</p>
          <p>
            Email:{" "}
            <a href="mailto:hello@stayvictoria.com" className="text-neutral-950 underline">
              hello@stayvictoria.com
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}