import type { ReactNode } from "react";

/** Each hyphenated word ("pre-seed") kept whole on its line by markup, not a character, so copied text stays as written. */
export function keepWhole(text: string): ReactNode[] {
  return text.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}
