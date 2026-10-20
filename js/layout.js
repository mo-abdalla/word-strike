// js/layout.js
// Sizes that depend on the screen. Desktop keeps today's numbers; phones scale by the play-area height.
const COMPACT_WIDTH = 520;
const TOUCH_COMPACT_WIDTH = 800;
const REFERENCE_HEIGHT = 800;
const MIN_SCALE = 0.6;
const MIN_LABEL_SCALE = 0.85; // words must stay readable even when the ship shrinks
const SHIP_OFFSET = 70;
const PARTICLE_CAP = 400;
const COMPACT_PARTICLE_CAP = 200;

export function layoutFor({ width, height, touch = false }) {
  const compact = width <= COMPACT_WIDTH || (touch && width <= TOUCH_COMPACT_WIDTH);
  const scale = compact ? Math.min(1, Math.max(MIN_SCALE, height / REFERENCE_HEIGHT)) : 1;
  return {
    compact,
    scale,
    labelScale: Math.max(MIN_LABEL_SCALE, scale),
    particleCap: compact ? COMPACT_PARTICLE_CAP : PARTICLE_CAP,
    shipOffset: Math.round(SHIP_OFFSET * scale),
  };
}
