// Capture every route at 1440 and 390 (full page plus the first viewport) into a folder.
// Usage: node scripts/shots-set.mjs <outDir> [baseUrl]
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const out = path.resolve(process.argv[2] ?? "docs/screenshots/set");
const base = process.argv[3] ?? "http://localhost:3011";
mkdirSync(out, { recursive: true });
const routes = [["home", "/"], ["platform", "/platform"], ["commercial", "/commercial"], ["homes-and-rentals", "/homes-and-rentals"], ["solar", "/solar"], ["company", "/company"], ["register-interest", "/register-interest?type=commercial"], ["privacy", "/privacy"]];
const jpg = (name, extra = {}) => ({ path: path.join(out, `${name}.jpg`), type: "jpeg", quality: 82, ...extra });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [vname, width, height, mobile] of [["1440", 1440, 900, false], ["390", 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  for (const [name, route] of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1600);
    await page.screenshot(jpg(`${name}-${vname}-top`));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(height * 0.7)) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(70);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot(jpg(`${name}-${vname}`, { fullPage: true }));
    if (name === "home") {
      await page.evaluate(() => window.scrollTo(0, 120));
      await page.waitForTimeout(500);
      await page.screenshot(jpg(`home-${vname}-scrolled`));
      if (mobile) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await page.click('button[aria-label="Open menu"]');
        await page.waitForTimeout(600);
        await page.screenshot(jpg(`home-${vname}-menu`));
      }
    }
    console.log(`captured ${name} @ ${vname} (${total}px)`);
  }
  await ctx.close();
}
await browser.close();
