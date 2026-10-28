import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

// The inset panel's band: "section" rhythm, or "close" (no top padding, 56/80 below) after a band
// that already ends with its own space.
const bandPads = { section: "", close: "pt-0 pb-14 lg:pb-20" } as const;

/**
 * The closing ask: a rounded accent panel (inset, 1328 by 400 from 1024), or a full-bleed band
 * (`bleed`), with a slow drifting light wash, a centred serif line and one glass pill. `dark` is the
 * platform's statement band: near-black with teal glows and a small white pill. `note` sits centred
 * below the panel.
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
  const inner = (
    <div
      className={`on-dark relative isolate overflow-hidden text-white ${dark ? "bg-night" : "bg-accent"} ${
        bleed ? "py-24" : "mx-auto max-w-[83rem] rounded-card px-6 py-14 lg:flex lg:min-h-[25rem] lg:items-center lg:justify-center lg:py-0"
      }`}
    >
      {dark ? (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 top-1/2 -z-10 h-[30rem] w-[48rem] -translate-y-1/2 rounded-pill bg-accent/70 blur-[100px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 -z-10 h-80 w-[40rem] rounded-pill bg-accent-hover/80 blur-[90px]" />
        </>
      ) : (
        <>
          <div aria-hidden="true" className="glow-drift pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-[36rem] -rotate-[20deg] rounded-pill bg-white/20 blur-[60px]" />
          <div aria-hidden="true" className="glow-drift-alt pointer-events-none absolute -bottom-32 right-[-4rem] -z-10 h-96 w-[34rem] -rotate-[20deg] rounded-pill bg-accent-on-dark/30 blur-[60px]" />
          <div aria-hidden="true" className="glow-drift pointer-events-none absolute left-1/3 top-1/2 -z-10 h-56 w-[28rem] -rotate-[20deg] rounded-pill bg-accent-hover/40 blur-[60px] [animation-delay:-7s]" />
        </>
      )}
      <div className={`mx-auto flex w-full flex-col items-center text-center ${bleed ? "max-w-3xl px-5 md:px-4" : ""}`}>
        <h2 id={`${id}-heading`} className={`mx-auto text-h2s ${bleed ? "" : "max-w-[35rem]"}`}>
          {headline}
        </h2>
        <Button href={action.href} variant={dark ? "secondary" : "glass"} size={dark ? "sm" : "md"} arrow={!dark} className={dark ? "mt-6" : "mt-8"}>
          {action.label}
        </Button>
      </div>
    </div>
  );
  if (bleed) {
    return (
      <section id={id} data-band={id} data-tone="ink" aria-labelledby={`${id}-heading`}>
        {inner}
        {note ? <p className="page-x mx-auto mt-6 max-w-none text-center text-[0.875rem] leading-[1.2] text-ink">{note}</p> : null}
      </section>
    );
  }
  return (
    <Band id={id} tone="plaster" pad={band === "section" ? "section" : "none"} labelledBy={`${id}-heading`} className={bandPads[band]}>
      <Container>
        {inner}
        {note ? <p className="mx-auto mt-14 max-w-none text-center text-[0.875rem] leading-[1.2] text-ink lg:mt-20">{note}</p> : null}
      </Container>
    </Band>
  );
}
