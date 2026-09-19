// Side-by-side before/after sheets from two screenshot folders.
// Usage: node scripts/compare-shots.mjs docs/screenshots/before docs/screenshots/after docs/screenshots/compare
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [beforeDir, afterDir, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const PANEL = 720;
const LABEL = 44;

async function label(text, width) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL}"><rect width="100%" height="100%" fill="#1c1a17"/><text x="16" y="28" font-family="Menlo, monospace" font-size="15" letter-spacing="1.5" fill="#f3efe7">${text}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

for (const file of readdirSync(beforeDir).filter((f) => f.endsWith(".jpg")).sort()) {
  const a = path.join(beforeDir, file);
  const b = path.join(afterDir, file);
  try {
    const [ia, ib] = await Promise.all([sharp(a).resize({ width: PANEL }).toBuffer({ resolveWithObject: true }), sharp(b).resize({ width: PANEL }).toBuffer({ resolveWithObject: true })]);
    const h = Math.max(ia.info.height, ib.info.height);
    const cap = Math.min(h, 6000);
    const [la, lb] = await Promise.all([label(`BEFORE  ${file.replace(".jpg", "")}`, PANEL), label(`AFTER  ${file.replace(".jpg", "")}`, PANEL)]);
    await sharp({ create: { width: PANEL * 2 + 24, height: cap + LABEL, channels: 3, background: "#857d70" } })
      .composite([
        { input: la, top: 0, left: 0 },
        { input: lb, top: 0, left: PANEL + 24 },
        { input: await sharp(ia.data).extract({ left: 0, top: 0, width: PANEL, height: Math.min(ia.info.height, cap) }).toBuffer(), top: LABEL, left: 0 },
        { input: await sharp(ib.data).extract({ left: 0, top: 0, width: PANEL, height: Math.min(ib.info.height, cap) }).toBuffer(), top: LABEL, left: PANEL + 24 },
      ])
      .jpeg({ quality: 84 })
      .toFile(path.join(outDir, file));
    console.log("compared", file);
  } catch (err) {
    console.log("skipped", file, String(err.message ?? err).slice(0, 80));
  }
}
