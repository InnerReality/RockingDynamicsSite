// Worker: MinAccel ramp-until-target solve.
//
// The solver bundle (animate-app.js) is an IIFE whose functions are scoped
// inside, so we append a message handler INSIDE that IIFE via a marker.
// Build:  cp validate/animate-app.js validate/minaccel-worker.js
//         sed -i '/\/\/ validate\/animate-src\.ts/,$d' validate/minaccel-worker.js
//         cat validate/minaccel-worker-wiring.js >> validate/minaccel-worker.js
//
// Excitation: a_x(t) = rate*t (g), a_y = 0, so the tipping direction is
// phi = 0 (2D side view). The solve runs in 2 s segments, continuing from
// the previous segment's final state, until |theta| first reaches the
// target angle (or maxT elapses). The base acceleration at that moment
// (rate * t_cross) is the minimum acceleration needed to rock the body to
// the target angle.
//
// Once the target is reached the load is REMOVED (a_x drops to zero) and
// the solve continues for `freeT` more seconds to show the free response.
//
// Optional disableBW: removes the Belleville-washer forces entirely (pure
// rocking about the pivot under gravity + base acceleration). The caller
// then sets the target to 0.8*atan(r0/hCM).

function num(v, dflt) {
  return Number.isFinite(v) ? v : dflt;
}

function runMinAccel(params) {
  const grav = 386.4;
  const dt_ = 1e-3;
  const rate = num(params.rate, 1); // g/s
  const target = (num(params.targetDeg, 1) * Math.PI) / 180; // rad
  const maxT = num(params.maxT, 10);
  const segLen = num(params.segLen, 2);
  const freeT = num(params.freeT, 10); // free-response duration after crossing
  const disableBW = !!params.disableBW;
  const mass = num(params.mass, 1e3) / grav;
  const II = 4e3;
  const r0 = num(params.r0, 12);
  const hCM = num(params.hCM, 40);
  const cdamp = disableBW ? 1e7 : 1e6; // stronger rocking damping only when BW force is disabled
  const r1 = 10.5;
  const nBW = 12;
  const delt0 = 0.03;
  const tolerance = 1e-8;
  const ay = (t) => 0;

  const xBW0x = new Array(nBW),
    xBW0y = new Array(nBW);
  for (let j = 0; j < nBW; j++) {
    const a = (j * 2 * Math.PI) / nBW;
    xBW0x[j] = r1 * Math.cos(a);
    xBW0y[j] = r1 * Math.sin(a);
  }

  // BW preload (deterministic — computed once, not per segment).
  // Skipped when the BW force is disabled.
  let fh0 = 0;
  if (!disableBW) {
    const preloadTask = {
      name: "bw_preload",
      arg: { name: "t", start: 0, finish: 1, step: 1e-3 },
      initial: [0],
      tolerance: 1e-9,
      solutionColNames: ["f"],
      func: (_t, y, out) => {
        out[0] = bellevillemodel(
          y[0],
          Math.min(delt0 * _t, 1),
          _t <= 1 ? delt0 : 0,
        );
      },
    };
    const preload = rkdp(preloadTask);
    fh0 = preload[1][preload[1].length - 1];
  }

  const ctx = {
    uaccel: null,
    phi_: null,
    phidot_: null,
    dtaccel: dt_,
    ssign: (thet) => smoothstep(thet, 1e5, 1e-5, 1),
    m: mass,
    II,
    r0,
    h: hCM,
    c: cdamp,
    xBW0x,
    xBW0y,
    delt0,
  };

  let x0 = new Array(2 + nBW).fill(0);
  for (let j = 0; j < nBW; j++) x0[2 + j] = fh0;

  const T = [],
    X = [],
    Phi = [],
    Delt = [],
    Deltd = [],
    fBWh = [],
    fBWtotal = [];
  let t0 = 0;
  let crossing = null,
    activation = null;
  const t0w = performance.now();

  // Onset detection: the rocking onset is where θ̇ changes rapidly, i.e.
  // where |θ̈| first exceeds a multiple of its recent baseline (median over
  // the previous 50 ms, floored at 0.01 deg/s²). This is nearly
  // rate-independent, unlike a threshold on |θ| or an absolute |θ̈| level
  // (the pre-onset creep scales with the ramp rate).
  const ONSET_MULT = 15;
  const ONSET_WIN = 50; // ms
  const ONSET_FLOOR = 0.01; // deg/s^2
  const onsetWin = Math.max(3, Math.round(ONSET_WIN / 1000 / dt_));
  const tddHist = []; // rolling |θ̈| history (deg/s^2)

  // Excitation: ramp until the load is removed (tDrop), then zero.
  let tDrop = null;
  const ax = (t) => (tDrop !== null && t >= tDrop ? 0 : rate * t);

  function solveSegment(tStart, tFinish, x0in) {
    // Excitation table covering [0, tFinish] (getVal indexes by floor(t/dt))
    const nExc = Math.round(tFinish / dt_) + 1;
    const uSeg = new Array(nExc);
    for (let i = 0; i < nExc; i++) {
      const t = i * dt_;
      uSeg[i] = [ax(t) * grav, ay(t) * grav, -grav];
    }
    const Phi_ = getPhiFromU(uSeg, 0, dt_, 1);
    const PhiU = unwrap(Phi_);
    const Phidot_ = new Array(nExc);
    for (let i = 0; i < nExc - 1; i++)
      Phidot_[i] = (PhiU[i + 1] - PhiU[i]) / dt_;
    Phidot_[nExc - 1] = 0;
    Phidot_[0] = 0;
    ctx.uaccel = uSeg;
    ctx.phi_ = Phi_;
    ctx.phidot_ = Phidot_;

    return lsoda2({
      name: "minaccel",
      arg: { name: "t", start: tStart, finish: tFinish, step: dt_ },
      initial: x0in,
      tolerance,
      solutionColNames: [
        "theta",
        "thetad",
        ...Array.from({ length: nBW }, (_, j) => `fh${j + 1}`),
      ],
      func: (t, y, out) => {
        const r = rockingDynamics(t, y, ctx, out);
        if (out !== r.xdot)
          for (let k = 0; k < out.length; k++) out[k] = r.xdot[k];
        if (disableBW) {
          // Pure rocking about the pivot: drop the Belleville-washer term
          // from θ̈ and freeze the friction states at zero.
          const thet = y[0],
            thetd = y[1];
          const u = getVal(t, ctx.uaccel, ctx.dtaccel, 0);
          const phi = getValScalar(t, ctx.phi_, ctx.dtaccel, 1);
          const [sgnt, sgntp] = ctx.ssign(thet);
          const taup0 = -Math.cos(phi),
            taup1 = -Math.sin(phi);
          const Itt = ctx.II + ctx.m * (ctx.r0 * sgnt) ** 2;
          const rhs =
            -ctx.m * ctx.r0 ** 2 * sgnt * sgntp * thetd ** 2 -
            ctx.c * (1 - sgnt ** 2) * thetd -
            ctx.m * ctx.h * (taup0 * u[0] + taup1 * u[1]) +
            ctx.m * u[2] * ctx.r0 * sgnt;
          out[1] = rhs / Itt;
          for (let k = 2; k < out.length; k++) out[k] = 0;
        }
      },
    });
  }

  function appendSegment(sol, detect) {
    const segT = Array.from(sol[0]);
    const segX = segT.map((_t, i) =>
      Array.from({ length: 2 + nBW }, (_v, k) => sol[1 + k][i]),
    );
    const skip = T.length ? 1 : 0; // first sample duplicates previous segment end
    const baseLen = T.length;
    let crossIdx = -1;
    for (let i = skip; i < segT.length; i++) {
      const r = rockingDynamics(segT[i], segX[i], ctx);
      T.push(segT[i]);
      X.push(segX[i]);
      Phi.push(r.phi);
      Delt.push(r.delt);
      Deltd.push(r.deltd);
      fBWh.push(Array.from({ length: nBW }, (_v, j) => segX[i][2 + j]));
      fBWtotal.push(
        disableBW
          ? new Array(nBW).fill(0)
          : r.delt.map((d, j) => nonlinForceBw(d) + segX[i][2 + j]),
      );
      const idx = baseLen + (i - skip); // index of this sample in T/X
      // θ̈ for the previous sample (one-sample lag; needs X[idx] and X[idx-2])
      if (idx >= 2) {
        const tdd = (((X[idx][1] - X[idx - 2][1]) / (2 * dt_)) * 180) / Math.PI; // deg/s^2
        if (detect && !activation && tddHist.length >= onsetWin) {
          const sorted = tddHist.slice().sort((a, b) => a - b);
          const med = Math.max(sorted[sorted.length / 2], ONSET_FLOOR);
          if (Math.abs(tdd) > ONSET_MULT * med) {
            activation = {
              t: T[idx - 1],
              theta: X[idx - 1][0],
              accel: rate * T[idx - 1],
            };
          }
        }
        tddHist.push(Math.abs(tdd));
        if (tddHist.length > onsetWin) tddHist.shift();
      }
      if (detect && !crossing && Math.abs(segX[i][0]) >= target) {
        const tA = segT[i - 1],
          tB = segT[i];
        const thA = Math.abs(segX[i - 1][0]),
          thB = Math.abs(segX[i][0]);
        const f = (target - thA) / (thB - thA);
        crossing = {
          t: tA + f * (tB - tA),
          theta: target,
          accel: rate * (tA + f * (tB - tA)),
        };
        crossIdx = i;
      }
    }
    return { segT, segX, crossIdx, baseLen, skip };
  }

  // Phase 1: ramp until |theta| reaches the target (or maxT)
  while (t0 < maxT) {
    const t1 = Math.min(t0 + segLen, maxT);
    const sol = solveSegment(t0, t1, x0);
    const { segX, crossIdx, baseLen, skip } = appendSegment(sol, true);
    if (crossIdx >= 0) {
      // End the record exactly at the first sample at/above the target
      const keep = baseLen + (crossIdx - skip + 1);
      T.length = keep;
      X.length = keep;
      Phi.length = keep;
      Delt.length = keep;
      Deltd.length = keep;
      fBWh.length = keep;
      fBWtotal.length = keep;
      x0 = X[keep - 1];
      t0 = T[keep - 1];
      break;
    }
    x0 = segX[segX.length - 1];
    t0 = t1;
  }

  // Fallback: if the θ̈-based onset wasn't detected but the target was
  // reached, use the crossing itself so activation is always defined.
  if (crossing && !activation) {
    activation = {
      t: crossing.t,
      theta: crossing.theta,
      accel: crossing.accel,
    };
  }

  // Phase 2: load removed — continue for freeT more seconds
  if (crossing) {
    tDrop = t0; // excitation drops to zero from here
    const tEnd = t0 + freeT;
    while (t0 < tEnd) {
      const t1 = Math.min(t0 + segLen, tEnd);
      const sol = solveSegment(t0, t1, x0);
      const { segX } = appendSegment(sol, false);
      x0 = segX[segX.length - 1];
      t0 = t1;
    }
  }

  const solverMs = performance.now() - t0w;
  const u_ = T.map((t) => [ax(t) * grav, ay(t) * grav, -grav]);
  return {
    T,
    X,
    fBWh,
    fBWtotal,
    Phi,
    Delt,
    Deltd,
    u_,
    fh0,
    fBWpreload: disableBW ? 0 : fh0 + nonlinForceBw(delt0),
    solverMs,
    crossing,
    activation,
    reached: !!crossing,
    maxT,
    tDrop,
    freeT,
  };
}

self.onmessage = (e) => {
  const { id, params } = e.data;
  try {
    const res = runMinAccel(params);
    self.postMessage({ id, ok: true, res });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: String((err && err.message) || err),
    });
  }
};
