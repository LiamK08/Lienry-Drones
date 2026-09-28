import type { Metadata } from "next";
import { downloadPage } from "@/content/pages";
import { desktopRelease } from "@/lib/download";
import { pageMetadata } from "@/lib/site";
import { DownloadActions } from "@/components/download/DownloadActions";
import { SpecBand } from "@/components/platform/SpecBand";
import { Faq } from "@/components/sections/Faq";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { FactList } from "@/components/ui/FactList";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

const d = downloadPage;
const description = desktopRelease.available ? d.meta.description.live : d.meta.description.soon;

export const metadata: Metadata = pageMetadata("/download", description);

// /download: the ask with the product under it, as a hero. The H1 with the lead and the download
// buttons as its aside (the /company statement's split), then 48 and the coded software window at
// full grid width (the /platform close), so the product is in the first screen and no image of the
// interface is needed. Then what the software does as a three-column strip (the /commercial software
// strip), the system requirements on the page's one ink band (SpecBand), and the questions.
// Tones run raised, plaster, ink, raised, then the sunken footer.
export default function DownloadPage() {
  return (
    <>
      {/* 1. Hero: first screen, so nothing in it waits for a reveal. */}
      <Band id="hero" as="header" tone="raised" pad="page" labelledBy="download-heading">
        <Container>
          <SectionHead
            id="download-heading"
            as="h1"
            size="h1"
            headline={d.headline}
            emphasis={d.emphasis}
            breakBefore
            reveal={false}
            aside={{
              action: (
                <>
                  <p className="text-lead text-muted">{d.lead}</p>
                  <DownloadActions className="mt-6" />
                </>
              ),
            }}
          />
          <div className="mt-[var(--gap-head)]">
            <SoftwareWindow tone="raised" />
          </div>
        </Container>
      </Band>

      {/* 2. What the software does. */}
      <Band id="features" tone="plaster" labelledBy="features-heading">
        <Container>
          <SectionHead id="features-heading" headline={d.features.headline} aside={{ intro: d.features.intro }} />
          <Reveal className="mt-[var(--gap-head)]">
            <FactList items={d.features.items} columns={3} termStyle="strong" />
          </Reveal>
        </Container>
      </Band>

      {/* 3. System requirements, with what signing in needs. */}
      <SpecBand id="requirements" headline={d.requirements.headline} intro={d.requirements.intro} rows={d.requirements.rows} />

      {/* 4. Questions. */}
      <Faq id="faq" tone="raised" headline={d.faq.headline} intro={d.faq.intro} link={d.faq.link} items={d.faq.items} />
    </>
  );
}
