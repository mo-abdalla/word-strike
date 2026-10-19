// js/render/ship.js
// The player ship and the segmented hp ring around it.

export function aimAngle(ship, target) {
  return target ? Math.atan2(target.y - ship.y, target.x - ship.x) + Math.PI / 2 : 0;
}

export function drawShip(ctx, ship, angle, color) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(16, 16);
  ctx.lineTo(0, 8);
  ctx.lineTo(-16, 16);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawHpRing(ctx, ship, hp, maxHp, color, dimColor) {
  const radius = 38;
  const gap = 0.12;
  const segment = (Math.PI * 2) / maxHp;
  ctx.lineWidth = 3;
  for (let i = 0; i < maxHp; i++) {
    const start = -Math.PI / 2 + i * segment + gap / 2;
    ctx.strokeStyle = i < hp ? color : dimColor;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, radius, start, start + segment - gap);
    ctx.stroke();
  }
}
