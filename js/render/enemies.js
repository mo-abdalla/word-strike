// js/render/enemies.js
// Enemy shapes as glow sprites: drone triangle, seeker diamond with a light trail, splitter hexagon,
// armored square with plates, missile arrow, and the boss with its hp bar.
const BOSS_RADIUS = 44;
const BAR_WIDTH = 120;
const BAR_HEIGHT = 5;
const TRAIL_PX = 26;

function polygon(g, sides, radius, rotation) {
  for (let i = 0; i < sides; i++) {
    const a = Math.PI / 2 + rotation + (i * 2 * Math.PI) / sides;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

const SHAPES = {
  drone: { radius: 12, path: g => { g.beginPath(); polygon(g, 3, 12, 0); } },
  seeker: { radius: 12, path: g => { g.beginPath(); polygon(g, 4, 12, 0); } },
  splitter: { radius: 12, path: g => { g.beginPath(); polygon(g, 6, 12, 0); } },
  armored: {
    radius: 16,
    path: g => {
      g.beginPath();
      polygon(g, 4, 16, Math.PI / 4);
      polygon(g, 4, 9, Math.PI / 4);
      g.moveTo(-11, 0); g.lineTo(11, 0);
    },
  },
  // An arrow pointing along +y; drawn rotated to its velocity.
  missile: {
    radius: 9,
    path: g => {
      g.beginPath();
      g.moveTo(0, 9); g.lineTo(6, 0); g.lineTo(2, 0); g.lineTo(2, -8);
      g.lineTo(-2, -8); g.lineTo(-2, 0); g.lineTo(-6, 0); g.closePath();
    },
  },
};

function bossPath(g) {
  g.beginPath();
  polygon(g, 6, BOSS_RADIUS, Math.PI / 6);
  polygon(g, 6, BOSS_RADIUS * 0.55, 0);
  g.moveTo(-BOSS_RADIUS, 0); g.lineTo(-BOSS_RADIUS * 1.7, -14);
  g.moveTo(BOSS_RADIUS, 0); g.lineTo(BOSS_RADIUS * 1.7, -14);
}

function drawTrail(ctx, e, color) {
  const len = Math.hypot(e.vx, e.vy) || 1;
  const tx = e.x - (e.vx / len) * TRAIL_PX;
  const ty = e.y - (e.vy / len) * TRAIL_PX;
  const grad = ctx.createLinearGradient(e.x, e.y, tx, ty);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(e.x, e.y);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.restore();
}

export function drawEnemy(ctx, glow, e, color, locked) {
  const shape = SHAPES[e.type];
  if (e.type === 'seeker') drawTrail(ctx, e, color);
  const s = glow.sprite(`${e.type}|${color}|${locked}`, shape.radius, color, locked ? 2.5 : 1.5, shape.path);
  const angle = e.type === 'missile' ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : 0;
  glow.stamp(ctx, s, e.x, e.y, angle);
}

export function drawBoss(ctx, glow, boss, color, hpColor, dimColor, locked) {
  const s = glow.sprite(`boss|${color}|${locked}`, BOSS_RADIUS * 1.7, color, locked ? 3 : 2, bossPath);
  glow.stamp(ctx, s, boss.x, boss.y);
  const x = boss.x - BAR_WIDTH / 2;
  const y = boss.y - BOSS_RADIUS - 16;
  ctx.fillStyle = dimColor;
  ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, (BAR_WIDTH * boss.hp) / boss.maxHp, BAR_HEIGHT);
}
