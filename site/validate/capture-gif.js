(() => {
  const canvas = document.querySelector("#ma-canvas, #pg-canvas");
  if (!canvas) return;
  const button = document.createElement("button");
  button.className = "btn gif-download";
  const downloadLabel = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V1.75A.75.75 0 0 1 8 1zM2.75 13.5h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5z"/></svg><span>GIF</span>';
  button.innerHTML = downloadLabel;
  button.title = "Capture the current simulation canvas as an animated GIF";
  const transport = document.querySelector(".transport");
  transport?.insertBefore(button, transport.querySelector("select"));
  const runButton = document.querySelector(canvas.id === "ma-canvas" ? "#ma-run" : "#pg-run");
  const syncRunState = () => {
    if (!button.dataset.capturing) {
      button.disabled = !!runButton?.disabled;
      button.title = button.disabled
        ? "Wait for the simulation to finish before capturing a GIF"
        : "Capture the current simulation canvas as an animated GIF";
    }
  };
  if (runButton) {
    new MutationObserver(syncRunState).observe(runButton, { attributes: true, attributeFilter: ["disabled"] });
    syncRunState();
  }

  // The playground cylinders use translucent fills. These are their actual
  // colors after compositing over the white canvas background.
  const palette = [
    [255, 255, 255], [242, 195, 175], [166, 206, 233], [208, 226, 183],
    [17, 17, 17], [85, 85, 85], [0, 0, 0], [221, 34, 34],
    [204, 34, 34], [34, 170, 34], [34, 85, 204], [233, 233, 233],
    [156, 163, 175], [209, 213, 219], [0, 115, 189], [120, 171, 48]
  ];
  // A 6×6×6 color cube plus grayscale levels gives the translucent
  // cylinder faces enough nearby shades to avoid visible vertical banding.
  for (let r = 0; r <= 255; r += 51) {
    for (let g = 0; g <= 255; g += 51) {
      for (let b = 0; b <= 255; b += 51) palette.push([r, g, b]);
    }
  }
  // Reserve grayscale entries across the entire range; otherwise mid-gray
  // antialiased edges can be quantized to a nearby green cube color.
  for (let i = 0; i < 24; i++) {
    const v = Math.round(i * 255 / 23);
    palette.push([v, v, v]);
  }
  while (palette.length < 256) palette.push([255, 255, 255]);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  function lzw(data) {
    const minCodeSize = 8;
    const out = [], clear = 1 << minCodeSize, end = clear + 1;
    let codeSize = minCodeSize + 1, nextCode = end + 1;
    let maxCode = (1 << codeSize) - 1, bits = 0, current = 0;
    let dictionary = new Map();
    const emit = (code) => {
      current |= code << bits;
      bits += codeSize;
      while (bits >= 8) { out.push(current & 255); current >>= 8; bits -= 8; }
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
      const pixel = data[i], key = `${prefix},${pixel}`;
      if (dictionary.has(key)) {
        prefix = dictionary.get(key);
        continue;
      }
      emit(prefix);
      // Keep the dictionary below the first code-size boundary. This avoids
      // decoder differences while still compressing the long flat canvas runs.
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
      ...text("GIF89a"), width & 255, width >> 8, height & 255, height >> 8,
      247, 0, 0, ...palette.flat(), 33, 255, 11, ...text("NETSCAPE2.0"), 3, 1, 0, 0, 0
    ];
    for (const pixels of frames) {
      bytes.push(33, 249, 4, 0, delayCs & 255, delayCs >> 8, 0, 0, 44, 0, 0, 0, 0,
        width & 255, width >> 8, height & 255, height >> 8, 0, 8,
        ...subBlocks(lzw(pixels)));
    }
    bytes.push(59);
    return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  }
  function sampleFrame(source, width, height) {
    const raw = source.getContext("2d").getImageData(0, 0, width, height).data;
    const pixels = new Array(width * height);
    const cache = new Map();
    for (let i = 0, px = 0; i < raw.length; i += 4, px++) {
      const key = (raw[i] << 16) | (raw[i + 1] << 8) | raw[i + 2];
      let best = cache.get(key);
      if (best === undefined) {
        best = 0;
        let distance = Infinity;
        const isGray = Math.max(raw[i], raw[i + 1], raw[i + 2]) -
          Math.min(raw[i], raw[i + 1], raw[i + 2]) <= 8;
        for (let p = 0; p < palette.length; p++) {
          if (isGray && !(palette[p][0] === palette[p][1] && palette[p][1] === palette[p][2])) continue;
          const d = (raw[i] - palette[p][0]) ** 2 + (raw[i + 1] - palette[p][1]) ** 2 + (raw[i + 2] - palette[p][2]) ** 2;
          if (d < distance) { distance = d; best = p; }
        }
        cache.set(key, best);
      }
      pixels[px] = best;
    }
    return pixels;
  }
  const nextPaint = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  button.addEventListener("click", async () => {
    if (button.disabled) return;
    const isMinAccel = canvas.id === "ma-canvas";
    const slider = document.querySelector(isMinAccel ? "#ma-slider" : "#pg-slider");
    const playButton = document.querySelector(isMinAccel ? "#ma-play" : "#pg-play");
    const wasPlaying = playButton?.textContent.trim() === "Pause";
    const lastFrame = slider ? Number(slider.max) : 0;
    if (!slider || !Number.isFinite(lastFrame) || lastFrame < 1) {
      button.textContent = "Run simulation first";
      setTimeout(() => { button.innerHTML = downloadLabel; }, 1800);
      return;
    }
    button.disabled = true;
    button.dataset.capturing = "true";
    const width = canvas.width, height = canvas.height;
    // Read the physical duration shown by the simulator instead of assuming
    // every animation index is exactly 1/50 second. The solvers downsample
    // their data, so that assumption can produce far too many GIF frames.
    const timeId = canvas.id === "ma-canvas" ? "#ma-time" : "#pg-time";
    slider.value = String(lastFrame);
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    await nextPaint();
    const timeText = document.querySelector(timeId)?.textContent || "";
    const timeMatch = timeText.match(/([0-9]+(?:\.[0-9]+)?)\s*s/);
    const duration = timeMatch ? Number(timeMatch[1]) : lastFrame / 50;
    const speedId = canvas.id === "ma-canvas" ? "#ma-speed" : "#pg-speed";
    const playbackSpeed = Number(document.querySelector(speedId)?.value) || 1;
    // GIF viewers commonly clamp delays below 10 centiseconds. Capture at
    // 10 GIF frames per second and apply the selected playback speed.
    const framesPerGifSecond = 10;
    const simulatorFramesPerGifFrame = lastFrame * playbackSpeed / (duration * framesPerGifSecond);
    const frameNumbers = [];
    for (let n = 0, frame = 0; frame <= lastFrame; n++, frame = Math.round(n * simulatorFramesPerGifFrame)) {
      if (frameNumbers[frameNumbers.length - 1] !== frame) frameNumbers.push(frame);
    }
    if (frameNumbers[frameNumbers.length - 1] !== lastFrame) frameNumbers.push(lastFrame);
    const frames = [];
    slider.value = "0";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    await nextPaint();
    for (let i = 0; i < frameNumbers.length; i++) {
      slider.value = String(frameNumbers[i]);
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      await nextPaint();
      button.textContent = `Capturing ${i + 1}/${frameNumbers.length}…`;
      frames.push(sampleFrame(canvas, width, height));
    }
    const delayCs = 10;
    button.textContent = "Encoding GIF…";
    const url = URL.createObjectURL(makeGif(frames, width, height, delayCs));
    const link = document.createElement("a");
    link.href = url;
    const speedLabel = `${playbackSpeed}x`;
    link.download = `${isMinAccel ? "minaccel" : "playground"}-default-${speedLabel}.gif`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    // Seeking frames pauses the simulator. Restore the state it had before
    // capture so exporting a GIF does not unexpectedly stop playback.
    if (wasPlaying && playButton?.textContent.trim() === "Play") playButton.click();
    delete button.dataset.capturing;
    button.disabled = false;
    syncRunState();
    button.innerHTML = downloadLabel;
  });
})();
