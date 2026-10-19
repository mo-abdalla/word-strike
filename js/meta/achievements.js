// js/meta/achievements.js
// The eight achievements and the rule for each. Ids match the old game, so unlocks saved in ws_ach carry over.
import { accuracy, finalWpm } from '../scoring.js';

export const ACH_KEY = 'ws_ach';
export const WORDS_TOTAL_KEY = 'ws_words_total';
const CENTURY = 100;
const WAVE_GOAL = 10;
const PERFECT_MIN_WAVES = 2;
const SPEEDSTER_WPM = 60;

export const ACHIEVEMENTS = [
  { id: 'first_blood', icon: '🩸', name: { en: 'First Strike', ar: 'أول ضربة' },
    earned: run => run.kills >= 1 },
  { id: 'century', icon: '💯', name: { en: 'Centurion', ar: 'المئوي' },
    earned: (run, wordsBefore) => wordsBefore + run.kills >= CENTURY },
  { id: 'combo8', icon: '🔥', name: { en: 'Combo Master', ar: 'أستاذ الكومبو' },
    earned: run => run.maxCombo >= 8 },
  { id: 'level10', icon: '🌌', name: { en: 'Wave Ten', ar: 'الموجة العاشرة' },
    earned: run => run.wave >= WAVE_GOAL },
  { id: 'flawless', icon: '✨', name: { en: 'Flawless Wave', ar: 'موجة بلا خطأ' },
    earned: run => run.flawlessWaves >= 1 },
  { id: 'perfect', icon: '🎯', name: { en: 'Perfect Run', ar: 'جولة مثاليّة' },
    earned: run => run.over && run.totalKeys > 0
      && accuracy(run.correctKeys, run.totalKeys) === 1 && run.wavesCleared >= PERFECT_MIN_WAVES },
  { id: 'speedster', icon: '⚡', name: { en: 'Speedster', ar: 'سريع' },
    earned: run => run.over && finalWpm(run.correctKeys, run.time) >= SPEEDSTER_WPM },
  { id: 'boss_slayer', icon: '👾', name: { en: 'Boss Slayer', ar: 'قاتل الزعماء' },
    earned: run => run.bossKills >= 1 },
];

export function achievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// ws_ach holds {id: true}. Anything else stored there counts as nothing unlocked.
export function unlockedFrom(raw) {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
}

export function newAchievements(run, wordsBefore, unlocked) {
  return ACHIEVEMENTS.filter(a => !unlocked[a.id] && a.earned(run, wordsBefore)).map(a => a.id);
}
