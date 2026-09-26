// check:layout: the redesign's layout checks (docs/REDESIGN-SPEC.md, E2 checks 2, 3, 4 and 19), run in
// Playwright against a served build at 1440x900 and 390x844.
//
// Usage: npm run check:layout -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json] [--no-sweep]
//   e.g. npm run build && npm run start, then npm run check:layout -- http://localhost:3000
//
//  2  Dead space. For every block in <main> except the film bands, the visible content boxes inside the
//     block's content box (padding excluded) are projected onto the page's vertical axis: no horizontal
//     stripe taller than 48px may hold none. Content boxes are the lines of text (Range.getClientRects);
//     img, video, canvas, svg, button, input, select, textarea and hr; elements with a background other
//     than the band's or a border on all four sides (the stage sidebar, the app panel, the window); and
//     the rules drawn by top and bottom borders. Hidden, transparent and clipped content does not count.
//     Text counts as its line boxes, so a 48px margin under a paragraph measures 48px. Among siblings
//     marked [data-col] that sit side by side, no column's content may end more than 48px above the
//     lowest of them. Sub-pixel layout adds up to 1px of noise, so a run or a column fails above 49px.
//     Every block is measured again with each tab selected and each disclosure open (switcher tabs,
//     software steps, stage parts and story beats). A grid or flex row of two or three unmarked
//     blocks whose contents end far apart is reported as a warning: mark such columns with data-col.
//  3  Band heights. At 1440 no band is taller than 900px, except a band that holds the page's h1 (the
//     home hero, the split heroes, the company statement, the register and privacy bands) or the
//     software window (the software bands and the platform close). A band's height never changes when
//     one of its tabs or stage parts is selected (B6 Switcher, C1 sections 4 and 5).
//  4  Tones. Adjacent bands never share a tone; at most one ink band and one glass-deep panel on a page;
//     the band before the footer is never sunken; every boundary between two light tones shows exactly
//     one 1px hairline; a band's data-tone is the surface it renders. Every block in <main> must be a
//     Band (data-band, data-tone) or a film band (data-tone="film"), or the checks cannot see it.
// 19  Overflow. Nothing runs past the viewport's edge, with the phone menu open and closed. The page
//     clips overflow-x on <html> and <body>, which hides overflow from documentElement.scrollWidth, so
//     body.scrollWidth and the elements past the edge are checked as well.
//
// Playwright is resolved from this project's node_modules, then from a global install. Exit code: 0 when
// every check passes, 1 when any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/register-interest", "/privacy"];
const VIEWPORTS = {
  1440: { width: 1440, height: 900, mobile: false },
  390: { width: 390, height: 844, mobile: true },
};
const LIMIT = 48; // the largest empty run inside a block, and the most a column may end short of its neighbour
const MAX_BAND = 900; // band height limit at 1440
const CHECK_NAMES = {
  markers: "markers (every block in <main> is a Band or a film band)",
  2: "2 dead space and column balance",
  3: "3 band heights",
  4: "4 tones and hairlines",
  19: "19 horizontal overflow",
  page: "page errors",
};

function usage() {
  console.log(`Usage: node scripts/check-layout.mjs <baseUrl> [route ...] [options]

Runs E2 checks 2, 3, 4 and 19 of docs/REDESIGN-SPEC.md against a served build.

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all eight)
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default)
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
function pageLib() {
  const P = (window.__p7layout = {});
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
    for (const name of ["plaster", "raised", "sunken", "ink", "glass-deep", "hairline"]) {
      probe.style.backgroundColor = `var(--color-${name})`;
      tokens[name] = getComputedStyle(probe).backgroundColor;
    }
    probe.remove();
    return tokens;
  };
  const toneOfColour = (colour) => {
    if (alphaOf(colour) < 0.5) return null;
    const t = P.tokens();
    for (const name of ["plaster", "raised", "sunken", "ink", "glass-deep"]) if (same(colour, t[name])) return name;
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
    return (src.match(/\/media\/([a-z0-9-]+?)(?:-\d+)?(?:-poster)?\.(?:avif|webp|jpg|png|mp4|webm)/) || [])[1] || null;
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
      let whole = REPLACED.has(tag);
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
        if (c) out.push({ ...c, what: el, rank: REPLACED.has(tag) ? 1 : 2 });
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

  // The switchable states of a band: tab groups and h3 disclosure groups.
  const controlsOf = (band) => {
    const groups = [];
    for (const list of band.querySelectorAll('[role="tablist"]')) {
      const tabs = [...list.querySelectorAll('[role="tab"]')].filter(boxedVisible);
      if (tabs.length < 2) continue;
      groups.push({ kind: "tab", els: tabs, initial: Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true")) });
    }
    const disclosures = [...band.querySelectorAll("h3 button[aria-expanded][aria-controls]")].filter(boxedVisible);
    if (disclosures.length >= 2) {
      const id = disclosures[0].id || "";
      const kind = id.startsWith("part-") ? "part" : id.startsWith("story-") ? "beat" : "disclosure";
      groups.push({ kind, els: disclosures, initial: Math.max(0, disclosures.findIndex((b) => b.getAttribute("aria-expanded") === "true")) });
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

  const blockInfo = (el, index, marked) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const dataTone = el.getAttribute("data-tone");
    const film = isFilm(el);
    const bgTone = film ? "film" : toneOfColour(effectiveBackground(el));
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
      glassPanels: panels.map((p) => ({ top: px(p.getBoundingClientRect().top + scrollY), band: st.items.findIndex((it) => it.el.contains(p)) + 1 })),
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
  // them), leaving it hidden until it is next on screen. Bring each one still hidden into view.
  const hidden = await call(page, () =>
    [...document.querySelectorAll("[data-reveal]")].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length,
  );
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
  await call(page, () => window.__p7layout.idle(null, 3000));
}

const fmt = (n) => Math.round(n).toLocaleString("en-AU");
const blockName = (b) => {
  const id = b.id ? `#${b.id}` : `<${b.tag}>`;
  const what = b.heading ? `"${b.heading}"` : b.label ? `[${b.label}]` : b.text ? `(${b.text})` : "";
  return `${id} ${what}`.trim();
};
const LIGHT = new Set(["plaster", "raised", "sunken"]);

function judge(width, audit, sweeps, overflow) {
  const failures = [];
  const warnings = [];
  const add = (check, where, message) => failures.push({ check, where, message });
  const warn = (check, where, message) => warnings.push({ check, where, message });
  const blocks = audit.blocks;

  // Markers.
  for (const b of blocks) {
    if (!b.marked) add("markers", b.index, `${b.film ? "film band" : "block"} has no data-band or data-tone (background ${b.bgTone ?? "transparent"})${b.height ? `, ${fmt(b.height)}px` : ""}; checks 2-4 cannot see it`);
  }
  for (const w of audit.wrappers) add("markers", 0, `${w} wraps bands inside <main>: bands must be direct siblings for the hairline rule`);

  // Check 2, in the default state and every swept state. A failure that persists through swept states
  // is reported once, saying so; a failure that only a state produces is reported with that state.
  const sameGap = (g, h) => Math.abs(g.from - h.from) <= 2 && Math.abs(g.to - h.to) <= 2;
  const sameCol = (c, d) => c.column === d.column && c.sibling === d.sibling && Math.abs(c.short - d.short) <= 2;
  const gapText = (g) => {
    const where = g.above && g.below ? `between ${g.above} and ${g.below}` : g.below ? `above ${g.below} (top of the content box)` : `below ${g.above} (bottom of the content box)`;
    return `empty run of ${g.size}px (y ${g.from}-${g.to} in the content box), ${where}`;
  };
  const colText = (c) => `[data-col] ${c.column} of ${c.of} ${c.name} ends ${c.short}px above column ${c.sibling} ${c.siblingName}`;
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

  // Check 3, at 1440 only.
  if (width === 1440) {
    for (const b of blocks) {
      const tallest = Math.max(b.height, ...sweeps.filter((s) => s.block === b.index).map((s) => s.height));
      const exempt = b.hasH1 ? "holds the h1" : b.hasWindow ? "holds the software window" : null;
      if (tallest > MAX_BAND + 0.5 && !exempt) add(3, b.index, `${fmt(tallest)}px tall at 1440 (limit ${MAX_BAND}px)`);
      b.exempt = exempt;
    }
    // Switching a tab or a stage part never moves the page (B6 Switcher, C1 section 5, software steps).
    for (const b of blocks) {
      const states = sweeps.filter((s) => s.block === b.index && (s.kind === "tab" || s.kind === "part"));
      const heights = [b.height, ...states.map((s) => s.height)];
      const spread = Math.max(...heights) - Math.min(...heights);
      if (states.length && spread > 1) add(3, b.index, `height changes by ${fmt(spread)}px across its ${states[0].kind}s (${fmt(Math.min(...heights))}-${fmt(Math.max(...heights))}px): switching must never move the page`);
    }
  }

  // Check 4. A band's data-tone must be the surface it renders, or the hairline rule reads it wrong.
  for (const b of blocks) {
    if (b.dataTone && b.dataTone !== "film" && b.bgTone && b.dataTone !== b.bgTone) add(4, b.index, `data-tone is ${b.dataTone} but the band renders ${b.bgTone}`);
  }
  const seq = blocks.map((b) => ({ ...b, tone: b.film ? "film" : b.tone }));
  for (let i = 1; i < seq.length; i++) {
    const a = seq[i - 1];
    const b = seq[i];
    const why = (x) => (x.dataTone ? "" : " (from its background; no data-tone)");
    if (a.tone && b.tone && a.tone === b.tone) add(4, b.index, `same tone as the block above: both ${b.tone}${why(b)}`);
    if (LIGHT.has(a.tone) && LIGHT.has(b.tone)) {
      const lines = [a.borderBottom.visible ? { at: "bottom of the block above", ...a.borderBottom } : null, b.borderTop.visible ? { at: "top of this block", ...b.borderTop } : null].filter(Boolean);
      if (!lines.length) add(4, b.index, `no hairline where ${a.tone} meets ${b.tone}`);
      else if (lines.length > 1) add(4, b.index, `two lines where ${a.tone} meets ${b.tone} (the block above's bottom border and this block's top border)`);
      else if (Math.abs(lines[0].w - 1) > 0.01 || !lines[0].isHairline) add(4, b.index, `the line where ${a.tone} meets ${b.tone} is ${lines[0].w}px ${lines[0].colour}, not a 1px hairline`);
    }
  }
  const inks = seq.filter((b) => b.tone === "ink");
  if (inks.length > 1) add(4, inks[1].index, `${inks.length} ink bands on the page (at most one): blocks ${inks.map((b) => b.index).join(", ")}`);
  if (audit.glassPanels.length > 1) add(4, audit.glassPanels[1].band, `${audit.glassPanels.length} glass-deep panels on the page (at most one), in blocks ${audit.glassPanels.map((p) => p.band).join(", ")}`);
  const last = seq[seq.length - 1];
  if (last && last.tone === "sunken") add(4, last.index, "the band before the footer is sunken, the footer's own tone");
  if (last && audit.footer) {
    const f = audit.footer;
    if (f.tone !== "sunken") add(4, "footer", `the footer is ${f.tone ?? "transparent"}, not sunken`);
    if (LIGHT.has(last.tone) && LIGHT.has(f.tone)) {
      const lines = [last.borderBottom.visible ? last.borderBottom : null, f.borderTop.visible ? f.borderTop : null].filter(Boolean);
      if (!lines.length) add(4, "footer", `no hairline where ${last.tone} meets the footer`);
      else if (lines.length > 1) add(4, "footer", "two lines where the last band meets the footer");
      else if (Math.abs(lines[0].w - 1) > 0.01 || !lines[0].isHairline) add(4, "footer", `the line above the footer is ${lines[0].w}px ${lines[0].colour}, not a 1px hairline`);
    }
  }

  // Check 19.
  for (const o of overflow) {
    const tail = o.state === "menu open" ? " with the menu open" : "";
    if (o.rootScrollWidth > o.viewport) add(19, "page", `document scrollWidth ${o.rootScrollWidth}px > ${o.viewport}px${tail}`);
    if (o.bodyScrollWidth > o.viewport + 1) add(19, "page", `body scrollWidth ${o.bodyScrollWidth}px > ${o.viewport}px${tail} (hidden by the root's overflow-x: clip)`);
    for (const c of o.culprits) add(19, c.band || "page", `${c.what} runs past the viewport (left ${c.left}, right ${c.right})${tail}`);
  }
  return { failures, warnings };
}

const report = { base: opts.base, when: new Date().toISOString(), runs: [] };
const lines = [];
const out = (s = "") => {
  lines.push(s);
  console.log(s);
};

out(`check:layout  ${opts.base}`);
out(`E2 checks 2 (dead space, columns), 3 (band heights), 4 (tones), 19 (overflow) at ${opts.widths.map((w) => `${w}x${(VIEWPORTS[w] ?? { height: 900 }).height}`).join(" and ")}${opts.sweep ? ", sweeping tabs, stage parts and story beats" : ""}`);

let totalFailures = 0;
let totalWarnings = 0;
const byCheck = {};

for (const route of opts.routes) {
  for (const width of opts.widths) {
    const vp = VIEWPORTS[width] ?? { width, height: width < 800 ? 844 : 900, mobile: width < 800 };
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
    await context.addInitScript(pageLib);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).split("\n")[0]}`));
    page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().split("\n")[0].slice(0, 160)}`));
    let response = null;
    try {
      response = await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
    } catch (err) {
      errors.push(`navigation: ${String(err.message).split("\n")[0]}`);
    }
    out("");
    if (!response || response.status() >= 400) {
      out(`${route} @${width}  FAIL could not load (${response ? `HTTP ${response.status()}` : errors[errors.length - 1]})`);
      report.runs.push({ route, width, error: response ? response.status() : errors });
      totalFailures++;
      byCheck.page = (byCheck.page ?? 0) + 1;
      await context.close();
      continue;
    }
    await settlePage(page, vp.height);
    const audit = await call(page, (limit) => window.__p7layout.audit(limit), LIMIT);

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
            const m = await call(page, ([blk, limit]) => window.__p7layout.measure(blk, limit), [b.index - 1, LIMIT]);
            sweeps.push({ block: b.index, kind: g.kind, state: `${g.kind} "${g.labels[i]}" (${i + 1}/${g.labels.length})`, height: m.height, space: m.space, columns: m.columns });
            g.states++;
          }
          await call(page, ([blk, grp, item]) => window.__p7layout.activate(blk, grp, item), [b.index - 1, gi, g.initial]);
          await page.waitForTimeout(260);
          await call(page, (blk) => window.__p7layout.idle(blk, 1500), b.index - 1);
        }
      }
    }

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

    const { failures, warnings } = judge(width, audit, sweeps, overflow);
    for (const e of errors) failures.push({ check: "page", where: "page", message: e });
    totalFailures += failures.length;
    totalWarnings += warnings.length;
    for (const f of failures) byCheck[f.check] = (byCheck[f.check] ?? 0) + 1;

    // Per band output.
    const marked = audit.blocks.filter((b) => b.marked).length;
    out(`${route} @${width}  ${fmt(audit.pageHeight)}px, ${audit.blocks.length} blocks in <main> (${marked} marked)  ${failures.length ? `${failures.length} failure${failures.length === 1 ? "" : "s"}` : "all pass"}${warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? "" : "s"}` : ""}`);
    const where = new Map();
    for (const f of [...failures.map((f) => ({ ...f, level: "FAIL" })), ...warnings.map((w) => ({ ...w, level: "warn" }))]) {
      const key = String(f.where);
      if (!where.has(key)) where.set(key, []);
      where.get(key).push(f);
    }
    for (const b of audit.blocks) {
      const states = b.controls.map((g) => `${g.labels.length} ${g.kind}s`).join(", ");
      const extra = [b.skipped ? `skip: ${b.skipped}` : null, b.exempt ? `height exempt: ${b.exempt}` : null, states ? `swept ${states}` : null, !b.skipped && b.space ? `largest empty run ${b.space.largest}px` : null, b.columns?.checked ? `${b.columns.checked} columns balanced` : null].filter(Boolean).join("; ");
      out(`  ${String(b.index).padStart(2)} ${blockName(b)}  ${b.tone ?? "?"}${b.dataTone ? "" : "*"}  y ${fmt(b.top)}  ${fmt(b.height)}px${extra ? `  (${extra})` : ""}`);
      for (const f of where.get(String(b.index)) ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    if (audit.footer) {
      out(`  -- footer  ${audit.footer.tone ?? "?"}  y ${fmt(audit.footer.top)}  ${fmt(audit.footer.height)}px`);
      for (const f of where.get("footer") ?? []) out(`       ${f.level} [${f.check}] ${f.message}`);
    }
    const pageLevel = [...(where.get("page") ?? []), ...(where.get("0") ?? [])];
    for (const f of pageLevel) out(`  page  ${f.level} [${f.check}] ${f.message}`);
    report.runs.push({ route, width, audit, sweeps, overflow, failures, warnings });
    await context.close();
  }
}
await browser.close();

out("");
out(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"}${totalWarnings ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}` : ""} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(" and ")}.`);
for (const [check, n] of Object.entries(byCheck)) out(`  ${CHECK_NAMES[check] ?? check}: ${n}`);
out("  * after a tone: taken from the background because the block has no data-tone.");
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  out(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
