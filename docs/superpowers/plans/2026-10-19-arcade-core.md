# Word Strike Arcade — الخطّة ١: الهيكل وقلب اللعب

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** لعبة أركيد قابلة للعب في `index.html`: سفينة، أعداء يهبطون بكلمات، قفل وإطلاق، موجات، نقاط وحياة، قائمة وإيقاف ونهاية — مع اختبارات للمنطق.

**Architecture:** وحدات `ES modules` بلا بناء. منطق خالص (`words`, `scoring`, `enemies`, `waves`, `targeting`, `state`, `storage`, `i18n`, `game`) لا يلمس `document` ويُختبر بـ `node --test`. طبقة متصفّح (`render/*`, `loop`, `input`, `main`) ترسم على `canvas` وتضع أسماء الأعداء كعناصر `DOM`.

**Tech Stack:** JavaScript (ES2022 modules)، Canvas 2D، `node:test` (Node v26.12.0 مثبَّت في `/opt/homebrew/bin/node`)، Python 3 للخادم المحلّيّ.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — هذه الخطّة تنفّذ المرحلتين ١ و٢ من القسم ١٢.

## Global Constraints

- لا أداة بناء، ولا `package.json`، ولا مكتبات، ولا ملفّات صور أو صوت.
- كلّ `import` نسبيّ وينتهي بـ `.js`.
- وحدات المنطق لا تستعمل `document` ولا `window` ولا `canvas`. كلّ عشوائيّة تأتي من معامل `rand` يمكن حقنه.
- أسماء الأعداء العربيّة: `direction: rtl` و`letter-spacing: 0`.
- المطابقة صارمة: الحرف يساوي المتوقّع تماماً (`أ` لا تطابق `ا`).
- مفتاح أفضل نتيجة: `ws_hs` (متوافق مع القيمة القديمة).
- لا تعديل على `typing-game.html`. اللعبة القديمة تبقى تعمل.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test tests/`

## قراران في هذه الخطّة ليسا في المواصفة

1. **المسافة أثناء اللعب تُتجاهَل.** لا تُحسب خطأً. السبب: كثيرون يضغطون المسافة بعد كلّ كلمة بالعادة.
2. **بين الموجات (مؤقّتاً):** حتى تصل الترقيات في الخطّة التالية، نهاية الموجة تُظهر «الموجة n اكتملت» ١٫٥ ثانية ثمّ تبدأ التالية.

## خارج هذه الخطّة (خطط لاحقة)

الترقيات، الزعيم، تلميع الشاشات، الثيمات والإنجازات والمتصدّرون والمشاركة، التوهّج والجزيئات والهزّة، الصوت والموسيقى، الجوّال، حذف الملفّ القديم.

## خريطة الملفّات

| الملفّ | المسؤوليّة |
|-------|-----------|
| `js/words.js` | قوائم الكلمات (منقولة من `typing-game.html`) |
| `js/scoring.js` | الكومبو والنقاط والدقّة والسرعة |
| `js/enemies.js` | أنواع الأعداء، إنشاؤها، حركتها، اصطدامها، انشطارها |
| `js/waves.js` | صيغ الموجة، أوزان الفئات، اختيار النوع والكلمة |
| `js/targeting.js` | القفل ومطابقة الحروف |
| `js/state.js` | آلة المراحل |
| `js/storage.js` | غلاف `localStorage` |
| `js/i18n.js` | نصوص الواجهة |
| `js/game.js` | الجولة: توليد، تحديث، اصطدام، قتل، أحداث |
| `js/loop.js` | حلقة الإطارات |
| `js/input.js` | الكيبورد |
| `js/render/starfield.js` | النجوم |
| `js/render/ship.js` | السفينة وحلقة الحياة |
| `js/render/enemies.js` | أشكال الأعداء |
| `js/render/fx.js` | خطّ الطلقة وحلقة الانفجار |
| `js/render/labels.js` | أسماء الأعداء كعناصر DOM |
| `js/main.js` | ربط كلّ شيء |
| `index.html`, `css/base.css` | الهيكل والتنسيق |
| `tests/*.test.js` | اختبارات المنطق |

---

### Task 1: قوائم الكلمات

**Files:**
- Create: `js/words.js` (يُولَّد من `typing-game.html:1224-1230` و`typing-game.html:1238-1244`)
- Test: `tests/words.test.js`

**Interfaces:**
- Produces: `WORDS_EN`, `WORDS_AR` — كائن `{1: string[], …, 5: string[]}`؛ `wordsFor(lang: 'en'|'ar')` يعيد أحدهما.

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/words.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORDS_EN, WORDS_AR, wordsFor } from '../js/words.js';

for (const [name, words] of [['en', WORDS_EN], ['ar', WORDS_AR]]) {
  test(`${name}: five non-empty tiers of single words`, () => {
    for (let tier = 1; tier <= 5; tier++) {
      assert.ok(Array.isArray(words[tier]) && words[tier].length > 0, `tier ${tier}`);
      for (const w of words[tier]) assert.match(w, /^\S+$/, `"${w}" in tier ${tier}`);
    }
  });
}

test('wordsFor picks the language', () => {
  assert.equal(wordsFor('ar'), WORDS_AR);
  assert.equal(wordsFor('en'), WORDS_EN);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/words.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/words.js`.

- [ ] **Step 3: ولّد `js/words.js` من الملفّ القديم**

تأكّد أوّلاً من الحدود (يجب أن يطبع `const WORDS = {` ثمّ `};` ثمّ `const WORDS_AR = {` ثمّ `};`):

```bash
sed -n '1224p;1230p;1238p;1244p' typing-game.html | cut -c1-40
```

ثمّ ولّد الملفّ:

```bash
mkdir -p js && {
  echo '// Word pools: 5 tiers by length/difficulty. Extracted from typing-game.html.'
  sed -n '1224,1230p' typing-game.html | sed 's/^const WORDS = /export const WORDS_EN = /'
  echo
  sed -n '1238,1244p' typing-game.html | sed 's/^const WORDS_AR = /export const WORDS_AR = /'
  echo
  echo "export function wordsFor(lang) { return lang === 'ar' ? WORDS_AR : WORDS_EN; }"
} > js/words.js
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/words.test.js`
Expected: PASS، ٣ اختبارات. إن فشل بكلمة فيها مسافة، أبلغ مو بالكلمة ولا تعدّل القائمة بنفسك.

- [ ] **Step 5: Commit**

```bash
git add js/words.js tests/words.test.js
git commit -m "feat(arcade): extract word lists into a module

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: النقاط والكومبو

**Files:**
- Create: `js/scoring.js`
- Test: `tests/scoring.test.js`

**Interfaces:**
- Consumes: كائن جولة فيه `streak`, `combo`, `maxCombo`, `score`, `mods.magnet`.
- Produces:
  - `comboFor(streak: number): 1|2|4|8`
  - `wordPoints(length: number, combo: number, multiplier = 1): number`
  - `registerKill(run, wordLength: number): number` — يعدّل `run` ويعيد النقاط.
  - `registerMiss(run): void`
  - `accuracy(correct: number, total: number): number` (بين ٠ و١)
  - `rollingWpm(samples: {t:number, chars:number}[], now: number, windowSec = 10): number`
  - `finalWpm(correctKeys: number, seconds: number): number`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comboFor, wordPoints, registerKill, registerMiss, accuracy, rollingWpm, finalWpm } from '../js/scoring.js';

const freshRun = () => ({ streak: 0, combo: 1, maxCombo: 1, score: 0, mods: { magnet: 0 } });

test('combo thresholds', () => {
  const cases = [[0, 1], [1, 1], [2, 2], [3, 2], [4, 4], [7, 4], [8, 8], [20, 8]];
  for (const [streak, combo] of cases) assert.equal(comboFor(streak), combo, `streak ${streak}`);
});

test('word points', () => {
  assert.equal(wordPoints(5, 4), 200);
  assert.equal(wordPoints(5, 1, 1.2), 60);
});

test('registerKill grows the combo from the second kill', () => {
  const run = freshRun();
  assert.equal(registerKill(run, 3), 30);
  assert.equal(registerKill(run, 3), 60);
  assert.equal(run.score, 90);
  assert.equal(run.combo, 2);
  assert.equal(run.maxCombo, 2);
});

test('magnet adds 20% per stack', () => {
  const run = freshRun();
  run.mods.magnet = 2;
  assert.equal(registerKill(run, 5), 70);
});

test('registerMiss resets streak and combo', () => {
  const run = { ...freshRun(), streak: 5, combo: 4, maxCombo: 4 };
  registerMiss(run);
  assert.equal(run.streak, 0);
  assert.equal(run.combo, 1);
  assert.equal(run.maxCombo, 4);
});

test('accuracy', () => {
  assert.equal(accuracy(0, 0), 1);
  assert.equal(accuracy(9, 10), 0.9);
});

test('rolling wpm uses the last 10 seconds only', () => {
  assert.equal(rollingWpm([{ t: 1, chars: 50 }, { t: 9.5, chars: 10 }], 10), 72);
  assert.equal(rollingWpm([{ t: 0, chars: 50 }], 10.5), 0);
});

test('final wpm', () => {
  assert.equal(finalWpm(300, 60), 60);
  assert.equal(finalWpm(10, 0), 0);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/scoring.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
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

export function registerKill(run, wordLength) {
  run.streak += 1;
  run.combo = comboFor(run.streak);
  run.maxCombo = Math.max(run.maxCombo, run.combo);
  const points = wordPoints(wordLength, run.combo, 1 + 0.2 * run.mods.magnet);
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
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/scoring.test.js`
Expected: PASS، ٨ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js tests/scoring.test.js
git commit -m "feat(arcade): add scoring and combo rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: الأعداء

**Files:**
- Create: `js/enemies.js`
- Test: `tests/enemies.test.js`

**Interfaces:**
- Produces:
  - `ENEMY_TYPES` — `{drone|seeker|splitter|armored: {minWave, tiers: null|[lo,hi], speedMul, damage, turnRate}}`
  - `SHIP_RADIUS = 28`
  - `createEnemy({id, type, word, x, y, speed, target:{x,y}}): Enemy` حيث
    `Enemy = {id, type, word, typed, x, y, vx, vy, speed, dead}`
  - `updateEnemy(e: Enemy, dt: number, target:{x,y}): void`
  - `reachedShip(e: Enemy, ship:{x,y}): boolean`
  - `splitChildren(parent:{x,y,speed}, words:[string,string], ids:[number,number], target): Enemy[]`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/enemies.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from '../js/enemies.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('types unlock at their waves', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(ENEMY_TYPES).map(([k, v]) => [k, v.minWave])),
    { drone: 1, seeker: 3, splitter: 4, armored: 6 },
  );
  assert.equal(ENEMY_TYPES.armored.damage, 2);
});

test('createEnemy aims at the target', () => {
  const e = createEnemy({ id: 1, type: 'drone', word: 'go', x: 100, y: 0, speed: 50, target: { x: 100, y: 500 } });
  assert.ok(near(e.vx, 0));
  assert.ok(near(e.vy, 50));
  assert.equal(e.typed, 0);
  assert.equal(e.dead, false);
});

test('drone moves in a straight line', () => {
  const e = createEnemy({ id: 1, type: 'drone', word: 'go', x: 100, y: 0, speed: 50, target: { x: 100, y: 500 } });
  updateEnemy(e, 1, { x: 100, y: 500 });
  assert.ok(near(e.y, 50));
  assert.ok(near(e.x, 100));
});

test('seeker turns toward the target and keeps its speed', () => {
  const e = { type: 'seeker', x: 0, y: 0, vx: 50, vy: 0, speed: 50 };
  updateEnemy(e, 0.1, { x: 0, y: 1000 });
  assert.ok(e.vy > 0);
  assert.ok(Math.abs(Math.hypot(e.vx, e.vy) - 50) < 1e-9);
});

test('reachedShip', () => {
  const ship = { x: 400, y: 700 };
  assert.equal(reachedShip({ x: 400, y: 680 }, ship), true);
  assert.equal(reachedShip({ x: 400, y: 600 }, ship), false);
  assert.equal(reachedShip({ x: 50, y: 701 }, ship), true);
});

test('splitter children', () => {
  const kids = splitChildren({ x: 100, y: 50, speed: 40 }, ['ab', 'cd'], [7, 8], { x: 100, y: 500 });
  assert.deepEqual(kids.map(k => k.id), [7, 8]);
  assert.deepEqual(kids.map(k => k.type), ['drone', 'drone']);
  assert.deepEqual(kids.map(k => k.word), ['ab', 'cd']);
  assert.deepEqual(kids.map(k => k.x), [76, 124]);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/enemies.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/enemies.js
// Enemy types, creation, movement, collision with the ship and splitting.

export const ENEMY_TYPES = {
  drone:    { minWave: 1, tiers: null,   speedMul: 1.0,  damage: 1, turnRate: 0 },
  seeker:   { minWave: 3, tiers: [2, 3], speedMul: 0.9,  damage: 1, turnRate: 1.2 },
  splitter: { minWave: 4, tiers: [2, 3], speedMul: 0.85, damage: 1, turnRate: 0 },
  armored:  { minWave: 6, tiers: [4, 5], speedMul: 0.5,  damage: 2, turnRate: 0 },
};

export const SHIP_RADIUS = 28;

export function createEnemy({ id, type, word, x, y, speed, target }) {
  const dx = target.x - x;
  const dy = target.y - y;
  const len = Math.hypot(dx, dy) || 1;
  return { id, type, word, typed: 0, x, y, vx: (dx / len) * speed, vy: (dy / len) * speed, speed, dead: false };
}

export function updateEnemy(e, dt, target) {
  const turn = ENEMY_TYPES[e.type].turnRate;
  if (turn > 0) {
    const want = Math.atan2(target.y - e.y, target.x - e.x);
    const current = Math.atan2(e.vy, e.vx);
    const diff = Math.atan2(Math.sin(want - current), Math.cos(want - current));
    const step = Math.max(-turn * dt, Math.min(turn * dt, diff));
    e.vx = Math.cos(current + step) * e.speed;
    e.vy = Math.sin(current + step) * e.speed;
  }
  e.x += e.vx * dt;
  e.y += e.vy * dt;
}

export function reachedShip(e, ship) {
  return Math.hypot(e.x - ship.x, e.y - ship.y) <= SHIP_RADIUS || e.y >= ship.y;
}

export function splitChildren(parent, words, ids, target) {
  return [-24, 24].map((dx, i) => createEnemy({
    id: ids[i], type: 'drone', word: words[i],
    x: parent.x + dx, y: parent.y, speed: parent.speed, target,
  }));
}
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/enemies.test.js`
Expected: PASS، ٦ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/enemies.js tests/enemies.test.js
git commit -m "feat(arcade): add enemy types and movement

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: الموجات

**Files:**
- Create: `js/waves.js`
- Test: `tests/waves.test.js`

**Interfaces:**
- Consumes: `ENEMY_TYPES` من `js/enemies.js`.
- Produces:
  - `waveConfig(n): {count, maxOnScreen, baseSpeed, spawnInterval}`
  - `tierWeights(n): number[5]` (مجموعها ١٠٠)
  - `pickTier(weights, rand = Math.random): 1..5`
  - `isBossWave(n): boolean`
  - `pickEnemyType(n, rand = Math.random): 'drone'|'seeker'|'splitter'|'armored'`
  - `tierForType(type, n, rand = Math.random): 1..5`
  - `pickWord(pool: string[], onScreen: string[], rand = Math.random): string`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/waves.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { waveConfig, tierWeights, pickTier, isBossWave, pickEnemyType, tierForType, pickWord } from '../js/waves.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('wave 1 config', () => {
  const c = waveConfig(1);
  assert.equal(c.count, 6);
  assert.equal(c.maxOnScreen, 3);
  assert.equal(c.baseSpeed, 32);
  assert.ok(near(c.spawnInterval, 2.08));
});

test('wave 5 config', () => {
  const c = waveConfig(5);
  assert.deepEqual([c.count, c.maxOnScreen, c.baseSpeed], [14, 5, 48]);
  assert.ok(near(c.spawnInterval, 1.6));
});

test('caps apply at high waves', () => {
  const c20 = waveConfig(20);
  assert.deepEqual([c20.count, c20.maxOnScreen, c20.baseSpeed, c20.spawnInterval], [30, 12, 108, 0.6]);
  assert.equal(waveConfig(100).baseSpeed, 110);
});

test('tier weights by wave band, each summing to 100', () => {
  const firsts = { 1: 70, 2: 70, 3: 45, 4: 45, 5: 25, 7: 25, 8: 15, 11: 15, 12: 10, 50: 10 };
  for (const [n, first] of Object.entries(firsts)) {
    const w = tierWeights(Number(n));
    assert.equal(w[0], first, `wave ${n}`);
    assert.equal(w.reduce((a, b) => a + b, 0), 100, `wave ${n} sum`);
  }
});

test('pickTier rolls against the weights', () => {
  assert.equal(pickTier([70, 30, 0, 0, 0], () => 0), 1);
  assert.equal(pickTier([70, 30, 0, 0, 0], () => 0.99), 2);
});

test('boss waves', () => {
  assert.deepEqual([4, 5, 10, 11].map(isBossWave), [false, true, true, false]);
});

test('enemy types only appear from their wave', () => {
  assert.equal(pickEnemyType(1, () => 0.99), 'drone');
  assert.equal(pickEnemyType(3, () => 0.9), 'seeker');
  assert.equal(pickEnemyType(6, () => 0.99), 'armored');
});

test('tier for type', () => {
  assert.equal(tierForType('armored', 6, () => 0), 4);
  assert.equal(tierForType('armored', 6, () => 0.99), 5);
  assert.equal(tierForType('drone', 1, () => 0), 1);
});

test('pickWord avoids on-screen words and repeated first letters', () => {
  assert.equal(pickWord(['apple', 'avid', 'bear', 'cat'], ['apple'], () => 0), 'bear');
  assert.equal(pickWord(['apple', 'avid'], ['apple'], () => 0), 'avid');
  assert.equal(pickWord(['apple'], ['apple'], () => 0), 'apple');
  assert.equal(pickWord(['كتاب', 'كلام', 'نجوم'], ['كتاب'], () => 0), 'نجوم');
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/waves.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
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
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/waves.test.js`
Expected: PASS، ٩ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/waves.js tests/waves.test.js
git commit -m "feat(arcade): add wave difficulty curve and spawn picks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: القفل والمطابقة

**Files:**
- Create: `js/targeting.js`
- Test: `tests/targeting.test.js`

**Interfaces:**
- Consumes: `run.enemies: Enemy[]`, `run.lockId: number|null`.
- Produces:
  - `findTarget(enemies, key): Enemy|null` — الأقرب للسفينة (أكبر `y`) بين الأحياء الذين حرفهم التالي = `key`.
  - `lockedEnemy(run): Enemy|null` — ويمسح `lockId` إن مات الهدف.
  - `handleChar(run, key): {kind: 'hit'|'kill'|'miss', enemy: Enemy|null}` — يزيد `enemy.typed` عند النجاح فقط. لا يلمس النقاط ولا العدّادات.
  - `releaseLock(run): void`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/targeting.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTarget, lockedEnemy, handleChar, releaseLock } from '../js/targeting.js';

const enemy = (id, word, y, extra = {}) => ({ id, word, y, x: 0, typed: 0, dead: false, ...extra });
const runWith = (...enemies) => ({ enemies, lockId: null });

test('locks on the enemy closest to the ship', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'lamp', 300), enemy(3, 'orbit', 400));
  const res = handleChar(run, 'l');
  assert.equal(res.kind, 'hit');
  assert.equal(res.enemy.id, 2);
  assert.equal(run.lockId, 2);
  assert.equal(run.enemies[1].typed, 1);
});

test('miss when no word starts with the key', () => {
  const run = runWith(enemy(1, 'laser', 100));
  assert.deepEqual(handleChar(run, 'z'), { kind: 'miss', enemy: null });
  assert.equal(run.lockId, null);
});

test('lock survives a wrong key', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'orbit', 50));
  handleChar(run, 'l');
  const res = handleChar(run, 'o');
  assert.equal(res.kind, 'miss');
  assert.equal(res.enemy.id, 1);
  assert.equal(run.lockId, 1);
  assert.equal(run.enemies[0].typed, 1);
});

test('last letter kills', () => {
  const run = runWith(enemy(1, 'go', 100));
  handleChar(run, 'g');
  const res = handleChar(run, 'o');
  assert.equal(res.kind, 'kill');
  assert.equal(res.enemy.typed, 2);
});

test('releaseLock lets you pick another enemy, typed letters stay', () => {
  const run = runWith(enemy(1, 'laser', 100), enemy(2, 'orbit', 50));
  handleChar(run, 'l');
  releaseLock(run);
  assert.equal(run.lockId, null);
  assert.equal(handleChar(run, 'o').enemy.id, 2);
  assert.equal(run.enemies[0].typed, 1);
});

test('a dead lock target is cleared', () => {
  const run = runWith(enemy(1, 'laser', 100));
  handleChar(run, 'l');
  run.enemies[0].dead = true;
  assert.equal(lockedEnemy(run), null);
  assert.equal(run.lockId, null);
});

test('unlocked half-typed enemy matches on its next letter', () => {
  const run = runWith(enemy(1, 'laser', 100, { typed: 2 }));
  assert.equal(findTarget(run.enemies, 's').id, 1);
  assert.equal(findTarget(run.enemies, 'l'), null);
});

test('arabic words, strict alef', () => {
  const run = runWith(enemy(1, 'كتاب', 100), enemy(2, 'أنا', 50));
  for (const ch of 'كتا') assert.equal(handleChar(run, ch).kind, 'hit');
  assert.equal(handleChar(run, 'ب').kind, 'kill');
  releaseLock(run);
  assert.equal(handleChar(run, 'ا').kind, 'miss');
  assert.equal(handleChar(run, 'أ').kind, 'hit');
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/targeting.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/targeting.js
// Lock-on and letter matching. Matching is strict: the key must equal the next letter exactly.

export function findTarget(enemies, key) {
  let best = null;
  for (const e of enemies) {
    if (e.dead || e.word[e.typed] !== key) continue;
    if (!best || e.y > best.y) best = e;
  }
  return best;
}

export function lockedEnemy(run) {
  if (run.lockId === null) return null;
  const e = run.enemies.find(x => x.id === run.lockId);
  if (!e || e.dead) {
    run.lockId = null;
    return null;
  }
  return e;
}

export function handleChar(run, key) {
  let e = lockedEnemy(run);
  if (!e) {
    e = findTarget(run.enemies, key);
    if (!e) return { kind: 'miss', enemy: null };
    run.lockId = e.id;
  } else if (e.word[e.typed] !== key) {
    return { kind: 'miss', enemy: e };
  }
  e.typed += 1;
  return { kind: e.typed === e.word.length ? 'kill' : 'hit', enemy: e };
}

export function releaseLock(run) {
  run.lockId = null;
}
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/targeting.test.js`
Expected: PASS، ٨ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/targeting.js tests/targeting.test.js
git commit -m "feat(arcade): add lock-on targeting

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: المراحل والتخزين والنصوص

**Files:**
- Create: `js/state.js`, `js/storage.js`, `js/i18n.js`
- Test: `tests/state.test.js`, `tests/storage.test.js`, `tests/i18n.test.js`

**Interfaces:**
- Produces:
  - `createPhaseMachine(onChange: (next, prev|null) => void): {get(): Phase, set(next: Phase): void}` — يستدعي `onChange('menu', null)` فوراً، ويرمي `Error('Invalid phase transition: a -> b')` عند انتقال غير مسموح.
  - `load(key, fallback, store = globalThis.localStorage)` و`save(key, value, store = globalThis.localStorage)`.
  - `STRINGS.{en,ar}`، `t(lang, key, ...args): string`، `applyStrings(root, lang): void` (يملأ كلّ `[data-i18n]` ويضبط `lang` و`dir` على `<html>`).

- [ ] **Step 1: اكتب الاختبارات الفاشلة**

```js
// tests/state.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPhaseMachine } from '../js/state.js';

test('starts in menu and reports it', () => {
  const seen = [];
  const m = createPhaseMachine((next, prev) => seen.push([next, prev]));
  assert.equal(m.get(), 'menu');
  assert.deepEqual(seen, [['menu', null]]);
});

test('follows the allowed transitions', () => {
  const seen = [];
  const m = createPhaseMachine(next => seen.push(next));
  for (const p of ['playing', 'paused', 'playing', 'upgradePick', 'playing', 'gameover', 'playing', 'gameover', 'menu']) m.set(p);
  assert.equal(m.get(), 'menu');
  assert.equal(seen.length, 10);
});

test('rejects an invalid transition', () => {
  const m = createPhaseMachine(() => {});
  assert.throws(() => m.set('paused'), /menu -> paused/);
});
```

```js
// tests/storage.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load, save } from '../js/storage.js';

function fakeStore(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('missing key returns the fallback', () => {
  assert.equal(load('x', 7, fakeStore()), 7);
});

test('round-trips JSON', () => {
  const s = fakeStore();
  save('k', { a: 1 }, s);
  assert.deepEqual(load('k', null, s), { a: 1 });
});

test('reads the legacy plain-number high score', () => {
  assert.equal(load('ws_hs', 0, fakeStore({ ws_hs: '1200' })), 1200);
});

test('corrupt JSON returns the fallback', () => {
  assert.equal(load('k', 3, fakeStore({ k: 'not json{' })), 3);
});

test('a throwing storage does not break the game', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(load('k', 3, denied), 3);
  assert.doesNotThrow(() => save('k', 1, denied));
});
```

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
```

- [ ] **Step 2: شغّلها وتأكّد أنّها تفشل**

Run: `node --test tests/state.test.js tests/storage.test.js tests/i18n.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` في الملفّات الثلاثة.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/state.js
// The game phase machine. Every phase change goes through set().

const ALLOWED = {
  menu: ['playing'],
  playing: ['paused', 'upgradePick', 'gameover'],
  paused: ['playing', 'menu'],
  upgradePick: ['playing'],
  gameover: ['playing', 'menu'],
};

export function createPhaseMachine(onChange) {
  let phase = 'menu';
  onChange(phase, null);
  return {
    get: () => phase,
    set(next) {
      if (!ALLOWED[phase].includes(next)) {
        throw new Error(`Invalid phase transition: ${phase} -> ${next}`);
      }
      const prev = phase;
      phase = next;
      onChange(next, prev);
    },
  };
}
```

```js
// js/storage.js
// localStorage wrapper. Some browsers throw on access in private mode,
// so reads fall back and writes are skipped instead of crashing the game.

export function load(key, fallback, store = globalThis.localStorage) {
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value, store = globalThis.localStorage) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: progress is simply not persisted.
  }
}
```

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

- [ ] **Step 4: شغّلها وتأكّد أنّها تنجح**

Run: `node --test tests/state.test.js tests/storage.test.js tests/i18n.test.js`
Expected: PASS، ١٠ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/state.js js/storage.js js/i18n.js tests/state.test.js tests/storage.test.js tests/i18n.test.js
git commit -m "feat(arcade): add phase machine, storage wrapper and UI strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: الجولة

**Files:**
- Create: `js/game.js`
- Test: `tests/game.test.js`

**Interfaces:**
- Consumes: `waveConfig`, `pickEnemyType`, `tierForType`, `pickWord` (Task 4)؛ `ENEMY_TYPES`, `createEnemy`, `updateEnemy`, `reachedShip`, `splitChildren` (Task 3)؛ `handleChar`, `releaseLock` (Task 5)؛ `registerKill`, `registerMiss` (Task 2).
- Produces:
  - `START_HP = 5`
  - `createRun({lang, words, width, height, rand = Math.random}): Run`
  - `resize(run, width, height): void`
  - `startWave(run, n): void`
  - `update(run, dt): void`
  - `onChar(run, key): void`
  - `onBackspace(run): void`
  - `Run` يحوي: `lang, words, rand, width, height, ship:{x,y}, hp, maxHp, score, streak, combo, maxCombo, correctKeys, totalKeys, kills, time, samples, enemies, nextId, lockId, wave, toSpawn, spawnTimer, cfg, waveCleared, over, mods:{magnet, shortCircuit}, events`
  - أحداث `run.events` (يفرّغها المستهلك): `{type:'waveStart', wave}`, `{type:'shot', id, x, y}`, `{type:'kill', id, x, y, enemyType, points}`, `{type:'miss', id|null}`, `{type:'hurt', x, y}`, `{type:'waveClear', wave}`, `{type:'gameOver'}`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/game.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar, onBackspace, START_HP } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

function newRun(rand = () => 0.5) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand });
  startWave(run, 1);
  return run;
}

const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

test('first update spawns one drone at the top', () => {
  const run = newRun();
  update(run, 0.016);
  assert.equal(run.enemies.length, 1);
  assert.equal(run.enemies[0].type, 'drone');
  assert.equal(run.toSpawn, 5);
  assert.ok(run.enemies[0].y < 0);
});

test('typing a word kills it and scores', () => {
  const run = newRun();
  update(run, 0.016);
  const word = run.enemies[0].word;
  typeWord(run, word);
  assert.equal(run.kills, 1);
  assert.equal(run.score, word.length * 10);
  assert.equal(run.correctKeys, word.length);
  assert.ok(run.events.some(e => e.type === 'kill'));
  update(run, 0.016);
  assert.equal(run.enemies.length, 0);
});

test('wrong key counts a miss and resets the combo', () => {
  const run = newRun();
  update(run, 0.016);
  run.streak = 3;
  run.combo = 2;
  onChar(run, 'z');
  assert.equal(run.totalKeys, 1);
  assert.equal(run.correctKeys, 0);
  assert.equal(run.combo, 1);
  assert.ok(run.events.some(e => e.type === 'miss'));
});

test('enemy reaching the ship costs hp and resets the combo', () => {
  const run = newRun();
  update(run, 0.016);
  run.streak = 4;
  run.combo = 4;
  const e = run.enemies[0];
  e.x = run.ship.x;
  e.y = run.ship.y - 5;
  update(run, 0.016);
  assert.equal(run.hp, START_HP - 1);
  assert.equal(run.combo, 1);
  assert.equal(run.enemies.length, 0);
  assert.ok(run.events.some(ev => ev.type === 'hurt'));
});

test('hp reaching zero ends the run', () => {
  const run = newRun();
  update(run, 0.016);
  run.hp = 1;
  const e = run.enemies[0];
  e.x = run.ship.x;
  e.y = run.ship.y;
  update(run, 0.016);
  assert.equal(run.over, true);
  assert.ok(run.events.some(ev => ev.type === 'gameOver'));
});

test('wave clears when everything is spawned and dead', () => {
  const run = newRun();
  run.toSpawn = 0;
  update(run, 0.016);
  assert.equal(run.waveCleared, true);
  assert.ok(run.events.some(ev => ev.type === 'waveClear' && ev.wave === 1));
});

test('respects the on-screen limit', () => {
  const run = newRun();
  for (let i = 0; i < 4; i++) update(run, 2.1);
  assert.equal(run.enemies.length, 3);
  assert.equal(run.toSpawn, 3);
});

test('splitter releases two drones unless short-circuited', () => {
  for (const [shortCircuit, expected] of [[0, 2], [1, 0]]) {
    const run = newRun();
    run.mods.shortCircuit = shortCircuit;
    run.enemies.push({ id: 99, type: 'splitter', word: 'qrstuv', typed: 0, x: 400, y: 100, vx: 0, vy: 30, speed: 30, dead: false });
    typeWord(run, 'qrstuv');
    assert.equal(run.enemies.filter(e => !e.dead).length, expected, `shortCircuit=${shortCircuit}`);
  }
});

test('backspace releases the lock', () => {
  const run = newRun();
  update(run, 0.016);
  onChar(run, run.enemies[0].word[0]);
  assert.notEqual(run.lockId, null);
  onBackspace(run);
  assert.equal(run.lockId, null);
});

test('typing is ignored after the wave is cleared', () => {
  const run = newRun();
  run.toSpawn = 0;
  update(run, 0.016);
  onChar(run, 'z');
  assert.equal(run.totalKeys, 0);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/game.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/game.js
// One run: spawning, movement, collisions, kills. Pure logic; the browser layer drains run.events.
import { waveConfig, pickEnemyType, tierForType, pickWord } from './waves.js';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from './enemies.js';
import { handleChar, releaseLock } from './targeting.js';
import { registerKill, registerMiss } from './scoring.js';

export const START_HP = 5;
const SPAWN_MARGIN = 60;
const SPAWN_Y = -20;
const SHIP_OFFSET = 70;
const REFERENCE_HEIGHT = 800;
const WPM_WINDOW_SEC = 10;

export function createRun({ lang, words, width, height, rand = Math.random }) {
  return {
    lang, words, rand, width, height,
    ship: { x: width / 2, y: height - SHIP_OFFSET },
    hp: START_HP, maxHp: START_HP,
    score: 0, streak: 0, combo: 1, maxCombo: 1,
    correctKeys: 0, totalKeys: 0, kills: 0,
    time: 0, samples: [],
    enemies: [], nextId: 1, lockId: null,
    wave: 0, toSpawn: 0, spawnTimer: 0, cfg: null,
    waveCleared: false, over: false,
    mods: { magnet: 0, shortCircuit: 0 },
    events: [],
  };
}

export function resize(run, width, height) {
  run.width = width;
  run.height = height;
  run.ship.x = width / 2;
  run.ship.y = height - SHIP_OFFSET;
}

export function startWave(run, n) {
  run.wave = n;
  run.cfg = waveConfig(n);
  run.toSpawn = run.cfg.count;
  run.spawnTimer = 0;
  run.waveCleared = false;
  run.events.push({ type: 'waveStart', wave: n });
}

const alive = run => run.enemies.filter(e => !e.dead);
const onScreenWords = run => alive(run).map(e => e.word);

function spawnEnemy(run) {
  const type = pickEnemyType(run.wave, run.rand);
  const tier = tierForType(type, run.wave, run.rand);
  const word = pickWord(run.words[tier], onScreenWords(run), run.rand);
  const x = SPAWN_MARGIN + run.rand() * (run.width - 2 * SPAWN_MARGIN);
  const speed = run.cfg.baseSpeed * ENEMY_TYPES[type].speedMul * (run.height / REFERENCE_HEIGHT);
  run.enemies.push(createEnemy({ id: run.nextId++, type, word, x, y: SPAWN_Y, speed, target: run.ship }));
  run.toSpawn -= 1;
}

function hurt(run, e) {
  e.dead = true;
  if (run.lockId === e.id) releaseLock(run);
  run.hp = Math.max(0, run.hp - ENEMY_TYPES[e.type].damage);
  registerMiss(run);
  run.events.push({ type: 'hurt', x: e.x, y: e.y });
  if (run.hp === 0) {
    run.over = true;
    run.events.push({ type: 'gameOver' });
  }
}

function kill(run, e) {
  e.dead = true;
  releaseLock(run);
  run.kills += 1;
  const points = registerKill(run, e.word.length);
  run.events.push({ type: 'kill', id: e.id, x: e.x, y: e.y, enemyType: e.type, points });
  if (e.type === 'splitter' && !run.mods.shortCircuit) {
    const taken = onScreenWords(run);
    const w1 = pickWord(run.words[1], taken, run.rand);
    const w2 = pickWord(run.words[1], [...taken, w1], run.rand);
    run.enemies.push(...splitChildren(e, [w1, w2], [run.nextId++, run.nextId++], run.ship));
  }
}

export function update(run, dt) {
  if (run.over) return;
  run.time += dt;
  run.samples = run.samples.filter(s => run.time - s.t <= WPM_WINDOW_SEC);

  run.spawnTimer -= dt;
  if (run.toSpawn > 0 && run.spawnTimer <= 0 && alive(run).length < run.cfg.maxOnScreen) {
    spawnEnemy(run);
    run.spawnTimer = run.cfg.spawnInterval;
  }

  for (const e of run.enemies) {
    if (e.dead) continue;
    updateEnemy(e, dt, run.ship);
    if (reachedShip(e, run.ship)) hurt(run, e);
    if (run.over) break;
  }
  run.enemies = run.enemies.filter(e => !e.dead);

  if (!run.over && !run.waveCleared && run.toSpawn === 0 && run.enemies.length === 0) {
    run.waveCleared = true;
    run.events.push({ type: 'waveClear', wave: run.wave });
  }
}

export function onChar(run, key) {
  if (run.over || run.waveCleared) return;
  run.totalKeys += 1;
  const res = handleChar(run, key);
  if (res.kind === 'miss') {
    registerMiss(run);
    run.events.push({ type: 'miss', id: res.enemy ? res.enemy.id : null });
    return;
  }
  run.correctKeys += 1;
  run.samples.push({ t: run.time, chars: 1 });
  run.events.push({ type: 'shot', id: res.enemy.id, x: res.enemy.x, y: res.enemy.y });
  if (res.kind === 'kill') kill(run, res.enemy);
}

export function onBackspace(run) {
  releaseLock(run);
}
```

- [ ] **Step 4: شغّل الاختبار وتأكّد أنّه ينجح**

Run: `node --test tests/game.test.js`
Expected: PASS، ١٠ اختبارات.

- [ ] **Step 5: شغّل كلّ الاختبارات**

Run: `node --test tests/`
Expected: PASS، ٥٤ اختباراً، `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add js/game.js tests/game.test.js
git commit -m "feat(arcade): add run logic for spawning, kills and collisions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: طبقة المتصفّح

**Files:**
- Create: `index.html`, `css/base.css`, `js/loop.js`, `js/input.js`, `js/render/starfield.js`, `js/render/ship.js`, `js/render/enemies.js`, `js/render/fx.js`, `js/render/labels.js`, `js/main.js`
- Modify: `.claude/launch.json` (السطر `"runtimeExecutable": "python"` ← `"python3"`)

**Interfaces:**
- Consumes: كلّ ما سبق.
- Produces (للخطط اللاحقة):
  - `startLoop(frame: (dt:number) => void)`
  - `attachInput(handleKey: (key:string) => void)` — يمرّر الحروف المفردة و`Enter` و`Escape` و`Backspace`.
  - `createStarfield(canvas) → {resize(w, h, dpr), draw(dt, colors)}`
  - `drawShip(ctx, ship, angle, color)`, `drawHpRing(ctx, ship, hp, maxHp, color, dimColor)`, `aimAngle(ship, target|null)`
  - `drawEnemy(ctx, enemy, color, locked)`
  - `createFx() → {beam(from, to), burst(x, y), update(dt), draw(ctx, colors)}`
  - `createLabels(container) → {sync(enemies, lockId, lang), clear(), flashMiss(id)}`
  - `colors = {bg, text, dim, cyan, green, pink, yellow, purple}` تُقرأ من متغيّرات CSS.

هذه المهمّة لا اختبارات آليّة لها. التحقّق في المتصفّح (Step 6–8).

- [ ] **Step 1: الهيكل والتنسيق**

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Word Strike</title>
  <link rel="stylesheet" href="css/base.css">
</head>
<body>
  <canvas id="bg"></canvas>
  <canvas id="game"></canvas>
  <div id="labels"></div>

  <div id="hud" hidden>
    <div class="hud-score"><span class="hud-label" data-i18n="score"></span><span id="hud-score">0</span></div>
    <div class="hud-wave"><span class="hud-label" data-i18n="wave"></span><span id="hud-wave">1</span></div>
    <div class="hud-best"><span class="hud-label" data-i18n="best"></span><span id="hud-best">0</span></div>
    <div id="hud-combo"></div>
  </div>

  <div id="wave-banner" hidden></div>

  <section id="screen-menu" class="screen">
    <h1 class="title">WORD STRIKE</h1>
    <p class="tagline" data-i18n="tagline"></p>
    <div class="lang-switch">
      <button class="lang-btn" data-lang="en">English</button>
      <button class="lang-btn" data-lang="ar">العربيّة</button>
    </div>
    <button id="btn-start" class="btn-primary"><span data-i18n="start"></span><kbd>Enter</kbd></button>
  </section>

  <section id="screen-pause" class="screen" hidden>
    <h2 data-i18n="paused"></h2>
    <button id="btn-resume" class="btn-primary"><span data-i18n="resume"></span><kbd>Esc</kbd></button>
    <button id="btn-pause-menu" class="btn-secondary"><span data-i18n="menu"></span><kbd>R</kbd></button>
  </section>

  <section id="screen-gameover" class="screen" hidden>
    <h2 class="danger" data-i18n="gameOver"></h2>
    <div id="final-score" class="final-score">0</div>
    <div class="final-stats">
      <div><b id="final-wave">0</b><span data-i18n="wave"></span></div>
      <div><b id="final-wpm">0</b><span data-i18n="wpm"></span></div>
      <div><b id="final-acc">0%</b><span data-i18n="accuracy"></span></div>
      <div><b id="final-combo">×1</b><span data-i18n="maxCombo"></span></div>
    </div>
    <button id="btn-again" class="btn-primary"><span data-i18n="playAgain"></span><kbd>Enter</kbd></button>
    <button id="btn-over-menu" class="btn-secondary"><span data-i18n="menu"></span><kbd>R</kbd></button>
  </section>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

```css
/* css/base.css */
:root {
  --neon-cyan: #00f5ff;
  --neon-green: #39ff14;
  --neon-pink: #ff2d78;
  --neon-yellow: #ffe600;
  --neon-purple: #bf5fff;
  --bg: #060610;
  --hud-bg: rgba(6, 6, 20, 0.85);
  --tile-bg: rgba(10, 10, 40, 0.92);
  --text: #e8e8ff;
  --dim: #555577;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  --font-ar: system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
[hidden] { display: none !important; }

html, body {
  width: 100%; height: 100%; overflow: hidden;
  background: var(--bg); color: var(--text); font-family: var(--font-mono);
}
html[dir="rtl"] body { font-family: var(--font-ar); }

canvas { position: fixed; top: 0; left: 0; display: block; }
#bg { z-index: 0; }
#game { z-index: 1; }

/* Enemy word labels */
#labels { position: fixed; inset: 0; z-index: 2; pointer-events: none; }
.label {
  position: absolute; left: 0; top: 0; white-space: nowrap;
  font-size: 15px; letter-spacing: 1px; padding: 2px 8px; border-radius: 4px;
  background: var(--tile-bg); border: 1px solid var(--neon-pink);
}
.label.arabic { direction: rtl; letter-spacing: 0; font-family: var(--font-ar); font-size: 17px; }
.label.locked { border-color: var(--neon-cyan); box-shadow: 0 0 10px var(--neon-cyan); z-index: 1; }
.label .typed { color: var(--neon-green); text-shadow: 0 0 6px var(--neon-green); }
.label.miss { animation: label-miss 0.25s; }
@keyframes label-miss {
  0%, 100% { margin-left: 0; }
  25% { margin-left: -4px; }
  75% { margin-left: 4px; }
}

/* HUD corners */
#hud { position: fixed; inset: 0; z-index: 10; pointer-events: none; }
#hud > div { position: absolute; top: 14px; font-size: 22px; font-weight: 700; }
.hud-label {
  display: block; font-size: 10px; font-weight: 400; letter-spacing: 2px;
  color: var(--dim); text-transform: uppercase;
}
.hud-score { inset-inline-start: 18px; }
.hud-best { inset-inline-end: 18px; text-align: end; }
.hud-wave { left: 50%; transform: translateX(-50%); text-align: center; color: var(--neon-cyan); }
#hud-combo {
  top: 0; left: 0; font-size: 18px;
  color: var(--neon-yellow); text-shadow: 0 0 8px var(--neon-yellow);
}

#wave-banner {
  position: fixed; top: 30%; left: 50%; transform: translateX(-50%); z-index: 12;
  font-size: 34px; font-weight: 800; pointer-events: none;
  color: var(--neon-cyan); text-shadow: 0 0 16px var(--neon-cyan);
}

/* Screens */
.screen {
  position: fixed; inset: 0; z-index: 20;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  background: rgba(5, 4, 15, 0.6);
}
.title {
  font-size: clamp(36px, 8vw, 72px); letter-spacing: 6px;
  color: var(--neon-cyan); text-shadow: 0 0 20px var(--neon-cyan);
}
.tagline { color: var(--dim); }
.danger { font-size: 32px; color: var(--neon-pink); text-shadow: 0 0 14px var(--neon-pink); }
.final-score { font-size: 48px; font-weight: 800; }
.final-stats { display: flex; gap: 32px; }
.final-stats div { display: flex; flex-direction: column; align-items: center; font-size: 12px; color: var(--dim); }
.final-stats b { font-size: 24px; color: var(--text); }

button { font: inherit; cursor: pointer; color: var(--text); background: none; border-radius: 8px; }
.btn-primary {
  padding: 10px 28px; font-size: 16px;
  border: 1px solid var(--neon-cyan); box-shadow: 0 0 12px var(--neon-cyan);
}
.btn-secondary { padding: 8px 20px; border: 1px solid var(--dim); color: var(--text); }
kbd { font-family: var(--font-mono); font-size: 11px; color: var(--dim); margin-inline-start: 8px; }
.lang-switch { display: flex; gap: 8px; }
.lang-btn { padding: 4px 14px; font-size: 13px; border: 1px solid var(--dim); }
.lang-btn.active { border-color: var(--neon-cyan); color: var(--neon-cyan); }
```

- [ ] **Step 2: الحلقة والإدخال**

```js
// js/loop.js
// One always-running frame loop. dt is capped so a background tab does not teleport enemies.
const MAX_DT = 0.05;

export function startLoop(frame) {
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(MAX_DT, (now - last) / 1000);
    last = now;
    frame(dt);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

```js
// js/input.js
// Desktop keyboard. Mobile input arrives in a later plan.
const SPECIAL_KEYS = ['Enter', 'Escape', 'Backspace'];

export function attachInput(handleKey) {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1 && !SPECIAL_KEYS.includes(e.key)) return;
    e.preventDefault();
    handleKey(e.key);
  });
}
```

- [ ] **Step 3: الرسم**

```js
// js/render/starfield.js
// Three star layers at different speeds for depth.
const LAYERS = [
  { count: 80, speed: 8,  size: 1,   alpha: 0.35 },
  { count: 50, speed: 20, size: 1.5, alpha: 0.6 },
  { count: 20, speed: 45, size: 2,   alpha: 0.9 },
];

export function createStarfield(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let stars = [];

  function resize(width, height, dpr) {
    w = width;
    h = height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = LAYERS.flatMap(layer =>
      Array.from({ length: layer.count }, () => ({ x: Math.random() * w, y: Math.random() * h, layer })));
  }

  function draw(dt, colors) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = colors.text;
    for (const s of stars) {
      s.y += s.layer.speed * dt;
      if (s.y > h) {
        s.y -= h;
        s.x = Math.random() * w;
      }
      ctx.globalAlpha = s.layer.alpha;
      ctx.fillRect(s.x, s.y, s.layer.size, s.layer.size);
    }
    ctx.globalAlpha = 1;
  }

  return { resize, draw };
}
```

```js
// js/render/ship.js
// The player ship and the segmented hp ring around it.

export function aimAngle(ship, target) {
  return target ? Math.atan2(target.y - ship.y, target.x - ship.x) + Math.PI / 2 : 0;
}

export function drawShip(ctx, ship, angle, color) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(16, 16);
  ctx.lineTo(0, 8);
  ctx.lineTo(-16, 16);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawHpRing(ctx, ship, hp, maxHp, color, dimColor) {
  const radius = 38;
  const gap = 0.12;
  const segment = (Math.PI * 2) / maxHp;
  ctx.lineWidth = 3;
  for (let i = 0; i < maxHp; i++) {
    const start = -Math.PI / 2 + i * segment + gap / 2;
    ctx.strokeStyle = i < hp ? color : dimColor;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, radius, start, start + segment - gap);
    ctx.stroke();
  }
}
```

```js
// js/render/enemies.js
// Plain outline shapes per enemy type. Glow arrives in the polish plan.
const SHAPES = {
  drone:    { sides: 3, radius: 12, rotation: 0 },
  seeker:   { sides: 4, radius: 12, rotation: 0 },
  splitter: { sides: 6, radius: 12, rotation: 0 },
  armored:  { sides: 4, radius: 16, rotation: Math.PI / 4 },
};

export function drawEnemy(ctx, e, color, locked) {
  const shape = SHAPES[e.type];
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(shape.rotation);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 2.5 : 1.5;
  ctx.beginPath();
  for (let i = 0; i < shape.sides; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / shape.sides;
    const px = Math.cos(a) * shape.radius;
    const py = Math.sin(a) * shape.radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
```

```js
// js/render/fx.js
// Minimal feedback: a shot line per letter and an expanding ring per kill or hit.
const BEAM_LIFE = 0.08;
const RING_LIFE = 0.35;

export function createFx() {
  const beams = [];
  const rings = [];

  function expire(list, dt) {
    for (const f of list) f.life -= dt;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }

  return {
    beam(from, to) {
      beams.push({ x1: from.x, y1: from.y - 20, x2: to.x, y2: to.y, life: BEAM_LIFE });
    },
    burst(x, y) {
      rings.push({ x, y, life: RING_LIFE });
    },
    update(dt) {
      expire(beams, dt);
      expire(rings, dt);
    },
    draw(ctx, colors) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.cyan;
      for (const b of beams) {
        ctx.globalAlpha = b.life / BEAM_LIFE;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.yellow;
      for (const r of rings) {
        const p = 1 - r.life / RING_LIFE;
        ctx.globalAlpha = 1 - p;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 10 + p * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}
```

```js
// js/render/labels.js
// Enemy words as DOM elements so Arabic letters shape and join correctly.
const LABEL_OFFSET_Y = 22;

export function createLabels(container) {
  const nodes = new Map(); // enemy id -> { el, typedEl, restEl, typed }

  function create(lang) {
    const el = document.createElement('div');
    el.className = lang === 'ar' ? 'label arabic' : 'label';
    const typedEl = document.createElement('span');
    typedEl.className = 'typed';
    const restEl = document.createElement('span');
    el.append(typedEl, restEl);
    container.append(el);
    return { el, typedEl, restEl, typed: -1 };
  }

  function sync(enemies, lockId, lang) {
    const seen = new Set();
    for (const e of enemies) {
      if (e.dead) continue;
      seen.add(e.id);
      let node = nodes.get(e.id);
      if (!node) {
        node = create(lang);
        nodes.set(e.id, node);
      }
      if (node.typed !== e.typed) {
        node.typedEl.textContent = e.word.slice(0, e.typed);
        node.restEl.textContent = e.word.slice(e.typed);
        node.typed = e.typed;
      }
      node.el.classList.toggle('locked', e.id === lockId);
      node.el.style.transform = `translate(${e.x}px, ${e.y + LABEL_OFFSET_Y}px) translateX(-50%)`;
    }
    for (const [id, node] of nodes) {
      if (!seen.has(id)) {
        node.el.remove();
        nodes.delete(id);
      }
    }
  }

  function clear() {
    for (const node of nodes.values()) node.el.remove();
    nodes.clear();
  }

  function flashMiss(id) {
    const node = nodes.get(id);
    if (!node) return;
    node.el.classList.remove('miss');
    void node.el.offsetWidth; // restart the animation
    node.el.classList.add('miss');
  }

  return { sync, clear, flashMiss };
}
```

- [ ] **Step 4: الربط**

```js
// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace } from './game.js';
import { wordsFor } from './words.js';
import { accuracy, finalWpm } from './scoring.js';
import { applyStrings, t } from './i18n.js';
import { load, save } from './storage.js';
import { startLoop } from './loop.js';
import { attachInput } from './input.js';
import { createStarfield } from './render/starfield.js';
import { drawShip, drawHpRing, aimAngle } from './render/ship.js';
import { drawEnemy } from './render/enemies.js';
import { createFx } from './render/fx.js';
import { createLabels } from './render/labels.js';

const BANNER_SEC = 1.5;
const HIGH_SCORE_KEY = 'ws_hs';

const $ = id => document.getElementById(id);
const gameCanvas = $('game');
const gctx = gameCanvas.getContext('2d');
const starfield = createStarfield($('bg'));
const labels = createLabels($('labels'));
const fx = createFx();

let lang = 'en';
let run = null;
let width = 0;
let height = 0;
let bannerTimer = 0;
let nextWaveTimer = 0;
let best = load(HIGH_SCORE_KEY, 0);
let colors = readColors();

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
  $('hud').hidden = !(next === 'playing' || next === 'paused');
  if (next === 'menu') {
    labels.clear();
    run = null;
    $('wave-banner').hidden = true;
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
}

function showBanner(text) {
  const banner = $('wave-banner');
  banner.textContent = text;
  banner.hidden = false;
  bannerTimer = BANNER_SEC;
}

function newRun() {
  labels.clear();
  nextWaveTimer = 0;
  run = createRun({ lang, words: wordsFor(lang), width, height });
  startWave(run, 1);
  showBanner(t(lang, 'waveBanner', 1));
  phase.set('playing');
}

function endRun() {
  if (run.score > best) {
    best = run.score;
    save(HIGH_SCORE_KEY, best);
  }
  $('final-score').textContent = run.score.toLocaleString('en');
  $('final-wave').textContent = run.wave;
  $('final-wpm').textContent = finalWpm(run.correctKeys, run.time);
  $('final-acc').textContent = `${Math.round(accuracy(run.correctKeys, run.totalKeys) * 100)}%`;
  $('final-combo').textContent = `×${run.maxCombo}`;
  phase.set('gameover');
}

function drainEvents() {
  for (const ev of run.events) {
    if (ev.type === 'shot') fx.beam(run.ship, ev);
    else if (ev.type === 'kill' || ev.type === 'hurt') fx.burst(ev.x, ev.y);
    else if (ev.type === 'miss' && ev.id !== null) labels.flashMiss(ev.id);
    else if (ev.type === 'waveClear') {
      showBanner(t(lang, 'waveClear', ev.wave));
      nextWaveTimer = BANNER_SEC;
    } else if (ev.type === 'gameOver') endRun();
  }
  run.events.length = 0;
}

function drawRun() {
  const locked = run.enemies.find(e => e.id === run.lockId && !e.dead) || null;
  for (const e of run.enemies) {
    if (!e.dead) drawEnemy(gctx, e, e === locked ? colors.cyan : colors.pink, e === locked);
  }
  drawShip(gctx, run.ship, aimAngle(run.ship, locked), colors.cyan);
  drawHpRing(gctx, run.ship, run.hp, run.maxHp, colors.cyan, colors.dim);
  labels.sync(run.enemies, run.lockId, run.lang);

  $('hud-score').textContent = run.score.toLocaleString('en');
  $('hud-wave').textContent = run.wave;
  $('hud-best').textContent = Math.max(best, run.score).toLocaleString('en');
  const combo = $('hud-combo');
  combo.textContent = run.combo > 1 ? `×${run.combo}` : '';
  combo.style.transform = `translate(${run.ship.x + 48}px, ${run.ship.y - 12}px)`;
}

function frame(dt) {
  starfield.draw(dt, colors);
  gctx.clearRect(0, 0, width, height);
  const playing = phase.get() === 'playing';

  if (playing && bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('wave-banner').hidden = true;
  }
  if (run && playing) {
    update(run, dt);
    if (nextWaveTimer > 0) {
      nextWaveTimer -= dt;
      if (nextWaveTimer <= 0) {
        startWave(run, run.wave + 1);
        showBanner(t(lang, 'waveBanner', run.wave));
      }
    }
    drainEvents();
  }

  fx.update(playing ? dt : 0);
  if (run) drawRun();
  fx.draw(gctx, colors);
}

function handleKey(key) {
  const p = phase.get();
  if (p === 'menu') {
    if (key === 'Enter') newRun();
  } else if (p === 'playing') {
    if (key === 'Escape') phase.set('paused');
    else if (key === 'Backspace') onBackspace(run);
    else if (key !== 'Enter' && key !== ' ') onChar(run, key);
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
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

attachInput(handleKey);
resize();
setLang('en');
startLoop(frame);
```

- [ ] **Step 5: أصلح إعداد الخادم المحلّيّ**

في `.claude/launch.json` غيّر `"runtimeExecutable": "python"` إلى `"runtimeExecutable": "python3"`.
السبب: على هذا الجهاز `python` اسم مستعار في الطرفيّة فقط (`which python` ← `python: aliased to python3`)، والبرامج لا تراه.

- [ ] **Step 6: تحقّق: القائمة بلا أخطاء**

1. `preview_start` باسم `typing-game`.
2. `navigate` إلى `http://localhost:3737/index.html`.
3. `read_console_messages` مع `onlyErrors: true`. Expected: لا شيء.
4. `computer screenshot`. Expected: عنوان WORD STRIKE، زرّا اللغة، زرّ «Start run».

- [ ] **Step 7: تحقّق: اللعب بالإنجليزيّة**

1. اضغط `Enter`. Expected: «Wave 1»، ثمّ عدوّ يهبط باسم تحته.
2. `get_page_text` لقراءة الاسم الظاهر، ثمّ `computer type` به.
   Expected: حلقة انفجار، النقاط في أعلى اليسار > ٠، والاسم يختفي.
3. اكتب حرفاً لا يبدأ به أيّ اسم. Expected: لا انهيار، والكومبو يختفي.
4. `Escape`. Expected: شاشة «Paused» واللعب متجمّد. `Escape` مرّة أخرى ← يكمل.
5. اترك الأعداء يصلون السفينة حتى تنتهي الحياة. Expected: شاشة «Ship down» بأربعة أرقام.
6. `read_console_messages` مع `onlyErrors: true`. Expected: لا شيء.
7. لقطة شاشة لكلّ من: اللعب، الإيقاف، النهاية.

- [ ] **Step 8: تحقّق: العربيّة**

1. `R` للقائمة، ثمّ انقر «العربيّة».
   Expected: النصوص بالعربيّة، والصفحة من اليمين لليسار، والنقاط تنتقل لأعلى اليمين.
2. ابدأ، والتقط صورة مقرّبة (`zoom`) لاسم عدوّ. Expected: حروف متّصلة.
3. اكتب أوّل حرفين من الاسم. Expected: الحرفان أخضران والحروف ما زالت متّصلة.

- [ ] **Step 9: كلّ الاختبارات ثمّ Commit**

Run: `node --test tests/`
Expected: PASS، `fail 0`.

```bash
git add index.html css/base.css js/loop.js js/input.js js/render js/main.js .claude/launch.json
git commit -m "feat(arcade): add playable browser shell for the new arcade mode

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## ما بعد هذه الخطّة

الخطط التالية، كلّ واحدة تُكتب بعد انتهاء سابقتها:

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٢ | الترقيات + شاشة الاختيار (المرحلة ٣) |
| ٣ | الزعيم (المرحلة ٤) |
| ٤ | الواجهات المصقولة + الميزات الباقية (المرحلتان ٥ و٦) |
| ٥ | الإحساس + الصوت + الموسيقى (المرحلتان ٧ و٨) |
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
