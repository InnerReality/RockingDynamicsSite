# Rocking Dynamics — Playground

Interactive playground for the rocking-dynamics bushing animation: 3D
animation, excitation controls (sine / half-sine train / square wave /
earthquake), body parameters, and force/hysteresis plots. Pure client-side JS
— no server, no MATLAB, no WASM runtime.

## Pages

- `https://innerreality.github.io/RockingDynamicsSite/validate/playground.html`
  — the playground (with markdown content below the layout).
- `https://innerreality.github.io/RockingDynamicsSite/docs/background.html`
  — background/theory page (links back to the playground).

## Layout

- `validate/playground.html` — the page.
- `validate/playground-app.js` — the bundle (assembled from `animate-app.js`
  + `playground-wiring.js`; see the header comment in `playground-wiring.js`).
- `validate/playground-worker.js` — Web Worker that runs the solve off the
  main thread (assembled from `animate-app.js` + `worker-wiring.js`).
- `validate/eq-data.js` — embedded earthquake record (generated from
  `../src/Examples/EQexample/Cerl_input.txt` via `gen-eq-data.mjs`).
- `docs/*.md` — markdown pages (KaTeX math + Mermaid diagrams supported).
  `docs/playground-content.md` is injected below the playground layout.
- `build.mjs` — copies runtime files, converts `docs/*.md` → `dist/docs/*.html`,
  and injects the playground content. Requires `npm install` (marked + katex).

## Build

```sh
cd site
npm install     # once (marked + katex)
npm run build   # outputs to dist/validate/ + dist/docs/
```

KaTeX math is rendered at build time; Mermaid diagrams render in the browser
(via CDN script). The docs pages and the injected playground content support
both `$...$` / `$$...$$` math and ` ```mermaid ` blocks.

## Deploy

Site URL: https://innerreality.github.io/RockingDynamicsSite/

Push `site/` to the deploy repo (`InnerReality/RockingDynamicsSite`) and let
GitHub Actions build + publish (see `deploy-actions.yml` — copy it to
`.github/workflows/deploy.yml` in the deploy repo).

## Updating

1. Edit `validate/playground.html` / `validate/playground-wiring.js` or
   `docs/*.md`.
2. Rebuild the bundle: `cp animate-app.js playground-app.js` then replace the
   wiring section (see the header comment in `playground-wiring.js`).
3. `npm run build` and deploy.