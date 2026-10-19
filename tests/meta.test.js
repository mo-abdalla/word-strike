// tests/meta.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, themeIndex, applyTheme } from '../js/meta/themes.js';
import { ACHIEVEMENTS, newAchievements, unlockedFrom } from '../js/meta/achievements.js';
import { BOARD_SIZE, cleanRecords, mergeBoard, qualifies, makeRecord, addRecord } from '../js/meta/leaderboard.js';
import { createRun } from '../js/game.js';

// --- themes ---

test('four themes, each setting the same variables', () => {
  assert.deepEqual(THEMES.map(t => t.name), ['Cyber', 'Synth', 'Matrix', 'Vapor']);
  const keys = Object.keys(THEMES[0].vars).sort();
  for (const t of THEMES) assert.deepEqual(Object.keys(t.vars).sort(), keys, t.name);
});

test('theme index wraps and reads the old string value', () => {
  assert.deepEqual([0, 3, 4, -1, '2', 'junk', null].map(themeIndex), [0, 3, 0, 3, 2, 0, 0]);
});

test('applyTheme writes every variable on the root', () => {
  const set = {};
  const root = { style: { setProperty: (k, v) => { set[k] = v; } } };
  assert.equal(applyTheme(root, 2).name, 'Matrix');
  assert.equal(set['--bg'], '#020a02');
  assert.equal(Object.keys(set).length, Object.keys(THEMES[2].vars).length);
});

// --- achievements ---

const WORDS = { 1: ['ab'], 2: ['abcd'], 3: ['abcdef'], 4: ['abcdefgh'], 5: ['abcdefghijk'] };
const freshRun = (extra = {}) => Object.assign(createRun({ lang: 'en', words: WORDS, width: 800, height: 800 }), extra);

test('eight achievements with the old ids and both languages', () => {
  assert.deepEqual(ACHIEVEMENTS.map(a => a.id),
    ['first_blood', 'century', 'combo8', 'level10', 'flawless', 'perfect', 'speedster', 'boss_slayer']);
  for (const a of ACHIEVEMENTS) assert.ok(a.name.en && a.name.ar && a.icon, a.id);
});

test('each rule unlocks on its own condition', () => {
  const cases = [
    ['first_blood', freshRun({ kills: 1 }), 0],
    ['century', freshRun({ kills: 10 }), 90],
    ['combo8', freshRun({ maxCombo: 8 }), 0],
    ['level10', freshRun({ wave: 10 }), 0],
    ['flawless', freshRun({ flawlessWaves: 1 }), 0],
    ['perfect', freshRun({ over: true, totalKeys: 20, correctKeys: 20, wavesCleared: 2 }), 0],
    ['speedster', freshRun({ over: true, correctKeys: 300, time: 60 }), 0],
    ['boss_slayer', freshRun({ bossKills: 1 }), 0],
  ];
  for (const [id, run, wordsBefore] of cases) {
    assert.ok(newAchievements(run, wordsBefore, {}).includes(id), id);
  }
});

test('nothing unlocks for an empty run, and nothing twice', () => {
  assert.deepEqual(newAchievements(freshRun(), 0, {}), []);
  assert.deepEqual(newAchievements(freshRun({ kills: 1 }), 0, { first_blood: true }), []);
});

test('perfect and speedster wait for the end of the run', () => {
  const run = freshRun({ totalKeys: 300, correctKeys: 300, wavesCleared: 2, time: 60 });
  assert.deepEqual(newAchievements(run, 0, {}), []);
  run.over = true;
  assert.deepEqual(newAchievements(run, 0, {}), ['perfect', 'speedster']);
});

test('perfect needs two cleared waves and full accuracy', () => {
  assert.deepEqual(newAchievements(freshRun({ over: true, totalKeys: 5, correctKeys: 5, wavesCleared: 1 }), 0, {}), []);
  assert.deepEqual(newAchievements(freshRun({ over: true, totalKeys: 6, correctKeys: 5, wavesCleared: 2 }), 0, {}), []);
});

test('stored unlocks: only a plain object counts', () => {
  assert.deepEqual(unlockedFrom({ combo8: true }), { combo8: true });
  for (const bad of [null, [], 'x', 3]) assert.deepEqual(unlockedFrom(bad), {});
});

// --- leaderboard ---

test('records are cleaned: junk dropped, scores made numbers, old ones kept', () => {
  assert.deepEqual(cleanRecords('nope'), []);
  assert.deepEqual(cleanRecords([null, 3, { name: 'OLD', score: '900', level: 4 }]),
    [{ name: 'OLD', score: 900, level: 4 }]);
});

test('global and local merge, highest first, ten at most', () => {
  const local = Array.from({ length: 8 }, (_, i) => ({ name: `L${i}`, score: i * 10 }));
  const global = [{ name: 'G', score: 55 }, { name: 'H', score: 500 }, { name: 'I', score: 1 }];
  const board = mergeBoard(global, local);
  assert.equal(board.length, BOARD_SIZE);
  assert.equal(board[0].name, 'H');
  assert.deepEqual(board.map(r => r.score), [500, 70, 60, 55, 50, 40, 30, 20, 10, 1]);
});

test('a score qualifies on a short board or above the tenth', () => {
  const full = Array.from({ length: 10 }, (_, i) => ({ score: 100 - i }));
  assert.equal(qualifies(0, []), false);
  assert.equal(qualifies(5, []), true);
  assert.equal(qualifies(91, full), false);
  assert.equal(qualifies(92, full), true);
});

test('makeRecord trims the name and defaults it', () => {
  const base = { score: 10, wave: 3, wpm: 40, lang: 'ar', date: '2026-10-19' };
  assert.equal(makeRecord({ ...base, name: '  ' }).name, 'PLAYER');
  assert.equal(makeRecord({ ...base, name: ' مو الكاتب السريع جداً ' }).name, 'مو الكاتب ال');
  assert.equal(makeRecord({ ...base, name: 'Mo' }).wave, 3);
});

test('addRecord keeps the local list sorted and at ten', () => {
  const local = Array.from({ length: 10 }, (_, i) => ({ name: `L${i}`, score: (i + 1) * 10 }));
  const next = addRecord(local, { name: 'NEW', score: 55 });
  assert.equal(next.length, 10);
  assert.equal(next[5].name, 'NEW');
  assert.equal(next[9].score, 20);
});
