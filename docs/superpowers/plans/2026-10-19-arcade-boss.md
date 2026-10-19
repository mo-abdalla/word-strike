# Word Strike Arcade — الخطّة ٣: الزعيم

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** كلّ موجة رقمها من مضاعفات ٥ موجة زعيم: سفينة كبيرة ثابتة أعلى الوسط، بكلمة واحدة ظاهرة وشريط حياة، تطلق صواريخ بحرف واحد نحو السفينة. هزيمته تعطي `500 × حياته الأصليّة` ثمّ شاشة الترقية.

**Architecture:** `js/boss.js` أرقام خالصة (الحياة، الإطلاق، فئات الكلمات، حروف الصواريخ). الزعيم والصواريخ أعداء عاديّون في `run.enemies` بنوعين جديدين `boss` و`missile`، فالقفل والأسماء والترقيات تعمل عليهم بلا كود خاصّ. `js/game.js` يضيف: توليد الزعيم، الإطلاق، وإصابة الزعيم بدل قتله.

**Tech Stack:** كالخطّة ١. Node v22.22.0 في السحابة.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — هذه الخطّة تنفّذ المرحلة ٤ من القسم ١٢ (القسم ٣ «الزعيم»، وقاعدة الصاروخ في «القفل»، وأثر نوفا على الزعيم في القسم ٥).

**الفرع:** `feat/arcade-boss` من `master` (بعد دمج PR #2).

## Global Constraints

- كلّ قيود الخطّتين ١ و٢ سارية: لا بناء ولا مكتبات ولا صور، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`، العشوائيّة من `rand`، المطابقة صارمة، `typing-game.html` لا يُلمس، `game.js` لا يستورد `upgrades.js`.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test 'tests/*.test.js'`.
- الكتل أدناه ملفّات كاملة. السطر الأوّل في كلّ كتلة تعليق باسم الملفّ، وهو جزء من الملفّ. انسخ كلّ كتلة كما هي فوق الملفّ القائم أو كملفّ جديد.

## قرارات ليست في المواصفة

حُسمت الثلاثة الأولى مع مو. الباقي اختيار هذه الخطّة.

1. **كلمة الزعيم المكتملة قتل عاديّ:** نقاط الكلمة بالكومبو، والسلسلة تزيد، والاندفاع والبرق يعملان، وتُعدّ للنبضة. ثمّ `500 × الحياة الأصليّة` عند الهزيمة.
2. **البرق والبرج يضربان كلمة الزعيم.** إن أكملاها تنقص حياته.
3. **سرعة الصاروخ** = `1.5 ×` سرعة الموجة الأساسيّة × `ارتفاع الساحة / 800`.
4. **الزعيم والصاروخ نوعان في `ENEMY_TYPES`** بـ `minWave: Infinity`، فلا يولّدهما الموزّع العاديّ. اختبار الخطّة ١ `types unlock at their waves` يُحدَّث ليشملهما.
5. **حرف الصاروخ:** من الحروف الأولى لكلمات اللغة، ويتجنّب حروف الكلمات الظاهرة إن أمكن (`pickWord` نفسها).
6. **الصواريخ الباقية عند سقوط الزعيم تُدمَّر** بلا نقاط.
7. **تجميد النبضة يوقف عدّاد إطلاق الزعيم.** «تركيز» على صاروخ مقفول عليه يجمّده.
8. **نوفا تفكّ القفل** حتى لو كان على الزعيم. الحروف المكتوبة تبقى.
9. **كلمة الزعيم الجديدة** من الفئة ٤ أو ٥ عشوائيّاً، وتتجنّب الكلمات الظاهرة.
10. **المواضع:** الزعيم على `y = 150` تحت الـ HUD (على ١١٠ غطّى شريطُ حياته رقمَ الموجة). الصاروخ يولد على `y + 90` تحت اسم الزعيم (على `+30` غطّى اسمُه اسمَ الزعيم).
11. **السقوط:** ثلاث حلقات انفجار متجاورة. الوميض الأبيض والصوت في الخطّة ٥.
12. **النصوص:** شعار «Boss — Wave n»، وعنوان شاشة الترقية بعد الزعيم «Boss destroyed».

## خارج هذه الخطّة

إنجاز `boss_slayer` (الخطّة ٤). نغمة الإنذار والوميض الأبيض (الخطّة ٥). الجوّال (الخطّة ٦).

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/boss.js` | جديد: أرقام الزعيم وحروف الصواريخ |
| `js/enemies.js` | تعديل: النوعان `boss` و`missile` |
| `js/game.js` | تعديل: توليد الزعيم، الإطلاق، الإصابة، السقوط، نوفا |
| `js/i18n.js` | تعديل: `bossBanner` و`bossDown` |
| `js/render/enemies.js` | تعديل: شكل الصاروخ، و`drawBoss` بشريط الحياة |
| `js/render/labels.js` | تعديل: اسم الزعيم أكبر وأبعد، ويتحدّث عند تغيّر الكلمة |
| `js/main.js` | تعديل: الشعار، العنوان، الرسم، أحداث الزعيم |
| `css/base.css` | تعديل: `.label.boss` |
| `tests/boss.test.js`, `tests/boss-wave.test.js` | جديد |
| `tests/enemies.test.js`, `tests/i18n.test.js` | تعديل |

---

### Task 1: أرقام الزعيم

**Files:**
- Create: `js/boss.js`
- Test: `tests/boss.test.js`

**Interfaces:**
- `BOSS_Y = 150`, `BOSS_REWARD = 500`, `MISSILE_SPEED_MUL = 1.5`
- `bossHp(n)`, `fireInterval(n)`, `bossWordTier(rand = Math.random): 4|5`, `missileLetters(words): string[]`, `missileSpawn(boss): {x, y}`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/boss.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bossHp, fireInterval, bossWordTier, missileLetters } from '../js/boss.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('boss numbers by wave', () => {
  assert.deepEqual([5, 10, 50, 100].map(bossHp), [5, 7, 23, 43]);
  assert.ok(near(fireInterval(5), 3.3));
  assert.ok(near(fireInterval(10), 3.1));
  assert.equal(fireInterval(100), 1.5);
  assert.equal(bossWordTier(() => 0), 4);
  assert.equal(bossWordTier(() => 0.99), 5);
});

test('missile letters are the first letters of the pool', () => {
  assert.deepEqual(missileLetters(WORDS), ['a', 'c', 'e', 'g', 'i', 'm', 'q', 'w', 'l']);
  assert.deepEqual(missileLetters({ 1: ['كتاب', 'نجم'], 2: ['كلام'] }), ['ك', 'ن']);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/boss.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/boss.js`.

- [ ] **Step 3: اكتب التنفيذ**

```js
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
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/boss.test.js`
Expected: PASS، اختباران.

- [ ] **Step 5: Commit**

```bash
git add js/boss.js tests/boss.test.js
git commit -m "feat(arcade): add boss numbers and missile letters

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: الزعيم في الجولة

**Files:**
- Modify: `js/enemies.js`, `js/game.js`, `tests/enemies.test.js`
- Test: `tests/boss-wave.test.js`

**Interfaces:**
- الزعيم = عدوّ `type: 'boss'` بسرعة ٠، ومعه `hp`, `maxHp`, `fireTimer`.
- الصاروخ = عدوّ `type: 'missile'` بكلمة من حرف واحد.
- أحداث جديدة: `{type:'bossSpawn', x, y}`، `{type:'bossHit', id, x, y, points, hp}`، `{type:'bossDown', x, y, points}`، `{type:'pop', x, y}` (صاروخ دُمّر بسقوط الزعيم).

- [ ] **Step 1: اكتب الاختبارات الفاشلة** — استبدل `tests/enemies.test.js` وأنشئ `tests/boss-wave.test.js`:

```js
// tests/enemies.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from '../js/enemies.js';

const near = (a, b) => Math.abs(a - b) < 1e-9;

test('types unlock at their waves', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(ENEMY_TYPES).map(([k, v]) => [k, v.minWave])),
    { drone: 1, seeker: 3, splitter: 4, armored: 6, boss: Infinity, missile: Infinity },
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

```js
// tests/boss-wave.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar, triggerNova, START_HP } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const near = (a, b) => Math.abs(a - b) < 1e-9;
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

function bossRun(mods = {}) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  Object.assign(run.mods, mods);
  startWave(run, 5);
  return run;
}

const bossIn = run => run.enemies.find(e => e.type === 'boss');
const missile = (id, word, x, y) =>
  ({ id, type: 'missile', word, typed: 0, x, y, vx: 0, vy: 72, speed: 72, dead: false });

test('a boss wave spawns only the boss, centred at the top', () => {
  const run = bossRun();
  assert.equal(run.toSpawn, 0);
  assert.equal(run.enemies.length, 1);
  const boss = bossIn(run);
  assert.deepEqual([boss.x, boss.y, boss.hp, boss.maxHp], [400, 150, 5, 5]);
  assert.equal(boss.word, 'lmnopqrstuv');
  update(run, 1);
  assert.equal(run.enemies.length, 1);
  assert.equal(boss.y, 150);
  assert.ok(run.events.some(e => e.type === 'bossSpawn'));
});

test('the boss fires a one-letter missile at the ship', () => {
  const run = bossRun();
  update(run, 3.2);
  assert.equal(run.enemies.length, 1);
  update(run, 0.2);
  const m = run.enemies.find(e => e.type === 'missile');
  assert.equal(m.word, 'i');
  assert.equal(m.x, 400);
  assert.ok(near(m.vy, 72));
});

test('a finished boss word scores, costs one hp and brings a new word', () => {
  const run = bossRun();
  typeWord(run, 'lmnopqrstuv');
  const boss = bossIn(run);
  assert.equal(boss.hp, 4);
  assert.equal(boss.dead, false);
  assert.equal(boss.word, 'abcdefghijk');
  assert.equal(boss.typed, 0);
  assert.equal(run.lockId, null);
  assert.equal(run.score, 110);
  assert.equal(run.streak, 1);
  assert.ok(run.events.some(e => e.type === 'bossHit' && e.hp === 4));
});

test('a missile is closer than the boss, so it takes the lock', () => {
  const run = bossRun();
  run.enemies.push(missile(50, 'l', 400, 300));
  onChar(run, 'l');
  assert.equal(run.lockId, null);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(bossIn(run).typed, 0);
});

test('defeating the boss pays 500 per hp, clears missiles and ends the wave', () => {
  const run = bossRun();
  bossIn(run).hp = 1;
  run.enemies.push(missile(50, 'i', 200, 300));
  typeWord(run, 'lmnopqrstuv');
  assert.equal(bossIn(run).dead, true);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(run.score, 110 + 500 * 5);
  assert.ok(run.events.some(e => e.type === 'bossDown'));
  update(run, 0.016);
  assert.equal(run.waveCleared, true);
});

test('a missile reaching the ship costs one hp', () => {
  const run = bossRun();
  run.enemies.push(missile(50, 'i', 400, 725));
  update(run, 0.016);
  assert.equal(run.hp, START_HP - 1);
});

test('nova destroys missiles but not the boss', () => {
  const run = bossRun({ nova: 1 });
  run.enemies.push(missile(50, 'i', 200, 300));
  triggerNova(run);
  assert.equal(run.enemies[1].dead, true);
  assert.equal(bossIn(run).dead, false);
});

test('turret strips letters from the boss word', () => {
  const run = bossRun({ turret: 2 });
  update(run, 1);
  update(run, 4.1);
  assert.equal(bossIn(run).typed, 1);
});

test('pulse freeze also holds the boss fire timer', () => {
  const run = bossRun();
  run.freezeTimer = 2;
  update(run, 1);
  update(run, 1);
  assert.ok(near(bossIn(run).fireTimer, 3.3));
  update(run, 0.1);
  assert.ok(near(bossIn(run).fireTimer, 3.2));
});
```

- [ ] **Step 2: شغّلها وتأكّد أنّها تفشل**

Run: `node --test tests/boss-wave.test.js tests/enemies.test.js`
Expected: FAIL، ١٠ من ١٥: اختبارات `boss-wave` التسعة، و`types unlock at their waves`.

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/enemies.js` و`js/game.js`:

```js
// js/enemies.js
// Enemy types, creation, movement, collision with the ship and splitting.

export const ENEMY_TYPES = {
  drone:    { minWave: 1, tiers: null,   speedMul: 1.0,  damage: 1, turnRate: 0 },
  seeker:   { minWave: 3, tiers: [2, 3], speedMul: 0.9,  damage: 1, turnRate: 1.2 },
  splitter: { minWave: 4, tiers: [2, 3], speedMul: 0.85, damage: 1, turnRate: 0 },
  armored:  { minWave: 6, tiers: [4, 5], speedMul: 0.5,  damage: 2, turnRate: 0 },
  // Boss-wave only: never picked by the normal spawner.
  boss:     { minWave: Infinity, tiers: [4, 5], speedMul: 0, damage: 0, turnRate: 0 },
  missile:  { minWave: Infinity, tiers: null,   speedMul: 1, damage: 1, turnRate: 0 },
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

```js
// js/game.js
// One run: spawning, movement, collisions, kills, upgrade effects and boss waves.
// Pure logic; the browser layer drains run.events. Effects read run.mods only.
import { waveConfig, pickEnemyType, tierForType, pickWord, isBossWave } from './waves.js';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from './enemies.js';
import { handleChar, lockedEnemy, releaseLock } from './targeting.js';
import { registerKill, registerAssistKill, registerMiss } from './scoring.js';
import { BOSS_Y, BOSS_REWARD, MISSILE_SPEED_MUL, bossHp, fireInterval, bossWordTier, missileLetters, missileSpawn } from './boss.js';

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
  const boss = bossOf(run);
  if (boss) boss.x = width / 2;
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
  if (isBossWave(n)) {
    run.toSpawn = 0;
    spawnBoss(run);
  }
}

const alive = run => run.enemies.filter(e => !e.dead);
const onScreenWords = run => alive(run).map(e => e.word);
const bossOf = run => run.enemies.find(e => e.type === 'boss' && !e.dead) || null;

function speedFor(run, mul) {
  return run.cfg.baseSpeed * mul * (run.height / REFERENCE_HEIGHT);
}

function spawnBoss(run) {
  const hp = bossHp(run.wave);
  const word = pickWord(run.words[bossWordTier(run.rand)], onScreenWords(run), run.rand);
  const boss = createEnemy({ id: run.nextId++, type: 'boss', word, x: run.width / 2, y: BOSS_Y, speed: 0, target: run.ship });
  run.enemies.push(Object.assign(boss, { hp, maxHp: hp, fireTimer: fireInterval(run.wave) }));
  run.events.push({ type: 'bossSpawn', x: boss.x, y: boss.y });
}

function fireMissile(run, boss) {
  const letter = pickWord(missileLetters(run.words), onScreenWords(run), run.rand);
  const { x, y } = missileSpawn(boss);
  const speed = speedFor(run, MISSILE_SPEED_MUL);
  run.enemies.push(createEnemy({ id: run.nextId++, type: 'missile', word: letter, x, y, speed, target: run.ship }));
}

function bossFire(run, dt, frozen) {
  const boss = bossOf(run);
  if (!boss || frozen) return;
  boss.fireTimer -= dt;
  if (boss.fireTimer > 0) return;
  fireMissile(run, boss);
  boss.fireTimer = fireInterval(run.wave);
}

function spawnEnemy(run) {
  const type = pickEnemyType(run.wave, run.rand);
  const tier = tierForType(type, run.wave, run.rand);
  const word = pickWord(run.words[tier], onScreenWords(run), run.rand);
  const x = SPAWN_MARGIN + run.rand() * (run.width - 2 * SPAWN_MARGIN);
  const speed = speedFor(run, ENEMY_TYPES[type].speedMul);
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

function countKill(run) {
  run.kills += 1;
  if (!run.mods.pulse) return;
  run.pulseKills += 1;
  if (run.pulseKills >= PULSE_EVERY) {
    run.pulseKills = 0;
    run.freezeTimer = PULSE_SEC;
    run.events.push({ type: 'pulse' });
  }
}

function destroy(run, e, points) {
  e.dead = true;
  if (run.lockId === e.id) releaseLock(run);
  run.events.push({ type: 'kill', id: e.id, x: e.x, y: e.y, enemyType: e.type, points });
  if (e.type === 'splitter' && !run.mods.shortCircuit) {
    const taken = onScreenWords(run);
    const w1 = pickWord(run.words[1], taken, run.rand);
    const w2 = pickWord(run.words[1], [...taken, w1], run.rand);
    run.enemies.push(...splitChildren(e, [w1, w2], [run.nextId++, run.nextId++], run.ship));
  }
  countKill(run);
}

// A finished boss word costs it one hp. At zero it falls, its missiles with it.
function hitBoss(run, boss, points) {
  if (run.lockId === boss.id) releaseLock(run);
  boss.hp -= 1;
  run.events.push({ type: 'bossHit', id: boss.id, x: boss.x, y: boss.y, points, hp: boss.hp });
  if (boss.hp > 0) {
    boss.word = pickWord(run.words[bossWordTier(run.rand)], onScreenWords(run), run.rand);
    boss.typed = 0;
  } else {
    boss.dead = true;
    run.score += BOSS_REWARD * boss.maxHp;
    for (const m of alive(run)) {
      m.dead = true;
      run.events.push({ type: 'pop', x: m.x, y: m.y });
    }
    releaseLock(run);
    run.events.push({ type: 'bossDown', x: boss.x, y: boss.y, points: BOSS_REWARD * boss.maxHp });
  }
  countKill(run);
}

// Every way a word can be finished ends here: typing, chain or turret.
function finishWord(run, e, points) {
  if (e.type === 'boss') hitBoss(run, e, points);
  else destroy(run, e, points);
}

// Upgrades remove letters as if typed. Finishing the word kills at the current combo.
function strip(run, e, letters) {
  e.typed = Math.min(e.word.length, e.typed + letters);
  if (e.typed === e.word.length) finishWord(run, e, registerAssistKill(run, e.word.length));
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
  finishWord(run, e, points);
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
  bossFire(run, dt, frozen);
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

// Nova: wipes every enemy on screen except the boss, once per wave. No points, no kills, no splitting.
export function triggerNova(run) {
  if (!run.novaReady || run.over || run.waveCleared) return;
  run.novaReady = false;
  releaseLock(run);
  for (const e of alive(run)) {
    if (e.type === 'boss') continue;
    e.dead = true;
    run.events.push({ type: 'novaHit', x: e.x, y: e.y });
  }
  run.events.push({ type: 'nova' });
}
```

- [ ] **Step 4: شغّل كلّ الاختبارات**

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ٨٨ اختباراً، `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add js/enemies.js js/game.js tests/enemies.test.js tests/boss-wave.test.js
git commit -m "feat(arcade): add boss waves with missiles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: نصوص الزعيم

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
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/i18n.test.js`
Expected: FAIL في `boss strings`.

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
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/i18n.test.js`
Expected: PASS، ٤ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat(arcade): add boss strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: الزعيم في المتصفّح

**Files:**
- Modify: `js/render/enemies.js`, `js/render/labels.js`, `js/main.js`, `css/base.css`

**Interfaces:**
- `drawBoss(ctx, boss, color, hpColor, dimColor, locked)`

لا اختبارات آليّة لهذه المهمّة. التحقّق في Task 5.

- [ ] **Step 1: الرسم والأسماء**

```js
// js/render/enemies.js
// Plain outline shapes per enemy type, and the boss with its hp bar. Glow arrives in the polish plan.
const SHAPES = {
  drone:    { sides: 3, radius: 12, rotation: 0 },
  seeker:   { sides: 4, radius: 12, rotation: 0 },
  splitter: { sides: 6, radius: 12, rotation: 0 },
  armored:  { sides: 4, radius: 16, rotation: Math.PI / 4 },
  missile:  { sides: 3, radius: 7,  rotation: 0 },
};
const BOSS_RADIUS = 44;
const BAR_WIDTH = 120;
const BAR_HEIGHT = 5;

function polygon(ctx, sides, radius, rotation) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = Math.PI / 2 + rotation + (i * 2 * Math.PI) / sides;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawEnemy(ctx, e, color, locked) {
  const shape = SHAPES[e.type];
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 2.5 : 1.5;
  polygon(ctx, shape.sides, shape.radius, shape.rotation);
  ctx.restore();
}

export function drawBoss(ctx, boss, color, hpColor, dimColor, locked) {
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = locked ? 3 : 2;
  polygon(ctx, 6, BOSS_RADIUS, Math.PI / 6);
  polygon(ctx, 6, BOSS_RADIUS * 0.55, 0);
  ctx.beginPath();
  ctx.moveTo(-BOSS_RADIUS, 0);
  ctx.lineTo(-BOSS_RADIUS * 1.7, -14);
  ctx.moveTo(BOSS_RADIUS, 0);
  ctx.lineTo(BOSS_RADIUS * 1.7, -14);
  ctx.stroke();
  ctx.restore();

  const x = boss.x - BAR_WIDTH / 2;
  const y = boss.y - BOSS_RADIUS - 16;
  ctx.fillStyle = dimColor;
  ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, (BAR_WIDTH * boss.hp) / boss.maxHp, BAR_HEIGHT);
}
```

```js
// js/render/labels.js
// Enemy words as DOM elements so Arabic letters shape and join correctly.
const LABEL_OFFSET_Y = 22;
const BOSS_LABEL_OFFSET_Y = 58;

export function createLabels(container) {
  const nodes = new Map(); // enemy id -> { el, typedEl, restEl, word, typed }

  function create(lang, type) {
    const el = document.createElement('div');
    el.className = lang === 'ar' ? 'label arabic' : 'label';
    if (type === 'boss') el.classList.add('boss');
    const typedEl = document.createElement('span');
    typedEl.className = 'typed';
    const restEl = document.createElement('span');
    el.append(typedEl, restEl);
    container.append(el);
    return { el, typedEl, restEl, word: '', typed: -1 };
  }

  function sync(enemies, lockId, lang) {
    const seen = new Set();
    for (const e of enemies) {
      if (e.dead) continue;
      seen.add(e.id);
      let node = nodes.get(e.id);
      if (!node) {
        node = create(lang, e.type);
        nodes.set(e.id, node);
      }
      if (node.typed !== e.typed || node.word !== e.word) {
        node.typedEl.textContent = e.word.slice(0, e.typed);
        node.restEl.textContent = e.word.slice(e.typed);
        node.typed = e.typed;
        node.word = e.word;
      }
      node.el.classList.toggle('locked', e.id === lockId);
      const offset = e.type === 'boss' ? BOSS_LABEL_OFFSET_Y : LABEL_OFFSET_Y;
      node.el.style.transform = `translate(${e.x}px, ${e.y + offset}px) translateX(-50%)`;
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

- [ ] **Step 2: التنسيق** — استبدل `css/base.css`:

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
.label.boss { font-size: 20px; padding: 4px 12px; border-color: var(--neon-yellow); }
.label.boss.locked { border-color: var(--neon-cyan); }
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

- [ ] **Step 3: الربط** — استبدل `js/main.js`:

```js
// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace, triggerNova } from './game.js';
import { drawUpgrades, applyUpgrade } from './upgrades.js';
import { isBossWave } from './waves.js';
import { wordsFor } from './words.js';
import { accuracy, finalWpm } from './scoring.js';
import { applyStrings, t } from './i18n.js';
import { load, save } from './storage.js';
import { startLoop } from './loop.js';
import { attachInput } from './input.js';
import { createStarfield } from './render/starfield.js';
import { drawShip, drawHpRing, aimAngle } from './render/ship.js';
import { drawEnemy, drawBoss } from './render/enemies.js';
import { createFx } from './render/fx.js';
import { createLabels } from './render/labels.js';
import { createCards } from './render/cards.js';

const BANNER_SEC = 1.5;
const PICK_FLASH_SEC = 0.35;
const BOSS_BURST_SPREAD = 36;
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

function waveBanner(n) {
  return isBossWave(n) ? t(lang, 'bossBanner', n) : t(lang, 'waveBanner', n);
}

function newRun() {
  labels.clear();
  run = createRun({ lang, words: wordsFor(lang), width, height });
  startWave(run, 1);
  showBanner(waveBanner(1));
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
  $('upgrade-title').textContent = isBossWave(run.wave) ? t(lang, 'bossDown') : t(lang, 'waveClear', run.wave);
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
  showBanner(waveBanner(run.wave));
  phase.set('playing');
}

function drainEvents() {
  for (const ev of run.events) {
    if (ev.type === 'shot') fx.beam(run.ship, ev);
    else if (['kill', 'hurt', 'novaHit', 'pop', 'bossHit'].includes(ev.type)) fx.burst(ev.x, ev.y);
    else if (ev.type === 'bossDown') {
      for (const dx of [-BOSS_BURST_SPREAD, 0, BOSS_BURST_SPREAD]) fx.burst(ev.x + dx, ev.y);
    }
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
    if (e.dead) continue;
    if (e.type === 'boss') drawBoss(gctx, e, e === locked ? colors.cyan : colors.yellow, colors.pink, colors.dim, e === locked);
    else drawEnemy(gctx, e, e === locked ? colors.cyan : colors.pink, e === locked);
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

- [ ] **Step 4: فحص الصياغة والاختبارات**

Run: `for f in js/main.js js/render/enemies.js js/render/labels.js; do node --input-type=module --check < $f; done`
Expected: لا مخرجات.

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ٨٩ اختباراً، `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add js/render/enemies.js js/render/labels.js js/main.js css/base.css
git commit -m "feat(arcade): draw the boss, its hp bar and missiles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: التحقّق في المتصفّح

بـ Playwright + Chromium على `python3 -m http.server 3737`، مقاس 1280×800. الحروف تُرسل بـ `KeyboardEvent('keydown')`. لتنظيف موجة: اكتب دائماً باقي اسم العدوّ الأقرب للسفينة (أكبر `y` في `transform` الاسم). اختر الترقية ١ بعد كلّ موجة.

- [ ] **Step 1: الإنجليزيّة**
  1. ابدأ، ونظّف الموجات ١–٤. Expected: بعد كلّ واحدة «Wave n cleared».
  2. Expected: الشعار «Boss — Wave 5»، والـ HUD يقول ٥، واسم واحد بصنف `boss`.
  3. انتظر صاروخاً (اسم بلا `boss`). لقطة شاشة. Expected: شريط الحياة لا يغطّي رقم الموجة، واسم الصاروخ لا يغطّي اسم الزعيم.
  4. نظّف الموجة. Expected: «Boss destroyed»، والنقاط زادت ٢٥٠٠ على الأقلّ (٥٠٠ × ٥).
  5. اختر ترقية. Expected: «Wave 6»، ولا اسم `boss`.
- [ ] **Step 2: العربيّة** — الخطوات نفسها. Expected: «الزعيم — الموجة 5» ثمّ «الزعيم سقط». لقطة مقرّبة لاسم الزعيم: حروف متّصلة.
- [ ] **Step 3: لا أخطاء في الـ console** في كلّ ما سبق.

لا commit لهذه المهمّة. النتائج وما لم يُتحقَّق منه في وصف الـPR.

---

## ما بعد هذه الخطّة

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٤ | الواجهات المصقولة + الميزات الباقية (المرحلتان ٥ و٦) |
| ٥ | الإحساس + الصوت + الموسيقى (المرحلتان ٧ و٨) |
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
