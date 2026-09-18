// Render public/og.png (1200x630) with the site's real fonts via headless Chromium.
import { createRequire } from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const root = path.resolve(".");
const font = (pkg, file) => `file://${path.join(root, "node_modules/@fontsource-variable", pkg, "files", file)}`;
const markPath = readFileSync(path.join(root, "public/brand/lienry-mark.svg"), "utf8").match(/ d="([^"]+)"/)[1];
const mark = (cls) => `<svg class="${cls}" viewBox="0 0 529 785" fill="currentColor"><path d="${markPath}"/></svg>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Newsreader";src:url("${font("newsreader","newsreader-latin-opsz-normal.woff2")}") format("woff2");font-weight:200 800}
@font-face{font-family:"Hanken";src:url("${font("hanken-grotesk","hanken-grotesk-latin-wght-normal.woff2")}") format("woff2");font-weight:100 900}
@font-face{font-family:"GeistMono";src:url("${font("geist-mono","geist-mono-latin-wght-normal.woff2")}") format("woff2");font-weight:100 900}
html,body{margin:0}body{width:1200px;height:630px;background:#f3efe7;color:#1c1a17;font-family:Hanken,sans-serif;position:relative;overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(90% 70% at 85% 10%,#dcedf0 0%,rgba(220,237,240,0) 60%),linear-gradient(180deg,#f3efe7 0%,#e9e3d8 100%)}
.wm{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px;font-family:Newsreader;font-size:30px}
.wm span{font-family:Hanken;font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.7;margin-left:6px}
.eyebrow{position:absolute;left:72px;top:250px;font-family:GeistMono;font-weight:500;font-size:16px;letter-spacing:.1em;text-transform:uppercase;color:#5e584f}
h1{position:absolute;left:72px;top:282px;margin:0;font-family:Newsreader;font-weight:300;font-size:92px;line-height:1.02;letter-spacing:-.015em;width:900px}
p{position:absolute;left:72px;top:520px;margin:0;font-size:22px;color:#5e584f;width:820px;line-height:1.4}
.line{position:absolute;left:72px;right:72px;top:236px;height:1px;background:#dcd5c8}
.mark{height:40px;width:auto;display:block}
.big{position:absolute;right:56px;top:96px;height:560px;width:auto;color:#0f6a7c;opacity:.09}
.water{position:absolute;right:0;bottom:0;width:520px;height:630px;background:linear-gradient(105deg,rgba(15,106,124,0) 0%,rgba(15,106,124,.06) 45%,rgba(15,106,124,0) 46%,rgba(15,106,124,0) 62%,rgba(15,106,124,.05) 80%,rgba(15,106,124,0) 81%)}
</style></head><body><div class="bg"></div><div class="water"></div>
${mark("big")}
<div class="wm">${mark("mark")}Lienry<span>Drones</span></div>
<div class="line"></div>
<div class="eyebrow">Resident exterior cleaning · Sydney · Pre-launch</div>
<h1>Clean exteriors.<br>Nobody on site.</h1>
<p>A resident cleaning drone that lives on your property and washes glass, solar panels, walls, roofing and driveways on buildings under 70 metres.</p>
</body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(200);
await page.screenshot({ path: "public/og.png", type: "png" });
await browser.close();
console.log("wrote public/og.png", readFileSync("public/og.png").length, "bytes");
