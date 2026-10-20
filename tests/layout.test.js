// tests/layout.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutFor } from '../js/layout.js';

test('desktop keeps the full size', () => {
  assert.deepEqual(layoutFor({ width: 1280, height: 800 }), { compact: false, scale: 1, labelScale: 1, particleCap: 400, shipOffset: 70 });
});

test('a tall phone is compact at full scale', () => {
  const l = layoutFor({ width: 375, height: 812, touch: true });
  assert.equal(l.compact, true);
  assert.equal(l.scale, 1);
  assert.equal(l.particleCap, 200);
});

test('a short play area scales down by height', () => {
  const l = layoutFor({ width: 375, height: 560, touch: true });
  assert.equal(l.scale, 0.7);
  assert.equal(l.shipOffset, 49);
});

test('the scale never drops below the minimum', () => {
  assert.equal(layoutFor({ width: 375, height: 400, touch: true }).scale, 0.6);
  assert.equal(layoutFor({ width: 375, height: 400, touch: true }).labelScale, 0.85);
});

test('a narrow window is compact without touch', () => {
  assert.equal(layoutFor({ width: 500, height: 800 }).compact, true);
});

test('touch alone is compact only up to tablet portrait width', () => {
  assert.equal(layoutFor({ width: 768, height: 1024, touch: true }).compact, true);
  assert.equal(layoutFor({ width: 1024, height: 768, touch: true }).compact, false);
});
