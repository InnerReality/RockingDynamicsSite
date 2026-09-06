// Assemble the validate/ JS bundles from the solver source + wiring files.
//   animate-app.js + playground-wiring.js -> playground-app.js
//   animate-app.js + worker-wiring.js      -> playground-worker.js
//   animate-app.js + minaccel-worker-wiring.js -> minaccel-worker.js
// Mirrors the manual recipe in the README / wiring headers:
//   cp animate-app.js <bundle>; sed -i '/\/\/ validate\/animate-src\.ts/,$d' <bundle>; cat <wiring> >> <bundle>
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const timing = readFileSync(resolve(root, "simulator-timing.js"), "utf8");
const plotUtils = readFileSync(resolve(root, "simulator-plot-utils.js"), "utf8");
const solver = readFileSync(resolve(root, "animate-app.js"), "utf8");
const marker = "// validate/animate-src.ts";
const idx = solver.indexOf(marker);
if (idx < 0) throw new Error("marker not found in animate-app.js");
const head = solver.slice(0, idx);

const bundles = [
  ["playground-app.js", "playground-wiring.js"],
  ["playground-worker.js", "worker-wiring.js"],
  ["minaccel-worker.js", "minaccel-worker-wiring.js"],
];
for (const [out, wiring] of bundles) {
  const w = readFileSync(resolve(root, wiring), "utf8");
  writeFileSync(resolve(root, out), timing + "\n" + plotUtils + "\n" + head + w);
  console.log(`assembled ${out}`);
}