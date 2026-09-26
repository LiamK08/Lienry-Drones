// check:rules: the redesign's rule checks (docs/REDESIGN-SPEC.md, E2 checks 5-14 and 21-24), run in
// Playwright against a served build at 1440x900 and 390x844, plus the source and file checks they name.
//
// Usage: npm run check:rules -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json]
//                                [--no-sweep] [--no-motion]
//   e.g. npm run build && npm run start, then npm run check:rules -- http://localhost:3000
//
//  5  Shapes and effects: every computed border-radius (and ::before/::after) is 0 or 4px; no box-shadow,
//     text-shadow, blur, backdrop-filter or background-clip:text; gradients only in the film bands'
//     scrims; no effect utilities in class lists (they hide in hover states); `rounded-(?!hard)` finds
//     nothing in src.
//  6  Two families: all text is Instrument Serif or Inter; the serif only on h1-h3 (and their em), the
//     footer wordmark and the phone menu's links; every heading is in the serif; the fonts loaded are
//     exactly the three src/fonts files (compared by content).
//  7  Scale: every font size is a step of the scale at that width (checked against the spec's values);
//     every h1-h3 is on the H3 step or above; no h4-h6 in <main>; no `text-[` in src.
//  8  Case and alignment: uppercase only inside .label; no centred text outside the home hero.
//  9  Italic budget: the em of each page's h1 and section h2s exactly as B4 lists (read from content);
//     never in an h3, a summary or a paragraph; always the heading's trailing phrase in its colour.
// 10  Labels: no .label directly before (or visually right above) an h1 or h2.
// 11  No claims: the banned words appear only inside the allowed sentences; "approval" only where
//     allowed; every .numeral is a cited stat (with its source link and the cited note), a design fact
//     (with its term and "Design intent. Concept stage.") or demo data inside the window or app panel.
// 12  Captions: every /media/ image and video sits in a figure or film frame captioned exactly
//     "Concept render" (plain text at the caption step, 8px under its frame); frames equal captions.
// 13  Coded demos: each software window shows "Demo data" and the illustrative-model note beneath it
//     once, and its panel data keeps its Demo data line; the app panel (role="group") shows "Demo data"
//     and its note; the home fragment's caption reads its note. The window, app panel and fragment
//     must be where section C puts them.
// 14  Media: every /media/ path in the served HTML and JS is a manifest id; all 29 appear on the site;
//     no id shows in two frames on a route in any state; public/media holds only manifest files and
//     nothing is added to public/video or media-src.
// 21  Motion: under reduced motion no video plays, nothing reveals, crossfades or snaps smoothly, and
//     the window shows its recording with native controls; without it never two videos play at once,
//     the live window stops drawing off screen, nothing is sticky but the header, nothing moves with
//     the scroll and no figure counts up.
// 22  Titles: <title> is the brand name on every route.
// 23  Placeholders: no "to come", no data-media-placeholder, no empty photo box.
// 24  Enquiry labels: every link to /register-interest carries the one label of its ?type=.
//
// Tabs, stage parts and story beats are swept: every state is audited again. Copy the checks compare
// against (italics, allowed sentences, stats, design facts, app notes, brand) is read from src/content
// and src/lib/site.ts through the project's TypeScript. Exit code: 0 when every check passes, 1 when
// any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/register-interest", "/privacy"];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  390: { width: 390, height: 844, mobile: true },
};

// Acceptance strings and values that the spec itself defines (E2, B4, B6, B7), not copy from content.
const SPEC = {
  caption: "Concept render",
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
  // Where section C puts the coded demos.
  demos: {
    "/": { windows: 1, fragments: 1 },
    "/platform": { windows: 1 },
    "/commercial": { windows: 1 },
    "/homes-and-rentals": { apps: 1 },
  },
};

const CHECKS = {
  5: "shapes and effects",
  6: "two families",
  7: "type scale",
  8: "case and alignment",
  9: "italic budget",
  10: "labels above headings",
  11: "no claims, figures",
  12: "Concept render captions",
  13: "coded demos labelled",
  14: "manifest media",
  21: "motion",
  22: "titles",
  23: "no placeholders",
  24: "one label per enquiry route",
};

function usage() {
  console.log(`Usage: node scripts/check-rules.mjs <baseUrl> [route ...] [options]

Runs E2 checks 5-14 and 21-24 of docs/REDESIGN-SPEC.md against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all eight)
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default)
  --json <file>      also write the full report as JSON
  --no-sweep         skip the tab and disclosure state sweeps
  --no-motion        skip the motion passes (check 21), which load every route twice more`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null, sweep: true, motion: true };
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
  try {
    const home = load(path.join(ROOT, "src/content/home.ts"));
    const pages = load(path.join(ROOT, "src/content/pages.ts"));
    const software = load(path.join(ROOT, "src/content/software.ts"));
    const stats = load(path.join(ROOT, "src/content/stats.ts"));
    const site = load(path.join(ROOT, "src/lib/site.ts"));
    const faq = (id) => pages.platformFaq.items.find((q) => q.id === id)?.a;
    const honest = pages.companyPage.values.items.find((v) => /honest by default/i.test(v.title))?.body;
    return {
      brand: site.brand.name,
      italics: {
        "/": { h1: home.hero.emphasis, h2: [home.systemExplainer.emphasis, home.places.emphasis] },
        "/platform": { h1: pages.platformPage.emphasis, h2: [pages.platformPage.partsSection.emphasis] },
        "/commercial": { h1: pages.commercialPage.emphasis, h2: [pages.commercialPage.steps.emphasis] },
        "/homes-and-rentals": { h1: pages.homesPage.emphasis, h2: [home.landlordStory.emphasis] },
        "/solar": { h1: pages.solarPage.emphasis, h2: [pages.solarPage.how.emphasis] },
        "/company": { h1: pages.companyPage.emphasis, h2: [] },
        "/register-interest": { h1: null, h2: [] },
        "/privacy": { h1: null, h2: [] },
      },
      // E2 check 11: the allowed sentences.
      allowed: [
        ["the FAQ answer to Is Lienry operating yet?", faq("operating")],
        ["the FAQ answer to What does it cost?", faq("cost")],
        ["commercialPage.cost.body", pages.commercialPage.cost.body],
        ["the Honest by default value", honest],
        ["the cited note", SPEC.citedNote],
        ["the solar stats intro", pages.solarPage.statsIntro],
      ].filter(([, text]) => text),
      approvals: [SPEC.approvalsPhrase, honest].filter(Boolean),
      stats: [...stats.solarStats, ...stats.australiaStats],
      designFacts: home.designFacts,
      appNote: home.appPanel.note,
      fragment: home.productCards.cards.find((c) => c.fragment)?.fragment ?? null,
      windowLabel: `${software.project.app}, demo window`,
    };
  } catch (err) {
    return { error: `could not load src/content: ${String(err.message).split("\n")[0]}` };
  }
}

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
  const mediaIdOf = (src) => (src.match(/\/media\/([a-z0-9-]+?)(?:-\d+)?(?:-poster)?\.(?:avif|webp|jpe?g|png|mp4|webm)/) || [])[1] || null;
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
    const burger = document.querySelector("header button[aria-controls]");
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
      else if (fam.serif.has(first) && !el.closest("h1, h2, h3") && !isWordmark(el) && !inMenuLink(el)) add(6, el, "Instrument Serif outside h1-h3, the footer wordmark and the phone menu");
      const fs = parseFloat(cs.fontSize);
      if (!sizes.some((v) => Math.abs(v - fs) < 0.1)) add(7, el, "font size off the scale", `${Math.round(fs * 100) / 100}px`);
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
    captions(scope, add);
    demos(scope, add);
    return out;
  };

  // Check 12: media frames and their captions inside a scope.
  function captionOf(frame) {
    if (frame.tagName === "FIGURE") return [...frame.querySelectorAll("figcaption")].find((fc) => fc.closest("figure") === frame && present(fc)) || null;
    return [...frame.querySelectorAll("*")].find((e) => /concept render/i.test(ownText(e)) && present(e)) || null;
  }
  function frames(scope) {
    const map = new Map();
    for (const m of scope.querySelectorAll("img, video")) {
      const id = mediaId(m);
      if (!id || !present(m)) continue;
      const frame = m.closest("figure") || filmBlockOf(m);
      const key = frame || m;
      if (!map.has(key)) map.set(key, { frame, ids: new Set(), media: m });
      map.get(key).ids.add(id);
    }
    return map;
  }
  function captions(scope, add) {
    const st = R.steps();
    const map = frames(scope);
    const claimed = new Set();
    for (const f of map.values()) {
      const ids = [...f.ids].join(", ");
      if (!f.frame) {
        add(12, f.media, "media outside a figure or film frame", `(${ids})`);
        continue;
      }
      const cap = captionOf(f.frame);
      if (!cap) {
        add(12, f.frame, "no Concept render caption", `(${ids})`);
        continue;
      }
      claimed.add(cap);
      const text = clean(cap.textContent);
      if (text !== R.cfg.caption) add(12, cap, `caption does not read exactly "${R.cfg.caption}"`, `("${text}", ${ids})`);
      const cs = getComputedStyle(cap);
      if (Math.abs(parseFloat(cs.fontSize) - st.caption) > 0.1) add(12, cap, "caption not at the caption step", `(${cs.fontSize}, ${ids})`);
      const badge = cs.textTransform !== "none" || alphaOf(cs.backgroundColor) > 0.02 || parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.paddingTop) + parseFloat(cs.paddingLeft) > 0 || cap.children.length > 0;
      if (badge) add(12, cap, "caption is not plain text (fill, border, padding, icon or case)", `(${ids})`);
      if (f.frame.tagName === "FIGURE") {
        const above = cap.previousElementSibling;
        if (above) {
          const gap = cap.getBoundingClientRect().top - above.getBoundingClientRect().bottom;
          if (Math.abs(gap - 8) > 1) add(12, cap, "caption is not 8px under its frame", `(${Math.round(gap)}px, ${ids})`);
          if (Math.abs(cap.getBoundingClientRect().left - above.getBoundingClientRect().left) > 1) add(12, cap, "caption is not on its frame's left edge", `(${ids})`);
        }
      }
    }
    const all = [...scope.querySelectorAll("*")].filter((e) => /^concept render$/i.test(ownText(e)) && present(e));
    for (const c of all) if (!claimed.has(c)) add(12, c, "Concept render caption with no media in its frame");
    return { frames: map.size, captions: all.length };
  }

  // Check 13: the coded demos inside a scope.
  function leafWithText(scope, text) {
    return [...scope.querySelectorAll("*")].filter((e) => clean(e.textContent) === text && present(e) && ![...e.children].some((k) => clean(k.textContent) === text));
  }
  function demos(scope, add) {
    const found = { windows: 0, apps: 0, fragments: 0 };
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
    if (R.cfg.fragment) {
      for (const f of scope.querySelectorAll("[role='img']")) {
        if (f.getAttribute("aria-label") !== R.cfg.fragment.ariaLabel || !present(f)) continue;
        found.fragments++;
        const cap = f.closest("figure")?.querySelector("figcaption");
        if (!cap || clean(cap.textContent) !== R.cfg.fragment.note) add(13, f, `app fragment's caption does not read "${R.cfg.fragment.note}"`, cap ? `("${clean(cap.textContent)}")` : "");
      }
    }
    R.lastDemos = found;
    return found;
  }
  R.demosFound = () => R.lastDemos;

  // Check 14 per state: which ids show in which frames.
  R.mediaFrames = () => {
    const out = [];
    for (const f of frames(document.body).values()) {
      out.push({ ids: [...f.ids], where: where(f.frame || f.media), what: f.frame ? (f.frame.tagName === "FIGURE" ? "figure" : "film frame") : "loose" });
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
      return {
        text: clean(e.textContent),
        heading: heading ? heading.tagName.toLowerCase() : null,
        headingText: heading ? clean(heading.textContent) : "",
        trailing: heading ? clean(heading.textContent).endsWith(clean(e.textContent)) : false,
        colourMatches: heading ? same(getComputedStyle(e).color, hcs.color) : true,
        inSummary: !!e.closest("summary"),
        inP: !!e.closest("p"),
        where: where(e),
        sample: R.describe(heading || e),
      };
    });

    // Check 11: text grouped by its block container, hidden states included.
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
    const texts = [...blocks.entries()].map(([b, parts]) => ({ text: quotes(clean(parts.join(""))), where: where(b), sample: R.describe(b) }));

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

    return { violations: out, italics, texts, numerals, links: R.enquiryLinks("body"), title: document.title, emptyBoxes: R.emptyBoxes.length };
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
  R.positions = () => {
    R.posEls = [];
    const pos = [];
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;
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
  browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
} catch (err) {
  fail(`Chromium could not start: ${String(err.message).split("\n")[0]}\nInstall it with: npm i -D playwright && npx playwright install chromium`);
}

const cfg = {
  brand: content.brand ?? "Lienry Drones",
  caption: SPEC.caption,
  demoData: SPEC.demoData,
  windowNote: SPEC.windowNote,
  readoutsNote: SPEC.readoutsNote,
  appPanelLabel: SPEC.appPanelLabel,
  appNote: content.appNote ?? null,
  fragment: content.fragment ?? null,
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

// Italic budget (check 9) against the B4 table, read from content.
function judgeItalics(route, italics, add) {
  for (const e of italics) {
    if (e.heading === "h3") add(9, e.where, "italic in an h3", e.sample);
    else if (e.inSummary) add(9, e.where, "italic in a summary", e.sample);
    else if (e.inP) add(9, e.where, "italic in a paragraph", e.sample);
    else if (!e.heading) add(9, e.where, "italic outside a heading", e.sample);
    else {
      if (!e.trailing) add(9, e.where, "italic is not the heading's trailing phrase", `${e.sample} ("${e.text}")`);
      if (!e.colourMatches) add(9, e.where, "italic not in its heading's colour", e.sample);
    }
  }
  if (content.error) return;
  const expected = content.italics[route];
  if (!expected) return;
  const h1 = italics.filter((e) => e.heading === "h1");
  if (expected.h1 === null) for (const e of h1) add(9, e.where, "italic in an h1 that B4 leaves roman", `${e.sample} ("${e.text}")`);
  else if (!h1.some((e) => norm(e.text) === norm(expected.h1))) add(9, "page", `the h1 is missing its italic "${expected.h1}"`, h1.length ? `(found "${h1.map((e) => e.text).join('", "')}")` : "");
  for (const e of h1) if (expected.h1 !== null && norm(e.text) !== norm(expected.h1)) add(9, e.where, "unexpected italic in the h1", `("${e.text}")`);
  const h2 = italics.filter((e) => e.heading === "h2");
  const left = [...expected.h2.map(norm)];
  for (const e of h2) {
    const i = left.indexOf(norm(e.text));
    if (i >= 0) left.splice(i, 1);
    else add(9, e.where, "italic beyond the page's budget (B4)", `${e.sample} ("${e.text}")`);
  }
  for (const missing of left) add(9, "page", `a section heading is missing its italic "${missing}" (B4)`, "");
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
    const fact = design.items.find((f) => [f.value, `${f.value}${f.unit ?? ""}`, `${f.value} ${f.unit ?? ""}`.trim()].map(norm).includes(n.text) && n.item.includes(norm(f.term)));
    if (fact) {
      if (!n.block.includes(norm(design.note))) add(11, n.where, `design figure ${n.text} without "${design.note}" beside it`, "");
      continue;
    }
    add(11, n.where, "figure that is not a cited stat, a design fact or demo data", `${n.sample} in "${n.item.slice(0, 70)}"`);
  }
}

function judgeLinks(links, add) {
  for (const l of links) {
    const want = SPEC.enquiryLabels[l.type];
    if (want === undefined) add(24, l.where, `link to an unknown enquiry type "${l.type}"`, l.sample);
    else if (l.label !== want) add(24, l.where, `enquiry link reads "${l.label}", not "${want}"`, l.sample);
  }
}

const report = { base: opts.base, when: new Date().toISOString(), runs: [], site: [] };
const siteFailures = [];
const idsSeen = new Set();
const scripts = new Set();
const fontsLoaded = new Map();
const pending = [];
let totalFailures = 0;
const byCheck = {};

console.log(`check:rules  ${opts.base}`);
console.log(`E2 checks 5-14 and 21-24 at ${opts.widths.join(" and ")}${opts.sweep ? ", sweeping tabs, stage parts and story beats" : ""}${opts.motion ? ", with the motion passes" : ""}`);
if (content.error) console.log(`  note: ${content.error}; the checks that compare against content report it.`);

for (const route of opts.routes) {
  for (const width of opts.widths) {
    const failures = [];
    const add = (check, where, kind, sample) => failures.push({ check, where: String(where), kind, sample: sample ?? "" });
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
    const found = await R(page, "demosFound");
    const want = SPEC.demos[route];
    if (want) {
      for (const [k, n] of Object.entries(want)) {
        const name = { windows: "software window", apps: "app panel", fragments: "home app fragment" }[k];
        if ((found[k] ?? 0) < n) add(13, "page", `no ${name} on this route, where section C puts one`, "");
      }
    }
    judgeItalics(route, pageRes.italics, add);
    judgeClaims(pageRes.texts, pageRes.numerals, add);
    judgeLinks(pageRes.links, add);
    if (pageRes.title !== cfg.brand) add(22, "page", `<title> is "${pageRes.title}", not "${cfg.brand}"`, "");

    // Check 14 per state: no id in two frames.
    const dupes = (frames, state) => {
      const seen = new Map();
      for (const f of frames) for (const id of f.ids) seen.set(id, [...(seen.get(id) ?? []), f]);
      for (const [id, list] of seen) if (list.length > 1) add(14, list[1].where, `${id} shows in ${list.length} frames${state ? ` with ${state}` : ""}`, `(blocks ${list.map((f) => f.where).join(", ")})`);
    };
    dupes(await R(page, "mediaFrames"), "");
    for (const id of await R(page, "mediaInDom")) idsSeen.add(id);

    // Sweeps: audit each block again in every tab and disclosure state.
    const blockList = await R(page, "blockList");
    const swept = [];
    if (opts.sweep) {
      const groups = await R(page, "controls");
      const baseline = new Set(failures.map((f) => `${f.check}|${f.where}|${f.kind}|${f.sample}`));
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
        for (const v of await R(page, "elementAudit", "body > header")) failures.push({ ...v, where: "header", kind: `${v.kind} (menu open)` });
        judgeLinks(await R(page, "enquiryLinks", "body > header"), (c, w, k, s) => add(c, "header", `${k} (menu open)`, s));
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
      await call(page, (y) => window.scrollTo(0, y), y1);
      await page.waitForTimeout(400);
      await R(page, "positions");
      await call(page, (y) => window.scrollTo(0, y), y1 + 700);
      await page.waitForTimeout(500);
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
        await call(page, (y) => window.scrollTo(0, y), w.bottom + vp.height * 2);
        await page.waitForTimeout(1000);
        const c = await R(page, "draws");
        await page.waitForTimeout(1500);
        const d = await R(page, "draws");
        if (d > c) add(21, w.where, "the live window keeps drawing off screen", `${d - c} draw calls in 1.5s`);
        notes.push(`window in block ${w.where}: ${b - a} draw calls in 0.8s on screen, ${d - c} in 1.5s off screen`);
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

    // Output, per block.
    const groups = new Map();
    for (const f of failures) {
      const key = `${f.where}|${f.check}|${f.kind}`;
      if (!groups.has(key)) groups.set(key, { ...f, samples: [] });
      const g = groups.get(key);
      if (f.sample && !g.samples.includes(f.sample)) g.samples.push(f.sample);
      g.count = (g.count ?? 0) + 1;
    }
    const grouped = [...groups.values()];
    totalFailures += grouped.length;
    for (const g of grouped) byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
    console.log(`${route} @${width}  ${grouped.length ? `${grouped.length} failure${grouped.length === 1 ? "" : "s"}` : "all pass"}`);
    const order = (w) => (w === "page" ? -2 : w === "header" ? -1 : w === "footer" ? 1e6 : Number(w));
    const wheres = [...new Set(grouped.map((g) => g.where))].sort((a, b) => order(a) - order(b));
    if (swept.length) notes.unshift(`swept ${swept.join(", ")}`);
    for (const w of wheres) {
      const b = blockList.find((x) => String(x.i) === w);
      const title = w === "page" ? "page" : w === "header" ? "header" : w === "footer" ? "footer" : `${String(w).padStart(2)} ${b?.id ? `#${b.id}` : `<${b?.tag ?? "?"}>`}${b?.heading ? ` "${b.heading}"` : ""}`;
      console.log(`  ${title}`);
      for (const g of grouped.filter((x) => x.where === w).sort((a, b2) => a.check - b2.check)) {
        const n = g.samples.length;
        const shown = g.samples.slice(0, 3).join("; ");
        console.log(`       FAIL [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${shown ? `: ${shown}` : ""}${n > 3 ? `; ${n - 3} more` : ""}`);
      }
    }
    if (process.env.P7_TIMING) notes.push(`timing: ${timings.join(", ")}`);
    for (const n of notes) console.log(`  note  ${n}`);
    report.runs.push({ route, width, failures: grouped, notes });
  }
}

// Site-wide checks: served HTML and JS, the manifest, fonts, public folders and source.
console.log("");
console.log("site");
const siteAdd = (check, kind, sample = "") => siteFailures.push({ check, kind, sample });

// Check 14: /media/ paths in the HTML of every route and every script the pages loaded.
const idOfFile = (file) => {
  if (file === "index.json") return { skip: true };
  const m = file.match(/^(.+?)-(?:\d+|poster)\.(?:avif|webp|jpe?g|png)$/) || file.match(/^(.+?)\.(?:mp4|webm)$/);
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

// Check 6: every font file loaded is one of the three in src/fonts, byte for byte.
if (!fontsLoaded.size) siteAdd(6, "no font files were loaded", "");
for (const [url, hash] of fontsLoaded) {
  if (!url.startsWith(opts.base)) siteAdd(6, "a font loaded from another origin", url);
  else if (!hash || !fontHashes.has(hash)) siteAdd(6, "a font file that is not one of src/fonts", url);
}
const usedFonts = new Set([...fontsLoaded.values()].map((h) => fontHashes.get(h)).filter(Boolean));

// Checks 5 and 7 in source: rounded-(?!hard) and text-[ in src.
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(path.join(dir, f)).isDirectory() ? walk(path.join(dir, f)) : [path.join(dir, f)]));
for (const file of walk(path.join(ROOT, "src"))) {
  const buf = readFileSync(file);
  if (buf.includes(0)) continue;
  buf
    .toString("utf8")
    .split("\n")
    .forEach((line, i) => {
      const rel = `${path.relative(ROOT, file)}:${i + 1}`;
      if (/rounded-(?!hard)/.test(line)) siteAdd(5, "rounded-(?!hard) in src", `${rel} ${line.trim().slice(0, 90)}`);
      if (line.includes("text-[")) siteAdd(7, "text-[ in src", `${rel} ${line.trim().slice(0, 90)}`);
    });
}

const siteGroups = new Map();
for (const f of siteFailures) {
  const key = `${f.check}|${f.kind}`;
  if (!siteGroups.has(key)) siteGroups.set(key, { ...f, samples: [] });
  siteGroups.get(key).samples.push(f.sample);
}
for (const g of [...siteGroups.values()].sort((a, b) => a.check - b.check)) {
  const n = g.samples.filter(Boolean).length;
  console.log(`       FAIL [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${n ? `: ${g.samples.slice(0, 4).join("; ")}` : ""}${n > 4 ? `; ${n - 4} more` : ""}`);
  byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
  totalFailures++;
}
console.log(`  note  fonts loaded: ${usedFonts.size ? [...usedFonts].join(", ") : "none"}; /media/ paths in HTML and JS: ${pathsSeen.size}; manifest ids seen: ${idsSeen.size} of ${manifestIds.size}`);
report.site = [...siteGroups.values()];

await browser.close();
console.log("");
console.log(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(" and ")}.`);
for (const [check, name] of Object.entries(CHECKS)) {
  if (!opts.motion && check === "21") {
    console.log(`  [${check}] ${name}: skipped (--no-motion)`);
    continue;
  }
  console.log(`  [${check}] ${name}: ${byCheck[check] ? `${byCheck[check]} failing` : "pass"}`);
}
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
