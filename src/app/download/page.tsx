import type { Metadata } from "next";
import { downloadPage } from "@/content/download";
import { desktopRelease } from "@/lib/download";
import { pageMetadata } from "@/lib/site";
import { DownloadActions } from "@/components/download/DownloadActions";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

const d = downloadPage;
const description = desktopRelease.available ? d.meta.description.live : d.meta.description.soon;

export const metadata: Metadata = pageMetadata("/download", description);

/**
 * /download in three bands, light, dark, light: the hero with the download buttons and the working
 * window under it (the product in the first screen), what the software does, and the questions,
 * system requirements among them. Then the ink footer.
 */
export default function DownloadPage() {
  const { hero, features, faq } = d;
  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        emphasis={hero.emphasis}
        lead={hero.lead}
        actions={<DownloadActions />}
        after={<SoftwareWindow priority />}
      />
      <Band id="features" tone="ink" labelledBy="features-heading">
        <Container>
          <SectionHead id="features-heading" eyebrow={features.eyebrow} headline={features.headline} intro={features.intro} />
          <Reveal className="mt-(--head-gap)">
            <FactList items={features.items} columns={3} termStyle="strong" />
          </Reveal>
        </Container>
      </Band>
      <Faq id="faq" tone="plaster" eyebrow={faq.eyebrow} headline={faq.headline} intro={faq.intro} link={faq.link} items={faq.items} />
    </>
  );
}
