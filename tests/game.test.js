// tests/game.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, resize, startWave, update, onChar, onBackspace, START_HP } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

function newRun(rand = () => 0.5) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand });
  startWave(run, 1);
  return run;
}

const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

test('first update spawns one drone at the top', () => {
  const run = newRun();
  update(run, 0.016);
  assert.equal(run.enemies.length, 1);
  assert.equal(run.enemies[0].type, 'drone');
  assert.equal(run.toSpawn, 5);
  assert.ok(run.enemies[0].y < 0);
});

test('typing a word kills it and scores', () => {
  const run = newRun();
  update(run, 0.016);
  const word = run.enemies[0].word;
  typeWord(run, word);
  assert.equal(run.kills, 1);
  assert.equal(run.score, word.length * 10);
  assert.equal(run.correctKeys, word.length);
  assert.ok(run.events.some(e => e.type === 'kill'));
  update(run, 0.016);
  assert.equal(run.enemies.length, 0);
});

test('wrong key counts a miss and resets the combo', () => {
  const run = newRun();
  update(run, 0.016);
  run.streak = 3;
  run.combo = 2;
  onChar(run, 'z');
  assert.equal(run.totalKeys, 1);
  assert.equal(run.correctKeys, 0);
  assert.equal(run.combo, 1);
  assert.ok(run.events.some(e => e.type === 'miss'));
});

test('enemy reaching the ship costs hp and resets the combo', () => {
  const run = newRun();
  update(run, 0.016);
  run.streak = 4;
  run.combo = 4;
  const e = run.enemies[0];
  e.x = run.ship.x;
  e.y = run.ship.y - 5;
  update(run, 0.016);
  assert.equal(run.hp, START_HP - 1);
  assert.equal(run.combo, 1);
  assert.equal(run.enemies.length, 0);
  assert.ok(run.events.some(ev => ev.type === 'hurt'));
});

test('hp reaching zero ends the run', () => {
  const run = newRun();
  update(run, 0.016);
  run.hp = 1;
  const e = run.enemies[0];
  e.x = run.ship.x;
  e.y = run.ship.y;
  update(run, 0.016);
  assert.equal(run.over, true);
  assert.ok(run.events.some(ev => ev.type === 'gameOver'));
});

test('wave clears when everything is spawned and dead', () => {
  const run = newRun();
  run.toSpawn = 0;
  update(run, 0.016);
  assert.equal(run.waveCleared, true);
  assert.ok(run.events.some(ev => ev.type === 'waveClear' && ev.wave === 1));
});

test('respects the on-screen limit', () => {
  const run = newRun();
  for (let i = 0; i < 4; i++) update(run, 2.1);
  assert.equal(run.enemies.length, 3);
  assert.equal(run.toSpawn, 3);
});

test('splitter releases two drones unless short-circuited', () => {
  for (const [shortCircuit, expected] of [[0, 2], [1, 0]]) {
    const run = newRun();
    run.mods.shortCircuit = shortCircuit;
    run.enemies.push({ id: 99, type: 'splitter', word: 'qrstuv', typed: 0, x: 400, y: 100, vx: 0, vy: 30, speed: 30, dead: false });
    typeWord(run, 'qrstuv');
    assert.equal(run.enemies.filter(e => !e.dead).length, expected, `shortCircuit=${shortCircuit}`);
  }
});

test('backspace releases the lock', () => {
  const run = newRun();
  update(run, 0.016);
  onChar(run, run.enemies[0].word[0]);
  assert.notEqual(run.lockId, null);
  onBackspace(run);
  assert.equal(run.lockId, null);
});

test('typing is ignored after the wave is cleared', () => {
  const run = newRun();
  run.toSpawn = 0;
  update(run, 0.016);
  onChar(run, 'z');
  assert.equal(run.totalKeys, 0);
});

test('the ship sits at the full offset by default', () => {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800 });
  assert.equal(run.scale, 1);
  assert.equal(run.ship.y, 730);
});

test('a smaller scale moves the ship closer to the bottom, and resize keeps it', () => {
  const run = createRun({ lang: 'en', words: WORDS, width: 375, height: 400, scale: 0.6 });
  assert.equal(run.ship.y, 358);
  resize(run, 375, 500);
  assert.equal(run.ship.y, 458);
  resize(run, 1280, 800, 1);
  assert.equal(run.scale, 1);
  assert.equal(run.ship.y, 730);
});
