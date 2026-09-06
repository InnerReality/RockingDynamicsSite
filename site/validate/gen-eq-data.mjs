// Generate validate/eq-data.js from the CERL earthquake record
// (src/Examples/EQexample/Cerl_input.txt). Run once; commit the output.
//
//   node validate/gen-eq-data.mjs
//
// The record is 3 channels (Long, Lat, Vert) in g at dt = 1/512 s. The
// first SKIP_T seconds (quiet lead-in) are trimmed, then MAX_T seconds are
// embedded — the playground's earthquake simulation runs 15 s.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));
const src = resolve(root, "../../src/Examples/EQexample/Cerl_input.txt");
const out = resolve(root, "eq-data.js");

const DT = 1 / 512;
const SKIP_T = 3; // seconds trimmed from the start
const MAX_T = 16; // seconds to embed after the trim
const skip = Math.round(SKIP_T / DT);

const lines = readFileSync(src, "utf8").split(/\r?\n/);
const long = [];
const lat = [];
const vert = [];
for (let i = 14 + skip; i < lines.length; i++) {
  const parts = lines[i].trim().split(/\s+/);
  if (parts.length < 3) continue;
  long.push(+parts[0]);
  lat.push(+parts[1]);
  vert.push(+parts[2]);
}

const n = Math.min(long.length, Math.floor(MAX_T / DT));
const fmt = (arr) => arr.slice(0, n).map((v) => v.toPrecision(6)).join(",");

const js = `// Generated from src/Examples/EQexample/Cerl_input.txt (CERL format).
// dt = 1/512 s; first ${SKIP_T} s trimmed; ${n} samples (~${(n * DT).toFixed(1)} s) embedded.
window.EQ_DATA = {
  dt: ${DT},
  n: ${n},
  long: [${fmt(long)}],
  lat: [${fmt(lat)}],
  vert: [${fmt(vert)}]
};
`;

writeFileSync(out, js);
console.log(`Wrote ${out} (${n} samples, ~${(n * DT).toFixed(1)} s, first ${SKIP_T} s trimmed)`);