// js/music.js
// The music as data: a 4-bar loop at 110 BPM in A minor (Am F C G), in 16th-note steps.
// Layers join with the wave: beat (1+), bass (3+), a sparse melody (6+), and tension on boss waves.
// stepVoices() returns the voices that start on one step, in the same shape as sound.js voices.

export const BPM = 110;
export const LOOP_STEPS = 64; // 4 bars × 16 sixteenths
export const STEP_SEC = 60 / BPM / 4;
const BAR_STEPS = 16;
const BASS_FROM_WAVE = 3;
const MELODY_FROM_WAVE = 6;

// Root of each bar's chord (Hz, bass register) and its chord tones for the melody (an octave and more up).
const BARS = [
  { root: 110.0, tones: [440.0, 523.25, 659.25] },  // Am
  { root: 87.31, tones: [349.23, 440.0, 523.25] },  // F
  { root: 130.81, tones: [523.25, 659.25, 783.99] }, // C
  { root: 98.0, tones: [392.0, 493.88, 587.33] },   // G
];
const MELODY = { 0: 0, 6: 1, 10: 2, 14: 1 }; // step in bar → chord tone index
const TENSION = [880.0, 932.33];               // A5 and B♭5, a semitone apart

const tone = (freq, type, dur, vol) => ({ kind: 'tone', freq, type, dur, vol, delay: 0 });
const noise = (dur, vol, cutoff, filter) => ({ kind: 'noise', dur, vol, delay: 0, cutoff, filter });

export function layersFor(wave, isBoss) {
  return { beat: wave >= 1, bass: wave >= BASS_FROM_WAVE, melody: wave >= MELODY_FROM_WAVE, tension: isBoss };
}

// Music follows the phase: full in play, low under the pause and upgrade screens, silent elsewhere.
export function musicLevel(phase) {
  if (phase === 'playing') return 1;
  if (phase === 'paused' || phase === 'upgradePick') return 0.35;
  return 0;
}

export function stepVoices(step, layers) {
  const s = ((step % LOOP_STEPS) + LOOP_STEPS) % LOOP_STEPS;
  const bar = BARS[Math.floor(s / BAR_STEPS)];
  const inBar = s % BAR_STEPS;
  const voices = [];
  if (layers.beat) {
    if (inBar % 4 === 0) voices.push(tone(55, 'sine', 0.14, 0.32));
    if (inBar % 4 === 2) voices.push(noise(0.03, 0.05, 6000, 'highpass'));
    if (inBar === 4 || inBar === 12) voices.push(noise(0.1, 0.12, 1800, 'lowpass'));
  }
  if (layers.bass && inBar % 2 === 0) {
    voices.push(tone(inBar % 4 === 2 ? bar.root * 2 : bar.root, 'sawtooth', STEP_SEC * 1.6, 0.07));
  }
  if (layers.melody && inBar in MELODY) {
    voices.push(tone(bar.tones[MELODY[inBar]], 'triangle', STEP_SEC * 3, 0.05));
  }
  if (layers.tension && inBar % 4 === 2) {
    voices.push(tone(TENSION[Math.floor(inBar / 4) % 2], 'square', STEP_SEC, 0.025));
  }
  return voices;
}
