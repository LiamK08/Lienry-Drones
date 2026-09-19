"use client";

import { systemExplainer } from "@/content/home";
import { useActiveStep } from "@/lib/hooks";
import { Picture } from "@/components/ui/Picture";
import { Rule } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const tabs = systemExplainer.tabs;

/**
 * The six parts of the system as a scroll-through list. Nothing is pinned: the page keeps
 * moving, the still on the right follows the step nearest the viewport centre (one
 * IntersectionObserver), and the stills swap with opacity only.
 */
export function SystemExplainer() {
  const [active, setRef] = useActiveStep(tabs.length);
  return (
    <section id="system" aria-labelledby="system-heading" className="page-x section-y bg-plaster">
      <div className="mx-auto max-w-grid">
        <Reveal className="max-w-statement">
          <Rule className="mb-5" />
          <h2 id="system-heading" className="text-h2">
            {systemExplainer.headline}
          </h2>
          <p className="mt-4 max-w-[44ch] text-body text-muted">{systemExplainer.intro}</p>
        </Reveal>
        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-8">
          <ol className="md:col-span-5">
            {tabs.map((t, i) => (
              <li key={t.id} ref={setRef(i)} className="border-t border-hairline py-8 md:py-10" aria-current={i === active ? "step" : undefined}>
                <div className="mb-5 md:hidden">
                  <Picture id={t.imageId} alt={`${t.tab}: ${t.title}`} aspect="16/9" sizes="100vw" />
                </div>
                <p className="readout text-[0.75rem] text-glass">0{i + 1}</p>
                <h3 className={`mt-3 text-h3 transition-colors duration-300 ${i === active ? "text-ink" : "text-ink md:text-muted"}`}>{t.title}</h3>
                <p className="mt-2 max-w-prose text-body text-muted">{t.body}</p>
                <p className="mt-4 text-caption text-muted">{t.readout}</p>
              </li>
            ))}
          </ol>
          <div className="hidden md:col-span-7 md:block">
            <div className="sticky top-[calc(var(--nav-h)+1.5rem)]">
              <div className="relative" style={{ aspectRatio: "4/3" }}>
                {tabs.map((t, i) => (
                  <div
                    key={t.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-instrument ${i === active ? "opacity-100" : "opacity-0"}`}
                    aria-hidden={i !== active}
                  >
                    <Picture id={t.imageId} alt={`${t.tab}: ${t.title}`} aspect="4/3" sizes="55vw" label={false} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="caption">Concept render</span>
                <span className="readout text-caption text-muted">
                  {active + 1} / {tabs.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
