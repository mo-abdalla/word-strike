// tests/state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPhaseMachine } from '../js/state.js';

test('starts in menu and reports it', () => {
  const seen = [];
  const m = createPhaseMachine((next, prev) => seen.push([next, prev]));
  assert.equal(m.get(), 'menu');
  assert.deepEqual(seen, [['menu', null]]);
});

test('follows the allowed transitions', () => {
  const seen = [];
  const m = createPhaseMachine(next => seen.push(next));
  for (const p of ['playing', 'paused', 'playing', 'upgradePick', 'playing', 'gameover', 'playing', 'gameover', 'menu']) m.set(p);
  assert.equal(m.get(), 'menu');
  assert.equal(seen.length, 10);
});

test('rejects an invalid transition', () => {
  const m = createPhaseMachine(() => {});
  assert.throws(() => m.set('paused'), /menu -> paused/);
});
