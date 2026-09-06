(() => {
  // node_modules/diff-grok/dist/src/solver-tools/solver-defs.js
  var abs = (x) => x > 0 ? x : -x;
  var max = (x, y) => x > y ? x : y;
  var SAFETY = 0.9;
  var REDUCE_COEF = 0.25;
  var GROW_COEF = 4;
  var ERR_CONTR = 189e-6;
  var TINY = 1e-20;
  var ERROR_MSG;
  (function(ERROR_MSG4) {
    ERROR_MSG4["MRT_FAILS"] = "The modified Rosenbrock triple method fails";
    ERROR_MSG4["ROS3PRW_FAILS"] = "The ROS3PRw method fails";
    ERROR_MSG4["ROS34PRW_FAILS"] = "The ROS34PRw method fails";
    ERROR_MSG4["RK4_FAILS"] = "The Runge-Kutta-Fehlberg 4(5) method fails";
    ERROR_MSG4["AB5_FAILS"] = "The Adams-Bashforth-Moulton 5 method fails";
    ERROR_MSG4["AB4_FAILS"] = "The Adams-Bashforth-Moulton 4 method fails";
    ERROR_MSG4["RKDP_FAILS"] = "The Dormand-Prince 5(4) method fails";
    ERROR_MSG4["RK3_FAILS"] = "The Bogacki-Shampine 3(2) method fails";
    ERROR_MSG4["LSODA_FAILS"] = "The LSODA method fails";
    ERROR_MSG4["CVODE_FAILS"] = "The CVODE method fails";
  })(ERROR_MSG || (ERROR_MSG = {}));
  var DEFAULT_OPTIONS;
  (function(DEFAULT_OPTIONS2) {
    DEFAULT_OPTIONS2["SCRIPTING"] = "{maxIterations: 1}";
    DEFAULT_OPTIONS2["NO_CHECKS"] = "{ }";
  })(DEFAULT_OPTIONS || (DEFAULT_OPTIONS = {}));

  // node_modules/diff-grok/dist/src/solver-tools/mrt-method.js
  var D = 1 - Math.sqrt(2) / 2;
  var E32 = 6 + Math.sqrt(2);
  var TWO_D = 2 * D;
  var ONE_MINUS_2D = 1 - TWO_D;

  // node_modules/diff-grok/dist/src/solver-tools/ros3prw-method.js
  var GAMMA = 0.7886751345948129;
  var GAMMA_21 = -2.366025403784439;
  var GAMMA_21_SCALED = GAMMA_21 / GAMMA;
  var GAMMA_2 = GAMMA_21 + GAMMA;
  var GAMMA_31 = -0.8679121828035516;
  var GAMMA_31_SCALED = GAMMA_31 / GAMMA;
  var GAMMA_32 = -0.8730669589464232;
  var GAMMA_32_SCALED = GAMMA_32 / GAMMA;
  var GAMMA_3 = GAMMA_31 + GAMMA_32 + GAMMA;
  var ALPHA_31 = 0.5;
  var ALPHA_32 = 0.7679491924311227;
  var ALPHA_3 = ALPHA_31 + ALPHA_32;
  var B_1 = 0.5054486784085176;
  var B_2 = -0.1157168760363756;
  var B_3 = 0.610268197627858;
  var B_HAT_1 = 0.28973180237214197;
  var B_HAT_2 = 0.1;
  var B_HAT_3 = 0.610268197627858;
  var R_1 = B_1 - B_HAT_1;
  var R_2 = B_2 - B_HAT_2;
  var R_3 = B_3 - B_HAT_3;

  // node_modules/diff-grok/dist/src/solver-tools/ros34prw-method.js
  var GAMMA2 = 0.435866521508459;
  var GAMMA_212 = -1.307599564525377;
  var GAMMA_21_SCALED2 = GAMMA_212 / GAMMA2;
  var GAMMA_22 = GAMMA_212 + GAMMA2;
  var GAMMA_312 = -0.7098857586097217;
  var GAMMA_31_SCALED2 = GAMMA_312 / GAMMA2;
  var GAMMA_322 = -0.5599673596027777;
  var GAMMA_32_SCALED2 = GAMMA_322 / GAMMA2;
  var GAMMA_33 = GAMMA_312 + GAMMA_322 + GAMMA2;
  var GAMMA_41 = -0.15550856807552085;
  var GAMMA_41_SCALED = GAMMA_41 / GAMMA2;
  var GAMMA_42 = -0.9538851657511223;
  var GAMMA_42_SCALED = GAMMA_42 / GAMMA2;
  var GAMMA_43 = 0.6735272123181841;
  var GAMMA_43_SCALED = GAMMA_43 / GAMMA2;
  var GAMMA_4 = GAMMA_41 + GAMMA_42 + GAMMA_43 + GAMMA2;
  var B_12 = 0.3444914319244792;
  var B_22 = -0.4538851657511223;
  var B_32 = 0.6735272123181841;
  var B_4 = 0.435866521508459;
  var B_HAT_12 = 0.5;
  var B_HAT_22 = -0.2573881208652208;
  var B_HAT_32 = 0.43542008724775044;
  var B_HAT_4 = 0.32196803361747034;
  var R_12 = B_12 - B_HAT_12;
  var R_22 = B_22 - B_HAT_22;
  var R_32 = B_32 - B_HAT_32;
  var R_4 = B_4 - B_HAT_4;

  // node_modules/diff-grok/dist/src/solver-tools/rk4-method.js
  var C2 = 1 / 4;
  var C3 = 3 / 8;
  var C4 = 12 / 13;
  var C6 = 1 / 2;
  var A21 = 1 / 4;
  var A31 = 3 / 32;
  var A32 = 9 / 32;
  var A41 = 1932 / 2197;
  var A42 = -7200 / 2197;
  var A43 = 7296 / 2197;
  var A51 = 439 / 216;
  var A53 = 3680 / 513;
  var A54 = -845 / 4104;
  var A61 = -8 / 27;
  var A63 = -3544 / 2565;
  var A64 = 1859 / 4104;
  var A65 = -11 / 40;
  var B1 = 25 / 216;
  var B3 = 1408 / 2565;
  var B4 = 2197 / 4104;
  var B5 = -1 / 5;
  var E1 = 1 / 360;
  var E3 = -128 / 4275;
  var E4 = -2197 / 75240;
  var E5 = 1 / 50;
  var E6 = 2 / 55;

  // node_modules/diff-grok/dist/src/solver-tools/ab5-method.js
  var AB0 = 1901 / 720;
  var AB1 = -2774 / 720;
  var AB2 = 2616 / 720;
  var AB3 = -1274 / 720;
  var AB4 = 251 / 720;
  var AM_NEW = 251 / 720;
  var AM0 = 646 / 720;
  var AM1 = -264 / 720;
  var AM2 = 106 / 720;
  var AM3 = -19 / 720;
  var MILNE = 2 / 27;
  var C22 = 1 / 4;
  var C32 = 3 / 8;
  var C42 = 12 / 13;
  var C62 = 1 / 2;
  var A212 = 1 / 4;
  var A312 = 3 / 32;
  var A322 = 9 / 32;
  var A412 = 1932 / 2197;
  var A422 = -7200 / 2197;
  var A432 = 7296 / 2197;
  var A512 = 439 / 216;
  var A532 = 3680 / 513;
  var A542 = -845 / 4104;
  var A612 = -8 / 27;
  var A632 = -3544 / 2565;
  var A642 = 1859 / 4104;
  var A652 = -11 / 40;
  var B12 = 25 / 216;
  var B32 = 1408 / 2565;
  var B42 = 2197 / 4104;
  var B52 = -1 / 5;
  var RKE1 = 1 / 360;
  var RKE3 = -128 / 4275;
  var RKE4 = -2197 / 75240;
  var RKE5 = 1 / 50;
  var RKE6 = 2 / 55;

  // node_modules/diff-grok/dist/src/solver-tools/ab4-method.js
  var AB02 = 55 / 24;
  var AB12 = -59 / 24;
  var AB22 = 37 / 24;
  var AB32 = -9 / 24;
  var AM_NEW2 = 9 / 24;
  var AM02 = 19 / 24;
  var AM12 = -5 / 24;
  var AM22 = 1 / 24;
  var MILNE2 = 19 / 270;
  var C23 = 1 / 4;
  var C33 = 3 / 8;
  var C43 = 12 / 13;
  var C63 = 1 / 2;
  var A213 = 1 / 4;
  var A313 = 3 / 32;
  var A323 = 9 / 32;
  var A413 = 1932 / 2197;
  var A423 = -7200 / 2197;
  var A433 = 7296 / 2197;
  var A513 = 439 / 216;
  var A533 = 3680 / 513;
  var A543 = -845 / 4104;
  var A613 = -8 / 27;
  var A633 = -3544 / 2565;
  var A643 = 1859 / 4104;
  var A653 = -11 / 40;
  var B13 = 25 / 216;
  var B33 = 1408 / 2565;
  var B43 = 2197 / 4104;
  var B53 = -1 / 5;
  var RKE12 = 1 / 360;
  var RKE32 = -128 / 4275;
  var RKE42 = -2197 / 75240;
  var RKE52 = 1 / 50;
  var RKE62 = 2 / 55;

  // node_modules/diff-grok/dist/src/solver-tools/rkdp-method.js
  var PSHRNK2 = -0.2;
  var PSGROW2 = -1 / 6;
  var C24 = 1 / 5;
  var C34 = 3 / 10;
  var C44 = 4 / 5;
  var C5 = 8 / 9;
  var A214 = 1 / 5;
  var A314 = 3 / 40;
  var A324 = 9 / 40;
  var A414 = 44 / 45;
  var A424 = -56 / 15;
  var A434 = 32 / 9;
  var A514 = 19372 / 6561;
  var A52 = -25360 / 2187;
  var A534 = 64448 / 6561;
  var A544 = -212 / 729;
  var A614 = 9017 / 3168;
  var A62 = -355 / 33;
  var A634 = 46732 / 5247;
  var A644 = 49 / 176;
  var A654 = -5103 / 18656;
  var B14 = 35 / 384;
  var B34 = 500 / 1113;
  var B44 = 125 / 192;
  var B54 = -2187 / 6784;
  var B6 = 11 / 84;
  var E12 = 71 / 57600;
  var E33 = -71 / 16695;
  var E42 = 71 / 1920;
  var E52 = -17253 / 339200;
  var E62 = 22 / 525;
  var E7 = -1 / 40;
  function rkdp(odes, callback) {
    const f = odes.func;
    const t0 = odes.arg.start;
    const t1 = odes.arg.finish;
    let h = odes.arg.step;
    const hDataframe = h;
    const hMax = hDataframe * 10;
    const tolerance = odes.tolerance;
    const rowCount = Math.trunc((t1 - t0) / h) + 1;
    const dim = odes.initial.length;
    const tArr = new Float64Array(rowCount);
    const yArrs = Array(dim);
    for (let i = 0; i < dim; ++i)
      yArrs[i] = new Float64Array(rowCount);
    let timeDataframe = t0 + hDataframe;
    let t = t0;
    let tPrev = t0;
    let hNext = 0;
    let flag = true;
    let index = 1;
    let errmax = 0;
    let hTemp = 0;
    let tNew = 0;
    const y = new Float64Array(odes.initial);
    const yPrev = new Float64Array(odes.initial);
    const dydt = new Float64Array(dim);
    const yScale = new Float64Array(dim);
    const yTemp = new Float64Array(dim);
    const yErr = new Float64Array(dim);
    const k1 = new Float64Array(dim);
    const k2 = new Float64Array(dim);
    const k3 = new Float64Array(dim);
    const k4 = new Float64Array(dim);
    const k5 = new Float64Array(dim);
    const k6 = new Float64Array(dim);
    const k7 = new Float64Array(dim);
    tArr[0] = t0;
    for (let i = 0; i < dim; ++i)
      yArrs[i][0] = y[i];
    while (flag) {
      f(t, y, dydt);
      if (callback)
        callback.onIterationStart();
      for (let i = 0; i < dim; ++i)
        yScale[i] = abs(y[i]) + h * abs(dydt[i]) + TINY;
      if (t + h > t1) {
        h = t1 - t;
        flag = false;
      }
      while (true) {
        f(t, y, k1);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * A214 * k1[i];
        f(t + C24 * h, yTemp, k2);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * (A314 * k1[i] + A324 * k2[i]);
        f(t + C34 * h, yTemp, k3);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * (A414 * k1[i] + A424 * k2[i] + A434 * k3[i]);
        f(t + C44 * h, yTemp, k4);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * (A514 * k1[i] + A52 * k2[i] + A534 * k3[i] + A544 * k4[i]);
        f(t + C5 * h, yTemp, k5);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * (A614 * k1[i] + A62 * k2[i] + A634 * k3[i] + A644 * k4[i] + A654 * k5[i]);
        f(t + h, yTemp, k6);
        for (let i = 0; i < dim; ++i)
          yTemp[i] = y[i] + h * (B14 * k1[i] + B34 * k3[i] + B44 * k4[i] + B54 * k5[i] + B6 * k6[i]);
        f(t + h, yTemp, k7);
        for (let i = 0; i < dim; ++i)
          yErr[i] = h * (E12 * k1[i] + E33 * k3[i] + E42 * k4[i] + E52 * k5[i] + E62 * k6[i] + E7 * k7[i]);
        errmax = 0;
        for (let i = 0; i < dim; ++i)
          errmax = max(errmax, abs(yErr[i] / yScale[i]));
        errmax /= tolerance;
        if (errmax > 1) {
          hTemp = SAFETY * h * errmax ** PSHRNK2;
          h = max(hTemp, REDUCE_COEF * h);
          tNew = t + h;
          if (tNew == t)
            throw new Error(ERROR_MSG.RKDP_FAILS);
        } else {
          if (errmax > ERR_CONTR)
            hNext = SAFETY * h * errmax ** PSGROW2;
          else
            hNext = GROW_COEF * h;
          if (hNext > hMax)
            hNext = hMax;
          t = t + h;
          for (let i = 0; i < dim; ++i)
            y[i] = yTemp[i];
          break;
        }
      }
      while (timeDataframe < t) {
        const cLeft = (t - timeDataframe) / (t - tPrev);
        const cRight = 1 - cLeft;
        tArr[index] = timeDataframe;
        for (let j = 0; j < dim; ++j)
          yArrs[j][index] = cRight * y[j] + cLeft * yPrev[j];
        timeDataframe += hDataframe;
        ++index;
      }
      h = hNext;
      tPrev = t;
      for (let i = 0; i < dim; ++i)
        yPrev[i] = y[i];
    }
    if (callback)
      callback.onComputationsCompleted();
    tArr[rowCount - 1] = t1;
    for (let i = 0; i < dim; ++i)
      yArrs[i][rowCount - 1] = y[i];
    const solution = Array(dim + 1);
    solution[0] = tArr;
    for (let i = 0; i < dim; ++i)
      solution[i + 1] = yArrs[i];
    return solution;
  }

  // node_modules/diff-grok/dist/src/solver-tools/rk3-method.js
  var PSHRNK3 = -1 / 3;
  var C25 = 1 / 2;
  var C35 = 3 / 4;
  var A215 = 1 / 2;
  var A325 = 3 / 4;
  var B15 = 2 / 9;
  var B2 = 1 / 3;
  var B35 = 4 / 9;
  var E13 = -5 / 72;
  var E2 = 1 / 12;
  var E34 = 1 / 9;
  var E43 = -1 / 8;

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/common.js
  var ETA = 2220446049250313e-31;
  var SQRTETA = 14901161193847656e-24;
  var CCMAX = 0.3;
  var MAXCOR = 3;
  var MSBP = 20;
  var MXNCF = 10;
  var RATIO = 5;
  var sm1 = [
    0,
    0.5,
    0.575,
    0.55,
    0.45,
    0.35,
    0.25,
    0.2,
    0.15,
    0.1,
    0.075,
    0.05,
    0.025
  ];
  var cm1 = [
    0,
    2,
    5.999999999999998,
    4,
    1.578034682080988,
    0.44444444444444464,
    0.09712509625876042,
    0.017636684303350973,
    0.002666977809498494,
    337605911606744e-18,
    3571428571428593e-20,
    31001984126984254e-22,
    21543369643350993e-23
  ];
  var cm2 = [
    0,
    2,
    1.5,
    0.6666666666666667,
    0.20833333333333348,
    0.04999999999999998,
    0.09712509625876042,
    0.017636684303350973,
    0.002666977809498494,
    337605911606744e-18,
    3571428571428593e-20,
    31001984126984254e-22,
    21543369643350993e-23
  ];
  var LsodaCommon = class {
    // Solution history (2D: yh[j][i], 1-indexed)
    yh = [];
    // Working matrix for Jacobian/LU (2D: wm[i][j], 1-indexed)
    wm = [];
    // Error weights (1-indexed)
    ewt = new Float64Array(0);
    // Saved function values (1-indexed)
    savf = new Float64Array(0);
    // Accumulated corrections (1-indexed)
    acor = new Float64Array(0);
    // Pivot indices for LU (1-indexed)
    ipvt = new Int32Array(0);
    // Step size
    h = 0;
    hu = 0;
    rc = 0;
    tn = 0;
    tsw = 0;
    pdnorm = 0;
    // Convergence
    crate = 0;
    el = new Float64Array(14);
    hold = 0;
    rmax = 0;
    pdest = 0;
    pdlast = 0;
    // Method coefficients (2D arrays, 1-indexed)
    elco = [];
    tesco = [];
    // Counters and flags
    ialth = 0;
    ipup = 0;
    nslp = 0;
    icount = 0;
    irflag = 0;
    imxer = 0;
    illin = 0;
    nhnil = 0;
    nslast = 0;
    jcur = 0;
    meth = 0;
    mused = 0;
    nq = 0;
    nst = 0;
    ncf = 0;
    nfe = 0;
    nje = 0;
    nqu = 0;
    miter = 0;
  };
  var LsodaContext = class {
    func;
    data;
    neq;
    state;
    error = null;
    common = null;
    opt = null;
    snapshots = null;
    constructor(func, neq, data) {
      this.func = func;
      this.neq = neq;
      this.data = data ?? null;
      this.state = 1;
    }
  };

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/blas.js
  function daxpy(n, da, dx, incx, dy, incy) {
    if (n < 0 || da === 0)
      return;
    if (incx !== incy || incx < 1) {
      let ix = 1;
      let iy = 1;
      if (incx < 0)
        ix = (-n + 1) * incx + 1;
      if (incy < 0)
        iy = (-n + 1) * incy + 1;
      for (let i = 1; i <= n; i++) {
        dy[iy] = dy[iy] + da * dx[ix];
        ix += incx;
        iy += incy;
      }
      return;
    }
    if (incx === 1) {
      const m = n % 4;
      if (m !== 0) {
        for (let i = 1; i <= m; i++)
          dy[i] = dy[i] + da * dx[i];
        if (n < 4)
          return;
      }
      for (let i = m + 1; i <= n; i += 4) {
        dy[i] = dy[i] + da * dx[i];
        dy[i + 1] = dy[i + 1] + da * dx[i + 1];
        dy[i + 2] = dy[i + 2] + da * dx[i + 2];
        dy[i + 3] = dy[i + 3] + da * dx[i + 3];
      }
      return;
    }
    for (let i = 1; i <= n * incx; i += incx)
      dy[i] = da * dx[i] + dy[i];
  }
  function ddot(n, dx, incx, dy, incy) {
    let dotprod = 0;
    if (n <= 0)
      return dotprod;
    if (incx !== incy || incx < 1) {
      let ix = 1;
      let iy = 1;
      if (incx < 0)
        ix = (-n + 1) * incx + 1;
      if (incy < 0)
        iy = (-n + 1) * incy + 1;
      for (let i = 1; i <= n; i++) {
        dotprod += dx[ix] * dy[iy];
        ix += incx;
        iy += incy;
      }
      return dotprod;
    }
    if (incx === 1) {
      for (let i = 1; i <= n; i++)
        dotprod += dx[i] * dy[i];
      return dotprod;
    }
    for (let i = 1; i <= n * incx; i += incx)
      dotprod += dx[i] * dy[i];
    return dotprod;
  }
  function dscal(n, da, dx, incx) {
    if (n <= 0)
      return;
    if (incx !== 1) {
      for (let i = 1; i <= n * incx; i += incx)
        dx[i] = da * dx[i];
      return;
    }
    const m = n % 5;
    if (m !== 0) {
      for (let i = 1; i <= m; i++)
        dx[i] = da * dx[i];
      if (n < 5)
        return;
    }
    for (let i = m + 1; i <= n; i += 5) {
      dx[i] = da * dx[i];
      dx[i + 1] = da * dx[i + 1];
      dx[i + 2] = da * dx[i + 2];
      dx[i + 3] = da * dx[i + 3];
      dx[i + 4] = da * dx[i + 4];
    }
  }
  function idamax(n, dx, incx) {
    let xindex = 0;
    if (n <= 0)
      return xindex;
    xindex = 1;
    if (n <= 1 || incx <= 0)
      return xindex;
    if (incx !== 1) {
      let dmax2 = Math.abs(dx[1]);
      let ii = 2;
      for (let i = 1 + incx; i <= n * incx; i += incx) {
        const xmag = Math.abs(dx[i]);
        if (xmag > dmax2) {
          xindex = ii;
          dmax2 = xmag;
        }
        ii++;
      }
      return xindex;
    }
    let dmax = Math.abs(dx[1]);
    for (let i = 2; i <= n; i++) {
      const xmag = Math.abs(dx[i]);
      if (xmag > dmax) {
        xindex = i;
        dmax = xmag;
      }
    }
    return xindex;
  }
  function dgefa(a, n, ipvt) {
    let info = 0;
    for (let k = 1; k <= n - 1; k++) {
      const j = idamax(n - k + 1, a[k].subarray(k - 1), 1) + k - 1;
      ipvt[k] = j;
      if (a[k][j] === 0) {
        info = k;
        continue;
      }
      if (j !== k) {
        const t2 = a[k][j];
        a[k][j] = a[k][k];
        a[k][k] = t2;
      }
      const t = -1 / a[k][k];
      dscal(n - k, t, a[k].subarray(k), 1);
      for (let i = k + 1; i <= n; i++) {
        const t2 = a[i][j];
        if (j !== k) {
          a[i][j] = a[i][k];
          a[i][k] = t2;
        }
        daxpy(n - k, t2, a[k].subarray(k), 1, a[i].subarray(k), 1);
      }
    }
    ipvt[n] = n;
    if (a[n][n] === 0)
      info = n;
    return info;
  }
  function dgesl(a, n, ipvt, b, job) {
    if (job === 0) {
      for (let k = 1; k <= n; k++) {
        const t = ddot(k - 1, a[k], 1, b, 1);
        b[k] = (b[k] - t) / a[k][k];
      }
      for (let k = n - 1; k >= 1; k--) {
        b[k] = b[k] + ddot(n - k, a[k].subarray(k), 1, b.subarray(k), 1);
        const j = ipvt[k];
        if (j !== k) {
          const t = b[j];
          b[j] = b[k];
          b[k] = t;
        }
      }
      return;
    }
    for (let k = 1; k <= n - 1; k++) {
      const j = ipvt[k];
      const t = b[j];
      if (j !== k) {
        b[j] = b[k];
        b[k] = t;
      }
      daxpy(n - k, t, a[k].subarray(k), 1, b.subarray(k), 1);
    }
    for (let k = n; k >= 1; k--) {
      b[k] = b[k] / a[k][k];
      const t = -b[k];
      daxpy(k - 1, t, a[k], 1, b, 1);
    }
  }
  function vmnorm(n, v, w) {
    let vm = 0;
    for (let i = 1; i <= n; i++)
      vm = Math.max(vm, Math.abs(v[i]) * w[i]);
    return vm;
  }
  function fnorm(n, a, w) {
    let an = 0;
    for (let i = 1; i <= n; i++) {
      let sum = 0;
      const ap1 = a[i];
      for (let j = 1; j <= n; j++)
        sum += Math.abs(ap1[j]) / w[j];
      an = Math.max(an, sum * w[i]);
    }
    return an;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/intdy.js
  function intdy(ctx, t, k, dky) {
    const c = ctx.common;
    const neq = ctx.neq;
    if (k < 0 || k > c.nq) {
      console.error(`[intdy] k = ${k} illegal`);
      return -1;
    }
    const tp = c.tn - c.hu - 100 * ETA * (c.tn + c.hu);
    if ((t - tp) * (t - c.tn) > 0) {
      console.error(`intdy -- t = ${t} illegal. t not in interval tcur - hu to tcur`);
      return -2;
    }
    const s = (t - c.tn) / c.h;
    let ic = 1;
    for (let jj = c.nq + 1 - k; jj <= c.nq; jj++)
      ic *= jj;
    let cc = ic;
    for (let i = 1; i <= neq; i++)
      dky[i] = cc * c.yh[c.nq + 1][i];
    for (let j = c.nq - 1; j >= k; j--) {
      const jp1 = j + 1;
      ic = 1;
      for (let jj = jp1 - k; jj <= j; jj++)
        ic *= jj;
      cc = ic;
      for (let i = 1; i <= neq; i++)
        dky[i] = cc * c.yh[jp1][i] + s * dky[i];
    }
    if (k === 0)
      return 0;
    const r = Math.pow(c.h, -k);
    for (let i = 1; i <= neq; i++)
      dky[i] *= r;
    return 0;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/cfode.js
  function cfode(ctx, meth) {
    const c = ctx.common;
    const pc = new Float64Array(13);
    if (meth === 1) {
      c.elco[1][1] = 1;
      c.elco[1][2] = 1;
      c.tesco[1][1] = 0;
      c.tesco[1][2] = 2;
      c.tesco[2][1] = 1;
      c.tesco[12][3] = 0;
      pc[1] = 1;
      let rqfac = 1;
      for (let nq = 2; nq <= 12; nq++) {
        const rq1fac2 = rqfac;
        rqfac = rqfac / nq;
        const nqm1 = nq - 1;
        const fnqm1 = nqm1;
        const nqp1 = nq + 1;
        pc[nq] = 0;
        for (let i = nq; i >= 2; i--)
          pc[i] = pc[i - 1] + fnqm1 * pc[i];
        pc[1] = fnqm1 * pc[1];
        let pint = pc[1];
        let xpin = pc[1] / 2;
        let tsign = 1;
        for (let i = 2; i <= nq; i++) {
          tsign = -tsign;
          pint += tsign * pc[i] / i;
          xpin += tsign * pc[i] / (i + 1);
        }
        c.elco[nq][1] = pint * rq1fac2;
        c.elco[nq][2] = 1;
        for (let i = 2; i <= nq; i++)
          c.elco[nq][i + 1] = rq1fac2 * pc[i] / i;
        const agamq = rqfac * xpin;
        const ragq = 1 / agamq;
        c.tesco[nq][2] = ragq;
        if (nq < 12)
          c.tesco[nqp1][1] = ragq * rqfac / nqp1;
        c.tesco[nqm1][3] = ragq;
      }
      return;
    }
    pc[1] = 1;
    let rq1fac = 1;
    for (let nq = 1; nq <= 5; nq++) {
      const fnq = nq;
      const nqp1 = nq + 1;
      pc[nqp1] = 0;
      for (let i = nq + 1; i >= 2; i--)
        pc[i] = pc[i - 1] + fnq * pc[i];
      pc[1] *= fnq;
      for (let i = 1; i <= nqp1; i++)
        c.elco[nq][i] = pc[i] / pc[2];
      c.elco[nq][2] = 1;
      c.tesco[nq][1] = rq1fac;
      c.tesco[nq][2] = nqp1 / c.elco[nq][1];
      c.tesco[nq][3] = (nq + 2) / c.elco[nq][1];
      rq1fac /= fnq;
    }
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/scaleh.js
  function scaleh(ctx, rh) {
    const c = ctx.common;
    const neq = ctx.neq;
    const hmxi = ctx.opt.hmxi;
    rh = Math.min(rh, c.rmax);
    rh = rh / Math.max(1, Math.abs(c.h) * hmxi * rh);
    if (c.meth === 1) {
      c.irflag = 0;
      const pdh = Math.max(Math.abs(c.h) * c.pdlast, 1e-6);
      if (rh * pdh * 1.00001 >= sm1[c.nq]) {
        rh = sm1[c.nq] / pdh;
        c.irflag = 1;
      }
    }
    let r = 1;
    for (let j = 2; j <= c.nq + 1; j++) {
      r *= rh;
      for (let i = 1; i <= neq; i++)
        c.yh[j][i] *= r;
    }
    c.h *= rh;
    c.rc *= rh;
    c.ialth = c.nq + 1;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/prja.js
  function prja(ctx, y) {
    const c = ctx.common;
    const neq = ctx.neq;
    c.nje++;
    const hl0 = c.h * c.el[1];
    if (c.miter !== 2) {
      console.error("[prja] miter != 2");
      return 0;
    }
    let fac = vmnorm(neq, c.savf, c.ewt);
    let r0 = 1e3 * Math.abs(c.h) * ETA * neq * fac;
    if (r0 === 0)
      r0 = 1;
    for (let j = 1; j <= neq; j++) {
      const yj = y[j];
      const r = Math.max(SQRTETA * Math.abs(yj), r0 / c.ewt[j]);
      y[j] += r;
      fac = -hl0 / r;
      ctx.func(c.tn, y.subarray(1), c.acor.subarray(1), ctx.data);
      for (let i = 1; i <= neq; i++)
        c.wm[i][j] = (c.acor[i] - c.savf[i]) * fac;
      y[j] = yj;
    }
    c.nfe += neq;
    c.pdnorm = fnorm(neq, c.wm, c.ewt) / Math.abs(hl0);
    for (let i = 1; i <= neq; i++)
      c.wm[i][i] += 1;
    const ier = dgefa(c.wm, neq, c.ipvt);
    if (ier !== 0)
      return 0;
    return 1;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/solsy.js
  function solsy(ctx, y) {
    const c = ctx.common;
    const neq = ctx.neq;
    if (c.miter !== 2)
      throw new Error("[solsy] miter != 2 not implemented");
    dgesl(c.wm, neq, c.ipvt, y, 0);
    return 1;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/corfailure.js
  function corfailure(ctx, told) {
    const c = ctx.common;
    const neq = ctx.neq;
    const hmin = ctx.opt.hmin;
    c.ncf++;
    c.rmax = 2;
    c.tn = told;
    for (let j = c.nq; j >= 1; j--) {
      for (let i1 = j; i1 <= c.nq; i1++) {
        for (let i = 1; i <= neq; i++)
          c.yh[i1][i] -= c.yh[i1 + 1][i];
      }
    }
    if (Math.abs(c.h) <= hmin * 1.00001 || c.ncf === MXNCF)
      return 2;
    c.ipup = c.miter;
    return 1;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/correction.js
  function correction(ctx, y, pnorm, cs, told) {
    const c = ctx.common;
    const neq = ctx.neq;
    cs.m = 0;
    let rate = 0;
    cs.del = 0;
    for (let i = 1; i <= neq; i++)
      y[i] = c.yh[1][i];
    ctx.func(c.tn, y.subarray(1), c.savf.subarray(1), ctx.data);
    c.nfe++;
    while (true) {
      if (cs.m === 0) {
        if (c.ipup > 0) {
          const ierpj = prja(ctx, y);
          c.jcur = 1;
          c.ipup = 0;
          c.rc = 1;
          c.nslp = c.nst;
          c.crate = 0.7;
          if (!ierpj)
            return corfailure(ctx, told);
        }
        for (let i = 1; i <= neq; i++)
          c.acor[i] = 0;
      }
      if (c.miter === 0) {
        for (let i = 1; i <= neq; i++) {
          c.savf[i] = c.h * c.savf[i] - c.yh[2][i];
          y[i] = c.savf[i] - c.acor[i];
        }
        cs.del = vmnorm(neq, y, c.ewt);
        for (let i = 1; i <= neq; i++) {
          y[i] = c.yh[1][i] + c.el[1] * c.savf[i];
          c.acor[i] = c.savf[i];
        }
      } else {
        for (let i = 1; i <= neq; i++)
          y[i] = c.h * c.savf[i] - (c.yh[2][i] + c.acor[i]);
        solsy(ctx, y);
        cs.del = vmnorm(neq, y, c.ewt);
        for (let i = 1; i <= neq; i++) {
          c.acor[i] += y[i];
          y[i] = c.yh[1][i] + c.el[1] * c.acor[i];
        }
      }
      if (cs.del <= 100 * pnorm * ETA)
        break;
      if (cs.m !== 0 || c.meth !== 1) {
        if (cs.m !== 0) {
          let rm = 1024;
          if (cs.del <= 1024 * cs.delp)
            rm = cs.del / cs.delp;
          rate = Math.max(rate, rm);
          c.crate = Math.max(0.2 * c.crate, rm);
        }
        const conit = 0.5 / (c.nq + 2);
        const dcon = cs.del * Math.min(1, 1.5 * c.crate) / (c.tesco[c.nq][2] * conit);
        if (dcon <= 1) {
          c.pdest = Math.max(c.pdest, rate / Math.abs(c.h * c.el[1]));
          if (c.pdest !== 0)
            c.pdlast = c.pdest;
          break;
        }
      }
      cs.m++;
      if (cs.m === MAXCOR || cs.m >= 2 && cs.del > 2 * cs.delp) {
        if (c.miter === 0 || c.jcur === 1)
          return corfailure(ctx, told);
        c.ipup = c.miter;
        cs.m = 0;
        rate = 0;
        cs.del = 0;
        for (let i = 1; i <= neq; i++)
          y[i] = c.yh[1][i];
        ctx.func(c.tn, y.subarray(1), c.savf.subarray(1), ctx.data);
        c.nfe++;
      } else {
        cs.delp = cs.del;
        ctx.func(c.tn, y.subarray(1), c.savf.subarray(1), ctx.data);
        c.nfe++;
      }
    }
    return 0;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/orderswitch.js
  function orderswitch(ctx, rhup, dsm, out, kflag, maxord) {
    const c = ctx.common;
    const neq = ctx.neq;
    const exsm = 1 / (c.nq + 1);
    let rhsm = 1 / (1.2 * Math.pow(dsm, exsm) + 12e-7);
    let rhdn = 0;
    if (c.nq !== 1) {
      const ddn = vmnorm(neq, c.yh[c.nq + 1], c.ewt) / c.tesco[c.nq][1];
      const exdn = 1 / c.nq;
      rhdn = 1 / (1.3 * Math.pow(ddn, exdn) + 13e-7);
    }
    if (c.meth === 1) {
      const pdh = Math.max(Math.abs(c.h) * c.pdlast, 1e-6);
      if (c.nq + 1 < maxord + 1)
        rhup = Math.min(rhup, sm1[c.nq + 1] / pdh);
      rhsm = Math.min(rhsm, sm1[c.nq] / pdh);
      if (c.nq > 1)
        rhdn = Math.min(rhdn, sm1[c.nq - 1] / pdh);
      c.pdest = 0;
    }
    let newq;
    if (rhsm >= rhup) {
      if (rhsm >= rhdn) {
        newq = c.nq;
        out.rh = rhsm;
      } else {
        newq = c.nq - 1;
        out.rh = rhdn;
        if (kflag < 0 && out.rh > 1)
          out.rh = 1;
      }
    } else {
      if (rhup <= rhdn) {
        newq = c.nq - 1;
        out.rh = rhdn;
        if (kflag < 0 && out.rh > 1)
          out.rh = 1;
      } else {
        out.rh = rhup;
        if (out.rh >= 1.1) {
          const r = c.el[c.nq + 1] / (c.nq + 1);
          c.nq = c.nq + 1;
          for (let i = 1; i <= neq; i++)
            c.yh[c.nq + 1][i] = c.acor[i] * r;
          return 2;
        } else {
          c.ialth = 3;
          return 0;
        }
      }
    }
    if (c.meth === 1) {
      const pdh = Math.max(Math.abs(c.h) * c.pdlast, 1e-6);
      if (out.rh * pdh * 1.00001 < sm1[newq]) {
        if (kflag === 0 && out.rh < 1.1) {
          c.ialth = 3;
          return 0;
        }
      }
    } else {
      if (kflag === 0 && out.rh < 1.1) {
        c.ialth = 3;
        return 0;
      }
    }
    if (kflag <= -2)
      out.rh = Math.min(out.rh, 0.2);
    if (newq === c.nq)
      return 1;
    c.nq = newq;
    return 2;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/methodswitch.js
  function methodswitch(ctx, dsm, pnorm, out) {
    const c = ctx.common;
    const neq = ctx.neq;
    const mxordn = ctx.opt.mxordn;
    const mxords = ctx.opt.mxords;
    if (c.meth === 1) {
      if (c.nq > 5)
        return;
      let rh22;
      let nqm2;
      if (dsm <= 100 * pnorm * ETA || c.pdest === 0) {
        if (c.irflag === 0)
          return;
        rh22 = 2;
        nqm2 = Math.min(c.nq, mxords);
      } else {
        const exsm2 = 1 / (c.nq + 1);
        let rh12 = 1 / (1.2 * Math.pow(dsm, exsm2) + 12e-7);
        let rh1it2 = 2 * rh12;
        const pdh2 = c.pdlast * Math.abs(c.h);
        if (pdh2 * rh12 > 1e-5)
          rh1it2 = sm1[c.nq] / pdh2;
        rh12 = Math.min(rh12, rh1it2);
        if (c.nq > mxords) {
          nqm2 = mxords;
          const lm2 = mxords + 1;
          const exm2 = 1 / lm2;
          const lm2p1 = lm2 + 1;
          const dm2 = vmnorm(neq, c.yh[lm2p1], c.ewt) / cm2[mxords];
          rh22 = 1 / (1.2 * Math.pow(dm2, exm2) + 12e-7);
        } else {
          const dm2 = dsm * (cm1[c.nq] / cm2[c.nq]);
          rh22 = 1 / (1.2 * Math.pow(dm2, exsm2) + 12e-7);
          nqm2 = c.nq;
        }
        if (rh22 < RATIO * rh12)
          return;
      }
      out.rh = rh22;
      c.icount = 20;
      c.meth = 2;
      c.miter = 2;
      c.pdlast = 0;
      c.nq = nqm2;
      return;
    }
    const exsm = 1 / (c.nq + 1);
    let nqm1;
    let exm1;
    let rh1;
    let dm1;
    if (mxordn < c.nq) {
      nqm1 = mxordn;
      const lm1 = mxordn + 1;
      exm1 = 1 / lm1;
      const lm1p1 = lm1 + 1;
      dm1 = vmnorm(neq, c.yh[lm1p1], c.ewt) / cm1[mxordn];
      rh1 = 1 / (1.2 * Math.pow(dm1, exm1) + 12e-7);
    } else {
      dm1 = dsm * (cm2[c.nq] / cm1[c.nq]);
      rh1 = 1 / (1.2 * Math.pow(dm1, exsm) + 12e-7);
      nqm1 = c.nq;
      exm1 = exsm;
    }
    let rh1it = 2 * rh1;
    const pdh = c.pdnorm * Math.abs(c.h);
    if (pdh * rh1 > 1e-5)
      rh1it = sm1[nqm1] / pdh;
    rh1 = Math.min(rh1, rh1it);
    const rh2 = 1 / (1.2 * Math.pow(dsm, exsm) + 12e-7);
    if (rh1 * RATIO < 5 * rh2)
      return;
    const alpha = Math.max(1e-3, rh1);
    dm1 *= Math.pow(alpha, exm1);
    if (dm1 <= 1e3 * ETA * pnorm)
      return;
    out.rh = rh1;
    c.icount = 20;
    c.meth = 1;
    c.miter = 0;
    c.pdlast = 0;
    c.nq = nqm1;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/stoda.js
  function stoda(ctx, y, jstart) {
    const c = ctx.common;
    const hmin = ctx.opt.hmin;
    const mxords = ctx.opt.mxords;
    const mxordn = ctx.opt.mxordn;
    const neq = ctx.neq;
    let kflag = 0;
    const told = c.tn;
    c.ncf = 0;
    let delp = 0;
    let maxord = mxordn;
    if (c.meth === 2)
      maxord = mxords;
    function endstoda() {
      const r = 1 / c.tesco[c.nqu][2];
      for (let i = 1; i <= neq; i++)
        c.acor[i] *= r;
      c.hold = c.h;
    }
    function resetcoeff() {
      const el0 = c.el[1];
      for (let i = 1; i <= c.nq + 1; i++)
        c.el[i] = c.elco[c.nq][i];
      c.rc = c.rc * c.el[1] / el0;
    }
    if (jstart === 0) {
      c.nq = 1;
      c.ialth = 2;
      c.rmax = 1e4;
      c.rc = 0;
      c.crate = 0.7;
      c.hold = c.h;
      c.nslp = 0;
      c.ipup = c.miter;
      c.el[1] = 1;
      c.icount = 20;
      c.irflag = 0;
      c.pdest = 0;
      c.pdlast = 0;
      cfode(ctx, 1);
      resetcoeff();
    }
    if (jstart === -1) {
      c.ipup = c.miter;
      if (c.ialth === 1)
        c.ialth = 2;
      if (c.meth !== c.mused) {
        cfode(ctx, c.meth);
        c.ialth = c.nq + 1;
        resetcoeff();
      }
      if (c.h !== c.hold) {
        const rh2 = c.h / c.hold;
        c.h = c.hold;
        scaleh(ctx, rh2);
      }
    }
    if (jstart === -2) {
      if (c.h !== c.hold) {
        const rh2 = c.h / c.hold;
        c.h = c.hold;
        scaleh(ctx, rh2);
      }
    }
    let dsm = 0;
    const cs = { del: 0, delp, m: 0 };
    const osResult = { rh: 0 };
    const msResult = { rh: 0 };
    let rh;
    outer: while (true) {
      c.jcur = 0;
      inner: while (true) {
        if (Math.abs(c.rc - 1) > CCMAX)
          c.ipup = c.miter;
        if (c.nst >= c.nslp + MSBP)
          c.ipup = c.miter;
        c.tn += c.h;
        for (let j = c.nq; j >= 1; j--) {
          for (let i1 = j; i1 <= c.nq; i1++) {
            for (let i = 1; i <= neq; i++)
              c.yh[i1][i] += c.yh[i1 + 1][i];
          }
        }
        const pnorm = vmnorm(neq, c.yh[1], c.ewt);
        cs.del = 0;
        cs.delp = delp;
        cs.m = 0;
        const corflag = correction(ctx, y, pnorm, cs, told);
        delp = cs.delp;
        if (corflag === 0)
          break inner;
        if (corflag === 1) {
          rh = Math.max(0.25, hmin / Math.abs(c.h));
          scaleh(ctx, rh);
          continue inner;
        }
        if (corflag === 2) {
          kflag = -2;
          c.hold = c.h;
          jstart = 1;
          return kflag;
        }
      }
      if (cs.m === 0)
        dsm = cs.del / c.tesco[c.nq][2];
      if (cs.m > 0)
        dsm = vmnorm(neq, c.acor, c.ewt) / c.tesco[c.nq][2];
      if (dsm <= 1) {
        kflag = 0;
        c.nst++;
        c.hu = c.h;
        c.nqu = c.nq;
        c.mused = c.meth;
        for (let j = 1; j <= c.nq + 1; j++) {
          const r = c.el[j];
          for (let i = 1; i <= neq; i++)
            c.yh[j][i] += r * c.acor[i];
        }
        c.icount--;
        if (c.icount < 0) {
          msResult.rh = 0;
          methodswitch(ctx, dsm, vmnorm(neq, c.yh[1], c.ewt), msResult);
          if (c.meth !== c.mused) {
            rh = Math.max(msResult.rh, hmin / Math.abs(c.h));
            scaleh(ctx, rh);
            c.rmax = 10;
            endstoda();
            break outer;
          }
        }
        c.ialth--;
        if (c.ialth === 0) {
          let rhup = 0;
          if (c.nq + 1 !== maxord + 1) {
            for (let i = 1; i <= neq; i++)
              c.savf[i] = c.acor[i] - c.yh[maxord + 1][i];
            const dup = vmnorm(neq, c.savf, c.ewt) / c.tesco[c.nq][3];
            const exup = 1 / (c.nq + 2);
            rhup = 1 / (1.4 * Math.pow(dup, exup) + 14e-7);
          }
          osResult.rh = 0;
          const orderflag = orderswitch(ctx, rhup, dsm, osResult, kflag, maxord);
          if (orderflag === 0) {
            endstoda();
            break outer;
          }
          if (orderflag === 1) {
            rh = Math.max(osResult.rh, hmin / Math.abs(c.h));
            scaleh(ctx, rh);
            c.rmax = 10;
            endstoda();
            break outer;
          }
          if (orderflag === 2) {
            resetcoeff();
            rh = Math.max(osResult.rh, hmin / Math.abs(c.h));
            scaleh(ctx, rh);
            c.rmax = 10;
            endstoda();
            break outer;
          }
        }
        if (c.ialth > 1 || c.nq + 1 === maxord + 1) {
          endstoda();
          break outer;
        }
        for (let i = 1; i <= neq; i++)
          c.yh[maxord + 1][i] = c.acor[i];
        endstoda();
        break outer;
      } else {
        kflag--;
        c.tn = told;
        for (let j = c.nq; j >= 1; j--) {
          for (let i1 = j; i1 <= c.nq; i1++) {
            for (let i = 1; i <= neq; i++)
              c.yh[i1][i] -= c.yh[i1 + 1][i];
          }
        }
        c.rmax = 2;
        if (Math.abs(c.h) <= hmin * 1.00001) {
          kflag = -1;
          c.hold = c.h;
          jstart = 1;
          break outer;
        }
        if (kflag > -3) {
          osResult.rh = 0;
          const orderflag = orderswitch(ctx, 0, dsm, osResult, kflag, maxord);
          if (orderflag === 1 || orderflag === 0) {
            if (orderflag === 0)
              osResult.rh = Math.min(osResult.rh, 0.2);
            osResult.rh = Math.max(osResult.rh, hmin / Math.abs(c.h));
            scaleh(ctx, osResult.rh);
          }
          if (orderflag === 2) {
            resetcoeff();
            osResult.rh = Math.max(osResult.rh, hmin / Math.abs(c.h));
            scaleh(ctx, osResult.rh);
          }
          continue outer;
        } else {
          if (kflag === -10) {
            kflag = -1;
            c.hold = c.h;
            jstart = 1;
            break outer;
          } else {
            rh = 0.1;
            rh = Math.max(hmin / Math.abs(c.h), rh);
            c.h *= rh;
            for (let i = 1; i <= neq; i++)
              y[i] = c.yh[1][i];
            ctx.func(c.tn, y.subarray(1), c.savf.subarray(1), ctx.data);
            c.nfe++;
            for (let i = 1; i <= neq; i++)
              c.yh[2][i] = c.h * c.savf[i];
            c.ipup = c.miter;
            c.ialth = 5;
            if (c.nq === 1)
              continue outer;
            c.nq = 1;
            resetcoeff();
            continue outer;
          }
        }
      }
    }
    return kflag;
  }

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/dense.js
  var DenseOutput = class {
    snaps;
    neq;
    constructor(snapshots, neq) {
      if (snapshots.length === 0)
        throw new Error("[DenseOutput] no snapshots collected");
      this.snaps = snapshots;
      this.neq = neq;
    }
    /** Leftmost reachable time. */
    get tMin() {
      const s = this.snaps[0];
      return s.tn - s.hu;
    }
    /** Rightmost reachable time. */
    get tMax() {
      return this.snaps[this.snaps.length - 1].tn;
    }
    /**
     * Evaluate the solution at a single time point.
     * Uses Horner's method on the Nordsieck array of the enclosing step.
     */
    evaluateAt(t) {
      const snap = this.findSnap(t);
      return this.horner(snap, t, new Float64Array(this.neq));
    }
    /**
     * Evaluate the solution at each point in a sorted ascending array.
     * Uses a linear scan over snapshots for efficiency.
     */
    solveAtTimes(tArray) {
      if (tArray.length === 0)
        return [];
      const snaps = this.snaps;
      const tFirst = tArray[0];
      const tLast = tArray[tArray.length - 1];
      if (tFirst < this.tMin - 1e-14 * Math.abs(this.tMin))
        throw new Error(`[DenseOutput] t=${tFirst} is before tMin=${this.tMin}`);
      if (tLast > this.tMax + 1e-14 * Math.abs(this.tMax))
        throw new Error(`[DenseOutput] t=${tLast} is after tMax=${this.tMax}`);
      const dky = new Float64Array(this.neq);
      const result = [];
      for (let i = 0; i < this.neq; ++i)
        result.push(new Float64Array(tArray.length));
      let si = 0;
      for (let qi = 0; qi < tArray.length; qi++) {
        const t = tArray[qi];
        while (si < snaps.length - 1 && t > snaps[si].tn + 1e-14 * Math.abs(snaps[si].tn))
          si++;
        this.horner(snaps[si], t, dky);
        for (let i = 0; i < this.neq; ++i)
          result[i][qi] = dky[i];
      }
      return result;
    }
    /**
     * Evaluate the solution on a uniform grid from tStart to tEnd with given step.
     */
    solveOnGrid(tStart, tEnd, step) {
      if (step <= 0)
        throw new Error("[DenseOutput] step must be positive");
      const n = Math.floor((tEnd - tStart) / step) + 1;
      const tArr = new Float64Array(n);
      for (let i = 0; i < n - 1; i++)
        tArr[i] = tStart + i * step;
      tArr[n - 1] = tEnd;
      const t = tArr;
      const y = this.solveAtTimes(t);
      return { t, y };
    }
    /** Find the snapshot whose interval contains t via binary search. */
    findSnap(t) {
      const snaps = this.snaps;
      if (t <= snaps[0].tn)
        return snaps[0];
      if (t >= snaps[snaps.length - 1].tn)
        return snaps[snaps.length - 1];
      let lo = 0;
      let hi = snaps.length - 1;
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        if (snaps[mid].tn < t)
          lo = mid + 1;
        else
          hi = mid;
      }
      return snaps[lo];
    }
    /** Horner evaluation of the Nordsieck polynomial at time t. */
    horner(snap, t, dky) {
      const { nq, h, yh } = snap;
      const neq = this.neq;
      const s = (t - snap.tn) / h;
      for (let i = 0; i < neq; i++) {
        let val = yh[nq][i];
        for (let j = nq - 1; j >= 0; j--)
          val = yh[j][i] + s * val;
        dky[i] = val;
      }
      return dky;
    }
  };

  // node_modules/diff-grok/dist/src/solver-tools/lsoda/lsoda.js
  function captureSnapshot(c, neq) {
    const nq = c.nq;
    const yh = new Array(nq + 1);
    for (let j = 0; j <= nq; j++) {
      const row = new Float64Array(neq);
      for (let i = 0; i < neq; i++)
        row[i] = c.yh[j + 1][i + 1];
      yh[j] = row;
    }
    return { tn: c.tn, h: c.h, hu: c.hu, nq, yh };
  }
  function ewset(ctx, ycur) {
    const c = ctx.common;
    const neq = ctx.neq;
    const rtol = ctx.opt.rtol;
    const atol = ctx.opt.atol;
    for (let i = 1; i <= neq; i++)
      c.ewt[i] = rtol[i] * Math.abs(ycur[i]) + atol[i];
    for (let i = 1; i <= neq; i++)
      c.ewt[i] = 1 / c.ewt[i];
  }
  function checkOpt(ctx, opt) {
    const mxstp0 = 500;
    const mord = [0, 12, 5];
    if (ctx.state === 0)
      ctx.state = 1;
    if (ctx.state === 1) {
      opt.h0 = 0;
      opt.mxordn = mord[1];
      opt.mxords = mord[2];
    }
    if (ctx.neq <= 0) {
      ctx.error = `[lsoda] neq = ${ctx.neq} is less than 1`;
      return false;
    }
    if (ctx.state === 1 || ctx.state === 3) {
      for (let i = 1; i <= ctx.neq; i++) {
        if (opt.rtol[i] < 0) {
          ctx.error = `[lsoda] rtol = ${opt.rtol[i]} is less than 0.`;
          return false;
        }
        if (opt.atol[i] < 0) {
          ctx.error = `[lsoda] atol = ${opt.atol[i]} is less than 0.`;
          return false;
        }
      }
    }
    if (opt.itask === 0)
      opt.itask = 1;
    if (opt.itask < 1 || opt.itask > 5) {
      ctx.error = `[lsoda] illegal itask = ${opt.itask}`;
      return false;
    }
    if (opt.ixpr < 0 || opt.ixpr > 1) {
      ctx.error = `[lsoda] ixpr = ${opt.ixpr} is illegal`;
      return false;
    }
    if (opt.mxstep < 0) {
      ctx.error = "[lsoda] mxstep < 0";
      return false;
    }
    if (opt.mxstep === 0)
      opt.mxstep = mxstp0;
    if (opt.mxhnil < 0) {
      ctx.error = "[lsoda] mxhnil < 0";
      return false;
    }
    if (ctx.state === 1) {
      if (opt.mxordn < 0) {
        ctx.error = `[lsoda] mxordn = ${opt.mxordn} is less than 0`;
        return false;
      }
      if (opt.mxordn === 0)
        opt.mxordn = 100;
      opt.mxordn = Math.min(opt.mxordn, mord[1]);
      if (opt.mxords < 0) {
        ctx.error = `[lsoda] mxords = ${opt.mxords} is less than 0`;
        return false;
      }
      if (opt.mxords === 0)
        opt.mxords = 100;
      opt.mxords = Math.min(opt.mxords, mord[2]);
    }
    if (opt.hmax < 0) {
      ctx.error = "[lsoda] hmax < 0.";
      return false;
    }
    opt.hmxi = 0;
    if (opt.hmax > 0)
      opt.hmxi = 1 / opt.hmax;
    if (opt.hmin < 0) {
      ctx.error = "[lsoda] hmin < 0.";
      return false;
    }
    return true;
  }
  function allocMem(ctx) {
    const c = ctx.common;
    const nyh = ctx.neq;
    const lenyh = 1 + Math.max(ctx.opt.mxordn, ctx.opt.mxords);
    c.yh = new Array(lenyh + 1);
    for (let i = 0; i <= lenyh; i++)
      c.yh[i] = new Float64Array(nyh + 1);
    c.wm = new Array(nyh + 1);
    for (let i = 0; i <= nyh; i++)
      c.wm[i] = new Float64Array(nyh + 1);
    c.ewt = new Float64Array(nyh + 1);
    c.savf = new Float64Array(nyh + 1);
    c.acor = new Float64Array(nyh + 1);
    c.ipvt = new Int32Array(nyh + 1);
    c.elco = new Array(13);
    for (let i = 0; i < 13; i++)
      c.elco[i] = new Float64Array(14);
    c.tesco = new Array(13);
    for (let i = 0; i < 13; i++)
      c.tesco[i] = new Float64Array(4);
    return true;
  }
  function lsodaPrepare(ctx, opt) {
    ctx.common = new LsodaCommon();
    ctx.opt = opt;
    if (!checkOpt(ctx, opt))
      return false;
    return allocMem(ctx);
  }
  function lsodaReset(ctx) {
    const c = ctx.common;
    c.h = 0;
    c.hu = 0;
    c.rc = 0;
    c.tn = 0;
    c.tsw = 0;
    c.pdnorm = 0;
    c.crate = 0;
    c.hold = 0;
    c.rmax = 0;
    c.pdest = 0;
    c.pdlast = 0;
    c.ialth = 0;
    c.ipup = 0;
    c.nslp = 0;
    c.icount = 0;
    c.irflag = 0;
    c.imxer = 0;
    c.illin = 0;
    c.nhnil = 0;
    c.nslast = 0;
    c.jcur = 0;
    c.meth = 0;
    c.mused = 0;
    c.nq = 0;
    c.nst = 0;
    c.ncf = 0;
    c.nfe = 0;
    c.nje = 0;
    c.nqu = 0;
    c.miter = 0;
    c.el.fill(0);
    for (let i = 0; i < c.yh.length; i++)
      c.yh[i].fill(0);
    for (let i = 0; i < c.wm.length; i++)
      c.wm[i].fill(0);
    c.ewt.fill(0);
    c.savf.fill(0);
    c.acor.fill(0);
    c.ipvt.fill(0);
    for (let i = 0; i < c.elco.length; i++)
      c.elco[i].fill(0);
    for (let i = 0; i < c.tesco.length; i++)
      c.tesco[i].fill(0);
    ctx.state = 1;
    ctx.error = null;
  }
  function lsoda(ctx, y, tIn, tout) {
    const c = ctx.common;
    const opt = ctx.opt;
    const neq = ctx.neq;
    let t = tIn;
    let kflag;
    let jstart = 0;
    let ihit = 0;
    function hardfailure(msg) {
      ctx.error = msg;
      ctx.state = -3;
      return { t, state: ctx.state };
    }
    function softfailure(code, msg) {
      ctx.error = msg;
      for (let i = 1; i <= neq; i++)
        y[i] = c.yh[1][i];
      t = c.tn;
      ctx.state = code;
      return { t, state: ctx.state };
    }
    function successreturn() {
      for (let i = 1; i <= neq; i++)
        y[i] = c.yh[1][i];
      t = c.tn;
      if (itask === 4 || itask === 5) {
        if (ihit)
          t = tcrit;
      }
      ctx.state = 2;
      return { t, state: ctx.state };
    }
    function intdyreturn() {
      const iflag = intdy(ctx, tout, 0, y);
      if (iflag !== 0) {
        ctx.error = `[lsoda] trouble from intdy, itask = ${itask}, tout = ${tout}`;
        for (let i = 1; i <= neq; i++)
          y[i] = c.yh[1][i];
        t = c.tn;
      }
      t = tout;
      ctx.state = 2;
      return { t, state: ctx.state };
    }
    if (c === null)
      return hardfailure("[lsoda] illegal common block did you call lsoda_prepare?");
    let h0 = 0;
    let tcrit = 0;
    const rtol = opt.rtol;
    const atol = opt.atol;
    if (ctx.state === 1 || ctx.state === 3) {
      h0 = opt.h0;
      if (ctx.state === 1) {
        if ((tout - t) * h0 < 0)
          return hardfailure(`[lsoda] tout = ${tout} behind t = ${t}. integration direction is given by ${h0}`);
      }
    }
    const itask = opt.itask;
    if (ctx.state === 3)
      jstart = -1;
    if (ctx.state === 1) {
      c.meth = 1;
      c.tn = t;
      c.tsw = t;
      if (itask === 4 || itask === 5) {
        tcrit = opt.tcrit;
        if ((tcrit - tout) * (tout - t) < 0)
          return hardfailure("[lsoda] itask = 4 or 5 and tcrit behind tout");
        if (h0 !== 0 && (t + h0 - tcrit) * h0 > 0)
          h0 = tcrit - t;
      }
      jstart = 0;
      c.nq = 1;
      ctx.func(t, y.subarray(1), c.yh[2].subarray(1), ctx.data);
      c.nfe = 1;
      for (let i = 1; i <= neq; i++)
        c.yh[1][i] = y[i];
      ewset(ctx, y);
      for (let i = 1; i <= neq; i++) {
        if (c.ewt[i] <= 0)
          return hardfailure(`[lsoda] ewt[${i}] = ${c.ewt[i]} <= 0.`);
      }
      if (h0 === 0) {
        const tdist = Math.abs(tout - t);
        const w0 = Math.max(Math.abs(t), Math.abs(tout));
        if (tdist < 2 * ETA * w0)
          return hardfailure("[lsoda] tout too close to t to start integration");
        let tol = 0;
        for (let i = 1; i <= neq; i++)
          tol = Math.max(tol, rtol[i]);
        if (tol <= 0) {
          for (let i = 1; i <= neq; i++) {
            const atoli = atol[i];
            const ayi = Math.abs(y[i]);
            if (ayi !== 0)
              tol = Math.max(tol, atoli / ayi);
          }
        }
        tol = Math.max(tol, 100 * ETA);
        tol = Math.min(tol, 1e-3);
        const sum = vmnorm(neq, c.yh[2], c.ewt);
        const sumSq = 1 / (tol * w0 * w0) + tol * sum * sum;
        h0 = 1 / Math.sqrt(sumSq);
        h0 = Math.min(h0, tdist);
        h0 = h0 * (tout - t >= 0 ? 1 : -1);
      }
      const rh = Math.abs(h0) * opt.hmxi;
      if (rh > 1)
        h0 /= rh;
      c.h = h0;
      for (let i = 1; i <= neq; i++)
        c.yh[2][i] *= h0;
    }
    if (ctx.state === 2 || ctx.state === 3) {
      jstart = 1;
      c.nslast = c.nst;
      switch (itask) {
        case 1:
          if ((c.tn - tout) * c.h >= 0)
            return intdyreturn();
          break;
        case 2:
          break;
        case 3: {
          const tp = c.tn - c.hu * (1 + 100 * ETA);
          if ((tp - tout) * c.h > 0)
            return hardfailure(`[lsoda] itask = ${itask} and tout behind tcur - hu`);
          if ((c.tn - tout) * c.h < 0)
            break;
          return successreturn();
        }
        case 4:
          tcrit = opt.tcrit;
          if ((c.tn - tcrit) * c.h > 0)
            return hardfailure("[lsoda] itask = 4 or 5 and tcrit behind tcur");
          if ((tcrit - tout) * c.h < 0)
            return hardfailure("[lsoda] itask = 4 or 5 and tcrit behind tout");
          if ((c.tn - tout) * c.h >= 0)
            return intdyreturn();
        // fall through to case 5 logic
        // eslint-disable-next-line no-fallthrough
        case 5:
          if (itask === 5) {
            tcrit = opt.tcrit;
            if ((c.tn - tcrit) * c.h > 0)
              return hardfailure("[lsoda] itask = 4 or 5 and tcrit behind tcur");
          }
          {
            const hmx = Math.abs(c.tn) + Math.abs(c.h);
            ihit = Math.abs(c.tn - tcrit) <= 100 * ETA * hmx ? 1 : 0;
            if (ihit) {
              t = tcrit;
              return successreturn();
            }
            const tnext = c.tn + c.h * (1 + 4 * ETA);
            if ((tnext - tcrit) * c.h <= 0)
              break;
            c.h = (tcrit - c.tn) * (1 - 4 * ETA);
            if (ctx.state === 2)
              jstart = -2;
          }
          break;
      }
    }
    while (true) {
      if (ctx.state !== 1 || c.nst !== 0) {
        if (c.nst - c.nslast >= opt.mxstep)
          return softfailure(-1, `[lsoda] ${opt.mxstep} steps taken before reaching tout`);
        ewset(ctx, c.yh[1]);
        for (let i = 1; i <= neq; i++) {
          if (c.ewt[i] <= 0)
            return softfailure(-6, `[lsoda] ewt[${i}] = ${c.ewt[i]} <= 0.`);
        }
      }
      const tolsf = ETA * vmnorm(neq, c.yh[1], c.ewt);
      if (tolsf > 0.01) {
        const scaled = tolsf * 200;
        if (c.nst === 0) {
          return hardfailure(`lsoda -- at start of problem, too much accuracy requested for precision of machine, suggested scaling factor = ${scaled}`);
        }
        return softfailure(-2, `lsoda -- at t = ${t}, too much accuracy requested for precision of machine, suggested scaling factor = ${scaled}`);
      }
      if (c.tn + c.h === c.tn) {
        c.nhnil++;
        if (c.nhnil <= opt.mxhnil) {
          console.error(`lsoda -- warning..internal t = ${c.tn} and h = ${c.h} are such that t + h = t on the next step`);
          if (c.nhnil === opt.mxhnil) {
            console.error(`lsoda -- above warning has been issued ${c.nhnil} times, it will not be issued again for this problem`);
          }
        }
      }
      kflag = stoda(ctx, y, jstart);
      if (kflag === 0) {
        if (ctx.snapshots)
          ctx.snapshots.push(captureSnapshot(c, neq));
        jstart = 1;
        if (c.meth !== c.mused) {
          c.tsw = c.tn;
          jstart = -1;
          if (opt.ixpr) {
            if (c.meth === 2) {
              console.error(`[lsoda] a switch to the stiff method has occurred at t = ${c.tn}, tentative step size h = ${c.h}, step nst = ${c.nst}`);
            }
            if (c.meth === 1) {
              console.error(`[lsoda] a switch to the nonstiff method has occurred at t = ${c.tn}, tentative step size h = ${c.h}, step nst = ${c.nst}`);
            }
          }
        }
        if (itask === 1) {
          if ((c.tn - tout) * c.h < 0)
            continue;
          return intdyreturn();
        }
        if (itask === 2)
          return successreturn();
        if (itask === 3) {
          if ((c.tn - tout) * c.h >= 0)
            return successreturn();
          continue;
        }
        if (itask === 4) {
          tcrit = opt.tcrit;
          if ((c.tn - tout) * c.h >= 0)
            return intdyreturn();
          else {
            const hmx = Math.abs(c.tn) + Math.abs(c.h);
            ihit = Math.abs(c.tn - tcrit) <= 100 * ETA * hmx ? 1 : 0;
            if (ihit)
              return successreturn();
            const tnext = c.tn + c.h * (1 + 4 * ETA);
            if ((tnext - tcrit) * c.h <= 0)
              continue;
            c.h = (tcrit - c.tn) * (1 - 4 * ETA);
            jstart = -2;
            continue;
          }
        }
        if (itask === 5) {
          tcrit = opt.tcrit;
          const hmx = Math.abs(c.tn) + Math.abs(c.h);
          ihit = Math.abs(c.tn - tcrit) <= 100 * ETA * hmx ? 1 : 0;
          return successreturn();
        }
      }
      if (kflag === -1 || kflag === -2) {
        let big = 0;
        c.imxer = 1;
        for (let i = 1; i <= neq; i++) {
          const size = Math.abs(c.acor[i]) * c.ewt[i];
          if (big < size) {
            big = size;
            c.imxer = i;
          }
        }
        if (kflag === -1) {
          return softfailure(-4, `lsoda -- at t = ${c.tn} and step size h = ${c.h}, the error test failed repeatedly or with abs(h) = hmin`);
        }
        if (kflag === -2) {
          return softfailure(-5, `lsoda -- at t = ${c.tn} and step size h = ${c.h}, the corrector convergence failed repeatedly or with abs(h) = hmin`);
        }
      }
    }
  }
  var Lsoda = class {
    ctx;
    internalY;
    denseEnabled = false;
    constructor(f, neq, opt, data) {
      const wrappedFunc = (t, y, ydot, data2) => {
        return f(t, y, ydot, data2);
      };
      this.ctx = new LsodaContext(wrappedFunc, neq, data);
      this.internalY = new Float64Array(neq + 1);
      const fullOpt = {
        ixpr: 0,
        mxstep: 0,
        mxhnil: 0,
        mxordn: 0,
        mxords: 0,
        tcrit: 0,
        h0: 0,
        hmax: 0,
        hmin: 0,
        hmxi: 0,
        itask: 1,
        rtol: new Float64Array(neq + 1),
        atol: new Float64Array(neq + 1),
        ...opt
      };
      if (opt?.rtol) {
        if (opt.rtol.length === neq) {
          const r = new Float64Array(neq + 1);
          for (let i = 0; i < neq; i++)
            r[i + 1] = opt.rtol[i];
          fullOpt.rtol = r;
        } else
          fullOpt.rtol = opt.rtol;
      }
      if (opt?.atol) {
        if (opt.atol.length === neq) {
          const a = new Float64Array(neq + 1);
          for (let i = 0; i < neq; i++)
            a[i + 1] = opt.atol[i];
          fullOpt.atol = a;
        } else
          fullOpt.atol = opt.atol;
      }
      lsodaPrepare(this.ctx, fullOpt);
      if (opt?.dense) {
        this.denseEnabled = true;
        this.ctx.snapshots = [];
      }
    }
    /**
     * Integrate from current t to tout.
     * y: 0-based array of state values.
     * Returns updated { y, t }.
     */
    solve(y, t, tout) {
      const neq = this.ctx.neq;
      for (let i = 0; i < neq; i++)
        this.internalY[i + 1] = y[i];
      const result = lsoda(this.ctx, this.internalY, t, tout);
      const out = new Float64Array(neq);
      for (let i = 0; i < neq; i++)
        out[i] = this.internalY[i + 1];
      return { y: out, t: result.t };
    }
    get state() {
      return this.ctx.state;
    }
    get error() {
      return this.ctx.error;
    }
    /** Returns a DenseOutput interpolator from collected snapshots. */
    getDenseOutput() {
      if (!this.ctx.snapshots || this.ctx.snapshots.length === 0)
        throw new Error("[Lsoda] dense output not enabled or no steps taken \u2014 pass { dense: true } in options");
      return new DenseOutput(this.ctx.snapshots, this.ctx.neq);
    }
    reset() {
      lsodaReset(this.ctx);
      if (this.denseEnabled)
        this.ctx.snapshots = [];
    }
  };

  // node_modules/diff-grok/dist/src/solver-tools/lsoda-method.js
  function wrapFunc(f) {
    return (t, y, ydot) => {
      f(t, y, ydot);
      return 0;
    };
  }
  function lsoda2(odes, callback) {
    const t0 = odes.arg.start;
    const t1 = odes.arg.finish;
    const step = odes.arg.step;
    const tolerance = odes.tolerance;
    const dim = odes.initial.length;
    const mxstep = 5e4;
    const rtol = new Float64Array(dim).fill(tolerance);
    const atol = new Float64Array(dim).fill(tolerance);
    const solver = new Lsoda(wrapFunc(odes.func), dim, {
      rtol,
      atol,
      itask: 1,
      dense: true,
      mxstep
    });
    let y = [...odes.initial];
    let t = t0;
    const base = Math.min(step, 1);
    let warmupOk = false;
    for (let k = 5; k <= 10; k++) {
      const warmupTout = t0 + base * Math.pow(10, -k);
      if (warmupTout <= t0 || warmupTout >= t1)
        continue;
      const wr = solver.solve(y, t, warmupTout);
      if (solver.state > 0) {
        y = wr.y;
        t = wr.t;
        warmupOk = true;
        break;
      }
      solver.reset();
      y = [...odes.initial];
      t = t0;
    }
    if (!warmupOk && t === t0)
      throw new Error(ERROR_MSG.LSODA_FAILS);
    const gridPoints = Math.trunc((t1 - t0) / step) + 1;
    const numCheckpoints = Math.min(gridPoints, 1e3);
    const cpStep = (t1 - t0) / numCheckpoints;
    for (let i = 1; i <= numCheckpoints; i++) {
      if (callback)
        callback.onIterationStart();
      const tout = i < numCheckpoints ? t0 + i * cpStep : t1;
      const result = solver.solve(y, t, tout);
      y = result.y;
      t = result.t;
      if (solver.state <= 0)
        throw new Error(ERROR_MSG.LSODA_FAILS);
    }
    const dense = solver.getDenseOutput();
    const grid = dense.solveOnGrid(t0, t1, step);
    if (callback)
      callback.onComputationsCompleted();
    const rowCount = grid.t.length;
    const solution = Array(dim + 1);
    solution[0] = grid.t;
    for (let i = 0; i < dim; ++i)
      solution[i + 1] = grid.y[i];
    for (let i = 0; i < dim; ++i)
      solution[i + 1][rowCount - 1] = y[i];
    return solution;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/common.js
  var ADAMS_Q_MAX = 12;
  var BDF_Q_MAX = 5;
  var L_MAX = 13;
  var NUM_TESTS = 5;
  var CV_ADAMS = 1;
  var CV_BDF = 2;
  var CV_NORMAL = 1;
  var CV_ONE_STEP = 2;
  var CV_SUCCESS = 0;
  var CV_TSTOP_RETURN = 1;
  var CV_ROOT_RETURN = 2;
  var CV_TOO_MUCH_WORK = -1;
  var CV_TOO_MUCH_ACC = -2;
  var CV_ERR_FAILURE = -3;
  var CV_CONV_FAILURE = -4;
  var CV_RHSFUNC_FAIL = -8;
  var CV_FIRST_RHSFUNC_ERR = -9;
  var CV_RTFUNC_FAIL = -12;
  var CV_TOO_CLOSE = -27;
  var HMIN_DEFAULT = 0;
  var HMAX_INV_DEFAULT = 0;
  var MXHNIL_DEFAULT = 10;
  var MXSTEP_DEFAULT = 500;
  var MSBP_DEFAULT = 20;
  var DGMAX_LSETUP_DEFAULT = 0.3;
  var ETA_MIN_FX_DEFAULT = 0;
  var ETA_MAX_FX_DEFAULT = 1.5;
  var ETA_MAX_FS_DEFAULT = 1e4;
  var ETA_MAX_ES_DEFAULT = 10;
  var ETA_MAX_GS_DEFAULT = 10;
  var ETA_MIN_DEFAULT = 0.1;
  var ETA_MAX_EF_DEFAULT = 0.2;
  var ETA_MIN_EF_DEFAULT = 0.1;
  var ETA_CF_DEFAULT = 0.25;
  var SMALL_NST_DEFAULT = 10;
  var SMALL_NEF_DEFAULT = 2;
  var ONEPSM = 1.000001;
  var ADDON = 1e-6;
  var BIAS1 = 6;
  var BIAS2 = 6;
  var BIAS3 = 10;
  var LONG_WAIT = 10;
  var MXNCF2 = 10;
  var MXNEF = 7;
  var MXNEF1 = 3;
  var DO_ERROR_TEST = 2;
  var PREDICT_AGAIN = 3;
  var TRY_AGAIN = 5;
  var FIRST_CALL = 6;
  var PREV_CONV_FAIL = 7;
  var PREV_ERR_FAIL = 9;
  var RHSFUNC_RECVR = 10;
  var CV_NN = 0;
  var CV_SS = 1;
  var CV_SV = 2;
  var CV_NO_FAILURES = 0;
  var CV_FAIL_BAD_J = 1;
  var CV_FAIL_OTHER = 2;
  var FUZZ_FACTOR = 100;
  var HLB_FACTOR = 100;
  var HUB_FACTOR = 0.1;
  var H_BIAS = 0.5;
  var MAX_ITERS = 4;
  var CORTES = 0.1;
  var TINY2 = 1e-10;
  var NLS_MAXCOR = 3;
  var CRDOWN = 0.3;
  var RDIV = 2;
  var SUN_NLS_CONTINUE = 901;
  var SUN_NLS_CONV_RECVR = 902;
  var CV_LSETUP_FAIL = -13;
  var CV_LSOLVE_FAIL = -14;
  var CV_UNREC_RHSFUNC_ERR = -10;
  var CV_REPTD_RHSFUNC_ERR = -11;
  var CV_LINIT_FAIL = -31;
  var CV_NLS_FAIL = -33;
  var UROUND = 2220446049250313e-31;
  var RTFOUND = 1;
  var CLOSERT = 3;
  var CVLS_MSBJ = 51;
  var CVLS_DGMAX = 0.2;
  var CvLsMem = class {
    /** N x N Jacobian matrix (row-major) */
    A = [];
    /** LU pivot indices */
    pivots = new Int32Array(0);
    /** Saved copy of Jacobian */
    savedJ = [];
    /** User-supplied Jacobian function */
    jacFn = null;
    /** Use difference-quotient Jacobian by default */
    jacDQ = true;
    /** Number of Jacobian evaluations */
    nje = 0;
    /** Number of f evaluations for DQ Jacobian */
    nfeDQ = 0;
    /** nst at last Jacobian evaluation */
    nstlj = 0;
    /** t at last Jacobian evaluation */
    tnlj = 0;
    /** Max steps between Jacobian evaluations (CVLS_MSBJ) */
    msbj = CVLS_MSBJ;
    /** Gamma change threshold (CVLS_DGMAX) */
    dgmax_jbad = CVLS_DGMAX;
    /** Is Jacobian stale? */
    jbad = true;
  };
  var CvodeMem = class {
    // --- Problem specification ---
    /** RHS function: y' = f(t, y) */
    cv_f = null;
    /** User data passed to f, jac, root functions */
    cv_user_data = null;
    /** Linear multistep method: CV_ADAMS or CV_BDF */
    cv_lmm = 0;
    /** Tolerance type: CV_NN, CV_SS, or CV_SV */
    cv_itol = CV_NN;
    // --- Tolerances ---
    /** Relative tolerance */
    cv_reltol = 0;
    /** Scalar absolute tolerance */
    cv_Sabstol = 0;
    /** Vector absolute tolerance */
    cv_Vabstol = new Float64Array(0);
    /** Flag: is min(atol) == 0? */
    cv_atolmin0 = false;
    // --- Nordsieck history array ---
    /** Nordsieck array: cv_zn[j][i], j=0..q, i=0..N-1 */
    cv_zn = [];
    // --- Work vectors ---
    /** Error weight vector */
    cv_ewt = new Float64Array(0);
    /** Solution vector (scratch for user output) */
    cv_y = new Float64Array(0);
    /** Accumulated correction */
    cv_acor = new Float64Array(0);
    /** Temporary vector */
    cv_tempv = new Float64Array(0);
    /** Temporary for f evaluations */
    cv_ftemp = new Float64Array(0);
    /** Temporary vector 1 */
    cv_vtemp1 = new Float64Array(0);
    /** Temporary vector 2 */
    cv_vtemp2 = new Float64Array(0);
    /** Temporary vector 3 */
    cv_vtemp3 = new Float64Array(0);
    // --- Tstop ---
    /** Is tstop set? */
    cv_tstopset = false;
    /** Interpolate at tstop? */
    cv_tstopinterp = false;
    /** Stop time */
    cv_tstop = 0;
    // --- Step data ---
    /** Current method order */
    cv_q = 0;
    /** Order for next step */
    cv_qprime = 0;
    /** Next order to be used (during step) */
    cv_next_q = 0;
    /** Steps remaining before order change allowed */
    cv_qwait = 0;
    /** L = q + 1 */
    cv_L = 0;
    /** Initial step size (user-supplied) */
    cv_hin = 0;
    /** Current step size */
    cv_h = 0;
    /** Step size for next step */
    cv_hprime = 0;
    /** Next h (during step) */
    cv_next_h = 0;
    /** Step size ratio: hprime / h */
    cv_eta = 0;
    /** Step size at last Nordsieck rescale */
    cv_hscale = 0;
    /** Current internal time */
    cv_tn = 0;
    /** Last return time */
    cv_tretlast = 0;
    /** Step size history: tau[i], i=0..L_MAX */
    cv_tau = new Float64Array(L_MAX + 1);
    /** Error test quantities: tq[i], i=0..NUM_TESTS */
    cv_tq = new Float64Array(NUM_TESTS + 1);
    /** Polynomial coefficients: l[i], i=0..L_MAX-1 */
    cv_l = new Float64Array(L_MAX);
    /** 1 / l[1] */
    cv_rl1 = 0;
    /** gamma = h * rl1 */
    cv_gamma = 0;
    /** gamma at last setup */
    cv_gammap = 0;
    /** gamma / gammap */
    cv_gamrat = 0;
    /** NLS convergence rate estimate */
    cv_crate = 0;
    /** Previous del value (NLS) */
    cv_delp = 0;
    /** WRMS norm of accumulated correction */
    cv_acnrm = 0;
    /** Current acnrm (during step) */
    cv_acnrmcur = false;
    /** NLS convergence coefficient */
    cv_nlscoef = 0;
    // --- Limits ---
    /** Max method order */
    cv_qmax = 0;
    /** Max internal steps per call */
    cv_mxstep = MXSTEP_DEFAULT;
    /** Max t+h==t warnings */
    cv_mxhnil = MXHNIL_DEFAULT;
    /** Max error test failures per step */
    cv_maxnef = MXNEF;
    /** Max convergence failures per step */
    cv_maxncf = MXNCF2;
    /** Min step size */
    cv_hmin = HMIN_DEFAULT;
    /** 1/hmax (inverse of max step size) */
    cv_hmax_inv = HMAX_INV_DEFAULT;
    /** Max eta for step size increase */
    cv_etamax = 0;
    /** Min fixed eta threshold */
    cv_eta_min_fx = ETA_MIN_FX_DEFAULT;
    /** Max fixed eta threshold */
    cv_eta_max_fx = ETA_MAX_FX_DEFAULT;
    /** Max eta on first step */
    cv_eta_max_fs = ETA_MAX_FS_DEFAULT;
    /** Max eta on early steps */
    cv_eta_max_es = ETA_MAX_ES_DEFAULT;
    /** Max eta on general steps */
    cv_eta_max_gs = ETA_MAX_GS_DEFAULT;
    /** Min eta */
    cv_eta_min = ETA_MIN_DEFAULT;
    /** Min eta on error failure */
    cv_eta_min_ef = ETA_MIN_EF_DEFAULT;
    /** Max eta on error failure */
    cv_eta_max_ef = ETA_MAX_EF_DEFAULT;
    /** Eta on convergence failure */
    cv_eta_cf = ETA_CF_DEFAULT;
    /** Small step count threshold */
    cv_small_nst = SMALL_NST_DEFAULT;
    /** Small error failure threshold */
    cv_small_nef = SMALL_NEF_DEFAULT;
    // --- Counters ---
    /** Total internal steps taken */
    cv_nst = 0;
    /** Total RHS evaluations */
    cv_nfe = 0;
    /** Convergence failures */
    cv_ncfn = 0;
    /** Nonlinear iterations */
    cv_nni = 0;
    /** Nonlinear iteration failures */
    cv_nnf = 0;
    /** Error test failures */
    cv_netf = 0;
    /** Linear solver setups */
    cv_nsetups = 0;
    /** t+h==t warnings */
    cv_nhnil = 0;
    // --- Step size ratios for order selection ---
    /** Eta for order q-1 */
    cv_etaqm1 = 0;
    /** Eta for order q */
    cv_etaq = 0;
    /** Eta for order q+1 */
    cv_etaqp1 = 0;
    // --- Linear solver interface ---
    /** Linear solver init function */
    cv_linit = null;
    /** Linear solver setup function */
    cv_lsetup = null;
    /** Linear solver solve function */
    cv_lsolve = null;
    /** Linear solver free function */
    cv_lfree = null;
    /** Linear solver memory */
    cv_lmem = null;
    /** Max steps between Jacobian setups */
    cv_msbp = MSBP_DEFAULT;
    /** Gamma change threshold for Jacobian redo */
    cv_dgmax_lsetup = DGMAX_LSETUP_DEFAULT;
    // --- Saved values ---
    /** Order used on last successful step */
    cv_qu = 0;
    /** nst at last Jacobian setup */
    cv_nstlp = 0;
    /** Initial step size actually used */
    cv_h0u = 0;
    /** Step size used on last successful step */
    cv_hu = 0;
    /** Saved tq[5] for order selection */
    cv_saved_tq5 = 0;
    /** Is Jacobian current? */
    cv_jcur = false;
    /** Tolerance scale factor */
    cv_tolsf = 0;
    /** Max order allocated in Nordsieck array */
    cv_qmax_alloc = 0;
    /** Index of acor in zn array */
    cv_indx_acor = 0;
    // --- Initialization flags ---
    /** Has CvodeMem been allocated/initialized? */
    cv_MallocDone = false;
    /** Has vector abstol been allocated? */
    cv_VabstolMallocDone = false;
    // --- BDF stability limit detection ---
    /** Enable stability limit detection? */
    cv_sldeton = false;
    /** Stability data: ssdat[6][4] (6 rows, 4 cols) */
    cv_ssdat = [];
    /** Steps since stability check */
    cv_nscon = 0;
    /** Order flag for stability */
    cv_nor = 0;
    // --- Rootfinding ---
    /** Root function */
    cv_gfun = null;
    /** Number of root functions */
    cv_nrtfn = 0;
    /** Root direction info (which roots were found) */
    cv_iroots = new Int32Array(0);
    /** Root direction constraints */
    cv_rootdir = new Int32Array(0);
    /** t at low end of bracket */
    cv_tlo = 0;
    /** t at high end of bracket */
    cv_thi = 0;
    /** t at root */
    cv_trout = 0;
    /** g values at low end */
    cv_glo = new Float64Array(0);
    /** g values at high end */
    cv_ghi = new Float64Array(0);
    /** g values at root */
    cv_grout = new Float64Array(0);
    /** Output time saved for root check */
    cv_toutc = 0;
    /** Root time tolerance */
    cv_ttol = 0;
    /** Task flag for root check */
    cv_taskc = 0;
    /** Root found on previous step? */
    cv_irfnd = 0;
    /** Number of g evaluations */
    cv_nge = 0;
    /** Active root functions flags */
    cv_gactive = new Uint8Array(0);
    /** Max steps with g inactive before declaring permanently inactive */
    cv_mxgnull = 1;
    // --- NLS ---
    /** Convergence failure type (CV_NO_FAILURES, CV_FAIL_BAD_J, CV_FAIL_OTHER) */
    convfail = CV_NO_FAILURES;
    // --- Error ---
    /** Error message string */
    cv_error = "";
    // --- Problem size ---
    /** Number of equations */
    cv_N = 0;
    // --- Resize flag ---
    /** First step after problem resize */
    first_step_after_resize = false;
  };
  function wrmsNorm(n, v, w) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const vw = v[i] * w[i];
      sum += vw * vw;
    }
    return Math.sqrt(sum / n);
  }
  function vLinearSum(a, x, b, y, z, n) {
    for (let i = 0; i < n; i++)
      z[i] = a * x[i] + b * y[i];
  }
  function vScale(c, x, z, n) {
    for (let i = 0; i < n; i++)
      z[i] = c * x[i];
  }
  function vConst(c, z, n) {
    z.fill(c, 0, n);
  }
  function cvodeGetDky(mem, t, k, dky) {
    if (k < 0 || k > mem.cv_q)
      return -1;
    const N = mem.cv_N;
    const tfuzz = FUZZ_FACTOR * UROUND * (Math.abs(mem.cv_tn) + Math.abs(mem.cv_hu));
    const tp = mem.cv_tn - mem.cv_hu - Math.abs(tfuzz);
    const tn1 = mem.cv_tn + Math.abs(tfuzz);
    if ((t - tp) * (t - tn1) > 0)
      return -1;
    const s = (t - mem.cv_tn) / mem.cv_h;
    dky.fill(0, 0, N);
    for (let j = mem.cv_q; j >= k; j--) {
      let c = 1;
      for (let i = j; i >= j - k + 1; i--)
        c *= i;
      for (let i = 0; i < j - k; i++)
        c *= s;
      const znj = mem.cv_zn[j];
      for (let i = 0; i < N; i++)
        dky[i] += c * znj[i];
    }
    if (k > 0) {
      const r = Math.pow(mem.cv_h, -k);
      for (let i = 0; i < N; i++)
        dky[i] *= r;
    }
    return 0;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_bdf.js
  function cvSetBDF(mem) {
    let alpha0;
    let alpha0_hat;
    let xi_inv;
    let xistar_inv;
    let hsum;
    mem.cv_l[0] = 1;
    mem.cv_l[1] = 1;
    xi_inv = 1;
    xistar_inv = 1;
    for (let i = 2; i <= mem.cv_q; i++)
      mem.cv_l[i] = 0;
    alpha0 = -1;
    alpha0_hat = -1;
    hsum = mem.cv_h;
    if (mem.cv_q > 1) {
      for (let j = 2; j < mem.cv_q; j++) {
        hsum += mem.cv_tau[j - 1];
        xi_inv = mem.cv_h / hsum;
        alpha0 -= 1 / j;
        for (let i = j; i >= 1; i--)
          mem.cv_l[i] += mem.cv_l[i - 1] * xi_inv;
      }
      alpha0 -= 1 / mem.cv_q;
      xistar_inv = -mem.cv_l[1] - alpha0;
      hsum += mem.cv_tau[mem.cv_q - 1];
      xi_inv = mem.cv_h / hsum;
      alpha0_hat = -mem.cv_l[1] - xi_inv;
      for (let i = mem.cv_q; i >= 1; i--)
        mem.cv_l[i] += mem.cv_l[i - 1] * xistar_inv;
    }
    cvSetTqBDF(mem, hsum, alpha0, alpha0_hat, xi_inv, xistar_inv);
  }
  function cvSetTqBDF(mem, hsum, alpha0, alpha0_hat, xi_inv, xistar_inv) {
    const A1 = 1 - alpha0_hat + alpha0;
    const A2 = 1 + mem.cv_q * A1;
    mem.cv_tq[2] = Math.abs(A1 / (alpha0 * A2));
    mem.cv_tq[5] = Math.abs(A2 * xistar_inv / (mem.cv_l[mem.cv_q] * xi_inv));
    if (mem.cv_qwait === 1) {
      if (mem.cv_q > 1) {
        const C = xistar_inv / mem.cv_l[mem.cv_q];
        const A3 = alpha0 + 1 / mem.cv_q;
        const A4 = alpha0_hat + xi_inv;
        const Cpinv = (1 - A4 + A3) / A3;
        mem.cv_tq[1] = Math.abs(C * Cpinv);
      } else
        mem.cv_tq[1] = 1;
      hsum += mem.cv_tau[mem.cv_q];
      const xi_inv2 = mem.cv_h / hsum;
      const A5 = alpha0 - 1 / (mem.cv_q + 1);
      const A6 = alpha0_hat - xi_inv2;
      const Cppinv = (1 - A6 + A5) / A2;
      mem.cv_tq[3] = Math.abs(Cppinv / (xi_inv2 * (mem.cv_q + 2) * A5));
    }
    mem.cv_tq[4] = mem.cv_nlscoef / mem.cv_tq[2];
  }
  function cvIncreaseBDF(mem) {
    const N = mem.cv_N;
    for (let i = 0; i <= mem.cv_qmax; i++)
      mem.cv_l[i] = 0;
    mem.cv_l[2] = 1;
    let alpha1 = 1;
    let prod = 1;
    let xiold = 1;
    let alpha0 = -1;
    let hsum = mem.cv_hscale;
    if (mem.cv_q > 1) {
      for (let j = 1; j < mem.cv_q; j++) {
        hsum += mem.cv_tau[j + 1];
        const xi = hsum / mem.cv_hscale;
        prod *= xi;
        alpha0 -= 1 / (j + 1);
        alpha1 += 1 / xi;
        for (let i = j + 2; i >= 2; i--)
          mem.cv_l[i] = mem.cv_l[i] * xiold + mem.cv_l[i - 1];
        xiold = xi;
      }
    }
    const A1 = (-alpha0 - alpha1) / prod;
    const znL = mem.cv_zn[mem.cv_L];
    const znSaved = mem.cv_zn[mem.cv_indx_acor];
    for (let i = 0; i < N; i++)
      znL[i] = A1 * znSaved[i];
    if (mem.cv_q > 1) {
      for (let j = 2; j <= mem.cv_q; j++) {
        const c = mem.cv_l[j];
        const znj = mem.cv_zn[j];
        for (let i = 0; i < N; i++)
          znj[i] += c * znL[i];
      }
    }
  }
  function cvDecreaseBDF(mem) {
    const N = mem.cv_N;
    for (let i = 0; i <= mem.cv_qmax; i++)
      mem.cv_l[i] = 0;
    mem.cv_l[2] = 1;
    let hsum = 0;
    for (let j = 1; j <= mem.cv_q - 2; j++) {
      hsum += mem.cv_tau[j];
      const xi = hsum / mem.cv_hscale;
      for (let i = j + 2; i >= 2; i--)
        mem.cv_l[i] = mem.cv_l[i] * xi + mem.cv_l[i - 1];
    }
    if (mem.cv_q > 2) {
      const znq = mem.cv_zn[mem.cv_q];
      for (let j = 2; j < mem.cv_q; j++) {
        const c = -mem.cv_l[j];
        const znj = mem.cv_zn[j];
        for (let i = 0; i < N; i++)
          znj[i] += c * znq[i];
      }
    }
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_adams.js
  function cvAltSum(iend, a, k) {
    if (iend < 0)
      return 0;
    let sum = 0;
    let sign2 = 1;
    for (let i = 0; i <= iend; i++) {
      sum += sign2 * (a[i] / (i + k));
      sign2 = -sign2;
    }
    return sum;
  }
  function cvAdamsStart(mem, m) {
    let hsum = mem.cv_h;
    m[0] = 1;
    for (let i = 1; i <= mem.cv_q; i++)
      m[i] = 0;
    for (let j = 1; j < mem.cv_q; j++) {
      if (j === mem.cv_q - 1 && mem.cv_qwait === 1) {
        const sum = cvAltSum(mem.cv_q - 2, m, 2);
        mem.cv_tq[1] = mem.cv_q * sum / m[mem.cv_q - 2];
      }
      const xi_inv = mem.cv_h / hsum;
      for (let i = j; i >= 1; i--)
        m[i] += m[i - 1] * xi_inv;
      hsum += mem.cv_tau[j];
    }
    return hsum;
  }
  function cvAdamsFinish(mem, m, M, hsum) {
    const M0_inv = 1 / M[0];
    mem.cv_l[0] = 1;
    for (let i = 1; i <= mem.cv_q; i++)
      mem.cv_l[i] = M0_inv * (m[i - 1] / i);
    const xi = hsum / mem.cv_h;
    const xi_inv = 1 / xi;
    mem.cv_tq[2] = M[1] * M0_inv / xi;
    mem.cv_tq[5] = xi / mem.cv_l[mem.cv_q];
    if (mem.cv_qwait === 1) {
      for (let i = mem.cv_q; i >= 1; i--)
        m[i] += m[i - 1] * xi_inv;
      M[2] = cvAltSum(mem.cv_q, m, 2);
      mem.cv_tq[3] = M[2] * M0_inv / mem.cv_L;
    }
    mem.cv_tq[4] = mem.cv_nlscoef / mem.cv_tq[2];
  }
  function cvSetAdams(mem) {
    const m = new Float64Array(L_MAX);
    const M = new Float64Array(3);
    if (mem.cv_q === 1) {
      mem.cv_l[0] = 1;
      mem.cv_l[1] = 1;
      mem.cv_tq[1] = 1;
      mem.cv_tq[5] = 1;
      mem.cv_tq[2] = 0.5;
      mem.cv_tq[3] = 1 / 12;
      mem.cv_tq[4] = mem.cv_nlscoef / mem.cv_tq[2];
      return;
    }
    const hsum = cvAdamsStart(mem, m);
    M[0] = cvAltSum(mem.cv_q - 1, m, 1);
    M[1] = cvAltSum(mem.cv_q - 1, m, 2);
    cvAdamsFinish(mem, m, M, hsum);
  }
  function cvAdjustAdams(mem, deltaq) {
    const N = mem.cv_N;
    if (deltaq === 1) {
      mem.cv_zn[mem.cv_L].fill(0, 0, N);
      return;
    }
    for (let i = 0; i <= mem.cv_qmax; i++)
      mem.cv_l[i] = 0;
    mem.cv_l[1] = 1;
    let hsum = 0;
    for (let j = 1; j <= mem.cv_q - 2; j++) {
      hsum += mem.cv_tau[j];
      const xi = hsum / mem.cv_hscale;
      for (let i = j + 1; i >= 1; i--)
        mem.cv_l[i] = mem.cv_l[i] * xi + mem.cv_l[i - 1];
    }
    for (let j = 1; j <= mem.cv_q - 2; j++)
      mem.cv_l[j + 1] = mem.cv_q * (mem.cv_l[j] / (j + 1));
    if (mem.cv_q > 2) {
      const znq = mem.cv_zn[mem.cv_q];
      for (let j = 2; j < mem.cv_q; j++) {
        const c = -mem.cv_l[j];
        const znj = mem.cv_zn[j];
        for (let i = 0; i < N; i++)
          znj[i] += c * znq[i];
      }
    }
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_hin.js
  function cvHin(mem, tout) {
    const N = mem.cv_N;
    const sign2 = tout - mem.cv_tn >= 0 ? 1 : -1;
    const tdist = Math.abs(tout - mem.cv_tn);
    const tround = Math.max(Math.abs(mem.cv_tn), Math.abs(tout)) * 2220446049250313e-31;
    if (tdist < 2 * tround)
      return CV_TOO_CLOSE;
    const hlb = HLB_FACTOR * tround;
    const hub = cvUpperBoundH0(mem, tdist);
    let hg = Math.sqrt(hlb * hub);
    if (hub < 100 * hlb)
      hg = 0.5 * hub;
    let hnew = hg;
    let retval;
    for (let count = 0; count < MAX_ITERS; count++) {
      hg = hnew;
      const result = cvYddNorm(mem, hg * sign2);
      retval = result.retval;
      if (retval !== CV_SUCCESS)
        return retval;
      const yddnrm = result.yddnrm;
      if (yddnrm * hub * hub > 2)
        hnew = Math.sqrt(2 / yddnrm);
      else
        hnew = Math.sqrt(hg * hub);
      hnew = H_BIAS * hnew + (1 - H_BIAS) * hg;
      if (hnew / hg > 2 || hnew / hg < 0.5)
        continue;
      break;
    }
    hnew = Math.min(hnew, hub);
    hnew = Math.max(hnew, hlb);
    if (mem.cv_hmax_inv > 0)
      hnew = Math.min(hnew, 1 / mem.cv_hmax_inv);
    if (mem.cv_hmin > 0)
      hnew = Math.max(hnew, mem.cv_hmin);
    hnew = Math.min(hnew, tdist);
    mem.cv_h = sign2 * hnew;
    mem.cv_next_h = mem.cv_h;
    mem.cv_hscale = mem.cv_h;
    vScale(mem.cv_h, mem.cv_zn[1], mem.cv_zn[1], N);
    return CV_SUCCESS;
  }
  function cvUpperBoundH0(mem, tdist) {
    const N = mem.cv_N;
    const hub_inv = wrmsNorm(N, mem.cv_zn[1], mem.cv_ewt);
    let hub = HUB_FACTOR * tdist;
    if (hub * hub_inv > 1)
      hub = 1 / hub_inv;
    return hub;
  }
  function cvYddNorm(mem, hg) {
    const N = mem.cv_N;
    vLinearSum(hg, mem.cv_zn[1], 1, mem.cv_zn[0], mem.cv_y, N);
    const retval = mem.cv_f(mem.cv_tn + hg, mem.cv_y, mem.cv_tempv, mem.cv_user_data);
    mem.cv_nfe++;
    if (retval < 0)
      return { retval: CV_RHSFUNC_FAIL, yddnrm: 0 };
    if (retval > 0)
      return { retval: RHSFUNC_RECVR, yddnrm: 0 };
    const hg_inv = 1 / hg;
    vLinearSum(hg_inv, mem.cv_tempv, -hg_inv, mem.cv_zn[1], mem.cv_tempv, N);
    const yddnrm = wrmsNorm(N, mem.cv_tempv, mem.cv_ewt);
    return { retval: CV_SUCCESS, yddnrm };
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_nls.js
  function cvNls(mem, nflag) {
    const N = mem.cv_N;
    let callSetup;
    if (mem.cv_lsetup) {
      mem.convfail = nflag === FIRST_CALL || nflag === PREV_ERR_FAIL ? CV_NO_FAILURES : CV_FAIL_OTHER;
      callSetup = nflag === PREV_CONV_FAIL || nflag === PREV_ERR_FAIL || mem.cv_nst === 0 || mem.first_step_after_resize || mem.cv_nst >= mem.cv_nstlp + mem.cv_msbp || Math.abs(mem.cv_gamrat - 1) > mem.cv_dgmax_lsetup;
    } else {
      mem.cv_crate = 1;
      callSetup = false;
    }
    vConst(0, mem.cv_acor, N);
    mem.cv_acnrmcur = false;
    let flag;
    if (mem.cv_lmm === CV_BDF)
      flag = cvNewtonIteration(mem, callSetup);
    else
      flag = cvFixedPointIteration(mem);
    if (flag !== CV_SUCCESS)
      return flag;
    vLinearSum(1, mem.cv_zn[0], 1, mem.cv_acor, mem.cv_y, N);
    if (!mem.cv_acnrmcur)
      mem.cv_acnrm = wrmsNorm(N, mem.cv_acor, mem.cv_ewt);
    mem.cv_jcur = false;
    return CV_SUCCESS;
  }
  function cvNewtonIteration(mem, callSetup) {
    const N = mem.cv_N;
    let retval;
    if (callSetup && mem.cv_lsetup) {
      vLinearSum(1, mem.cv_zn[0], 1, mem.cv_acor, mem.cv_y, N);
      retval = mem.cv_f(mem.cv_tn, mem.cv_y, mem.cv_ftemp, mem.cv_user_data);
      mem.cv_nfe++;
      if (retval < 0)
        return CV_RHSFUNC_FAIL;
      if (retval > 0)
        return RHSFUNC_RECVR;
      const jcurPtr = { value: false };
      retval = mem.cv_lsetup(mem, mem.convfail, mem.cv_y, mem.cv_ftemp, jcurPtr, mem.cv_vtemp1, mem.cv_vtemp2, mem.cv_vtemp3);
      mem.cv_nsetups++;
      mem.cv_jcur = jcurPtr.value;
      mem.cv_gamrat = 1;
      mem.cv_gammap = mem.cv_gamma;
      mem.cv_crate = 1;
      mem.cv_nstlp = mem.cv_nst;
      if (retval < 0)
        return CV_LSETUP_FAIL;
      if (retval > 0)
        return SUN_NLS_CONV_RECVR;
    }
    for (let m = 0; m < NLS_MAXCOR; m++) {
      mem.cv_nni++;
      vLinearSum(1, mem.cv_zn[0], 1, mem.cv_acor, mem.cv_y, N);
      retval = mem.cv_f(mem.cv_tn, mem.cv_y, mem.cv_ftemp, mem.cv_user_data);
      mem.cv_nfe++;
      if (retval < 0)
        return CV_RHSFUNC_FAIL;
      if (retval > 0)
        return RHSFUNC_RECVR;
      const b = mem.cv_tempv;
      for (let i = 0; i < N; i++)
        b[i] = mem.cv_rl1 * mem.cv_zn[1][i] + mem.cv_acor[i] - mem.cv_gamma * mem.cv_ftemp[i];
      for (let i = 0; i < N; i++)
        b[i] = -b[i];
      retval = mem.cv_lsolve(mem, b, mem.cv_ewt, mem.cv_y, mem.cv_ftemp);
      if (retval < 0)
        return CV_LSOLVE_FAIL;
      if (retval > 0)
        return SUN_NLS_CONV_RECVR;
      for (let i = 0; i < N; i++)
        mem.cv_acor[i] += b[i];
      const del = wrmsNorm(N, b, mem.cv_ewt);
      const convTestResult = cvNlsConvTest(mem, del, m, mem.cv_tq[4]);
      if (convTestResult === CV_SUCCESS)
        return CV_SUCCESS;
      if (convTestResult === SUN_NLS_CONV_RECVR) {
        mem.cv_nnf++;
        return SUN_NLS_CONV_RECVR;
      }
    }
    mem.cv_nnf++;
    return SUN_NLS_CONV_RECVR;
  }
  function cvFixedPointIteration(mem) {
    const N = mem.cv_N;
    let retval;
    for (let m = 0; m < NLS_MAXCOR; m++) {
      mem.cv_nni++;
      vLinearSum(1, mem.cv_zn[0], 1, mem.cv_acor, mem.cv_y, N);
      retval = mem.cv_f(mem.cv_tn, mem.cv_y, mem.cv_tempv, mem.cv_user_data);
      mem.cv_nfe++;
      if (retval < 0)
        return CV_RHSFUNC_FAIL;
      if (retval > 0)
        return RHSFUNC_RECVR;
      for (let i = 0; i < N; i++)
        mem.cv_tempv[i] = mem.cv_h * mem.cv_tempv[i] - mem.cv_zn[1][i];
      const newAcor = mem.cv_vtemp1;
      vScale(mem.cv_rl1, mem.cv_tempv, newAcor, N);
      const delta = mem.cv_tempv;
      for (let i = 0; i < N; i++)
        delta[i] = newAcor[i] - mem.cv_acor[i];
      for (let i = 0; i < N; i++)
        mem.cv_acor[i] = newAcor[i];
      const del = wrmsNorm(N, delta, mem.cv_ewt);
      const convTestResult = cvNlsConvTest(mem, del, m, mem.cv_tq[4]);
      if (convTestResult === CV_SUCCESS)
        return CV_SUCCESS;
      if (convTestResult === SUN_NLS_CONV_RECVR) {
        mem.cv_nnf++;
        return SUN_NLS_CONV_RECVR;
      }
    }
    mem.cv_nnf++;
    return SUN_NLS_CONV_RECVR;
  }
  function cvNlsConvTest(mem, del, m, tol) {
    if (m > 0)
      mem.cv_crate = Math.max(CRDOWN * mem.cv_crate, del / mem.cv_delp);
    const dcon = del * Math.min(1, mem.cv_crate) / tol;
    if (dcon <= 1) {
      if (m === 0)
        mem.cv_acnrm = del;
      else
        mem.cv_acnrm = wrmsNorm(mem.cv_N, mem.cv_acor, mem.cv_ewt);
      mem.cv_acnrmcur = true;
      return CV_SUCCESS;
    }
    if (m >= 1 && del > RDIV * mem.cv_delp)
      return SUN_NLS_CONV_RECVR;
    mem.cv_delp = del;
    return SUN_NLS_CONTINUE;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_root.js
  var ZERO = 0;
  var HALF = 0.5;
  var ONE = 1;
  var TWO = 2;
  var FIVE = 5;
  var HUNDRED = 100;
  var PT1 = 0.1;
  function cvodeRootInit(mem, nrtfn, g) {
    if (nrtfn <= 0) {
      mem.cv_nrtfn = 0;
      mem.cv_gfun = null;
      return CV_SUCCESS;
    }
    mem.cv_nrtfn = nrtfn;
    mem.cv_gfun = g;
    mem.cv_glo = new Float64Array(nrtfn);
    mem.cv_ghi = new Float64Array(nrtfn);
    mem.cv_grout = new Float64Array(nrtfn);
    mem.cv_iroots = new Int32Array(nrtfn);
    mem.cv_rootdir = new Int32Array(nrtfn);
    mem.cv_gactive = new Uint8Array(nrtfn);
    mem.cv_rootdir.fill(0);
    mem.cv_gactive.fill(1);
    return CV_SUCCESS;
  }
  function cvRcheck1(mem) {
    const nrtfn = mem.cv_nrtfn;
    const N = mem.cv_N;
    for (let i = 0; i < nrtfn; i++)
      mem.cv_iroots[i] = 0;
    mem.cv_tlo = mem.cv_tn;
    mem.cv_ttol = (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h)) * UROUND * HUNDRED;
    const retval = mem.cv_gfun(mem.cv_tlo, mem.cv_zn[0], mem.cv_glo, mem.cv_user_data);
    mem.cv_nge = 1;
    if (retval !== 0)
      return CV_RTFUNC_FAIL;
    let zroot = false;
    for (let i = 0; i < nrtfn; i++) {
      if (Math.abs(mem.cv_glo[i]) === ZERO) {
        zroot = true;
        mem.cv_gactive[i] = 0;
      }
    }
    if (!zroot)
      return CV_SUCCESS;
    const hratio = Math.max(mem.cv_ttol / Math.abs(mem.cv_h), PT1);
    const smallh = hratio * mem.cv_h;
    const tplus = mem.cv_tlo + smallh;
    vLinearSum(ONE, mem.cv_zn[0], hratio, mem.cv_zn[1], mem.cv_y, N);
    const retval2 = mem.cv_gfun(tplus, mem.cv_y, mem.cv_ghi, mem.cv_user_data);
    mem.cv_nge++;
    if (retval2 !== 0)
      return CV_RTFUNC_FAIL;
    for (let i = 0; i < nrtfn; i++) {
      if (mem.cv_gactive[i] === 0 && Math.abs(mem.cv_ghi[i]) !== ZERO) {
        mem.cv_gactive[i] = 1;
        mem.cv_glo[i] = mem.cv_ghi[i];
      }
    }
    return CV_SUCCESS;
  }
  function cvRcheck2(mem) {
    const nrtfn = mem.cv_nrtfn;
    const N = mem.cv_N;
    if (mem.cv_irfnd === 0)
      return CV_SUCCESS;
    cvodeGetDky(mem, mem.cv_tlo, 0, mem.cv_y);
    let retval = mem.cv_gfun(mem.cv_tlo, mem.cv_y, mem.cv_glo, mem.cv_user_data);
    mem.cv_nge++;
    if (retval !== 0)
      return CV_RTFUNC_FAIL;
    let zroot = false;
    for (let i = 0; i < nrtfn; i++)
      mem.cv_iroots[i] = 0;
    for (let i = 0; i < nrtfn; i++) {
      if (mem.cv_gactive[i] === 0)
        continue;
      if (Math.abs(mem.cv_glo[i]) === ZERO) {
        zroot = true;
        mem.cv_iroots[i] = 1;
      }
    }
    if (!zroot)
      return CV_SUCCESS;
    mem.cv_ttol = (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h)) * UROUND * HUNDRED;
    const smallh = mem.cv_h > ZERO ? mem.cv_ttol : -mem.cv_ttol;
    const tplus = mem.cv_tlo + smallh;
    if ((tplus - mem.cv_tn) * mem.cv_h >= ZERO) {
      const hratio = smallh / mem.cv_h;
      vLinearSum(ONE, mem.cv_y, hratio, mem.cv_zn[1], mem.cv_y, N);
    } else
      cvodeGetDky(mem, tplus, 0, mem.cv_y);
    retval = mem.cv_gfun(tplus, mem.cv_y, mem.cv_ghi, mem.cv_user_data);
    mem.cv_nge++;
    if (retval !== 0)
      return CV_RTFUNC_FAIL;
    zroot = false;
    for (let i = 0; i < nrtfn; i++) {
      if (mem.cv_gactive[i] === 0)
        continue;
      if (Math.abs(mem.cv_ghi[i]) === ZERO) {
        if (mem.cv_iroots[i] === 1)
          return CLOSERT;
        zroot = true;
        mem.cv_iroots[i] = 1;
      } else {
        if (mem.cv_iroots[i] === 1)
          mem.cv_glo[i] = mem.cv_ghi[i];
      }
    }
    if (zroot)
      return RTFOUND;
    return CV_SUCCESS;
  }
  function cvRcheck3(mem) {
    const nrtfn = mem.cv_nrtfn;
    const N = mem.cv_N;
    if (mem.cv_taskc === CV_ONE_STEP) {
      mem.cv_thi = mem.cv_tn;
      vScale(ONE, mem.cv_zn[0], mem.cv_y, N);
    }
    if (mem.cv_taskc === CV_NORMAL) {
      if ((mem.cv_toutc - mem.cv_tn) * mem.cv_h >= ZERO) {
        mem.cv_thi = mem.cv_tn;
        vScale(ONE, mem.cv_zn[0], mem.cv_y, N);
      } else {
        mem.cv_thi = mem.cv_toutc;
        cvodeGetDky(mem, mem.cv_thi, 0, mem.cv_y);
      }
    }
    const retval = mem.cv_gfun(mem.cv_thi, mem.cv_y, mem.cv_ghi, mem.cv_user_data);
    mem.cv_nge++;
    if (retval !== 0)
      return CV_RTFUNC_FAIL;
    mem.cv_ttol = (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h)) * UROUND * HUNDRED;
    const ier = cvRootfind(mem);
    if (ier === CV_RTFUNC_FAIL)
      return CV_RTFUNC_FAIL;
    for (let i = 0; i < nrtfn; i++) {
      if (mem.cv_gactive[i] === 0 && mem.cv_grout[i] !== ZERO)
        mem.cv_gactive[i] = 1;
    }
    mem.cv_tlo = mem.cv_trout;
    for (let i = 0; i < nrtfn; i++)
      mem.cv_glo[i] = mem.cv_grout[i];
    if (ier === CV_SUCCESS)
      return CV_SUCCESS;
    cvodeGetDky(mem, mem.cv_trout, 0, mem.cv_y);
    return RTFOUND;
  }
  function cvRootfind(mem) {
    const nrtfn = mem.cv_nrtfn;
    let imax = 0;
    let alph;
    let tmid;
    let gfrac;
    let maxfrac;
    let fracint;
    let fracsub;
    maxfrac = ZERO;
    let zroot = false;
    let sgnchg = false;
    for (let i = 0; i < nrtfn; i++) {
      if (mem.cv_gactive[i] === 0)
        continue;
      if (Math.abs(mem.cv_ghi[i]) === ZERO) {
        if (mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO)
          zroot = true;
      } else {
        if (mem.cv_glo[i] * mem.cv_ghi[i] < 0 && mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO) {
          gfrac = Math.abs(mem.cv_ghi[i] / (mem.cv_ghi[i] - mem.cv_glo[i]));
          if (gfrac > maxfrac) {
            sgnchg = true;
            maxfrac = gfrac;
            imax = i;
          }
        }
      }
    }
    if (!sgnchg) {
      mem.cv_trout = mem.cv_thi;
      for (let i = 0; i < nrtfn; i++)
        mem.cv_grout[i] = mem.cv_ghi[i];
      if (!zroot)
        return CV_SUCCESS;
      for (let i = 0; i < nrtfn; i++) {
        mem.cv_iroots[i] = 0;
        if (mem.cv_gactive[i] === 0)
          continue;
        if (Math.abs(mem.cv_ghi[i]) === ZERO && mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO)
          mem.cv_iroots[i] = mem.cv_glo[i] > 0 ? -1 : 1;
      }
      return RTFOUND;
    }
    alph = ONE;
    let side = 0;
    let sideprev = -1;
    for (; ; ) {
      if (Math.abs(mem.cv_thi - mem.cv_tlo) <= mem.cv_ttol)
        break;
      if (sideprev === side)
        alph = side === 2 ? alph * TWO : alph * HALF;
      else
        alph = ONE;
      tmid = mem.cv_thi - (mem.cv_thi - mem.cv_tlo) * mem.cv_ghi[imax] / (mem.cv_ghi[imax] - alph * mem.cv_glo[imax]);
      if (Math.abs(tmid - mem.cv_tlo) < HALF * mem.cv_ttol) {
        fracint = Math.abs(mem.cv_thi - mem.cv_tlo) / mem.cv_ttol;
        fracsub = fracint > FIVE ? PT1 : HALF / fracint;
        tmid = mem.cv_tlo + fracsub * (mem.cv_thi - mem.cv_tlo);
      }
      if (Math.abs(mem.cv_thi - tmid) < HALF * mem.cv_ttol) {
        fracint = Math.abs(mem.cv_thi - mem.cv_tlo) / mem.cv_ttol;
        fracsub = fracint > FIVE ? PT1 : HALF / fracint;
        tmid = mem.cv_thi - fracsub * (mem.cv_thi - mem.cv_tlo);
      }
      cvodeGetDky(mem, tmid, 0, mem.cv_y);
      const retval = mem.cv_gfun(tmid, mem.cv_y, mem.cv_grout, mem.cv_user_data);
      mem.cv_nge++;
      if (retval !== 0)
        return CV_RTFUNC_FAIL;
      maxfrac = ZERO;
      zroot = false;
      sgnchg = false;
      sideprev = side;
      for (let i = 0; i < nrtfn; i++) {
        if (mem.cv_gactive[i] === 0)
          continue;
        if (Math.abs(mem.cv_grout[i]) === ZERO) {
          if (mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO)
            zroot = true;
        } else {
          if (mem.cv_glo[i] * mem.cv_grout[i] < 0 && mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO) {
            gfrac = Math.abs(mem.cv_grout[i] / (mem.cv_grout[i] - mem.cv_glo[i]));
            if (gfrac > maxfrac) {
              sgnchg = true;
              maxfrac = gfrac;
              imax = i;
            }
          }
        }
      }
      if (sgnchg) {
        mem.cv_thi = tmid;
        for (let i = 0; i < nrtfn; i++)
          mem.cv_ghi[i] = mem.cv_grout[i];
        side = 1;
        if (Math.abs(mem.cv_thi - mem.cv_tlo) <= mem.cv_ttol)
          break;
        continue;
      }
      if (zroot) {
        mem.cv_thi = tmid;
        for (let i = 0; i < nrtfn; i++)
          mem.cv_ghi[i] = mem.cv_grout[i];
        break;
      }
      mem.cv_tlo = tmid;
      for (let i = 0; i < nrtfn; i++)
        mem.cv_glo[i] = mem.cv_grout[i];
      side = 2;
      if (Math.abs(mem.cv_thi - mem.cv_tlo) <= mem.cv_ttol)
        break;
    }
    mem.cv_trout = mem.cv_thi;
    for (let i = 0; i < nrtfn; i++) {
      mem.cv_grout[i] = mem.cv_ghi[i];
      mem.cv_iroots[i] = 0;
      if (mem.cv_gactive[i] === 0)
        continue;
      if (Math.abs(mem.cv_ghi[i]) === ZERO && mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO)
        mem.cv_iroots[i] = mem.cv_glo[i] > 0 ? -1 : 1;
      if (mem.cv_glo[i] * mem.cv_ghi[i] < 0 && mem.cv_rootdir[i] * mem.cv_glo[i] <= ZERO)
        mem.cv_iroots[i] = mem.cv_glo[i] > 0 ? -1 : 1;
    }
    return RTFOUND;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode.js
  function cvodeCreate(lmm) {
    if (lmm !== CV_ADAMS && lmm !== CV_BDF)
      throw new Error("cvodeCreate: bad lmm, must be CV_ADAMS or CV_BDF");
    const maxord = lmm === CV_ADAMS ? ADAMS_Q_MAX : BDF_Q_MAX;
    const mem = new CvodeMem();
    mem.cv_lmm = lmm;
    mem.cv_qmax = maxord;
    mem.cv_qmax_alloc = maxord;
    mem.cv_ssdat = [];
    for (let i = 0; i < 6; i++)
      mem.cv_ssdat[i] = [0, 0, 0, 0];
    mem.cv_nlscoef = CORTES;
    return mem;
  }
  function cvodeInit(mem, f, t0, y0) {
    mem.cv_f = f;
    mem.cv_tn = t0;
    mem.cv_N = y0.length;
    const N = mem.cv_N;
    const allocQ = mem.cv_qmax_alloc;
    mem.cv_zn = [];
    for (let i = 0; i <= allocQ + 1; i++)
      mem.cv_zn[i] = new Float64Array(N);
    mem.cv_ewt = new Float64Array(N);
    mem.cv_acor = new Float64Array(N);
    mem.cv_tempv = new Float64Array(N);
    mem.cv_ftemp = new Float64Array(N);
    mem.cv_vtemp1 = new Float64Array(N);
    mem.cv_vtemp2 = new Float64Array(N);
    mem.cv_vtemp3 = new Float64Array(N);
    mem.cv_y = new Float64Array(N);
    mem.cv_zn[0].set(y0);
    mem.cv_q = 1;
    mem.cv_L = 2;
    mem.cv_qwait = mem.cv_L;
    mem.cv_etamax = mem.cv_eta_max_fs;
    mem.cv_qu = 0;
    mem.cv_hu = 0;
    mem.cv_tolsf = 1;
    mem.cv_nst = 0;
    mem.cv_nfe = 0;
    mem.cv_ncfn = 0;
    mem.cv_netf = 0;
    mem.cv_nni = 0;
    mem.cv_nnf = 0;
    mem.cv_nsetups = 0;
    mem.cv_nhnil = 0;
    mem.cv_nstlp = 0;
    mem.cv_nscon = 0;
    mem.cv_nge = 0;
    mem.cv_irfnd = 0;
    mem.cv_h0u = 0;
    mem.cv_next_h = 0;
    mem.cv_next_q = 0;
    mem.cv_nor = 0;
    mem.cv_ssdat = [];
    for (let i = 0; i < 6; i++)
      mem.cv_ssdat[i] = [0, 0, 0, 0];
    mem.cv_indx_acor = mem.cv_qmax_alloc;
    mem.cv_MallocDone = true;
    return CV_SUCCESS;
  }
  function cvode(mem, tout, yout, itask) {
    let istate;
    let troundoff;
    let retval;
    let ier;
    let tret = mem.cv_tn;
    if (itask !== CV_NORMAL && itask !== CV_ONE_STEP)
      return { flag: -99, t: mem.cv_tn };
    if (itask === CV_NORMAL)
      mem.cv_toutc = tout;
    mem.cv_taskc = itask;
    if (mem.cv_nst === 0) {
      mem.cv_tretlast = tret = mem.cv_tn;
      ier = cvInitialSetup(mem);
      if (ier !== CV_SUCCESS)
        return { flag: ier, t: tret };
      retval = mem.cv_f(mem.cv_tn, mem.cv_zn[0], mem.cv_zn[1], mem.cv_user_data);
      mem.cv_nfe++;
      if (retval < 0)
        return { flag: CV_RHSFUNC_FAIL, t: tret };
      if (retval > 0)
        return { flag: CV_FIRST_RHSFUNC_ERR, t: tret };
      if (mem.cv_tstopset) {
        if ((mem.cv_tstop - mem.cv_tn) * (tout - mem.cv_tn) <= 0)
          return { flag: -99, t: tret };
      }
      mem.cv_h = mem.cv_hin;
      if (mem.cv_h !== 0 && (tout - mem.cv_tn) * mem.cv_h < 0)
        return { flag: -99, t: tret };
      if (mem.cv_h === 0) {
        let tout_hin = tout;
        if (mem.cv_tstopset && (tout - mem.cv_tn) * (tout - mem.cv_tstop) > 0)
          tout_hin = mem.cv_tstop;
        const hflag = cvHin(mem, tout_hin);
        if (hflag !== CV_SUCCESS) {
          istate = cvHandleFailure(mem, hflag);
          return { flag: istate, t: tret };
        }
      }
      const rh = Math.abs(mem.cv_h) * mem.cv_hmax_inv;
      if (rh > 1)
        mem.cv_h /= rh;
      if (Math.abs(mem.cv_h) < mem.cv_hmin)
        mem.cv_h *= mem.cv_hmin / Math.abs(mem.cv_h);
      if (mem.cv_tstopset) {
        if ((mem.cv_tn + mem.cv_h - mem.cv_tstop) * mem.cv_h > 0)
          mem.cv_h = (mem.cv_tstop - mem.cv_tn) * (1 - 4 * UROUND);
      }
      mem.cv_hscale = mem.cv_h;
      mem.cv_h0u = mem.cv_h;
      mem.cv_hprime = mem.cv_h;
      vScale(mem.cv_h, mem.cv_zn[1], mem.cv_zn[1], mem.cv_N);
      if (mem.cv_nrtfn > 0) {
        retval = cvRcheck1(mem);
        if (retval === CV_RTFUNC_FAIL)
          return { flag: CV_RTFUNC_FAIL, t: tret };
      }
    }
    if (mem.cv_nst > 0) {
      troundoff = FUZZ_FACTOR * UROUND * (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h));
      if (mem.cv_nrtfn > 0) {
        const irfndp = mem.cv_irfnd;
        retval = cvRcheck2(mem);
        if (retval === CLOSERT)
          return { flag: -99, t: mem.cv_tlo };
        else if (retval === CV_RTFUNC_FAIL)
          return { flag: CV_RTFUNC_FAIL, t: mem.cv_tlo };
        else if (retval === RTFOUND) {
          mem.cv_tretlast = tret = mem.cv_tlo;
          return { flag: CV_ROOT_RETURN, t: tret };
        }
        if (Math.abs(mem.cv_tn - mem.cv_tretlast) > troundoff) {
          retval = cvRcheck3(mem);
          if (retval === CV_SUCCESS) {
            mem.cv_irfnd = 0;
            if (irfndp === 1 && itask === CV_ONE_STEP) {
              mem.cv_tretlast = tret = mem.cv_tn;
              yout.set(mem.cv_zn[0]);
              return { flag: CV_SUCCESS, t: tret };
            }
          } else if (retval === RTFOUND) {
            mem.cv_irfnd = 1;
            mem.cv_tretlast = tret = mem.cv_tlo;
            return { flag: CV_ROOT_RETURN, t: tret };
          } else if (retval === CV_RTFUNC_FAIL)
            return { flag: CV_RTFUNC_FAIL, t: mem.cv_tlo };
        }
      }
      if (mem.cv_tstopset) {
        if (Math.abs(mem.cv_tn - mem.cv_tstop) <= troundoff) {
          if ((tout - mem.cv_tstop) * mem.cv_h >= 0 || Math.abs(tout - mem.cv_tstop) <= troundoff) {
            if (mem.cv_tstopinterp)
              cvodeGetDky(mem, mem.cv_tstop, 0, yout);
            else
              yout.set(mem.cv_zn[0]);
            mem.cv_tretlast = tret = mem.cv_tstop;
            mem.cv_tstopset = false;
            return { flag: CV_TSTOP_RETURN, t: tret };
          }
        } else if ((mem.cv_tn + mem.cv_hprime - mem.cv_tstop) * mem.cv_h > 0) {
          mem.cv_hprime = (mem.cv_tstop - mem.cv_tn) * (1 - 4 * UROUND);
          mem.cv_eta = mem.cv_hprime / mem.cv_h;
        }
      }
      if (itask === CV_NORMAL && (mem.cv_tn - tout) * mem.cv_h >= 0) {
        mem.cv_tretlast = tret = tout;
        cvodeGetDky(mem, tout, 0, yout);
        return { flag: CV_SUCCESS, t: tret };
      }
      if (itask === CV_ONE_STEP && Math.abs(mem.cv_tn - mem.cv_tretlast) > troundoff) {
        mem.cv_tretlast = tret = mem.cv_tn;
        yout.set(mem.cv_zn[0]);
        return { flag: CV_SUCCESS, t: tret };
      }
    }
    let nstloc = 0;
    istate = CV_SUCCESS;
    for (; ; ) {
      mem.cv_next_h = mem.cv_h;
      mem.cv_next_q = mem.cv_q;
      if (mem.cv_nst > 0) {
        const ewtsetOK = cvEwtSet(mem);
        if (ewtsetOK !== 0) {
          istate = -99;
          mem.cv_tretlast = tret = mem.cv_tn;
          yout.set(mem.cv_zn[0]);
          break;
        }
      }
      if (mem.cv_mxstep > 0 && nstloc >= mem.cv_mxstep) {
        istate = CV_TOO_MUCH_WORK;
        mem.cv_tretlast = tret = mem.cv_tn;
        yout.set(mem.cv_zn[0]);
        break;
      }
      const nrm = wrmsNorm(mem.cv_N, mem.cv_zn[0], mem.cv_ewt);
      mem.cv_tolsf = UROUND * nrm;
      if (mem.cv_tolsf > 1) {
        istate = CV_TOO_MUCH_ACC;
        mem.cv_tretlast = tret = mem.cv_tn;
        yout.set(mem.cv_zn[0]);
        mem.cv_tolsf *= 2;
        break;
      } else
        mem.cv_tolsf = 1;
      if (mem.cv_tn + mem.cv_h === mem.cv_tn)
        mem.cv_nhnil++;
      const kflag = cvStep(mem);
      if (kflag !== CV_SUCCESS) {
        istate = cvHandleFailure(mem, kflag);
        mem.cv_tretlast = tret = mem.cv_tn;
        yout.set(mem.cv_zn[0]);
        break;
      }
      nstloc++;
      if (mem.cv_tstopset) {
        troundoff = FUZZ_FACTOR * UROUND * (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h));
        if (Math.abs(mem.cv_tn - mem.cv_tstop) <= troundoff)
          mem.cv_tn = mem.cv_tstop;
      }
      if (mem.cv_nrtfn > 0) {
        retval = cvRcheck3(mem);
        if (retval === RTFOUND) {
          mem.cv_irfnd = 1;
          istate = CV_ROOT_RETURN;
          mem.cv_tretlast = tret = mem.cv_tlo;
          break;
        } else if (retval === CV_RTFUNC_FAIL) {
          istate = CV_RTFUNC_FAIL;
          break;
        }
      }
      if (mem.cv_tstopset) {
        troundoff = FUZZ_FACTOR * UROUND * (Math.abs(mem.cv_tn) + Math.abs(mem.cv_h));
        if (Math.abs(mem.cv_tn - mem.cv_tstop) <= troundoff) {
          if ((tout - mem.cv_tstop) * mem.cv_h >= 0 || Math.abs(tout - mem.cv_tstop) <= troundoff) {
            if (mem.cv_tstopinterp)
              cvodeGetDky(mem, mem.cv_tstop, 0, yout);
            else
              yout.set(mem.cv_zn[0]);
            mem.cv_tretlast = tret = mem.cv_tstop;
            mem.cv_tstopset = false;
            istate = CV_TSTOP_RETURN;
            break;
          }
        } else if ((mem.cv_tn + mem.cv_hprime - mem.cv_tstop) * mem.cv_h > 0) {
          mem.cv_hprime = (mem.cv_tstop - mem.cv_tn) * (1 - 4 * UROUND);
          mem.cv_eta = mem.cv_hprime / mem.cv_h;
        }
      }
      if (itask === CV_NORMAL && (mem.cv_tn - tout) * mem.cv_h >= 0) {
        istate = CV_SUCCESS;
        mem.cv_tretlast = tret = tout;
        cvodeGetDky(mem, tout, 0, yout);
        mem.cv_next_q = mem.cv_qprime;
        mem.cv_next_h = mem.cv_hprime;
        break;
      }
      if (itask === CV_ONE_STEP) {
        istate = CV_SUCCESS;
        mem.cv_tretlast = tret = mem.cv_tn;
        yout.set(mem.cv_zn[0]);
        mem.cv_next_q = mem.cv_qprime;
        mem.cv_next_h = mem.cv_hprime;
        break;
      }
    }
    return { flag: istate, t: tret };
  }
  function cvInitialSetup(mem) {
    if (mem.cv_itol === CV_NN) {
      mem.cv_error = "cvInitialSetup: no tolerances set";
      return -99;
    }
    const ier = cvEwtSet(mem);
    if (ier !== 0) {
      mem.cv_error = "cvInitialSetup: bad ewt";
      return -99;
    }
    if (mem.cv_linit !== null) {
      const linit_ret = mem.cv_linit(mem);
      if (linit_ret !== 0) {
        mem.cv_error = "cvInitialSetup: linear solver init failed";
        return CV_LINIT_FAIL;
      }
    }
    return CV_SUCCESS;
  }
  function cvEwtSet(mem) {
    switch (mem.cv_itol) {
      case CV_SS:
        return cvEwtSetSS(mem);
      case CV_SV:
        return cvEwtSetSV(mem);
      default:
        return -1;
    }
  }
  function cvEwtSetSS(mem) {
    const N = mem.cv_N;
    const rtol = mem.cv_reltol;
    const atol = mem.cv_Sabstol;
    const y = mem.cv_zn[0];
    const ewt = mem.cv_ewt;
    for (let i = 0; i < N; i++) {
      const tol = rtol * Math.abs(y[i]) + atol;
      if (mem.cv_atolmin0 && tol <= 0)
        return -1;
      ewt[i] = 1 / tol;
    }
    return 0;
  }
  function cvEwtSetSV(mem) {
    const N = mem.cv_N;
    const rtol = mem.cv_reltol;
    const vatol = mem.cv_Vabstol;
    const y = mem.cv_zn[0];
    const ewt = mem.cv_ewt;
    for (let i = 0; i < N; i++) {
      const tol = rtol * Math.abs(y[i]) + vatol[i];
      if (mem.cv_atolmin0 && tol <= 0)
        return -1;
      ewt[i] = 1 / tol;
    }
    return 0;
  }
  function cvStep(mem) {
    let dsm = 0;
    let ncf = 0;
    let nef = 0;
    let nflag;
    let kflag;
    let eflag;
    if (mem.cv_nst > 0 && mem.cv_hprime !== mem.cv_h)
      cvAdjustParams(mem);
    const saved_t = mem.cv_tn;
    nflag = FIRST_CALL;
    for (; ; ) {
      cvPredict(mem);
      cvSet(mem);
      nflag = cvNls(mem, nflag);
      const nflagRef = { value: nflag };
      const ncfRef = { value: ncf };
      kflag = cvHandleNFlag(mem, nflagRef, saved_t, ncfRef);
      nflag = nflagRef.value;
      ncf = ncfRef.value;
      if (kflag === PREDICT_AGAIN)
        continue;
      if (kflag !== DO_ERROR_TEST)
        return kflag;
      const nflagRef2 = { value: nflag };
      const nefRef = { value: nef };
      const dsmRef = { value: dsm };
      eflag = cvDoErrorTest(mem, nflagRef2, saved_t, nefRef, dsmRef);
      nflag = nflagRef2.value;
      nef = nefRef.value;
      dsm = dsmRef.value;
      if (eflag === TRY_AGAIN)
        continue;
      if (eflag !== CV_SUCCESS)
        return eflag;
      break;
    }
    cvCompleteStep(mem);
    cvPrepareNextStep(mem, dsm);
    if (mem.cv_sldeton)
      cvBDFStab(mem);
    mem.cv_etamax = mem.cv_nst <= mem.cv_small_nst ? mem.cv_eta_max_es : mem.cv_eta_max_gs;
    vScale(mem.cv_tq[2], mem.cv_acor, mem.cv_acor, mem.cv_N);
    return CV_SUCCESS;
  }
  function cvAdjustParams(mem) {
    if (mem.cv_qprime !== mem.cv_q) {
      if (!mem.first_step_after_resize)
        cvAdjustOrder(mem, mem.cv_qprime - mem.cv_q);
      mem.cv_q = mem.cv_qprime;
      mem.cv_L = mem.cv_q + 1;
      mem.cv_qwait = mem.cv_L;
    }
    cvRescale(mem);
  }
  function cvAdjustOrder(mem, deltaq) {
    if (mem.cv_q === 2 && deltaq !== 1)
      return;
    if (mem.cv_lmm === CV_ADAMS)
      cvAdjustAdams(mem, deltaq);
    else if (mem.cv_lmm === CV_BDF) {
      if (deltaq === 1)
        cvIncreaseBDF(mem);
      else if (deltaq === -1)
        cvDecreaseBDF(mem);
    }
  }
  function cvRescale(mem) {
    const N = mem.cv_N;
    let factor = mem.cv_eta;
    for (let j = 1; j <= mem.cv_q; j++) {
      const znj = mem.cv_zn[j];
      for (let i = 0; i < N; i++)
        znj[i] *= factor;
      factor *= mem.cv_eta;
    }
    mem.cv_h = mem.cv_hscale * mem.cv_eta;
    mem.cv_next_h = mem.cv_h;
    mem.cv_hscale = mem.cv_h;
    mem.cv_nscon = 0;
  }
  function cvPredict(mem) {
    const N = mem.cv_N;
    mem.cv_tn += mem.cv_h;
    if (mem.cv_tstopset) {
      if ((mem.cv_tn - mem.cv_tstop) * mem.cv_h > 0)
        mem.cv_tn = mem.cv_tstop;
    }
    for (let k = 1; k <= mem.cv_q; k++) {
      for (let j = mem.cv_q; j >= k; j--) {
        const znjm1 = mem.cv_zn[j - 1];
        const znj = mem.cv_zn[j];
        for (let i = 0; i < N; i++)
          znjm1[i] += znj[i];
      }
    }
  }
  function cvSet(mem) {
    if (mem.cv_lmm === CV_ADAMS)
      cvSetAdams(mem);
    else
      cvSetBDF(mem);
    mem.cv_rl1 = 1 / mem.cv_l[1];
    mem.cv_gamma = mem.cv_h * mem.cv_rl1;
    if (mem.cv_nst === 0)
      mem.cv_gammap = mem.cv_gamma;
    mem.cv_gamrat = mem.cv_nst > 0 ? mem.cv_gamma / mem.cv_gammap : 1;
  }
  function cvHandleNFlag(mem, nflagRef, saved_t, ncfRef) {
    const nflag = nflagRef.value;
    if (nflag === CV_SUCCESS)
      return DO_ERROR_TEST;
    mem.cv_ncfn++;
    cvRestore(mem, saved_t);
    if (nflag < 0) {
      if (nflag === CV_LSETUP_FAIL)
        return CV_LSETUP_FAIL;
      else if (nflag === CV_LSOLVE_FAIL)
        return CV_LSOLVE_FAIL;
      else if (nflag === CV_RHSFUNC_FAIL)
        return CV_RHSFUNC_FAIL;
      else
        return CV_NLS_FAIL;
    }
    ncfRef.value++;
    mem.cv_etamax = 1;
    if (Math.abs(mem.cv_h) <= mem.cv_hmin * ONEPSM || ncfRef.value === mem.cv_maxncf) {
      if (nflag === SUN_NLS_CONV_RECVR)
        return CV_CONV_FAILURE;
      if (nflag === RHSFUNC_RECVR)
        return CV_REPTD_RHSFUNC_ERR;
    }
    mem.cv_eta = Math.max(mem.cv_eta_cf, mem.cv_hmin / Math.abs(mem.cv_h));
    nflagRef.value = PREV_CONV_FAIL;
    cvRescale(mem);
    return PREDICT_AGAIN;
  }
  function cvRestore(mem, saved_t) {
    const N = mem.cv_N;
    mem.cv_tn = saved_t;
    for (let k = 1; k <= mem.cv_q; k++) {
      for (let j = mem.cv_q; j >= k; j--) {
        const znjm1 = mem.cv_zn[j - 1];
        const znj = mem.cv_zn[j];
        for (let i = 0; i < N; i++)
          znjm1[i] -= znj[i];
      }
    }
  }
  function cvDoErrorTest(mem, nflagRef, saved_t, nefRef, dsmRef) {
    const dsm = mem.cv_acnrm * mem.cv_tq[2];
    dsmRef.value = dsm;
    if (dsm <= 1)
      return CV_SUCCESS;
    nefRef.value++;
    mem.cv_netf++;
    nflagRef.value = PREV_ERR_FAIL;
    cvRestore(mem, saved_t);
    if (Math.abs(mem.cv_h) <= mem.cv_hmin * ONEPSM || nefRef.value === mem.cv_maxnef)
      return CV_ERR_FAILURE;
    mem.cv_etamax = 1;
    if (nefRef.value <= MXNEF1) {
      mem.cv_eta = 1 / (Math.pow(BIAS2 * dsm, 1 / mem.cv_L) + ADDON);
      mem.cv_eta = Math.max(mem.cv_eta_min_ef, Math.max(mem.cv_eta, mem.cv_hmin / Math.abs(mem.cv_h)));
      if (nefRef.value >= mem.cv_small_nef)
        mem.cv_eta = Math.min(mem.cv_eta, mem.cv_eta_max_ef);
      cvRescale(mem);
      return TRY_AGAIN;
    }
    if (mem.cv_q > 1) {
      mem.cv_eta = Math.max(mem.cv_eta_min_ef, mem.cv_hmin / Math.abs(mem.cv_h));
      cvAdjustOrder(mem, -1);
      mem.cv_L = mem.cv_q;
      mem.cv_q--;
      mem.cv_qwait = mem.cv_L;
      cvRescale(mem);
      return TRY_AGAIN;
    }
    mem.cv_eta = Math.max(mem.cv_eta_min_ef, mem.cv_hmin / Math.abs(mem.cv_h));
    mem.cv_h *= mem.cv_eta;
    mem.cv_next_h = mem.cv_h;
    mem.cv_hscale = mem.cv_h;
    mem.cv_qwait = LONG_WAIT;
    mem.cv_nscon = 0;
    const retval = mem.cv_f(mem.cv_tn, mem.cv_zn[0], mem.cv_tempv, mem.cv_user_data);
    mem.cv_nfe++;
    if (retval < 0)
      return CV_RHSFUNC_FAIL;
    if (retval > 0)
      return CV_UNREC_RHSFUNC_ERR;
    vScale(mem.cv_h, mem.cv_tempv, mem.cv_zn[1], mem.cv_N);
    return TRY_AGAIN;
  }
  function cvCompleteStep(mem) {
    const N = mem.cv_N;
    mem.cv_nst++;
    mem.cv_nscon++;
    mem.cv_hu = mem.cv_h;
    mem.cv_qu = mem.cv_q;
    mem.first_step_after_resize = false;
    for (let i = mem.cv_q; i >= 2; i--)
      mem.cv_tau[i] = mem.cv_tau[i - 1];
    if (mem.cv_q === 1 && mem.cv_nst > 1)
      mem.cv_tau[2] = mem.cv_tau[1];
    mem.cv_tau[1] = mem.cv_h;
    for (let j = 0; j <= mem.cv_q; j++) {
      const lj = mem.cv_l[j];
      const znj = mem.cv_zn[j];
      const acor = mem.cv_acor;
      for (let i = 0; i < N; i++)
        znj[i] += lj * acor[i];
    }
    mem.cv_qwait--;
    if (mem.cv_qwait === 1 && mem.cv_q !== mem.cv_qmax) {
      mem.cv_zn[mem.cv_qmax].set(mem.cv_acor);
      mem.cv_saved_tq5 = mem.cv_tq[5];
      mem.cv_indx_acor = mem.cv_qmax;
    }
  }
  function cvPrepareNextStep(mem, dsm) {
    if (mem.cv_etamax === 1) {
      mem.cv_qwait = Math.max(mem.cv_qwait, 2);
      mem.cv_qprime = mem.cv_q;
      mem.cv_hprime = mem.cv_h;
      mem.cv_eta = 1;
    } else {
      mem.cv_etaq = 1 / (Math.pow(BIAS2 * dsm, 1 / mem.cv_L) + ADDON);
      if (mem.cv_qwait !== 0) {
        mem.cv_eta = mem.cv_etaq;
        mem.cv_qprime = mem.cv_q;
        cvSetEta(mem);
      } else {
        mem.cv_qwait = 2;
        mem.cv_etaqm1 = cvComputeEtaqm1(mem);
        mem.cv_etaqp1 = cvComputeEtaqp1(mem);
        cvChooseEta(mem);
        cvSetEta(mem);
      }
    }
  }
  function cvSetEta(mem) {
    if (mem.cv_eta > mem.cv_eta_min_fx && mem.cv_eta < mem.cv_eta_max_fx) {
      mem.cv_eta = 1;
      mem.cv_hprime = mem.cv_h;
    } else {
      if (mem.cv_eta >= mem.cv_eta_max_fx) {
        mem.cv_eta = Math.min(mem.cv_eta, mem.cv_etamax);
        mem.cv_eta /= Math.max(1, Math.abs(mem.cv_h) * mem.cv_hmax_inv * mem.cv_eta);
      } else {
        mem.cv_eta = Math.max(mem.cv_eta, mem.cv_eta_min);
        mem.cv_eta = Math.max(mem.cv_eta, mem.cv_hmin / Math.abs(mem.cv_h));
      }
      mem.cv_hprime = mem.cv_h * mem.cv_eta;
      if (mem.cv_qprime < mem.cv_q)
        mem.cv_nscon = 0;
    }
  }
  function cvComputeEtaqm1(mem) {
    mem.cv_etaqm1 = 0;
    if (mem.cv_q > 1) {
      const ddn = wrmsNorm(mem.cv_N, mem.cv_zn[mem.cv_q], mem.cv_ewt) * mem.cv_tq[1];
      mem.cv_etaqm1 = 1 / (Math.pow(BIAS1 * ddn, 1 / mem.cv_q) + ADDON);
    }
    return mem.cv_etaqm1;
  }
  function cvComputeEtaqp1(mem) {
    mem.cv_etaqp1 = 0;
    if (mem.cv_q !== mem.cv_qmax) {
      if (mem.cv_saved_tq5 === 0)
        return mem.cv_etaqp1;
      const cquot = mem.cv_tq[5] / mem.cv_saved_tq5 * Math.pow(mem.cv_h / mem.cv_tau[2], mem.cv_L);
      const N = mem.cv_N;
      const tempv = mem.cv_tempv;
      const znqmax = mem.cv_zn[mem.cv_qmax];
      const acor = mem.cv_acor;
      for (let i = 0; i < N; i++)
        tempv[i] = acor[i] - cquot * znqmax[i];
      const dup = wrmsNorm(N, tempv, mem.cv_ewt) * mem.cv_tq[3];
      mem.cv_etaqp1 = 1 / (Math.pow(BIAS3 * dup, 1 / (mem.cv_L + 1)) + ADDON);
    }
    return mem.cv_etaqp1;
  }
  function cvChooseEta(mem) {
    const etam = Math.max(mem.cv_etaqm1, Math.max(mem.cv_etaq, mem.cv_etaqp1));
    if (etam > mem.cv_eta_min_fx && etam < mem.cv_eta_max_fx) {
      mem.cv_eta = 1;
      mem.cv_qprime = mem.cv_q;
    } else {
      if (etam === mem.cv_etaq) {
        mem.cv_eta = mem.cv_etaq;
        mem.cv_qprime = mem.cv_q;
      } else if (etam === mem.cv_etaqm1) {
        mem.cv_eta = mem.cv_etaqm1;
        mem.cv_qprime = mem.cv_q - 1;
      } else {
        mem.cv_eta = mem.cv_etaqp1;
        mem.cv_qprime = mem.cv_q + 1;
        if (mem.cv_lmm === CV_BDF) {
          mem.cv_zn[mem.cv_qmax].set(mem.cv_acor);
        }
      }
    }
  }
  function cvHandleFailure(mem, flag) {
    switch (flag) {
      case CV_ERR_FAILURE:
        mem.cv_error = `Error test failures at t=${mem.cv_tn}, h=${mem.cv_h}`;
        break;
      case CV_CONV_FAILURE:
        mem.cv_error = `Convergence failures at t=${mem.cv_tn}, h=${mem.cv_h}`;
        break;
      case CV_LSETUP_FAIL:
        mem.cv_error = `Linear solver setup failed at t=${mem.cv_tn}`;
        break;
      case CV_LSOLVE_FAIL:
        mem.cv_error = `Linear solver solve failed at t=${mem.cv_tn}`;
        break;
      case CV_RHSFUNC_FAIL:
        mem.cv_error = `RHS function failed at t=${mem.cv_tn}`;
        break;
      case CV_UNREC_RHSFUNC_ERR:
        mem.cv_error = `Unrecoverable RHS function error at t=${mem.cv_tn}`;
        break;
      case CV_REPTD_RHSFUNC_ERR:
        mem.cv_error = `Repeated RHS function errors at t=${mem.cv_tn}`;
        break;
      case CV_RTFUNC_FAIL:
        mem.cv_error = `Root function failed at t=${mem.cv_tn}`;
        break;
      case CV_TOO_CLOSE:
        mem.cv_error = "tout too close to t0";
        break;
      default:
        mem.cv_error = `Unrecognized failure flag: ${flag}`;
        break;
    }
    return flag;
  }
  function cvBDFStab(mem) {
    if (mem.cv_q >= 3) {
      for (let k = 1; k <= 3; k++) {
        for (let i = 5; i >= 2; i--)
          mem.cv_ssdat[i][k] = mem.cv_ssdat[i - 1][k];
      }
      let factorial = 1;
      for (let i = 1; i <= mem.cv_q - 1; i++)
        factorial *= i;
      const sq = factorial * mem.cv_q * (mem.cv_q + 1) * mem.cv_acnrm / Math.max(mem.cv_tq[5], TINY2);
      const sqm1 = factorial * mem.cv_q * wrmsNorm(mem.cv_N, mem.cv_zn[mem.cv_q], mem.cv_ewt);
      const sqm2 = factorial * wrmsNorm(mem.cv_N, mem.cv_zn[mem.cv_q - 1], mem.cv_ewt);
      mem.cv_ssdat[1][1] = sqm2 * sqm2;
      mem.cv_ssdat[1][2] = sqm1 * sqm1;
      mem.cv_ssdat[1][3] = sq * sq;
    }
    if (mem.cv_qprime >= mem.cv_q) {
      if (mem.cv_q >= 3 && mem.cv_nscon >= mem.cv_q + 5) {
        const ldflag = cvSLdet(mem);
        if (ldflag > 3) {
          mem.cv_qprime = mem.cv_q - 1;
          mem.cv_eta = mem.cv_etaqm1;
          mem.cv_eta = Math.min(mem.cv_eta, mem.cv_etamax);
          mem.cv_eta = mem.cv_eta / Math.max(1, Math.abs(mem.cv_h) * mem.cv_hmax_inv * mem.cv_eta);
          mem.cv_hprime = mem.cv_h * mem.cv_eta;
          mem.cv_nor = mem.cv_nor + 1;
        }
      }
    } else {
      mem.cv_nscon = 0;
    }
  }
  function cvSLdet(mem) {
    let kmin = 0;
    let kflag = 0;
    const rat = [];
    for (let i = 0; i < 5; i++)
      rat[i] = [0, 0, 0, 0];
    const rav = [0, 0, 0, 0];
    const qkr = [0, 0, 0, 0];
    const sigsq = [0, 0, 0, 0];
    const smax = [0, 0, 0, 0];
    const ssmax = [0, 0, 0, 0];
    const drr = [0, 0, 0, 0];
    const rrc = [0, 0, 0, 0];
    const sqmx = [0, 0, 0, 0];
    const vrat = [0, 0, 0, 0, 0];
    const qjk = [];
    for (let j = 0; j < 4; j++)
      qjk[j] = [0, 0, 0, 0];
    const qc = [];
    for (let i = 0; i < 6; i++)
      qc[i] = [0, 0, 0, 0];
    const qco = [];
    for (let i = 0; i < 6; i++)
      qco[i] = [0, 0, 0, 0];
    const rrcut = 0.98;
    const vrrtol = 1e-4;
    const vrrt2 = 5e-4;
    const sqtol = 1e-3;
    const rrtol = 0.01;
    let rr = 0;
    for (let k = 1; k <= 3; k++) {
      let smink = mem.cv_ssdat[1][k];
      let smaxk = 0;
      for (let i = 1; i <= 5; i++) {
        smink = Math.min(smink, mem.cv_ssdat[i][k]);
        smaxk = Math.max(smaxk, mem.cv_ssdat[i][k]);
      }
      if (smink < TINY2 * smaxk)
        return -1;
      smax[k] = smaxk;
      ssmax[k] = smaxk * smaxk;
      let sumrat = 0;
      let sumrsq = 0;
      for (let i = 1; i <= 4; i++) {
        rat[i][k] = mem.cv_ssdat[i][k] / mem.cv_ssdat[i + 1][k];
        sumrat += rat[i][k];
        sumrsq += rat[i][k] * rat[i][k];
      }
      rav[k] = 0.25 * sumrat;
      vrat[k] = Math.abs(0.25 * sumrsq - rav[k] * rav[k]);
      qc[5][k] = mem.cv_ssdat[1][k] * mem.cv_ssdat[3][k] - mem.cv_ssdat[2][k] * mem.cv_ssdat[2][k];
      qc[4][k] = mem.cv_ssdat[2][k] * mem.cv_ssdat[3][k] - mem.cv_ssdat[1][k] * mem.cv_ssdat[4][k];
      qc[3][k] = 0;
      qc[2][k] = mem.cv_ssdat[2][k] * mem.cv_ssdat[5][k] - mem.cv_ssdat[3][k] * mem.cv_ssdat[4][k];
      qc[1][k] = mem.cv_ssdat[4][k] * mem.cv_ssdat[4][k] - mem.cv_ssdat[3][k] * mem.cv_ssdat[5][k];
      for (let i = 1; i <= 5; i++)
        qco[i][k] = qc[i][k];
    }
    const vmin = Math.min(vrat[1], Math.min(vrat[2], vrat[3]));
    const vmax = Math.max(vrat[1], Math.max(vrat[2], vrat[3]));
    if (vmin < vrrtol * vrrtol) {
      if (vmax > vrrt2 * vrrt2)
        return -2;
      else {
        rr = (rav[1] + rav[2] + rav[3]) / 3;
        let drrmax = 0;
        for (let k = 1; k <= 3; k++) {
          const adrr = Math.abs(rav[k] - rr);
          drrmax = Math.max(drrmax, adrr);
        }
        if (drrmax > vrrt2)
          return -3;
        kflag = 1;
      }
    } else {
      if (Math.abs(qco[1][1]) < TINY2 * ssmax[1])
        return -4;
      let tem = qco[1][2] / qco[1][1];
      for (let i = 2; i <= 5; i++)
        qco[i][2] = qco[i][2] - tem * qco[i][1];
      qco[1][2] = 0;
      tem = qco[1][3] / qco[1][1];
      for (let i = 2; i <= 5; i++)
        qco[i][3] = qco[i][3] - tem * qco[i][1];
      qco[1][3] = 0;
      if (Math.abs(qco[2][2]) < TINY2 * ssmax[2])
        return -4;
      tem = qco[2][3] / qco[2][2];
      for (let i = 3; i <= 5; i++)
        qco[i][3] = qco[i][3] - tem * qco[i][2];
      if (Math.abs(qco[4][3]) < TINY2 * ssmax[3])
        return -4;
      rr = -qco[5][3] / qco[4][3];
      if (rr < TINY2 || rr > 100)
        return -5;
      for (let k = 1; k <= 3; k++)
        qkr[k] = qc[5][k] + rr * (qc[4][k] + rr * rr * (qc[2][k] + rr * qc[1][k]));
      let sqmax = 0;
      for (let k = 1; k <= 3; k++) {
        const saqk = Math.abs(qkr[k]) / ssmax[k];
        if (saqk > sqmax)
          sqmax = saqk;
      }
      if (sqmax < sqtol)
        kflag = 2;
      else {
        for (let it = 1; it <= 3; it++) {
          for (let k = 1; k <= 3; k++) {
            const qp = qc[4][k] + rr * rr * (3 * qc[2][k] + rr * 4 * qc[1][k]);
            drr[k] = 0;
            if (Math.abs(qp) > TINY2 * ssmax[k])
              drr[k] = -qkr[k] / qp;
            rrc[k] = rr + drr[k];
          }
          for (let k = 1; k <= 3; k++) {
            const s = rrc[k];
            let sqmaxk = 0;
            for (let j = 1; j <= 3; j++) {
              qjk[j][k] = qc[5][j] + s * (qc[4][j] + s * s * (qc[2][j] + s * qc[1][j]));
              const saqj = Math.abs(qjk[j][k]) / ssmax[j];
              if (saqj > sqmaxk)
                sqmaxk = saqj;
            }
            sqmx[k] = sqmaxk;
          }
          let sqmin = sqmx[1] + 1;
          for (let k = 1; k <= 3; k++) {
            if (sqmx[k] < sqmin) {
              kmin = k;
              sqmin = sqmx[k];
            }
          }
          rr = rrc[kmin];
          if (sqmin < sqtol) {
            kflag = 3;
            break;
          } else
            for (let j = 1; j <= 3; j++)
              qkr[j] = qjk[j][kmin];
        }
        if (kflag !== 3) {
          return -6;
        }
      }
    }
    for (let k = 1; k <= 3; k++) {
      const rsa = mem.cv_ssdat[1][k];
      const rsb = mem.cv_ssdat[2][k] * rr;
      const rsc = mem.cv_ssdat[3][k] * rr * rr;
      const rsd = mem.cv_ssdat[4][k] * rr * rr * rr;
      const rd1a = rsa - rsb;
      const rd1b = rsb - rsc;
      const rd1c = rsc - rsd;
      const rd2a = rd1a - rd1b;
      const rd2b = rd1b - rd1c;
      const rd3a = rd2a - rd2b;
      if (Math.abs(rd1b) < TINY2 * smax[k])
        return -7;
      const cest1 = -rd3a / rd1b;
      if (cest1 < TINY2 || cest1 > 4)
        return -7;
      const corr1 = rd2b / cest1 / (rr * rr);
      sigsq[k] = mem.cv_ssdat[3][k] + corr1;
    }
    if (sigsq[2] < TINY2)
      return -8;
    const ratp = sigsq[3] / sigsq[2];
    const ratm = sigsq[1] / sigsq[2];
    const qfac1 = 0.25 * (mem.cv_q * mem.cv_q - 1);
    const qfac2 = 2 / (mem.cv_q - 1);
    const bb = ratp * ratm - 1 - qfac1 * ratp;
    const tem2 = 1 - qfac2 * bb;
    if (Math.abs(tem2) < TINY2)
      return -8;
    const rrb = 1 / tem2;
    if (Math.abs(rrb - rr) > rrtol)
      return -9;
    if (rr > rrcut) {
      if (kflag === 1)
        kflag = 4;
      if (kflag === 2)
        kflag = 5;
      if (kflag === 3)
        kflag = 6;
    }
    return kflag;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/dense_linalg.js
  function dgefa2(a, n, ipvt) {
    let info = 0;
    for (let k = 0; k < n; k++) {
      let l = k;
      let maxAbs = Math.abs(a[k][k]);
      for (let i = k + 1; i < n; i++) {
        const v = Math.abs(a[i][k]);
        if (v > maxAbs) {
          maxAbs = v;
          l = i;
        }
      }
      ipvt[k] = l;
      if (a[l][k] === 0) {
        info = k + 1;
        continue;
      }
      if (l !== k) {
        const tmp = a[k];
        a[k] = a[l];
        a[l] = tmp;
      }
      const pivot = a[k][k];
      const mult = 1 / pivot;
      for (let i = k + 1; i < n; i++)
        a[i][k] *= mult;
      for (let i = k + 1; i < n; i++) {
        const m = a[i][k];
        if (m !== 0) {
          const rowI = a[i];
          const rowK = a[k];
          for (let j = k + 1; j < n; j++)
            rowI[j] -= m * rowK[j];
        }
      }
    }
    return info;
  }
  function dgesl2(a, n, ipvt, b) {
    for (let k = 0; k < n; k++) {
      const p = ipvt[k];
      if (p !== k) {
        const tmp = b[k];
        b[k] = b[p];
        b[p] = tmp;
      }
    }
    for (let k = 0; k < n - 1; k++) {
      for (let i = k + 1; i < n; i++)
        b[i] -= a[i][k] * b[k];
    }
    for (let k = n - 1; k >= 0; k--) {
      b[k] /= a[k][k];
      for (let i = 0; i < k; i++)
        b[i] -= a[i][k] * b[k];
    }
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_ls.js
  function cvodeSetLinearSolver(mem) {
    const N = mem.cv_N;
    const lmem = new CvLsMem();
    lmem.A = new Array(N);
    lmem.savedJ = new Array(N);
    for (let i = 0; i < N; i++) {
      lmem.A[i] = new Float64Array(N);
      lmem.savedJ[i] = new Float64Array(N);
    }
    lmem.pivots = new Int32Array(N);
    lmem.jacDQ = true;
    lmem.jacFn = null;
    lmem.jbad = true;
    lmem.nje = 0;
    lmem.nfeDQ = 0;
    lmem.nstlj = 0;
    lmem.tnlj = 0;
    lmem.msbj = CVLS_MSBJ;
    lmem.dgmax_jbad = CVLS_DGMAX;
    mem.cv_lmem = lmem;
    mem.cv_linit = cvLsInitialize;
    mem.cv_lsetup = cvLsSetup;
    mem.cv_lsolve = cvLsSolve;
    mem.cv_lfree = cvLsFree;
    return CV_SUCCESS;
  }
  function cvodeSetJacFn(mem, jac) {
    const lmem = mem.cv_lmem;
    if (!lmem)
      return -1;
    if (jac) {
      lmem.jacDQ = false;
      lmem.jacFn = jac;
    } else {
      lmem.jacDQ = true;
      lmem.jacFn = null;
    }
    return CV_SUCCESS;
  }
  function cvLsInitialize(mem) {
    const lmem = mem.cv_lmem;
    lmem.nje = 0;
    lmem.nfeDQ = 0;
    lmem.nstlj = 0;
    lmem.jbad = true;
    return CV_SUCCESS;
  }
  function cvLsSetup(mem, convfail, ypred, fpred, jcurPtr, tmp1, tmp2, tmp3) {
    const lmem = mem.cv_lmem;
    const N = mem.cv_N;
    let retval;
    const jbad = lmem.jbad;
    let jok = !jbad;
    if (!jbad) {
      if (Math.abs(mem.cv_gamrat - 1) > lmem.dgmax_jbad)
        jok = false;
      if (mem.cv_nst >= lmem.nstlj + lmem.msbj)
        jok = false;
      if (convfail === CV_FAIL_BAD_J)
        jok = false;
    }
    if (jok) {
      jcurPtr.value = false;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++)
          lmem.A[i][j] = -mem.cv_gamma * lmem.savedJ[i][j];
        lmem.A[i][i] += 1;
      }
    } else {
      lmem.nje++;
      lmem.nstlj = mem.cv_nst;
      lmem.jbad = false;
      jcurPtr.value = true;
      if (lmem.jacDQ)
        retval = cvLsDQJac(mem, mem.cv_tn, ypred, fpred, lmem.savedJ, tmp1, tmp2);
      else
        retval = lmem.jacFn(mem.cv_tn, ypred, fpred, lmem.savedJ, mem.cv_user_data);
      if (retval < 0) {
        lmem.jbad = true;
        return -1;
      }
      if (retval > 0) {
        lmem.jbad = true;
        return 1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++)
          lmem.A[i][j] = -mem.cv_gamma * lmem.savedJ[i][j];
        lmem.A[i][i] += 1;
      }
    }
    const info = dgefa2(lmem.A, N, lmem.pivots);
    if (info !== 0) {
      lmem.jbad = true;
      return 1;
    }
    return CV_SUCCESS;
  }
  function cvLsSolve(mem, b, weight, ycur, fcur) {
    const lmem = mem.cv_lmem;
    const N = mem.cv_N;
    dgesl2(lmem.A, N, lmem.pivots, b);
    if (mem.cv_gamrat !== 1) {
      const factor = 2 / (1 + mem.cv_gamrat);
      for (let i = 0; i < N; i++)
        b[i] *= factor;
    }
    return CV_SUCCESS;
  }
  function cvLsDQJac(mem, t, y, fy, J, tmp1, tmp2) {
    const N = mem.cv_N;
    const lmem = mem.cv_lmem;
    const uround = 2220446049250313e-31;
    const srur = Math.sqrt(uround);
    const fnorm_val = wrmsNorm(N, fy, mem.cv_ewt);
    const minInc = fnorm_val !== 0 ? 1e3 * Math.abs(mem.cv_h) * uround * N * fnorm_val : 1;
    for (let j = 0; j < N; j++) {
      const yjsaved = y[j];
      let inc = Math.max(srur * Math.abs(yjsaved), minInc / mem.cv_ewt[j]);
      tmp1.set(y);
      tmp1[j] = yjsaved + inc;
      inc = tmp1[j] - yjsaved;
      const retval = mem.cv_f(t, tmp1, tmp2, mem.cv_user_data);
      lmem.nfeDQ++;
      mem.cv_nfe++;
      if (retval !== 0)
        return retval;
      const inc_inv = 1 / inc;
      for (let i = 0; i < N; i++)
        J[i][j] = (tmp2[i] - fy[i]) * inc_inv;
    }
    return CV_SUCCESS;
  }
  function cvLsFree(mem) {
    mem.cv_lmem = null;
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_io.js
  function cvodeSStolerances(mem, rtol, atol) {
    if (rtol < 0) {
      mem.cv_error = "cvodeSStolerances: rtol must be >= 0";
      return -1;
    }
    if (atol < 0) {
      mem.cv_error = "cvodeSStolerances: atol must be >= 0";
      return -1;
    }
    mem.cv_reltol = rtol;
    mem.cv_Sabstol = atol;
    mem.cv_itol = CV_SS;
    mem.cv_atolmin0 = atol === 0;
    return CV_SUCCESS;
  }
  function cvodeSVtolerances(mem, rtol, atol) {
    if (rtol < 0) {
      mem.cv_error = "cvodeSVtolerances: rtol must be >= 0";
      return -1;
    }
    for (let i = 0; i < atol.length; i++) {
      if (atol[i] < 0) {
        mem.cv_error = `cvodeSVtolerances: atol[${i}] must be >= 0`;
        return -1;
      }
    }
    mem.cv_reltol = rtol;
    mem.cv_Vabstol = new Float64Array(atol);
    mem.cv_itol = CV_SV;
    let minAtol = Infinity;
    for (let i = 0; i < atol.length; i++)
      if (atol[i] < minAtol)
        minAtol = atol[i];
    mem.cv_atolmin0 = minAtol === 0;
    mem.cv_VabstolMallocDone = true;
    return CV_SUCCESS;
  }
  function cvodeSetMaxNumSteps(mem, mxstep) {
    mem.cv_mxstep = mxstep;
    return CV_SUCCESS;
  }
  function cvodeSetMaxOrd(mem, maxord) {
    const qmax = mem.cv_lmm === CV_ADAMS ? ADAMS_Q_MAX : BDF_Q_MAX;
    if (maxord < 1)
      maxord = 1;
    if (maxord > qmax)
      maxord = qmax;
    mem.cv_qmax = maxord;
    return CV_SUCCESS;
  }
  function cvodeSetMaxStep(mem, hmax) {
    if (hmax <= 0)
      mem.cv_hmax_inv = 0;
    else
      mem.cv_hmax_inv = 1 / hmax;
    return CV_SUCCESS;
  }
  function cvodeSetMinStep(mem, hmin) {
    mem.cv_hmin = Math.abs(hmin);
    return CV_SUCCESS;
  }
  function cvodeSetInitStep(mem, hin) {
    mem.cv_hin = hin;
    return CV_SUCCESS;
  }
  function cvodeSetStopTime(mem, tstop) {
    mem.cv_tstop = tstop;
    mem.cv_tstopset = true;
    mem.cv_tstopinterp = true;
    return CV_SUCCESS;
  }
  function cvodeSetUserData(mem, data) {
    mem.cv_user_data = data;
    return CV_SUCCESS;
  }
  function cvodeGetNumSteps(mem) {
    return mem.cv_nst;
  }
  function cvodeGetNumRhsEvals(mem) {
    return mem.cv_nfe;
  }
  function cvodeGetNumLinSolvSetups(mem) {
    return mem.cv_nsetups;
  }
  function cvodeGetNumErrTestFails(mem) {
    return mem.cv_netf;
  }
  function cvodeGetNumNonlinSolvIters(mem) {
    return mem.cv_nni;
  }
  function cvodeGetNumNonlinSolvConvFails(mem) {
    return mem.cv_ncfn;
  }
  function cvodeGetNumJacEvals(mem) {
    return mem.cv_lmem?.nje ?? 0;
  }
  function cvodeGetNumGEvals(mem) {
    return mem.cv_nge;
  }
  function cvodeGetLastOrder(mem) {
    return mem.cv_qu;
  }
  function cvodeGetLastStep(mem) {
    return mem.cv_hu;
  }
  function cvodeGetCurrentTime(mem) {
    return mem.cv_tn;
  }
  function cvodeGetIntegratorStats(mem) {
    return {
      nSteps: cvodeGetNumSteps(mem),
      nRhsEvals: cvodeGetNumRhsEvals(mem),
      nLinSolvSetups: cvodeGetNumLinSolvSetups(mem),
      nErrTestFails: cvodeGetNumErrTestFails(mem),
      nNonlinSolvIters: cvodeGetNumNonlinSolvIters(mem),
      nNonlinSolvConvFails: cvodeGetNumNonlinSolvConvFails(mem),
      nJacEvals: cvodeGetNumJacEvals(mem),
      nGEvals: cvodeGetNumGEvals(mem),
      lastOrder: cvodeGetLastOrder(mem),
      lastStep: cvodeGetLastStep(mem),
      currentTime: cvodeGetCurrentTime(mem)
    };
  }

  // node_modules/diff-grok/dist/src/solver-tools/cvode/cvode_class.js
  var Cvode = class {
    mem;
    neq;
    /** Output vector reused across calls (0-based, neq elements). */
    yout;
    /** Wrapped RHS stored to allow re-initialization. */
    wrappedF;
    constructor(f, neq, t0, y0, options) {
      this.neq = neq;
      this.yout = new Float64Array(neq);
      const opts = options ?? {};
      const lmmValue = opts.lmm === "adams" ? CV_ADAMS : CV_BDF;
      this.mem = cvodeCreate(lmmValue);
      this.wrappedF = (_t, _y, _ydot, _userData) => {
        f(_t, _y, _ydot);
        return 0;
      };
      cvodeInit(this.mem, this.wrappedF, t0, y0);
      const rtol = opts.rtol ?? 1e-4;
      const atol = opts.atol ?? 1e-6;
      if (typeof atol === "number")
        cvodeSStolerances(this.mem, rtol, atol);
      else
        cvodeSVtolerances(this.mem, rtol, atol);
      cvodeSetLinearSolver(this.mem);
      if (opts.jacFn) {
        const userJac = opts.jacFn;
        const wrappedJacFn = (t, y, fy, J, userData) => {
          userJac(t, y, fy, J);
          return 0;
        };
        cvodeSetJacFn(this.mem, wrappedJacFn);
      }
      if (opts.maxSteps !== void 0)
        cvodeSetMaxNumSteps(this.mem, opts.maxSteps);
      if (opts.maxOrder !== void 0)
        cvodeSetMaxOrd(this.mem, opts.maxOrder);
      if (opts.maxStep !== void 0)
        cvodeSetMaxStep(this.mem, opts.maxStep);
      if (opts.minStep !== void 0)
        cvodeSetMinStep(this.mem, opts.minStep);
      if (opts.initStep !== void 0)
        cvodeSetInitStep(this.mem, opts.initStep);
      if (opts.stopTime !== void 0)
        cvodeSetStopTime(this.mem, opts.stopTime);
      if (opts.userData !== void 0)
        cvodeSetUserData(this.mem, opts.userData);
      if (opts.rootFn && opts.nRootFns && opts.nRootFns > 0) {
        const userRoot = opts.rootFn;
        const wrappedRootFn = (t, y, gout, _userData) => {
          userRoot(t, y, gout);
          return 0;
        };
        cvodeRootInit(this.mem, opts.nRootFns, wrappedRootFn);
      }
    }
    // ==========================================================================
    // Public methods
    // ==========================================================================
    /**
     * Integrate from the current time to tout using CV_NORMAL mode
     * (integrator advances to tout and interpolates).
     *
     * @param tout - target output time
     * @returns CvodeSolveResult with { t, y, flag, rootsFound? }
     */
    solve(tout) {
      const { flag, t } = cvode(this.mem, tout, this.yout, CV_NORMAL);
      return this._buildResult(t, flag);
    }
    /**
     * Take a single internal step using CV_ONE_STEP mode.
     * The solver advances by one internal step of whatever size it chooses.
     *
     * @returns CvodeSolveResult with { t, y, flag, rootsFound? }
     */
    step() {
      const { flag, t } = cvode(this.mem, 1e30, this.yout, CV_ONE_STEP);
      return this._buildResult(t, flag);
    }
    /**
     * Dense output: compute the k-th derivative of the interpolating polynomial
     * at time t using the current Nordsieck history array.
     *
     * @param t - interpolation time (must be within the last step interval)
     * @param k - derivative order (0 = solution, 1 = first derivative, ...)
     * @returns copy of the interpolated vector (length neq)
     */
    getDky(t, k) {
      const dky = new Float64Array(this.neq);
      const flag = cvodeGetDky(this.mem, t, k, dky);
      if (flag !== 0)
        throw new Error(`[Cvode] getDky failed: t=${t} out of range or k=${k} invalid`);
      return dky;
    }
    /**
     * Return current integrator statistics.
     */
    getStats() {
      return cvodeGetIntegratorStats(this.mem);
    }
    /**
     * Re-initialize the solver for a new initial-value problem with the same
     * ODE function and options. Resets internal state and counters.
     *
     * @param t0 - new initial time
     * @param y0 - new initial conditions (length neq)
     */
    reInit(t0, y0) {
      cvodeInit(this.mem, this.wrappedF, t0, y0);
    }
    // ==========================================================================
    // Private helpers
    // ==========================================================================
    _buildResult(t, flag) {
      const y = new Float64Array(this.yout);
      const result = { t, y, flag };
      if (flag === CV_ROOT_RETURN) {
        result.rootsFound = new Int32Array(this.mem.cv_iroots);
      }
      return result;
    }
  };

  // node_modules/diff-grok/dist/src/solver-tools/cvode-method.js
  function cvode2(odes, callback) {
    const t0 = odes.arg.start;
    const t1 = odes.arg.finish;
    const step = odes.arg.step;
    const tolerance = odes.tolerance;
    const dim = odes.initial.length;
    const solver = new Cvode(odes.func, dim, t0, Float64Array.from(odes.initial), {
      lmm: "bdf",
      rtol: tolerance,
      atol: tolerance,
      maxSteps: 5e4
    });
    const base = Math.min(step, 1);
    let warmupOk = false;
    for (let k = 4; k <= 15; k++) {
      const warmupTout = t0 + base * Math.pow(10, -k);
      if (warmupTout <= t0 || warmupTout >= t1)
        continue;
      const wr = solver.solve(warmupTout);
      if (wr.flag >= 0) {
        warmupOk = true;
        break;
      }
      solver.reInit(t0, Float64Array.from(odes.initial));
    }
    if (!warmupOk)
      throw new Error(ERROR_MSG.CVODE_FAILS);
    const gridPoints = Math.trunc((t1 - t0) / step) + 1;
    const solution = new Array(dim + 1);
    for (let i = 0; i <= dim; i++)
      solution[i] = new Float64Array(gridPoints);
    solution[0][0] = t0;
    for (let j = 0; j < dim; j++)
      solution[j + 1][0] = odes.initial[j];
    for (let i = 1; i < gridPoints; i++) {
      if (callback)
        callback.onIterationStart();
      const tout = i < gridPoints - 1 ? t0 + i * step : t1;
      const result = solver.solve(tout);
      if (result.flag < 0)
        throw new Error(ERROR_MSG.CVODE_FAILS);
      solution[0][i] = result.t;
      for (let j = 0; j < dim; j++)
        solution[j + 1][i] = result.y[j];
    }
    if (callback)
      callback.onComputationsCompleted();
    return solution;
  }

  // node_modules/diff-grok/dist/src/examples/robertson.js
  var robertsonReferencePoint = new Float64Array([
    2083340149701255e-23,
    8333360770334713e-29,
    0.999999979166505
  ]);

  // node_modules/diff-grok/dist/src/examples/hires.js
  var hiresReferencePoint = new Float64Array([
    7371312573325668e-19,
    1442485726316185e-19,
    5888729740967575e-20,
    0.001175651343283149,
    0.002386356198831331,
    0.006238968252742796,
    0.002849998395185769,
    0.002850001604814231
  ]);

  // node_modules/diff-grok/dist/src/examples/vdpol.js
  var vdpolReferencePoint = new Float64Array([
    1.706167732170469,
    -8928097010248125e-19
  ]);

  // node_modules/diff-grok/dist/src/examples/orego.js
  var oregoReferencePoint = new Float64Array([
    1.000814870318523,
    1228.178521549917,
    132.0554942846706
  ]);

  // node_modules/diff-grok/dist/src/examples/e5.js
  var E53;
  (function(E54) {
    E54[E54["K1"] = 789e-12] = "K1";
    E54[E54["K2"] = 113e7] = "K2";
    E54[E54["K3"] = 11e6] = "K3";
    E54[E54["K4"] = 1130] = "K4";
  })(E53 || (E53 = {}));
  var e5ReferencePoint = new Float64Array([
    1152903278711829e-306,
    886765551764212e-37,
    8854814626268838e-38,
    0
  ]);

  // node_modules/diff-grok/dist/src/examples/pollution.js
  var POL;
  (function(POL2) {
    POL2[POL2["K1"] = 0.35] = "K1";
    POL2[POL2["K2"] = 26.6] = "K2";
    POL2[POL2["K3"] = 12300] = "K3";
    POL2[POL2["K4"] = 86e-5] = "K4";
    POL2[POL2["K5"] = 82e-5] = "K5";
    POL2[POL2["K6"] = 15e3] = "K6";
    POL2[POL2["K7"] = 13e-5] = "K7";
    POL2[POL2["K8"] = 24e3] = "K8";
    POL2[POL2["K9"] = 16500] = "K9";
    POL2[POL2["K10"] = 9e3] = "K10";
    POL2[POL2["K11"] = 0.022] = "K11";
    POL2[POL2["K12"] = 12e3] = "K12";
    POL2[POL2["K13"] = 1.88] = "K13";
    POL2[POL2["K14"] = 16300] = "K14";
    POL2[POL2["K15"] = 48e5] = "K15";
    POL2[POL2["K16"] = 35e-5] = "K16";
    POL2[POL2["K17"] = 0.0175] = "K17";
    POL2[POL2["K18"] = 1e8] = "K18";
    POL2[POL2["K19"] = 444e9] = "K19";
    POL2[POL2["K20"] = 1240] = "K20";
    POL2[POL2["K21"] = 2.1] = "K21";
    POL2[POL2["K22"] = 5.78] = "K22";
    POL2[POL2["K23"] = 0.0474] = "K23";
    POL2[POL2["K24"] = 1780] = "K24";
    POL2[POL2["K25"] = 3.12] = "K25";
  })(POL || (POL = {}));
  var pollutionReferencePoint = new Float64Array([
    0.05646255480022769,
    0.1342484130422339,
    4139734331099427e-24,
    0.005523140207484359,
    2018977262302196e-22,
    1464541863493966e-22,
    0.07784249118997964,
    0.3245075353396018,
    0.007494013383880406,
    1622293157301561e-23,
    1135863833257075e-23,
    0.002230505975721359,
    208716288279863e-18,
    1396921016840158e-20,
    0.008964884856898295,
    4352846369330103e-33,
    0.006899219696263405,
    1007803037365946e-19,
    1772146513969984e-21,
    5682943292316392e-20
  ]);

  // node_modules/diff-grok/dist/src/scripting-tools/constants.js
  var CONTROL_TAG = "#";
  var CONTROL_TAG_LEN = CONTROL_TAG.length;
  var CONTROL_EXPR;
  (function(CONTROL_EXPR2) {
    CONTROL_EXPR2["NAME"] = "#name";
    CONTROL_EXPR2["TAGS"] = "#tags";
    CONTROL_EXPR2["DESCR"] = "#description";
    CONTROL_EXPR2["DIF_EQ"] = "#equations";
    CONTROL_EXPR2["EXPR"] = "#expressions";
    CONTROL_EXPR2["ARG"] = "#argument";
    CONTROL_EXPR2["INITS"] = "#inits";
    CONTROL_EXPR2["CONSTS"] = "#constants";
    CONTROL_EXPR2["PARAMS"] = "#parameters";
    CONTROL_EXPR2["TOL"] = "#tolerance";
    CONTROL_EXPR2["LOOP"] = "#loop";
    CONTROL_EXPR2["UPDATE"] = "#update";
    CONTROL_EXPR2["RUN_ON_OPEN"] = "#meta.runOnOpen";
    CONTROL_EXPR2["RUN_ON_INPUT"] = "#meta.runOnInput";
    CONTROL_EXPR2["OUTPUT"] = "#output";
    CONTROL_EXPR2["COMMENT"] = "#comment";
    CONTROL_EXPR2["SOLVER"] = "#meta.solver";
    CONTROL_EXPR2["INPUTS"] = "#meta.inputs";
  })(CONTROL_EXPR || (CONTROL_EXPR = {}));
  var LOOP;
  (function(LOOP2) {
    LOOP2[LOOP2["MIN_LINES_COUNT"] = 1] = "MIN_LINES_COUNT";
    LOOP2[LOOP2["COUNT_IDX"] = 0] = "COUNT_IDX";
    LOOP2["COUNT_NAME"] = "_count";
    LOOP2[LOOP2["MIN_COUNT"] = 1] = "MIN_COUNT";
  })(LOOP || (LOOP = {}));
  var UPDATE;
  (function(UPDATE2) {
    UPDATE2[UPDATE2["MIN_LINES_COUNT"] = 1] = "MIN_LINES_COUNT";
    UPDATE2[UPDATE2["DURATION_IDX"] = 0] = "DURATION_IDX";
    UPDATE2["DURATION"] = "_duration";
  })(UPDATE || (UPDATE = {}));

  // node_modules/diff-grok/dist/src/scripting-tools/scripting-tools.js
  var MATH_FUNCS = ["pow", "sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "exp", "log", "sinh", "cosh", "tanh"];
  var POW_IDX = MATH_FUNCS.indexOf("pow");
  var SCRIPTING;
  (function(SCRIPTING2) {
    SCRIPTING2["ARG_NAME"] = "name";
    SCRIPTING2["COUNT"] = "count";
    SCRIPTING2["DURATION"] = "duration";
  })(SCRIPTING || (SCRIPTING = {}));
  var ERROR_LINK;
  (function(ERROR_LINK2) {
    ERROR_LINK2["MAIN_DOCS"] = "/help/compute/diff-studio";
    ERROR_LINK2["CORE_BLOCKS"] = "/help/compute/diff-studio#core-blocks";
    ERROR_LINK2["COMPS_SYNTAX"] = "/help/compute/diff-studio#model-components-and-syntax";
    ERROR_LINK2["LOOP"] = "/help/compute/diff-studio#cyclic-processes";
    ERROR_LINK2["UPDATE"] = "/help/compute/diff-studio#multistage-processes";
    ERROR_LINK2["UI_OPTS"] = "/help/compute/diff-studio#user-interface-options";
    ERROR_LINK2["LOOP_VS_UPDATE"] = "/help/compute/diff-studio#advanced-features";
    ERROR_LINK2["SOLVER_CONFIG"] = "/help/compute/diff-studio#solver-configuration";
    ERROR_LINK2["MODEL_PARAMS"] = "/help/compute/diff-studio#model-parameters";
  })(ERROR_LINK || (ERROR_LINK = {}));
  var ERROR_MSG2;
  (function(ERROR_MSG4) {
    ERROR_MSG4["CTRL_EXPR"] = 'Unsupported control expression with the tag **"#"**';
    ERROR_MSG4["ARG"] = "'The **#argument** block must consist of 3 lines specifying initial and final time, and solution grid step.";
    ERROR_MSG4["LOOP"] = "The **#loop** block must contain at least one line.";
    ERROR_MSG4["COUNT"] = "Incorrect loop count";
    ERROR_MSG4["LOOP_VS_UPDATE"] = "The **#loop** and **'#update'** blocks cannot be used simultaneously.";
    ERROR_MSG4["UPDATE_LINES_COUNT"] = "The **'#update'** block must contain at least one line.";
    ERROR_MSG4["DURATION"] = "Incorrect update duration";
    ERROR_MSG4["BRACES"] = " Missing one of the braces (**{**, **}**).";
    ERROR_MSG4["COLON"] = 'Incorrect position of **":"**.';
    ERROR_MSG4["CASE_INSENS"] = "Non-unique name (case-insensitive): use different caption for ";
    ERROR_MSG4["MISSING_INIT"] = "Correct the **#inits** block.";
    ERROR_MSG4["UNDEF_NAME"] = "Model name missing. Specify the model name in the **#name** block.";
    ERROR_MSG4["UNDEF_DEQS"] = "Differential equation(s) are required for this model. Add equation(s) under the **#equations** block.";
    ERROR_MSG4["UNDEF_INITS"] = "Initial conditions are required for this model. Add initial conditions under the **#inits** block.";
    ERROR_MSG4["UNDEF_ARG"] = "Argument specification is required for this model. Specify an argument, its range, and a grid step in the **#argument** block.";
    ERROR_MSG4["CORRECT_ARG_LIM"] = "Correct limits in the **#argument** block.";
    ERROR_MSG4["INTERVAL"] = "Incorrect range for";
    ERROR_MSG4["NEGATIVE_STEP"] = "Solution grid step must be positive. Correct the **#argument** block.";
    ERROR_MSG4["INCOR_STEP"] = "Grid step must less than the length of solution interval. Correct the **#argument** block.";
    ERROR_MSG4["MISS_COLON"] = 'Missing **":"**';
    ERROR_MSG4["NAN"] = "is not a valid number. Correct the line";
    ERROR_MSG4["SERVICE_START"] = 'Variable names must not begin with **"_"**.';
    ERROR_MSG4["REUSE_NAME"] = "Variable reuse (case-insensitive): rename ";
    ERROR_MSG4["SOLVER"] = "Incorrect solver options. Correct the **#meta.solver** line.";
  })(ERROR_MSG2 || (ERROR_MSG2 = {}));
  var ANNOT;
  (function(ANNOT2) {
    ANNOT2["NAME"] = "//name:";
    ANNOT2["DESCR"] = "//description:";
    ANNOT2["TAGS"] = "//tags:";
    ANNOT2["LANG"] = "//language: javascript";
    ANNOT2["DOUBLE_INPUT"] = "//input: double";
    ANNOT2["INT_INPUT"] = "//input: int";
    ANNOT2["OUTPUT"] = "//output: dataframe df";
    ANNOT2["EDITOR"] = "//editor: Compute:RichFunctionViewEditor";
    ANNOT2["SIDEBAR"] = "//sidebar: @compute";
    ANNOT2["CAPTION"] = "caption:";
    ANNOT2["ARG_INIT"] = "{caption: Initial; category: Argument}";
    ANNOT2["ARG_FIN"] = "{caption: Final; category: Argument}";
    ANNOT2["ARG_STEP"] = "{caption: Step; category: Argument}";
    ANNOT2["INITS"] = "category: Initial values";
    ANNOT2["PARAMS"] = "category: Parameters";
  })(ANNOT || (ANNOT = {}));
  var SCRIPT;
  (function(SCRIPT2) {
    SCRIPT2["CONSTS"] = "// constants";
    SCRIPT2["ODE_COM"] = "// the problem definition";
    SCRIPT2["ODE"] = "let odes = {";
    SCRIPT2["SOLVER_COM"] = "// solve the problem";
    SCRIPT2["SOLVER"] = "const solver = await grok.functions.eval('DiffStudio:solveEquations');";
    SCRIPT2["PREPARE"] = "let call = solver.prepare({problem: odes, options: opts});";
    SCRIPT2["CALL"] = "await call.call();";
    SCRIPT2["OUTPUT"] = "let df = call.getParamValue('df');";
    SCRIPT2["SPACE2"] = "  ";
    SCRIPT2["SPACE4"] = "    ";
    SCRIPT2["SPACE6"] = "      ";
    SCRIPT2["SPACE8"] = "        ";
    SCRIPT2["FUNC_VALS"] = "// extract function values";
    SCRIPT2["EVAL_EXPR"] = "// evaluate expressions";
    SCRIPT2["COMP_OUT"] = "// compute output";
    SCRIPT2["MATH_FUNC_COM"] = "// used Math-functions";
    SCRIPT2["MATH_CONST_COM"] = "// used Math-constants";
    SCRIPT2["ONE_STAGE_COM"] = "\n// one stage solution";
    SCRIPT2["ONE_STAGE_BEGIN"] = "let _oneStage = async (";
    SCRIPT2["ONE_STAGE_END"] = ") => {";
    SCRIPT2["ASYNC_OUTPUT"] = "let df = await _oneStage(";
    SCRIPT2["RETURN_OUTPUT"] = "return call.getParamValue('df');";
    SCRIPT2["EMPTY_OUTPUT"] = "let df = DG.DataFrame.create();";
    SCRIPT2["APPEND"] = "df.append(";
    SCRIPT2["SOLUTION_DF_COM"] = "// solution dataframe";
    SCRIPT2["LOOP_INTERVAL_COM"] = "// loop interval";
    SCRIPT2["LOOP_INTERVAL"] = "_interval";
    SCRIPT2["LAST_IDX"] = "_lastIdx";
    SCRIPT2["UPDATE_COM"] = "// update ";
    SCRIPT2["CUSTOM_OUTPUT_COM"] = "// create custom output";
    SCRIPT2["CUSTOM_COLUMNS"] = "let _columns = [";
    SCRIPT2["ONE_STAGE"] = "await _oneStage(";
    SCRIPT2["SEGMENT_COM"] = "// add segment category";
  })(SCRIPT || (SCRIPT = {}));

  // node_modules/diff-grok/dist/src/pipeline/constants.js
  var ARG;
  (function(ARG2) {
    ARG2["START"] = "_t0";
    ARG2["FINISH"] = "_t1";
    ARG2["STEP"] = "_h";
  })(ARG || (ARG = {}));
  var argName2IdxMap = /* @__PURE__ */ new Map([
    [ARG.START, 0],
    [ARG.FINISH, 1],
    [ARG.STEP, 2]
  ]);

  // node_modules/diff-grok/dist/src/latex-export/transformer/identifier.js
  var GREEK_LOWER = [
    ["varepsilon", "\\varepsilon"],
    ["varsigma", "\\varsigma"],
    ["vartheta", "\\vartheta"],
    ["epsilon", "\\epsilon"],
    ["omicron", "o"],
    ["upsilon", "\\upsilon"],
    ["lambda", "\\lambda"],
    ["varphi", "\\varphi"],
    ["varrho", "\\varrho"],
    ["alpha", "\\alpha"],
    ["delta", "\\delta"],
    ["gamma", "\\gamma"],
    ["kappa", "\\kappa"],
    ["omega", "\\omega"],
    ["sigma", "\\sigma"],
    ["theta", "\\theta"],
    ["beta", "\\beta"],
    ["iota", "\\iota"],
    ["zeta", "\\zeta"],
    ["chi", "\\chi"],
    ["eta", "\\eta"],
    ["phi", "\\phi"],
    ["psi", "\\psi"],
    ["rho", "\\rho"],
    ["tau", "\\tau"],
    ["mu", "\\mu"],
    ["nu", "\\nu"],
    ["pi", "\\pi"],
    ["xi", "\\xi"]
  ];
  var GREEK_UPPER = [
    ["Epsilon", "\\mathrm{E}"],
    ["Omicron", "\\mathrm{O}"],
    ["Upsilon", "\\Upsilon"],
    ["Lambda", "\\Lambda"],
    ["Kappa", "\\mathrm{K}"],
    ["Sigma", "\\Sigma"],
    ["Theta", "\\Theta"],
    ["Omega", "\\Omega"],
    ["Alpha", "\\mathrm{A}"],
    ["Delta", "\\Delta"],
    ["Gamma", "\\Gamma"],
    ["Beta", "\\mathrm{B}"],
    ["Zeta", "\\mathrm{Z}"],
    ["Iota", "\\mathrm{I}"],
    ["Eta", "\\mathrm{H}"],
    ["Chi", "\\mathrm{X}"],
    ["Mu", "\\mathrm{M}"],
    ["Nu", "\\mathrm{N}"],
    ["Phi", "\\Phi"],
    ["Psi", "\\Psi"],
    ["Rho", "\\mathrm{P}"],
    ["Tau", "\\mathrm{T}"],
    ["Pi", "\\Pi"],
    ["Xi", "\\Xi"]
  ];
  var ALL_GREEK = [...GREEK_LOWER, ...GREEK_UPPER].sort((a, b) => b[0].length - a[0].length);
  var GREEK_MAP = new Map(ALL_GREEK);

  // dynamics.ts
  function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function getVal(t, u_, dt_, endopt = 0) {
    const nRows = u_.length;
    const nCh = u_[0].length;
    const i0 = Math.floor(t / dt_);
    if (i0 + 2 > nRows) {
      if (endopt === 0) return new Array(nCh).fill(0);
      return u_[nRows - 1].slice();
    }
    const u1 = u_[i0];
    const u2 = u_[i0 + 1];
    const dt = t - i0 * dt_;
    const frac = dt / dt_;
    return u1.map((v, k) => (1 - frac) * v + frac * u2[k]);
  }
  function getValScalar(t, u_, dt_, endopt = 0) {
    const nRows = u_.length;
    const i0 = Math.floor(t / dt_);
    if (i0 + 2 > nRows) {
      if (endopt === 0) return 0;
      return u_[nRows - 1];
    }
    const frac = (t - i0 * dt_) / dt_;
    return (1 - frac) * u_[i0] + frac * u_[i0 + 1];
  }
  function unwrap(p) {
    const out = p.slice();
    for (let i = 1; i < out.length; i++) {
      let d = out[i] - out[i - 1];
      while (d > Math.PI) {
        out[i] -= 2 * Math.PI;
        d = out[i] - out[i - 1];
      }
      while (d < -Math.PI) {
        out[i] += 2 * Math.PI;
        d = out[i] - out[i - 1];
      }
    }
    return out;
  }
  function getPhiFromU(u_, phi0, _dt_, algflag = 1) {
    if (algflag !== 1) throw new Error("getPhiFromU: only algflag=1 is ported");
    const n = u_.length;
    const Phi = new Array(n);
    for (let i = 0; i < n; i++) Phi[i] = Math.atan2(u_[i][1], u_[i][0]);
    const inputTol = 1e-8;
    if (Math.hypot(u_[0][0], u_[0][1]) < inputTol) Phi[0] = phi0;
    for (let i = 1; i < n; i++) {
      if (Math.hypot(u_[i][0], u_[i][1]) < inputTol) Phi[i] = Phi[i - 1];
    }
    return Phi;
  }
  function smoothstep(x, m, w, c) {
    if (m <= 0 || w <= 0 || c <= 0) throw new Error("smoothstep: require m > 0, w > 0, c > 0");
    const x0 = c / m - w / 2;
    const x1 = x0 + w;
    if (x0 <= 0) throw new Error(`smoothstep: require w < 2*c/m (got w = ${w})`);
    const alpha = m * w / 2;
    const beta = c - m * w / 2;
    const gbase = (t) => {
      const t2 = t * t;
      const t3 = t2 * t;
      const t4 = t2 * t2;
      const t5 = t4 * t;
      return [
        2 * t - 5 * t4 + 6 * t5 - 2 * t3 * t3,
        2 - 20 * t3 + 30 * t4 - 12 * t5
      ];
    };
    if (x <= -x1) return [-c, 0];
    if (x >= x1) return [c, 0];
    if (x > -x0 && x < x0) return [m * x, m];
    if (x >= x0) {
      const [g2, gp2] = gbase((x - x0) / w);
      return [alpha * g2 + beta, m / 2 * gp2];
    }
    const [g, gp] = gbase((-x - x0) / w);
    return [-(alpha * g + beta), m / 2 * gp];
  }
  function nonlinForceBw(u, dispScale = 6, feScale = 2, a1 = 1, b1 = 1) {
    const E_mu = 33e6;
    const OD = 2.25;
    const ID = 1.13;
    const h = 0.075;
    const t = 0.073;
    const R = OD / ID;
    const a = OD / 2;
    const M = 6 / Math.PI / Math.log(R) * ((R - 1) ** 2 / R ** 2);
    const one = (ui) => {
      const uu = ui / dispScale;
      return feScale * E_mu * uu * (a1 * (h - uu) * (h - uu / 2) * t + b1 * t ** 3) / (M * a ** 2);
    };
    return typeof u === "number" ? one(u) : u.map(one);
  }
  function bellevillemodel(f_, x_, v_, mu = 0.06, Kh = 13e3, No = 3) {
    const F_e = nonlinForceBw(x_);
    return Kh * (1 - Math.abs(f_ / mu / (f_ + Math.max(F_e, 1e-4))) ** No * ((1 + sign(v_ * f_)) / 2)) * v_;
  }
  function rockingDynamics(t, x, ctx, xdotOut) {
    const nBW = ctx.xBW0x.length;
    const thet = x[0];
    const thetd = x[1];
    const u = getVal(t, ctx.uaccel, ctx.dtaccel, 0);
    const phi = getValScalar(t, ctx.phi_, ctx.dtaccel, 1);
    const phidot = getValScalar(t, ctx.phidot_, ctx.dtaccel, 1);
    const [sgnt, sgntp] = ctx.ssign(thet);
    const st = Math.sin(thet);
    const ct = Math.cos(thet);
    const tau0 = -Math.sin(phi);
    const tau1 = Math.cos(phi);
    const taup0 = -Math.cos(phi);
    const taup1 = -Math.sin(phi);
    const xtilde = new Array(nBW);
    const taupDot = new Array(nBW);
    for (let j = 0; j < nBW; j++) {
      const bx = ctx.xBW0x[j];
      const by = ctx.xBW0y[j];
      xtilde[j] = taup0 * bx + taup1 * by + ctx.r0 * sgnt;
      taupDot[j] = tau0 * bx + tau1 * by;
    }
    const delt = xtilde.map((v) => ctx.delt0 + v * st);
    const deltd = xtilde.map(
      (v, j) => (v * ct + ctx.r0 * sgntp * st) * thetd - taupDot[j] * st * phidot
    );
    const fBW = delt.map((d, j) => nonlinForceBw(d) + x[2 + j]);
    const Itt = ctx.II + ctx.m * (ctx.r0 * sgnt) ** 2;
    let xtildeF = 0;
    for (let j = 0; j < nBW; j++) xtildeF += xtilde[j] * fBW[j];
    const rhs = -ctx.m * ctx.r0 ** 2 * sgnt * sgntp * thetd ** 2 - ctx.c * (1 - sgnt ** 2) * thetd - xtildeF - ctx.m * ctx.h * (taup0 * u[0] + taup1 * u[1]) + ctx.m * u[2] * ctx.r0 * sgnt;
    const xdot = xdotOut ?? new Array(2 + nBW);
    xdot[0] = thetd;
    xdot[1] = rhs / Itt;
    for (let j = 0; j < nBW; j++) xdot[2 + j] = bellevillemodel(x[2 + j], delt[j], deltd[j]);
    return { xdot, phi, delt, deltd };
  }

  // bidirectional.ts
  function runBidirectional(params = {}) {
    const grav = 386.4;
    const dt_ = 1e-3;
    const tEnd = params.tEnd ?? 10;
    const tSim = tEnd + 1;
    const ax = params.ax ?? ((t) => 2 * Math.sin(2 * Math.PI * 1 * t));
    const ay = params.ay ?? ((t) => 2 * Math.sin(2 * Math.PI * 2 * t));
    const az = params.az; // optional vertical excitation (g); u[2] = az*grav - grav
    const nExc = Math.round(tEnd / dt_) + 1;
    const t_ = new Array(nExc);
    const u_ = new Array(nExc);
    for (let i = 0; i < nExc; i++) {
      const t = i * dt_;
      t_[i] = t;
      u_[i] = [ax(t) * grav, ay(t) * grav, az ? az(t) * grav - grav : -grav];
    }
    const Phi_ = getPhiFromU(u_, 0, dt_, 1);
    const PhiU = unwrap(Phi_);
    const Phidot_ = new Array(nExc);
    for (let i = 0; i < nExc - 1; i++) Phidot_[i] = (PhiU[i + 1] - PhiU[i]) / dt_;
    Phidot_[nExc - 1] = 0;
    Phidot_[0] = 0;
    const ssign = (thet) => smoothstep(thet, 1e5, 1e-5, 1);
    const delt0 = 0.03;
    const BWfe = (u) => nonlinForceBw(u);
    const preloadTask = {
      name: "bw_preload",
      arg: { name: "t", start: 0, finish: 1, step: 1e-3 },
      initial: [0],
      tolerance: 1e-9,
      solutionColNames: ["f"],
      func: (_t, y, out) => {
        out[0] = bellevillemodel(y[0], Math.min(delt0 * _t, 1), _t <= 1 ? delt0 : 0);
      }
    };
    const preload = rkdp(preloadTask);
    const fh0 = preload[1][preload[1].length - 1];
    const fBWpreload = fh0 + nonlinForceBw(delt0);
    const mass = (params.mass ?? 1e3) / grav;
    const II = 4e3;
    const r0 = params.r0 ?? 12;
    const hCM = params.hCM ?? 40;
    const cdamp = 1e6;
    const r1 = 10.5;
    const nBW = 12;
    const xBW0x = new Array(nBW);
    const xBW0y = new Array(nBW);
    for (let j = 0; j < nBW; j++) {
      const a = j * 2 * Math.PI / nBW;
      xBW0x[j] = r1 * Math.cos(a);
      xBW0y[j] = r1 * Math.sin(a);
    }
    const ctx = {
      uaccel: u_,
      phi_: Phi_,
      phidot_: Phidot_,
      dtaccel: dt_,
      ssign,
      m: mass,
      II,
      r0,
      h: hCM,
      c: cdamp,
      xBW0x,
      xBW0y,
      delt0
    };
    const x0 = new Array(2 + nBW).fill(0);
    for (let j = 0; j < nBW; j++) x0[2 + j] = fh0;
    const tolerance = params.tolerance ?? 1e-8;
    const solve = params.solver === "cvode" ? cvode2 : lsoda2;
    const t0 = performance.now();
    const sol = solve({
      name: "bidirectional",
      arg: { name: "t", start: 0, finish: tSim, step: dt_ },
      initial: x0,
      tolerance,
      solutionColNames: ["theta", "thetad", ...Array.from({ length: nBW }, (_, j) => `fh${j + 1}`)],
      func: (t, y, out) => {
        const r = rockingDynamics(t, y, ctx, out);
        if (out !== r.xdot) for (let k = 0; k < out.length; k++) out[k] = r.xdot[k];
      }
    });
    const solverMs = performance.now() - t0;
    const T = Array.from(sol[0]);
    const m2 = (col) => Array.from(col);
    const X = T.map((_t, i) => Array.from({ length: 2 + nBW }, (_v, k) => sol[1 + k][i]));
    const Phi = new Array(T.length);
    const Delt = new Array(T.length);
    const Deltd = new Array(T.length);
    const fBWh = new Array(T.length);
    const fBWtotal = new Array(T.length);
    for (let i = 0; i < T.length; i++) {
      const r = rockingDynamics(T[i], X[i], ctx);
      Phi[i] = r.phi;
      Delt[i] = r.delt;
      Deltd[i] = r.deltd;
      fBWh[i] = Array.from({ length: nBW }, (_v, j) => X[i][2 + j]);
      fBWtotal[i] = r.delt.map((d, j) => nonlinForceBw(d) + X[i][2 + j]);
    }
    void getValScalar;
    return { T, X, fBWh, fBWtotal, Phi, Delt, Deltd, u_, fh0, fBWpreload, solverMs };
  }

  // animate-rigid-body.ts
  var DEG = Math.PI / 180;
  function rotMatrix(phi, theta) {
    const sp = Math.sin(phi), cp = Math.cos(phi);
    const st = Math.sin(theta), ct = Math.cos(theta);
    const h = [0, 0, cp, 0, 0, sp, -cp, -sp, 0];
    const h2 = [
      h[0] * h[0] + h[1] * h[3] + h[2] * h[6],
      h[0] * h[1] + h[1] * h[4] + h[2] * h[7],
      h[0] * h[2] + h[1] * h[5] + h[2] * h[8],
      h[3] * h[0] + h[4] * h[3] + h[5] * h[6],
      h[3] * h[1] + h[4] * h[4] + h[5] * h[7],
      h[3] * h[2] + h[4] * h[5] + h[5] * h[8],
      h[6] * h[0] + h[7] * h[3] + h[8] * h[6],
      h[6] * h[1] + h[7] * h[4] + h[8] * h[7],
      h[6] * h[2] + h[7] * h[5] + h[8] * h[8]
    ];
    return [
      1 + st * h[0] + (1 - ct) * h2[0],
      st * h[1] + (1 - ct) * h2[1],
      st * h[2] + (1 - ct) * h2[2],
      st * h[3] + (1 - ct) * h2[3],
      1 + st * h[4] + (1 - ct) * h2[4],
      st * h[5] + (1 - ct) * h2[5],
      st * h[6] + (1 - ct) * h2[6],
      st * h[7] + (1 - ct) * h2[7],
      1 + st * h[8] + (1 - ct) * h2[8]
    ];
  }
  function applyR(R, v) {
    return [
      R[0] * v[0] + R[1] * v[1] + R[2] * v[2],
      R[3] * v[0] + R[4] * v[1] + R[5] * v[2],
      R[6] * v[0] + R[7] * v[1] + R[8] * v[2]
    ];
  }
  function createBushingAnimator(canvas2, data, opts) {
    const ctx = canvas2.getContext("2d");
    const W = canvas2.width, Hh = canvas2.height;
    const { geom } = opts;
    const N = 40;
    const H = opts.stackFreeLength;
    // The body flange is at z = 0. Springs hang down from a fixed ceiling
    // at z = H, matching the inverted side-view representation in MinAccel.
    const cyls = [
      { r: geom.d1 / 2, z0: -geom.h1, z1: 0, color: "rgba(217, 84, 26, 0.35)" },
      { r: geom.d2 / 2, z0: 0, z1: geom.h2, color: "rgba(0, 115, 189, 0.35)" },
      { r: geom.d3 / 2, z0: geom.h2, z1: geom.h2 + geom.h3, color: "rgba(120, 171, 48, 0.35)" }
    ];
    const ang = [];
    for (let j = 0; j < opts.nStacks; j++) ang.push(j * 2 * Math.PI / opts.nStacks);
    const triadLen = 0.6 * Math.max(geom.d1, geom.d2, geom.d3);
    let az = -37.5 * DEG, el = 30 * DEG, zoom = 1.5;
    let cX = 0, cY = 0, cZ = 0, bR = 1;
    {
      let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
      const bump = (p) => {
        for (let k = 0; k < 3; k++) {
          if (p[k] < lo[k]) lo[k] = p[k];
          if (p[k] > hi[k]) hi[k] = p[k];
        }
      };
      for (let i = 0; i < data.t.length; i += 10) {
        const pts = framePoints(i);
        for (const p of pts) bump(p);
      }
      cX = (lo[0] + hi[0]) / 2;
      cY = (lo[1] + hi[1]) / 2;
      cZ = (lo[2] + hi[2]) / 2;
      bR = 0.5 * Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) * 1.08 || 1;
    }
    function framePoints(i) {
      const phi = data.phi[i], theta = data.theta[i];
      const s = opts.ssign(theta);
      const r = [geom.r0 * s * Math.cos(phi), geom.r0 * s * Math.sin(phi), 0];
      const R = rotMatrix(phi, opts.thetaGain * theta);
      const xf = (p) => {
        const d = [p[0] - r[0], p[1] - r[1], p[2] - r[2]];
        const w = applyR(R, d);
        return [r[0] + w[0], r[1] + w[1], r[2] + w[2]];
      };
      const pts = [];
      for (const c of cyls) {
        for (let j = 0; j <= N; j += 4) {
          const a = j * 2 * Math.PI / N;
          pts.push(xf([c.r * Math.cos(a), c.r * Math.sin(a), c.z0]));
          pts.push(xf([c.r * Math.cos(a), c.r * Math.sin(a), c.z1]));
        }
      }
      for (const a of ang) {
        const x = opts.stackRadius * Math.cos(a), y = opts.stackRadius * Math.sin(a);
        pts.push([x, y, H]);
        pts.push(xf([x, y, 0]));
      }
      return pts;
    }
    let frame = 0, playing = true, speed = 1, acc = 0, last;
    const frameDt = globalThis.simulatorFrameDt(data, opts.fps ?? 50);
    let raf = 0;
    function renderFrame(i) {
      const phi = data.phi[i], theta = data.theta[i];
      const s = opts.ssign(theta);
      const tv = opts.thetaGain * theta;
      const r = [geom.r0 * s * Math.cos(phi), geom.r0 * s * Math.sin(phi), 0];
      const R = rotMatrix(phi, tv);
      const xf = (p) => {
        const d = [p[0] - r[0], p[1] - r[1], p[2] - r[2]];
        const w = applyR(R, d);
        return [r[0] + w[0], r[1] + w[1], r[2] + w[2]];
      };
      const ce = Math.cos(el), se = Math.sin(el), ca = Math.cos(az), sa = Math.sin(az);
      const right = [ca, sa, 0];
      const fwd = [-ce * sa, ce * ca, -se];
      const up = [-sa * se, ca * se, ce];
      const scale = Math.min(W, Hh) / (2 * bR) * zoom;
      const proj = (p) => {
        const q = [p[0] - cX, p[1] - cY, p[2] - cZ];
        return [
          W / 2 + (q[0] * right[0] + q[1] * right[1] + q[2] * right[2]) * scale,
          Hh / 2 - (q[0] * up[0] + q[1] * up[1] + q[2] * up[2]) * scale,
          q[0] * fwd[0] + q[1] * fwd[1] + q[2] * fwd[2]
        ];
      };
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, Hh);
      const prims = [];
      for (const c of cyls) {
        const ring = [];
        for (let j = 0; j <= N; j++) {
          const a = j * 2 * Math.PI / N;
          ring.push([
            proj(xf([c.r * Math.cos(a), c.r * Math.sin(a), c.z0])),
            proj(xf([c.r * Math.cos(a), c.r * Math.sin(a), c.z1]))
          ]);
        }
        for (let j = 0; j < N; j++) {
          const [b0, t0] = ring[j], [b1, t1] = ring[j + 1];
          const depth = (b0[2] + t0[2] + b1[2] + t1[2]) / 4;
          prims.push({
            depth,
            draw: () => {
              ctx.beginPath();
              ctx.moveTo(b0[0], b0[1]);
              ctx.lineTo(b1[0], b1[1]);
              ctx.lineTo(t1[0], t1[1]);
              ctx.lineTo(t0[0], t0[1]);
              ctx.closePath();
              ctx.fillStyle = c.color;
              ctx.fill();
            }
          });
        }
      }
      for (let j = 0; j < opts.nStacks; j++) {
        const a = ang[j];
        // Fixed ceiling endpoint first; the lower endpoint follows the
        // flange as the body rocks.
        const g = proj([opts.stackRadius * Math.cos(a), opts.stackRadius * Math.sin(a), H]);
        const p = proj(xf([opts.stackRadius * Math.cos(a), opts.stackRadius * Math.sin(a), 0]));
        const depth = (g[2] + p[2]) / 2;
        prims.push({
          depth,
          draw: () => {
            const dx = p[0] - g[0], dy = p[1] - g[1];
            const len = Math.hypot(dx, dy) || 1;
            const coils = 9, amp = Math.min(0.13 * len, 6);
            const nx = -dy / len, ny = dx / len;
            ctx.beginPath();
            ctx.moveTo(g[0], g[1]);
            for (let k = 1; k <= coils; k++) {
              const fr = k / (coils + 1), sg = k % 2 === 1 ? 1 : -1;
              ctx.lineTo(g[0] + dx * fr + nx * amp * sg, g[1] + dy * fr + ny * amp * sg);
            }
            ctx.lineTo(p[0], p[1]);
            ctx.strokeStyle = "#555555";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#333333";
            ctx.beginPath();
            ctx.arc(g[0], g[1], 2.6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p[0], p[1], 2.2, 0, 2 * Math.PI);
            ctx.fill();
            const lbl = proj([
              opts.stackRadius * 1.3 * Math.cos(a),
              opts.stackRadius * 1.3 * Math.sin(a),
              -2
            ]);
            ctx.fillStyle = "#111111";
            ctx.font = "11px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(j + 1), lbl[0], lbl[1] + 4);
          }
        });
      }
      prims.sort((a, b) => b.depth - a.depth);
      for (const p of prims) p.draw();
      const rp = proj([r[0], r[1], 0]);
      ctx.beginPath();
      ctx.arc(rp[0], rp[1], 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#dd2222";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.stroke();
      const ob = xf([0, 0, 0]);
      const axes = [
        [[1, 0, 0], "#cc2222"],
        [[0, 1, 0], "#22aa22"],
        [[0, 0, 1], "#2255cc"]
      ];
      for (const [e, col] of axes) {
        const w = applyR(R, [e[0] * triadLen, e[1] * triadLen, e[2] * triadLen]);
        const tip = proj([ob[0] + w[0], ob[1] + w[1], ob[2] + w[2]]);
        const base = proj(ob);
        ctx.beginPath();
        ctx.moveTo(base[0], base[1]);
        ctx.lineTo(tip[0], tip[1]);
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 2.4, 0, 2 * Math.PI);
        ctx.fillStyle = col;
        ctx.fill();
      }
      ctx.fillStyle = "#111111";
      ctx.font = "13px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(
        `t = ${data.t[i].toFixed(2)} s   (\u03C6 = ${(phi / Math.PI * 180).toFixed(1)}\xB0,  \u03B8 = ${(theta / Math.PI * 180).toFixed(3)}\xB0)`,
        12,
        20
      );
    }
    function tick(now) {
      if (last !== void 0 && playing) {
        acc += (now - last) / 1e3 * speed;
        while (acc >= frameDt) {
          acc -= frameDt;
          frame = (frame + 1) % data.t.length;
        }
      }
      last = now;
      renderFrame(frame);
      opts.onUpdate?.(frame);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    let dragging = false, lx = 0, ly = 0;
    canvas2.addEventListener("pointerdown", (e) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      canvas2.setPointerCapture(e.pointerId);
    });
    canvas2.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      az -= (e.clientX - lx) * 0.01;
      el = Math.min(89 * DEG, Math.max(-89 * DEG, el + (e.clientY - ly) * 0.01));
      lx = e.clientX;
      ly = e.clientY;
    });
    canvas2.addEventListener("pointerup", () => {
      dragging = false;
    });
    canvas2.addEventListener("wheel", (e) => {
      e.preventDefault();
      zoom = Math.min(10, Math.max(0.2, zoom * Math.exp(-e.deltaY * 1e-3)));
    }, { passive: false });
    return {
      play() {
        playing = true;
      },
      pause() {
        playing = false;
      },
      toggle() {
        playing = !playing;
        return playing;
      },
      seek(i) {
        frame = Math.max(0, Math.min(data.t.length - 1, i));
        acc = 0;
      },
      setSpeed(v) {
        speed = v;
      },
      resetView() {
        az = -37.5 * DEG;
        el = 30 * DEG;
        zoom = 1.5;
      },
      get isPlaying() {
        return playing;
      },
      get frame() {
        return frame;
      },
      destroy() {
        cancelAnimationFrame(raf);
      }
    };
  }


  function buildPlot(spec) {
    const W = spec.width ?? 430;
    const Hh = spec.height ?? 270;
    const hasLegend = spec.series.some((ser) => ser.label);
    const L = 72, R = 12, T = hasLegend ? 48 : 38, B = hasLegend ? 50 : 44;
    const xs = spec.series.flatMap((s2) => s2.pts.map((p) => p[0]));
    const ys = spec.series.flatMap((s2) => s2.pts.map((p) => p[1]));
    let x0 = Math.min(...xs), x1 = Math.max(...xs);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    x0 -= (x1 - x0) * 0.02 || 0.5;
    x1 += (x1 - x0) * 0.02 || 0.5;
    y0 -= (y1 - y0) * 0.05 || 0.5;
    y1 += (y1 - y0) * 0.05 || 0.5;
    if (spec.equal) {
      const sx = W - L - R, sy = Hh - T - B;
      const r = Math.max((x1 - x0) / sx, (y1 - y0) / sy);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      x0 = cx - r * sx / 2;
      x1 = cx + r * sx / 2;
      y0 = cy - r * sy / 2;
      y1 = cy + r * sy / 2;
    }
    const px = (v) => L + (v - x0) / (x1 - x0) * (W - L - R);
    const py = (v) => Hh - B - (v - y0) / (y1 - y0) * (Hh - T - B);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" font-family="Segoe UI, sans-serif">`;
    s += `<rect width="${W}" height="${Hh}" fill="white"/>`;
    s += `<text x="${L}" y="${T - 14}" font-size="17" font-weight="600" fill="#111">${spec.title}</text>`;
    const labeled = spec.series.filter((ser) => ser.label);
    if (labeled.length > 0) {
      const entryW = labeled.map((ser) => 14 + 4 + ser.label.length * 6.2);
      const total = entryW.reduce((a, b) => a + b + 10, 0) - 10;
      let lx = W - R - total;
      labeled.forEach((ser, k) => {
        s += `<line x1="${lx}" y1="${T - 16}" x2="${lx + 14}" y2="${T - 16}" stroke="${ser.color}" stroke-width="2"/>`;
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
      for (const p of ser.pts) d += `${px(p[0]).toFixed(2)},${py(p[1]).toFixed(2)} `;
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
    s += `<text x="15" y="${(T + Hh - B) / 2}" font-size="14" text-anchor="middle" fill="#111" transform="rotate(-90 15 ${(T + Hh - B) / 2})">${spec.ylabel}</text>`;
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
          let lo = 0, hi = n - 1;
          while (hi - lo > 1) {
            const mid = lo + hi >> 1;
            if (pts[mid][0] <= tc) lo = mid;
            else hi = mid;
          }
          const [xa, ya] = pts[lo], [xb, yb] = pts[hi];
          const f = (tc - xa) / (xb - xa || 1);
          setDot(c.id, tc, ya + f * (yb - ya), c.label);
        }
      },
      /** position a marker dot in data coordinates */
      setMarker(id, x, y) {
        const m = (spec.markers ?? []).find((mk) => mk.id === id);
        setDot(id, x, y, m?.label);
      }
    };
  }

  // validate/animate-src.ts
  var statusEl = document.getElementById("anim-status");
  var canvas = document.getElementById("anim-canvas");
  var playBtn = document.getElementById("anim-play");
  var speedSel = document.getElementById("anim-speed");
  var slider = document.getElementById("anim-slider");
  var resetBtn = document.getElementById("anim-reset");
  statusEl.textContent = "Running simulation (diff-grok LSODA, ~2 s)\u2026";
  setTimeout(() => {
    const res = runBidirectional({ mass: 1e3, r0: 12, hCM: 40, tEnd: 10, solver: "lsoda", tolerance: 1e-8 });
    const stride = 10;
    const data = {
      t: res.T.filter((_, i) => i % stride === 0),
      phi: res.Phi.filter((_, i) => i % stride === 0),
      theta: res.X.map((r) => r[0]).filter((_, i) => i % stride === 0)
    };
    const T = res.T;
    const theta = res.X.map((r) => r[0]);
    const FW1 = res.fBWtotal.map((r) => r[0]);
    const FW7 = res.fBWtotal.map((r) => r[6]);
    const ds = (pts) => {
      const st = Math.max(1, Math.ceil(pts.length / 2e3));
      const out = [];
      for (let i = 0; i < pts.length; i += st) out.push(pts[i]);
      const last = pts[pts.length - 1];
      if (out[out.length - 1] !== last) out.push(last);
      return out;
    };
    const thetaPlot = buildPlot({
      title: "Rotation \u03B8(t)",
      xlabel: "Time (s)",
      ylabel: "\u03B8 (rad)",
      cursors: [{ id: "cur-theta", seriesIndex: 0 }],
      series: [{ pts: ds(T.map((t, i) => [t, theta[i]])), color: "#0072BD" }]
    });
    const phiPlot = buildPlot({
      title: "Tipping point \u03C6(t)",
      xlabel: "Time (s)",
      ylabel: "\u03C6 (rad)",
      cursors: [{ id: "cur-phi", seriesIndex: 0 }],
      series: [{ pts: ds(T.map((t, i) => [t, res.Phi[i]])), color: "#0072BD" }]
    });
    const forcePlot = buildPlot({
      title: "BW stack force",
      xlabel: "Time (s)",
      ylabel: "Force (lb)",
      cursors: [
        { id: "cur-force-1", seriesIndex: 0, color: "#0072BD", label: "1" },
        { id: "cur-force-7", seriesIndex: 1, color: "#D95319", label: "7" }
      ],
      series: [
        { pts: ds(T.map((t, i) => [t, FW1[i]])), color: "#0072BD", label: "stack 1" },
        { pts: ds(T.map((t, i) => [t, FW7[i]])), color: "#D95319", label: "stack 7" }
      ]
    });
    const hystPlot = buildPlot({
      title: "BW hysteresis (stacks 1 & 7)",
      xlabel: "BW deformation (in)",
      ylabel: "Force (lb)",
      markers: [
        { id: "mk-hyst-1", color: "#0072BD", label: "1" },
        { id: "mk-hyst-7", color: "#D95319", label: "7" }
      ],
      series: [
        { pts: ds(res.Delt.map((r, i) => [r[0], FW1[i]])), color: "#0072BD", label: "stack 1" },
        { pts: ds(res.Delt.map((r, i) => [r[6], FW7[i]])), color: "#D95319", label: "stack 7" }
      ]
    });
    const axPlot = buildPlot({
      title: "Base accel ax(t)",
      xlabel: "Time (s)",
      ylabel: "ax (g)",
      width: 430,
      height: 270,
      cursors: [{ id: "cur-ax", seriesIndex: 0 }],
      series: [{ pts: ds(res.u_.map((r, i) => [i * 1e-3, r[0] / 386.4])), color: "#0072BD" }]
    });
    const ayPlot = buildPlot({
      title: "Base accel ay(t)",
      xlabel: "Time (s)",
      ylabel: "ay (g)",
      width: 430,
      height: 270,
      cursors: [{ id: "cur-ay", seriesIndex: 0 }],
      series: [{ pts: ds(res.u_.map((r, i) => [i * 1e-3, r[1] / 386.4])), color: "#D95319" }]
    });
    const orbitPlot = buildPlot({
      title: "Excitation orbit ay vs ax",
      xlabel: "ax (g)",
      ylabel: "ay (g)",
      width: 430,
      height: 400,
      equal: true,
      markers: [{ id: "mk-orbit", color: "#dc2626" }],
      series: [{ pts: ds(res.u_.map((r) => [r[0] / 386.4, r[1] / 386.4])), color: "#0072BD" }]
    });
    document.getElementById("plot-ax").innerHTML = axPlot.svg;
    document.getElementById("plot-ay").innerHTML = ayPlot.svg;
    document.getElementById("plot-orbit").innerHTML = orbitPlot.svg;
    document.getElementById("plot-theta").innerHTML = thetaPlot.svg;
    document.getElementById("plot-phi").innerHTML = phiPlot.svg;
    document.getElementById("plot-force").innerHTML = forcePlot.svg;
    document.getElementById("plot-hyst").innerHTML = hystPlot.svg;
    for (const [btnId, panelId] of [
      ["tab-disp", "panel-disp"],
      ["tab-force", "panel-force"]
    ]) {
      document.getElementById(btnId).addEventListener("click", () => {
        document.querySelectorAll("#output-tabs .tab").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".outputcol .panelrow").forEach((p) => p.classList.remove("active"));
        document.getElementById(btnId).classList.add("active");
        document.getElementById(panelId).classList.add("active");
      });
    }
    for (const [btnId, panelId] of [
      ["tab-timehist", "panel-timehist"],
      ["tab-orbit-input", "panel-orbit-input"]
    ]) {
      document.getElementById(btnId).addEventListener("click", () => {
        document.querySelectorAll("#input-tabs .tab").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".inputcol .panelrow").forEach((p) => p.classList.remove("active"));
        document.getElementById(btnId).classList.add("active");
        document.getElementById(panelId).classList.add("active");
      });
    }
    const ssign = (th) => smoothstep(th, 1e5, 1e-5, 1)[0];
    const animator = createBushingAnimator(canvas, data, {
      geom: { h1: 24, d1: 12, h2: 1, d2: 24, h3: 72, d3: 16, r0: 12 },
      ssign,
      thetaGain: 50,
      // visual exaggeration, as in the MATLAB example call
      stackRadius: 10.5,
      nStacks: 12,
      stackFreeLength: 5,
      // 50% of the original 10
      fps: 50,
      onUpdate: (frame) => {
        slider.value = String(frame);
        const tNow = data.t[frame];
        const fi = Math.min(frame * stride, T.length - 1);
        const ui = Math.min(fi, res.u_.length - 1);
        axPlot.setCursor(tNow);
        ayPlot.setCursor(tNow);
        orbitPlot.setMarker("mk-orbit", res.u_[ui][0] / 386.4, res.u_[ui][1] / 386.4);
        thetaPlot.setCursor(tNow);
        phiPlot.setCursor(tNow);
        forcePlot.setCursor(tNow);
        hystPlot.setMarker("mk-hyst-1", res.Delt[fi][0], FW1[fi]);
        hystPlot.setMarker("mk-hyst-7", res.Delt[fi][6], FW7[fi]);
        if (!animator.isPlaying) renderSlider();
      }
    });
    function renderSlider() {
      slider.value = String(animator.frame);
    }
    playBtn.textContent = "Pause";
    playBtn.addEventListener("click", () => {
      playBtn.textContent = animator.toggle() ? "Pause" : "Play";
    });
    speedSel.addEventListener("change", () => animator.setSpeed(parseFloat(speedSel.value)));
    slider.max = String(data.t.length - 1);
    slider.addEventListener("input", () => {
      animator.pause();
      playBtn.textContent = "Play";
      animator.seek(parseInt(slider.value, 10));
    });
    resetBtn.addEventListener("click", () => animator.resetView());
    const shownFps = data.t.length > 1 ? 1 / (data.t[1] - data.t[0]) : 50;
    statusEl.textContent = `${data.t.length} frames @ ${shownFps.toFixed(1)} fps \u2014 drag to orbit, scroll to zoom. \u03B8 drawn with 50\xD7 exaggeration (as in the MATLAB example); springs hang from the fixed ceiling at z=5. Plots track the playback cursor.`;
  }, 30);
})();
