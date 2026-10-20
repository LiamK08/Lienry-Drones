import type { Metadata } from "next";
import { notFoundPage } from "@/content/notFound";
import { brand } from "@/lib/site";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Headline } from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: `Page not found | ${brand.name}`,
  robots: { index: false, follow: true },
};

/** Any address with no page: one quiet paper band, the message centred in it, then the footer. */
export default function NotFound() {
  const p = notFoundPage;
  return (
    <Band id="hero" as="header" tone="paper" pad="hero" labelledBy="hero-heading" className="flex min-h-[70svh] items-center">
      <Container>
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow">{p.eyebrow}</p>
          <h1 id="hero-heading" className="em-accent text-h1">
            <Headline text={p.headline} emphasis={p.emphasis} />
          </h1>
          <p className="mt-4 text-body text-fg-muted">{p.lead}</p>
          <p className="mt-2 text-caption text-fg-muted">Error 404</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button href={p.primary.href} arrow>
              {p.primary.label}
            </Button>
            <Button href={p.secondary.href} variant="secondary">
              {p.secondary.label}
            </Button>
          </div>
        </div>
      </Container>
    </Band>
  );
}
