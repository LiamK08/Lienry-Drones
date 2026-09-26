// Record the software view for phones and reduced motion: 12 s of the model, stepped one frame at a
// time so the recording is deterministic however slowly the headless renderer draws.
// Usage: node scripts/record-software-view.mjs [baseUrl] [wide|tall]
// Output: public/video/software-view-<variant>.{mp4,webm} and -poster.jpg
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const ffmpeg = require("ffmpeg-static");

const base = process.argv[2] ?? "http://localhost:3011";
const only = process.argv[3];
const FPS = 24;
const SECONDS = 12;
const POSTER_AT = 6.5;
const out = path.resolve("public/video");
mkdirSync(out, { recursive: true });

const variants = {
  wide: { width: 1440, height: 900, dpr: 1.5, scale: 1020 },
  tall: { width: 800, height: 1100, dpr: 1.25, scale: 720 },
};

async function record(name, v) {
  const frames = path.resolve(".next/cache/software-view-frames", name);
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.goto(`${base}/?capture=${name}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("#software").scrollIntoView({ block: "center" }));
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
  const canvas = await page.$("#software canvas");
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

function encode(name, frames, v) {
  const vf = `scale=${v.scale}:-2`;
  const mp4 = path.join(out, `software-view-${name}.mp4`);
  const webm = path.join(out, `software-view-${name}.webm`);
  const poster = path.join(out, `software-view-${name}-poster.jpg`);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%04d.jpg"), "-vf", vf, "-c:v", "libx264", "-crf", "27", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%04d.jpg"), "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-deadline", "good", "-cpu-used", "2", "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", webm]);
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-i", path.join(frames, "poster.jpg"), "-vf", vf, "-q:v", "4", poster]);
  for (const f of [mp4, webm, poster]) console.log(`${path.basename(f)}: ${(statSync(f).size / 1024).toFixed(0)} kB`);
}

// The two recordings run side by side, each in its own headless browser.
await Promise.all(
  Object.entries(variants)
    .filter(([name]) => !only || only === name)
    .map(async ([name, v]) => {
      const frames = await record(name, v);
      console.log(`${name}: ${readdirSync(frames).length - 1} frames captured, encoding`);
      encode(name, frames, v);
    }),
);
