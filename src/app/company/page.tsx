import type { Metadata } from "next";
import { companyPage } from "@/content/pages";
import { CtaBlock, Tiles } from "@/components/blocks/Blocks";
import { Container, Section, SectionHeading, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PhotoPlaceholder } from "@/components/home/VisionLetter";
import { Picture } from "@/components/ui/Picture";

export const metadata: Metadata = {
  title: "Company",
  description: "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
  alternates: { canonical: "/company" },
};

export default function CompanyPage() {
  const c = companyPage;
  return (
    <>
      <header className="page-x bg-plaster pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
        <Container width="statement">
          <Reveal>
            <Eyebrow className="mb-4">{c.eyebrow}</Eyebrow>
            <h1 className="text-h2 text-muted">{c.headline}</h1>
            <p className="mt-8 font-display text-[clamp(1.75rem,1.3rem+2vw,2.5rem)] leading-[1.25] tracking-[-0.01em]">{c.statement}</p>
          </Reveal>
        </Container>
        <Container className="mt-12 md:mt-16">
          <Reveal delay={0.1}>
            <Picture id="co1-company" alt="A harbour-side street of mid-rise buildings at dawn" aspect="21/9" sizes="(min-width: 1280px) 1280px, 100vw" />
          </Reveal>
        </Container>
      </header>
      <Section id="founders" ariaLabelledby="founders-heading">
        <Container>
          <Reveal>
            <SectionHeading id="founders-heading" eyebrow={c.founders.eyebrow} headline={c.founders.headline} />
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:mt-16 md:max-w-[52rem]">
            {c.founders.people.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08} as="article">
                <PhotoPlaceholder label={`Photo of ${p.name} to come`} />
                <h3 className="mt-5 font-sans text-h4 font-medium">{p.name}</h3>
                <p className="text-small text-muted">{p.title}</p>
                <p className="mt-3 text-small text-muted">{p.bio}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
      <Tiles id="where" eyebrow={c.where.eyebrow} headline={c.where.headline} items={c.where.items} columns={4} />
      <Section id="exploring" ariaLabelledby="exploring-heading">
        <Container>
          <div className="grid gap-8 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <SectionHeading id="exploring-heading" eyebrow={c.exploring.eyebrow} headline={c.exploring.headline} />
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" delay={0.08}>
              <p className="text-lead text-muted">{c.exploring.body}</p>
            </Reveal>
          </div>
        </Container>
      </Section>
      <CtaBlock id="investors" eyebrow={c.investors.eyebrow} headline={c.investors.headline} body={c.investors.body} cta={c.investors.cta} />
    </>
  );
}
