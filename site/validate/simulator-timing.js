// Shared playback timing helper for the simulator bundles and MinAccel page.
// The displayed animation data may be downsampled from the solver output, so
// playback must follow the timestamps of the displayed samples.
(function (root) {
  root.simulatorFrameDt = function (data, fallbackFps) {
    var fallback = 1 / (fallbackFps || 50);
    if (!data || !data.t || data.t.length < 2) return fallback;
    return Math.max(1e-6, data.t[1] - data.t[0]);
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
