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

/** Legal prose: 16px at 1.65, held to the site's measure of 68 characters a line or under (max-w-prose,
 *  45ch of Inter's wide 0; globals.css), the lists included. */
const prose = "max-w-prose text-body leading-[1.65] text-fg-muted";

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
 * /privacy: one white band on the page's 12 columns. From 1024 the contents take columns 1-3, sticky
 * under the bar, and the policy takes 4-10: the h1 and the updated line, left-aligned over the text,
 * then the sections, each a heading and its paragraphs, with any list lettered (a, b, c). Below 1024
 * the contents are hidden and the policy reads straight down.
 */
export default function PrivacyPage() {
  const p = privacyPage;
  const sections = p.sections.map((s) => ({ ...s, id: slug(s.title) }));
  const hold = holdLines(1);
  return (
    <Band id="policy" tone="plaster" pad="hero" labelledBy="privacy-heading">
      <Container className="lg:grid-12">
        <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} className="lg:col-span-3 lg:row-span-2 lg:row-start-1" />
        <header className="lg:col-span-7 lg:col-start-4 lg:row-start-1">
          <h1 id="privacy-heading" className={`text-h1 ${hold.className}`} style={hold.style}>
            {p.headline}
          </h1>
          <p className="mt-3 text-small leading-[1.5] text-fg-muted">Last updated {p.updated}</p>
        </header>
        <div data-prose="" className="mt-12 min-w-0 lg:col-span-7 lg:col-start-4 lg:row-start-2 lg:mt-14">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id} className="mt-10 first:mt-0">
              {/* tabIndex -1: fragment navigation focuses the heading it scrolls to. */}
              <h2 id={s.id} tabIndex={-1} className="scroll-mt-28 text-[1.375rem] leading-[1.25] lg:text-[1.5rem]">
                {s.title}
              </h2>
              <p className={`mt-3 ${prose}`}>{withLink(s.body, s.link)}</p>
              {s.list && (
                <ol className={`mt-2 list-[lower-alpha] space-y-1 pl-6 marker:text-fg-muted ${prose}`}>
                  {s.list.map((item) => (
                    <li key={item} className="pl-1">
                      {withLink(item, s.link)}
                    </li>
                  ))}
                </ol>
              )}
              {s.close && <p className={`mt-3 ${prose}`}>{withLink(s.close, s.link)}</p>}
            </section>
          ))}
        </div>
      </Container>
    </Band>
  );
}
