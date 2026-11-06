import type { Action } from "@/lib/types";

// The FAQ's shapes. The one FAQ treatment is FaqRows (src/components/blocks/FaqRows.tsx), set in a band by
// FaqCentered (the split) or by the home page's FaqForm; the content lives in src/content/faq.ts.

/** One labelled point under an answer's opening line, e.g. "Tether: water and power, always connected". */
export type FaqPoint = { label: string; text: string };

/** An answer: its opening line, then optional labelled points and a closing line, then an optional link. */
export type FaqItem = { id: string; q: string; a: string; points?: readonly FaqPoint[]; after?: string; link?: Action };
