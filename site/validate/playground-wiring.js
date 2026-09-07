// ============================================================
// playground wiring — app logic for playground.html
// (replaces the validate/animate-src.ts section of animate-app.js)
//
// Build:  cp site/validate/animate-app.js site/validate/playground-app.js
//         sed -i '/\/\/ validate\/animate-src\.ts/,$d' site/validate/playground-app.js
//         cat site/validate/playground-wiring.js >> site/validate/playground-app.js
// ============================================================
var statusEl = document.getElementById("pg-status");
var canvas = document.getElementById("pg-canvas");
var playBtn = document.getElementById("pg-play");
var stepBtn = document.getElementById("pg-step");
var resetBtn = document.getElementById("pg-reset");
var speedSel = document.getElementById("pg-speed");
var slider = document.getElementById("pg-slider");
var frameEl = document.getElementById("pg-frame");
var timeEl = document.getElementById("pg-time");
var runBtn = document.getElementById("pg-run");
var runWarning = document.getElementById("pg-run-warning");
var animWarning = document.getElementById("pg-anim-warning");
var thetaGainEl = document.getElementById("pg-theta-gain");

// Live value readouts next to every slider.
function refreshReadout(input) {
  const val = input.parentElement.querySelector(".val");
  if (!val) return;
  const dec =
    input.step.indexOf(".") >= 0 ? input.step.split(".")[1].length : 0;
  val.textContent = Number(input.value).toFixed(dec);
}
document.querySelectorAll('.ctrl input[type="range"]').forEach((input) => {
  input.addEventListener("input", () => refreshReadout(input));
  refreshReadout(input);
});

// --- excitation presets ---
function numVal(id) {
  const el = document.getElementById(id);
  const v = parseFloat(el.value);
  return Number.isFinite(v) ? v : 0;
}

function buildExcitationFn(axis) {
  if (eqEnabled() && EQ) {
    const scale = numVal(`pg-eq-s${axis === "ax" ? "x" : "y"}`);
    return (t) => eqSample(axis, t) * scale;
  }
  const preset = document.getElementById(`pg-${axis}-preset`).value;
  const amp = numVal(`pg-${axis}-amp`);
  const tstart = numVal(`pg-${axis}-tstart`);
  if (preset === "sine") {
    const freq = numVal(`pg-${axis}-freq`);
    const phase = (numVal(`pg-${axis}-phase`) * Math.PI) / 180;
    return (t) =>
      t >= tstart
        ? amp * Math.sin(2 * Math.PI * freq * (t - tstart) + phase)
        : 0;
  }
  if (preset === "pulse") {
    // half-sine train: repeats an active half-sine, then rests
    const active = numVal(`pg-${axis}-act`);
    const rest = numVal(`pg-${axis}-rest`);
    const period = active + rest;
    return (t) => {
      if (t < tstart) return 0;
      const tr = (t - tstart) % period;
      return tr < active ? amp * Math.sin((Math.PI * tr) / active) : 0;
    };
  }
  if (preset === "square") {
    // square wave: repeats on for `ton`, off for `toff`
    const ton = numVal(`pg-${axis}-ton`);
    const toff = numVal(`pg-${axis}-toff`);
    const period = ton + toff;
    return (t) => (t >= tstart && (t - tstart) % period < ton ? amp : 0);
  }
  // fallback (shouldn't happen): treat as sine
  const freq = numVal(`pg-${axis}-freq`);
  const phase = (numVal(`pg-${axis}-phase`) * Math.PI) / 180;
  return (t) =>
    t >= tstart ? amp * Math.sin(2 * Math.PI * freq * (t - tstart) + phase) : 0;
}

function updatePresetVisibility(axis) {
  const preset = document.getElementById(`pg-${axis}-preset`).value;
  document
    .querySelectorAll(`.pg-preset-params[data-for="${axis}"] .p`)
    .forEach((el) => {
      // each param block carries the preset name(s) it belongs to in its
      // class; "common" blocks (amplitude, start time) are always shown
      const show =
        el.classList.contains("common") || el.classList.contains(preset);
      el.classList.toggle("visible", !!show);
    });
}

// --- link a_y(t) to a_x(t) ---
const AX_AY_PAIRS = [
  ["preset", "preset"],
  ["amp", "amp"],
  ["freq", "freq"],
  ["phase", "phase"],
  ["act", "act"],
  ["rest", "rest"],
  ["ton", "ton"],
  ["toff", "toff"],
  ["tstart", "tstart"],
];
function ayLinked() {
  return document.getElementById("pg-ay-link").checked;
}
// Copy every a_x(t) control onto the matching a_y(t) control.
function copyAxToAy() {
  for (const [axSuffix, aySuffix] of AX_AY_PAIRS) {
    const axEl = document.getElementById(`pg-ax-${axSuffix}`);
    const ayEl = document.getElementById(`pg-ay-${aySuffix}`);
    if (!axEl || !ayEl) continue;
    ayEl.value = axEl.value;
    refreshReadout(ayEl);
  }
  updatePresetVisibility("ay");
  drawInputPreview();
}
// Lock/unlock the a_y(t) controls while linked.
function setAyLocked(locked) {
  document.getElementById("pg-ay-preset").disabled = locked;
  document
    .querySelectorAll('.pg-preset-params[data-for="ay"] input')
    .forEach((el) => {
      el.disabled = locked;
    });
}
// Hide/show the a_y(t) controls while linked.
function setAyHidden(hidden) {
  const wrap = document.getElementById("pg-ay-controls");
  if (wrap) wrap.style.display = hidden ? "none" : "";
}
// Apply the linked state (copy + lock + hide).
function applyAyLink() {
  if (ayLinked()) {
    copyAxToAy();
    setAyLocked(true);
    setAyHidden(true);
  } else {
    setAyLocked(false);
    setAyHidden(false);
  }
}

// --- earthquake input ---
// Recorded time history (Long/Lat/Vert in g, dt = 1/512 s) embedded in
// eq-data.js. When enabled it takes precedence over the presets; only the
// aₓ/aᵧ scale factors are adjustable (no phase/delay).
const EQ = window.EQ_DATA || null;
function eqEnabled() {
  return document.getElementById("pg-eq-toggle").checked;
}
function eqSample(axis, t) {
  if (!EQ) return 0;
  const i = Math.floor(t / EQ.dt);
  if (i < 0 || i >= EQ.n) return 0;
  const arr = axis === "ax" ? EQ.long : axis === "ay" ? EQ.lat : EQ.vert;
  return arr[i];
}
function applyEqState() {
  const on = eqEnabled() && !!EQ;
  document.getElementById("pg-eq-controls").hidden = !on;
  document.getElementById("pg-exc-blocks").hidden = on;
}

// --- "parameters changed" indicator ---
// Any change to the excitation or body controls after a run marks the
// results stale; the amber dot on the Run button reminds the user to
// re-run. Cleared when a new run starts.
let paramsDirty = false;
const dirtyDot = document.getElementById("pg-dirty-dot");
function markDirty() {
  paramsDirty = true;
  if (dirtyDot) dirtyDot.hidden = false;
}
function clearDirty() {
  paramsDirty = false;
  if (dirtyDot) dirtyDot.hidden = true;
}

// --- simulation state ---
let animator = null; // real animator (after a run)
let staticAnimator = null; // pre-run still figure of the bushing
let animOpts = null; // shared opts so thetaGain can be changed live
let workerRunId = 0; // monotonically increasing id for worker runs
let res = null;
let data = null;
let stride = 10;
let T = null,
  theta = null;
let selStacks = [0, 6]; // 0-based stack indices for the force plots; [1] may be null
const SIM_T = 10; // preset-excitation simulation duration (s)
const EQ_SIM_T = 15; // earthquake simulation duration (s) — the record's
// strong motion peaks at t ≈ 11.8 s, so the sim must run past 10 s
const plotHandles = {};

function currentSimT() {
  return eqEnabled() && EQ ? EQ_SIM_T : SIM_T;
}

// --- svg-plot.ts (patched) ---
// The bundled buildPlot draws the legend on the same line as the title,
// which overlaps for labeled plots (e.g. the force plots). This override
// puts the legend on its own line below the title.
function buildPlot(spec) {
  const W = spec.width ?? 430;
  const Hh = spec.height ?? 270;
  const hasLegend = spec.series.some((ser) => ser.label);
  const L = 72,
    R = 12,
    T = hasLegend ? 56 : 38,
    B = hasLegend ? 50 : 44;
  const xs = spec.series.flatMap((s2) => s2.pts.map((p) => p[0]));
  const ys = spec.series.flatMap((s2) => s2.pts.map((p) => p[1]));
  let x0 = Math.min(...xs),
    x1 = Math.max(...xs);
  let y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  x0 -= (x1 - x0) * 0.02 || 0.5;
  x1 += (x1 - x0) * 0.02 || 0.5;
  y0 -= (y1 - y0) * 0.05 || 0.5;
  y1 += (y1 - y0) * 0.05 || 0.5;
  if (spec.equal) {
    const sx = W - L - R,
      sy = Hh - T - B;
    const r = Math.max((x1 - x0) / sx, (y1 - y0) / sy);
    const cx = (x0 + x1) / 2,
      cy = (y0 + y1) / 2;
    x0 = cx - (r * sx) / 2;
    x1 = cx + (r * sx) / 2;
    y0 = cy - (r * sy) / 2;
    y1 = cy + (r * sy) / 2;
  }
  const px = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const py = (v) => Hh - B - ((v - y0) / (y1 - y0)) * (Hh - T - B);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" font-family="Segoe UI, sans-serif">`;
  s += `<rect width="${W}" height="${Hh}" fill="white"/>`;
  s += `<text x="${L}" y="${hasLegend ? 24 : T - 14}" font-size="17" font-weight="600" fill="#111">${spec.title}</text>`;
  const labeled = spec.series.filter((ser) => ser.label);
  if (labeled.length > 0) {
    const entryW = labeled.map((ser) => 14 + 4 + ser.label.length * 6.2);
    const total = entryW.reduce((a, b) => a + b + 10, 0) - 10;
    let lx = W - R - total;
    labeled.forEach((ser, k) => {
      s += `<line x1="${lx}" y1="${T - 14}" x2="${lx + 14}" y2="${T - 14}" stroke="${ser.color}" stroke-width="2"/>`;
      s += `<text x="${lx + 18}" y="${T - 14}" font-size="13" fill="#111">${ser.label}</text>`;
      lx += entryW[k] + 10;
    });
  }
  for (const v of niceTicks(x0, x1)) {
    s += `<line x1="${px(v)}" y1="${T}" x2="${px(v)}" y2="${Hh - B}" stroke="#e5e7eb"/>`;
    s += `<text x="${px(v)}" y="${Hh - B + 18}" font-size="13" text-anchor="middle" fill="#374151">${fmt(v)}</text>`;
  }
  for (const v of niceTicks(y0, y1)) {
    s += `<line x1="${L}" y1="${py(v)}" x2="${W - R}" y2="${py(v)}" stroke="#e5e7eb"/>`;
    s += `<text x="${L - 6}" y="${py(v) + 4}" font-size="13" text-anchor="end" fill="#374151">${fmt(v)}</text>`;
  }
  s += `<rect x="${L}" y="${T}" width="${W - L - R}" height="${Hh - T - B}" fill="none" stroke="#9ca3af"/>`;
  for (const ser of spec.series) {
    let d = "";
    for (const p of ser.pts)
      d += `${px(p[0]).toFixed(2)},${py(p[1]).toFixed(2)} `;
    s += `<polyline points="${d}" fill="none" stroke="${ser.color}" stroke-width="1.3"/>`;
  }
  if (spec.cursors) {
    for (const c of spec.cursors) {
      const col = c.color ?? "#dc2626";
      s += `<circle id="${c.id}" cx="0" cy="0" r="4" fill="${col}" stroke="#fff" stroke-width="1.2" visibility="hidden"/>`;
      if (c.label) {
        s += `<text id="${c.id}-lbl" x="0" y="0" font-size="15" font-weight="600" fill="${col}" visibility="hidden">${c.label}</text>`;
      }
    }
  }
  for (const m of spec.markers ?? []) {
    const col = m.color ?? "#111";
    s += `<circle id="${m.id}" cx="0" cy="0" r="4" fill="${col}" stroke="#fff" stroke-width="1.2" visibility="hidden"/>`;
    if (m.label) {
      s += `<text id="${m.id}-lbl" x="0" y="0" font-size="15" font-weight="600" fill="${col}" visibility="hidden">${m.label}</text>`;
    }
  }
  s += `<text x="${(L + W - R) / 2}" y="${Hh - 8}" font-size="14" text-anchor="middle" fill="#111">${spec.xlabel}</text>`;
  // y-axis title sits just left of the tick labels (which end at L-6)
  s += `<text x="30" y="${(T + Hh - B) / 2}" font-size="14" text-anchor="middle" fill="#111" transform="rotate(-90 30 ${(T + Hh - B) / 2})">${spec.ylabel}</text>`;
  s += `</svg>`;
  function setDot(id, x, y, label) {
    const dot = document.getElementById(id);
    if (dot) {
      dot.setAttribute("cx", px(x).toFixed(2));
      dot.setAttribute("cy", py(y).toFixed(2));
      dot.setAttribute("visibility", "visible");
    }
    if (label) {
      const lbl = document.getElementById(`${id}-lbl`);
      if (lbl) {
        const nearRight = px(x) > W - 30;
        lbl.setAttribute("x", (px(x) + (nearRight ? -8 : 8)).toFixed(2));
        lbl.setAttribute("y", (py(y) - 8).toFixed(2));
        lbl.setAttribute("text-anchor", nearRight ? "end" : "start");
        lbl.setAttribute("visibility", "visible");
      }
    }
  }
  return {
    svg: s,
    /** move all cursor dots to time t, interpolating each one's series */
    setCursor(t) {
      for (const c of spec.cursors ?? []) {
        const pts = spec.series[c.seriesIndex].pts;
        const n = pts.length;
        if (n === 0) continue;
        const tc = Math.max(pts[0][0], Math.min(pts[n - 1][0], t));
        let lo = 0,
          hi = n - 1;
        while (hi - lo > 1) {
          const mid = (lo + hi) >> 1;
          if (pts[mid][0] <= tc) lo = mid;
          else hi = mid;
        }
        const [xa, ya] = pts[lo],
          [xb, yb] = pts[hi];
        const f = (tc - xa) / (xb - xa || 1);
        setDot(c.id, tc, ya + f * (yb - ya), c.label);
      }
    },
    /** position a marker dot in data coordinates */
    setMarker(id, x, y) {
      const m = (spec.markers ?? []).find((mk) => mk.id === id);
      setDot(id, x, y, m?.label);
    },
  };
}

// Input plots (ax, ay, orbit) from an excitation array u_ of
// [ax*grav, ay*grav, -grav] rows. `suffix` distinguishes the live
// preview ("-live") from the current run's input (""); `track` adds
// playback cursors/markers to the run plots.
function buildInputPlots(u_, suffix, track) {
  const w = 320,
    h = 180,
    oh = 240;
  const axPlot = buildPlot({
    title: "Base accel aₓ(t)",
    xlabel: "Time (s)",
    ylabel: "aₓ (g)",
    width: w,
    height: h,
    cursors: track ? [{ id: `cur-ax${suffix}`, seriesIndex: 0 }] : undefined,
    series: [
      { pts: ds(u_.map((r, i) => [i * 1e-3, r[0] / 386.4])), color: "#0072BD" },
    ],
  });
  const ayPlot = buildPlot({
    title: "Base accel aᵧ(t)",
    xlabel: "Time (s)",
    ylabel: "aᵧ (g)",
    width: w,
    height: h,
    cursors: track ? [{ id: `cur-ay${suffix}`, seriesIndex: 0 }] : undefined,
    series: [
      { pts: ds(u_.map((r, i) => [i * 1e-3, r[1] / 386.4])), color: "#D95319" },
    ],
  });
  const orbitPlot = buildPlot({
    title: "Excitation orbit aᵧ vs aₓ",
    xlabel: "aₓ (g)",
    ylabel: "aᵧ (g)",
    width: w,
    height: oh,
    equal: true,
    markers: track
      ? [{ id: `mk-orbit${suffix}`, color: "#dc2626" }]
      : undefined,
    series: [
      {
        pts: ds(u_.map((r) => [r[0] / 386.4, r[1] / 386.4])),
        color: "#0072BD",
      },
    ],
  });
  document.getElementById(`plot-ax${suffix}`).innerHTML = axPlot.svg;
  document.getElementById(`plot-ay${suffix}`).innerHTML = ayPlot.svg;
  document.getElementById(`plot-orbit${suffix}`).innerHTML = orbitPlot.svg;
  if (track) {
    plotHandles.axPlot = axPlot;
    plotHandles.ayPlot = ayPlot;
    plotHandles.orbitPlot = orbitPlot;
  }
}

// Drawer preview: orbit first, then a single combined aₓ + aᵧ plot.
function buildDrawerPreview(u_) {
  const axayPlot = buildPlot({
    title: "Base accel aₓ(t) & aᵧ(t)",
    xlabel: "Time (s)",
    ylabel: "a (g)",
    width: 280,
    height: 180,
    series: [
      {
        pts: ds(u_.map((r, i) => [i * 1e-3, r[0] / 386.4])),
        color: "#0072BD",
        label: "aₓ",
      },
      {
        pts: ds(u_.map((r, i) => [i * 1e-3, r[1] / 386.4])),
        color: "#D95319",
        label: "aᵧ",
      },
    ],
  });
  const orbitPlot = buildPlot({
    title: "Excitation orbit aᵧ vs aₓ",
    xlabel: "aₓ (g)",
    ylabel: "aᵧ (g)",
    width: 280,
    height: 200,
    equal: true,
    series: [
      {
        pts: ds(u_.map((r) => [r[0] / 386.4, r[1] / 386.4])),
        color: "#0072BD",
      },
    ],
  });
  document.getElementById("plot-axay-drawer").innerHTML = axayPlot.svg;
  document.getElementById("plot-orbit-drawer").innerHTML = orbitPlot.svg;
}

// Live input preview: rebuild the live excitation plots from the current
// controls. Works before any simulation has run; never touched by runs.
// Renders into the Excitation tab AND the mobile options drawer.
function drawInputPreview() {
  const axFn = buildExcitationFn("ax");
  const ayFn = buildExcitationFn("ay");
  const tEnd = currentSimT();
  const nExc = Math.round(tEnd / 1e-3) + 1;
  const u_ = new Array(nExc);
  for (let i = 0; i < nExc; i++) {
    const t = i * 1e-3;
    u_[i] = [axFn(t) * 386.4, ayFn(t) * 386.4, -386.4];
  }
  buildInputPlots(u_, "-live", false);
  buildDrawerPreview(u_);
}

// Force-tab plots for the user-selected stacks (selStacks).
function buildForcePlots() {
  const iA = selStacks[0];
  const iB = selStacks[1];
  const serA = {
    pts: ds(T.map((t, i) => [t, res.fBWtotal[i][iA]])),
    color: "#0072BD",
    label: `stack ${iA + 1}`,
  };
  const serB =
    iB !== null
      ? {
          pts: ds(T.map((t, i) => [t, res.fBWtotal[i][iB]])),
          color: "#D95319",
          label: `stack ${iB + 1}`,
        }
      : null;
  const cursors = [
    {
      id: "cur-force-a",
      seriesIndex: 0,
      color: "#0072BD",
      label: String(iA + 1),
    },
  ];
  if (serB)
    cursors.push({
      id: "cur-force-b",
      seriesIndex: 1,
      color: "#D95319",
      label: String(iB + 1),
    });
  const forcePlot = buildPlot({
    title: "BW stack force",
    xlabel: "Time (s)",
    ylabel: "Force (lb)",
    width: 320,
    height: 200,
    cursors,
    series: serB ? [serA, serB] : [serA],
  });
  const hystA = {
    pts: ds(res.Delt.map((r, i) => [r[iA], res.fBWtotal[i][iA]])),
    color: "#0072BD",
    label: `stack ${iA + 1}`,
  };
  const hystB =
    iB !== null
      ? {
          pts: ds(res.Delt.map((r, i) => [r[iB], res.fBWtotal[i][iB]])),
          color: "#D95319",
          label: `stack ${iB + 1}`,
        }
      : null;
  const markers = [
    { id: "mk-hyst-a", color: "#0072BD", label: String(iA + 1) },
  ];
  if (hystB)
    markers.push({ id: "mk-hyst-b", color: "#D95319", label: String(iB + 1) });
  const hystPlot = buildPlot({
    title: "BW hysteresis",
    xlabel: "BW deformation (in)",
    ylabel: "Force (lb)",
    width: 320,
    height: 200,
    markers,
    series: hystB ? [hystA, hystB] : [hystA],
  });
  document.getElementById("plot-force").innerHTML = forcePlot.svg;
  document.getElementById("plot-hyst").innerHTML = hystPlot.svg;
  plotHandles.forcePlot = forcePlot;
  plotHandles.hystPlot = hystPlot;
}

function buildPlots() {
  const DEG = 180 / Math.PI;
  const thetaPlot = buildPlot({
    title: "Rotation θ(t)",
    xlabel: "Time (s)",
    ylabel: "θ (deg)",
    width: 320,
    height: 200,
    cursors: [{ id: "cur-theta", seriesIndex: 0 }],
    series: [
      { pts: ds(T.map((t, i) => [t, theta[i] * DEG])), color: "#0072BD" },
    ],
  });
  const phiPlot = buildPlot({
    title: "Tipping point φ(t)",
    xlabel: "Time (s)",
    ylabel: "φ (deg)",
    width: 320,
    height: 200,
    cursors: [{ id: "cur-phi", seriesIndex: 0 }],
    series: [
      { pts: ds(T.map((t, i) => [t, res.Phi[i] * DEG])), color: "#0072BD" },
    ],
  });
  document.getElementById("plot-theta").innerHTML = thetaPlot.svg;
  document.getElementById("plot-phi").innerHTML = phiPlot.svg;
  Object.assign(plotHandles, { thetaPlot, phiPlot });
  buildForcePlots();
  buildInputPlots(res.u_, "", true);
}

// Still figure of the bushing, shown before the first simulation finishes.
function showStaticBushing() {
  const ssign = (th) => smoothstep(th, 1e5, 1e-5, 1)[0];
  staticAnimator = createBushingAnimator(
    canvas,
    { t: [0], phi: [0], theta: [0] },
    {
      geom: {
        h1: 24,
        d1: 12,
        h2: 1,
        d2: 2 * numVal("pg-r0"),
        h3: 72,
        d3: 16,
        r0: numVal("pg-r0"),
      },
      ssign,
      thetaGain: 50,
      stackRadius: 10.5,
      nStacks: 12,
      stackFreeLength: 8,
      fps: 50,
      onUpdate: () => {},
    },
  );
  staticAnimator.pause();
}

// Serialize the current excitation controls into a plain-data spec the
// worker can rebuild (functions can't cross postMessage).
function excitationSpec(axis) {
  const eqOn = eqEnabled() && !!EQ;
  const spec = {
    preset: document.getElementById(`pg-${axis}-preset`).value,
    amp: numVal(`pg-${axis}-amp`),
    tstart: numVal(`pg-${axis}-tstart`),
    freq: numVal(`pg-${axis}-freq`),
    phase: numVal(`pg-${axis}-phase`),
    active: numVal(`pg-${axis}-act`),
    rest: numVal(`pg-${axis}-rest`),
    ton: numVal(`pg-${axis}-ton`),
    toff: numVal(`pg-${axis}-toff`),
  };
  if (eqOn) {
    spec.eq = true;
    spec.eqScale = numVal(`pg-eq-s${axis === "ax" ? "x" : "y"}`);
    spec.eqData = EQ;
  }
  return spec;
}

function runSimulation() {
  if (runBtn.disabled) return;
  setOptionsOpen(false);
  clearDirty();
  runBtn.disabled = true;
  playBtn.textContent = "Play";
  statusEl.classList.remove("error", "warning");
  statusEl.textContent = "Running — please wait…";
  if (runWarning) runWarning.hidden = false;
  if (animWarning) animWarning.hidden = false;
  const params = {
    mass: numVal("pg-mass"),
    r0: numVal("pg-r0"),
    hCM: numVal("pg-hcm"),
    tEnd: currentSimT(),
    axSpec: excitationSpec("ax"),
    aySpec: excitationSpec("ay"),
    azSpec: eqEnabled() && EQ ? { eq: true, eqData: EQ } : null,
    solver: "lsoda",
    tolerance: 1e-8,
  };
  const worker = new Worker("playground-worker.js");
  const runId = ++workerRunId;
  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.id !== runId) return;
    worker.terminate();
    if (!msg.ok) {
      console.error(msg.error);
      statusEl.classList.remove("warning");
      statusEl.classList.add("error");
      statusEl.textContent = `Error: ${msg.error}`;
      if (runWarning) runWarning.hidden = true;
      if (animWarning) animWarning.hidden = true;
      runBtn.disabled = false;
      return;
    }
    res = msg.res;
    stride = 10;
    data = {
      t: res.T.filter((_, i) => i % stride === 0),
      phi: res.Phi.filter((_, i) => i % stride === 0),
      theta: res.X.map((r) => r[0]).filter((_, i) => i % stride === 0),
    };
    T = res.T;
    theta = res.X.map((r) => r[0]);
    buildPlots();
    document.getElementById("pg-stack-a").disabled = false;
    document.getElementById("pg-stack-b").disabled = false;
    if (staticAnimator) {
      staticAnimator.destroy();
      staticAnimator = null;
    }
    if (animator) animator.destroy();
    const ssign = (th) => smoothstep(th, 1e5, 1e-5, 1)[0];
    // Auto-scale the θ exaggeration to the actual peak deflection: a
    // violent pulse shouldn't spin the body absurdly (uncanny), while a
    // gentle sine stays clearly visible. Target ~0.3 rad (~17°) of visual
    // rotation so the default sine case lands on the original 50×.
    let maxAbs = 0;
    for (let i = 0; i < theta.length; i++) {
      const a = Math.abs(theta[i]);
      if (a > maxAbs) maxAbs = a;
    }
    const defaultGain =
      maxAbs > 1e-9 ? Math.max(3, Math.min(100, Math.round(0.3 / maxAbs))) : 50;
    thetaGainEl.value = String(defaultGain);
    refreshReadout(thetaGainEl);
    animOpts = {
      geom: {
        h1: 24,
        d1: 12,
        h2: 1,
        d2: 2 * numVal("pg-r0"),
        h3: 72,
        d3: 16,
        r0: numVal("pg-r0"),
      },
      ssign,
      thetaGain: defaultGain,
      stackRadius: 10.5,
      nStacks: 12,
      stackFreeLength: 8,
      fps: 50,
      onUpdate: (frame) => {
        slider.value = String(frame);
        timeEl.textContent = `t = ${data.t[frame].toFixed(2)} s`;
        frameEl.textContent = `Frame ${String(frame + 1).padStart(4, "0")} / ${data.t.length}`;
        const fi = Math.min(frame * stride, T.length - 1);
        const ui = Math.min(fi, res.u_.length - 1);
        plotHandles.axPlot.setCursor(data.t[frame]);
        plotHandles.ayPlot.setCursor(data.t[frame]);
        plotHandles.orbitPlot.setMarker(
          "mk-orbit",
          res.u_[ui][0] / 386.4,
          res.u_[ui][1] / 386.4,
        );
        plotHandles.thetaPlot.setCursor(data.t[frame]);
        plotHandles.phiPlot.setCursor(data.t[frame]);
        plotHandles.forcePlot.setCursor(data.t[frame]);
        plotHandles.hystPlot.setMarker(
          "mk-hyst-a",
          res.Delt[fi][selStacks[0]],
          res.fBWtotal[fi][selStacks[0]],
        );
        if (selStacks[1] !== null) {
          plotHandles.hystPlot.setMarker(
            "mk-hyst-b",
            res.Delt[fi][selStacks[1]],
            res.fBWtotal[fi][selStacks[1]],
          );
        }
        if (!animator.isPlaying) renderSlider();
      },
    };
    animator = createBushingAnimator(canvas, data, animOpts);
    playBtn.textContent = "Pause"; // animator starts playing
    slider.max = String(data.t.length - 1);
    slider.value = "0";
    // The new animation is live — now switch to the Input (run) tab so the
    // user sees the fresh plots, not the previous run's.
    activateTab("tab-input");
    statusEl.classList.remove("warning");
    if (runWarning) runWarning.hidden = true;
    if (animWarning) animWarning.hidden = true;
    // Diagnostic: report what the run actually computed, so the response
    // is verifiable at a glance.
    let maxTheta = 0,
      maxThetaT = 0;
    for (let i = 0; i < theta.length; i++) {
      const a = Math.abs(theta[i]);
      if (a > maxTheta) {
        maxTheta = a;
        maxThetaT = T[i];
      }
    }
    let maxAx = 0;
    for (let i = 0; i < res.u_.length; i++)
      maxAx = Math.max(maxAx, Math.abs(res.u_[i][0] / 386.4));
    statusEl.textContent = `Drag to orbit, scroll to zoom. θ scale auto-set to ${defaultGain}× from the peak deflection (adjust live with the slider below the animation); springs hang from the fixed ceiling at z = 8. Plots track the playback cursor. | max|θ| = ${((maxTheta * 180) / Math.PI).toFixed(3)}° at t = ${maxThetaT.toFixed(1)} s; peak aₓ = ${maxAx.toFixed(2)} g`;
    runBtn.disabled = false;
  };
  worker.onerror = (e) => {
    console.error(e);
    statusEl.classList.remove("warning");
    statusEl.classList.add("error");
    statusEl.textContent = `Worker error: ${e.message}`;
    if (runWarning) runWarning.hidden = true;
    if (animWarning) animWarning.hidden = true;
    runBtn.disabled = false;
  };
  worker.postMessage({ id: runId, params });
}

function renderSlider() {
  slider.value = String(animator.frame);
  timeEl.textContent = `t = ${data.t[animator.frame].toFixed(2)} s`;
  frameEl.textContent = `Frame ${String(animator.frame + 1).padStart(4, "0")} / ${data.t.length}`;
}

// Transport controls are inert until a simulation has produced data.
playBtn.addEventListener("click", () => {
  if (!animator) return;
  playBtn.textContent = animator.toggle() ? "Pause" : "Play";
});
stepBtn.addEventListener("click", () => {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(animator.frame + 1);
});
resetBtn.addEventListener("click", () => {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(0);
  animator.resetView();
});
speedSel.addEventListener("change", () => {
  if (animator) animator.setSpeed(parseFloat(speedSel.value));
});
thetaGainEl.addEventListener("input", () => {
  if (animOpts) animOpts.thetaGain = parseFloat(thetaGainEl.value);
});
slider.addEventListener("input", () => {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(parseInt(slider.value, 10));
});
runBtn.addEventListener("click", runSimulation);

// Mobile options drawer: the simulation inputs slide in from the left.
var optionsToggle = document.getElementById("pg-options-toggle");
var optionsBackdrop = document.getElementById("pg-options-backdrop");
var optionsDrawer = document.getElementById("pg-options-drawer");
function setOptionsOpen(open) {
  if (!optionsDrawer || !optionsBackdrop) return;
  optionsDrawer.classList.toggle("open", open);
  optionsBackdrop.classList.toggle("show", open);
}
optionsToggle.addEventListener("click", () => {
  setOptionsOpen(!optionsDrawer.classList.contains("open"));
});
optionsBackdrop.addEventListener("click", () => setOptionsOpen(false));

// Stack pickers for the force plots (enabled after the first run).
// Changing them rebuilds the force/hysteresis plots from the current run.
function readStackSelections() {
  const a = parseInt(document.getElementById("pg-stack-a").value, 10) - 1;
  const bRaw = parseInt(document.getElementById("pg-stack-b").value, 10);
  selStacks = [a, bRaw > 0 ? bRaw - 1 : null];
}
document.getElementById("pg-stack-a").addEventListener("change", () => {
  if (!res) return;
  readStackSelections();
  buildForcePlots();
});
document.getElementById("pg-stack-b").addEventListener("change", () => {
  if (!res) return;
  readStackSelections();
  buildForcePlots();
});

// Switch the right-sidebar tab programmatically.
function activateTab(btnId) {
  document
    .querySelectorAll("#pg-tabs .tab")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".sidebar.right .panelrow")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(btnId).classList.add("active");
  document.getElementById(`panel-${btnId.slice(4)}`).classList.add("active");
}

// Preset selects: update visible params, jump to the live Excitation tab,
// and refresh the input preview. When a_y(t) is linked, a_x's preset
// selection is mirrored onto a_y.
["ax", "ay"].forEach((axis) => {
  document
    .getElementById(`pg-${axis}-preset`)
    .addEventListener("change", () => {
      updatePresetVisibility(axis);
      if (axis === "ax" && ayLinked()) {
        document.getElementById("pg-ay-preset").value =
          document.getElementById("pg-ax-preset").value;
        updatePresetVisibility("ay");
      }
      activateTab("tab-exc");
      markDirty();
      drawInputPreview();
    });
  updatePresetVisibility(axis);
});
// Any excitation control change jumps to the live Excitation tab and
// refreshes the input plots live. Linked a_y(t) mirrors a_x(t) changes.
document.querySelectorAll(".pg-preset-params input").forEach((el) => {
  el.addEventListener("input", () => {
    activateTab("tab-exc");
    if (ayLinked() && el.id.startsWith("pg-ax-")) {
      const suffix = el.id.slice("pg-ax-".length);
      const ayEl = document.getElementById(`pg-ay-${suffix}`);
      if (ayEl) {
        ayEl.value = el.value;
        refreshReadout(ayEl);
      }
    }
    markDirty();
    drawInputPreview();
  });
});
// Link toggle: copy a_x(t) onto a_y(t), lock + hide it while checked,
// and jump to the live Excitation tab.
document.getElementById("pg-ay-link").addEventListener("change", () => {
  activateTab("tab-exc");
  applyAyLink();
  markDirty();
});

// Earthquake toggle: takes precedence over the presets; hides them and
// shows the aₓ/aᵧ scale controls instead.
document.getElementById("pg-eq-toggle").addEventListener("change", () => {
  activateTab("tab-exc");
  applyEqState();
  markDirty();
  drawInputPreview();
});
["pg-eq-sx", "pg-eq-sy"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    activateTab("tab-exc");
    markDirty();
    drawInputPreview();
  });
});
// Body parameter changes also mark the results stale.
["pg-mass", "pg-r0", "pg-hcm"].forEach((id) => {
  document.getElementById(id).addEventListener("input", markDirty);
});

for (const [btnId, panelId] of [
  ["tab-exc", "panel-exc"],
  ["tab-input", "panel-input"],
  ["tab-disp", "panel-disp"],
  ["tab-force", "panel-force"],
]) {
  document
    .getElementById(btnId)
    .addEventListener("click", () => activateTab(btnId));
}

// Initial state: a_y(t) linked to a_x(t) by default (checkbox checked),
// earthquake off (preset blocks shown), still figure of the bushing +
// live input preview, then run.
applyAyLink();
applyEqState();
showStaticBushing();
drawInputPreview();
runSimulation();
