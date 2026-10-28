import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

// The inset panel's band: "section" rhythm, or "close" (no top padding, 56/80 below) after a band
// that already ends with its own space.
const bandPads = { section: "", close: "pt-0 pb-14 lg:pb-20" } as const;

/**
 * The closing ask, as one of two grounds:
 * - inset (default): an accent panel on the rail with the panel corners (400px tall from 1024), one
 *   still, soft light in its top-left corner, a centred serif line and one solid white pill with its
 *   arrow badge. `note` sits centred below the panel.
 * - `bleed` + `dark`: the platform's statement band, a full-bleed night band with one still accent glow,
 *   the line and the same white pill.
 */
export function AccentPanel({
  id,
  headline,
  action,
  bleed = false,
  dark = false,
  note,
  band = "section",
}: {
  id: string;
  headline: string;
  action: Action;
  bleed?: boolean;
  dark?: boolean;
  note?: string;
  band?: keyof typeof bandPads;
}) {
  const content = (
    <div className="relative mx-auto flex w-full max-w-[40rem] flex-col items-center text-center">
      <h2 id={`${id}-heading`} className="text-h2s text-white">
        {headline}
      </h2>
      <Button href={action.href} variant="secondary" arrow className="mt-8">
        {action.label}
      </Button>
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
        <div className={`on-dark relative isolate overflow-hidden rounded-panel px-6 py-16 md:px-10 lg:flex lg:min-h-[25rem] lg:items-center lg:justify-center lg:py-0 ${dark ? "bg-night" : "bg-accent"}`}>
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-40 -z-10 h-96 w-[40rem] rounded-pill bg-white/15 blur-[90px]" />
          {content}
        </div>
        {note ? <p className="mx-auto mt-10 text-center text-small leading-[1.5] text-fg-muted lg:mt-12">{note}</p> : null}
      </Container>
    </Band>
  );
}
