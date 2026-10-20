// js/audio.js
// Web Audio output for the voices in sound.js and music.js. The context starts on the first key or click,
// because browsers refuse to start audio before a user gesture. Until then every call is a no-op.
// Effects and music go through separate gains, so each has its own level and mute silences both.
import { effectiveSfx, effectiveMusic } from './sound.js';
import { STEP_SEC, LOOP_STEPS, stepVoices } from './music.js';

const ATTACK = 0.005;
const SILENT = 0.0001;
const NOISE_SEC = 1;
const LOOKAHEAD_SEC = 0.12; // music is scheduled this far ahead on the audio clock
const START_GAP_SEC = 0.05;
const FADE_SEC = 0.15;

function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_SEC, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function createAudio(settings) {
  let ctx = null;
  let sfx = null;
  let music = null;
  let noiseBuffer = null;
  const song = { on: false, layers: null, step: 0, next: 0, level: 0 };

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    ctx = new AudioContext();
    sfx = ctx.createGain();
    sfx.gain.value = effectiveSfx(settings);
    sfx.connect(ctx.destination);
    music = ctx.createGain();
    music.gain.value = effectiveMusic(settings) * song.level;
    music.connect(ctx.destination);
    noiseBuffer = makeNoise(ctx);
  }

  function envelope(gain, t, vol, dur) {
    gain.gain.setValueAtTime(SILENT, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + ATTACK);
    gain.gain.exponentialRampToValueAtTime(SILENT, t + dur);
  }

  function playTone(freq, type, dur, vol, delay = 0, out = sfx) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    envelope(gain, t, vol, dur);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playNoise(dur, vol, delay, cutoff, filterType, out = sfx) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    envelope(gain, t, vol, dur);
    src.connect(filter).connect(gain).connect(out);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function playVoices(voices, extraDelay, out) {
    for (const v of voices) {
      if (v.kind === 'tone') playTone(v.freq, v.type, v.dur, v.vol, v.delay + extraDelay, out);
      else playNoise(v.dur, v.vol, v.delay + extraDelay, v.cutoff, v.filter, out);
    }
  }

  function play(voices) {
    if (!ctx || effectiveSfx(settings) === 0) return;
    playVoices(voices, 0, sfx);
  }

  function applyMusicGain() {
    if (!music) return;
    music.gain.setTargetAtTime(effectiveMusic(settings) * song.level, ctx.currentTime, FADE_SEC / 3);
  }

  function apply(next) {
    settings = next;
    if (sfx) sfx.gain.value = effectiveSfx(settings);
    applyMusicGain();
  }

  // --- Music ---

  function startMusic(layers) {
    song.on = true;
    song.layers = layers;
    song.step = 0;
    song.next = ctx ? ctx.currentTime + START_GAP_SEC : 0;
  }

  function stopMusic() {
    song.on = false;
  }

  function setMusicLayers(layers) {
    song.layers = layers;
  }

  function setMusicLevel(level) {
    song.level = level;
    applyMusicGain();
  }

  // Called every frame. Schedules every step that starts before now + lookahead.
  // After a stall (hidden tab, slow frame) it resyncs instead of playing the missed steps at once.
  function scheduleMusic() {
    if (!ctx || !song.on || effectiveMusic(settings) === 0) return;
    if (song.next < ctx.currentTime) song.next = ctx.currentTime + START_GAP_SEC;
    while (song.next < ctx.currentTime + LOOKAHEAD_SEC) {
      playVoices(stepVoices(song.step, song.layers), song.next - ctx.currentTime, music);
      song.step = (song.step + 1) % LOOP_STEPS;
      song.next += STEP_SEC;
    }
  }

  return { unlock, play, apply, startMusic, stopMusic, setMusicLayers, setMusicLevel, scheduleMusic };
}
