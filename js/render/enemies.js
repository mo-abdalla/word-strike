// js/render/enemies.js
// Plain outline shapes per enemy type. Glow arrives in the polish plan.
const SHAPES = {
  drone:    { sides: 3, radius: 12, rotation: 0 },
  seeker:   { sides: 4, radius: 12, rotation: 0 },
  splitter: { sides: 6, radius: 12, rotation: 0 },
  armored:  { sides: 4, radius: 16, rotation: Math.PI / 4 },
};

export function drawEnemy(ctx, e, color, locked) {
  const shape = SHAPES[e.type];
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(shape.rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 2.5 : 1.5;
  ctx.beginPath();
  for (let i = 0; i < shape.sides; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / shape.sides;
    const px = Math.cos(a) * shape.radius;
    const py = Math.sin(a) * shape.radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
