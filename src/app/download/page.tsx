import type { Metadata } from "next";
import { downloadPage } from "@/content/download";
import { desktopRelease } from "@/lib/download";
import { pageMetadata } from "@/lib/site";
import { DownloadActions } from "@/components/download/DownloadActions";
import { AccentPanel } from "@/components/blocks/AccentPanel";
import { FaqCentered } from "@/components/blocks/FaqCentered";
import { Icon } from "@/components/blocks/Icon";
import { ProductHero } from "@/components/blocks/ProductHero";
import { Band, Container } from "@/components/ui/Band";

const d = downloadPage;
const description = desktopRelease.available ? d.meta.description.live : d.meta.description.soon;

export const metadata: Metadata = pageMetadata("/download", description);

const ICONS = ["dock", "sliders", "repeat"] as const;

/**
 * /download: the product hero (the h1, the lead, Register interest with the availability line under it
 * while the downloads are not live, over the working window in its glass frame); then on paper what the
 * software does, its head on the grid and the three features as one open row of three (an icon, the
 * title and two lines, on a hairline); then the questions, and the closing panel with its two steps.
 */
export default function DownloadPage() {
  const { hero, features, faq, close } = d;
  return (
    <>
      {/* Measured from 360 to 412 in both fonts: the lead holds three lines below 384 and two from there;
          the h1 is one line from 370 and holds two below it, where the web font wraps it. */}
      <ProductHero
        narrowLines={2}
        leadLines={{ narrow: 3, phone: 2, wide: 2 }}
        headline={hero.headline}
        emphasis={hero.emphasis}
        lead={hero.lead}
        actions={<DownloadActions className="flex flex-col items-center" />}
      />
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
      <AccentPanel id="closing" band="close" headline={close.headline} emphasis={close.emphasis} action={close.action} secondary={close.secondary} />
    </>
  );
}
