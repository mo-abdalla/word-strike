// js/render/color.js
// Colour helpers for canvas drawing. Theme colours are #rrggbb.

function channels(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(a, b, t) {
  const ca = channels(a);
  const cb = channels(b);
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${out.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function withAlpha(hex, alpha) {
  const [r, g, b] = channels(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Combo ×1 → cold, ×8 → hot, in four steps (×1, ×2, ×4, ×8) so the ship's glow sprites stay few.
export function heatColor(combo, cold, hot) {
  const t = Math.min(1, Math.log2(Math.max(1, combo)) / 3);
  return mixHex(cold, hot, Math.round(t * 3) / 3);
}
