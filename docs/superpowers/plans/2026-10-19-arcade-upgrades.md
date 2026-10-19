# Word Strike Arcade — الخطّة ٢: الترقيات

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** بعد كلّ موجة تظهر ثلاث بطاقات ترقية. اختيار واحدة يغيّر الجولة: حياة، إبطاء، برق، برج، نبضة، اندفاع، نوفا، وغيرها. الترقيات الاثنتا عشرة كلّها تعمل ومختبَرة.

**Architecture:** `js/upgrades.js` يملك المجموعة والسحب والتطبيق. منطق اللعب (`js/game.js`) لا يستورده، ويقرأ `run.mods` فقط، كما في المواصفة (القسم ٥). شاشة `upgradePick` تحلّ محلّ الشاشة المؤقّتة «الموجة n اكتملت» من الخطّة ١.

**Tech Stack:** كالخطّة ١. Node v22.22.0 في السحابة.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — هذه الخطّة تنفّذ المرحلة ٣ من القسم ١٢ (الترقيات + شاشة الاختيار).

**يبدأ التنفيذ بعد دمج PR #1** (`feat/arcade-core`). الفرع: `feat/arcade-upgrades` من `master` بعد الدمج.

## Global Constraints

- كلّ قيود الخطّة ١ سارية: لا بناء ولا مكتبات ولا صور، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`، العشوائيّة من `rand`، المطابقة صارمة، `typing-game.html` لا يُلمس.
- `js/game.js` لا يستورد `js/upgrades.js`.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test 'tests/*.test.js'` (الصيغة `node --test tests/` لا تعمل على Node 22).
- الكتل أدناه ملفّات كاملة. السطر الأوّل في كلّ كتلة تعليق باسم الملفّ، وهو جزء من الملفّ. انسخ كلّ كتلة كما هي فوق الملفّ القائم أو كملفّ جديد.

## قرارات ليست في المواصفة

حُسمت الثلاثة الأولى مع مو. الباقي اختيار هذه الخطّة.

1. **البرق المتسلسل** يضرب العدوّ **الأقرب للسفينة** (أكبر `y`)، كقاعدة القفل.
2. **القتل بالترقيات** (برق، برج): نقاط بالكومبو الحاليّ **بلا** زيادة السلسلة. الحروف المحذوفة لا تُحسب في الدقّة ولا السرعة. القتل المساعد لا يُطلق برقاً جديداً.
3. **الاندفاع**: السرعة = حروف القفل الأخير على الكلمة ÷ ٥ ÷ دقائق منذ بدء ذلك القفل. «بلا خطأ» = لا حرف خاطئ أثناء ذلك القفل.
4. **نوفا**: تدمّر كلّ الأعداء بلا نقاط، ولا تُحسب قتلاً، ولا ينقسم المنشطر، والكومبو لا يتغيّر. صواريخ الزعيم تأتي في الخطّة ٣.
5. **حارس الكومبو** يحمي من الحرف الخاطئ فقط. الاصطدام يُسقط الكومبو دائماً. الخطأ المحميّ يُحسب في الدقّة.
6. **الملحميّة** تظهر حين يكون رقم الموجة المنتهية ≥ ٣.
7. **السحب**: تُختار الندرة بأوزانها (٦٠/٣٠/١٠) بين الندرات التي بقي منها شيء، ثمّ بطاقة عشوائيّة منها. لا تكرار في السحبة.
8. **البرج**: إن لم يجد هدفاً غير مقفول عليه ينتظر حتى يظهر هدف. عدّاده يبدأ من جديد مع كلّ موجة.
9. **النبضة**: تعدّ كلّ قتل (بالكتابة وبالترقيات). التجميد يشمل من يولَد أثناءه، والتوليد مستمرّ.
10. **البديل «إصلاح»**: «إصلاح» بلا حدّ تكدّس، فالمجموعة لا تفرغ أبداً، ويبقى «إصلاح» وحده حين يكتمل الباقي. لا فرع خاصّ له.
11. **مؤشّر نوفا**: الرمز `✸` يسار السفينة حين تكون جاهزة.
12. **الوميض**: البطاقة المختارة تومض ٠٫٣٥ ثانية. أيّ اختيار آخر خلالها يُتجاهَل. الوقت يُحسب من `dt`.

## خارج هذه الخطّة

البطاقات العموديّة على الجوّال (الخطّة ٦). عرض الترقيات المجمّعة في شاشة النهاية وبطاقة المشاركة (الخطّة ٤). الصوت (الخطّة ٥). الزعيم وصواريخه (الخطّة ٣).

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/scoring.js` | تعديل: مكافأة في `registerKill`، و`registerAssistKill` جديدة |
| `js/game.js` | تعديل: `run.mods` الكامل وآثار الترقيات و`triggerNova` |
| `js/upgrades.js` | جديد: المجموعة والسحب والتطبيق |
| `js/i18n.js` | تعديل: نصوص شاشة الترقية |
| `js/render/fx.js` | تعديل: خطّ `zap` بنفسجيّ |
| `js/render/cards.js` | جديد: بطاقات الترقية كعناصر DOM |
| `js/main.js` | تعديل: مرحلة `upgradePick`، ونوفا بـ `Enter`، ومؤشّرها |
| `index.html`, `css/base.css` | تعديل: شاشة الترقية والبطاقات |
| `tests/scoring.test.js`, `tests/i18n.test.js` | تعديل: اختبارات إضافيّة |
| `tests/effects.test.js`, `tests/upgrades.test.js` | جديد |

---

### Task 1: مكافأة النقاط والقتل المساعد

**Files:**
- Modify: `js/scoring.js`
- Modify: `tests/scoring.test.js`

**Interfaces:**
- `registerKill(run, wordLength, bonus = 1): number` — `bonus` يُضرب في مضاعِف المغناطيس.
- `registerAssistKill(run, wordLength): number` — نقاط بالكومبو الحاليّ، بلا تغيير `streak` ولا `combo`.

- [ ] **Step 1: اكتب الاختبارات الفاشلة** — استبدل `tests/scoring.test.js` بالكتلة:

```js
// tests/scoring.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comboFor, wordPoints, registerKill, registerAssistKill, registerMiss, accuracy, rollingWpm, finalWpm } from '../js/scoring.js';

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

test('registerKill applies a bonus multiplier', () => {
  const run = freshRun();
  run.mods.magnet = 2;
  assert.equal(registerKill(run, 5, 2), 140);
});

test('assist kill scores at the current combo without growing it', () => {
  const run = { ...freshRun(), streak: 4, combo: 4, maxCombo: 4 };
  assert.equal(registerAssistKill(run, 3), 120);
  assert.equal(run.streak, 4);
  assert.equal(run.combo, 4);
  assert.equal(run.score, 120);
});
```

- [ ] **Step 2: شغّلها وتأكّد أنّها تفشل**

Run: `node --test tests/scoring.test.js`
Expected: FAIL — `registerAssistKill` غير مُصدَّر (`SyntaxError` عن الاستيراد).

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/scoring.js` بالكتلة:

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
```

- [ ] **Step 4: شغّلها وتأكّد أنّها تنجح**

Run: `node --test tests/scoring.test.js`
Expected: PASS، ١٠ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/scoring.js tests/scoring.test.js
git commit -m "feat(arcade): add score bonus and assist kills

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: آثار الترقيات في الجولة

**Files:**
- Modify: `js/game.js`
- Test: `tests/effects.test.js`

**Interfaces:**
- `createMods()` — `{magnet, shortCircuit, slowField, focus, comboGuard, chain, turret, pulse, overdrive, nova}` كلّها ٠.
- `Run` يضيف: `mods` الكامل، `picked: string[]`، `guardsLeft`، `novaReady`، `turretTimer`، `pulseKills`، `freezeTimer`.
- العدوّ المقفول عليه يحمل `lockAt`، `lockChars`، `lockMisses` (تُضبط عند بدء القفل).
- `triggerNova(run): void`
- أحداث جديدة: `{type:'zap', from:{x,y}, to:{x,y}}`، `{type:'pulse'}`، `{type:'novaHit', x, y}`، `{type:'nova'}`.

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/effects.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar, triggerNova } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

// A run with the given mods, nothing left to spawn, and hand-placed enemies.
function runWith(mods, ...enemies) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  Object.assign(run.mods, mods);
  startWave(run, 1);
  run.toSpawn = 0;
  run.enemies.push(...enemies);
  return run;
}

const enemy = (id, word, x, y, vy = 100) =>
  ({ id, type: 'drone', word, typed: 0, x, y, vx: 0, vy, speed: Math.abs(vy), dead: false });
const near = (a, b) => Math.abs(a - b) < 1e-9;
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

test('slow field slows enemies in the bottom third only', () => {
  const run = runWith({ slowField: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 600));
  update(run, 0.1);
  assert.ok(near(run.enemies[0].y, 110));
  assert.ok(near(run.enemies[1].y, 606));
});

test('focus freezes the locked enemy only', () => {
  const run = runWith({ focus: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  onChar(run, 'a');
  update(run, 0.1);
  assert.equal(run.enemies[0].y, 100);
  assert.ok(run.enemies[1].y > 100);
});

test('combo guard absorbs the first miss of each wave', () => {
  const run = runWith({ comboGuard: 1 }, enemy(1, 'ab', 100, 100));
  run.streak = 4;
  run.combo = 4;
  onChar(run, 'z');
  assert.equal(run.combo, 4);
  assert.equal(run.totalKeys, 1);
  onChar(run, 'z');
  assert.equal(run.combo, 1);
  startWave(run, 2);
  assert.equal(run.guardsLeft, 1);
});

test('chain strips letters from the enemy closest to the ship at x4', () => {
  const run = runWith({ chain: 2 },
    enemy(1, 'ab', 100, 100), enemy(2, 'mnop', 300, 400), enemy(3, 'ijkl', 500, 200));
  run.streak = 3;
  run.combo = 2;
  typeWord(run, 'ab');
  assert.equal(run.combo, 4);
  assert.equal(run.enemies[1].typed, 2);
  assert.equal(run.enemies[2].typed, 0);
  assert.ok(run.events.some(e => e.type === 'zap'));
});

test('no chain below x4', () => {
  const run = runWith({ chain: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'mnop', 300, 400));
  typeWord(run, 'ab');
  assert.equal(run.enemies[1].typed, 0);
});

test('a chain that finishes a word scores at the current combo, without streak or keys', () => {
  const run = runWith({ chain: 2 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 400));
  run.streak = 3;
  run.combo = 2;
  typeWord(run, 'ab');
  assert.equal(run.score, 160);
  assert.equal(run.kills, 2);
  assert.equal(run.streak, 4);
  assert.equal(run.correctKeys, 2);
  assert.ok(run.enemies[1].dead);
});

test('turret strips a letter from an unlocked enemy on its timer', () => {
  const run = runWith({ turret: 2 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(run, 'i');
  update(run, 4.9);
  assert.equal(run.enemies[1].typed, 0);
  update(run, 0.2);
  assert.equal(run.enemies[1].typed, 1);
  assert.equal(run.enemies[0].typed, 1);
});

test('pulse freezes every enemy for 2s after 15 kills', () => {
  const run = runWith({ pulse: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  run.pulseKills = 14;
  typeWord(run, 'ab');
  assert.equal(run.freezeTimer, 2);
  update(run, 1);
  assert.equal(run.enemies[0].y, 100);
  update(run, 1);
  assert.equal(run.enemies[0].y, 100);
  update(run, 0.1);
  assert.ok(run.enemies[0].y > 100);
});

test('overdrive doubles a clean fast word', () => {
  const run = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  typeWord(run, 'ijkl');
  assert.equal(run.score, 80);
});

test('overdrive skips a slow word and a word with a miss', () => {
  const slow = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(slow, 'i');
  update(slow, 2);
  typeWord(slow, 'jkl');
  assert.equal(slow.score, 40);

  const sloppy = runWith({ overdrive: 1 }, enemy(1, 'ijkl', 100, 100, 0), enemy(2, 'mnop', 300, 100, 0));
  onChar(sloppy, 'i');
  onChar(sloppy, 'z');
  typeWord(sloppy, 'jkl');
  assert.equal(sloppy.score, 40);
});

test('nova clears the screen once per wave without points', () => {
  const run = runWith({ nova: 1 }, enemy(1, 'ab', 100, 100), enemy(2, 'cd', 300, 100));
  onChar(run, 'a');
  triggerNova(run);
  assert.equal(run.enemies.filter(e => !e.dead).length, 0);
  assert.equal(run.lockId, null);
  assert.equal(run.score, 0);
  assert.equal(run.kills, 0);
  run.enemies.push(enemy(3, 'ef', 100, 100));
  triggerNova(run);
  assert.equal(run.enemies[2].dead, false);
  startWave(run, 2);
  assert.equal(run.novaReady, true);
});

test('no nova without the upgrade', () => {
  const run = runWith({}, enemy(1, 'ab', 100, 100));
  triggerNova(run);
  assert.equal(run.enemies[0].dead, false);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/effects.test.js`
Expected: FAIL — `triggerNova` غير مُصدَّر.

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/game.js` بالكتلة:

```js
// js/game.js
// One run: spawning, movement, collisions, kills and upgrade effects.
// Pure logic; the browser layer drains run.events. Effects read run.mods only.
import { waveConfig, pickEnemyType, tierForType, pickWord } from './waves.js';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from './enemies.js';
import { handleChar, lockedEnemy, releaseLock } from './targeting.js';
import { registerKill, registerAssistKill, registerMiss } from './scoring.js';

export const START_HP = 5;
const SPAWN_MARGIN = 60;
const SPAWN_Y = -20;
const SHIP_OFFSET = 70;
const REFERENCE_HEIGHT = 800;
const WPM_WINDOW_SEC = 10;
const SLOW_ZONE = 2 / 3;
const SLOW_STEP = 0.2;
const CHAIN_MIN_COMBO = 4;
const TURRET_SEC = 10;
const PULSE_EVERY = 15;
const PULSE_SEC = 2;
const OVERDRIVE_WPM = 60;

export function createMods() {
  return {
    magnet: 0, shortCircuit: 0, slowField: 0, focus: 0, comboGuard: 0,
    chain: 0, turret: 0, pulse: 0, overdrive: 0, nova: 0,
  };
}

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
    mods: createMods(), picked: [],
    guardsLeft: 0, novaReady: false, turretTimer: 0, pulseKills: 0, freezeTimer: 0,
    events: [],
  };
}

export function resize(run, width, height) {
  run.width = width;
  run.height = height;
  run.ship.x = width / 2;
  run.ship.y = height - SHIP_OFFSET;
}

const turretInterval = run => (run.mods.turret ? TURRET_SEC / run.mods.turret : 0);

export function startWave(run, n) {
  run.wave = n;
  run.cfg = waveConfig(n);
  run.toSpawn = run.cfg.count;
  run.spawnTimer = 0;
  run.waveCleared = false;
  run.guardsLeft = run.mods.comboGuard;
  run.novaReady = run.mods.nova > 0;
  run.turretTimer = turretInterval(run);
  run.freezeTimer = 0;
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

// Every way a word can be finished ends here: typing, chain or turret.
function destroy(run, e, points) {
  e.dead = true;
  if (run.lockId === e.id) releaseLock(run);
  run.kills += 1;
  run.events.push({ type: 'kill', id: e.id, x: e.x, y: e.y, enemyType: e.type, points });
  if (e.type === 'splitter' && !run.mods.shortCircuit) {
    const taken = onScreenWords(run);
    const w1 = pickWord(run.words[1], taken, run.rand);
    const w2 = pickWord(run.words[1], [...taken, w1], run.rand);
    run.enemies.push(...splitChildren(e, [w1, w2], [run.nextId++, run.nextId++], run.ship));
  }
  if (run.mods.pulse) {
    run.pulseKills += 1;
    if (run.pulseKills >= PULSE_EVERY) {
      run.pulseKills = 0;
      run.freezeTimer = PULSE_SEC;
      run.events.push({ type: 'pulse' });
    }
  }
}

// Upgrades remove letters as if typed. Finishing the word kills at the current combo.
function strip(run, e, letters) {
  e.typed = Math.min(e.word.length, e.typed + letters);
  if (e.typed === e.word.length) destroy(run, e, registerAssistKill(run, e.word.length));
}

function closestToShip(run) {
  let best = null;
  for (const e of alive(run)) if (!best || e.y > best.y) best = e;
  return best;
}

// Speed of the final lock on this word: letters typed since locking, over the time since locking.
function wordWpm(e, now) {
  const minutes = (now - e.lockAt) / 60;
  return minutes > 0 ? e.lockChars / 5 / minutes : Infinity;
}

function kill(run, e) {
  const clean = e.lockMisses === 0 && wordWpm(e, run.time) >= OVERDRIVE_WPM;
  const points = registerKill(run, e.word.length, run.mods.overdrive && clean ? 2 : 1);
  destroy(run, e, points);
  if (run.mods.chain && run.combo >= CHAIN_MIN_COMBO) {
    const target = closestToShip(run);
    if (target) {
      run.events.push({ type: 'zap', from: { x: e.x, y: e.y }, to: { x: target.x, y: target.y } });
      strip(run, target, run.mods.chain);
    }
  }
}

function fireTurret(run, dt) {
  if (!run.mods.turret) return;
  run.turretTimer -= dt;
  if (run.turretTimer > 0) return;
  const targets = alive(run).filter(e => e.id !== run.lockId);
  if (!targets.length) return;
  const e = targets[Math.floor(run.rand() * targets.length)];
  run.events.push({ type: 'zap', from: { x: run.ship.x, y: run.ship.y }, to: { x: e.x, y: e.y } });
  strip(run, e, 1);
  run.turretTimer = turretInterval(run);
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

  fireTurret(run, dt);

  const frozen = run.freezeTimer > 0;
  run.freezeTimer = Math.max(0, run.freezeTimer - dt);
  const slow = 1 - SLOW_STEP * run.mods.slowField;
  for (const e of run.enemies) {
    if (e.dead || frozen) continue;
    if (run.mods.focus && e.id === run.lockId) continue;
    updateEnemy(e, e.y > run.height * SLOW_ZONE ? dt * slow : dt, run.ship);
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
  const before = lockedEnemy(run);
  const res = handleChar(run, key);
  if (res.kind === 'miss') {
    if (res.enemy) res.enemy.lockMisses += 1;
    if (run.guardsLeft > 0) run.guardsLeft -= 1;
    else registerMiss(run);
    run.events.push({ type: 'miss', id: res.enemy ? res.enemy.id : null });
    return;
  }
  const e = res.enemy;
  if (e !== before) {
    e.lockAt = run.time;
    e.lockChars = 0;
    e.lockMisses = 0;
  }
  e.lockChars += 1;
  run.correctKeys += 1;
  run.samples.push({ t: run.time, chars: 1 });
  run.events.push({ type: 'shot', id: e.id, x: e.x, y: e.y });
  if (res.kind === 'kill') kill(run, e);
}

export function onBackspace(run) {
  releaseLock(run);
}

// Nova: wipes every enemy on screen, once per wave. No points, no kills, no splitting.
export function triggerNova(run) {
  if (!run.novaReady || run.over || run.waveCleared) return;
  run.novaReady = false;
  releaseLock(run);
  for (const e of alive(run)) {
    e.dead = true;
    run.events.push({ type: 'novaHit', x: e.x, y: e.y });
  }
  run.events.push({ type: 'nova' });
}
```

- [ ] **Step 4: شغّل الاختبارات وتأكّد أنّها تنجح**

Run: `node --test tests/effects.test.js tests/game.test.js`
Expected: PASS، ٢٢ اختباراً (١٢ جديدة + ١٠ من الخطّة ١ بلا تعديل).

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/effects.test.js
git commit -m "feat(arcade): apply upgrade effects during a run

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: مجموعة الترقيات والسحب

**Files:**
- Create: `js/upgrades.js`
- Test: `tests/upgrades.test.js`

**Interfaces:**
- Consumes: `createRun`, `START_HP` من `js/game.js` (في الاختبار فقط).
- Produces: `UPGRADES`، `RARITY_WEIGHTS`، `upgradeById(id)`، `stacksOf(run, id)`، `availableUpgrades(run)`، `drawUpgrades(run, rand = Math.random): Upgrade[]`، `applyUpgrade(run, id)`.
- `Upgrade = {id, rarity, maxStacks, icon, name:{en,ar}, desc:{en,ar}, apply(run)}`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/upgrades.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UPGRADES, drawUpgrades, applyUpgrade, availableUpgrades, stacksOf } from '../js/upgrades.js';
import { createRun, START_HP } from '../js/game.js';

const WORDS = { 1: ['ab'], 2: ['abcd'], 3: ['abcdef'], 4: ['abcdefgh'], 5: ['abcdefghijk'] };

function runAtWave(wave) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800 });
  run.wave = wave;
  return run;
}

const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test('twelve upgrades, each named and described in both languages', () => {
  assert.equal(UPGRADES.length, 12);
  for (const u of UPGRADES) {
    for (const lang of ['en', 'ar']) assert.ok(u.name[lang] && u.desc[lang], `${u.id} ${lang}`);
  }
});

test('draws three different cards', () => {
  for (let i = 0; i < 200; i++) {
    const ids = drawUpgrades(runAtWave(5)).map(u => u.id);
    assert.equal(ids.length, 3);
    assert.equal(new Set(ids).size, 3);
  }
});

test('rarity roll follows the weights', () => {
  assert.equal(drawUpgrades(runAtWave(5), () => 0)[0].rarity, 'common');
  assert.equal(drawUpgrades(runAtWave(5), () => 0.7)[0].rarity, 'rare');
  assert.equal(drawUpgrades(runAtWave(5), seq(0.95, 0))[0].rarity, 'epic');
});

test('no epic before wave 3', () => {
  for (let i = 0; i < 200; i++) {
    assert.ok(drawUpgrades(runAtWave(2)).every(u => u.rarity !== 'epic'));
  }
  assert.ok(availableUpgrades(runAtWave(3)).some(u => u.rarity === 'epic'));
});

test('a maxed upgrade is not drawn', () => {
  const run = runAtWave(5);
  applyUpgrade(run, 'focus');
  for (let i = 0; i < 200; i++) assert.ok(drawUpgrades(run).every(u => u.id !== 'focus'));
  applyUpgrade(run, 'magnet');
  applyUpgrade(run, 'magnet');
  assert.equal(stacksOf(run, 'magnet'), 2);
  assert.ok(availableUpgrades(run).some(u => u.id === 'magnet'));
  applyUpgrade(run, 'magnet');
  assert.ok(!availableUpgrades(run).some(u => u.id === 'magnet'));
});

test('repair is offered alone when everything else is maxed', () => {
  const run = runAtWave(5);
  for (const u of UPGRADES) {
    if (u.id === 'repair') continue;
    for (let i = 0; i < u.maxStacks; i++) applyUpgrade(run, u.id);
  }
  assert.deepEqual(drawUpgrades(run).map(u => u.id), ['repair']);
});

test('shield and repair change hp', () => {
  const run = runAtWave(1);
  applyUpgrade(run, 'shield');
  assert.deepEqual([run.hp, run.maxHp], [START_HP + 1, START_HP + 1]);
  run.hp = 1;
  applyUpgrade(run, 'repair');
  assert.equal(run.hp, run.maxHp);
});

test('every other upgrade bumps its mod and is recorded', () => {
  const mods = {
    slow_field: 'slowField', focus: 'focus', combo_guard: 'comboGuard', chain: 'chain',
    turret: 'turret', pulse: 'pulse', magnet: 'magnet', short_circuit: 'shortCircuit',
    overdrive: 'overdrive', nova: 'nova',
  };
  for (const [id, mod] of Object.entries(mods)) {
    const run = runAtWave(1);
    applyUpgrade(run, id);
    assert.equal(run.mods[mod], 1, id);
    assert.deepEqual(run.picked, [id]);
  }
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/upgrades.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/upgrades.js`.

- [ ] **Step 3: اكتب التنفيذ**

```js
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
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/upgrades.test.js`
Expected: PASS، ٨ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/upgrades.js tests/upgrades.test.js
git commit -m "feat(arcade): add the upgrade pool and three-card draw

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: نصوص شاشة الترقية

**Files:**
- Modify: `js/i18n.js`
- Modify: `tests/i18n.test.js`

- [ ] **Step 1: اكتب الاختبار الفاشل** — استبدل `tests/i18n.test.js` بالكتلة:

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
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/i18n.test.js`
Expected: FAIL في `upgrade screen strings` (`undefined` بدل `'اختر ترقية'`).

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/i18n.js` بالكتلة:

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
Expected: PASS، ٣ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat(arcade): add upgrade screen strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: شاشة الاختيار في المتصفّح

**Files:**
- Modify: `index.html`, `css/base.css`, `js/render/fx.js`, `js/main.js`
- Create: `js/render/cards.js`

**Interfaces:**
- `createCards(container, onPick) → {show(upgrades, lang, rarityName), flash(index)}`
- `fx.zap(from, to)`

هذه المهمّة لا اختبارات آليّة لها. التحقّق في Task 6.

- [ ] **Step 1: الهيكل** — استبدل `index.html` بالكتلة:

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
    <div id="hud-nova" hidden>✸</div>
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

  <section id="screen-upgrade" class="screen screen-clear" hidden>
    <h2 id="upgrade-title" class="upgrade-title"></h2>
    <p class="tagline" data-i18n="pickUpgrade"></p>
    <div id="upgrade-cards" class="cards"></div>
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

- [ ] **Step 2: التنسيق** — استبدل `css/base.css` بالكتلة:

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

/* Upgrade pick */
:root {
  --rarity-common: #3d8bff;
  --rarity-rare: var(--neon-purple);
  --rarity-epic: #ffc53d;
}
#hud-nova {
  top: 0; left: 0; font-size: 20px;
  color: var(--neon-pink); text-shadow: 0 0 8px var(--neon-pink);
}
.screen-clear { background: rgba(5, 4, 15, 0.35); }
.upgrade-title { font-size: 30px; color: var(--neon-cyan); text-shadow: 0 0 14px var(--neon-cyan); }
.cards { display: flex; gap: 18px; perspective: 800px; }
.card {
  --rc: var(--rarity-common);
  width: 190px; min-height: 230px; padding: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
  background: var(--tile-bg); border: 2px solid var(--rc); box-shadow: 0 0 14px var(--rc);
  animation: card-in 0.35s ease-out backwards;
}
.card.rarity-rare { --rc: var(--rarity-rare); }
.card.rarity-epic { --rc: var(--rarity-epic); }
.card-key { align-self: flex-start; margin: 0; font-size: 12px; color: var(--rc); }
.card-icon { font-size: 36px; }
.card-name { font-size: 17px; font-weight: 700; color: var(--rc); }
.card-desc { font-size: 13px; line-height: 1.4; }
.card-rarity { margin-top: auto; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--dim); }
.card.chosen { animation: card-chosen 0.35s linear; }
@keyframes card-in {
  from { transform: rotateY(90deg); opacity: 0; }
  to { transform: rotateY(0); opacity: 1; }
}
@keyframes card-chosen {
  0%, 50% { background: var(--rc); }
  25%, 75%, 100% { background: var(--tile-bg); }
}
```

- [ ] **Step 3: المؤثّرات والبطاقات**

```js
// js/render/fx.js
// Minimal feedback: a shot line per letter, a zap line per upgrade strike, and an expanding ring per kill or hit.
const BEAM_LIFE = 0.08;
const ZAP_LIFE = 0.18;
const RING_LIFE = 0.35;

export function createFx() {
  const beams = [];
  const zaps = [];
  const rings = [];

  function expire(list, dt) {
    for (const f of list) f.life -= dt;
    for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
  }

  function drawLines(ctx, list, maxLife, color) {
    ctx.strokeStyle = color;
    for (const l of list) {
      ctx.globalAlpha = l.life / maxLife;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
  }

  return {
    beam(from, to) {
      beams.push({ x1: from.x, y1: from.y - 20, x2: to.x, y2: to.y, life: BEAM_LIFE });
    },
    zap(from, to) {
      zaps.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, life: ZAP_LIFE });
    },
    burst(x, y) {
      rings.push({ x, y, life: RING_LIFE });
    },
    update(dt) {
      expire(beams, dt);
      expire(zaps, dt);
      expire(rings, dt);
    },
    draw(ctx, colors) {
      ctx.lineWidth = 2;
      drawLines(ctx, beams, BEAM_LIFE, colors.cyan);
      drawLines(ctx, zaps, ZAP_LIFE, colors.purple);
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
// js/render/cards.js
// The upgrade cards as DOM, so Arabic text shapes and the row follows the page direction (card 1 is first in reading order).

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function createCards(container, onPick) {
  let buttons = [];

  function show(upgrades, lang, rarityName) {
    container.replaceChildren();
    buttons = upgrades.map((u, i) => {
      const b = document.createElement('button');
      b.className = `card rarity-${u.rarity}`;
      b.style.animationDelay = `${i * 0.08}s`;
      b.append(
        el('kbd', 'card-key', String(i + 1)),
        el('div', 'card-icon', u.icon),
        el('div', 'card-name', u.name[lang]),
        el('div', 'card-desc', u.desc[lang]),
        el('div', 'card-rarity', rarityName(u.rarity)),
      );
      b.addEventListener('click', () => onPick(i));
      container.append(b);
      return b;
    });
  }

  function flash(index) {
    buttons[index].classList.add('chosen');
  }

  return { show, flash };
}
```

- [ ] **Step 4: الربط** — استبدل `js/main.js` بالكتلة:

```js
// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace, triggerNova } from './game.js';
import { drawUpgrades, applyUpgrade } from './upgrades.js';
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
import { createCards } from './render/cards.js';

const BANNER_SEC = 1.5;
const PICK_FLASH_SEC = 0.35;
const HIGH_SCORE_KEY = 'ws_hs';

const $ = id => document.getElementById(id);
const gameCanvas = $('game');
const gctx = gameCanvas.getContext('2d');
const starfield = createStarfield($('bg'));
const labels = createLabels($('labels'));
const fx = createFx();
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
  $('screen-upgrade').hidden = next !== 'upgradePick';
  $('hud').hidden = !(next === 'playing' || next === 'paused' || next === 'upgradePick');
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

function openUpgrades() {
  offered = drawUpgrades(run);
  pickedIndex = -1;
  $('upgrade-title').textContent = t(lang, 'waveClear', run.wave);
  cards.show(offered, lang, rarity => t(lang, rarity));
  phase.set('upgradePick');
}

function pickUpgrade(index) {
  if (phase.get() !== 'upgradePick' || pickedIndex !== -1 || index >= offered.length) return;
  pickedIndex = index;
  pickTimer = PICK_FLASH_SEC;
  cards.flash(index);
}

function finishPick() {
  applyUpgrade(run, offered[pickedIndex].id);
  startWave(run, run.wave + 1);
  showBanner(t(lang, 'waveBanner', run.wave));
  phase.set('playing');
}

function drainEvents() {
  for (const ev of run.events) {
    if (ev.type === 'shot') fx.beam(run.ship, ev);
    else if (ev.type === 'kill' || ev.type === 'hurt' || ev.type === 'novaHit') fx.burst(ev.x, ev.y);
    else if (ev.type === 'zap') fx.zap(ev.from, ev.to);
    else if (ev.type === 'pulse') fx.burst(run.ship.x, run.ship.y);
    else if (ev.type === 'miss' && ev.id !== null) labels.flashMiss(ev.id);
    else if (ev.type === 'waveClear') openUpgrades();
    else if (ev.type === 'gameOver') endRun();
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
  const nova = $('hud-nova');
  nova.hidden = !run.novaReady;
  nova.style.transform = `translate(${run.ship.x - 64}px, ${run.ship.y - 12}px)`;
}

function frame(dt) {
  starfield.draw(dt, colors);
  gctx.clearRect(0, 0, width, height);
  const p = phase.get();
  const playing = p === 'playing';

  if (playing && bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('wave-banner').hidden = true;
  }
  if (run && playing) {
    update(run, dt);
    drainEvents();
  }
  if (p === 'upgradePick' && pickedIndex !== -1) {
    pickTimer -= dt;
    if (pickTimer <= 0) finishPick();
  }

  fx.update(p === 'paused' ? 0 : dt);
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
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

attachInput(handleKey);
resize();
setLang('en');
startLoop(frame);
```

- [ ] **Step 5: فحص الصياغة والاختبارات**

Run: `for f in js/main.js js/render/cards.js js/render/fx.js; do node --input-type=module --check < $f; done`
Expected: لا مخرجات.

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ٧٧ اختباراً، `fail 0`.

- [ ] **Step 6: Commit**

```bash
git add index.html css/base.css js/render/fx.js js/render/cards.js js/main.js
git commit -m "feat(arcade): add the upgrade pick screen

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: التحقّق في المتصفّح

بـ Playwright + Chromium على `python3 -m http.server 3737`، مقاس 1280×800. الحروف تُرسل بـ `KeyboardEvent('keydown')` لأنّ Playwright لا يرسل `keydown` للحروف العربيّة. لتنظيف الموجة: اكتب دائماً اسم العدوّ الأقرب للسفينة (أكبر `y` في `transform` الاسم)، فيقع القفل عليه.

- [ ] **Step 1: الإنجليزيّة**
  1. `Enter`، ثمّ نظّف الموجة ١. Expected: شاشة «Wave 1 cleared» و«Pick an upgrade»، ثلاث بطاقات مختلفة بأرقام 1 2 3، والـ HUD ظاهر خلفها.
  2. لقطة شاشة.
  3. اضغط `1`. Expected: البطاقة ١ تحمل الصنف `chosen` فوراً. اضغط `2` خلال الوميض. Expected: يُتجاهَل.
  4. بعد ٠٫٥ ث. Expected: الشاشة مخفيّة، «Wave 2» ظاهر، والـ HUD يقول ٢.
- [ ] **Step 2: العربيّة**
  1. `Esc` ← `R` ← «العربيّة» ← ابدأ ← نظّف الموجة ١.
  Expected: «الموجة 1 اكتملت» و«اختر ترقية». البطاقة ١ هي **اليمنى** (أكبر `left`).
  2. لقطة شاشة. Expected: الأسماء والأوصاف العربيّة متّصلة الحروف.
  3. انقر البطاقة ٢. Expected: الشاشة تُغلق و«الموجة 2» يظهر.
- [ ] **Step 3: لا أخطاء في الـ console** في كلّ ما سبق.

لا commit لهذه المهمّة. اكتب نتائجها في وصف الـPR، وما لم يُتحقَّق منه تحت «لم يُتحقَّق منه».

---

## ما بعد هذه الخطّة

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٣ | الزعيم (المرحلة ٤) |
| ٤ | الواجهات المصقولة + الميزات الباقية (المرحلتان ٥ و٦) |
| ٥ | الإحساس + الصوت + الموسيقى (المرحلتان ٧ و٨) |
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
