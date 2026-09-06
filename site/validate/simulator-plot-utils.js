// Shared numeric helpers used by both simulator plot implementations.
function niceTicks(lo, hi, count) {
  count = count === undefined ? 5 : count;
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) {
    ticks.push(+v.toPrecision(12));
  }
  return ticks;
}

function fmt(v) {
  if (v === 0) return "0";
  const a = Math.abs(v);
  return a >= 1e4 || a < 0.01 ? v.toExponential(1) : String(+v.toFixed(3));
}

function ds(pts) {
  const st = Math.max(1, Math.ceil(pts.length / 2e3));
  const out = [];
  for (let i = 0; i < pts.length; i += st) out.push(pts[i]);
  const last = pts[pts.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}
