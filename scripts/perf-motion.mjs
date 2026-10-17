// perf:motion: the motion checks of the October 2026 design pass (spec D5, checks 39 and 40).
//
// Usage: npm run perf:motion -- <baseUrl> [route ...] [--profile desktop|mobile] [--gpu] [--json out]
//   e.g. npm run build && npm run start, then npm run perf:motion -- http://localhost:3000
//
// The gated configuration renders with SwiftShader and tells the page navigator.hardwareConcurrency is
// 2, so the software window plays its recording instead of drawing live WebGL; after it, the scroll
// scenario runs once more with live WebGL and is reported only. --gpu runs on the machine's GPU with the
// real concurrency (live WebGL) and also gates frame pacing.
//
// Instrumentation: a requestAnimationFrame delta sampler; a long-animation-frame observer and a longtask
// observer; CDP Performance metrics (LayoutCount); a MutationObserver on style attributes under
// [data-reveal], [data-zoom], [data-hover-clip] and the items of scrolling tracks; transitionrun and
// animationstart events in the same places; and a wrapper on Element.prototype.animate that logs the
// keyframe properties of every scripted animation.
//
// Scenarios, per route: scroll (wheel 100px every 16ms; on mobile, touch scroll gestures through CDP),
// on a fresh load so the reveals fire as a visitor would see them; then, on a second fresh load, every
// reveal brought into view one at a time (with every image already loaded and the page off the top, so
// a reveal is not charged for an image's first decode or the header's scroll switch); hovering each
// [data-hover-clip] for 1,200ms; each carousel's
// next control pressed n-1 times, 700ms apart; every tablist's tabs selected in turn (the band's height
// must not change); and each FAQ item opened and closed.
//
// 39  Per scenario: the long animation frames' blockingDuration sums to 50ms or less, and no long task
//     runs over 50ms. Per reveal and per hover, LayoutCount grows by 2 at most. Frame pacing (rAF p50,
//     p95, max, and the share of frames over 25ms) is printed; with --gpu it gates: p95 at most 17.5ms,
//     at most 5% of frames over 25ms, no frame over 50ms.
// 40  Everything those scenarios animate or restyle changes only opacity, transform, translate, scale,
//     rotate, will-change or visibility. Interactive controls' own state transitions (buttons, links,
//     fields, tabs) are check 37's (check:a11y) and are not counted here.
//
// Exit code: 0 when every check passes, 1 when any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy"];
const ALLOWED = new Set(["opacity", "transform", "translate", "scale", "rotate", "will-change", "visibility"]);
const GATE = { loafMs: 50, longTaskMs: 50, layouts: 2, p95: 17.5, slowShare: 0.05, maxFrame: 50 };
const SWIFTSHADER = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const PROFILES = {
  desktop: { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

function usage() {
  console.log(`Usage: node scripts/perf-motion.mjs <baseUrl> [route ...] [options]

Runs the design pass's motion checks: 39 (main-thread work and layouts while things move) and 40
(only opacity and transforms animate).

  <baseUrl>                  the served build, e.g. http://localhost:3000 (default)
  route                      one or more routes (default: all nine)
  --profile desktop|mobile   1440x900 with a mouse (default) or 390x844 with touch
  --gpu                      the machine's GPU and live WebGL; frame pacing gates too
  --json <file>              also write the full report as JSON`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], profile: "desktop", gpu: false, json: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const eq = a.indexOf("=");
      if (eq > 0) return a.slice(eq + 1);
      if (i + 1 >= argv.length) fail(`${a} needs a value.`);
      return argv[++i];
    };
    if (a === "--help" || a === "-h") {
      usage();
      process.exit(0);
    } else if (a.startsWith("--profile")) opts.profile = value();
    else if (a === "--gpu") opts.gpu = true;
    else if (a.startsWith("--json")) opts.json = value();
    else if (a.startsWith("--")) fail(`Unknown option ${a}.`, true);
    else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}: pass a base URL (http://...) and routes starting with /.`, true);
  }
  if (!PROFILES[opts.profile]) fail("--profile must be desktop or mobile.");
  if (!opts.routes.length) opts.routes = ROUTES;
  return opts;
}

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

// Installed before any page script runs.
function instrument(cfg) {
  if (cfg.cores) {
    try {
      Object.defineProperty(Navigator.prototype, "hardwareConcurrency", { get: () => cfg.cores, configurable: true });
    } catch {
      // Not redefinable here: the window may draw live, which the report shows.
    }
  }
  const M = (window.__p7motion = { frames: [], loaf: [], longtasks: [], props: [], sampling: false, last: 0 });
  const tick = (t) => {
    if (M.sampling && M.last) M.frames.push(t - M.last);
    M.last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) M.loaf.push({ start: e.startTime, duration: e.duration, blocking: e.blockingDuration ?? 0 });
    }).observe({ type: "long-animation-frame", buffered: false });
  } catch {
    M.noLoaf = true;
  }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) M.longtasks.push({ start: e.startTime, duration: e.duration });
    }).observe({ type: "longtask", buffered: false });
  } catch {
    M.noLongtask = true;
  }
  const SCOPE = "[data-reveal], [data-zoom], [data-hover-clip]";
  const CONTROL = "[data-button], [data-icon-button], a, button, summary, input, select, textarea, [role='tab'], .link, .link-list";
  const inTrack = (el) => {
    const li = el.closest("li");
    const ul = li?.parentElement;
    return !!ul && /(auto|scroll)/.test(getComputedStyle(ul).overflowX);
  };
  const watched = (el) => el instanceof Element && (el.closest(SCOPE) || inTrack(el)) && !el.closest("body > header");
  const name = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
    return `<${el.tagName.toLowerCase()}${id}${cls}>`;
  };
  const record = (prop, el, how) => {
    const p = prop.trim().toLowerCase();
    if (!p || p === "offset" || p === "easing" || p === "composite") return;
    M.props.push({ prop: p, how, what: name(el), t: performance.now() });
  };
  const parse = (s) => {
    const out = new Map();
    for (const part of (s || "").split(";")) {
      const i = part.indexOf(":");
      if (i > 0) out.set(part.slice(0, i).trim().toLowerCase(), part.slice(i + 1).trim());
    }
    return out;
  };
  new MutationObserver((list) => {
    for (const m of list) {
      if (!watched(m.target)) continue;
      const before = parse(m.oldValue);
      const after = parse(m.target.getAttribute("style"));
      for (const k of new Set([...before.keys(), ...after.keys()])) if (before.get(k) !== after.get(k)) record(k, m.target, "style");
    }
  }).observe(document, { attributes: true, attributeOldValue: true, attributeFilter: ["style"], subtree: true });
  document.addEventListener(
    "transitionrun",
    (e) => {
      if (watched(e.target) && !e.target.matches(CONTROL)) record(e.propertyName, e.target, "transition");
    },
    true,
  );
  document.addEventListener(
    "animationstart",
    (e) => {
      if (!watched(e.target)) return;
      for (const rule of document.getAnimations?.() ?? []) {
        if (rule.effect?.target !== e.target) continue;
        for (const k of rule.effect.getKeyframes?.() ?? []) for (const p of Object.keys(k)) if (!["offset", "easing", "composite", "computedOffset"].includes(p)) record(p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), e.target, "css animation");
      }
    },
    true,
  );
  const animate = Element.prototype.animate;
  Element.prototype.animate = function (keyframes, options) {
    try {
      if (!this.closest("body > header")) {
        const frames = Array.isArray(keyframes) ? keyframes : keyframes ? [keyframes] : [];
        const keys = new Set();
        for (const f of frames) for (const k of Object.keys(f || {})) keys.add(k);
        if (!Array.isArray(keyframes) && keyframes) for (const k of Object.keys(keyframes)) keys.add(k);
        for (const k of keys) record(k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), this, "animate()");
      }
    } catch {
      // Logging never stops the animation.
    }
    return animate.call(this, keyframes, options);
  };
  M.mark = () => ({ frames: M.frames.length, loaf: M.loaf.length, longtasks: M.longtasks.length, props: M.props.length });
}

const opts = parseArgs(process.argv.slice(2));
const chromium = loadChromium();
const profile = PROFILES[opts.profile];

try {
  const res = await fetch(`${opts.base}/`, { redirect: "manual" });
  if (res.status >= 500) throw new Error(`status ${res.status}`);
} catch (err) {
  fail(`Cannot reach ${opts.base} (${err.message}). Serve a production build first (npm run build && npm run start) and pass its URL.`);
}

const browsers = {};
async function browserFor(kind) {
  if (!browsers[kind]) browsers[kind] = await chromium.launch({ args: kind === "gpu" ? ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] : SWIFTSHADER });
  return browsers[kind];
}

async function open(route, { cores, gpu }) {
  const browser = await browserFor(gpu ? "gpu" : "swiftshader");
  const context = await browser.newContext({ ...profile });
  await context.addInitScript(instrument, { cores });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  const res = await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 90000 });
  if (!res || res.status() >= 400) {
    await context.close();
    throw new Error(`HTTP ${res ? res.status() : "no response"}`);
  }
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(1500);
  return { context, page, cdp, errors };
}

const layoutCount = async (cdp) => (await cdp.send("Performance.getMetrics")).metrics.find((m) => m.name === "LayoutCount")?.value ?? 0;

// Measures one scenario: frames, long animation frames, long tasks and restyled properties in between.
async function measure(page, cdp, label, run) {
  await page.evaluate(() => {
    window.__p7motion.sampling = true;
    window.__p7motion.last = 0;
  });
  const from = await page.evaluate(() => window.__p7motion.mark());
  const l0 = await layoutCount(cdp);
  const extra = (await run()) ?? {};
  await page.waitForTimeout(250);
  const l1 = await layoutCount(cdp);
  const data = await page.evaluate((f) => {
    const M = window.__p7motion;
    M.sampling = false;
    return { frames: M.frames.slice(f.frames), loaf: M.loaf.slice(f.loaf), longtasks: M.longtasks.slice(f.longtasks), props: M.props.slice(f.props), noLoaf: !!M.noLoaf };
  }, from);
  const frames = [...data.frames].sort((a, b) => a - b);
  const pct = (p) => (frames.length ? frames[Math.min(frames.length - 1, Math.floor(frames.length * p))] : 0);
  return {
    label,
    frames: frames.length,
    p50: pct(0.5),
    p95: pct(0.95),
    max: frames.length ? frames[frames.length - 1] : 0,
    slowShare: frames.length ? frames.filter((d) => d > 25).length / frames.length : 0,
    loafBlocking: data.loaf.reduce((s, e) => s + e.blocking, 0),
    loafCount: data.loaf.length,
    longest: data.longtasks.reduce((m, t) => Math.max(m, t.duration), 0),
    longtasks: data.longtasks.length,
    layouts: l1 - l0,
    props: data.props,
    noLoaf: data.noLoaf,
    ...extra,
  };
}

async function scrollThrough(page, cdp) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  if (opts.profile === "mobile") {
    for (let y = 0; y < total; y += 600) {
      await cdp.send("Input.synthesizeScrollGesture", { x: 195, y: 600, yDistance: -600, speed: 1200, gestureSourceType: "touch", repeatCount: 1 });
    }
  } else {
    await page.mouse.move(profile.viewport.width / 2, profile.viewport.height / 2);
    for (let y = 0; y < total; y += 100) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(16);
    }
  }
  await page.waitForTimeout(800);
}

const report = { base: opts.base, when: new Date().toISOString(), profile: opts.profile, gpu: opts.gpu, routes: [] };
let totalFailures = 0;
const byCheck = {};
const fmt = (n) => `${Math.round(n * 10) / 10}ms`;

console.log(`perf:motion  ${opts.base}`);
console.log(`Checks 39 and 40, ${opts.profile} profile, ${opts.gpu ? "the machine's GPU with live WebGL (frame pacing gates)" : "SwiftShader with hardwareConcurrency 2 (the window records); live WebGL reported only"}`);

for (const route of opts.routes) {
  const failures = [];
  const notes = [];
  const results = [];
  const add = (check, kind, sample = "") => failures.push({ check, kind, sample });
  const judge = (r, { layoutsPer = null } = {}) => {
    results.push(r);
    if (r.loafBlocking > GATE.loafMs) add(39, `${r.label}: long animation frames block for ${fmt(r.loafBlocking)} (over ${GATE.loafMs}ms)`, `${r.loafCount} frame${r.loafCount === 1 ? "" : "s"}`);
    if (r.longest > GATE.longTaskMs) add(39, `${r.label}: a long task of ${fmt(r.longest)} (over ${GATE.longTaskMs}ms)`, `${r.longtasks} long task${r.longtasks === 1 ? "" : "s"}`);
    if (layoutsPer !== null && r.layouts > layoutsPer) add(39, `${r.label}: LayoutCount grows by ${r.layouts} (at most ${layoutsPer})`, r.target ?? "");
    if (opts.gpu && r.frames > 10) {
      if (r.p95 > GATE.p95) add(39, `${r.label}: rAF p95 ${fmt(r.p95)} (over ${GATE.p95}ms)`);
      if (r.slowShare > GATE.slowShare) add(39, `${r.label}: ${(r.slowShare * 100).toFixed(1)}% of frames over 25ms (over 5%)`);
      if (r.max > GATE.maxFrame) add(39, `${r.label}: a ${fmt(r.max)} frame (over ${GATE.maxFrame}ms)`);
    }
    const bad = new Map();
    for (const p of r.props) if (!ALLOWED.has(p.prop) && !bad.has(`${p.prop}|${p.what}`)) bad.set(`${p.prop}|${p.what}`, p);
    for (const p of bad.values()) add(40, `${r.label}: ${p.prop} changes (${p.how})`, p.what);
  };
  console.log("");
  let pageErrors = [];
  try {
    const live = opts.gpu ? { cores: null, gpu: true } : { cores: 2, gpu: false };
    // Scroll, on a fresh load, reveals and all.
    {
      const { context, page, cdp, errors } = await open(route, live);
      judge(await measure(page, cdp, "scroll", () => scrollThrough(page, cdp)));
      pageErrors = errors;
      await context.close();
    }
    // The rest, on a second fresh load.
    const { context, page, cdp, errors } = await open(route, live);
    const reveals = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal]")].filter((e) => e.getBoundingClientRect().top > innerHeight);
      els.forEach((e, i) => e.setAttribute("data-p7-reveal", String(i)));
      return els.length;
    });
    // A reveal is charged for its own work only. Chrome lays out once when a lazy image first decodes
    // (an image box sized in % rather than fixed px), and the frozen header restyles once when the
    // page leaves the top; neither belongs to the reveal that happens to scroll into view with them.
    // So every image is loaded, and the page has left the top, before the reveals are measured.
    await page.evaluate(async () => {
      const imgs = [...document.images];
      for (const img of imgs) if (img.loading === "lazy") img.loading = "eager";
      const loaded = Promise.all(imgs.map((img) => (img.complete && img.naturalWidth ? null : img.decode().catch(() => null))));
      await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))]);
      window.scrollTo(0, 120);
    });
    await page.waitForTimeout(1000);
    let revealLayouts = 0;
    for (let i = 0; i < reveals; i++) {
      const r = await measure(page, cdp, `reveal ${i + 1}`, async () => {
        const target = await page.evaluate((k) => {
          const e = document.querySelector(`[data-p7-reveal="${k}"]`);
          if (!e || Number(getComputedStyle(e).opacity) >= 0.99) return null;
          e.scrollIntoView({ block: "center", behavior: "instant" });
          return `<${e.tagName.toLowerCase()}> "${(e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`;
        }, i);
        if (!target) return { skipped: true };
        await page.waitForTimeout(900);
        return { target };
      });
      if (r.skipped) continue; // already revealed by an earlier scroll
      revealLayouts = Math.max(revealLayouts, r.layouts);
      judge(r, { layoutsPer: GATE.layouts });
    }
    const revealProps = [...new Set(results.filter((x) => /^reveal \d/.test(x.label)).flatMap((x) => x.props.map((q) => q.prop)))];
    notes.push(`reveals: ${reveals} below the fold at load; the most layouts one caused: ${revealLayouts}; restyled: ${revealProps.join(", ") || "nothing"}`);
    // Hover clips (desktop only: a touch screen has no hover).
    const clips = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-hover-clip]")];
      els.forEach((e, i) => e.setAttribute("data-p7-clip", String(i)));
      return els.length;
    });
    if (opts.profile === "desktop") {
      for (let i = 0; i < clips; i++) {
        await page.locator(`[data-p7-clip="${i}"]`).scrollIntoViewIfNeeded();
        await page.mouse.move(2, profile.viewport.height - 2);
        await page.waitForTimeout(500);
        // The hover itself: the pointer arrives and stays 1,200ms (the clip arms, loads and plays).
        const r = await measure(page, cdp, `hover clip ${i + 1}`, async () => {
          await page.hover(`[data-p7-clip="${i}"]`);
          await page.waitForTimeout(1200);
        });
        judge(r, { layoutsPer: GATE.layouts });
        await page.mouse.move(2, profile.viewport.height - 2);
        await page.waitForTimeout(300);
      }
    }
    // Carousels: next n-1 times.
    const tracks = await page.evaluate(() => {
      const out = [];
      for (const ul of document.querySelectorAll("main ul, main ol")) {
        if (!/(auto|scroll)/.test(getComputedStyle(ul).overflowX) || ul.scrollWidth <= ul.clientWidth + 2) continue;
        const k = out.length;
        ul.setAttribute("data-p7-track", String(k));
        // The next control: aria-controls pointing at the track, or the track's own pair of buttons.
        const byId = ul.id ? [...document.querySelectorAll(`button[aria-controls="${CSS.escape(ul.id)}"]`)] : [];
        const local = ul.parentElement ? [...ul.parentElement.querySelectorAll(":scope > div button")] : [];
        const next = (byId.length >= 2 ? byId : local)[1];
        if (next) next.setAttribute("data-p7-next", String(k));
        out.push({ k, items: [...ul.children].length, next: !!next });
      }
      return out;
    });
    for (const t of tracks) {
      if (!t.next) {
        notes.push(`carousel ${t.k + 1}: no next control found`);
        continue;
      }
      await page.locator(`[data-p7-track="${t.k}"]`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const r = await measure(page, cdp, `carousel ${t.k + 1}`, async () => {
        for (let n = 0; n < t.items - 1; n++) {
          await page.click(`[data-p7-next="${t.k}"]`, { force: true }).catch(() => {});
          await page.waitForTimeout(700);
        }
      });
      judge(r);
    }
    // Tabs: each tab in turn; the band's height stays put.
    const lists = await page.evaluate(() => {
      const out = [];
      for (const list of document.querySelectorAll("main [role='tablist']")) {
        const k = out.length;
        list.setAttribute("data-p7-tabs", String(k));
        out.push({ k, n: list.querySelectorAll("[role='tab']").length, label: list.getAttribute("aria-label") || "" });
      }
      return out;
    });
    for (const l of lists) {
      await page.locator(`[data-p7-tabs="${l.k}"]`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const heights = [];
      const r = await measure(page, cdp, `tabs ${l.label || l.k + 1}`, async () => {
        for (let n = 0; n < l.n; n++) {
          await page.evaluate(
            ([k, i]) => {
              const tabs = document.querySelectorAll(`[data-p7-tabs="${k}"] [role='tab']`);
              tabs[i]?.click();
            },
            [l.k, n],
          );
          await page.waitForTimeout(500);
          heights.push(await page.evaluate((k) => {
            const list = document.querySelector(`[data-p7-tabs="${k}"]`);
            const band = list.closest("[data-band]") || list.closest("section") || list.parentElement;
            return Math.round(band.getBoundingClientRect().height * 10) / 10;
          }, l.k));
        }
      });
      judge(r);
      const spread = Math.max(...heights) - Math.min(...heights);
      if (spread > 1) add(39, `tabs ${l.label || l.k + 1}: the band's height changes by ${Math.round(spread)}px across the tabs`, heights.join(", "));
    }
    // FAQ: open and close each item.
    const items = await page.evaluate(() => {
      const sums = [...document.querySelectorAll("main [data-accordion] summary, main details > summary")].filter((s) => !s.closest("[data-ui], [data-software-preview]") && s.getClientRects().length);
      const uniq = [...new Set(sums)];
      uniq.forEach((s, i) => s.setAttribute("data-p7-q", String(i)));
      return uniq.length;
    });
    if (items) {
      await page.locator('[data-p7-q="0"]').scrollIntoViewIfNeeded();
      const r = await measure(page, cdp, "faq open and close", async () => {
        for (let i = 0; i < items; i++) {
          await page.evaluate((k) => document.querySelector(`[data-p7-q="${k}"]`)?.scrollIntoView({ block: "center", behavior: "instant" }), i);
          await page.evaluate((k) => document.querySelector(`[data-p7-q="${k}"]`)?.click(), i);
          await page.waitForTimeout(300);
          await page.evaluate((k) => document.querySelector(`[data-p7-q="${k}"]`)?.click(), i);
          await page.waitForTimeout(200);
        }
      });
      judge(r);
    }
    pageErrors = [...pageErrors, ...errors];
    await context.close();
    // Live WebGL, reported only.
    if (!opts.gpu) {
      const live2 = await open(route, { cores: null, gpu: false });
      const r = await measure(live2.page, live2.cdp, "scroll (live WebGL, reported only)", () => scrollThrough(live2.page, live2.cdp));
      notes.push(`live WebGL scroll (report only): rAF p50 ${fmt(r.p50)}, p95 ${fmt(r.p95)}, max ${fmt(r.max)}, ${(r.slowShare * 100).toFixed(1)}% over 25ms; long animation frames block ${fmt(r.loafBlocking)}; longest task ${fmt(r.longest)}`);
      await live2.context.close();
    }
  } catch (err) {
    add(39, "the scenarios could not run", String(err.message).split("\n")[0]);
  }
  for (const e of [...new Set(pageErrors)]) add("page", "page error", e);

  totalFailures += failures.length;
  for (const f of failures) byCheck[f.check] = (byCheck[f.check] ?? 0) + 1;
  console.log(`${route}  ${failures.length ? `${failures.length} failure${failures.length === 1 ? "" : "s"}` : "all pass"}`);
  for (const f of failures) console.log(`       FAIL [${f.check}] ${f.kind}${f.sample ? `: ${f.sample}` : ""}`);
  for (const r of results.filter((x) => !/^reveal \d/.test(x.label) || x.loafBlocking > GATE.loafMs || x.longest > GATE.longTaskMs)) {
    console.log(`  ${r.label.padEnd(26)} rAF p50 ${fmt(r.p50)}, p95 ${fmt(r.p95)}, max ${fmt(r.max)} (${r.frames} frames, ${(r.slowShare * 100).toFixed(1)}% over 25ms); LoAF blocking ${fmt(r.loafBlocking)}; longest task ${fmt(r.longest)}; layouts ${r.layouts}; restyled: ${[...new Set(r.props.map((x) => x.prop))].join(", ") || "nothing"}${r.noLoaf ? "; no LoAF support" : ""}`);
  }
  for (const n of notes) console.log(`  note  ${n}`);
  report.routes.push({ route, failures, notes, results: results.map(({ props, ...r }) => ({ ...r, props: [...new Set(props.map((p) => p.prop))] })) });
}

for (const b of Object.values(browsers)) await b.close();
console.log("");
console.log(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} (${opts.profile}${opts.gpu ? ", GPU" : ""}).`);
console.log(`  [39] main-thread work, layouts${opts.gpu ? " and frame pacing" : ""}: ${byCheck[39] ? `${byCheck[39]} failing` : "pass"}`);
console.log(`  [40] only opacity and transforms animate: ${byCheck[40] ? `${byCheck[40]} failing` : "pass"}`);
if (byCheck.page) console.log(`  [page] page errors: ${byCheck.page} failing`);
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
