import { Container } from "@/components/ui/Section";
import { Picture } from "@/components/ui/Picture";
import type { ReactNode } from "react";

export function PageHero({
  headline,
  lead,
  imageId,
  imageAlt,
  children,
}: {
  /** Kept for the callers; nothing is rendered above the headline. */
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
        <div>
          <h1 className="max-w-[22ch] text-h1">{headline}</h1>
          <p className="mt-6 max-w-[48ch] text-body text-muted">{lead}</p>
          {children ? <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">{children}</div> : null}
        </div>
        {imageId ? (
          <div className="mt-12 md:mt-16">
            <Picture id={imageId} alt={imageAlt ?? headline} aspect="2/1" sizes="(min-width: 1280px) 1280px, 100vw" priority />
          </div>
        ) : null}
      </Container>
    </header>
  );
}
