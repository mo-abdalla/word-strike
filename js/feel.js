// js/feel.js
// Game feel as plain data: bullets, zaps, rings, particles, shake, hitstop and flashes.
// Driven by run events, advanced by dt, drawn by render/fx.js. No DOM, so it is tested in Node.
// Colours are theme names ('pink', 'cyan', ...); the renderer maps them to the current theme.

export const PARTICLE_CAP = 400;
export const HITSTOP_SEC = 0.04;
const BULLET_SEC = 0.07;
const ZAP_SEC = 0.18;
const RING_SEC = 0.35;
const MUZZLE_SEC = 1 / 60;
const RECOIL_PX = 4;
const RECOIL_DECAY = 40;
const SHAKE_KILL = 3;
const SHAKE_HURT = 10;
const SHAKE_DECAY = 30;
const HURT_SEC = 0.45;
const WHITE_SEC = 0.25;
const PARTICLE_DRAG = 3;
const SHIP_NOSE = 22;
const BOSS_BURSTS = [[0, -36], [0.15, 0], [0.3, 36]]; // [delay s, x offset px]

export function createFeel({ reducedMotion = false, rand = Math.random, cap = PARTICLE_CAP } = {}) {
  return {
    reducedMotion, rand, cap,
    bullets: [], zaps: [], rings: [], particles: [], delayed: [],
    shake: 0, hitstop: 0, hurt: 0, white: 0, recoil: 0, muzzle: 0, muzzleAt: null,
  };
}

// Oldest particles go first when the cap is reached.
function burst(f, x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = f.rand() * Math.PI * 2;
    const v = speed * (0.3 + 0.7 * f.rand());
    const life = 0.4 + 0.3 * f.rand();
    f.particles.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, life, max: life, color, size: 1.5 + 1.5 * f.rand() });
  }
  if (f.particles.length > f.cap) f.particles.splice(0, f.particles.length - f.cap);
}

function ring(f, x, y, color, radius = 40) {
  f.rings.push({ x, y, color, radius, life: RING_SEC });
}

function shake(f, amount) {
  if (!f.reducedMotion) f.shake = Math.max(f.shake, amount);
}

function hitstop(f) {
  if (!f.reducedMotion) f.hitstop = HITSTOP_SEC;
}

export function feelEvent(f, ev, ship) {
  switch (ev.type) {
    case 'shot':
      f.bullets.push({ x1: ship.x, y1: ship.y - SHIP_NOSE, x2: ev.x, y2: ev.y, life: BULLET_SEC });
      f.recoil = RECOIL_PX;
      if (!f.reducedMotion) {
        f.muzzle = MUZZLE_SEC;
        f.muzzleAt = { x: ship.x, y: ship.y - SHIP_NOSE };
      }
      break;
    case 'kill':
      burst(f, ev.x, ev.y, 'pink', 18, 220);
      ring(f, ev.x, ev.y, 'yellow');
      hitstop(f);
      shake(f, SHAKE_KILL);
      break;
    case 'bossHit':
      burst(f, ev.x, ev.y, 'yellow', 24, 260);
      ring(f, ev.x, ev.y, 'yellow', 70);
      hitstop(f);
      shake(f, SHAKE_KILL);
      break;
    case 'novaHit':
    case 'pop':
      burst(f, ev.x, ev.y, 'cyan', 10, 160);
      ring(f, ev.x, ev.y, 'cyan', 30);
      break;
    case 'hurt':
      burst(f, ev.x, ev.y, 'pink', 12, 180);
      ring(f, ev.x, ev.y, 'pink');
      if (!f.reducedMotion) f.hurt = HURT_SEC;
      shake(f, SHAKE_HURT);
      break;
    case 'zap':
      f.zaps.push({ x1: ev.from.x, y1: ev.from.y, x2: ev.to.x, y2: ev.to.y, life: ZAP_SEC });
      break;
    case 'pulse':
      ring(f, ship.x, ship.y, 'cyan', 140);
      break;
    case 'bossDown':
      for (const [at, dx] of BOSS_BURSTS) f.delayed.push({ at, x: ev.x + dx, y: ev.y });
      if (!f.reducedMotion) f.white = WHITE_SEC;
      shake(f, SHAKE_HURT);
      break;
    default:
      break;
  }
}

function expire(list, dt) {
  for (const item of list) item.life -= dt;
  for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
}

export function updateFeel(f, dt) {
  expire(f.bullets, dt);
  expire(f.zaps, dt);
  expire(f.rings, dt);
  const drag = Math.exp(-PARTICLE_DRAG * dt);
  for (const p of f.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= drag;
    p.vy *= drag;
  }
  expire(f.particles, dt);
  for (const d of f.delayed) d.at -= dt;
  for (const d of f.delayed.filter(x => x.at <= 0)) {
    burst(f, d.x, d.y, 'yellow', 28, 300);
    ring(f, d.x, d.y, 'yellow', 90);
  }
  f.delayed = f.delayed.filter(x => x.at > 0);
  f.shake = Math.max(0, f.shake - SHAKE_DECAY * dt);
  f.hitstop = Math.max(0, f.hitstop - dt);
  f.hurt = Math.max(0, f.hurt - dt);
  f.white = Math.max(0, f.white - dt);
  f.muzzle = Math.max(0, f.muzzle - dt);
  f.recoil = Math.max(0, f.recoil - RECOIL_DECAY * dt);
}

export function shakeOffset(f) {
  if (f.shake === 0) return { x: 0, y: 0 };
  return { x: (f.rand() * 2 - 1) * f.shake, y: (f.rand() * 2 - 1) * f.shake };
}

export const FEEL_TIMES = { BULLET_SEC, RING_SEC, ZAP_SEC, HURT_SEC, WHITE_SEC };
