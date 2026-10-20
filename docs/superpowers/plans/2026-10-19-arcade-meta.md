# Word Strike Arcade — الخطّة ٤: الواجهات والميزات الباقية

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** قائمة كاملة (السفينة، الثيم، المتصدّرون، الإنجازات، أفضل نتيجة وموجة)، وشاشة نهاية كاملة (رقم قياسيّ، الترقيات، الإنجازات الجديدة، إدخال الاسم، المشاركة)، والميزات الأربع الباقية من اللعبة القديمة: الثيمات، الإنجازات، المتصدّرون، بطاقة المشاركة. البيانات المحفوظة من اللعبة القديمة تبقى صالحة.

**Architecture:** ثلاث وحدات خالصة في `js/meta/` (الثيمات، الإنجازات، المتصدّرون) مختبَرة في Node، ووحدة رسم واحدة (`share.js`). `game.js` يعدّ إحصاءات الجولة التي تحتاجها الإنجازات. اللوحات (المتصدّرون، الإنجازات) ليست مراحل، بل طبقة فوق القائمة.

**Tech Stack:** كالخطط السابقة. Node v22.22.0 في السحابة.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — هذه الخطّة تنفّذ المرحلتين ٥ و٦ من القسم ١٢ (القسم ٦ «الواجهات»، والقسم ٩ «الميزات الباقية»).

**الفرع:** `feat/arcade-meta` من `master` (بعد دمج PR #3).

## Global Constraints

- كلّ قيود الخطط ١–٣ سارية: لا بناء ولا مكتبات ولا صور، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`، `typing-game.html` لا يُلمس.
- مفاتيح التخزين القديمة تُقرأ كما كتبتها اللعبة القديمة: `ws_hs`، `ws_ach` (`{id: true}`)، `ws_words_total`، `ws_theme` (نصّ رقم)، `ws_leaderboard` (مصفوفة). الجديد: `ws_best_wave`.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test 'tests/*.test.js'`.
- الكتل أدناه ملفّات كاملة. السطر الأوّل في كلّ كتلة تعليق باسم الملفّ، وهو جزء من الملفّ. انسخ كلّ كتلة كما هي فوق الملفّ القائم أو كملفّ جديد.

## قرارات ليست في المواصفة

حُسمت الأربعة الأولى مع مو. الباقي اختيار هذه الخطّة.

1. **المتصدّرون القدامى يبقون.** ليس لهم رقم موجة، فعمود الموجة يظهر «—» لهم.
2. **`century` يعدّ كلّ قتل** (`run.kills`: بالكتابة وبالترقيات وكلمات الزعيم). نوفا لا تُعدّ قتلاً أصلاً.
3. **`flawless` = موجة بلا حرف خاطئ.** الخطأ المحميّ بـ«حارس الكومبو» يُحسب خطأ. الاصطدام لا يلغيه.
4. **زرّ الصوت يؤجَّل إلى الخطّة ٥** مع الصوت نفسه.
5. **`perfect`** عند نهاية الجولة: دقّة ١٠٠٪ وموجتان منظّفتان على الأقلّ. **`speedster`** عند النهاية: السرعة النهائيّة ≥ ٦٠.
6. **`level10`** يُسمّى «Wave Ten / الموجة العاشرة» (المواصفة). المعرّف لا يتغيّر.
7. **فحص الإنجازات** في كلّ إطار أثناء اللعب وعند النهاية. التخزين يُكتب فقط عند فتح إنجاز. التنبيهات في طابور، ٣ ثوانٍ لكلّ واحد.
8. **إدخال الاسم** يظهر إن دخلت النتيجة أعلى عشرة في اللوحة المدمجة، ويأخذ التركيز. ما يُكتب فيه لا يصل للعبة. ١٢ حرفاً، والفارغ يصير `PLAYER`.
9. **السفينة في القائمة** `svg` داخل الصفحة، لا رسماً على الـ `canvas`.
10. **اللوحات ليست مراحل.** `Esc` يغلقها، وباقي المفاتيح تُتجاهَل أثناءها.
11. **المشاركة:** ورقة المشاركة بملفّ حيث يدعمها المتصفّح، وإلّا تنزيل `word-strike-result.png`. إلغاء الورقة لا يفعل شيئاً. البطاقة تعرض أيقونات الترقيات، والأرقام تُرسم من اليسار لليمين حتى بالعربيّة. حُذف سطر النطاق `word-strike.app` من البطاقة القديمة لأنّه ليس عنوان اللعبة.
12. **شاشة النهاية نظيفة:** أسماء الأعداء تُمسح ولا تُرسم الجولة خلفها (كانت تظهر عبر الستار وتغطّي الأزرار).
13. **الكومبو `×n` من اليسار لليمين في العربيّة**، في الـ HUD وفي شاشة النهاية (كان يظهر `n×`).
14. **سطر الأفضل** يحذف الموجة حين تكون ٠ (لاعب لم يلعب النسخة الجديدة بعد).
15. **زرّ الثيم** يدور بين الأربعة ويعرض الاسم، والألوان تُقرأ من جديد فوراً.

## خارج هذه الخطّة

زرّ الصوت والصوت (الخطّة ٥). التوهّج والجزيئات والهزّة (الخطّة ٥). الجوّال وحذف اللعبة القديمة (الخطّة ٦).

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/game.js` | تعديل: `waveMisses`, `wavesCleared`, `flawlessWaves`, `bossKills` |
| `js/meta/themes.js` | جديد: الثيمات الأربعة وتطبيقها |
| `js/meta/achievements.js` | جديد: الإنجازات الثمانية وقواعدها |
| `js/meta/leaderboard.js` | جديد: دمج اللوحة وترتيبها وإضافة نتيجة |
| `js/meta/share.js` | جديد: رسم البطاقة ومشاركتها |
| `js/i18n.js` | تعديل: نصوص القائمة واللوحات والنهاية |
| `js/input.js` | تعديل: تجاهل المفاتيح داخل حقل نصّيّ |
| `js/main.js`, `index.html`, `css/base.css` | تعديل: القائمة واللوحات والنهاية والتنبيه |
| `tests/run-stats.test.js`, `tests/meta.test.js` | جديد |
| `tests/i18n.test.js` | تعديل |

---

### Task 1: إحصاءات الجولة

**Files:**
- Modify: `js/game.js`
- Test: `tests/run-stats.test.js`

**Interfaces:**
- `Run` يضيف: `waveMisses` (يُصفَّر مع كلّ موجة)، `wavesCleared`، `flawlessWaves`، `bossKills`.

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/run-stats.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, startWave, update, onChar } from '../js/game.js';

const WORDS = {
  1: ['ab', 'cd', 'ef', 'gh'],
  2: ['ijkl', 'mnop'],
  3: ['qrstuv', 'wxyzab'],
  4: ['abcdefgh', 'ijklmnop'],
  5: ['abcdefghijk', 'lmnopqrstuv'],
};

const enemy = (id, word) => ({ id, type: 'drone', word, typed: 0, x: 100, y: 100, vx: 0, vy: 0, speed: 0, dead: false });
const typeWord = (run, word) => { for (const ch of word) onChar(run, ch); };

function waveWith(n, ...enemies) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800, rand: () => 0.5 });
  startWave(run, n);
  run.toSpawn = 0;
  run.enemies.push(...enemies);
  return run;
}

test('a wave with no wrong key counts as flawless', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.wavesCleared, 1);
  assert.equal(run.flawlessWaves, 1);
});

test('one wrong key spoils the wave, and the count resets next wave', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  onChar(run, 'z');
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.wavesCleared, 1);
  assert.equal(run.flawlessWaves, 0);
  startWave(run, 2);
  assert.equal(run.waveMisses, 0);
});

test('a guarded miss still spoils the wave', () => {
  const run = waveWith(1, enemy(1, 'ab'));
  run.mods.comboGuard = 1;
  startWave(run, 1);
  run.toSpawn = 0;
  onChar(run, 'z');
  typeWord(run, 'ab');
  update(run, 0.016);
  assert.equal(run.flawlessWaves, 0);
});

test('a fallen boss is counted', () => {
  const run = waveWith(5);
  run.enemies[0].hp = 1;
  typeWord(run, run.enemies[0].word);
  assert.equal(run.bossKills, 1);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/run-stats.test.js`
Expected: FAIL، ٤ من ٤.

- [ ] **Step 3: اكتب التنفيذ** — استبدل `js/game.js`:

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
    waveMisses: 0, wavesCleared: 0, flawlessWaves: 0, bossKills: 0,
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
  run.waveMisses = 0;
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
    run.bossKills += 1;
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
    run.wavesCleared += 1;
    if (run.waveMisses === 0) run.flawlessWaves += 1;
    run.events.push({ type: 'waveClear', wave: run.wave });
  }
}

export function onChar(run, key) {
  if (run.over || run.waveCleared) return;
  run.totalKeys += 1;
  const before = lockedEnemy(run);
  const res = handleChar(run, key);
  if (res.kind === 'miss') {
    run.waveMisses += 1;
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
Expected: PASS، ٩٣ اختباراً، `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/run-stats.test.js
git commit -m "feat(arcade): count cleared, flawless waves and boss kills

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: الثيمات والإنجازات والمتصدّرون

**Files:**
- Create: `js/meta/themes.js`, `js/meta/achievements.js`, `js/meta/leaderboard.js`
- Test: `tests/meta.test.js`

**Interfaces:**
- `THEMES`, `THEME_KEY`, `themeIndex(value)`, `applyTheme(root, value): Theme`
- `ACHIEVEMENTS`, `ACH_KEY`, `WORDS_TOTAL_KEY`, `achievementById(id)`, `unlockedFrom(raw)`, `newAchievements(run, wordsBefore, unlocked): string[]`
- `LEADERBOARD_KEY`, `BOARD_SIZE`, `cleanRecords(raw)`, `mergeBoard(global, local)`, `qualifies(score, board)`, `makeRecord({name, score, wave, wpm, lang, date})`, `addRecord(local, record)`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/meta.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, themeIndex, applyTheme } from '../js/meta/themes.js';
import { ACHIEVEMENTS, newAchievements, unlockedFrom } from '../js/meta/achievements.js';
import { BOARD_SIZE, cleanRecords, mergeBoard, qualifies, makeRecord, addRecord } from '../js/meta/leaderboard.js';
import { createRun } from '../js/game.js';

// --- themes ---

test('four themes, each setting the same variables', () => {
  assert.deepEqual(THEMES.map(t => t.name), ['Cyber', 'Synth', 'Matrix', 'Vapor']);
  const keys = Object.keys(THEMES[0].vars).sort();
  for (const t of THEMES) assert.deepEqual(Object.keys(t.vars).sort(), keys, t.name);
});

test('theme index wraps and reads the old string value', () => {
  assert.deepEqual([0, 3, 4, -1, '2', 'junk', null].map(themeIndex), [0, 3, 0, 3, 2, 0, 0]);
});

test('applyTheme writes every variable on the root', () => {
  const set = {};
  const root = { style: { setProperty: (k, v) => { set[k] = v; } } };
  assert.equal(applyTheme(root, 2).name, 'Matrix');
  assert.equal(set['--bg'], '#020a02');
  assert.equal(Object.keys(set).length, Object.keys(THEMES[2].vars).length);
});

// --- achievements ---

const WORDS = { 1: ['ab'], 2: ['abcd'], 3: ['abcdef'], 4: ['abcdefgh'], 5: ['abcdefghijk'] };
const freshRun = (extra = {}) => Object.assign(createRun({ lang: 'en', words: WORDS, width: 800, height: 800 }), extra);

test('eight achievements with the old ids and both languages', () => {
  assert.deepEqual(ACHIEVEMENTS.map(a => a.id),
    ['first_blood', 'century', 'combo8', 'level10', 'flawless', 'perfect', 'speedster', 'boss_slayer']);
  for (const a of ACHIEVEMENTS) assert.ok(a.name.en && a.name.ar && a.icon, a.id);
});

test('each rule unlocks on its own condition', () => {
  const cases = [
    ['first_blood', freshRun({ kills: 1 }), 0],
    ['century', freshRun({ kills: 10 }), 90],
    ['combo8', freshRun({ maxCombo: 8 }), 0],
    ['level10', freshRun({ wave: 10 }), 0],
    ['flawless', freshRun({ flawlessWaves: 1 }), 0],
    ['perfect', freshRun({ over: true, totalKeys: 20, correctKeys: 20, wavesCleared: 2 }), 0],
    ['speedster', freshRun({ over: true, correctKeys: 300, time: 60 }), 0],
    ['boss_slayer', freshRun({ bossKills: 1 }), 0],
  ];
  for (const [id, run, wordsBefore] of cases) {
    assert.ok(newAchievements(run, wordsBefore, {}).includes(id), id);
  }
});

test('nothing unlocks for an empty run, and nothing twice', () => {
  assert.deepEqual(newAchievements(freshRun(), 0, {}), []);
  assert.deepEqual(newAchievements(freshRun({ kills: 1 }), 0, { first_blood: true }), []);
});

test('perfect and speedster wait for the end of the run', () => {
  const run = freshRun({ totalKeys: 300, correctKeys: 300, wavesCleared: 2, time: 60 });
  assert.deepEqual(newAchievements(run, 0, {}), []);
  run.over = true;
  assert.deepEqual(newAchievements(run, 0, {}), ['perfect', 'speedster']);
});

test('perfect needs two cleared waves and full accuracy', () => {
  assert.deepEqual(newAchievements(freshRun({ over: true, totalKeys: 5, correctKeys: 5, wavesCleared: 1 }), 0, {}), []);
  assert.deepEqual(newAchievements(freshRun({ over: true, totalKeys: 6, correctKeys: 5, wavesCleared: 2 }), 0, {}), []);
});

test('stored unlocks: only a plain object counts', () => {
  assert.deepEqual(unlockedFrom({ combo8: true }), { combo8: true });
  for (const bad of [null, [], 'x', 3]) assert.deepEqual(unlockedFrom(bad), {});
});

// --- leaderboard ---

test('records are cleaned: junk dropped, scores made numbers, old ones kept', () => {
  assert.deepEqual(cleanRecords('nope'), []);
  assert.deepEqual(cleanRecords([null, 3, { name: 'OLD', score: '900', level: 4 }]),
    [{ name: 'OLD', score: 900, level: 4 }]);
});

test('global and local merge, highest first, ten at most', () => {
  const local = Array.from({ length: 8 }, (_, i) => ({ name: `L${i}`, score: i * 10 }));
  const global = [{ name: 'G', score: 55 }, { name: 'H', score: 500 }, { name: 'I', score: 1 }];
  const board = mergeBoard(global, local);
  assert.equal(board.length, BOARD_SIZE);
  assert.equal(board[0].name, 'H');
  assert.deepEqual(board.map(r => r.score), [500, 70, 60, 55, 50, 40, 30, 20, 10, 1]);
});

test('a score qualifies on a short board or above the tenth', () => {
  const full = Array.from({ length: 10 }, (_, i) => ({ score: 100 - i }));
  assert.equal(qualifies(0, []), false);
  assert.equal(qualifies(5, []), true);
  assert.equal(qualifies(91, full), false);
  assert.equal(qualifies(92, full), true);
});

test('makeRecord trims the name and defaults it', () => {
  const base = { score: 10, wave: 3, wpm: 40, lang: 'ar', date: '2026-10-19' };
  assert.equal(makeRecord({ ...base, name: '  ' }).name, 'PLAYER');
  assert.equal(makeRecord({ ...base, name: ' مو الكاتب السريع جداً ' }).name, 'مو الكاتب ال');
  assert.equal(makeRecord({ ...base, name: 'Mo' }).wave, 3);
});

test('addRecord keeps the local list sorted and at ten', () => {
  const local = Array.from({ length: 10 }, (_, i) => ({ name: `L${i}`, score: (i + 1) * 10 }));
  const next = addRecord(local, { name: 'NEW', score: 55 });
  assert.equal(next.length, 10);
  assert.equal(next[5].name, 'NEW');
  assert.equal(next[9].score, 20);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/meta.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/meta/themes.js
// The four colour themes from the old game. Applying one writes CSS variables; everything drawn reads them back.

export const THEME_KEY = 'ws_theme';

export const THEMES = [
  { name: 'Cyber',  vars: { '--neon-cyan': '#00f5ff', '--neon-green': '#39ff14', '--neon-pink': '#ff2d78', '--neon-yellow': '#ffe600', '--neon-purple': '#bf5fff', '--bg': '#060610', '--tile-bg': 'rgba(10,10,40,0.92)', '--text': '#e8e8ff', '--dim': '#555577' } },
  { name: 'Synth',  vars: { '--neon-cyan': '#2de2e6', '--neon-green': '#39ff14', '--neon-pink': '#ff2e97', '--neon-yellow': '#ff9e2c', '--neon-purple': '#b14aed', '--bg': '#160a26', '--tile-bg': 'rgba(40,16,60,0.92)', '--text': '#ffe8ff', '--dim': '#7a5a8a' } },
  { name: 'Matrix', vars: { '--neon-cyan': '#39ff14', '--neon-green': '#00ff66', '--neon-pink': '#ff3b3b', '--neon-yellow': '#aaff00', '--neon-purple': '#7CFC00', '--bg': '#020a02', '--tile-bg': 'rgba(6,26,6,0.92)', '--text': '#d8ffd8', '--dim': '#3a6a3a' } },
  { name: 'Vapor',  vars: { '--neon-cyan': '#01cdfe', '--neon-green': '#05ffa1', '--neon-pink': '#ff71ce', '--neon-yellow': '#fffb96', '--neon-purple': '#b967ff', '--bg': '#241046', '--tile-bg': 'rgba(60,30,100,0.9)', '--text': '#fde8ff', '--dim': '#9a7ac0' } },
];

// Any stored value becomes a valid index: the old game saved it as a string.
export function themeIndex(value) {
  const n = THEMES.length;
  return (((Math.trunc(Number(value)) || 0) % n) + n) % n;
}

export function applyTheme(root, value) {
  const theme = THEMES[themeIndex(value)];
  for (const [name, color] of Object.entries(theme.vars)) root.style.setProperty(name, color);
  return theme;
}
```

```js
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
```

```js
// js/meta/leaderboard.js
// The static leaderboard.json merged with local results from ws_leaderboard. Top ten by score.

export const LEADERBOARD_KEY = 'ws_leaderboard';
export const BOARD_SIZE = 10;
const NAME_MAX = 12;
const DEFAULT_NAME = 'PLAYER';

// Old-game records have `level` and no `wave`; they stay, and their wave shows as a dash.
export function cleanRecords(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(r => r && typeof r === 'object')
    .map(r => ({ ...r, score: Number(r.score) || 0 }));
}

const byScore = (a, b) => b.score - a.score;

export function mergeBoard(globalRecords, localRecords) {
  return [...cleanRecords(globalRecords), ...cleanRecords(localRecords)].sort(byScore).slice(0, BOARD_SIZE);
}

export function qualifies(score, board) {
  if (score <= 0) return false;
  return board.length < BOARD_SIZE || score > board[board.length - 1].score;
}

export function makeRecord({ name, score, wave, wpm, lang, date }) {
  return { name: (name.trim() || DEFAULT_NAME).slice(0, NAME_MAX), score, wave, wpm, lang, date };
}

export function addRecord(localRecords, record) {
  return [...cleanRecords(localRecords), record].sort(byScore).slice(0, BOARD_SIZE);
}
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/meta.test.js`
Expected: PASS، ١٤ اختباراً.

- [ ] **Step 5: Commit**

```bash
git add js/meta/themes.js js/meta/achievements.js js/meta/leaderboard.js tests/meta.test.js
git commit -m "feat(arcade): add themes, achievements and leaderboard rules

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: النصوص

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
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/i18n.test.js`
Expected: FAIL في `menu, panel and game-over strings`.

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
Expected: PASS، ٥ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat(arcade): add menu, panel and game-over strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: الشاشات في المتصفّح

**Files:**
- Create: `js/meta/share.js`
- Modify: `js/input.js`, `js/main.js`, `index.html`, `css/base.css`

**Interfaces:**
- `CARD_W = 600`, `CARD_H = 800`, `drawShareCard(canvas, stats, colors, text)`, `shareCard(canvas)`

لا اختبارات آليّة لهذه المهمّة. التحقّق في Task 5.

- [ ] **Step 1: البطاقة والإدخال**

```js
// js/meta/share.js
// The 600×800 result card drawn on a canvas, handed to the system share sheet or downloaded.

export const CARD_W = 600;
export const CARD_H = 800;
const FILE_NAME = 'word-strike-result.png';
const GRID = 30;
const ROW_START = 240;
const ROW_STEP = 92;
const REVOKE_MS = 1000;

// stats: {score, wave, wpm, acc, maxCombo, icons}; text: {lang, sub, labels: {score, wave, wpm, accuracy, maxCombo}, font}
export function drawShareCard(canvas, stats, colors, text) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= CARD_W; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CARD_H); ctx.stroke(); }
  for (let y = 0; y <= CARD_H; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CARD_W, y); ctx.stroke(); }

  const label = text.lang === 'ar' ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  const grad = ctx.createLinearGradient(40, 0, CARD_W - 40, 0);
  grad.addColorStop(0, colors.cyan);
  grad.addColorStop(0.5, colors.purple);
  grad.addColorStop(1, colors.pink);
  ctx.direction = 'ltr';
  ctx.fillStyle = grad;
  ctx.font = 'bold 56px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText('WORD STRIKE', CARD_W / 2, 110);
  ctx.direction = label;
  ctx.fillStyle = colors.text;
  ctx.font = `20px ${text.font}`;
  ctx.fillText(text.sub, CARD_W / 2, 158);

  const rows = [
    [text.labels.score, stats.score.toLocaleString('en')],
    [text.labels.wave, String(stats.wave)],
    [text.labels.wpm, String(stats.wpm)],
    [text.labels.accuracy, `${stats.acc}%`],
    [text.labels.maxCombo, `×${stats.maxCombo}`],
  ];
  rows.forEach(([name, value], i) => {
    const y = ROW_START + i * ROW_STEP;
    ctx.direction = label;
    ctx.fillStyle = colors.dim;
    ctx.font = `18px ${text.font}`;
    ctx.fillText(name, CARD_W / 2, y);
    ctx.direction = 'ltr';
    ctx.fillStyle = colors.cyan;
    ctx.font = 'bold 40px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText(value, CARD_W / 2, y + 42);
  });

  if (stats.icons.length) {
    ctx.direction = 'ltr';
    ctx.font = '34px system-ui, sans-serif';
    ctx.fillText(stats.icons.join(' '), CARD_W / 2, CARD_H - 50);
  }
}

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_MS);
}

// The share sheet where the browser supports files, a download elsewhere. Cancelling the sheet does nothing.
export function shareCard(canvas) {
  canvas.toBlob(blob => {
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Word Strike' }).catch(err => {
        if (err.name !== 'AbortError') download(blob);
      });
    } else {
      download(blob);
    }
  }, 'image/png');
}
```

```js
// js/input.js
// Desktop keyboard. Mobile input arrives in a later plan.
// Keys typed into a text field (the leaderboard name) stay there and never reach the game.
const SPECIAL_KEYS = ['Enter', 'Escape', 'Backspace'];

export function attachInput(handleKey) {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target instanceof HTMLInputElement) return;
    if (e.key.length !== 1 && !SPECIAL_KEYS.includes(e.key)) return;
    e.preventDefault();
    handleKey(e.key);
  });
}
```

- [ ] **Step 2: الهيكل والتنسيق** — استبدل `index.html` و`css/base.css`:

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
    <svg class="menu-ship" viewBox="-24 -26 48 48" aria-hidden="true"><path d="M0 -22 L16 16 L0 8 L-16 16 Z"/></svg>
    <h1 class="title">WORD STRIKE</h1>
    <p class="tagline" data-i18n="tagline"></p>
    <div class="lang-switch">
      <button class="lang-btn" data-lang="en">English</button>
      <button class="lang-btn" data-lang="ar">العربيّة</button>
    </div>
    <button id="btn-start" class="btn-primary"><span data-i18n="start"></span><kbd>Enter</kbd></button>
    <div class="menu-row">
      <button id="btn-leaderboard" class="btn-secondary" data-i18n="leaderboard"></button>
      <button id="btn-achievements" class="btn-secondary" data-i18n="achievements"></button>
      <button id="btn-theme" class="btn-secondary"><span data-i18n="theme"></span> · <span id="theme-name"></span></button>
    </div>
    <p id="best-line" class="best-line"></p>
  </section>

  <section id="panel" class="panel-backdrop" hidden>
    <div class="panel">
      <h2 id="panel-title" class="panel-title"></h2>
      <div id="panel-body" class="panel-body"></div>
      <button id="btn-panel-close" class="btn-secondary"><span data-i18n="close"></span><kbd>Esc</kbd></button>
    </div>
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
    <div id="new-record" class="new-record" data-i18n="newRecord" hidden></div>
    <div class="final-stats">
      <div><b id="final-wave">0</b><span data-i18n="wave"></span></div>
      <div><b id="final-wpm">0</b><span data-i18n="wpm"></span></div>
      <div><b id="final-acc">0%</b><span data-i18n="accuracy"></span></div>
      <div><b id="final-combo">×1</b><span data-i18n="maxCombo"></span></div>
    </div>
    <div id="final-upgrades" class="chips" hidden></div>
    <div id="final-ach" class="chips" hidden></div>
    <form id="record-form" class="record-form" hidden>
      <input id="record-name" maxlength="12" autocomplete="off" spellcheck="false">
      <button class="btn-secondary" data-i18n="saveScore"></button>
    </form>
    <div class="over-buttons">
      <button id="btn-again" class="btn-primary"><span data-i18n="playAgain"></span><kbd>Enter</kbd></button>
      <button id="btn-share" class="btn-secondary" data-i18n="share"></button>
      <button id="btn-over-menu" class="btn-secondary"><span data-i18n="menu"></span><kbd>R</kbd></button>
    </div>
  </section>

  <div id="ach-toast" class="ach-toast" hidden><span id="ach-toast-icon"></span><span><small data-i18n="achievementUnlocked"></small><b id="ach-toast-name"></b></span></div>

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
  top: 0; left: 0; font-size: 18px; direction: ltr;
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
.final-stats b { font-size: 24px; color: var(--text); direction: ltr; }

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
  top: 0; left: 0; font-size: 20px; direction: ltr;
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

/* Menu extras */
.menu-ship {
  width: 56px; height: 56px; fill: none; stroke: var(--neon-cyan); stroke-width: 2;
  filter: drop-shadow(0 0 8px var(--neon-cyan));
}
.menu-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.best-line { font-size: 12px; color: var(--dim); }

/* Leaderboard / achievements panel, over the menu */
.panel-backdrop {
  position: fixed; inset: 0; z-index: 30;
  display: flex; align-items: center; justify-content: center;
  background: rgba(5, 4, 15, 0.75);
}
.panel {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  min-width: min(420px, 92vw); max-height: 84vh; overflow-y: auto; padding: 24px;
  background: var(--tile-bg); border: 1px solid var(--neon-cyan); border-radius: 12px;
  box-shadow: 0 0 18px var(--neon-cyan);
}
.panel-title { color: var(--neon-cyan); }
.panel-body { width: 100%; }
.board { width: 100%; border-collapse: collapse; font-size: 14px; }
.board th { font-size: 10px; letter-spacing: 1px; color: var(--dim); font-weight: 400; padding: 4px 6px; }
.board td { padding: 6px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); }
.board td.name { text-align: start; }
.board .mine td { color: var(--neon-yellow); }
.empty { text-align: center; color: var(--dim); }
.ach-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
.ach-row.locked { opacity: 0.35; filter: grayscale(1); }
.ach-icon { font-size: 22px; }

/* Game over extras */
.new-record {
  color: var(--neon-yellow); text-shadow: 0 0 10px var(--neon-yellow); font-weight: 700;
  animation: record-pulse 0.9s ease-in-out infinite alternate;
}
@keyframes record-pulse { from { opacity: 0.6; } to { opacity: 1; } }
.chips { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; max-width: 520px; }
.chips-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--dim); }
.chip { padding: 2px 10px; font-size: 13px; border: 1px solid var(--dim); border-radius: 12px; }
.record-form { display: flex; gap: 8px; }
.record-form input {
  width: 180px; padding: 6px 10px; font: inherit; font-size: 16px; color: var(--text);
  background: var(--tile-bg); border: 1px solid var(--neon-cyan); border-radius: 8px;
}
.over-buttons { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }

/* Achievement toast, above everything */
.ach-toast {
  position: fixed; top: 64px; left: 50%; transform: translateX(-50%); z-index: 40;
  display: flex; align-items: center; gap: 12px; padding: 8px 18px; pointer-events: none;
  background: var(--tile-bg); border: 1px solid var(--neon-yellow); border-radius: 10px;
  box-shadow: 0 0 14px var(--neon-yellow); animation: toast-in 0.3s ease-out;
}
.ach-toast small { display: block; font-size: 10px; letter-spacing: 1px; color: var(--dim); }
#ach-toast-icon { font-size: 26px; }
@keyframes toast-in { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }
```

- [ ] **Step 3: الربط** — استبدل `js/main.js`:

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
import { drawShip, drawHpRing, aimAngle } from './render/ship.js';
import { drawEnemy, drawBoss } from './render/enemies.js';
import { createFx } from './render/fx.js';
import { createLabels } from './render/labels.js';
import { createCards } from './render/cards.js';
import { THEME_KEY, THEMES, themeIndex, applyTheme } from './meta/themes.js';
import { ACH_KEY, WORDS_TOTAL_KEY, ACHIEVEMENTS, achievementById, unlockedFrom, newAchievements } from './meta/achievements.js';
import { LEADERBOARD_KEY, cleanRecords, mergeBoard, qualifies, makeRecord, addRecord } from './meta/leaderboard.js';
import { drawShareCard, shareCard } from './meta/share.js';

const BANNER_SEC = 1.5;
const PICK_FLASH_SEC = 0.35;
const BOSS_BURST_SPREAD = 36;
const HIGH_SCORE_KEY = 'ws_hs';
const BEST_WAVE_KEY = 'ws_best_wave';
const TOAST_SEC = 3;

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
  $('theme-name').textContent = THEMES[theme].name;
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
  $('panel-body').replaceChildren(kind === 'leaderboard' ? boardTable() : achievementList());
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
    if (phase.get() !== 'gameover') checkAchievements();
  }
  updateToast(dt);
  if (p === 'upgradePick' && pickedIndex !== -1) {
    pickTimer -= dt;
    if (pickTimer <= 0) finishPick();
  }

  fx.update(p === 'paused' ? 0 : dt);
  // Read the phase again: a game over raised during this frame must not redraw the labels just cleared.
  if (run && phase.get() !== 'gameover') drawRun();
  fx.draw(gctx, colors);
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
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

// The static board is optional: offline or opened from disk, only local results show.
fetch('leaderboard.json')
  .then(r => (r.ok ? r.json() : []))
  .then(data => { globalBoard = cleanRecords(data); })
  .catch(() => { globalBoard = []; });

attachInput(handleKey);
resize();
setLang('en');
$('theme-name').textContent = THEMES[theme].name;
startLoop(frame);
```

- [ ] **Step 4: فحص الصياغة والاختبارات**

Run: `for f in js/main.js js/meta/share.js js/input.js; do node --input-type=module --check < $f; done`
Expected: لا مخرجات.

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ١٠٨ اختبارات، `fail 0`.

- [ ] **Step 5: Commit**

```bash
git add js/meta/share.js js/input.js js/main.js index.html css/base.css
git commit -m "feat(arcade): add menu panels, full game-over screen and sharing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: التحقّق في المتصفّح

بـ Playwright + Chromium على `python3 -m http.server 3737`، مقاس 1280×800، مع `acceptDownloads`. قبل البدء: امسح `localStorage` واكتب بيانات بصيغة اللعبة القديمة، ثمّ أعد التحميل:
`ws_leaderboard = [{"name":"OLD","score":900,"level":4,"wpm":30,"lang":"en","date":"2026-08-01"}]`، `ws_ach = {"first_blood":true}`، `ws_theme = "2"`، `ws_hs = "10"`، `ws_words_total = "95"`.

- [ ] **Step 1: القائمة واللوحات**
  1. Expected: الثيم `Matrix` (`--bg` = `#020a02`)، وسطر «Best 10» بلا موجة، والسفينة ظاهرة.
  2. المتصدّرون: صفّ `OLD` بموجة «—». `Esc` يغلق.
  3. الإنجازات: ٨ صفوف، واحد مفتوح.
  4. زرّ الثيم: `Vapor`، و`ws_theme` = `3`.
- [ ] **Step 2: جولة إنجليزيّة**
  1. ابدأ، ونظّف الموجة ١ بلا خطأ. Expected: تنبيه «Centurion»، و`ws_ach` فيه `century` و`flawless`.
  2. اختر ترقية. Expected: الكومبو `×n` بـ `direction: ltr`.
  3. اترك السفينة تسقط. Expected: «New record!»، شريحة الترقية، شريحتا الإنجازين، والنموذج ظاهر وحقل الاسم مركَّز.
  4. اكتب `Tester` ثمّ `Enter`. Expected: النموذج يختفي والشاشة باقية، و`ws_leaderboard` فيه سجلّ بـ `wave`. `ws_words_total` = ٩٥ + القتلى، و`ws_best_wave` = ٢.
  5. «شارك النتيجة». Expected: تنزيل `word-strike-result.png` بمقاس 600×800.
  6. `R` ثمّ المتصدّرون. Expected: صفّ `Tester` مميَّز.
- [ ] **Step 3: العربيّة**
  1. الإنجازات بالعربيّة: الأسماء من اليمين.
  2. جولة بقتلين ثمّ سقوط (اختر ترقية إن ظهرت الشاشة: ستّة أعداء ناقص قتيلين لا تُسقط خمس حياة). Expected: الكومبو `×2` في الـ HUD وفي شاشة النهاية (`×` يسار الرقم)، ولا أسماء أعداء على شاشة النهاية.
  3. بطاقة المشاركة بالعربيّة: 600×800، العناوين بالعربيّة والأرقام سليمة.
- [ ] **Step 4: لا أخطاء في الـ console** في كلّ ما سبق.

لا commit لهذه المهمّة. النتائج وما لم يُتحقَّق منه في وصف الـPR.

---

## ما بعد هذه الخطّة

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٥ | الإحساس + الصوت + الموسيقى (المرحلتان ٧ و٨) |
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
