import type { Metadata } from "next";
import { notFoundPage } from "@/content/notFound";
import { brand } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: `Page not found | ${brand.name}`,
  robots: { index: false, follow: true },
};

/** Any address with no page: one plaster hero with the way back, then the ink footer. */
export default function NotFound() {
  const p = notFoundPage;
  return <PageHero eyebrow={p.eyebrow} headline={p.headline} emphasis={p.emphasis} lead={p.lead} primary={p.primary} secondary={p.secondary} />;
}
