"use client";

// F2a STUB. `AppState` and `AppPanelProps` are final; F2c builds the panel (docs/REDESIGN-SPEC.md
// B6: the five states, the rows, the status line) behind them without changing them. The stub
// renders a plain panel of the real size with its "Demo data" chrome, its note, and a real button
// that calls `onAdvance`, so a parent's shared state can be wired and tested now.

export type AppState = "map" | "select" | "start" | "progress" | "done";

export type AppPanelProps =
  /** The home product card: a static, compact select state, decorative inside the card's role="img" frame. */
  | { mode: "fragment" }
  /** The /homes-and-rentals story: the button advances the shared state (done returns to map). */
  | { mode: "control"; state: AppState; onAdvance: () => void };

// Stub copy only: F2c reads `appPanel.buttons` from src/content/home.ts instead.
const STUB_BUTTON: Record<AppState, string> = {
  map: "Choose surfaces",
  select: "Start clean",
  start: "See progress",
  progress: "See the finished clean",
  done: "Start again",
};

function Header() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
      <span className="text-small font-medium">Your property</span>
      <span className="label text-muted">Demo data</span>
    </div>
  );
}

/**
 * The illustrative phone app, drawn flat. Control mode is `h-full`: a raised panel with a hairline
 * border, 4px corners and 20px padding, with its bar and note pinned to the bottom. Fragment mode
 * is the compact 16px version for the product card, with no note (the card's caption carries it).
 */
export function AppPanel(props: AppPanelProps) {
  if (props.mode === "fragment") {
    return (
      // The right padding clears the 24px the card runs the panel past its frame, so the label stays whole.
      <div className="rounded-hard border border-hairline bg-raised py-4 pl-4 pr-10 text-ink">
        <Header />
        <svg aria-hidden="true" className="block h-[7.5rem] w-full" />
        <div className="flex h-11 items-center justify-center rounded-hard bg-ink text-small font-medium text-white">Start clean</div>
      </div>
    );
  }
  return (
    <div role="group" aria-label="Illustrative mobile app, demo data" className="flex h-full flex-col rounded-hard border border-hairline bg-raised p-5 text-ink">
      <Header />
      <svg aria-hidden="true" className="block min-h-[14.5rem] w-full flex-1" data-app-state={props.state} />
      <button
        type="button"
        onClick={props.onAdvance}
        className="flex h-11 w-full items-center justify-center rounded-hard bg-ink text-small font-medium text-white hover:bg-ink-raised"
      >
        {STUB_BUTTON[props.state]}
      </button>
      <p className="mt-3 text-caption text-muted">Illustrative app interface.</p>
    </div>
  );
}
