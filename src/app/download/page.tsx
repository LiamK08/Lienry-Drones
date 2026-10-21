import type { Metadata } from "next";
import { downloadPage } from "@/content/download";
import { desktopRelease } from "@/lib/download";
import { pageMetadata } from "@/lib/site";
import { DownloadActions } from "@/components/download/DownloadActions";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { Icon } from "@/components/blocks/Icon";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";

const d = downloadPage;
const description = desktopRelease.available ? d.meta.description.live : d.meta.description.soon;

export const metadata: Metadata = pageMetadata("/download", description);

const ICONS = ["dock", "sliders", "repeat"] as const;

/**
 * /download: a centred hero with the download buttons over the framed working window, three feature
 * cards on paper, and the questions.
 */
export default function DownloadPage() {
  const { hero, features, faq } = d;
  return (
    <>
      <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy="download-heading" className="overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-pill bg-accent/10 blur-3xl" />
        <Container className="relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 id="download-heading" className="em-accent text-h1">
              <Headline text={hero.headline} emphasis={hero.emphasis} />
            </h1>
            <p className="mt-5 max-w-xl text-body text-fg-muted md:text-lead">{hero.lead}</p>
            <DownloadActions className="mt-8 flex flex-col items-center [&_div]:items-center [&_div]:justify-center" />
          </div>
          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-card border border-line bg-white p-2 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.3)]">
            <SoftwareWindow priority frame="inset" />
          </div>
        </Container>
      </Band>
      <Band id="features" tone="paper" labelledBy="features-heading">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 id="features-heading" className="text-h2s">
              {features.headline}
            </h2>
            <p className="mt-4 text-body text-fg-muted">{features.intro}</p>
          </div>
          <ul className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
            {features.items.map((f, i) => (
              <li key={f.term} className="rounded-card border border-line bg-white p-8">
                <span className="flex size-12 items-center justify-center rounded-pill bg-tint text-accent">
                  <Icon name={ICONS[i]} className="size-6" />
                </span>
                <p className="mt-6 font-display text-[1.5rem]">{f.term}</p>
                <p className="mt-2 text-small text-fg-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Band>
      <FaqCentered items={faq.items} />
    </>
  );
}
