// check:a11y: the accessibility checks of the October 2026 design pass (spec D3, checks 34 to 37), run in
// Playwright against a served build at 1440x900 and 390x844 (isMobile and hasTouch below 800).
//
// Usage: npm run check:a11y -- <baseUrl> [route ...] [--widths 1440,390] [--json report.json]
//   e.g. npm run build && npm run start, then npm run check:a11y -- http://localhost:3000
//
// Each route is loaded, scrolled through and left still until its reveals settle, then:
//
// 34  Keyboard. The expected tab stops are a[href], button, input, select, textarea, summary and
//     [tabindex], with tabIndex 0 or more, not disabled, not inside [inert] or [hidden], with a box and
//     visibility visible (a radio group is one stop). Tab is pressed up to expected + 5 times. It fails
//     when the first stop is not "Skip to content"; an expected stop is never reached, or reached twice;
//     a stop comes before one that precedes it in the DOM; the focused element shows no 2px solid
//     outline (a radio card's label outline or a whole-card link's ::after outline count instead); the
//     ring is under 3:1 against what is painted just outside it (read from the element stack at that
//     point, so a fixed header over a film is judged on the film; a ring over a picture is listed for
//     npm run contrast instead; the skip link is judged as its own box, its text on its fill); or the
//     element's opacity, multiplied down the tree, is under 0.5 once a reveal it starts has settled.
//     Unavailable controls (aria-disabled, disabled) are exempt from the ring contrast and opacity
//     rules, as WCAG exempts inactive components: IconButton's unavailable state is 40% by design.
//     Then each control is worked by keyboard: every tablist (ArrowRight, Home and End move
//     aria-selected and show the panel), every scrolling track (ArrowRight scrolls, End reaches the
//     end), every details (Enter opens and closes it), every part or story button (Enter opens its
//     region), at 390 the menu (Enter opens it, Tab stays inside the header, Escape closes it and
//     focus returns to the button), the calculator (typing updates its status region) and, at 1440,
//     each hover-clip card's link (focus plays the clip).
// 35  Focus not obscured: every focused element's top is at 71px or below, unless it is in the header
//     or is the skip link, which is fixed over the header on purpose (WCAG 2.4.11). Target size: every
//     tab stop is at least 24x24, or has 2.5.8's spacing (a 24px circle on its centre touches no other
//     target), except a link inside a line of text; under 44x44 is a warning. A whole-card link's
//     target is the card its ::after covers; a field's includes its label.
// 36  axe-core (node_modules/axe-core) with the wcag2a, wcag2aa, wcag21a, wcag21aa and wcag22aa tags, on
//     the page at load and on each region an interaction changed. Violations fail. Colour-contrast
//     results axe cannot decide (text over media) are listed for npm run contrast.
// 37  States (1440, fine pointer, CDP CSS.forcePseudoState, header excluded): [data-button],
//     [data-icon-button], .link, .link-list, [data-card] a, input, select, textarea, [role=tab] and
//     [data-accordion] summary. Hover (forced on the element and its ancestors, as a real pointer
//     would) changes the background, colour, border colour, underline thickness or underline colour
//     of the element, of its label (a radio card) or of the spans inside it (a summary's question),
//     and on a card scales its [data-zoom] layer to 1.03; pressed moves a button 1px down
//     (translate 0px 1px); focus-visible draws a 2px solid outline in the surface's --s-focus, offset
//     2px; every transition runs 160 to 240ms ([data-zoom]: 600ms); a primary button's fill or edge
//     is at least 3:1 against its band, and its hover fill is at least 1.3:1 from its rest fill.
//     Selected tabs, expanded-and-unavailable and unavailable controls skip the hover assertion. The
//     coded UI ([data-ui], and the window and app panel before they carry it) keeps its own controls
//     and is not sampled; a primary over a film is left to npm run contrast. Elements that share a
//     tag, classes and surface are sampled twice at most.
//
// Playwright is resolved from this project's node_modules, then from a global install. Exit code: 0 when
// every check passes, 1 when any fails, 2 when the checks could not run.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOT_FOUND = "/this-page-does-not-exist";
const ROUTES = ["/", "/platform", "/commercial", "/homes-and-rentals", "/solar", "/company", "/download", "/register-interest", "/privacy", NOT_FOUND];
const VIEWPORTS = {
  1440: { width: 1440, height: 900 },
  1024: { width: 1024, height: 768 },
  768: { width: 768, height: 1024 },
  390: { width: 390, height: 844 },
};
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const CHECKS = { 34: "keyboard", 35: "focus not obscured, target size", 36: "axe (WCAG 2.2 AA)", 37: "states", page: "page errors" };

function usage() {
  console.log(`Usage: node scripts/check-a11y.mjs <baseUrl> [route ...] [options]

Runs the design pass's accessibility checks (34 keyboard, 35 focus and targets, 36 axe, 37 states).

  <baseUrl>          the served build, e.g. http://localhost:3000 (default)
  route              one or more routes (default: all nine and ${NOT_FOUND})
  --widths 1440,390  viewport widths (1440x900 and 390x844 by default); check 37 runs at 1440
  --json <file>      also write the full report as JSON`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) usage();
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { base: "http://localhost:3000", routes: [], widths: [1440, 390], json: null };
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
  if (!playwright) fail("Playwright was not found in this project or globally.\nInstall it with: npm i -D playwright && npx playwright install chromium");
  return playwright.chromium;
}

// ---------------------------------------------------------------------------------------------------
// In-page library, installed on every document with addInitScript.
// ---------------------------------------------------------------------------------------------------
function pageLib() {
  const A = (window.__p7a11y = {});
  const clean = (s, n = 0) => {
    const t = (s || "").replace(/\s+/g, " ").trim();
    return n && t.length > n ? `${t.slice(0, n - 1)}…` : t;
  };
  let ctx2d = null;
  const cache = new Map();
  const rgba = (colour) => {
    if (!colour || colour === "transparent") return [0, 0, 0, 0];
    if (cache.has(colour)) return cache.get(colour);
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
    cache.set(colour, out);
    return out;
  };
  A.rgba = rgba;
  const lum = ([r, g, b]) => {
    const lin = (c) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  // A colour over a background, composited by its alpha.
  const over = (fg, bg) => {
    const a = fg[3];
    return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1);
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  A.contrast = (fg, bg) => contrast(over(rgba(fg), rgba(bg)), rgba(bg));
  const background = (el) => {
    let layers = [];
    for (let e = el; e; e = e.parentElement) {
      const bg = rgba(getComputedStyle(e).backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 0.99) break;
    }
    let out = [255, 255, 255, 1];
    for (const l of layers.reverse()) out = over(l, out);
    return out;
  };
  A.backgroundOf = (el) => {
    const b = background(el);
    return `rgb(${Math.round(b[0])}, ${Math.round(b[1])}, ${Math.round(b[2])})`;
  };
  // What is painted just outside a box (where a 2px ring at a 2px offset falls): the stack of elements
  // at that point, below the box itself. Media (img, video, canvas, a background image) means the ring
  // sits over a picture whose colour the DOM cannot give: { media: true }. A fixed header over a film
  // is read this way, since the film is not its ancestor.
  A.behind = (el, box = el.getBoundingClientRect()) => {
    const points = [
      [box.left - 3, box.top + box.height / 2],
      [box.right + 3, box.top + box.height / 2],
      [box.left + box.width / 2, box.top - 3],
      [box.left + box.width / 2, box.bottom + 3],
    ].filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
    if (!points.length) return { colour: A.backgroundOf(el.parentElement || el) };
    const [x, y] = points[0];
    const layers = [];
    for (const e of document.elementsFromPoint(x, y)) {
      if (e === el || el.contains(e)) continue;
      const cs = getComputedStyle(e);
      if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName) || (cs.backgroundImage && cs.backgroundImage !== "none" && !/gradient/.test(cs.backgroundImage))) return { media: true, what: describe(e) };
      const bg = rgba(cs.backgroundColor);
      if (bg[3] > 0) layers.push(bg);
      if (bg[3] >= 0.99) break;
    }
    let out = [255, 255, 255, 1];
    for (const l of layers.reverse()) out = over(l, out);
    return { colour: `rgb(${Math.round(out[0])}, ${Math.round(out[1])}, ${Math.round(out[2])})` };
  };
  const opacityProduct = (el) => {
    let o = 1;
    for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity) || 0;
    return o;
  };
  const name = (el) => {
    if (!el) return "";
    const copy = el.cloneNode(true);
    copy.querySelectorAll?.("[aria-hidden='true']").forEach((n) => n.remove());
    const label = el.getAttribute?.("aria-label") || (el.labels && el.labels[0] ? clean(el.labels[0].textContent) : "") || clean(copy.textContent) || el.getAttribute?.("name") || el.id || "";
    return clean(label, 50);
  };
  A.name = name;
  const describe = (el) => {
    if (!el || el.nodeType !== 1) return String(el);
    const n = name(el);
    return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}>${n ? ` "${n}"` : ""}`;
  };
  A.describe = describe;
  const inHeader = (el) => !!el.closest("body > header");
  // Has a box, is visibility:visible, and is not inside skipped content (a closed details' body, which
  // Chromium hides with content-visibility but still lays out when asked).
  const visible = (el) => {
    if (el.getClientRects().length === 0 || getComputedStyle(el).visibility !== "visible") return false;
    // A closed details hides its body, not itself or its summary (so its Enter test still runs).
    const closed = el.closest("details:not([open])");
    if (closed && closed !== el && !(el.tagName === "SUMMARY" && el.parentElement === closed) && !el.closest("details:not([open]) > summary")) return false;
    if (typeof el.checkVisibility === "function" && !el.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true })) return false;
    return true;
  };

  // Check 34: the expected tab stops, in DOM order (a radio group is one stop: its checked or first radio).
  A.expected = () => {
    const sel = "a[href], button, input, select, textarea, summary, [tabindex]";
    const seenRadio = new Set();
    const out = [];
    document.querySelectorAll("[data-a11y-i]").forEach((e) => e.removeAttribute("data-a11y-i"));
    for (const el of document.querySelectorAll(sel)) {
      if (el.tabIndex < 0 || el.disabled || el.closest("[inert], [hidden]") || !visible(el)) continue;
      if (el.type === "hidden") continue;
      if (el.type === "radio" && el.name) {
        if (seenRadio.has(el.name)) continue;
        seenRadio.add(el.name);
        const group = [...document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`)];
        const pick = group.find((r) => r.checked) || el;
        pick.setAttribute("data-a11y-i", String(out.length));
        out.push({ i: out.length, what: describe(pick), header: inHeader(pick) });
        continue;
      }
      el.setAttribute("data-a11y-i", String(out.length));
      out.push({ i: out.length, what: describe(el), header: inHeader(el) });
    }
    return out;
  };

  // The ring of the focused element: its own outline, a radio card's label outline, or a whole-card
  // link's ::after outline. Contrast is taken against what is behind the ring.
  const ringOf = (el) => {
    const candidates = [];
    const own = getComputedStyle(el);
    candidates.push({ where: "outline", cs: own, bgEl: el.parentElement || el });
    const after = getComputedStyle(el, "::after");
    if (after.content && after.content !== "none") candidates.push({ where: "::after outline", cs: after, bgEl: el.closest("[data-card]") || el.parentElement || el });
    const label = el.closest("label") || (el.labels && el.labels[0]);
    if (label) candidates.push({ where: "label outline", cs: getComputedStyle(label), bgEl: label.parentElement || label });
    for (const c of candidates) {
      const w = parseFloat(c.cs.outlineWidth) || 0;
      if (c.cs.outlineStyle === "solid" && Math.abs(w - 2) < 0.01) {
        const ringBox = c.where === "outline" ? el : c.where === "label outline" ? el.closest("label") || el.labels[0] : el.closest("[data-card]") || el.parentElement;
        const behind = A.behind(ringBox);
        return { ok: true, where: c.where, colour: c.cs.outlineColor, offset: c.cs.outlineOffset, bg: behind.colour ?? null, media: !!behind.media, over: behind.what ?? null };
      }
    }
    const o = own;
    return { ok: false, found: `${o.outlineStyle} ${o.outlineWidth} ${o.outlineColor}` };
  };

  A.focused = () => {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    if (!el || el === document.body || el === document.documentElement) return null;
    const r = el.getBoundingClientRect();
    const skip = /skip to content/i.test(name(el));
    const ring = ringOf(el);
    let ringContrast = null;
    if (skip) ringContrast = A.contrast(getComputedStyle(el).color, A.backgroundOf(el));
    else if (ring.ok && !ring.media) ringContrast = A.contrast(ring.colour, ring.bg);
    return {
      i: el.hasAttribute("data-a11y-i") ? Number(el.getAttribute("data-a11y-i")) : null,
      what: describe(el),
      name: name(el),
      skip,
      header: inHeader(el),
      top: Math.round(r.top * 10) / 10,
      ring,
      ringContrast: ringContrast === null ? null : Math.round(ringContrast * 100) / 100,
      opacity: Math.round(opacityProduct(el) * 100) / 100,
      // An unavailable control is exempt from the contrast and visibility rules (WCAG 1.4.11's
      // inactive components): IconButton's unavailable state is 40% opacity by design (B7).
      unavailable: el.matches("[aria-disabled='true'], :disabled"),
      media: el.tagName === "VIDEO" || el.tagName === "AUDIO",
    };
  };
  // Every [data-reveal] still hidden after a scroll-through (a slow frame can pass one): bring it in.
  A.hiddenReveals = () => [...document.querySelectorAll("[data-reveal]")].filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length;
  A.showNextReveal = () => {
    const e = [...document.querySelectorAll("[data-reveal]")].find((x) => Number(getComputedStyle(x).opacity) < 0.99);
    if (!e) return false;
    e.scrollIntoView({ block: "center" });
    return true;
  };

  // Check 35: target sizes of the expected stops. An undersized target still passes 2.5.8 when a 24px
  // circle on its centre touches no other target and no other undersized target's circle.
  A.targets = () => {
    const out = [];
    for (const el of document.querySelectorAll("[data-a11y-i]")) {
      if (!visible(el) || /skip to content/i.test(name(el))) continue;
      let r = el.getBoundingClientRect();
      let w = r.width;
      let h = r.height;
      // A whole-card link's target is its ::after, which covers the card.
      const after = getComputedStyle(el, "::after");
      if (after.content && after.content !== "none" && after.position === "absolute") {
        const card = el.closest("[data-card]") || el.offsetParent;
        if (card) {
          const cr = card.getBoundingClientRect();
          w = Math.max(w, cr.width);
          h = Math.max(h, cr.height);
        }
      }
      // A field's label is part of its target.
      for (const l of el.labels || []) {
        const lr = l.getBoundingClientRect();
        if (lr.width * lr.height > w * h) {
          w = lr.width;
          h = lr.height;
        }
      }
      // A link inside a line of text is exempt (2.5.8's inline exception).
      const cs = getComputedStyle(el);
      const parentText = clean(el.parentElement?.textContent || "");
      const inline = el.tagName === "A" && cs.display === "inline" && parentText.length > clean(el.textContent).length + 1;
      const box = el.getBoundingClientRect();
      out.push({ what: describe(el), w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10, inline, header: inHeader(el), rect: { l: box.left, t: box.top + scrollY, r: box.right, b: box.bottom + scrollY }, cx: box.left + box.width / 2, cy: box.top + scrollY + box.height / 2 });
    }
    const small = (t) => t.w < 24 || t.h < 24;
    const circleHitsRect = (cx, cy, rad, r) => {
      const dx = Math.max(r.l - cx, 0, cx - r.r);
      const dy = Math.max(r.t - cy, 0, cy - r.b);
      return dx * dx + dy * dy < rad * rad;
    };
    for (const t of out) {
      if (!small(t)) continue;
      t.spaced = !out.some((o) => o !== t && (circleHitsRect(t.cx, t.cy, 12, o.rect) || (small(o) && Math.hypot(o.cx - t.cx, o.cy - t.cy) < 24)));
    }
    return out.map(({ rect, cx, cy, ...rest }) => rest);
  };

  // Interactions.
  const regionOf = (tab) => {
    const id = tab.getAttribute("aria-controls");
    let panel = id ? document.getElementById(id) : null;
    if (!panel && tab.id) panel = document.querySelector(`[role="tabpanel"][aria-labelledby~="${CSS.escape(tab.id)}"]`);
    return panel;
  };
  A.tablists = () =>
    [...document.querySelectorAll("main [role='tablist']")].filter(visible).map((list, i) => {
      list.setAttribute("data-a11y-tl", String(i));
      const tabs = [...list.querySelectorAll("[role='tab']")].filter(visible);
      return { i, n: tabs.length, label: list.getAttribute("aria-label") || describe(list) };
    });
  A.tabState = (i) => {
    const list = document.querySelector(`[data-a11y-tl="${i}"]`);
    if (!list) return null;
    const tabs = [...list.querySelectorAll("[role='tab']")].filter(visible);
    const sel = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const panel = sel >= 0 ? regionOf(tabs[sel]) : null;
    const focus = tabs.indexOf(document.activeElement);
    return { n: tabs.length, selected: sel, focus, panelShown: !!panel && visible(panel) && !panel.hidden, panelOpaque: !!panel && opacityProduct(panel) >= 0.99, panel: panel ? `#${panel.id}` : null };
  };
  A.focusTab = (i, which) => {
    const list = document.querySelector(`[data-a11y-tl="${i}"]`);
    const tabs = [...list.querySelectorAll("[role='tab']")].filter(visible);
    const t = which === "selected" ? tabs.find((x) => x.getAttribute("aria-selected") === "true") || tabs[0] : tabs[which];
    t.scrollIntoView({ block: "center" });
    t.focus();
    return true;
  };
  A.tracks = () =>
    [...document.querySelectorAll("main ul, main ol")]
      .filter((ul) => /(auto|scroll)/.test(getComputedStyle(ul).overflowX) && ul.scrollWidth > ul.clientWidth + 2 && visible(ul))
      .map((ul, i) => {
        ul.setAttribute("data-a11y-tr", String(i));
        return { i, focusable: ul.tabIndex >= 0, label: ul.getAttribute("aria-label") || describe(ul) };
      });
  A.trackState = (i) => {
    const ul = document.querySelector(`[data-a11y-tr="${i}"]`);
    return ul ? { left: ul.scrollLeft, max: ul.scrollWidth - ul.clientWidth } : null;
  };
  A.focusTrack = (i) => {
    const ul = document.querySelector(`[data-a11y-tr="${i}"]`);
    ul.scrollIntoView({ block: "center" });
    ul.scrollLeft = 0;
    ul.focus();
    return document.activeElement === ul;
  };
  A.details = () =>
    [...document.querySelectorAll("main details")].filter((d) => visible(d) && !d.closest("[data-ui], [data-software-preview]")).map((d, i) => {
      d.setAttribute("data-a11y-d", String(i));
      return { i, open: d.open, label: name(d.querySelector("summary")) };
    });
  A.focusSummary = (i) => {
    const d = document.querySelector(`[data-a11y-d="${i}"]`);
    const s = d.querySelector("summary");
    s.scrollIntoView({ block: "center" });
    s.focus();
    return document.activeElement === s;
  };
  A.detailsOpen = (i) => document.querySelector(`[data-a11y-d="${i}"]`)?.open ?? null;
  A.disclosures = () =>
    [...document.querySelectorAll("main h3 button[aria-expanded][aria-controls]")].filter(visible).map((b, i) => {
      b.setAttribute("data-a11y-b", String(i));
      return { i, expanded: b.getAttribute("aria-expanded") === "true", label: name(b), id: b.id };
    });
  A.focusDisclosure = (i) => {
    const b = document.querySelector(`[data-a11y-b="${i}"]`);
    b.scrollIntoView({ block: "center" });
    b.focus();
    return document.activeElement === b;
  };
  A.disclosureState = (i) => {
    const b = document.querySelector(`[data-a11y-b="${i}"]`);
    if (!b) return null;
    const region = document.getElementById(b.getAttribute("aria-controls"));
    return { expanded: b.getAttribute("aria-expanded") === "true", regionShown: !!region && visible(region) && !region.hidden, region: region ? `#${region.id}` : null };
  };
  A.burger = () => {
    const b = [...document.querySelectorAll("body > header button[aria-controls][aria-expanded]")].find(visible);
    if (!b) return null;
    b.setAttribute("data-a11y-burger", "");
    return { label: name(b), expanded: b.getAttribute("aria-expanded") === "true" };
  };
  A.menuState = () => {
    const b = document.querySelector("[data-a11y-burger]");
    const menu = b ? document.getElementById(b.getAttribute("aria-controls")) : null;
    const f = document.activeElement;
    return { expanded: b?.getAttribute("aria-expanded") === "true", menuShown: !!menu && visible(menu), focusInHeader: !!f && !!f.closest("body > header"), focusOnBurger: f === b, focus: describe(f) };
  };
  A.calc = () => {
    const form = document.querySelector("[data-calculator]");
    if (!form) return null;
    const status = form.querySelector("[role='status'], [aria-live]");
    return { status: status ? clean(status.textContent) : null, spend: !!form.querySelector("#cost-spend"), area: !!form.querySelector("#cost-area") };
  };
  A.clips = () =>
    [...document.querySelectorAll("[data-hover-clip]")].map((el, i) => {
      el.setAttribute("data-a11y-clip", String(i));
      const card = el.closest("[data-card]") || el;
      const link = card.querySelector("a[href]");
      if (link) link.setAttribute("data-a11y-clip-link", String(i));
      return { i, link: !!link, video: !!el.querySelector("video"), label: name(card.querySelector("h3") || card) };
    });
  A.clipPlaying = (i) => {
    const v = document.querySelector(`[data-a11y-clip="${i}"] video`);
    return !!v && !v.paused && !v.ended;
  };
  A.selectorFor = (attr, i) => `[${attr}="${i}"]`;
  // Resolves once a region has finished fading in: no running animation or transition inside it and
  // its opacity, multiplied up the tree, at 1 (or the timeout passes). axe measures contrast as painted.
  A.settled = (sel, timeout = 3000) =>
    new Promise((resolve) => {
      const t0 = performance.now();
      const tick = () => {
        const el = document.querySelector(sel);
        const busy = !!el && document.getAnimations().some((a) => a.playState === "running" && a.effect?.target && (el.contains(a.effect.target) || a.effect.target.contains(el)) && a.effect.getTiming?.().iterations !== Infinity);
        const faded = !!el && opacityProduct(el) < 0.99;
        if ((!busy && !faded) || performance.now() - t0 > timeout) requestAnimationFrame(() => resolve(!busy && !faded));
        else setTimeout(tick, 50);
      };
      tick();
    });

  // Check 37: the elements whose states are asserted, sampled by tag, classes and surface.
  A.stateTargets = (perSignature) => {
    const sel = "[data-button], [data-icon-button], .link, .link-list, [data-card] a, input, select, textarea, [role='tab'], [data-accordion] summary";
    const seen = new Map();
    const out = [];
    document.querySelectorAll("[data-a11y-s]").forEach((e) => e.removeAttribute("data-a11y-s"));
    for (const el of document.querySelectorAll(sel)) {
      // The header is frozen, and the coded UI ([data-ui], and the window and app panel before they carry
      // it) keeps its own controls: the state system is the site's primitives.
      if (el.closest("body > header, [data-ui], [data-software-preview], [role='group'][aria-label$='demo window'], [role='group'][aria-label$='demo data']") || !visible(el) || el.type === "hidden") continue;
      const surface = lum(background(el)) > 0.4 ? "light" : "dark";
      const sig = `${el.tagName}|${typeof el.className === "string" ? el.className : ""}|${el.getAttribute("data-button") ?? ""}|${surface}`;
      const n = seen.get(sig) ?? 0;
      if (n >= perSignature) continue;
      seen.set(sig, n + 1);
      el.setAttribute("data-a11y-s", String(out.length));
      const kind = el.matches("[data-button]") ? `[data-button="${el.getAttribute("data-button")}"]` : el.matches("[data-icon-button]") ? "[data-icon-button]" : el.matches("[data-card] a") ? "[data-card] a" : el.matches(".link-list") ? ".link-list" : el.matches(".link") ? ".link" : el.matches("[role='tab']") ? "[role=tab]" : el.matches("summary") ? "summary" : el.tagName.toLowerCase();
      out.push({ i: out.length, kind, what: describe(el), surface, skipHover: el.matches("[aria-selected='true'], [aria-disabled='true']"), pressable: el.matches("[data-button], [data-icon-button]") && !el.matches("[aria-disabled='true'], :disabled") });
    }
    return out;
  };
  // Marks the element and its ancestors, so the Node side can force :hover down the whole chain.
  A.markChain = (i) => {
    document.querySelectorAll("[data-a11y-h]").forEach((e) => e.removeAttribute("data-a11y-h"));
    let n = 0;
    for (let e = document.querySelector(`[data-a11y-s="${i}"]`); e && e !== document.documentElement; e = e.parentElement) e.setAttribute("data-a11y-h", String(n++));
    return n;
  };
  A.style = (i) => {
    const el = document.querySelector(`[data-a11y-s="${i}"]`);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const card = el.closest("[data-card]");
    const zoom = card ? card.querySelector("[data-zoom]") : null;
    const after = getComputedStyle(el, "::after");
    const label = el.closest("label") || (el.labels && el.labels[0]) || null;
    const lcs = label ? getComputedStyle(label) : null;
    // A radio or checkbox inside a card label shows its states on the label (B11's radio card).
    const wrapped = !!el.closest("label") && (el.type === "radio" || el.type === "checkbox");
    // What its children show: a disclosure's summary underlines its question span, not itself (B17).
    const innerLook = [...el.querySelectorAll("span, svg")]
      .slice(0, 6)
      .map((c) => {
        const k = getComputedStyle(c);
        return `${k.color} ${k.backgroundColor} ${k.textDecorationLine} ${k.textDecorationColor} ${k.textDecorationThickness}`;
      })
      .join("|");
    return {
      innerLook,
      labelLook: wrapped && lcs ? `${lcs.backgroundColor} ${lcs.borderTopColor} ${lcs.color}` : null,
      bg: cs.backgroundColor,
      color: cs.color,
      border: `${cs.borderTopColor} ${cs.borderRightColor} ${cs.borderBottomColor} ${cs.borderLeftColor}`,
      borderColor: cs.borderTopColor,
      borderWidth: parseFloat(cs.borderTopWidth) || 0,
      thickness: cs.textDecorationThickness,
      decoColor: `${cs.textDecorationLine} ${cs.textDecorationColor}`,
      translate: cs.translate,
      outline: { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor, offset: cs.outlineOffset },
      afterOutline: after.content && after.content !== "none" ? { style: after.outlineStyle, width: after.outlineWidth, color: after.outlineColor, offset: after.outlineOffset } : null,
      labelOutline: lcs ? { style: lcs.outlineStyle, width: lcs.outlineWidth, color: lcs.outlineColor, offset: lcs.outlineOffset } : null,
      focusToken: cs.getPropertyValue("--s-focus").trim(),
      zoom: zoom ? getComputedStyle(zoom).scale : null,
      zoomTransition: zoom ? { property: getComputedStyle(zoom).transitionProperty, duration: getComputedStyle(zoom).transitionDuration } : null,
      transition: { property: cs.transitionProperty, duration: cs.transitionDuration },
      band: A.behind(el).colour ?? null,
      bandMedia: !!A.behind(el).media,
    };
  };
  A.sameColour = (a, b) => {
    const x = rgba(a);
    const y = rgba(b);
    return x.every((v, i) => Math.abs(v - y[i]) <= (i === 3 ? 0.02 : 2));
  };
}

// ---------------------------------------------------------------------------------------------------
// Node side.
// ---------------------------------------------------------------------------------------------------
const opts = parseArgs(process.argv.slice(2));
const chromium = loadChromium();
const AXE_PATH = path.join(ROOT, "node_modules/axe-core/axe.min.js");
if (!existsSync(AXE_PATH)) fail("axe-core is not installed (node_modules/axe-core/axe.min.js). Run npm ci.");
const axeSource = readFileSync(AXE_PATH, "utf8");
const axeVersion = JSON.parse(readFileSync(path.join(ROOT, "node_modules/axe-core/package.json"), "utf8")).version;

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
  fail(`Chromium could not start: ${String(err.message).split("\n")[0]}`);
}

const A = (page, name, ...args) => page.evaluate(([n, a]) => window.__p7a11y[n](...a), [name, args]);
const wait = (page, ms) => page.waitForTimeout(ms);

async function newPage(width, extra = {}) {
  const vp = VIEWPORTS[width] ?? { width, height: width < 800 ? 844 : 900 };
  const mobile = width < 800;
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, ...extra });
  await context.addInitScript(pageLib);
  const page = await context.newPage();
  return { context, page, vp, mobile };
}

async function load(page, route) {
  try {
    const res = await page.goto(opts.base + route, { waitUntil: "networkidle", timeout: 60000 });
    const status = res ? res.status() : 0;
    if (!res || (status >= 400 && !(route === NOT_FOUND && status === 404))) return `HTTP ${res ? status : "no response"}`;
  } catch (err) {
    return String(err.message).split("\n")[0];
  }
  return null;
}

// Scroll through so reveals and lazy media settle, then back to the top.
async function settle(page, vh) {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(vh * 0.6)) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await wait(page, 110);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await wait(page, 300);
  const hidden = await A(page, "hiddenReveals");
  for (let i = 0; i < hidden; i++) {
    if (!(await A(page, "showNextReveal"))) break;
    await wait(page, 750);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(page, 900);
}

// Check 36: axe on the document or one region. Violations, and contrast results axe could not decide.
async function axe(page, scope = null) {
  const has = await page.evaluate(() => typeof window.axe !== "undefined");
  if (!has) await page.addScriptTag({ content: axeSource });
  return page.evaluate(
    async ([sel, tags]) => {
      const ctx = sel ? document.querySelector(sel) : document;
      if (!ctx) return { violations: [], incomplete: [] };
      const r = await window.axe.run(ctx, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations", "incomplete"] });
      const pick = (list) => list.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target.join(" "), html: n.html.slice(0, 120), summary: (n.failureSummary || "").split("\n").slice(0, 2).join(" ") })), count: v.nodes.length }));
      return { violations: pick(r.violations), incomplete: pick(r.incomplete.filter((v) => v.id === "color-contrast")) };
    },
    [scope, AXE_TAGS],
  );
}

const report = { base: opts.base, when: new Date().toISOString(), axe: axeVersion, runs: [] };
let totalFailures = 0;
let totalWarnings = 0;
const byCheck = {};

console.log(`check:a11y  ${opts.base}`);
console.log(`Checks 34 (keyboard), 35 (focus not obscured, targets), 36 (axe-core ${axeVersion}, ${AXE_TAGS.join(", ")}) and 37 (states, at 1440) at ${opts.widths.join(" and ")}`);

for (const route of opts.routes) {
  for (const width of opts.widths) {
    const failures = [];
    const warnings = [];
    const notes = [];
    const add = (check, kind, sample = "") => failures.push({ check, kind, sample });
    const warn = (check, kind, sample = "") => warnings.push({ check, kind, sample });
    const { context, page, vp, mobile } = await newPage(width);
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).split("\n")[0]}`));
    const err = await load(page, route);
    console.log("");
    if (err) {
      console.log(`${route} @${width}  FAIL could not load (${err})`);
      totalFailures++;
      await context.close();
      continue;
    }
    await settle(page, vp.height);

    // Check 36 at load.
    const contrastToReview = new Set();
    const judgeAxe = (res, where) => {
      for (const v of res.violations) add(36, `${v.id} (${v.impact}): ${v.help}${where ? `, ${where}` : ""}`, v.nodes.map((n) => `${n.target}${n.summary ? ` (${n.summary.slice(0, 140)})` : ""}`).join("; "));
      for (const v of res.incomplete) for (const n of v.nodes) contrastToReview.add(n.target);
    };
    judgeAxe(await axe(page), "");

    // Check 34: the Tab walk from the top of the page.
    const expected = await A(page, "expected");
    const targets = await A(page, "targets");
    // Start from the top of the document: focus a temporary, unfocusable-by-Tab marker placed before
    // everything else, so the first Tab goes to the first stop in DOM order.
    await page.evaluate(() => {
      document.activeElement?.blur?.();
      window.scrollTo(0, 0);
      const start = document.createElement("div");
      start.tabIndex = -1;
      start.id = "p7-a11y-start";
      document.body.prepend(start);
      start.focus({ preventScroll: true });
    });
    const videosWithControls = await page.evaluate(() => [...document.querySelectorAll("video[controls], audio[controls]")].length);
    const budget = expected.length + 5 + videosWithControls * 8;
    const stops = [];
    let firstKey = null;
    for (let k = 0; k < budget; k++) {
      await page.keyboard.press("Tab");
      if (k === 0) await page.evaluate(() => document.getElementById("p7-a11y-start")?.remove());
      const f = await A(page, "focused");
      if (!f) {
        if (stops.length) break; // focus left the document: the cycle is complete
        continue;
      }
      const key = f.i !== null ? `i${f.i}` : f.what;
      if (firstKey === null) firstKey = key;
      else if (key === firstKey && stops.length > 2) break; // wrapped round to the start
      // A reveal or crossfade that the focus scroll just started: judge it once it has settled (a live
      // 3D scene can starve a headless page's frames, so this waits up to 3s).
      for (let t = 0; t < 12 && f.opacity < 0.5 && !f.unavailable; t++) {
        await wait(page, 250);
        const again = await A(page, "focused");
        if (!again) break;
        f.opacity = again.opacity;
        f.ring = again.ring;
        f.ringContrast = again.ringContrast;
      }
      stops.push(f);
    }
    const reached = new Map();
    const ringsOverMedia = new Set();
    let lastIndex = -1;
    for (const [n, f] of stops.entries()) {
      if (n === 0 && !f.skip) add(34, 'the first tab stop is not "Skip to content"', `it is ${f.what}`);
      if (f.i !== null) {
        reached.set(f.i, (reached.get(f.i) ?? 0) + 1);
        if (f.i < lastIndex) add(34, "the tab order breaks DOM order", `${f.what} comes after ${expected[lastIndex]?.what}`);
        lastIndex = Math.max(lastIndex, f.i);
      }
      if (f.media) continue; // a native media control draws its own focus inside its shadow root
      if (f.skip) {
        if (f.ringContrast !== null && f.ringContrast < 3) add(34, "the skip link's box is under 3:1", `${f.ringContrast}:1`);
      } else if (!f.ring.ok) add(34, "no 2px solid focus outline on the focused element", `${f.what} (outline ${f.ring.found})`);
      else if (f.ring.media) ringsOverMedia.add(`${f.what} over ${f.ring.over}`);
      else if (f.ringContrast !== null && f.ringContrast < 3 && !f.unavailable) add(34, "the focus ring is under 3:1 against what is behind it", `${f.what} (${f.ring.where} ${f.ring.colour} on ${f.ring.bg}: ${f.ringContrast}:1)`);
      if (f.opacity < 0.5 && !f.unavailable) add(34, "a focused element is nearly invisible (opacity under 0.5)", `${f.what} (opacity ${f.opacity}, 3s after focus)`);
      // Check 35: not hidden under the header (the skip link is drawn over it, fixed, on purpose).
      if (!f.header && !f.skip && f.top < 71) add(35, "a focused element sits under the header (top above 71px; WCAG 2.4.11)", `${f.what} (top ${f.top}px)`);
    }
    for (const e of expected) {
      const n = reached.get(e.i) ?? 0;
      if (n === 0) add(34, "a tab stop is never reached by Tab", e.what);
      else if (n > 1) add(34, "a tab stop is reached twice in one pass", e.what);
    }
    notes.push(`34: ${expected.length} expected stops, ${stops.length} reached${videosWithControls ? ` (${videosWithControls} media element${videosWithControls === 1 ? "" : "s"} with native controls)` : ""}`);
    if (ringsOverMedia.size) notes.push(`34: ${ringsOverMedia.size} focus ring${ringsOverMedia.size === 1 ? "" : "s"} over media, not measured here (npm run contrast covers the header over the film): ${[...ringsOverMedia].slice(0, 4).join("; ")}${ringsOverMedia.size > 4 ? "; …" : ""}`);

    // Check 35: target sizes.
    for (const t of targets) {
      if (t.inline) continue;
      if ((t.w < 24 || t.h < 24) && !t.spaced) add(35, "a target smaller than 24x24 without 24px of clear space (WCAG 2.5.8)", `${t.what} (${t.w}x${t.h})`);
      else if (t.w < 44 || t.h < 44) warn(35, `a target under 44x44${t.w < 24 || t.h < 24 ? " (passes 2.5.8 on spacing)" : ""}`, `${t.what} (${t.w}x${t.h})`);
    }

    // Check 34, interactions; check 36 again on each region they change.
    await page.evaluate(() => document.activeElement?.blur?.());
    const tablists = await A(page, "tablists");
    // A panel may crossfade in, and a live 3D window on the page slows every frame in a headless
    // browser: each state is read once it settles, within 4s.
    const tabSettled = async (i, test) => {
      let st = null;
      for (let k = 0; k < 40; k++) {
        await wait(page, 100);
        st = await A(page, "tabState", i);
        if (test(st)) break;
      }
      return st;
    };
    for (const tl of tablists) {
      const before = await A(page, "tabState", tl.i);
      await A(page, "focusTab", tl.i, "selected");
      await page.keyboard.press("ArrowRight");
      const right = await tabSettled(tl.i, (st) => st.selected === (before.selected + 1) % before.n && st.panelShown && st.panelOpaque);
      const want = (before.selected + 1) % before.n;
      if (right.selected !== want) add(34, "ArrowRight does not move aria-selected to the next tab", `${tl.label} (selected ${right.selected + 1} of ${right.n}, expected ${want + 1})`);
      else if (!right.panelShown) add(34, "the selected tab's panel is not shown", `${tl.label} (${right.panel ?? "no panel"})`);
      if (right.panel && right.panelShown) {
        await A(page, "settled", right.panel);
        judgeAxe(await axe(page, right.panel), `in ${right.panel} after ArrowRight`);
      }
      await page.keyboard.press("End");
      const end = await tabSettled(tl.i, (st) => st.selected === st.n - 1 && st.panelShown);
      if (end.selected !== end.n - 1) add(34, "End does not select the last tab", `${tl.label} (selected ${end.selected + 1} of ${end.n})`);
      else if (!end.panelShown) add(34, "the last tab's panel is not shown", tl.label);
      await page.keyboard.press("Home");
      const home = await tabSettled(tl.i, (st) => st.selected === 0);
      if (home.selected !== 0) add(34, "Home does not select the first tab", `${tl.label} (selected ${home.selected + 1} of ${home.n})`);
      // Back to the tab it started on.
      if (before.selected > 0) {
        await A(page, "focusTab", tl.i, before.selected);
        await page.keyboard.press("Enter");
        await wait(page, 200);
      }
    }
    const tracks = await A(page, "tracks");
    for (const t of tracks) {
      if (!t.focusable) {
        add(34, "a scrolling track cannot take focus (tabindex 0 while it scrolls)", t.label);
        continue;
      }
      await A(page, "focusTrack", t.i);
      await wait(page, 300);
      const s0 = await A(page, "trackState", t.i);
      // Smooth scrolling is slow on a busy headless page: poll up to 2.5s.
      const until = async (test) => {
        let st = null;
        for (let k = 0; k < 25; k++) {
          await wait(page, 100);
          st = await A(page, "trackState", t.i);
          if (test(st)) break;
        }
        return st;
      };
      await page.keyboard.press("ArrowRight");
      const s1 = await until((st) => st.left > s0.left + 1);
      if (!(s1.left > s0.left + 1)) add(34, "ArrowRight does not scroll the track", `${t.label} (scrollLeft ${Math.round(s0.left)} to ${Math.round(s1.left)} after 2.5s)`);
      await page.keyboard.press("End");
      const s2 = await until((st) => st.left >= st.max - 2);
      if (s2.left < s2.max - 2) add(34, "End does not reach the end of the track", `${t.label} (scrollLeft ${Math.round(s2.left)} of ${Math.round(s2.max)} after 2.5s)`);
      await page.keyboard.press("Home");
      await until((st) => st.left <= 1);
    }
    const details = await A(page, "details");
    for (const d of details) {
      await A(page, "focusSummary", d.i);
      await page.keyboard.press("Enter");
      await wait(page, 150);
      const open = await A(page, "detailsOpen", d.i);
      if (open === d.open) add(34, "Enter does not toggle a details", d.label);
      else if (open) {
        await A(page, "settled", `[data-a11y-d="${d.i}"]`);
        judgeAxe(await axe(page, `[data-a11y-d="${d.i}"]`), `in the open details "${d.label}"`);
      }
      await page.keyboard.press("Enter");
      await wait(page, 150);
      if ((await A(page, "detailsOpen", d.i)) !== d.open) add(34, "Enter does not toggle a details back", d.label);
    }
    const disclosures = await A(page, "disclosures");
    const initiallyOpen = disclosures.filter((d) => d.expanded).map((d) => d.i);
    for (const d of disclosures.filter((x) => !x.expanded)) {
      await A(page, "focusDisclosure", d.i);
      await page.keyboard.press("Enter");
      await wait(page, 400);
      const st = await A(page, "disclosureState", d.i);
      if (!st?.expanded) add(34, "Enter does not open a part or story button's region", d.label);
      else if (!st.regionShown) add(34, "the opened region is not shown", `${d.label} (${st.region ?? "no region"})`);
      else {
        await A(page, "settled", st.region);
        judgeAxe(await axe(page, st.region), `in ${st.region}`);
      }
    }
    for (const i of initiallyOpen) {
      await A(page, "focusDisclosure", i);
      const st = await A(page, "disclosureState", i);
      if (!st?.expanded) {
        await page.keyboard.press("Enter");
        await wait(page, 300);
      }
    }
    const calc = await A(page, "calc");
    if (calc) {
      if (!calc.spend || !calc.area) add(34, "the calculator has no #cost-area or #cost-spend to type into");
      else {
        await page.focus("#cost-area");
        await page.keyboard.type("2000");
        await page.focus("#cost-spend");
        await page.keyboard.type("30000");
        let status = "";
        for (let t = 0; t < 15; t++) {
          await wait(page, 100);
          status = (await A(page, "calc")).status ?? "";
          if (/\$\d/.test(status)) break;
        }
        if (!/\$\d/.test(status)) add(34, "typing into the calculator does not update its status region within 1.5s", `"${status}"`);
        judgeAxe(await axe(page, "[data-calculator]"), "in the calculator after typing");
      }
    }
    if (!mobile) {
      const clips = await A(page, "clips");
      for (const c of clips) {
        if (!c.link) {
          add(34, "a hover-clip card has no link to focus", c.label);
          continue;
        }
        await page.keyboard.press("Tab"); // keyboard modality
        await page.focus(`[data-a11y-clip-link="${c.i}"]`);
        let playing = false;
        for (let t = 0; t < 15 && !playing; t++) {
          await wait(page, 100);
          playing = await A(page, "clipPlaying", c.i);
        }
        if (!playing) add(34, "focusing a hover-clip card's link does not play its clip", c.label);
        await page.evaluate(() => document.activeElement?.blur?.());
      }
    }
    const burger = await A(page, "burger");
    if (mobile && burger) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.focus("[data-a11y-burger]");
      await page.keyboard.press("Enter");
      await wait(page, 500);
      const opened = await A(page, "menuState");
      if (!opened.expanded || !opened.menuShown) add(34, "Enter on the menu button does not open the menu", burger.label);
      else {
        await A(page, "settled", "body > header");
        judgeAxe(await axe(page, "body > header"), "in the open menu");
        let escaped = null;
        for (let t = 0; t < 30; t++) {
          await page.keyboard.press("Tab");
          const st = await A(page, "menuState");
          if (!st.focusInHeader) {
            escaped = st.focus;
            break;
          }
        }
        if (escaped) add(34, "Tab leaves the open menu (it should wrap inside the header)", `focus reached ${escaped}`);
        await page.keyboard.press("Escape");
        await wait(page, 400);
        const closed = await A(page, "menuState");
        if (closed.expanded || closed.menuShown) add(34, "Escape does not close the menu");
        if (!closed.focusOnBurger) add(34, "focus does not return to the menu button after Escape", `focus is on ${closed.focus}`);
      }
    }
    notes.push(`34: worked ${tablists.length} tablist${tablists.length === 1 ? "" : "s"}, ${tracks.length} track${tracks.length === 1 ? "" : "s"}, ${details.length} details, ${disclosures.length} part or story button${disclosures.length === 1 ? "" : "s"}${calc ? ", the calculator" : ""}${mobile && burger ? ", the menu" : ""}`);
    if (contrastToReview.size) notes.push(`36: axe could not decide the contrast of ${contrastToReview.size} element${contrastToReview.size === 1 ? "" : "s"} (text over media; check with npm run contrast): ${[...contrastToReview].slice(0, 6).join(", ")}${contrastToReview.size > 6 ? ", …" : ""}`);
    await context.close();

    // Check 37: states, at 1440 on a fine pointer, on a fresh load.
    if (width === 1440) await statesPass(route, add, notes);

    for (const e of errors) add("page", e);
    printRun(route, width, failures, warnings, notes);
  }
}

async function statesPass(route, add, notes) {
  const { context, page } = await newPage(1440);
  try {
    const err = await load(page, route);
    if (err) return add(37, "could not load the route for the states pass", err);
    await settle(page, 900);
    const cdp = await context.newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const targets = await A(page, "stateTargets", 2);
    // Node ids last until the next DOM.getDocument, so each element takes one document and both queries.
    const nodeIds = async (...selectors) => {
      const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
      const out = [];
      for (const selector of selectors) out.push((await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector })).nodeIds);
      return out;
    };
    const force = async (ids, classes) => {
      for (const nodeId of ids) await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: classes });
    };
    const fmtColour = (c) => c.replace(/\s+/g, " ");
    let checked = 0;
    for (const t of targets) {
      await page.evaluate((i) => document.querySelector(`[data-a11y-s="${i}"]`)?.scrollIntoView({ block: "center" }), t.i);
      await wait(page, 60);
      // Transition timings, read with transitions live.
      const live = await A(page, "style", t.i);
      if (!live) continue;
      checked++;
      const props = live.transition.property.split(",").map((s) => s.trim());
      const durs = live.transition.duration.split(",").map((s) => parseFloat(s));
      props.forEach((p, k) => {
        const d = durs[k % durs.length];
        if (p === "none" || !(d > 0)) return;
        if (d < 0.16 || d > 0.24) add(37, "a transition outside 160-240ms", `${t.what} (${p} ${Math.round(d * 1000)}ms)`);
      });
      if (live.zoomTransition) {
        const zd = live.zoomTransition.duration.split(",").map((s) => parseFloat(s));
        if (!zd.some((d) => Math.abs(d - 0.6) < 0.001)) add(37, "a card's [data-zoom] layer does not transition over 600ms", `${t.what} (${live.zoomTransition.property} ${live.zoomTransition.duration})`);
      }
      // States, read with transitions off so each value is the state's own.
      const freeze = await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });
      const rest = await A(page, "style", t.i);
      await A(page, "markChain", t.i);
      const [chain, [self]] = await nodeIds("[data-a11y-h]", `[data-a11y-s="${t.i}"]`);
      // Hover, on the element and every ancestor, as a real pointer would.
      if (!t.skipHover) {
        await force(chain, ["hover"]);
        const hover = await A(page, "style", t.i);
        await force(chain, []);
        const changed = rest.bg !== hover.bg || rest.color !== hover.color || rest.border !== hover.border || rest.thickness !== hover.thickness || rest.decoColor !== hover.decoColor || (rest.labelLook !== null && rest.labelLook !== hover.labelLook) || rest.innerLook !== hover.innerLook;
        if (t.kind === "[data-card] a") {
          if (hover.zoom === null) add(37, "a card link without a [data-zoom] media layer", t.what);
          else if (Math.abs(parseFloat(hover.zoom) - 1.03) > 0.001) add(37, "hovering a card does not scale its media to 1.03", `${t.what} (scale ${hover.zoom})`);
        }
        if (!changed) add(37, "hover changes none of background, colour, border colour, underline thickness or underline colour", `${t.what} (${t.kind})`);
        if (t.kind === '[data-button="primary"]') {
          const step = await page.evaluate(([a, b]) => window.__p7a11y.contrast(a, b), [hover.bg, rest.bg]);
          if (step < 1.3) add(37, "a primary button's hover fill is under 1.3:1 from its rest fill", `${t.what} (${fmtColour(rest.bg)} to ${fmtColour(hover.bg)}: ${step.toFixed(2)}:1)`);
        }
      }
      // A primary button against its band: the fill or the edge at 3:1 or more.
      if (t.kind === '[data-button="primary"]' && rest.bandMedia) notes.push(`37: ${t.what} sits over media; its edge against the film is npm run contrast's to judge`);
      else if (t.kind === '[data-button="primary"]') {
        const fill = await page.evaluate(([a, b]) => window.__p7a11y.contrast(a, b), [rest.bg, rest.band]);
        const edge = rest.borderWidth > 0 ? await page.evaluate(([a, b]) => window.__p7a11y.contrast(a, b), [rest.borderColor, rest.band]) : 0;
        if (Math.max(fill, edge) < 3) add(37, "a primary button's fill and edge are both under 3:1 against its band", `${t.what} (fill ${fill.toFixed(2)}:1, edge ${edge.toFixed(2)}:1 on ${rest.band})`);
      }
      // Pressed: 1px down.
      if (t.pressable) {
        await force(chain, ["hover"]);
        await force([self], ["hover", "active"]);
        const active = await A(page, "style", t.i);
        await force(chain, []);
        if (active.translate !== "0px 1px") add(37, "pressed does not move the button 1px down", `${t.what} (translate ${active.translate})`);
      }
      // Focus-visible: a 2px solid outline in --s-focus, offset 2px.
      await force([self], ["focus", "focus-visible"]);
      const focus = await A(page, "style", t.i);
      await force([self], []);
      const ring = [focus.outline, focus.afterOutline, focus.labelOutline].find((o) => o && o.style === "solid" && Math.abs(parseFloat(o.width) - 2) < 0.01);
      if (!ring) add(37, "focus-visible draws no 2px solid outline", `${t.what} (outline ${focus.outline.style} ${focus.outline.width})`);
      else {
        if (!focus.focusToken) add(37, "no --s-focus role token on this surface, so the ring colour cannot be its focus colour", t.what);
        else if (!(await page.evaluate(([a, b]) => window.__p7a11y.sameColour(a, b), [ring.color, focus.focusToken]))) add(37, "the focus ring is not the surface's --s-focus colour", `${t.what} (${fmtColour(ring.color)}, --s-focus ${focus.focusToken})`);
        if (Math.abs(parseFloat(ring.offset) - 2) > 0.01) add(37, "the focus ring's offset is not 2px", `${t.what} (${ring.offset})`);
      }
      await freeze.evaluate((node) => node.remove());
    }
    notes.push(`37: ${checked} element${checked === 1 ? "" : "s"} sampled (at most 2 per tag, classes and surface; header excluded)`);
  } finally {
    await context.close();
  }
}

function printRun(route, width, failures, warnings, notes) {
  const fold = (list) => {
    const groups = new Map();
    for (const f of list) {
      const key = `${f.check}|${f.kind}`;
      if (!groups.has(key)) groups.set(key, { ...f, samples: [] });
      if (f.sample && !groups.get(key).samples.includes(f.sample)) groups.get(key).samples.push(f.sample);
    }
    return [...groups.values()].sort((a, b) => String(a.check).localeCompare(String(b.check)));
  };
  const f = fold(failures);
  const w = fold(warnings);
  totalFailures += f.length;
  totalWarnings += w.length;
  for (const g of f) byCheck[g.check] = (byCheck[g.check] ?? 0) + 1;
  console.log(`${route} @${width}  ${f.length ? `${f.length} failure${f.length === 1 ? "" : "s"}` : "all pass"}${w.length ? `, ${w.length} warning${w.length === 1 ? "" : "s"}` : ""}`);
  for (const [level, list] of [["FAIL", f], ["warn", w]]) {
    for (const g of list) {
      const n = g.samples.length;
      console.log(`       ${level} [${g.check}] ${g.kind}${n > 1 ? ` (${n}x)` : ""}${n ? `: ${g.samples.slice(0, 4).join("; ")}` : ""}${n > 4 ? `; ${n - 4} more` : ""}`);
    }
  }
  for (const n of notes) console.log(`  note  ${n}`);
  report.runs.push({ route, width, failures: f, warnings: w, notes });
}

await browser.close();
console.log("");
console.log(`Summary: ${totalFailures ? `${totalFailures} failure${totalFailures === 1 ? "" : "s"}` : "every check passes"}${totalWarnings ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}` : ""} across ${opts.routes.length} route${opts.routes.length === 1 ? "" : "s"} at ${opts.widths.join(" and ")}.`);
for (const [check, label] of Object.entries(CHECKS)) console.log(`  [${check}] ${label}: ${byCheck[check] ? `${byCheck[check]} failing` : "pass"}`);
if (opts.json) {
  writeFileSync(opts.json, JSON.stringify(report, null, 1));
  console.log(`Report written to ${opts.json}`);
}
process.exit(totalFailures ? 1 : 0);
