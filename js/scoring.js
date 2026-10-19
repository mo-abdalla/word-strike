// js/scoring.js
// Combo, points, accuracy and speed. Pure functions over a run object.

export function comboFor(streak) {
  if (streak >= 8) return 8;
  if (streak >= 4) return 4;
  if (streak >= 2) return 2;
  return 1;
}

export function wordPoints(length, combo, multiplier = 1) {
  return Math.round(length * 10 * combo * multiplier);
}

const magnetMultiplier = run => 1 + 0.2 * run.mods.magnet;

export function registerKill(run, wordLength, bonus = 1) {
  run.streak += 1;
  run.combo = comboFor(run.streak);
  run.maxCombo = Math.max(run.maxCombo, run.combo);
  const points = wordPoints(wordLength, run.combo, magnetMultiplier(run) * bonus);
  run.score += points;
  return points;
}

// A word finished by an upgrade (chain, turret): scores at the current combo without growing it.
export function registerAssistKill(run, wordLength) {
  const points = wordPoints(wordLength, run.combo, magnetMultiplier(run));
  run.score += points;
  return points;
}

export function registerMiss(run) {
  run.streak = 0;
  run.combo = 1;
}

export function accuracy(correct, total) {
  return total === 0 ? 1 : correct / total;
}

export function rollingWpm(samples, now, windowSec = 10) {
  const chars = samples
    .filter(s => now - s.t <= windowSec)
    .reduce((sum, s) => sum + s.chars, 0);
  return Math.round(chars / 5 / (windowSec / 60));
}

export function finalWpm(correctKeys, seconds) {
  return seconds <= 0 ? 0 : Math.round(correctKeys / 5 / (seconds / 60));
}
