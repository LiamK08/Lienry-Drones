// check:layout: the layout checks of the October 2026 design pass (spec D1; the earlier E2 checks 2, 3,
// 4 and 19 as rewritten there), run in Playwright against a served build at 1440x900 and 390x844 by
// default, and at 1024x768 and 768x1024 with --widths 1440,1024,768,390.
//
// Usage: npm run check:layout -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json] [--no-sweep]
//   e.g. npm run build && npm run start, then npm run check:layout -- http://localhost:3000
//
// Routes: the nine pages, plus /this-page-does-not-exist, which must answer 404 (check 43).
//
//  2  Dead space. For every block in <main> except the film bands, the visible content boxes inside the
//     block's content box (padding excluded) are projected onto the page's vertical axis: no horizontal
//     stripe taller than the limit may hold none (64px from 1024, 48px below). Content boxes are the lines
//     of text (Range.getClientRects); img, video, canvas, svg, button, input, select, textarea and hr;
//     controls by their box, as a button is (a [data-button] or [data-icon-button] rendered as a link,
//     and a link laid out as a box 64px tall at most, so a tertiary link's 44px target is content, not
//     empty paper; a taller link is a container and is measured by what it holds);
//     elements with a background other than the band's or a border on all four sides; and the rules
//     drawn by top and bottom borders. Among siblings marked [data-col] that sit side by side, no
//     column's content may end more than the limit above the lowest of them. Sub-pixel layout adds up to
//     1px of noise, so a run or a column fails above limit + 1. Every block is measured again with each
//     tab selected, each h3 disclosure open and each member of a [data-sweep] group active.
//  3  Band heights. At 1440 a band taller than twice the viewport is a warning, unless it holds the h1
//     or the software window. A band's height never changes when one of its tabs or parts is selected
//     (sweep kinds "tab" and "part", spread 1px at most); the kind is the group's [data-sweep] value, or
//     "part" / "beat" from a part- / story- id.
//  4  Tones. (a) Every band's data-tone is plaster, ink or film: raised and sunken are surfaces inside a
//     section. (b) Adjacent bands alternate light (plaster) and dark (ink, film); the one exception is a
//     [data-attached] band right after the band holding the h1, in its tone. (c) No glass-deep element of
//     100x60 or more in <main>. (d) The footer's data-tone is plaster or ink, opposite in lightness to
//     the last band, and it renders that tone. (e) A band's data-tone is the surface it renders.
// 19  Overflow. Nothing runs past the viewport's edge, with the phone menu open and closed. The page
//     clips overflow-x on <html> and <body>, which hides overflow from documentElement.scrollWidth, so
//     body.scrollWidth and the elements past the edge are checked as well.
// 30  Section padding. Every non-film band's computed padding matches its data-pad within 0.5px:
//     section S/S, hero 72+H/S, attached 0/S, with S = 128/96/80 and H = 64/48/40 from 1024 / from 768 /
//     below. "none" on a non-film band fails. The footer's top padding is S. A band without data-pad is
//     judged as attached ([data-attached]), hero (it holds the h1) or section, and says so.
// 31a Computed spacing. In <main> and the footer (not inside [data-ui], svg, .sr-only or the header, and
//     not an element with an m-auto, mt-auto, mb-auto or my-auto class), margin-top, margin-bottom, the
//     four paddings, row-gap and column-gap are each within 0.5px of 0, 8, 16, 24, 32, 40, 48, 64, 80, 96,
//     128 or 160, the negative of one, or 72 plus one. A [data-ui] root is measured by its margins only:
//     its padding and gaps are the inside of the coded UI, which keeps its own spacing.
// 32  Grid alignment (1440 and 1024). The 12 columns come from the first .max-w-grid in <main> (left L,
//     width W, gutter 24). The left edges of every .eyebrow, h1, h2, band-level p, figure frame, the
//     first [data-button] of an action row, [data-calculator], [data-accordion], [data-card] and a
//     track's first item sit within 1px of a column start; a figure's right edge sits within 1px of a
//     column end or of L + W. Inside li, [data-card], [data-accordion], form, [data-form-success] and
//     [data-ui] only the component's own edge is measured. Below 768 every one of those left edges is
//     the page margin, 16px (within 1px). The home hero is exempt.
// 43  The unknown route answers 404 with the header and the footer, and checks 2, 4, 19 and 30 pass on it.
//
// Markers: every block in <main> must be a Band (data-band, data-tone) or a film band
// (data-tone="film"), or the checks cannot see it.
//
// Playwright is resolved from this project's node_modules, then from a global install. Exit code: 0 when
// every check passes, 1 when any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const NOT_FOUND = "/this-page-does-not-exist";
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", NOT_FOUND];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  1024: { width: 1024, height: 768, mobile: false },
  768: { width: 768, height: 1024, mobile: true },
  390: { width: 390, height: 844, mobile: true },
};
const viewportFor = (w) => VIEWPORTS[w] ?? { width: w, height: w < 800 ? 844 : 900, mobile: w < 800 };
// The largest empty run inside a block, and the most a column may end short of its neighbour.
const limitFor = (w) => (w >= 1024 ? 64 : 48);
// The spacing scale (spec A1.1) and the section rhythm at each width.
const SCALE = [0, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160];
const NAV_H = 72;
const sectionY = (w) => (w >= 1024 ? 128 : w >= 768 ? 96 : 80);
const heroGap = (w) => (w >= 1024 ? 64 : w >= 768 ? 48 : 40);
// The coded demos: [data-ui], and the legacy selectors the window and app panel carry until it lands.
const UI_SEL = "[data-ui], [data-software-preview], [role='group'][aria-label$='demo window'], [role='group'][aria-label$='demo data']";
const CHECK_NAMES = {
  markers: "markers (every block in <main> is a Band or a film band)",
  2: "2 dead space and column balance",
  3: "3 band heights",
  4: "4 tones",
  19: "19 horizontal overflow",
  30: "30 section padding",
  "31a": "31a computed spacing",
  32: "32 grid alignment",
  43: "43 the unknown route",
  page: "page errors",
};

function usage() {
  console.log(`Usage: node scripts/check-layout.mjs <baseUrl> [route ...] [options]

Runs the design pass's layout checks (2, 3, 4, 19, 30, 31a, 32, 43) against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all nine and ${NOT_FOUND})
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default; 1024x768 and 768x1024 also known)
  --json <file>      also write the full report as JSON
  --no-sweep         skip the tab and disclosure state sweeps`);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null, sweep: true };
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
    else if (a.startsWith("--")) fail(`Unknown option ${a}.`, true);
    else if (/^https?:\/\//.test(a)) opts.base = a.replace(/\/+$/, "");
    else if (a.startsWith("/")) opts.routes.push(a);
    else fail(`Unexpected argument ${a}: pass a base URL (http://...) and routes starting with /.`, true);
  }
  for (const w of opts.widths) if (!Number.isFinite(w) || w < 200) fail(`Bad width ${w}.`);
  if (!opts.routes.length) opts.routes = ROUTES;
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

  let tokens = null;
  P.tokens = () => {
    if (tokens) return tokens;
    tokens = {};
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    for (const name of ["plaster", "raised", "sunken", "ink", "ink-raised", "glass-deep", "hairline"]) {
      probe.style.backgroundColor = `var(--color-${name})`;
      tokens[name] = getComputedStyle(probe).backgroundColor;
    }
    probe.remove();
    return tokens;
  };
  const toneOfColour = (colour) => {
    if (alphaOf(colour) < 0.5) return null;
    const t = P.tokens();
    for (const name of ["plaster", "raised", "sunken", "ink", "ink-raised", "glass-deep"]) if (same(colour, t[name])) return name;
    const [r, g, b] = rgba(colour);
    return `rgb(${r}, ${g}, ${b})`;
  };
  // The first opaque background at or above an element: what shows through a transparent block.
  const effectiveBackground = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (alphaOf(bg) >= 0.5) return bg;
    }
    return "rgb(255, 255, 255)";
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
    for (const el of root.querySelectorAll("*")) {
      const tag = el.tagName.toLowerCase();
      if (el.closest("svg") && tag !== "svg") continue;
      const cs = getComputedStyle(el);
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

  const edge = (cs, side) => ({ w: num(cs[`border${side}Width`]), style: cs[`border${side}Style`], colour: cs[`border${side}Color`] });
  const hairline = (e) => e.w >= 0.5 && e.style !== "none" && e.style !== "hidden" && alphaOf(e.colour) > 0.05;

  // Relative luminance of a colour, 0 to 1 (WCAG): what makes an unnamed surface light or dark.
  const luminance = (colour) => {
    const [r, g, b] = rgba(colour).map((v, i) => (i < 3 ? v / 255 : v));
    const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const blockInfo = (el, index, marked) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const dataTone = el.getAttribute("data-tone");
    const film = isFilm(el);
    const bg = effectiveBackground(el);
    const bgTone = film ? "film" : toneOfColour(bg);
    const heading = el.querySelector("h1, h2, h3");
    const top = edge(cs, "Top");
    const bottom = edge(cs, "Bottom");
    const t = P.tokens();
    return {
      index,
      marked,
      tag: el.tagName.toLowerCase(),
      id: el.getAttribute("data-band") || el.id || "",
      dataTone,
      bgTone,
      tone: dataTone || bgTone,
      film,
      heading: heading ? clean(heading.textContent, 50) : "",
      label: el.getAttribute("aria-label") || "",
      top: px(r.top + scrollY),
      height: px(r.height),
      hasH1: !!el.querySelector("h1"),
      hasWindow: !!el.querySelector(windowSelector),
      pad: el.getAttribute("data-pad"),
      attached: el.hasAttribute("data-attached"),
      paddingTop: Math.round(num(cs.paddingTop) * 100) / 100,
      paddingBottom: Math.round(num(cs.paddingBottom) * 100) / 100,
      light: film ? false : luminance(bg) > 0.4,
      borderTop: { ...top, visible: hairline(top), isHairline: same(top.colour, t.hairline) },
      borderBottom: { ...bottom, visible: hairline(bottom), isHairline: same(bottom.colour, t.hairline) },
      text: clean(el.textContent, 40),
    };
  };

  // One block, measured: dead space, column balance, unmarked columns.
  P.measure = (index, limit) => {
    const it = P.state.items[index];
    if (!it) return null;
    const el = it.el;
    const info = blockInfo(el, index + 1, it.marked);
    if (info.film) return { ...info, skipped: "film band" };
    const bandBg = effectiveBackground(el);
    return { ...info, space: gaps(el, bandBg, limit), columns: columns(el, bandBg, limit), unmarkedColumns: unmarkedColumns(el, bandBg, limit) };
  };

  P.audit = (limit) => {
    const st = P.discover();
    const blocks = st.items.map((_, i) => ({ ...P.measure(i, limit), controls: st.controls[i].map((g) => ({ kind: g.kind, labels: g.els.map(labelOf), initial: g.initial })) }));
    const footer = st.footer ? blockInfo(st.footer, 0, true) : null;
    if (footer) footer.tone = footer.dataTone || footer.bgTone;
    // Glass-deep panels: outermost visible elements filled with glass-deep.
    const t = P.tokens();
    const panels = [];
    for (const el of document.querySelectorAll("main *")) {
      if (!same(getComputedStyle(el).backgroundColor, t["glass-deep"]) || !shown(el, null)) continue;
      if (panels.some((p) => p.contains(el))) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 100 || r.height < 60) continue;
      panels.push(el);
    }
    return {
      blocks,
      footer,
      wrappers: st.wrappers.map((w) => `<${w.tagName.toLowerCase()}${w.id ? `#${w.id}` : ""}>`),
      glassPanels: panels.map((p) => {
        const r = p.getBoundingClientRect();
        return { top: px(r.top + scrollY), width: px(r.width), height: px(r.height), what: P.describe(p), band: st.items.findIndex((it) => it.el.contains(p)) + 1 };
      }),
      pageHeight: document.documentElement.scrollHeight,
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

  // Check 31a: every computed margin-top, margin-bottom, padding and gap in <main> and the footer that is
  // not on the 8px scale. Repeats (the same tag, classes, property and value) are folded into one entry.
  const nameOf = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().replace(/\s+/g, " ") : "";
    return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? ` class="${cls.length > 90 ? `${cls.slice(0, 89)}…` : cls}"` : ""}>`;
  };
  const AUTO = /(^|:)m[ytb]?-auto$/;
  P.spacing = (scale, nav) => {
    const allowed = [...scale, ...scale.map((v) => -v), ...scale.map((v) => nav + v)];
    const onScale = (v) => allowed.some((a) => Math.abs(a - v) <= 0.5);
    const footer = P.state?.footer;
    const roots = [document.querySelector("main"), footer].filter(Boolean);
    const found = new Map();
    let checked = 0;
    for (const root of roots) {
      for (const el of [root, ...root.querySelectorAll("*")]) {
        if (["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "SOURCE", "BR", "WBR"].includes(el.tagName)) continue;
        if (el.parentElement?.closest(UI_SEL) || el.closest("svg, .sr-only, body > header")) continue;
        if ([...el.classList].some((c) => AUTO.test(c))) continue;
        checked++;
        const cs = getComputedStyle(el);
        // A coded UI's root: its margins place it on the page; its padding and gaps are its inside.
        const props = el.matches(UI_SEL) ? ["marginTop", "marginBottom"] : ["marginTop", "marginBottom", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "rowGap", "columnGap"];
        for (const prop of props) {
          const raw = cs[prop];
          const v = raw === "normal" || raw === "" ? 0 : parseFloat(raw);
          if (!Number.isFinite(v) || onScale(v)) continue;
          const css = prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
          // Folded by tag and classes, so a repeated component (six part buttons) reports once.
          const key = `${el.tagName}|${el.className}|${css}|${raw}`;
          if (!found.has(key)) found.set(key, { what: nameOf(el), prop: css, value: raw, count: 0, band: footer && footer.contains(el) ? "footer" : (P.state?.items || []).findIndex((it) => it.el.contains(el)) + 1 });
          found.get(key).count++;
        }
      }
    }
    return { checked, off: [...found.values()] };
  };

  // Check 32: left (and figure right) edges against the 12 columns, or the page margin below 768.
  const COMPONENT = `li, [data-card], [data-accordion], form, [data-form-success], ${UI_SEL}`;
  const rendered = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === "visible" && !el.closest("[hidden], .sr-only");
  const isTrack = (el) => /(auto|scroll)/.test(getComputedStyle(el).overflowX);
  P.grid = (mode, margin) => {
    const main = document.querySelector("main");
    if (!main) return { error: "no <main>" };
    const rail = main.querySelector(".max-w-grid") || document.querySelector(".max-w-grid");
    if (!rail) return { error: "no .max-w-grid element to take the columns from" };
    const rr = rail.getBoundingClientRect();
    const L = rr.left;
    const W = rr.width;
    const G = 24;
    const colW = (W - 11 * G) / 12;
    const starts = Array.from({ length: 12 }, (_, k) => L + k * (colW + G));
    const ends = starts.map((s) => s + colW);
    const h1 = main.querySelector("h1");
    const homeHero = location.pathname === "/" && h1 ? (P.state?.items || []).find((it) => it.el.contains(h1))?.el ?? null : null;
    const items = new Map();
    const add = (el, kind, figure = false) => {
      if (!el || items.has(el) || !rendered(el) || (homeHero && homeHero.contains(el))) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      items.set(el, { el, kind, left: r.left, right: r.right, figure });
    };
    const free = (el) => !el.closest(COMPONENT);
    for (const el of main.querySelectorAll(".eyebrow, h1, h2")) if (free(el)) add(el, el.matches(".eyebrow") ? "eyebrow" : el.tagName.toLowerCase());
    for (const p of main.querySelectorAll("p")) {
      if (p.closest(COMPONENT) || p.closest("label, button, a, figure, dl, nav, summary, details") || p.matches(".eyebrow")) continue;
      if (!(p.textContent || "").trim()) continue;
      add(p, "p");
    }
    for (const m of main.querySelectorAll("picture, video, canvas")) {
      if (m.closest(COMPONENT)) continue;
      let frame = m.parentElement;
      while (frame && frame !== main && !/(hidden|clip)/.test(getComputedStyle(frame).overflowX)) frame = frame.parentElement;
      if (!frame || frame === main) frame = m;
      if (frame.closest(COMPONENT)) continue;
      add(frame, "figure frame", true);
    }
    for (const b of main.querySelectorAll("[data-button]:not([data-actions] > :not(:first-child))")) if (!b.closest(COMPONENT)) add(b, `[data-button="${b.getAttribute("data-button")}"]`);
    for (const c of main.querySelectorAll("[data-calculator], [data-accordion]")) if (!c.parentElement?.closest(COMPONENT)) add(c, c.matches("[data-calculator]") ? "[data-calculator]" : "[data-accordion]");
    const tracks = [...main.querySelectorAll("ul, ol")].filter(isTrack);
    for (const t of tracks) {
      const first = [...t.children].find((li) => li.tagName === "LI" && rendered(li));
      if (first && !t.parentElement?.closest(COMPONENT)) add(first, "a track's first item");
    }
    for (const c of main.querySelectorAll("[data-card]")) {
      if (c.parentElement?.closest("[data-card]") || tracks.some((t) => t.contains(c)) || c.closest(`[data-accordion], form, [data-form-success], ${UI_SEL}`)) continue;
      add(c, "[data-card]");
    }
    const out = [];
    const near = (x, list) => list.reduce((best, s, k) => (Math.abs(s - x) < Math.abs(best.x - x) ? { x: s, k } : best), { x: list[0], k: 0 });
    for (const it of items.values()) {
      const what = P.describe(it.el);
      if (mode === "margin") {
        if (Math.abs(it.left - margin) > 1) out.push({ kind: it.kind, what, message: `left edge at x ${Math.round(it.left * 10) / 10}, not the ${margin}px page margin` });
        continue;
      }
      const s = near(it.left, starts);
      if (Math.abs(s.x - it.left) > 1) out.push({ kind: it.kind, what, message: `left edge at x ${Math.round(it.left * 10) / 10} is ${Math.round(Math.abs(s.x - it.left) * 10) / 10}px off column ${s.k + 1}'s start (x ${Math.round(s.x * 10) / 10})` });
      if (it.figure) {
        const e = near(it.right, [...ends, L + W]);
        if (Math.abs(e.x - it.right) > 1) out.push({ kind: it.kind, what, message: `right edge at x ${Math.round(it.right * 10) / 10} is ${Math.round(Math.abs(e.x - it.right) * 10) / 10}px off the nearest column end (x ${Math.round(e.x * 10) / 10})` });
      }
    }
    return { rail: { left: Math.round(L * 10) / 10, width: Math.round(W * 10) / 10, colW: Math.round(colW * 100) / 100 }, margin, checked: items.size, off: out };
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

async function settlePage(page, vh) {
  await call(page, () => document.fonts.ready.then(() => true));
  const height = await call(page, () => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
    await call(page, (v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await call(page, () => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(200);
  // A quick scroll-through can pass a reveal between two slow headless frames (the 3D window slows
  // them), leaving it hidden until it is next on screen; and a page that hydrates late (a cold
  // server) hides what is below the fold only then. Bring each one still hidden into view, and look
  // again once back at the top, so the audit never measures a reveal that has not run.
  const countHidden = () =>
    call(page, () => [...document.querySelectorAll("[data-reveal]")].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length);
  for (let round = 0; round < 3; round++) {
    const hidden = await countHidden();
    if (round > 0 && !hidden) break;
    for (let i = 0; i < hidden; i++) {
      const left = await call(page, () => {
        const e = [...document.querySelectorAll("[data-reveal]")].find((x) => Number(getComputedStyle(x).opacity) < 0.99);
        if (!e) return false;
        e.scrollIntoView({ block: "center" });
        return true;
      });
      if (!left) break;
      await page.waitForTimeout(750);
    }
    await call(page, () => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
  }
  await call(page, () => window.__p7layout.idle(null, 3000));
}

const fmt = (n) => Math.round(n).toLocaleString("en-AU");
const blockName = (b) => {
  const id = b.id ? `#${b.id}` : `<${b.tag}>`;
  const what = b.heading ? `"${b.heading}"` : b.label ? `[${b.label}]` : b.text ? `(${b.text})` : "";
  return `${id} ${what}`.trim();
};
const LIGHT_TONES = new Set(["plaster", "raised", "sunken"]);
const DARK_TONES = new Set(["ink", "ink-raised", "film"]);
const BAND_TONES = new Set(["plaster", "ink", "film"]);
// Light or dark: from the band's tone name, or from the luminance of an unnamed surface.
const lightness = (b) => (LIGHT_TONES.has(b.tone) ? "light" : DARK_TONES.has(b.tone) ? "dark" : b.light ? "light" : "dark");

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
    if (!b.marked) add("markers", b.index, `${b.film ? "film band" : "block"} has no data-band or data-tone (background ${b.bgTone ?? "transparent"})${b.height ? `, ${fmt(b.height)}px` : ""}; checks 2-4 and 30 cannot see it`);
  }
  for (const w of audit.wrappers) add("markers", 0, `${w} wraps bands inside <main>: bands must be direct siblings, or the tone rhythm cannot be read`);

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
    // Switching a tab or a part never moves the page.
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
  const seq = blocks.map((b) => ({ ...b, tone: b.film ? "film" : b.tone }));
  for (const b of seq) {
    // (a) A band's tone is plaster, ink or film.
    if (b.dataTone && !BAND_TONES.has(b.dataTone)) {
      add(4, b.index, ["raised", "sunken"].includes(b.dataTone) ? `data-tone is ${b.dataTone}: raised and sunken are surfaces inside a section, never a section` : `data-tone is ${b.dataTone}, not plaster, ink or film`);
    }
    // (e) data-tone is the surface the band renders.
    if (b.dataTone && b.dataTone !== "film" && b.bgTone && b.dataTone !== b.bgTone) add(4, b.index, `data-tone is ${b.dataTone} but the band renders ${b.bgTone}`);
  }
  // (b) Bands alternate light and dark.
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1];
    const b = seq[i];
    const la = lightness(a);
    const lb = lightness(b);
    if (la !== lb) continue;
    if (b.attached && a.hasH1 && a.tone === b.tone) continue;
    const why = (x) => (x.dataTone ? "" : ", from its background (no data-tone)");
    const hint = b.attached ? (a.hasH1 ? ` ([data-attached] needs the same tone as the band above; it is ${b.tone}, not ${a.tone})` : " ([data-attached] is only allowed right after the band holding the h1)") : "";
    add(4, b.index, `${b.tone} (${lb}${why(b)}) follows ${a.tone} (${la}${why(a)}) in block ${a.index}: sections alternate plaster and ink (film counts as dark)${hint}`);
  }
  // (c) No glass-deep panel.
  for (const g of audit.glassPanels) add(4, g.band || "page", `a glass-deep element of ${g.width}x${g.height} at y ${fmt(g.top)} (${g.what}): the glass-deep panel is gone`);
  // (d) The footer: plaster or ink, opposite to the last band, rendering its tone.
  const last = seq[seq.length - 1];
  if (audit.footer) {
    const f = audit.footer;
    if (!f.dataTone) add(4, "footer", `the footer has no data-tone (it renders ${f.bgTone ?? "transparent"})`);
    else if (!["plaster", "ink"].includes(f.dataTone)) add(4, "footer", `the footer's data-tone is ${f.dataTone}, not plaster or ink`);
    if (f.dataTone && f.bgTone && f.dataTone !== f.bgTone) add(4, "footer", `the footer's data-tone is ${f.dataTone} but it renders ${f.bgTone}`);
    if (last && lightness(last) === lightness(f)) add(4, "footer", `the footer (${f.tone}, ${lightness(f)}) has the lightness of the last band, block ${last.index} (${last.tone}): they must be opposite`);
  } else add(4, "footer", "no footer on the page");

  // Check 19.
  for (const o of overflow) {
    const tail = o.state === "menu open" ? " with the menu open" : "";
    if (o.rootScrollWidth > o.viewport) add(19, "page", `document scrollWidth ${o.rootScrollWidth}px > ${o.viewport}px${tail}`);
    if (o.bodyScrollWidth > o.viewport + 1) add(19, "page", `body scrollWidth ${o.bodyScrollWidth}px > ${o.viewport}px${tail} (hidden by the root's overflow-x: clip)`);
    for (const c of o.culprits) add(19, c.band || "page", `${c.what} runs past the viewport (left ${c.left}, right ${c.right})${tail}`);
  }

  // Check 30. Section padding by data-pad.
  const S = sectionY(width);
  const H = heroGap(width);
  const want = { section: [S, S], hero: [NAV_H + H, S], attached: [0, S] };
  for (const b of blocks) {
    if (b.film || !b.marked) continue;
    const inferred = !b.pad;
    const pad = b.pad ?? (b.attached ? "attached" : b.hasH1 ? "hero" : "section");
    const how = inferred ? `pad ${pad}, inferred: no data-pad` : `pad ${pad}`;
    if (pad === "none") {
      add(30, b.index, "data-pad is none on a non-film band: every section takes section, hero or attached padding");
      continue;
    }
    const w = want[pad];
    if (!w) {
      add(30, b.index, `data-pad is "${pad}", not section, hero, attached or none`);
      continue;
    }
    if (Math.abs(b.paddingTop - w[0]) > 0.5) add(30, b.index, `padding-top ${b.paddingTop}px, not ${w[0]}px (${how}; S ${S}, H ${H} at ${width})`);
    if (Math.abs(b.paddingBottom - w[1]) > 0.5) add(30, b.index, `padding-bottom ${b.paddingBottom}px, not ${w[1]}px (${how}; S ${S} at ${width})`);
  }
  if (audit.footer && Math.abs(audit.footer.paddingTop - S) > 0.5) add(30, "footer", `the footer's padding-top is ${audit.footer.paddingTop}px, not ${S}px (S at ${width})`);

  // Check 31a. Computed spacing on the 8px scale.
  if (runs("31a") && extra.spacing) {
    for (const o of extra.spacing.off) add("31a", o.band || "page", `${o.prop} ${o.value} is off the 8px scale on ${o.what}${o.count > 1 ? ` (${o.count} elements)` : ""}`);
  }

  // Check 32. Grid alignment.
  if (runs(32) && extra.grid) {
    if (extra.grid.error) add(32, "page", `grid alignment not measured: ${extra.grid.error}`);
    else for (const o of extra.grid.off) add(32, "page", `${o.kind} ${o.what}: ${o.message}`);
  }

  // Check 43. The unknown route.
  if (notFound) {
    if (extra.status !== 404) add(43, "page", `${route} answered ${extra.status}, not 404`);
    if (!extra.chrome.header) add(43, "page", "the 404 page has no visible header (body > header)");
    if (!extra.chrome.footer) add(43, "page", "the 404 page has no visible footer");
  }
  return { failures: failures.filter((f) => runs(f.check)), warnings };
}

const report = { base: opts.base, when: new Date().toISOString(), runs: [] };
const lines = [];
const out = (s = "") => {
  lines.push(s);
  console.log(s);
};

out(`check:layout  ${opts.base}`);
out(`Checks 2 (dead space, columns), 3 (band heights), 4 (tones), 19 (overflow), 30 (section padding), 31a (spacing), 32 (grid) and 43 (404) at ${opts.widths.map((w) => `${w}x${viewportFor(w).height}`).join(", ")}${opts.sweep ? ", sweeping tabs, parts, beats and disclosures" : ""}`);

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
    const audit = await call(page, (lim) => window.__p7layout.audit(lim), limit);

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

    // Spacing (31a), grid (32) and the page chrome (43), in the default state.
    const spacing = await call(page, ([scale, nav]) => window.__p7layout.spacing(scale, nav), [SCALE, NAV_H]);
    const gridMode = width >= 1024 ? "grid" : width < 768 ? "margin" : null;
    const grid = gridMode ? await call(page, ([mode, margin]) => window.__p7layout.grid(mode, margin), [gridMode, 16]) : null;
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

    const { failures, warnings } = judge(route, width, vp, audit, sweeps, overflow, { spacing, grid, chrome, status });
    for (const e of errors) failures.push({ check: "page", where: "page", message: e });
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
      const pad = b.film ? null : `pad ${b.pad ?? "?"} ${b.paddingTop}/${b.paddingBottom}`;
      const info = [b.skipped ? `skip: ${b.skipped}` : null, pad, b.exempt ? `height exempt: ${b.exempt}` : null, states ? `swept ${states}` : null, !b.skipped && b.space ? `largest empty run ${b.space.largest}px` : null, b.columns?.checked ? `${b.columns.checked} columns balanced` : null].filter(Boolean).join("; ");
      out(`  ${String(b.index).padStart(2)} ${blockName(b)}  ${b.tone ?? "?"}${b.dataTone ? "" : "*"}  y ${fmt(b.top)}  ${fmt(b.height)}px${info ? `  (${info})` : ""}`);
      for (const f of where.get(String(b.index)) ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    if (audit.footer) {
      out(`  -- footer  ${audit.footer.tone ?? "?"}${audit.footer.dataTone ? "" : "*"}  y ${fmt(audit.footer.top)}  ${fmt(audit.footer.height)}px  (padding-top ${audit.footer.paddingTop})`);
      for (const f of where.get("footer") ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    const pageLevel = [...(where.get("page") ?? []), ...(where.get("0") ?? [])];
    for (const f of pageLevel) out(`  page  ${f.level} [${f.check}] ${f.message}`);
    const notes = [`31a: ${spacing.checked} elements measured`];
    if (!grid) notes.push(`32: not measured at ${width} (1440 and 1024 on the grid, below 768 on the page margin)`);
    else if (!grid.error) notes.push(`32: ${grid.checked} edges measured ${gridMode === "margin" ? "against the 16px page margin" : `against the rail at x ${grid.rail.left}, ${grid.rail.width} wide (columns ${grid.rail.colW})`}`);
    if (route === NOT_FOUND) notes.push(`43: HTTP ${status}; header ${chrome.header ? "shown" : "missing"}, footer ${chrome.footer ? "shown" : "missing"}; checks 2, 4, 19 and 30 run here`);
    for (const n of notes) out(`  note  ${n}`);
    report.runs.push({ route, width, status, audit, sweeps, overflow, spacing, grid, failures, warnings });
    await context.close();
  }
}
await browser.close();

out("");
out(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"}${totalWarnings ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}` : ""} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(", ")}.`);
for (const [check, n] of Object.entries(byCheck)) out(`  ${CHECK_NAMES[check] ?? check}: ${n}`);
out("  * after a tone: taken from the background because the block has no data-tone.");
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  out(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
