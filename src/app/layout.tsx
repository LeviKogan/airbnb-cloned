import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Stay Victoria", template: "%s | Stay Victoria" },
  description: "Boutique direct-booking stays in Victoria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-950 antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}