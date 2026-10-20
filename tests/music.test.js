// tests/music.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BPM, LOOP_STEPS, STEP_SEC, layersFor, musicLevel, stepVoices } from '../js/music.js';
import { effectiveMusic } from '../js/sound.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;
const ALL = { beat: true, bass: true, melody: true, tension: true };
const loop = layers => Array.from({ length: LOOP_STEPS }, (_, s) => stepVoices(s, layers));

test('tempo: 110 BPM, sixteenth steps, a 4-bar loop', () => {
  assert.equal(BPM, 110);
  assert.equal(LOOP_STEPS, 64);
  assert.ok(near(STEP_SEC * LOOP_STEPS, (60 / 110) * 16));
});

test('layers join with the wave, tension only on boss waves', () => {
  assert.deepEqual(layersFor(1, false), { beat: true, bass: false, melody: false, tension: false });
  assert.deepEqual(layersFor(3, false), { beat: true, bass: true, melody: false, tension: false });
  assert.deepEqual(layersFor(5, true), { beat: true, bass: true, melody: false, tension: true });
  assert.deepEqual(layersFor(6, false), { beat: true, bass: true, melody: true, tension: false });
});

test('level follows the phase: full, ducked, silent', () => {
  assert.deepEqual(['playing', 'paused', 'upgradePick', 'gameover', 'menu'].map(musicLevel), [1, 0.35, 0.35, 0, 0]);
});

test('mute silences music without losing its level', () => {
  assert.equal(effectiveMusic({ music: 0.6, muted: false }), 0.6);
  assert.equal(effectiveMusic({ music: 0.6, muted: true }), 0);
});

test('the beat: a kick on every beat, hats between, a snare on 2 and 4', () => {
  const beat = loop(layersFor(1, false));
  const kicks = beat.map(v => v.some(x => x.kind === 'tone' && x.freq === 55));
  assert.equal(kicks.filter(Boolean).length, 16);
  assert.ok(kicks[0] && kicks[4] && !kicks[2]);
  assert.equal(beat[2][0].filter, 'highpass');
  assert.ok(beat[4].some(x => x.kind === 'noise' && x.filter === 'lowpass'));
  assert.ok(beat.flat().every(v => v.kind === 'noise' || v.type === 'sine'));
});

test('bass follows the chord roots Am F C G', () => {
  const roots = [0, 16, 32, 48].map(s => stepVoices(s, layersFor(3, false)).find(v => v.type === 'sawtooth').freq);
  assert.deepEqual(roots, [110, 87.31, 130.81, 98]);
});

test('melody and tension stay out until their layer is on', () => {
  const early = loop(layersFor(3, false)).flat();
  assert.ok(!early.some(v => v.type === 'triangle' || v.type === 'square'));
  const late = loop(layersFor(6, false)).flat();
  assert.equal(late.filter(v => v.type === 'triangle').length, 16);
  const boss = loop(layersFor(5, true)).flat();
  assert.deepEqual([...new Set(boss.filter(v => v.type === 'square').map(v => v.freq))], [880, 932.33]);
});

test('the loop wraps and every voice is playable', () => {
  assert.deepEqual(stepVoices(LOOP_STEPS, ALL), stepVoices(0, ALL));
  assert.deepEqual(stepVoices(-1, ALL), stepVoices(LOOP_STEPS - 1, ALL));
  for (const v of loop(ALL).flat()) {
    assert.ok(v.dur > 0 && v.vol > 0 && v.vol <= 1 && v.delay === 0);
    if (v.kind === 'tone') assert.ok(v.freq > 0);
    else assert.ok(v.cutoff > 0 && ['lowpass', 'highpass'].includes(v.filter));
  }
});
