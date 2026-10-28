// check:rules: the rule checks of the refresh.tech-based system (CLAUDE.md "Layout", "Type" and "Shape",
// 20 October 2026) and the owner's honesty checks, run in Playwright against a served build at 1440x900
// and 390x844 by default, on the eleven routes and the 404 page, plus the source and file checks they
// name.
//
// Usage: npm run check:rules -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json]
//                                [--no-sweep] [--no-motion] [--inject mutation.js]
//   e.g. npm run build && npm run start, then npm run check:rules -- http://localhost:3000
//
//  5  Shapes and effects: every computed corner radius (and ::before/::after) is 0, 4, 8, 10, 12, 16 or
//     20px, a pill (at least half the box's shorter side) or 50%; every primary, secondary and glass
//     [data-button] is a pill (each corner at least half its height); text fields (input but checkbox,
//     radio, range and hidden; select; textarea) have 4px corners; body > header and --nav-h are 56px
//     tall; no text-shadow and no background-clip:text; a blur() filter only on a decorative layer
//     (aria-hidden, itself or above, with no text in it); backdrop-filter only in body > header and on
//     [data-button="glass"]; a gradient layer (the background, ::before or ::after) never behind text:
//     the pseudo's own, the element's own text runs, or any text a text-level element (a button, link,
//     label, heading, paragraph, list item or inline run) holds; no text-shadow-*, bg-clip-text or
//     text-transparent beside a gradient utility in a class list (any variant); no hover, focus, active
//     or checked rule in the stylesheets sets a text-shadow, background-clip:text or a corner off those
//     radii (a pill there is 999px or more); in src, rounded-* is only none, hard, card, panel, pill,
//     full or the image radii [0.5rem], [0.625rem] and [0.75rem] (side prefixes and variants allowed).
//     box-shadow is allowed.
//  6  Two families: all text is PT Serif or Inter (the faces of --font-ptserif, --font-ptserif-italic,
//     --font-inter and --font-inter-italic); every h1-h3 is in PT Serif; PT Serif italic only inside an
//     em or i, and Inter italic only on the footer tagline; [data-button], form fields (input, select,
//     textarea, option) with their labels and legends, .eyebrow, .label and [data-prose] paragraphs are
//     never in the serif (display lines, the menus and the footer logo may be); the fonts loaded are
//     files of src/fonts from the site's own origin (compared by content).
//  7  Type: the tokens compute to CLAUDE.md's sizes (--text-h1 40/30, --text-h2 48/31, --text-h2s 36/30,
//     --text-h3 32/26, --text-label 12, --text-body 16 at 1440/390); every h1 in <main> is on the h1
//     step but the home hero's and a [data-scatter] hero's; every h1-h3 is 16px or more with negative
//     letter-spacing; no h4-h6 in <main>; no rendered text under 11px.
//  8  Case and alignment: uppercase only at 12px or under, never in a heading or a [data-button]; no
//     centred p, li or heading runs over 4 lines from 768 or 6 lines below it (a phone column holds about
//     60% of a desktop lead's measure; failures at 1440 and 390, warnings at 1024 and 768); nothing
//     centred in [data-prose] or in a form's labels and fields.
//  9  Italics: an em or i never sits in an h3, a summary, a p, a button, .letter or .eyebrow, or outside
//     a heading; it is its heading's trailing phrase, in the heading's colour or the surface's accent
//     (--s-accent read on the heading's surface: its nearest band, tone, surface class, header or
//     footer); at most one per [data-band], inside the heading that labels that band (its
//     aria-labelledby target). The footer tagline is the only italic text outside an em or i.
// 10  No eyebrows: no .eyebrow or .eyebrow-plain renders anywhere on a page (the header, <main> or the
//     footer); headings stand alone (the owner retired the labels above them on 21 Oct 2026). No
//     .label sits right before or right above an h1 or h2.
// 11  No claims: the banned words appear only inside the allowed sentences ("$" also inside
//     [data-calculator]); "approval" only inside the approvals phrase and the Honest by default rule;
//     every .numeral is a cited stat (with its source link and the cited note), a design fact (while
//     the content still has them) or demo data inside a coded demo.
// 12  No Concept render captions: no rendered text anywhere reads "Concept render". The owner removed
//     the caption from every image and film on 26 September 2026.
// 13  Coded demos: each software window shows "Demo data" and the illustrative-model note beneath it
//     once, and its panel data keeps its Demo data line; the app panel (role="group") shows "Demo data"
//     and its note. Windows on /platform, /commercial, /solar (its solar array) and /download, the app
//     panel on /homes-and-rentals.
// 14  Media: every /media/ path in the served HTML and JS is a manifest id (variants --name-w and
//     renditions --r included); all 29 appear on the site but those SPEC.unplaced lists (each with its
//     reason, reported as a note, and a failure once it is placed again so the list stays true); no id shows in two frames on a route in any
//     state (a [data-hover-clip] frame's still and clip are one figure; media inside aria-hidden, the
//     footer's picture loop and the bubble hero, are not frames); public/media holds only manifest
//     files and nothing is added to public/video or media-src, but for a software window's own
//     recordings (SPEC.windowRecordings: <stem>-wide and -tall, .mp4, .webm and -poster.jpg, recorded
//     from the coded model by scripts/record-software-view.mjs; CLAUDE.md says so).
// 21  Motion: under reduced motion no video plays, nothing reveals, crossfades or snaps smoothly, and
//     the window shows its recording with native controls; without it never two videos play at once,
//     the live window stops drawing once off screen (judged no sooner than 2.5s after it leaves, then
//     1.5s without a draw call within 8s), nothing is fixed but the header and the skip link, nothing
//     is sticky but a column in <main> that sticks under the header (top at least --nav-h): a nav or a
//     block holding a heading, a nav or a form, never a band (a [data-band], a section, a block of
//     <main> or one holding a band) nor over two thirds of its band's width; nothing moves with the
//     scroll (what an infinite animation moves, by transform, translate, offset, inset or margin, is
//     not sampled) and no figure counts up. The form clause is wider than the spec's "holds a heading
//     or is a nav": the home FAQ's sticky block is its enquiry card (FaqForm.tsx), which has no heading.
//     Below 1024 the fit check's score strip ([data-fit-strip], FitCheck.tsx) may stick to the bottom of
//     the screen inside its card's question column, as the reference's does (CLAUDE.md, 26 Oct 2026).
//     Every pass sees a page as a visitor in a session that has already seen the first-visit intro
//     (SPEC.introKey is seeded), so the intro's overlay never shows here; check 45 judges it.
// 22  Titles and links: every route's <title> is its own, "What the page is | Lienry Drones", exactly as
//     pageTitle in src/lib/site.ts builds it. Its one canonical link and its og:url are its own address;
//     og:title and twitter:title are the title without the brand; og:description and
//     twitter:description repeat its meta description; the card has an og:image. No two routes share a
//     title or a description.
// 23  Placeholders: no "to come", no data-media-placeholder, no empty photo box (a decorative layer,
//     aria-hidden itself or above, is never one).
// 24  Enquiry labels: every link to /register-interest carries the one label of its ?type=.
// 26  Orphans: no h1-h3 or band-level intro paragraph of two or more lines ends on a line holding one
//     word (failures at 1440 and 390, warnings at 1024 and 768).
// 29  Labels: a .label is legal only inside [data-ui] or the header (body > header).
// 33  Calculator (any route with [data-calculator], at 390, 768 and 1440): labelled fields, one live
//     region (the sr-only p), the worked figures computed here with totalOver, no decimals, no overflow,
//     the status within 1s, no tween, no network request while typing, no saving or comparison words.
// 41  Hover clips (with the motion passes): nothing requested at load; hovering a card plays its clip
//     alone within 1.2s and leaving pauses it within 400ms; focusing its link plays it and pauses it by
//     5.2s; the card keeps its height; at 390 (touch) and under reduced motion there is no clip at all.
// 45  First-visit intro (with the motion passes, when / is checked; CLAUDE.md "Intro", 28 Oct 2026): a
//     fresh session that opens / at each width shows the intro's overlay ([data-intro-overlay]) at once;
//     it is aria-hidden, holds no text and nothing focusable, and is the one fixed layer beside the
//     header and the skip link; the hero's h1 renders under it and neither <main> nor the header is
//     inert or hidden; nothing runs past the screen's edge; it ends by itself within SPEC.introMaxMs of
//     the navigation, leaving the overlay display:none; a reload in the same session has no intro. In
//     fresh sessions, a key (Tab, which then lands visibly on the skip link), a press or tap, and a
//     wheel each end it at once (within 200ms; a wheel within 500ms, as it reaches the page a few frames
//     after it is sent), and the press's click does not land on the page; a session that starts on
//     /platform and goes home by the header's link, a new tab opened on / from another page of the site
//     (a same-site referrer), one that opens /#faq, and one under reduced motion never see it.
// 44  References never load: no request from any page this script opens goes to refresh.tech,
//     legora.com or a subdomain of either, and no address in the page (href, src, srcset, poster,
//     action, data: a preconnect or a link makes no request) is on one; no text in the page (hidden
//     states, every open menu, ::before and ::after content, a field's value, alt, the aria text,
//     title, placeholder, an option's label, the tab title and meta tags included) reads
//     "refresh.tech" or "legora" (any case) or "ReFresh" (that case: "refresh" alone is ordinary
//     English); no text file in src or public (but the generated public/media) and no served HTML, JS
//     or CSS names them in either form.
//
// Retired checks:
//  25  Headline length: retired 20 Oct 2026: the reference's statements run 8 to 17 words.
//  27  Paragraph lines: retired 20 Oct 2026: the copy follows the reference's templates.
//  28  Copy budget: retired 20 Oct 2026: the copy follows the reference's templates, not the pre-pass
//      word count (scripts/copy-baseline.json and --write-baseline are deleted with it).
//  31b Spacing lint: retired 20 Oct 2026 with the 8px scale: the reference's spacing is measured.
//  The 4px-only corners, the box-shadow, blur, backdrop and gradient bans, the type scale, the serif's
//  short list, "uppercase only in .label", "no centred text", the eyebrow-per-h2 rule and the lowercase
//  muted eyebrow: retired 20 Oct 2026 for the CLAUDE.md system above.
//
// --inject <file.js> adds that file's source as an init script after the page library on every page
// the script opens (the reduced-motion, calculator and hover-clip passes included), so a self-test can
// break a rule on purpose and see the check fail.
//
// Tabs, stage parts and story beats are swept: every state is audited again. Every panel the header
// opens (each desktop panel, the phone menu and each of its sections) is opened and audited too: the
// element rules (5-10, 12, 13, 29), its enquiry links (24) and its words (44). The 404 page
// (/this-page-does-not-exist, which must answer 404) runs every check but 22. Copy the checks compare
// against (allowed sentences, stats, design facts, the app note, the footer tagline and titles) is read
// from the content modules and src/lib/site.ts through the project's TypeScript, with tolerant getters:
// a missing path fails only the checks that need it. Exit code: 0 when every check passes, 1 when any
// fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The site's own 404 page, served with status 404 (as in check:a11y and check:layout).
const NOT_FOUND = "/this-page-does-not-exist";
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", "/fit-check", "/calculator", NOT_FOUND];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  768: { width: 768, height: 1024, mobile: true },
  390: { width: 390, height: 844, mobile: true },
};

// Acceptance strings and values that the spec itself defines (E2, B4, B6, B7, CLAUDE.md), not copy from content.
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
  // Check 7: CLAUDE.md's sizes, the tokens at each width.
  steps: {
    1440: { h1: 40, h2: 48, h2s: 36, h3: 32, label: 12, body: 16 },
    390: { h1: 30, h2: 36, h2s: 36, h3: 30, label: 12, body: 16 },
  },
  // Check 7: the smallest rendered text and heading.
  minText: 11,
  minHeading: 16,
  // Check 5: the corner radii CLAUDE.md names (px), besides pills and 50%; the header bar's height.
  radii: [0, 4, 8, 10, 12, 16, 20],
  navH: 56,
  // Check 14: manifest assets the site keeps but does not show, each with its reason. The owner keeps
  // the current films until the Higgsfield swap (20 Oct 2026); placing one again fails until it is
  // removed from this list.
  unplaced: {
    "c2-commercial-clip": "the /commercial hover clip, unplaced since the refresh layout dropped hover clips",
  },
  // Check 5 (src): the rounded-* utilities a class may use.
  rounded: /^rounded-(?:(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee)-)?(?:none|hard|card|panel|pill|full|\[0\.5rem\]|\[0\.625rem\]|\[0\.75rem\])$/,
  // Check 8: uppercase only at this size or under; a centred run of at most this many lines from 768
  // and below it. The reference's centred hero and tab leads run 4 lines on desktop and 5 to 6 in the
  // phone column (/homes-and-rentals, /company, the /register-interest tabs).
  maxUppercase: 12,
  maxCentredLines: { wide: 4, phone: 6 },
  // Check 44: the reference sites, their names in text (any case) and the ReFresh spelling (that case).
  referenceHost: /(?:^|\.)(?:refresh\.tech|legora\.com)$/i,
  referenceText: "refresh\\.tech|legora",
  referenceBrand: "ReFresh",
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
  // Checks 14 and 21: the software window's recordings, one file stem per model (the building on
  // /platform, /commercial and /download, the solar array on /solar). They are recordings of the coded
  // model, not imagery, so a model's window may bring its own; nothing else may be added to public/video.
  windowRecordings: ["software-view", "solar-view"],
  // Where the coded demos are (check 13): the home page no longer carries the window.
  demos: {
    "/platform": { windows: 1 },
    "/commercial": { windows: 1 },
    "/homes-and-rentals": { apps: 1 },
    "/solar": { windows: 1 },
    "/download": { windows: 1 },
  },
  // Check 45 (CLAUDE.md "Intro"): the intro's session key (INTRO_SEEN_KEY in src/lib/intro.ts), its
  // overlay, and how long after the navigation it may still be playing by itself (WCAG 2.2.2's five
  // seconds; it is built to end at about 4.2s from the first paint).
  introKey: "lienry:intro-seen",
  introOverlay: "[data-intro-overlay]",
  introMaxMs: 5000,
  // D2 check 33: words that would turn the visitor's own figures into a Lienry claim.
  calcClaims: /\b(sav(e|es|ing|ings)|ROI|payback|cheaper|less than|compared|with Lienry|Lienry('s)? (cost|price|fee))/i,
};

const CHECKS = {
  5: "shapes and effects",
  6: "two families",
  7: "type",
  8: "case and alignment",
  9: "italics",
  10: "no eyebrows",
  11: "no claims, figures",
  12: "no Concept render captions",
  13: "coded demos labelled",
  14: "manifest media",
  21: "motion",
  22: "titles and links",
  23: "no placeholders",
  24: "one label per enquiry route",
  26: "no orphaned last word",
  29: "labels only in UI and the header",
  33: "the calculator",
  41: "hover clips",
  44: "references never load",
  45: "first-visit intro",
};
// Checks that run with the motion passes (--no-motion skips them).
const MOTION_CHECKS = new Set(["21", "41", "45"]);

function usage() {
  console.log(`Usage: node scripts/check-rules.mjs <baseUrl> [route ...] [options]

Runs the rule checks (5-14, 21-24, 26, 29, 33, 41, 44 and 45) against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all eleven and ${NOT_FOUND}, the 404 page)
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default; 1024 and 768 are known too)
  --json <file>      also write the full report as JSON
  --no-sweep         skip the tab and disclosure state sweeps
  --no-motion        skip the motion passes (checks 21, 41 and 45), which load every route again
  --inject <file.js> add the file's source as an init script, after the page library, on every page
                     the script opens (all passes): a self-test that breaks a rule on purpose`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null, sweep: true, motion: true, inject: null };
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
    else if (a.startsWith("--inject")) {
      const file = path.resolve(value());
      try {
        opts.inject = { file, content: readFileSync(file, "utf8") };
      } catch (err) {
        fail(`Cannot read --inject ${file} (${String(err.message).split("\n")[0]}).`);
      }
    } else if (a === "--no-sweep") opts.sweep = false;
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
    // Checks 6 and 9: the footer tagline, the one run of Inter italic.
    tagline: get(() => site.footer.tagline, "site.footer.tagline"),
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

// Which checks need which content path (a missing path fails only those checks).
const NEEDS = [
  [/^faq |^company honest|^stats/, 11],
  [/^homes\.appPanel/, 13],
  [/^site\.(pageTitle|siteUrl)/, 22],
  [/^site\.footer\.tagline/, 6],
  [/^site\.footer\.tagline/, 9],
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
  // A value resolved at an element: a hidden probe inside it takes one declaration (a custom property
  // such as var(--s-accent), or a color-mix of one) and reads it back computed, then leaves.
  const resolveAt = (el, prop, value) => {
    const probe = document.createElement("span");
    probe.style.display = "none";
    probe.style.setProperty(prop, value);
    el.appendChild(probe);
    const out = getComputedStyle(probe).getPropertyValue(prop);
    probe.remove();
    return out;
  };
  // The surface an element sits on (checks 9 and 10): its nearest ancestor that sets the surface tokens
  // (a band or tone, a surface class, the header or the footer), else the root. The tokens are read
  // there, never at the element, so a token the element (or a plain wrapper) sets cannot vouch for it.
  const SURFACE = "[data-tone], [data-band], .on-light, .on-dark, .on-film, .surface-raised, .surface-sunken, .surface-ink-raised, body > header, body > footer";
  const surfaceOf = (el) => el.parentElement?.closest(SURFACE) || document.documentElement;

  // The tokens CLAUDE.md sizes at this width, read from the custom properties.
  let steps = null;
  R.steps = () => {
    if (steps) return steps;
    steps = {};
    const probe = document.createElement("span");
    probe.textContent = "x";
    document.body.appendChild(probe);
    for (const t of ["h1", "h2", "h2s", "h3", "label", "body"]) {
      probe.style.fontSize = `var(--text-${t})`;
      steps[t] = Math.round(parseFloat(getComputedStyle(probe).fontSize) * 100) / 100;
    }
    probe.remove();
    return steps;
  };
  // The header's height token, in px.
  R.navH = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;height:var(--nav-h)";
    document.body.appendChild(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return h;
  };
  // The four faces next/font emits, read from the family variables on <html>.
  let families = null;
  const firstFamily = (list) => (list || "").split(",")[0].replace(/["']/g, "").trim();
  R.families = () => {
    if (families) return families;
    const cs = getComputedStyle(document.documentElement);
    const face = (name) => firstFamily(cs.getPropertyValue(name)) || null;
    const serif = face("--font-ptserif");
    const serifItalic = face("--font-ptserif-italic");
    const inter = face("--font-inter");
    const interItalic = face("--font-inter-italic");
    families = { serif, serifItalic, inter, interItalic, serifs: new Set([serif, serifItalic].filter(Boolean)), all: new Set([serif, serifItalic, inter, interItalic].filter(Boolean)) };
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
    R.state = { main, items, footer, homeHero, controls: items.map((it) => controlsOf(it.el)) };
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
  const inHomeHero = (el) => !!(R.state.homeHero && R.state.homeHero.contains(el));
  // The footer tagline (checks 6 and 9): the one run of Inter italic.
  const isTagline = (el) => !!(R.cfg.tagline && R.state.footer && R.state.footer.contains(el) && quotes(clean(el.textContent)) === quotes(clean(R.cfg.tagline)));
  // A decorative layer (checks 5 and 23): aria-hidden, itself or above, with no text in it.
  const decorative = (el) => !!el.closest("[aria-hidden='true']") && !clean(el.textContent);

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

  // Check 5: the first corner value that is not one of CLAUDE.md's radii, a pill (at least half the
  // box's shorter side) or 50%, or null. A box of unknown size is a pill only from 9999px.
  const CORNERS = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"];
  const radiusBad = (s, w, h) => {
    const half = Math.min(w, h) / 2;
    for (const k of CORNERS) {
      const v = s[k];
      if (!v) continue;
      for (const part of v.split(/\s+/)) {
        const n = parseFloat(part);
        if (part.endsWith("%")) {
          if (Math.abs(n) < 0.01 || Math.abs(n - 50) < 0.01) continue;
          return v;
        }
        if (R.cfg.radii.some((r) => Math.abs(n - r) < 0.01)) continue;
        if (Number.isFinite(half) ? n >= half - 0.5 : n >= 9999) continue;
        return v;
      }
    }
    return null;
  };
  // A corner that is not a pill on a box this high (each value at least half of it, or 50%).
  const notPill = (s, h) => CORNERS.map((k) => s[k]).find((v) => !v.split(/\s+/).every((part) => (part.endsWith("%") ? parseFloat(part) >= 50 : parseFloat(part) >= h / 2 - 0.5))) ?? null;
  const textField = (el) => el.matches("select, textarea") || (el.tagName === "INPUT" && !["checkbox", "radio", "range", "hidden"].includes(el.type));
  // Tailwind utilities that draw text shadows or gradient text, with any variant prefix; and gradients.
  const TEXT_EFFECT = /^(?:text-shadow-(?!none$)|bg-clip-text$|\[(?:-webkit-)?background-clip:text\]$|\[text-shadow:)/;
  const GRADIENT = /^bg-(?:linear|radial|conic)(?:-|$)|^bg-gradient-|^bg-\[(?:linear|radial|conic|repeating)-gradient|^\[background(?:-image)?:[^\]]*gradient\(/;
  const baseUtility = (token) => {
    let depth = 0;
    let cut = -1;
    for (let i = 0; i < token.length; i++) {
      if (token[i] === "[") depth++;
      else if (token[i] === "]") depth--;
      else if (token[i] === ":" && depth === 0) cut = i;
    }
    return token.slice(cut + 1).replace(/^!/, "").replace(/!$/, "");
  };
  // Check 5(h): the text a gradient layer would sit behind. A layer is the element's background or its
  // ::before or ::after (which paints inside the element's box): the pseudo's own text, the element's
  // own text runs, and on a text-level element (a button, link, label, heading, paragraph, list item or
  // inline run, whose label often sits in spans) any text it holds. A band or block holding text in
  // its children is a surface, not a text run.
  const TEXT_LEVEL = "[data-button], button, a, label, legend, summary, h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, span, em, strong, small, b, i";
  const textBehind = (el) => {
    if (ownText(el)) return true;
    if (!el.matches(TEXT_LEVEL)) return false;
    const copy = el.cloneNode(true);
    copy.querySelectorAll("[aria-hidden='true'], .sr-only, svg").forEach((n) => n.remove());
    return !!clean(copy.textContent);
  };
  // UI text that is never in the serif (check 6): buttons, form fields and their labels, eyebrows,
  // labels and the policy's paragraphs.
  const UI_TEXT = "[data-button], input, select, textarea, option, label, legend, .eyebrow, .label, [data-prose] p";
  const round = (v) => Math.round(v * 10) / 10;

  // Element rules (checks 5, 6, 7, 8, 9's italic style, 10, 12, 13, 29) inside a scope.
  R.elementAudit = (scopeSel) => {
    const scope = scopeSel === "document" ? document.body : typeof scopeSel === "number" ? R.state.items[scopeSel]?.el : document.querySelector(scopeSel);
    const out = [];
    if (!scope) return out;
    const add = (check, el, kind, detail = "") => out.push({ check, where: where(el), kind, sample: `${R.describe(el)}${detail ? ` ${detail}` : ""}` });
    const st = R.steps();
    const fam = R.families();
    const els = [scope, ...scope.querySelectorAll("*")];
    for (const el of els) {
      const tag = el.tagName.toLowerCase();
      if (el.closest("svg") && tag !== "svg") continue;
      if (["script", "style", "noscript", "template", "head", "meta", "link"].includes(tag)) continue;
      if (!rendered(el)) continue;
      const cs = getComputedStyle(el);
      const layers = [["", cs]];
      for (const p of ["::before", "::after"]) {
        const ps = getComputedStyle(el, p);
        if (ps.content && ps.content !== "none" && ps.content !== "normal") layers.push([p, ps]);
      }
      // The layout box (an svg has no offset box: its rect).
      const r = el.getBoundingClientRect();
      const w = el.offsetWidth ?? r.width;
      const h = el.offsetHeight ?? r.height;
      for (const [p, s] of layers) {
        const pseudoText = p && /^["']/.test(s.content) && s.content.length > 2;
        const bad = radiusBad(s, p ? parseFloat(s.width) : w, p ? parseFloat(s.height) : h);
        if (bad) add(5, el, "corner radius other than 0, 4, 8, 10, 12, 16 or 20px, a pill or 50%", `${p} ${bad}`.trim());
        if (s.textShadow && s.textShadow !== "none") add(5, el, "text-shadow", `${p} ${s.textShadow}`.trim().slice(0, 70));
        if (s.backgroundClip === "text" || s.webkitBackgroundClip === "text") add(5, el, "background-clip: text (gradient text)", p);
        if (/blur\(/.test(s.filter) && !decorative(el)) add(5, el, "blur filter on a layer that is not decorative (aria-hidden, with no text)", `${p} ${s.filter}`.trim());
        if (s.backdropFilter && s.backdropFilter !== "none" && !el.closest("body > header") && !el.matches("[data-button='glass']")) add(5, el, "backdrop-filter outside the header and the glass button", `${p} ${s.backdropFilter}`.trim());
        if (/gradient\(/.test(s.backgroundImage) && ((p && pseudoText) || textBehind(el))) add(5, el, "gradient background behind its own text", p);
        if (pseudoText) {
          const fs = parseFloat(s.fontSize);
          if (!fam.all.has(firstFamily(s.fontFamily))) add(6, el, "font family outside PT Serif and Inter", `${p} ${firstFamily(s.fontFamily)}`);
          if (fs < R.cfg.minText - 0.05) add(7, el, `text under ${R.cfg.minText}px`, `${p} ${round(fs)}px`);
          if (s.textTransform === "uppercase" && fs > R.cfg.maxUppercase + 0.05) add(8, el, `uppercase text over ${R.cfg.maxUppercase}px`, `${p} ${round(fs)}px`);
        }
      }
      // Effect utilities hide in hover and focus states, so the class list is read too.
      const bases = [...el.classList].map((token) => [token, baseUtility(token)]);
      for (const [token, base] of bases) if (TEXT_EFFECT.test(base)) add(5, el, "text-shadow or gradient-text utility in the class list", token);
      const transparent = bases.find(([, base]) => base === "text-transparent");
      const gradient = bases.find(([, base]) => GRADIENT.test(base));
      if (transparent && gradient) add(5, el, "text-transparent beside a gradient utility (gradient text)", `${transparent[0]} ${gradient[0]}`);
      // Pills and fields.
      const variant = el.getAttribute("data-button");
      if (["primary", "secondary", "glass"].includes(variant)) {
        const corner = notPill(cs, h);
        if (corner) add(5, el, `a ${variant} button that is not a pill (each corner at least half its ${round(h)}px height)`, corner);
      }
      if (textField(el)) {
        const corner = CORNERS.map((k) => cs[k]).find((v) => !v.split(/\s+/).every((part) => Math.abs(parseFloat(part) - 4) < 0.01 && part.endsWith("px")));
        if (corner) add(5, el, "a text field without 4px corners", corner);
      }

      const control = ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName);
      if (!control && !ownText(el)) continue;
      const first = firstFamily(cs.fontFamily);
      const fs = parseFloat(cs.fontSize);
      const italic = /italic|oblique/.test(cs.fontStyle);
      const tagline = isTagline(el);
      // Check 6: the two families, the serif kept off UI text, each italic face in its one place.
      if (!fam.all.has(first)) add(6, el, "font family outside PT Serif and Inter", first);
      else {
        if (fam.serifs.has(first) && el.closest(UI_TEXT)) add(6, el, "PT Serif on UI text ([data-button], a form field or its label, .eyebrow, .label or a [data-prose] paragraph)");
        if (italic || first === fam.serifItalic || first === fam.interItalic) {
          const placed = (first === fam.serifItalic && italic && el.closest("em, i")) || (first === fam.interItalic && italic && tagline);
          if (!placed) add(6, el, "italic out of place (PT Serif italic only in an em or i, Inter italic only on the footer tagline)", `(${first}, ${cs.fontStyle})`);
        }
      }
      // Check 7: nothing under the smallest size.
      if (fs < R.cfg.minText - 0.05) add(7, el, `text under ${R.cfg.minText}px`, `${Math.round(fs * 100) / 100}px`);
      // Check 8: capitals only at the label sizes, never in a heading or a button.
      if (cs.textTransform === "uppercase") {
        if (el.closest("h1, h2, h3, h4, h5, h6")) add(8, el, "uppercase in a heading");
        else if (el.closest("[data-button]")) add(8, el, "uppercase in a [data-button]");
        else if (fs > R.cfg.maxUppercase + 0.05) add(8, el, `uppercase text over ${R.cfg.maxUppercase}px`, `${round(fs)}px`);
      }
      // Check 8: no centred policy text, and no centred labels or fields in a form.
      if (/center/.test(cs.textAlign) && el.tagName !== "OPTION") {
        if (el.closest("[data-prose]")) add(8, el, "centred text in [data-prose]");
        else if (el.closest("form") && (control || el.closest("label, legend"))) add(8, el, "a centred label or field in a form");
      }
      // Check 9: italic only in an em or i, and the footer tagline.
      if (italic && !el.closest("em, i") && !tagline) add(9, el, "italic outside an em or i (only the footer tagline may be)");
    }
    for (const h of scope.querySelectorAll("h1, h2, h3")) {
      if (!rendered(h)) continue;
      const cs = getComputedStyle(h);
      const fs = parseFloat(cs.fontSize);
      if (!fam.serifs.has(firstFamily(cs.fontFamily))) add(6, h, "heading not in PT Serif", firstFamily(cs.fontFamily));
      if (fs < R.cfg.minHeading - 0.05) add(7, h, `heading under ${R.cfg.minHeading}px`, `${round(fs)}px`);
      if (!(parseFloat(cs.letterSpacing) < 0)) add(7, h, "heading without negative letter-spacing (tight tracking)", `(${cs.letterSpacing})`);
      // The display heroes (the home film, a [data-scatter] hero) set their own h1.
      if (h.tagName === "H1" && h.closest("main") && !inHomeHero(h) && !h.closest("[data-scatter]") && Math.abs(fs - st.h1) > 0.1) add(7, h, `an h1 off the h1 step (${st.h1}px)`, `${round(fs)}px`);
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
    // Check 10: no eyebrows, anywhere on the page.
    for (const e of document.querySelectorAll(".eyebrow, .eyebrow-plain")) {
      if (!rendered(e)) continue;
      add(10, e, "an eyebrow renders (the site has none since 21 Oct 2026)", `("${clean(e.textContent)}")`);
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
  // Media inside aria-hidden (the footer's picture loop, the bubble hero) is decoration, not a frame.
  function frames(scope) {
    const map = new Map();
    for (const m of scope.querySelectorAll("img, video")) {
      const id = mediaId(m);
      if (!id || !present(m) || m.closest("[aria-hidden='true']")) continue;
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

  // Check 5 in the stylesheets: the states the audit never puts an element in (hover, focus, active,
  // checked). A rule under one of them, at any depth of nesting, sets no text-shadow, no
  // background-clip:text and no corner outside CLAUDE.md's radii (the box is unknown here, so a pill is
  // 999px or more, or 50%). Values are resolved on a probe, so var() and rem read as px.
  const STATE = /:(?:hover|focus|focus-visible|focus-within|active|checked)\b/;
  const RADIUS_PROPS = ["border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius", "border-start-start-radius", "border-start-end-radius", "border-end-start-radius", "border-end-end-radius"];
  function stateRules() {
    const out = [];
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const corners = (prop, value) => {
      probe.style.cssText = "position:absolute;visibility:hidden;width:100px;height:100px";
      probe.style.setProperty(prop, value);
      const cs = getComputedStyle(probe);
      return CORNERS.map((k) => cs[k]);
    };
    const offScale = (part) => {
      const n = parseFloat(part);
      if (part.endsWith("%")) return !(Math.abs(n) < 0.01 || Math.abs(n - 50) < 0.01);
      return !(R.cfg.radii.some((r) => Math.abs(n - r) < 0.01) || n >= 999);
    };
    const rule = (sel, prop, value) => `${clean(sel, 90)} { ${prop}: ${clean(value, 60)} }`;
    const visit = (rules, inState, outer) => {
      for (const r of rules) {
        const sel = r.selectorText ? (outer ? `${outer} ${r.selectorText}` : r.selectorText) : outer;
        const state = inState || STATE.test(r.selectorText || "");
        if (state && r.style) {
          const st = r.style;
          const shadow = st.getPropertyValue("text-shadow").trim();
          if (shadow && !/^(?:none|initial|unset|inherit|revert)/.test(shadow)) out.push({ kind: "text-shadow in a hover, focus, active or checked rule", sample: rule(sel, "text-shadow", shadow) });
          for (const prop of ["background-clip", "-webkit-background-clip"]) {
            if (/\btext\b/.test(st.getPropertyValue(prop))) out.push({ kind: "background-clip: text in a hover, focus, active or checked rule", sample: rule(sel, prop, st.getPropertyValue(prop)) });
          }
          for (const prop of RADIUS_PROPS) {
            const value = st.getPropertyValue(prop).trim();
            if (!value || /^(?:initial|unset|inherit|revert)/.test(value)) continue;
            const off = corners(prop, value).find((v) => v.split(/\s+/).some(offScale));
            if (!off) continue;
            out.push({ kind: "a corner radius other than 0, 4, 8, 10, 12, 16 or 20px, a pill or 50% in a hover, focus, active or checked rule", sample: rule(sel, prop, value === off ? value : `${value} (${off})`) });
            break;
          }
        }
        if (r.cssRules && !(r instanceof CSSKeyframesRule)) visit(r.cssRules, state, sel);
      }
    };
    for (const sheet of document.styleSheets) {
      let rules = null;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      visit(rules, false, "");
    }
    probe.remove();
    return out;
  }

  // Page rules (checks 5's header bar and state rules, 9, 11, 21's sticky parts, 22, 23, 24, 44's
  // text): the whole DOM, hidden states included.
  R.pageAudit = () => {
    const out = [];
    const add = (check, el, kind, detail = "") => out.push({ check, where: el ? where(el) : "page", kind, sample: el ? `${R.describe(el)}${detail ? ` ${detail}` : ""}` : detail });

    // Check 5: the bar in body > header is --nav-h, 56px, tall; the stylesheets' state rules.
    const navH = R.navH();
    for (const v of stateRules()) add(5, null, v.kind, v.sample);
    const bar = document.querySelector("body > header");
    if (Math.abs(navH - R.cfg.navH) > 0.5) add(5, null, `--nav-h computes to ${round(navH)}px, not ${R.cfg.navH}px`);
    if (!bar) add(5, null, "no header bar (body > header)");
    else if (Math.abs(bar.getBoundingClientRect().height - R.cfg.navH) > 0.5) add(5, bar, `the header bar is ${round(bar.getBoundingClientRect().height)}px tall, not ${R.cfg.navH}px`);

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
        colourMatches: heading ? same(getComputedStyle(e).color, hcs.color) || same(getComputedStyle(e).color, resolveAt(surfaceOf(heading), "color", "var(--s-accent)")) : true,
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

    // Check 21: sticky and fixed elements, scroll-driven animations. A sticky block in <main> is a column
    // beside the content that sticks under the header (its top at least --nav-h): a nav, or a block
    // holding a heading, a nav or a form (the home FAQ's enquiry card, which holds no heading), never a
    // band (a [data-band], a section, a block of <main> or one holding a band) and at most two thirds
    // of its band's width.
    const header = document.querySelector("body > header, header.nav-bar") || document.querySelector("header");
    const mainBlocks = new Set(R.state.items.map((it) => it.el));
    for (const el of document.body.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if ((cs.position === "sticky" || cs.position === "fixed") && !rendered(el)) continue;
      // The fit check's score strip, bottom-sticky inside its card's question column below 1024.
      const fitStrip = el.matches("[data-fit-strip]") && innerWidth < 1024 && !!el.closest("main") && !el.querySelector("[data-band], section");
      if (cs.position === "sticky" && !(header && header.contains(el)) && !fitStrip) {
        const below = parseFloat(cs.top) >= navH - 0.5;
        const holds = el.matches("nav") || !!el.querySelector("h1, h2, h3, h4, h5, h6, nav, form");
        const isBand = el.matches("[data-band], section, main") || mainBlocks.has(el) || !!el.querySelector("[data-band], section");
        const band = el.parentElement?.closest("[data-band], main") || document.body;
        const share = el.getBoundingClientRect().width / Math.max(1, band.getBoundingClientRect().width);
        const why = [!el.closest("main") ? "outside <main>" : "", !below ? "above the header's bottom" : "", !holds ? "holds no heading, nav or form" : "", isBand ? "a whole band" : "", share > 2 / 3 ? `${Math.round(share * 100)}% of its band's width` : ""].filter(Boolean);
        if (why.length) add(21, el, "sticky element other than a nav or a heading, nav or form column in <main> that sticks under the header", `(top ${cs.top}: ${why.join(", ")})`);
      }
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

    // Check 44: the reference sites' names, in the page's text and attributes and in the head.
    out.push(...R.references("document"));

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

  // Check 44: text that names a reference site in a scope ("document" for the page and its head): every
  // text node, hidden states included; the text attributes (alt, aria-label, title, placeholder,
  // aria-description and the other aria text, a value, an option's label, meta content) and a field's
  // value; ::before and ::after content (attr() resolved); and every address an attribute holds
  // (href, src, srcset, poster, action, data), which a request check misses for preconnects and links.
  const TEXT_ATTRS = ["alt", "aria-label", "title", "placeholder", "aria-description", "aria-roledescription", "aria-valuetext", "aria-placeholder", "value", "label", "content"];
  const URL_ATTRS = ["href", "src", "srcset", "poster", "action", "formaction", "data", "xlink:href"];
  const pseudoContent = (el, p) => {
    const c = getComputedStyle(el, p).content;
    if (!c || c === "none" || c === "normal") return "";
    return c.replace(/attr\(\s*([\w-]+)\s*\)/g, (_, name) => el.getAttribute(name) || "").replace(/["']/g, "");
  };
  R.references = (scopeSel) => {
    const root = scopeSel === "document" ? document.documentElement : document.querySelector(scopeSel);
    const out = [];
    if (!root) return out;
    const anyCase = new RegExp(R.cfg.referenceText, "i");
    const brand = new RegExp(R.cfg.referenceBrand);
    const hit = (text) => {
      const m = text.match(anyCase) || text.match(brand);
      return m ? `"…${clean(text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40))}…"` : null;
    };
    const at = (el) => (el.closest("head") ? "page" : where(el));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest("script, style, noscript, template")) continue;
      const found = hit(n.textContent);
      if (found) out.push({ check: 44, where: where(p), kind: "text names a reference site (refresh.tech, Legora or ReFresh)", sample: `${R.describe(p)} ${found}` });
    }
    for (const el of [root, ...root.querySelectorAll("*")]) {
      if (el.closest("script, style, noscript, template")) continue;
      for (const attr of TEXT_ATTRS) {
        const found = el.hasAttribute(attr) ? hit(el.getAttribute(attr)) : null;
        if (found) out.push({ check: 44, where: at(el), kind: `${attr} text names a reference site (refresh.tech, Legora or ReFresh)`, sample: `<${el.tagName.toLowerCase()}> ${found}` });
      }
      if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.value !== el.getAttribute("value")) {
        const found = hit(el.value || "");
        if (found) out.push({ check: 44, where: at(el), kind: "a field's value names a reference site (refresh.tech, Legora or ReFresh)", sample: `<${el.tagName.toLowerCase()}> ${found}` });
      }
      for (const attr of URL_ATTRS) {
        const value = el.getAttribute(attr);
        const m = value && value.match(anyCase);
        if (m) out.push({ check: 44, where: at(el), kind: `an address (${attr}) on a reference site (refresh.tech or legora.com)`, sample: `<${el.tagName.toLowerCase()}> ${clean(value, 90)}` });
      }
      if (el.closest("head")) continue;
      for (const p of ["::before", "::after"]) {
        const found = hit(pseudoContent(el, p));
        if (found) out.push({ check: 44, where: at(el), kind: `${p} content names a reference site (refresh.tech, Legora or ReFresh)`, sample: `${R.describe(el)} ${found}` });
      }
    }
    return out;
  };

  // Empty boxes: a filled or framed rectangle of 96px or more with nothing rendered in it.
  function emptyBoxes() {
    const found = [];
    for (const el of document.querySelectorAll("main *, footer *")) {
      if (inFilm(el) || el.closest("svg") || el.closest("[aria-hidden='true']")) continue;
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
      const rec = [...wrap.querySelectorAll("video")].find((v) => R.cfg.windowRecordings.some((stem) => (v.currentSrc || v.querySelector("source")?.getAttribute("src") || v.getAttribute("poster") || "").includes(`/${stem}-`)));
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
  // What a running infinite animation moves (bubble drift, glow drift, a marquee) drifts on its own: it
  // is not sampled. Only an animation whose keyframes move its target counts (a transform, translate,
  // rotate, scale, offset path, inset or margin); a loop of colour or opacity moves nothing.
  const MOVES = /^(?:transform|translate|rotate|scale|offset[A-Z]|top|left|right|bottom|inset|margin)/;
  const moves = (a) => {
    try {
      return a.effect.getKeyframes().some((k) => Object.keys(k).some((p) => MOVES.test(p)));
    } catch {
      return true;
    }
  };
  R.positions = () => {
    R.posEls = [];
    const pos = [];
    const drifting = document
      .getAnimations()
      .filter((a) => a.playState === "running" && a.effect?.getTiming?.().iterations === Infinity && moves(a))
      .map((a) => a.effect.target)
      .filter(Boolean);
    for (const el of document.querySelectorAll("main *")) {
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;
      if (awaitingReveal(el) || drifting.some((t) => t.contains(el))) continue;
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

  // Checks 8 and 26: the rendered lines of an element, each with its words. Words are whitespace-separated runs of the
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
  // Check 8: centred p, li and h1-h3 that run over max lines. An li is measured only when it holds no
  // block of text of its own (its p or heading is measured instead).
  R.centredRuns = (max, scopeIndex = null) => {
    const scope = scopeIndex === null ? document.body : R.state.items[scopeIndex]?.el;
    if (!scope) return [];
    const out = [];
    for (const el of scope.querySelectorAll("p, li, h1, h2, h3")) {
      if (!rendered(el) || el.closest("svg, .sr-only") || !/center/.test(getComputedStyle(el).textAlign)) continue;
      if (el.tagName === "LI" && [...el.querySelectorAll("*")].some((k) => !/^(inline|contents)/.test(getComputedStyle(k).display) && clean(k.textContent))) continue;
      const n = lines(el).length;
      if (n > max) out.push({ where: where(el), tag: el.tagName.toLowerCase(), lines: n, sample: R.describe(el) });
    }
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

  // The header's menus: every rendered button in body > header that opens a panel (the three desktop
  // panels from 1024, the phone menu's button below it), and inside an open panel each button that
  // opens a list of its own (the phone menu's sections, which mount only when expanded).
  R.menuButtons = () => {
    const header = document.querySelector("body > header");
    R.menuEls = header ? [...header.querySelectorAll("button[aria-controls][aria-expanded]")].filter(rendered) : [];
    return R.menuEls.map((b) => labelOf(b) || b.getAttribute("aria-controls"));
  };
  const opens = (b) => {
    if (!b || !b.isConnected) return false;
    if (b.getAttribute("aria-expanded") !== "true") b.click();
    return true;
  };
  R.openMenu = (i) => opens(R.menuEls?.[i]);
  // The panel button i opened, once it renders: the labels of its own section buttons.
  R.menuPanel = (i) => {
    const b = R.menuEls?.[i];
    const panel = b && b.getAttribute("aria-expanded") === "true" ? document.getElementById(b.getAttribute("aria-controls")) : null;
    if (!panel || !rendered(panel)) return null;
    R.subEls = [...panel.querySelectorAll("button[aria-controls][aria-expanded]")].filter(rendered);
    return R.subEls.map((s) => labelOf(s) || s.getAttribute("aria-controls"));
  };
  R.openSub = (j) => opens(R.subEls?.[j]);
  R.subOpen = (j) => {
    const b = R.subEls?.[j];
    const list = b && b.getAttribute("aria-expanded") === "true" ? document.getElementById(b.getAttribute("aria-controls")) : null;
    return !!list && rendered(list);
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
  retiredCaption: SPEC.retiredCaption,
  demoData: SPEC.demoData,
  windowNote: SPEC.windowNote,
  windowRecordings: SPEC.windowRecordings,
  readoutsNote: SPEC.readoutsNote,
  appPanelLabel: SPEC.appPanelLabel,
  appNote: content.appNote ?? null,
  tagline: content.tagline ?? null,
  radii: SPEC.radii,
  navH: SPEC.navH,
  minText: SPEC.minText,
  minHeading: SPEC.minHeading,
  maxUppercase: SPEC.maxUppercase,
  referenceText: SPEC.referenceText,
  referenceBrand: SPEC.referenceBrand,
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

// Every page the checks open: the page library, the draw counter, the intro already seen (a session
// in which it has played; check 45 opens its own without), then the --inject mutation, last, so a
// self-test can clear the key again. Its requests to a reference site are kept for check 44 (refs).
async function newPage(width, extra = {}, { introSeen = true } = {}) {
  const vp = VIEWPORTS[width] ?? { width, height: width < 800 ? 844 : 900, mobile: width < 800 };
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile, ...extra });
  await context.addInitScript(pageLib);
  await context.addInitScript(drawCounter);
  if (introSeen)
    await context.addInitScript((key) => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // No storage: the head script then never starts the intro either.
      }
    }, SPEC.introKey);
  if (opts.inject) await context.addInitScript({ content: opts.inject.content });
  const refs = [];
  context.on("request", (req) => {
    let host = "";
    try {
      host = new URL(req.url()).hostname;
    } catch {
      return;
    }
    if (SPEC.referenceHost.test(host)) refs.push(`${req.resourceType()} ${req.url()}`);
  });
  const page = await context.newPage();
  return { context, page, vp, refs };
}
// Check 44: a pass's requests to a reference site, as failures.
const judgeRefs = (refs, add) => {
  for (const r of new Set(refs)) add(44, "page", "a request to a reference site (refresh.tech or legora.com)", r);
};

// The not-found route must answer 404 (its page is the site's own); every other route below 400.
async function load(page, route) {
  try {
    const res = await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
    const status = res ? res.status() : null;
    if (route === NOT_FOUND ? status !== 404 : !status || status >= 400) return `HTTP ${status ?? "no response"}${route === NOT_FOUND ? ", not 404" : ""}`;
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

const report = { base: opts.base, when: new Date().toISOString(), runs: [], site: [] };
const siteFailures = [];
// Routes that hold a calculator or hover clips get their own passes (checks 33 and 41) after the rest.
const calcRoutes = new Set();
const clipRoutes = new Set();
let totalWarnings = 0;
const idsSeen = new Set();
const scripts = new Set();
// Check 44: the stylesheets the pages loaded (scanned for the reference names with the HTML and JS).
const styles = new Set();
const fontsLoaded = new Map();
const stepsByWidth = new Map();
const pending = [];
const titlesSeen = new Map();
const descriptionsSeen = new Map();
let totalFailures = 0;
const byCheck = {};

console.log(`check:rules  ${opts.base}`);
console.log(`Checks 5-14, 21-24, 26, 29, 33, 41, 44 and 45 at ${opts.widths.join(" and ")}${opts.sweep ? ", sweeping tabs, stage parts and story beats" : ""}${opts.motion ? ", with the motion passes" : ""}`);
if (content.error) console.log(`  note: ${content.error}; the checks that compare against content report it.`);
if (opts.inject) console.log(`  note: injecting ${path.relative(process.cwd(), opts.inject.file) || opts.inject.file} on every page`);
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
    const { context, page, vp, refs } = await newPage(width);
    page.on("response", (res) => {
      const url = res.url();
      const type = res.request().resourceType();
      if (type === "script" && url.startsWith(opts.base)) scripts.add(url);
      if (type === "stylesheet" && url.startsWith(opts.base)) styles.add(url);
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
    // Check 22 is about the site's own routes: the 404 page has no entry in pageTitles and no address.
    if (route === NOT_FOUND) notes.push(`HTTP 404: check 22 (titles and links) does not apply to the not-found page`);
    else {
      if (content.error) add(22, "page", "titles not checked", content.error);
      else if (!content.titles) add(22, "page", "titles not checked", "content path missing: site.pageTitle");
      else if (!content.titles[route]) add(22, "page", "no tab title for this route in pageTitles (src/lib/site.ts)", "");
      else if (pageRes.title !== content.titles[route]) add(22, "page", `<title> is "${pageRes.title}", not "${content.titles[route]}"`, "");
      judgeHead(route, pageRes.head, add);
      titlesSeen.set(route, pageRes.title);
      descriptionsSeen.set(route, pageRes.head.description[0]);
    }

    // Checks 8 (centred runs) and 26 (orphans): failures at 1440 and 390, warnings at the widths between.
    const lineGate = width === 1440 || width === 390 ? add : warn;
    const maxCentred = width < 768 ? SPEC.maxCentredLines.phone : SPEC.maxCentredLines.wide;
    const centredKind = (o) => `a centred ${o.tag} of ${o.lines} lines (at most ${maxCentred})`;
    for (const o of await R(page, "centredRuns", maxCentred)) lineGate(8, o.where, centredKind(o), o.sample);
    for (const o of await R(page, "orphans")) lineGate(26, o.where, `the last of ${o.lines} lines holds one word ("${o.word}")`, o.sample);
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
          // Lines in the newly shown panel (checks 8 and 26).
          const lineViolations = [
            ...(await R(page, "centredRuns", maxCentred, g.block)).map((o) => ({ check: 8, where: String(o.where), kind: centredKind(o), sample: o.sample })),
            ...(await R(page, "orphans", g.block)).map((o) => ({ check: 26, where: String(o.where), kind: `the last of ${o.lines} lines holds one word ("${o.word}")`, sample: o.sample })),
          ];
          for (const v of lineViolations) {
            const key = `${v.check}|${v.where}|${v.kind}|${v.sample}`;
            if (baseline.has(key)) continue;
            baseline.add(key);
            lineGate(v.check, v.where, v.kind, `with ${state}: ${v.sample}`);
          }
          dupes(await R(page, "mediaFrames"), state);
          for (const id of await R(page, "mediaInDom")) idsSeen.add(id);
        }
        await R(page, "activate", g.block, g.group, g.initial);
        await page.waitForTimeout(260);
        await R(page, "idle", 1500, g.block);
      }
    }

    // The menus: every panel the header opens (the three desktop panels, the phone menu and each of its
    // sections in turn) is audited open: every element rule, its enquiry links (check 24) and its words
    // (check 44). A state only adds what the default state did not already report.
    const menuAudit = async (state) => {
      for (const v of [...(await R(page, "elementAudit", "body > header")), ...(await R(page, "references", "body > header"))]) {
        const key = `${v.check}|header|${v.kind}|${v.sample}`;
        if (baseline.has(key)) continue;
        baseline.add(key);
        failures.push({ ...v, where: "header", sample: `with ${state}: ${v.sample}` });
      }
      judgeLinks(await R(page, "enquiryLinks", "body > header"), (c, w, k, s) => {
        const key = `${c}|${w}|${k}|${s}`;
        if (baseline.has(key)) return;
        baseline.add(key);
        add(c, w, k, `with ${state}: ${s}`);
      });
    };
    const menus = await R(page, "menuButtons");
    const audited = [];
    for (let i = 0; i < menus.length; i++) {
      await R(page, "openMenu", i);
      await page.waitForTimeout(500);
      const sections = await R(page, "menuPanel", i);
      if (!sections) {
        notes.push(`menu "${menus[i]}": its panel did not render when opened, so it was not audited`);
        continue;
      }
      const state = `the "${menus[i]}" panel open`;
      await menuAudit(state);
      for (let j = 0; j < sections.length; j++) {
        await R(page, "openSub", j);
        await page.waitForTimeout(350);
        if (await R(page, "subOpen", j)) await menuAudit(`${state} and "${sections[j]}" expanded`);
        else notes.push(`menu "${menus[i]}": its section "${sections[j]}" did not render when expanded, so it was not audited`);
      }
      audited.push(`"${menus[i]}"${sections.length ? ` (${sections.length} sections)` : ""}`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
    if (audited.length) notes.push(`menus audited open: ${audited.join(", ")}`);

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
    judgeRefs(refs, add);

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
      judgeRefs(reduced.refs, add);
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
  const { context, page, refs } = await newPage(width);
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
    judgeRefs(refs, (check, where, kind, sample) => failures.push({ check, kind, sample }));
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
  // Each page's requests to a reference site (check 44).
  const refs = [];
  try {
    // Desktop, fine pointer.
    {
      const { context, page, vp, refs: seen } = await newPage(1440);
      refs.push(seen);
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
      const { context, page, refs: seen } = await newPage(width, extra);
      refs.push(seen);
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
    judgeRefs(refs.flat(), (check, where, kind, sample) => failures.push({ check, kind, sample }));
    printPass(`${route} hover clips`, failures, notes);
  }
}

// Check 45: the first-visit intro, in fresh sessions (no key seeded) that open / at one width.
const introState = (page) =>
  page.evaluate((sel) => {
    const o = document.querySelector(sel);
    const cs = o ? getComputedStyle(o) : null;
    return { on: document.documentElement.getAttribute("data-intro"), display: cs ? cs.display : "absent", visibility: cs ? cs.visibility : "" };
  }, SPEC.introOverlay);

async function introPass(width) {
  const failures = [];
  const notes = [];
  const add = (kind, sample = "") => failures.push({ check: 45, kind, sample });
  const refs = [];
  const errors = [];
  // A fresh session at this width; `go` opens a route and returns once the head script has run.
  const open = async (extra = {}) => {
    const { context, page, refs: seen } = await newPage(width, extra, { introSeen: false });
    refs.push(seen);
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    const go = async (route) => {
      const t0 = Date.now();
      await page.goto(opts.base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      return t0;
    };
    return { context, page, go };
  };
  const label = `at ${width}`;
  try {
    // Plays by itself, and is judged while it plays.
    {
      const { context, page, go } = await open();
      const t0 = await go("/");
      let st = await introState(page);
      if (st.on !== "play" || st.display === "none") add(`a fresh session opening / shows no intro ${label}`, JSON.stringify(st));
      else {
        await page.waitForTimeout(900);
        const probe = await page.evaluate((sel) => {
          const o = document.querySelector(sel);
          const focusable = o.querySelectorAll('a[href], button, input, select, textarea, summary, iframe, [tabindex]:not([tabindex="-1"]), [contenteditable]').length;
          const header = document.querySelector("body > header, header");
          const h1 = document.querySelector("main h1");
          const r = h1?.getBoundingClientRect();
          let hidden = false;
          for (let e = h1; e; e = e.parentElement) {
            const c = getComputedStyle(e);
            if (c.display === "none" || c.visibility === "hidden" || parseFloat(c.opacity) === 0) hidden = true;
          }
          const veiled = [document.querySelector("main"), header].filter((e) => e && (e.inert || e.hidden || e.getAttribute("aria-hidden") === "true")).map((e) => e.tagName.toLowerCase());
          const fixed = [];
          for (const e of document.body.querySelectorAll("*")) {
            if (getComputedStyle(e).position !== "fixed" || o.contains(e) || (header && header.contains(e)) || e.matches('a[href="#main"]')) continue;
            const b = e.getBoundingClientRect();
            if (b.width && b.height && getComputedStyle(e).visibility === "visible") fixed.push(`${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""}`);
          }
          return {
            ariaHidden: o.getAttribute("aria-hidden"),
            text: o.textContent.trim().slice(0, 40),
            focusable,
            h1: !!h1 && !!r && r.width > 0 && r.height > 0 && !hidden,
            veiled,
            fixed,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          };
        }, SPEC.introOverlay);
        if (probe.ariaHidden !== "true") add(`the intro overlay is not aria-hidden ${label}`);
        if (probe.text) add(`the intro overlay holds text ${label}`, probe.text);
        if (probe.focusable) add(`the intro overlay holds something focusable ${label}`, `${probe.focusable}`);
        if (!probe.h1) add(`the hero's h1 does not render under the intro ${label}`);
        if (probe.veiled.length) add(`inert, hidden or aria-hidden under the intro ${label}`, probe.veiled.join(", "));
        for (const f of probe.fixed) add(`a fixed element other than the header, the skip link and the intro ${label}`, f);
        if (probe.overflow > 0) add(`the page runs ${probe.overflow}px past the screen's edge during the intro ${label}`);
        const left = SPEC.introMaxMs - (Date.now() - t0);
        const ended = await page
          .waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), null, { timeout: Math.max(1, left), polling: 50 })
          .then(() => Date.now() - t0)
          .catch(() => null);
        if (ended === null) add(`the intro is still playing ${SPEC.introMaxMs}ms after the navigation ${label}`);
        else notes.push(`45: the intro ended by itself ${ended}ms after the navigation ${label}`);
        st = await introState(page);
        if (ended !== null && st.display !== "none") add(`the intro overlay is not display:none once it ends ${label}`, JSON.stringify(st));
        await go("/");
        st = await introState(page);
        if (st.on || st.display !== "none") add(`a reload of / in the same session shows the intro again ${label}`, JSON.stringify(st));
      }
      await context.close();
    }
    // Any input ends it at once: a key (Tab, landing on the skip link), a press or a tap, a wheel.
    const inputs = [
      ["Tab", (page) => page.keyboard.press("Tab")],
      // Aimed at a control in the header under the paper, whose click must not land: a link at 1440
      // (not a menu button: those open on hover once the paper is gone), the burger on a phone.
      [
        width < 800 ? "a tap" : "a press",
        async (page) => {
          const at = await page.evaluate((phone) => {
            const el = [...document.querySelectorAll(phone ? "body > header button[aria-expanded]" : 'body > header a[href]:not([href="/"])')].find((e) => e.getBoundingClientRect().width > 0);
            const r = el?.getBoundingClientRect();
            return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : { x: innerWidth / 2, y: 300 };
          }, width < 800);
          if (width < 800) await page.touchscreen.tap(at.x, at.y);
          else await page.mouse.click(at.x, at.y);
        },
      ],
      ...(width < 800 ? [] : [["a wheel", async (page) => { await page.mouse.move(width / 2, 300); await page.mouse.wheel(0, 200); }]]),
    ];
    for (const [name, act] of inputs) {
      const { context, page, go } = await open();
      const t0 = await go("/");
      const loaded = Date.now() - t0;
      const was = (await introState(page)).on;
      await page.waitForTimeout(700);
      if (was === "play" && (await introState(page)).on === "play") {
        await act(page);
        // At once: a key, press or tap within a frame or two; a wheel reaches the page a few frames
        // after it is sent (about 100ms headless), so it has 500ms.
        await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), null, { timeout: name === "a wheel" ? 500 : 200, polling: "raf" }).catch(() => {});
        const st = await introState(page);
        if (st.on || st.display !== "none") add(`${name} does not end the intro at once ${label}`, JSON.stringify(st));
        if (name !== "Tab" && name !== "a wheel") {
          await page.waitForTimeout(700);
          const landed = await page.evaluate(([home, phone]) => ({ moved: location.href !== home, open: phone && !!document.querySelector('body > header [aria-expanded="true"]') }), [opts.base + "/", width < 800]);
          if (landed.moved || landed.open) add(`${name} that ends the intro also clicks what was under it ${label}`, JSON.stringify(landed));
        }
        if (name === "Tab") {
          const f = await page.evaluate(() => {
            const a = document.activeElement;
            const r = a.getBoundingClientRect();
            const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return { skip: a.matches('a[href="#main"]'), seen: !!top && (a === top || a.contains(top)) };
          });
          if (!f.skip || !f.seen) add(`Tab during the intro does not land visibly on the skip link ${label}`, JSON.stringify(f));
        }
      } else add(`no intro to end with ${name} ${label}`, `${was} (domcontentloaded at ${loaded}ms, seen key ${await page.evaluate((k) => sessionStorage.getItem(k), SPEC.introKey)})`);
      await context.close();
    }
    // Never: a session that starts elsewhere, a deep link, reduced motion.
    {
      const { context, page, go } = await open();
      await go("/platform");
      if ((await introState(page)).on) add(`a session that opens /platform starts the intro ${label}`);
      await page.waitForLoadState("load");
      await page.locator('body > header a[href="/"], header a[href="/"]').first().click();
      await page.waitForURL(opts.base + "/");
      await page.waitForTimeout(300);
      const st = await introState(page);
      if (st.on || st.display !== "none") add(`going home by the header's link shows the intro ${label}`, JSON.stringify(st));
      await context.close();
    }
    {
      const { context, page } = await open();
      await page.goto(opts.base + "/", { waitUntil: "domcontentloaded", timeout: 60000, referer: opts.base + "/platform" });
      const st = await introState(page);
      if (st.on || st.display !== "none") add(`a new tab opened on / from another page of the site shows the intro ${label}`, JSON.stringify(st));
      await context.close();
    }
    for (const [name, extra, route] of [["/#faq", {}, "/#faq"], ["reduced motion", { reducedMotion: "reduce" }, "/"]]) {
      const { context, page, go } = await open(extra);
      await go(route);
      const st = await introState(page);
      if (st.on || st.display !== "none") add(`the intro plays with ${name} ${label}`, JSON.stringify(st));
      await context.close();
    }
  } catch (err) {
    add(`the intro pass could not finish ${label}`, String(err.message).split("\n")[0]);
  } finally {
    for (const e of new Set(errors)) add(`page error in an intro session ${label}`, e);
    judgeRefs(refs.flat(), (check, where, kind, sample) => failures.push({ check, kind, sample }));
    printPass(`/ first-visit intro at ${width}`, failures, notes);
  }
}

if (calcRoutes.size) for (const route of calcRoutes) for (const width of [390, 768, 1440]) await calcPass(route, width);
if (opts.motion) for (const route of clipRoutes) await clipPass(route);
if (opts.motion && opts.routes.includes("/")) for (const width of opts.widths) await introPass(width);

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
if (ROUTES.every((r) => r === NOT_FOUND || opts.routes.includes(r))) {
  const missing = [...manifestIds].filter((id) => !idsSeen.has(id));
  for (const id of missing) {
    if (SPEC.unplaced[id]) console.log(`  note  14: ${id} is kept but not shown (${SPEC.unplaced[id]})`);
    else siteAdd(14, "a manifest id that appears nowhere on the site", id);
  }
  for (const id of Object.keys(SPEC.unplaced)) {
    if (!manifestIds.has(id)) siteAdd(14, "SPEC.unplaced names an id that is not in the manifest", id);
    else if (idsSeen.has(id)) siteAdd(14, "an id SPEC.unplaced calls unplaced shows on the site: remove it from the list", id);
  }
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
  const recording = new RegExp(`^public/video/(?:${SPEC.windowRecordings.join("|")})-(?:wide|tall)(?:\\.mp4|\\.webm|-poster\\.jpg)$`);
  for (const f of git(`diff --name-only --diff-filter=A ${base} HEAD -- public/media public/video media-src`).split("\n").filter(Boolean)) {
    if (!recording.test(f)) siteAdd(14, "a media file added on this branch", f);
  }
} catch {
  console.log("  note  git is unavailable: the public/video and media-src history was not checked");
}

// Check 22: no two routes share a tab title or a description.
for (const [seen, what] of [[titlesSeen, "a tab title"], [descriptionsSeen, "a description"]]) {
  const byText = new Map();
  for (const [route, text] of seen) if (text !== undefined) byText.set(text, [...(byText.get(text) ?? []), route]);
  for (const [text, routes] of byText) if (routes.length > 1) siteAdd(22, `two routes share ${what}`, `"${text}" on ${routes.join(", ")}`);
}

// Check 6: every font file loaded is one of src/fonts, byte for byte, from the site's own origin.
if (!fontsLoaded.size) siteAdd(6, "no font files were loaded", "");
for (const [url, hash] of fontsLoaded) {
  if (!url.startsWith(opts.base)) siteAdd(6, "a font loaded from another origin", url);
  else if (!hash || !fontHashes.has(hash)) siteAdd(6, "a font file that is not one of src/fonts", url);
}
const usedFonts = new Set([...fontsLoaded.values()].map((h) => fontHashes.get(h)).filter(Boolean));

// Check 5 in source: every rounded-* utility in src is one of CLAUDE.md's (its variants and important
// flag aside). A rounded="..." prop is not a utility.
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
// Check 44 in source: the reference sites' names in any text file, any case, and the ReFresh spelling.
const referenceName = new RegExp(SPEC.referenceText, "i");
const referenceBrand = new RegExp(SPEC.referenceBrand);
const namesReference = (text) => text.match(referenceName) || text.match(referenceBrand);
// public/media is generated by media:fetch (gitignored): not the repository's own files.
const generated = path.join(ROOT, "public/media");
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const file = path.join(dir, f);
  if (file === generated) return [];
  return statSync(file).isDirectory() ? walk(file) : [file];
});
let roundedTokens = 0;
let scanned = 0;
const sourceFiles = [...walk(path.join(ROOT, "src")), ...(existsSync(path.join(ROOT, "public")) ? walk(path.join(ROOT, "public")) : [])];
for (const file of sourceFiles) {
  const buf = readFileSync(file);
  if (buf.includes(0)) continue;
  scanned++;
  const relFile = path.relative(ROOT, file).split(path.sep).join("/");
  const inSrc = relFile.startsWith("src/");
  buf
    .toString("utf8")
    .split("\n")
    .forEach((line, i) => {
      const rel = `${relFile}:${i + 1}`;
      if (namesReference(line)) siteAdd(44, "a file names a reference site (refresh.tech, Legora or ReFresh)", `${rel} ${line.trim().slice(0, 100)}`);
      if (!inSrc) return;
      for (const token of line.split(/[\s"'`{},;]+/)) {
        const base = baseUtilityNode(token);
        if (!base.startsWith("rounded-")) continue;
        roundedTokens++;
        if (!SPEC.rounded.test(base)) siteAdd(5, "a rounded-* utility outside rounded-(none|hard|card|panel|pill|full) and the image radii", `${rel} ${token}`);
      }
    });
}
console.log(`  note  5: ${roundedTokens} rounded-* utilities in src; 44: ${scanned} text files in src and public (but public/media) scanned`);

// Check 44: the served HTML, JS and CSS name no reference site.
const served = new Map(texts);
for (const url of styles) {
  try {
    served.set(url.replace(opts.base, ""), await (await fetch(url)).text());
  } catch {
    // A stylesheet that cannot be fetched again has no text to scan.
  }
}
for (const [where, text] of served) {
  const named = namesReference(text);
  if (named) siteAdd(44, "served HTML, JS or CSS names a reference site (refresh.tech, Legora or ReFresh)", `${where}: "…${text.slice(Math.max(0, named.index - 40), named.index + 50).replace(/\s+/g, " ")}…"`);
}

// Content paths the checks needed and could not find: each fails only the checks that need it.
for (const name of content.missing ?? []) {
  const checks = NEEDS.filter(([re]) => re.test(name)).map(([, check]) => check);
  for (const check of checks) siteAdd(check, "content path missing", name);
  if (!checks.length) console.log(`  note  content path missing (no check needs it to pass): ${name}`);
}

// Check 7: the size tokens compute to CLAUDE.md's sizes at 1440 and 390.
for (const [width, steps] of stepsByWidth) {
  const want = SPEC.steps[width];
  if (!want) continue;
  for (const [step, px] of Object.entries(want)) {
    if (Math.abs((steps[step] ?? 0) - px) > 0.1) siteAdd(7, `--text-${step} computes to ${steps[step]}px at ${width}, not CLAUDE.md's ${px}px`);
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
  // The source scans list more of their findings: each one is a line to change.
  const show = g.check === 5 || g.check === 44 ? 8 : 4;
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
    // Check 21's sticky and fixed rules are part of the page audit, so they run without the passes.
    const partial = check === "21" ? `${byCheck[check] ? `${byCheck[check]} failing` : "pass"} on sticky and fixed elements; the motion passes ` : "";
    console.log(`  [${check}] ${name}: ${partial}skipped (--no-motion)`);
    continue;
  }
  const ran = check === "33" ? (calcRoutes.size ? "" : " (no route has a calculator)") : check === "41" ? (clipRoutes.size ? "" : " (no route has hover clips)") : "";
  if (check === "45" && !opts.routes.includes("/")) {
    console.log(`  [${check}] ${name}: not run (/ is not among the routes)`);
    continue;
  }
  console.log(`  [${check}] ${name}: ${byCheck[check] ? `${byCheck[check]} failing` : `pass${ran}`}`);
}
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
