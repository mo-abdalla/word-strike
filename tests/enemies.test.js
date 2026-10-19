// tests/enemies.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from '../js/enemies.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('types unlock at their waves', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(ENEMY_TYPES).map(([k, v]) => [k, v.minWave])),
    { drone: 1, seeker: 3, splitter: 4, armored: 6 },
  );
  assert.equal(ENEMY_TYPES.armored.damage, 2);
});

test('createEnemy aims at the target', () => {
  const e = createEnemy({ id: 1, type: 'drone', word: 'go', x: 100, y: 0, speed: 50, target: { x: 100, y: 500 } });
  assert.ok(near(e.vx, 0));
  assert.ok(near(e.vy, 50));
  assert.equal(e.typed, 0);
  assert.equal(e.dead, false);
});

test('drone moves in a straight line', () => {
  const e = createEnemy({ id: 1, type: 'drone', word: 'go', x: 100, y: 0, speed: 50, target: { x: 100, y: 500 } });
  updateEnemy(e, 1, { x: 100, y: 500 });
  assert.ok(near(e.y, 50));
  assert.ok(near(e.x, 100));
});

test('seeker turns toward the target and keeps its speed', () => {
  const e = { type: 'seeker', x: 0, y: 0, vx: 50, vy: 0, speed: 50 };
  updateEnemy(e, 0.1, { x: 0, y: 1000 });
  assert.ok(e.vy > 0);
  assert.ok(Math.abs(Math.hypot(e.vx, e.vy) - 50) < 1e-9);
});

test('reachedShip', () => {
  const ship = { x: 400, y: 700 };
  assert.equal(reachedShip({ x: 400, y: 680 }, ship), true);
  assert.equal(reachedShip({ x: 400, y: 600 }, ship), false);
  assert.equal(reachedShip({ x: 50, y: 701 }, ship), true);
});

test('splitter children', () => {
  const kids = splitChildren({ x: 100, y: 50, speed: 40 }, ['ab', 'cd'], [7, 8], { x: 100, y: 500 });
  assert.deepEqual(kids.map(k => k.id), [7, 8]);
  assert.deepEqual(kids.map(k => k.type), ['drone', 'drone']);
  assert.deepEqual(kids.map(k => k.word), ['ab', 'cd']);
  assert.deepEqual(kids.map(k => k.x), [76, 124]);
});
