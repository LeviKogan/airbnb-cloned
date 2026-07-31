import type { Metadata } from "next";
import "./globals.css";
import SiteFrame from "@/components/layout/SiteFrame";

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
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
