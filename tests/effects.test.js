// tests/effects.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar, triggerNova } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

// A run with the given mods, nothing left to spawn, and hand-placed enemies.
function runWith(mods, ...enemies) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  Object.assign(run.mods, mods);
  startWave(run, 1);
  run.toSpawn = 0;
  run.enemies.push(...enemies);
  return run;
}

const enemy = (id, word, x, y, vy = 100) =>
  ({ id, type: 'drone', word, typed: 0, x, y, vx: 0, vy, speed: Math.abs(vy), dead: false });
const near = (a, b) => Math.abs(a - b) < 1e-9;
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

test('slow field slows enemies in the bottom third only', () => {
  const run = runWith({ slowField: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 600));
  update(run, 0.1);
  assert.ok(near(run.enemies[0].y, 110));
  assert.ok(near(run.enemies[1].y, 606));
});

test('focus freezes the locked enemy only', () => {
  const run = runWith({ focus: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  onChar(run, 'a');
  update(run, 0.1);
  assert.equal(run.enemies[0].y, 100);
  assert.ok(run.enemies[1].y > 100);
});

test('combo guard absorbs the first miss of each wave', () => {
  const run = runWith({ comboGuard: 1 }, enemy(1, 'ab', 100, 100));
  run.streak = 4;
  run.combo = 4;
  onChar(run, 'z');
  assert.equal(run.combo, 4);
  assert.equal(run.totalKeys, 1);
  onChar(run, 'z');
  assert.equal(run.combo, 1);
  startWave(run, 2);
  assert.equal(run.guardsLeft, 1);
});

test('chain strips letters from the enemy closest to the ship at x4', () => {
  const run = runWith({ chain: 2 },
    enemy(1, 'ab', 100, 100), enemy(2, 'mnop', 300, 400), enemy(3, 'ijkl', 500, 200));
  run.streak = 3;
  run.combo = 2;
  typeWord(run, 'ab');
  assert.equal(run.combo, 4);
  assert.equal(run.enemies[1].typed, 2);
  assert.equal(run.enemies[2].typed, 0);
  assert.ok(run.events.some(e => e.type === 'zap'));
});

test('no chain below x4', () => {
  const run = runWith({ chain: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'mnop', 300, 400));
  typeWord(run, 'ab');
  assert.equal(run.enemies[1].typed, 0);
});

test('a chain that finishes a word scores at the current combo, without streak or keys', () => {
  const run = runWith({ chain: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 400));
  run.streak = 3;
  run.combo = 2;
  typeWord(run, 'ab');
  assert.equal(run.score, 160);
  assert.equal(run.kills, 2);
  assert.equal(run.streak, 4);
  assert.equal(run.correctKeys, 2);
  assert.ok(run.enemies[1].dead);
});

test('turret strips a letter from an unlocked enemy on its timer', () => {
  const run = runWith({ turret: 2 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(run, 'i');
  update(run, 4.9);
  assert.equal(run.enemies[1].typed, 0);
  update(run, 0.2);
  assert.equal(run.enemies[1].typed, 1);
  assert.equal(run.enemies[0].typed, 1);
});

test('pulse freezes every enemy for 2s after 15 kills', () => {
  const run = runWith({ pulse: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  run.pulseKills = 14;
  typeWord(run, 'ab');
  assert.equal(run.freezeTimer, 2);
  update(run, 1);
  assert.equal(run.enemies[0].y, 100);
  update(run, 1);
  assert.equal(run.enemies[0].y, 100);
  update(run, 0.1);
  assert.ok(run.enemies[0].y > 100);
});

test('overdrive doubles a clean fast word', () => {
  const run = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  typeWord(run, 'ijkl');
  assert.equal(run.score, 80);
});

test('overdrive skips a slow word and a word with a miss', () => {
  const slow = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(slow, 'i');
  update(slow, 2);
  typeWord(slow, 'jkl');
  assert.equal(slow.score, 40);

  const sloppy = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(sloppy, 'i');
  onChar(sloppy, 'z');
  typeWord(sloppy, 'jkl');
  assert.equal(sloppy.score, 40);
});

test('nova clears the screen once per wave without points', () => {
  const run = runWith({ nova: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  onChar(run, 'a');
  triggerNova(run);
  assert.equal(run.enemies.filter(e => !e.dead).length, 0);
  assert.equal(run.lockId, null);
  assert.equal(run.score, 0);
  assert.equal(run.kills, 0);
  run.enemies.push(enemy(3, 'ef', 100, 100));
  triggerNova(run);
  assert.equal(run.enemies[2].dead, false);
  startWave(run, 2);
  assert.equal(run.novaReady, true);
});

test('no nova without the upgrade', () => {
  const run = runWith({}, enemy(1, 'ab', 100, 100));
  triggerNova(run);
  assert.equal(run.enemies[0].dead, false);
});
