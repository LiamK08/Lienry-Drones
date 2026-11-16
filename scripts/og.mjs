// Render public/og.png (1200x630) with the site's real fonts and the owner's logo via headless Chromium.
import { createRequire } from "node:module";
import path from "node:path";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const root = path.resolve(".");
// The fonts as data URLs: a page set from a string cannot load file:// fonts, and would fall back to Times.
const font = (file) => `data:font/woff2;base64,${readFileSync(path.join(root, "src/fonts", file)).toString("base64")}`;
// The wordmark in the owner's navy, inlined, and the badge's ring alone, faint at the right.
const inline = (file, cls) =>
  readFileSync(path.join(root, "public/brand", file), "utf8")
    .replace(/<svg ([^>]*)role="img" aria-label="[^"]*"/, `<svg class="${cls}" $1aria-hidden="true"`)
    .replace(/fill="#0a0a6d"/, 'fill="currentColor"');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"PT Serif";src:url("${font("pt-serif-latin-400-normal.woff2")}") format("woff2");font-weight:400}
@font-face{font-family:"Inter";src:url("${font("inter-latin-opsz-normal.woff2")}") format("woff2-variations");font-weight:100 900}
html,body{margin:0}body{width:1200px;height:630px;background:#f4f6f8;color:#141e28;font-family:Inter,sans-serif;font-optical-sizing:auto;position:relative;overflow:hidden}
.logo{position:absolute;left:72px;top:64px;height:44px;width:auto;display:block;color:#0a0a6d}
.ring{position:absolute;right:-210px;top:40px;width:720px;height:720px;border:20px solid #0a0a6d;border-radius:50%;box-sizing:border-box;opacity:.05}
.line{position:absolute;left:72px;right:72px;top:236px;height:1px;background:#d5dde5}
.label{position:absolute;left:72px;top:258px;font-size:15px;font-weight:500;color:#52606e}
h1{position:absolute;left:72px;top:290px;margin:0;font-family:"PT Serif";font-weight:400;font-size:92px;line-height:1.05;letter-spacing:-.025em;width:960px}
p{position:absolute;left:72px;top:520px;margin:0;font-size:22px;color:#52606e;width:820px;line-height:1.45}
</style></head><body>
<div class="ring"></div>
${inline("lienry-logo.svg", "logo")}
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
