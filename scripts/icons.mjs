// Render every raster brand file from the owner's round badge (public/brand/lienry-badge.svg): favicons
// at 16 and 32, the Apple touch icon at 180, the 192 and 512 icons the manifest needs (512 is also the
// JSON-LD logo), favicon.ico, the web manifest, and 1024px rasters of the badge and of the wordmark
// (public/brand/lienry-logo.svg) for anyone who needs one. Run after changing either master.
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const PLASTER = "#f4f6f8";
const INK = "#141e28";
const WHITE = "#ffffff";

// The badge's letters, as set in the master: everything but its ring, in the master's 1000 x 1000 box.
const badge = readFileSync("public/brand/lienry-badge.svg", "utf8");
const letters = badge.match(/<g transform="[^"]+">[\s\S]*?<\/g>/g).join("");

// The ring: outer radius 500, the master's 27.5 thick (7.6px of the owner's 276px badge). Small sizes
// get a heavier ring so it still reads at 16 and 32px; `ring` is its thickness in output pixels.
function ringPath(thick) {
  const r = 500 - thick;
  return `M0 500a500 500 0 1 0 1000 0a500 500 0 1 0-1000 0ZM${thick} 500a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1-${2 * r} 0Z`;
}

// The badge, its disc filled white so it reads on light and dark tab strips, centred on a square of
// `size` at `scale` of the square, on a plaster ground or none.
function tile(size, scale, { ground = null, ring = null } = {}) {
  const d = size * scale;
  const thick = ring ? (ring / d) * 1000 : 27.5;
  const o = (size - d) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${ground ? `<rect width="${size}" height="${size}" fill="${ground}"/>` : ""}
  <svg x="${o}" y="${o}" width="${d}" height="${d}" viewBox="0 0 1000 1000">
    <circle cx="500" cy="500" r="${500 - thick / 2}" fill="${WHITE}"/>
    <g fill="${INK}"><path fill-rule="evenodd" d="${ringPath(thick)}"/>${letters}</g>
  </svg>
</svg>`;
}

const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();

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

// Tabs: the badge alone, edge to edge, its ring at 1.25px (16) and 1.75px (32). Home screens and the
// manifest: the badge on plaster with a margin, as the platforms crop and round the square themselves.
const [f16, f32, a180, i192, i512] = await Promise.all([
  png(tile(16, 1, { ring: 1.25 })),
  png(tile(32, 1, { ring: 1.75 })),
  png(tile(180, 0.8, { ground: PLASTER })),
  png(tile(192, 0.8, { ground: PLASTER })),
  png(tile(512, 0.8, { ground: PLASTER })),
]);
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
// The masters as rasters, ink on transparent.
await sharp(Buffer.from(badge)).resize({ width: 1024 }).png().toFile("public/brand/lienry-badge-1024.png");
await sharp(Buffer.from(readFileSync("public/brand/lienry-logo.svg"))).resize({ width: 1024 }).png().toFile("public/brand/lienry-logo-1024.png");
console.log("wrote favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico, site.webmanifest, brand/lienry-badge-1024.png, brand/lienry-logo-1024.png");
