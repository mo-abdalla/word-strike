// js/render/enemies.js
// Plain outline shapes per enemy type, and the boss with its hp bar. Glow arrives in the polish plan.
const SHAPES = {
  drone:    { sides: 3, radius: 12, rotation: 0 },
  seeker:   { sides: 4, radius: 12, rotation: 0 },
  splitter: { sides: 6, radius: 12, rotation: 0 },
  armored:  { sides: 4, radius: 16, rotation: Math.PI / 4 },
  missile:  { sides: 3, radius: 7,  rotation: 0 },
};
const BOSS_RADIUS = 44;
const BAR_WIDTH = 120;
const BAR_HEIGHT = 5;

function polygon(ctx, sides, radius, rotation) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = Math.PI / 2 + rotation + (i * 2 * Math.PI) / sides;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawEnemy(ctx, e, color, locked) {
  const shape = SHAPES[e.type];
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 2.5 : 1.5;
  polygon(ctx, shape.sides, shape.radius, shape.rotation);
  ctx.restore();
}

export function drawBoss(ctx, boss, color, hpColor, dimColor, locked) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 3 : 2;
  polygon(ctx, 6, BOSS_RADIUS, Math.PI / 6);
  polygon(ctx, 6, BOSS_RADIUS * 0.55, 0);
  ctx.beginPath();
  ctx.moveTo(-BOSS_RADIUS, 0);
  ctx.lineTo(-BOSS_RADIUS * 1.7, -14);
  ctx.moveTo(BOSS_RADIUS, 0);
  ctx.lineTo(BOSS_RADIUS * 1.7, -14);
  ctx.stroke();
  ctx.restore();

  const x = boss.x - BAR_WIDTH / 2;
  const y = boss.y - BOSS_RADIUS - 16;
  ctx.fillStyle = dimColor;
  ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, (BAR_WIDTH * boss.hp) / boss.maxHp, BAR_HEIGHT);
}
