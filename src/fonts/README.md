# Fonts

Two families, self-hosted, both under the SIL Open Font License 1.1.

| File | Family | Source package |
| --- | --- | --- |
| `instrument-serif-latin-400-normal.woff2` | Instrument Serif, regular | `@fontsource/instrument-serif` |
| `instrument-serif-latin-400-italic.woff2` | Instrument Serif, italic | `@fontsource/instrument-serif` |
| `inter-latin-opsz-normal.woff2` | Inter, variable weight 100 to 900 with the optical size axis | `@fontsource-variable/inter` |

`node scripts/fonts.mjs` copies them here from `node_modules`. `src/lib/fonts.ts` loads them with `next/font/local`, `font-display: swap`, size-adjusted fallbacks, and a preload for the two regular files used above the fold. The italic serif is loaded on demand.
