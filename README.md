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

- `site/validate/playground.html` — the page.
- `site/validate/playground-app.js` — the bundle (assembled from `site/animate-app.js`
  + `site/validate/playground-wiring.js`; see the header comment in `site/validate/playground-wiring.js`).
- `site/validate/playground-worker.js` — Web Worker that runs the solve off the
  main thread (assembled from `site/validate/animate-app.js` + `site/validate/worker-wiring.js`).
- `site/validate/eq-data.js` — embedded earthquake record (generated from
  `src/Examples/EQexample/Cerl_input.txt` via `site/validate/gen-eq-data.mjs`).
- `site/docs/*.md` — markdown pages (KaTeX math + Mermaid diagrams supported).
  `site/docs/playground-content.md` is injected below the playground layout.
- `site/build.mjs` — copies runtime files, converts `site/docs/*.md` → `site/dist/docs/*.html`,
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

1. Edit `site/validate/playground.html` / `site/validate/playground-wiring.js` or
   `site/docs/*.md`.
2. Rebuild the bundle: `cp animate-app.js playground-app.js` then replace the
   wiring section (see the header comment in `playground-wiring.js`).
3. `npm run build` and deploy.
