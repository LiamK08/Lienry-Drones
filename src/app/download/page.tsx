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
 * /download: a centred hero (the h1, the lead, Register interest with the availability line under it
 * while the downloads are not live) over the working window in its frame; then on paper what the
 * software does, its head on the grid and the three features as one open row of three (an icon, the
 * title and two lines, on a hairline); then the questions.
 */
export default function DownloadPage() {
  const { hero, features, faq } = d;
  return (
    <>
      <Band id="hero" as="header" tone="plaster" pad="hero" labelledBy="download-heading" className="overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 h-[32rem] w-[56rem] max-w-full -translate-x-1/2 rounded-pill bg-accent-on-dark/30 blur-3xl" />
        <Container className="relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 id="download-heading" className="em-accent text-h1">
              <Headline text={hero.headline} emphasis={hero.emphasis} />
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lead leading-[1.55] text-fg-muted">{hero.lead}</p>
            <DownloadActions className="mt-8 flex flex-col items-center" />
          </div>
          <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-card border border-line bg-white p-2">
            <SoftwareWindow priority frame="inset" />
          </div>
        </Container>
      </Band>
      <Band id="features" tone="paper" labelledBy="features-heading">
        <Container>
          {/* The intro takes the third feature's columns, so the head and the row share their edges. */}
          <div className="grid gap-4 lg:grid-12 lg:items-end">
            <h2 id="features-heading" className="text-h2s lg:col-span-8">
              {features.headline}
            </h2>
            <p className="max-w-[26rem] text-body leading-[1.6] text-fg-muted lg:col-span-4 lg:col-start-9">{features.intro}</p>
          </div>
          <ul className="mt-12 grid gap-10 lg:mt-16 lg:grid-12 lg:gap-y-0">
            {features.items.map((f, i) => (
              <li key={f.term} className="border-t border-line pt-6 lg:col-span-4">
                <span className="flex size-10 items-center justify-center rounded-pill border border-line bg-white text-accent">
                  <Icon name={ICONS[i]} className="size-5" />
                </span>
                <h3 className="mt-6 text-h3">{f.term}</h3>
                <p className="mt-3 max-w-[26rem] text-body leading-[1.6] text-fg-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Band>
      <FaqCentered items={faq.items} />
    </>
  );
}
