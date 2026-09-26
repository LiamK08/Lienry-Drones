import type { Metadata } from "next";
import { privacyPage } from "@/content/pages";
import { Band, Container } from "@/components/ui/Band";
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

// The index links carry the tertiary link's look (ui/Button) on a native anchor. Button renders
// next/link, whose router scrolls to a hash but leaves focus on the link (Next 16's default scroll
// handler). The browser's own fragment navigation scrolls to the section and runs the focusing
// steps on its heading (tabIndex -1), so keyboard and screen reader users land on the section too.
const indexLink =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-hard font-sans text-small font-medium text-glass underline decoration-1 underline-offset-[6px] transition-[color] duration-200 ease-instrument hover:text-glass-deep hover:decoration-2";

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
                      <a href={`#${s.id}`} className={indexLink}>
                        {s.title}
                      </a>
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
              {/* tabIndex -1: fragment navigation focuses the heading it scrolls to, so the index
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
