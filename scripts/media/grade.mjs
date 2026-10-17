// The house grade: every still and film is pulled toward one warm, overcast-morning look so the
// set reads as one shoot (docs/DESIGN-PASS.md). The grade adapts to each source rather than
// laying one filter over all of them, because the sources differ: some are cold blue-grey, one is
// warm interior light, several have lifted, washed-out blacks.
//
// For each source, measured on a 256px copy:
//   1. white balance: part-way toward a neutral grey world, then a small warm offset;
//   2. black and white points: the 1.5th and 99.5th luminance percentiles pulled toward fixed
//      targets, which evens out contrast across the set;
//   3. a warm lift in the shadows, fading to nothing at white;
//   4. saturation nudged toward a common chroma, inside narrow limits.
// Steps 1 to 3 are per-channel and linear, so they collapse into one `v * a + b` per channel:
// sharp applies it with .linear() and ffmpeg with lutrgb, which keeps a film and its poster
// identical. Step 4 is sharp's modulate and ffmpeg's eq saturation.
//
// Change GRADE (or a manifest asset's `grade` override) and the next fetch re-processes every
// affected asset: the index records gradeKey() and fetch.mjs only reuses entries that match it.

import { createHash } from "node:crypto";
import sharp from "sharp";

export const GRADE = {
  version: 1,
  warm: 1.025, // red gain after the white balance step
  cool: 0.965, // blue gain after the white balance step
  balance: 0.6, // 0 keeps the source's cast, 1 neutralises it fully
  black: 14, // target 1.5th luminance percentile (0-255)
  white: 244, // target 99.5th luminance percentile
  points: 0.7, // how far the points move toward their targets
  lift: [5, 3, 0], // warm shadow lift in RGB at black, fading to 0 at white
  chroma: 15, // target mean chroma (max minus min channel, 0-255)
  saturation: [0.85, 1.12], // limits on the saturation factor
};

/** The grade for one asset: GRADE with the manifest entry's overrides (`grade: false` turns it off). */
export function gradeFor(asset) {
  if (asset.grade === false) return null;
  return { ...GRADE, ...(asset.grade ?? {}) };
}

/** A short key for the grade an output was made with ("none" when ungraded). */
export function gradeKey(grade) {
  if (!grade) return "none";
  return createHash("sha1").update(JSON.stringify(grade)).digest("hex").slice(0, 10);
}

function percentile(sorted, p) {
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))));
  return sorted[i];
}

/**
 * Measure a source (a file path or buffer sharp can read) and return the per-channel linear
 * transform { a: [r, g, b], b: [r, g, b] } and the saturation factor that grade it.
 */
export async function measure(input, grade) {
  const { data, info } = await sharp(input, { failOn: "none" })
    .resize(256, 256, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const sum = [0, 0, 0];
  const lum = new Float64Array(n);
  let chroma = 0;
  for (let i = 0; i < n; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    sum[0] += r;
    sum[1] += g;
    sum[2] += b;
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    chroma += Math.max(r, g, b) - Math.min(r, g, b);
  }
  const mean = sum.map((s) => s / n);
  chroma /= n;
  const sorted = Array.from(lum).sort((x, y) => x - y);
  const lo = percentile(sorted, 1.5);
  const hi = percentile(sorted, 99.5);

  // 1. White balance gains (green is the reference channel).
  const gain = [
    Math.pow(mean[1] / Math.max(mean[0], 1), grade.balance) * grade.warm,
    1,
    Math.pow(mean[1] / Math.max(mean[2], 1), grade.balance) * grade.cool,
  ];
  // 2. Points: v' = (v - lo) * k + lo2.
  const lo2 = lo + (grade.black - lo) * grade.points;
  const hi2 = hi + (grade.white - hi) * grade.points;
  const k = (hi2 - lo2) / Math.max(hi - lo, 1);
  // 3. Lift: v'' = v' + lift * (1 - v' / 255) = v' * (1 - lift / 255) + lift.
  const a = [];
  const b = [];
  for (let c = 0; c < 3; c++) {
    const m = 1 - grade.lift[c] / 255;
    a.push(+(gain[c] * k * m).toFixed(5));
    b.push(+((lo2 - lo * k) * m + grade.lift[c]).toFixed(3));
  }
  // 4. Saturation toward the common chroma.
  const [smin, smax] = grade.saturation;
  const saturation = +Math.min(smax, Math.max(smin, Math.sqrt(grade.chroma / Math.max(chroma, 1)))).toFixed(4);
  return { a, b, saturation };
}

/** Apply a measured grade to a sharp pipeline. */
export function applyToSharp(pipeline, t) {
  if (!t) return pipeline;
  return pipeline.linear(t.a, t.b).modulate({ saturation: t.saturation });
}

/** The same grade as an ffmpeg filter chain, to append after scaling. */
export function ffmpegFilter(t) {
  if (!t) return "";
  const ch = (c) => `clip(val*${t.a[c]}+${t.b[c]},0,255)`;
  return `format=rgb24,lutrgb=r='${ch(0)}':g='${ch(1)}':b='${ch(2)}',eq=saturation=${t.saturation}`;
}
