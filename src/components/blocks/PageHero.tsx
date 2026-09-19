import { Container, Rule } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { ReactNode } from "react";

export function PageHero({
  headline,
  lead,
  imageId,
  imageAlt,
  children,
}: {
  /** Kept for the callers; the page header shows a short rule instead of a label. */
  eyebrow?: string;
  headline: string;
  lead: string;
  imageId?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-x bg-plaster pt-[calc(var(--nav-h)+3rem)] md:pt-[calc(var(--nav-h)+5rem)]">
      <Container>
        <Reveal>
          <Rule className="mb-6" />
          <h1 className="max-w-[18ch] text-display">{headline}</h1>
          <p className="mt-6 max-w-prose text-lead text-muted">{lead}</p>
          {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
        </Reveal>
        {imageId ? (
          <Reveal className="mt-12 md:mt-16" delay={0.1}>
            <Picture id={imageId} alt={imageAlt ?? headline} aspect="21/9" sizes="(min-width: 1280px) 1280px, 100vw" priority />
          </Reveal>
        ) : null}
      </Container>
    </header>
  );
}
