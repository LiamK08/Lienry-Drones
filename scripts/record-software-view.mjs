// Record the software view for phones and reduced motion: 12 s of the model, stepped one frame at a
// time so the recording is deterministic however slowly the headless renderer draws.
// Usage: node scripts/record-software-view.mjs [baseUrl] [wide|tall] [--model=building|solar] [--encode-only]
// Output: public/video/<stem>-<variant>.{mp4,webm} and -poster.jpg, where the stem is software-view
// (the building, recorded on /download) or solar-view (the solar array, recorded on /solar).
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const ffmpeg = require("ffmpeg-static");
const sharp = require("sharp");

const base = process.argv[2] ?? "http://localhost:3011";
const only = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : undefined;
const MODELS = { building: { page: "/download", stem: "software-view" }, solar: { page: "/solar", stem: "solar-view" } };
const modelArg = process.argv.find((a) => a.startsWith("--model="))?.slice("--model=".length) ?? "building";
const model = MODELS[modelArg];
if (!model) throw new Error(`Unknown model ${modelArg}: use ${Object.keys(MODELS).join(" or ")}`);
const FPS = 24;
const SECONDS = 12;
const POSTER_AT = 6.5;
const out = path.resolve("public/video");
mkdirSync(out, { recursive: true });

// The model view is held at a fixed size so every recording keeps its frame: wide is 680x504 CSS px
// at 1.5x (1020x756), tall 576x720 at 1.25x (720x900). The window's own overlays (status card,
// compass, poster) are hidden, so only the canvas is recorded.
const variants = {
  wide: { width: 1440, height: 900, dpr: 1.5, scale: 1020, out: 756, view: [680, 504] },
  tall: { width: 800, height: 1100, dpr: 1.25, scale: 720, out: 900, view: [576, 720] },
};

async function record(name, v) {
  const frames = path.resolve(".next/cache", `${model.stem}-frames`, name);
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.goto(`${base}${model.page}?capture=${name}`, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `[data-model-view] { width: ${v.view[0]}px !important; height: ${v.view[1]}px !important; aspect-ratio: auto !important; max-width: none !important; justify-self: start; }
      [data-model-view] > :not(:first-child) { display: none !important; }`,
  });
  await page.evaluate(() => document.querySelector("[data-model-view]").scrollIntoView({ block: "center" }));
  await page.waitForFunction(() => !!window.__lienryCapture, null, { timeout: 30000 });
  const raf = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const step = async (ms) => {
    await page.evaluate((t) => window.__lienryCapture.step(t), ms);
    await raf();
  };
  // Settle: first frame compiles the shaders and renders the environment once.
  await step(0);
  await page.waitForTimeout(800);
  await step(0);
  await page.getByRole("group", { name: "Layers" }).getByRole("button", { name: "Scan", exact: true }).click();
  const canvas = await page.$("[data-model-view] canvas");
  const total = FPS * SECONDS;
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    const t = (i * 1000) / FPS;
    if (i === Math.round(FPS * 5.2)) await page.getByRole("group", { name: "Layers" }).getByRole("button", { name: "Scan", exact: true }).click();
    await step(t);
    await canvas.screenshot({ path: path.join(frames, `${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 94 });
    if (i === Math.round(FPS * POSTER_AT)) await canvas.screenshot({ path: path.join(frames, "poster.jpg"), type: "jpeg", quality: 84 });
    if (i % 48 === 0) console.log(`${name}: frame ${i}/${total} (${Math.round((Date.now() - started) / 1000)} s)`);
  }
  await browser.close();
  return frames;
}

async function encode(name, frames, v) {
  // A canvas a row or two taller than its box is cropped to the exact frame the window is built around.
  const vf = `scale=${v.scale}:-2,crop=${v.scale}:${v.out}`;
  const mp4 = path.join(out, `${model.stem}-${name}.mp4`);
  const webm = path.join(out, `${model.stem}-${name}.webm`);
  const poster = path.join(out, `${model.stem}-${name}-poster.jpg`);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%04d.jpg"), "-vf", vf, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%04d.jpg"), "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-deadline", "good", "-cpu-used", "2", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", webm]);
  // The poster is the phone LCP image on /download: mozjpeg at 76 keeps it near 55 KB.
  await sharp(path.join(frames, "poster.jpg")).resize(v.scale).extract({ left: 0, top: 0, width: v.scale, height: v.out }).jpeg({ quality: 76, mozjpeg: true }).toFile(poster);
  for (const f of [mp4, webm, poster]) console.log(`${path.basename(f)}: ${(statSync(f).size / 1024).toFixed(0)} kB`);
}

// The two recordings run side by side, each in its own headless browser.
await Promise.all(
  Object.entries(variants)
    .filter(([name]) => !only || only === name)
    .map(async ([name, v]) => {
      const cached = path.resolve(".next/cache", `${model.stem}-frames`, name);
      const frames = process.argv.includes("--encode-only") ? cached : await record(name, v);
      console.log(`${name}: ${readdirSync(frames).length - 1} frames captured, encoding`);
      await encode(name, frames, v);
    }),
);
