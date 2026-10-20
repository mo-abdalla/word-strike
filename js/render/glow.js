// js/render/glow.js
// Glow sprites: each shape and colour is drawn once with shadowBlur on a hidden canvas, then stamped with drawImage.
// No shadowBlur inside the frame loop. The cache is cleared when the theme changes.
const PAD = 14;
const BLUR = 12;

export function createGlow(dpr = 1) {
  const cache = new Map();

  // path(g) builds the shape around (0, 0); radius bounds it.
  function sprite(key, radius, color, lineWidth, path) {
    const hit = cache.get(key);
    if (hit) return hit;
    const size = Math.ceil((radius + PAD) * 2);
    const canvas = document.createElement('canvas');
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.translate(size / 2, size / 2);
    g.strokeStyle = color;
    g.lineWidth = lineWidth;
    g.lineJoin = 'round';
    g.shadowColor = color;
    g.shadowBlur = BLUR;
    path(g);
    g.stroke();
    g.shadowBlur = 0;
    g.stroke();
    const made = { canvas, size };
    cache.set(key, made);
    return made;
  }

  function stamp(ctx, s, x, y, angle = 0, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.drawImage(s.canvas, -s.size / 2, -s.size / 2, s.size, s.size);
    ctx.restore();
  }

  return { sprite, stamp, clear: () => cache.clear() };
}
