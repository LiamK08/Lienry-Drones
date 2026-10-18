import type { Metadata } from "next";
import { companyPage } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { FounderList } from "@/components/company/FounderList";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { PageHero } from "@/components/sections/PageHero";
import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

/**
 * Keeps a hyphenated compound whole in a display heading: a word joiner (U+2060, zero width and
 * silent) after the hyphen removes the line break the hyphen allows, so a balanced heading never
 * ends a line on "pre-". The fonts have no non-breaking hyphen (U+2011).
 */
function keepCompounds(text: string) {
  return text.replace(/(\w)-(?=\w)/g, "$1-⁠");
}

/**
 * /company in five bands, alternating light and dark: the hero, where the company is, the rules it
 * builds by, the founders, and the investor ask. Then the ink footer.
 */
export default function CompanyPage() {
  const { hero, where, values, founders, closing } = companyPage;
  return (
    <>
      <PageHero eyebrow={hero.eyebrow} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} media={{ kind: "image", ...hero.image }} />
      <FeatureRow
        id="where"
        tone="ink"
        side="left"
        eyebrow={where.eyebrow}
        headline={keepCompounds(where.headline)}
        intro={where.body}
        facts={where.items.map((i) => ({ term: i.title, text: i.body }))}
        image={where.image}
      />
      <FeatureRow
        id="values"
        tone="plaster"
        side="right"
        eyebrow={values.eyebrow}
        headline={values.headline}
        intro={values.body}
        facts={values.items.map((i) => ({ term: i.title, text: i.body }))}
        termStyle="strong"
        image={values.image}
      />
      <Band id="founders" tone="ink" labelledBy="founders-heading">
        <Container>
          <div className="lg:grid-12">
            <SectionHead id="founders-heading" layout="stack" eyebrow={founders.eyebrow} headline={founders.headline} intro={founders.intro} className="lg:col-span-5" />
            <Reveal className="mt-(--head-gap) lg:col-span-6 lg:col-start-7 lg:mt-0">
              <FounderList people={founders.people} />
              <FactList items={[{ term: founders.exploring.title, text: founders.exploring.body }]} className="mt-8" />
            </Reveal>
          </div>
        </Container>
      </Band>
      <ClosingSection
        id="closing"
        eyebrow={closing.eyebrow}
        headline={keepCompounds(closing.headline)}
        emphasis={keepCompounds(closing.emphasis)}
        body={closing.body}
        primary={closing.primary}
        links={closing.links}
        media={{ kind: "image", image: closing.image }}
      />
    </>
  );
}
