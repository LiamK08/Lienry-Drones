import type { Metadata } from "next";
import { privacyPage } from "@/content/privacy";
import { pageMetadata } from "@/lib/site";
import { LegalToc } from "@/components/blocks/LegalToc";
import { Band, Container } from "@/components/ui/Band";

export const metadata: Metadata = {
  ...pageMetadata("/privacy", "How Lienry Drones handles the details you share through this website."),
  robots: { index: false, follow: true },
};

/** A section title as an anchor id: "Who we are" becomes "who-we-are". */
function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * /privacy: a centred legal header on paper (eyebrow, h1, the updated line), then on white the
 * contents beside the policy. From 1024 the contents sit sticky in a narrow left column and the
 * sections run in the right; below 1024 the contents come first.
 */
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  return (
    <>
      <Band id="hero" as="header" tone="paper" pad="hero" labelledBy="privacy-heading">
        <Container>
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow">Legal</p>
            <h1 id="privacy-heading" className="text-h1">
              {p.headline.replace(/\.$/, "")}
            </h1>
            <p className="mt-4 text-small text-fg-muted">
              Last updated {p.updated}. A template for legal review before launch.
            </p>
          </div>
        </Container>
      </Band>
      <Band id="policy" tone="plaster" ariaLabel="Policy">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
            <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} />
            <div data-prose="" className="flex max-w-3xl flex-col gap-12">
              {sections.map((s) => (
                <section key={s.id} aria-labelledby={s.id}>
                  {/* tabIndex -1: fragment navigation focuses the heading it scrolls to. */}
                  <h2 id={s.id} tabIndex={-1} className="scroll-mt-28 text-[1.75rem] leading-tight md:text-[2rem]">
                    {s.title}
                  </h2>
                  <p className="mt-4 max-w-none text-body text-fg-muted">{s.body}</p>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Band>
    </>
  );
}
