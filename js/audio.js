// js/audio.js
// Web Audio output for the voices in sound.js. The context starts on the first key or click,
// because browsers refuse to start audio before a user gesture. Until then every call is a no-op.
import { effectiveSfx } from './sound.js';

const ATTACK = 0.005;
const SILENT = 0.0001;
const NOISE_SEC = 1;

function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_SEC, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function createAudio(settings) {
  let ctx = null;
  let sfx = null;
  let noiseBuffer = null;

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    ctx = new AudioContext();
    sfx = ctx.createGain();
    sfx.gain.value = effectiveSfx(settings);
    sfx.connect(ctx.destination);
    noiseBuffer = makeNoise(ctx);
  }

  function envelope(gain, t, vol, dur) {
    gain.gain.setValueAtTime(SILENT, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + ATTACK);
    gain.gain.exponentialRampToValueAtTime(SILENT, t + dur);
  }

  function playTone(freq, type, dur, vol, delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    envelope(gain, t, vol, dur);
    osc.connect(gain).connect(sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playNoise(dur, vol, delay, cutoff) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    envelope(gain, t, vol, dur);
    src.connect(filter).connect(gain).connect(sfx);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function play(voices) {
    if (!ctx || effectiveSfx(settings) === 0) return;
    for (const v of voices) {
      if (v.kind === 'tone') playTone(v.freq, v.type, v.dur, v.vol, v.delay);
      else playNoise(v.dur, v.vol, v.delay, v.cutoff);
    }
  }

  function apply(next) {
    settings = next;
    if (sfx) sfx.gain.value = effectiveSfx(settings);
  }

  return { unlock, play, apply };
}
