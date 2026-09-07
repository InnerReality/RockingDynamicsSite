// ============================================================
// minaccel-app.js — MinAccel 2D Simulator
// Standalone 2D side-view rocking dynamics simulator.
//
// Excitation: a_x(t) = rate·t (g), a_y = 0, so φ = 0. The solve (run in a
// Web Worker) advances in time segments until |θ| first reaches the target
// angle; the base acceleration at that moment is the minimum acceleration
// needed to rock the body that far. The simulation stops at 10 s max.
//
// The 2D side view matches the MATLAB animation / 3D playground
// conventions: the body rocks about the pivot at (r0·sgn(θ), z = 0) and is
// rotated by the getRot() convention (x' = ct·x + st·z, z' = -st·x + ct·z).
// θ is drawn at its true angle (no visual exaggeration).
// ============================================================

var DEG = 180 / Math.PI;

// Shared plot helpers are loaded from simulator-plot-utils.js.

// ---- SVG Plot Builder ----
function buildPlot(spec) {
  var W = spec.width || 430;
  var Hh = spec.height || 270;
  var hasLegend = spec.series.some(function (s2) {
    return s2.label;
  });
  var L = 72,
    R = 12,
    T = hasLegend ? 56 : 38,
    B = hasLegend ? 50 : 44;
  var xs = spec.series.flatMap(function (s2) {
    return s2.pts.map(function (p) {
      return p[0];
    });
  });
  var ys = spec.series.flatMap(function (s2) {
    return s2.pts.map(function (p) {
      return p[1];
    });
  });
  var x0 = Math.min.apply(null, xs),
    x1 = Math.max.apply(null, xs);
  var y0 = Math.min.apply(null, ys),
    y1 = Math.max.apply(null, ys);
  x0 -= (x1 - x0) * 0.02 || 0.5;
  x1 += (x1 - x0) * 0.02 || 0.5;
  y0 -= (y1 - y0) * 0.05 || 0.5;
  y1 += (y1 - y0) * 0.05 || 0.5;
  if (spec.equal) {
    var sxq = W - L - R,
      syq = Hh - T - B;
    var rq = Math.max((x1 - x0) / sxq, (y1 - y0) / syq);
    var cxq = (x0 + x1) / 2,
      cyq = (y0 + y1) / 2;
    x0 = cxq - (rq * sxq) / 2;
    x1 = cxq + (rq * sxq) / 2;
    y0 = cyq - (rq * syq) / 2;
    y1 = cyq + (rq * syq) / 2;
  }
  var px = function (v) {
    return L + ((v - x0) / (x1 - x0)) * (W - L - R);
  };
  var py = function (v) {
    return Hh - B - ((v - y0) / (y1 - y0)) * (Hh - T - B);
  };
  var s =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    W +
    " " +
    Hh +
    '" font-family="Segoe UI, sans-serif">';
  s += '<rect width="' + W + '" height="' + Hh + '" fill="white"/>';
  s +=
    '<text x="' +
    L +
    '" y="' +
    (hasLegend ? 24 : T - 14) +
    '" font-size="17" font-weight="600" fill="#111">' +
    spec.title +
    "</text>";
  var labeled = spec.series.filter(function (ser) {
    return ser.label;
  });
  if (labeled.length > 0) {
    var entryW = labeled.map(function (ser) {
      return 14 + 4 + ser.label.length * 6.2;
    });
    var total =
      entryW.reduce(function (a, b) {
        return a + b + 10;
      }, 0) - 10;
    var lx = W - R - total;
    labeled.forEach(function (ser, k) {
      s +=
        '<line x1="' +
        lx +
        '" y1="' +
        (T - 14) +
        '" x2="' +
        (lx + 14) +
        '" y2="' +
        (T - 14) +
        '" stroke="' +
        ser.color +
        '" stroke-width="2"/>';
      s +=
        '<text x="' +
        (lx + 18) +
        '" y="' +
        (T - 14) +
        '" font-size="13" fill="#111">' +
        ser.label +
        "</text>";
      lx += entryW[k] + 10;
    });
  }
  var v, i;
  for (i = 0; i < niceTicks(x0, x1).length; i++) {
    v = niceTicks(x0, x1)[i];
    s +=
      '<line x1="' +
      px(v) +
      '" y1="' +
      T +
      '" x2="' +
      px(v) +
      '" y2="' +
      (Hh - B) +
      '" stroke="#e5e7eb"/>';
    s +=
      '<text x="' +
      px(v) +
      '" y="' +
      (Hh - B + 18) +
      '" font-size="13" text-anchor="middle" fill="#374151">' +
      fmt(v) +
      "</text>";
  }
  for (i = 0; i < niceTicks(y0, y1).length; i++) {
    v = niceTicks(y0, y1)[i];
    s +=
      '<line x1="' +
      L +
      '" y1="' +
      py(v) +
      '" x2="' +
      (W - R) +
      '" y2="' +
      py(v) +
      '" stroke="#e5e7eb"/>';
    s +=
      '<text x="' +
      (L - 6) +
      '" y="' +
      (py(v) + 4) +
      '" font-size="13" text-anchor="end" fill="#374151">' +
      fmt(v) +
      "</text>";
  }
  s +=
    '<rect x="' +
    L +
    '" y="' +
    T +
    '" width="' +
    (W - L - R) +
    '" height="' +
    (Hh - T - B) +
    '" fill="none" stroke="#9ca3af"/>';
  for (var si = 0; si < spec.series.length; si++) {
    var ser = spec.series[si];
    var d = "";
    for (var j = 0; j < ser.pts.length; j++)
      d +=
        px(ser.pts[j][0]).toFixed(2) + "," + py(ser.pts[j][1]).toFixed(2) + " ";
    s +=
      '<polyline points="' +
      d +
      '" fill="none" stroke="' +
      ser.color +
      '" stroke-width="1.3"/>';
  }
  if (spec.cursors) {
    for (var ci = 0; ci < spec.cursors.length; ci++) {
      var c = spec.cursors[ci];
      var col = c.color || "#dc2626";
      s +=
        '<circle id="' +
        c.id +
        '" cx="0" cy="0" r="4" fill="' +
        col +
        '" stroke="#fff" stroke-width="1.2" visibility="hidden"/>';
      if (c.label) {
        s +=
          '<text id="' +
          c.id +
          '-lbl" x="0" y="0" font-size="15" font-weight="600" fill="' +
          col +
          '" visibility="hidden">' +
          c.label +
          "</text>";
      }
    }
  }
  if (spec.markers) {
    for (var mi = 0; mi < spec.markers.length; mi++) {
      var m = spec.markers[mi];
      var mcol = m.color || "#111";
      s +=
        '<circle id="' +
        m.id +
        '" cx="0" cy="0" r="4" fill="' +
        mcol +
        '" stroke="#fff" stroke-width="1.2" visibility="hidden"/>';
      if (m.label) {
        s +=
          '<text id="' +
          m.id +
          '-lbl" x="0" y="0" font-size="15" font-weight="600" fill="' +
          mcol +
          '" visibility="hidden">' +
          m.label +
          "</text>";
      }
    }
  }
  s +=
    '<text x="' +
    (L + W - R) / 2 +
    '" y="' +
    (Hh - 8) +
    '" font-size="14" text-anchor="middle" fill="#111">' +
    spec.xlabel +
    "</text>";
  s +=
    '<text x="30" y="' +
    (T + Hh - B) / 2 +
    '" font-size="14" text-anchor="middle" fill="#111" transform="rotate(-90 30 ' +
    (T + Hh - B) / 2 +
    ')">' +
    spec.ylabel +
    "</text>";
  s += "</svg>";

  function setDot(id, x, y, label) {
    var dot = document.getElementById(id);
    if (dot) {
      dot.setAttribute("cx", px(x).toFixed(2));
      dot.setAttribute("cy", py(y).toFixed(2));
      dot.setAttribute("visibility", "visible");
    }
    if (label) {
      var lbl = document.getElementById(id + "-lbl");
      if (lbl) {
        var nearRight = px(x) > W - 30;
        lbl.setAttribute("x", (px(x) + (nearRight ? -8 : 8)).toFixed(2));
        lbl.setAttribute("y", (py(y) - 8).toFixed(2));
        lbl.setAttribute("text-anchor", nearRight ? "end" : "start");
        lbl.setAttribute("visibility", "visible");
      }
    }
  }

  return {
    svg: s,
    setCursor: function (t) {
      for (var ci = 0; ci < (spec.cursors || []).length; ci++) {
        var cr = spec.cursors[ci];
        var pts = spec.series[cr.seriesIndex].pts;
        var n = pts.length;
        if (n === 0) continue;
        var tc = Math.max(pts[0][0], Math.min(pts[n - 1][0], t));
        var lo = 0,
          hi = n - 1;
        while (hi - lo > 1) {
          var mid = (lo + hi) >> 1;
          if (pts[mid][0] <= tc) lo = mid;
          else hi = mid;
        }
        var xa = pts[lo][0],
          ya = pts[lo][1];
        var xb = pts[hi][0],
          yb = pts[hi][1];
        var f = (tc - xa) / (xb - xa || 1);
        setDot(cr.id, tc, ya + f * (yb - ya), cr.label);
      }
    },
    setMarker: function (id, x, y) {
      var mk = (spec.markers || []).find(function (m) {
        return m.id === id;
      });
      setDot(id, x, y, mk ? mk.label : undefined);
    },
  };
}

// ============================================================
// 2D Bushing Animator
// Side view (X-Z plane, phi=0). The flange rests on the ground
// at z = 0 and the 12 Belleville-washer stacks hang INVERTED from
// an imaginary ceiling at z = H down to the flange. The body rocks
// about the pivot at (r0·sgn(theta), z = 0) and is rotated with the
// getRot() convention used by the MATLAB animation and the 3D
// playground. Theta is drawn at its true angle (thetaGain = 1).
// ============================================================
function create2DBushingAnimator(canvas, data, opts) {
  var ctx = canvas.getContext("2d");
  var W = canvas.width,
    Hh = canvas.height;
  var geom = opts.geom;
  var nStacks = opts.nStacks;
  var r1 = opts.stackRadius;
  var H = opts.stackFreeLength; // 5 in — imaginary ceiling height
  var r0 = geom.r0;
  var d2 = geom.d2,
    h2 = geom.h2; // flange diameter/height (rests on ground)
  var d3 = geom.d3,
    h3 = geom.h3; // upper body diameter/height
  var zTop = h2 + h3; // top of the body

  // Coordinate mapping: world (x,z) -> screen
  var scale = 5.2; // px per inch
  var cx = 0; // world center x
  var cz = 36; // world center z

  function w2s(wx, wz) {
    return [W / 2 + (wx - cx) * scale, Hh / 2 - (wz - cz) * scale];
  }

  // Rotate (px,pz) about the pivot (ox,oz) by angle, matching the getRot()
  // convention: x' = ct*x + st*z, z' = -st*x + ct*z (relative to the pivot).
  function rot2d(px, pz, ox, oz, angle) {
    var dx = px - ox,
      dz = pz - oz;
    var c = Math.cos(angle),
      sn = Math.sin(angle);
    return [ox + dx * c + dz * sn, oz - dx * sn + dz * c];
  }

  // Stack angles
  var stackAngles = [];
  for (var j = 0; j < nStacks; j++)
    stackAngles.push((j * 2 * Math.PI) / nStacks);

  // Animation state
  var frame = 0,
    playing = true,
    speed = 1,
    acc = 0,
    last;
  var frameDt = globalThis.simulatorFrameDt(data, opts.fps || 50);
  var raf = 0;

  function renderFrame(i) {
    var phi = data.phi[i],
      theta = data.theta[i];
    var thetaGain = opts.thetaGain || 1;
    var visTheta = theta * thetaGain;
    var s = Math.sign(theta);
    var pivotX = r0 * s;
    var pivotZ = 0; // rocking pivot at ground level

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, Hh);

    // Ground fill (below z = 0)
    var gY = w2s(0, 0)[1];
    ctx.fillStyle = "#e9e9e9";
    ctx.fillRect(0, gY, W, Hh - gY);

    // Ground line
    var gL = w2s(-40, 0);
    var gR = w2s(40, 0);
    ctx.beginPath();
    ctx.moveTo(gL[0], gL[1]);
    ctx.lineTo(gR[0], gR[1]);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ground hatching
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    for (var hx = -38; hx <= 38; hx += 3) {
      var hp = w2s(hx, 0);
      ctx.beginPath();
      ctx.moveTo(hp[0], hp[1]);
      ctx.lineTo(hp[0] - 4, hp[1] + 8);
      ctx.stroke();
    }

    // Vertical reference line (fixed at x = 0) — compare against the body
    var refTop = w2s(0, zTop);
    var refBot = w2s(0, 0);
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(refBot[0], refBot[1]);
    ctx.lineTo(refTop[0], refTop[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ceiling line (imaginary attachment plane for the inverted springs)
    var cL = w2s(-40, H);
    var cR = w2s(40, H);
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(209, 213, 219, 0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cL[0], cL[1]);
    ctx.lineTo(cR[0], cR[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Stacks ---
    // Sort by sin(angle) descending: most-positive = behind body first
    var sortedStacks = stackAngles
      .map(function (a, idx) {
        return { angle: a, idx: idx, depth: Math.sin(a) };
      })
      .sort(function (a, b) {
        return b.depth - a.depth;
      });

    // Helper: draw a single stack — an inverted spring hanging from the
    // ceiling at z = H (fixed in world) down to the flange attachment at
    // z = 0 (which rotates with the body)
    function drawStack(angle, idx, opacity) {
      var x = r1 * Math.cos(angle);
      var prominence = Math.abs(Math.cos(angle));
      var opa = (0.2 + 0.8 * prominence) * opacity;
      var lw = 0.5 + 1.5 * prominence;
      var amp = 2 + 4 * prominence;

      // Ceiling end (fixed in world space)
      var top = w2s(x, H);
      // Flange end (rotates with the body)
      var fp = rot2d(x, 0, pivotX, pivotZ, visTheta);
      var bot = w2s(fp[0], fp[1]);
      var dx = bot[0] - top[0],
        dy = bot[1] - top[1];
      var len = Math.hypot(dx, dy) || 1;
      var coils = 8;
      var nx = -dy / len,
        ny = dx / len;

      // Spring zigzag — starts at the ceiling (z = H), down to the flange
      ctx.beginPath();
      ctx.moveTo(top[0], top[1]);
      for (var k = 1; k <= coils; k++) {
        var fr = k / (coils + 1);
        var sg = k % 2 === 1 ? 1 : -1;
        ctx.lineTo(
          top[0] + dx * fr + nx * amp * sg,
          top[1] + dy * fr + ny * amp * sg,
        );
      }
      ctx.lineTo(bot[0], bot[1]);
      ctx.strokeStyle = "rgba(85, 85, 85, " + opa.toFixed(2) + ")";
      ctx.lineWidth = lw;
      ctx.stroke();

      // End caps
      ctx.fillStyle = "rgba(51, 51, 51, " + opa.toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(top[0], top[1], 2.2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bot[0], bot[1], 2.2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw back stacks (behind the body, sin(angle) > 0) — hidden when BW force is disabled
    if (opts.showStacks) {
      for (var si = 0; si < sortedStacks.length; si++) {
        if (sortedStacks[si].depth <= 0) break;
        drawStack(sortedStacks[si].angle, sortedStacks[si].idx, 0.7);
      }
    }

    // --- Body: flange rests on the ground (z = 0), upper body above ---
    function w2r(px, pz) {
      var r = rot2d(px, pz, pivotX, pivotZ, visTheta);
      return w2s(r[0], r[1]);
    }
    function drawRect(x0, x1, z0, z1, fill, stroke) {
      var p0 = w2r(x0, z0);
      var p1 = w2r(x1, z0);
      var p2 = w2r(x1, z1);
      var p3 = w2r(x0, z1);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Flange (rests on the ground at z = 0)
    drawRect(
      -d2 / 2,
      d2 / 2,
      0,
      h2,
      "rgba(0, 115, 189, 0.30)",
      "rgba(0, 115, 189, 0.65)",
    );
    // Upper body
    drawRect(
      -d3 / 2,
      d3 / 2,
      h2,
      zTop,
      "rgba(120, 171, 48, 0.30)",
      "rgba(120, 171, 48, 0.65)",
    );

    // Body centerline (rotates with the body) — shows the actual deflection
    var bc0 = w2r(0, 0);
    var bc1 = w2r(0, zTop);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "rgba(17, 17, 17, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bc0[0], bc0[1]);
    ctx.lineTo(bc1[0], bc1[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw front stacks (in front of the body, sin(angle) <= 0) — hidden when BW force is disabled
    if (opts.showStacks) {
      for (var si2 = 0; si2 < sortedStacks.length; si2++) {
        if (sortedStacks[si2].depth > 0) continue;
        drawStack(sortedStacks[si2].angle, sortedStacks[si2].idx, 1.0);
      }
    }

    // --- Pivot dot (red) at the rocking pivot, ground level ---
    var pp = w2s(pivotX, pivotZ);
    ctx.beginPath();
    ctx.arc(pp[0], pp[1], 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#dd2222";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- Inertial force arrow at the CM: F = m·aₓ (grows with the ramp) ---
    // The base accelerates in +x, so the inertial force on the body acts in
    // −x at the center of mass. With mass in lb (weight) and aₓ in g,
    // F = mass · aₓ in lb. The arrow comes from the left and its tip points
    // at the center of mass. Once the target is reached the load is removed
    // (aₓ = 0) and the arrow disappears. The label shows aₓ (g).
    var cmP = w2r(0, opts.hCM);
    var axNow =
      opts.tDrop !== null && data.t[i] >= opts.tDrop
        ? 0
        : opts.rate * data.t[i];
    var F = opts.mass * axNow; // lb
    var pxPerKlb = 20; // arrow scale: 20 px per 1000 lb
    var aLen = Math.min((F / 1000) * pxPerKlb, 220);
    var tailX = cmP[0] - aLen; // tail to the left of the CM
    var fcol = "#c2185b";
    ctx.strokeStyle = fcol;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tailX, cmP[1]);
    ctx.lineTo(cmP[0], cmP[1]);
    ctx.stroke();
    // Arrowhead at the CM, pointing right (into the CM)
    var ah = 9;
    ctx.beginPath();
    ctx.moveTo(cmP[0], cmP[1]);
    ctx.lineTo(cmP[0] - ah, cmP[1] - ah / 2);
    ctx.lineTo(cmP[0] - ah, cmP[1] + ah / 2);
    ctx.closePath();
    ctx.fillStyle = fcol;
    ctx.fill();
    // CM dot (drawn on top of the arrow tip)
    ctx.beginPath();
    ctx.arc(cmP[0], cmP[1], 3, 0, 2 * Math.PI);
    ctx.fillStyle = fcol;
    ctx.fill();
    // Label: aₓ in g
    ctx.fillStyle = "#111111";
    ctx.font = "12px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "a\u2093 = " + axNow.toFixed(2) + " g",
      (cmP[0] + tailX) / 2,
      cmP[1] - 10,
    );

    // --- Info text ---
    ctx.fillStyle = "#111111";
    ctx.font = "13px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      "t = " +
        data.t[i].toFixed(2) +
        " s   (\u03C6 = " +
        ((phi / Math.PI) * 180).toFixed(1) +
        "\u00B0,  \u03B8 = " +
        ((theta / Math.PI) * 180).toFixed(3) +
        "\u00B0)",
      12,
      20,
    );

    // --- Geometry readout ---
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      "r\u2080 = " +
        r0.toFixed(1) +
        " in   d\u2083 = " +
        d3 +
        " in   h\u2083 = " +
        h3 +
        " in",
      12,
      Hh - 12,
    );
  }

  function tick(now) {
    if (last !== undefined && playing) {
      acc += ((now - last) / 1e3) * speed;
      while (acc >= frameDt) {
        acc -= frameDt;
        frame = (frame + 1) % data.t.length;
      }
    }
    last = now;
    renderFrame(frame);
    if (opts.onUpdate) opts.onUpdate(frame);
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  return {
    play: function () {
      playing = true;
    },
    pause: function () {
      playing = false;
    },
    toggle: function () {
      playing = !playing;
      return playing;
    },
    seek: function (i) {
      frame = Math.max(0, Math.min(data.t.length - 1, i));
      acc = 0;
    },
    setSpeed: function (v) {
      speed = v;
    },
    get isPlaying() {
      return playing;
    },
    get frame() {
      return frame;
    },
    destroy: function () {
      cancelAnimationFrame(raf);
    },
  };
}

// ============================================================
// DOM element references
// ============================================================
var statusEl = document.getElementById("ma-status");
var canvas = document.getElementById("ma-canvas");
var playBtn = document.getElementById("ma-play");
var stepBtn = document.getElementById("ma-step");
var resetBtn = document.getElementById("ma-reset");
var speedSel = document.getElementById("ma-speed");
var slider = document.getElementById("ma-slider");
var frameEl = document.getElementById("ma-frame");
var timeEl = document.getElementById("ma-time");
var runBtn = document.getElementById("ma-run");
var runWarning = document.getElementById("ma-run-warning");
var animWarning = document.getElementById("ma-anim-warning");
var noBwEl = document.getElementById("ma-no-bw");

// ============================================================
// Live value readouts next to every slider
// ============================================================
function refreshReadout(input) {
  var val = input.parentElement.querySelector(".val");
  if (!val) return;
  var dec = input.step.indexOf(".") >= 0 ? input.step.split(".")[1].length : 0;
  val.textContent = Number(input.value).toFixed(dec);
}
document
  .querySelectorAll('.ctrl input[type="range"]')
  .forEach(function (input) {
    input.addEventListener("input", function () {
      refreshReadout(input);
    });
    refreshReadout(input);
  });

// ============================================================
// Helper: read numeric value from DOM element by id
// ============================================================
function numVal(id) {
  var el = document.getElementById(id);
  var v = parseFloat(el.value);
  return Number.isFinite(v) ? v : 0;
}

// ============================================================
// Simulation state
// ============================================================
var animator = null;
var animOpts = null;
var workerRunId = 0;
var res = null;
var data = null;
var stride = 10;
var T = null,
  theta = null;
var plotHandles = {};
var lastRun = null; // { rate, targetDeg } of the most recent completed run
var computedTargetDeg = 1; // 0.2·atan(r0/hCM) when BW force is disabled

// ============================================================
// Disable-BW checkbox: locks the target to 0.2·atan(r0/hCM)
// ============================================================
function updateNoBw() {
  var noBw = noBwEl.checked;
  var targetEl = document.getElementById("ma-target");
  var note = document.getElementById("ma-no-bw-note");
  if (noBw) {
    computedTargetDeg =
      (0.2 * Math.atan(numVal("ma-r0") / numVal("ma-hcm")) * 180) / Math.PI;
    targetEl.disabled = true;
    var val = targetEl.parentElement.querySelector(".val");
    if (val) val.textContent = computedTargetDeg.toFixed(2);
    if (note) {
      note.hidden = false;
      var nv = note.querySelector(".val");
      if (nv) nv.textContent = computedTargetDeg.toFixed(2);
    }
  } else {
    targetEl.disabled = false;
    refreshReadout(targetEl);
    if (note) note.hidden = true;
  }
}

// ============================================================
// Live ramp preview (Excitation tab + mobile drawer)
// ============================================================
function drawInputPreview() {
  var rate = numVal("ma-rate");
  var horizon = 20;
  var dropT = null;
  if (res && res.tDrop !== null && lastRun && lastRun.rate === rate) {
    dropT = res.tDrop;
    horizon = Math.max(horizon, dropT + 2);
  } else if (res && res.crossing) {
    horizon = Math.max(horizon, res.crossing.t + 2);
  }
  var n = Math.round(horizon / 1e-3) + 1;
  var pts = [];
  for (var i = 0; i < n; i++) {
    var t = i * 1e-3;
    var a = dropT !== null && t >= dropT ? 0 : rate * t;
    pts.push([t, a]);
  }
  // Markers from the last run are only meaningful while the ramp rate matches
  var markers = [];
  if (res && res.crossing && lastRun && lastRun.rate === rate)
    markers.push({ id: "mk-cross", color: "#dc2626", label: "target" });
  var plot = buildPlot({
    title: "Base accel a\u2093(t)",
    xlabel: "Time (s)",
    ylabel: "a\u2093 (g)",
    width: 320,
    height: 200,
    markers: markers,
    series: [{ pts: ds(pts), color: "#0072BD" }],
  });
  document.getElementById("plot-ax-live").innerHTML = plot.svg;
  var drawer = document.getElementById("plot-ax-live-drawer");
  if (drawer) drawer.innerHTML = plot.svg;
  plotHandles.axPlot = plot;
  if (res && res.crossing && lastRun && lastRun.rate === rate)
    plot.setMarker("mk-cross", res.crossing.t, res.crossing.accel);
}

// ============================================================
// Excitation actually used by the last run (below the live preview)
// ============================================================
function buildRunInputPlot() {
  if (!res || !T) return;
  var el = document.getElementById("plot-ax-run");
  if (!el) return;
  var markers = [];
  if (res.activation)
    markers.push({
      id: "mk-run-act",
      color: "#2e7d32",
      label: "onset " + res.activation.accel.toFixed(2) + " g",
    });
  if (res.crossing)
    markers.push({ id: "mk-run-cross", color: "#dc2626", label: "target" });
  if (res.tDrop !== null)
    markers.push({ id: "mk-run-drop", color: "#7b1fa2", label: "load off" });
  var plot = buildPlot({
    title: "Base accel a\u2093(t) \u2014 run",
    xlabel: "Time (s)",
    ylabel: "a\u2093 (g)",
    width: 320,
    height: 200,
    cursors: [{ id: "cur-ax-run", seriesIndex: 0 }],
    markers: markers,
    series: [
      {
        pts: ds(
          T.map(function (t, i) {
            return [t, res.u_[i][0] / 386.4];
          }),
        ),
        color: "#0072BD",
      },
    ],
  });
  el.innerHTML = plot.svg;
  plotHandles.axRunPlot = plot;
  if (res.activation)
    plot.setMarker("mk-run-act", res.activation.t, res.activation.accel);
  if (res.crossing)
    plot.setMarker("mk-run-cross", res.crossing.t, res.crossing.accel);
  if (res.tDrop !== null) plot.setMarker("mk-run-drop", res.tDrop, 0);
}

// ============================================================
// Plots: theta(t) and total stack force(t)
// ============================================================
function buildPlots() {
  var DEGlocal = 180 / Math.PI;
  var thetaMarkers = [];
  if (res && res.activation)
    thetaMarkers.push({ id: "mk-act-theta", color: "#2e7d32", label: "onset" });
  if (res && res.crossing)
    thetaMarkers.push({
      id: "mk-cross-theta",
      color: "#dc2626",
      label: "target",
    });
  var thetaPlot = buildPlot({
    title: "Rotation \u03B8(t)",
    xlabel: "Time (s)",
    ylabel: "\u03B8 (deg)",
    width: 320,
    height: 200,
    cursors: [{ id: "cur-theta", seriesIndex: 0 }],
    markers: thetaMarkers,
    series: [
      {
        pts: ds(
          T.map(function (t, i) {
            return [t, theta[i] * DEGlocal];
          }),
        ),
        color: "#0072BD",
      },
    ],
  });
  var fTotal = res.fBWtotal.map(function (r) {
    return r.reduce(function (a, b) {
      return a + b;
    }, 0);
  });
  var forcePlot = buildPlot({
    title: "Total stack force \u03A3F(t)",
    xlabel: "Time (s)",
    ylabel: "Force (lb)",
    width: 320,
    height: 200,
    cursors: [{ id: "cur-force", seriesIndex: 0 }],
    series: [
      {
        pts: ds(
          T.map(function (t, i) {
            return [t, fTotal[i]];
          }),
        ),
        color: "#D95319",
      },
    ],
  });
  document.getElementById("plot-theta").innerHTML = thetaPlot.svg;
  plotHandles.thetaPlot = thetaPlot;
  if (res && res.activation) {
    thetaPlot.setMarker(
      "mk-act-theta",
      res.activation.t,
      res.activation.theta * DEGlocal,
    );
  }
  if (res && res.crossing) {
    thetaPlot.setMarker(
      "mk-cross-theta",
      res.crossing.t,
      res.crossing.theta * DEGlocal,
    );
  }
  // Total stack force plot is meaningless when the BW force is disabled
  var forceEl = document.getElementById("plot-force-total");
  if (lastRun && lastRun.disableBW) {
    forceEl.innerHTML =
      '<p class="panel-note">BW force disabled \u2014 no stack forces.</p>';
    plotHandles.forcePlot = null;
  } else {
    forceEl.innerHTML = forcePlot.svg;
    plotHandles.forcePlot = forcePlot;
  }
}

// ============================================================
// Run simulation via Web Worker
// ============================================================
function runSimulation() {
  if (runBtn.disabled) return;
  runBtn.disabled = true;
  playBtn.textContent = "Play";
  statusEl.classList.remove("error", "warning");
  statusEl.textContent = "Running \u2014 please\u2026";
  if (runWarning) runWarning.hidden = false;
  if (animWarning) animWarning.hidden = false;

  var noBw = noBwEl.checked;
  var params = {
    rate: numVal("ma-rate"),
    targetDeg: noBw ? computedTargetDeg : numVal("ma-target"),
    mass: numVal("ma-mass"),
    r0: numVal("ma-r0"),
    hCM: numVal("ma-hcm"),
    maxT: 10,
    segLen: 2,
    freeT: 10,
    disableBW: noBw,
  };

  var worker = new Worker("minaccel-worker.js");
  var runId = ++workerRunId;

  worker.onmessage = function (e) {
    var msg = e.data;
    if (msg.id !== runId) return;
    worker.terminate();
    if (!msg.ok) {
      console.error(msg.error);
      statusEl.classList.remove("warning");
      statusEl.classList.add("error");
      statusEl.textContent = "Error: " + msg.error;
      if (runWarning) runWarning.hidden = true;
      if (animWarning) animWarning.hidden = true;
      runBtn.disabled = false;
      return;
    }

    res = msg.res;
    lastRun = {
      rate: params.rate,
      targetDeg: params.targetDeg,
      disableBW: params.disableBW,
    };
    stride = 10;
    data = {
      t: res.T.filter(function (_, i) {
        return i % stride === 0;
      }),
      phi: res.Phi.filter(function (_, i) {
        return i % stride === 0;
      }),
      theta: res.X.map(function (r) {
        return r[0];
      }).filter(function (_, i) {
        return i % stride === 0;
      }),
    };
    T = res.T;
    theta = res.X.map(function (r) {
      return r[0];
    });

    buildPlots();
    drawInputPreview();
    buildRunInputPlot();

    if (animator) animator.destroy();

    var curR0 = numVal("ma-r0");
    animOpts = {
      geom: { h1: 24, d1: 12, h2: 1, d2: 2 * curR0, h3: 72, d3: 16, r0: curR0 },
      thetaGain: 1, // true angle — no visual exaggeration
      stackRadius: 10.5,
      nStacks: 12,
      stackFreeLength: 5,
      mass: numVal("ma-mass"),
      rate: numVal("ma-rate"),
      hCM: numVal("ma-hcm"),
      tDrop: res.tDrop, // null when the target wasn't reached
      showStacks: !params.disableBW, // hide springs when BW force is disabled
      fps: 50,
      onUpdate: function (frame) {
        slider.value = String(frame);
        timeEl.textContent = "t = " + data.t[frame].toFixed(2) + " s";
        frameEl.textContent =
          "Frame " + String(frame + 1).padStart(4, "0") + " / " + data.t.length;
        if (plotHandles.axRunPlot)
          plotHandles.axRunPlot.setCursor(data.t[frame]);
        plotHandles.thetaPlot.setCursor(data.t[frame]);
        if (plotHandles.forcePlot)
          plotHandles.forcePlot.setCursor(data.t[frame]);
      },
    };

    animator = create2DBushingAnimator(canvas, data, animOpts);
    playBtn.textContent = "Pause";
    slider.max = String(data.t.length - 1);
    slider.value = "0";
    activateTab("tab-resp");

    statusEl.classList.remove("warning");
    if (runWarning) runWarning.hidden = true;
    if (animWarning) animWarning.hidden = true;

    if (res.reached && res.crossing) {
      var msg =
        "\u03B8 reached " +
        ((res.crossing.theta * 180) / Math.PI).toFixed(2) +
        "\u00B0 at t = " +
        res.crossing.t.toFixed(2) +
        " s (a\u2093 = " +
        res.crossing.accel.toFixed(2) +
        " g)" +
        " \u00B7 rocking onset at a\u2093 = " +
        res.activation.accel.toFixed(2) +
        " g";
      if (res.tDrop !== null) {
        msg += " \u00B7 load removed, free response for " + res.freeT + " s";
      }
      statusEl.textContent = msg;
    } else {
      statusEl.classList.add("warning");
      statusEl.textContent =
        "Target \u03B8 = " +
        params.targetDeg.toFixed(1) +
        "\u00B0 not reached within " +
        res.maxT.toFixed(0) +
        " s \u2014 increase the ramp rate or lower the target.";
    }
    runBtn.disabled = false;
  };

  worker.onerror = function (e) {
    console.error(e);
    statusEl.classList.remove("warning");
    statusEl.classList.add("error");
    statusEl.textContent = "Worker error: " + e.message;
    if (runWarning) runWarning.hidden = true;
    if (animWarning) animWarning.hidden = true;
    runBtn.disabled = false;
  };

  worker.postMessage({ id: runId, params: params });
}

// ============================================================
// Render the timeline slider readout
// ============================================================
function renderSlider() {
  if (!animator || !data) return;
  slider.value = String(animator.frame);
  timeEl.textContent = "t = " + data.t[animator.frame].toFixed(2) + " s";
  frameEl.textContent =
    "Frame " +
    String(animator.frame + 1).padStart(4, "0") +
    " / " +
    data.t.length;
}

// ============================================================
// Tab activation
// ============================================================
function activateTab(btnId) {
  document.querySelectorAll("#ma-tabs .tab").forEach(function (b) {
    b.classList.remove("active");
  });
  document.querySelectorAll(".sidebar.right .panelrow").forEach(function (p) {
    p.classList.remove("active");
  });
  document.getElementById(btnId).classList.add("active");
  document.getElementById("panel-" + btnId.slice(4)).classList.add("active");
}

// ============================================================
// Transport controls
// ============================================================
playBtn.addEventListener("click", function () {
  if (!animator) return;
  playBtn.textContent = animator.toggle() ? "Pause" : "Play";
});
stepBtn.addEventListener("click", function () {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(animator.frame + 1);
});
resetBtn.addEventListener("click", function () {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(0);
});
speedSel.addEventListener("change", function () {
  if (animator) animator.setSpeed(parseFloat(speedSel.value));
});
slider.addEventListener("input", function () {
  if (!animator) return;
  animator.pause();
  playBtn.textContent = "Play";
  animator.seek(parseInt(slider.value, 10));
});
runBtn.addEventListener("click", runSimulation);

// ============================================================
// Mobile options drawer: the simulation inputs slide in from the left.
// ============================================================
var optionsToggle = document.getElementById("ma-options-toggle");
var optionsBackdrop = document.getElementById("ma-options-backdrop");
var optionsDrawer = document.getElementById("ma-options-drawer");
function setOptionsOpen(open) {
  if (!optionsDrawer || !optionsBackdrop) return;
  optionsDrawer.classList.toggle("open", open);
  optionsBackdrop.classList.toggle("show", open);
}
optionsToggle.addEventListener("click", function () {
  setOptionsOpen(!optionsDrawer.classList.contains("open"));
});
optionsBackdrop.addEventListener("click", function () {
  setOptionsOpen(false);
});

// ============================================================
// Excitation control changes -> live preview
// ============================================================
["ma-rate", "ma-target"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () {
    activateTab("tab-exc");
    drawInputPreview();
  });
});

// ============================================================
// Disable-BW checkbox changes
// ============================================================
noBwEl.addEventListener("change", function () {
  updateNoBw();
  activateTab("tab-exc");
  drawInputPreview();
});

// ============================================================
// Body parameter changes (also recompute the no-BW target)
// ============================================================
["ma-mass", "ma-r0", "ma-hcm"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", function () {
    updateNoBw();
    drawInputPreview();
  });
});

// ============================================================
// Tab click handlers
// ============================================================
["tab-exc", "tab-resp"].forEach(function (btnId) {
  document.getElementById(btnId).addEventListener("click", function () {
    activateTab(btnId);
  });
});

// ============================================================
// Initialization: draw preview, then run
// ============================================================
updateNoBw();
drawInputPreview();
runSimulation();
