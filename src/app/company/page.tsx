import type { Metadata } from "next";
import { companyPage } from "@/content/company";
import { pageMetadata } from "@/lib/site";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { BubbleHero } from "@/components/blocks/BubbleHero";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = pageMetadata(
  "/company",
  "Lienry Drones is a Sydney company at concept stage, building a resident cleaning drone and raising a pre-seed round.",
);

/**
 * /company: the accent hero with round pictures around the headline, four story rows (text beside a
 * rounded picture, alternating), the three rules, the pre-seed round, the accent panel and a media line.
 */
export default function CompanyPage() {
  const { hero, rows, values, founders, close, media } = companyPage;
  return (
    <>
      <BubbleHero mobileLines={3} headline={hero.headline} emphasis={hero.emphasis} lead={hero.lead} images={hero.images} />
      <Band id="story" tone="plaster" ariaLabel="Our story">
        <Container>
          <div className="mx-auto flex max-w-6xl flex-col gap-20 lg:gap-28">
            {rows.map((r, i) => (
              <section key={r.id} aria-labelledby={`${r.id}-heading`} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal className={i % 2 ? "lg:order-2" : ""}>
                  <h2 id={`${r.id}-heading`} className="text-h2s">
                    {r.title}
                  </h2>
                  {r.paragraphs.map((p) => (
                    <p key={p} className="mt-5 max-w-xl text-body text-fg-muted">
                      {p}
                    </p>
                  ))}
                </Reveal>
                <div className={i % 2 ? "lg:order-1" : ""}>
                  <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect="4/3" rounded="card" sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Band>
      <Band id="rules" tone="paper" labelledBy="rules-heading">
        <Container>
          <h2 id="rules-heading" className="text-center text-h2s">
            Three rules we build by
          </h2>
          <ul className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {values.items.map((v, i) => (
              <li key={v.title} className="rounded-card border border-line bg-white p-8">
                <span className="flex size-12 items-center justify-center rounded-pill bg-tint text-accent">
                  <Icon name={["check", "shield", "dock"][i]} className="size-6" />
                </span>
                <p className="mt-6 font-display text-[1.5rem]">{v.title}</p>
                <p className="mt-2 text-small text-fg-muted">{v.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Band>
      <Band id="round" tone="plaster" labelledBy="round-heading">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 id="round-heading" className="text-h2s">
              {founders.headline}
            </h2>
            <p className="mt-5 text-body text-fg-muted">{founders.body}</p>
            <Button href={founders.action.href} arrow className="mt-8">
              {founders.action.label}
            </Button>
          </div>
        </Container>
      </Band>
      <AccentPanel id="closing" headline={close.headline} action={close.action} note={media} />
    </>
  );
}
