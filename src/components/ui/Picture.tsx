import { getImage, largest, srcSet } from "@/lib/media";

export function ConceptLabel({ className = "" }: { className?: string }) {
  return <span className={`concept-label pointer-events-none absolute bottom-3 left-3 z-10 ${className}`}>Concept render</span>;
}

/**
 * Responsive picture backed by the optimised assets in public/media. When an asset has
 * not been generated yet it renders a quiet placeholder so layouts never break.
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
  rounded = "rounded-panel",
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
  rounded?: string;
  placeholderText?: string;
}) {
  const asset = getImage(id);
  const style = { aspectRatio: aspect } as const;
  if (!asset) {
    return (
      <div
        className={`relative isolate overflow-hidden bg-sunken ${rounded} ${className}`}
        style={style}
        role="img"
        aria-label={alt}
        data-media-placeholder={id}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,#fbf9f4_0%,#e9e3d8_45%,#cfd9dc_100%)]" />
        <div className="grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <span className="readout text-[0.6875rem] uppercase tracking-[0.08em] text-muted">{placeholderText}</span>
        </div>
      </div>
    );
  }
  const webp = largest(id, "webp") ?? "";
  return (
    <div className={`relative isolate overflow-hidden ${rounded} ${className}`} style={style}>
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
      {label ? <ConceptLabel /> : null}
    </div>
  );
}
