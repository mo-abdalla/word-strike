// tests/run-stats.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const enemy = (id, word) => ({ id, type: 'drone', word, typed: 0, x: 100, y: 100, vx: 0, vy: 0, speed: 0, dead: false });
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

function waveWith(n, ...enemies) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  startWave(run, n);
  run.toSpawn = 0;
  run.enemies.push(...enemies);
  return run;
}

test('a wave with no wrong key counts as flawless', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.wavesCleared, 1);
  assert.equal(run.flawlessWaves, 1);
});

test('one wrong key spoils the wave, and the count resets next wave', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  onChar(run, 'z');
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.wavesCleared, 1);
  assert.equal(run.flawlessWaves, 0);
  startWave(run, 2);
  assert.equal(run.waveMisses, 0);
});

test('a guarded miss still spoils the wave', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  run.mods.comboGuard = 1;
  startWave(run, 1);
  run.toSpawn = 0;
  onChar(run, 'z');
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.flawlessWaves, 0);
});

test('a fallen boss is counted', () => {
  const run = waveWith(5);
  run.enemies[0].hp = 1;
  typeWord(run, run.enemies[0].word);
  assert.equal(run.bossKills, 1);
});
