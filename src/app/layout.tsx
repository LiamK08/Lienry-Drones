import type { Metadata, Viewport } from "next";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { LenisProvider } from "@/lib/lenis-provider";
import { brand, siteUrl } from "@/lib/site";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { OrganizationJsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name}: ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_AU",
    url: siteUrl,
    title: `${brand.name}: ${brand.tagline}`,
    description: brand.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Lienry Drones. Clean exteriors. Nobody on site." }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f3efe7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <MotionConfig reducedMotion="user">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-button focus:bg-glass focus:px-4 focus:py-2 focus:text-plaster"
          >
            Skip to content
          </a>
          <LenisProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </LenisProvider>
        </MotionConfig>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
