import Container from "@/components/layout/Container";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-black/5 bg-neutral-50">
      <Container className="py-10">
        <div className="flex flex-col gap-3 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Stay Victoria. All rights reserved.</p>
          <p>Email: hello@stayvictoria.com</p>
        </div>
      </Container>
    </footer>
  );
}