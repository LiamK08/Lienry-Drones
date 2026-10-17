import mediaIndex from "../../public/media/index.json";

/** An art-directed crop of a still (scripts/media/manifest.json `variants`), files `${id}--${name}-${w}.avif|webp`. */
export type ImageVariant = { width: number; height: number; widths: number[]; files: string[]; focus?: string | null };

export type ImageAsset = {
  kind: "image";
  width?: number;
  height?: number;
  widths: number[];
  files: string[];
  placeholder?: string;
  placement?: string;
  /** The default object-position (manifest `focus`): Picture uses it when a page gives no position. */
  focus?: string | null;
  variants?: Record<string, ImageVariant>;
  key?: string;
};

export type VideoAsset = {
  kind: "video";
  duration?: number;
  files: string[];
  sizes?: { mp4: number; webm: number };
  placement?: string;
  /** Lower-resolution re-encodes, files `${id}--${height}.mp4|webm` (manifest `renditions`). */
  renditions?: number[];
  key?: string;
};

export type MediaAsset = ImageAsset | VideoAsset;

const index = mediaIndex as Record<string, MediaAsset>;

export function getImage(id: string): ImageAsset | null {
  const asset = index[id];
  return asset && asset.kind === "image" ? asset : null;
}

export function getVideo(id: string): VideoAsset | null {
  const asset = index[id];
  return asset && asset.kind === "video" ? asset : null;
}

export function srcSet(id: string, format: "avif" | "webp"): string {
  const asset = getImage(id);
  if (!asset) return "";
  return asset.widths.map((w) => `/media/${id}-${w}.${format} ${w}w`).join(", ");
}

export function largest(id: string, format: "avif" | "webp" = "webp"): string | null {
  const asset = getImage(id);
  if (!asset) return null;
  const w = Math.max(...asset.widths);
  return `/media/${id}-${w}.${format}`;
}

/** The still's default object-position from the index, or null. */
export const focusOf = (id: string) => getImage(id)?.focus ?? null;

/** A variant's srcset, or "" while the index does not list that variant (callers then fall back silently). */
export function variantSrcSet(id: string, variant: string, format: "avif" | "webp"): string {
  const v = getImage(id)?.variants?.[variant];
  return v ? v.widths.map((w) => `/media/${id}--${variant}-${w}.${format} ${w}w`).join(", ") : "";
}

/**
 * Multiplies each `sizes` length by the cover factor k = max(1, imageAspect / frameAspect) of its
 * breakpoint, so an object-fit: cover frame asks for enough pixels. `sizes` follows the site's one
 * convention: descending `(min-width: Npx)` entries, then a bare default for below 768.
 */
export function coverSizes(sizes: string, frame: { sm: number; md: number; lg: number }, imageAspect: number): string {
  return sizes
    .split(",")
    .map((raw) => {
      const e = raw.trim();
      const m = e.match(/^(\([^)]*\))\s+(.+)$/);
      const cond = m ? m[1] : null;
      const len = m ? m[2] : e;
      const min = cond ? Number(cond.match(/min-width:\s*(\d+)px/)?.[1] ?? 0) : 0;
      const f = min >= 1024 ? frame.lg : min >= 768 ? frame.md : frame.sm;
      const k = Math.max(1, imageAspect / f);
      const out = k <= 1.001 ? len : `calc(${len.replace(/^calc\((.*)\)$/, "($1)")} * ${k.toFixed(3)})`;
      return cond ? `${cond} ${out}` : out;
    })
    .join(", ");
}

/** "3/2" (or "3 / 2") as a number; null for anything else. */
export function ratio(aspect: string | undefined): number | null {
  if (!aspect) return null;
  const m = aspect.match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
  return m ? Number(m[1]) / Number(m[2]) : null;
}
