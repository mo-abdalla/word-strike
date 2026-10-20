// js/render/starfield.js
// Three star layers at different speeds for depth, over a nebula whose colour moves with the wave.
import { withAlpha } from './color.js';

const LAYERS = [
  { count: 80, speed: 8,  size: 1,   alpha: 0.35 },
  { count: 50, speed: 20, size: 1.5, alpha: 0.6 },
  { count: 20, speed: 45, size: 2,   alpha: 0.9 },
];
const NEBULA = ['purple', 'cyan', 'pink', 'green'];
const NEBULA_ALPHA = 0.16;

export function nebulaColor(wave) {
  return NEBULA[(Math.max(1, wave) - 1) % NEBULA.length];
}

export function createStarfield(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let stars = [];

  function resize(width, height, dpr) {
    w = width;
    h = height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = LAYERS.flatMap(layer =>
      Array.from({ length: layer.count }, () => ({ x: Math.random() * w, y: Math.random() * h, layer })));
  }

  function draw(dt, colors, wave) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.max(w, h) * 0.7);
    glow.addColorStop(0, withAlpha(colors[nebulaColor(wave)], NEBULA_ALPHA));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = colors.text;
    for (const s of stars) {
      s.y += s.layer.speed * dt;
      if (s.y > h) {
        s.y -= h;
        s.x = Math.random() * w;
      }
      ctx.globalAlpha = s.layer.alpha;
      ctx.fillRect(s.x, s.y, s.layer.size, s.layer.size);
    }
    ctx.globalAlpha = 1;
  }

  return { resize, draw };
}
