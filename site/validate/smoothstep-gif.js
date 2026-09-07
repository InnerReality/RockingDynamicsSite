(() => {
  "use strict";

  const canvas = document.querySelector("#geometry-plot");
  const slider = document.querySelector("#smooth-contact");
  const button = document.querySelector("#smooth-gif");
  const setContact = window.smoothstepSetContact;
  if (!canvas || !slider || !button || !setContact) return;

  const downloadLabel = button.innerHTML;

  // Smoothstep theme colors (light and dark) plus a 6×6×6 color cube and
  // grayscale levels, so antialiased lines and both themes quantize cleanly.
  const palette = [
    [255, 255, 255],
    [0, 0, 0],
    [250, 250, 250],
    [255, 255, 255],
    [224, 224, 224],
    [95, 99, 104],
    [15, 118, 110],
    [194, 65, 12],
    [11, 18, 32],
    [17, 28, 46],
    [38, 55, 80],
    [197, 208, 223],
    [45, 212, 191],
    [251, 146, 60],
  ];
  for (let r = 0; r <= 255; r += 51) {
    for (let g = 0; g <= 255; g += 51) {
      for (let b = 0; b <= 255; b += 51) palette.push([r, g, b]);
    }
  }
  for (let i = 0; i < 24; i++) {
    const v = Math.round((i * 255) / 23);
    palette.push([v, v, v]);
  }
  while (palette.length < 256) palette.push([255, 255, 255]);

  // Precompute direct lookups so quantization is O(1) per unique color
  // instead of scanning all 256 palette entries per pixel.
  const cubeLevels = [0, 51, 102, 153, 204, 255];
  const grayLevels = [];
  for (let i = 0; i < 24; i++) grayLevels.push(Math.round((i * 255) / 23));
  const indexByRgb = new Map();
  palette.forEach((c, i) =>
    indexByRgb.set((c[0] << 16) | (c[1] << 8) | c[2], i),
  );
  const nearestCube = new Map();
  for (let r = 0; r <= 255; r += 51)
    for (let g = 0; g <= 255; g += 51)
      for (let b = 0; b <= 255; b += 51)
        nearestCube.set(
          (r << 16) | (g << 8) | b,
          indexByRgb.get((r << 16) | (g << 8) | b),
        );
  const nearestGray = new Map();
  grayLevels.forEach((v) =>
    nearestGray.set((v << 16) | (v << 8) | v, indexByRgb.get((v << 16) | (v << 8) | v)),
  );
  const nearestLevel = (v, levels) =>
    levels[Math.min(levels.length - 1, Math.round((v / 255) * (levels.length - 1)))];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function lzw(data) {
    const minCodeSize = 8;
    const out = [],
      clear = 1 << minCodeSize,
      end = clear + 1;
    let codeSize = minCodeSize + 1,
      nextCode = end + 1;
    let maxCode = (1 << codeSize) - 1,
      bits = 0,
      current = 0;
    let dictionary = new Map();
    const emit = (code) => {
      current |= code << bits;
      bits += codeSize;
      while (bits >= 8) {
        out.push(current & 255);
        current >>= 8;
        bits -= 8;
      }
    };
    const reset = () => {
      dictionary = new Map();
      codeSize = minCodeSize + 1;
      nextCode = end + 1;
      maxCode = (1 << codeSize) - 1;
    };
    emit(clear);
    let prefix = data[0];
    for (let i = 1; i < data.length; i++) {
      const pixel = data[i],
        key = `${prefix},${pixel}`;
      if (dictionary.has(key)) {
        prefix = dictionary.get(key);
        continue;
      }
      emit(prefix);
      if (nextCode < maxCode) {
        dictionary.set(key, nextCode++);
      } else {
        emit(clear);
        reset();
      }
      prefix = pixel;
    }
    emit(prefix);
    emit(end);
    if (bits) out.push(current & 255);
    return out;
  }
  function subBlocks(data) {
    const out = [];
    for (let i = 0; i < data.length; i += 255) {
      const part = data.slice(i, i + 255);
      out.push(part.length, ...part);
    }
    out.push(0);
    return out;
  }
  function makeGif(frames, width, height, delayCs) {
    const text = (value) => [...new TextEncoder().encode(value)];
    const bytes = [
      ...text("GIF89a"),
      width & 255,
      width >> 8,
      height & 255,
      height >> 8,
      247,
      0,
      0,
      ...palette.flat(),
      33,
      255,
      11,
      ...text("NETSCAPE2.0"),
      3,
      1,
      0,
      0,
      0,
    ];
    for (const pixels of frames) {
      bytes.push(
        33,
        249,
        4,
        0,
        delayCs & 255,
        delayCs >> 8,
        0,
        0,
        44,
        0,
        0,
        0,
        0,
        width & 255,
        width >> 8,
        height & 255,
        height >> 8,
        0,
        8,
        ...subBlocks(lzw(pixels)),
      );
    }
    bytes.push(59);
    return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  }
  function sampleFrame(source, width, height) {
    const raw = source.getContext("2d").getImageData(0, 0, width, height).data;
    const pixels = new Array(width * height);
    const cache = new Map();
    for (let i = 0, px = 0; i < raw.length; i += 4, px++) {
      const r = raw[i],
        g = raw[i + 1],
        b = raw[i + 2];
      const key = (r << 16) | (g << 8) | b;
      let best = cache.get(key);
      if (best === undefined) {
        // Exact palette match (theme colors, cube corners, gray levels).
        best = indexByRgb.get(key);
        if (best === undefined) {
          const isGray = Math.max(r, g, b) - Math.min(r, g, b) <= 8;
          if (isGray) {
            const v = nearestLevel(r, grayLevels);
            best = nearestGray.get((v << 16) | (v << 8) | v);
          } else {
            const qr = nearestLevel(r, cubeLevels);
            const qg = nearestLevel(g, cubeLevels);
            const qb = nearestLevel(b, cubeLevels);
            best = nearestCube.get((qr << 16) | (qg << 8) | qb);
          }
        }
        cache.set(key, best);
      }
      pixels[px] = best;
    }
    return pixels;
  }

  button.addEventListener("click", async () => {
    if (button.disabled) return;
    button.disabled = true;
    button.dataset.capturing = "true";
    const original = slider.value;
    let failed = false;
    try {
      // Give the browser a chance to repaint the label before heavy work.
      button.textContent = "Preparing…";
      await sleep(30);
      // Capture at half resolution: 4× fewer pixels to quantize and encode,
      // which keeps the GIF small and the capture fast.
      const scale = 0.5;
      const width = Math.max(1, Math.round(canvas.width * scale));
      const height = Math.max(1, Math.round(canvas.height * scale));
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      const min = Number(slider.min),
        max = Number(slider.max);
      const steps = 8;
      // Sweep θ from -90° to +90°, then back to -90°.
      const values = [];
      for (let i = 0; i <= steps; i++)
        values.push(min + ((max - min) * i) / steps);
      for (let i = steps - 1; i >= 0; i--)
        values.push(min + ((max - min) * i) / steps);
      const frames = [];
      for (let i = 0; i < values.length; i++) {
        // smoothstepSetContact redraws the canvas synchronously, so the
        // pixels are ready immediately; only yield so the button label can
        // repaint.
        setContact(values[i]);
        offCtx.drawImage(canvas, 0, 0, width, height);
        button.textContent = `Capturing ${i + 1}/${values.length}…`;
        frames.push(sampleFrame(offscreen, width, height));
        await sleep(0);
      }
      button.textContent = "Encoding GIF…";
      await sleep(0);
      const url = URL.createObjectURL(makeGif(frames, width, height, 10));
      const link = document.createElement("a");
      link.href = url;
      link.download = "smoothstep-sweep.gif";
      link.rel = "noopener";
      // Append to the DOM: some browsers ignore clicks on detached anchors.
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      failed = true;
      console.error("GIF capture failed:", err);
      button.textContent = "Capture failed";
      setTimeout(() => {
        button.innerHTML = downloadLabel;
      }, 2000);
    } finally {
      setContact(original);
      delete button.dataset.capturing;
      button.disabled = false;
      if (!failed) button.innerHTML = downloadLabel;
    }
  });
})();
