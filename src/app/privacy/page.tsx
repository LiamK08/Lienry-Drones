import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { privacyPage, type PrivacySection } from "@/content/privacy";
import { pageMetadata } from "@/lib/site";
import { LegalToc } from "@/components/blocks/LegalToc";
import { holdLines } from "@/components/blocks/holdLines";
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

/** Legal prose: 14px ink at 1.2, 8px between paragraphs and lettered lines, spanning the column. */
const prose = "mt-2 max-w-none text-small leading-[1.2] text-ink";

/** The section's text, with the first occurrence of its link label (if any) as an inline link. */
function withLink(text: string, link: PrivacySection["link"]): ReactNode {
  const at = link ? text.indexOf(link.label) : -1;
  if (!link || at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <Link href={link.href} className="link">
        {link.label}
      </Link>
      {text.slice(at + link.label.length)}
    </>
  );
}

/**
 * The legal pages as a centred tab strip: each a link, the current one underlined in ink and marked
 * aria-current="page". A list of links (not an ARIA tablist): each tab is its own page.
 */
function LegalTabs({ pages, current }: { pages: readonly { label: string; href: string }[]; current: string }) {
  return (
    <nav aria-label="Legal">
      <ul className="flex flex-wrap justify-center">
        {pages.map((pg) => {
          const on = pg.href === current;
          return (
            <li key={pg.href}>
              <Link
                href={pg.href}
                aria-current={on ? "page" : undefined}
                className={`block border-b-2 px-5 py-[0.9375rem] text-base leading-[1.2] tracking-normal transition-[background-color,border-color,color] duration-200 ${on ? "border-ink text-ink" : "border-border-strong/70 text-muted hover:text-ink"}`}
              >
                {pg.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * /privacy: a centred legal header on paper (eyebrow, h1, the updated line), then on white the legal
 * tab strip and the policy set as a dense legal document. From 1024 the contents sit sticky in a
 * 275px left column beside a full-width text column; below 1024 the contents are hidden and the
 * sections read straight through.
 */
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  const hold = holdLines(1);
  return (
    <>
      <Band id="hero" as="header" tone="paper" pad="none" labelledBy="privacy-heading" className="pt-[8.625rem] pb-[5.5rem]">
        <Container>
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow">Legal</p>
            <h1 id="privacy-heading" className={`text-h1 ${hold.className}`} style={hold.style}>
              {p.headline.replace(/\.$/, "")}
            </h1>
            <p className="mt-3 max-w-none text-base leading-[1.3] tracking-normal text-ink">Last updated {p.updated}.</p>
          </div>
        </Container>
      </Band>
      <Band id="policy" tone="plaster" pad="none" ariaLabel="Policy" className="pt-4 pb-[6.5625rem] lg:pb-[3.75rem]">
        <Container>
          <LegalTabs pages={p.legalPages} current="/privacy" />
          <div className="mx-auto mt-14 grid max-w-[80.625rem] gap-4 lg:mt-[3.1875rem] lg:grid-cols-[17.1875rem_1fr]">
            <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} />
            <div data-prose="" className="min-w-0">
              {sections.map((s) => (
                <section key={s.id} aria-labelledby={s.id} className="mt-8 first:mt-0">
                  {/* tabIndex -1: fragment navigation focuses the heading it scrolls to. */}
                  <h2 id={s.id} tabIndex={-1} className="scroll-mt-28 text-[1.375rem] leading-[1.3] lg:text-[1.5rem]">
                    {s.title}
                  </h2>
                  <p className={prose}>{withLink(s.body, s.link)}</p>
                  {s.list && (
                    <ol className="list-none">
                      {s.list.map((item, n) => (
                        <li key={item} className={prose}>
                          ({String.fromCharCode(97 + n)}) {withLink(item, s.link)}
                        </li>
                      ))}
                    </ol>
                  )}
                  {s.close && <p className={prose}>{withLink(s.close, s.link)}</p>}
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Band>
    </>
  );
}
