"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useCallback, useId, useRef, useState } from "react";
import { systemExplainer } from "@/content/home";
import { useMediaQuery } from "@/lib/hooks";
import { Picture } from "@/components/ui/Picture";
import { Eyebrow } from "@/components/ui/Section";
import { instrument } from "@/lib/motion";

const tabs = systemExplainer.tabs;

function TabList({ active, onSelect, idBase }: { active: number; onSelect: (i: number) => void; idBase: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? i + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = (next + tabs.length) % tabs.length;
    onSelect(j);
    refs.current[j]?.focus();
  };
  return (
    <div role="tablist" aria-label="Parts of the Lienry system" aria-orientation="vertical" className="flex gap-2 overflow-x-auto no-scrollbar md:flex-col md:gap-1">
      {tabs.map((t, i) => {
        const selected = i === active;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${idBase}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`group flex shrink-0 items-center gap-3 rounded-chip border px-3 py-2 text-left text-small transition-colors duration-200 md:border-transparent md:px-0 md:py-2.5 ${
              selected ? "border-glass bg-glass-tint text-ink md:bg-transparent" : "border-hairline text-muted hover:text-ink md:hover:bg-transparent"
            }`}
          >
            <span className={`readout hidden w-6 text-[0.6875rem] md:inline ${selected ? "text-glass" : "text-muted"}`}>0{i + 1}</span>
            <span className={`font-medium ${selected ? "md:text-ink" : ""}`}>{t.tab}</span>
            <span className={`ml-auto hidden h-px transition-all duration-300 md:block ${selected ? "w-10 bg-glass" : "w-4 bg-hairline"}`} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function Panel({ active, idBase }: { active: number; idBase: string }) {
  const reduce = useReducedMotion();
  const t = tabs[active];
  return (
    <div className="grid gap-6">
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={t.id}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: instrument }}
          >
            <Picture id={t.imageId} alt={`${t.tab}: ${t.title}`} aspect="4/3" sizes="(min-width: 768px) 55vw, 100vw" />
          </motion.div>
        </AnimatePresence>
        <span className="readout absolute right-3 top-3 z-10 rounded-chip bg-raised/90 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.08em] text-ink">
          {t.readout}
        </span>
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${idBase}-panel-${tab.id}`}
          aria-labelledby={`${idBase}-tab-${tab.id}`}
          hidden={i !== active}
          className="max-w-prose"
        >
          <h3 className="text-h3">{tab.title}</h3>
          <p className="mt-3 text-body text-muted">{tab.body}</p>
        </div>
      ))}
    </div>
  );
}

export function SystemExplainer() {
  const idBase = useId();
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const pinned = desktop && !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    const i = Math.min(tabs.length - 1, Math.max(0, Math.floor(v * tabs.length)));
    setActive((prev) => (prev === i ? prev : i));
  });

  const select = useCallback(
    (i: number) => {
      setActive(i);
      if (!pinned || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const track = rect.height - window.innerHeight;
      const target = top + (track * (i + 0.5)) / tabs.length;
      if (lenis) lenis.scrollTo(target, { duration: 0.9 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    },
    [pinned, lenis],
  );

  return (
    <section id="system" aria-labelledby="system-heading" className="bg-plaster">
      <div ref={ref} className={pinned ? "relative" : ""} style={pinned ? { height: `calc(${tabs.length} * 100svh)` } : undefined}>
        <div className={`page-x mx-auto max-w-grid ${pinned ? "sticky top-0 flex h-[100svh] items-center py-[var(--nav-h)]" : "section-y"}`}>
          <div className="grid w-full gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
              <Eyebrow className="mb-4">{systemExplainer.eyebrow}</Eyebrow>
              <h2 id="system-heading" className="text-h2">
                {systemExplainer.headline}
              </h2>
              <p className="mt-4 max-w-[44ch] text-body text-muted">{systemExplainer.intro}</p>
              <div className="mt-8 md:mt-10">
                <TabList active={active} onSelect={select} idBase={idBase} />
              </div>
            </div>
            <div className="md:col-span-7">
              <Panel active={active} idBase={idBase} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
