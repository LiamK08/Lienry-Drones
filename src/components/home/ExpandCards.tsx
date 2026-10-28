"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { benefits } from "@/content/home";
import { CardPanel, type CardPanelId } from "@/components/home/DemoPanels";
import { Icon } from "@/components/blocks/Icon";
import { Band, Container } from "@/components/ui/Band";
import { Pager, pagerKeys, stepTrack, usePager } from "@/components/ui/Pager";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { useMediaQuery } from "@/lib/hooks";

// The width from which the cards stand in one expanding row, as the reference's desktop does (1200).
const ROW = "(min-width: 75rem)";
/** Moves focus to the close button as a card's demo opens. */
const focusOnMount = (el: HTMLButtonElement | null) => el?.focus();

/**
 * Why Lienry: five tall cards. From 1200 they stand in one row on the rail, a gutter apart: the card under the pointer
 * (or holding focus) widens to about 4.7 times the others over 700ms (the owner's half-speed call), its near-black left side darkens
 * in under the text, its two-line description fades in with the grow, and just after, its coded panel
 * (demo data, DemoPanels) fades in above the title and plays through. Each picture is drawn once at the
 * open card's width, centred, and the card is a window onto it, so widening pans the picture out to its
 * sides instead of scaling it up. While one card is open the others' titles fade.
 *
 * Below 1200 the row is a carousel inside the rail: one card a view on phones, two from 768, with every
 * description shown, a round play button on each card that opens its panel inside the card (Escape or
 * the close button shut it, and moving to another card does too), and under the track the previous and
 * next buttons around a pager of dots that follow the scroll.
 */
export function ExpandCards() {
  // The card open in the row (under the pointer or holding focus), so its panel plays.
  const [open, setOpen] = useState<number | null>(null);
  // The card whose panel is open on the carousel.
  const [shown, setShown] = useState<number | null>(null);
  const row = useMediaQuery(ROW);
  const reduce = useReducedMotion() ?? false;
  const trackRef = useRef<HTMLUListElement>(null);
  const { index, positions } = usePager(trackRef, benefits.cards.length, !row);
  const [current, setCurrent] = useState(index);

  // Moving to another card closes the one shown.
  if (current !== index) {
    setCurrent(index);
    setShown(null);
  }

  const step = (to: number) => stepTrack(trackRef.current, to, reduce);

  return (
    <Band id="why" tone="plaster" labelledBy="benefits-heading">
      <Container>
        <SectionHead id="benefits-heading" layout="center" headline={benefits.headline} intro={benefits.intro} />
      </Container>
      <div className="mx-auto mt-(--head-gap) w-full max-w-grid">
        <ul
          ref={trackRef}
          id="why-track"
          tabIndex={0}
          aria-label={benefits.headline}
          onKeyDown={(e) => {
            if (!row) pagerKeys(e, index, positions, step);
          }}
          className="why-row no-scrollbar @container -mx-2 -my-2 flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto px-2 py-2 min-[75rem]:mx-0 min-[75rem]:my-0 min-[75rem]:gap-(--gutter) min-[75rem]:overflow-visible min-[75rem]:p-0"
        >
          {benefits.cards.map((c, i) => (
            <li
              key={c.title}
              tabIndex={0}
              aria-labelledby={`why-${c.icon}`}
              aria-describedby={`why-${c.icon}-body`}
              onMouseEnter={() => setOpen(i)}
              onMouseLeave={() => setOpen((o) => (o === i ? null : o))}
              onFocus={(e) => e.target === e.currentTarget && e.currentTarget.matches(":focus-visible") && setOpen(i)}
              onBlur={() => setOpen((o) => (o === i ? null : o))}
              onKeyDown={(e) => {
                if (e.key === "Escape" && shown === i) {
                  setShown(null);
                  document.getElementById(`why-${c.icon}-play`)?.focus();
                }
              }}
              // flex-grow is 1 at every width (the carousel's cards are held by their basis and never
              // shrink), so crossing 1200 changes only the basis and never runs the grow transition.
              className="group relative h-[28rem] shrink-0 grow basis-full snap-start overflow-hidden rounded-card bg-night outline-offset-2 md:basis-[calc((100%-1rem)/2)] min-[75rem]:h-[31.25rem] min-[75rem]:min-w-0 min-[75rem]:shrink min-[75rem]:basis-0 min-[75rem]:transition-[flex-grow] min-[75rem]:duration-[700ms] min-[75rem]:ease-[cubic-bezier(0.4,0,0.2,1)] min-[75rem]:hover:grow-[4.7] min-[75rem]:focus-visible:grow-[4.7] motion-reduce:transition-none"
            >
              {/* From 1200: the open card's width (about 54% of the row less its four gutters), centred on the card. */}
              <Picture
                id={c.image.id}
                alt={c.image.alt}
                position={c.image.position}
                fit="fill"
                rounded="none"
                sizes="(min-width: 1200px) 54vw, (min-width: 768px) 50vw, 100vw"
                className="absolute inset-0 min-[75rem]:left-1/2 min-[75rem]:right-auto min-[75rem]:w-[calc((100cqw-4*var(--gutter))*0.54)] min-[75rem]:-translate-x-1/2"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-night)_80%,transparent)_0%,color-mix(in_srgb,var(--color-night)_15%,transparent)_45%,color-mix(in_srgb,var(--color-night)_25%,transparent)_100%)]" />
              {/* From 1200 the open card's left side darkens to near-black under its text and panel. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 hidden bg-[linear-gradient(90deg,var(--color-night)_0%,color-mix(in_srgb,var(--color-night)_85%,transparent)_14%,transparent_58%)] opacity-0 transition-opacity duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none min-[75rem]:block"
              />
              <span className="absolute left-5 top-5 text-white">
                <Icon name={c.icon} className="size-7" />
              </span>
              <ReasonPanel
                id={c.icon as CardPanelId}
                title={c.title}
                row={row}
                open={open === i}
                shown={shown === i}
                onShow={() => setShown(i)}
                onHide={() => {
                  setShown(null);
                  document.getElementById(`why-${c.icon}-play`)?.focus();
                }}
              />
              <div className={`why-text absolute inset-x-5 bottom-5 text-white transition-opacity duration-200 motion-reduce:transition-none ${shown === i ? "opacity-0" : ""}`}>
                <h3 id={`why-${c.icon}`} className="max-w-[14rem] text-h3 min-[75rem]:max-w-[16rem]">
                  {c.title}
                </h3>
                <p
                  id={`why-${c.icon}-body`}
                  className="mt-2 max-w-md text-small text-white/85 min-[75rem]:max-h-0 min-[75rem]:overflow-hidden min-[75rem]:opacity-0 min-[75rem]:transition-[opacity,max-height] min-[75rem]:duration-[300ms,600ms] min-[75rem]:group-hover:delay-75 min-[75rem]:group-hover:max-h-20 min-[75rem]:group-hover:opacity-100 min-[75rem]:group-focus-visible:max-h-20 min-[75rem]:group-focus-visible:opacity-100"
                >
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Below 1200: previous, the pager and next, centred under the track. */}
        <Pager trackId="why-track" index={index} positions={positions} count={benefits.cards.length} go={step} noun="reason" className="mt-6 min-[75rem]:hidden" />
        <p className="mx-auto mt-4 max-w-none text-center text-caption text-muted min-[75rem]:mt-5">{benefits.note}</p>
      </div>
    </Band>
  );
}

/**
 * A reason card's panel. In the row (from 1200) it fades in above the title once the card has opened and
 * plays while it stays open. On the carousel a round play button opens it inside the card, over the
 * dimmed picture, with a close button; it plays while open.
 */
function ReasonPanel({ id, title, row, open, shown, onShow, onHide }: { id: CardPanelId; title: string; row: boolean; open: boolean; shown: boolean; onShow: () => void; onHide: () => void }) {
  const panelId = `why-${id}-panel`;
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute bottom-[7.25rem] left-5 hidden w-[17.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:delay-300 group-focus-visible:opacity-100 group-focus-visible:delay-300 motion-reduce:transition-none motion-reduce:delay-0 min-[75rem]:block"
      >
        <CardPanel id={id} active={row && open} />
      </div>
      {row ? null : (
        <>
          <button
            id={`why-${id}-play`}
            type="button"
            aria-label={`Show the demo: ${title}`}
            aria-expanded={shown}
            aria-controls={panelId}
            // While its demo is open the button is hidden behind it: out of the tab order until it closes.
            tabIndex={shown ? -1 : undefined}
            aria-hidden={shown || undefined}
            onClick={onShow}
            className={`absolute left-1/2 top-[42%] flex size-[3.75rem] min-[75rem]:hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-night/75 text-white transition-[background-color,opacity] duration-200 hover:bg-night/90 motion-reduce:transition-none ${shown ? "pointer-events-none opacity-0" : ""}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 size-6" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
            </svg>
          </button>
          <div id={panelId} hidden={!shown} className="absolute inset-0 flex items-center justify-center bg-night/85 p-5 min-[75rem]:hidden">
            {shown ? (
              <>
                <CardPanel id={id} active />
                <button
                  ref={focusOnMount}
                  type="button"
                  aria-label={`Close the demo: ${title}`}
                  onClick={onHide}
                  className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-pill bg-white text-ink transition-[background-color] duration-200 hover:bg-paper"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <path d="m4 4 8 8m0-8-8 8" />
                  </svg>
                </button>
              </>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
