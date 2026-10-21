import type { ReactNode } from "react";
import type { Stat } from "@/content/stats";
import type { ImageRef } from "@/lib/types";
import { Icon } from "@/components/blocks/Icon";
import { Band } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Picture } from "@/components/ui/Picture";
import { TextLink } from "@/components/ui/TextLink";

export type SafetyBlockProps = {
  eyebrow: string;
  /** Two lines: the second is the italic. */
  headline: string;
  emphasis: string;
  aside: string;
  tags: readonly string[];
  /** One wide picture, shown full width in a short frame. */
  image: ImageRef;
  columns: readonly { icon: string; title: string; text: string }[];
};

export type FiguresBlockProps = {
  id: string;
  eyebrow: string;
  headline: string;
  emphasis?: string;
  /** The head's right-hand line. */
  aside: string;
  image: ImageRef;
  /** Cited figures from src/content/stats.ts (`pickStats`). */
  items: readonly Stat[];
  /** The line under the columns: `CITED_NOTE`. */
  note: string;
};

// The three columns: a rule between them from 768, softened, and room under the text for the rule.
const column = (i: number) => (i ? "md:border-l md:border-line/50 md:pl-6 md:pb-12" : "md:pr-6 md:pb-12");

/**
 * The paper band of the solution pages (the reference's security slot): 88 above and below from 1024
 * (64 from 768, 56 on phones) on a 1328px rail. The head: the eyebrow and a 40px h2 (976px at most)
 * on the left, the aside bottom-aligned beside it from 768, its text left-aligned. Then one picture,
 * full width and 321px tall from 1024, with the image corners, then three divided columns.
 */
function PaperBand({ id, eyebrow, headline, emphasis, breakBefore, aside, image, children }: { id: string; eyebrow: string; headline: string; emphasis?: string; breakBefore?: boolean; aside: ReactNode; image: ImageRef; children: ReactNode }) {
  return (
    <Band id={id} tone="paper" pad="none" labelledBy={`${id}-heading`} className="py-14 md:py-16 lg:py-[5.5rem]">
      <div className="mx-auto w-full max-w-[83rem]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            <h2 id={`${id}-heading`} className="em-accent max-w-[61rem] text-h1 max-md:text-h2s">
              <Headline text={headline} emphasis={emphasis} breakBefore={breakBefore} />
            </h2>
          </div>
          <div className="md:max-w-[26rem] md:shrink-0 md:text-left">{aside}</div>
        </div>
        <div className="mt-10 md:mt-14 lg:h-[20.0625rem]">
          <Picture
            id={image.id}
            alt={image.alt}
            position={image.position}
            positionMd={image.positionMd}
            positionSm={image.positionSm}
            fit="fill"
            fillFrom="lg"
            frameAspect={1328 / 321}
            aspect="21/9"
            aspectSm="7/6"
            rounded="image"
            sizes="(min-width: 1440px) 1328px, (min-width: 768px) 94vw, 90vw"
          />
        </div>
        {children}
      </div>
    </Band>
  );
}

/**
 * Safety on paper: the head with its accent italic, a short line and three outlined tags (the honest
 * stand-in for badges: Lienry claims no certifications), one wide picture, then three icon columns.
 */
export function SafetyBlock({ eyebrow, headline, emphasis, aside, tags, image, columns }: SafetyBlockProps) {
  return (
    <PaperBand
      id="safety"
      eyebrow={eyebrow}
      headline={headline}
      emphasis={emphasis}
      breakBefore
      image={image}
      aside={
        <>
          <p className="max-w-none text-small leading-[1.2] text-fg">{aside}</p>
          <ul className="mt-2.5 flex flex-wrap gap-2 md:justify-start md:gap-4">
            {tags.map((t) => (
              <li key={t} className="flex h-14 items-center rounded-pill border-2 border-accent/30 bg-white px-3 text-caption font-medium text-accent md:px-4">
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
        {columns.map((c, i) => (
          <li key={c.title} className={column(i)}>
            <span className="flex size-14 items-center justify-center rounded-pill border border-black/5 bg-white text-accent">
              <Icon name={c.icon} className="size-6" />
            </span>
            <p className="mt-[1.375rem] font-display text-[1.25rem] leading-[1.2]">{c.title}</p>
            <p className="mt-2.5 max-w-[24.5rem] text-body leading-[1.3] text-fg-muted">{c.text}</p>
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
export function FiguresBlock({ id, eyebrow, headline, emphasis, aside, image, items, note }: FiguresBlockProps) {
  return (
    <PaperBand id={id} eyebrow={eyebrow} headline={headline} emphasis={emphasis} image={image} aside={<p className="max-w-none text-small leading-[1.2] text-fg">{aside}</p>}>
      <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
        {items.map((stat, i) => (
          <li key={stat.id} className={column(i)}>
            <p className="numeral text-h1 text-fg">{stat.value}</p>
            <p className="mt-3 max-w-[24.5rem] text-body leading-[1.3] text-fg">{stat.label}</p>
            <p className="mt-3 max-w-[24.5rem] text-caption text-fg-muted">
              <sup className="mr-2 text-label">{i + 1}</sup>
              {stat.source}.{" "}
              <TextLink external href={stat.sourceUrl}>
                Source
              </TextLink>
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-10 max-w-[96ch] text-caption text-fg-muted md:mt-0">{note}</p>
    </PaperBand>
  );
}
