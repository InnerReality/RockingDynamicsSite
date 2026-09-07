(() => {
  const root = document.querySelector("[data-chapter]");
  if (!root) return;
  const bar = document.querySelector(".chapter-progress-bar");
  const steps = [...document.querySelectorAll(".scrolly-step")];
  const states = [...document.querySelectorAll(".figure-state")];
  const plots = [...document.querySelectorAll('.figure-plot')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const redraws = [];
  new MutationObserver(() => redraws.forEach((fn) => fn())).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["data-theme"] },
  );

  function showState(id) {
    states.forEach((state) =>
      state.classList.toggle("is-visible", state.dataset.state === id),
    );
    plots.forEach((plot) =>
      plot.classList.toggle("is-visible", plot.dataset.state === id),
    );
    drawFigure(id);
  }
  function drawFigure(id) {
    const plot = document.querySelector(`.figure-plot[data-state="${id}"]`);
    const canvas = plot
      ? plot.querySelector("canvas[data-figure-canvas]")
      : document.querySelector("[data-figure-canvas]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = 760),
      h = (canvas.height = 500);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#0f766e";
    ctx.fillStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text")
        .trim() || "#1c2524";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    const cx = w / 2,
      ground = h * 0.76;
    ctx.strokeStyle = "#93aaa4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, ground);
    ctx.lineTo(w - 70, ground);
    ctx.stroke();
    const angle =
      id === "threshold"
        ? -0.28
        : id === "response"
          ? 0.32
          : id === "forcing"
            ? Math.sin(Date.now() / 320) * 0.22
            : id === "derivation"
              ? -0.12
              : 0;
    ctx.save();
    ctx.translate(cx, ground - 150);
    ctx.rotate(angle);
    ctx.strokeStyle = "#244846";
    ctx.fillStyle = "rgba(15,118,110,.18)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.rect(-105, -150, 210, 150);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c2410c";
    ctx.beginPath();
    ctx.arc(0, -88, 10, 0, Math.PI * 2);
    ctx.fill();
    if (id === "geometry") {
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = "#c2410c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(62, 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#c2410c";
      ctx.beginPath();
      ctx.arc(62, 20, 7, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "#c2410c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(0, 20);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = ctx.strokeStyle = "#65716e";
    ctx.font = "700 22px system-ui";
    ctx.fillText(
      id === "threshold"
        ? "lift-off"
        : id === "response"
          ? "impact + decay"
          : id === "forcing"
            ? "driven rocking"
            : id === "derivation"
              ? "geometric path"
              : "two possible pivots",
      75,
      90,
    );
  }
  function setActive(step) {
    if (!step) return;
    steps.forEach((item) => item.classList.toggle("is-active", item === step));
    showState(step.dataset.state);
  }
  const figure = document.querySelector(".scrolly-figure");
  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }
  function updateActiveOnScroll() {
    const figRect = figure?.getBoundingClientRect();
    if (!figRect) return;
    const top = figRect.top;
    let closest = steps[0];
    let distance = Infinity;
    steps.forEach((step) => {
      const heading = step.querySelector("h2");
      const d = Math.abs(heading.getBoundingClientRect().top - top);
      if (d < distance) {
        distance = d;
        closest = step;
      }
    });
    setActive(closest);
  }
  addEventListener(
    "scroll",
    () => {
      progress();
      updateActiveOnScroll();
    },
    { passive: true },
  );
  progress();
  updateActiveOnScroll();

  function smoothSign(theta, theta0, m) {
    const width = 2 * (theta0 - 1 / m);
    const x0 = 1 / m - width / 2;
    const x1 = x0 + width;
    const ax = Math.abs(theta);
    if (ax >= x1) return Math.sign(theta);
    if (ax < x0) return m * theta;
    const t = (ax - x0) / width;
    const g = 2 * t - 5 * t ** 4 + 6 * t ** 5 - 2 * t ** 6;
    return Math.sign(theta) * (((m * width) / 2) * g + 1 - (m * width) / 2);
  }
  function smoothSignDerivative(theta, theta0, m) {
    const width = 2 * (theta0 - 1 / m);
    const x0 = 1 / m - width / 2;
    const x1 = x0 + width;
    const ax = Math.abs(theta);
    if (ax >= x1) return 0;
    if (ax < x0) return m;
    const t = (ax - x0) / width;
    const gp = 2 - 20 * t ** 3 + 30 * t ** 4 - 12 * t ** 5;
    return (m / 2) * gp;
  }
  function smoothAbs(theta, theta0, m) {
    // S(θ) = ∫₀^θ smoothSign(θ′) dθ′ — even, replaces |θ|
    const width = 2 * (theta0 - 1 / m);
    const x0 = 1 / m - width / 2;
    const x1 = x0 + width;
    const ax = Math.abs(theta);
    const s0 = (m * x0 * x0) / 2;
    if (ax < x0) return (m * ax * ax) / 2;
    if (ax >= x1) {
      const s1 =
        s0 +
        ((m * width * width) / 2) * (5 / 7) +
        width * (1 - (m * width) / 2);
      return s1 + (ax - x1);
    }
    const t = (ax - x0) / width;
    const gInt = t * t - t ** 5 + t ** 6 - (2 / 7) * t ** 7;
    return (
      s0 + ((m * width * width) / 2) * gInt + width * (1 - (m * width) / 2) * t
    );
  }

  function themeColors() {
    const colors = getComputedStyle(document.documentElement);
    return {
      muted: colors.getPropertyValue("--muted").trim() || "#65716e",
      border: colors.getPropertyValue("--border").trim() || "#d5d8ce",
      accent: colors.getPropertyValue("--accent").trim() || "#0f766e",
      panel: colors.getPropertyValue("--panel").trim() || "#fffefa",
      orange: colors.getPropertyValue("--orange").trim() || "#c2410c",
    };
  }
  function plotFrame(
    c,
    w,
    h,
    sx,
    sy,
    xMin,
    xMax,
    yMin,
    yMax,
    colors,
    xLabel,
    yLabel,
  ) {
    c.clearRect(0, 0, w, h);
    c.fillStyle = colors.panel;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = colors.border;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(sx(0), sy(yMin));
    c.lineTo(sx(0), sy(yMax));
    c.moveTo(sx(xMin), sy(0));
    c.lineTo(sx(xMax), sy(0));
    c.stroke();
    c.fillStyle = colors.muted;
    c.font = "12px system-ui";
    c.textAlign = "center";
    c.fillText(xLabel, w - 22, h - 12);
    c.textAlign = "left";
    c.fillText(yLabel, 8, 15);
    c.fillStyle = colors.muted;
    c.font = "11px system-ui";
    c.textAlign = "center";
    [-1, -0.5, 0, 0.5, 1].forEach((tick) =>
      c.fillText(`${tick} rad`, sx(tick), sy(0) + 18),
    );
  }

  function drawPotentialSim(sim) {
    const canvas = sim.querySelector("canvas");
    const sliders = [...sim.querySelectorAll("input[type=range]")];
    const outputs = [...sim.querySelectorAll("[data-value]")];
    const enhanced = sim.dataset.miniSim === "potential-enhanced";
    function draw() {
      const w = (canvas.width = 700),
        h = (canvas.height = 390);
      const c = canvas.getContext("2d");
      const thetabar = Number(sliders[0].value);
      const theta0 = enhanced ? Number(sliders[1].value) : 0.6;
      const m = enhanced ? 1.5 / theta0 : 2.5;
      const xMin = -1.45,
        xMax = 1.45,
        yMin = 0,
        yMax = 1.12;
      const pad = { left: 54, right: 18, top: 18, bottom: 42 };
      const sx = (x) =>
        pad.left + ((x - xMin) / (xMax - xMin)) * (w - pad.left - pad.right);
      const sy = (y) =>
        h -
        pad.bottom -
        ((y - yMin) / (yMax - yMin)) * (h - pad.top - pad.bottom);
      const colors = themeColors();
      plotFrame(
        c,
        w,
        h,
        sx,
        sy,
        xMin,
        xMax,
        yMin,
        yMax,
        colors,
        "θ",
        "V(θ) / mg",
      );
      const exact = (theta) => Math.sin(thetabar + Math.abs(theta));
      const smooth = enhanced
        ? (theta) => Math.sin(thetabar + smoothAbs(theta, theta0, m))
        : null;
      function curve(fn, color, dotted) {
        c.save();
        c.strokeStyle = color;
        c.lineWidth = 2.5;
        c.setLineDash(dotted ? [6, 5] : []);
        c.beginPath();
        for (let i = 0; i <= 500; i += 1) {
          const x = xMin + ((xMax - xMin) * i) / 500;
          const y = fn(x);
          if (i === 0) c.moveTo(sx(x), sy(y));
          else c.lineTo(sx(x), sy(y));
        }
        c.stroke();
        c.restore();
      }
      curve(exact, colors.orange, true);
      if (smooth) curve(smooth, colors.accent, false);
      if (enhanced) {
        c.save();
        c.strokeStyle = colors.accent;
        c.lineWidth = 1;
        c.setLineDash([4, 4]);
        [-theta0, theta0].forEach((x) => {
          c.beginPath();
          c.moveTo(sx(x), sy(yMin));
          c.lineTo(sx(x), sy(yMax));
          c.stroke();
        });
        c.restore();
      }
      if (outputs[0])
        outputs[0].textContent = `${((thetabar * 180) / Math.PI).toFixed(1)}°`;
      if (outputs[1])
        outputs[1].textContent = `${((theta0 * 180) / Math.PI).toFixed(1)}° · m = ${m.toFixed(2)}`;
    }
    sliders.forEach((slider) => slider.addEventListener("input", draw));
    draw();
    redraws.push(draw);
  }

  function drawSignSim(sim) {
    const canvases = [...sim.querySelectorAll("canvas")];
    const slider = sim.querySelector("input[type=range]");
    const output = sim.querySelector("[data-value]");
    function draw() {
      const theta0 = Number(slider.value);
      const m = 1.5 / theta0;
      const xMin = -1.45,
        xMax = 1.45;
      const pad = { left: 54, right: 18, top: 18, bottom: 42 };
      const colors = themeColors();
      const c1 = canvases[0].getContext("2d");
      const w1 = (canvases[0].width = 700),
        h1 = (canvases[0].height = 350);
      const yMin1 = -1.2,
        yMax1 = 1.2;
      const sx1 = (x) =>
        pad.left + ((x - xMin) / (xMax - xMin)) * (w1 - pad.left - pad.right);
      const sy1 = (y) =>
        h1 -
        pad.bottom -
        ((y - yMin1) / (yMax1 - yMin1)) * (h1 - pad.top - pad.bottom);
      plotFrame(
        c1,
        w1,
        h1,
        sx1,
        sy1,
        xMin,
        xMax,
        yMin1,
        yMax1,
        colors,
        "θ",
        "sgn(θ)",
      );
      c1.save();
      c1.strokeStyle = colors.muted;
      c1.lineWidth = 1;
      c1.setLineDash([2, 4]);
      c1.beginPath();
      c1.moveTo(sx1(xMin), sy1(1));
      c1.lineTo(sx1(xMax), sy1(1));
      c1.moveTo(sx1(xMin), sy1(-1));
      c1.lineTo(sx1(xMax), sy1(-1));
      c1.stroke();
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.orange;
      c1.lineWidth = 1.5;
      c1.setLineDash([5, 4]);
      c1.beginPath();
      c1.moveTo(sx1(xMin), sy1(m * xMin));
      c1.lineTo(sx1(xMax), sy1(m * xMax));
      c1.stroke();
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.accent;
      c1.lineWidth = 1;
      c1.setLineDash([4, 4]);
      [-theta0, theta0].forEach((x) => {
        c1.beginPath();
        c1.moveTo(sx1(x), sy1(yMin1));
        c1.lineTo(sx1(x), sy1(yMax1));
        c1.stroke();
      });
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.accent;
      c1.lineWidth = 2.5;
      c1.beginPath();
      for (let i = 0; i <= 1000; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 1000;
        const y = smoothSign(x, theta0, m);
        if (i === 0) c1.moveTo(sx1(x), sy1(y));
        else c1.lineTo(sx1(x), sy1(y));
      }
      c1.stroke();
      c1.restore();
      const c2 = canvases[1].getContext("2d");
      const w2 = (canvases[1].width = 700),
        h2 = (canvases[1].height = 350);
      const yMax2 = Math.max(m, 1) * 1.1,
        yMin2 = -yMax2 * 0.05;
      const sx2 = (x) =>
        pad.left + ((x - xMin) / (xMax - xMin)) * (w2 - pad.left - pad.right);
      const sy2 = (y) =>
        h2 -
        pad.bottom -
        ((y - yMin2) / (yMax2 - yMin2)) * (h2 - pad.top - pad.bottom);
      plotFrame(
        c2,
        w2,
        h2,
        sx2,
        sy2,
        xMin,
        xMax,
        yMin2,
        yMax2,
        colors,
        "θ",
        "sgn′(θ)",
      );
      c2.save();
      c2.strokeStyle = colors.accent;
      c2.lineWidth = 1;
      c2.setLineDash([4, 4]);
      [-theta0, theta0].forEach((x) => {
        c2.beginPath();
        c2.moveTo(sx2(x), sy2(yMin2));
        c2.lineTo(sx2(x), sy2(yMax2));
        c2.stroke();
      });
      c2.restore();
      c2.save();
      c2.strokeStyle = colors.orange;
      c2.lineWidth = 2.5;
      c2.beginPath();
      for (let i = 0; i <= 1000; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 1000;
        const y = smoothSignDerivative(x, theta0, m);
        if (i === 0) c2.moveTo(sx2(x), sy2(y));
        else c2.lineTo(sx2(x), sy2(y));
      }
      c2.stroke();
      c2.restore();
      if (output)
        output.textContent = `${((theta0 * 180) / Math.PI).toFixed(1)}° · m = ${m.toFixed(2)}`;
    }
    slider.addEventListener("input", draw);
    draw();
    redraws.push(draw);
  }

  function drawGeometrySim(sim) {
    const canvas = sim.querySelector("canvas");
    const slider = sim.querySelector("input[type=range]");
    const output = sim.querySelector("[data-value]");
    const R0 = 3,
      hcm = 3,
      contact = 0;
    function smoothstep(x, m, width) {
      const x0 = 1 / m - width / 2;
      const x1 = x0 + width;
      const alpha = (m * width) / 2;
      const beta = 1 - (m * width) / 2;
      const ax = Math.abs(x);
      if (ax >= x1) return Math.sign(x);
      if (ax < x0) return m * x;
      const t = (ax - x0) / width;
      const g = 2 * t - 5 * t ** 4 + 6 * t ** 5 - 2 * t ** 6;
      return Math.sign(x) * (alpha * g + beta);
    }
    function smoothstepDerivative(x, m, width) {
      const x0 = 1 / m - width / 2;
      const x1 = x0 + width;
      const ax = Math.abs(x);
      if (ax >= x1) return 0;
      if (ax < x0) return m;
      const t = (ax - x0) / width;
      const gp = 2 - 20 * t ** 3 + 30 * t ** 4 - 12 * t ** 5;
      return (m / 2) * gp;
    }
    function geometryData(theta0, m, width) {
      const limit = Math.PI / 2;
      const n = 6000;
      const positive = [{ theta: 0, r: 0, y: 0 }];
      let y = 0,
        previous = 0;
      for (let i = 1; i <= n; i += 1) {
        const theta = (limit * i) / n;
        const dtheta = theta - previous;
        const derivative =
          theta <= theta0 ? smoothstepDerivative(theta, m, width) : 0;
        const previousDerivative =
          previous <= theta0 ? smoothstepDerivative(previous, m, width) : 0;
        const tanPrevious = previousDerivative === 0 ? 0 : Math.tan(previous);
        const tanCurrent = derivative === 0 ? 0 : Math.tan(theta);
        y +=
          (R0 *
            (previousDerivative * tanPrevious + derivative * tanCurrent) *
            dtheta) /
          2;
        positive.push({ theta, r: R0 * smoothstep(theta, m, width), y });
        previous = theta;
      }
      return { positive, y89: positive[positive.length - 1].y, limit };
    }
    function arcLengthTo(theta, theta0, m, width) {
      const magnitude = Math.min(Math.abs(theta), theta0);
      const n = 4000;
      let total = 0,
        previous = 0;
      for (let i = 1; i <= n; i += 1) {
        const current = (magnitude * i) / n;
        const dtheta = current - previous;
        const f0 =
          R0 *
          smoothstepDerivative(previous, m, width) *
          Math.sqrt(1 + Math.tan(previous) ** 2);
        const f1 =
          R0 *
          smoothstepDerivative(current, m, width) *
          Math.sqrt(1 + Math.tan(current) ** 2);
        total += ((f0 + f1) * dtheta) / 2;
        previous = current;
      }
      return Math.sign(theta) * total;
    }
    function draw() {
      const theta0 = Number(slider.value);
      const m = 1.5 / theta0;
      const width = 2 * (theta0 - 1 / m);
      const data = geometryData(theta0, m, width);
      const side = Math.sign(contact) || 1;
      const absTheta = Math.abs(contact);
      let contactPoint;
      if (absTheta <= data.limit) {
        const i = Math.min(
          data.positive.length - 1,
          Math.round((absTheta / data.limit) * (data.positive.length - 1)),
        );
        const point = data.positive[i];
        contactPoint = {
          r: side * point.r,
          y: point.y,
          tangent: Math.tan(contact),
          post: false,
        };
      } else {
        const extension = Math.max(0.35, Math.abs(data.y89) * 0.45);
        const extra = Math.min(
          1,
          (absTheta - data.limit) / (Math.PI / 2 - data.limit),
        );
        contactPoint = {
          r: side * R0,
          y: data.y89 + extension * extra,
          tangent: Math.tan(contact),
          post: true,
        };
      }
      const angle = -contact;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const contactX = arcLengthTo(contact, theta0, m, width);
      const transform = (point) => {
        const dr = point.r - contactPoint.r;
        const dy = point.y - contactPoint.y;
        return { r: dr * cos - dy * sin + contactX, y: dr * sin + dy * cos };
      };
      const right = data.positive.map(transform);
      const left = data.positive.map((p) => transform({ r: -p.r, y: p.y }));
      const topY = data.y89 + 2 * hcm;
      const centerY = data.y89 + hcm;
      const branchRight = transform({ r: R0, y: topY });
      const branchLeft = transform({ r: -R0, y: topY });
      const center = transform({ r: 0, y: centerY });
      const extent = 1.25 * R0;
      const xRange = 2 * extent;
      const yRange = xRange * 1.1;
      const yMin = -0.1 * extent;
      const yMax = yMin + yRange;
      const w = (canvas.width = 700),
        h = (canvas.height = 700);
      const c = canvas.getContext("2d");
      const colors = themeColors();
      const pad = { left: 48, right: 18, top: 18, bottom: 36 };
      const sx = (x) =>
        pad.left + ((x + extent) / xRange) * (w - pad.left - pad.right);
      const sy = (y) =>
        h - pad.bottom - ((y - yMin) / yRange) * (h - pad.top - pad.bottom);
      c.clearRect(0, 0, w, h);
      c.fillStyle = colors.panel;
      c.fillRect(0, 0, w, h);
      c.strokeStyle = colors.border;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(sx(0), sy(yMin));
      c.lineTo(sx(0), sy(yMax));
      c.moveTo(sx(-extent), sy(0));
      c.lineTo(sx(extent), sy(0));
      c.stroke();
      c.fillStyle = colors.muted;
      c.font = "12px system-ui";
      c.textAlign = "left";
      c.fillText("r", w - pad.right - 16, h - 10);
      c.fillText("y", 8, pad.top + 4);
      const line = (points, color, width2 = 2.2) => {
        c.strokeStyle = color;
        c.lineWidth = width2;
        c.beginPath();
        points.forEach((p, i) =>
          i ? c.lineTo(sx(p.r), sy(p.y)) : c.moveTo(sx(p.r), sy(p.y)),
        );
        c.stroke();
      };
      c.fillStyle = colors.accent;
      c.globalAlpha = 0.1;
      c.beginPath();
      right.forEach((p, i) =>
        i ? c.lineTo(sx(p.r), sy(p.y)) : c.moveTo(sx(p.r), sy(p.y)),
      );
      c.lineTo(sx(branchRight.r), sy(branchRight.y));
      c.lineTo(sx(branchLeft.r), sy(branchLeft.y));
      for (let i = left.length - 1; i >= 0; i -= 1)
        c.lineTo(sx(left[i].r), sy(left[i].y));
      c.closePath();
      c.fill();
      c.globalAlpha = 1;
      line(right, colors.accent);
      line(left, colors.accent);
      c.setLineDash([6, 4]);
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
      c.setLineDash([]);
      c.setLineDash([3, 4]);
      line(
        [
          { r: center.r, y: yMin },
          { r: center.r, y: yMax },
        ],
        colors.orange,
        1.5,
      );
      c.setLineDash([]);
      c.fillStyle = colors.orange;
      c.beginPath();
      c.arc(sx(center.r), sy(center.y), 5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = colors.muted;
      c.font = "12px system-ui";
      c.fillText("center", sx(center.r) + 8, sy(center.y) - 8);
      const tangentLength = Math.min(0.42, extent * 0.35);
      line(
        [
          { r: contactX - tangentLength, y: 0 },
          { r: contactX + tangentLength, y: 0 },
        ],
        colors.orange,
        3,
      );
      c.fillStyle = colors.orange;
      c.beginPath();
      c.arc(sx(contactX), sy(0), 5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = colors.muted;
      c.font = "12px system-ui";
      c.fillText(
        contactPoint.post
          ? "vertical after θ₀"
          : "contact · tangent horizontal",
        sx(contactX) + 8,
        sy(0) - 8,
      );
      if (output)
        output.textContent = `${((theta0 * 180) / Math.PI).toFixed(1)}° · m = ${m.toFixed(2)}`;
    }
    slider.addEventListener("input", draw);
    draw();
    redraws.push(draw);
  }

  const minAccelDraws = [];
  function drawMinAccelSim(sim) {
    const canvas = sim.querySelector("canvas");
    const c = canvas.getContext("2d");
    const forceToggle = sim.querySelector("input[type=checkbox]");
    const pSlider = sim.querySelector('input[data-role="p"]');
    const aSlider = sim.querySelector('input[data-role="a"]');
    const hSlider = sim.querySelector('input[data-role="h"]');
    const pVal = sim.querySelector('[data-value][data-role="p"]');
    const aVal = sim.querySelector('[data-value][data-role="a"]');
    const hVal = sim.querySelector('[data-value][data-role="h"]');
    const status = sim.querySelector("[data-min-accel-status]");
    const r0 = 12; // in — assumed pivot radius (half the base width)
    const W = 1000; // lb — fixed body weight
    const delimiters = [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
    ];
    const interactive = Boolean(forceToggle && pSlider && aSlider && hSlider);

    if (hSlider) {
      hSlider.min = String(0.2 * r0);
      hSlider.max = String(5 * r0);
    }

    function minAccel(force, P, h) {
      return (1 + (force ? (12 * P) / W : 0)) * (r0 / h);
    }

    function renderTheory(force, P, h, aMin) {
      const theory = document.querySelector("[data-min-accel-theory]");
      if (!theory) return;
      const eq = theory.querySelector("[data-theory-eq]");
      const defs = theory.querySelector("[data-theory-defs]");
      eq.innerHTML = force
        ? "\\[a = g\\,\\frac{(1 + 12\\,P/W)\\,r_0}{h} = " +
          aMin.toFixed(2) +
          "\\,g\\]"
        : "\\[a = g\\,\\frac{r_0}{h} = " + aMin.toFixed(2) + "\\,g\\]";
      defs.innerHTML = force
        ? "where \\(P = " +
          P.toFixed(0) +
          "\\) lb is the Belleville-washer preload per stack, \\(W = " +
          W.toFixed(0) +
          "\\) lb is the body weight, \\(r_0 = " +
          r0.toFixed(1) +
          "\\) in is the pivot radius, and \\(h = h_{CM} = " +
          h.toFixed(1) +
          "\\) in is the center-of-mass height. With the current body parameters the rocking onset is at \\(a = " +
          aMin.toFixed(2) +
          "\\,g\\). When the BW force is disabled, the preload term drops out (\\(P = 0\\)) and the equation reduces to \\(a = g\\,r_0/h\\)."
        : "where \\(W = " +
          W.toFixed(0) +
          "\\) lb is the body weight, \\(r_0 = " +
          r0.toFixed(1) +
          "\\) in is the pivot radius, and \\(h = h_{CM} = " +
          h.toFixed(1) +
          "\\) in is the center-of-mass height. With the current body parameters the rocking onset is at \\(a = " +
          aMin.toFixed(2) +
          "\\,g\\).";
      if (window.renderMathInElement) {
        renderMathInElement(eq, { delimiters });
        renderMathInElement(defs, { delimiters });
      }
    }

    function readState() {
      if (interactive) {
        const force = forceToggle.checked;
        return {
          force,
          P: force ? Number(pSlider.value) : 0,
          h: Number(hSlider.value),
          a: Number(aSlider.value),
        };
      }
      // Static copy: mirror the interactive sim's controls, but fix the
      // acceleration at 1.01·a_min so the block is shown just past onset.
      const master = [
        ...document.querySelectorAll('[data-mini-sim="min-accel"]'),
      ].find((el) => el !== sim && el.querySelector("input[type=checkbox]"));
      const force = master
        ? master.querySelector("input[type=checkbox]").checked
        : false;
      const P = force
        ? Number(master.querySelector('input[data-role="p"]').value)
        : 0;
      const h = master
        ? Number(master.querySelector('input[data-role="h"]').value)
        : 40;
      return { force, P, h, a: 1.01 * minAccel(force, P, h) };
    }

    function draw() {
      const { force, P, h, a } = readState();
      const aMin = minAccel(force, P, h);
      const aMax = 1.01 * aMin;
      if (aSlider) {
        aSlider.max = aMax.toFixed(4);
        if (Number(aSlider.value) > aMax) aSlider.value = aMax.toFixed(4);
      }
      if (pSlider) pSlider.disabled = !force;
      if (pVal) pVal.textContent = P.toFixed(0) + " lb";
      if (aVal) aVal.textContent = a.toFixed(2) + " g";
      if (hVal) hVal.textContent = h.toFixed(1) + " in";
      if (forceToggle) renderTheory(force, P, h, aMin);

      const w = (canvas.width = 700),
        hh = (canvas.height = 700);
      c.clearRect(0, 0, w, hh);
      const colors = themeColors();
      c.fillStyle = colors.panel;
      c.fillRect(0, 0, w, hh);

      const tipped = a >= aMin;
      const contactX = tipped ? r0 : r0 * (a / aMin);
      const tilt = tipped ? Math.min(0.45, (a / aMin - 1) * 45) : 0;
      const cos = Math.cos(tilt),
        sin = Math.sin(tilt);
      const corners = [
        [-r0, 0],
        [r0, 0],
        [r0, 2 * h],
        [-r0, 2 * h],
      ].map(([dx, dy]) => ({
        x: r0 + (dx - r0) * cos + dy * sin,
        y: -(dx - r0) * sin + dy * cos,
      }));
      const cm = { x: r0 - r0 * cos + h * sin, y: r0 * sin + h * cos };
      const baseC = { x: r0 - r0 * cos, y: r0 * sin };
      const contact = { x: contactX, y: 0 };

      const wLen = Math.min(r0, h / 2);
      const wLen2 = Math.max(r0,h/2);
      const pLen = wLen2 * (P / W);
      const wpLen = r0 * (1 + P / W);
      const arrowLen = r0 * (a / aMin);
      const headX = cm.x + arrowLen; // acceleration arrow points right

      const xs = [
        0,
        contactX,
        cm.x,
        headX,
        baseC.x,
        ...corners.map((p) => p.x),
      ];
      const ys = [
        0,
        2 * h,
        cm.y,
        cm.y + wLen,
        baseC.y + pLen,
        wpLen,
        ...corners.map((p) => p.y),
      ];
      let xMin = Math.min(...xs),
        xMax = Math.max(...xs);
      const yMax = Math.max(...ys);
      const padX = Math.max(1, (xMax - xMin) * 0.08);
      const padY = Math.max(1, yMax * 0.12);
      xMin -= padX;
      xMax += padX;

      // Origin (ground) stays anchored at the bottom of the plot.
      const pad = { left: 46, right: 18, top: 34, bottom: 44 };
      const availW = w - pad.left - pad.right;
      const availH = hh - pad.top - pad.bottom;
      const scale = Math.min(availW / (xMax - xMin), availH / (yMax + padY));
      const x0 = (xMin + xMax) / 2 - availW / scale / 2;
      const sx = (x) => pad.left + (x - x0) * scale;
      const sy = (y) => hh - pad.bottom - y * scale;

      function arrow(x1, y1, x2, y2, color, lw) {
        const sx1 = sx(x1), sy1 = sy(y1);
        const sx2 = sx(x2), sy2 = sy(y2);

        const dx = sx2 - sx1, dy = sy2 - sy1;
        const len = Math.hypot(dx, dy);
        if (len < 1e-6) return;
        const ux = dx / len, uy = dy / len;

        const ah = 14;
        c.strokeStyle = color;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(sx1, sy1);
        c.lineTo(sx2, sy2);
        c.stroke();

        const px = -uy * ah * 0.6, py = ux * ah * 0.6;
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(sx2, sy2);
        c.lineTo(sx2 - ux * ah - px, sy2 - uy * ah - py);
        c.lineTo(sx2 - ux * ah + px, sy2 - uy * ah + py);
        c.closePath();
        c.fill();
      }

      c.strokeStyle = colors.border;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(pad.left, sy(0));
      c.lineTo(w - pad.right, sy(0));
      c.stroke();

      c.setLineDash([2, 5]);
      c.strokeStyle = colors.orange;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(sx(cm.x), sy(cm.y));
      c.lineTo(sx(cm.x), sy(0));
      c.stroke();
      c.setLineDash([]);

      c.beginPath();
      corners.forEach((p, i) =>
        i ? c.lineTo(sx(p.x), sy(p.y)) : c.moveTo(sx(p.x), sy(p.y)),
      );
      c.closePath();
      c.fillStyle = colors.accent;
      c.globalAlpha = 0.16;
      c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = colors.accent;
      c.lineWidth = 3;
      c.stroke();

      const orange = colors.orange;
      // W: downward, tail at the CM (0, h when upright)
      arrow(cm.x,cm.y , cm.x, cm.y - wLen , orange, 3);
      // P: downward, head at the base centre (0, 0 when upright)
      if (pLen > 0.4)
        arrow(baseC.x, baseC.y + pLen, baseC.x, baseC.y, orange, 3);
      // W + P: upward, tail at the contact point
      arrow(contact.x, contact.y, contact.x, contact.y + wpLen, colors.accent, 3);
      // Acceleration: horizontal, tail at the CM, head pointing right
      if (arrowLen > 0.4) arrow(cm.x, cm.y, cm.x + arrowLen, cm.y, orange, 3);

      c.font = "800 26px system-ui";
      c.textAlign = "center";
      c.fillStyle = orange;
      c.fillText("W", sx(cm.x)- 26, sy(cm.y - wLen) + 26);
      if (pLen > 0.4) {
        c.fillStyle = orange;
        c.fillText("P", sx(baseC.x), sy(baseC.y) + 26);
      }
      c.fillStyle = colors.accent;
      c.fillText("W + P", sx(contact.x)+52, sy(contact.y + wpLen) - 12);
      if (arrowLen > 0.4) {
        c.fillStyle = orange;
        c.fillText(
          "a = " + a.toFixed(2) + " g",
          sx(cm.x + arrowLen / 2),
          sy(cm.y) - 22,
        );
      }

      c.fillStyle = orange;
      c.beginPath();
      c.arc(sx(cm.x), sy(cm.y), 6, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(sx(contact.x), sy(contact.y), 6, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = colors.muted;
      c.font = "700 14px system-ui";
      c.textAlign = "left";
      c.fillText(
        "a = " + a.toFixed(2) + " g · a_min = " + aMin.toFixed(2) + " g",
        pad.left + 4,
        18,
      );
      c.textAlign = "right";
      c.fillText(
        "block 2r₀ × 2h = " +
          (2 * r0).toFixed(1) +
          " × " +
          (2 * h).toFixed(1) +
          " in",
        w - pad.right - 4,
        18,
      );
      if (tipped) {
        c.fillStyle = orange;
        c.font = "900 24px system-ui";
        c.textAlign = "center";
        c.fillText("Tipped!", w / 2, 26);
      }

      if (status) {
        status.textContent = tipped
          ? "Tipped! The effective gravity line has left the base — onset was at a = " +
            aMin.toFixed(2) +
            " g."
          : "Contact point at x = " +
            contactX.toFixed(1) +
            " in of r₀ = " +
            r0.toFixed(1) +
            " in · onset at a = " +
            aMin.toFixed(2) +
            " g.";
      }
    }

    minAccelDraws.push(draw);
    if (interactive) {
      [forceToggle, pSlider, aSlider, hSlider].forEach((el) =>
        el?.addEventListener("input", () => minAccelDraws.forEach((fn) => fn())),
      );
      forceToggle?.addEventListener("change", () =>
        minAccelDraws.forEach((fn) => fn()),
      );
    }
    draw();
    redraws.push(draw);
  }

  function drawDampingSim(sim) {
    const canvases = [...sim.querySelectorAll("canvas")];
    const theta0Slider = sim.querySelector('input[data-role="theta0"]');
    const thetaSlider = sim.querySelector('input[data-role="theta"]');
    const theta0Val = sim.querySelector('[data-value][data-role="theta0"]');
    const thetaVal = sim.querySelector('[data-value][data-role="theta"]');
    const status = sim.querySelector("[data-damping-status]");
    const c0 = 1; // normalized damping coefficient
    function draw() {
      const theta0 = Number(theta0Slider.value);
      const theta = Number(thetaSlider.value);
      const m = 1.5 / theta0;
      const xMin = -1.45,
        xMax = 1.45;
      const pad = { left: 54, right: 18, top: 18, bottom: 42 };
      const colors = themeColors();
      if (theta0Val)
        theta0Val.textContent = ((theta0 * 180) / Math.PI).toFixed(1) + "°";
      if (thetaVal)
        thetaVal.textContent = ((theta * 180) / Math.PI).toFixed(1) + "°";

      if (status)
        status.textContent =
          "damping occurs only when |θ| < θ₀ = " +
          ((theta0 * 180) / Math.PI).toFixed(1) +
          "° — the body is in contact with the base.";

      const c1 = canvases[0].getContext("2d");
      const w1 = (canvases[0].width = 700),
        h1 = (canvases[0].height = 350);

      const yMin1 = -1.2,
        yMax1 = 1.2;
      const sx1 = (x) =>
        pad.left + ((x - xMin) / (xMax - xMin)) * (w1 - pad.left - pad.right);
      const sy1 = (y) =>
        h1 -
        pad.bottom -
        ((y - yMin1) / (yMax1 - yMin1)) * (h1 - pad.top - pad.bottom);
      plotFrame(
        c1,
        w1,
        h1,
        sx1,
        sy1,
        xMin,
        xMax,
        yMin1,
        yMax1,
        colors,
        "θ",
        "sgn(θ)",
      );
      if (Math.abs(theta) < theta0) {
        c1.fillStyle = colors.orange;
        c1.font = "900 24px system-ui";
        c1.textAlign = "center";
        c1.fillText("Damping occurs", w1 / 2, 26);
      } else {
        c1.fillStyle = colors.muted;
        c1.font = "900 24px system-ui";
        c1.textAlign = "center";
        c1.fillText("Damping does not occur", w1 / 2, 26);
      }
      c1.save();
      c1.strokeStyle = colors.muted;
      c1.lineWidth = 1;
      c1.setLineDash([2, 4]);
      c1.beginPath();
      c1.moveTo(sx1(xMin), sy1(1));
      c1.lineTo(sx1(xMax), sy1(1));
      c1.moveTo(sx1(xMin), sy1(-1));
      c1.lineTo(sx1(xMax), sy1(-1));
      c1.stroke();
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.orange;
      c1.lineWidth = 1.5;
      c1.setLineDash([5, 4]);
      c1.beginPath();
      c1.moveTo(sx1(xMin), sy1(m * xMin));
      c1.lineTo(sx1(xMax), sy1(m * xMax));
      c1.stroke();
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.accent;
      c1.lineWidth = 1;
      c1.setLineDash([4, 4]);
      [-theta0, theta0].forEach((x) => {
        c1.beginPath();
        c1.moveTo(sx1(x), sy1(yMin1));
        c1.lineTo(sx1(x), sy1(yMax1));
        c1.stroke();
      });
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.accent;
      c1.lineWidth = 2.5;
      c1.beginPath();
      for (let i = 0; i <= 1000; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 1000;
        const y = smoothSign(x, theta0, m);
        if (i === 0) c1.moveTo(sx1(x), sy1(y));
        else c1.lineTo(sx1(x), sy1(y));
      }
      c1.stroke();
      c1.restore();
      c1.save();
      c1.strokeStyle = colors.orange;
      c1.lineWidth = 2;
      c1.beginPath();
      c1.moveTo(sx1(theta), sy1(yMin1));
      c1.lineTo(sx1(theta), sy1(yMax1));
      c1.stroke();
      c1.restore();

      const c2 = canvases[1].getContext("2d");
      const w2 = (canvases[1].width = 700),
        h2 = (canvases[1].height = 350);
      const yMin2 = -0.05 * c0,
        yMax2 = 1.1 * c0;
      const sx2 = (x) =>
        pad.left + ((x - xMin) / (xMax - xMin)) * (w2 - pad.left - pad.right);
      const sy2 = (y) =>
        h2 -
        pad.bottom -
        ((y - yMin2) / (yMax2 - yMin2)) * (h2 - pad.top - pad.bottom);
      plotFrame(
        c2,
        w2,
        h2,
        sx2,
        sy2,
        xMin,
        xMax,
        yMin2,
        yMax2,
        colors,
        "θ",
        "c₀(1 − sgn(θ)²)",
      );
      c2.save();
      c2.strokeStyle = colors.accent;
      c2.lineWidth = 1;
      c2.setLineDash([4, 4]);
      [-theta0, theta0].forEach((x) => {
        c2.beginPath();
        c2.moveTo(sx2(x), sy2(yMin2));
        c2.lineTo(sx2(x), sy2(yMax2));
        c2.stroke();
      });
      c2.restore();
      c2.save();
      c2.strokeStyle = colors.orange;
      c2.lineWidth = 2.5;
      c2.beginPath();
      for (let i = 0; i <= 1000; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 1000;
        const s = smoothSign(x, theta0, m);
        const y = c0 * (1 - s * s);
        if (i === 0) c2.moveTo(sx2(x), sy2(y));
        else c2.lineTo(sx2(x), sy2(y));
      }
      c2.stroke();
      c2.restore();
      c2.save();
      c2.strokeStyle = colors.orange;
      c2.lineWidth = 2;
      c2.beginPath();
      c2.moveTo(sx2(theta), sy2(yMin2));
      c2.lineTo(sx2(theta), sy2(yMax2));
      c2.stroke();
      c2.restore();
    }
    [theta0Slider, thetaSlider].forEach((el) =>
      el?.addEventListener("input", draw),
    );
    draw();
    redraws.push(draw);
  }

  document
    .querySelectorAll('[data-mini-sim="min-accel"]')
    .forEach(drawMinAccelSim);
  document
    .querySelectorAll('[data-mini-sim="damping"]')
    .forEach(drawDampingSim);
  document
    .querySelectorAll(
      '[data-mini-sim="potential-basic"], [data-mini-sim="potential-enhanced"]',
    )
    .forEach(drawPotentialSim);
  document
    .querySelectorAll('[data-mini-sim="smooth-sign"]')
    .forEach(drawSignSim);
  document
    .querySelectorAll('[data-mini-sim="geometry-path"]')
    .forEach(drawGeometrySim);
  document
    .querySelectorAll(
      '[data-mini-sim]:not([data-mini-sim="potential-basic"]):not([data-mini-sim="potential-enhanced"]):not([data-mini-sim="smooth-sign"]):not([data-mini-sim="geometry-path"]):not([data-mini-sim="min-accel"]):not([data-mini-sim="damping"])',
    )
    .forEach((sim) => {
      const mini = sim.querySelector("canvas");
      const c = mini.getContext("2d");
      const slider = sim.querySelector("input[type=range]");
      const output = sim.querySelector("[data-value]");
      const button = sim.querySelector("button");
      let running = false;
      function draw() {
        const w = (mini.width = 700),
          h = (mini.height = 410);
        c.clearRect(0, 0, w, h);
        c.strokeStyle = "#9aaca7";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(45, h - 55);
        c.lineTo(w - 35, h - 55);
        c.stroke();
        const value = Number(slider?.value || 0.6);
        if (output)
          output.textContent =
            sim.dataset.miniSim === "geometry"
              ? `${value.toFixed(2)} rad`
              : sim.dataset.miniSim === "response"
                ? value.toFixed(2)
                : `${value.toFixed(1)} Hz`;
        c.save();
        c.translate(w / 2, h - 100);
        c.rotate(
          sim.dataset.miniSim === "geometry"
            ? value * 0.35
            : Math.sin(value) * 0.3,
        );
        c.fillStyle = "rgba(15,118,110,.2)";
        c.strokeStyle = "#244846";
        c.lineWidth = 6;
        c.beginPath();
        c.rect(-85, -140, 170, 140);
        c.fill();
        c.stroke();
        c.fillStyle = "#c2410c";
        c.beginPath();
        c.arc(0, -80, 9, 0, Math.PI * 2);
        c.fill();
        c.restore();
        if (sim.dataset.miniSim === "geometry") {
          c.strokeStyle = "#0f766e";
          c.lineWidth = 3;
          c.beginPath();
          for (let x = 50; x < w - 40; x += 5) {
            const y = h - 90 - Math.tan((x - w / 2) / 260) * 40;
            c.lineTo(x, y);
          }
          c.stroke();
        }
      }
      slider?.addEventListener("input", draw);
      button?.addEventListener("click", () => {
        running = !running;
        button.textContent = running ? "Pause" : "Animate";
        if (running && !reduced) {
          const tick = () => {
            if (!running) return;
            slider.value = String(Number(slider.value) + 0.04);
            if (Number(slider.value) > Number(slider.max))
              slider.value = slider.min;
            draw();
            requestAnimationFrame(tick);
          };
          tick();
        }
      });
      draw();
      redraws.push(draw);
    });
})();
