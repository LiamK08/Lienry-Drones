// Download Higgsfield generation results listed in manifest.json and write optimised
// web assets into public/media. Images become AVIF + WebP at the listed widths plus a
// 24px blur placeholder; videos become H.264 MP4 + VP9 WebM under the size budget, with
// a WebP poster taken from the first frame.
//
// Usage: node scripts/media/fetch.mjs [--only id,id] [--force]
// Needs: node 20+, sharp (dependency). Video needs ffmpeg: ffmpeg-static (npm) or a system ffmpeg.

import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
const SRC_DIR = path.join(ROOT, "media-src");
const OUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "scripts", "media", "manifest.json");
const VIDEO_BUDGET_BYTES = 4 * 1024 * 1024;

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only="))?.split("=")[1] ?? "").split(",").filter(Boolean);
const force = args.includes("--force");

mkdirSync(SRC_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

async function ffmpegPath() {
  try {
    // ffmpeg-static is an optional install; fall back to a system ffmpeg.
    const mod = "ffmpeg-static";
    const p = (await import(mod)).default;
    if (p && existsSync(p)) return p;
  } catch {}
  return "ffmpeg";
}

async function download(url, dest) {
  if (existsSync(dest) && !force) return dest;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return dest;
}

async function processImage(asset, src) {
  const image = sharp(src, { failOn: "none" });
  const meta = await image.metadata();
  const widths = (asset.widths ?? [640, 1280, 2048]).filter((w) => w <= (meta.width ?? 99999));
  if (widths.length === 0) widths.push(meta.width ?? 1280);
  const written = [];
  for (const w of widths) {
    const base = path.join(OUT_DIR, `${asset.id}-${w}`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(`${base}.webp`);
    written.push(`${asset.id}-${w}.avif`, `${asset.id}-${w}.webp`);
  }
  // Tiny blur placeholder as a data URI for next/image blurDataURL.
  const blur = await sharp(src).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const placeholder = `data:image/webp;base64,${blur.toString("base64")}`;
  return { width: meta.width, height: meta.height, widths, files: written, placeholder };
}

async function processVideo(asset, src, ffmpeg) {
  const duration = Number(
    execFileSync(ffmpeg.replace(/ffmpeg$/, "ffprobe"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], { encoding: "utf8" }).trim() || "8",
  );
  const height = asset.height ?? 1080;
  const targetBits = Math.floor((VIDEO_BUDGET_BYTES * 8 * 0.9) / duration);
  const mp4 = path.join(OUT_DIR, `${asset.id}.mp4`);
  const webm = path.join(OUT_DIR, `${asset.id}.webm`);
  const poster = path.join(OUT_DIR, `${asset.id}-poster.webp`);
  const posterJpg = path.join(OUT_DIR, `${asset.id}-poster.jpg`);
  const vf = `scale=-2:${height}:flags=lanczos`;
  execFileSync(ffmpeg, ["-y", "-i", src, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-b:v", `${Math.min(targetBits, 3_200_000)}`, "-maxrate", `${Math.min(targetBits, 3_200_000)}`, "-bufsize", "6000k", "-movflags", "+faststart", mp4], { stdio: "inherit" });
  execFileSync(ffmpeg, ["-y", "-i", src, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", `${Math.min(Math.floor(targetBits * 0.8), 2_400_000)}`, "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm], { stdio: "inherit" });
  execFileSync(ffmpeg, ["-y", "-i", src, "-vf", `select=eq(n\\,0),${vf}`, "-frames:v", "1", posterJpg], { stdio: "inherit" });
  await sharp(posterJpg).webp({ quality: 74 }).toFile(poster);
  const sizes = { mp4: statSync(mp4).size, webm: statSync(webm).size };
  if (sizes.mp4 > VIDEO_BUDGET_BYTES) console.warn(`WARNING ${asset.id}.mp4 is ${(sizes.mp4 / 1e6).toFixed(2)} MB, over the 4 MB budget`);
  return { duration, files: [`${asset.id}.mp4`, `${asset.id}.webm`, `${asset.id}-poster.webp`, `${asset.id}-poster.jpg`], sizes };
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const results = existsSync(path.join(OUT_DIR, "index.json")) ? JSON.parse(readFileSync(path.join(OUT_DIR, "index.json"), "utf8")) : {};
let ffmpeg = null;
for (const asset of manifest.assets) {
  if (only.length && !only.includes(asset.id)) continue;
  if (results[asset.id] && !force) { console.log(`skip ${asset.id} (already optimised)`); continue; }
  const ext = asset.kind === "video" ? "mp4" : path.extname(new URL(asset.url).pathname).slice(1) || "png";
  const src = path.join(SRC_DIR, `${asset.id}.${ext}`);
  console.log(`fetch ${asset.id}`);
  await download(asset.url, src);
  if (asset.kind === "video") {
    ffmpeg ??= await ffmpegPath();
    results[asset.id] = { kind: "video", ...(await processVideo(asset, src, ffmpeg)) };
  } else {
    results[asset.id] = { kind: "image", ...(await processImage(asset, src)) };
  }
  results[asset.id].placement = asset.placement;
  console.log(`done ${asset.id}`);
}
writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(results, null, 2));
console.log(`wrote ${path.relative(ROOT, path.join(OUT_DIR, "index.json"))}`);
