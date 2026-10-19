// tests/waves.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waveConfig, tierWeights, pickTier, isBossWave, pickEnemyType, tierForType, pickWord } from '../js/waves.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('wave 1 config', () => {
  const c = waveConfig(1);
  assert.equal(c.count, 6);
  assert.equal(c.maxOnScreen, 3);
  assert.equal(c.baseSpeed, 32);
  assert.ok(near(c.spawnInterval, 2.08));
});

test('wave 5 config', () => {
  const c = waveConfig(5);
  assert.deepEqual([c.count, c.maxOnScreen, c.baseSpeed], [14, 5, 48]);
  assert.ok(near(c.spawnInterval, 1.6));
});

test('caps apply at high waves', () => {
  const c20 = waveConfig(20);
  assert.deepEqual([c20.count, c20.maxOnScreen, c20.baseSpeed, c20.spawnInterval], [30, 12, 108, 0.6]);
  assert.equal(waveConfig(100).baseSpeed, 110);
});

test('tier weights by wave band, each summing to 100', () => {
  const firsts = { 1: 70, 2: 70, 3: 45, 4: 45, 5: 25, 7: 25, 8: 15, 11: 15, 12: 10, 50: 10 };
  for (const [n, first] of Object.entries(firsts)) {
    const w = tierWeights(Number(n));
    assert.equal(w[0], first, `wave ${n}`);
    assert.equal(w.reduce((a, b) => a + b, 0), 100, `wave ${n} sum`);
  }
});

test('pickTier rolls against the weights', () => {
  assert.equal(pickTier([70, 30, 0, 0, 0], () => 0), 1);
  assert.equal(pickTier([70, 30, 0, 0, 0], () => 0.99), 2);
});

test('boss waves', () => {
  assert.deepEqual([4, 5, 10, 11].map(isBossWave), [false, true, true, false]);
});

test('enemy types only appear from their wave', () => {
  assert.equal(pickEnemyType(1, () => 0.99), 'drone');
  assert.equal(pickEnemyType(3, () => 0.9), 'seeker');
  assert.equal(pickEnemyType(6, () => 0.99), 'armored');
});

test('tier for type', () => {
  assert.equal(tierForType('armored', 6, () => 0), 4);
  assert.equal(tierForType('armored', 6, () => 0.99), 5);
  assert.equal(tierForType('drone', 1, () => 0), 1);
});

test('pickWord avoids on-screen words and repeated first letters', () => {
  assert.equal(pickWord(['apple', 'avid', 'bear', 'cat'], ['apple'], () => 0), 'bear');
  assert.equal(pickWord(['apple', 'avid'], ['apple'], () => 0), 'avid');
  assert.equal(pickWord(['apple'], ['apple'], () => 0), 'apple');
  assert.equal(pickWord(['كتاب', 'كلام', 'نجوم'], ['كتاب'], () => 0), 'نجوم');
});
