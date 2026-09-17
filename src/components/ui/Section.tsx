import type { ReactNode } from "react";

type Tone = "plaster" | "raised" | "sunken" | "dark";

const tones: Record<Tone, string> = {
  plaster: "bg-plaster text-ink",
  raised: "bg-raised text-ink",
  sunken: "bg-sunken text-ink",
  dark: "bg-ink text-plaster on-dark",
};

export function Section({
  id,
  tone = "plaster",
  className = "",
  children,
  padded = true,
  as: Tag = "section",
  ariaLabelledby,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  padded?: boolean;
  as?: "section" | "div" | "header" | "footer";
  ariaLabelledby?: string;
}) {
  return (
    <Tag id={id} aria-labelledby={ariaLabelledby} className={`relative ${tones[tone]} ${padded ? "section-y" : ""} page-x ${className}`}>
      {children}
    </Tag>
  );
}

const widths = {
  grid: "max-w-grid",
  rows: "max-w-rows",
  statement: "max-w-statement",
  prose: "max-w-prose",
  form: "max-w-form",
} as const;

export function Container({ width = "grid", className = "", children }: { width?: keyof typeof widths; className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full ${widths[width]} ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = "", as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" | "div" }) {
  return <Tag className={`eyebrow ${className}`}>{children}</Tag>;
}

export function SectionHeading({
  eyebrow,
  headline,
  intro,
  id,
  align = "left",
  className = "",
  level = 2,
}: {
  eyebrow?: string;
  headline: string;
  intro?: string;
  id?: string;
  align?: "left" | "center";
  className?: string;
  level?: 1 | 2;
}) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-statement ${className}`}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <H id={id} className={level === 1 ? "text-h1" : "text-h2"}>
        {headline}
      </H>
      {intro ? <p className="mt-5 max-w-prose text-lead text-muted">{intro}</p> : null}
    </div>
  );
}
