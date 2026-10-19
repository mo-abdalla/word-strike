// js/enemies.js
// Enemy types, creation, movement, collision with the ship and splitting.

export const ENEMY_TYPES = {
  drone:    { minWave: 1, tiers: null,   speedMul: 1.0,  damage: 1, turnRate: 0 },
  seeker:   { minWave: 3, tiers: [2, 3], speedMul: 0.9,  damage: 1, turnRate: 1.2 },
  splitter: { minWave: 4, tiers: [2, 3], speedMul: 0.85, damage: 1, turnRate: 0 },
  armored:  { minWave: 6, tiers: [4, 5], speedMul: 0.5,  damage: 2, turnRate: 0 },
};

export const SHIP_RADIUS = 28;

export function createEnemy({ id, type, word, x, y, speed, target }) {
  const dx = target.x - x;
  const dy = target.y - y;
  const len = Math.hypot(dx, dy) || 1;
  return { id, type, word, typed: 0, x, y, vx: (dx / len) * speed, vy: (dy / len) * speed, speed, dead: false };
}

export function updateEnemy(e, dt, target) {
  const turn = ENEMY_TYPES[e.type].turnRate;
  if (turn > 0) {
    const want = Math.atan2(target.y - e.y, target.x - e.x);
    const current = Math.atan2(e.vy, e.vx);
    const diff = Math.atan2(Math.sin(want - current), Math.cos(want - current));
    const step = Math.max(-turn * dt, Math.min(turn * dt, diff));
    e.vx = Math.cos(current + step) * e.speed;
    e.vy = Math.sin(current + step) * e.speed;
  }
  e.x += e.vx * dt;
  e.y += e.vy * dt;
}

export function reachedShip(e, ship) {
  return Math.hypot(e.x - ship.x, e.y - ship.y) <= SHIP_RADIUS || e.y >= ship.y;
}

export function splitChildren(parent, words, ids, target) {
  return [-24, 24].map((dx, i) => createEnemy({
    id: ids[i], type: 'drone', word: words[i],
    x: parent.x + dx, y: parent.y, speed: parent.speed, target,
  }));
}
