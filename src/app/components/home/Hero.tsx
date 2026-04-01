import Container from "@/components/layout/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25),rgba(0,0,0,0.45)),url('/vercel.svg')] bg-cover bg-center text-white">
      <Container className="flex min-h-[72vh] items-center py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/80">
            Boutique Stays in Victoria
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Memorable stays in handpicked homes.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            Discover two beautifully presented holiday properties with direct booking,
            curated stays, and a simple calendar-based reservation experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#properties"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              View properties
            </a>
            <a
              href="#about"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Learn more
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}