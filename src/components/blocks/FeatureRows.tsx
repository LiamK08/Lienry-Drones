import type { ReactNode } from "react";
import type { Action, ImageRef } from "@/lib/types";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";

export type FeatureRowItem = {
  /** The row's anchor id, e.g. "dock". */
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: readonly string[];
  checks?: readonly string[];
  /** A tinted box under the text: a title and a short list. */
  callout?: { title: string; items: readonly string[] };
  link?: Action;
  image?: ImageRef;
  /** In place of the image (the software window). */
  media?: ReactNode;
  /** A strip of four short facts under the row. */
  facts?: readonly { title: string; text: string }[];
};

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="7" />
      <path d="m5 8 2 2 4-4" />
    </svg>
  );
}

/**
 * Feature rows: text beside a rounded picture, the side alternating row by row (the first row's
 * picture on the right). Text: an optional eyebrow, the h2, paragraphs, a check list, a tinted callout
 * and a pill. Below 1024 the picture follows the text. A row may close with four short facts.
 */
export function FeatureRows({ id, tone = "plaster", items, startSide = "right" }: { id: string; tone?: "plaster" | "paper"; items: readonly FeatureRowItem[]; startSide?: "left" | "right" }) {
  return (
    <Band id={id} tone={tone} ariaLabel="Features">
      <Container>
        <div className="flex flex-col gap-24 lg:gap-32">
          {items.map((r, i) => {
            const right = (i % 2 === 0) === (startSide === "right");
            return (
              <section key={r.id} id={r.id} aria-labelledby={`${r.id}-heading`} className="scroll-mt-24">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <Reveal className={right ? "" : "lg:order-2"}>
                    {r.eyebrow ? <p className="eyebrow">{r.eyebrow}</p> : null}
                    <h2 id={`${r.id}-heading`} className="text-[2rem] leading-[1.15] md:text-[2.5rem]">
                      {r.title}
                    </h2>
                    <div className="mt-5 space-y-4">
                      {r.paragraphs.map((p) => (
                        <p key={p} className="max-w-xl text-body text-fg-muted">
                          {p}
                        </p>
                      ))}
                    </div>
                    {r.checks ? (
                      <ul className="mt-6 space-y-3">
                        {r.checks.map((c) => (
                          <li key={c} className="flex gap-3 text-small text-fg">
                            <Check />
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {r.callout ? (
                      <div className="mt-6 rounded-[0.625rem] border-l-[3px] border-accent bg-tint px-5 py-4">
                        <p className="text-small font-medium text-ink">{r.callout.title}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-ink/80">
                          {r.callout.items.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {r.link ? (
                      <Button href={r.link.href} variant="secondary" size="sm" className="mt-8">
                        {r.link.label}
                      </Button>
                    ) : null}
                  </Reveal>
                  <div className={right ? "" : "lg:order-1"}>
                    {r.media ?? (r.image ? <Picture id={r.image.id} alt={r.image.alt} position={r.image.position} aspect="4/3" rounded="card" sizes="(min-width: 1440px) 684px, (min-width: 1024px) 50vw, 100vw" /> : null)}
                  </div>
                </div>
                {r.facts ? (
                  <ul className="mt-16 grid gap-8 border-t border-line pt-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                    {r.facts.map((f, k) => (
                      <li key={f.title} className={k ? "lg:border-l lg:border-line lg:pl-6" : "lg:pr-6"}>
                        <p className="text-small font-medium text-fg">{f.title}</p>
                        <p className="mt-2 text-small text-fg-muted">{f.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      </Container>
    </Band>
  );
}
