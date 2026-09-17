// Research capture used for docs/DESIGN-RESEARCH.md. Visits a set of reference pages at
// 1440 and 390 wide, scrolls slowly, saves mid-animation and settled frames plus a
// full-page screenshot, and extracts computed styles into data.json per page.
// Usage: node scripts/research-capture.mjs https://example.com [outDir]
// Needs network access to the target and Playwright with Chromium (global or local).
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const origin = process.argv[2];
if (!origin) { console.error("usage: node scripts/research-capture.mjs https://site.example [outDir]"); process.exit(1); }
const OUT = path.resolve(process.argv[3] ?? "docs/research/capture");
const PAGES = [["home", "/"], ["product", "/product"], ["customers", "/customers"], ["about", "/about"]];
const VIEWPORTS = [["1440", 1440, 900], ["390", 390, 844]];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const EXTRACT = () => {
  const cs = (el) => getComputedStyle(el);
  const txt = (el) => (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 220);
  const box = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; };
  const pick = (el) => { const s = cs(el); return Object.assign({ text: txt(el), tag: el.tagName, font: s.fontFamily.split(",")[0].replace(/"/g, ""), size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, align: s.textAlign }, box(el)); };
  const all = [...document.querySelectorAll("*")];
  const heads = [...document.querySelectorAll("h1,h2,h3,h4")].filter((e) => txt(e)).slice(0, 80).map(pick);
  const paras = [...document.querySelectorAll("p")].filter((e) => txt(e).length > 24).slice(0, 60).map(pick);
  const buttons = [...document.querySelectorAll("a,button")].filter((e) => { const s = cs(e); const t = txt(e); return t && t.length < 40 && (s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.borderStyle !== "none"); }).slice(0, 30).map((e) => { const s = cs(e); return Object.assign({ text: txt(e), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, pad: s.padding }, box(e)); });
  const videos = [...document.querySelectorAll("video")].map((v) => Object.assign({ autoplay: v.autoplay, muted: v.muted, loop: v.loop, fit: cs(v).objectFit }, box(v)));
  const sections = all.filter((e) => { const r = e.getBoundingClientRect(); return r.height > 240 && r.width > innerWidth * 0.8 && e.children.length > 0; }).slice(0, 80).map((e) => { const s = cs(e); return Object.assign({ tag: e.tagName, bg: s.backgroundColor, pt: s.paddingTop, pb: s.paddingBottom, first: txt(e).slice(0, 90) }, box(e)); });
  const bodyS = cs(document.body);
  const fontCount = {}; all.slice(0, 5000).forEach((e) => { if (txt(e) && e.children.length === 0) { const f = cs(e).fontFamily.split(",")[0].replace(/"/g, ""); fontCount[f] = (fontCount[f] || 0) + 1; } });
  const colors = {}; all.slice(0, 6000).forEach((e) => { const s = cs(e); [["bg", s.backgroundColor], ["fg", s.color]].forEach(([k, c]) => { if (c && c !== "rgba(0, 0, 0, 0)") { colors[k + ":" + c] = (colors[k + ":" + c] || 0) + 1; } }); });
  const topColors = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const nums = all.filter((e) => e.children.length === 0 && /^[\d.,]+\s?[%+kKxXmM]?\+?$/.test(txt(e)) && txt(e).length < 9).slice(0, 24).map(pick);
  const maxWidths = [...new Set(all.map((e) => cs(e).maxWidth).filter((m) => m && m !== "none"))].slice(0, 20);
  return { title: document.title, url: location.href, height: document.documentElement.scrollHeight, bodyBg: bodyS.backgroundColor, fontCount, topColors, maxWidths, heads, paras, buttons, videos, sections, nums };
};
const ANIM = () => { const out = []; [...document.querySelectorAll("body *")].forEach((e) => { const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.width < 40 || r.height < 20) return; const s = getComputedStyle(e); const op = parseFloat(s.opacity); const tr = s.transform; if (op < 0.97 || (tr && tr !== "none" && tr !== "matrix(1, 0, 0, 1, 0, 0)")) out.push({ tag: e.tagName, op: +op.toFixed(2), tr: tr.slice(0, 60) }); }); return out.slice(0, 12); };

const browser = await chromium.launch({ args: ["--no-sandbox"] });
for (const [name, route] of PAGES) {
  for (const [vname, w, h] of VIEWPORTS) {
    const dir = path.join(OUT, name, vname); mkdirSync(dir, { recursive: true });
    const mobile = vname === "390";
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, userAgent: mobile ? MOBILE_UA : undefined });
    const page = await ctx.newPage(); const timeline = [];
    try {
      await page.goto(origin + route, { waitUntil: "load", timeout: 60000 }); await sleep(2500);
      await page.screenshot({ path: path.join(dir, "f000-top.jpg"), type: "jpeg", quality: 72 }); await sleep(2500);
      await page.screenshot({ path: path.join(dir, "f001-top-3s.jpg"), type: "jpeg", quality: 72 });
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      let y = 0, i = 2; const step = mobile ? 220 : 360; const frameEvery = mobile ? 760 : 820; let next = frameEvery;
      while (y < total - h && i < 24) {
        y += step; await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y); await sleep(110);
        if (y >= next) { const mid = await page.evaluate(ANIM); await page.screenshot({ path: path.join(dir, `f${String(i).padStart(3, "0")}-y${y}-mid.jpg`), type: "jpeg", quality: 72 }); await sleep(900); await page.screenshot({ path: path.join(dir, `f${String(i).padStart(3, "0")}-y${y}-settled.jpg`), type: "jpeg", quality: 72 }); timeline.push({ y, mid }); i++; next += frameEvery; }
      }
      await page.evaluate(() => window.scrollTo(0, 0)); await sleep(1500);
      await page.screenshot({ path: path.join(dir, "full.jpg"), type: "jpeg", quality: 70, fullPage: true });
      const data = await page.evaluate(EXTRACT); data.timeline = timeline;
      writeFileSync(path.join(dir, "data.json"), JSON.stringify(data));
      appendFileSync(path.join(OUT, "capture.log"), `${name}/${vname} ok\n`);
    } catch (e) { appendFileSync(path.join(OUT, "capture.log"), `${name}/${vname} ERR ${e.message}\n`); }
    await ctx.close();
  }
}
await browser.close();
console.log("done", OUT);
