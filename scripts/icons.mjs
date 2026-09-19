// Render every raster brand file from the vector mark: favicons at 16 and 32, the Apple touch
// icon at 180, the 192 and 512 icons the manifest needs (512 is also the JSON-LD logo),
// favicon.ico, the web manifest and a 1024px raster of the mark alone. Run after changing
// public/brand/lienry-mark.svg.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const mark = readFileSync("public/brand/lienry-mark.svg", "utf8").match(/ d="([^"]+)"/)[1];
const PLASTER = "#f3efe7";
const INK = "#1c1a17";

// The mark on a plaster square. Small sizes get a taller mark so the three blocks stay readable.
function tile(size, markHeight) {
  const h = size * markHeight;
  const w = h * (529 / 785);
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${PLASTER}"/>
  <svg x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="0 0 529 785"><path fill="${INK}" d="${mark}"/></svg>
</svg>`;
}

const png = (size, markHeight) => sharp(Buffer.from(tile(size, markHeight))).png().toBuffer();

// An ICO container holding PNG frames (supported by every browser since IE9 / Vista).
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let offset = header.length + dir.length;
  frames.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, dir, ...frames.map((f) => f.buf)]);
}

const [f16, f32, a180, i192, i512] = await Promise.all([png(16, 0.82), png(32, 0.78), png(180, 0.66), png(192, 0.66), png(512, 0.66)]);
writeFileSync("public/favicon-16x16.png", f16);
writeFileSync("public/favicon-32x32.png", f32);
writeFileSync("public/apple-touch-icon.png", a180);
writeFileSync("public/icon-192.png", i192);
writeFileSync("public/icon-512.png", i512);
writeFileSync("public/favicon.ico", ico([{ size: 16, buf: f16 }, { size: 32, buf: f32 }]));
writeFileSync(
  "public/site.webmanifest",
  JSON.stringify(
    {
      name: "Lienry Drones",
      short_name: "Lienry",
      description: "A resident cleaning drone that lives on a property and keeps its exterior clean with nobody on site.",
      start_url: "/",
      display: "browser",
      background_color: PLASTER,
      theme_color: PLASTER,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  ) + "\n",
);
// Mark alone, ink on transparent, for anyone who needs a raster of it.
await sharp(Buffer.from(readFileSync("public/brand/lienry-mark.svg"))).resize({ height: 1024 }).png().toFile("public/brand/lienry-mark-1024.png");
console.log("wrote favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico, site.webmanifest, brand/lienry-mark-1024.png");
