import type { ImageRef } from "@/lib/types";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Headline } from "@/components/ui/SectionHead";
import { Picture } from "@/components/ui/Picture";

export type SafetyBlockProps = {
  eyebrow: string;
  /** Two lines: the second is the italic. */
  headline: string;
  emphasis: string;
  aside: string;
  tags: readonly string[];
  /** Two pictures: the narrow one, then the wide one. */
  images: readonly ImageRef[];
  columns: readonly { icon: string; title: string; text: string }[];
};

/**
 * Safety on paper: the head left with its accent italic, a short line and three outlined tags right,
 * a wide strip of two rounded pictures (one narrow, one wide), then three icon columns.
 */
export function SafetyBlock({ eyebrow, headline, emphasis, aside, tags, images, columns }: SafetyBlockProps) {
  return (
    <Band id="safety" tone="paper" labelledBy="safety-heading">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="safety-heading" className="em-accent max-w-[14ch] text-h2">
              <Headline text={headline} emphasis={emphasis} breakBefore />
            </h2>
          </div>
          <div className="md:text-right">
            <p className="text-small text-fg">{aside}</p>
            <ul className="mt-4 flex flex-wrap gap-2 md:justify-end">
              {tags.map((t) => (
                <li key={t} className="flex h-14 items-center rounded-pill border-2 border-accent/30 bg-white px-4 text-caption font-medium text-accent">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-[0.42fr_1fr]">
          <Picture id={images[0].id} alt={images[0].alt} position={images[0].position} aspect="3/4" aspectSm="4/3" rounded="card" sizes="(min-width: 768px) 30vw, 100vw" className="h-full [&>div]:h-full" />
          <Picture id={images[1].id} alt={images[1].alt} position={images[1].position} aspect="16/9" aspectSm="4/3" rounded="card" sizes="(min-width: 768px) 70vw, 100vw" />
        </div>
        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
          {columns.map((c, i) => (
            <li key={c.title} className={i ? "md:border-l md:border-line md:pl-8" : "md:pr-8"}>
              <span className="flex size-12 items-center justify-center rounded-pill border border-line bg-white text-accent">
                <Icon name={c.icon} className="size-6" />
              </span>
              <p className="mt-6 font-display text-[1.5rem]">{c.title}</p>
              <p className="mt-2 text-small text-fg-muted">{c.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Band>
  );
}
