import mediaIndex from "../../public/media/index.json";

export type ImageAsset = {
  kind: "image";
  width?: number;
  height?: number;
  widths: number[];
  files: string[];
  placeholder?: string;
  placement?: string;
};

export type VideoAsset = {
  kind: "video";
  duration?: number;
  files: string[];
  sizes?: { mp4: number; webm: number };
  placement?: string;
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
