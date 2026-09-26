import type { CSSProperties } from "react";
import { getImage, largest, srcSet } from "@/lib/media";

export type PictureAspect = "16/9" | "21/9" | "2/1" | "3/2" | "4/3" | "1/1" | "4/5" | "3/4";

export type PictureProps = {
  /** A manifest still id (public/media). */
  id: string;
  alt: string;
  /** Default "100vw". */
  sizes?: string;
  /** Default "3/2". With fit="fill" and fillFrom="lg", the ratio used below 1024. */
  aspect?: PictureAspect;
  /** "aspect" (default): the frame keeps `aspect`. "fill": the frame takes the grid cell's height. */
  fit?: "aspect" | "fill";
  /** "lg": fill only from 1024; below it the frame uses `aspect`, so a stacked phone layout never collapses. */
  fillFrom?: "lg";
  /** fill only: the frame's floor, e.g. "24rem". */
  minHeight?: string;
  /** fill only: the frame's ceiling. */
  maxHeight?: string;
  /** object-position. Default "50% 50%". */
  position?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * A manifest still in a 4px frame with object-fit cover. It carries no caption.
 *
 * fit="fill" stretches the frame to its grid cell (the figure is a flex column at h-full, the frame
 * takes its height between `minHeight` and `maxHeight`), which is how rows and stages end level
 * with the text beside them.
 */
export function Picture({
  id,
  alt,
  sizes = "100vw",
  aspect = "3/2",
  fit = "aspect",
  fillFrom,
  minHeight,
  maxHeight,
  position = "50% 50%",
  priority = false,
  className = "",
  imgClassName = "",
}: PictureProps) {
  const asset = getImage(id);
  const fill = fit === "fill";
  const fillLg = fill && fillFrom === "lg";

  const figureCls = fillLg ? "lg:flex lg:h-full lg:flex-col" : fill ? "flex h-full flex-col" : "";
  const frameCls = fillLg
    ? "aspect-[var(--pic-aspect)] lg:aspect-auto lg:min-h-[var(--pic-min)] lg:max-h-[var(--pic-max)] lg:flex-1"
    : fill
      ? "min-h-[var(--pic-min)] max-h-[var(--pic-max)] flex-1"
      : "aspect-[var(--pic-aspect)]";
  const frameStyle = { "--pic-aspect": aspect, "--pic-min": minHeight, "--pic-max": maxHeight } as CSSProperties;
  const frame = `relative w-full overflow-hidden rounded-hard bg-sunken ${frameCls}`;

  if (!asset) {
    // The build fetches every asset first (prebuild), so this only shows in a local tree without
    // media: an empty frame of the right size, with no text.
    return (
      <div className={`${figureCls} ${className}`}>
        <div className={frame} style={frameStyle} aria-hidden="true" data-media-placeholder={id} />
      </div>
    );
  }

  const webp = largest(id, "webp") ?? "";
  return (
    <figure className={`${figureCls} ${className}`}>
      <div className={frame} style={frameStyle}>
        <picture>
          <source type="image/avif" srcSet={srcSet(id, "avif")} sizes={sizes} />
          <img
            src={webp}
            srcSet={srcSet(id, "webp")}
            sizes={sizes}
            alt={alt}
            width={asset.width}
            height={asset.height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
            style={{
              objectPosition: position,
              ...(asset.placeholder ? { backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover", backgroundPosition: position } : null),
            }}
          />
        </picture>
      </div>
    </figure>
  );
}
