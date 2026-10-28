// check:layout: the layout checks of the 20 October 2026 system (CLAUDE.md "Layout" and "Shape": refresh.tech's
// page templates in Lienry's own words, fonts, colours and media), run in Playwright against a served build at
// 1440x900 and 390x844 by default, and at 1024x768 and 768x1024 with --widths 1440,1024,768,390.
//
// Usage: npm run check:layout -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json] [--no-sweep]
//          [--inject mutation.js]
//   e.g. npm run build && npm run start, then npm run check:layout -- http://localhost:3000
//
// Routes: the eleven pages, plus /this-page-does-not-exist, which must answer 404 (check 43).
//
// Every page is judged as a visitor in a session that has already seen the first-visit intro sees it
// (CLAUDE.md "Intro": its session key is seeded before the page's own scripts run), so the intro's
// overlay never shows here; check:rules' check 45 judges the intro itself.
//
//  2  Dead space. For every block in <main> except the film bands and the composed heroes (below), the
//     visible content boxes inside the block's content box (padding excluded) are projected onto the page's
//     vertical axis: no horizontal stripe taller than the limit may hold none (112px from 1024, 88px below:
//     the reference's 100px / 80px feature-row rhythm plus slack). A band filled by a full-bleed panel
//     (check 4's surface is the panel's) is measured inside the panel's content box against the panel's
//     colour. Content boxes are the lines of text (Range.getClientRects); img, video, canvas, svg, button,
//     input, select, textarea and hr; controls by their box, as a button is (a [data-button] or
//     [data-icon-button] rendered as a link, and a link laid out as a box 64px tall at most, so a tertiary
//     link's 44px target is content, not empty paper; a taller link is a container and is measured by what
//     it holds); elements with a background other than the band's or a border on all four sides; and the
//     rules drawn by top and bottom borders. A blurred glow (a blur() filter) is light, not content, and so
//     is a box at a negative z-index buried under the band's own background. Among siblings marked
//     [data-col] that sit side by side, no column's content may end more than the limit above the lowest
//     of them; unmarked side-by-side columns that end further apart are a warning.
//     Sub-pixel layout adds up to 1px of noise, so a run or a column fails above limit + 1. Every block is
//     measured again with each tab selected, each h3 disclosure open and each member of a [data-sweep]
//     group active. A film band is one a video or picture covers (90% of it or more); a composed hero is a
//     [data-scatter] band holding 3 or more absolutely placed pictures, and [data-scatter] on a band without
//     them fails ("skip: scatter hero" is earned, not declared). The page is measured once every Reveal has
//     hydrated and risen in; a reveal still hidden after that is a warning (rerun the route alone).
//  3  Band heights. At 1440 a band taller than twice the viewport is a warning, unless it holds the h1
//     or the software window. A band's height never changes when one of its tabs or parts is selected
//     (sweep kinds "tab" and "part", spread 1px at most); the kind is the group's [data-sweep] value, or
//     "part" / "beat" from a part- / story- id. A "form" group (the enquiry tabs choose the form's fields),
//     beats and disclosures may change it; they are still swept for check 2. A [data-sweep] value is one of
//     tab, part, beat, disclosure, form, and a "form" group sits in a band that holds a <form>.
//  4  Tones. (a) Every band has a data-tone, and it is plaster, paper, tint, mist, ink, night or film; raised
//     and sunken are retired surface names. data-tone="film" holds a film or picture covering 90% of the
//     band (else it fails, and the band is measured like any other). (b) A band's surface is composited
//     bottom to top on what shows through from behind it (alpha and opacity included): its own background
//     colour, its gradients, its ::before, then each box covering 90% of it or more (98% over a band that
//     paints its own background: a layer laid over all of it) with that box's ::before and ::after, in
//     document order, then its ::after. A blurred glow is not a surface. (c) Light tones (plaster, paper,
//     tint, mist) render a light surface, relative luminance 0.8 or more at every colour stop (white, warm
//     paper, the pale accent tint); dark tones (ink, night) a near-black one, 0.02 or less at every stop. A
//     composed hero's gradient wash is judged by its first stop: under 0.4 for a dark tone (the /company
//     wash starts at the accent), 0.8 or more for a light one. A film band is not judged.
//     (d) The footer's data-tone is ink or night and it renders near-black (0.02 or less), by the same model.
// 19  Overflow. Nothing runs past the viewport's edge, with the phone menu open and closed. The page
//     clips overflow-x on <html> and <body>, which hides overflow from documentElement.scrollWidth, so
//     body.scrollWidth and the elements past the edge are checked as well.
// 30  Section padding (Band.tsx's pads). (a) data-pad, when present, is section, hero, split, attached,
//     compact, feature, tabs or none; a band without one is none. (b) A named pad's computed padding is,
//     within 0.5px, with S = --section-y (96 from 1024, 80 from 768, 64 below), H = --hero-gap (80, 64, 56)
//     and the 56px bar: section S/S; hero 56+H/S; attached 0/S; split 56+H/S, 80/56 from 1024; compact
//     64/64, 70/70 from 1024; feature 64/64, 88/88 from 1024; tabs 56/56, 61/61 from 1024. "none" sets its
//     own measured padding and is not compared to a pad. (c) At scroll 0 the page's h1 starts at least
//     --nav-h + 16 (72 with the 56px bar; never less) below the top of the page, on every route, the film
//     hero's included. (d) A "none" band's padding is at most S plus check 2's limit at each edge (padding
//     check 2 does not measure), plus the bar on the top of the page's first band; film bands and composed
//     heroes are exempt. The note counts the pads compared and the none bands bounded on each route.
// 32  Rail containment (1440 and 1024; below 768). The rail is the first .max-w-grid in <main> outside the
//     exempt bands (left L, width W). Every .eyebrow, h1, h2 and band-level p (by its content box: padding
//     holds no text), figure frame and first [data-button] of an action row, and the outermost li, [data-card],
//     [data-accordion], [data-calculator], form and [data-form-success] (by its own box; nothing inside one
//     is measured) lies within L-1 to L+W+1. Below 768 the same edges lie within the 20px page margins (19 to
//     viewport - 19). An in-flow centred h1 or h2 (computed text-align center) outside li and [data-card] is
//     centred where the flow places it, within 1px, and so is each box above it that centres it (centred
//     text, or a flex column centring its items), up to its band: a centred head block held to one side
//     fails. Where the flow places a box is its containing block's content box when that is a block
//     container, a flex column, a flex row holding only that box, or a one-column grid; a grid cell or a
//     shared flex row gives it an area of its own, so it is not judged there. Exempt: film bands, composed
//     heroes, [data-ui], full-bleed media (a figure frame 98% of the viewport wide or more) and anything in a
//     track: a box that scrolls on x, or clips x with in-flow content wider than itself (a marquee row, a
//     carousel). A band, a rail, or a box holding a rail, an h1 or an h2 is never a track, so a band that
//     clips cannot hide its own content sliding off the page. Not measured from 768 to 1023.
// 43  The unknown route answers 404 with the header and the footer, and checks 2, 4, 19 and 30 pass on it.
//
// Markers: every block in <main> must be a Band (data-band, data-tone) or a film band
// (data-tone="film"), or the checks cannot see it; check 4 then needs its data-tone.
//
// Retired 20 Oct 2026:
//  4   plaster/ink alternation: retired 20 Oct 2026: the reference runs white, paper and tint bands back to back.
//  4   the glass-deep panel ban: retired 20 Oct 2026: CLAUDE.md allows accent panels (the closing panel is teal).
//  4   exact token matching: retired 20 Oct 2026: bands paint measured colours (#141a1c, #0f0d0e, washes).
//  30  the footer's padding-top S: retired 20 Oct 2026: the footer follows the reference's measured spacing.
//  30  "none fails on a non-film band": retired 20 Oct 2026: pad="none" bands set the reference's own padding
//      (bounded by 30 (d)).
//  31a computed spacing: retired 20 Oct 2026: the reference's measured spacing is not on an 8px scale.
//  32  column starts and ends: retired 20 Oct 2026: centred heads and the reference's offsets sit off columns.
//
// --inject <file.js> adds the file's source to every page after the page library (addInitScript), so a
// self-test can break a rule on purpose and see the check fail.
//
// Playwright is resolved from this project's node_modules, then from a global install. Exit code: 0 when
// every check passes, 1 when any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const NOT_FOUND = "/this-page-does-not-exist";
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", "/fit-check", "/calculator", NOT_FOUND];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  768: { width: 768, height: 1024, mobile: true },
  390: { width: 390, height: 844, mobile: true },
};
const viewportFor = (w) => VIEWPORTS[w] ?? { width: w, height: w < 800 ? 844 : 900, mobile: w < 800 };
// The largest empty run inside a block, and the most a column may end short of its neighbour: the
// reference's feature rows run 100px apart from 1024 and 80px below, plus slack.
const limitFor = (w) => (w >= 1024 ? 112 : 88);
// Band.tsx's pads at each width (globals.css: --nav-h, --section-y, --hero-gap).
const NAV_H = 56;
const sectionY = (w) => (w >= 1024 ? 96 : w >= 768 ? 80 : 64);
const heroGap = (w) => (w >= 1024 ? 80 : w >= 768 ? 64 : 56);
const PADS = ["section", "hero", "split", "attached", "compact", "feature", "tabs", "none"];
// [top, bottom] and how each is made, for a named pad at a width.
const padFor = (pad, w) => {
  const S = sectionY(w);
  const H = heroGap(w);
  const lg = w >= 1024;
  return {
    section: [S, S, "S / S"],
    hero: [NAV_H + H, S, "56 + H / S"],
    attached: [0, S, "0 / S"],
    split: lg ? [NAV_H + 24, 56, "56 + 24 / 56 from 1024"] : [NAV_H + H, S, "56 + H / S below 1024"],
    compact: lg ? [70, 70, "70 / 70 from 1024"] : [64, 64, "64 / 64 below 1024"],
    feature: lg ? [88, 88, "88 / 88 from 1024"] : [64, 64, "64 / 64 below 1024"],
    tabs: lg ? [61, 61, "61 / 61 from 1024"] : [56, 56, "56 / 56 below 1024"],
  }[pad];
};
// The page margin below 768 (globals.css --page-margin).
const PAGE_MARGIN = 20;
// The coded demos: [data-ui], and the legacy selectors the window and app panel carry until it lands.
const UI_SEL = "[data-ui], [data-software-preview], [role='group'][aria-label$='demo window'], [role='group'][aria-label$='demo data']";
const CHECK_NAMES = {
  markers: "markers (every block in <main> is a Band or a film band)",
  2: "2 dead space and column balance",
  3: "3 band heights",
  4: "4 tones",
  19: "19 horizontal overflow",
  30: "30 section padding",
  32: "32 rail containment",
  43: "43 the unknown route",
  page: "page errors",
};

function usage() {
  console.log(`Usage: node scripts/check-layout.mjs <baseUrl> [route ...] [options]

Runs the layout checks (markers, 2, 3, 4, 19, 30, 32, 43) of the 20 October 2026 system against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all eleven and ${NOT_FOUND})
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default; 1024x768 and 768x1024 also known)
  --json <file>      also write the full report as JSON
  --no-sweep         skip the tab and disclosure state sweeps
  --inject <file.js> add the file's source to every page after the page library (context.addInitScript),
                     to break a rule on purpose and prove the check fails`);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null, sweep: true, inject: null };
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
    else if (a.startsWith("--inject")) opts.inject = value();
    else if (a === "--no-sweep") opts.sweep = false;
    else if (a.startsWith("--")) fail(`Unknown option ${a}.`, true);
    else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}: pass a base URL (http://...) and routes starting with /.`, true);
  }
  for (const w of opts.widths) if (!Number.isFinite(w) || w < 200) fail(`Bad width ${w}.`);
  if (!opts.routes.length) opts.routes = ROUTES;
  if (opts.inject) {
    try {
      opts.injectSource = readFileSync(opts.inject, "utf8");
    } catch (err) {
      fail(`Cannot read --inject ${opts.inject}: ${err.message}`);
    }
  }
  return opts;
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
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

// ---------------------------------------------------------------------------------------------------
// In-page library, installed on every document with addInitScript. Everything it needs is inside it.
// ---------------------------------------------------------------------------------------------------
function pageLib(cfg) {
  const P = (window.__p7layout = {});
  const UI_SEL = cfg.uiSel;
  const num = (v) => parseFloat(v) || 0;
  const px = (v) => Math.round(v);

  // Any CSS colour (rgb, oklab, color-mix results) to [r, g, b, a] through a 1px canvas.
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
  const alphaOf = (colour) => rgba(colour)[3];
  const same = (a, b) => {
    const x = rgba(a);
    const y = rgba(b);
    return Math.abs(x[0] - y[0]) <= 2 && Math.abs(x[1] - y[1]) <= 2 && Math.abs(x[2] - y[2]) <= 2 && Math.abs(x[3] - y[3]) <= 0.02;
  };

  // Source-over: [r, g, b, a] `top` painted on `bottom`.
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a <= 0) return [0, 0, 0, 0];
    const mix = (i) => Math.round((top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a);
    return [mix(0), mix(1), mix(2), a];
  };
  const textOf = ([r, g, b, a]) => (a < 0.995 ? `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})` : `rgb(${r}, ${g}, ${b})`);
  // What shows through from behind an element: its ancestors' background colours composited on the
  // white canvas, from the nearest opaque one down.
  const backdrop = (el) => {
    const chain = [];
    for (let e = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) chain.push(c);
      if (c[3] >= 0.995) break;
    }
    return chain.reverse().reduce((b, c) => over(c, b), [255, 255, 255, 1]);
  };

  const clean = (s, n = 60) => {
    const t = (s || "").replace(/\s+/g, " ").trim();
    return t.length > n ? `${t.slice(0, n - 1)}…` : t;
  };
  const mediaId = (el) => {
    const src = el.currentSrc || el.getAttribute("src") || el.getAttribute("poster") || el.querySelector?.("source")?.getAttribute("src") || "";
    return (src.match(/\/media\/([a-z0-9]+(?:-[a-z0-9]+)*?)(?:--[a-z0-9]+)?(?:-\d+)?(?:-poster)?\.(?:avif|webp|jpe?g|png|mp4|webm)/) || [])[1] || null;
  };
  P.describe = (el) => {
    if (!el) return "";
    if (el.nodeType === 3) return `"${clean(el.textContent, 50)}"`;
    const tag = el.tagName.toLowerCase();
    // A box without text of its own is named by the media or control inside it.
    const inner = mediaId(el) ? el : el.querySelector("img, video, canvas, [role='img'], [role='group']");
    const id = inner ? mediaId(inner) : null;
    const name = el.getAttribute("aria-label") || el.getAttribute("alt") || inner?.getAttribute("aria-label") || "";
    const text = clean(name || el.textContent, 50);
    const what = inner && inner !== el ? `<${tag}> holding <${inner.tagName.toLowerCase()}>` : `<${tag}>`;
    return `${what}${id ? ` ${id}` : ""}${text ? ` "${text}"` : ""}`;
  };
  P.describeBox = (b) => (b.rule ? `the ${b.rule} rule of ${P.describe(b.what)}` : P.describe(b.what));

  // Rendered: has a box (display:contents defers to its nearest boxed ancestor), is visibility:visible,
  // and its opacity down from `root` has not multiplied away to nothing (inactive crossfade layers).
  const shown = (el, root) => {
    let boxed = el;
    while (boxed && getComputedStyle(boxed).display === "contents") boxed = boxed.parentElement;
    if (!boxed || boxed.getClientRects().length === 0) return false;
    if (getComputedStyle(el).visibility !== "visible") return false;
    let o = 1;
    for (let e = el; e; e = e.parentElement) {
      o *= num(getComputedStyle(e).opacity);
      if (o < 0.05) return false;
      if (e === root) break;
    }
    return true;
  };
  P.shown = shown;
  // Under a blur() filter, from `el` up to (not including) `root`: a glow.
  const glow = (el, root) => {
    for (let e = el; e && e !== root; e = e.parentElement) if (/blur\(/.test(getComputedStyle(e).filter)) return true;
    return false;
  };

  // Clip a rectangle by every ancestor (from `from` up to and including `root`) that clips overflow.
  // A rule is 1px tall, so its minimum height is lower than a box's.
  const clip = (rect, from, root, minHeight = 2) => {
    let { top, bottom, left, right } = rect;
    for (let e = from; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (/inset\(50%/.test(cs.clipPath)) return null; // the visually hidden pattern
      if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
        const r = e.getBoundingClientRect();
        if (cs.overflowX !== "visible") {
          left = Math.max(left, r.left);
          right = Math.min(right, r.right);
        }
        if (cs.overflowY !== "visible") {
          top = Math.max(top, r.top);
          bottom = Math.min(bottom, r.bottom);
        }
      }
      if (e === root || cs.position === "fixed") break;
    }
    if (right - left < 2 || bottom - top < minHeight) return null;
    return { top: top + scrollY, bottom: bottom + scrollY, left, right };
  };

  const REPLACED = new Set(["img", "video", "canvas", "svg", "button", "input", "select", "textarea", "hr", "iframe", "progress", "meter"]);
  const borderSide = (cs, side) => {
    const w = num(cs[`border${side}Width`]);
    const style = cs[`border${side}Style`];
    return { w, visible: w >= 0.5 && style !== "none" && style !== "hidden" && alphaOf(cs[`border${side}Color`]) > 0.05 };
  };

  // Every visible content box inside `root`, in page coordinates. `rank` orders what describes a gap's
  // edge best when several boxes start or end together: text, then media and controls, then filled or
  // framed boxes, then rules.
  //
  // Text: Range.getClientRects gives each line's glyph area, which sits inside its line box by half the
  // leading. Each rect is grown (or, for tight headings, shrunk) to its line box, so a 48px margin under
  // a paragraph measures 48px, as the spacing table in B3 means it.
  P.boxes = (root, bandBg) => {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest("svg, script, style, template, noscript") || !shown(el, root)) continue;
      const lh = parseFloat(getComputedStyle(el).lineHeight);
      range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        // Chromium floors the leading above the glyphs and gives the remainder to the leading below.
        const leading = Number.isFinite(lh) ? lh - r.height : 0;
        const above = Math.floor(leading / 2);
        const c = clip({ top: r.top - above, bottom: r.bottom + (leading - above), left: r.left, right: r.right }, el, root);
        if (c) out.push({ ...c, what: n, rank: 0 });
      }
    }
    // Not content: a blurred glow (CLAUDE.md: soft accent glows behind heroes and panels) is light, and a
    // box at a negative z-index under a root that paints its own background (with no stacking context
    // between) is buried under that background.
    const rootCs = getComputedStyle(root);
    const rootPaints = alphaOf(rootCs.backgroundColor) > 0.02 || rootCs.backgroundImage !== "none";
    const buried = (el) => {
      if (!rootPaints) return false;
      for (let e = el.parentElement; e; e = e.parentElement) {
        if (stackingContext(getComputedStyle(e))) return false;
        if (e === root) return true;
      }
      return false;
    };
    const notContent = [];
    for (const el of root.querySelectorAll("*")) {
      const tag = el.tagName.toLowerCase();
      if (el.closest("svg") && tag !== "svg") continue;
      if (notContent.some((g) => g.contains(el))) continue;
      const cs = getComputedStyle(el);
      if (/blur\(/.test(cs.filter) || (cs.position !== "static" && num(cs.zIndex) < 0 && buried(el))) {
        notContent.push(el);
        continue;
      }
      // A control is measured by its box, as a <button> is: a Button or IconButton rendered as a link,
      // and a link laid out as a control-sized box (a 44px tertiary target, a list link). Its target is
      // content. A taller link is a container (a whole card) and is measured by what it holds.
      const control =
        el.matches("[data-button], [data-icon-button]") ||
        (tag === "a" && el.hasAttribute("href") && !/^(inline|contents|none)$/.test(cs.display) && el.getBoundingClientRect().height <= 64);
      let whole = REPLACED.has(tag) || control;
      if (!whole) {
        const bg = cs.backgroundColor;
        if ((alphaOf(bg) > 0.02 && !same(bg, bandBg)) || (cs.backgroundImage && cs.backgroundImage !== "none")) whole = true;
      }
      const sides = { Top: borderSide(cs, "Top"), Right: borderSide(cs, "Right"), Bottom: borderSide(cs, "Bottom"), Left: borderSide(cs, "Left") };
      if (!whole && sides.Top.visible && sides.Right.visible && sides.Bottom.visible && sides.Left.visible) whole = true;
      if (!whole && !sides.Top.visible && !sides.Bottom.visible) continue;
      if (!shown(el, root)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (whole) {
        const c = clip(r, el.parentElement, root);
        if (c) out.push({ ...c, what: el, rank: REPLACED.has(tag) || control ? 1 : 2 });
        continue;
      }
      // A rule drawn by a top or bottom border: the line itself is content, not the box under it.
      for (const side of ["Top", "Bottom"]) {
        if (!sides[side].visible) continue;
        const w = Math.max(sides[side].w, 1);
        const y = side === "Top" ? r.top : r.bottom - w;
        const c = clip({ top: y, bottom: y + w, left: r.left, right: r.right }, el.parentElement, root, 0.5);
        if (c) out.push({ ...c, what: el, rule: side.toLowerCase(), rank: 3 });
      }
    }
    return out;
  };

  const contentBox = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      top: r.top + scrollY + num(cs.borderTopWidth) + num(cs.paddingTop),
      bottom: r.bottom + scrollY - num(cs.borderBottomWidth) - num(cs.paddingBottom),
      left: r.left + num(cs.borderLeftWidth) + num(cs.paddingLeft),
      right: r.right - num(cs.borderRightWidth) - num(cs.paddingRight),
    };
  };

  // The empty horizontal stripes of an element's content box.
  const gaps = (el, bandBg, limit) => {
    const box = contentBox(el);
    const boxes = P.boxes(el, bandBg)
      .map((b) => ({ ...b, top: Math.max(b.top, box.top), bottom: Math.min(b.bottom, box.bottom) }))
      .filter((b) => b.bottom - b.top > 0.2);
    boxes.sort((a, b) => a.top - b.top);
    const runs = [];
    for (const b of boxes) {
      const last = runs[runs.length - 1];
      if (last && b.top <= last.bottom + 0.5) {
        last.bottom = Math.max(last.bottom, b.bottom);
        last.boxes.push(b);
      } else runs.push({ top: b.top, bottom: b.bottom, boxes: [b] });
    }
    // The edges of a run are named by the best-ranked box within 2px of them.
    const pick = (list) => list.reduce((best, b) => (b.rank < best.rank ? b : best), list[0]);
    for (const run of runs) {
      run.firstBox = pick(run.boxes.filter((b) => b.top - run.top <= 2));
      run.lastBox = pick(run.boxes.filter((b) => run.bottom - b.bottom <= 2));
    }
    const out = [];
    let largest = 0;
    const note = (top, bottom, above, below) => {
      const size = bottom - top;
      largest = Math.max(largest, size);
      if (size > limit + 1) out.push({ size: px(size), from: px(top - box.top), to: px(bottom - box.top), above: above ? P.describeBox(above) : null, below: below ? P.describeBox(below) : null });
    };
    if (!runs.length) return { empty: true, largest: px(box.bottom - box.top), gaps: [], contentHeight: px(box.bottom - box.top) };
    note(box.top, runs[0].top, null, runs[0].firstBox);
    for (let i = 1; i < runs.length; i++) note(runs[i - 1].bottom, runs[i].top, runs[i - 1].lastBox, runs[i].firstBox);
    note(runs[runs.length - 1].bottom, box.bottom, runs[runs.length - 1].lastBox, null);
    return { empty: false, largest: px(largest), gaps: out, contentHeight: px(box.bottom - box.top) };
  };

  // Side-by-side [data-col] siblings: each must end within `limit` of the lowest of them.
  const columns = (band, bandBg, limit) => {
    const groups = new Map();
    for (const col of band.querySelectorAll("[data-col]")) {
      if (col.getClientRects().length === 0 || !shown(col, band)) continue;
      const r = col.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (!groups.has(col.parentElement)) groups.set(col.parentElement, []);
      groups.get(col.parentElement).push(col);
    }
    const out = [];
    let checked = 0;
    for (const cols of groups.values()) {
      if (cols.length < 2) continue;
      const info = cols.map((col, i) => {
        const r = col.getBoundingClientRect();
        const boxes = P.boxes(col, bandBg);
        const bottom = boxes.length ? Math.max(...boxes.map((b) => b.bottom)) : r.top + scrollY;
        const heading = col.querySelector("h1, h2, h3");
        const first = heading || [...col.querySelectorAll("p, li, dt, img, figure, button, a")].find((e) => shown(e, band));
        return { i, n: cols.length, r, bottom, name: first ? P.describe(first) : `<${col.tagName.toLowerCase()}>` };
      });
      for (const a of info) {
        const beside = info.filter((b) => b !== a && Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left) <= 1 && Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > 0);
        if (!beside.length) continue;
        checked++;
        const lowest = beside.reduce((m, b) => (b.bottom > m.bottom ? b : m), beside[0]);
        const short = lowest.bottom - a.bottom;
        if (short > limit + 1) out.push({ column: a.i + 1, of: a.n, name: a.name, short: px(short), sibling: lowest.i + 1, siblingName: lowest.name });
      }
    }
    return { checked, failures: out };
  };

  // Unmarked columns: a grid or flex row of two or three blocks side by side, none marked data-col,
  // whose contents end far apart. Reported as a warning: it is how an unmarked component escapes check 2.
  const unmarkedColumns = (band, bandBg, limit) => {
    if (innerWidth < 1024) return [];
    const out = [];
    for (const parent of band.querySelectorAll("*")) {
      const cs = getComputedStyle(parent);
      if (!/grid|flex/.test(cs.display)) continue;
      const kids = [...parent.children].filter((k) => shown(k, band) && k.getBoundingClientRect().height > 0);
      if (kids.length < 2 || kids.length > 3 || kids.some((k) => k.hasAttribute("data-col"))) continue;
      // The FAQ's head and list (B17) are unmarked by design: the list runs long beside a short head.
      if (kids.some((k) => k.matches("[data-accordion]") || k.querySelector("[data-accordion]"))) continue;
      if (parent.closest("[data-col]") && parent.closest("[data-col]") !== parent) continue;
      const pr = parent.getBoundingClientRect();
      if (pr.height < 150) continue;
      const rects = kids.map((k) => k.getBoundingClientRect());
      if (rects.some((r) => r.width < pr.width * 0.25)) continue;
      let sideBySide = true;
      for (let i = 1; i < rects.length; i++) {
        if (Math.min(rects[i].right, rects[i - 1].right) - Math.max(rects[i].left, rects[i - 1].left) > 1) sideBySide = false;
        if (Math.min(rects[i].bottom, rects[i - 1].bottom) - Math.max(rects[i].top, rects[i - 1].top) <= 0) sideBySide = false;
      }
      if (!sideBySide) continue;
      const ends = kids.map((k) => {
        const b = P.boxes(k, bandBg);
        return b.length ? Math.max(...b.map((x) => x.bottom)) : null;
      });
      if (ends.some((e) => e === null)) continue;
      const spread = Math.max(...ends) - Math.min(...ends);
      const shortest = kids[ends.indexOf(Math.min(...ends))];
      // A column centred on its neighbour on purpose (the split hero's text) is not a balance problem.
      const self = getComputedStyle(shortest).alignSelf;
      const centred = self === "center" || ((self === "auto" || self === "normal") && cs.alignItems === "center");
      if (spread > limit + 1 && !centred) {
        const heading = shortest.querySelector("h1, h2, h3, p, li");
        out.push({ spread: px(spread), name: P.describe(heading || shortest) });
      }
      if (out.length >= 2) break;
    }
    return out;
  };

  const labelOf = (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("[aria-hidden='true']").forEach((n) => n.remove());
    return clean(el.getAttribute("aria-label") || copy.textContent, 40);
  };
  const boxedVisible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === "visible";

  // The switchable states of a band: [data-sweep] groups (their value is the kind), tab groups and h3
  // disclosure groups. A control belongs to the first group that claims it.
  const initialOf = (els) => Math.max(0, els.findIndex((e) => e.getAttribute("aria-selected") === "true" || e.getAttribute("aria-expanded") === "true"));
  const sweepKind = (el, fallback) => el.closest("[data-sweep]")?.dataset.sweep || fallback;
  const controlsOf = (band) => {
    const groups = [];
    const claimed = new Set();
    const take = (els) => {
      els.forEach((e) => claimed.add(e));
      return els;
    };
    for (const box of band.querySelectorAll("[data-sweep]")) {
      const els = [...box.querySelectorAll('[role="tab"], button[aria-expanded][aria-controls]')].filter((e) => !claimed.has(e) && boxedVisible(e));
      if (els.length >= 2) groups.push({ kind: box.dataset.sweep || "disclosure", els: take(els), initial: initialOf(els) });
    }
    for (const list of band.querySelectorAll('[role="tablist"]')) {
      const tabs = [...list.querySelectorAll('[role="tab"]')].filter((t) => !claimed.has(t) && boxedVisible(t));
      if (tabs.length >= 2) groups.push({ kind: sweepKind(list, "tab"), els: take(tabs), initial: initialOf(tabs) });
    }
    const disclosures = [...band.querySelectorAll("h3 button[aria-expanded][aria-controls]")].filter((b) => !claimed.has(b) && boxedVisible(b));
    if (disclosures.length >= 2) {
      const id = disclosures[0].id || "";
      const kind = sweepKind(disclosures[0], id.startsWith("part-") ? "part" : id.startsWith("story-") ? "beat" : "disclosure");
      groups.push({ kind, els: take(disclosures), initial: initialOf(disclosures) });
    }
    return groups;
  };

  // A film band is one a film or picture fills: a video or img from the media set covering 90% of it.
  // data-tone="film" claims it; only this evidence earns the film skips (check 4 fails a bare claim).
  const isFilm = (el) => {
    const r = el.getBoundingClientRect();
    if (r.height <= 200) return false;
    for (const m of el.querySelectorAll("video, img")) {
      if (!mediaId(m)) continue;
      const mr = m.getBoundingClientRect();
      if (mr.width >= r.width * 0.9 && mr.height >= r.height * 0.9) return true;
    }
    return false;
  };
  // A composed hero (the /company bubble hero): its text sits in a scatter of pictures, not in rows.
  // data-scatter claims it; it is one when it holds SCATTER_MIN pictures placed absolutely (check 2
  // fails a bare claim and measures the band).
  const SCATTER_MIN = 3;
  const scatterPictures = (el) =>
    [...el.querySelectorAll("img, video")].filter((m) => {
      if (!m.getClientRects().length) return false;
      for (let e = m; e && e !== el; e = e.parentElement) if (/^(absolute|fixed)$/.test(getComputedStyle(e).position)) return true;
      return false;
    }).length;
  const isScatter = (el) => el.hasAttribute("data-scatter") && scatterPictures(el) >= SCATTER_MIN;
  const windowSelector = "[data-software-preview], [role='group'][aria-label$='demo window']";

  P.discover = () => {
    const main = document.querySelector("main");
    const items = [];
    const wrappers = [];
    const skip = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "LINK", "META"]);
    const walk = (parent) => {
      for (const el of parent.children) {
        if (skip.has(el.tagName)) continue;
        if (el.hasAttribute("data-band") || el.hasAttribute("data-tone")) {
          items.push({ el, marked: true });
          continue;
        }
        if (el.querySelector("[data-band], [data-tone]")) {
          wrappers.push(el);
          walk(el);
          continue;
        }
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        items.push({ el, marked: false });
      }
    };
    if (main) walk(main);
    const footer = document.querySelector("body > footer") || [...document.querySelectorAll("footer")].find((f) => !f.closest("main"));
    P.state = { main, items, wrappers, footer, controls: items.map((it) => controlsOf(it.el)) };
    return P.state;
  };

  // Relative luminance of an opaque [r, g, b, a], 0 to 1 (WCAG): what makes a surface light or dark.
  const luminance = ([r, g, b]) => {
    const lin = (c) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };

  // Check 4: the surface a band (or the footer) renders, composited bottom to top on what shows through
  // from behind it: the band's own background colour, then its gradients, then its ::before, then every
  // box covering 90% of it or more (clipped by the boxes between) with that box's ::before and ::after, in
  // document order, then its ::after. Alpha and opacity are composited, so a half-transparent near-black
  // over white renders grey. A box with a negative z-index under a band that is no stacking context paints
  // below the band's own background. A blurred glow is light, not a surface. A gradient layer keeps every
  // stop; `first` is its first stop over what lies below it.
  const STOPS = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;
  const stackingContext = (cs) =>
    cs.isolation === "isolate" || (cs.position !== "static" && cs.zIndex !== "auto") || num(cs.opacity) < 1 || cs.transform !== "none" || cs.filter !== "none" || cs.mixBlendMode !== "normal";
  const opacityTo = (node, el) => {
    let o = 1;
    for (let e = node; e; e = e.parentElement) {
      o *= num(getComputedStyle(e).opacity);
      if (e === el) break;
    }
    return o;
  };
  const surfaceOf = (el) => {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    let stack = [backdrop(el.parentElement)];
    let top = { what: "the background behind it (it paints nothing)", gradient: false, first: stack[0], node: null, cover: null };
    const paint = (cs, whose, node, alpha, cover = null) => {
      const layers = [];
      if (alphaOf(cs.backgroundColor) > 0.02) layers.push({ stops: [cs.backgroundColor], gradient: false });
      if (/gradient\(/.test(cs.backgroundImage)) {
        const stops = cs.backgroundImage.match(STOPS) || [];
        if (stops.length) layers.push({ stops, gradient: true });
      }
      for (const layer of layers) {
        const paintOver = (s, b) => {
          const c = rgba(s);
          return over([c[0], c[1], c[2], c[3] * alpha], b);
        };
        const first = paintOver(layer.stops[0], stack[0]);
        const next = [];
        for (const s of layer.stops) for (const b of stack) {
          const c = paintOver(s, b);
          if (!next.some((n) => same(textOf(n), textOf(c)))) next.push(c);
        }
        // A box that paints what is already there changes nothing (the band stays the surface's owner).
        if (node !== el && next.length === stack.length && next.every((c, i) => same(textOf(c), textOf(stack[i])))) continue;
        stack = next.slice(0, 24);
        top = { what: `${whose} ${layer.gradient ? "gradient" : "background colour"}`, gradient: layer.gradient, first, node, cover };
      }
    };
    // Over a band that paints its own background, a layer counts only when it is laid over all of it (98%
    // or more: it hides that background); over a transparent band, from 90% (a full-bleed panel).
    const cs = getComputedStyle(el);
    const ownPaint = alphaOf(cs.backgroundColor) > 0.02 || /gradient\(/.test(cs.backgroundImage);
    const least = ownPaint ? 0.98 : 0.9;
    // A ::before or ::after whose box covers `least` of the band.
    const pseudo = (node, which, whose, alpha) => {
      const p = getComputedStyle(node, which);
      if (p.content === "none" || p.content === "normal" || p.display === "none" || p.visibility !== "visible" || /blur\(/.test(p.filter)) return;
      const w = Math.min(num(p.width), r.width);
      const h = Math.min(num(p.height), r.height);
      if (area <= 0 || (w * h) / area < least) return;
      paint(p, `${whose} ${which}'s`, null, alpha * num(p.opacity), Math.round(((w * h) / area) * 100));
    };
    const covering = [];
    if (area > 0) {
      for (const d of el.querySelectorAll("*")) {
        if (d.closest("svg") || glow(d, el) || !shown(d, el)) continue;
        const c = clip(d.getBoundingClientRect(), d.parentElement, el);
        if (!c) continue;
        const w = Math.min(c.right, r.right) - Math.max(c.left, r.left);
        const h = Math.min(c.bottom - scrollY, r.bottom) - Math.max(c.top - scrollY, r.top);
        if (w <= 0 || h <= 0 || (w * h) / area < least) continue;
        const dcs = getComputedStyle(d);
        covering.push({ d, cs: dcs, cover: Math.round(((w * h) / area) * 100), below: dcs.position !== "static" && num(dcs.zIndex) < 0 });
      }
    }
    const own = opacityTo(el, el);
    const lay = (list) => {
      for (const { d, cs: dcs, cover } of list) {
        const alpha = opacityTo(d, el);
        const whose = `the full-bleed <${d.tagName.toLowerCase()}>'s`;
        paint(dcs, whose, d, alpha, cover);
        pseudo(d, "::before", `the full-bleed <${d.tagName.toLowerCase()}>`, alpha);
        pseudo(d, "::after", `the full-bleed <${d.tagName.toLowerCase()}>`, alpha);
      }
    };
    const context = stackingContext(cs);
    if (!context) lay(covering.filter((c) => c.below));
    paint(cs, "its", el, own);
    pseudo(el, "::before", "its", own);
    lay(context ? covering : covering.filter((c) => !c.below));
    pseudo(el, "::after", "its", own);
    const shownColour = top.gradient ? top.first : stack[0];
    const lums = stack.map(luminance);
    // Check 2 measures the band through its surface: a full-bleed panel laid out in the flow is measured
    // by its own content box, against its own colour.
    const inFlow = top.node && top.node !== el && !/^(absolute|fixed)$/.test(getComputedStyle(top.node).position);
    return {
      info: {
        colour: textOf(shownColour),
        stops: top.gradient ? stack.map(textOf) : null,
        gradient: top.gradient,
        what: top.what,
        cover: top.cover,
        luminance: luminance(shownColour),
        lightest: Math.max(...lums),
        darkest: Math.min(...lums),
        lightestStop: textOf(stack[lums.indexOf(Math.max(...lums))]),
        darkestStop: textOf(stack[lums.indexOf(Math.min(...lums))]),
      },
      root: inFlow ? top.node : el,
      bg: textOf(stack[0]),
    };
  };

  const blockInfo = (el, index, marked, surfaced = surfaceOf(el)) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const dataTone = el.getAttribute("data-tone");
    const film = isFilm(el);
    const surface = surfaced.info;
    const heading = el.querySelector("h1, h2, h3");
    return {
      index,
      marked,
      tag: el.tagName.toLowerCase(),
      id: el.getAttribute("data-band") || el.id || "",
      dataTone,
      surface,
      tone: dataTone || (film ? "film" : surface.colour),
      film,
      scatter: isScatter(el),
      scatterClaim: el.hasAttribute("data-scatter"),
      scatterPictures: el.hasAttribute("data-scatter") ? scatterPictures(el) : 0,
      hasForm: !!el.querySelector("form"),
      heading: heading ? clean(heading.textContent, 50) : "",
      label: el.getAttribute("aria-label") || "",
      top: px(r.top + scrollY),
      height: px(r.height),
      hasH1: !!el.querySelector("h1"),
      hasWindow: !!el.querySelector(windowSelector),
      pad: el.getAttribute("data-pad"),
      paddingTop: Math.round(num(cs.paddingTop) * 100) / 100,
      paddingBottom: Math.round(num(cs.paddingBottom) * 100) / 100,
      text: clean(el.textContent, 40),
    };
  };

  // One block, measured: dead space, column balance, unmarked columns. A band filled by a full-bleed panel
  // is measured inside the panel's content box, against the panel's colour (the panel is not content).
  P.measure = (index, limit) => {
    const it = P.state.items[index];
    if (!it) return null;
    const el = it.el;
    const surfaced = surfaceOf(el);
    const info = blockInfo(el, index + 1, it.marked, surfaced);
    const hiddenReveals = [...el.querySelectorAll("[data-reveal]")].filter((e) => e.getClientRects().length && num(getComputedStyle(e).opacity) < 0.99).length;
    if (info.film) return { ...info, hiddenReveals, skipped: "film band" };
    if (info.scatter) return { ...info, hiddenReveals, skipped: "scatter hero" };
    const root = surfaced.root;
    const bandBg = surfaced.bg;
    const panel = root !== el ? nameOf(root) : null;
    return { ...info, hiddenReveals, panel, space: gaps(root, bandBg, limit), columns: columns(el, bandBg, limit), unmarkedColumns: unmarkedColumns(el, bandBg, limit) };
  };

  const rendered = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === "visible" && !el.closest("[hidden], .sr-only");

  // Check 30 (c): where the page's h1 starts, against the header bar's height (--nav-h).
  P.hero = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;width:1px;height:var(--nav-h)";
    document.body.appendChild(probe);
    const navH = probe.getBoundingClientRect().height;
    probe.remove();
    const h1 = [...document.querySelectorAll("main h1")].find(rendered);
    if (!h1) return { navH, h1: null };
    const r = h1.getBoundingClientRect();
    return { navH, h1: { top: Math.round((r.top + scrollY) * 10) / 10, what: P.describe(h1), band: (P.state?.items || []).findIndex((it) => it.el.contains(h1)) + 1 } };
  };

  P.audit = (limit) => {
    const st = P.discover();
    const blocks = st.items.map((_, i) => ({ ...P.measure(i, limit), controls: st.controls[i].map((g) => ({ kind: g.kind, labels: g.els.map(labelOf), initial: g.initial })) }));
    const footer = st.footer ? blockInfo(st.footer, 0, true) : null;
    return {
      blocks,
      footer,
      hero: P.hero(),
      wrappers: st.wrappers.map((w) => `<${w.tagName.toLowerCase()}${w.id ? `#${w.id}` : ""}>`),
      pageHeight: document.documentElement.scrollHeight,
      hiddenReveals: blocks.reduce((n, b) => n + (b.hiddenReveals || 0), 0),
    };
  };

  P.activate = (block, group, item) => {
    const g = P.state.controls[block]?.[group];
    const el = g?.els[item];
    if (!el) return false;
    el.click();
    return true;
  };

  // Resolves when no CSS transition or animation is running in the element (or the timeout passes).
  P.idle = (index, timeout) =>
    new Promise((resolve) => {
      const scope = index === null ? document.body : P.state.items[index]?.el || document.body;
      const t0 = performance.now();
      const tick = () => {
        const busy = document.getAnimations().some((a) => a.playState === "running" && a.effect?.target && scope.contains(a.effect.target) && !(a.effect.getTiming?.().iterations === Infinity));
        if (!busy || performance.now() - t0 > timeout) requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
        else setTimeout(tick, 50);
      };
      tick();
    });

  // Overflow: the root, the body (the root clips overflow-x), and the outermost elements past the edge.
  P.overflow = () => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const culprits = [];
    const scrollsOrClips = (el) => {
      for (let e = el.parentElement; e && e !== document.body && e !== de; e = e.parentElement) {
        const ox = getComputedStyle(e).overflowX;
        if (ox !== "visible") return true;
      }
      return false;
    };
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right <= vw + 1 && r.left >= -1) continue;
      if (getComputedStyle(el).position === "fixed" && getComputedStyle(el).visibility === "hidden") continue;
      if (scrollsOrClips(el)) continue;
      if (culprits.some((c) => c.el.contains(el))) continue;
      culprits.push({ el, left: px(r.left), right: px(r.right) });
      if (culprits.length >= 6) break;
    }
    return {
      viewport: vw,
      rootScrollWidth: de.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      culprits: culprits.map((c) => ({ what: P.describe(c.el), left: c.left, right: c.right, band: (P.state?.items || []).findIndex((it) => it.el.contains(c.el)) + 1 })),
    };
  };

  // Check 32: every measured element inside the rail (1440, 1024) or the page margins (below 768), and
  // every centred h1 or h2, and each centred box holding it, centred where the flow places it.
  const COMPONENT = `li, [data-card], [data-accordion], form, [data-form-success], ${UI_SEL}`;
  const r1 = (v) => Math.round(v * 10) / 10;
  const positioned = (el) => /^(absolute|fixed)$/.test(getComputedStyle(el).position);
  // A track: a row longer than its window that slides or scrolls sideways. A box that scrolls on x, or
  // clips x with in-flow content wider than itself (a marquee row, a carousel). A band, a rail
  // (.max-w-grid), or a box holding a rail, an h1 or an h2 is never a track: its content sliding off the
  // page is what this check measures, and a clip would only hide it.
  const trackCache = new Map();
  const isTrack = (el, bandSet) => {
    if (trackCache.has(el)) return trackCache.get(el);
    let track = false;
    const structural = bandSet.has(el) || el.matches(".max-w-grid") || !!el.querySelector(".max-w-grid, h1, h2");
    const ox = getComputedStyle(el).overflowX;
    if (!structural && /(auto|scroll)/.test(ox)) track = true;
    else if (!structural && /(hidden|clip)/.test(ox)) {
      const r = el.getBoundingClientRect();
      let lo = Infinity;
      let hi = -Infinity;
      for (const k of el.children) {
        if (positioned(k) || !k.getClientRects().length) continue;
        const kr = k.getBoundingClientRect();
        if (kr.width < 1) continue;
        lo = Math.min(lo, kr.left);
        hi = Math.max(hi, kr.right);
      }
      track = hi - lo > r.width + 1;
    }
    trackCache.set(el, track);
    return track;
  };
  const inTrack = (el, main, bandSet) => {
    for (let e = el.parentElement; e && e !== main; e = e.parentElement) if (isTrack(e, bandSet)) return true;
    return false;
  };
  // Where the flow places an in-flow box: its containing block's content box, when that block is a block
  // container, a flex column, a flex row holding only this box, or a one-column grid (display: contents
  // and inline boxes defer to theirs). A grid cell or a flex row shared with other items gives the box an
  // area of its own, and a positioned box is placed by its offsets: neither is judged.
  const placedIn = (el) => {
    if (positioned(el)) return null;
    let p = el.parentElement;
    while (p && /^(contents|inline)$/.test(getComputedStyle(p).display)) p = p.parentElement;
    if (!p) return null;
    const cs = getComputedStyle(p);
    if (/flex/.test(cs.display)) {
      if (/column/.test(cs.flexDirection)) return p;
      const inFlow = [...p.children].filter((k) => !positioned(k) && k.getClientRects().length);
      return inFlow.length === 1 ? p : null;
    }
    if (/grid/.test(cs.display)) return cs.gridTemplateColumns.trim().split(/\s+/).length === 1 ? p : null;
    return p;
  };
  // A box that centres what it holds: centred text, or a flex column that centres its items.
  const centring = (el) => {
    const cs = getComputedStyle(el);
    return /center/.test(cs.textAlign) || (/flex/.test(cs.display) && /column/.test(cs.flexDirection) && /center/.test(cs.alignItems));
  };
  const nameOf = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().replace(/\s+/g, " ") : "";
    return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? ` class="${cls.length > 60 ? `${cls.slice(0, 59)}…` : cls}"` : ""}>`;
  };
  P.rail = (mode, margin) => {
    trackCache.clear();
    const main = document.querySelector("main");
    if (!main) return { error: "no <main>" };
    const vw = document.documentElement.clientWidth;
    const bands = P.state?.items || [];
    const bandSet = new Set(bands.map((it) => it.el));
    const exemptBands = bands.filter((it) => isFilm(it.el) || isScatter(it.el)).map((it) => it.el);
    const inExemptBand = (el) => exemptBands.some((b) => b.contains(el));
    const exempt = (el) => inExemptBand(el) || !!el.closest(UI_SEL) || inTrack(el, main, bandSet);
    const bandOf = (el) => bands.findIndex((it) => it.el.contains(el)) + 1;
    const rails = [...main.querySelectorAll(".max-w-grid")];
    const rail = rails.find((e) => rendered(e) && !inExemptBand(e)) || rails[0] || document.querySelector(".max-w-grid");
    if (!rail) return { error: "no .max-w-grid element to take the rail from" };
    const rr = rail.getBoundingClientRect();
    const lo = mode === "margin" ? margin : rr.left;
    const hi = mode === "margin" ? vw - margin : rr.right;
    const items = new Map();
    const skipped = { exempt: 0, fullBleed: 0, list: [] };
    // A text element (an eyebrow, a heading, a paragraph) is measured by its content box: its padding
    // holds no text (the home strip's label pads its text in from the page edge over its own colour).
    const add = (el, kind, { figure = false, text = false } = {}) => {
      if (!el || items.has(el) || !rendered(el)) return;
      if (exempt(el)) {
        skipped.exempt++;
        skipped.list.push(`${kind} ${P.describe(el)}`);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (figure && r.width >= vw * 0.98) {
        skipped.fullBleed++;
        skipped.list.push(`full-bleed ${kind} ${P.describe(el)}`);
        return;
      }
      const box = text ? contentBox(el) : r;
      items.set(el, { el, kind, left: box.left, right: box.right });
    };
    const free = (el) => !el.closest(COMPONENT);
    for (const el of main.querySelectorAll(".eyebrow, h1, h2")) if (free(el)) add(el, el.matches(".eyebrow") ? "eyebrow" : el.tagName.toLowerCase(), { text: true });
    for (const p of main.querySelectorAll("p")) {
      if (p.closest(COMPONENT) || p.closest("label, button, a, figure, dl, nav, summary, details") || p.matches(".eyebrow")) continue;
      if (!(p.textContent || "").trim()) continue;
      add(p, "p", { text: true });
    }
    for (const m of main.querySelectorAll("picture, video, canvas")) {
      if (m.closest(COMPONENT)) continue;
      let frame = m.parentElement;
      while (frame && frame !== main && !/(hidden|clip)/.test(getComputedStyle(frame).overflowX)) frame = frame.parentElement;
      if (!frame || frame === main) frame = m;
      if (frame.closest(COMPONENT)) continue;
      add(frame, "figure frame", { figure: true });
    }
    for (const b of main.querySelectorAll("[data-button]:not([data-actions] > :not(:first-child))")) if (!b.closest(COMPONENT)) add(b, `[data-button="${b.getAttribute("data-button")}"]`);
    // Components by their own box: the outermost of each (a list item, a card, an accordion, a form or
    // its success panel, the calculator). Inside one, only the component's edges are measured.
    for (const c of main.querySelectorAll("li, [data-card], [data-accordion], [data-calculator], form, [data-form-success]")) {
      if (c.parentElement?.closest(COMPONENT)) continue;
      const kind = c.matches("li") ? "li" : c.matches("[data-card]") ? "[data-card]" : c.matches("[data-accordion]") ? "[data-accordion]" : c.matches("[data-calculator]") ? "[data-calculator]" : c.matches("form") ? "form" : "[data-form-success]";
      add(c, kind);
    }
    const out = [];
    const span = mode === "margin" ? `the ${margin}px page margins (x ${r1(lo)} to ${r1(hi)})` : `the rail (x ${r1(lo)} to ${r1(hi)})`;
    for (const it of items.values()) {
      const what = P.describe(it.el);
      if (it.left < lo - 1) out.push({ kind: it.kind, what, band: bandOf(it.el), message: `left edge at x ${r1(it.left)} is ${r1(lo - it.left)}px outside ${span}` });
      if (it.right > hi + 1) out.push({ kind: it.kind, what, band: bandOf(it.el), message: `right edge at x ${r1(it.right)} is ${r1(it.right - hi)}px outside ${span}` });
    }
    // Centred heads: the box itself is centred, not only its lines inside a box held to one side. From the
    // head up to its band, the head and each box that centres it are centred where the flow places them.
    let centred = 0;
    const judged = new Set();
    for (const h of main.querySelectorAll("h1, h2")) {
      if (!rendered(h) || exempt(h) || h.closest("li, [data-card]")) continue;
      if (!/center/.test(getComputedStyle(h).textAlign)) continue;
      centred++;
      const band = bands.find((it) => it.el.contains(h))?.el || main;
      for (let e = h; e && e !== band && e !== main; e = e.parentElement) {
        if (e !== h && !centring(e)) break;
        if (/^(contents|inline)$/.test(getComputedStyle(e).display)) continue;
        if (positioned(e)) break;
        if (judged.has(e)) break;
        judged.add(e);
        const cb = placedIn(e);
        if (!cb) continue;
        const er = e.getBoundingClientRect();
        const box = contentBox(cb);
        const offset = (er.left + er.right) / 2 - (box.left + box.right) / 2;
        if (Math.abs(offset) > 1) {
          const at = r1((er.left + er.right) / 2);
          const whose = e === h ? `its box's centre (x ${at}) is` : `the centred box holding it, ${nameOf(e)}, is centred at x ${at},`;
          out.push({ kind: `centred ${h.tagName.toLowerCase()}`, what: P.describe(h), band: bandOf(h), message: `${whose} ${r1(Math.abs(offset))}px ${offset > 0 ? "right" : "left"} of its containing block's content-box centre (x ${r1((box.left + box.right) / 2)}, ${nameOf(cb)})` });
          break;
        }
      }
    }
    return { rail: { left: r1(rr.left), width: r1(rr.width), what: nameOf(rail) }, mode, margin, checked: items.size, centred, skipped, off: out };
  };

  // Check 43: the header and the footer are on the page.
  P.chrome = () => {
    const header = document.querySelector("body > header");
    const footer = document.querySelector("body > footer") || [...document.querySelectorAll("footer")].find((f) => !f.closest("main"));
    const shownBox = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility === "visible";
    return { header: shownBox(header), footer: shownBox(footer), main: !!document.querySelector("main") };
  };

  P.menuButton = () => {
    const b = [...document.querySelectorAll("body > header button[aria-controls][aria-expanded]")].find((x) => x.getClientRects().length > 0 && getComputedStyle(x).visibility === "visible");
    return b ? b.getAttribute("aria-label") || "menu" : null;
  };
  P.toggleMenu = () => {
    const b = [...document.querySelectorAll("body > header button[aria-controls][aria-expanded]")].find((x) => x.getClientRects().length > 0);
    if (!b) return false;
    b.click();
    return true;
  };
  P.menuOpen = () => !!document.querySelector("body > header button[aria-expanded='true']");
}

// ---------------------------------------------------------------------------------------------------
// Node side: load, settle, sweep, judge, report.
// ---------------------------------------------------------------------------------------------------
const opts = parseArgs(process.argv.slice(2));
const chromium = loadChromium();

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

const call = (page, fn, arg) => page.evaluate(fn, arg);

// A Reveal is hidden (opacity 0) when it is below the fold as the page hydrates, and rises in once it is
// on screen. Under load, hydration can land after a quick scroll-through, hiding a reveal that the scroll
// already passed; measuring then would count the space it holds as empty. So wait until every reveal is
// hydrated (React has attached its fiber), then bring each one still hidden into view and wait for it to
// finish rising, and look again from the top.
const hiddenReveals = (page) =>
  call(page, () => [...document.querySelectorAll("[data-reveal]")].filter((e) => e.getClientRects().length && Number(getComputedStyle(e).opacity) < 0.99).length);

async function waitHydrated(page, timeout = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const done = await call(page, () => [...document.querySelectorAll("[data-reveal]")].every((e) => Object.keys(e).some((k) => k.startsWith("__reactFiber"))));
    if (done) break;
    await page.waitForTimeout(100);
  }
  // The reveal's effect and its observer's first callback run a frame or two after hydration.
  await call(page, () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => resolve(true), 150)))));
}

async function showReveals(page, rounds = 4) {
  for (let round = 0; round < rounds; round++) {
    const hidden = await hiddenReveals(page);
    if (!hidden) break;
    for (let i = 0; i < hidden; i++) {
      const left = await call(page, () => {
        const e = [...document.querySelectorAll("[data-reveal]")].find((x) => x.getClientRects().length && Number(getComputedStyle(x).opacity) < 0.99);
        if (!e) return false;
        window.__p7layout.revealing = e;
        e.scrollIntoView({ block: "center" });
        return true;
      });
      if (!left) break;
      // Wait for it to rise in (up to 4s under load), not a fixed beat.
      for (let t = 0; t < 40; t++) {
        await page.waitForTimeout(100);
        if (await call(page, () => Number(getComputedStyle(window.__p7layout.revealing).opacity) >= 0.99)) break;
      }
    }
    await call(page, () => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
  }
}

async function settlePage(page, vh) {
  await call(page, () => document.fonts.ready.then(() => true));
  await waitHydrated(page);
  const height = await call(page, () => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
    await call(page, (v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await call(page, () => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  await call(page, () => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await showReveals(page);
  await call(page, () => window.__p7layout.idle(null, 3000));
}

const fmt = (n) => Math.round(n).toLocaleString("en-AU");
const blockName = (b) => {
  const id = b.id ? `#${b.id}` : `<${b.tag}>`;
  const what = b.heading ? `"${b.heading}"` : b.label ? `[${b.label}]` : b.text ? `(${b.text})` : "";
  return `${id} ${what}`.trim();
};
const BAND_TONES = ["plaster", "paper", "tint", "mist", "ink", "night", "film"];
const LIGHT_TONES = new Set(["plaster", "paper", "tint", "mist"]);
const DARK_TONES = new Set(["ink", "night"]);
// Relative luminance: a light surface is 0.8 or more, a near-black one 0.02 or less, and a composed
// hero's wash ([data-scatter], the /company hero) starts under 0.4.
const LIGHT_MIN = 0.8;
const NEAR_BLACK = 0.02;
const DARK_STOP = 0.4;
// The sweep kinds a [data-sweep] group may name.
const SWEEP_KINDS = ["tab", "part", "beat", "disclosure", "form"];
const lum = (s) => s.luminance.toFixed(3);
const surfaceText = (s) => `${s.what}${s.gradient ? "'s first stop" : ""} ${s.colour}${s.cover ? ` (${s.cover}% of the band)` : ""}, luminance ${lum(s)}`;
// A gradient is judged by every stop it renders (a flat grey written as a gradient is grey), except a
// composed hero's wash, judged by its first stop.
const stopText = (s, which) => `${s.what} (stops ${s.stops.join(", ")}), whose ${which === "dark" ? "darkest" : "lightest"} stop ${which === "dark" ? s.darkestStop : s.lightestStop} has luminance ${(which === "dark" ? s.darkest : s.lightest).toFixed(3)}`;

function judge(route, width, vp, audit, sweeps, overflow, extra) {
  const failures = [];
  const warnings = [];
  const add = (check, where, message) => failures.push({ check, where, message });
  const warn = (check, where, message) => warnings.push({ check, where, message });
  const blocks = audit.blocks;
  const limit = limitFor(width);
  const notFound = route === NOT_FOUND;
  // The unknown route runs the markers and checks 2, 4, 19, 30 and 43 only.
  const runs = (check) => !notFound || ["markers", 2, 4, 19, 30, 43, "page"].includes(check);

  // Markers.
  for (const b of blocks) {
    if (!b.marked) add("markers", b.index, `${b.film ? "film band" : "block"} has no data-band or data-tone (it renders ${b.surface ? b.surface.colour : "film"})${b.height ? `, ${fmt(b.height)}px` : ""}; checks 4 and 30 cannot judge it`);
  }
  for (const w of audit.wrappers) add("markers", 0, `${w} wraps bands inside <main>: bands must be direct siblings, or the checks cannot read them`);

  // Check 2, in the default state and every swept state. A failure that persists through swept states
  // is reported once, saying so; a failure that only a state produces is reported with that state.
  const sameGap = (g, h) => Math.abs(g.from - h.from) <= 2 && Math.abs(g.to - h.to) <= 2;
  const sameCol = (c, d) => c.column === d.column && c.sibling === d.sibling && Math.abs(c.short - d.short) <= 2;
  const gapText = (g) => {
    const where = g.above && g.below ? `between ${g.above} and ${g.below}` : g.below ? `above ${g.below} (top of the content box)` : `below ${g.above} (bottom of the content box)`;
    return `empty run of ${g.size}px (limit ${limit}px; y ${g.from}-${g.to} in the content box), ${where}`;
  };
  const colText = (c) => `[data-col] ${c.column} of ${c.of} ${c.name} ends ${c.short}px above column ${c.sibling} ${c.siblingName} (limit ${limit}px)`;
  for (const b of blocks) {
    if (b.scatterClaim && !b.scatter) add(2, b.index, `[data-scatter] claims a composed hero, but it holds ${b.scatterPictures} absolutely placed picture${b.scatterPictures === 1 ? "" : "s"}, not 3 or more: it is measured as a band`);
    if (b.skipped) continue;
    const states = sweeps.filter((s) => s.block === b.index);
    const persists = (count) => {
      if (!states.length || !count) return "";
      if (count < states.length) return `; also in ${count} of the ${states.length} other states`;
      return count === 1 ? "; also in the other state" : `; also in all ${count} other states`;
    };
    if (b.space.empty) add(2, b.index, `holds no visible content (${fmt(b.space.contentHeight)}px of empty paper)`);
    for (const g of b.space.gaps) add(2, b.index, gapText(g) + persists(states.filter((s) => s.space.gaps.some((h) => sameGap(g, h))).length));
    for (const c of b.columns.failures) add(2, b.index, colText(c) + persists(states.filter((s) => s.columns.failures.some((d) => sameCol(c, d))).length));
    for (const u of b.unmarkedColumns) warn(2, b.index, `unmarked columns end ${u.spread}px apart (shortest starts with ${u.name}); mark them with data-col`);
    for (const s of states) {
      for (const g of s.space.gaps) if (!b.space.gaps.some((h) => sameGap(g, h))) add(2, b.index, `with ${s.state}: ${gapText(g)}`);
      for (const c of s.columns.failures) if (!b.columns.failures.some((d) => sameCol(c, d))) add(2, b.index, `with ${s.state}: ${colText(c)}`);
    }
  }

  // Check 3. At 1440 a band over twice the viewport is a warning (not for the h1's band or the window's).
  if (runs(3)) {
    for (const b of blocks) {
      const tallest = Math.max(b.height, ...sweeps.filter((s) => s.block === b.index).map((s) => s.height));
      const exempt = b.hasH1 ? "holds the h1" : b.hasWindow ? "holds the software window" : null;
      b.exempt = exempt;
      if (width === 1440 && tallest > vp.height * 2 + 0.5 && !exempt) warn(3, b.index, `${fmt(tallest)}px tall at 1440, over twice the ${vp.height}px viewport`);
    }
    // A [data-sweep] group names a known kind (a typo would slip it past the height rule), and a "form"
    // group sits in a band that holds the form it chooses the fields of.
    for (const b of blocks) {
      for (const g of b.controls || []) {
        if (!SWEEP_KINDS.includes(g.kind)) add(3, b.index, `a [data-sweep="${g.kind}"] group (${g.labels.length} controls): the kind is ${SWEEP_KINDS.join(", ")}; an unknown kind escapes the height rule`);
        else if (g.kind === "form" && !b.hasForm) add(3, b.index, `a [data-sweep="form"] group in a band with no <form>: only tabs that choose a form's fields may change the band's height`);
      }
    }
    // Switching a tab or a part never moves the page. A "form" group (the enquiry tabs choose the form's
    // fields), beats and disclosures may change the band's height.
    for (const b of blocks) {
      for (const kind of ["tab", "part"]) {
        const states = sweeps.filter((s) => s.block === b.index && s.kind === kind);
        if (!states.length) continue;
        const heights = [b.height, ...states.map((s) => s.height)];
        const spread = Math.max(...heights) - Math.min(...heights);
        if (spread > 1) {
          const tallestState = states.reduce((m, s) => (s.height > m.height ? s : m), states[0]);
          add(3, b.index, `height changes by ${fmt(spread)}px across its ${kind}s (${fmt(Math.min(...heights))}-${fmt(Math.max(...heights))}px; tallest with ${tallestState.state}): switching must never move the page`);
        }
      }
    }
  }

  // Check 4.
  const judgeSurface = (b, tone, where, whose) => {
    const s = b.surface;
    if (!s) return;
    const wash = s.gradient && b.scatter;
    if (LIGHT_TONES.has(tone)) {
      if (wash && s.luminance < LIGHT_MIN) add(4, where, `${whose} is ${tone} (light) but it renders ${surfaceText(s)}: a light tone renders ${LIGHT_MIN} or more`);
      else if (!wash && s.darkest < LIGHT_MIN) add(4, where, `${whose} is ${tone} (light) but it renders ${s.gradient ? stopText(s, "dark") : surfaceText(s)}: a light tone renders ${LIGHT_MIN} or more`);
    }
    if (DARK_TONES.has(tone)) {
      if (wash && s.luminance >= DARK_STOP) add(4, where, `${whose} is ${tone} (dark) but it renders ${surfaceText(s)}: a composed hero's wash starts under ${DARK_STOP}`);
      else if (!wash && s.lightest > NEAR_BLACK) add(4, where, `${whose} is ${tone} (dark) but it renders ${s.gradient ? stopText(s, "light") : surfaceText(s)}: a dark tone renders near-black (${NEAR_BLACK} or less)`);
    }
  };
  for (const b of blocks) {
    if (!b.marked) continue; // markers reports it
    // (a) A band's tone is one of the seven; film is earned by the film itself.
    if (!b.dataTone) {
      add(4, b.index, `data-tone is missing (it renders ${surfaceText(b.surface)}): a band is ${BAND_TONES.join(", ")}`);
      continue;
    }
    if (!BAND_TONES.includes(b.dataTone)) {
      add(4, b.index, ["raised", "sunken"].includes(b.dataTone) ? `data-tone is ${b.dataTone}: raised and sunken are retired surface names (a band is ${BAND_TONES.join(", ")})` : `data-tone is ${b.dataTone}, not ${BAND_TONES.join(", ")}`);
      continue;
    }
    if (b.dataTone === "film") {
      if (!b.film) add(4, b.index, `data-tone is film, but no film or picture covers 90% of it (it renders ${surfaceText(b.surface)}): it is measured as a band, and its tone names the surface it paints`);
      continue;
    }
    // (b, c) The surface it renders matches the tone's lightness.
    judgeSurface(b, b.dataTone, b.index, "data-tone");
  }
  // (d) The footer: ink or night, rendering near-black.
  if (audit.footer) {
    const f = audit.footer;
    if (!f.dataTone) add(4, "footer", `the footer has no data-tone (it renders ${surfaceText(f.surface)})`);
    else if (!["ink", "night"].includes(f.dataTone)) add(4, "footer", `the footer's data-tone is ${f.dataTone}, not ink or night`);
    const s = f.surface;
    if (s.lightest > NEAR_BLACK) add(4, "footer", `the footer renders ${s.gradient ? stopText(s, "light") : surfaceText(s)}: it is near-black (${NEAR_BLACK} or less)`);
  } else add(4, "footer", "no footer on the page");

  // Check 19.
  for (const o of overflow) {
    const tail = o.state === "menu open" ? " with the menu open" : "";
    if (o.rootScrollWidth > o.viewport) add(19, "page", `document scrollWidth ${o.rootScrollWidth}px > ${o.viewport}px${tail}`);
    if (o.bodyScrollWidth > o.viewport + 1) add(19, "page", `body scrollWidth ${o.bodyScrollWidth}px > ${o.viewport}px${tail} (hidden by the root's overflow-x: clip)`);
    for (const c of o.culprits) add(19, c.band || "page", `${c.what} runs past the viewport (left ${c.left}, right ${c.right})${tail}`);
  }

  // Check 30. Section padding by data-pad, and the h1 below the header bar.
  const S = sectionY(width);
  const H = heroGap(width);
  // The bar is --nav-h as measured, never less than the designed 56 (a missing token cannot slacken it).
  const hero = audit.hero;
  const bar = Math.max(hero.navH, NAV_H);
  let namedPads = 0;
  let noneBands = 0;
  for (const b of blocks) {
    if (!b.marked) continue;
    const pad = b.pad ?? "none";
    if (!PADS.includes(pad)) {
      add(30, b.index, `data-pad is "${pad}", not ${PADS.join(", ")}`);
      continue;
    }
    if (pad === "none") {
      // The band sets its own measured padding: never more than a section's padding plus one allowed empty
      // run (S + the check 2 limit), and the header bar on top of the page's first band. A film band and a
      // composed hero are their own pictures, padding included.
      if (b.film || b.scatter) continue;
      noneBands++;
      const most = S + limit;
      const mostTop = most + (b.index === 1 ? bar : 0);
      const why = `pad none: at most S + ${limit} (the dead-space limit)${b.index === 1 ? ` + the ${bar}px bar on the first band` : ""}; S ${S} at ${width}`;
      if (b.paddingTop > mostTop + 0.5) add(30, b.index, `padding-top ${b.paddingTop}px, over ${mostTop}px (${why})`);
      if (b.paddingBottom > most + 0.5) add(30, b.index, `padding-bottom ${b.paddingBottom}px, over ${most}px (${why})`);
      continue;
    }
    namedPads++;
    const [top, bottom, how] = padFor(pad, width);
    const why = `pad ${pad}, ${how}; S ${S}, H ${H} at ${width}`;
    if (Math.abs(b.paddingTop - top) > 0.5) add(30, b.index, `padding-top ${b.paddingTop}px, not ${top}px (${why})`);
    if (Math.abs(b.paddingBottom - bottom) > 0.5) add(30, b.index, `padding-bottom ${b.paddingBottom}px, not ${bottom}px (${why})`);
  }
  if (!hero.h1) add(30, "page", "no visible h1 in <main>: its clearance under the header bar cannot be measured");
  else if (hero.h1.top < bar + 16 - 0.5) add(30, hero.h1.band || "page", `the h1 ${hero.h1.what} starts at y ${hero.h1.top} at scroll 0: it starts at least ${bar + 16}px down (the ${bar}px header bar plus 16) so the bar never covers it`);

  // Check 32. Rail containment and centred heads.
  if (runs(32) && extra.rail) {
    if (extra.rail.error) add(32, "page", `rail containment not measured: ${extra.rail.error}`);
    else for (const o of extra.rail.off) add(32, o.band || "page", `${o.kind} ${o.what}: ${o.message}`);
  }

  // Check 43. The unknown route.
  if (notFound) {
    if (extra.status !== 404) add(43, "page", `${route} answered ${extra.status}, not 404`);
    if (!extra.chrome.header) add(43, "page", "the 404 page has no visible header (body > header)");
    if (!extra.chrome.footer) add(43, "page", "the 404 page has no visible footer");
  }
  return { failures: failures.filter((f) => runs(f.check)), warnings, pads: { named: namedPads, none: noneBands, bar } };
}

const report = { base: opts.base, when: new Date().toISOString(), inject: opts.inject, runs: [] };
const lines = [];
const out = (s = "") => {
  lines.push(s);
  console.log(s);
};

out(`check:layout  ${opts.base}${opts.inject ? `  (injecting ${opts.inject})` : ""}`);
out(`Checks 2 (dead space, columns), 3 (band heights), 4 (tones), 19 (overflow), 30 (section padding, h1 clearance), 32 (rail containment) and 43 (404) at ${opts.widths.map((w) => `${w}x${viewportFor(w).height}`).join(", ")}${opts.sweep ? ", sweeping tabs, parts, beats, disclosures and forms" : ""}`);

let totalFailures = 0;
let totalWarnings = 0;
const byCheck = {};
const cfg = { uiSel: UI_SEL };

for (const route of opts.routes) {
  for (const width of opts.widths) {
    const vp = viewportFor(width);
    const limit = limitFor(width);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
    await context.addInitScript(pageLib, cfg);
    // The intro already seen (src/lib/intro.ts INTRO_SEEN_KEY), before --inject so a self-test can clear it.
    await context.addInitScript(
      (key) => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // No storage: the head script then never starts the intro either.
      }
    },
      "lienry:intro-seen",
    );
    if (opts.injectSource) await context.addInitScript({ content: opts.injectSource });
    const page = await context.newPage();
    const errors = [];
    const pageUrl = opts.base + route;
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).split("\n")[0]}`));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      // The unknown route's own 404 is the expected answer, not a page error.
      if (route === NOT_FOUND && /status of 404/.test(m.text()) && (m.location()?.url ?? "") === pageUrl) return;
      errors.push(`console: ${m.text().split("\n")[0].slice(0, 160)}`);
    });
    let response = null;
    try {
      response = await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 60000 });
    } catch (err) {
      errors.push(`navigation: ${String(err.message).split("\n")[0]}`);
    }
    out("");
    const status = response ? response.status() : null;
    // The unknown route must answer exactly 404 (check 43); any page that renders is still measured.
    const accepted = route === NOT_FOUND ? status === 404 || (status !== null && status < 400) : status !== null && status < 400;
    if (!accepted) {
      const check = route === NOT_FOUND ? 43 : "page";
      out(`${route} @${width}  FAIL [${check}] could not load (${response ? `HTTP ${status}` : errors[errors.length - 1]})`);
      report.runs.push({ route, width, error: response ? status : errors });
      totalFailures++;
      byCheck[check] = (byCheck[check] ?? 0) + 1;
      await context.close();
      continue;
    }
    await settlePage(page, vp.height);
    let audit = await call(page, (lim) => window.__p7layout.audit(lim), limit);
    // A reveal still hidden at the audit (a late hydration under load): show it and measure again.
    if (audit.hiddenReveals) {
      await showReveals(page);
      await call(page, () => window.__p7layout.idle(null, 3000));
      audit = await call(page, (lim) => window.__p7layout.audit(lim), limit);
    }

    // State sweeps: every tab selected and every disclosure opened, one at a time, then the default restored.
    const sweeps = [];
    if (opts.sweep) {
      for (const b of audit.blocks) {
        if (b.skipped) continue;
        b.controls.forEach((g) => (g.states = 0));
        for (let gi = 0; gi < b.controls.length; gi++) {
          const g = b.controls[gi];
          for (let i = 0; i < g.labels.length; i++) {
            if (i === g.initial) continue; // the default state is the audit above
            await call(page, ([blk, grp, item]) => window.__p7layout.activate(blk, grp, item), [b.index - 1, gi, i]);
            await page.waitForTimeout(260);
            await call(page, (blk) => window.__p7layout.idle(blk, 1500), b.index - 1);
            const m = await call(page, ([blk, lim]) => window.__p7layout.measure(blk, lim), [b.index - 1, limit]);
            sweeps.push({ block: b.index, kind: g.kind, state: `${g.kind} "${g.labels[i]}" (${i + 1}/${g.labels.length})`, height: m.height, space: m.space, columns: m.columns });
            g.states++;
          }
          await call(page, ([blk, grp, item]) => window.__p7layout.activate(blk, grp, item), [b.index - 1, gi, g.initial]);
          await page.waitForTimeout(260);
          await call(page, (blk) => window.__p7layout.idle(blk, 1500), b.index - 1);
        }
      }
    }

    // Rail containment (32) and the page chrome (43), in the default state.
    // Not on the unknown route: check 43 runs checks 2, 4, 19 and 30 there.
    const railMode = route === NOT_FOUND ? null : width >= 1024 ? "rail" : width < 768 ? "margin" : null;
    const rail = railMode ? await call(page, ([mode, margin]) => window.__p7layout.rail(mode, margin), [railMode, PAGE_MARGIN]) : null;
    const chrome = await call(page, () => window.__p7layout.chrome());

    // Overflow, with the phone menu closed and (where there is one) open.
    const overflow = [{ state: "menu closed", ...(await call(page, () => window.__p7layout.overflow())) }];
    const menu = await call(page, () => window.__p7layout.menuButton());
    if (menu) {
      await call(page, () => window.__p7layout.toggleMenu());
      await page.waitForTimeout(500);
      if (await call(page, () => window.__p7layout.menuOpen())) {
        overflow.push({ state: "menu open", ...(await call(page, () => window.__p7layout.overflow())) });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      } else overflow.push({ state: "menu open", viewport: vp.width, rootScrollWidth: 0, bodyScrollWidth: 0, culprits: [{ what: "the menu did not open", left: 0, right: 0, band: 0 }] });
    }

    const { failures, warnings, pads } = judge(route, width, vp, audit, sweeps, overflow, { rail, chrome, status });
    for (const e of errors) failures.push({ check: "page", where: "page", message: e });
    if (audit.hiddenReveals) warnings.push({ check: 2, where: "page", message: `${audit.hiddenReveals} reveal${audit.hiddenReveals === 1 ? " is" : "s are"} still hidden after settling: check 2 counts the space a hidden reveal holds as empty, so rerun this route alone before trusting its dead-space figures` });
    totalFailures += failures.length;
    totalWarnings += warnings.length;
    for (const f of failures) byCheck[f.check] = (byCheck[f.check] ?? 0) + 1;

    // Per band output.
    const marked = audit.blocks.filter((b) => b.marked).length;
    out(`${route} @${width}  ${route === NOT_FOUND ? `HTTP ${status}, ` : ""}${fmt(audit.pageHeight)}px, ${audit.blocks.length} blocks in <main> (${marked} marked)  ${failures.length ? `${failures.length} failure${failures.length === 1 ? "" : "s"}` : "all pass"}${warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""}`);
    const where = new Map();
    for (const f of [...failures.map((f) => ({ ...f, level: "FAIL" })), ...warnings.map((w) => ({ ...w, level: "warn" }))]) {
      const key = String(f.where);
      if (!where.has(key)) where.set(key, []);
      where.get(key).push(f);
    }
    for (const b of audit.blocks) {
      const states = b.controls.map((g) => `${g.labels.length} ${g.kind}s`).join(", ");
      const pad = `pad ${b.pad ?? "none (unset)"} ${b.paddingTop}/${b.paddingBottom}`;
      const surface = b.surface ? `surface ${b.surface.colour}${b.surface.gradient ? ` (gradient, L ${b.surface.darkest.toFixed(3)} to ${b.surface.lightest.toFixed(3)})` : ""}${b.surface.cover ? ` (panel ${b.surface.cover}%)` : ""} L ${lum(b.surface)}${b.panel ? `, measured inside ${b.panel}` : ""}` : null;
      const info = [b.skipped ? `skip: ${b.skipped}` : null, pad, surface, b.exempt ? `height exempt: ${b.exempt}` : null, states ? `swept ${states}` : null, !b.skipped && b.space ? `largest empty run ${b.space.largest}px` : null, b.columns?.checked ? `${b.columns.checked} columns balanced` : null].filter(Boolean).join("; ");
      out(`  ${String(b.index).padStart(2)} ${blockName(b)}  ${b.tone ?? "?"}${b.dataTone ? "" : "*"}  y ${fmt(b.top)}  ${fmt(b.height)}px${info ? `  (${info})` : ""}`);
      for (const f of where.get(String(b.index)) ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    if (audit.footer) {
      out(`  -- footer  ${audit.footer.tone ?? "?"}${audit.footer.dataTone ? "" : "*"}  y ${fmt(audit.footer.top)}  ${fmt(audit.footer.height)}px  (surface ${audit.footer.surface.colour} L ${lum(audit.footer.surface)})`);
      for (const f of where.get("footer") ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    const pageLevel = [...(where.get("page") ?? []), ...(where.get("0") ?? [])];
    for (const f of pageLevel) out(`  page  ${f.level} [${f.check}] ${f.message}`);
    const notes = [];
    notes.push(`30: ${pads.named} named pad${pads.named === 1 ? "" : "s"} compared, ${pads.none} pad="none" band${pads.none === 1 ? "" : "s"} bounded${audit.hero.h1 ? `; the h1 starts at y ${audit.hero.h1.top} (at least ${pads.bar + 16}: the ${pads.bar}px bar plus 16)` : ""}`);
    if (!rail) {
      if (route !== NOT_FOUND) notes.push(`32: not measured at ${width} (1440 and 1024 against the rail, below 768 against the page margins)`);
    } else if (!rail.error) {
      const against = railMode === "margin" ? `against the ${PAGE_MARGIN}px page margins` : `against the rail at x ${rail.rail.left}, ${rail.rail.width} wide (${rail.rail.what})`;
      notes.push(`32: ${rail.checked} elements measured ${against}, ${rail.centred} centred heads; ${rail.skipped.exempt} exempt (film or scatter hero, track, [data-ui]), ${rail.skipped.fullBleed} full-bleed`);
    }
    if (route === NOT_FOUND) notes.push(`43: HTTP ${status}; header ${chrome.header ? "shown" : "missing"}, footer ${chrome.footer ? "shown" : "missing"}; checks 2, 4, 19 and 30 run here`);
    for (const n of notes) out(`  note  ${n}`);
    report.runs.push({ route, width, status, audit, sweeps, overflow, rail, failures, warnings });
    await context.close();
  }
}
await browser.close();

out("");
out(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"}${totalWarnings ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}` : ""} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(", ")}${opts.inject ? ` with ${opts.inject} injected` : ""}.`);
for (const [check, n] of Object.entries(byCheck)) out(`  ${CHECK_NAMES[check] ?? check}: ${n}`);
out("  * after a tone: the block has no data-tone; it shows the colour it renders.");
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  out(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
