import type { Metadata, Viewport } from "next";
import { MotionConfig } from "motion/react";
import "./globals.css";
import { brand, siteUrl } from "@/lib/site";
import { fontClassName } from "@/lib/fonts";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { OrganizationJsonLd } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brand.name,
    template: `%s | ${brand.name}`,
  },
  applicationName: brand.name,
  description: brand.description,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_AU",
    url: siteUrl,
    title: brand.name,
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
    <html lang="en-AU" className={fontClassName}>
      <body>
        <MotionConfig reducedMotion="user">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-hard focus:bg-ink focus:px-4 focus:py-2 focus:text-plaster"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </MotionConfig>
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
