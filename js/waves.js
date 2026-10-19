// js/waves.js
// Wave difficulty curve and what each spawn looks like.
import { ENEMY_TYPES } from './enemies.js';

export function waveConfig(n) {
  return {
    count: Math.min(30, 4 + 2 * n),
    maxOnScreen: Math.min(12, 3 + Math.floor(n / 2)),
    baseSpeed: Math.min(110, 28 + 4 * n),
    spawnInterval: Math.max(0.6, 2.2 - 0.12 * n),
  };
}

// [last wave of the band, weights for tiers 1..5]
const TIER_BANDS = [
  [2,        [70, 30, 0, 0, 0]],
  [4,        [45, 40, 15, 0, 0]],
  [7,        [25, 40, 25, 10, 0]],
  [11,       [15, 30, 30, 20, 5]],
  [Infinity, [10, 25, 30, 25, 10]],
];

export function tierWeights(n) {
  return TIER_BANDS.find(([last]) => n <= last)[1];
}

export function pickTier(weights, rand = Math.random) {
  const roll = rand() * 100;
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (roll < sum) return i + 1;
  }
  return 1;
}

export function isBossWave(n) {
  return n % 5 === 0;
}

const TYPE_WEIGHTS = { drone: 60, seeker: 20, splitter: 12, armored: 8 };

export function pickEnemyType(n, rand = Math.random) {
  const available = Object.keys(TYPE_WEIGHTS).filter(t => ENEMY_TYPES[t].minWave <= n);
  const total = available.reduce((sum, t) => sum + TYPE_WEIGHTS[t], 0);
  let roll = rand() * total;
  for (const t of available) {
    roll -= TYPE_WEIGHTS[t];
    if (roll < 0) return t;
  }
  return available[available.length - 1];
}

export function tierForType(type, n, rand = Math.random) {
  const range = ENEMY_TYPES[type].tiers;
  if (!range) return pickTier(tierWeights(n), rand);
  const [lo, hi] = range;
  return lo + Math.floor(rand() * (hi - lo + 1));
}

export function pickWord(pool, onScreen, rand = Math.random) {
  const firstLetters = new Set(onScreen.map(w => w[0]));
  let candidates = pool.filter(w => !onScreen.includes(w) && !firstLetters.has(w[0]));
  if (!candidates.length) candidates = pool.filter(w => !onScreen.includes(w));
  if (!candidates.length) candidates = pool;
  return candidates[Math.floor(rand() * candidates.length)];
}
