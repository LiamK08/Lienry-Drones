import type { CSSProperties, ReactNode } from "react";
import { coverSizes, focusOf, getImage, largest, ratio, srcSet, variantSrcSet } from "@/lib/media";

export type PictureAspect = "21/9" | "16/9" | "2/1" | "3/2" | "4/3" | "1/1" | "4/5" | "3/4" | "2/3";

export type PictureProps = {
  /** A manifest still id (public/media). */
  id: string;
  alt: string;
  /** The frame's widths, descending `(min-width: Npx)` entries then a bare default for below 768. Picture
   *  multiplies each by the cover factor of its breakpoint (coverSizes). Default "100vw". */
  sizes?: string;
  /** The frame's ratio from 1024 (and below when no smaller one is set). Default "3/2". */
  aspect?: PictureAspect;
  /** From 768 to 1023. */
  aspectMd?: PictureAspect;
  /** Below 768. */
  aspectSm?: PictureAspect;
  /** "aspect" (default): the frame keeps its ratio. "fill": the frame takes its cell's height. */
  fit?: "aspect" | "fill";
  /** "lg": fill only from 1024; below it the aspect chain holds, so a stacked phone layout never collapses. */
  fillFrom?: "lg";
  /** Fill only: the frame's floor, e.g. "24rem". */
  minHeight?: string;
  /** Fill only: the frame's ceiling. */
  maxHeight?: string;
  /** Fill frames: the frame's expected width / height, for the cover factor in `sizes`. */
  frameAspect?: number;
  /** object-position from 1024 (and below when no smaller one is set). Default: the manifest focus, then "50% 50%". */
  position?: string;
  positionMd?: string;
  positionSm?: string;
  /** An art-directed crop served below 768 (manifest `variants`); ignored while the index has none. */
  variant?: string;
  /** The card hover: the media layer scales to 1.03 over 600ms on the group's hover or keyboard focus. */
  zoom?: boolean;
  /** Drawn over the still, inside the frame (a HoverClip). */
  overlay?: ReactNode;
  /** The page's LCP image: eager, sync decode, fetchpriority high. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/** The frame ratios at the three breakpoints, for coverSizes. */
export type FrameAspects = { sm: number; md: number; lg: number };

/** The `--pos`, `--pos-md` and `--pos-sm` variables (unset ones omitted). */
export function positionVars(id: string, position?: string, positionMd?: string, positionSm?: string): Record<string, string> {
  const vars: Record<string, string> = { "--pos": position ?? focusOf(id) ?? "50% 50%" };
  if (positionMd) vars["--pos-md"] = positionMd;
  if (positionSm) vars["--pos-sm"] = positionSm;
  return vars;
}

/** object-position and the placeholder's background-position from the --pos chain, per breakpoint. */
export const positionCls =
  "object-[var(--pos-sm,var(--pos-md,var(--pos)))] md:object-[var(--pos-md,var(--pos))] lg:object-[var(--pos)] bg-[position:var(--pos-sm,var(--pos-md,var(--pos)))] md:bg-[position:var(--pos-md,var(--pos))] lg:bg-[position:var(--pos)]";

/**
 * The `<source>` elements of a still: the art-directed variant below 768 when the index lists it
 * (AVIF, then WebP), then the full AVIF set. The `<img>` carries the WebP set with `imgSizes`.
 */
export function stillSources(id: string, sizes: string, frame: FrameAspects | null, variant?: string): { sources: ReactNode; imgSizes: string } {
  const asset = getImage(id);
  const imageAspect = asset?.width && asset?.height ? asset.width / asset.height : null;
  const imgSizes = frame && imageAspect ? coverSizes(sizes, frame, imageAspect) : sizes;
  const v = variant ? asset?.variants?.[variant] : undefined;
  let variantSources: ReactNode = null;
  if (variant && v) {
    const entries = sizes.split(",").map((e) => e.trim());
    const bare = entries.find((e) => !e.startsWith("(")) ?? "100vw";
    const vSizes = frame ? coverSizes(bare, { sm: frame.sm, md: frame.sm, lg: frame.sm }, v.width / v.height) : bare;
    variantSources = (
      <>
        <source media="(max-width: 767px)" type="image/avif" srcSet={variantSrcSet(id, variant, "avif")} sizes={vSizes} />
        <source media="(max-width: 767px)" type="image/webp" srcSet={variantSrcSet(id, variant, "webp")} sizes={vSizes} />
      </>
    );
  }
  return {
    sources: (
      <>
        {variantSources}
        <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={imgSizes} />
      </>
    ),
    imgSizes,
  };
}

/**
 * A manifest still in a 4px frame with object-fit cover. It carries no caption.
 *
 * The frame's ratio can change at 768 and 1024 (aspect, aspectMd, aspectSm), and so can the crop
 * (position, positionMd, positionSm): both are CSS variables, so the server render is already right
 * at every width. `sizes` is multiplied by the cover factor, so a frame narrower than the image asks
 * for enough pixels.
 *
 * fit="fill" stretches the frame to its grid cell (the figure is a flex column at h-full, the frame
 * takes its height between `minHeight` and `maxHeight`), which is how rows end level with the text
 * beside them.
 */
export function Picture({
  id,
  alt,
  sizes = "100vw",
  aspect = "3/2",
  aspectMd,
  aspectSm,
  fit = "aspect",
  fillFrom,
  minHeight,
  maxHeight,
  frameAspect,
  position,
  positionMd,
  positionSm,
  variant,
  zoom = false,
  overlay,
  priority = false,
  className = "",
  imgClassName = "",
}: PictureProps) {
  const asset = getImage(id);
  const fill = fit === "fill";
  const fillLg = fill && fillFrom === "lg";

  const chain =
    "aspect-[var(--pic-aspect-sm,var(--pic-aspect-md,var(--pic-aspect)))] md:aspect-[var(--pic-aspect-md,var(--pic-aspect))] lg:aspect-[var(--pic-aspect)]";
  const figureCls = fillLg ? "lg:flex lg:h-full lg:flex-col" : fill ? "flex h-full flex-col" : "";
  const frameCls = fillLg
    ? `${chain} lg:aspect-auto lg:min-h-[var(--pic-min)] lg:max-h-[var(--pic-max)] lg:flex-1`
    : fill
      ? "min-h-[var(--pic-min)] max-h-[var(--pic-max)] flex-1"
      : chain;
  const frameStyle = {
    "--pic-aspect": aspect,
    ...(aspectMd ? { "--pic-aspect-md": aspectMd } : null),
    ...(aspectSm ? { "--pic-aspect-sm": aspectSm } : null),
    ...(minHeight ? { "--pic-min": minHeight } : null),
    ...(maxHeight ? { "--pic-max": maxHeight } : null),
    ...positionVars(id, position, positionMd, positionSm),
  } as CSSProperties;
  const frame = `relative w-full overflow-hidden rounded-hard bg-media ${frameCls}`;

  if (!asset) {
    // The build fetches every asset first (prebuild), so this only shows in a local tree without
    // media: an empty frame of the right size, with no text.
    return (
      <div className={`${figureCls} ${className}`}>
        <div className={frame} style={frameStyle} aria-hidden="true" data-media-placeholder={id} />
      </div>
    );
  }

  // The frame's ratio at each breakpoint, for the cover factor. A fill frame uses frameAspect (or the
  // image's own ratio, which asks for no more than the frame's width).
  const own = asset.width && asset.height ? asset.width / asset.height : 1;
  const r = (a: PictureAspect | undefined) => ratio(a) ?? own;
  const frameAspects: FrameAspects = fill && !fillLg
    ? { sm: frameAspect ?? own, md: frameAspect ?? own, lg: frameAspect ?? own }
    : { sm: r(aspectSm ?? aspectMd ?? aspect), md: r(aspectMd ?? aspect), lg: fillLg ? (frameAspect ?? own) : r(aspect) };
  const { sources, imgSizes } = stillSources(id, sizes, frameAspects, variant);

  const picture = (
    <picture>
      {sources}
      <img
        src={largest(id, "webp") ?? ""}
        srcSet={srcSet(id, "webp")}
        sizes={imgSizes}
        alt={alt}
        width={asset.width}
        height={asset.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={`absolute inset-0 h-full w-full object-cover ${positionCls} ${imgClassName}`}
        style={asset.placeholder ? { backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" } : undefined}
      />
    </picture>
  );

  return (
    <figure className={`${figureCls} ${className}`}>
      <div className={frame} style={frameStyle}>
        {zoom ? (
          <div
            data-zoom=""
            className="absolute inset-0 transition-[scale] duration-600 ease-settle group-hover:scale-103 group-has-[:focus-visible]:scale-103 motion-reduce:transition-none"
          >
            {picture}
            {overlay}
          </div>
        ) : (
          <>
            {picture}
            {overlay}
          </>
        )}
      </div>
    </figure>
  );
}
