# Word Strike Arcade — الخطّة ٥ب: الموسيقى

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** موسيقى مولَّدة أثناء الجولة: حلقة ٤ مقاطع بـ ١١٠ نبضة/دقيقة، تضاف طبقاتها مع الموجة، وتنخفض تحت الإيقاف والترقية، وتتوقّف في النهاية والقائمة. ومنزلق «الموسيقى» في لوحة الصوت.

**Architecture:** `js/music.js` الموسيقى كبيانات خالصة: الطبقات لكلّ موجة، والمستوى لكلّ مرحلة، والأصوات التي تبدأ في كلّ خطوة (١٦/١ من المقطع). `js/audio.js` يضيف قناة موسيقى منفصلة، ويجدول الخطوات قبل وقتها بقليل على ساعة الصوت، من حلقة الإطارات نفسها.

**Tech Stack:** كالخطط السابقة. Node v22.22.0 في السحابة.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — المرحلة ٨ من القسم ١٢ (القسم ٨ «الموسيقى» و«التحكّم»).

**الفرع:** `feat/arcade-music` من `master` (بعد دمج PR #5).

## Global Constraints

- كلّ قيود الخطط ١–٥أ سارية: لا ملفّات صوت ولا مكتبات، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`، `typing-game.html` لا يُلمس.
- كلّ صوت موسيقيّ يمرّ عبر `playTone` أو الضجيج المرشَّح في `js/audio.js`، ولا شيء قبل أوّل ضغطة.
- كلّ commit يترك اللعبة تعمل في المتصفّح.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test 'tests/*.test.js'`.
- الكتل أدناه ملفّات كاملة. السطر الأوّل في كلّ كتلة تعليق باسم الملفّ، وهو جزء من الملفّ. انسخ كلّ كتلة كما هي فوق الملفّ القائم أو كملفّ جديد.

## قرارات ليست في المواصفة

1. **السلّم والتتابع:** لا مينور، والأوتار Am ← F ← C ← G، مقطع لكلّ وتر.
2. **الإيقاع (موجة ١+):** ضربة جيبيّة ٥٥ هرتز على كلّ نبضة، وصنج (ضجيج عالي التمرير) بين النبضات، وطبلة (ضجيج منخفض التمرير) على ٢ و٤.
3. **الباص (موجة ٣+):** منشاريّة بثُمن النوتة، تتناوب بين جذر الوتر وديوانه.
4. **اللحن المتقطّع (موجة ٦+):** مثلّثيّة على نغمات الوتر في الخطوات ٠ و٦ و١٠ و١٤ من كلّ مقطع.
5. **التوتّر (موجات الزعيم):** مربّعة خافتة تتناوب بين A5 وB♭5 (نصف درجة) بين النبضات.
6. **الموسيقى للجولة فقط:** تبدأ مع الجولة، وتتوقّف في النهاية وعند العودة للقائمة. القائمة صامتة.
7. **المستوى:** كامل في اللعب، ٣٥٪ تحت الإيقاف وشاشة الترقية، ويتغيّر بانزلاق ١٥٠ مللي ثانية.
8. **المنزلق:** «الموسيقى» في لوحة الصوت تحت «المؤثّرات»، والقيمة الافتراضيّة ٠٫٦ (من الخطّة ٥أ). «كتم» يُسكت الاثنين.
9. **الجدولة:** على ساعة الصوت (`ctx.currentTime`) قبل الوقت بـ ١٢٠ مللي ثانية، من حلقة الإطارات. قاعدة «التوقيت من `dt`» تخصّ منطق اللعب، والصوت يحتاج ساعته ليبقى الإيقاع منتظماً. بعد توقّف (تبويب مخفيّ) تعيد المزامنة بدل أن تعزف ما فات دفعة واحدة.
10. **الضجيج يحمل نوع مرشّحه** (`filter: 'lowpass' | 'highpass'`). مؤثّرات ٥أ كلّها `lowpass` كما كانت.
11. **إن لم يعجب الصوتُ مو** فالمواصفة تسمح بالتأجيل: يكفي إرجاع هذا الـPR، ولا شيء آخر يعتمد عليه.

## خارج هذه الخطّة

الجوّال والانتقال (الخطّة ٦).

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/music.js` | جديد: الحلقة والطبقات والمستوى |
| `js/sound.js` | تعديل: `effectiveMusic`، ونوع المرشّح في الضجيج |
| `js/audio.js` | تعديل: قناة الموسيقى والجدولة |
| `js/main.js` | تعديل: بدء الموسيقى وإيقافها وطبقاتها ومستواها، ومنزلق الموسيقى |
| `js/i18n.js` | تعديل: `music` |
| `tests/music.test.js` | جديد |
| `tests/i18n.test.js` | تعديل |

---

### Task 1: الموسيقى كبيانات

**Files:**
- Create: `js/music.js`
- Modify: `js/sound.js`
- Test: `tests/music.test.js`

**Interfaces:**
- `BPM = 110`, `LOOP_STEPS = 64`, `STEP_SEC`
- `layersFor(wave, isBoss) → {beat, bass, melody, tension}`، `musicLevel(phase)`، `stepVoices(step, layers): Voice[]`
- `effectiveMusic(settings)`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/music.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BPM, LOOP_STEPS, STEP_SEC, layersFor, musicLevel, stepVoices } from '../js/music.js';
import { effectiveMusic } from '../js/sound.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;
const ALL = { beat: true, bass: true, melody: true, tension: true };
const loop = layers => Array.from({ length: LOOP_STEPS }, (_, s) => stepVoices(s, layers));

test('tempo: 110 BPM, sixteenth steps, a 4-bar loop', () => {
  assert.equal(BPM, 110);
  assert.equal(LOOP_STEPS, 64);
  assert.ok(near(STEP_SEC * LOOP_STEPS, (60 / 110) * 16));
});

test('layers join with the wave, tension only on boss waves', () => {
  assert.deepEqual(layersFor(1, false), { beat: true, bass: false, melody: false, tension: false });
  assert.deepEqual(layersFor(3, false), { beat: true, bass: true, melody: false, tension: false });
  assert.deepEqual(layersFor(5, true), { beat: true, bass: true, melody: false, tension: true });
  assert.deepEqual(layersFor(6, false), { beat: true, bass: true, melody: true, tension: false });
});

test('level follows the phase: full, ducked, silent', () => {
  assert.deepEqual(['playing', 'paused', 'upgradePick', 'gameover', 'menu'].map(musicLevel), [1, 0.35, 0.35, 0, 0]);
});

test('mute silences music without losing its level', () => {
  assert.equal(effectiveMusic({ music: 0.6, muted: false }), 0.6);
  assert.equal(effectiveMusic({ music: 0.6, muted: true }), 0);
});

test('the beat: a kick on every beat, hats between, a snare on 2 and 4', () => {
  const beat = loop(layersFor(1, false));
  const kicks = beat.map(v => v.some(x => x.kind === 'tone' && x.freq === 55));
  assert.equal(kicks.filter(Boolean).length, 16);
  assert.ok(kicks[0] && kicks[4] && !kicks[2]);
  assert.equal(beat[2][0].filter, 'highpass');
  assert.ok(beat[4].some(x => x.kind === 'noise' && x.filter === 'lowpass'));
  assert.ok(beat.flat().every(v => v.kind === 'noise' || v.type === 'sine'));
});

test('bass follows the chord roots Am F C G', () => {
  const roots = [0, 16, 32, 48].map(s => stepVoices(s, layersFor(3, false)).find(v => v.type === 'sawtooth').freq);
  assert.deepEqual(roots, [110, 87.31, 130.81, 98]);
});

test('melody and tension stay out until their layer is on', () => {
  const early = loop(layersFor(3, false)).flat();
  assert.ok(!early.some(v => v.type === 'triangle' || v.type === 'square'));
  const late = loop(layersFor(6, false)).flat();
  assert.equal(late.filter(v => v.type === 'triangle').length, 16);
  const boss = loop(layersFor(5, true)).flat();
  assert.deepEqual([...new Set(boss.filter(v => v.type === 'square').map(v => v.freq))], [880, 932.33]);
});

test('the loop wraps and every voice is playable', () => {
  assert.deepEqual(stepVoices(LOOP_STEPS, ALL), stepVoices(0, ALL));
  assert.deepEqual(stepVoices(-1, ALL), stepVoices(LOOP_STEPS - 1, ALL));
  for (const v of loop(ALL).flat()) {
    assert.ok(v.dur > 0 && v.vol > 0 && v.vol <= 1 && v.delay === 0);
    if (v.kind === 'tone') assert.ok(v.freq > 0);
    else assert.ok(v.cutoff > 0 && ['lowpass', 'highpass'].includes(v.filter));
  }
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/music.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/music.js`.

- [ ] **Step 3: اكتب التنفيذ** — أنشئ `js/music.js` واستبدل `js/sound.js`:

```js
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
```

```js
// js/sound.js
// Sound design as data: the voices each game event plays. audio.js turns them into Web Audio nodes.
// A voice is a tone {kind:'tone', freq, type, dur, vol, delay} or a noise burst {kind:'noise', dur, vol, delay, cutoff, filter}.

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

export function effectiveMusic(settings) {
  return settings.muted ? 0 : settings.music;
}

const tone = (freq, type, dur, vol, delay = 0) => ({ kind: 'tone', freq, type, dur, vol, delay });
const noise = (dur, vol, delay = 0, cutoff = 2000) => ({ kind: 'noise', dur, vol, delay, cutoff, filter: 'lowpass' });

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
```

- [ ] **Step 4: شغّل كلّ الاختبارات**

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ١٣٤ اختباراً، `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add js/music.js js/sound.js tests/music.test.js
git commit -m "feat(arcade): add the music loop and its layers as data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: نصّ المنزلق

**Files:**
- Modify: `js/i18n.js`, `tests/i18n.test.js`

- [ ] **Step 1: اكتب الاختبار الفاشل** — استبدل `tests/i18n.test.js`:

```js
// tests/i18n.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, t } from '../js/i18n.js';

test('arabic has every english key', () => {
  assert.deepEqual(Object.keys(STRINGS.ar).sort(), Object.keys(STRINGS.en).sort());
});

test('t returns plain and formatted strings', () => {
  assert.equal(t('ar', 'start'), 'ابدأ الجولة');
  assert.equal(t('en', 'waveBanner', 3), 'Wave 3');
  assert.equal(t('ar', 'waveClear', 7), 'الموجة 7 اكتملت');
});

test('upgrade screen strings', () => {
  assert.equal(t('ar', 'pickUpgrade'), 'اختر ترقية');
  assert.equal(t('en', 'epic'), 'Epic');
});

test('boss strings', () => {
  assert.equal(t('en', 'bossBanner', 5), 'Boss — Wave 5');
  assert.equal(t('ar', 'bossDown'), 'الزعيم سقط');
});

test('menu, panel and game-over strings', () => {
  assert.equal(t('en', 'bestLine', '1,200', 7), 'Best 1,200 · Wave 7');
  assert.equal(t('ar', 'bestLine', '900', 0), 'الأفضل 900');
  assert.equal(t('ar', 'newRecord'), 'رقم قياسيّ جديد!');
  assert.equal(t('ar', 'share'), 'شارك النتيجة');
});

test('sound panel strings', () => {
  assert.equal(t('en', 'sound'), 'Sound');
  assert.equal(t('ar', 'effects'), 'المؤثّرات');
});

test('music slider string', () => {
  assert.equal(t('en', 'music'), 'Music');
  assert.equal(t('ar', 'music'), 'الموسيقى');
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/i18n.test.js`
Expected: FAIL في `music slider string`.

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/i18n.js`:

```js
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
    leaderboard: 'Leaderboard',
    achievements: 'Achievements',
    theme: 'Theme',
    close: 'Close',
    bestLine: (score, wave) => (wave ? `Best ${score} · Wave ${wave}` : `Best ${score}`),
    newRecord: 'New record!',
    upgradesTaken: 'Upgrades',
    newAchievements: 'New achievements',
    achievementUnlocked: 'Achievement unlocked',
    enterName: 'Your name',
    saveScore: 'Save',
    share: 'Share result',
    yourRun: 'YOUR RUN',
    name: 'Name',
    noScores: 'No scores yet',
    sound: 'Sound',
    mute: 'Mute',
    effects: 'Effects',
    music: 'Music',
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
    leaderboard: 'المتصدّرون',
    achievements: 'الإنجازات',
    theme: 'الثيم',
    close: 'إغلاق',
    bestLine: (score, wave) => (wave ? `الأفضل ${score} · الموجة ${wave}` : `الأفضل ${score}`),
    newRecord: 'رقم قياسيّ جديد!',
    upgradesTaken: 'الترقيات',
    newAchievements: 'إنجازات جديدة',
    achievementUnlocked: 'إنجاز جديد',
    enterName: 'اسمك',
    saveScore: 'احفظ',
    share: 'شارك النتيجة',
    yourRun: 'نتيجتك',
    name: 'الاسم',
    noScores: 'لا نتائج بعد',
    sound: 'الصوت',
    mute: 'كتم',
    effects: 'المؤثّرات',
    music: 'الموسيقى',
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
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/i18n.test.js`
Expected: PASS، ٧ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat(arcade): add music slider string

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: الموسيقى في المتصفّح

**Files:**
- Modify: `js/audio.js`, `js/main.js`

**Interfaces:**
- `createAudio(settings) → {unlock(), play(voices), apply(settings), startMusic(layers), stopMusic(), setMusicLayers(layers), setMusicLevel(level), scheduleMusic()}`

لا اختبارات آليّة لهذه المهمّة. التحقّق في Task 4.

- [ ] **Step 1: الصوت** — استبدل `js/audio.js`:

```js
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
```

- [ ] **Step 2: الربط** — استبدل `js/main.js`:

```js
// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace, triggerNova } from './game.js';
import { drawUpgrades, applyUpgrade, upgradeById } from './upgrades.js';
import { isBossWave } from './waves.js';
import { wordsFor } from './words.js';
import { accuracy, finalWpm } from './scoring.js';
import { applyStrings, t } from './i18n.js';
import { load, save } from './storage.js';
import { startLoop } from './loop.js';
import { attachInput } from './input.js';
import { createStarfield } from './render/starfield.js';
import { drawShip, drawHpRing, aimAngle, turnToward, SHIP_TURN_RATE } from './render/ship.js';
import { drawEnemy, drawBoss } from './render/enemies.js';
import { drawFx, drawFlashes } from './render/fx.js';
import { createGlow } from './render/glow.js';
import { heatColor } from './render/color.js';
import { createFeel, feelEvent, updateFeel, shakeOffset } from './feel.js';
import { AUDIO_KEY, audioSettings, soundFor } from './sound.js';
import { createAudio } from './audio.js';
import { layersFor, musicLevel } from './music.js';
import { createLabels } from './render/labels.js';
import { createCards } from './render/cards.js';
import { THEME_KEY, THEMES, themeIndex, applyTheme } from './meta/themes.js';
import { ACH_KEY, WORDS_TOTAL_KEY, ACHIEVEMENTS, achievementById, unlockedFrom, newAchievements } from './meta/achievements.js';
import { LEADERBOARD_KEY, cleanRecords, mergeBoard, qualifies, makeRecord, addRecord } from './meta/leaderboard.js';
import { drawShareCard, shareCard } from './meta/share.js';

const BANNER_SEC = 1.5;
const PICK_FLASH_SEC = 0.35;
const HIGH_SCORE_KEY = 'ws_hs';
const BEST_WAVE_KEY = 'ws_best_wave';
const TOAST_SEC = 3;

const $ = id => document.getElementById(id);
const gameCanvas = $('game');
const gctx = gameCanvas.getContext('2d');
const starfield = createStarfield($('bg'));
const labels = createLabels($('labels'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const glow = createGlow(window.devicePixelRatio || 1);
let feel = createFeel({ reducedMotion });
let shipAngle = 0;
let lastCombo = 1;
let audioPrefs = audioSettings(load(AUDIO_KEY, null));
const audio = createAudio(audioPrefs);
const cards = createCards($('upgrade-cards'), pickUpgrade);

let lang = 'en';
let run = null;
let width = 0;
let height = 0;
let bannerTimer = 0;
let offered = [];
let pickedIndex = -1;
let pickTimer = 0;
let best = load(HIGH_SCORE_KEY, 0);
let bestWave = load(BEST_WAVE_KEY, 0);
let theme = themeIndex(load(THEME_KEY, 0));
applyTheme(document.documentElement, theme);
let colors = readColors();

let unlocked = unlockedFrom(load(ACH_KEY, {}));
let wordsBefore = Number(load(WORDS_TOTAL_KEY, 0)) || 0;
let runAch = [];
const toastQueue = [];
let toastTimer = 0;

let globalBoard = [];
let localBoard = cleanRecords(load(LEADERBOARD_KEY, []));
let result = null;
let savedRecord = null;
let panel = null;
const shareCanvas = document.createElement('canvas');

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = name => cs.getPropertyValue(name).trim();
  return {
    bg: v('--bg'), text: v('--text'), dim: v('--dim'),
    cyan: v('--neon-cyan'), green: v('--neon-green'), pink: v('--neon-pink'),
    yellow: v('--neon-yellow'), purple: v('--neon-purple'),
  };
}

const phase = createPhaseMachine(next => {
  $('screen-menu').hidden = next !== 'menu';
  $('screen-pause').hidden = next !== 'paused';
  $('screen-gameover').hidden = next !== 'gameover';
  $('screen-upgrade').hidden = next !== 'upgradePick';
  $('hud').hidden = !(next === 'playing' || next === 'paused' || next === 'upgradePick');
  audio.setMusicLevel(musicLevel(next));
  if (next === 'gameover' || next === 'menu') audio.stopMusic();
  if (next === 'gameover') labels.clear();
  if (next === 'menu') {
    labels.clear();
    run = null;
    $('wave-banner').hidden = true;
    renderBestLine();
  }
});

function resize() {
  width = window.innerWidth;
  height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  starfield.resize(width, height, dpr);
  gameCanvas.width = width * dpr;
  gameCanvas.height = height * dpr;
  gameCanvas.style.width = `${width}px`;
  gameCanvas.style.height = `${height}px`;
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (run) resizeRun(run, width, height);
}

function setLang(next) {
  lang = next;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyStrings(document, lang);
  $('record-name').placeholder = t(lang, 'enterName');
  renderBestLine();
}

function renderBestLine() {
  $('best-line').textContent = t(lang, 'bestLine', best.toLocaleString('en'), bestWave);
}

function cycleTheme() {
  theme = themeIndex(theme + 1);
  save(THEME_KEY, theme);
  applyTheme(document.documentElement, theme);
  colors = readColors();
  glow.clear();
  $('theme-name').textContent = THEMES[theme].name;
}

// --- Sound settings ---

function setAudio(next) {
  audioPrefs = next;
  audio.apply(next);
  save(AUDIO_KEY, next);
}

function soundPanel() {
  const box = cell('div', '', 'sound-panel');
  const mute = document.createElement('input');
  mute.type = 'checkbox';
  mute.id = 'sound-mute';
  mute.checked = audioPrefs.muted;
  mute.addEventListener('change', () => {
    setAudio({ ...audioPrefs, muted: mute.checked });
    mute.blur();
  });
  const muteRow = cell('label', t(lang, 'mute'), 'sound-row');
  muteRow.prepend(mute);
  box.append(muteRow, levelRow('effects', 'sfx'), levelRow('music', 'music'));
  return box;
}

// One slider for an audio level (sfx or music). Releasing it plays a short cue at the new level.
function levelRow(labelKey, field) {
  const range = document.createElement('input');
  range.type = 'range';
  range.id = `sound-${field}`;
  range.min = '0';
  range.max = '100';
  range.value = String(Math.round(audioPrefs[field] * 100));
  range.addEventListener('input', () => setAudio({ ...audioPrefs, [field]: Number(range.value) / 100 }));
  range.addEventListener('change', () => {
    audio.play(soundFor({ type: 'pick' }));
    range.blur();
  });
  const row = cell('label', t(lang, labelKey), 'sound-row');
  row.append(range);
  return row;
}

// --- Achievements ---

function checkAchievements() {
  const ids = newAchievements(run, wordsBefore, unlocked);
  if (!ids.length) return;
  for (const id of ids) {
    unlocked[id] = true;
    runAch.push(id);
    toastQueue.push(id);
  }
  save(ACH_KEY, unlocked);
}

function showNextToast() {
  const a = achievementById(toastQueue.shift());
  $('ach-toast-icon').textContent = a.icon;
  $('ach-toast-name').textContent = a.name[lang];
  $('ach-toast').hidden = false;
  toastTimer = TOAST_SEC;
}

function updateToast(dt) {
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) $('ach-toast').hidden = true;
  }
  if (toastTimer <= 0 && toastQueue.length) showNextToast();
}

// --- Panels over the menu ---

function cell(tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

// Board rows are copies, so the record saved this session is found by its fields.
function isSaved(r) {
  return savedRecord !== null && r.name === savedRecord.name && r.score === savedRecord.score && r.date === savedRecord.date;
}

function boardTable() {
  const board = mergeBoard(globalBoard, localBoard);
  if (!board.length) return cell('p', t(lang, 'noScores'), 'empty');
  const table = document.createElement('table');
  table.className = 'board';
  const head = document.createElement('tr');
  for (const h of ['#', t(lang, 'name'), t(lang, 'score'), t(lang, 'wave'), t(lang, 'wpm')]) head.append(cell('th', h));
  table.append(head);
  board.forEach((r, i) => {
    const row = document.createElement('tr');
    if (isSaved(r)) row.className = 'mine';
    row.append(
      cell('td', String(i + 1)),
      cell('td', String(r.name || '???'), 'name'),
      cell('td', r.score.toLocaleString('en')),
      cell('td', r.wave ? String(r.wave) : '—'),
      cell('td', String(Number(r.wpm) || 0)),
    );
    table.append(row);
  });
  return table;
}

function achievementList() {
  const list = document.createElement('div');
  for (const a of ACHIEVEMENTS) {
    const row = cell('div', '', unlocked[a.id] ? 'ach-row' : 'ach-row locked');
    row.append(cell('span', a.icon, 'ach-icon'), cell('span', a.name[lang]));
    list.append(row);
  }
  return list;
}

function openPanel(kind) {
  panel = kind;
  $('panel-title').textContent = t(lang, kind);
  const body = { leaderboard: boardTable, achievements: achievementList, sound: soundPanel }[kind];
  $('panel-body').replaceChildren(body());
  $('panel').hidden = false;
}

function closePanel() {
  panel = null;
  $('panel').hidden = true;
}

// --- Game over ---

function chipRow(container, title, chips) {
  container.replaceChildren(cell('span', title, 'chips-label'), ...chips.map(text => cell('span', text, 'chip')));
  container.hidden = chips.length === 0;
}

function saveRecord(e) {
  e.preventDefault();
  savedRecord = makeRecord({
    name: $('record-name').value, score: result.score, wave: result.wave, wpm: result.wpm,
    lang, date: new Date().toISOString().slice(0, 10),
  });
  localBoard = addRecord(localBoard, savedRecord);
  save(LEADERBOARD_KEY, localBoard);
  $('record-form').hidden = true;
}

function shareResult() {
  drawShareCard(shareCanvas, result, colors, {
    lang,
    sub: t(lang, 'yourRun'),
    labels: {
      score: t(lang, 'score'), wave: t(lang, 'wave'), wpm: t(lang, 'wpm'),
      accuracy: t(lang, 'accuracy'), maxCombo: t(lang, 'maxCombo'),
    },
    font: getComputedStyle(document.body).fontFamily,
  });
  shareCard(shareCanvas);
}

function showBanner(text) {
  const banner = $('wave-banner');
  banner.textContent = text;
  banner.hidden = false;
  bannerTimer = BANNER_SEC;
}

function waveBanner(n) {
  return isBossWave(n) ? t(lang, 'bossBanner', n) : t(lang, 'waveBanner', n);
}

function newRun() {
  labels.clear();
  runAch = [];
  feel = createFeel({ reducedMotion });
  shipAngle = 0;
  lastCombo = 1;
  audio.startMusic(layersFor(1, isBossWave(1)));
  run = createRun({ lang, words: wordsFor(lang), width, height });
  startWave(run, 1);
  showBanner(waveBanner(1));
  phase.set('playing');
}

function endRun() {
  checkAchievements();
  wordsBefore += run.kills;
  save(WORDS_TOTAL_KEY, wordsBefore);

  const isRecord = run.score > best;
  if (isRecord) {
    best = run.score;
    save(HIGH_SCORE_KEY, best);
  }
  if (run.wave > bestWave) {
    bestWave = run.wave;
    save(BEST_WAVE_KEY, bestWave);
  }

  const icons = run.picked.map(id => upgradeById(id).icon);
  result = {
    score: run.score, wave: run.wave, wpm: finalWpm(run.correctKeys, run.time),
    acc: Math.round(accuracy(run.correctKeys, run.totalKeys) * 100), maxCombo: run.maxCombo, icons,
  };
  $('final-score').textContent = result.score.toLocaleString('en');
  $('new-record').hidden = !isRecord;
  $('final-wave').textContent = result.wave;
  $('final-wpm').textContent = result.wpm;
  $('final-acc').textContent = `${result.acc}%`;
  $('final-combo').textContent = `×${result.maxCombo}`;
  chipRow($('final-upgrades'), t(lang, 'upgradesTaken'), icons);
  chipRow($('final-ach'), t(lang, 'newAchievements'),
    runAch.map(id => { const a = achievementById(id); return `${a.icon} ${a.name[lang]}`; }));

  savedRecord = null;
  const form = $('record-form');
  form.hidden = !qualifies(result.score, mergeBoard(globalBoard, localBoard));
  phase.set('gameover');
  if (!form.hidden) {
    $('record-name').value = '';
    $('record-name').focus();
  }
}

function openUpgrades() {
  offered = drawUpgrades(run);
  pickedIndex = -1;
  $('upgrade-title').textContent = isBossWave(run.wave) ? t(lang, 'bossDown') : t(lang, 'waveClear', run.wave);
  cards.show(offered, lang, rarity => t(lang, rarity));
  phase.set('upgradePick');
}

function pickUpgrade(index) {
  if (phase.get() !== 'upgradePick' || pickedIndex !== -1 || index >= offered.length) return;
  pickedIndex = index;
  pickTimer = PICK_FLASH_SEC;
  cards.flash(index);
  audio.play(soundFor({ type: 'pick' }));
}

function finishPick() {
  applyUpgrade(run, offered[pickedIndex].id);
  startWave(run, run.wave + 1);
  showBanner(waveBanner(run.wave));
  phase.set('playing');
}

function drainEvents() {
  for (const ev of run.events) {
    feelEvent(feel, ev, run.ship);
    audio.play(soundFor(ev, run.combo));
    if (ev.type === 'waveStart') audio.setMusicLayers(layersFor(ev.wave, isBossWave(ev.wave)));
    if (ev.type === 'miss' && ev.id !== null) labels.flashMiss(ev.id);
    else if (ev.type === 'waveClear') openUpgrades();
    else if (ev.type === 'gameOver') endRun();
  }
  run.events.length = 0;
}

function drawRun(dt) {
  const locked = run.enemies.find(e => e.id === run.lockId && !e.dead) || null;
  for (const e of run.enemies) {
    if (e.dead) continue;
    if (e.type === 'boss') drawBoss(gctx, glow, e, e === locked ? colors.cyan : colors.yellow, colors.pink, colors.dim, e === locked);
    else drawEnemy(gctx, glow, e, e === locked ? colors.cyan : colors.pink, e === locked);
  }
  shipAngle = turnToward(shipAngle, aimAngle(run.ship, locked), SHIP_TURN_RATE * dt);
  drawShip(gctx, glow, run.ship, shipAngle, heatColor(run.combo, colors.cyan, colors.yellow), colors.yellow, feel.recoil, Math.random());
  drawHpRing(gctx, run.ship, run.hp, run.maxHp, colors.cyan, colors.dim);
  labels.sync(run.enemies, run.lockId, run.lang);

  $('hud-score').textContent = run.score.toLocaleString('en');
  $('hud-wave').textContent = run.wave;
  $('hud-best').textContent = Math.max(best, run.score).toLocaleString('en');
  const combo = $('hud-combo');
  combo.textContent = run.combo > 1 ? `×${run.combo}` : '';
  if (run.combo > lastCombo) {
    combo.classList.remove('pulse');
    void combo.offsetWidth; // restart the animation
    combo.classList.add('pulse');
  }
  lastCombo = run.combo;
  combo.style.transform = `translate(${run.ship.x + 48}px, ${run.ship.y - 12}px)`;
  const nova = $('hud-nova');
  nova.hidden = !run.novaReady;
  nova.style.transform = `translate(${run.ship.x - 64}px, ${run.ship.y - 12}px)`;
}

function frame(dt) {
  starfield.draw(dt, colors, run ? run.wave : 1);
  gctx.clearRect(0, 0, width, height);
  const p = phase.get();
  const playing = p === 'playing';
  updateFeel(feel, p === 'paused' ? 0 : dt);
  audio.scheduleMusic();

  if (playing && bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('wave-banner').hidden = true;
  }
  // Hitstop: a kill holds the game logic for a few frames; effects keep moving.
  if (run && playing && feel.hitstop === 0) {
    update(run, dt);
    drainEvents();
    if (phase.get() !== 'gameover') checkAchievements();
  }
  updateToast(dt);
  if (p === 'upgradePick' && pickedIndex !== -1) {
    pickTimer -= dt;
    if (pickTimer <= 0) finishPick();
  }

  const shake = shakeOffset(feel);
  $('labels').style.transform = shake.x || shake.y ? `translate(${shake.x}px, ${shake.y}px)` : '';
  gctx.save();
  gctx.translate(shake.x, shake.y);
  // Read the phase again: a game over raised during this frame must not redraw the labels just cleared.
  if (run && phase.get() !== 'gameover') drawRun(dt);
  drawFx(gctx, feel, colors);
  gctx.restore();
  drawFlashes(gctx, feel, colors, width, height);
}

function handleKey(key) {
  const p = phase.get();
  if (panel) {
    if (key === 'Escape') closePanel();
  } else if (p === 'menu') {
    if (key === 'Enter') newRun();
  } else if (p === 'playing') {
    if (key === 'Escape') phase.set('paused');
    else if (key === 'Backspace') onBackspace(run);
    else if (key === 'Enter') triggerNova(run);
    else if (key !== ' ') onChar(run, key);
  } else if (p === 'upgradePick') {
    if (key === '1' || key === '2' || key === '3') pickUpgrade(Number(key) - 1);
  } else if (p === 'paused') {
    if (key === 'Escape' || key === 'Enter') phase.set('playing');
    else if (key === 'r' || key === 'R') phase.set('menu');
  } else if (p === 'gameover') {
    if (key === 'Enter') newRun();
    else if (key === 'r' || key === 'R') phase.set('menu');
  }
}

$('btn-start').addEventListener('click', newRun);
$('btn-resume').addEventListener('click', () => phase.set('playing'));
$('btn-pause-menu').addEventListener('click', () => phase.set('menu'));
$('btn-again').addEventListener('click', newRun);
$('btn-over-menu').addEventListener('click', () => phase.set('menu'));
$('btn-share').addEventListener('click', shareResult);
$('record-form').addEventListener('submit', saveRecord);
$('btn-leaderboard').addEventListener('click', () => openPanel('leaderboard'));
$('btn-achievements').addEventListener('click', () => openPanel('achievements'));
$('btn-panel-close').addEventListener('click', closePanel);
$('btn-theme').addEventListener('click', cycleTheme);
$('btn-sound').addEventListener('click', () => openPanel('sound'));
// Audio may only start inside a user gesture.
document.addEventListener('pointerdown', () => audio.unlock());
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

// The static board is optional: offline or opened from disk, only local results show.
fetch('leaderboard.json')
  .then(r => (r.ok ? r.json() : []))
  .then(data => { globalBoard = cleanRecords(data); })
  .catch(() => { globalBoard = []; });

attachInput(key => {
  audio.unlock();
  handleKey(key);
});
resize();
setLang('en');
$('theme-name').textContent = THEMES[theme].name;
startLoop(frame);
```

- [ ] **Step 3: فحص الصياغة والاختبارات**

Run: `for f in js/main.js js/audio.js js/music.js; do node --input-type=module --check < $f; done`
Expected: لا مخرجات.

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ١٣٥ اختباراً، `fail 0`.

- [ ] **Step 4: Commit**

```bash
git add js/audio.js js/main.js
git commit -m "feat(arcade): play the music loop during a run, with its own level

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: التحقّق في المتصفّح

بـ Playwright + Chromium على `python3 -m http.server 3737`، مقاس 1280×800. قبل تحميل الصفحة يُلفّ `OscillatorNode.prototype.start` بسكربت يسجّل نوع كلّ مذبذب وتردّده، لأنّ الصوت لا يُسمع هنا. امسح `localStorage` أوّلاً.

- [ ] **Step 1:** انقر الصفحة (يفتح الصوت) واسمع ٢ ثانية في القائمة. Expected: لا مذبذبات.
- [ ] **Step 2:** `Enter` و٣ ثوانٍ بلا كتابة. Expected: `sine@55` فقط (نحو ٥٫٥ ضربات).
- [ ] **Step 3:** نظّف الموجتين ١ و٢ واختر الترقية ١. في الموجة ٣، ٤٫٥ ثوانٍ. Expected: منشاريّات على 110/87.31/130.81/98 ودواوينها، مع `sine@55`.
- [ ] **Step 4:** `Esc`. Expected: الضربات مستمرّة. ثمّ `R`. Expected: لا مذبذبات في ٢ ثانية.
- [ ] **Step 5:** لوحة الصوت. Expected: «Mute» و«Effects» و«Music». المنزلق على ٣٠ ← `ws_audio.music` = 0.3. «Mute» ثمّ جولة. Expected: لا مذبذبات في ٢ ثانية.
- [ ] **Step 6: لا أخطاء في الـ console.**

لا commit لهذه المهمّة. النتائج وما لم يُتحقَّق منه في وصف الـPR.

---

## ما بعد هذه الخطّة

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
