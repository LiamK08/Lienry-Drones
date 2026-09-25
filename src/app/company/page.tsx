import type { Metadata } from "next";
import { companyPage } from "@/content/pages";
import { FounderList } from "@/components/company/FounderList";
import { CtaPanel } from "@/components/sections/CtaPanel";
import { FeatureRow } from "@/components/sections/FeatureRow";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: "Lienry Drones",
  description: "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
  alternates: { canonical: "/company" },
};

// /company (docs/REDESIGN-SPEC.md C6): the statement over one wide image, the two narrative rows,
// the founders with what is next, then the investor panel. Tones: raised, plaster, raised, sunken,
// plaster (with the glass-deep panel), then the sunken footer.
export default function CompanyPage() {
  const c = companyPage;
  return (
    <>
      {/* 1. Statement: a media hero, so nothing in it waits for a reveal. */}
      <Band id="statement" as="header" tone="raised" pad="page" labelledBy="company-heading">
        <Container>
          <SectionHead
            id="company-heading"
            as="h1"
            size="h1"
            headline={c.headline}
            emphasis={c.emphasis}
            reveal={false}
            aside={{ action: <p className="text-lead text-ink">{c.statement}</p> }}
          />
          <Picture
            id={c.heroImageId}
            alt={c.heroAlt}
            aspect="21/9"
            priority
            sizes="(min-width: 1440px) 1392px, 100vw"
            className="mt-[var(--gap-head)]"
          />
        </Container>
      </Band>

      {/* 2. Where we are. */}
      <FeatureRow
        id="where"
        tone="plaster"
        side="left"
        title={c.where.headline}
        body={c.where.body}
        facts={c.where.items.map((i) => ({ term: i.title, text: i.body }))}
        image={c.where.image}
      />

      {/* 3. How we work. */}
      <FeatureRow
        id="values"
        tone="raised"
        side="right"
        title={c.values.headline}
        body={c.values.body}
        facts={c.values.items.map((i) => ({ term: i.title, text: i.body }))}
        termStyle="strong"
        image={c.values.image}
      />

      {/* 4. Founders and what is next: two split blocks divided by a hairline. The band is named by
          the founders heading; the second block is its own section, named by its heading. */}
      <Band id="founders" tone="sunken" labelledBy="founders-heading">
        <Container>
          <SectionHead id="founders-heading" headline={c.founders.headline} aside={{ action: <FounderList people={c.founders.people} /> }} />
          <section aria-labelledby="exploring-heading" className="mt-[var(--gap-head)] border-t border-hairline pt-[var(--gap-head)]">
            <SectionHead id="exploring-heading" headline={c.exploring.headline} aside={{ label: c.exploring.eyebrow, intro: c.exploring.body }} />
          </section>
        </Container>
      </Band>

      {/* 5. Investors: the closing panel. */}
      <CtaPanel
        id="investors"
        headline={c.investors.headline}
        body={`${c.investors.body} ${c.investors.note}`}
        primary={c.investors.cta}
        links={c.investors.links}
        image={c.investors.image}
      />
    </>
  );
}
