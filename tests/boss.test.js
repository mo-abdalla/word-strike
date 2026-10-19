// tests/boss.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bossHp, fireInterval, bossWordTier, missileLetters } from '../js/boss.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('boss numbers by wave', () => {
  assert.deepEqual([5, 10, 50, 100].map(bossHp), [5, 7, 23, 43]);
  assert.ok(near(fireInterval(5), 3.3));
  assert.ok(near(fireInterval(10), 3.1));
  assert.equal(fireInterval(100), 1.5);
  assert.equal(bossWordTier(() => 0), 4);
  assert.equal(bossWordTier(() => 0.99), 5);
});

test('missile letters are the first letters of the pool', () => {
  assert.deepEqual(missileLetters(WORDS), ['a', 'c', 'e', 'g', 'i', 'm', 'q', 'w', 'l']);
  assert.deepEqual(missileLetters({ 1: ['كتاب', 'نجم'], 2: ['كلام'] }), ['ك', 'ن']);
});
