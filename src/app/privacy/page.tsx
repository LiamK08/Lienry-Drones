import type { Metadata } from "next";
import { privacyPage } from "@/content/pages";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "How Lienry Drones handles the details you share through this website.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

/** A section title as an anchor id: "Who we are" becomes "who-we-are". */
function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// /privacy (docs/REDESIGN-SPEC.md C8): one band, split so the heading never sits beside an empty
// half. Columns 1-4: the H1, the note and an in-page index (nothing sticky). Columns 5-10: the prose.
// Below 1024 everything stacks: H1, note, index, prose.
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  return (
    <Band id="privacy" tone="plaster" pad="page" labelledBy="privacy-heading">
      <Container className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
        <div data-col className="lg:col-span-4">
          <h1 id="privacy-heading" className="text-h1">
            {p.headline}
          </h1>
          <p className="mt-4 text-caption text-muted">Last updated {p.updated}. Template for legal review before launch.</p>
          <nav aria-label="On this page" className="mt-6">
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <Button href={`#${s.id}`} variant="tertiary">
                    {s.title}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div data-col className="lg:col-span-6 lg:col-start-5">
          {sections.map((s, i) => (
            <section key={s.id} className={i > 0 ? "mt-8" : undefined}>
              {/* tabIndex -1: the router focuses a hash target after scrolling to it, so the index
                  moves keyboard and screen reader focus to the section it names. */}
              <h2 id={s.id} tabIndex={-1} className="scroll-mt-6 text-h3">
                {s.title}
              </h2>
              <p className="mt-2 text-body text-muted lg:mt-3">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </Band>
  );
}
