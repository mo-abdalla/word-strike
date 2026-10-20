// tests/sound.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_KEY, DEFAULT_AUDIO, audioSettings, effectiveSfx, shotFreq, soundFor } from '../js/sound.js';

const near = (a, b) => Math.abs(a - b) < 1e-6;
const EVENTS = ['shot', 'kill', 'miss', 'hurt', 'bossSpawn', 'bossHit', 'bossDown', 'nova', 'zap', 'pulse', 'pick'];

test('settings: stored key, defaults and clamping', () => {
  assert.equal(AUDIO_KEY, 'ws_audio');
  assert.deepEqual(audioSettings(null), DEFAULT_AUDIO);
  assert.deepEqual(audioSettings([1]), DEFAULT_AUDIO);
  assert.deepEqual(audioSettings({ sfx: 2, music: -1, muted: true }), { music: 0, sfx: 1, muted: true });
  assert.deepEqual(audioSettings({ sfx: 'loud', muted: 'yes' }), { music: 0.6, sfx: 0.8, muted: false });
});

test('mute silences effects without losing the level', () => {
  assert.equal(effectiveSfx({ sfx: 0.5, muted: false }), 0.5);
  assert.equal(effectiveSfx({ sfx: 0.5, muted: true }), 0);
});

test('the shot climbs with the combo, an octave by x8', () => {
  const freqs = [1, 2, 4, 8].map(shotFreq);
  assert.equal(freqs[0], 520);
  assert.ok(near(freqs[3], 1040));
  for (let i = 1; i < 4; i++) assert.ok(freqs[i] > freqs[i - 1]);
  assert.ok(near(soundFor({ type: 'shot' }, 4)[0].freq, shotFreq(4)));
});

test('every spec event has a sound, and every voice is playable', () => {
  for (const type of EVENTS) {
    const voices = soundFor({ type }, 1);
    assert.ok(voices.length > 0, type);
    for (const v of voices) {
      assert.ok(v.kind === 'tone' || v.kind === 'noise', type);
      assert.ok(v.dur > 0 && v.vol > 0 && v.vol <= 1 && v.delay >= 0, type);
      if (v.kind === 'tone') assert.ok(v.freq > 0 && ['sine', 'square', 'sawtooth', 'triangle'].includes(v.type), type);
      else assert.ok(v.cutoff > 0, type);
    }
  }
});

test('a kill is a noise burst plus rising tones', () => {
  const voices = soundFor({ type: 'kill' });
  assert.equal(voices[0].kind, 'noise');
  const tones = voices.filter(v => v.kind === 'tone').map(v => v.freq);
  assert.deepEqual(tones, [...tones].sort((a, b) => a - b));
});

test('events without a sound play nothing', () => {
  assert.deepEqual(soundFor({ type: 'waveStart' }), []);
  assert.deepEqual(soundFor({ type: 'novaHit' }), []);
});
