"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

/** One step of a flow: its id, its number ("01"), its tab label and its one-line caption. */
export type FlowStep<T extends string> = { id: T; number: string; tab: string; line: string };

export type StepTabsProps<T extends string> = {
  /** Tabs are `${id}-tab-${step}`, the panel `${id}-step`. */
  id: string;
  /** The tablist's aria-label. */
  label: string;
  steps: readonly FlowStep<T>[];
  value: T;
  onChange: (step: T) => void;
  /** Inside the tabpanel, after the captions (the software window). */
  children?: ReactNode;
};

/**
 * Numbered step tabs over one panel (WAI-ARIA tabs, horizontal): roving tabindex, ArrowLeft and
 * ArrowRight wrap, Home and End jump to the ends, and selection follows focus. The server renders
 * the tabs, so nothing swaps at hydration.
 *
 * The tablist is five columns below 1024 (number over label on phones, one line from 768) and two
 * grid columns per tab from 1024. Each tab is a rule on top with a 2px bar on the active one. The
 * panel holds every step's caption in one cell, the inactive ones invisible, aria-hidden and inert,
 * so its height never changes; then `children`. The panel has no tabIndex: it contains controls.
 */
export function StepTabs<T extends string>({ id, label, steps, value, onChange, children }: StepTabsProps<T>) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (step: T) => `${id}-tab-${step}`;
  const panelId = `${id}-step`;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = steps.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(steps[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} aria-orientation="horizontal" className="grid grid-cols-5 gap-x-2 md:gap-x-6 lg:grid-12">
        {steps.map((step, i) => {
          const on = step.id === value;
          return (
            <button
              key={step.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={tabId(step.id)}
              aria-selected={on}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(step.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative flex min-h-14 flex-col items-start gap-2 border-t border-rule py-2 text-left transition-colors duration-200 ease-instrument motion-reduce:transition-none md:flex-row md:items-baseline md:py-4 lg:col-span-2 ${
                on ? "text-fg after:absolute after:inset-x-0 after:-top-px after:h-0.5 after:bg-current" : "text-fg-muted hover:text-fg"
              }`}
            >
              <span aria-hidden="true" className="readout text-small">
                {step.number}
              </span>
              <span className="text-small font-medium md:text-lead md:font-normal">{step.tab}</span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)}>
        <div className="mt-6 lg:grid-12">
          <div className="grid lg:col-span-6">
            {steps.map((step) => {
              const on = step.id === value;
              return (
                <p
                  key={step.id}
                  aria-hidden={on ? undefined : true}
                  inert={!on}
                  className={`col-start-1 row-start-1 text-body text-fg transition-[opacity,visibility] duration-200 ease-instrument motion-reduce:transition-none md:text-lead ${
                    on ? "opacity-100" : "invisible opacity-0"
                  }`}
                >
                  {step.line}
                </p>
              );
            })}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
