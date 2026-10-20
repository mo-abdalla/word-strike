// js/render/ship.js
// The player ship (a glow sprite), its flickering engine flame and the segmented hp ring.

export const SHIP_TURN_RATE = 8; // radians per second
const SHIP_RADIUS = 24;
const FLAME_BASE = 10;
const FLAME_FLICKER = 10;

export function aimAngle(ship, target) {
  return target ? Math.atan2(target.y - ship.y, target.x - ship.x) + Math.PI / 2 : 0;
}

// Turns at most maxStep radians, the short way round.
export function turnToward(current, target, maxStep) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + Math.max(-maxStep, Math.min(maxStep, diff));
}

function shipPath(g) {
  g.beginPath();
  g.moveTo(0, -22);
  g.lineTo(16, 16);
  g.lineTo(0, 8);
  g.lineTo(-16, 16);
  g.closePath();
}

// recoil pushes the ship back along its nose; flicker in [0, 1) sets the flame length.
export function drawShip(ctx, glow, ship, angle, color, flameColor, recoil, flicker, scale = 1) {
  const back = { x: -Math.sin(angle) * recoil, y: Math.cos(angle) * recoil };
  ctx.save();
  ctx.translate(ship.x + back.x, ship.y + back.y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = flameColor;
  ctx.beginPath();
  ctx.moveTo(-6, 10);
  ctx.lineTo(0, 10 + FLAME_BASE + flicker * FLAME_FLICKER);
  ctx.lineTo(6, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  glow.stamp(ctx, glow.sprite(`ship|${color}`, SHIP_RADIUS, color, 2, shipPath), ship.x + back.x, ship.y + back.y, angle, scale);
}

export function drawHpRing(ctx, ship, hp, maxHp, color, dimColor, scale = 1) {
  const radius = 38 * scale;
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
