# Fonts

Two families, self-hosted, both under the SIL Open Font License 1.1.

| File | Family | Source package |
| --- | --- | --- |
| `pt-serif-latin-400-normal.woff2` | PT Serif, regular (ParaType) | `@fontsource/pt-serif` |
| `pt-serif-latin-400-italic.woff2` | PT Serif, italic | `@fontsource/pt-serif` |
| `inter-latin-opsz-normal.woff2` | Inter, variable weight 100 to 900 with the optical size axis | `@fontsource-variable/inter` |
| `inter-latin-opsz-italic.woff2` | Inter italic, the same axes | `@fontsource-variable/inter` |

`node scripts/fonts.mjs` copies them here from `node_modules`. `src/lib/fonts.ts` loads them with
`next/font/local`, `font-display: swap` and size-adjusted fallbacks.
