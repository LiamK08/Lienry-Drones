// Screenshots of every route at 1440x900 and 390x844.
//
// Usage: node scripts/screenshots.mjs [baseUrl] [--bands [outDir]] [--widths 1440,390] [route ...]
//   default: one full-page capture per route and width into docs/screenshots (baseUrl defaults to
//            http://localhost:3011)
//   --bands: the pull request set (docs/REDESIGN-SPEC.md E3) into outDir (default
//            docs/screenshots/redesign/): the top of each page as the visitor first sees it, then one
//            frame per band and the footer, each captured whole with the fixed header hidden. The
//            app story is opened on its progress beat first; the software band keeps its default
//            step, Clean, where the wash plays. A relative outDir can follow --bands; an absolute
//            one is written --bands=/path, since routes also start with a slash.
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
  ["register-interest", "/register-interest?type=commercial"],
  ["privacy", "/privacy"],
];
const VIEWPORTS = { 1440: [1440, 900, false], 390: [390, 844, true] };

function fail(message) {
  console.error(message);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3011", bands: null, widths: [1440, 390], routes: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      console.log("Usage: node scripts/screenshots.mjs [baseUrl] [--bands [outDir] | --bands=/abs/dir] [--widths 1440,390] [route ...]");
      process.exit(0);
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
const out = path.resolve(opts.bands ?? "docs/screenshots");
mkdirSync(out, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
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
