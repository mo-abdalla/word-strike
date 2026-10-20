// tests/feel.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFeel, feelEvent, updateFeel, shakeOffset, HITSTOP_SEC, PARTICLE_CAP, FEEL_TIMES } from '../js/feel.js';
import { mixHex, withAlpha, heatColor } from '../js/render/color.js';

const ship = { x: 400, y: 730 };

test('a shot fires a bullet from the nose, with recoil and a muzzle flash', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'shot', x: 100, y: 200 }, ship);
  assert.deepEqual(f.bullets.map(b => [b.x1, b.y1, b.x2, b.y2]), [[400, 708, 100, 200]]);
  assert.ok(f.recoil > 0);
  assert.ok(f.muzzle > 0);
  updateFeel(f, FEEL_TIMES.BULLET_SEC);
  assert.equal(f.bullets.length, 0);
});

test('a kill bursts, rings, holds the frame and shakes a little', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'kill', x: 50, y: 60 }, ship);
  assert.equal(f.particles.length, 18);
  assert.equal(f.rings.length, 1);
  assert.equal(f.hitstop, HITSTOP_SEC);
  assert.equal(f.shake, 3);
});

test('getting hurt shakes harder and flashes the edges', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'kill', x: 0, y: 0 }, ship);
  feelEvent(f, { type: 'hurt', x: 0, y: 0 }, ship);
  assert.equal(f.shake, 10);
  assert.ok(f.hurt > 0);
});

test('reduced motion: no shake, no flash, no hitstop — particles stay', () => {
  const f = createFeel({ reducedMotion: true, rand: () => 0.5 });
  for (const type of ['shot', 'kill', 'hurt', 'bossDown']) feelEvent(f, { type, x: 0, y: 0 }, ship);
  assert.deepEqual([f.shake, f.hitstop, f.hurt, f.white, f.muzzle], [0, 0, 0, 0, 0]);
  assert.ok(f.particles.length > 0);
});

test('particles are capped, oldest first', () => {
  const f = createFeel({ rand: () => 0.5, cap: 20 });
  feelEvent(f, { type: 'kill', x: 1, y: 1 }, ship);
  feelEvent(f, { type: 'kill', x: 2, y: 2 }, ship);
  assert.equal(f.particles.length, 20);
  assert.ok(f.particles.slice(-18).every(p => p.x === 2));
  assert.equal(PARTICLE_CAP, 400);
});

test('timers decay and run out', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'hurt', x: 0, y: 0 }, ship);
  feelEvent(f, { type: 'kill', x: 0, y: 0 }, ship);
  updateFeel(f, 0.05);
  assert.equal(f.hitstop, 0);
  assert.ok(f.shake < 10 && f.shake > 0);
  updateFeel(f, 1);
  assert.deepEqual([f.shake, f.hurt, f.rings.length, f.particles.length], [0, 0, 0, 0]);
});

test('a fallen boss explodes three times in a row and flashes white', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'bossDown', x: 400, y: 150 }, ship);
  assert.ok(f.white > 0);
  const counts = [];
  for (const dt of [0, 0.15, 0.15]) {
    updateFeel(f, dt);
    counts.push(f.rings.length);
  }
  assert.deepEqual(counts, [1, 2, 3]);
  assert.deepEqual(f.rings.map(r => r.x), [364, 400, 436]);
});

test('shake offset stays inside the shake amount', () => {
  const f = createFeel({ rand: () => 0.99 });
  assert.deepEqual(shakeOffset(f), { x: 0, y: 0 });
  f.shake = 5;
  const o = shakeOffset(f);
  assert.ok(Math.abs(o.x) <= 5 && Math.abs(o.y) <= 5 && o.x > 4);
});

test('colour mixing and the combo heat steps', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(withAlpha('#ff0080', 0.5), 'rgba(255,0,128,0.5)');
  const steps = [1, 2, 4, 8].map(c => heatColor(c, '#00f5ff', '#ffe600'));
  assert.equal(steps[0], '#00f5ff');
  assert.equal(steps[3], '#ffe600');
  assert.equal(new Set(steps).size, 4);
});
