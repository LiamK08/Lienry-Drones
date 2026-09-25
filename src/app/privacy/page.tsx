import type { Metadata } from "next";
import { privacyPage } from "@/content/pages";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";

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

// /privacy (docs/REDESIGN-SPEC.md C8, rebalanced): one band. The head is split so the H1 never
// sits beside an empty half: the H1 and the note on the left, the in-page index of the six
// sections as the aside (nothing sticky). The six sections follow as a grid of 4-column cells,
// three across from 1280 and two from 768, so no column ends far short of its neighbour; one
// 45ch column beside the index would leave about 600px of empty paper under the index at 1440.
// Below 768 everything stacks in C8's order: H1, note, index, prose.
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  return (
    <Band id="privacy" tone="plaster" pad="page" labelledBy="privacy-heading">
      <Container>
        <SectionHead
          id="privacy-heading"
          as="h1"
          size="h1"
          headline={p.headline}
          reveal={false}
          below={<p className="text-caption text-muted">Last updated {p.updated}. Template for legal review before launch.</p>}
          aside={{
            action: (
              <nav aria-label="On this page">
                <ul className="grid sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-3 sm:gap-x-6">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <Button href={`#${s.id}`} variant="tertiary">
                        {s.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            ),
          }}
        />
        <div className="mt-[var(--gap-head)] grid gap-y-8 md:grid-cols-2 md:gap-x-6 xl:grid-cols-3">
          {sections.map((s) => (
            <section key={s.id}>
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
