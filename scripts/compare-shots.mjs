// Side-by-side comparison sheets from two or more screenshot folders: before and after, or the site
// beside its references (Lienry, Legora, ReFresh).
//
// Usage: node scripts/compare-shots.mjs <dir> <dir> [dir ...] <outDir> [--labels A,B,C] [--pairs pairs.json]
//   e.g. node scripts/compare-shots.mjs docs/screenshots/before docs/screenshots/after docs/screenshots/compare
//        node scripts/compare-shots.mjs shots/lienry refs/legora refs/refresh out --labels Lienry,Legora,ReFresh --pairs pairs.json
//
// The last folder is where the sheets go. Without --pairs, every .jpg and .png in the first folder is
// matched by name in the others. With --pairs, a JSON list says which file of each folder goes in which
// sheet: [{ "name": "home-1440-hero", "files": ["home-1440-00-top.jpg", "home/1440/01.png", null] }],
// one entry per folder, in order. A file that is missing, or null, leaves its column empty and labelled
// as missing, so a sheet can be made before every reference is captured. Labels default to BEFORE and
// AFTER for two folders and to the folder names otherwise.
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PANEL = 720;
const LABEL = 44;
const GAP = 24;
const MAX_HEIGHT = 6000;

const args = process.argv.slice(2);
let labels = null;
let pairsFile = null;
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--help" || a === "-h") {
    console.log("Usage: node scripts/compare-shots.mjs <dir> <dir> [dir ...] <outDir> [--labels A,B,C] [--pairs pairs.json]");
    process.exit(0);
  } else if (a === "--labels" || a.startsWith("--labels=")) labels = (a.includes("=") ? a.slice(a.indexOf("=") + 1) : args[++i] ?? "").split(",").map((s) => s.trim());
  else if (a === "--pairs" || a.startsWith("--pairs=")) pairsFile = a.includes("=") ? a.slice(a.indexOf("=") + 1) : args[++i];
  else positional.push(a);
}
if (positional.length < 3) {
  console.error("Pass at least two folders to compare and an output folder.");
  process.exit(2);
}
const outDir = positional.pop();
const dirs = positional;
for (const d of dirs) if (!existsSync(d)) console.log(`note: ${d} does not exist yet; its column stays empty`);
if (!labels) labels = dirs.length === 2 ? ["BEFORE", "AFTER"] : dirs.map((d) => path.basename(path.resolve(d)));
if (labels.length !== dirs.length) {
  console.error(`--labels has ${labels.length} names for ${dirs.length} folders.`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const escapeXml = (s) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);
async function label(text, width, missing = false) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL}"><rect width="100%" height="100%" fill="${missing ? "#5e584f" : "#1c1a17"}"/><text x="16" y="28" font-family="Inter, Helvetica Neue, Arial, sans-serif" font-size="15" letter-spacing="1.5" fill="#f3efe7">${escapeXml(text)}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// The sheets: from --pairs, or every image of the first folder matched by name in the others.
let sheets;
if (pairsFile) {
  sheets = JSON.parse(readFileSync(pairsFile, "utf8")).map((p) => ({ name: p.name, files: dirs.map((_, i) => p.files?.[i] ?? null) }));
} else {
  const names = existsSync(dirs[0]) ? readdirSync(dirs[0]).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort() : [];
  sheets = names.map((f) => ({ name: f.replace(/\.(jpe?g|png)$/i, ""), files: dirs.map(() => f) }));
}
if (!sheets.length) console.log("Nothing to compare: the first folder has no images and no --pairs were given.");

for (const sheet of sheets) {
  try {
    const columns = await Promise.all(
      sheet.files.map(async (file, i) => {
        const p = file ? path.join(dirs[i], file) : null;
        if (!p || !existsSync(p)) return { missing: true, file };
        const img = await sharp(p).resize({ width: PANEL }).toBuffer({ resolveWithObject: true });
        return { missing: false, file, data: img.data, height: img.info.height };
      }),
    );
    const tallest = Math.max(240, ...columns.filter((c) => !c.missing).map((c) => c.height));
    const height = Math.min(tallest, MAX_HEIGHT);
    const width = dirs.length * PANEL + (dirs.length - 1) * GAP;
    const layers = [];
    for (const [i, c] of columns.entries()) {
      const left = i * (PANEL + GAP);
      layers.push({ input: await label(`${labels[i]}  ${c.missing ? `missing${c.file ? ` (${c.file})` : ""}` : sheet.name}`, PANEL, c.missing), top: 0, left });
      if (!c.missing) layers.push({ input: await sharp(c.data).extract({ left: 0, top: 0, width: PANEL, height: Math.min(c.height, height) }).toBuffer(), top: LABEL, left });
    }
    await sharp({ create: { width, height: height + LABEL, channels: 3, background: "#857d70" } })
      .composite(layers)
      .jpeg({ quality: 84 })
      .toFile(path.join(outDir, `${sheet.name}.jpg`));
    const missing = columns.filter((c) => c.missing).length;
    console.log(`compared ${sheet.name}${missing ? ` (${missing} column${missing === 1 ? "" : "s"} empty)` : ""}`);
  } catch (err) {
    console.log("skipped", sheet.name, String(err.message ?? err).slice(0, 80));
  }
}
