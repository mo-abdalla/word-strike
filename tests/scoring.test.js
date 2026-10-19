// tests/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comboFor, wordPoints, registerKill, registerAssistKill, registerMiss, accuracy, rollingWpm, finalWpm } from '../js/scoring.js';

const freshRun = () => ({ streak: 0, combo: 1, maxCombo: 1, score: 0, mods: { magnet: 0 } });

test('combo thresholds', () => {
  const cases = [[0, 1], [1, 1], [2, 2], [3, 2], [4, 4], [7, 4], [8, 8], [20, 8]];
  for (const [streak, combo] of cases) assert.equal(comboFor(streak), combo, `streak ${streak}`);
});

test('word points', () => {
  assert.equal(wordPoints(5, 4), 200);
  assert.equal(wordPoints(5, 1, 1.2), 60);
});

test('registerKill grows the combo from the second kill', () => {
  const run = freshRun();
  assert.equal(registerKill(run, 3), 30);
  assert.equal(registerKill(run, 3), 60);
  assert.equal(run.score, 90);
  assert.equal(run.combo, 2);
  assert.equal(run.maxCombo, 2);
});

test('magnet adds 20% per stack', () => {
  const run = freshRun();
  run.mods.magnet = 2;
  assert.equal(registerKill(run, 5), 70);
});

test('registerMiss resets streak and combo', () => {
  const run = { ...freshRun(), streak: 5, combo: 4, maxCombo: 4 };
  registerMiss(run);
  assert.equal(run.streak, 0);
  assert.equal(run.combo, 1);
  assert.equal(run.maxCombo, 4);
});

test('accuracy', () => {
  assert.equal(accuracy(0, 0), 1);
  assert.equal(accuracy(9, 10), 0.9);
});

test('rolling wpm uses the last 10 seconds only', () => {
  assert.equal(rollingWpm([{ t: 1, chars: 50 }, { t: 9.5, chars: 10 }], 10), 72);
  assert.equal(rollingWpm([{ t: 0, chars: 50 }], 10.5), 0);
});

test('final wpm', () => {
  assert.equal(finalWpm(300, 60), 60);
  assert.equal(finalWpm(10, 0), 0);
});

test('registerKill applies a bonus multiplier', () => {
  const run = freshRun();
  run.mods.magnet = 2;
  assert.equal(registerKill(run, 5, 2), 140);
});

test('assist kill scores at the current combo without growing it', () => {
  const run = { ...freshRun(), streak: 4, combo: 4, maxCombo: 4 };
  assert.equal(registerAssistKill(run, 3), 120);
  assert.equal(run.streak, 4);
  assert.equal(run.combo, 4);
  assert.equal(run.score, 120);
});
