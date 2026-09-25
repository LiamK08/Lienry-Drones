import type { ReactNode } from "react";
import type { Action, Tone } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";

export type CtaWithProductProps = {
  /** The band's id; the heading is `${id}-heading`. */
  id: string;
  tone: Tone;
  /** Never italic: it is a closing heading. */
  headline: string;
  /** The closing body, at the lead step. */
  body: string;
  primary: Action;
  /** Renders as a tertiary link beside the primary. */
  secondary?: Action;
  /** The product, at full grid width under the ask (the software window on /platform). */
  children: ReactNode;
};

/**
 * The close with the product under the ask. The section head carries the ask: the heading on the
 * left and, in the aside, the body (text-lead), 16, then the primary (lg) with the tertiary link
 * 24 beside it (stacked 16 apart below 768). Then 48 and the children at full grid width. The
 * children never reveal: the software window is not animated in.
 */
export function CtaWithProduct({ id, tone, headline, body, primary, secondary, children }: CtaWithProductProps) {
  const dark = tone === "ink";
  return (
    <Band id={id} tone={tone} labelledBy={`${id}-heading`}>
      <Container>
        <SectionHead
          id={`${id}-heading`}
          headline={headline}
          tone={dark ? "dark" : "light"}
          aside={{
            action: (
              <>
                <p className={`text-lead ${dark ? "text-muted-on-dark" : "text-muted"}`}>{body}</p>
                <div className="mt-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
                  <Button href={primary.href} size="lg" variant={dark ? "inverse" : "primary"}>
                    {primary.label}
                  </Button>
                  {secondary ? (
                    <Button href={secondary.href} variant="tertiary" onDark={dark} arrow>
                      {secondary.label}
                    </Button>
                  ) : null}
                </div>
              </>
            ),
          }}
        />
        <div className="mt-[var(--gap-head)]">{children}</div>
      </Container>
    </Band>
  );
}
