import type { CSSProperties } from "react";
import styles from "./PaneField.module.css";

export type PaneFieldProps = {
  /** The ground the field sits on: the night panels, the accent closing panel, or a white or tint band. */
  tone: "night" | "accent" | "light";
  /** Where the panes are strongest and the light starts, as percentages across and down the field's
   *  box ([0, 0] is its top left corner). The panes fade to nothing by the box's far sides. */
  at?: readonly [x: number, y: number];
  /** How far the light drifts before it comes back, in the same percentages (`at` plus `drift` should
   *  stay between 0 and 100). */
  drift?: readonly [x: number, y: number];
  /** The field's box inside its host (it is absolutely placed): inset, width and height utilities. */
  className?: string;
};

/**
 * The pane field: a fine grid of small square panes with a patch that slowly catches the light, drawn
 * in CSS alone (PaneField.module.css). Decoration only: aria-hidden, no pointer events, behind its
 * host's content. The host is positioned, clips it (`relative isolate overflow-hidden`) and places the
 * box with `className`. Two rules for the box, so contrast can always be read: text over it sits in a
 * positioned box of its own (`relative`), and the box covers a block of text wholly or not at all (and
 * never small text that already sits over a glow: each wash adds up). Still under reduced motion.
 */
export function PaneField({ tone, at = [0, 0], drift = [45, 40], className = "" }: PaneFieldProps) {
  return (
    <div
      aria-hidden="true"
      data-pane-field={tone}
      className={`${styles.field} ${className}`}
      style={{ "--pane-ax": at[0], "--pane-ay": at[1], "--pane-dx": drift[0], "--pane-dy": drift[1] } as CSSProperties}
    >
      <div className={styles.base} />
      <div className={styles.lit} />
    </div>
  );
}
