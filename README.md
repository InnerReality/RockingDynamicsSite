# Rocking Dynamics — Playground

Interactive playground for the rocking-dynamics bushing animation: 3D
animation, excitation controls (sine / half-sine train / square wave /
earthquake), body parameters, and force/hysteresis plots. Pure client-side JS
— no server, no MATLAB, no WASM runtime.

## Pages

- `https://innerreality.github.io/RockingDynamicsSite/`
  — landing page with animated simulation previews.
- `https://innerreality.github.io/RockingDynamicsSite/validate/playground.html`
  — the playground (with markdown content below the layout).
- `https://innerreality.github.io/RockingDynamicsSite/validate/minaccel.html`
  — MinAccel simulator: ramps the base acceleration linearly and solves until
  |θ| reaches a target angle, reporting the minimum acceleration needed.
- `https://innerreality.github.io/RockingDynamicsSite/docs/background.html`
  — background/theory page (links back to the playground).

## Layout

- `site/validate/playground.html` — the playground page.
- `site/validate/minaccel.html` — the MinAccel page (same layout/style).
- `site/validate/*-app.js` / `site/validate/*-worker.js` — page bundles and Web
  Workers, assembled from `site/validate/animate-app.js` (solver) + a wiring
  file (`playground-wiring.js`, `worker-wiring.js`, `minaccel-worker-wiring.js`)
  by `site/validate/assemble-bundles.mjs` (or `npm run build`).
- `site/validate/eq-data.js` — embedded earthquake record (generated from
  `src/Examples/EQexample/Cerl_input.txt` via `site/validate/gen-eq-data.mjs`).
- `site/docs/*.md` — markdown pages (KaTeX math + Mermaid diagrams supported).
  `site/docs/playground-content.md` is injected below the playground layout.
- `site/build.mjs` — assembles the JS bundles, copies runtime files, converts
  `site/docs/*.md` → `site/dist/docs/*.html`, and injects the playground
  content. Requires `npm install` (marked + katex).
- `site/dev-server.mjs` — dependency-free local server for `site/dist`.

## Build

```sh
cd site
npm install     # once (marked + katex)
npm run build   # outputs to dist/validate/ + dist/docs/
npm run dev     # builds and serves at http://localhost:3000
```

Local simulator URLs:

- `http://localhost:3000/validate/playground`
- `http://localhost:3000/validate/minaccel`

The `.html` forms also work. Keep the dev-server terminal running while using
these pages.

KaTeX math is rendered at build time; Mermaid diagrams render in the browser
(via CDN script). The docs pages and the injected playground content support
both `$...$` / `$$...$$` math and ` ```mermaid ` blocks.

## Deploy

Site URL: https://innerreality.github.io/RockingDynamicsSite/

Push `site/` to the deploy repo (`InnerReality/RockingDynamicsSite`) and let
GitHub Actions build + publish (see `deploy-actions.yml` — copy it to
`.github/workflows/deploy.yml` in the deploy repo).

## Updating

1. Edit `site/validate/*.html`, `site/validate/*-wiring.js`, or `site/docs/*.md`.
2. Rebuild the bundles: `node site/validate/assemble-bundles.mjs` (or
   `npm run build`, which assembles them into `dist/`).
3. `npm run build` and deploy.
