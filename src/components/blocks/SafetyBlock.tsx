import type { ReactNode } from "react";
import type { Stat } from "@/content/stats";
import type { ImageRef } from "@/lib/types";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { TextLink } from "@/components/ui/TextLink";

export type SafetyBlockProps = {
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** @deprecated Ignored: the italic accent is the page h1's alone. */
  emphasis?: string;
  aside: string;
  /** What is designed in, as small tags (the honest stand-in for badges: Lienry claims no certifications). */
  tags: readonly string[];
  /** One wide picture, shown full width in a short frame. */
  image: ImageRef;
  columns: readonly { icon: string; title: string; text: string }[];
};

export type FiguresBlockProps = {
  id: string;
  /** @deprecated Ignored: the site has no eyebrows (owner, 21 October 2026). */
  eyebrow?: string;
  headline: string;
  /** @deprecated Ignored: the italic accent is the page h1's alone. */
  emphasis?: string;
  /** The head's right-hand line. */
  aside: string;
  image: ImageRef;
  /** Cited figures from src/content/stats.ts (`pickStats`). */
  items: readonly Stat[];
  /** The line under the columns: `CITED_NOTE`. */
  note: string;
};

// The three columns: a third of the 12-column grid each from 768, each over a hairline.
const columns = "mt-12 grid gap-y-10 md:mt-14 md:grid-cols-3 md:gap-x-(--gutter)";
const column = "border-t border-line pt-6";

/**
 * The paper band of the solution pages (the reference's security slot), on the one rail: 88 above and
 * below from 1024 (64 from 768, 56 on phones). The head: the h2 at the inner section step (36) in
 * columns 1-7, the aside in 9-12, bottom-aligned, from 1024. Then one picture, full width and 321px tall
 * from 1024, with the image corners, then three columns.
 */
function PaperBand({ id, headline, aside, image, children }: { id: string; headline: string; aside: ReactNode; image: ImageRef; children: ReactNode }) {
  return (
    <Band id={id} tone="paper" pad="none" labelledBy={`${id}-heading`} className="py-14 md:py-16 lg:py-[5.5rem]">
      <Container>
        <div className="grid gap-y-6 lg:grid-12 lg:items-end lg:gap-y-0">
          <h2 id={`${id}-heading`} className="text-h2s lg:col-span-7">
            {headline}
          </h2>
          <div className="lg:col-span-4 lg:col-start-9">{aside}</div>
        </div>
        <div className="mt-10 md:mt-12 lg:h-[20.0625rem]">
          <Picture
            id={image.id}
            alt={image.alt}
            position={image.position}
            positionMd={image.positionMd}
            positionSm={image.positionSm}
            fit="fill"
            fillFrom="lg"
            frameAspect={1392 / 321}
            aspect="21/9"
            aspectSm="7/6"
            rounded="image"
            sizes="(min-width: 1440px) 1392px, (min-width: 768px) calc(100vw - 3rem), calc(100vw - 2.5rem)"
          />
        </div>
        {children}
      </Container>
    </Band>
  );
}

/**
 * Safety on paper: the head, a short line and what is designed in as small 4px tags (not buttons: they
 * do nothing), one wide picture, then three icon columns.
 */
export function SafetyBlock({ headline, aside, tags, image, columns: items }: SafetyBlockProps) {
  return (
    <PaperBand
      id="safety"
      headline={headline}
      image={image}
      aside={
        <>
          <p className="text-body leading-[1.6] text-fg-muted">{aside}</p>
          <ul aria-label="Designed in" className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t} className="flex h-8 items-center gap-1.5 rounded-hard border border-line bg-white px-2.5 text-caption font-medium text-fg">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3.5 8.25 3 3 6-6.5" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <ul className={columns}>
        {items.map((c) => (
          <li key={c.title} className={column}>
            <span className="flex size-11 items-center justify-center rounded-pill border border-line bg-white text-fg">
              <Icon name={c.icon} className="size-5" />
            </span>
            <p className="mt-5 text-[1.125rem] font-medium leading-[1.4] tracking-[-0.01em] text-fg">{c.title}</p>
            <p className="mt-2 text-body leading-[1.6] text-fg-muted">{c.text}</p>
          </li>
        ))}
      </ul>
    </PaperBand>
  );
}

/**
 * Cited figures in the same paper band (/solar): the head with its aside, the wide picture, then one
 * column per figure: the numeral (Inter light at the h1 step), its label, and the source line with its
 * index and a link to the primary source (new tab). The cited note follows the columns.
 */
export function FiguresBlock({ id, headline, aside, image, items, note }: FiguresBlockProps) {
  return (
    <PaperBand id={id} headline={headline} image={image} aside={<p className="text-body leading-[1.6] text-fg-muted">{aside}</p>}>
      <ul className={columns}>
        {items.map((stat, i) => (
          <li key={stat.id} className={column}>
            <p className="numeral text-h1 text-fg">{stat.value}</p>
            <p className="mt-3 text-body leading-[1.5] text-fg">{stat.label}</p>
            <p className="mt-3 text-caption text-fg-muted">
              <sup className="mr-2 text-label">{i + 1}</sup>
              {stat.source}.{" "}
              <TextLink external href={stat.sourceUrl}>
                Source
              </TextLink>
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-small leading-[1.5] text-fg-muted md:max-w-[68ch]">{note}</p>
    </PaperBand>
  );
}
