// js/render/fx.js
// Draws the feel state from js/feel.js: particles and bullets with 'lighter', zaps, rings,
// the muzzle flash, the red edge flash on damage and the white flash when a boss falls.
import { FEEL_TIMES } from '../feel.js';
import { withAlpha } from './color.js';

const BULLET_TRAIL = 0.35; // share of the path drawn behind the bullet

export function drawFx(ctx, f, colors) {
  const color = name => colors[name];

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of f.particles) {
    ctx.globalAlpha = p.life / p.max;
    ctx.fillStyle = color(p.color);
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.lineCap = 'round';
  for (const b of f.bullets) {
    const t = 1 - b.life / FEEL_TIMES.BULLET_SEC;
    const head = { x: b.x1 + (b.x2 - b.x1) * t, y: b.y1 + (b.y2 - b.y1) * t };
    const tail = Math.max(0, t - BULLET_TRAIL);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.cyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x1 + (b.x2 - b.x1) * tail, b.y1 + (b.y2 - b.y1) * tail);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  for (const z of f.zaps) {
    ctx.globalAlpha = z.life / FEEL_TIMES.ZAP_SEC;
    ctx.strokeStyle = colors.purple;
    ctx.beginPath();
    ctx.moveTo(z.x1, z.y1);
    ctx.lineTo(z.x2, z.y2);
    ctx.stroke();
  }
  if (f.muzzle > 0 && f.muzzleAt) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(f.muzzleAt.x, f.muzzleAt.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  for (const r of f.rings) {
    const p = 1 - r.life / FEEL_TIMES.RING_SEC;
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = color(r.color);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 10 + p * r.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Full-screen flashes, drawn last and without the shake offset.
export function drawFlashes(ctx, f, colors, width, height) {
  if (f.hurt > 0) {
    const a = 0.55 * (f.hurt / FEEL_TIMES.HURT_SEC);
    const grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, withAlpha(colors.pink, a));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  if (f.white > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.6 * (f.white / FEEL_TIMES.WHITE_SEC)})`;
    ctx.fillRect(0, 0, width, height);
  }
}
