// tests/boss-wave.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar, triggerNova, START_HP } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const near = (a, b) => Math.abs(a - b) < 1e-9;
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

function bossRun(mods = {}) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  Object.assign(run.mods, mods);
  startWave(run, 5);
  return run;
}

const bossIn = run => run.enemies.find(e => e.type === 'boss');
const missile = (id, word, x, y) =>
  ({ id, type: 'missile', word, typed: 0, x, y, vx: 0, vy: 72, speed: 72, dead: false });

test('a boss wave spawns only the boss, centred at the top', () => {
  const run = bossRun();
  assert.equal(run.toSpawn, 0);
  assert.equal(run.enemies.length, 1);
  const boss = bossIn(run);
  assert.deepEqual([boss.x, boss.y, boss.hp, boss.maxHp], [400, 150, 5, 5]);
  assert.equal(boss.word, 'lmnopqrstuv');
  update(run, 1);
  assert.equal(run.enemies.length, 1);
  assert.equal(boss.y, 150);
  assert.ok(run.events.some(e => e.type === 'bossSpawn'));
});

test('the boss fires a one-letter missile at the ship', () => {
  const run = bossRun();
  update(run, 3.2);
  assert.equal(run.enemies.length, 1);
  update(run, 0.2);
  const m = run.enemies.find(e => e.type === 'missile');
  assert.equal(m.word, 'i');
  assert.equal(m.x, 400);
  assert.ok(near(m.vy, 72));
});

test('a finished boss word scores, costs one hp and brings a new word', () => {
  const run = bossRun();
  typeWord(run, 'lmnopqrstuv');
  const boss = bossIn(run);
  assert.equal(boss.hp, 4);
  assert.equal(boss.dead, false);
  assert.equal(boss.word, 'abcdefghijk');
  assert.equal(boss.typed, 0);
  assert.equal(run.lockId, null);
  assert.equal(run.score, 110);
  assert.equal(run.streak, 1);
  assert.ok(run.events.some(e => e.type === 'bossHit' && e.hp === 4));
});

test('a missile is closer than the boss, so it takes the lock', () => {
  const run = bossRun();
  run.enemies.push(missile(50, 'l', 400, 300));
  onChar(run, 'l');
  assert.equal(run.lockId, null);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(bossIn(run).typed, 0);
});

test('defeating the boss pays 500 per hp, clears missiles and ends the wave', () => {
  const run = bossRun();
  bossIn(run).hp = 1;
  run.enemies.push(missile(50, 'i', 200, 300));
  typeWord(run, 'lmnopqrstuv');
  assert.equal(bossIn(run).dead, true);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(run.score, 110 + 500 * 5);
  assert.ok(run.events.some(e => e.type === 'bossDown'));
  update(run, 0.016);
  assert.equal(run.waveCleared, true);
});

test('a missile reaching the ship costs one hp', () => {
  const run = bossRun();
  run.enemies.push(missile(50, 'i', 400, 725));
  update(run, 0.016);
  assert.equal(run.hp, START_HP - 1);
});

test('nova destroys missiles but not the boss', () => {
  const run = bossRun({ nova: 1 });
  run.enemies.push(missile(50, 'i', 200, 300));
  triggerNova(run);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(bossIn(run).dead, false);
});

test('turret strips letters from the boss word', () => {
  const run = bossRun({ turret: 2 });
  update(run, 1);
  update(run, 4.1);
  assert.equal(bossIn(run).typed, 1);
});

test('pulse freeze also holds the boss fire timer', () => {
  const run = bossRun();
  run.freezeTimer = 2;
  update(run, 1);
  update(run, 1);
  assert.ok(near(bossIn(run).fireTimer, 3.3));
  update(run, 0.1);
  assert.ok(near(bossIn(run).fireTimer, 3.2));
});
