// Scroll the home page with real wheel events and report frame rate, long frames,
// long tasks and the hottest script functions. Usage: node scripts/perf-scroll.mjs [baseUrl] [width]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const base = process.argv[2] ?? "http://localhost:3011";
const width = Number(process.argv[3] ?? 1440);
const height = width < 600 ? 844 : 900;
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600, hasTouch: width < 600 });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
await page.evaluate(() => {
  const w = window;
  w.__frames = [];
  w.__longtasks = [];
  w.__last = performance.now();
  const tick = (t) => { w.__frames.push(t - w.__last); w.__last = t; if (w.__running) requestAnimationFrame(tick); };
  w.__running = true;
  requestAnimationFrame(tick);
  try {
    const po = new PerformanceObserver((list) => { for (const e of list.getEntries()) w.__longtasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration), name: e.name }); });
    po.observe({ type: "longtask", buffered: false });
  } catch {}
});
await cdp.send("Profiler.start");
const t0 = Date.now();
const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const step = 110;
let travelled = 0;
await page.mouse.move(width / 2, height / 2);
while (travelled < total && Date.now() - t0 < 25000) {
  await page.mouse.wheel(0, step);
  travelled += step;
  await page.waitForTimeout(16);
}
const elapsed = (Date.now() - t0) / 1000;
const { profile } = await cdp.send("Profiler.stop");
const stats = await page.evaluate(() => {
  const w = window;
  w.__running = false;
  const f = w.__frames.slice(5);
  const secs = f.reduce((a, b) => a + b, 0) / 1000;
  const over50 = f.filter((d) => d > 50).length;
  const over32 = f.filter((d) => d > 32).length;
  const p95 = [...f].sort((a, b) => a - b)[Math.floor(f.length * 0.95)];
  return { frames: f.length, seconds: +secs.toFixed(2), fps: +(f.length / secs).toFixed(1), framesOver50ms: over50, framesOver32ms: over32, p95FrameMs: +p95.toFixed(1), longtasks: w.__longtasks, scrollHeight: document.documentElement.scrollHeight };
});
// Aggregate self time by function from the sampling profile.
const self = new Map();
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const deltas = profile.timeDeltas ?? [];
for (let i = 0; i < profile.samples.length; i++) {
  const n = nodes.get(profile.samples[i]);
  if (!n) continue;
  const cf = n.callFrame;
  if (cf.functionName === "(idle)" || cf.functionName === "(program)" || cf.functionName === "(garbage collector)") continue;
  const key = `${cf.functionName || "(anonymous)"} ${cf.url ? cf.url.split("/").pop().split("?")[0] : ""}:${cf.lineNumber}`;
  self.set(key, (self.get(key) ?? 0) + (deltas[i] ?? 0) / 1000);
}
const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${v.toFixed(0)} ms  ${k}`);
const totalScript = [...self.values()].reduce((a, b) => a + b, 0);
console.log(JSON.stringify({ width, travelled, wallSeconds: +elapsed.toFixed(1), ...stats, scriptMsTotal: Math.round(totalScript) }, null, 1));
console.log("hottest functions (self time):\n  " + top.join("\n  "));
await browser.close();
