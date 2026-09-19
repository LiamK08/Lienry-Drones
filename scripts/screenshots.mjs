// Screenshot every route at 1440 and 390 wide into docs/screenshots.
// Usage: node scripts/screenshots.mjs [baseUrl]   (default http://localhost:3011)
// Uses the globally installed Playwright (set NODE_PATH) or a local one.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
}

const base = process.argv[2] ?? "http://localhost:3011";
const out = path.resolve("docs/screenshots");
mkdirSync(out, { recursive: true });
const routes = [
  ["home", "/"],
  ["platform", "/platform"],
  ["commercial", "/commercial"],
  ["homes-and-rentals", "/homes-and-rentals"],
  ["solar", "/solar"],
  ["company", "/company"],
  ["register-interest", "/register-interest?type=commercial"],
  ["privacy", "/privacy"],
];
const viewports = [
  ["1440", 1440, 900, false],
  ["390", 390, 844, true],
];
const errors = [];
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [vname, width, height, mobile] of viewports) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${vname} console: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => errors.push(`${vname} pageerror: ${String(e).slice(0, 200)}`));
  for (const [name, route] of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Walk the page so whileInView reveals fire before the full-page capture.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(height * 0.7)) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(90);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `${name}-${vname}.jpg`), type: "jpeg", quality: 82, fullPage: true });
    console.log(`captured ${name} @ ${vname} (${total}px tall)`);
  }
  await ctx.close();
}
await browser.close();
if (errors.length) {
  console.log("\nConsole/page errors:");
  for (const e of [...new Set(errors)].slice(0, 30)) console.log(" -", e);
} else {
  console.log("\nNo console or page errors.");
}
