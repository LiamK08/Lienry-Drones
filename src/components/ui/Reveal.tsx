"use client";

import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { settle } from "@/lib/motion";

/** Any `data-*` attribute, forwarded to the rendered element (e.g. `data-section-head`, `data-col`). */
export type DataAttributes = { [key: `data-${string}`]: string | undefined };

/**
 * Where a reveal stands.
 * - "shown": the server render, and anything on screen or above it when the page hydrates. It never
 *   animates, so nothing in a first screen ever waits for JavaScript or a reveal.
 * - "hidden": wholly below the fold at hydration. It is hidden there, out of sight, until it scrolls in.
 * - "visible": it entered the viewport (less its bottom 10%) and rises in once.
 * Without JavaScript, and under reduced motion, everything stays "shown".
 */
export type RevealPhase = "shown" | "hidden" | "visible";

/** The reveal gate shared by Reveal, RevealList and SnapTrack's list. IntersectionObserver only. */
export function useRevealPhase<T extends Element>(): [RefObject<T | null>, RevealPhase] {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>("shown");
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let first = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (first) {
          first = false;
          if (!e.isIntersecting && e.boundingClientRect.top >= window.innerHeight) setPhase("hidden");
          else io.disconnect();
          return;
        }
        if (e.isIntersecting) {
          setPhase("visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  return [ref, phase];
}

/** The motion label for a phase: "shown" renders at the visible values, so it never animates. */
export const revealLabel = (phase: RevealPhase) => (phase === "hidden" ? "hidden" : "visible");

/**
 * The transform an element keeps once it has been hidden: `translateY(0px)` at rest instead of
 * Motion's `none`. A transform makes the element a containing block, so ending the rise on `none`
 * would hand its positioned children back to an outer box and cost a layout per element (check 39
 * allows 2 per reveal; a list of three paid three). Holding the transform keeps the rise to opacity
 * and transform alone. Anything "shown" (the server render, a first screen) keeps Motion's default,
 * so its markup and box never change.
 */
const holdTransform = (_: unknown, generated: string) => generated || "translateY(0px)";
export const restTransform = (phase: RevealPhase) => (phase === "shown" ? undefined : holdTransform);

/** The phase of the nearest RevealList or SnapTrack, which its RevealItems follow. */
export const RevealListPhase = createContext<RevealPhase>("shown");

const pick = (props: Record<string, unknown>): DataAttributes =>
  Object.fromEntries(Object.entries(props).filter(([k]) => k.startsWith("data-"))) as DataAttributes;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "figure" | "article";
  y?: number;
} & DataAttributes;

/**
 * Opacity and a 12px rise over 640ms (ease-settle), once, as the element enters the viewport.
 * Only what is below the fold when the page hydrates is ever hidden (see RevealPhase).
 */
export function Reveal({ children, delay = 0, className = "", as = "div", y = 12, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const [ref, phase] = useRevealPhase<HTMLElement>();
  // One element type for the ref: every `as` option is an HTMLElement, and the ref is only observed.
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement | null>}
      className={className}
      {...pick(rest)}
      data-reveal=""
      initial={false}
      animate={revealLabel(phase)}
      transformTemplate={restTransform(phase)}
      variants={{
        hidden: { opacity: 0, y, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.64, ease: settle, delay } },
      }}
    >
      {children}
    </Tag>
  );
}

/** A list whose RevealItems rise in with a 60ms stagger as the list enters the viewport. */
export function RevealList({ children, className = "", stagger = 0.06, ...rest }: { children: ReactNode; className?: string; stagger?: number } & DataAttributes) {
  const reduce = useReducedMotion();
  const [ref, phase] = useRevealPhase<HTMLUListElement>();
  return (
    <motion.ul
      ref={ref}
      className={className}
      {...pick(rest)}
      initial={false}
      animate={revealLabel(phase)}
      variants={revealListVariants(reduce ? 0 : stagger)}
    >
      <RevealListPhase.Provider value={phase}>{children}</RevealListPhase.Provider>
    </motion.ul>
  );
}

/** The list variants: nothing on the list itself, the stagger for its items. */
export const revealListVariants = (stagger: number) => ({ hidden: {}, visible: { transition: { staggerChildren: stagger } } });

/** One item of a RevealList (or of SnapTrack). It follows its list; on its own it simply renders. */
export function RevealItem({ children, id, className = "", ...rest }: { children: ReactNode; id?: string; className?: string } & DataAttributes) {
  const reduce = useReducedMotion();
  const phase = useContext(RevealListPhase);
  return (
    <motion.li
      id={id}
      className={className}
      {...pick(rest)}
      data-reveal=""
      transformTemplate={restTransform(phase)}
      variants={{
        hidden: { opacity: 0, y: 12, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.64, ease: settle } },
      }}
    >
      {children}
    </motion.li>
  );
}
