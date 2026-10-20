import type { Action } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";

/**
 * The closing ask: a rounded accent panel (inset), or a full-bleed accent band (`bleed`), with a soft
 * light wash, a centred serif line and one white pill.
 */
export function AccentPanel({ id, headline, action, bleed = false, note }: { id: string; headline: string; action: Action; bleed?: boolean; note?: string }) {
  const inner = (
    <div className={`on-dark relative isolate overflow-hidden bg-accent text-white ${bleed ? "py-24" : "rounded-panel px-6 py-20 md:py-28"}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 -z-10 size-96 rounded-pill bg-white/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-0 -z-10 size-[28rem] rounded-pill bg-[#8ed4e0]/25 blur-3xl" />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
        <h2 id={`${id}-heading`} className="text-[2rem] leading-[1.15] md:text-[2.75rem]">
          {headline}
        </h2>
        <Button href={action.href} variant="secondary" arrow className="mt-8">
          {action.label}
        </Button>
        {note ? <p className="mt-6 text-caption text-white">{note}</p> : null}
      </div>
    </div>
  );
  if (bleed) {
    return (
      <section id={id} data-band={id} data-tone="ink" aria-labelledby={`${id}-heading`}>
        {inner}
      </section>
    );
  }
  return (
    <Band id={id} tone="plaster" labelledBy={`${id}-heading`}>
      <Container>{inner}</Container>
    </Band>
  );
}
