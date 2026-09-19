// Copy the latin font files out of the Fontsource packages into src/fonts, where next/font/local
// serves them with font-display: swap and preloads the two used above the fold. Run after
// upgrading @fontsource/instrument-serif or @fontsource-variable/inter.
import { copyFileSync, mkdirSync } from "node:fs";

const files = [
  ["@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", "instrument-serif-latin-400-normal.woff2"],
  ["@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", "instrument-serif-latin-400-italic.woff2"],
  ["@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2", "inter-latin-opsz-normal.woff2"],
];

mkdirSync("src/fonts", { recursive: true });
for (const [from, to] of files) {
  copyFileSync(`node_modules/${from}`, `src/fonts/${to}`);
  console.log("copied", to);
}
