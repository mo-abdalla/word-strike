// js/i18n.js
// UI strings. Every key must exist in both languages.

export const STRINGS = {
  en: {
    tagline: 'Type to fire',
    start: 'Start run',
    paused: 'Paused',
    resume: 'Resume',
    menu: 'Menu',
    gameOver: 'Ship down',
    playAgain: 'New run',
    score: 'Score',
    wave: 'Wave',
    best: 'Best',
    wpm: 'WPM',
    accuracy: 'Accuracy',
    maxCombo: 'Max combo',
    waveBanner: n => `Wave ${n}`,
    waveClear: n => `Wave ${n} cleared`,
    pickUpgrade: 'Pick an upgrade',
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    bossBanner: n => `Boss — Wave ${n}`,
    bossDown: 'Boss destroyed',
  },
  ar: {
    tagline: 'اكتب لتطلق النار',
    start: 'ابدأ الجولة',
    paused: 'متوقّف',
    resume: 'استئناف',
    menu: 'القائمة',
    gameOver: 'السفينة سقطت',
    playAgain: 'جولة جديدة',
    score: 'النقاط',
    wave: 'الموجة',
    best: 'الأفضل',
    wpm: 'كلمة/دقيقة',
    accuracy: 'الدقّة',
    maxCombo: 'أعلى كومبو',
    waveBanner: n => `الموجة ${n}`,
    waveClear: n => `الموجة ${n} اكتملت`,
    pickUpgrade: 'اختر ترقية',
    common: 'عاديّة',
    rare: 'نادرة',
    epic: 'ملحميّة',
    bossBanner: n => `الزعيم — الموجة ${n}`,
    bossDown: 'الزعيم سقط',
  },
};

export function t(lang, key, ...args) {
  const value = STRINGS[lang][key];
  return typeof value === 'function' ? value(...args) : value;
}

export function applyStrings(root, lang) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}
