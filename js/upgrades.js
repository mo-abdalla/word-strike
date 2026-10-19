// js/upgrades.js
// The upgrade pool, the three-card draw after each wave, and applying a pick.
// Game logic never imports this file: an upgrade only changes run.hp / run.maxHp or a counter in run.mods.

export const RARITY_WEIGHTS = { common: 60, rare: 30, epic: 10 };
const EPIC_FROM_WAVE = 3;
const CARDS = 3;

const bump = key => run => { run.mods[key] += 1; };

export const UPGRADES = [
  {
    id: 'shield', rarity: 'common', maxStacks: 3, icon: '🛡️',
    name: { en: 'Shield', ar: 'درع' },
    desc: { en: '+1 HP and +1 max HP.', ar: 'حياة إضافيّة، والحدّ الأعلى يزيد واحدة.' },
    apply(run) { run.maxHp += 1; run.hp += 1; },
  },
  {
    id: 'repair', rarity: 'rare', maxStacks: Infinity, icon: '🔧',
    name: { en: 'Repair', ar: 'إصلاح' },
    desc: { en: 'Restore HP to full.', ar: 'تعود الحياة كاملة.' },
    apply(run) { run.hp = run.maxHp; },
  },
  {
    id: 'slow_field', rarity: 'common', maxStacks: 3, icon: '🌀',
    name: { en: 'Slow Field', ar: 'حقل إبطاء' },
    desc: { en: 'Enemies in the bottom third move 20% slower.', ar: 'الأعداء في الثلث السفليّ أبطأ 20%.' },
    apply: bump('slowField'),
  },
  {
    id: 'focus', rarity: 'rare', maxStacks: 1, icon: '🎯',
    name: { en: 'Focus', ar: 'تركيز' },
    desc: { en: 'Your locked target stops moving.', ar: 'العدوّ المقفول عليه يتجمّد.' },
    apply: bump('focus'),
  },
  {
    id: 'combo_guard', rarity: 'common', maxStacks: 2, icon: '🔰',
    name: { en: 'Combo Guard', ar: 'حارس الكومبو' },
    desc: { en: 'The first miss each wave keeps your combo.', ar: 'أوّل خطأ في كلّ موجة لا يُسقط الكومبو.' },
    apply: bump('comboGuard'),
  },
  {
    id: 'chain', rarity: 'rare', maxStacks: 2, icon: '⚡',
    name: { en: 'Chain Lightning', ar: 'برق متسلسل' },
    desc: { en: 'A kill at ×4 combo or higher strips a letter from the nearest enemy.', ar: 'القتل بكومبو ×4 أو أعلى يحذف حرفاً من أقرب عدوّ.' },
    apply: bump('chain'),
  },
  {
    id: 'turret', rarity: 'rare', maxStacks: 2, icon: '🛰️',
    name: { en: 'Auto Turret', ar: 'برج آليّ' },
    desc: { en: 'Every 10s, strips a letter from a random enemy.', ar: 'كلّ 10 ثوانٍ يحذف حرفاً من عدوّ عشوائيّ.' },
    apply: bump('turret'),
  },
  {
    id: 'pulse', rarity: 'rare', maxStacks: 1, icon: '💠',
    name: { en: 'Pulse', ar: 'نبضة' },
    desc: { en: 'Every 15 kills, all enemies freeze for 2s.', ar: 'كلّ 15 قتلاً يتجمّد كلّ الأعداء ثانيتين.' },
    apply: bump('pulse'),
  },
  {
    id: 'magnet', rarity: 'common', maxStacks: 3, icon: '🧲',
    name: { en: 'Magnet', ar: 'مغناطيس' },
    desc: { en: '+20% points.', ar: 'نقاط أكثر بنسبة 20%.' },
    apply: bump('magnet'),
  },
  {
    id: 'short_circuit', rarity: 'common', maxStacks: 1, icon: '🔌',
    name: { en: 'Short Circuit', ar: 'دائرة قصيرة' },
    desc: { en: 'Splitters no longer split.', ar: 'المنشطر لا ينقسم.' },
    apply: bump('shortCircuit'),
  },
  {
    id: 'overdrive', rarity: 'epic', maxStacks: 1, icon: '🔥',
    name: { en: 'Overdrive', ar: 'اندفاع' },
    desc: { en: 'A clean word typed at 60+ WPM scores double.', ar: 'كلمة بلا خطأ وبسرعة 60+ كلمة/دقيقة بنقاط مضاعفة.' },
    apply: bump('overdrive'),
  },
  {
    id: 'nova', rarity: 'epic', maxStacks: 1, icon: '💥',
    name: { en: 'Nova Bomb', ar: 'قنبلة نوفا' },
    desc: { en: 'Enter destroys every enemy, once per wave.', ar: 'Enter يدمّر كلّ الأعداء، مرّة في كلّ موجة.' },
    apply: bump('nova'),
  },
];

export function upgradeById(id) {
  return UPGRADES.find(u => u.id === id);
}

export function stacksOf(run, id) {
  return run.picked.filter(p => p === id).length;
}

// Repair never maxes out, so the pool is never empty: it is the fallback the spec asks for.
export function availableUpgrades(run) {
  return UPGRADES.filter(u =>
    stacksOf(run, u.id) < u.maxStacks && (u.rarity !== 'epic' || run.wave >= EPIC_FROM_WAVE));
}

function pickRarity(pool, rand) {
  const rarities = [...new Set(pool.map(u => u.rarity))];
  const total = rarities.reduce((sum, r) => sum + RARITY_WEIGHTS[r], 0);
  let roll = rand() * total;
  for (const r of rarities) {
    roll -= RARITY_WEIGHTS[r];
    if (roll < 0) return r;
  }
  return rarities[rarities.length - 1];
}

export function drawUpgrades(run, rand = Math.random) {
  const pool = availableUpgrades(run);
  const cards = [];
  while (cards.length < CARDS && pool.length) {
    const rarity = pickRarity(pool, rand);
    const group = pool.filter(u => u.rarity === rarity);
    const card = group[Math.floor(rand() * group.length)];
    cards.push(card);
    pool.splice(pool.indexOf(card), 1);
  }
  return cards;
}

export function applyUpgrade(run, id) {
  upgradeById(id).apply(run);
  run.picked.push(id);
}
