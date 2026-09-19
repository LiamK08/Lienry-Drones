// Render public/og.png (1200x630) with the site's real fonts via headless Chromium.
import { createRequire } from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const root = path.resolve(".");
const font = (file) => `file://${path.join(root, "src/fonts", file)}`;
const markPath = readFileSync(path.join(root, "public/brand/lienry-mark.svg"), "utf8").match(/ d="([^"]+)"/)[1];
const mark = (cls) => `<svg class="${cls}" viewBox="0 0 529 785" fill="currentColor"><path d="${markPath}"/></svg>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Instrument Serif";src:url("${font("instrument-serif-latin-400-normal.woff2")}") format("woff2");font-weight:400}
@font-face{font-family:"Inter";src:url("${font("inter-latin-opsz-normal.woff2")}") format("woff2-variations");font-weight:100 900}
html,body{margin:0}body{width:1200px;height:630px;background:#f3efe7;color:#1c1a17;font-family:Inter,sans-serif;font-optical-sizing:auto;position:relative;overflow:hidden}
.wm{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px;font-family:"Instrument Serif";font-size:30px;letter-spacing:-.02em}
.wm span{font-family:Inter;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;opacity:.7;margin-left:6px}
.line{position:absolute;left:72px;right:72px;top:236px;height:1px;background:#dcd5c8}
.label{position:absolute;left:72px;top:256px;font-size:12px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:#5e584f}
h1{position:absolute;left:72px;top:286px;margin:0;font-family:"Instrument Serif";font-weight:400;font-size:100px;line-height:1.02;letter-spacing:-.02em;width:960px}
p{position:absolute;left:72px;top:520px;margin:0;font-size:22px;color:#5e584f;width:820px;line-height:1.45}
.mark{height:40px;width:auto;display:block}
.big{position:absolute;right:56px;top:96px;height:560px;width:auto;color:#1c1a17;opacity:.06}
</style></head><body>
${mark("big")}
<div class="wm">${mark("mark")}Lienry<span>Drones</span></div>
<div class="line"></div>
<div class="label">Resident exterior cleaning · Sydney · Pre-launch</div>
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
