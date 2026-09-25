"use client";

import { useState } from "react";
import { appPanel } from "@/content/home";

export type AppState = "map" | "select" | "start" | "progress" | "done";

export type AppPanelProps =
  /** The home product card: a static, compact select state, decorative inside the card's role="img" frame. */
  | { mode: "fragment" }
  /** The /homes-and-rentals story: the button advances the shared state (done returns to map). */
  | { mode: "control"; state: AppState; onAdvance: () => void };

/** What a ticked row says in each state: "Selected", "Starting", its progress, or "Complete". */
function rowText(state: AppState, row: number): string | null {
  if (row > 1 || state === "map") return null;
  return state === "progress" ? appPanel.rowState.progress[row] : appPanel.rowState[state];
}

function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-hard border ${on ? "border-ink bg-ink text-white" : "border-border-strong"}`}
    >
      {on ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      ) : null}
    </span>
  );
}

/** One area of the property: its tick (decorative) and its state as text, so the tick is never the only signal. */
function Row({ name, text, height }: { name: string; text: string | null; height: string }) {
  return (
    <li className={`flex items-center gap-3 border-b border-hairline text-small ${height}`}>
      <Tick on={text !== null} />
      <span>{name}</span>
      {text ? <span className="ml-auto text-caption text-muted">{text}</span> : null}
    </li>
  );
}

function Header({ pad }: { pad: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-hairline ${pad}`}>
      <span className="text-small font-medium">Your property</span>
      <span className="label text-muted">Demo data</span>
    </div>
  );
}

/**
 * The compact select state for the home product card. It is decorative (the card's frame carries
 * the label and the caption carries the note), so it has no role, no button and no note. The right
 * padding clears the 24px the card runs the panel past its frame, so the label and the row states
 * stay whole.
 */
function Fragment() {
  return (
    <div className="rounded-hard border border-hairline bg-raised py-4 pl-4 pr-10 text-ink">
      <Header pad="pb-3" />
      <p className="mt-3 text-lead font-medium">{appPanel.property}</p>
      <ul className="mt-3 border-t border-hairline">
        {appPanel.rows.slice(0, 2).map((name, i) => (
          <Row key={name} name={name} text={rowText("select", i)} height="h-10" />
        ))}
      </ul>
      <div className="mt-4 flex h-10 items-center justify-center rounded-hard bg-ink text-small font-medium text-white">{appPanel.buttons.select}</div>
    </div>
  );
}

/**
 * The working panel beside the story. Every change is the user's: the button advances the shared
 * state, and the status line (empty on the first render) announces each new state, whichever
 * control changed it. No timers and nothing counts up.
 */
function Control({ state, onAdvance }: { state: AppState; onAdvance: () => void }) {
  const [shown, setShown] = useState(state);
  const [status, setStatus] = useState("");
  if (state !== shown) {
    setShown(state);
    setStatus(appPanel.status[state]);
  }

  return (
    <div role="group" aria-label="Illustrative mobile app, demo data" className="relative flex h-full flex-col rounded-hard border border-hairline bg-raised p-5 text-ink">
      <Header pad="pb-4" />
      <p className="mt-4 text-lead font-medium">{appPanel.property}</p>
      <p className="mt-1 text-caption text-muted">{appPanel.prompt}</p>
      <ul className="mt-4 border-t border-hairline">
        {appPanel.rows.map((name, i) => (
          <Row key={name} name={name} text={rowText(state, i)} height="h-11" />
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onAdvance}
          className="flex h-11 w-full items-center justify-center rounded-hard bg-ink text-small font-medium text-white transition-colors duration-150 ease-instrument hover:bg-ink-raised"
        >
          {appPanel.buttons[state]}
        </button>
        <p className="mt-3 text-caption text-muted">{appPanel.note}</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}

/**
 * The illustrative phone app, drawn flat. Control mode is `h-full`: a raised panel with a hairline
 * border, 4px corners and 20px padding, with its bar and note pinned to the bottom. Fragment mode
 * is the compact 16px version for the product card, with no note (the card's caption carries it).
 */
export function AppPanel(props: AppPanelProps) {
  if (props.mode === "fragment") return <Fragment />;
  return <Control state={props.state} onAdvance={props.onAdvance} />;
}
