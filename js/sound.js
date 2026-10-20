// js/sound.js
// Sound design as data: the voices each game event plays. audio.js turns them into Web Audio nodes.
// A voice is a tone {kind:'tone', freq, type, dur, vol, delay} or a noise burst {kind:'noise', dur, vol, delay, cutoff}.

export const AUDIO_KEY = 'ws_audio';
export const DEFAULT_AUDIO = { music: 0.6, sfx: 0.8, muted: false };
const SHOT_BASE_HZ = 520;
const COMBO_STEPS = { 1: 0, 2: 3, 4: 7, 8: 12 }; // semitones above the base, per combo level

const clamp01 = v => Math.min(1, Math.max(0, v));
const level = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? clamp01(v) : fallback);

// ws_audio is {music, sfx, muted}. Anything missing or broken falls back to the defaults.
export function audioSettings(raw) {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    music: level(r.music, DEFAULT_AUDIO.music),
    sfx: level(r.sfx, DEFAULT_AUDIO.sfx),
    muted: r.muted === true,
  };
}

export function effectiveSfx(settings) {
  return settings.muted ? 0 : settings.sfx;
}

const tone = (freq, type, dur, vol, delay = 0) => ({ kind: 'tone', freq, type, dur, vol, delay });
const noise = (dur, vol, delay = 0, cutoff = 2000) => ({ kind: 'noise', dur, vol, delay, cutoff });

// The shot climbs with the combo: ×1 at the base, ×8 an octave up.
export function shotFreq(combo) {
  return SHOT_BASE_HZ * 2 ** (COMBO_STEPS[combo] / 12);
}

export function soundFor(ev, combo = 1) {
  switch (ev.type) {
    case 'shot':
      return [tone(shotFreq(combo), 'square', 0.05, 0.06)];
    case 'kill':
      return [noise(0.16, 0.22, 0, 1800), tone(440, 'triangle', 0.08, 0.1, 0.02),
        tone(587, 'triangle', 0.08, 0.1, 0.06), tone(784, 'triangle', 0.1, 0.1, 0.1)];
    case 'miss':
      return [tone(150, 'square', 0.07, 0.08)];
    case 'hurt':
      return [tone(70, 'sine', 0.35, 0.4), noise(0.2, 0.2, 0, 400)];
    case 'bossSpawn':
      return [0, 0.22, 0.44, 0.66].map((d, i) => tone(i % 2 ? 440 : 660, 'sawtooth', 0.18, 0.09, d));
    case 'bossHit':
      return [noise(0.12, 0.2, 0, 1200), tone(330, 'triangle', 0.12, 0.12)];
    case 'bossDown':
      return [0, 0.15, 0.3].flatMap(d => [noise(0.3, 0.3, d, 900), tone(110, 'sine', 0.3, 0.25, d)]);
    case 'nova':
      return [noise(0.5, 0.35, 0, 700), tone(220, 'sine', 0.4, 0.2)];
    case 'zap':
      return [tone(1200, 'sawtooth', 0.05, 0.04)];
    case 'pulse':
      return [tone(300, 'sine', 0.3, 0.12), tone(450, 'sine', 0.3, 0.1, 0.05)];
    case 'pick':
      return [tone(880, 'sine', 0.14, 0.1), tone(1320, 'sine', 0.14, 0.1, 0.05), tone(1760, 'sine', 0.2, 0.08, 0.1)];
    default:
      return [];
  }
}
