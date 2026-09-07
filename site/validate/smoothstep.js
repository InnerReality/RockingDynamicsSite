(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    m: $("smooth-m"),
    theta0: $("smooth-theta0"),
    contact: $("smooth-contact"),
    hcm: $("smooth-hcm"),
    mValue: $("smooth-m-value"),
    theta0Value: $("smooth-theta0-value"),
    contactValue: $("smooth-contact-value"),
    hcmValue: $("smooth-hcm-value"),
    width: $("smooth-width"),
    validity: $("smooth-validity"),
    sign: $("sign-plot"),
    derivative: $("derivative-plot"),
    geometry: $("geometry-plot"),
  };

  const TAU = Math.PI * 2;
  // Use the enlarged physical radius directly. The geometry is no longer
  // scaled separately during drawing; all distances are expressed in r₀.
  const R0 = 3;
  const C = 1;
  const DEG = 180 / Math.PI;

  function smoothstep(x, m, w, c = 1) {
    const x0 = c / m - w / 2;
    const x1 = x0 + w;
    const alpha = (m * w) / 2;
    const beta = c - (m * w) / 2;
    const ax = Math.abs(x);
    if (ax >= x1) return Math.sign(x) * c;
    if (ax < x0) return m * x;
    const t = (ax - x0) / w;
    const g = 2 * t - 5 * t ** 4 + 6 * t ** 5 - 2 * t ** 6;
    const value = alpha * g + beta;
    return Math.sign(x) * value;
  }

  function smoothstepDerivative(x, m, w, c = 1) {
    const x0 = c / m - w / 2;
    const x1 = x0 + w;
    const ax = Math.abs(x);
    if (ax >= x1) return 0;
    if (ax < x0) return m;
    const t = (ax - x0) / w;
    const gp = 2 - 20 * t ** 3 + 30 * t ** 4 - 12 * t ** 5;
    return (m / 2) * gp;
  }

  function syncMSliderBounds() {
    const theta0 = Number(els.theta0.value);
    const epsilon = 0.001;
    const lower = Math.max(0.05, 1 / theta0 + epsilon);
    const upper = Math.min(120, 2 / theta0 - epsilon);
    els.m.min = lower.toFixed(3);
    els.m.max = Math.max(lower + epsilon, upper).toFixed(3);
    const current = Number(els.m.value);
    if (current < lower) els.m.value = lower.toFixed(3);
    if (current > upper) els.m.value = upper.toFixed(3);
  }

  function getParams() {
    const m = Number(els.m.value);
    const theta0 = Number(els.theta0.value);
    const contact = Number(els.contact.value);
    const hcmRatio = Number(els.hcm.value);
    const hcm = R0 * hcmRatio;
    const width = 2 * (theta0 - C / m);
    const x0 = C / m - width / 2;
    return {
      m,
      theta0,
      contact,
      hcmRatio,
      hcm,
      width,
      x0,
      valid: width > 0 && x0 > 0,
    };
  }

  function formatAngle(rad) {
    return `${(rad * DEG).toFixed(1)}°`;
  }

  function setText() {
    const p = getParams();
    els.mValue.textContent = p.m.toFixed(1);
    els.theta0Value.textContent = formatAngle(p.theta0);
    els.contactValue.textContent = formatAngle(p.contact);
    els.hcmValue.textContent = p.hcmRatio.toFixed(2);
    if (els.width) els.width.textContent = p.width.toFixed(4);
    const valid = p.valid;
    els.validity.textContent = valid
      ? `Valid smoothstep: 1/m < θ₀ < 2/m. The blend width is w = ${p.width.toFixed(4)} rad.`
      : `Choose 1/m < θ₀ < 2/m. Current x₀ = ${p.x0.toFixed(4)} is outside the MATLAB smoothstep domain.`;
    els.validity.className = valid ? "formula-note" : "formula-note error";
  }

  function themeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      ink: style.getPropertyValue("--fg").trim() || "#111",
      muted: style.getPropertyValue("--muted").trim() || "#667",
      line: style.getPropertyValue("--border").trim() || "#ccd",
      accent: style.getPropertyValue("--accent").trim() || "#0f766e",
      orange: style.getPropertyValue("--orange").trim() || "#c2410c",
      plot:
        document.documentElement.dataset.theme === "dark" ? "#111c2e" : "#fff",
    };
  }

  function setupCanvas(canvas, aspect = 1.65) {
    const width = Math.max(320, canvas.clientWidth || 600);
    const height = width / aspect;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function drawFrame(canvas, limits, labels, draw, aspect = 1.65) {
    const { ctx, width, height } = setupCanvas(canvas, aspect);
    const colors = themeColors();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.plot;
    ctx.fillRect(0, 0, width, height);
    const pad = { left: 48, right: 18, top: 18, bottom: 36 };
    const sx = (x) =>
      pad.left +
      ((x - limits.x[0]) / (limits.x[1] - limits.x[0])) *
        (width - pad.left - pad.right);
    const sy = (y) =>
      height -
      pad.bottom -
      ((y - limits.y[0]) / (limits.y[1] - limits.y[0])) *
        (height - pad.top - pad.bottom);
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(limits.y[0]));
    ctx.lineTo(sx(0), sy(limits.y[1]));
    ctx.moveTo(sx(limits.x[0]), sy(0));
    ctx.lineTo(sx(limits.x[1]), sy(0));
    ctx.stroke();
    ctx.fillStyle = colors.muted;
    ctx.font = "11px system-ui, sans-serif";
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i += 1) {
      const value = limits.x[0] + ((limits.x[1] - limits.x[0]) * i) / xTicks;
      const x = sx(value);
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(x, sy(0) - 3);
      ctx.lineTo(x, sy(0) + 3);
      ctx.stroke();
      ctx.fillStyle = colors.muted;
      ctx.textAlign = "center";
      const xLabel =
        labels.xUnit === "degrees"
          ? `${(value * DEG).toFixed(Math.abs(value * DEG) < 10 ? 1 : 0)}°`
          : value.toFixed(Math.abs(value) < 1 ? 2 : 1);
      ctx.fillText(xLabel, x, sy(0) + 16);
    }
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i += 1) {
      const value = limits.y[0] + ((limits.y[1] - limits.y[0]) * i) / yTicks;
      const y = sy(value);
      ctx.strokeStyle = colors.line;
      ctx.beginPath();
      ctx.moveTo(sx(0) - 3, y);
      ctx.lineTo(sx(0) + 3, y);
      ctx.stroke();
      ctx.fillStyle = colors.muted;
      ctx.textAlign = "right";
      ctx.fillText(
        value.toFixed(Math.abs(value) < 1 ? 2 : 1),
        sx(0) - 7,
        y + 4,
      );
    }
    ctx.textAlign = "left";
    ctx.fillText(labels.x, width - pad.right - 16, height - 10);
    if (labels.y) ctx.fillText(labels.y, 8, pad.top + 4);
    draw(ctx, sx, sy, colors);
  }

  function drawFunction(
    canvas,
    fn,
    limits,
    labels,
    params,
    derivative = false,
  ) {
    drawFrame(
      canvas,
      limits,
      labels,
      (ctx, sx, sy, colors) => {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const n = 900;
        for (let i = 0; i <= n; i += 1) {
          const x = limits.x[0] + ((limits.x[1] - limits.x[0]) * i) / n;
          const y = fn(x, params);
          if (i === 0) ctx.moveTo(sx(x), sy(y));
          else ctx.lineTo(sx(x), sy(y));
        }
        ctx.stroke();
        if (!derivative) {
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = colors.orange;
          ctx.beginPath();
          ctx.moveTo(sx(-params.theta0), sy(-1));
          ctx.lineTo(sx(-params.theta0), sy(1));
          ctx.moveTo(sx(params.theta0), sy(-1));
          ctx.lineTo(sx(params.theta0), sy(1));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Show the selected contact angle as a point on both smooth-sign plots.
        const cursorY = fn(params.contact, params);
        ctx.fillStyle = colors.orange;
        ctx.beginPath();
        ctx.arc(sx(params.contact), sy(cursorY), 4.5, 0, TAU);
        ctx.fill();
      },
      1.65,
    );
  }

  function arcLengthTo(theta, params) {
    // After theta0, sgn' is zero and the path is vertical. Do not evaluate
    // the integral near 90 degrees: tan(theta) magnifies harmless floating
    // point residuals and makes the contact position jitter.
    const magnitude = Math.min(Math.abs(theta), params.theta0);
    // Use a finer, adaptive-resolution quadrature for narrow transitions. A
    // fixed 600 samples can skip most of the smoothstep when theta0 is small.
    const transitionResolution = Math.ceil(
      magnitude / Math.max(params.width / 40, 1e-6),
    );
    const transitionSamples = Math.max(
      4000,
      Math.ceil(params.theta0 * 20000),
      transitionResolution,
    );
    const n = Math.min(50000, transitionSamples);
    let total = 0;
    let previous = 0;
    for (let i = 1; i <= n; i += 1) {
      const current = (magnitude * i) / n;
      const dtheta = current - previous;
      const f0 =
        R0 *
        smoothstepDerivative(previous, params.m, params.width) *
        Math.sqrt(1 + Math.tan(previous) ** 2);
      const f1 =
        R0 *
        smoothstepDerivative(current, params.m, params.width) *
        Math.sqrt(1 + Math.tan(current) ** 2);
      total += ((f0 + f1) * dtheta) / 2;
      previous = current;
    }
    return Math.sign(theta) * total;
  }

  function geometryData(params) {
    // Integrate the geometric y path through 90°. After theta0 the
    // derivative is zero, so explicitly use a zero integrand before evaluating
    // tan(theta); this avoids near-90° floating-point amplification.
    const limit = Math.PI / 2;
    const transitionResolution = Math.ceil(
      limit / Math.max(params.width / 40, 1e-6),
    );
    const n = Math.min(50000, Math.max(2400, transitionResolution));
    const positive = [{ theta: 0, r: 0, y: 0 }];
    let y = 0;
    let previous = 0;
    for (let i = 1; i <= n; i += 1) {
      const theta = (limit * i) / n;
      const dtheta = theta - previous;
      const derivative =
        theta <= params.theta0
          ? smoothstepDerivative(theta, params.m, params.width)
          : 0;
      const previousDerivative =
        previous <= params.theta0
          ? smoothstepDerivative(previous, params.m, params.width)
          : 0;
      const tanPrevious = previousDerivative === 0 ? 0 : Math.tan(previous);
      const tanCurrent = derivative === 0 ? 0 : Math.tan(theta);
      y +=
        (R0 *
          (previousDerivative * tanPrevious + derivative * tanCurrent) *
          dtheta) /
        2;
      positive.push({
        theta,
        r: R0 * smoothstep(theta, params.m, params.width),
        y,
      });
      previous = theta;
    }
    return { positive, y89: positive[positive.length - 1].y, limit };
  }

  function interpolateContact(params, data) {
    const side = Math.sign(params.contact) || 1;
    const absTheta = Math.abs(params.contact);
    if (absTheta <= data.limit) {
      const i = Math.min(
        data.positive.length - 1,
        Math.round((absTheta / data.limit) * (data.positive.length - 1)),
      );
      const point = data.positive[i];
      return {
        r: side * point.r,
        y: point.y,
        tangent: Math.tan(params.contact),
        post: false,
      };
    }
    const extension = Math.max(0.35, Math.abs(data.y89) * 0.45);
    const extra = Math.min(
      1,
      (absTheta - data.limit) / (Math.PI / 2 - data.limit),
    );
    return {
      r: side * R0,
      y: data.y89 + extension * extra,
      tangent: Math.tan(params.contact),
      post: true,
    };
  }

  function drawGeometry(canvas, params) {
    const data = geometryData(params);
    const contact = interpolateContact(params, data);
    const angle = -params.contact;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const contactX = arcLengthTo(params.contact, params);
    const transform = (point) => {
      const dr = point.r - contact.r;
      const dy = point.y - contact.y;
      return {
        r: dr * cos - dy * sin + contactX,
        y: dr * sin + dy * cos,
      };
    };
    const right = data.positive.map((p) => transform(p));
    const left = data.positive.map((p) => transform({ r: -p.r, y: p.y }));
    const topY = data.y89 + 2 * params.hcm;
    const centerY = data.y89 + params.hcm;
    const branchRight = transform({ r: R0, y: topY });
    const branchLeft = transform({ r: -R0, y: topY });
    const center = transform({ r: 0, y: centerY });
    // Keep the data frame fixed while θ moves. hCM controls the object scale.
    // Keep the r-axis fixed at ±1.25r₀. It must not change with hCM/r₀
    // or with the selected contact angle.
    const extent = 1.25 * R0;
    const aspect = 0.96;
    const xRange = 2 * extent;
    const yRange = xRange / aspect;
    const yMin = -0.1 * extent;
    const yMax = yMin + yRange;
    drawFrame(
      canvas,
      { x: [-extent, extent], y: [yMin, yMax] },
      { x: "r", y: "" },
      (ctx, sx, sy, colors) => {
        const line = (points, color, width = 2.2) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = width;
          ctx.beginPath();
          points.forEach((p, i) =>
            i ? ctx.lineTo(sx(p.r), sy(p.y)) : ctx.moveTo(sx(p.r), sy(p.y)),
          );
          ctx.stroke();
        };
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        right.forEach((p, i) =>
          i ? ctx.lineTo(sx(p.r), sy(p.y)) : ctx.moveTo(sx(p.r), sy(p.y)),
        );
        ctx.lineTo(sx(branchRight.r), sy(branchRight.y));
        ctx.lineTo(sx(branchLeft.r), sy(branchLeft.y));
        for (let i = left.length - 1; i >= 0; i -= 1)
          ctx.lineTo(sx(left[i].r), sy(left[i].y));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        line(right, colors.accent);
        line(left, colors.accent);
        ctx.setLineDash([6, 4]);
        line(
          [transform({ r: R0, y: data.y89 }), branchRight],
          colors.orange,
          1.8,
        );
        line(
          [transform({ r: -R0, y: data.y89 }), branchLeft],
          colors.orange,
          1.8,
        );
        line([branchLeft, branchRight], colors.orange, 1.8);
        ctx.setLineDash([]);

        // The centre marker follows the tilted object, while this reference
        // line remains vertical in the displayed y-versus-r frame.
        ctx.setLineDash([3, 4]);
        line(
          [
            { r: center.r, y: yMin },
            { r: center.r, y: yMax },
          ],
          colors.orange,
          1.5,
        );
        ctx.setLineDash([]);
        ctx.fillStyle = colors.orange;
        ctx.beginPath();
        ctx.arc(sx(center.r), sy(center.y), 5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colors.muted;
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText("center", sx(center.r) + 8, sy(center.y) - 8);

        // The contact is translated to the signed arc-length position x(θ).
        // Keep the tangent attached to that point; drawing it at r = 0 would
        // make it appear stationary even though the integral is changing.
        const tangentLength = Math.min(0.42, extent * 0.35);
        line(
          [
            { r: contactX - tangentLength, y: 0 },
            { r: contactX + tangentLength, y: 0 },
          ],
          colors.orange,
          3,
        );
        ctx.fillStyle = colors.orange;
        ctx.beginPath();
        ctx.arc(sx(contactX), sy(0), 5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colors.muted;
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillText(
          contact.post ? "vertical after θ₀" : "contact · tangent horizontal",
          sx(contactX) + 8,
          sy(0) - 8,
        );
      },
      aspect,
    );
  }

  function render() {
    syncMSliderBounds();
    setText();
    const params = getParams();
    if (!params.valid) {
      [els.sign, els.derivative, els.geometry].forEach((canvas) => {
        const { ctx, width, height } = setupCanvas(canvas);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = themeColors().muted;
        ctx.font = "14px system-ui, sans-serif";
        ctx.fillText(
          "Choose 1/m < θ₀ < 2/m to draw the smoothstep.",
          24,
          height / 2,
        );
      });
      return;
    }
    // Keep the selected contact cursor inside both plots while avoiding a
    // large unused x-range when the contact angle is small.
    const domain = Math.max(
      params.theta0 * 1.18,
      Math.abs(params.contact) * 1.18,
      0.08,
    );
    drawFunction(
      els.sign,
      (x, p) => smoothstep(x, p.m, p.width),
      { x: [-domain, domain], y: [-1.12, 1.12] },
      { x: "θ (degrees)", xUnit: "degrees", y: "smooth sign" },
      params,
    );
    drawFunction(
      els.derivative,
      (x, p) => smoothstepDerivative(x, p.m, p.width),
      { x: [-domain, domain], y: [-pMax(params) * 0.05, pMax(params) * 1.08] },
      { x: "θ (degrees)", xUnit: "degrees", y: "smooth sign′" },
      params,
      true,
    );
    drawGeometry(els.geometry, params);
  }

  function pMax(params) {
    return Math.max(params.m, 1);
  }
  [els.m, els.theta0, els.contact, els.hcm].forEach((input) =>
    input.addEventListener("input", render),
  );
  window.addEventListener("resize", render);
  new MutationObserver(render).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Hook for the GIF capture script: drive the contact angle directly so the
  // capture loop does not depend on the slider's input event listener.
  window.smoothstepSetContact = (theta) => {
    els.contact.value = String(theta);
    render();
  };

  // Mobile options drawer: the parameter cards slide in from the left.
  const optionsToggle = $("smooth-options-toggle");
  const optionsBackdrop = $("smooth-options-backdrop");
  const optionsDrawer = $("smooth-options-drawer");
  function setOptionsOpen(open) {
    if (!optionsDrawer || !optionsBackdrop) return;
    optionsDrawer.classList.toggle("open", open);
    optionsBackdrop.classList.toggle("show", open);
  }
  optionsToggle.addEventListener("click", () => {
    setOptionsOpen(!optionsDrawer.classList.contains("open"));
  });
  optionsBackdrop.addEventListener("click", () => setOptionsOpen(false));

  render();
})();
