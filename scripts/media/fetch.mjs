// Download Higgsfield generation results listed in manifest.json and write optimised
// web assets into public/media. Images become AVIF + WebP at the listed widths plus a
// 24px blur placeholder; videos become H.264 MP4 + VP9 WebM under the size budget, with
// a poster taken from the first frame.
//
// Usage: node scripts/media/fetch.mjs [--only=id,id] [--force] [--soft]
// Needs: node 20+, sharp (dependency). Video needs ffmpeg: ffmpeg-static (dev dependency)
// or a system ffmpeg.
//
// Raw downloads and finished output are cached in .next/cache/lienry-media (override with
// LIENRY_MEDIA_CACHE). Vercel keeps .next/cache between builds, so the prebuild step only
// downloads and encodes each asset once; later builds restore it from the cache.

import { cpSync, createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
const CACHE_DIR = process.env.LIENRY_MEDIA_CACHE
  ? path.resolve(process.env.LIENRY_MEDIA_CACHE)
  : path.join(ROOT, ".next", "cache", "lienry-media");
const SRC_DIR = path.join(CACHE_DIR, "src");
const CACHE_OUT = path.join(CACHE_DIR, "out");
const OUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "scripts", "media", "manifest.json");
const VIDEO_BUDGET_BYTES = 4 * 1024 * 1024;

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith("--only="))?.split("=")[1] ?? "").split(",").filter(Boolean);
const force = args.includes("--force");
// --soft: never fail the process (used as a prebuild step on hosts with open internet;
// on machines that cannot reach the CDN the site simply keeps its placeholders).
const soft = args.includes("--soft");

for (const dir of [SRC_DIR, CACHE_OUT, OUT_DIR]) mkdirSync(dir, { recursive: true });

function readIndex(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// An index entry is usable when every file it lists exists in the given directory.
function complete(entry, dir) {
  return Array.isArray(entry?.files) && entry.files.length > 0 && entry.files.every((f) => existsSync(path.join(dir, f)));
}

async function ffmpegPath() {
  try {
    // ffmpeg-static is a dev dependency; fall back to a system ffmpeg.
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
  const part = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body), createWriteStream(part));
  renameSync(part, dest);
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
    await sharp(src).resize({ width: w, withoutEnlargement: true }).avif({ quality: 55, effort: 4 }).toFile(`${base}.avif`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(`${base}.webp`);
    written.push(`${asset.id}-${w}.avif`, `${asset.id}-${w}.webp`);
  }
  // Tiny blur placeholder as a data URI for the blur-up while the real file loads.
  const blur = await sharp(src).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  const placeholder = `data:image/webp;base64,${blur.toString("base64")}`;
  return { width: meta.width, height: meta.height, widths, files: written, placeholder };
}

function run(bin, argv) {
  execFileSync(bin, argv, { stdio: ["ignore", "inherit", "inherit"] });
}

async function processVideo(asset, src, ffmpeg) {
  const ffprobe = ffmpeg.replace(/ffmpeg(\.exe)?$/, "ffprobe$1");
  let duration = 8;
  try {
    duration = Number(execFileSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src], { encoding: "utf8" }).trim()) || 8;
  } catch {
    // ffmpeg-static ships no ffprobe; assume the manifest length.
    duration = asset.duration ?? 8;
  }
  const height = asset.height ?? 1080;
  const targetBits = Math.floor((VIDEO_BUDGET_BYTES * 8 * 0.9) / duration);
  const mp4 = path.join(OUT_DIR, `${asset.id}.mp4`);
  const webm = path.join(OUT_DIR, `${asset.id}.webm`);
  const poster = path.join(OUT_DIR, `${asset.id}-poster.webp`);
  const posterJpg = path.join(OUT_DIR, `${asset.id}-poster.jpg`);
  const vf = `scale=-2:${height}:flags=lanczos`;
  const mp4Bits = Math.min(targetBits, 3_200_000);
  const webmBits = Math.min(Math.floor(targetBits * 0.8), 2_400_000);
  run(ffmpeg, ["-y", "-i", src, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-b:v", `${mp4Bits}`, "-maxrate", `${mp4Bits}`, "-bufsize", "6000k", "-movflags", "+faststart", mp4]);
  run(ffmpeg, ["-y", "-i", src, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", `${webmBits}`, "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", webm]);
  run(ffmpeg, ["-y", "-i", src, "-vf", `select=eq(n\\,0),${vf}`, "-frames:v", "1", "-update", "1", posterJpg]);
  await sharp(posterJpg).webp({ quality: 74 }).toFile(poster);
  const sizes = { mp4: statSync(mp4).size, webm: statSync(webm).size };
  if (sizes.mp4 > VIDEO_BUDGET_BYTES) console.warn(`WARNING ${asset.id}.mp4 is ${(sizes.mp4 / 1e6).toFixed(2)} MB, over the 4 MB budget`);
  return { duration, files: [`${asset.id}.mp4`, `${asset.id}.webm`, `${asset.id}-poster.webp`, `${asset.id}-poster.jpg`], sizes };
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const published = readIndex(path.join(OUT_DIR, "index.json"));
const cached = readIndex(path.join(CACHE_OUT, "index.json"));
const results = {};
let ffmpeg = null;
let skipped = 0;

for (const asset of manifest.assets) {
  if (only.length && !only.includes(asset.id)) {
    if (published[asset.id]) results[asset.id] = published[asset.id];
    continue;
  }
  if (!force) {
    if (complete(published[asset.id], OUT_DIR)) {
      results[asset.id] = published[asset.id];
      console.log(`keep ${asset.id}`);
      continue;
    }
    if (complete(cached[asset.id], CACHE_OUT)) {
      for (const f of cached[asset.id].files) cpSync(path.join(CACHE_OUT, f), path.join(OUT_DIR, f));
      results[asset.id] = cached[asset.id];
      console.log(`restore ${asset.id} (from cache)`);
      continue;
    }
  }
  const ext = asset.kind === "video" ? "mp4" : path.extname(new URL(asset.url).pathname).slice(1) || "png";
  const src = path.join(SRC_DIR, `${asset.id}.${ext}`);
  console.log(`fetch ${asset.id}`);
  try {
    await download(asset.url, src);
    if (asset.kind === "video") {
      ffmpeg ??= await ffmpegPath();
      results[asset.id] = { kind: "video", ...(await processVideo(asset, src, ffmpeg)) };
    } else {
      results[asset.id] = { kind: "image", ...(await processImage(asset, src)) };
    }
    results[asset.id].placement = asset.placement;
    console.log(`done ${asset.id}`);
  } catch (err) {
    skipped += 1;
    if (!soft) throw err;
    console.warn(`skip ${asset.id}: ${err.message ?? err}`);
  }
}

writeFileSync(path.join(OUT_DIR, "index.json"), `${JSON.stringify(results, null, 2)}\n`);
// Refresh the cache with everything that is now in public/media.
for (const entry of Object.values(results)) {
  for (const f of entry.files ?? []) {
    const src = path.join(OUT_DIR, f);
    const dst = path.join(CACHE_OUT, f);
    if (existsSync(src) && (!existsSync(dst) || force)) cpSync(src, dst);
  }
}
writeFileSync(path.join(CACHE_OUT, "index.json"), `${JSON.stringify(results, null, 2)}\n`);
console.log(`wrote ${path.relative(ROOT, path.join(OUT_DIR, "index.json"))}: ${Object.keys(results).length} assets ready, ${skipped} skipped`);
