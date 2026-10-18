import type { Metadata } from "next";
import { privacyPage } from "@/content/privacy";
import { pageMetadata } from "@/lib/site";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";

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

// The index links carry the tertiary link's look (ui/Button) on a native anchor. Button renders
// next/link, whose router scrolls to a hash but leaves focus on the link (Next 16's default scroll
// handler). The browser's own fragment navigation scrolls to the section and runs the focusing
// steps on its heading (tabIndex -1), so keyboard and screen reader users land on the section too.
const indexLink =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-hard font-sans text-small font-medium text-link underline decoration-1 underline-offset-[6px] transition-[color,text-decoration-thickness] duration-200 ease-instrument hover:text-fg hover:decoration-2 motion-reduce:transition-none";

// /privacy: one plaster band. The head is split: the H1 and the note on the left, the in-page index
// of the six sections as the aside (nothing sticky). The six sections follow in [data-prose] as
// 4-column cells, three across from 1024 and two from 768, so no column ends far short of its
// neighbour. Below 768 everything stacks: H1, note, index, prose.
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  return (
    <Band id="privacy" tone="plaster" pad="hero" labelledBy="privacy-heading">
      <Container>
        <SectionHead
          id="privacy-heading"
          as="h1"
          size="h1"
          eyebrow="legal"
          headline={p.headline}
          reveal={false}
          below={<p className="text-caption text-fg-muted">Last updated {p.updated}. Template for legal review before launch.</p>}
          action={
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
          }
        />
        <div data-prose="" className="mt-(--head-gap) grid gap-y-10 md:grid-cols-2 md:gap-x-6 lg:grid-12">
          {sections.map((s) => (
            <section key={s.id} className="lg:col-span-4">
              {/* tabIndex -1: fragment navigation focuses the heading it scrolls to, so the index
                  moves keyboard and screen reader focus to the section it names. */}
              <h2 id={s.id} tabIndex={-1} className="scroll-mt-6 text-h3">
                {s.title}
              </h2>
              <p className="mt-4 text-body text-fg-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </Container>
    </Band>
  );
}
