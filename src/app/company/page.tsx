import type { Metadata } from "next";
import { companyPage } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { FounderList } from "@/components/company/FounderList";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

/**
 * Keeps a hyphenated compound whole in a display heading: a word joiner (U+2060, zero width and
 * silent) after the hyphen removes the line break the hyphen allows, so a balanced heading never
 * ends a line on "pre-". The fonts have no non-breaking hyphen (U+2011), which would fall back to
 * another typeface.
 */
function keepCompounds(text: string) {
  return text.replace(/(\w)-(?=\w)/g, "$1-\u2060");
}

// /company (docs/REDESIGN-SPEC.md C6): the statement over one wide image, the two narrative rows,
// the founders with what is next, then the investor panel. Tones: raised, plaster, raised, sunken,
// plaster (with the glass-deep panel), then the sunken footer.
export default function CompanyPage() {
  const c = companyPage;
  return (
    <>
      {/* 1. Statement: a media hero, so nothing in it waits for a reveal. */}
      <Band id="statement" as="header" tone="raised" pad="hero" labelledBy="company-heading">
        <Container>
          <SectionHead
            id="company-heading"
            as="h1"
            size="h1"
            eyebrow="company"
            headline={c.headline}
            emphasis={c.emphasis}
            reveal={false}
            action={<p className="text-lead text-fg">{c.statement}</p>}
          />
          <Picture
            id={c.heroImageId}
            alt={c.heroAlt}
            aspect="21/9"
            priority
            sizes="(min-width: 1440px) 1392px, 100vw"
            className="mt-(--head-gap)"
          />
        </Container>
      </Band>

      {/* 2. Where we are. */}
      <FeatureRow
        id="where"
        tone="plaster"
        side="left"
        eyebrow="where we are"
        headline={keepCompounds(c.where.headline)}
        intro={c.where.body}
        facts={c.where.items.map((i) => ({ term: i.title, text: i.body }))}
        image={c.where.image}
      />

      {/* 3. How we work. */}
      <FeatureRow
        id="values"
        tone="raised"
        side="right"
        eyebrow="how we work"
        headline={c.values.headline}
        intro={c.values.body}
        facts={c.values.items.map((i) => ({ term: i.title, text: i.body }))}
        termStyle="strong"
        image={c.values.image}
      />

      {/* 4. Founders and what is next: two split blocks divided by a hairline. The band is named by
          the founders heading; the second block is its own section, named by its heading. */}
      <Band id="founders" tone="sunken" labelledBy="founders-heading">
        <Container>
          <SectionHead id="founders-heading" eyebrow="founders" headline={c.founders.headline} action={<FounderList people={c.founders.people} />} />
          <section aria-labelledby="exploring-heading" className="mt-(--head-gap) border-t border-rule pt-(--head-gap)">
            <SectionHead id="exploring-heading" eyebrow={c.exploring.eyebrow.toLowerCase()} headline={c.exploring.headline} intro={c.exploring.body} />
          </section>
        </Container>
      </Band>

      {/* 5. Investors: the closing panel. */}
      <CtaPanel
        id="investors"
        eyebrow="investors"
        headline={keepCompounds(c.investors.headline)}
        body={`${c.investors.body} ${c.investors.note}`}
        primary={c.investors.cta}
        links={c.investors.links}
        image={c.investors.image}
      />
    </>
  );
}
