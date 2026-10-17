// Screenshots of every route at 1440x900 and 390x844.
//
// Usage: node scripts/screenshots.mjs [baseUrl] [--bands [outDir]] [--states] [--frames] [--out dir]
//                                     [--widths 1440,390] [route ...]
//   baseUrl defaults to http://localhost:3000 (npm run start).
//   default: one full-page capture per route and width into docs/screenshots (or --out).
//   --bands: the pull request set into outDir (default docs/screenshots/redesign/): the top of each
//            page as the visitor first sees it, then one frame per band and the footer, each captured
//            whole with the fixed header hidden. The app story is opened on its progress beat first;
//            the software band keeps its default step. A relative outDir can follow --bands; an
//            absolute one is written --bands=/path, since routes also start with a slash.
//   --states: on each route, the first of each button variant ([data-button] primary, secondary,
//            tertiary), a card ([data-card]), a field (input, select or textarea), a tab, a summary and
//            an icon button ([data-icon-button]), each captured at rest and with hover, active and
//            focus-visible forced through CDP (hover on the element and its ancestors, as a pointer
//            would), 16px around it: <route>-<width>-state-<kind>-<state>.jpg.
//   --frames: each band's first reveal below the fold, brought into view and captured 0, 160, 320 and
//            640ms later: <route>-<width>-frames-<band>-<ms>.jpg.
//   --states and --frames write into --out (default docs/screenshots/states), and skip the full pages.
//
// Playwright is resolved from this project's node_modules, then from a global install.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const ROUTES = [
  ["home", "/"],
  ["platform", "/platform"],
  ["commercial", "/commercial"],
  ["homes-and-rentals", "/homes-and-rentals"],
  ["solar", "/solar"],
  ["company", "/company"],
  ["download", "/download"],
  ["register-interest", "/register-interest?type=commercial"],
  ["privacy", "/privacy"],
];
const VIEWPORTS = { 1440: [1440, 900, false], 390: [390, 844, true] };

function fail(message) {
  console.error(message);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", bands: null, states: false, frames: false, out: null, widths: [1440, 390], routes: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      console.log("Usage: node scripts/screenshots.mjs [baseUrl] [--bands [outDir] | --bands=/abs/dir] [--states] [--frames] [--out dir] [--widths 1440,390] [route ...]");
      process.exit(0);
    } else if (a === "--states") opts.states = true;
    else if (a === "--frames") opts.frames = true;
    else if (a === "--out" || a.startsWith("--out=")) {
      const eq = a.indexOf("=");
      opts.out = eq > 0 ? a.slice(eq + 1) : argv[++i];
    } else if (a === "--bands" || a.startsWith("--bands=")) {
      // A following relative path is the directory; anything starting with a slash is a route.
      const eq = a.indexOf("=");
      const next = argv[i + 1];
      opts.bands = eq > 0 ? a.slice(eq + 1) : next && !next.startsWith("-") && !/^https?:\/\//.test(next) && !next.startsWith("/") ? argv[++i] : "docs/screenshots/redesign";
    } else if (a === "--widths" || a.startsWith("--widths=")) {
      const eq = a.indexOf("=");
      opts.widths = (eq > 0 ? a.slice(eq + 1) : argv[++i] ?? "").split(",").map((w) => Number(w.trim()));
    } else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}. Usage: node scripts/screenshots.mjs [baseUrl] [--bands [outDir]] [--widths 1440,390] [route ...]`);
  }
  for (const w of opts.widths) if (!VIEWPORTS[w] && (!Number.isFinite(w) || w < 200)) fail(`Bad width ${w}.`);
  return opts;
}

// Playwright from this project first, then a global install (NODE_PATH, npm root -g, the known path).
function loadChromium() {
  const require = createRequire(import.meta.url);
  const attempt = (id) => {
    try {
      return require(id);
    } catch {
      return null;
    }
  };
  let playwright = attempt("playwright");
  if (!playwright) {
    const roots = new Set((process.env.NODE_PATH ?? "").split(path.delimiter).filter(Boolean));
    try {
      roots.add(execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim());
    } catch {
      // npm is not on the PATH; the known location below still applies.
    }
    roots.add("/opt/node22/lib/node_modules");
    for (const root of roots) {
      playwright = attempt(path.join(root, "playwright"));
      if (playwright) break;
    }
  }
  if (!playwright) fail("Playwright was not found in this project or globally.\nInstall it with: npm i -D playwright && npx playwright install chromium");
  return playwright.chromium;
}

const opts = parseArgs(process.argv.slice(2));
const chromium = loadChromium();
const routes = opts.routes.length ? opts.routes.map((r) => [r === "/" ? "home" : r.replace(/^\//, "").replace(/[/?=&]+/g, "-"), r]) : ROUTES;
const out = path.resolve(opts.out ?? opts.bands ?? (opts.states || opts.frames ? "docs/screenshots/states" : "docs/screenshots"));
mkdirSync(out, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
} catch (err) {
  fail(`Chromium could not start: ${String(err.message).split("\n")[0]}\nInstall it with: npm i -D playwright && npx playwright install chromium`);
}

// Walk the page so whileInView reveals and lazy images settle before any capture.
async function settle(page, height) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(height * 0.7)) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  return total;
}

// The bands of a page: blocks in <main> marked data-band or data-tone (looking inside plain wrappers),
// or main's own children on a page that has none, then the footer. Each gets a name for its file.
async function markBands(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    const found = [];
    const walk = (parent) => {
      for (const el of parent.children) {
        if (["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"].includes(el.tagName)) continue;
        const marked = el.hasAttribute("data-band") || el.hasAttribute("data-tone");
        if (!marked && el.querySelector("[data-band], [data-tone]")) walk(el);
        else if (el.getBoundingClientRect().height >= 1) found.push(el);
      }
    };
    if (main) walk(main);
    const footer = document.querySelector("body > footer");
    if (footer) found.push(footer);
    return found.map((el, i) => {
      el.setAttribute("data-shot", String(i));
      const name = el.tagName === "FOOTER" ? "footer" : el.getAttribute("data-band") || el.id || el.tagName.toLowerCase();
      return name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    });
  });
}

// --states: one of each kind, at rest and with each state forced through CDP.
const STATE_KINDS = [
  ["button-primary", '[data-button="primary"]'],
  ["button-secondary", '[data-button="secondary"]'],
  ["button-tertiary", '[data-button="tertiary"]'],
  ["card", "[data-card]"],
  ["field", "main input:not([type='hidden']), main select, main textarea"],
  ["tab", "main [role='tab']"],
  ["summary", "main summary"],
  ["icon-button", "[data-icon-button]"],
];
async function captureStates(page, name, width) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  let shots = 0;
  for (const [kind, selector] of STATE_KINDS) {
    const found = await page.evaluate((sel) => {
      document.querySelectorAll("[data-shot-state], [data-shot-chain]").forEach((e) => {
        e.removeAttribute("data-shot-state");
        e.removeAttribute("data-shot-chain");
      });
      const el = [...document.querySelectorAll(sel)].find((e) => !e.closest("body > header") && e.getClientRects().length > 0 && getComputedStyle(e).visibility === "visible");
      if (!el) return false;
      el.setAttribute("data-shot-state", "");
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) e.setAttribute("data-shot-chain", "");
      el.scrollIntoView({ block: "center" });
      return true;
    }, selector);
    if (!found) continue;
    await page.waitForTimeout(300);
    const box = await page.evaluate(() => {
      const r = document.querySelector("[data-shot-state]").getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    const vh = page.viewportSize()?.height ?? 900;
    const clip = { x: Math.max(0, box.x - 16), y: Math.max(0, box.y - 16), width: Math.min(width - Math.max(0, box.x - 16), box.w + 32), height: Math.min(vh - Math.max(0, box.y - 16), box.h + 32) };
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    const chain = (await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-shot-chain]" })).nodeIds;
    const [self] = (await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-shot-state]" })).nodeIds;
    const force = async (ids, classes) => {
      for (const nodeId of ids) await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: classes });
    };
    for (const [state, apply] of [
      ["rest", async () => {}],
      ["hover", () => force(chain, ["hover"])],
      ["active", async () => {
        await force(chain, ["hover"]);
        await force([self], ["hover", "active"]);
      }],
      ["focus-visible", () => force([self], ["focus", "focus-visible"])],
    ]) {
      await apply();
      await page.waitForTimeout(320);
      await page.screenshot({ path: path.join(out, `${name}-${width}-state-${kind}-${state}.jpg`), type: "jpeg", quality: 88, clip });
      await force(chain, []);
      shots++;
    }
  }
  await cdp.detach();
  return shots;
}

// --frames: each band's first reveal below the fold, at 0, 160, 320 and 640ms after it comes into view.
async function captureFrames(page, name, width) {
  const targets = await page.evaluate(() => {
    const out = [];
    for (const band of document.querySelectorAll("main [data-band]")) {
      const r = band.querySelector("[data-reveal]");
      if (!r || r.getBoundingClientRect().top < innerHeight) continue;
      const id = (band.getAttribute("data-band") || "band").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
      r.setAttribute("data-shot-frame", id);
      out.push(id);
    }
    return out;
  });
  for (const id of targets) {
    await page.evaluate((k) => document.querySelector(`[data-shot-frame="${k}"]`)?.scrollIntoView({ block: "center", behavior: "instant" }), id);
    const t0 = Date.now();
    for (const at of [0, 160, 320, 640]) {
      const left = at - (Date.now() - t0);
      if (left > 0) await page.waitForTimeout(left);
      await page.screenshot({ path: path.join(out, `${name}-${width}-frames-${id}-${String(at).padStart(3, "0")}.jpg`), type: "jpeg", quality: 82 });
    }
  }
  return targets.length;
}

const errors = [];
for (const width of opts.widths) {
  const [w, h, mobile] = VIEWPORTS[width] ?? [width, width < 800 ? 844 : 900, width < 800];
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${width} console: ${m.text().slice(0, 200)}`));
  page.on("pageerror", (e) => errors.push(`${width} pageerror: ${String(e).slice(0, 200)}`));
  for (const [name, route] of routes) {
    await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(600);
    if (opts.frames) {
      // Before any scroll, so the reveals below the fold have not run yet.
      const n = await captureFrames(page, name, width);
      console.log(`captured ${name} @ ${width}: reveal frames for ${n} band${n === 1 ? "" : "s"}`);
      if (opts.states) {
        await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(600);
      }
    }
    if (opts.states) {
      await settle(page, h);
      const n = await captureStates(page, name, width);
      console.log(`captured ${name} @ ${width}: ${n} state frames`);
    }
    if (opts.states || opts.frames) continue;
    const total = await settle(page, h);
    if (!opts.bands) {
      await page.screenshot({ path: path.join(out, `${name}-${width}.jpg`), type: "jpeg", quality: 82, fullPage: true });
      console.log(`captured ${name} @ ${width} (${total}px tall)`);
      continue;
    }

    // The app story on its progress beat (ids story-{app}, docs/REDESIGN-SPEC.md C4 section 3).
    const beat = await page.$("#story-progress[aria-expanded='false']");
    if (beat) {
      await beat.click();
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, `${name}-${width}-00-top.jpg`), type: "jpeg", quality: 82 });

    // Each band whole, without the fixed header over its top edge.
    const bands = await markBands(page);
    const hide = await page.addStyleTag({ content: "body > header { visibility: hidden !important; }" });
    for (let i = 0; i < bands.length; i++) {
      const el = await page.$(`[data-shot="${i}"]`);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await el.screenshot({ path: path.join(out, `${name}-${width}-${String(i + 1).padStart(2, "0")}-${bands[i]}.jpg`), type: "jpeg", quality: 82 });
    }
    await hide.evaluate((node) => node.remove());
    console.log(`captured ${name} @ ${width}: the top and ${bands.length} bands (${total}px tall)`);
  }
  await context.close();
}
await browser.close();
if (errors.length) {
  console.log("\nConsole/page errors:");
  for (const e of [...new Set(errors)].slice(0, 30)) console.log(" -", e);
} else {
  console.log("\nNo console or page errors.");
}
