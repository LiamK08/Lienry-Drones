import type { FaqItem } from "@/components/sections/Faq";
import type { Action } from "@/lib/types";
import { FaqRows } from "@/components/blocks/FaqRows";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

// "section" is the band rhythm; "page" is the solution pages' compact rhythm (the owner asked for it
// to stay compact), Band's compact pad. "tight" is retired into "section".
const pads = { section: "section", tight: "section", page: "compact" } as const;

/** A one-sentence heading has no closing full stop (a question keeps its mark); two sentences keep both. */
const noStop = (s: string) => (/[.?!]\s/.test(s) ? s : s.replace(/\.\s*$/, ""));

/**
 * The questions, split: from 1024 the head holds columns 1 to 4 and stays in view under the bar while
 * the rows scroll past in columns 6 to 12; below 1024 the head sits above the rows, 32px over them, and
 * never beside them. The head is the heading at the inner section step (36, left-aligned, no italic: the
 * accent italic is the page h1's alone), then the optional `intro` line and `link`. Nothing is centred.
 * The name keeps its history: the questions were once a centred column.
 */
export function FaqCentered({
  id = "faq",
  headline = "Frequently asked questions",
  items,
  tone = "plaster",
  tight = false,
  spacing,
  intro,
  link,
}: {
  id?: string;
  /** Default "Frequently asked questions". */
  headline?: string;
  items: readonly FaqItem[];
  tone?: "plaster" | "paper";
  /** @deprecated Use spacing="section". */
  tight?: boolean;
  spacing?: keyof typeof pads;
  /** @deprecated Ignored: every FAQ is the split. */
  narrow?: boolean;
  /** A short line under the heading. */
  intro?: string;
  /** A link under the heading (or its line), e.g. to the page that answers more. */
  link?: Action;
}) {
  const space = spacing ?? (tight ? "tight" : "section");
  return (
    <Band id={id} tone={tone} pad={pads[space]} labelledBy={`${id}-heading`}>
      <Container>
        <div className="lg:grid-12">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:col-span-4 lg:self-start">
            <Reveal animate y={10}>
              <h2 id={`${id}-heading`} className="text-h2s">
                {noStop(headline)}
              </h2>
              {intro ? <p className="mt-4 text-body leading-[1.6] text-fg-muted">{intro}</p> : null}
              {link ? (
                <div className="mt-6">
                  <Button href={link.href} variant="tertiary" arrow>
                    {link.label}
                  </Button>
                </div>
              ) : null}
            </Reveal>
          </div>
          <div className="mt-8 lg:col-span-7 lg:col-start-6 lg:mt-0">
            <FaqRows id={id} items={items} />
          </div>
        </div>
      </Container>
    </Band>
  );
}
