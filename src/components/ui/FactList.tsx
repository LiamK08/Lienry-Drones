export type Fact = { term?: string; text: string };

export type FactListProps = {
  items: readonly Fact[];
  /** Columns from 768 up (default 1); one column below. */
  columns?: 1 | 2 | 3 | 4;
  /** "caption" (default): text-caption muted. "strong": text-body weight 500. */
  termStyle?: "caption" | "strong";
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
 * A ruled list of short facts: each item is a 1px rule, 16, the term, 8, the text, 16, in the
 * surface's colours (rules on `border-rule`). A `dl` when every item carries a term, a `ul`
 * otherwise (a `dl` group needs its term).
 */
export function FactList({ items, columns = 1, termStyle = "caption", className = "" }: FactListProps) {
  const termCls = termStyle === "strong" ? "text-body font-medium text-fg" : "text-caption text-fg-muted";
  const list = `grid ${cols[columns]} ${className}`;
  const item = `border-t border-rule py-4 ${rules[columns]}`;
  const text = "text-small text-fg";
  const key = (f: Fact) => `${f.term ?? ""}|${f.text}`;

  if (items.length > 0 && items.every((f) => f.term)) {
    return (
      <dl className={list}>
        {items.map((f) => (
          <div key={key(f)} className={item}>
            <dt className={termCls}>{f.term}</dt>
            <dd className={`mt-2 ${text}`}>{f.text}</dd>
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
          <span className={`block ${text} ${f.term ? "mt-2" : ""}`}>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}
