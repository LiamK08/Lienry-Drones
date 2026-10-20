// check:rules: the rule checks of the October 2026 design pass (spec D2; the earlier E2 checks 5-14 and
// 21-24 as rewritten there), run in Playwright against a served build at 1440x900 and 390x844 by
// default, plus the source and file checks they name.
//
// Usage: npm run check:rules -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json]
//                                [--no-sweep] [--no-motion] [--baseline scripts/copy-baseline.json]
//   e.g. npm run build && npm run start, then npm run check:rules -- http://localhost:3000
//
//  5  Shapes and effects: every computed border-radius (and ::before/::after) is 0 or 4px; no box-shadow,
//     text-shadow, blur, backdrop-filter or background-clip:text; gradients only in the film bands'
//     scrims; no effect utilities in class lists (they hide in hover states); `rounded-(?!hard)` finds
//     nothing in src. Rings are outlines: `ring-` stays banned.
//  6  Two families: all text is Instrument Serif or Inter; the serif only on h1-h3 (and their em), the
//     founder letter (.letter), the footer wordmark and the phone menu's links; every heading is in the
//     serif; the fonts loaded are exactly the three src/fonts files (compared by content).
//  7  Scale: every font size is a step of the scale at that width (checked against the spec's values);
//     every h1-h3 is on the H3 step or above; every text inside .letter is on the H3 step; no h4-h6 in
//     <main>; no `text-[` in src.
//  8  Case and alignment: uppercase only inside .label; no centred text outside the home hero.
//  9  Italics: an em never sits in an h3, a summary, a p, a button, .letter or .eyebrow; it is always its
//     heading's trailing phrase, in the heading's colour; at most one em per [data-band], and only
//     inside the heading that labels that band (its aria-labelledby target).
// 10  Eyebrows: every h2 in <main>, and every h1 but the home hero's, comes right after a p.eyebrow; no
//     h2 in <main> stands outside [data-section-head] (except in [data-prose] or [data-form-success],
//     which are also exempt from the eyebrow); every .eyebrow in <main> and the footer reads lowercase,
//     1 to 3 words, and computes to Inter, the small step, weight 500, normal tracking, no transform and
//     the surface's muted colour; the heading's top sits 16px (within 1) under the eyebrow's bottom, on
//     its left edge (within 1). No .label sits right before or right above an h1 or h2.
// 11  No claims: the banned words appear only inside the allowed sentences ("$" also inside
//     [data-calculator]); "approval" only inside the approvals phrase and the Honest by default rule;
//     every .numeral is a cited stat (with its source link and the cited note), a design fact (while
//     the content still has them) or demo data inside a coded demo.
// 12  No Concept render captions: no rendered text anywhere reads "Concept render". The owner removed
//     the caption from every image and film on 26 September 2026.
// 13  Coded demos: each software window shows "Demo data" and the illustrative-model note beneath it
//     once, and its panel data keeps its Demo data line; the app panel (role="group") shows "Demo data"
//     and its note. Windows on /, /commercial and /download, the app panel on /homes-and-rentals.
// 14  Media: every /media/ path in the served HTML and JS is a manifest id (variants --name-w and
//     renditions --r included); all 29 appear on the site; no id shows in two frames on a route in any
//     state (a [data-hover-clip] frame's still and clip are one figure); public/media holds only
//     manifest files and nothing is added to public/video or media-src.
// 21  Motion: under reduced motion no video plays, nothing reveals, crossfades or snaps smoothly, and
//     the window shows its recording with native controls; without it never two videos play at once,
//     the live window stops drawing once off screen (judged no sooner than 2.5s after it leaves, then
//     1.5s without a draw call within 8s), nothing is sticky but the header, nothing moves with the
//     scroll and no figure counts up.
// 22  Titles and links: every route's <title> is its own, "What the page is | Lienry Drones", exactly as
//     pageTitle in src/lib/site.ts builds it. Its one canonical link and its og:url are its own address;
//     og:title and twitter:title are the title without the brand; og:description and
//     twitter:description repeat its meta description; the card has an og:image. No two routes share a
//     title or a description.
// 23  Placeholders: no "to come", no data-media-placeholder, no empty photo box.
// 24  Enquiry labels: every link to /register-interest carries the one label of its ?type=.
// 25  Headline length: every h1 and h2 in <main> is 7 words or fewer (aria-hidden parts removed); an h3
//     over 7 is a warning.
// 26  Orphans: no h1-h3 or band-level intro paragraph of two or more lines ends on a line holding one
//     word (failures at 1440 and 390, warnings at 1024 and 768).
// 27  Paragraph lines (1440): every p in <main>, answers in closed details included, renders on 2 lines
//     or fewer; [data-prose], forms, .letter, [data-ui], .sr-only and stat source lines are exempt.
// 28  Copy budget: the words a visitor sees in <main> at load, counted as main's innerText without the
//     outermost [data-ui], [data-prose], form, .sr-only, [aria-hidden="true"] and the legacy demo
//     selectors, split on whitespace, are at most 0.667 x the route's baseline in
//     scripts/copy-baseline.json at that width. The all-states count is reported only.
//     --write-baseline <file> records both counts per route at 1440 and 390 and runs nothing else.
// 29  Labels: a .label is legal only inside [data-ui] or the header (body > header).
// 31b Spacing lint (src): margin, padding, gap, space, inset, top/right/bottom/left and scroll-margin or
//     scroll-padding utilities use the 8px scale (multipliers 0, px, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32,
//     40; 1/2, full and auto on position and inset), scale rems, or the layout variables. Lines marked
//     frozen-header, the header, the window, its readouts, the app panel and the 3D scenes are skipped.
// 33  Calculator (any route with [data-calculator], at 390, 768 and 1440): labelled fields, one live
//     region (the sr-only p), the worked figures computed here with totalOver, no decimals, no overflow,
//     the status within 1s, no tween, no network request while typing, no saving or comparison words.
// 41  Hover clips (with the motion passes): nothing requested at load; hovering a card plays its clip
//     alone within 1.2s and leaving pauses it within 400ms; focusing its link plays it and pauses it by
//     5.2s; the card keeps its height; at 390 (touch) and under reduced motion there is no clip at all.
//
// Tabs, stage parts and story beats are swept: every state is audited again. Copy the checks compare
// against (allowed sentences, stats, design facts, the app note, brand and titles) is read from the
// content modules and src/lib/site.ts through the project's TypeScript, with tolerant getters: a missing
// path fails only the check that needs it. Exit code: 0 when every check passes, 1 when any fails, 2 when
// the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", "/fit-check", "/calculator"];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  768: { width: 768, height: 1024, mobile: true },
  390: { width: 390, height: 844, mobile: true },
};

// Acceptance strings and values that the spec itself defines (E2, B4, B6, B7), not copy from content.
const SPEC = {
  // E2 check 12: the caption the owner removed, which must not come back.
  retiredCaption: "Concept render",
  demoData: "Demo data",
  windowNote: "Model is illustrative. The software will render each property from its scan.",
  readoutsNote: "Demo data. These readings are illustrative, not operating specifications.",
  appPanelLabel: "Illustrative mobile app, demo data",
  citedNote: "These figures describe the industry, not Lienry's results. Lienry Drones is pre-launch and has no customer results to report.",
  approvalsPhrase: "We do not claim any approvals",
  // E2 check 24.
  enquiryLabels: { "": "Register interest", homeowner: "Register interest", commercial: "Book a pilot conversation", investor: "Investor enquiries", landlord: "I own rentals" },
  // E2 check 7: the steps at each width, in the order display, h1, h2, h3, lead, body, small, caption, label, numeral.
  steps: {
    1440: { display: 83.2, h1: 69.6, h2: 50.4, h3: 30, lead: 19, body: 16, small: 14, caption: 13, label: 12, numeral: 96 },
    390: { display: 52, h1: 44, h2: 36, h3: 24, lead: 17, body: 16, small: 14, caption: 13, label: 12, numeral: 56 },
  },
  // E2 check 11: whole words, case-insensitive.
  banned: [
    ["customer", /\bcustomers?\b/gi],
    ["client", /\bclients?\b/gi],
    ["trusted by", /\btrusted by\b/gi],
    ["partner", /\bpartners?\b/gi],
    ["testimonial", /\btestimonials?\b/gi],
    ["certified", /\bcertified\b/gi],
    ["certification", /\bcertifications?\b/gi],
    ["accredited", /\baccredit(?:ed|ation)\b/gi],
    ["award", /\bawards?\b/gi],
    ["guarantee", /\bguarantee[sd]?\b/gi],
    ["savings", /\bsavings\b/gi],
    ["saves", /\bsaves\b/gi],
    ["ROI", /\bROI\b/gi],
    ["per month", /\bper month\b/gi],
    ["$", /\$/g],
    ["price", /\bprices?\b/gi],
  ],
  // Where Part C puts the coded demos (D2 check 13).
  demos: {
    "/": { windows: 1 },
    "/commercial": { windows: 1 },
    "/homes-and-rentals": { apps: 1 },
    "/download": { windows: 1 },
  },
  // D2 check 10 (and the Eyebrow component): lowercase, one to three words.
  eyebrow: "^[a-z0-9]+(?:[ '\u2019&-][a-z0-9]+){0,2}$",
  // D2 check 25.
  maxHeadlineWords: 7,
  // D2 check 27.
  maxParagraphLines: 2,
  // D2 check 28.
  copyRatio: 0.667,
  // D2 check 33: words that would turn the visitor's own figures into a Lienry claim.
  calcClaims: /\b(sav(e|es|ing|ings)|ROI|payback|cheaper|less than|compared|with Lienry|Lienry('s)? (cost|price|fee))/i,
  // D2 check 31b: the spacing utilities, their allowed multipliers and arbitrary values.
  lint: {
    skipFiles: ["src/components/site/Nav.tsx", "src/components/software/SoftwareWindow.tsx", "src/components/software/PanelReadouts.tsx", "src/components/app/AppPanel.tsx"],
    skipDirs: ["src/components/three/"],
    multipliers: ["0", "px", "2", "4", "6", "8", "10", "12", "16", "20", "24", "32", "40"],
    positional: ["1/2", "full", "auto"],
    rems: ["0", "0.5", "1", "1.5", "2", "2.5", "3", "4", "5", "6", "8", "10"],
    vars: ["--nav-h", "--page-margin", "--section-y", "--head-gap", "--hero-top", "--hero-gap", "--gutter", "--bleed"],
  },
};

const CHECKS = {
  5: "shapes and effects",
  6: "two families",
  7: "type scale",
  8: "case and alignment",
  9: "italics",
  10: "eyebrows",
  11: "no claims, figures",
  12: "no Concept render captions",
  13: "coded demos labelled",
  14: "manifest media",
  21: "motion",
  22: "titles and links",
  23: "no placeholders",
  24: "one label per enquiry route",
  25: "headlines of 7 words at most",
  26: "no orphaned last word",
  27: "paragraphs of 2 lines at most",
  28: "copy budget",
  29: "labels only in UI and the header",
  "31b": "spacing lint",
  33: "the calculator",
  41: "hover clips",
};
// Checks that run with the motion passes (--no-motion skips them).
const MOTION_CHECKS = new Set(["21", "41"]);

function usage() {
  console.log(`Usage: node scripts/check-rules.mjs <baseUrl> [route ...] [options]

Runs the design pass's rule checks (5-14, 21-29, 31b, 33 and 41) against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all nine)
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default; 1024 and 768 are known too)
  --json <file>      also write the full report as JSON
  --no-sweep         skip the tab and disclosure state sweeps
  --no-motion        skip the motion passes (checks 21 and 41), which load every route again
  --baseline <file>  check 28's baseline (default scripts/copy-baseline.json)
  --write-baseline <file>
                     record check 28's word counts per route (at load and in all states, at each
                     width) into <file>, e.g. scripts/copy-baseline.json, and run no other check`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null, sweep: true, motion: true, writeBaseline: null, baseline: path.join(ROOT, "scripts/copy-baseline.json") };
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
    } else if (a.startsWith("--widths")) opts.widths = value().split(",").map((w) => Number(w.trim()));
    else if (a.startsWith("--json")) opts.json = value();
    else if (a.startsWith("--write-baseline")) opts.writeBaseline = value();
    else if (a.startsWith("--baseline")) opts.baseline = path.resolve(value());
    else if (a === "--no-sweep") opts.sweep = false;
    else if (a === "--no-motion") opts.motion = false;
    else if (a.startsWith("--")) fail(`Unknown option ${a}.`, true);
    else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}: pass a base URL (http://...) and routes starting with /.`, true);
  }
  for (const w of opts.widths) if (!Number.isFinite(w) || w < 200) fail(`Bad width ${w}.`);
  if (!opts.routes.length) opts.routes = ROUTES;
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
  if (!playwright) {
    fail("Playwright was not found in this project or globally.\nInstall it with: npm i -D playwright && npx playwright install chromium");
  }
  return playwright.chromium;
}

// The content modules, compiled with the project's own TypeScript so the checks compare against the
// copy the site renders (pages.ts imports ./home without an extension, which plain Node cannot load).
function loadContent() {
  const require = createRequire(path.join(ROOT, "package.json"));
  // The site's address as the build saw it: Next's own .env loading, so a NEXT_PUBLIC_SITE_URL set in
  // .env.local reaches src/lib/site.ts here too (check 22).
  try {
    require("@next/env").loadEnvConfig(ROOT, false, { info() {}, error: console.error });
  } catch {
    // No @next/env: the process environment alone.
  }
  let ts;
  try {
    ts = require("typescript");
  } catch {
    return { error: "typescript is not installed in this project" };
  }
  const cache = new Map();
  const load = (file) => {
    if (cache.has(file)) return cache.get(file).exports;
    const js = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: file }).outputText;
    const mod = { exports: {} };
    cache.set(file, mod);
    const localRequire = (spec) => {
      const base = spec.startsWith("@/") ? path.join(ROOT, "src", spec.slice(2)) : spec.startsWith(".") ? path.resolve(path.dirname(file), spec) : null;
      if (base) for (const ext of ["", ".ts", ".tsx", "/index.ts"]) if (existsSync(base + ext) && statSync(base + ext).isFile()) return load(base + ext);
      return require(spec);
    };
    new Function("exports", "require", "module", "__filename", "__dirname", js)(mod.exports, localRequire, mod, file, path.dirname(file));
    return mod.exports;
  };
  // Each module is read directly when it exists. Before the content split (F0.1) everything lived in
  // home.ts and pages.ts, so a module that is not there yet falls back to the file that held it.
  const loadErrors = [];
  const tryLoad = (rel) => {
    const file = path.join(ROOT, rel);
    if (!existsSync(file)) return null;
    try {
      return load(file);
    } catch (err) {
      loadErrors.push(`${rel}: ${String(err.message).split("\n")[0]}`);
      return null;
    }
  };
  const home = tryLoad("src/content/home.ts");
  const pages = tryLoad("src/content/pages.ts");
  const faqMod = tryLoad("src/content/faq.ts") ?? pages;
  const company = tryLoad("src/content/company.ts") ?? pages;
  const homes = tryLoad("src/content/homes.ts") ?? home;
  const commercial = tryLoad("src/content/commercial.ts") ?? home;
  const stats = tryLoad("src/content/stats.ts");
  const site = tryLoad("src/lib/site.ts");
  // Tolerant getters: a path that is not there is recorded, and only the check that needs it fails.
  const missing = [];
  const get = (f, name) => {
    try {
      const v = f();
      if (v === undefined) missing.push(name);
      return v ?? null;
    } catch {
      missing.push(name);
      return null;
    }
  };
  // The one FAQ bank (faq.ts, faqItems); before the split, platformFaq.items in pages.ts.
  const faq = (id) => get(() => (faqMod.faqItems ?? faqMod.platformFaq.items).find((q) => q.id === id)?.a, `faq ${id}`);
  const honest = get(() => company.companyPage.values.items.find((v) => /honest by default/i.test(v.title))?.body, "company honest");
  const pageTitles = get(() => site.pageTitles, "site.pageTitles");
  // Design facts are deleted at integration: their absence is not a failure (a non-stat numeral is).
  let designFacts = null;
  try {
    designFacts = commercial?.designFacts ?? null;
  } catch {
    designFacts = null;
  }
  return {
    brand: get(() => site.brand.name, "site.brand.name"),
    // Check 22: every route's tab title, as src/lib/site.ts builds it, its share card's title, and the
    // site's address.
    titles: get(() => Object.fromEntries(Object.keys(site.pageTitles).map((route) => [route, site.pageTitle(route)])), "site.pageTitle"),
    shareTitles: pageTitles,
    siteUrl: get(() => site.siteUrl, "site.siteUrl"),
    // Check 11: the allowed sentences.
    allowed: [
      ["the FAQ answer to What will it cost?", faq("cost")],
      ["the Honest by default rule", honest],
      ["the cited note", SPEC.citedNote],
    ].filter(([, text]) => text),
    approvals: [SPEC.approvalsPhrase, honest].filter(Boolean),
    stats: get(() => [...stats.solarStats, ...stats.australiaStats], "stats.solarStats and stats.australiaStats") ?? [],
    designFacts,
    appNote: get(() => homes.appPanel.note, "homes.appPanel.note"),
    missing,
    loadErrors,
  };
}

// Which check needs which content path (a missing path fails only that check).
const NEEDS = [
  [/^faq |^company honest|^stats/, 11],
  [/^homes\.appPanel/, 13],
  [/^site\.(pageTitle|siteUrl)/, 22],
  [/^site\.brand/, 6],
];

// ---------------------------------------------------------------------------------------------------
// In-page library, installed on every document with addInitScript. Everything it needs is inside it.
// ---------------------------------------------------------------------------------------------------
function pageLib() {
  const R = (window.__p7rules = { cfg: {} });
  const clean = (s, n = 0) => {
    const t = (s || "").replace(/\s+/g, " ").trim();
    return n && t.length > n ? `${t.slice(0, n - 1)}…` : t;
  };
  // Curly quotes to straight ones, so copy compares whatever the markup used.
  const single = new RegExp(`[${String.fromCharCode(0x2018, 0x2019)}]`, "g");
  const double = new RegExp(`[${String.fromCharCode(0x201c, 0x201d)}]`, "g");
  const quotes = (s) => s.replace(single, "'").replace(double, '"');
  R.configure = (cfg) => {
    R.cfg = cfg;
    return true;
  };

  const colourCache = new Map();
  let ctx2d = null;
  const rgba = (colour) => {
    if (!colour || colour === "transparent") return [0, 0, 0, 0];
    if (colourCache.has(colour)) return colourCache.get(colour);
    if (!ctx2d) {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      ctx2d = c.getContext("2d", { willReadFrequently: true });
    }
    ctx2d.clearRect(0, 0, 1, 1);
    ctx2d.fillStyle = "rgba(0, 0, 0, 0)";
    ctx2d.fillStyle = colour;
    ctx2d.fillRect(0, 0, 1, 1);
    const d = ctx2d.getImageData(0, 0, 1, 1).data;
    const out = [d[0], d[1], d[2], d[3] / 255];
    colourCache.set(colour, out);
    return out;
  };
  const alphaOf = (c) => rgba(c)[3];
  const same = (a, b) => {
    const x = rgba(a);
    const y = rgba(b);
    return x.every((v, i) => Math.abs(v - y[i]) <= (i === 3 ? 0.02 : 2));
  };
  const effectiveBackground = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (alphaOf(bg) >= 0.5) return bg;
    }
    return "rgb(255, 255, 255)";
  };
  // Relative luminance (WCAG), 0 to 1: a surface over 0.4 is light (plaster, raised, sunken).
  const luminance = (colour) => {
    const [r, g, b] = rgba(colour).map((v, i) => (i < 3 ? v / 255 : v));
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  R.luminance = luminance;
  // The palette, read from the tokens on :root.
  let tokens = null;
  R.tokens = () => {
    if (tokens) return tokens;
    tokens = {};
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    for (const name of ["plaster", "ink", "muted", "muted-on-dark", "glass", "glass-on-dark"]) {
      probe.style.color = "";
      probe.style.color = `var(--color-${name})`;
      tokens[name] = getComputedStyle(probe).color;
    }
    probe.remove();
    return tokens;
  };

  // The type scale at this width, read from the tokens.
  let steps = null;
  R.steps = () => {
    if (steps) return steps;
    steps = {};
    const probe = document.createElement("span");
    probe.textContent = "x";
    document.body.appendChild(probe);
    for (const t of ["display", "h1", "h2", "h3", "lead", "body", "small", "caption", "label", "numeral"]) {
      probe.style.fontSize = `var(--text-${t})`;
      steps[t] = Math.round(parseFloat(getComputedStyle(probe).fontSize) * 100) / 100;
    }
    probe.remove();
    return steps;
  };
  // The three faces next/font emits, read from the family variables on <html>.
  let families = null;
  const firstFamily = (list) => (list || "").split(",")[0].replace(/["']/g, "").trim();
  R.families = () => {
    if (families) return families;
    const cs = getComputedStyle(document.documentElement);
    const serif = [firstFamily(cs.getPropertyValue("--font-instrument")), firstFamily(cs.getPropertyValue("--font-instrument-italic"))].filter(Boolean);
    const sans = [firstFamily(cs.getPropertyValue("--font-inter"))].filter(Boolean);
    families = { serif: new Set(serif), sans: new Set(sans), all: new Set([...serif, ...sans]) };
    return families;
  };

  const ownText = (el) =>
    clean(
      [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(" "),
    );
  R.ownText = ownText;
  // An id from a /media/ path: variants (--name-w) and renditions (--r) belong to their asset (check 14).
  const mediaIdOf = (src) => (src.match(/\/media\/([a-z0-9]+(?:-[a-z0-9]+)*?)(?:--[a-z0-9]+)?(?:-\d+)?(?:-poster)?\.(?:avif|webp|jpe?g|png|mp4|webm)/) || [])[1] || null;
  const mediaId = (el) => {
    const srcs = [el.currentSrc, el.getAttribute("src"), el.getAttribute("poster"), ...[...el.querySelectorAll("source")].map((s) => s.getAttribute("src") || s.getAttribute("srcset"))];
    for (const s of srcs) {
      const id = s ? mediaIdOf(s) : null;
      if (id) return id;
    }
    return null;
  };
  // Named by its accessible text: aria-hidden parts (a disclosure's number and sign) change with state.
  R.describe = (el) => {
    if (!el || el.nodeType !== 1) return "";
    const tag = el.tagName.toLowerCase();
    const id = mediaId(el);
    const name = el.getAttribute("aria-label") || el.getAttribute("alt") || "";
    let text = name;
    if (!text) {
      const copy = el.cloneNode(true);
      copy.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
      text = copy.textContent;
    }
    text = clean(text, 50);
    return `<${tag}>${id ? ` ${id}` : ""}${text ? ` "${text}"` : ""}`;
  };

  // Rendered: has a box and is visibility:visible. Present: rendered and not inside [hidden]
  // (the copies E2 check 14 ignores).
  const boxed = (el) => {
    let e = el;
    while (e && getComputedStyle(e).display === "contents") e = e.parentElement;
    return !!e && e.getClientRects().length > 0;
  };
  const rendered = (el) => boxed(el) && getComputedStyle(el).visibility === "visible";
  const present = (el) => rendered(el) && !el.closest("[hidden]");
  R.rendered = rendered;

  // Main-level blocks, the footer, the home hero, film blocks, the phone menu.
  const isFilm = (el) => {
    if (el.getAttribute("data-tone") === "film") return true;
    const r = el.getBoundingClientRect();
    for (const m of el.querySelectorAll("video, img")) {
      if (!mediaId(m)) continue;
      const mr = m.getBoundingClientRect();
      if (mr.width >= r.width * 0.9 && mr.height >= r.height * 0.9 && r.height > 200) return true;
    }
    return false;
  };
  R.discover = () => {
    const main = document.querySelector("main");
    const items = [];
    const skip = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "LINK", "META"]);
    const walk = (parent) => {
      for (const el of parent.children) {
        if (skip.has(el.tagName)) continue;
        if (!el.hasAttribute("data-band") && !el.hasAttribute("data-tone") && el.querySelector("[data-band], [data-tone]")) {
          walk(el);
          continue;
        }
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        items.push({ el, film: isFilm(el) });
      }
    };
    if (main) walk(main);
    const footer = document.querySelector("body > footer") || [...document.querySelectorAll("footer")].find((f) => !f.closest("main")) || null;
    const h1 = main?.querySelector("h1");
    const homeHero = location.pathname === "/" && h1 ? items.find((it) => it.el.contains(h1))?.el ?? null : null;
    const burger = document.querySelector("body > header button[aria-controls][aria-expanded]");
    const menu = burger ? document.getElementById(burger.getAttribute("aria-controls")) : null;
    R.state = { main, items, footer, homeHero, burger, menu, controls: items.map((it) => controlsOf(it.el)) };
    return R.state;
  };
  const where = (el) => {
    const st = R.state;
    const i = st.items.findIndex((it) => it.el.contains(el));
    if (i >= 0) return String(i + 1);
    if (st.footer && st.footer.contains(el)) return "footer";
    if (el.closest("header")) return "header";
    return "page";
  };
  const inFilm = (el) => R.state.items.some((it) => it.film && it.el.contains(el));
  const filmBlockOf = (el) => R.state.items.find((it) => it.film && it.el.contains(el))?.el ?? null;
  const inMenuLink = (el) => !!(R.state.menu && R.state.menu.contains(el) && el.closest("a"));
  const isWordmark = (el) => !!(R.state.footer && R.state.footer.contains(el) && clean(el.textContent) === R.cfg.brand);
  const inHomeHero = (el) => !!(R.state.homeHero && R.state.homeHero.contains(el));

  const labelOf = (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
    return clean(el.getAttribute("aria-label") || copy.textContent, 40);
  };
  // The switchable states of a block: tab groups and h3 disclosure groups.
  function controlsOf(block) {
    const groups = [];
    for (const list of block.querySelectorAll('[role="tablist"]')) {
      const tabs = [...list.querySelectorAll('[role="tab"]')].filter(rendered);
      if (tabs.length >= 2) groups.push({ kind: "tab", els: tabs, initial: Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true")) });
    }
    const disclosures = [...block.querySelectorAll("h3 button[aria-expanded][aria-controls]")].filter(rendered);
    if (disclosures.length >= 2) {
      const id = disclosures[0].id || "";
      const kind = id.startsWith("part-") ? "part" : id.startsWith("story-") ? "beat" : "disclosure";
      groups.push({ kind, els: disclosures, initial: Math.max(0, disclosures.findIndex((b) => b.getAttribute("aria-expanded") === "true")) });
    }
    return groups;
  }
  R.controls = () => R.state.controls.flatMap((groups, block) => groups.map((g, group) => ({ block, group, kind: g.kind, labels: g.els.map(labelOf), initial: g.initial })));
  R.blockList = () =>
    R.state.items.map((it, i) => ({
      i: i + 1,
      id: it.el.getAttribute("data-band") || it.el.id || "",
      tag: it.el.tagName.toLowerCase(),
      heading: clean(it.el.querySelector("h1, h2, h3")?.textContent || it.el.getAttribute("aria-label") || "", 50),
    }));
  R.activate = (block, group, item) => {
    const el = R.state.controls[block]?.[group]?.els[item];
    if (!el) return false;
    el.click();
    return true;
  };
  // Resolves when no finite CSS transition or animation runs inside the scope (a block index, or
  // <main>), or when the timeout passes.
  R.idle = (timeout, block = null) =>
    new Promise((resolve) => {
      const scope = block === null ? document.querySelector("main") || document.body : R.state.items[block]?.el || document.body;
      const t0 = performance.now();
      const tick = () => {
        const busy = document.getAnimations().some((a) => a.playState === "running" && a.effect?.target && scope.contains(a.effect.target) && a.effect.getTiming?.().iterations !== Infinity);
        if (!busy || performance.now() - t0 > timeout) requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
        else setTimeout(tick, 50);
      };
      tick();
    });

  const radiusBad = (s) => {
    for (const k of ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"]) {
      const v = s[k];
      if (!v) continue;
      for (const part of v.split(/\s+/)) {
        const n = parseFloat(part);
        if (part.endsWith("%") ? n !== 0 : !(Math.abs(n) < 0.01 || Math.abs(n - 4) < 0.01)) return v;
      }
    }
    return null;
  };
  // Tailwind utilities that draw shadows, rings, blurs or gradients, with any variant prefix.
  const EFFECT = /^(?:shadow|inset-shadow|drop-shadow|text-shadow|blur|backdrop-|ring(?:-|$)|inset-ring|bg-clip-text|bg-(?:linear|radial|conic|gradient)-|bg-\[(?:linear|radial|conic|repeating)-gradient)/;
  const GRADIENT = /^bg-(?:linear|radial|conic|gradient)-|^bg-\[(?:linear|radial|conic|repeating)-gradient/;
  const baseUtility = (token) => {
    let depth = 0;
    let cut = -1;
    for (let i = 0; i < token.length; i++) {
      if (token[i] === "[") depth++;
      else if (token[i] === "]") depth--;
      else if (token[i] === ":" && depth === 0) cut = i;
    }
    return token.slice(cut + 1).replace(/^!/, "");
  };

  // Element rules (checks 5, 6, 7, 8, 9's italic style, 10, 12, 13) inside a scope.
  R.elementAudit = (scopeSel) => {
    const scope = scopeSel === "document" ? document.body : typeof scopeSel === "number" ? R.state.items[scopeSel]?.el : document.querySelector(scopeSel);
    const out = [];
    if (!scope) return out;
    const add = (check, el, kind, detail = "") => out.push({ check, where: where(el), kind, sample: `${R.describe(el)}${detail ? ` ${detail}` : ""}` });
    const st = R.steps();
    const sizes = Object.values(st);
    const fam = R.families();
    const els = [scope, ...scope.querySelectorAll("*")];
    for (const el of els) {
      const tag = el.tagName.toLowerCase();
      if (el.closest("svg") && tag !== "svg") continue;
      if (["script", "style", "noscript", "template", "head", "meta", "link"].includes(tag)) continue;
      if (!rendered(el)) continue;
      const cs = getComputedStyle(el);
      const film = inFilm(el);
      const layers = [["", cs]];
      for (const p of ["::before", "::after"]) {
        const ps = getComputedStyle(el, p);
        if (ps.content && ps.content !== "none" && ps.content !== "normal") layers.push([p, ps]);
      }
      for (const [p, s] of layers) {
        const r = radiusBad(s);
        if (r) add(5, el, "border-radius other than 0 or 4px", `${p} ${r}`.trim());
        if (s.boxShadow && s.boxShadow !== "none") add(5, el, "box-shadow", `${p} ${s.boxShadow}`.trim().slice(0, 70));
        if (s.textShadow && s.textShadow !== "none") add(5, el, "text-shadow", `${p} ${s.textShadow}`.trim().slice(0, 70));
        if (/blur\(/.test(s.filter)) add(5, el, "blur filter", `${p} ${s.filter}`.trim());
        if (s.backdropFilter && s.backdropFilter !== "none") add(5, el, "backdrop-filter", `${p} ${s.backdropFilter}`.trim());
        if (s.backgroundClip === "text" || s.webkitBackgroundClip === "text") add(5, el, "background-clip: text (gradient text)", p);
        if (/gradient\(/.test(s.backgroundImage) && !film) add(5, el, "gradient outside the film bands' scrims", p);
        if (p && /^["']/.test(s.content) && s.content.length > 2) {
          const fs = parseFloat(s.fontSize);
          if (!sizes.some((v) => Math.abs(v - fs) < 0.1)) add(7, el, "font size off the scale", `${p} ${fs}px`);
          if (!fam.all.has(firstFamily(s.fontFamily))) add(6, el, "font family outside Instrument Serif and Inter", `${p} ${firstFamily(s.fontFamily)}`);
          if (s.textTransform === "uppercase" && !el.closest(".label")) add(8, el, "uppercase outside .label", p);
        }
      }
      for (const token of el.classList) {
        const base = baseUtility(token);
        if (!EFFECT.test(base) || /-(?:none|0)$/.test(base)) continue;
        if (GRADIENT.test(base) && film) continue;
        add(5, el, "shadow, ring, blur or gradient utility in the class list", token);
      }
      const control = ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName);
      if (!control && !ownText(el)) continue;
      const first = firstFamily(cs.fontFamily);
      if (!fam.all.has(first)) add(6, el, "font family outside Instrument Serif and Inter", first);
      else if (fam.serif.has(first) && !el.closest("h1, h2, h3") && !el.closest(".letter") && !isWordmark(el) && !inMenuLink(el)) add(6, el, "Instrument Serif outside h1-h3, .letter, the footer wordmark and the phone menu");
      const fs = parseFloat(cs.fontSize);
      if (!sizes.some((v) => Math.abs(v - fs) < 0.1)) add(7, el, "font size off the scale", `${Math.round(fs * 100) / 100}px`);
      // The founder letter is set at the H3 step, every word of it.
      if (el.closest(".letter") && Math.abs(fs - st.h3) > 0.1) add(7, el, `text in .letter off the H3 step (${st.h3}px)`, `${Math.round(fs * 100) / 100}px`);
      if (cs.textTransform === "uppercase" && !el.closest(".label")) add(8, el, "uppercase outside .label");
      if (/center/.test(cs.textAlign) && !control && el.tagName !== "OPTION" && !inHomeHero(el)) add(8, el, "centred text outside the home hero");
      if (cs.fontStyle === "italic" && !el.closest("em, i")) add(9, el, "italic outside an em");
    }
    for (const h of scope.querySelectorAll("h1, h2, h3")) {
      if (!rendered(h)) continue;
      const cs = getComputedStyle(h);
      const fs = parseFloat(cs.fontSize);
      if (fs < st.h3 - 0.1) add(7, h, `heading below the H3 step (${st.h3}px)`, `${Math.round(fs * 100) / 100}px`);
      if (!fam.serif.has(firstFamily(cs.fontFamily))) add(6, h, "heading not in Instrument Serif", firstFamily(cs.fontFamily));
    }
    for (const h of scope.querySelectorAll("h4, h5, h6")) if (h.closest("main")) add(7, h, "h4-h6 in <main>");
    // Check 10: a label never sits directly above an h1 or h2.
    const labels = [...scope.querySelectorAll(".label")].filter(rendered);
    for (const h of scope.querySelectorAll("h1, h2")) {
      const prev = h.previousElementSibling;
      if (prev && prev.matches(".label")) {
        add(10, h, "a .label is the element right before the heading", `(${R.describe(prev)})`);
        continue;
      }
      if (!rendered(h)) continue;
      const hr = h.getBoundingClientRect();
      const above = labels.find((l) => {
        const lr = l.getBoundingClientRect();
        return lr.bottom <= hr.top + 1 && hr.top - lr.bottom <= 24 && lr.left < hr.right && lr.right > hr.left && Math.abs(lr.left - hr.left) <= 4;
      });
      if (above) add(10, h, "a .label sits directly above the heading", `(${R.describe(above)})`);
    }
    // Check 10: eyebrows. Structure (an eyebrow right before each h2 in <main> and each h1 but the
    // home hero's; every h2 inside [data-section-head]), the eyebrow's words and computed style, and
    // its geometry against the heading.
    const eyebrowRe = new RegExp(R.cfg.eyebrow);
    const tk = R.tokens();
    const round = (v) => Math.round(v * 10) / 10;
    for (const h of scope.querySelectorAll("main h1, main h2")) {
      const exempt = h.closest("[data-prose], [data-form-success]");
      if (h.tagName === "H2" && !exempt && !h.closest("[data-section-head]")) add(10, h, "an h2 outside [data-section-head]");
      if (exempt || (h.tagName === "H1" && inHomeHero(h))) continue;
      const prev = h.previousElementSibling;
      if (!prev || !prev.matches(".eyebrow")) {
        add(10, h, `an ${h.tagName.toLowerCase()} without an eyebrow (p.eyebrow) right before it`, prev ? `(it follows ${R.describe(prev)})` : "(it is the first child of its parent)");
        continue;
      }
      if (!rendered(h) || !rendered(prev)) continue;
      const hr = h.getBoundingClientRect();
      const er = prev.getBoundingClientRect();
      const gap = hr.top - er.bottom;
      if (Math.abs(gap - 16) > 1) add(10, h, "eyebrow to heading is not 16px (within 1)", `(${round(gap)}px under "${clean(prev.textContent)}")`);
      if (Math.abs(hr.left - er.left) > 1) add(10, h, "eyebrow and heading do not share a left edge (within 1px)", `(eyebrow at x ${round(er.left)}, heading at x ${round(hr.left)})`);
    }
    for (const e of scope.querySelectorAll(".eyebrow")) {
      if (!e.closest("main") && !(R.state.footer && R.state.footer.contains(e))) continue;
      if (!rendered(e)) continue;
      const text = clean(e.textContent);
      if (!eyebrowRe.test(text)) add(10, e, "eyebrow is not lowercase, 1 to 3 words", `("${text}")`);
      const cs = getComputedStyle(e);
      const problems = [];
      const family = firstFamily(cs.fontFamily);
      if (!fam.sans.has(family)) problems.push(`family ${family}, not Inter`);
      if (Math.abs(parseFloat(cs.fontSize) - st.small) > 0.1) problems.push(`size ${cs.fontSize}, not the small step (${st.small}px)`);
      if (cs.fontWeight !== "500") problems.push(`weight ${cs.fontWeight}, not 500`);
      if (!(cs.letterSpacing === "normal" || Math.abs(parseFloat(cs.letterSpacing)) < 0.01)) problems.push(`letter-spacing ${cs.letterSpacing}, not normal`);
      if (cs.textTransform !== "none") problems.push(`text-transform ${cs.textTransform}`);
      const dark = luminance(effectiveBackground(e)) <= 0.4;
      const want = dark ? tk["muted-on-dark"] : tk.muted;
      if (!same(cs.color, want)) problems.push(`colour ${cs.color}, not ${dark ? "muted-on-dark" : "muted"} (${want}) on this ${dark ? "dark" : "light"} surface`);
      if (problems.length) add(10, e, "eyebrow style is off the spec", `(${problems.join("; ")})`);
    }
    // Check 29: the uppercase .label is for data labels inside UI ([data-ui]) and the header only.
    for (const l of scope.querySelectorAll(".label")) {
      if (!rendered(l) || l.closest("[data-ui], body > header")) continue;
      add(29, l, "a .label outside [data-ui] and the header", "");
    }
    const counted = captions(scope, add);
    if (scope === document.body) R.lastCaptions = counted;
    demos(scope, add);
    return out;
  };
  R.captionCounts = () => R.lastCaptions;

  // The media inside a scope, grouped by frame: a figure, or a film block. Check 14 reads them too.
  function frames(scope) {
    const map = new Map();
    for (const m of scope.querySelectorAll("img, video")) {
      const id = mediaId(m);
      if (!id || !present(m)) continue;
      // A hover clip and the still under it are one figure.
      const frame = m.closest("[data-hover-clip]") || m.closest("figure") || filmBlockOf(m);
      const key = frame || m;
      if (!map.has(key)) map.set(key, { frame, ids: new Set(), media: m });
      map.get(key).ids.add(id);
    }
    return map;
  }
  // Check 12: no Concept render caption inside a scope.
  function captions(scope, add) {
    const retired = new RegExp(R.cfg.retiredCaption, "i");
    const all = [...scope.querySelectorAll("*")].filter((e) => retired.test(ownText(e)) && present(e));
    for (const c of all) add(12, c, `a "${R.cfg.retiredCaption}" caption, which the owner removed`, `("${clean(c.textContent)}")`);
    return { frames: frames(scope).size, captions: all.length };
  }

  // Check 13: the coded demos inside a scope.
  function leafWithText(scope, text) {
    return [...scope.querySelectorAll("*")].filter((e) => clean(e.textContent) === text && present(e) && ![...e.children].some((k) => clean(k.textContent) === text));
  }
  function demos(scope, add) {
    const found = { windows: 0, apps: 0 };
    for (const w of scope.querySelectorAll("[role='group'][aria-label$='demo window']")) {
      if (!present(w)) continue;
      found.windows++;
      const wrap = w.closest("[data-software-preview]") || w.parentElement;
      if (!leafWithText(w, R.cfg.demoData).length) add(13, w, `window without "${R.cfg.demoData}" in its title bar`);
      const notes = leafWithText(wrap, R.cfg.windowNote);
      if (!notes.length) add(13, w, "window without the illustrative-model note");
      else if (notes.length > 1) add(13, w, `illustrative-model note shown ${notes.length} times`);
      else if (notes[0].getBoundingClientRect().top < w.getBoundingClientRect().bottom - 1) add(13, notes[0], "illustrative-model note is not beneath the window");
      const readouts = [...wrap.querySelectorAll("details > summary")].find((s) => clean(s.textContent) === "Inspect panel data");
      if (!readouts) add(13, w, 'window without "Inspect panel data"');
    }
    for (const a of scope.querySelectorAll(`[aria-label="${R.cfg.appPanelLabel}"]`)) {
      if (!present(a)) continue;
      found.apps++;
      if (a.getAttribute("role") !== "group") add(13, a, 'app panel\'s label is not on a role="group"');
      if (!leafWithText(a, R.cfg.demoData).length) add(13, a, `app panel without "${R.cfg.demoData}"`);
      if (R.cfg.appNote && !leafWithText(a, R.cfg.appNote).length) add(13, a, `app panel without "${R.cfg.appNote}"`);
    }
    R.lastDemos = found;
    return found;
  }
  R.demosFound = () => R.lastDemos;

  // Check 14 per state: which ids show in which frames.
  R.mediaFrames = () => {
    const out = [];
    for (const f of frames(document.body).values()) {
      out.push({ ids: [...f.ids], where: where(f.frame || f.media), what: f.frame ? (f.frame.tagName === "FIGURE" ? "figure" : f.frame.hasAttribute("data-hover-clip") ? "hover-clip frame" : "film frame") : "loose" });
    }
    return out;
  };
  R.mediaInDom = () => {
    const ids = new Set();
    for (const m of document.querySelectorAll("img, video, source")) {
      for (const s of [m.getAttribute("src"), m.getAttribute("srcset"), m.getAttribute("poster")]) {
        if (!s) continue;
        for (const part of s.split(",")) {
          const id = mediaIdOf(part.trim().split(" ")[0]);
          if (id) ids.add(id);
        }
      }
    }
    return [...ids];
  };

  // Page rules (checks 9, 11, 21's sticky parts, 22, 23, 24): the whole DOM, hidden states included.
  R.pageAudit = () => {
    const out = [];
    const add = (check, el, kind, detail = "") => out.push({ check, where: el ? where(el) : "page", kind, sample: el ? `${R.describe(el)}${detail ? ` ${detail}` : ""}` : detail });

    // Check 9: gather every em and i.
    const italics = [...document.body.querySelectorAll("em, i")].map((e) => {
      const heading = e.closest("h1, h2, h3");
      const hcs = heading ? getComputedStyle(heading) : null;
      // The band it sits in, and the heading that labels that band.
      const band = e.closest("[data-band]");
      const labelIds = (band?.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean);
      const labelling = labelIds.map((id) => document.getElementById(id)).filter(Boolean);
      return {
        text: clean(e.textContent),
        heading: heading ? heading.tagName.toLowerCase() : null,
        headingText: heading ? clean(heading.textContent) : "",
        trailing: heading ? clean(heading.textContent).endsWith(clean(e.textContent)) : false,
        colourMatches: heading ? same(getComputedStyle(e).color, hcs.color) : true,
        inSummary: !!e.closest("summary"),
        inP: !!e.closest("p"),
        inButton: !!e.closest("button, [data-button]"),
        inLetter: !!e.closest(".letter"),
        inEyebrow: !!e.closest(".eyebrow"),
        band: band ? band.getAttribute("data-band") || band.id || "band" : null,
        bandLabelled: labelling.length > 0,
        inLabellingHeading: labelling.some((l) => l.contains(e)),
        where: where(e),
        sample: R.describe(heading || e),
      };
    });

    // Check 11: text grouped by its block container, hidden states included.
    // Each entry knows whether it sits inside the calculator, where "$" is the visitor's own figure.
    const blocks = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || !n.textContent.trim() || p.closest("script, style, noscript, template")) continue;
      let b = p;
      while (b.parentElement && ["inline", "contents"].includes(getComputedStyle(b).display) && b !== document.body) b = b.parentElement;
      if (!blocks.has(b)) blocks.set(b, []);
      blocks.get(b).push(n.textContent);
    }
    const texts = [...blocks.entries()].map(([b, parts]) => ({ text: quotes(clean(parts.join(""))), calc: !!b.closest("[data-calculator]"), where: where(b), sample: R.describe(b) }));

    // Figures.
    const numerals = [...document.querySelectorAll("main .numeral, footer .numeral")].map((n) => {
      let item = n;
      while (item.parentElement && item.parentElement !== document.body && item.parentElement.querySelectorAll(".numeral").length === 1 && !item.parentElement.matches("main, section, [data-band]")) item = item.parentElement;
      const block = R.state.items.find((it) => it.el.contains(n))?.el ?? null;
      return {
        text: quotes(clean(n.textContent)),
        item: quotes(clean(item.textContent)),
        block: block ? quotes(clean(block.textContent)) : "",
        links: [...item.querySelectorAll("a[href]")].map((a) => ({ href: a.getAttribute("href"), text: clean(a.textContent), target: a.getAttribute("target") || "", rel: a.getAttribute("rel") || "" })),
        demo: !!n.closest("[data-software-preview], [role='group'][aria-label$='demo window'], [role='group'][aria-label$='demo data'], [role='img']"),
        where: where(n),
        sample: R.describe(n),
      };
    });

    // Check 21: sticky and fixed elements, scroll-driven animations.
    const header = document.querySelector("body > header, header.nav-bar") || document.querySelector("header");
    for (const el of document.body.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if ((cs.position === "sticky" || cs.position === "fixed") && !rendered(el)) continue;
      if (cs.position === "sticky") add(21, el, "sticky element (only the header may be)");
      if (cs.position === "fixed" && !(header && header.contains(el)) && !el.matches('a[href="#main"]')) add(21, el, "fixed element other than the header");
      if ((cs.animationTimeline && !/^(auto|none)$/.test(cs.animationTimeline)) || (cs.viewTimelineName && cs.viewTimelineName !== "none") || (cs.scrollTimelineName && cs.scrollTimelineName !== "none")) add(21, el, "scroll-driven animation");
    }

    // Check 23: placeholders.
    for (const t of texts) if (/\bto come\b/i.test(t.text)) out.push({ check: 23, where: t.where, kind: '"to come"', sample: `${t.sample}` });
    for (const el of document.querySelectorAll("[data-media-placeholder]")) add(23, el, "data-media-placeholder", `(${el.getAttribute("data-media-placeholder")})`);
    for (const el of document.querySelectorAll("main [role='img'], footer [role='img']")) {
      if (el.querySelector("img, video, canvas, svg, picture")) continue;
      if (/photo|portrait|placeholder/i.test(`${el.getAttribute("aria-label") || ""} ${el.textContent}`)) add(23, el, "photo placeholder box");
    }
    R.emptyBoxes = emptyBoxes();

    // Check 22: every copy of the canonical link, the description and the share card's tags.
    const values = (selector, attr) => [...document.querySelectorAll(selector)].map((e) => e.getAttribute(attr));
    const head = { canonical: values('link[rel="canonical"]', "href") };
    for (const key of ["description", "og:url", "og:title", "og:description", "og:image", "twitter:title", "twitter:description"]) head[key] = values(`meta[name="${key}"], meta[property="${key}"]`, "content");

    return { violations: out, italics, texts, numerals, links: R.enquiryLinks("body"), title: document.title, head, emptyBoxes: R.emptyBoxes.length };
  };

  // Check 24: every link to /register-interest in a scope, hidden states included.
  R.enquiryLinks = (scopeSel) => {
    const links = [];
    for (const a of document.querySelectorAll(`${scopeSel} a[href]`)) {
      // In-page anchors (the skip link, #parts) are not enquiry routes, even on /register-interest.
      if (a.getAttribute("href").startsWith("#")) continue;
      let url;
      try {
        url = new URL(a.getAttribute("href"), location.href);
      } catch {
        continue;
      }
      if (url.origin !== location.origin || url.pathname.replace(/\/$/, "") !== "/register-interest") continue;
      links.push({ type: url.searchParams.get("type") ?? "", label: labelOf(a), where: where(a), sample: `<a href="${a.getAttribute("href")}">` });
    }
    return links;
  };

  // Empty boxes: a filled or framed rectangle of 96px or more with nothing rendered in it.
  function emptyBoxes() {
    const found = [];
    for (const el of document.querySelectorAll("main *, footer *")) {
      if (inFilm(el) || el.closest("svg")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 96 || r.height < 96 || !rendered(el)) continue;
      const cs = getComputedStyle(el);
      const filled = alphaOf(cs.backgroundColor) > 0.02 && !same(cs.backgroundColor, effectiveBackground(el.parentElement));
      const framed = ["Top", "Right", "Bottom", "Left"].every((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
      if (!filled && !framed) continue;
      if (el.matches("img, video, canvas, svg, picture, iframe, input, select, textarea, button, hr")) continue;
      if (el.querySelector("img, video, canvas, svg, picture, iframe, input, select, textarea, button, object, embed")) continue;
      if (clean(el.textContent)) continue;
      found.push(el);
    }
    return found;
  }
  R.emptyBoxCount = () => (R.emptyBoxes || []).length;
  // A box that fills in once it is near the screen (a lazy scene, a loading state) is not a placeholder.
  R.recheckEmptyBox = (i) => {
    const el = R.emptyBoxes[i];
    if (!el || !el.isConnected) return null;
    el.scrollIntoView({ block: "center" });
    return new Promise((resolve) =>
      setTimeout(() => {
        const still = rendered(el) && !el.querySelector("img, video, canvas, svg, picture, iframe, input, select, textarea, button") && !clean(el.textContent);
        const r = el.getBoundingClientRect();
        resolve(still ? { where: where(el), sample: `${R.describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}` } : null);
      }, 2500),
    );
  };

  // Check 28: the copy budget's counter. Words at load are main's innerText with the outermost
  // excluded subtrees hidden for the one synchronous read (so nothing they hold is counted and no
  // observer ever sees the change); words in all states walk the text nodes instead, so closed answers
  // and inactive tabs count too, with a word break at every element that is not phrasing content.
  const COPY_EXCLUDE = [
    "[data-ui]",
    "[data-prose]",
    "form",
    ".sr-only",
    '[aria-hidden="true"]',
    "[data-software-preview]",
    "[role='group'][aria-label$='demo window']",
    "[role='group'][aria-label$='demo data']",
  ].join(", ");
  const INLINE = new Set(["A", "ABBR", "B", "BDI", "BDO", "CITE", "CODE", "DATA", "DFN", "EM", "I", "KBD", "MARK", "Q", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TIME", "U", "VAR", "WBR"]);
  const wordsIn = (s) => (s || "").split(/\s+/).filter(Boolean).length;
  const outermostExcluded = (root) => [...root.querySelectorAll(COPY_EXCLUDE)].filter((e) => {
    const above = e.parentElement?.closest(COPY_EXCLUDE);
    return !above || !root.contains(above);
  });
  const atLoad = (root) => {
    if (!root || root.closest(COPY_EXCLUDE)) return 0;
    const hidden = outermostExcluded(root).map((e) => [e, e.style.getPropertyValue("display"), e.style.getPropertyPriority("display")]);
    for (const [e] of hidden) e.style.setProperty("display", "none", "important");
    const text = root.innerText;
    for (const [e, value, priority] of hidden) {
      if (value) e.style.setProperty("display", value, priority);
      else e.style.removeProperty("display");
    }
    return wordsIn(text);
  };
  const allStates = (root) => {
    if (!root || root.closest(COPY_EXCLUDE)) return 0;
    let text = "";
    const visit = (node) => {
      for (const c of node.childNodes) {
        if (c.nodeType === 3) text += c.textContent;
        else if (c.nodeType === 1) {
          if (c.matches(COPY_EXCLUDE) || c.matches("script, style, template, noscript")) {
            text += " ";
            continue;
          }
          const block = !INLINE.has(c.tagName);
          if (block) text += " ";
          visit(c);
          if (block) text += " ";
        }
      }
    };
    visit(root);
    return wordsIn(text);
  };
  // { load, all, bands: [{ i, id, load }] }: the page's counts and each band's share of the words at load.
  R.copyWords = () => {
    const main = document.querySelector("main");
    const bands = (R.state?.items ?? []).map((it, i) => ({ i: i + 1, id: it.el.getAttribute("data-band") || it.el.id || it.el.tagName.toLowerCase(), load: atLoad(it.el) }));
    return { load: atLoad(main), all: allStates(main), bands };
  };

  // Check 13: open each window's "Inspect panel data" and read it.
  R.openReadouts = () => {
    const out = [];
    for (const w of document.querySelectorAll("[role='group'][aria-label$='demo window']")) {
      if (!present(w)) continue;
      const wrap = w.closest("[data-software-preview]") || w.parentElement;
      const summary = [...wrap.querySelectorAll("details > summary")].find((s) => clean(s.textContent) === "Inspect panel data");
      if (!summary) continue;
      if (!summary.parentElement.open) summary.click();
      out.push(where(w));
    }
    return out;
  };
  R.readReadouts = () =>
    [...document.querySelectorAll("[role='group'][aria-label$='demo window']")].filter(present).map((w) => {
      const wrap = w.closest("[data-software-preview]") || w.parentElement;
      const d = [...wrap.querySelectorAll("details")].find((x) => clean(x.querySelector("summary")?.textContent) === "Inspect panel data");
      return { where: where(w), open: !!d?.open, has: !!d && quotes(clean(d.textContent)).includes(quotes(R.cfg.readoutsNote)), sample: R.describe(w) };
    });

  // Check 21 helpers.
  R.numeralTexts = () => [...document.querySelectorAll("main .numeral")].map((n) => clean(n.textContent));
  R.scrollToNumeral = (i) => {
    const n = document.querySelectorAll("main .numeral")[i];
    if (!n) return null;
    n.scrollIntoView({ block: "center" });
    return clean(n.textContent);
  };
  R.videos = () =>
    [...document.querySelectorAll("video")].map((v) => ({
      id: mediaId(v) || (v.currentSrc || v.querySelector("source")?.getAttribute("src") || "").split("/").pop(),
      playing: !v.paused && !v.ended && v.readyState >= 2,
      paused: v.paused,
      autoplay: v.autoplay,
      controls: v.controls,
      where: where(v),
    }));
  // Watches every video: whenever one starts playing, counts how many are playing at that moment.
  R.watchVideos = () => {
    R.videoPeak = { count: 0, ids: [] };
    const check = () => {
      const playing = [...document.querySelectorAll("video")].filter((v) => !v.paused && !v.ended);
      if (playing.length > R.videoPeak.count) R.videoPeak = { count: playing.length, ids: playing.map((v) => mediaId(v) || (v.currentSrc || "").split("/").pop()) };
    };
    for (const v of document.querySelectorAll("video")) {
      v.addEventListener("playing", check);
      v.addEventListener("play", check);
    }
    check();
    return document.querySelectorAll("video").length;
  };
  R.videoPeakNow = () => R.videoPeak;
  R.filmBottom = () => {
    const films = R.state.items.filter((it) => it.film);
    const last = films[films.length - 1];
    return last ? last.el.getBoundingClientRect().bottom + scrollY : 0;
  };
  R.windows = () =>
    [...document.querySelectorAll("[role='group'][aria-label$='demo window']")].filter(present).map((w, i) => {
      const wrap = w.closest("[data-software-preview]") || w.parentElement;
      const rec = [...wrap.querySelectorAll("video")].find((v) => /software-view/.test(v.currentSrc || v.querySelector("source")?.getAttribute("src") || v.getAttribute("poster") || ""));
      const r = w.getBoundingClientRect();
      return { i, where: where(w), canvas: !!wrap.querySelector("canvas"), recording: !!rec && present(rec), controls: !!rec?.controls, top: r.top + scrollY, bottom: r.bottom + scrollY };
    });
  R.draws = () => window.__p7draws || 0;

  // Reveals under reduced motion: the opacity and transform of each element the moment it first comes
  // on screen, compared with its state once the page has been still for a while.
  R.firstSeen = new Map();
  R.recordFirstSeen = () => {
    for (const el of document.querySelectorAll("main *")) {
      if (R.firstSeen.has(el) || el.closest("[data-software-preview], [role='group'][aria-label$='demo window'], video, canvas, svg")) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(el);
      R.firstSeen.set(el, `${cs.opacity}|${cs.transform}`);
    }
    return R.firstSeen.size;
  };
  R.firstSeenChanges = () => {
    const changed = [];
    const parse = (state) => {
      const [opacity, transform] = state.split("|");
      const m = transform.match(/matrix\(([^)]+)\)/);
      const v = m ? m[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
      return { opacity: Math.round(parseFloat(opacity) * 100) / 100, dx: Math.round(v[4]), dy: Math.round(v[5]) };
    };
    for (const [el, then] of R.firstSeen) {
      if (!el.isConnected || changed.some((c) => c.el.contains(el))) continue;
      const cs = getComputedStyle(el);
      const now = `${cs.opacity}|${cs.transform}`;
      if (now === then) continue;
      const a = parse(then);
      const b = parse(now);
      const parts = [a.opacity !== b.opacity ? `opacity ${a.opacity} to ${b.opacity}` : "", a.dx !== b.dx || a.dy !== b.dy ? `moved ${Math.abs(b.dy - a.dy) || Math.abs(b.dx - a.dx)}px` : ""].filter(Boolean);
      changed.push({ el, where: where(el), sample: `${R.describe(el)} (${parts.join(", ") || "transform changed"})` });
    }
    return changed.map(({ where: w, sample }) => ({ where: w, sample }));
  };
  R.tabCrossfade = () => {
    const out = [];
    for (const list of document.querySelectorAll('main [role="tablist"]')) {
      const tabs = [...list.querySelectorAll('[role="tab"]')].filter(rendered);
      const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const next = tabs[(current + 1) % tabs.length];
      if (!next || tabs.length < 2) continue;
      out.push({ list, next, back: tabs[Math.max(0, current)] });
    }
    R.fadeTargets = out;
    return out.length;
  };
  R.clickFade = (i) => {
    const t = R.fadeTargets[i];
    t.next.click();
    return new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const panel = document.getElementById(t.next.getAttribute("aria-controls"));
          const opacity = panel ? parseFloat(getComputedStyle(panel).opacity) : 1;
          const res = { where: where(t.list), opacity, sample: R.describe(t.next) };
          t.back.click();
          resolve(res);
        }),
      ),
    );
  };
  R.tracks = () => {
    R.trackEls = [];
    for (const ul of document.querySelectorAll("main ul, main ol")) {
      const cs = getComputedStyle(ul);
      if (!/(auto|scroll)/.test(cs.overflowX) || ul.scrollWidth <= ul.clientWidth + 2 || !rendered(ul)) continue;
      const buttons = ul.parentElement ? [...ul.parentElement.querySelectorAll(":scope > div button")] : [];
      if (buttons.length < 2) continue;
      R.trackEls.push({ ul, prev: buttons[0], next: buttons[1] });
    }
    return R.trackEls.length;
  };
  R.snapTrack = (i) => {
    const t = R.trackEls[i];
    t.ul.scrollLeft = 0;
    t.ul.scrollIntoView({ block: "center" });
    const start = t.ul.scrollLeft;
    t.next.click();
    return new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const early = t.ul.scrollLeft;
          setTimeout(() => {
            const late = t.ul.scrollLeft;
            t.ul.scrollLeft = 0;
            resolve({ where: where(t.ul), start, early, late, sample: R.describe(t.next) });
          }, 700);
        }),
      ),
    );
  };

  // Pinning: page positions of sizeable elements, compared at two scroll positions.
  // A reveal still waiting below the fold (hidden, offset 12px) moves once when it enters: not pinning.
  const awaitingReveal = (el) => {
    for (let e = el.closest("[data-reveal]"); e; e = e.parentElement?.closest("[data-reveal]")) {
      const cs = getComputedStyle(e);
      if (Number(cs.opacity) < 0.99 || (cs.transform !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(cs.transform))) return true;
    }
    return false;
  };
  R.positions = () => {
    R.posEls = [];
    const pos = [];
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;
      if (awaitingReveal(el)) continue;
      let fixed = false;
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const p = getComputedStyle(e).position;
        if (p === "fixed" || p === "sticky") {
          fixed = true;
          break;
        }
      }
      if (fixed) continue;
      R.posEls.push(el);
      pos.push(r.top + scrollY);
    }
    R.posPrev = pos;
    return pos.length;
  };
  R.positionChanges = () => {
    const moved = [];
    R.posEls.forEach((el, i) => {
      if (!el.isConnected) return;
      const now = el.getBoundingClientRect().top + scrollY;
      if (Math.abs(now - R.posPrev[i]) > 3 && !moved.some((m) => m.el.contains(el))) moved.push({ el, delta: Math.round(now - R.posPrev[i]) });
    });
    return moved.slice(0, 5).map((m) => ({ where: where(m.el), sample: `${R.describe(m.el)} moved ${m.delta}px` }));
  };

  // Checks 25 to 27: words and lines. A heading's words, without its aria-hidden parts.
  const visibleText = (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("[aria-hidden='true'], .sr-only").forEach((n) => n.remove());
    return clean(copy.textContent);
  };
  R.headlines = () =>
    [...document.querySelectorAll("main h1, main h2, main h3")]
      .filter((h) => !h.closest("[data-ui]"))
      .map((h) => {
        const text = visibleText(h);
        return { tag: h.tagName.toLowerCase(), text, words: text.split(/\s+/).filter(Boolean).length, where: where(h), sample: R.describe(h) };
      });

  // The rendered lines of an element, each with its words. Words are whitespace-separated runs of the
  // element's text (a run that crosses an inline element, "pre-<em>launch</em>", stays one word while
  // it stays on one line); each word is placed by its Range rect, and rects are grouped into lines by
  // their vertical middle. Text in svg, .sr-only and aria-hidden parts is not counted.
  const lines = (el) => {
    const range = document.createRange();
    const frags = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest("svg, .sr-only, [aria-hidden='true'], script, style")) continue;
      const t = n.textContent;
      for (const m of t.matchAll(/\S+/g)) {
        range.setStart(n, m.index);
        range.setEnd(n, m.index + m[0].length);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
        if (!rects.length) continue;
        frags.push({ text: m[0], node: n, start: m.index, end: m.index + m[0].length, len: t.length, rect: rects[0], last: rects[rects.length - 1] });
      }
    }
    const words = [];
    for (const f of frags) {
      const prev = words[words.length - 1];
      const glued = prev && prev.lastFrag.node !== f.node && prev.lastFrag.end === prev.lastFrag.len && f.start === 0 && Math.abs(prev.lastFrag.last.top - f.rect.top) < Math.max(4, f.rect.height / 2);
      if (glued) {
        prev.text += f.text;
        prev.lastFrag = f;
      } else words.push({ text: f.text, rect: f.rect, lastFrag: f });
    }
    const out = [];
    for (const w of words) {
      const mid = (w.rect.top + w.rect.bottom) / 2;
      let line = out.find((l) => mid >= l.top && mid <= l.bottom);
      if (!line) {
        line = { top: w.rect.top, bottom: w.rect.bottom, words: [] };
        out.push(line);
      }
      line.words.push(w.text);
    }
    return out.sort((a, b) => a.top - b.top).map((l) => l.words);
  };
  R.lines = (sel) => {
    const el = document.querySelector(sel);
    return el ? lines(el) : null;
  };
  // Band-level paragraphs: not inside a component, a form, the coded UI, the policy text, the letter,
  // a link, a list item or the footer; not an eyebrow, not a stat's source line.
  const NOT_BAND_LEVEL = "li, [data-card], [data-accordion], form, [data-form-success], [data-ui], [data-prose], .letter, label, button, a, figure, dl, nav, summary, details, footer, [data-calculator], .sr-only";
  // Check 26: no orphaned last word in headings and band-level intro paragraphs.
  R.orphans = (scopeIndex = null) => {
    const scope = scopeIndex === null ? document : R.state.items[scopeIndex]?.el;
    if (!scope) return [];
    const out = [];
    const heads = [...scope.querySelectorAll("h1, h2, h3")].filter((h) => (h.closest("main") || h.closest("body > footer")) && !h.closest("[data-ui]"));
    const intros = [...scope.querySelectorAll("p")].filter((p) => p.closest("main") && !p.matches(".eyebrow") && !p.closest(NOT_BAND_LEVEL) && !p.querySelector("a[target='_blank']"));
    for (const el of [...heads, ...intros]) {
      if (!rendered(el)) continue;
      const ls = lines(el);
      if (ls.length < 2) continue;
      const last = ls[ls.length - 1];
      if (last.length === 1) out.push({ where: where(el), tag: el.tagName.toLowerCase(), lines: ls.length, word: last[0], sample: R.describe(el) });
    }
    return out;
  };
  // Check 27: every p in <main> on 2 lines or fewer. Closed details are opened for the measurement
  // and closed again. Exempt: [data-prose], forms, .letter, [data-ui], .sr-only, stat source lines.
  R.paragraphLines = (max, scopeIndex = null) => {
    const scope = scopeIndex === null ? document.querySelector("main") : R.state.items[scopeIndex]?.el;
    if (!scope) return [];
    const closed = [...scope.querySelectorAll("details:not([open])")];
    for (const d of closed) d.open = true;
    const out = [];
    for (const p of scope.querySelectorAll("p")) {
      if (!p.closest("main") || p.closest("[data-prose], form, .letter, [data-ui], .sr-only") || p.querySelector("a[target='_blank']")) continue;
      if (p.getClientRects().length === 0 || !visibleText(p)) continue;
      const n = lines(p).length;
      if (n > max) out.push({ where: where(p), lines: n, sample: R.describe(p) });
    }
    for (const d of closed) d.open = false;
    return out;
  };

  // Check 33: the calculator.
  R.calc = () => {
    const form = document.querySelector("[data-calculator]");
    if (!form) return null;
    const fields = [...form.querySelectorAll("input, select, textarea")].filter((f) => f.type !== "hidden");
    const unlabelled = fields.filter((f) => !(f.labels && f.labels.length) && !f.getAttribute("aria-label") && !f.getAttribute("aria-labelledby")).map((f) => R.describe(f) || `<${f.tagName.toLowerCase()}#${f.id}>`);
    const live = [...form.querySelectorAll("[role='status'], [role='alert'], [role='log'], [aria-live]")].filter((e) => e.getAttribute("aria-live") !== "off");
    const liveInfo = live.map((e) => ({ tag: e.tagName.toLowerCase(), srOnly: e.classList.contains("sr-only") || /inset\(50%|rect\(0/.test(getComputedStyle(e).clip + getComputedStyle(e).clipPath), sample: R.describe(e) }));
    const band = form.closest("[data-band]") || form;
    return { unlabelled, live: liveInfo, ids: fields.map((f) => f.id), bandText: quotes(clean(band.innerText)), where: where(form) };
  };
  R.calcRead = (ids) => {
    const out = {};
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) {
        out[id] = null;
        continue;
      }
      const copy = el.cloneNode(true);
      copy.querySelectorAll(".sr-only").forEach((n) => n.remove());
      out[id] = { text: clean(copy.textContent), overflow: el.scrollWidth > el.clientWidth + 0.5, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    }
    const status = document.querySelector("[data-calculator] [role='status'], [data-calculator] [aria-live]");
    out.status = status ? clean(status.textContent) : null;
    return out;
  };
  // Every distinct text each output shows, frame by frame, until stopped: a tween shows in-between values.
  R.calcWatch = (ids) => {
    R.calcSeen = Object.fromEntries(ids.map((id) => [id, []]));
    R.calcWatching = true;
    const tick = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const copy = el.cloneNode(true);
        copy.querySelectorAll(".sr-only").forEach((n) => n.remove());
        const t = clean(copy.textContent);
        const seen = R.calcSeen[id];
        if (seen[seen.length - 1] !== t) seen.push(t);
      }
      if (R.calcWatching) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return true;
  };
  R.calcWatchStop = () => {
    R.calcWatching = false;
    return R.calcSeen;
  };
  R.storageCount = () => {
    let n = 0;
    try {
      n += localStorage.length + sessionStorage.length;
    } catch {
      // Storage blocked: nothing can be stored either.
    }
    return n;
  };
  R.overflowX = () => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const past = [...document.querySelectorAll("[data-calculator] *")].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 1 || r.left < -1);
    });
    return { root: de.scrollWidth, body: document.body.scrollWidth, viewport: vw, past: past.slice(0, 3).map((e) => R.describe(e)) };
  };

  // Check 41: hover clips.
  R.hoverClips = () =>
    [...document.querySelectorAll("[data-hover-clip]")].map((el, i) => {
      el.setAttribute("data-p7-clip", String(i));
      const r = el.getBoundingClientRect();
      const card = el.closest("[data-card]") || el;
      const link = card.querySelector("a[href]");
      if (link) link.setAttribute("data-p7-clip-link", String(i));
      const still = el.querySelector("img");
      return { i, where: where(el), video: !!el.querySelector("video"), link: !!link, height: Math.round(card.getBoundingClientRect().height * 10) / 10, width: r.width, still: still ? { shown: rendered(still) && Number(getComputedStyle(still).opacity) > 0.5, id: mediaId(still) } : null, sample: R.describe(card.querySelector("h3") || card) };
    });
  R.clipState = (i) => {
    const el = document.querySelector(`[data-p7-clip="${i}"]`);
    if (!el) return null;
    const card = el.closest("[data-card]") || el;
    const own = el.querySelector("video");
    const videos = [...document.querySelectorAll("video")];
    const playing = videos.filter((v) => !v.paused && !v.ended);
    return {
      height: Math.round(card.getBoundingClientRect().height * 10) / 10,
      own: own ? { paused: own.paused, readyState: own.readyState, src: own.currentSrc || own.getAttribute("src") || "", time: own.currentTime } : null,
      ownPlaying: !!own && playing.includes(own),
      others: playing.filter((v) => v !== own).map((v) => mediaId(v) || (v.currentSrc || "").split("/").pop()),
    };
  };

  R.menuButton = () => (R.state.burger && rendered(R.state.burger) ? R.state.burger.getAttribute("aria-label") || "menu" : null);
  R.toggleMenu = () => {
    if (!R.state.burger) return false;
    R.state.burger.click();
    return true;
  };
  R.menuState = () => {
    const burger = R.state.burger;
    R.state.menu = burger ? document.getElementById(burger.getAttribute("aria-controls")) : null;
    return !!R.state.menu;
  };
}

// Counts WebGL draw calls, so the checks can tell whether the live window renders off screen.
function drawCounter() {
  window.__p7draws = 0;
  const wrap = (proto) => {
    if (!proto) return;
    for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "drawRangeElements"]) {
      const original = proto[name];
      if (typeof original !== "function") continue;
      proto[name] = function (...args) {
        window.__p7draws++;
        return original.apply(this, args);
      };
    }
  };
  wrap(window.WebGLRenderingContext?.prototype);
  wrap(window.WebGL2RenderingContext?.prototype);
}

// ---------------------------------------------------------------------------------------------------
// Node side.
// ---------------------------------------------------------------------------------------------------
const opts = parseArgs(process.argv.slice(2));
const chromium = loadChromium();
const content = loadContent();
const manifest = JSON.parse(readFileSync(path.join(ROOT, "scripts/media/manifest.json"), "utf8")).assets;
const manifestIds = new Set(manifest.map((a) => a.id));
const fontFiles = readdirSync(path.join(ROOT, "src/fonts")).filter((f) => f.endsWith(".woff2"));
const fontHashes = new Map(fontFiles.map((f) => [createHash("sha1").update(readFileSync(path.join(ROOT, "src/fonts", f))).digest("hex"), f]));

try {
  const res = await fetch(`${opts.base}/`, { redirect: "manual" });
  if (res.status >= 500) throw new Error(`status ${res.status}`);
} catch (err) {
  fail(`Cannot reach ${opts.base} (${err.message}). Serve a production build first (npm run build && npm run start) and pass its URL.`);
}

let browser;
try {
  browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
} catch (err) {
  fail(`Chromium could not start: ${String(err.message).split("\n")[0]}\nInstall it with: npm i -D playwright && npx playwright install chromium`);
}

const cfg = {
  brand: content.brand ?? "Lienry Drones",
  retiredCaption: SPEC.retiredCaption,
  demoData: SPEC.demoData,
  windowNote: SPEC.windowNote,
  readoutsNote: SPEC.readoutsNote,
  appPanelLabel: SPEC.appPanelLabel,
  appNote: content.appNote ?? null,
  eyebrow: SPEC.eyebrow,
};

const call = (page, fn, arg) => page.evaluate(fn, arg);
const R = (page, name, ...args) => page.evaluate(([n, a]) => window.__p7rules[n](...a), [name, args]);
const fmt = (n) => Math.round(n).toLocaleString("en-AU");
const SINGLE_QUOTES = new RegExp(`[${String.fromCharCode(0x2018, 0x2019)}]`, "g");
const DOUBLE_QUOTES = new RegExp(`[${String.fromCharCode(0x201c, 0x201d)}]`, "g");
const norm = (s) => (s || "").replace(SINGLE_QUOTES, "'").replace(DOUBLE_QUOTES, '"').replace(/\s+/g, " ").trim();

async function settlePage(page, vh) {
  await call(page, () => document.fonts.ready.then(() => true));
  const height = await call(page, () => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
    await call(page, (v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await call(page, () => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  await call(page, () => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await R(page, "idle", 3000);
}

async function newPage(width, extra = {}) {
  const vp = VIEWPORTS[width] ?? { width, height: width < 800 ? 844 : 900, mobile: width < 800 };
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile, ...extra });
  await context.addInitScript(pageLib);
  await context.addInitScript(drawCounter);
  const page = await context.newPage();
  return { context, page, vp };
}

async function load(page, route) {
  try {
    const res = await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
    if (!res || res.status() >= 400) return `HTTP ${res ? res.status() : "no response"}`;
  } catch (err) {
    return String(err.message).split("\n")[0];
  }
  await R(page, "configure", cfg);
  await R(page, "discover");
  return null;
}

// Italics (check 9): the per-em rules, then at most one em per band, inside the heading that labels it.
function judgeItalics(italics, add) {
  for (const e of italics) {
    if (e.heading === "h3") add(9, e.where, "italic in an h3", e.sample);
    else if (e.inSummary) add(9, e.where, "italic in a summary", e.sample);
    else if (e.inButton) add(9, e.where, "italic in a button", e.sample);
    else if (e.inLetter) add(9, e.where, "italic in the letter (.letter)", e.sample);
    else if (e.inEyebrow) add(9, e.where, "italic in an eyebrow", e.sample);
    else if (e.inP) add(9, e.where, "italic in a paragraph", e.sample);
    else if (!e.heading) add(9, e.where, "italic outside a heading", e.sample);
    else {
      if (!e.trailing) add(9, e.where, "italic is not the heading's trailing phrase", `${e.sample} ("${e.text}")`);
      if (!e.colourMatches) add(9, e.where, "italic not in its heading's colour", e.sample);
    }
  }
  const byBand = new Map();
  for (const e of italics) {
    if (!e.band) continue;
    if (!byBand.has(e.band)) byBand.set(e.band, []);
    byBand.get(e.band).push(e);
  }
  for (const [band, list] of byBand) {
    if (list.length > 1) add(9, list[1].where, `${list.length} italics in band #${band}: at most one per section`, list.map((e) => `"${e.text}"`).join(", "));
    for (const e of list) {
      if (!e.heading || e.heading === "h3") continue;
      if (!e.bandLabelled) add(9, e.where, `italic in band #${band}, which has no aria-labelledby heading`, `${e.sample} ("${e.text}")`);
      else if (!e.inLabellingHeading) add(9, e.where, `italic outside the heading that labels band #${band}`, `${e.sample} ("${e.text}")`);
    }
  }
}

// Claims and figures (check 11).
function judgeClaims(texts, numerals, add) {
  if (content.error) {
    add(11, "page", "claims not checked", content.error);
    return;
  }
  const allowed = content.allowed.map(([name, text]) => [name, norm(text)]);
  const approvals = content.approvals.map(norm);
  const inside = (text, index, length, phrases) => phrases.some((p) => {
    for (let from = text.indexOf(p); from >= 0; from = text.indexOf(p, from + 1)) if (index >= from && index + length <= from + p.length) return true;
    return false;
  });
  for (const t of texts) {
    for (const [word, re] of SPEC.banned) {
      // "$" is the visitor's own figure inside the calculator (B24); "price" stays banned everywhere.
      if (word === "$" && t.calc) continue;
      for (const m of t.text.matchAll(re)) {
        if (inside(t.text, m.index, m[0].length, allowed.map(([, text]) => text))) continue;
        const ctx = t.text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40);
        add(11, t.where, `claim word "${word}" outside the allowed sentences`, `${t.sample.split(" ")[0]} "…${ctx}…"`);
      }
    }
    for (const m of t.text.matchAll(/\bapprovals?\b/gi)) {
      if (inside(t.text, m.index, m[0].length, approvals)) continue;
      add(11, t.where, '"approval" outside the two allowed places', `"…${t.text.slice(Math.max(0, m.index - 40), m.index + 50)}…"`);
    }
  }
  const design = content.designFacts;
  for (const n of numerals) {
    if (n.demo) continue;
    const stat = content.stats.find((s) => norm(s.value) === n.text);
    if (stat) {
      const link = n.links.find((l) => l.href === stat.sourceUrl);
      if (!link) add(11, n.where, `cited figure ${n.text} without its source link`, stat.sourceUrl);
      else if (link.target !== "_blank" || !/noreferrer/.test(link.rel) || !/noopener/.test(link.rel)) add(11, n.where, `cited figure ${n.text}'s source link must open a new tab with rel="noreferrer noopener"`, "");
      if (!n.block.includes(norm(SPEC.citedNote))) add(11, n.where, `cited figure ${n.text} without the cited note in its band`, "");
      continue;
    }
    const fact = design?.items?.find((f) => [f.value, `${f.value}${f.unit ?? ""}`, `${f.value} ${f.unit ?? ""}`.trim()].map(norm).includes(n.text) && n.item.includes(norm(f.term)));
    if (fact) {
      if (!n.block.includes(norm(design.note))) add(11, n.where, `design figure ${n.text} without "${design.note}" beside it`, "");
      continue;
    }
    add(11, n.where, design ? "figure that is not a cited stat, a design fact or demo data" : "figure that is not a cited stat or demo data (the content has no design facts)", `${n.sample} in "${n.item.slice(0, 70)}"`);
  }
}

function judgeLinks(links, add) {
  for (const l of links) {
    const want = SPEC.enquiryLabels[l.type];
    if (want === undefined) add(24, l.where, `link to an unknown enquiry type "${l.type}"`, l.sample);
    else if (l.label !== want) add(24, l.where, `enquiry link reads "${l.label}", not "${want}"`, l.sample);
  }
}

// The canonical link and the share card (check 22): one of each tag, with the page's own address and words.
function judgeHead(route, head, add) {
  const single = { canonical: "canonical links", description: "meta descriptions", "og:url": "og:url tags", "og:title": "og:title tags", "og:description": "og:description tags", "twitter:title": "twitter:title tags", "twitter:description": "twitter:description tags" };
  for (const [key, name] of Object.entries(single)) if (head[key].length !== 1) add(22, "page", `${head[key].length} ${name}, not 1`, head[key].join(" | "));
  if (!head["og:image"].length) add(22, "page", "the share card has no og:image", "");
  if (content.error) return;
  const address = route === "/" ? content.siteUrl : `${content.siteUrl}${route}`;
  for (const [key, name] of [["canonical", "the canonical link"], ["og:url", "og:url"]]) {
    const [value] = head[key];
    if (value !== undefined && value !== address) add(22, "page", `${name} is ${value}, not this page's address ${address}`, "");
  }
  const title = content.shareTitles[route];
  for (const key of ["og:title", "twitter:title"]) {
    const [value] = head[key];
    if (title && value !== undefined && value !== title) add(22, "page", `${key} is "${value}", not "${title}"`, "");
  }
  const [description] = head.description;
  for (const key of ["og:description", "twitter:description"]) {
    const [value] = head[key];
    if (description !== undefined && value !== undefined && value !== description) add(22, "page", `${key} is not the page's meta description`, `"${value.slice(0, 80)}"`);
  }
}

// Check 28's counter on one loaded route: after the network settles and the fonts are in, before any
// scroll or interaction, so it counts what a visitor sees at load.
async function countCopy(page) {
  await call(page, () => document.fonts.ready.then(() => true));
  await page.waitForTimeout(500);
  await R(page, "discover");
  return R(page, "copyWords");
}

// --write-baseline: record the counts per route and width, then stop. No other check runs.
if (opts.writeBaseline) {
  const routes = {};
  console.log(`check:rules  ${opts.base}`);
  console.log(`check 28 baseline: words in <main> at load and in all states, at ${opts.widths.join(" and ")}`);
  let failed = 0;
  for (const route of opts.routes) {
    routes[route] = {};
    for (const width of opts.widths) {
      const { context, page } = await newPage(width);
      const error = await load(page, route);
      if (error) {
        console.log(`  ${route} @${width}  FAIL could not load (${error})`);
        failed++;
      } else {
        const c = await countCopy(page);
        routes[route][width] = { load: c.load, all: c.all };
        const top = [...c.bands].sort((a, b) => b.load - a.load).slice(0, 3).map((b) => `#${b.id} ${b.load}`).join(", ");
        console.log(`  ${route.padEnd(20)} @${width}  ${String(c.load).padStart(4)} words at load, ${String(c.all).padStart(4)} in all states  (most: ${top})`);
      }
      await context.close();
    }
  }
  await browser.close();
  if (failed) fail(`${failed} route${failed === 1 ? "" : "s"} could not load; ${opts.writeBaseline} was not written.`);
  let commit = null;
  try {
    commit = execSync("git rev-parse --short HEAD", { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    // Not a git checkout: the baseline is still valid without the commit.
  }
  const baseline = {
    note: "Check 28's copy baseline: the words in <main> per route before the October 2026 design pass. The gate is words at load <= 0.667 x this count. Recorded with node scripts/check-rules.mjs <url> --write-baseline scripts/copy-baseline.json.",
    counter: "main.innerText without the outermost [data-ui], [data-prose], form, .sr-only, [aria-hidden=true], [data-software-preview], [role=group][aria-label$='demo window'] and [role=group][aria-label$='demo data'], split on whitespace. 'all' walks textContent instead (closed answers and inactive tabs included) and is reported only.",
    recorded: new Date().toISOString().slice(0, 10),
    commit,
    routes,
  };
  writeFileSync(path.resolve(opts.writeBaseline), `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Baseline written to ${opts.writeBaseline} (${Object.keys(routes).length} routes).`);
  process.exit(0);
}

const report = { base: opts.base, when: new Date().toISOString(), runs: [], site: [] };
const siteFailures = [];
// Check 28's baseline: words at load per route and width before the pass.
let copyBaseline = null;
try {
  copyBaseline = JSON.parse(readFileSync(opts.baseline, "utf8")).routes;
} catch (err) {
  copyBaseline = null;
  siteFailures.push({ check: 28, kind: "the copy baseline could not be read", sample: `${path.relative(ROOT, opts.baseline)}: ${String(err.message).split("\n")[0]}` });
}
// Routes that hold a calculator or hover clips get their own passes (checks 33 and 41) after the rest.
const calcRoutes = new Set();
const clipRoutes = new Set();
let totalWarnings = 0;
const idsSeen = new Set();
const scripts = new Set();
const fontsLoaded = new Map();
const stepsByWidth = new Map();
const pending = [];
const titlesSeen = new Map();
const descriptionsSeen = new Map();
let totalFailures = 0;
const byCheck = {};

console.log(`check:rules  ${opts.base}`);
console.log(`Checks 5-14, 21-29, 31b, 33 and 41 at ${opts.widths.join(" and ")}${opts.sweep ? ", sweeping tabs, stage parts and story beats" : ""}${opts.motion ? ", with the motion passes" : ""}`);
if (content.error) console.log(`  note: ${content.error}; the checks that compare against content report it.`);
for (const e of content.loadErrors ?? []) console.log(`  note: could not load ${e}`);

for (const route of opts.routes) {
  for (const width of opts.widths) {
    const failures = [];
    const add = (check, where, kind, sample) => failures.push({ check, where: String(where), kind, sample: sample ?? "" });
    const warnings = [];
    const warn = (check, where, kind, sample) => warnings.push({ check, where: String(where), kind, sample: sample ?? "" });
    const notes = [];
    // P7_TIMING=1 prints how long each phase took.
    let lap = Date.now();
    const timings = [];
    const mark = (label) => {
      timings.push(`${label} ${((Date.now() - lap) / 1000).toFixed(1)}s`);
      lap = Date.now();
    };
    const { context, page, vp } = await newPage(width);
    page.on("response", (res) => {
      const url = res.url();
      const type = res.request().resourceType();
      if (type === "script" && url.startsWith(opts.base)) scripts.add(url);
      if (type === "font" || /\.(woff2?|ttf|otf)(\?|$)/.test(url)) {
        pending.push(
          res
            .body()
            .then((body) => fontsLoaded.set(url, createHash("sha1").update(body).digest("hex")))
            .catch(() => fontsLoaded.set(url, null)),
        );
      }
    });
    const error = await load(page, route);
    console.log("");
    if (error) {
      console.log(`${route} @${width}  FAIL could not load (${error})`);
      totalFailures++;
      await context.close();
      continue;
    }

    // Check 28: the words at load, before any scroll or interaction, against the route's baseline.
    const copy = await countCopy(page);
    const base28 = copyBaseline?.[route]?.[width]?.load;
    if (copyBaseline && typeof base28 === "number") {
      const budget = Math.floor(base28 * SPEC.copyRatio);
      const margin = budget - copy.load;
      if (copy.load > budget) {
        const top = [...copy.bands].sort((a, b) => b.load - a.load).slice(0, 3).map((b) => `#${b.id} ${b.load}`).join(", ");
        add(28, "page", `${copy.load} words at load, over the budget of ${budget} (${SPEC.copyRatio} x the baseline ${base28})`, `${-margin} over; most words in ${top}`);
      }
      notes.push(`copy: ${copy.load} words at load against a budget of ${budget} (baseline ${base28}), margin ${margin}; ${copy.all} in all states`);
    } else notes.push(`copy: ${copy.load} words at load, ${copy.all} in all states (no baseline for ${route} at ${width})`);

    // Check 21, count-ups: read each figure the moment it first comes into view, then again later.
    if (opts.motion) {
      const count = (await R(page, "numeralTexts")).length;
      const first = [];
      for (let i = 0; i < count; i++) {
        first.push(await R(page, "scrollToNumeral", i));
        await page.waitForTimeout(80);
      }
      if (count) {
        await page.waitForTimeout(1500);
        const later = await R(page, "numeralTexts");
        later.forEach((t, i) => t !== first[i] && add(21, "page", "figure counts up", `"${first[i]}" became "${t}"`));
      }
    }

    mark("load and count-ups");
    await settlePage(page, vp.height);
    mark("settle");
    await R(page, "discover");
    const pageRes = await R(page, "pageAudit");
    failures.push(...pageRes.violations.map((v) => ({ ...v, where: String(v.where) })));
    failures.push(...(await R(page, "elementAudit", "document")).map((v) => ({ ...v, where: String(v.where) })));
    if (!stepsByWidth.has(width)) stepsByWidth.set(width, await R(page, "steps"));
    const counts = await R(page, "captionCounts");
    notes.push(`captions: ${counts.frames} media frame${counts.frames === 1 ? "" : "s"}, ${counts.captions} Concept render caption${counts.captions === 1 ? "" : "s"}`);
    const found = await R(page, "demosFound");
    const want = SPEC.demos[route];
    if (want) {
      for (const [k, n] of Object.entries(want)) {
        const name = { windows: "software window", apps: "app panel" }[k];
        if ((found[k] ?? 0) < n) add(13, "page", `no ${name} on this route, where section C puts one`, "");
      }
    }
    judgeItalics(pageRes.italics, add);
    judgeClaims(pageRes.texts, pageRes.numerals, add);
    judgeLinks(pageRes.links, add);
    if (content.error) add(22, "page", "titles not checked", content.error);
    else if (!content.titles) add(22, "page", "titles not checked", "content path missing: site.pageTitle");
    else if (!content.titles[route]) add(22, "page", "no tab title for this route in pageTitles (src/lib/site.ts)", "");
    else if (pageRes.title !== content.titles[route]) add(22, "page", `<title> is "${pageRes.title}", not "${content.titles[route]}"`, "");
    judgeHead(route, pageRes.head, add);
    titlesSeen.set(route, pageRes.title);
    descriptionsSeen.set(route, pageRes.head.description[0]);

    // Check 25: headline length.
    for (const h of await R(page, "headlines")) {
      if (h.words <= SPEC.maxHeadlineWords) continue;
      if (h.tag === "h3") warn(25, h.where, `an h3 of ${h.words} words (over ${SPEC.maxHeadlineWords})`, `"${h.text}"`);
      else add(25, h.where, `an ${h.tag} of ${h.words} words, over ${SPEC.maxHeadlineWords}`, `"${h.text}"`);
    }
    // Check 26: orphans; failures at 1440 and 390, warnings at the widths between.
    const orphanGate = width === 1440 || width === 390 ? add : warn;
    for (const o of await R(page, "orphans")) orphanGate(26, o.where, `the last of ${o.lines} lines holds one word ("${o.word}")`, o.sample);
    // Check 27: paragraph lines, at 1440.
    if (width === 1440) for (const o of await R(page, "paragraphLines", SPEC.maxParagraphLines)) add(27, o.where, `a paragraph of ${o.lines} lines (at most ${SPEC.maxParagraphLines} at 1440)`, o.sample);
    // Checks 33 and 41 run in their own passes on the routes that have a calculator or hover clips.
    if (await call(page, () => !!document.querySelector("[data-calculator]"))) calcRoutes.add(route);
    if (await call(page, () => !!document.querySelector("[data-hover-clip]"))) clipRoutes.add(route);

    // Check 14 per state: no id in two frames.
    // A repeat is reported once: in the default state, or in the first state that shows it.
    const reported = new Set();
    const dupes = (frames, state) => {
      const seen = new Map();
      for (const f of frames) for (const id of f.ids) seen.set(id, [...(seen.get(id) ?? []), f]);
      for (const [id, list] of seen) {
        const blocks = list.map((f) => f.where).join(", ");
        if (list.length < 2 || reported.has(`${id}|${blocks}`)) continue;
        reported.add(`${id}|${blocks}`);
        add(14, list[1].where, `${id} shows in ${list.length} frames${state ? ` with ${state}` : ""}`, `(blocks ${blocks})`);
      }
    };
    dupes(await R(page, "mediaFrames"), "");
    for (const id of await R(page, "mediaInDom")) idsSeen.add(id);

    // Sweeps: audit each block again in every tab and disclosure state.
    const blockList = await R(page, "blockList");
    const swept = [];
    // What the default state already reported: a state or the open menu only adds what is new.
    const baseline = new Set([...failures, ...warnings].map((f) => `${f.check}|${f.where}|${f.kind}|${f.sample}`));
    if (opts.sweep) {
      const groups = await R(page, "controls");
      for (const g of groups) {
        swept.push(`${g.labels.length} ${g.kind}s in block ${g.block + 1}`);
        for (let i = 0; i < g.labels.length; i++) {
          if (i === g.initial) continue;
          await R(page, "activate", g.block, g.group, i);
          await page.waitForTimeout(260);
          await R(page, "idle", 1500, g.block);
          const state = `${g.kind} "${g.labels[i]}"`;
          for (const v of await R(page, "elementAudit", g.block)) {
            const key = `${v.check}|${v.where}|${v.kind}|${v.sample}`;
            if (baseline.has(key)) continue;
            baseline.add(key);
            failures.push({ ...v, where: String(v.where), sample: `with ${state}: ${v.sample}` });
          }
          // Lines in the newly shown panel (checks 26 and 27).
          const lineViolations = [
            ...(await R(page, "orphans", g.block)).map((o) => ({ check: 26, where: String(o.where), kind: `the last of ${o.lines} lines holds one word ("${o.word}")`, sample: o.sample, gate: orphanGate })),
            ...(width === 1440 ? (await R(page, "paragraphLines", SPEC.maxParagraphLines, g.block)).map((o) => ({ check: 27, where: String(o.where), kind: `a paragraph of ${o.lines} lines (at most ${SPEC.maxParagraphLines} at 1440)`, sample: o.sample, gate: add })) : []),
          ];
          for (const v of lineViolations) {
            const key = `${v.check}|${v.where}|${v.kind}|${v.sample}`;
            if (baseline.has(key)) continue;
            baseline.add(key);
            v.gate(v.check, v.where, v.kind, `with ${state}: ${v.sample}`);
          }
          dupes(await R(page, "mediaFrames"), state);
          for (const id of await R(page, "mediaInDom")) idsSeen.add(id);
        }
        await R(page, "activate", g.block, g.group, g.initial);
        await page.waitForTimeout(260);
        await R(page, "idle", 1500, g.block);
      }
    }

    // The phone menu: its links may use the serif; everything else holds; its enquiry links too.
    if (await R(page, "menuButton")) {
      await R(page, "toggleMenu");
      await page.waitForTimeout(500);
      if (await R(page, "menuState")) {
        for (const v of await R(page, "elementAudit", "body > header")) {
          const key = `${v.check}|header|${v.kind}|${v.sample}`;
          if (baseline.has(key)) continue;
          baseline.add(key);
          failures.push({ ...v, where: "header", sample: `with the menu open: ${v.sample}` });
        }
        judgeLinks(await R(page, "enquiryLinks", "body > header"), (c, w, k, s) => {
          const key = `${c}|${w}|${k}|${s}`;
          if (baseline.has(key)) return;
          baseline.add(key);
          add(c, w, k, `with the menu open: ${s}`);
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }

    // Check 13: the panel data behind "Inspect panel data" (loaded when the details open).
    mark("sweeps and menu");
    if ((await R(page, "openReadouts")).length) {
      let readouts = [];
      for (let t = 0; t < 12; t++) {
        await page.waitForTimeout(250);
        readouts = await R(page, "readReadouts");
        if (readouts.every((r) => r.has)) break;
      }
      for (const r of readouts) if (!r.has) add(13, r.where, `"Inspect panel data" does not show "${SPEC.readoutsNote}"`, r.sample);
    }

    // Check 23: an empty box must still be empty once it has been on screen.
    const empties = await R(page, "emptyBoxCount");
    for (let i = 0; i < Math.min(empties, 12); i++) {
      const res = await R(page, "recheckEmptyBox", i);
      if (res) add(23, res.where, "empty box with nothing rendered in it (a photo or media placeholder?)", res.sample);
    }
    mark("readouts and empty boxes");

    if (opts.motion) {
      // Pinning: nothing but fixed and sticky elements may move against the page as it scrolls.
      const height = await call(page, () => document.documentElement.scrollHeight);
      const y1 = Math.min(1200, Math.max(0, height / 3));
      // Reveals that the scroll brings in are let finish first: they move once, not with the scroll.
      await call(page, (y) => window.scrollTo(0, y), y1);
      await page.waitForTimeout(400);
      await R(page, "idle", 2000);
      await R(page, "positions");
      await call(page, (y) => window.scrollTo(0, y), y1 + 700);
      await page.waitForTimeout(500);
      await R(page, "idle", 2000);
      for (const m of await R(page, "positionChanges")) add(21, m.where, "element moves with the scroll (pinned or scroll-linked)", m.sample);

      // Two films never play at once: every start of a video is counted while the page scrolls from
      // the top through the last film band.
      if ((await R(page, "watchVideos")) >= 2) {
        await call(page, () => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        const end = (await R(page, "filmBottom")) || height;
        for (let y = 0; y <= end; y += 300) {
          await call(page, (v) => window.scrollTo(0, v), y);
          await page.waitForTimeout(160);
        }
        await page.waitForTimeout(400);
        const peak = await R(page, "videoPeakNow");
        if (peak.count > 1) add(21, "page", "two videos play at once", peak.ids.join(", "));
        notes.push(`videos: at most ${peak.count} playing at once while scrolling to y ${fmt(end)}`);
      }

      // The live window stops drawing once it leaves the screen. Its scene mounts near the viewport,
      // so each window is brought on screen first.
      const windows = await R(page, "windows");
      for (let i = 0; i < windows.length; i++) {
        await call(page, (y) => window.scrollTo(0, Math.max(0, y - 80)), windows[i].top);
        await page.waitForTimeout(2000);
        const w = (await R(page, "windows"))[i];
        if (!w?.canvas) {
          notes.push(`window in block ${windows[i].where}: not live here (no WebGL canvas), so off-screen drawing was not checked`);
          continue;
        }
        const a = await R(page, "draws");
        await page.waitForTimeout(800);
        const b = await R(page, "draws");
        // Scroll the window fully off screen: two screens past it when the page is long enough, otherwise
        // two screens before it (a window near the end of the page would stay partly visible at the
        // clamped bottom). On a short page with the window near its top (/download) neither fits, so
        // scroll to the page's end, which still clears the window.
        const docH = await call(page, () => document.documentElement.scrollHeight);
        const maxScroll = docH - vp.height;
        const below = w.bottom + vp.height * 2;
        const above = w.top - vp.height * 2;
        const target = below <= maxScroll ? below : above >= 0 ? above : maxScroll >= w.bottom ? maxScroll : null;
        if (target === null) {
          notes.push(`window in block ${w.where}: the page is too short to scroll it off screen, so off-screen drawing was not checked`);
          continue;
        }
        // Off screen, drawing must stop. The observer that stops it can fire late while a software
        // renderer keeps the main thread busy, so nothing is judged in the first 2.5s. After that the
        // draw count is sampled every 300ms: the window passes once the count has not changed for 1.5s
        // of wall time (a read the busy page delays still counts as quiet if nothing was drawn), and
        // fails if that has not happened within 5.5s of sampling (8s after it left, unless the page
        // held up the reads).
        await call(page, (y) => window.scrollTo(0, y), target);
        const left = Date.now();
        await page.waitForTimeout(2500);
        const samples = [{ t: Date.now(), n: await R(page, "draws") }];
        let stoppedAfter = null;
        for (;;) {
          await page.waitForTimeout(300);
          const now = { t: Date.now(), n: await R(page, "draws") };
          samples.push(now);
          let k = samples.length - 1;
          while (k > 0 && samples[k - 1].n === now.n) k--;
          if (now.t - samples[k].t >= 1500) {
            stoppedAfter = Math.max(2.5, (samples[k].t - left) / 1000);
            break;
          }
          if (now.t - samples[0].t >= 5500) break;
        }
        const drawsSince = samples[samples.length - 1].n - samples[0].n;
        if (stoppedAfter === null) add(21, w.where, "the live window keeps drawing off screen", `still drawing 8s after it left the screen (${drawsSince} draw calls after the first 2.5s)`);
        notes.push(`window in block ${w.where}: ${b - a} draw calls in 0.8s on screen; ${stoppedAfter === null ? "never stopped off screen" : `quiet off screen by ${stoppedAfter.toFixed(1)}s after leaving`}`);
      }
      mark("pinning, videos and window");
    }
    await Promise.all(pending);
    await context.close();

    // Reduced motion: no video plays, nothing reveals, crossfades or snaps smoothly, the window records.
    if (opts.motion) {
      const reduced = await newPage(width, { reducedMotion: "reduce" });
      const p = reduced.page;
      const err = await load(p, route);
      if (err) add(21, "page", "could not load with reduced motion", err);
      else {
        await call(p, () => document.fonts.ready.then(() => true));
        const height = await call(p, () => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += Math.round(reduced.vp.height * 0.8)) {
          await call(p, (v) => window.scrollTo(0, v), y);
          await call(p, () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))));
          await R(p, "recordFirstSeen");
        }
        await p.waitForTimeout(1000);
        for (const m of await R(p, "firstSeenChanges")) add(21, m.where, "a reveal animates under reduced motion (seen on arrival, changed after)", m.sample);
        for (const v of (await R(p, "videos")).filter((x) => x.playing || x.autoplay)) add(21, v.where, "a video plays under reduced motion", v.id);
        const windows = await R(p, "windows");
        for (let i = 0; i < windows.length; i++) {
          await call(p, (y) => window.scrollTo(0, Math.max(0, y - 80)), windows[i].top);
          await p.waitForTimeout(800);
          const w = (await R(p, "windows"))[i];
          if (!w) continue;
          if (w.canvas || !w.recording) add(21, w.where, "the window does not show its recording under reduced motion", w.canvas ? "(a live canvas)" : "(no recording)");
          else if (!w.controls) add(21, w.where, "the window's recording has no native controls under reduced motion", "");
        }
        await R(p, "discover");
        const fades = await R(p, "tabCrossfade");
        for (let i = 0; i < fades; i++) {
          const res = await R(p, "clickFade", i);
          if (res.opacity < 0.99) add(21, res.where, "a tab crossfades under reduced motion", `${res.sample} (panel at opacity ${res.opacity} after two frames)`);
        }
        const tracks = await R(p, "tracks");
        for (let i = 0; i < tracks; i++) {
          const res = await R(p, "snapTrack", i);
          if (Math.abs(res.late - res.early) > 2) add(21, res.where, "a track scrolls smoothly under reduced motion", `${res.sample} (${Math.round(res.early)}px after two frames, ${Math.round(res.late)}px later)`);
        }
      }
      await reduced.context.close();
      mark("reduced motion");
    }

    // Output, per block: failures, then warnings.
    const fold = (list) => {
      const groups = new Map();
      for (const f of list) {
        const key = `${f.where}|${f.check}|${f.kind}`;
        if (!groups.has(key)) groups.set(key, { ...f, samples: [] });
        const g = groups.get(key);
        if (f.sample && !g.samples.includes(f.sample)) g.samples.push(f.sample);
        g.count = (g.count ?? 0) + 1;
      }
      return [...groups.values()];
    };
    const grouped = fold(failures);
    const warned = fold(warnings);
    totalFailures += grouped.length;
    totalWarnings += warned.length;
    for (const g of grouped) byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
    console.log(`${route} @${width}  ${grouped.length ? `${grouped.length} failure${grouped.length === 1 ? "" : "s"}` : "all pass"}${warned.length ? `, ${warned.length} warning${warned.length === 1 ? "" : "s"}` : ""}`);
    const order = (w) => (w === "page" ? -2 : w === "header" ? -1 : w === "footer" ? 1e6 : Number(w));
    const byNumber = (a, b2) => parseInt(a.check, 10) - parseInt(b2.check, 10);
    const all = [...grouped.map((g) => ({ ...g, level: "FAIL" })), ...warned.map((g) => ({ ...g, level: "warn" }))];
    const wheres = [...new Set(all.map((g) => g.where))].sort((a, b) => order(a) - order(b));
    if (swept.length) notes.unshift(`swept ${swept.join(", ")}`);
    for (const w of wheres) {
      const b = blockList.find((x) => String(x.i) === w);
      const title = w === "page" ? "page" : w === "header" ? "header" : w === "footer" ? "footer" : `${String(w).padStart(2)} ${b?.id ? `#${b.id}` : `<${b?.tag ?? "?"}>`}${b?.heading ? ` "${b.heading}"` : ""}`;
      console.log(`  ${title}`);
      for (const level of ["FAIL", "warn"]) {
        for (const g of all.filter((x) => x.where === w && x.level === level).sort(byNumber)) {
          const n = g.samples.length;
          const shown = g.samples.slice(0, 3).join("; ");
          console.log(`       ${level} [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${shown ? `: ${shown}` : ""}${n > 3 ? `; ${n - 3} more` : ""}`);
        }
      }
    }
    if (process.env.P7_TIMING) notes.push(`timing: ${timings.join(", ")}`);
    for (const n of notes) console.log(`  note  ${n}`);
    report.runs.push({ route, width, failures: grouped, warnings: warned, notes });
  }
}

// A pass of its own (checks 33 and 41): its failures and notes, printed like a route's.
function printPass(title, failures, notes) {
  const groups = new Map();
  for (const f of failures) {
    const key = `${f.check}|${f.kind}`;
    if (!groups.has(key)) groups.set(key, { ...f, samples: [] });
    if (f.sample && !groups.get(key).samples.includes(f.sample)) groups.get(key).samples.push(f.sample);
  }
  const grouped = [...groups.values()];
  totalFailures += grouped.length;
  for (const g of grouped) byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
  console.log("");
  console.log(`${title}  ${grouped.length ? `${grouped.length} failure${grouped.length === 1 ? "" : "s"}` : "all pass"}`);
  for (const g of grouped) {
    const n = g.samples.length;
    console.log(`       FAIL [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${n ? `: ${g.samples.slice(0, 3).join("; ")}` : ""}${n > 3 ? `; ${n - 3} more` : ""}`);
  }
  for (const n of notes) console.log(`  note  ${n}`);
  report.runs.push({ pass: title, failures: grouped, notes });
}

// Check 33: the calculator's arithmetic (src/lib/calculator.ts, spec B24), repeated here so the check
// never trusts the site's own numbers.
const AUD = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatAud = (n) => AUD.format(Math.round(n));
const totalOver = (years, spend, risePct) => {
  const r = risePct / 100;
  return r === 0 ? spend * years : (spend * ((1 + r) ** years - 1)) / r;
};
const perArea = (spend, area) => (spend / area < 0.5 ? "Under $1" : formatAud(spend / area));
const CALC_IDS = { type: "cost-type", area: "cost-area", spend: "cost-spend", rise: "cost-rise", five: "cost-five", ten: "cost-ten", rate: "cost-area-rate" };
const CALC_OUT = [CALC_IDS.five, CALC_IDS.ten, CALC_IDS.rate];
const expectFor = (area, spend, rise) => ({ [CALC_IDS.five]: formatAud(totalOver(5, spend, rise)), [CALC_IDS.ten]: formatAud(totalOver(10, spend, rise)), [CALC_IDS.rate]: perArea(spend, area) });

async function calcPass(route, width) {
  const failures = [];
  const notes = [];
  const add = (kind, sample = "") => failures.push({ check: 33, kind, sample });
  const { context, page } = await newPage(width);
  try {
    const err = await load(page, route);
    if (err) return add("could not load the route for the calculator pass", err);
    const info = await R(page, "calc");
    if (!info) return add("no [data-calculator] at this width");
    for (const u of info.unlabelled) add("a calculator field without a label", u);
    if (info.live.length !== 1) add(`${info.live.length} live regions in the calculator, not exactly one`, info.live.map((l) => l.sample).join(", "));
    else if (!(info.live[0].tag === "p" && info.live[0].srOnly)) add("the calculator's live region is not its sr-only p", info.live[0].sample);
    const claim = info.bandText.match(SPEC.calcClaims);
    if (claim) add(`the calculator's band says "${claim[0]}"`, `"…${info.bandText.slice(Math.max(0, claim.index - 40), claim.index + claim[0].length + 40)}…"`);
    const missingIds = [];
    for (const id of Object.values(CALC_IDS)) if (!(await page.$(`#${id}`))) missingIds.push(`#${id}`);
    if (missingIds.length) return add("the calculator is missing the fields or outputs B24 names, so it was not exercised", missingIds.join(", "));

    // Bring it on screen and let lazy media settle before the network is watched.
    await page.locator("[data-calculator]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    try {
      // The default layout is a select; the /calculator listing sets the types as a fieldset of radio chips.
      const isSelect = await page.$eval(`#${CALC_IDS.type}`, (el) => el.tagName === "SELECT");
      if (isSelect) await page.selectOption(`#${CALC_IDS.type}`, { label: "Commercial building" });
      else await page.locator(`#${CALC_IDS.type}`).getByLabel("Commercial building", { exact: true }).check({ force: true });
    } catch {
      add('the building type has no "Commercial building" option');
    }
    await page.waitForTimeout(800);
    const requests = [];
    const onRequest = (req) => {
      const type = req.resourceType();
      if (["media", "image", "font", "stylesheet", "script"].includes(type) || /^(data|blob):/.test(req.url())) return;
      requests.push(`${req.method()} ${type} ${req.url().replace(opts.base, "")}`);
    };
    page.on("request", onRequest);
    const storedBefore = await R(page, "storageCount");
    const frames = () => call(page, () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true)))));
    const judgeValues = async (label, want, values) => {
      for (const id of CALC_OUT) {
        const v = values[id];
        if (!v) continue;
        if (v.text !== want[id]) add(`#${id} reads "${v.text}", not "${want[id]}"`, label);
        if (/\.\d/.test(v.text)) add(`#${id} shows decimals ("${v.text}")`, label);
        if (v.overflow) add(`#${id} overflows its box (scrollWidth ${v.scrollWidth} > clientWidth ${v.clientWidth})`, label);
      }
    };
    const statusWithin = async (want, ms) => {
      const t0 = Date.now();
      let status = "";
      while (Date.now() - t0 <= ms) {
        status = (await R(page, "calcRead", [])).status ?? "";
        if (status.includes(want[CALC_IDS.five]) && status.includes(want[CALC_IDS.ten])) return { ok: true, after: Date.now() - t0, status };
        await page.waitForTimeout(80);
      }
      return { ok: false, status };
    };

    // 2,000 m2 and 0% first, then the spend in one input event, watched frame by frame: the totals must
    // go from empty to their value with nothing in between, and show it two frames later.
    await page.fill(`#${CALC_IDS.area}`, "2000");
    await page.fill(`#${CALC_IDS.rise}`, "0");
    await R(page, "calcWatch", CALC_OUT);
    await page.fill(`#${CALC_IDS.spend}`, "30000");
    await frames();
    const first = expectFor(2000, 30000, 0);
    await judgeValues("2,000 m2, $30,000, 0%", first, await R(page, "calcRead", CALC_OUT));
    const s1 = await statusWithin(first, 1000);
    if (!s1.ok) add("the status region does not read the 5- and 10-year totals within 1s", `"${s1.status}"`);
    else notes.push(`status read the totals ${s1.after}ms after the last input`);
    await page.waitForTimeout(300);
    const seen = await R(page, "calcWatchStop");
    for (const id of CALC_OUT.slice(0, 2)) if ((seen[id] ?? []).length > 2) add(`#${id} passes through in-between values (a tween)`, (seen[id] ?? []).join(" > "));
    // 3% a year.
    await page.fill(`#${CALC_IDS.rise}`, "3");
    await frames();
    await judgeValues("2,000 m2, $30,000, 3%", expectFor(2000, 30000, 3), await R(page, "calcRead", CALC_OUT));
    // The maximum.
    await page.fill(`#${CALC_IDS.area}`, "1000000");
    await page.fill(`#${CALC_IDS.spend}`, "10000000");
    await page.fill(`#${CALC_IDS.rise}`, "20");
    await frames();
    await judgeValues("the maximum: 1,000,000 m2, $10,000,000, 20%", expectFor(1000000, 10000000, 20), await R(page, "calcRead", CALC_OUT));
    // Blur the last field, so the reformatting on blur is measured too.
    await call(page, () => document.activeElement?.blur?.());
    await page.waitForTimeout(700);
    const ov = await R(page, "overflowX");
    if (ov.root > ov.viewport || ov.body > ov.viewport + 1) add(`the page overflows sideways at the maximum (document ${ov.root}px, body ${ov.body}px, viewport ${ov.viewport}px)`, ov.past.join(", "));
    else if (ov.past.length) add("calculator content runs past the viewport at the maximum", ov.past.join(", "));
    page.off("request", onRequest);
    for (const r of requests) add("a network request fired while typing", r);
    const storedAfter = await R(page, "storageCount");
    if (storedAfter !== storedBefore) add(`browser storage changed while typing (${storedBefore} to ${storedAfter} keys)`);
    notes.push(`checked the worked figures, the 3% case and the maximum; ${requests.length} request${requests.length === 1 ? "" : "s"} while typing`);
  } finally {
    await context.close();
    printPass(`${route} calculator @${width}`, failures, notes);
  }
}

// Check 41: hover clips, on a fine pointer at 1440, then at 390 with touch and under reduced motion.
const filmOf = (url) => (url.match(/\/media\/([a-z0-9]+(?:-[a-z0-9]+)*?)(?:--[a-z0-9]+)?\.(?:mp4|webm)/) || [])[1] || null;
async function clipPass(route) {
  const failures = [];
  const notes = [];
  const add = (kind, sample = "") => failures.push({ check: 41, kind, sample });
  const films = new Set();
  try {
    // Desktop, fine pointer.
    {
      const { context, page, vp } = await newPage(1440);
      const loadFilms = [];
      let phase = "load";
      page.on("request", (req) => {
        const id = filmOf(req.url());
        if (id && phase === "load") loadFilms.push(id);
      });
      const err = await load(page, route);
      if (err) {
        add("could not load the route for the hover-clip pass", err);
        await context.close();
        return;
      }
      await page.waitForTimeout(1500);
      phase = "hover";
      const clips = await R(page, "hoverClips");
      const sel = (i) => `[data-p7-clip="${i}"]`;
      const poll = async (i, test, ms) => {
        const t0 = Date.now();
        let st = null;
        while (Date.now() - t0 <= ms) {
          st = await R(page, "clipState", i);
          if (test(st)) return { ok: true, after: Date.now() - t0, st };
          await page.waitForTimeout(60);
        }
        return { ok: false, st };
      };
      for (const c of clips) {
        const name = c.sample;
        if (!c.video) {
          add("no clip video on a fine pointer without reduced motion", name);
          continue;
        }
        await page.mouse.move(2, vp.height - 2);
        await page.locator(sel(c.i)).scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        const rest = await R(page, "clipState", c.i);
        if (rest.own && !rest.own.paused) add("the clip plays before it is hovered", name);
        // Hover: exactly one video plays within 1.2s, the card's own.
        await page.hover(sel(c.i));
        const on = await poll(c.i, (st) => st?.ownPlaying && st.others.length === 0, 1200);
        if (!on.ok) add(on.st?.ownPlaying ? `another video plays with the hovered clip (${on.st.others.join(", ")})` : "hovering the card does not play its clip within 1.2s", name);
        else notes.push(`clip ${c.i + 1} played ${on.after}ms after the hover`);
        const hovered = await R(page, "clipState", c.i);
        if (hovered?.own?.src) films.add(filmOf(hovered.own.src));
        if (Math.abs((hovered?.height ?? rest.height) - rest.height) > 0.5) add(`the card's height changes on hover (${rest.height} to ${hovered.height}px)`, name);
        // Leave: paused within 400ms.
        await page.mouse.move(2, vp.height - 2);
        const off = await poll(c.i, (st) => !st?.ownPlaying, 400);
        if (!off.ok) add("the clip is still playing 400ms after the pointer left", name);
        // Focus the card's link: it plays, and pauses by 5.2s (WCAG 2.2.2).
        if (!c.link) add("the card has no link to focus", name);
        else {
          await page.waitForTimeout(400);
          const t0 = Date.now();
          await page.focus(`[data-p7-clip-link="${c.i}"]`);
          const f = await poll(c.i, (st) => st?.ownPlaying, 1200);
          if (!f.ok) add("focusing the card's link does not play its clip", name);
          else {
            const stop = await poll(c.i, (st) => !st?.ownPlaying, Math.max(0, 5200 - (Date.now() - t0)));
            if (!stop.ok) add("a focus-started clip is still playing 5.2s after focus", name);
            else notes.push(`clip ${c.i + 1} played on focus and stopped ${((Date.now() - t0) / 1000).toFixed(1)}s after it`);
          }
          const focused = await R(page, "clipState", c.i);
          if (Math.abs(focused.height - rest.height) > 0.5) add(`the card's height changes on focus (${rest.height} to ${focused.height}px)`, name);
          await call(page, () => document.activeElement?.blur?.());
        }
      }
      films.delete(null);
      for (const id of new Set(loadFilms)) if (films.has(id)) add("a hover clip's film was requested at load", id);
      notes.push(`${clips.length} hover clip${clips.length === 1 ? "" : "s"}; films ${[...films].join(", ") || "none seen"}; films requested at load: ${[...new Set(loadFilms)].join(", ") || "none"}`);
      await context.close();
    }
    // Touch at 390, and reduced motion at 1440: no clip video, no clip request, the still shown.
    for (const [label, width, extra] of [["at 390 with touch", 390, {}], ["under reduced motion", 1440, { reducedMotion: "reduce" }]]) {
      const { context, page } = await newPage(width, extra);
      const asked = [];
      page.on("request", (req) => {
        const id = filmOf(req.url());
        if (id && films.has(id)) asked.push(id);
      });
      const err = await load(page, route);
      if (err) {
        add(`could not load the route ${label}`, err);
        await context.close();
        continue;
      }
      const clips = await R(page, "hoverClips");
      for (const c of clips) {
        await page.locator(`[data-p7-clip="${c.i}"]`).scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        if (width > 800) await page.hover(`[data-p7-clip="${c.i}"]`).catch(() => {});
        await page.waitForTimeout(400);
      }
      const after = await R(page, "hoverClips");
      for (const c of after) {
        if (c.video) add(`a clip video renders ${label}`, c.sample);
        if (!c.still?.shown) add(`the still is not shown ${label}`, c.sample);
      }
      for (const id of new Set(asked)) add(`a hover clip's film was requested ${label}`, id);
      await context.close();
    }
  } finally {
    printPass(`${route} hover clips`, failures, notes);
  }
}

if (calcRoutes.size) for (const route of calcRoutes) for (const width of [390, 768, 1440]) await calcPass(route, width);
if (opts.motion) for (const route of clipRoutes) await clipPass(route);

// Site-wide checks: served HTML and JS, the manifest, fonts, public folders and source.
console.log("");
console.log("site");
const siteAdd = (check, kind, sample = "") => siteFailures.push({ check, kind, sample });

// Check 14: /media/ paths in the HTML of every route and every script the pages loaded.
// A file's asset id: variants (--name-w) and renditions (--r) belong to their asset.
const idOfFile = (file) => {
  if (file === "index.json") return { skip: true };
  const m = file.match(/^(.+?)(?:--[a-z0-9]+)?(?:-(?:\d+|poster))?\.(?:avif|webp|jpe?g|png|mp4|webm)$/);
  return m ? { id: m[1] } : { id: null };
};
const texts = new Map();
for (const route of opts.routes) {
  try {
    const html = await (await fetch(opts.base + route)).text();
    texts.set(route, html);
    for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) scripts.add(new URL(m[1], opts.base).href);
  } catch (err) {
    siteAdd(14, "could not fetch the HTML", `${route}: ${err.message}`);
  }
}
for (const url of scripts) {
  try {
    texts.set(url.replace(opts.base, ""), await (await fetch(url)).text());
  } catch {
    // A chunk that cannot be fetched again has no media paths to report.
  }
}
const pathsSeen = new Map();
// A site path /media/...: at the start of a URL (after a quote, a space, a bracket or a host), never
// Next's own /_next/static/media/ files.
const MEDIA_PATH = /(?:^|[^A-Za-z0-9_./-]|https?:\/\/[A-Za-z0-9.:-]+)\/media\/([A-Za-z0-9._-]+)/g;
for (const [where, text] of texts) {
  for (const m of text.matchAll(MEDIA_PATH)) {
    const file = m[1];
    const { id, skip } = idOfFile(file);
    if (skip) continue;
    if (!id) siteAdd(14, "a /media/ path that no manifest asset produces", `/media/${file} in ${where}`);
    else if (!manifestIds.has(id)) siteAdd(14, "a /media/ id that is not in the manifest", `/media/${file} in ${where}`);
    else idsSeen.add(id);
    pathsSeen.set(file, where);
  }
}
if (opts.routes.length === ROUTES.length) {
  const missing = [...manifestIds].filter((id) => !idsSeen.has(id));
  for (const id of missing) siteAdd(14, "a manifest id that appears nowhere on the site", id);
} else console.log("  note  all 29 manifest ids are checked only when every route runs");

// Check 14: public/media holds only what media:fetch writes; nothing added to public/video or media-src.
const mediaDir = path.join(ROOT, "public/media");
if (existsSync(mediaDir)) {
  for (const f of readdirSync(mediaDir)) {
    const { id, skip } = idOfFile(f);
    if (skip) continue;
    if (!id || !manifestIds.has(id)) siteAdd(14, "a file in public/media that is not a manifest asset", `public/media/${f}`);
  }
}
try {
  const git = (args) => execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  for (const line of git("status --porcelain --untracked-files=all -- public/video media-src").split("\n").filter(Boolean)) siteAdd(14, "an uncommitted file in public/video or media-src", line.trim());
  let base = "";
  try {
    base = git("merge-base HEAD origin/main");
  } catch {
    base = git("merge-base HEAD main");
  }
  for (const f of git(`diff --name-only --diff-filter=A ${base} HEAD -- public/media public/video media-src`).split("\n").filter(Boolean)) siteAdd(14, "a media file added on this branch", f);
} catch {
  console.log("  note  git is unavailable: the public/video and media-src history was not checked");
}

// Check 22: no two routes share a tab title or a description.
for (const [seen, what] of [[titlesSeen, "a tab title"], [descriptionsSeen, "a description"]]) {
  const byText = new Map();
  for (const [route, text] of seen) if (text !== undefined) byText.set(text, [...(byText.get(text) ?? []), route]);
  for (const [text, routes] of byText) if (routes.length > 1) siteAdd(22, `two routes share ${what}`, `"${text}" on ${routes.join(", ")}`);
}

// Check 6: every font file loaded is one of the three in src/fonts, byte for byte.
if (!fontsLoaded.size) siteAdd(6, "no font files were loaded", "");
for (const [url, hash] of fontsLoaded) {
  if (!url.startsWith(opts.base)) siteAdd(6, "a font loaded from another origin", url);
  else if (!hash || !fontHashes.has(hash)) siteAdd(6, "a font file that is not one of src/fonts", url);
}
const usedFonts = new Set([...fontsLoaded.values()].map((h) => fontHashes.get(h)).filter(Boolean));

// Check 31b: a spacing utility's value. Multipliers on the 8px scale, 1/2, full and auto for position
// and inset, auto for margins (centring and pushing, not spacing: check 31a skips them too), scale rems,
// or the layout variables, alone or inside calc() and max().
const LINT = SPEC.lint;
const SPACING_UTILITY = /^(-?)(m[trblxyse]?|p[trblxyse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|scroll-[mp][trblxy]?)-(.+)$/;
const POSITIONAL = /^(inset(?:-[xy])?|top|right|bottom|left)$/;
const lintUtility = (token) => {
  const m = baseUtilityNode(token).match(SPACING_UTILITY);
  if (!m) return null;
  const [, , kind, value] = m;
  if (LINT.multipliers.includes(value)) return null;
  if (POSITIONAL.test(kind) && LINT.positional.includes(value)) return null;
  if (/^m[trblxyse]?$/.test(kind) && value === "auto") return null;
  const shorthand = value.match(/^\((--[a-z-]+)\)$/);
  if (shorthand) return LINT.vars.includes(shorthand[1]) ? null : `the variable ${shorthand[1]} is not a layout variable`;
  const arbitrary = value.match(/^\[(.+)\]$/);
  if (!arbitrary) return `${value} is not a multiplier on the 8px scale`;
  const css = arbitrary[1].replace(/_/g, " ");
  const remOk = (v) => LINT.rems.map((r) => `${r}rem`).includes(v) || v === "0";
  if (remOk(css)) return null;
  const varOk = (v) => {
    const vm = v.match(/^var\((--[a-z-]+)\)$/);
    return !!vm && LINT.vars.includes(vm[1]);
  };
  if (varOk(css)) return null;
  if (/^(calc|max)\(/.test(css)) {
    const parts = css.replace(/var\((--[a-z-]+)\)/g, (all, v) => (LINT.vars.includes(v) ? " V " : " X ")).split(/[\s()+*\/,-]+|calc|max/).filter(Boolean);
    const bad = parts.filter((t) => t !== "V" && !remOk(t));
    return bad.length ? `${css} uses ${bad.map((b) => (b === "X" ? "a variable outside the layout set" : b)).join(", ")}` : null;
  }
  return `${css} is not a scale rem or a layout variable`;
};
// The utility without its variants (md:, group-hover:, [&>li]:) and its important flag.
const baseUtilityNode = (token) => {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i++) {
    if (token[i] === "[" || token[i] === "(") depth++;
    else if (token[i] === "]" || token[i] === ")") depth--;
    else if (token[i] === ":" && depth === 0) cut = i;
  }
  return token.slice(cut + 1).replace(/^!/, "").replace(/!$/, "");
};
const lintSkipped = (rel) => LINT.skipFiles.includes(rel) || LINT.skipDirs.some((d) => rel.startsWith(d));
let lintFiles = 0;
let lintTokens = 0;

// Checks 5 and 7 in source (rounded-(?!hard) and text-[ in src), and check 31b's spacing lint.
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? walk(path.join(dir, f)) : [path.join(dir, f)]));
for (const file of walk(path.join(ROOT, "src"))) {
  const buf = readFileSync(file);
  if (buf.includes(0)) continue;
  const relFile = path.relative(ROOT, file).split(path.sep).join("/");
  const lintThis = /\.(tsx?|jsx?|css|mjs)$/.test(file) && !lintSkipped(relFile);
  if (lintThis) lintFiles++;
  buf
    .toString("utf8")
    .split("\n")
    .forEach((line, i) => {
      const rel = `${relFile}:${i + 1}`;
      if (/rounded-(?!hard)/.test(line)) siteAdd(5, "rounded-(?!hard) in src", `${rel} ${line.trim().slice(0, 90)}`);
      if (line.includes("text-[")) siteAdd(7, "text-[ in src", `${rel} ${line.trim().slice(0, 90)}`);
      // 31b: class tokens on the line, outside comments and the frozen header's lines.
      const trimmed = line.trim();
      if (!lintThis || line.includes("frozen-header") || /^(\/\/|\/\*|\*|\{\/\*)/.test(trimmed)) return;
      for (const token of line.split(/[\s"'`{}]+/)) {
        if (!token || !/[a-z]-/.test(token)) continue;
        const why = lintUtility(token);
        if (why === null) {
          if (SPACING_UTILITY.test(baseUtilityNode(token))) lintTokens++;
          continue;
        }
        lintTokens++;
        siteAdd("31b", "a spacing utility off the 8px scale", `${rel} ${token} (${why})`);
      }
    });
}
console.log(`  note  31b: ${lintTokens} spacing utilities in ${lintFiles} files linted (skipped: ${[...LINT.skipFiles, ...LINT.skipDirs.map((d) => `${d}**`)].join(", ")}, and lines marked frozen-header)`);

// Content paths the checks needed and could not find: each fails only its own check.
for (const name of content.missing ?? []) {
  const check = NEEDS.find(([re]) => re.test(name))?.[1];
  if (check) siteAdd(check, "content path missing", name);
  else console.log(`  note  content path missing (no check needs it to pass): ${name}`);
}

// Check 7: the scale's tokens compute to the spec's steps at 1440 and 390.
for (const [width, steps] of stepsByWidth) {
  const want = SPEC.steps[width];
  if (!want) continue;
  for (const [step, px] of Object.entries(want)) {
    if (Math.abs((steps[step] ?? 0) - px) > 0.1) siteAdd(7, `the ${step} step computes to ${steps[step]}px at ${width}, not the spec's ${px}px`);
  }
}

const siteGroups = new Map();
for (const f of siteFailures) {
  const key = `${f.check}|${f.kind}`;
  if (!siteGroups.has(key)) siteGroups.set(key, { ...f, samples: [] });
  siteGroups.get(key).samples.push(f.sample);
}
for (const g of [...siteGroups.values()].sort((a, b) => parseInt(a.check, 10) - parseInt(b.check, 10))) {
  const n = g.samples.filter(Boolean).length;
  // The source lint lists more of its findings: each one is a line to change.
  const show = g.check === "31b" ? 12 : 4;
  console.log(`       FAIL [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${n ? `: ${g.samples.slice(0, show).join("; ")}` : ""}${n > show ? `; ${n - show} more${opts.json ? " (all in the JSON report)" : " (pass --json for all)"}` : ""}`);
  byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
  totalFailures++;
}
console.log(`  note  fonts loaded: ${usedFonts.size ? [...usedFonts].join(", ") : "none"}; /media/ paths in HTML and JS: ${pathsSeen.size}; manifest ids seen: ${idsSeen.size} of ${manifestIds.size}`);
report.site = [...siteGroups.values()];

await browser.close();
console.log("");
console.log(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"}${totalWarnings ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}` : ""} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(" and ")}.`);
for (const [check, name] of Object.entries(CHECKS).sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))) {
  if (!opts.motion && MOTION_CHECKS.has(check)) {
    console.log(`  [${check}] ${name}: skipped (--no-motion)`);
    continue;
  }
  const ran = check === "33" ? (calcRoutes.size ? "" : " (no route has a calculator)") : check === "41" ? (clipRoutes.size ? "" : " (no route has hover clips)") : "";
  console.log(`  [${check}] ${name}: ${byCheck[check] ? `${byCheck[check]} failing` : `pass${ran}`}`);
}
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
