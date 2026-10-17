// The cost calculator's arithmetic and formats (src/components/sections/CostCalculator.tsx).
// The visitor's own figures only: no Lienry price, saving, ROI or comparison.

export const LIMITS = { area: { min: 1, max: 1_000_000 }, spend: { min: 1, max: 10_000_000 }, rise: { min: 0, max: 20 } } as const;

/** A whole number typed with optional spaces, commas or a leading "$"; null for anything else. */
export function parseWhole(raw: string): number | null {
  const s = raw.replace(/[\s,]/g, "").replace(/^\$/, "");
  return /^\d+$/.test(s) ? Number(s) : null;
}

/** A percentage with at most one decimal; an empty field is 0; null for anything else. */
export function parsePercent(raw: string): number | null {
  const s = raw.trim();
  if (s === "") return 0;
  return /^\d{1,2}(\.\d)?$/.test(s) ? Number(s) : null;
}

export const inRange = (n: number | null, r: { min: number; max: number }) => n !== null && n >= r.min && n <= r.max;

/** Year 1 is `spend`; each later year grows by risePct. Sum = S·((1+r)^N − 1)/r, or S·N at 0%. */
export function totalOver(years: number, spend: number, risePct: number): number {
  const r = risePct / 100;
  return r === 0 ? spend * years : (spend * ((1 + r) ** years - 1)) / r;
}

export const perSquareMetre = (spend: number, area: number) => spend / area;

const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Whole Australian dollars: "$150,000". */
export const formatAud = (n: number) => aud.format(Math.round(n));

/** Whole dollars per m², or `underOne` below $0.50 (which would otherwise round to "$0"). */
export const formatPerArea = (v: number, underOne: string) => (v < 0.5 ? underOne : formatAud(v));

/** A whole number with thousands separators: "1,000,000". */
export const formatWhole = (n: number) => new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 }).format(n);
