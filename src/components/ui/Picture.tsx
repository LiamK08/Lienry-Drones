import { getImage, largest, srcSet } from "@/lib/media";

/**
 * Responsive picture backed by the optimised assets in public/media, with the
 * "Concept render" caption set below the image as plain mono text. When an asset has
 * not been generated yet it renders a flat placeholder so layouts never break.
 */
export function Picture({
  id,
  alt,
  sizes = "100vw",
  aspect = "3/2",
  className = "",
  imgClassName = "",
  priority = false,
  label = true,
  placeholderText = "Render to come",
}: {
  id: string;
  alt: string;
  sizes?: string;
  aspect?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  label?: boolean;
  placeholderText?: string;
}) {
  const asset = getImage(id);
  const style = { aspectRatio: aspect } as const;
  const caption = label ? <figcaption className="caption mt-2">Concept render</figcaption> : null;
  if (!asset) {
    return (
      <figure className={className}>
        <div
          className="relative flex items-end overflow-hidden rounded-hard border border-hairline bg-sunken p-3"
          style={style}
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          data-media-placeholder={id}
        >
          <span className="caption">{placeholderText}</span>
        </div>
        {caption}
      </figure>
    );
  }
  const webp = largest(id, "webp") ?? "";
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-hard bg-sunken" style={style}>
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
            className={`h-full w-full object-cover ${imgClassName}`}
            style={asset.placeholder ? { backgroundImage: `url(${asset.placeholder})`, backgroundSize: "cover" } : undefined}
          />
        </picture>
      </div>
      {caption}
    </figure>
  );
}
