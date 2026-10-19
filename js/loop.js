// js/loop.js
// One always-running frame loop. dt is capped so a background tab does not teleport enemies.
const MAX_DT = 0.05;

export function startLoop(frame) {
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(MAX_DT, (now - last) / 1000);
    last = now;
    frame(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
