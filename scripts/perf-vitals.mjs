// perf:vitals: the load checks of the October 2026 design pass (spec D4, checks 38 and 42).
//
// Usage: npm run perf:vitals -- <baseUrl> [route ...] [--runs 3] [--profile mobile|desktop]
//                                 [--throttling devtools|simulate] [--json out]
//   e.g. npm run build && npm run start, then npm run perf:vitals -- http://localhost:3000
//
// 38  The gate. Each route is measured --runs times (3 by default) with Lighthouse 13.5.0
//     (npx -y lighthouse@13.5.0, performance only, APPLIED throttling: --throttling-method=devtools, a
//     real 4x CPU slowdown on a throttled network; --form-factor=mobile, or the desktop preset with
//     --profile desktop). The median largest-contentful-paint must be 2,500ms or less and the median
//     cumulative-layout-shift 0.1 or less. Simulated throttling is not the gate: on a localhost build
//     every request finishes before the first paint, so its model counts every script and font as
//     blocking and overstates LCP (pass --throttling simulate to see it). Lighthouse's benchmarkIndex
//     is printed.
//     Report only: one Playwright load per route with applied throttling (mobile: 412x823 at DPR 1.75,
//     CPU 4x, 562.5ms latency, 1.6 Mbps x 0.9 down and 750 kbps x 0.9 up; desktop: 1440x900, no
//     throttling), with PerformanceObservers for LCP (and its element), layout shifts and long tasks,
//     and every request that finished before LCP.
// 42  From that load: no <video> carries a poster attribute (the <picture> under it is the poster);
//     on the mobile profile the LCP image transfers 80 KB or less, and nothing else over 100 KB
//     finishes before LCP.
//
// CHROME_PATH picks the Chrome Lighthouse drives (default: the Playwright Chromium in /opt/pw-browsers,
// else Playwright's own). LIGHTHOUSE_BIN replaces the npx call (e.g. a local lighthouse 12.x) when the
// registry cannot be reached; the run says which it used. Exit code: 0 when every check passes, 1 when
// any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", "/fit-check", "/calculator"];
const LIGHTHOUSE = "lighthouse@13.5.0";
const LCP_BUDGET_MS = 2500;
const CLS_BUDGET = 0.1;
const LCP_IMAGE_KB = 80;
const OTHER_KB = 100;
// What the spec expects each route's mobile LCP image to be (D4), printed beside what was measured.
const EXPECTED_LCP = {
  "/": "h0 portrait (about 49 KB), or h0 1280w (41 KB) before P9",
  "/platform": "h0 1280w (41 KB)",
  "/commercial": "c1 m43 (about 41 KB), or c1 1280w (63 KB) before P9",
  "/homes-and-rentals": "ho1 1280w (57 KB)",
  "/solar": "so1 (54 KB)",
  "/company": "co1 (44 KB)",
};
const PROFILES = {
  mobile: {
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
    cpu: 4,
    // Lighthouse's mobile slow 4G, applied: 150ms RTT x 3.75, 1,638.4 kbps x 0.9 down, 750 kbps x 0.9 up.
    network: { offline: false, latency: 562.5, downloadThroughput: (1638.4 * 0.9 * 1024) / 8, uploadThroughput: (750 * 0.9 * 1024) / 8 },
  },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false, cpu: 1, network: null },
};

function usage() {
  console.log(`Usage: node scripts/perf-vitals.mjs <baseUrl> [route ...] [options]

Runs the design pass's load checks: 38 (Lighthouse LCP and CLS, the gate) and 42 (posters, LCP bytes).

  <baseUrl>                  the served build, e.g. http://localhost:3000 (default)
  route                      one or more routes (default: all nine)
  --runs 3                   Lighthouse runs per route (the median gates)
  --profile mobile|desktop   mobile (default) or desktop
  --json <file>              also write the full report as JSON`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], runs: 3, profile: "mobile", throttling: "devtools", json: null };
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
    } else if (a.startsWith("--runs")) opts.runs = Number(value());
    else if (a.startsWith("--profile")) opts.profile = value();
    else if (a.startsWith("--json")) opts.json = value();
    else if (a.startsWith("--throttling")) opts.throttling = value();
    else if (a.startsWith("--")) fail(`Unknown option ${a}.`, true);
    else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}: pass a base URL (http://...) and routes starting with /.`, true);
  }
  if (!Number.isInteger(opts.runs) || opts.runs < 1) fail(`--runs must be a whole number of 1 or more.`);
  if (!["devtools", "simulate"].includes(opts.throttling)) fail(`--throttling must be devtools or simulate.`);
  if (!PROFILES[opts.profile]) fail(`--profile must be mobile or desktop.`);
  if (!opts.routes.length) opts.routes = ROUTES;
  return opts;
}

function loadPlaywright() {
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
  return playwright;
}

const opts = parseArgs(process.argv.slice(2));
const { chromium } = loadPlaywright();
const profile = PROFILES[opts.profile];
const chromePath = process.env.CHROME_PATH || (existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : chromium.executablePath());
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const ms = (v) => `${Math.round(v).toLocaleString("en-AU")}ms`;

try {
  const res = await fetch(`${opts.base}/`, { redirect: "manual" });
  if (res.status >= 500) throw new Error(`status ${res.status}`);
} catch (err) {
  fail(`Cannot reach ${opts.base} (${err.message}). Serve a production build first (npm run build && npm run start) and pass its URL.`);
}

// Lighthouse: npx with the pinned version, or LIGHTHOUSE_BIN.
const lighthouseCommand = () => (process.env.LIGHTHOUSE_BIN ? [process.env.LIGHTHOUSE_BIN, []] : ["npx", ["-y", LIGHTHOUSE]]);
let lighthouseVersion = null;
try {
  const [cmd, pre] = lighthouseCommand();
  lighthouseVersion = execFileSync(cmd, [...pre, "--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 300000 }).trim();
} catch (err) {
  fail(`Lighthouse could not start (${process.env.LIGHTHOUSE_BIN ?? `npx -y ${LIGHTHOUSE}`}): ${String(err.message).split("\n")[0]}\nSet LIGHTHOUSE_BIN to a local lighthouse binary if the registry cannot be reached.`);
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "perf-vitals-"));
function lighthouse(url, n) {
  const out = path.join(tmp, `lh-${n}.json`);
  const [cmd, pre] = lighthouseCommand();
  const flags = [url, "--quiet", "--only-categories=performance", `--throttling-method=${opts.throttling}`, '--chrome-flags=--headless=new --no-sandbox', "--output=json", `--output-path=${out}`];
  if (opts.profile === "desktop") flags.push("--preset=desktop");
  else flags.push("--form-factor=mobile");
  execFileSync(cmd, [...pre, ...flags], { env: { ...process.env, CHROME_PATH: chromePath }, stdio: ["ignore", "ignore", "pipe"], timeout: 300000 });
  const j = JSON.parse(readFileSync(out, "utf8"));
  rmSync(out, { force: true });
  const a = j.audits;
  // Lighthouse 13 names the LCP element in its LCP insights; 12 in largest-contentful-paint-element.
  const insight = (id) => a[id]?.details?.items ?? [];
  const el =
    [...insight("lcp-breakdown-insight"), ...insight("lcp-discovery-insight")].find((x) => x?.type === "node") ??
    a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node ??
    a["largest-contentful-paint-element"]?.details?.items?.[0]?.node ??
    null;
  const parts = insight("lcp-breakdown-insight").find((x) => x?.type === "table")?.items ?? [];
  return {
    subparts: parts.map((p) => `${p.label ?? p.subpart} ${Math.round(p.duration)}ms`).join(", "),
    lcp: a["largest-contentful-paint"]?.numericValue ?? NaN,
    cls: a["cumulative-layout-shift"]?.numericValue ?? NaN,
    fcp: a["first-contentful-paint"]?.numericValue ?? NaN,
    tbt: a["total-blocking-time"]?.numericValue ?? NaN,
    element: el ? `${el.nodeLabel ?? ""} ${el.snippet ?? ""}`.trim().slice(0, 140) : "",
    benchmarkIndex: j.environment?.benchmarkIndex ?? null,
    version: j.lighthouseVersion,
  };
}

// The applied-throttling load, for the report and check 42.
function observers() {
  window.__p7vitals = { lcp: [], shifts: [], longtasks: [], intro: [] };
  const describe = (el) => {
    if (!el) return null;
    const media = el.currentSrc || el.getAttribute?.("src") || "";
    const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
    return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}>${media ? ` ${media.split("/").pop()}` : ""}${!media && text ? ` "${text}"` : ""}`;
  };
  try {
    // The first-visit intro (CLAUDE.md "Intro"): every load here is a fresh session, so on / it plays,
    // as it does for a first visitor; the report says when it was up beside the LCP painted under it.
    // The document itself is observed: <html> may not exist yet when this runs.
    new MutationObserver((records) => {
      for (const r of records) if (r.target === document.documentElement) window.__p7vitals.intro.push({ on: document.documentElement.getAttribute("data-intro"), at: performance.now() });
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-intro"] });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__p7vitals.lcp.push({ startTime: e.startTime, size: e.size, url: e.url || "", element: describe(e.element) });
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__p7vitals.shifts.push({ value: e.value, startTime: e.startTime, sources: (e.sources || []).map((s) => describe(s.node)).filter(Boolean).slice(0, 3) });
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__p7vitals.longtasks.push({ startTime: e.startTime, duration: e.duration });
    }).observe({ type: "longtask", buffered: true });
  } catch {
    // An observer type this Chrome lacks: the report says what it could measure.
  }
}

async function appliedLoad(browser, route) {
  const context = await browser.newContext({ viewport: profile.viewport, deviceScaleFactor: profile.deviceScaleFactor, isMobile: profile.isMobile, hasTouch: profile.hasTouch });
  await context.addInitScript(observers);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (profile.network) await cdp.send("Network.emulateNetworkConditions", profile.network);
  if (profile.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
  try {
    await page.goto(opts.base + route, { waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(5000);
    return await page.evaluate(() => {
      const v = window.__p7vitals;
      const lcp = v.lcp[v.lcp.length - 1] ?? null;
      const resources = performance.getEntriesByType("resource").map((r) => ({ name: r.name, type: r.initiatorType, transfer: r.transferSize || r.encodedBodySize || 0, end: r.responseEnd }));
      const nav = performance.getEntriesByType("navigation")[0];
      const posters = [...document.querySelectorAll("video[poster]")].map((x) => x.getAttribute("poster"));
      return {
        lcp,
        cls: v.shifts.reduce((s, e) => s + e.value, 0),
        intro: v.intro,
        shifts: v.shifts.filter((s) => s.value > 0.001),
        longtasks: v.longtasks,
        resources,
        document: nav ? { transfer: nav.transferSize, end: nav.responseEnd } : null,
        posters,
      };
    });
  } finally {
    await context.close();
  }
}

console.log(`perf:vitals  ${opts.base}`);
console.log(`Check 38 with ${lighthouseVersion ? `Lighthouse ${lighthouseVersion}` : "Lighthouse"} (${process.env.LIGHTHOUSE_BIN ? `LIGHTHOUSE_BIN=${process.env.LIGHTHOUSE_BIN}` : `npx -y ${LIGHTHOUSE}`}), ${opts.runs} run${opts.runs === 1 ? "" : "s"} per route, ${opts.profile} profile, ${opts.throttling === "devtools" ? "applied" : "simulated"} throttling; Chrome ${chromePath}`);
console.log(`Check 42 and the report from one Playwright load per route with applied throttling (${opts.profile === "mobile" ? "412x823 DPR 1.75, CPU 4x, 562.5ms, 1.47 Mbps down" : "1440x900, no throttling"})`);

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const report = { base: opts.base, when: new Date().toISOString(), profile: opts.profile, lighthouse: lighthouseVersion, routes: [] };
let totalFailures = 0;
const byCheck = {};
const benchmarks = [];

for (const route of opts.routes) {
  const failures = [];
  const notes = [];
  const add = (check, kind, sample = "") => failures.push({ check, kind, sample });
  console.log("");
  // Check 38.
  const runs = [];
  for (let n = 0; n < opts.runs; n++) {
    try {
      runs.push(lighthouse(opts.base + route, n));
    } catch (err) {
      add(38, "a Lighthouse run failed", String(err.stderr || err.message).split("\n").filter(Boolean).slice(-1)[0]?.slice(0, 200) ?? "");
    }
  }
  const good = runs.filter((r) => Number.isFinite(r.lcp));
  let row = null;
  if (good.length) {
    row = { lcp: median(good.map((r) => r.lcp)), cls: median(good.map((r) => r.cls)), fcp: median(good.map((r) => r.fcp)), tbt: median(good.map((r) => r.tbt)) };
    for (const r of good) if (r.benchmarkIndex) benchmarks.push(r.benchmarkIndex);
    if (row.lcp > LCP_BUDGET_MS) add(38, `median LCP ${ms(row.lcp)} is over ${ms(LCP_BUDGET_MS)}`, `runs ${good.map((r) => ms(r.lcp)).join(", ")}; LCP element ${good[0].element || "unknown"}`);
    if (row.cls > CLS_BUDGET) add(38, `median CLS ${row.cls.toFixed(3)} is over ${CLS_BUDGET}`, `runs ${good.map((r) => r.cls.toFixed(3)).join(", ")}`);
    notes.push(`lighthouse: median LCP ${ms(row.lcp)}, CLS ${row.cls.toFixed(3)}, FCP ${ms(row.fcp)}, TBT ${ms(row.tbt)} (runs ${good.map((r) => ms(r.lcp)).join(", ")}); benchmarkIndex ${good.map((r) => r.benchmarkIndex).join(", ")}`);
    notes.push(`lighthouse LCP element: ${good[0].element || "unknown"}${good[0].subparts ? ` (${good[0].subparts})` : ""}`);
  }

  // Report only, and check 42.
  let applied = null;
  try {
    applied = await appliedLoad(browser, route);
  } catch (err) {
    add(42, "the applied-throttling load failed", String(err.message).split("\n")[0]);
  }
  if (applied) {
    const lcp = applied.lcp;
    for (const p of applied.posters) add(42, "a <video> carries a poster attribute (the <picture> under it is the poster)", p);
    if (!lcp) notes.push("applied load: no LCP entry was recorded");
    else {
      const lcpUrl = lcp.url ? new URL(lcp.url, opts.base).href : null;
      const lcpRes = lcpUrl ? applied.resources.find((r) => r.name === lcpUrl) : null;
      notes.push(`applied load: LCP ${ms(lcp.startTime)} on ${lcp.element ?? "?"}${lcpRes ? ` (${kb(lcpRes.transfer)})` : ""}, CLS ${applied.cls.toFixed(3)}, ${applied.longtasks.length} long task${applied.longtasks.length === 1 ? "" : "s"} (${ms(applied.longtasks.reduce((s, t) => s + t.duration, 0))})`);
      if (EXPECTED_LCP[route]) notes.push(`expected LCP image (D4): ${EXPECTED_LCP[route]}`);
      const up = applied.intro.find((e) => e.on === "play");
      const down = applied.intro.find((e) => e.on === null && up && e.at >= up.at);
      if (up) notes.push(`intro: up ${ms(up.at)} to ${down ? ms(down.at) : "past the load"}; the LCP above is painted under it`);
      if (opts.profile === "mobile" && lcpRes && lcpRes.transfer > LCP_IMAGE_KB * 1024) add(42, `the mobile LCP image transfers ${kb(lcpRes.transfer)}, over ${LCP_IMAGE_KB} KB`, lcpUrl.replace(opts.base, ""));
      const before = applied.resources.filter((r) => r.end <= lcp.startTime).sort((a, b) => a.end - b.end);
      const heavy = before.filter((r) => r.name !== lcpUrl && r.transfer > OTHER_KB * 1024);
      if (opts.profile === "mobile") for (const r of heavy) add(42, `${kb(r.transfer)} finished before LCP (over ${OTHER_KB} KB, and not the LCP image)`, `${r.type} ${r.name.replace(opts.base, "")}`);
      const total = before.reduce((s, r) => s + r.transfer, 0) + (applied.document?.transfer ?? 0);
      notes.push(`before LCP: ${before.length} requests, ${kb(total)} with the document; the largest: ${[...before].sort((a, b) => b.transfer - a.transfer).slice(0, 4).map((r) => `${r.name.replace(opts.base, "").split("?")[0].slice(-48)} ${kb(r.transfer)}`).join(", ") || "none"}`);
      if (applied.shifts.length) notes.push(`layout shifts: ${applied.shifts.map((s) => `${s.value.toFixed(3)} at ${ms(s.startTime)}${s.sources.length ? ` (${s.sources.join(", ")})` : ""}`).slice(0, 4).join("; ")}`);
    }
  }

  totalFailures += failures.length;
  for (const f of failures) byCheck[f.check] = (byCheck[f.check] ?? 0) + 1;
  console.log(`${route}  ${failures.length ? `${failures.length} failure${failures.length === 1 ? "" : "s"}` : "all pass"}`);
  for (const f of failures) console.log(`       FAIL [${f.check}] ${f.kind}${f.sample ? `: ${f.sample}` : ""}`);
  for (const n of notes) console.log(`  note  ${n}`);
  report.routes.push({ route, lighthouse: { runs, median: row }, applied, failures, notes });
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });
console.log("");
console.log(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} (${opts.profile}).`);
console.log(`  [38] median LCP <= ${LCP_BUDGET_MS}ms and CLS <= ${CLS_BUDGET}: ${byCheck[38] ? `${byCheck[38]} failing` : "pass"}`);
console.log(`  [42] no video poster, LCP image <= ${LCP_IMAGE_KB} KB, nothing else over ${OTHER_KB} KB before LCP: ${byCheck[42] ? `${byCheck[42]} failing` : "pass"}`);
if (benchmarks.length) console.log(`  Lighthouse benchmarkIndex: median ${Math.round(median(benchmarks))} (${Math.min(...benchmarks)} to ${Math.max(...benchmarks)}); simulated timings scale with it.`);
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
