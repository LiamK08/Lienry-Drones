import type { Action, BandTone, LegacyTone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { SectionHead } from "@/components/ui/SectionHead";
import { SoftwareWindow } from "@/components/software/SoftwareWindow";

export type SoftwareBandProps = {
  /** The band's id; the heading is `${id}-heading`. Keep "software" where scripts/record-software-view.mjs looks for it. */
  id: string;
  tone: BandTone | LegacyTone;
  eyebrow: string;
  headline: string;
  emphasis?: string;
  intro: string;
  link?: Action;
};

/**
 * The working software as a band: the section head (split: the intro and an optional link as its
 * aside), then the window at full grid width at its default (the clean), with its own notes row.
 * The window never reveals. (The home page's stepped version is its own Flow component.)
 */
export function SoftwareBand({ id, tone, eyebrow, headline, emphasis, intro, link }: SoftwareBandProps) {
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead id={`${id}-heading`} eyebrow={eyebrow} headline={headline} emphasis={emphasis} intro={intro} link={link} />
        <div className="mt-(--head-gap)">
          <SoftwareWindow />
        </div>
      </Container>
    </Band>
  );
}
