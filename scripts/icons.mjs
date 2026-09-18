// Render the raster brand tiles from the vector mark: the Apple touch icon and a
// 512px tile used as the Organization logo in the JSON-LD. Run after changing
// public/brand/lienry-mark.svg.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const mark = readFileSync("public/brand/lienry-mark.svg", "utf8").match(/ d="([^"]+)"/)[1];

function tile(size, { radius = 0, markHeight = 0.66 } = {}) {
  const h = size * markHeight;
  const w = h * (529 / 785);
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#f3efe7"/>
  <svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="0 0 529 785"><path fill="#1c1a17" d="${mark}"/></svg>
</svg>`;
}

mkdirSync("public/brand", { recursive: true });
await sharp(Buffer.from(tile(180))).png().toFile("src/app/apple-icon.png");
await sharp(Buffer.from(tile(512, { radius: 96 }))).png().toFile("public/brand/lienry-mark-512.png");
// Mark alone, ink on transparent, for anyone who needs a raster of it.
await sharp(Buffer.from(readFileSync("public/brand/lienry-mark.svg"))).resize({ height: 1024 }).png().toFile("public/brand/lienry-mark-1024.png");
writeFileSync("public/brand/lienry-mark-plaster.svg", tile(512, { radius: 96 }));
console.log("wrote src/app/apple-icon.png, public/brand/lienry-mark-512.png, public/brand/lienry-mark-1024.png, public/brand/lienry-mark-plaster.svg");
