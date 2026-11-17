// Prove the header stays legible over the hero film, the one hero the bar is clear over (every other
// page opens light, under the white bar, /company's pale tint hero included), for as long as it is
// clear: from the top of the home page until the film has left the bar (the hero's foot reaching the
// bar's foot), when it turns white (src/components/site/Nav.tsx).
//
// Under the clear bar, bottom to top (src/components/home/Hero.tsx, and .bar-scrim in globals.css):
//   1. the film frame, object-cover over the hero's box (the screen's height on phones, 45rem from 768)
//   2. the hero's flat ink veil at 30%, and its foot scrim (night, 85% at the foot to nothing 70% up)
//   3. what the hero writes on the film: its white headline and support line pass under the bar
//   4. the bar's own scrim, on the bar itself so it travels with it; its stops are read from globals.css
// This composites the layers per pixel at every scroll depth the bar is clear at, and reports the WORST
// (brightest) pixel behind each header element, because the ratio has to hold everywhere, not on average.
//
// Three gates are checked. The first runs a real frame of the film under the bar at each depth. The
// second replaces everything under the bar's scrim with pure white, which no frame and no white headline
// can exceed, so passing it makes the result unconditional: every frame of every hero film, at every
// depth, with the hero's own text passing under the bar. The third is the ground a bar link takes on
// hover and keyboard focus over the film: a near-white chip with the label in ink.
//
// The header carries no buttons over the hero (no pills; CLAUDE.md), so each element is gated on its
// own fill: text at 4.5:1, the logo and the burger's glyph at 3:1 as graphics.
//
// Usage: node scripts/contrast-hero.mjs <frame image> [viewportWidth] [viewportHeight]
import sharp from "sharp";

const frameFile = process.argv[2];
const VW = Number(process.argv[3] ?? 1440);
const VH = Number(process.argv[4] ?? 900);

// The Glass and sky palette (src/app/globals.css): ink, the white ground and muted.
const INK = [0x14, 0x1e, 0x28];
const PLASTER = [0xff, 0xff, 0xff];
const MUTED = [0x52, 0x60, 0x6e];
// The owner's navy, the logo's colour on the white bar (--color-logo).
const NAVY = [0x0a, 0x0a, 0x6d];
const NIGHT = [0x11, 0x1a, 0x22];
const VEIL = 0.3;
const NAV_H = 56;
// The hero's box: the film covers it, and the bar is clear until its foot reaches the bar's.
const HERO_H = VW >= 768 ? 720 : VH;
const LAST_DEPTH = HERO_H - NAV_H;
// The hero's foot scrim, by height up from its foot (0 to 1 of the hero).
const footAt = (heroY) => {
  const t = (HERO_H - heroY) / (HERO_H * 0.7);
  return t >= 1 ? 0 : t <= 0.5 ? 0.85 + (0.45 - 0.85) * (t / 0.5) : 0.45 * (1 - (t - 0.5) / 0.5);
};
// The bar's scrim, as shipped: the black stops of .bar-scrim's gradient, in px down from the top.
const { readFileSync } = await import("node:fs");
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const scrimRule = css.match(/\.bar-scrim\s*\{[^}]*\}/)?.[0] ?? "";
const SCRIM = [...scrimRule.matchAll(/rgb\(0 0 0 \/ ([\d.]+)\)\s+([\d.]+)rem/g)].map((m) => [Number(m[2]) * 16, Number(m[1])]);
if (SCRIM.length < 2) {
  console.error("Could not read .bar-scrim's stops from src/app/globals.css.");
  process.exit(1);
}
const scrimAt = (y) => {
  if (y <= SCRIM[0][0]) return SCRIM[0][1];
  for (let i = 1; i < SCRIM.length; i++) {
    const [y1, a1] = SCRIM[i];
    const [y0, a0] = SCRIM[i - 1];
    if (y <= y1) return y1 === y0 ? a1 : a0 + (a1 - a0) * ((y - y0) / (y1 - y0));
  }
  return SCRIM[SCRIM.length - 1][1];
};
// The chip a bar link takes on hover and focus over the film: white at this alpha, the label in ink.
const CHIP = 0.9;

// Boxes in CSS pixels, read off the rendered header (the logo on the rail, the menus centred from 1024,
// the burger at the right below it). The logo is gated at 3:1 as a graphic.
const ELEMENTS =
  VW >= 1024
    ? [
        { name: "Menu buttons, white text", box: [531, 12, 909, 44], need: 4.5, gate: true, fg: [255, 255, 255] },
        { name: "Logo, white fill", box: [24, 13, 156, 42], need: 3, gate: true, fg: [255, 255, 255] },
      ]
    : [
        { name: "Burger, white glyph", box: [VW - 52, 6, VW - 8, 50], need: 3, gate: true, fg: [255, 255, 255] },
        { name: "Logo, white fill", box: [20, 13, 152, 42], need: 3, gate: true, fg: [255, 255, 255] },
      ];

const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const la = lum(a);
  const lb = lum(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg, bg, alpha) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

const meta = await sharp(frameFile).metadata();
// object-cover: scale so the frame covers the hero's box, then centre-crop.
const scale = Math.max(VW / meta.width, HERO_H / meta.height);
const offX = (meta.width * scale - VW) / 2;
const offY = (meta.height * scale - HERO_H) / 2;
const { data, info } = await sharp(frameFile).raw().toBuffer({ resolveWithObject: true });
const framePx = (x, y) => {
  const sx = Math.min(meta.width - 1, Math.max(0, Math.round((x + offX) / scale)));
  const sy = Math.min(meta.height - 1, Math.max(0, Math.round((y + offY) / scale)));
  const i = (sy * info.width + sx) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
};
// What the film shows at a point of the hero: the frame under the veil and the foot scrim.
const heroPx = (x, heroY) => over(NIGHT, over(INK, framePx(x, heroY), VEIL), footAt(heroY));

// `under(x, heroY)` is what lies under the bar's scrim at a point of the hero; `depths` the scroll
// depths to try (the bar's pixel y is the hero's y + depth).
function run(label, under, depths) {
  const rows = [];
  let gatesFailed = 0;
  for (const el of ELEMENTS) {
    const [x0, y0, x1, y1] = el.box;
    let worst = Infinity;
    let at = null;
    for (const depth of depths) {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const bg = over([0, 0, 0], under(x, y + depth), scrimAt(y));
          const r = ratio(el.fg, bg);
          if (r < worst) {
            worst = r;
            at = { x, y, depth, bg: bg.map((c) => Math.round(c)) };
          }
        }
      }
    }
    const pass = worst >= el.need;
    if (el.gate && !pass) gatesFailed++;
    rows.push({
      element: el.name,
      target: `${el.need.toFixed(1)}:1`,
      worst: `${worst.toFixed(2)}:1`,
      result: pass ? "PASS" : "FAIL",
      "worst pixel": `${at.x},${at.y}`,
      "at scroll": `${at.depth}px`,
      "background there": `rgb(${at.bg.join(",")})`,
    });
  }
  console.log(`\n${label}`);
  console.table(rows);
  return gatesFailed;
}

// Every second pixel of scroll from the top to the last depth the bar is clear at.
const DEPTHS = [];
for (let d = 0; d < LAST_DEPTH; d += 2) DEPTHS.push(d);
DEPTHS.push(LAST_DEPTH);

console.log(`frame ${frameFile} ${meta.width}x${meta.height} -> hero ${VW}x${HERO_H} in a ${VW}x${VH} viewport, object-cover scale ${scale.toFixed(3)}`);
console.log(`bar scrim (globals.css): ${SCRIM.map(([y, a]) => `${Math.round(a * 100)}% at ${y}px`).join(", ")}; the bar is clear from 0 to ${LAST_DEPTH}px of scroll`);
let failed = run(`Gate 1: the supplied frame of the film under the bar, at each of ${DEPTHS.length} scroll depths through the hero`, heroPx, DEPTHS);
failed += run("Gate 2: pure white under the bar's scrim, the bound no frame, depth or white headline can exceed", () => [255, 255, 255], [0]);

// Gate 3: a bar link's ground on hover and keyboard focus over the film. The chip is lightest over
// white and darkest over black; the ink label is gated on the darkest it can be.
const chipDark = over([255, 255, 255], [0, 0, 0], CHIP);
const chipRatio = ratio(INK, chipDark);
console.log(`\nGate 3: a hovered or focused link over the film, ink on a white chip at ${CHIP * 100}%. Darkest chip rgb(${chipDark.map((c) => Math.round(c)).join(",")}): ${chipRatio.toFixed(2)}:1; target 4.5:1. ${chipRatio >= 4.5 ? "PASS" : "FAIL"}`);
if (chipRatio < 4.5) failed++;

console.log("\nThe white bar, on every other route and on the home page once the film has left the bar:");
const solid = [
  { pair: "ink link on white", ratio: ratio(INK, PLASTER), need: 4.5 },
  { pair: "muted text on white", ratio: ratio(MUTED, PLASTER), need: 4.5 },
  { pair: "navy logo on white", ratio: ratio(NAVY, PLASTER), need: 3 },
];
console.table(solid.map((r) => ({ pair: r.pair, ratio: `${r.ratio.toFixed(2)}:1`, target: `${r.need}:1`, result: r.ratio >= r.need ? "PASS" : "FAIL" })));
failed += solid.filter((r) => r.ratio < r.need).length;
// The switch between the two eases over 200ms (ground, rule and text together), as it always has; both
// of its resting states are the ones gated above.

if (failed) {
  console.error(`${failed} gate(s) failed.`);
  process.exit(1);
}
console.log("Every gated header element clears its target at every depth the bar is clear at, and on the white bar.");
