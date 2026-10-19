// js/render/fx.js
// Minimal feedback: a shot line per letter and an expanding ring per kill or hit.
const BEAM_LIFE = 0.08;
const RING_LIFE = 0.35;

export function createFx() {
  const beams = [];
  const rings = [];

  function expire(list, dt) {
    for (const f of list) f.life -= dt;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }

  return {
    beam(from, to) {
      beams.push({ x1: from.x, y1: from.y - 20, x2: to.x, y2: to.y, life: BEAM_LIFE });
    },
    burst(x, y) {
      rings.push({ x, y, life: RING_LIFE });
    },
    update(dt) {
      expire(beams, dt);
      expire(rings, dt);
    },
    draw(ctx, colors) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.cyan;
      for (const b of beams) {
        ctx.globalAlpha = b.life / BEAM_LIFE;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
      }
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
