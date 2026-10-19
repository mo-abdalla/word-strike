// tests/targeting.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTarget, lockedEnemy, handleChar, releaseLock } from '../js/targeting.js';

const enemy = (id, word, y, extra = {}) => ({ id, word, y, x: 0, typed: 0, dead: false, ...extra });
const runWith = (...enemies) => ({ enemies, lockId: null });

test('locks on the enemy closest to the ship', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'lamp', 300), enemy(3, 'orbit', 400));
  const res = handleChar(run, 'l');
  assert.equal(res.kind, 'hit');
  assert.equal(res.enemy.id, 2);
  assert.equal(run.lockId, 2);
  assert.equal(run.enemies[1].typed, 1);
});

test('miss when no word starts with the key', () => {
  const run = runWith(enemy(1, 'laser', 100));
  assert.deepEqual(handleChar(run, 'z'), { kind: 'miss', enemy: null });
  assert.equal(run.lockId, null);
});

test('lock survives a wrong key', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'orbit', 50));
  handleChar(run, 'l');
  const res = handleChar(run, 'o');
  assert.equal(res.kind, 'miss');
  assert.equal(res.enemy.id, 1);
  assert.equal(run.lockId, 1);
  assert.equal(run.enemies[0].typed, 1);
});

test('last letter kills', () => {
  const run = runWith(enemy(1, 'go', 100));
  handleChar(run, 'g');
  const res = handleChar(run, 'o');
  assert.equal(res.kind, 'kill');
  assert.equal(res.enemy.typed, 2);
});

test('releaseLock lets you pick another enemy, typed letters stay', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'orbit', 50));
  handleChar(run, 'l');
  releaseLock(run);
  assert.equal(run.lockId, null);
  assert.equal(handleChar(run, 'o').enemy.id, 2);
  assert.equal(run.enemies[0].typed, 1);
});

test('a dead lock target is cleared', () => {
  const run = runWith(enemy(1, 'laser', 100));
  handleChar(run, 'l');
  run.enemies[0].dead = true;
  assert.equal(lockedEnemy(run), null);
  assert.equal(run.lockId, null);
});

test('unlocked half-typed enemy matches on its next letter', () => {
  const run = runWith(enemy(1, 'laser', 100, { typed: 2 }));
  assert.equal(findTarget(run.enemies, 's').id, 1);
  assert.equal(findTarget(run.enemies, 'l'), null);
});

test('arabic words, strict alef', () => {
  const run = runWith(enemy(1, 'كتاب', 100), enemy(2, 'أنا', 50));
  for (const ch of 'كتا') assert.equal(handleChar(run, ch).kind, 'hit');
  assert.equal(handleChar(run, 'ب').kind, 'kill');
  releaseLock(run);
  assert.equal(handleChar(run, 'ا').kind, 'miss');
  assert.equal(handleChar(run, 'أ').kind, 'hit');
});
