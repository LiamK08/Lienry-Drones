"use client";

import { useEffect, useRef, useState, type CSSProperties, type FocusEvent } from "react";
import { how } from "@/content/home";
import { Band, Container } from "@/components/ui/Band";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";
import { useOnScreen, usePrefersReducedMotion } from "@/lib/hooks";
import { StagePanel, type StagePanelId } from "@/components/home/DemoPanels";

const STEP_MS = 6000;
/** How long "Clean complete" shows before the stage moves on, once the visitor has washed the map. */
const DONE_MS = 2000;

/**
 * How it works: five tabs over one stage. Each tab shows its number and name over a 3px rule that fills
 * while its step is shown, and each finished step's rule stays full until the clean starts again, so
 * the row reads as one progress bar; a soft marker glides to the chosen tab. After six seconds the next
 * step takes over, looping, while the band is on screen. Picking a tab shows it and restarts the timer
 * from there. The timer holds while the pointer is on the stage or the keyboard is in the steps (WCAG
 * 2.2.2), and under reduced motion nothing advances on its own. Once the visitor washes the map on step
 * 03, the stage stays there until they finish, pick a step or the band leaves the screen (WCAG 2.2.1).
 *
 * The stage: the step's picture with its title and line on a scrim at its foot, and beside it (from 1024,
 * on the night the picture fades into; below the picture on smaller screens) the step's coded panel
 * playing in demo data: one demo building followed through the five steps on the software's facade map.
 * On step 03 the visitor can wash the map themselves; when they finish, the stage moves on to the check.
 */
export function StepTimer() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  // The step fading out, so its panel keeps its map through the crossfade.
  const [previous, setPrevious] = useState<number | null>(null);
  // The step whose panel the visitor finished (the clean), until another step is shown or they wash on.
  const [finished, setFinished] = useState<number | null>(null);
  // The visitor is washing the clean's map: it holds the stage until another step is shown, a tab is
  // picked or the band leaves the screen.
  const [washing, setWashing] = useState(false);
  const [shownStep, setShownStep] = useState(active);
  if (shownStep !== active) {
    setPrevious(shownStep);
    setShownStep(active);
    setFinished(null);
    setWashing(false);
  }
  // Read as a store with a false server snapshot, so hydration matches the server's markup.
  const reduce = usePrefersReducedMotion();
  const [ref, inView] = useOnScreen<HTMLDivElement>();
  if (washing && !inView) setWashing(false);
  const running = inView && !reduce;
  const [pointerIn, setPointerIn] = useState(false);
  const [keyboardIn, setKeyboardIn] = useState(false);
  const ticking = running && !pointerIn && !keyboardIn && !washing;

  // The step's time left: a hold pauses it and the step carries on from there; leaving the screen,
  // or a new step, starts it whole. (This reset runs before the timer below in the same commit.)
  const left = useRef(STEP_MS);
  useEffect(() => {
    left.current = STEP_MS;
  }, [active, cycle, inView]);
  useEffect(() => {
    if (!ticking) return;
    const start = performance.now();
    const t = window.setTimeout(() => setActive((i) => (i + 1) % how.steps.length), left.current);
    return () => {
      window.clearTimeout(t);
      left.current = Math.max(0, left.current - (performance.now() - start));
    };
  }, [ticking, active, cycle]);

  // The visitor washed the whole map on step 03: the check follows, unless the keyboard is still in it
  // or they wash on (a reset, a step back) first.
  useEffect(() => {
    if (finished !== active || !running || keyboardIn) return;
    const t = window.setTimeout(() => setActive((i) => (i + 1) % how.steps.length), DONE_MS);
    return () => window.clearTimeout(t);
  }, [finished, active, running, keyboardIn]);

  const pick = (i: number) => {
    setActive(i);
    setCycle((c) => c + 1);
    setWashing(false);
  };
  // The keyboard in the steps (focus there, and the last input a key) holds the timer; a click's focus does not.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => setKeyboardIn(e.target.matches(":focus-visible"));
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardIn(false);
  };
  const keys = {
    onFocus,
    onBlur,
    onKeyDown: () => setKeyboardIn(true),
    onPointerDown: () => setKeyboardIn(false),
  };

  return (
    <Band id="how" tone="plaster" labelledBy="how-heading">
      <Container>
        <SectionHead id="how-heading" layout="center" headline={how.headline} intro={how.intro} />
        <div ref={ref} {...keys} className="mt-(--head-gap)">
          <div role="tablist" aria-label={how.label} className="relative grid grid-cols-5 gap-(--tab-gap) [--tab-gap:0.25rem] md:[--tab-gap:1.25rem]" style={{ "--i": active } as CSSProperties}>
            {/* The chosen tab's marker: it glides to the next choice in 250ms (a jump under reduced motion). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-[calc((100%-4*var(--tab-gap))/5)] translate-x-[calc(var(--i)*(100%+var(--tab-gap)))] rounded-[0.625rem] bg-paper transition-[translate] duration-[250ms] ease-settle motion-reduce:transition-none forced-colors:border-2 forced-colors:border-[Highlight] md:rounded-card"
            />
            {how.steps.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`how-tab-${s.id}`}
                  aria-selected={on}
                  aria-controls="how-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => {
                    const last = how.steps.length - 1;
                    const to = e.key === "ArrowRight" ? (i + 1) % how.steps.length : e.key === "ArrowLeft" ? (i + last) % how.steps.length : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
                    if (to < 0) return;
                    e.preventDefault();
                    pick(to);
                    document.getElementById(`how-tab-${how.steps[to].id}`)?.focus();
                  }}
                  className="group/tab relative min-w-0 rounded-[0.625rem] px-2 py-3 text-left max-[359px]:px-1 md:rounded-card md:p-4"
                >
                  <span aria-hidden="true" className="relative block h-[3px] overflow-hidden rounded-pill bg-line">
                    <span
                      key={i < active ? `${s.id}-done` : `${s.id}-${on ? cycle : "off"}-${on ? active : ""}`}
                      className={`absolute inset-y-0 left-0 rounded-pill bg-accent ${i < active || (on && reduce) ? "w-full" : on && inView ? "animate-[fill_6s_linear_forwards]" : "w-0"}`}
                      style={on && !reduce ? { animationPlayState: ticking ? "running" : "paused" } : undefined}
                    />
                  </span>
                  <span className="mt-3 block text-caption leading-none tabular-nums text-muted md:mt-4 md:text-small md:leading-none">{s.n}</span>
                  {/* On phones the five tabs share one row and show the short name, from 768 the full one: each
                      tab is named by what it shows (WCAG 2.5.3). */}
                  <span className={`mt-1.5 block truncate text-small transition-colors duration-200 md:hidden ${on ? "font-medium text-ink" : "text-muted group-hover/tab:text-ink"}`}>{s.short}</span>
                  <span className={`hidden md:mt-2 md:block md:truncate md:text-body md:leading-tight md:transition-colors md:duration-200 ${on ? "md:font-medium md:text-ink" : "md:text-muted md:group-hover/tab:text-ink"}`}>{s.tab}</span>
                </button>
              );
            })}
          </div>
          <div
            id="how-panel"
            role="tabpanel"
            aria-labelledby={`how-tab-${how.steps[active].id}`}
            onPointerEnter={() => setPointerIn(true)}
            onPointerLeave={() => setPointerIn(false)}
            className="relative mt-4 overflow-hidden rounded-card bg-night md:mt-6 lg:grid lg:h-[30rem] lg:grid-cols-12 lg:gap-x-6 xl:h-[34rem]"
          >
            {/* From 1024 the picture takes seven columns and fades into the night, where the step's panel stands. */}
            <div className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:[-webkit-mask-image:linear-gradient(90deg,#000_70%,transparent)] lg:[mask-image:linear-gradient(90deg,#000_70%,transparent)]">
              {how.steps.map((s, i) => (
                <div key={s.id} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-700 ease-instrument motion-reduce:transition-none ${i === active ? "opacity-100" : "opacity-0"}`}>
                  <Picture id={s.image.id} alt={i === active ? s.image.alt : ""} position={s.image.position} fit="fill" frameAspect={1.5} rounded="none" sizes="(min-width: 1440px) 820px, (min-width: 1024px) 58vw, 100vw" className="absolute inset-0" />
                </div>
              ))}
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-night)_75%,transparent)_0%,transparent_55%)]" />
              {/* On phones a title can wrap high into the picture's bright upper half: the caption carries
                  its own scrim there, from its foot to above its first line. */}
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-night)_60%,transparent),color-mix(in_srgb,var(--color-night)_55%,transparent)_70%,transparent)] px-6 pb-6 pt-10 text-white md:inset-x-8 md:bottom-8 md:bg-none md:p-0 lg:right-auto lg:max-w-[26rem]">
                <p className="font-display text-[1.5rem] leading-tight">{how.steps[active].title}</p>
                <p className="mt-1 text-small leading-normal text-white/85">{how.steps[active].body}</p>
              </div>
            </div>
            {/* Each step's coded panel (demo data), centred on the stage's solid night half, playing while
                its step is shown on screen. The steps not shown are hidden and inert, so nothing in them
                can be reached while they are faded out. */}
            <div className="grid grid-cols-[minmax(0,1fr)] justify-items-center p-5 md:p-8 lg:col-span-5 lg:self-center lg:p-0">
              {how.steps.map((s, i) => {
                const on = i === active;
                const onWash = (done: boolean) => {
                  setWashing(true);
                  setFinished(done ? i : null);
                };
                return (
                  <div key={s.id} aria-hidden={!on} inert={!on} className={`flex w-full max-w-[21.25rem] justify-center transition-opacity duration-500 ease-instrument [grid-area:1/1] motion-reduce:transition-none md:max-w-[26rem] lg:max-w-[21.25rem] xl:max-w-[26rem] ${on ? "opacity-100" : "opacity-0"}`}>
                    <StagePanel id={s.id as StagePanelId} active={on && inView} map={on || i === previous} onWash={s.id === "clean" ? onWash : undefined} />
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 max-w-none text-caption text-muted">{how.note}</p>
        </div>
      </Container>
    </Band>
  );
}
