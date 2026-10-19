// js/boss.js
// Boss wave numbers: hit points, fire rate, word tiers and missile letters. Pure functions.

export const BOSS_Y = 150;
export const BOSS_REWARD = 500;
export const MISSILE_SPEED_MUL = 1.5;
const MISSILE_OFFSET_Y = 90;

export function bossHp(n) {
  return 3 + Math.floor(n / 5) * 2;
}

export function fireInterval(n) {
  return Math.max(1.5, 3.5 - 0.2 * (n / 5));
}

// Boss words come from tiers 4-5.
export function bossWordTier(rand = Math.random) {
  return 4 + Math.floor(rand() * 2);
}

// A missile's one-letter word: any letter that starts a word in this language's pool.
export function missileLetters(words) {
  const letters = new Set();
  for (const tier of Object.values(words)) for (const w of tier) letters.add(w[0]);
  return [...letters];
}

export function missileSpawn(boss) {
  return { x: boss.x, y: boss.y + MISSILE_OFFSET_Y };
}
