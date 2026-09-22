// Prove the header stays legible over the hero film.
//
// The hero stacks three layers under the bar (src/components/home/Hero.tsx):
//   1. the film frame, object-cover over the viewport
//   2. a flat ink veil at 25%
//   3. the header scrim, solid black at 50% from 0 to 72px, gone by 220px
// This composites all three per pixel and reports the WORST (brightest) pixel behind each
// header element, because the ratio has to hold everywhere, not on average.
//
// Two gates are checked. The first uses a real frame of the film. The second replaces the
// film with pure white, which no frame can exceed, so passing it makes the result
// unconditional: every possible frame of every possible hero film clears the target.
//
// What counts as the button's contrast: WCAG 1.4.11 asks for 3:1 on the visual BOUNDARY of a
// component, not its fill. The button is an ink fill on a dark scrim, so the fill alone can
// match its background; the white hairline is the boundary and is what is gated here. The
// fill row is printed for information only.
//
// The hairline is composited over the button's own INK FILL, not over the frame, because
// background-clip defaults to border-box and the fill paints under the border. Reading the
// rendered pixels confirms it: white/75 on the button's left edge comes back as rgb(198,198,197),
// which is 0.75*255 + 0.25*28, not 0.75*255 + 0.25*backdrop. Compositing it over the frame
// instead overstates the ratio by about a full point.
//
// Usage: node scripts/contrast-hero.mjs <frame image> [viewportWidth] [viewportHeight]
import sharp from "sharp";

const frameFile = process.argv[2];
const VW = Number(process.argv[3] ?? 1440);
const VH = Number(process.argv[4] ?? 900);

const INK = [0x1c, 0x1a, 0x17];
const PLASTER = [0xf3, 0xef, 0xe7];
const MUTED = [0x5e, 0x58, 0x4f];
const scrimAt = (y) =>
  y <= 72 ? 0.5 : y <= 140 ? 0.5 + (0.26 - 0.5) * ((y - 72) / 68) : y <= 220 ? 0.26 * (1 - (y - 140) / 80) : 0;

// Boxes in CSS pixels, read off the rendered header at 1440 wide.
const ELEMENTS = [
  { name: "Nav links, white text", box: [9, 21, 493, 51], need: 4.5, gate: true, fg: [255, 255, 255] },
  { name: "Centred mark, white fill", box: [710, 21, 730, 50], need: 3, gate: true, fg: [255, 255, 255] },
  { name: "Button boundary, white hairline", box: [1265, 20, 1416, 51], need: 3, gate: true, alpha: 0.75, overFill: INK },
  { name: "Button fill vs hero (informational)", box: [1265, 20, 1416, 51], need: 3, gate: false, fg: INK },
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
// object-cover: scale so the frame covers the viewport, then centre-crop.
const scale = Math.max(VW / meta.width, VH / meta.height);
const offX = (meta.width * scale - VW) / 2;
const offY = (meta.height * scale - VH) / 2;
const { data, info } = await sharp(frameFile).raw().toBuffer({ resolveWithObject: true });
const framePx = (x, y) => {
  const sx = Math.min(meta.width - 1, Math.max(0, Math.round((x + offX) / scale)));
  const sy = Math.min(meta.height - 1, Math.max(0, Math.round((y + offY) / scale)));
  const i = (sy * info.width + sx) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
};

function run(label, sourcePx) {
  const rows = [];
  let gatesFailed = 0;
  for (const el of ELEMENTS) {
    const [x0, y0, x1, y1] = el.box;
    let worst = Infinity;
    let at = null;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const bg = over([0, 0, 0], over(INK, sourcePx(x, y), 0.25), scrimAt(y));
        const fg = el.fg ?? over([255, 255, 255], el.overFill ?? bg, el.alpha);
        const r = ratio(fg, bg);
        if (r < worst) {
          worst = r;
          at = { x, y, bg: bg.map((c) => Math.round(c)) };
        }
      }
    }
    const pass = worst >= el.need;
    if (el.gate && !pass) gatesFailed++;
    rows.push({
      element: el.name,
      target: el.gate ? `${el.need.toFixed(1)}:1` : "n/a",
      worst: `${worst.toFixed(2)}:1`,
      result: el.gate ? (pass ? "PASS" : "FAIL") : "info",
      "worst pixel": `${at.x},${at.y}`,
      "background there": `rgb(${at.bg.join(",")})`,
    });
  }
  console.log(`\n${label}`);
  console.table(rows);
  return gatesFailed;
}

console.log(`frame ${frameFile} ${meta.width}x${meta.height} -> viewport ${VW}x${VH}, object-cover scale ${scale.toFixed(3)}`);
let failed = run("Gate 1: against the supplied frame of the hero film", framePx);
failed += run("Gate 2: against pure white, the bound no film frame can exceed", () => [255, 255, 255]);

console.log("\nSolid bar, used on every other route and on the home page past 80px of scroll:");
console.table([
  { pair: "ink link on plaster", ratio: `${ratio(INK, PLASTER).toFixed(2)}:1`, target: "4.5:1", result: ratio(INK, PLASTER) >= 4.5 ? "PASS" : "FAIL" },
  { pair: "muted text on plaster", ratio: `${ratio(MUTED, PLASTER).toFixed(2)}:1`, target: "4.5:1", result: ratio(MUTED, PLASTER) >= 4.5 ? "PASS" : "FAIL" },
  { pair: "ink button on plaster", ratio: `${ratio(INK, PLASTER).toFixed(2)}:1`, target: "3:1", result: ratio(INK, PLASTER) >= 3 ? "PASS" : "FAIL" },
  { pair: "white label on ink button", ratio: `${ratio([255, 255, 255], INK).toFixed(2)}:1`, target: "4.5:1", result: ratio([255, 255, 255], INK) >= 4.5 ? "PASS" : "FAIL" },
]);

// Gate 3: the header switches its surface and ink together. Any interpolation can
// pass through a low-contrast frame, even when both resting states pass.
const { readFileSync } = await import("node:fs");
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const atomic = /\.nav-bar\s*\{\s*transition:\s*none;\s*\}/.test(css);
const restingMinimum = Math.min(ratio([255,255,255], over([0,0,0], over(INK,[255,255,255],0.25),scrimAt(36))), ratio(INK,PLASTER));
console.log(`\nGate 3: atomic surface and text switch. Minimum text contrast ${restingMinimum.toFixed(2)}:1; target 4.5:1.`);
if (!atomic || restingMinimum < 4.5) failed++;
if (failed) { console.error(`${failed} gate(s) failed.`); process.exit(1); }
console.log("Every gated header element clears its target, including the scroll switch.");
