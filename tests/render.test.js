// tests/render.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turnToward, aimAngle } from '../js/render/ship.js';
import { nebulaColor } from '../js/render/starfield.js';

const ship = { x: 400, y: 730 };
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('the ship turns toward its target at a limited rate, the short way', () => {
  assert.ok(near(turnToward(0, 1, 0.1), 0.1));
  assert.ok(near(turnToward(0, 0.05, 0.1), 0.05));
  assert.ok(near(turnToward(3, -3, 0.1), 3.1));
  assert.equal(aimAngle(ship, null), 0);
  assert.ok(near(aimAngle(ship, { x: 400, y: 0 }), 0));
});

test('the nebula changes colour with the wave and cycles', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 0].map(nebulaColor), ['purple', 'cyan', 'pink', 'green', 'purple', 'purple']);
});
