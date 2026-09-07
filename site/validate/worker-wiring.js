// Worker: runs the rocking-dynamics solve off the main thread so the UI
// (still figure, controls) stays responsive during the ~2-3 s computation.
//
// The solver bundle (animate-app.js) is an IIFE whose functions are scoped
// inside, so we append a message handler INSIDE that IIFE via a marker.
// Build:  cp validate/animate-app.js validate/playground-worker.js
//         sed -i '/\/\/ validate\/animate-src\.ts/,$d' validate/playground-worker.js
//         cat validate/worker-wiring.js >> validate/playground-worker.js
//
// NOTE: no importScripts — the solver code is already inlined into this
// worker by the build (animate-app.js is a build source, not deployed).

// Rebuild the excitation functions from a serializable spec (postMessage
// cannot send functions). Mirrors buildExcitationFn in playground-wiring.js.
function num(v, dflt) {
  return Number.isFinite(v) ? v : dflt;
}

function buildFn(spec, axis) {
  const tstart = num(spec.tstart, 0);
  const amp = num(spec.amp, 2);
  if (spec.eq) {
    const scale = num(spec.eqScale, 3);
    const arr = axis === "ax" ? spec.eqData.long : spec.eqData.lat;
    const dt = spec.eqData.dt;
    const n = spec.eqData.n;
    return (t) => {
      const i = Math.floor(t / dt);
      return i < 0 || i >= n ? 0 : arr[i] * scale;
    };
  }
  if (spec.preset === "pulse") {
    const active = num(spec.active, 0.5);
    const rest = num(spec.rest, 0.5);
    const period = active + rest;
    return (t) => {
      if (t < tstart) return 0;
      const tr = (t - tstart) % period;
      return tr < active ? amp * Math.sin((Math.PI * tr) / active) : 0;
    };
  }
  if (spec.preset === "square") {
    const ton = num(spec.ton, 0.5);
    const toff = num(spec.toff, 0.5);
    const period = ton + toff;
    return (t) => (t >= tstart && (t - tstart) % period < ton ? amp : 0);
  }
  // sine (default)
  const freq = num(spec.freq, 1);
  const phase = (num(spec.phase, 0) * Math.PI) / 180;
  return (t) =>
    t >= tstart ? amp * Math.sin(2 * Math.PI * freq * (t - tstart) + phase) : 0;
}

self.onmessage = (e) => {
  const { id, params } = e.data;
  try {
    const ax = buildFn(params.axSpec, "ax");
    const ay = buildFn(params.aySpec, "ay");
    const az =
      params.azSpec && params.azSpec.eq
        ? (t) => {
            const i = Math.floor(t / params.azSpec.eqData.dt);
            return i < 0 || i >= params.azSpec.eqData.n
              ? 0
              : params.azSpec.eqData.vert[i] * 3;
          }
        : undefined;
    const res = runBidirectional({
      mass: params.mass,
      r0: params.r0,
      hCM: params.hCM,
      tEnd: params.tEnd,
      ax,
      ay,
      az,
      solver: params.solver,
      tolerance: params.tolerance,
    });
    self.postMessage({ id, ok: true, res });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: String((err && err.message) || err),
    });
  }
};
})();
