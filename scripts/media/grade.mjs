// The house grade: every still and film is pulled toward one overcast-morning look so the set
// reads as one shoot (docs/DESIGN-PASS.md, "Image grade"). It adapts to each source rather than
// laying one filter over all of them, because the sources differ: some are cold blue-grey, one is
// warm interior light, several have washed-out blacks, a few are close to grey.
//
// Each source is measured once, on a 256px copy, in CIE Lab (sRGB, D65):
//   - the 1st and 99th percentiles of L*, its black and white points;
//   - the mean a* and b* of its shadows, mid-tones and highlights (its colour cast in each);
//   - its mean chroma once those casts are corrected.
// The grade then, per pixel and in Lab:
//   1. maps the black and white points onto fixed targets, so every image has the same depth;
//   2. moves each tonal band's cast part of the way to its target: shadows and mid-tones a
//      little warm, highlights neutral, so skies stay white instead of turning peach;
//   3. scales chroma toward one common value, inside narrow limits.
// The whole transform is baked into one 3D colour table per asset. Stills are graded through it in
// JavaScript and films through ffmpeg's lut3d filter, so a film, its poster and its matching still
// share one transform. A film made from a still (manifest `gradeFrom`) reuses that still's
// measurements, so the two match.
//
// Change GRADE (or a manifest asset's `grade` override) and the next fetch re-processes every
// affected asset: the index records gradeKey() and fetch.mjs only reuses entries that match it.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import sharp from "sharp";

export const GRADE = {
  version: 2,
  black: 9, // target L* of the 1st percentile
  white: 94.5, // target L* of the 99th percentile: no image whiter than the plaster ground
  // Cast targets [a*, b*] per tonal band, and how far each band moves toward them.
  shadows: [0.5, 2.5],
  mids: [0, 2.5],
  highlights: [0, 0],
  cast: 0.8,
  castLimit: 9, // the largest shift in a* or b*, so a strongly coloured scene keeps its colour
  chroma: 6, // target mean C*
  chromaLimits: [0.8, 1.2],
  table: 33, // lattice points per axis of the 3D colour table
};

/** The grade for one asset: GRADE with the manifest entry's overrides (`grade: false` turns it off). */
export function gradeFor(asset) {
  if (asset.grade === false) return null;
  return { ...GRADE, ...(asset.grade ?? {}) };
}

/** A short key for the grade an output was made with ("none" when ungraded). */
export function gradeKey(grade, from) {
  if (!grade) return "none";
  return createHash("sha1").update(JSON.stringify({ grade, from: from ?? null })).digest("hex").slice(0, 10);
}

// sRGB <-> CIE Lab (D65).
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const WHITE = [0.95047, 1, 1.08883];
const fLab = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fInv = (t) => (t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27));

export function rgbToLab(r, g, b) {
  const R = toLinear(r / 255), G = toLinear(g / 255), B = toLinear(b / 255);
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / WHITE[0];
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / WHITE[2];
  const fx = fLab(x), fy = fLab(y), fz = fLab(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function labToRgb(L, a, b) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const x = fInv(fx) * WHITE[0], y = fInv(fy), z = fInv(fz) * WHITE[2];
  const R = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const G = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const B = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  const c = (v) => Math.min(255, Math.max(0, toGamma(Math.min(1, Math.max(0, v))) * 255));
  return [c(R), c(G), c(B)];
}

// Soft tonal bands on L*: shadows fade out from 20 to 40, highlights fade in from 65 to 85.
function bands(L) {
  const s = L <= 20 ? 1 : L >= 40 ? 0 : (40 - L) / 20;
  const h = L <= 65 ? 0 : L >= 85 ? 1 : (L - 65) / 20;
  return [s, Math.max(0, 1 - s - h), h];
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))];
}

/** Measure a source (a file path or buffer sharp can read). */
export async function measure(input) {
  const { data, info } = await sharp(input, { failOn: "none" }).resize(256, 256, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const Ls = new Float64Array(n);
  const labs = [];
  const sum = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; // per band: weight, a, b
  for (let i = 0; i < n; i++) {
    const lab = rgbToLab(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    labs.push(lab);
    Ls[i] = lab[0];
    const w = bands(lab[0]);
    for (let k = 0; k < 3; k++) {
      sum[k][0] += w[k];
      sum[k][1] += w[k] * lab[1];
      sum[k][2] += w[k] * lab[2];
    }
  }
  const sorted = Array.from(Ls).sort((x, y) => x - y);
  const cast = sum.map(([w, a, b]) => (w > n * 0.01 ? [a / w, b / w] : null));
  return { L1: percentile(sorted, 1), L99: percentile(sorted, 99), cast, labs };
}

/** Build the per-pixel grade function for a measured source. */
export function gradeFunction(m, grade) {
  const targets = [grade.shadows, grade.mids, grade.highlights];
  const clampShift = (v) => Math.max(-grade.castLimit, Math.min(grade.castLimit, v));
  // Per band: the shift in a* and b*. A band the image hardly has borrows the mid-tone cast.
  const shift = targets.map((t, k) => {
    const c = m.cast[k] ?? m.cast[1] ?? [0, 0];
    return [clampShift((t[0] - c[0]) * grade.cast), clampShift((t[1] - c[1]) * grade.cast)];
  });
  const span = Math.max(m.L99 - m.L1, 1);
  const level = (L) => grade.black + ((L - m.L1) * (grade.white - grade.black)) / span;
  const castAt = (L) => {
    const w = bands(L);
    return [w[0] * shift[0][0] + w[1] * shift[1][0] + w[2] * shift[2][0], w[0] * shift[0][1] + w[1] * shift[1][1] + w[2] * shift[2][1]];
  };
  // Chroma: measured on the sample after levels and casts, around each band's target.
  const targetAt = (L) => {
    const w = bands(L);
    return [w[0] * targets[0][0] + w[1] * targets[1][0] + w[2] * targets[2][0], w[0] * targets[0][1] + w[1] * targets[1][1] + w[2] * targets[2][1]];
  };
  let chroma = 0;
  for (const [L, a, b] of m.labs) {
    const [da, db] = castAt(L);
    chroma += Math.hypot(a + da, b + db);
  }
  chroma /= m.labs.length;
  const [lo, hi] = grade.chromaLimits;
  const scale = Math.min(hi, Math.max(lo, grade.chroma / Math.max(chroma, 0.5)));
  return (r, g, b) => {
    const [L, a, bb] = rgbToLab(r, g, b);
    const [da, db] = castAt(L);
    const L2 = Math.min(100, Math.max(0, level(L)));
    const [ta, tb] = targetAt(L2);
    const a2 = ta + (a + da - ta) * scale;
    const b2 = tb + (bb + db - tb) * scale;
    return labToRgb(L2, a2, b2);
  };
}

/** Bake a grade function into an N x N x N table of RGB values (0-255), red fastest. */
export function bakeTable(fn, size) {
  const t = new Float32Array(size * size * size * 3);
  let i = 0;
  for (let bi = 0; bi < size; bi++)
    for (let gi = 0; gi < size; gi++)
      for (let ri = 0; ri < size; ri++) {
        const [r, g, b] = fn((ri / (size - 1)) * 255, (gi / (size - 1)) * 255, (bi / (size - 1)) * 255);
        t[i++] = r;
        t[i++] = g;
        t[i++] = b;
      }
  return { size, data: t };
}

/** Measure a source and return its table, ready for applyTable or writeCube. */
export async function tableFor(input, grade) {
  const m = await measure(input);
  return { ...bakeTable(gradeFunction(m, grade), grade.table), points: { L1: +m.L1.toFixed(2), L99: +m.L99.toFixed(2) } };
}

/** Grade an 8-bit RGB(A) buffer in place through the table, with trilinear interpolation. */
export function applyTable(buf, channels, table) {
  const { size, data } = table;
  const s = size - 1;
  const at = (r, g, b, c) => data[((b * size + g) * size + r) * 3 + c];
  for (let i = 0; i < buf.length; i += channels) {
    const fr = (buf[i] / 255) * s, fg = (buf[i + 1] / 255) * s, fb = (buf[i + 2] / 255) * s;
    const r0 = Math.min(s - 1, Math.floor(fr)), g0 = Math.min(s - 1, Math.floor(fg)), b0 = Math.min(s - 1, Math.floor(fb));
    const dr = fr - r0, dg = fg - g0, db = fb - b0;
    for (let c = 0; c < 3; c++) {
      const c00 = at(r0, g0, b0, c) * (1 - dr) + at(r0 + 1, g0, b0, c) * dr;
      const c10 = at(r0, g0 + 1, b0, c) * (1 - dr) + at(r0 + 1, g0 + 1, b0, c) * dr;
      const c01 = at(r0, g0, b0 + 1, c) * (1 - dr) + at(r0 + 1, g0, b0 + 1, c) * dr;
      const c11 = at(r0, g0 + 1, b0 + 1, c) * (1 - dr) + at(r0 + 1, g0 + 1, b0 + 1, c) * dr;
      const v = (c00 * (1 - dg) + c10 * dg) * (1 - db) + (c01 * (1 - dg) + c11 * dg) * db;
      buf[i + c] = Math.round(v);
    }
  }
  return buf;
}

/** A sharp pipeline of the graded source at full size (null table: the source untouched). */
export async function gradedSharp(src, table) {
  if (!table) return sharp(src, { failOn: "none" });
  const { data, info } = await sharp(src, { failOn: "none" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  applyTable(data, 3, table);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
}

/** Write the table as an Adobe .cube file for ffmpeg's lut3d filter. */
export function writeCube(table, file) {
  const lines = [`LUT_3D_SIZE ${table.size}`];
  for (let i = 0; i < table.data.length; i += 3) lines.push(`${(table.data[i] / 255).toFixed(6)} ${(table.data[i + 1] / 255).toFixed(6)} ${(table.data[i + 2] / 255).toFixed(6)}`);
  writeFileSync(file, `${lines.join("\n")}\n`);
}
