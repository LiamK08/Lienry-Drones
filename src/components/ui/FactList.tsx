export type Fact = { term?: string; text: string };

export type FactListProps = {
  items: readonly Fact[];
  /** Columns from 768 up (default 1); one column below. */
  columns?: 1 | 2 | 3 | 4;
  /** "caption" (default): text-caption muted. "strong": text-body weight 500. "label": only for spec keys. */
  termStyle?: "caption" | "label" | "strong";
  tone?: "light" | "dark";
  className?: string;
};

const cols = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
} as const;

// From 768 up, every item that does not start a row gets a vertical rule on its left and a
// gutter; every item that does not end a row gets the gutter on its right.
const rules = {
  1: "",
  2: "md:[&:not(:nth-child(2n+1))]:border-l md:[&:not(:nth-child(2n+1))]:pl-6 md:[&:not(:nth-child(2n))]:pr-6",
  3: "md:[&:not(:nth-child(3n+1))]:border-l md:[&:not(:nth-child(3n+1))]:pl-6 md:[&:not(:nth-child(3n))]:pr-6",
  4: "md:[&:not(:nth-child(4n+1))]:border-l md:[&:not(:nth-child(4n+1))]:pl-6 md:[&:not(:nth-child(4n))]:pr-6",
} as const;

/**
 * A ruled list of short facts (the feature strip): each item is a 1px rule, 12, the term, 4, the
 * text, 12. A `dl` when the items carry terms, a `ul` when none does. (A list that mixes the two
 * renders as a `ul` with the same styling, because a `dl` group needs its term.)
 */
export function FactList({ items, columns = 1, termStyle = "caption", tone = "light", className = "" }: FactListProps) {
  const dark = tone === "dark";
  const rule = dark ? "border-plaster/20" : "border-hairline";
  const muted = dark ? "text-muted-on-dark" : "text-muted";
  const ink = dark ? "text-plaster" : "text-ink";
  const termCls =
    termStyle === "label" ? `label ${muted}` : termStyle === "strong" ? `text-body font-medium ${ink}` : `text-caption ${muted}`;
  const list = `grid ${cols[columns]} ${className}`;
  const item = `border-t ${rule} py-3 ${rules[columns]}`;
  const text = `text-small ${ink}`;
  const key = (f: Fact) => `${f.term ?? ""}|${f.text}`;

  if (items.length > 0 && items.every((f) => f.term)) {
    return (
      <dl className={list}>
        {items.map((f) => (
          <div key={key(f)} className={item}>
            <dt className={termCls}>{f.term}</dt>
            <dd className={`mt-1 ${text}`}>{f.text}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <ul className={list}>
      {items.map((f) => (
        <li key={key(f)} className={item}>
          {f.term ? <span className={`block ${termCls}`}>{f.term}</span> : null}
          <span className={`block ${text} ${f.term ? "mt-1" : ""}`}>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}
