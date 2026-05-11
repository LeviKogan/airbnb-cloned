import Link from "next/link";
import Container from "@/components/layout/Container";

export default function NotFound() {
  return (
    <main className="bg-white py-24">
      <Container className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
        >
          Back to homepage
        </Link>
      </Container>
    </main>
  );
}
