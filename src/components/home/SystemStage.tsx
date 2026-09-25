"use client";

import { useState } from "react";
import { systemExplainer } from "@/content/home";
import { getImage, largest, srcSet } from "@/lib/media";
import { Band, Container } from "@/components/ui/Band";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { SectionHead } from "@/components/ui/SectionHead";

const parts = systemExplainer.tabs;
type Part = (typeof parts)[number];

const two = (n: number) => String(n).padStart(2, "0");

// The image area is the grid less the sidebar: 944px at 1440, about two thirds of the viewport
// from 1280 and a little over half from 1024. Below 1024 it is not rendered.
const stageSizes = "(min-width: 1440px) 944px, (min-width: 1280px) 66vw, 58vw";

function ArrowGlyph({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-4 w-4 ${back ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

/** One of the six stacked stills: the open part's at full opacity, the rest transparent and hidden from assistive tech. */
function StageImage({ part, on }: { part: Part; on: boolean }) {
  const asset = getImage(part.imageId);
  if (!asset) return <div className="absolute inset-0" aria-hidden="true" data-media-placeholder={part.imageId} />;
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(part.imageId, "avif")} sizes={stageSizes} />
      <img
        src={largest(part.imageId, "webp") ?? ""}
        srcSet={srcSet(part.imageId, "webp")}
        sizes={stageSizes}
        alt={part.alt}
        aria-hidden={on ? undefined : true}
        width={asset.width}
        height={asset.height}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-instrument ${on ? "opacity-100" : "opacity-0"}`}
        style={{
          objectPosition: part.position,
          ...(asset.placeholder ? { backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover", backgroundPosition: part.position } : null),
        }}
      />
    </picture>
  );
}

/**
 * The six parts of the system as one stage: an ink sidebar of six disclosures beside one large
 * image, driven by click and keyboard. Nothing pins and nothing follows the scroll position.
 *
 * The disclosures keep PR 9's semantics: a button inside each h3 with aria-expanded, aria-controls
 * and aria-disabled on the open one; each region labelled by its button; inactive regions hidden;
 * exactly one open, Dock first. The open region reserves the height of the longest part (invisible,
 * aria-hidden copies of every body and readout share its grid cell), so the sidebar, and with it the
 * frame, keeps one height whichever part is open. Previous and next open the adjacent part and keep
 * focus on themselves; a polite status line names the part they opened.
 *
 * From 1024 the frame runs the full grid: the sidebar in four columns (five to 1279) and the image
 * area in the rest, where the six stills are stacked and crossfade in 200ms, with one Concept render
 * caption under the frame at the image area's left edge. Below 1024 the stage is one ink panel and
 * each open region carries its own still at 4:3.
 */
export function SystemStage() {
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState("");
  const last = parts.length - 1;

  const step = (to: number) => {
    if (to < 0 || to > last) return;
    setActive(to);
    setStatus(`${parts[to].tab}, part ${to + 1} of ${parts.length}.`);
  };

  const control =
    "flex h-11 w-11 items-center justify-center rounded-hard border border-muted-on-dark bg-ink-raised text-plaster hover:border-plaster aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-muted-on-dark";

  return (
    <Band id="system" tone="raised" labelledBy="system-heading">
      <Container>
        <SectionHead
          id="system-heading"
          headline={systemExplainer.headline}
          emphasis={systemExplainer.emphasis}
          aside={{ intro: systemExplainer.intro }}
        />
        <div className="mt-[var(--gap-head)] lg:grid lg:grid-cols-[var(--stage-side)_minmax(0,1fr)] lg:grid-rows-[minmax(30rem,auto)_auto] lg:[--stage-side:calc((100%_-_16.5rem)/12*5_+_6rem)] xl:[--stage-side:calc((100%_-_16.5rem)/12*4_+_4.5rem)]">
          <div className="on-dark flex flex-col rounded-hard bg-ink px-4 py-6 text-plaster lg:col-start-1 lg:row-start-1 lg:rounded-r-none lg:p-6">
            <div className="divide-y divide-plaster/15">
              {parts.map((part, i) => {
                const open = i === active;
                return (
                  <div key={part.id}>
                    <h3 className="text-h3">
                      <button
                        type="button"
                        id={`part-${part.id}`}
                        aria-expanded={open}
                        aria-disabled={open}
                        aria-controls={`part-panel-${part.id}`}
                        onClick={() => setActive(i)}
                        className="flex min-h-12 w-full items-baseline gap-4 py-2"
                      >
                        <span className="readout w-6 shrink-0 text-caption text-muted-on-dark" aria-hidden="true">
                          {two(i + 1)}
                        </span>
                        <span className="flex-1">{part.tab}</span>
                        <span className="font-sans text-body text-muted-on-dark" aria-hidden="true">
                          {open ? "−" : "+"}
                        </span>
                      </button>
                    </h3>
                    <div id={`part-panel-${part.id}`} role="region" aria-labelledby={`part-${part.id}`} hidden={!open} className="pb-4 pt-2">
                      <div className="grid pl-10">
                        <div className="col-start-1 row-start-1">
                          <p className="text-small text-plaster">{part.body}</p>
                          <p className="mt-3 text-caption text-muted-on-dark">{part.readout}</p>
                        </div>
                        {open
                          ? parts.map((copy) => (
                              <div key={copy.id} aria-hidden="true" className="invisible col-start-1 row-start-1">
                                <p className="text-small">{copy.body}</p>
                                <p className="mt-3 text-caption">{copy.readout}</p>
                              </div>
                            ))
                          : null}
                      </div>
                      <Picture
                        id={part.imageId}
                        alt={part.alt}
                        position={part.position}
                        aspect="4/3"
                        tone="dark"
                        sizes="90vw"
                        className="mt-4 lg:hidden"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-4">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous part" aria-disabled={active === 0 || undefined} onClick={() => step(active - 1)} className={control}>
                  <ArrowGlyph back />
                </button>
                <button type="button" aria-label="Next part" aria-disabled={active === last || undefined} onClick={() => step(active + 1)} className={control}>
                  <ArrowGlyph />
                </button>
                <span className="readout ml-2 text-caption text-muted-on-dark" aria-hidden="true">
                  {`${two(active + 1)} / ${two(parts.length)}`}
                </span>
              </div>
              <Button href={systemExplainer.link.href} variant="tertiary" onDark arrow>
                {systemExplainer.link.label}
              </Button>
            </div>
            <p className="sr-only" role="status">
              {status}
            </p>
          </div>
          <figure className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:grid lg:grid-rows-subgrid">
            <div className="relative overflow-hidden rounded-r-hard bg-sunken">
              {parts.map((part, i) => (
                <StageImage key={part.id} part={part} on={i === active} />
              ))}
            </div>
            <figcaption className="concept-caption mt-2 text-caption text-muted">Concept render</figcaption>
          </figure>
        </div>
      </Container>
    </Band>
  );
}
