// js/render/fx.js
// Minimal feedback: a shot line per letter, a zap line per upgrade strike, and an expanding ring per kill or hit.
const BEAM_LIFE = 0.08;
const ZAP_LIFE = 0.18;
const RING_LIFE = 0.35;

export function createFx() {
  const beams = [];
  const zaps = [];
  const rings = [];

  function expire(list, dt) {
    for (const f of list) f.life -= dt;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }

  function drawLines(ctx, list, maxLife, color) {
    ctx.strokeStyle = color;
    for (const l of list) {
      ctx.globalAlpha = l.life / maxLife;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
  }

  return {
    beam(from, to) {
      beams.push({ x1: from.x, y1: from.y - 20, x2: to.x, y2: to.y, life: BEAM_LIFE });
    },
    zap(from, to) {
      zaps.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, life: ZAP_LIFE });
    },
    burst(x, y) {
      rings.push({ x, y, life: RING_LIFE });
    },
    update(dt) {
      expire(beams, dt);
      expire(zaps, dt);
      expire(rings, dt);
    },
    draw(ctx, colors) {
      ctx.lineWidth = 2;
      drawLines(ctx, beams, BEAM_LIFE, colors.cyan);
      drawLines(ctx, zaps, ZAP_LIFE, colors.purple);
      ctx.strokeStyle = colors.yellow;
      for (const r of rings) {
        const p = 1 - r.life / RING_LIFE;
        ctx.globalAlpha = 1 - p;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 10 + p * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}
