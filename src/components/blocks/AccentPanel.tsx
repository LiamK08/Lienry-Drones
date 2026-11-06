import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

// The inset panel's band: "section" rhythm, or "close" (no top padding, 56/80 below) after a band
// that already ends with its own space.
const bandPads = { section: "", close: "pt-0 pb-14 lg:pb-20" } as const;

/** A one-sentence line has no closing full stop (a question keeps its mark); a line of two sentences keeps
 *  both stops, so its punctuation stays even. */
const noStop = (s: string) => (/[.?!]\s/.test(s) ? s : s.replace(/\.\s*$/, ""));

/**
 * The closing ask, as one of two grounds:
 * - inset (default): the site's compact close. An accent card with the panel corners, about 1000px wide
 *   and centred on the rail (the full rail below that), 312px tall from 1024, with one still, soft light
 *   in its top-left corner. In it, centred: the line at the inner section step (36, white, balanced, two
 *   lines at most from 768, no italic, no closing full stop), then the main ask as the white pill with
 *   its arrow badge and, when given, the lighter `secondary` step beside it as a white text link with its
 *   arrow (`.on-accent`, so its underline thickens on hover). `note` sits centred below the card.
 * - `bleed` + `dark`: the platform's statement band, a full-bleed night band with one still accent glow,
 *   the line and the same actions.
 */
export function AccentPanel({
  id,
  headline,
  action,
  bleed = false,
  dark = false,
  secondary,
  note,
  band = "section",
}: {
  id: string;
  headline: string;
  action: Action;
  /** The lighter second step beside the main ask (usually "Check your building"), as a text link. */
  secondary?: Action;
  bleed?: boolean;
  dark?: boolean;
  note?: string;
  band?: keyof typeof bandPads;
}) {
  const content = (
    <div className="relative mx-auto flex w-full max-w-[40rem] flex-col items-center text-center">
      <h2 id={`${id}-heading`} className="text-h2s text-balance text-white">
        {noStop(headline)}
      </h2>
      <div data-actions="" className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
        <Button href={action.href} variant="glass" arrow>
          {action.label}
        </Button>
        {secondary ? (
          <Button href={secondary.href} variant="tertiary" arrow>
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (bleed) {
    return (
      <Band id={id} tone={dark ? "night" : "ink"} labelledBy={`${id}-heading`} className="isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[22rem] w-[min(56rem,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-accent/45 blur-[110px]" />
        <Container>{content}</Container>
      </Band>
    );
  }
  return (
    <Band id={id} tone="plaster" pad={band === "section" ? "section" : "none"} labelledBy={`${id}-heading`} className={bandPads[band]}>
      <Container>
        <div
          className={`on-dark relative isolate mx-auto max-w-[62.5rem] overflow-hidden rounded-panel px-6 py-14 md:px-10 lg:flex lg:min-h-[19.5rem] lg:items-center lg:justify-center ${dark ? "bg-night" : "on-accent bg-accent"}`}
        >
          {/* Inside the card's own box (its blur spills over the edges, clipped): a box past them would sit
              over the band above it, and axe could no longer read the contrast of the text there. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 -z-10 h-48 w-96 max-w-full rounded-pill bg-white/15 blur-[90px]" />
          {content}
        </div>
        {note ? <p className="mx-auto mt-10 text-center text-small leading-[1.5] text-fg-muted lg:mt-12">{note}</p> : null}
      </Container>
    </Band>
  );
}
