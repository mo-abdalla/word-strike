# Word Strike Arcade — الخطّة ٥أ: الإحساس والمؤثّرات الصوتيّة

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** اللعبة تُحَسّ: توهّج مخبّأ، رصاص وجزيئات وحلقات، تجمّد ٤٠ مللي ثانية عند القتل، هزّة، وميض أحمر عند الضرر وأبيض عند سقوط الزعيم، سفينة تسخن مع الكومبو وتدور ببطء نحو الهدف، سديم يتغيّر لونه مع الموجة. ومؤثّرات صوتيّة جديدة لكلّ حدث، مع لوحة «الصوت» (كتم + مستوى المؤثّرات). الموسيقى في الخطّة ٥ب.

**Architecture:** `js/feel.js` حالة الإحساس كبيانات خالصة (تُختبر في Node)، تقودها أحداث الجولة ويرسمها `render/fx.js`. `js/sound.js` تصميم الصوت كبيانات (أيّ نغمات لكلّ حدث)، و`js/audio.js` يحوّلها إلى Web Audio. `render/glow.js` يرسم كلّ شكل مرّة بـ `shadowBlur` ثمّ يختمه بـ `drawImage`.

**Tech Stack:** كالخطط السابقة. Node v22.22.0 في السحابة.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — المرحلة ٧ من القسم ١٢ (القسم ٧ «الرسوميات»)، والمؤثّرات والتحكّم من القسم ٨.

**الفرع:** `feat/arcade-feel` من `master` (بعد دمج PR #4).

## Global Constraints

- كلّ قيود الخطط ١–٤ سارية: لا بناء ولا مكتبات ولا صور ولا ملفّات صوت، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`، `typing-game.html` لا يُلمس.
- لا `shadowBlur` داخل حلقة الإطارات: التوهّج من `render/glow.js` فقط.
- كلّ صوت يمرّ عبر `playTone(freq, type, dur, vol, delay)` أو ضجيج مرشَّح في `js/audio.js`، وكلاهما لا يفعل شيئاً قبل أوّل ضغطة (`if (!ctx) return`).
- كلّ commit يترك اللعبة تعمل في المتصفّح.
- كلّ رسالة commit تنتهي بـ:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- أمر الاختبارات كلّها: `node --test 'tests/*.test.js'`.
- الكتل أدناه ملفّات كاملة. السطر الأوّل في كلّ كتلة تعليق باسم الملفّ، وهو جزء من الملفّ. انسخ كلّ كتلة كما هي فوق الملفّ القائم أو كملفّ جديد.

## قرارات ليست في المواصفة

حُسمت الثلاثة الأولى مع مو. الباقي اختيار هذه الخطّة.

1. **الصوت على مرحلتين:** ٥أ (هذه) الإحساس والمؤثّرات وزرّ الصوت، و٥ب الموسيقى وحدها بعد أن يسمع مو المؤثّرات.
2. **مؤثّرات جديدة كلّها**، مصمّمة من وصف المواصفة، لا منقولة من اللعبة القديمة.
3. **ابدأ ٥أ بعد دمج PR #4.**
4. **لا أسمع الصوت.** الاختبار يتحقّق من المنطق: أيّ نغمات لكلّ حدث، ارتفاع الطلقة مع الكومبو، أنّ السياق لا يبدأ قبل ضغطة، أنّ الكتم يُسكت ويُحفظ. الجودة يحكم عليها مو.
5. **التصميم:** الطلقة نغمة مربّعة تعلو ٠/٣/٧/١٢ نصف درجة مع ×١/×٢/×٤/×٨. القتل ضجيج قصير + ثلاث نغمات صاعدة. الخطأ مربّعة منخفضة. الضرر جيبيّة ٧٠ هرتز + ضجيج. إنذار الزعيم أربع نغمات منشاريّة متناوبة. الترقية ثلاث جيبيّات صاعدة. ومعها: إصابة الزعيم، سقوطه، نوفا، البرق/البرج، النبضة.
6. **لوحة «الصوت» في القائمة** بجانب الثيم: «كتم» ومنزلق «المؤثّرات». منزلق الموسيقى يأتي مع ٥ب. تُحفظ في `ws_audio` = `{music, sfx, muted}` (القيم الافتراضيّة ٠٫٦ و٠٫٨ و`false`).
7. **التجمّد (hitstop):** منطق الجولة يتوقّف ٤٠ مللي ثانية بعد القتل وإصابة الزعيم. المؤثّرات تكمل.
8. **الهزّة** ٣ بكسل عند القتل و١٠ عند الضرر وسقوط الزعيم، تخبو ٣٠ بكسل/ثانية. تُطبَّق على `canvas` اللعب وطبقة الأسماء معاً، لا على النجوم ولا الـ HUD.
9. **الرصاصة** خطّ قصير يتحرّك من أنف السفينة إلى العدوّ في ٠٫٠٧ ثانية، بدل خطّ الطلقة الثابت.
10. **حرارة السفينة** بأربع درجات فقط (×١، ×٢، ×٤، ×٨) فلا تكثر صور التوهّج. **الدوران** ٨ راديان/ثانية بالطريق الأقصر.
11. **نبضة الكومبو** تكبّر الخطّ لا `scale`: الكومبو موضوع بـ `transform`، و`scale` كان يضرب موضعه أيضاً (ظهر تحت السفينة بـ ٧٠ بكسل في التجربة).
12. **حدّ الجزيئات ٤٠٠**، الأقدم يُحذف أوّلاً. حدّ الجوّال ٢٠٠ في الخطّة ٦ مع كشف الجوّال.
13. **`prefers-reduced-motion`:** لا هزّة ولا وميض (فوهة، أحمر، أبيض) ولا تجمّد، ولا اهتزاز الاسم ولا نبضة الكومبو. الجزيئات والحلقات تبقى.
14. **الثيم** يمسح صور التوهّج فتُبنى بألوانه.

## خارج هذه الخطّة

الموسيقى ومنزلقها (الخطّة ٥ب). حدّ جزيئات الجوّال وكلّ ما يخصّ الجوّال (الخطّة ٦). قياس ٦٠ إطاراً على حاسوب عاديّ: المتصفّح بلا واجهة في السحابة لا يمثّله.

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/feel.js` | جديد: حالة الإحساس وأحداثها وتحديثها |
| `js/render/color.js` | جديد: مزج الألوان وحرارة السفينة |
| `js/sound.js` | جديد: إعدادات الصوت والنغمات لكلّ حدث |
| `js/audio.js` | جديد: تشغيل النغمات والضجيج بـ Web Audio |
| `js/render/glow.js` | جديد: صور التوهّج المخبّأة |
| `js/render/enemies.js`, `js/render/ship.js`, `js/render/fx.js`, `js/render/starfield.js` | تعديل: الأشكال بالتوهّج، اللهب والدوران، رسم الإحساس، السديم |
| `js/main.js`, `index.html`, `css/base.css`, `js/i18n.js` | تعديل: الربط، زرّ ولوحة الصوت، النبضة، تقليل الحركة |
| `tests/feel.test.js`, `tests/sound.test.js`, `tests/render.test.js` | جديد |
| `tests/i18n.test.js` | تعديل |

---

### Task 1: حالة الإحساس والألوان

**Files:**
- Create: `js/feel.js`, `js/render/color.js`
- Test: `tests/feel.test.js`

**Interfaces:**
- `PARTICLE_CAP = 400`, `HITSTOP_SEC = 0.04`, `FEEL_TIMES`
- `createFeel({reducedMotion, rand, cap}) → Feel`، `feelEvent(f, ev, ship)`، `updateFeel(f, dt)`، `shakeOffset(f) → {x, y}`
- `mixHex(a, b, t)`، `withAlpha(hex, a)`، `heatColor(combo, cold, hot)`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/feel.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFeel, feelEvent, updateFeel, shakeOffset, HITSTOP_SEC, PARTICLE_CAP, FEEL_TIMES } from '../js/feel.js';
import { mixHex, withAlpha, heatColor } from '../js/render/color.js';

const ship = { x: 400, y: 730 };

test('a shot fires a bullet from the nose, with recoil and a muzzle flash', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'shot', x: 100, y: 200 }, ship);
  assert.deepEqual(f.bullets.map(b => [b.x1, b.y1, b.x2, b.y2]), [[400, 708, 100, 200]]);
  assert.ok(f.recoil > 0);
  assert.ok(f.muzzle > 0);
  updateFeel(f, FEEL_TIMES.BULLET_SEC);
  assert.equal(f.bullets.length, 0);
});

test('a kill bursts, rings, holds the frame and shakes a little', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'kill', x: 50, y: 60 }, ship);
  assert.equal(f.particles.length, 18);
  assert.equal(f.rings.length, 1);
  assert.equal(f.hitstop, HITSTOP_SEC);
  assert.equal(f.shake, 3);
});

test('getting hurt shakes harder and flashes the edges', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'kill', x: 0, y: 0 }, ship);
  feelEvent(f, { type: 'hurt', x: 0, y: 0 }, ship);
  assert.equal(f.shake, 10);
  assert.ok(f.hurt > 0);
});

test('reduced motion: no shake, no flash, no hitstop — particles stay', () => {
  const f = createFeel({ reducedMotion: true, rand: () => 0.5 });
  for (const type of ['shot', 'kill', 'hurt', 'bossDown']) feelEvent(f, { type, x: 0, y: 0 }, ship);
  assert.deepEqual([f.shake, f.hitstop, f.hurt, f.white, f.muzzle], [0, 0, 0, 0, 0]);
  assert.ok(f.particles.length > 0);
});

test('particles are capped, oldest first', () => {
  const f = createFeel({ rand: () => 0.5, cap: 20 });
  feelEvent(f, { type: 'kill', x: 1, y: 1 }, ship);
  feelEvent(f, { type: 'kill', x: 2, y: 2 }, ship);
  assert.equal(f.particles.length, 20);
  assert.ok(f.particles.slice(-18).every(p => p.x === 2));
  assert.equal(PARTICLE_CAP, 400);
});

test('timers decay and run out', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'hurt', x: 0, y: 0 }, ship);
  feelEvent(f, { type: 'kill', x: 0, y: 0 }, ship);
  updateFeel(f, 0.05);
  assert.equal(f.hitstop, 0);
  assert.ok(f.shake < 10 && f.shake > 0);
  updateFeel(f, 1);
  assert.deepEqual([f.shake, f.hurt, f.rings.length, f.particles.length], [0, 0, 0, 0]);
});

test('a fallen boss explodes three times in a row and flashes white', () => {
  const f = createFeel({ rand: () => 0.5 });
  feelEvent(f, { type: 'bossDown', x: 400, y: 150 }, ship);
  assert.ok(f.white > 0);
  const counts = [];
  for (const dt of [0, 0.15, 0.15]) {
    updateFeel(f, dt);
    counts.push(f.rings.length);
  }
  assert.deepEqual(counts, [1, 2, 3]);
  assert.deepEqual(f.rings.map(r => r.x), [364, 400, 436]);
});

test('shake offset stays inside the shake amount', () => {
  const f = createFeel({ rand: () => 0.99 });
  assert.deepEqual(shakeOffset(f), { x: 0, y: 0 });
  f.shake = 5;
  const o = shakeOffset(f);
  assert.ok(Math.abs(o.x) <= 5 && Math.abs(o.y) <= 5 && o.x > 4);
});

test('colour mixing and the combo heat steps', () => {
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(withAlpha('#ff0080', 0.5), 'rgba(255,0,128,0.5)');
  const steps = [1, 2, 4, 8].map(c => heatColor(c, '#00f5ff', '#ffe600'));
  assert.equal(steps[0], '#00f5ff');
  assert.equal(steps[3], '#ffe600');
  assert.equal(new Set(steps).size, 4);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/feel.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/feel.js`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/feel.js
// Game feel as plain data: bullets, zaps, rings, particles, shake, hitstop and flashes.
// Driven by run events, advanced by dt, drawn by render/fx.js. No DOM, so it is tested in Node.
// Colours are theme names ('pink', 'cyan', ...); the renderer maps them to the current theme.

export const PARTICLE_CAP = 400;
export const HITSTOP_SEC = 0.04;
const BULLET_SEC = 0.07;
const ZAP_SEC = 0.18;
const RING_SEC = 0.35;
const MUZZLE_SEC = 1 / 60;
const RECOIL_PX = 4;
const RECOIL_DECAY = 40;
const SHAKE_KILL = 3;
const SHAKE_HURT = 10;
const SHAKE_DECAY = 30;
const HURT_SEC = 0.45;
const WHITE_SEC = 0.25;
const PARTICLE_DRAG = 3;
const SHIP_NOSE = 22;
const BOSS_BURSTS = [[0, -36], [0.15, 0], [0.3, 36]]; // [delay s, x offset px]

export function createFeel({ reducedMotion = false, rand = Math.random, cap = PARTICLE_CAP } = {}) {
  return {
    reducedMotion, rand, cap,
    bullets: [], zaps: [], rings: [], particles: [], delayed: [],
    shake: 0, hitstop: 0, hurt: 0, white: 0, recoil: 0, muzzle: 0, muzzleAt: null,
  };
}

// Oldest particles go first when the cap is reached.
function burst(f, x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const angle = f.rand() * Math.PI * 2;
    const v = speed * (0.3 + 0.7 * f.rand());
    const life = 0.4 + 0.3 * f.rand();
    f.particles.push({ x, y, vx: Math.cos(angle) * v, vy: Math.sin(angle) * v, life, max: life, color, size: 1.5 + 1.5 * f.rand() });
  }
  if (f.particles.length > f.cap) f.particles.splice(0, f.particles.length - f.cap);
}

function ring(f, x, y, color, radius = 40) {
  f.rings.push({ x, y, color, radius, life: RING_SEC });
}

function shake(f, amount) {
  if (!f.reducedMotion) f.shake = Math.max(f.shake, amount);
}

function hitstop(f) {
  if (!f.reducedMotion) f.hitstop = HITSTOP_SEC;
}

export function feelEvent(f, ev, ship) {
  switch (ev.type) {
    case 'shot':
      f.bullets.push({ x1: ship.x, y1: ship.y - SHIP_NOSE, x2: ev.x, y2: ev.y, life: BULLET_SEC });
      f.recoil = RECOIL_PX;
      if (!f.reducedMotion) {
        f.muzzle = MUZZLE_SEC;
        f.muzzleAt = { x: ship.x, y: ship.y - SHIP_NOSE };
      }
      break;
    case 'kill':
      burst(f, ev.x, ev.y, 'pink', 18, 220);
      ring(f, ev.x, ev.y, 'yellow');
      hitstop(f);
      shake(f, SHAKE_KILL);
      break;
    case 'bossHit':
      burst(f, ev.x, ev.y, 'yellow', 24, 260);
      ring(f, ev.x, ev.y, 'yellow', 70);
      hitstop(f);
      shake(f, SHAKE_KILL);
      break;
    case 'novaHit':
    case 'pop':
      burst(f, ev.x, ev.y, 'cyan', 10, 160);
      ring(f, ev.x, ev.y, 'cyan', 30);
      break;
    case 'hurt':
      burst(f, ev.x, ev.y, 'pink', 12, 180);
      ring(f, ev.x, ev.y, 'pink');
      if (!f.reducedMotion) f.hurt = HURT_SEC;
      shake(f, SHAKE_HURT);
      break;
    case 'zap':
      f.zaps.push({ x1: ev.from.x, y1: ev.from.y, x2: ev.to.x, y2: ev.to.y, life: ZAP_SEC });
      break;
    case 'pulse':
      ring(f, ship.x, ship.y, 'cyan', 140);
      break;
    case 'bossDown':
      for (const [at, dx] of BOSS_BURSTS) f.delayed.push({ at, x: ev.x + dx, y: ev.y });
      if (!f.reducedMotion) f.white = WHITE_SEC;
      shake(f, SHAKE_HURT);
      break;
    default:
      break;
  }
}

function expire(list, dt) {
  for (const item of list) item.life -= dt;
  for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
}

export function updateFeel(f, dt) {
  expire(f.bullets, dt);
  expire(f.zaps, dt);
  expire(f.rings, dt);
  const drag = Math.exp(-PARTICLE_DRAG * dt);
  for (const p of f.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= drag;
    p.vy *= drag;
  }
  expire(f.particles, dt);
  for (const d of f.delayed) d.at -= dt;
  for (const d of f.delayed.filter(x => x.at <= 0)) {
    burst(f, d.x, d.y, 'yellow', 28, 300);
    ring(f, d.x, d.y, 'yellow', 90);
  }
  f.delayed = f.delayed.filter(x => x.at > 0);
  f.shake = Math.max(0, f.shake - SHAKE_DECAY * dt);
  f.hitstop = Math.max(0, f.hitstop - dt);
  f.hurt = Math.max(0, f.hurt - dt);
  f.white = Math.max(0, f.white - dt);
  f.muzzle = Math.max(0, f.muzzle - dt);
  f.recoil = Math.max(0, f.recoil - RECOIL_DECAY * dt);
}

export function shakeOffset(f) {
  if (f.shake === 0) return { x: 0, y: 0 };
  return { x: (f.rand() * 2 - 1) * f.shake, y: (f.rand() * 2 - 1) * f.shake };
}

export const FEEL_TIMES = { BULLET_SEC, RING_SEC, ZAP_SEC, HURT_SEC, WHITE_SEC };
```

```js
// js/render/color.js
// Colour helpers for canvas drawing. Theme colours are #rrggbb.

function channels(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mixHex(a, b, t) {
  const ca = channels(a);
  const cb = channels(b);
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `#${out.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function withAlpha(hex, alpha) {
  const [r, g, b] = channels(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Combo ×1 → cold, ×8 → hot, in four steps (×1, ×2, ×4, ×8) so the ship's glow sprites stay few.
export function heatColor(combo, cold, hot) {
  const t = Math.min(1, Math.log2(Math.max(1, combo)) / 3);
  return mixHex(cold, hot, Math.round(t * 3) / 3);
}
```

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/feel.test.js`
Expected: PASS، ٩ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/feel.js js/render/color.js tests/feel.test.js
git commit -m "feat(arcade): add game feel state and colour helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: تصميم الصوت

**Files:**
- Create: `js/sound.js`
- Test: `tests/sound.test.js`

**Interfaces:**
- `AUDIO_KEY = 'ws_audio'`, `DEFAULT_AUDIO`, `audioSettings(raw)`, `effectiveSfx(settings)`, `shotFreq(combo)`, `soundFor(ev, combo = 1): Voice[]`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/sound.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_KEY, DEFAULT_AUDIO, audioSettings, effectiveSfx, shotFreq, soundFor } from '../js/sound.js';

const near = (a, b) => Math.abs(a - b) < 1e-6;
const EVENTS = ['shot', 'kill', 'miss', 'hurt', 'bossSpawn', 'bossHit', 'bossDown', 'nova', 'zap', 'pulse', 'pick'];

test('settings: stored key, defaults and clamping', () => {
  assert.equal(AUDIO_KEY, 'ws_audio');
  assert.deepEqual(audioSettings(null), DEFAULT_AUDIO);
  assert.deepEqual(audioSettings([1]), DEFAULT_AUDIO);
  assert.deepEqual(audioSettings({ sfx: 2, music: -1, muted: true }), { music: 0, sfx: 1, muted: true });
  assert.deepEqual(audioSettings({ sfx: 'loud', muted: 'yes' }), { music: 0.6, sfx: 0.8, muted: false });
});

test('mute silences effects without losing the level', () => {
  assert.equal(effectiveSfx({ sfx: 0.5, muted: false }), 0.5);
  assert.equal(effectiveSfx({ sfx: 0.5, muted: true }), 0);
});

test('the shot climbs with the combo, an octave by x8', () => {
  const freqs = [1, 2, 4, 8].map(shotFreq);
  assert.equal(freqs[0], 520);
  assert.ok(near(freqs[3], 1040));
  for (let i = 1; i < 4; i++) assert.ok(freqs[i] > freqs[i - 1]);
  assert.ok(near(soundFor({ type: 'shot' }, 4)[0].freq, shotFreq(4)));
});

test('every spec event has a sound, and every voice is playable', () => {
  for (const type of EVENTS) {
    const voices = soundFor({ type }, 1);
    assert.ok(voices.length > 0, type);
    for (const v of voices) {
      assert.ok(v.kind === 'tone' || v.kind === 'noise', type);
      assert.ok(v.dur > 0 && v.vol > 0 && v.vol <= 1 && v.delay >= 0, type);
      if (v.kind === 'tone') assert.ok(v.freq > 0 && ['sine', 'square', 'sawtooth', 'triangle'].includes(v.type), type);
      else assert.ok(v.cutoff > 0, type);
    }
  }
});

test('a kill is a noise burst plus rising tones', () => {
  const voices = soundFor({ type: 'kill' });
  assert.equal(voices[0].kind, 'noise');
  const tones = voices.filter(v => v.kind === 'tone').map(v => v.freq);
  assert.deepEqual(tones, [...tones].sort((a, b) => a - b));
});

test('events without a sound play nothing', () => {
  assert.deepEqual(soundFor({ type: 'waveStart' }), []);
  assert.deepEqual(soundFor({ type: 'novaHit' }), []);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/sound.test.js`
Expected: FAIL بـ `ERR_MODULE_NOT_FOUND` لـ `js/sound.js`.

- [ ] **Step 3: اكتب التنفيذ**

```js
// js/sound.js
// Sound design as data: the voices each game event plays. audio.js turns them into Web Audio nodes.
// A voice is a tone {kind:'tone', freq, type, dur, vol, delay} or a noise burst {kind:'noise', dur, vol, delay, cutoff}.

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

const tone = (freq, type, dur, vol, delay = 0) => ({ kind: 'tone', freq, type, dur, vol, delay });
const noise = (dur, vol, delay = 0, cutoff = 2000) => ({ kind: 'noise', dur, vol, delay, cutoff });

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

- [ ] **Step 4: شغّله وتأكّد أنّه ينجح**

Run: `node --test tests/sound.test.js`
Expected: PASS، ٦ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/sound.js tests/sound.test.js
git commit -m "feat(arcade): add sound design for game events

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: نصوص الصوت

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
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/i18n.test.js`
Expected: FAIL في `sound panel strings`.

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
Expected: PASS، ٦ اختبارات.

- [ ] **Step 5: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "feat(arcade): add sound panel strings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: الإحساس والصوت في المتصفّح

**Files:**
- Create: `js/render/glow.js`, `js/audio.js`
- Modify: `js/render/enemies.js`, `js/render/ship.js`, `js/render/fx.js`, `js/render/starfield.js`, `js/main.js`, `index.html`, `css/base.css`
- Test: `tests/render.test.js`

**Interfaces:**
- `createGlow(dpr) → {sprite(key, radius, color, lineWidth, path), stamp(ctx, sprite, x, y, angle), clear()}`
- `createAudio(settings) → {unlock(), play(voices), apply(settings)}`
- `drawEnemy(ctx, glow, e, color, locked)`, `drawBoss(ctx, glow, boss, color, hpColor, dimColor, locked)`
- `SHIP_TURN_RATE`, `turnToward(current, target, maxStep)`, `drawShip(ctx, glow, ship, angle, color, flameColor, recoil, flicker)`
- `drawFx(ctx, feel, colors)`, `drawFlashes(ctx, feel, colors, width, height)`
- `nebulaColor(wave)`، و`starfield.draw(dt, colors, wave)`

- [ ] **Step 1: اكتب الاختبار الفاشل**

```js
// tests/render.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turnToward, aimAngle } from '../js/render/ship.js';
import { nebulaColor } from '../js/render/starfield.js';

const ship = { x: 400, y: 730 };
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('the ship turns toward its target at a limited rate, the short way', () => {
  assert.ok(near(turnToward(0, 1, 0.1), 0.1));
  assert.ok(near(turnToward(0, 0.05, 0.1), 0.05));
  assert.ok(near(turnToward(3, -3, 0.1), 3.1));
  assert.equal(aimAngle(ship, null), 0);
  assert.ok(near(aimAngle(ship, { x: 400, y: 0 }), 0));
});

test('the nebula changes colour with the wave and cycles', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 0].map(nebulaColor), ['purple', 'cyan', 'pink', 'green', 'purple', 'purple']);
});
```

- [ ] **Step 2: شغّله وتأكّد أنّه يفشل**

Run: `node --test tests/render.test.js`
Expected: FAIL — `turnToward` غير مُصدَّر من `js/render/ship.js`.

- [ ] **Step 3: التوهّج والأشكال والسفينة**

```js
// js/render/glow.js
// Glow sprites: each shape and colour is drawn once with shadowBlur on a hidden canvas, then stamped with drawImage.
// No shadowBlur inside the frame loop. The cache is cleared when the theme changes.
const PAD = 14;
const BLUR = 12;

export function createGlow(dpr = 1) {
  const cache = new Map();

  // path(g) builds the shape around (0, 0); radius bounds it.
  function sprite(key, radius, color, lineWidth, path) {
    const hit = cache.get(key);
    if (hit) return hit;
    const size = Math.ceil((radius + PAD) * 2);
    const canvas = document.createElement('canvas');
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.translate(size / 2, size / 2);
    g.strokeStyle = color;
    g.lineWidth = lineWidth;
    g.lineJoin = 'round';
    g.shadowColor = color;
    g.shadowBlur = BLUR;
    path(g);
    g.stroke();
    g.shadowBlur = 0;
    g.stroke();
    const made = { canvas, size };
    cache.set(key, made);
    return made;
  }

  function stamp(ctx, s, x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate(angle);
    ctx.drawImage(s.canvas, -s.size / 2, -s.size / 2, s.size, s.size);
    ctx.restore();
  }

  return { sprite, stamp, clear: () => cache.clear() };
}
```

```js
// js/render/enemies.js
// Enemy shapes as glow sprites: drone triangle, seeker diamond with a light trail, splitter hexagon,
// armored square with plates, missile arrow, and the boss with its hp bar.
const BOSS_RADIUS = 44;
const BAR_WIDTH = 120;
const BAR_HEIGHT = 5;
const TRAIL_PX = 26;

function polygon(g, sides, radius, rotation) {
  for (let i = 0; i < sides; i++) {
    const a = Math.PI / 2 + rotation + (i * 2 * Math.PI) / sides;
    const px = Math.cos(a) * radius;
    const py = Math.sin(a) * radius;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

const SHAPES = {
  drone: { radius: 12, path: g => { g.beginPath(); polygon(g, 3, 12, 0); } },
  seeker: { radius: 12, path: g => { g.beginPath(); polygon(g, 4, 12, 0); } },
  splitter: { radius: 12, path: g => { g.beginPath(); polygon(g, 6, 12, 0); } },
  armored: {
    radius: 16,
    path: g => {
      g.beginPath();
      polygon(g, 4, 16, Math.PI / 4);
      polygon(g, 4, 9, Math.PI / 4);
      g.moveTo(-11, 0); g.lineTo(11, 0);
    },
  },
  // An arrow pointing along +y; drawn rotated to its velocity.
  missile: {
    radius: 9,
    path: g => {
      g.beginPath();
      g.moveTo(0, 9); g.lineTo(6, 0); g.lineTo(2, 0); g.lineTo(2, -8);
      g.lineTo(-2, -8); g.lineTo(-2, 0); g.lineTo(-6, 0); g.closePath();
    },
  },
};

function bossPath(g) {
  g.beginPath();
  polygon(g, 6, BOSS_RADIUS, Math.PI / 6);
  polygon(g, 6, BOSS_RADIUS * 0.55, 0);
  g.moveTo(-BOSS_RADIUS, 0); g.lineTo(-BOSS_RADIUS * 1.7, -14);
  g.moveTo(BOSS_RADIUS, 0); g.lineTo(BOSS_RADIUS * 1.7, -14);
}

function drawTrail(ctx, e, color) {
  const len = Math.hypot(e.vx, e.vy) || 1;
  const tx = e.x - (e.vx / len) * TRAIL_PX;
  const ty = e.y - (e.vy / len) * TRAIL_PX;
  const grad = ctx.createLinearGradient(e.x, e.y, tx, ty);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(e.x, e.y);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.restore();
}

export function drawEnemy(ctx, glow, e, color, locked) {
  const shape = SHAPES[e.type];
  if (e.type === 'seeker') drawTrail(ctx, e, color);
  const s = glow.sprite(`${e.type}|${color}|${locked}`, shape.radius, color, locked ? 2.5 : 1.5, shape.path);
  const angle = e.type === 'missile' ? Math.atan2(e.vy, e.vx) - Math.PI / 2 : 0;
  glow.stamp(ctx, s, e.x, e.y, angle);
}

export function drawBoss(ctx, glow, boss, color, hpColor, dimColor, locked) {
  const s = glow.sprite(`boss|${color}|${locked}`, BOSS_RADIUS * 1.7, color, locked ? 3 : 2, bossPath);
  glow.stamp(ctx, s, boss.x, boss.y);
  const x = boss.x - BAR_WIDTH / 2;
  const y = boss.y - BOSS_RADIUS - 16;
  ctx.fillStyle = dimColor;
  ctx.fillRect(x, y, BAR_WIDTH, BAR_HEIGHT);
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, (BAR_WIDTH * boss.hp) / boss.maxHp, BAR_HEIGHT);
}
```

```js
// js/render/ship.js
// The player ship (a glow sprite), its flickering engine flame and the segmented hp ring.

export const SHIP_TURN_RATE = 8; // radians per second
const SHIP_RADIUS = 24;
const FLAME_BASE = 10;
const FLAME_FLICKER = 10;

export function aimAngle(ship, target) {
  return target ? Math.atan2(target.y - ship.y, target.x - ship.x) + Math.PI / 2 : 0;
}

// Turns at most maxStep radians, the short way round.
export function turnToward(current, target, maxStep) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + Math.max(-maxStep, Math.min(maxStep, diff));
}

function shipPath(g) {
  g.beginPath();
  g.moveTo(0, -22);
  g.lineTo(16, 16);
  g.lineTo(0, 8);
  g.lineTo(-16, 16);
  g.closePath();
}

// recoil pushes the ship back along its nose; flicker in [0, 1) sets the flame length.
export function drawShip(ctx, glow, ship, angle, color, flameColor, recoil, flicker) {
  const back = { x: -Math.sin(angle) * recoil, y: Math.cos(angle) * recoil };
  ctx.save();
  ctx.translate(ship.x + back.x, ship.y + back.y);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = flameColor;
  ctx.beginPath();
  ctx.moveTo(-6, 10);
  ctx.lineTo(0, 10 + FLAME_BASE + flicker * FLAME_FLICKER);
  ctx.lineTo(6, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  glow.stamp(ctx, glow.sprite(`ship|${color}`, SHIP_RADIUS, color, 2, shipPath), ship.x + back.x, ship.y + back.y, angle);
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

- [ ] **Step 4: المؤثّرات والنجوم والصوت**

```js
// js/render/fx.js
// Draws the feel state from js/feel.js: particles and bullets with 'lighter', zaps, rings,
// the muzzle flash, the red edge flash on damage and the white flash when a boss falls.
import { FEEL_TIMES } from '../feel.js';
import { withAlpha } from './color.js';

const BULLET_TRAIL = 0.35; // share of the path drawn behind the bullet

export function drawFx(ctx, f, colors) {
  const color = name => colors[name];

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of f.particles) {
    ctx.globalAlpha = p.life / p.max;
    ctx.fillStyle = color(p.color);
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.lineCap = 'round';
  for (const b of f.bullets) {
    const t = 1 - b.life / FEEL_TIMES.BULLET_SEC;
    const head = { x: b.x1 + (b.x2 - b.x1) * t, y: b.y1 + (b.y2 - b.y1) * t };
    const tail = Math.max(0, t - BULLET_TRAIL);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.cyan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x1 + (b.x2 - b.x1) * tail, b.y1 + (b.y2 - b.y1) * tail);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  for (const z of f.zaps) {
    ctx.globalAlpha = z.life / FEEL_TIMES.ZAP_SEC;
    ctx.strokeStyle = colors.purple;
    ctx.beginPath();
    ctx.moveTo(z.x1, z.y1);
    ctx.lineTo(z.x2, z.y2);
    ctx.stroke();
  }
  if (f.muzzle > 0 && f.muzzleAt) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(f.muzzleAt.x, f.muzzleAt.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  for (const r of f.rings) {
    const p = 1 - r.life / FEEL_TIMES.RING_SEC;
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = color(r.color);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 10 + p * r.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

// Full-screen flashes, drawn last and without the shake offset.
export function drawFlashes(ctx, f, colors, width, height) {
  if (f.hurt > 0) {
    const a = 0.55 * (f.hurt / FEEL_TIMES.HURT_SEC);
    const grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, withAlpha(colors.pink, a));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  if (f.white > 0) {
    ctx.fillStyle = `rgba(255,255,255,${0.6 * (f.white / FEEL_TIMES.WHITE_SEC)})`;
    ctx.fillRect(0, 0, width, height);
  }
}
```

```js
// js/render/starfield.js
// Three star layers at different speeds for depth, over a nebula whose colour moves with the wave.
import { withAlpha } from './color.js';

const LAYERS = [
  { count: 80, speed: 8,  size: 1,   alpha: 0.35 },
  { count: 50, speed: 20, size: 1.5, alpha: 0.6 },
  { count: 20, speed: 45, size: 2,   alpha: 0.9 },
];
const NEBULA = ['purple', 'cyan', 'pink', 'green'];
const NEBULA_ALPHA = 0.16;

export function nebulaColor(wave) {
  return NEBULA[(Math.max(1, wave) - 1) % NEBULA.length];
}

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

  function draw(dt, colors, wave) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.max(w, h) * 0.7);
    glow.addColorStop(0, withAlpha(colors[nebulaColor(wave)], NEBULA_ALPHA));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
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
// js/audio.js
// Web Audio output for the voices in sound.js. The context starts on the first key or click,
// because browsers refuse to start audio before a user gesture. Until then every call is a no-op.
import { effectiveSfx } from './sound.js';

const ATTACK = 0.005;
const SILENT = 0.0001;
const NOISE_SEC = 1;

function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_SEC, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function createAudio(settings) {
  let ctx = null;
  let sfx = null;
  let noiseBuffer = null;

  function unlock() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    ctx = new AudioContext();
    sfx = ctx.createGain();
    sfx.gain.value = effectiveSfx(settings);
    sfx.connect(ctx.destination);
    noiseBuffer = makeNoise(ctx);
  }

  function envelope(gain, t, vol, dur) {
    gain.gain.setValueAtTime(SILENT, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + ATTACK);
    gain.gain.exponentialRampToValueAtTime(SILENT, t + dur);
  }

  function playTone(freq, type, dur, vol, delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    envelope(gain, t, vol, dur);
    osc.connect(gain).connect(sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function playNoise(dur, vol, delay, cutoff) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const gain = ctx.createGain();
    envelope(gain, t, vol, dur);
    src.connect(filter).connect(gain).connect(sfx);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  function play(voices) {
    if (!ctx || effectiveSfx(settings) === 0) return;
    for (const v of voices) {
      if (v.kind === 'tone') playTone(v.freq, v.type, v.dur, v.vol, v.delay);
      else playNoise(v.dur, v.vol, v.delay, v.cutoff);
    }
  }

  function apply(next) {
    settings = next;
    if (sfx) sfx.gain.value = effectiveSfx(settings);
  }

  return { unlock, play, apply };
}
```

- [ ] **Step 5: الهيكل والتنسيق والربط** — استبدل `index.html` و`css/base.css` و`js/main.js`:

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
      <button id="btn-sound" class="btn-secondary" data-i18n="sound"></button>
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
  25% { margin-left: -4px; color: var(--neon-pink); background: rgba(255, 45, 120, 0.25); }
  75% { margin-left: 4px; color: var(--neon-pink); }
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

/* Feel. The combo is placed with transform, so the pulse grows the font instead of scaling. */
#hud-combo.pulse { animation: combo-pulse 0.25s ease-out; }
@keyframes combo-pulse {
  from { font-size: 28px; filter: brightness(1.8); }
  to { font-size: 18px; filter: none; }
}

/* Sound panel */
.sound-panel { display: flex; flex-direction: column; gap: 14px; }
.sound-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.sound-row input { accent-color: var(--neon-cyan); }
.sound-row input[type="range"] { width: 180px; }

/* No shake or flash for players who ask for less motion. */
@media (prefers-reduced-motion: reduce) {
  .label.miss, #hud-combo.pulse { animation: none; }
}
```

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
  const range = document.createElement('input');
  range.type = 'range';
  range.id = 'sound-sfx';
  range.min = '0';
  range.max = '100';
  range.value = String(Math.round(audioPrefs.sfx * 100));
  range.addEventListener('input', () => setAudio({ ...audioPrefs, sfx: Number(range.value) / 100 }));
  range.addEventListener('change', () => {
    audio.play(soundFor({ type: 'pick' }));
    range.blur();
  });
  const muteRow = cell('label', t(lang, 'mute'), 'sound-row');
  muteRow.prepend(mute);
  const sfxRow = cell('label', t(lang, 'effects'), 'sound-row');
  sfxRow.append(range);
  box.append(muteRow, sfxRow);
  return box;
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

- [ ] **Step 6: فحص الصياغة والاختبارات**

Run: `for f in js/main.js js/audio.js js/render/*.js; do node --input-type=module --check < $f; done`
Expected: لا مخرجات.

Run: `node --test 'tests/*.test.js'`
Expected: PASS، ١٢٦ اختباراً، `fail 0`.

- [ ] **Step 7: Commit**

```bash
git add js/render/glow.js js/audio.js js/render/enemies.js js/render/ship.js js/render/fx.js js/render/starfield.js js/main.js index.html css/base.css tests/render.test.js
git commit -m "feat(arcade): add glow, particles, shake, hitstop and sound effects

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: التحقّق في المتصفّح

بـ Playwright + Chromium على `python3 -m http.server 3737`، مقاس 1280×800. قبل تحميل الصفحة يُلفّ `AudioContext` بسكربت يعدّ السياقات والنغمات (`createOscillator`) والضجيج (`createBufferSource`)، لأنّ الصوت لا يُسمع هنا. امسح `localStorage` أوّلاً.

- [ ] **Step 1: الصوت**
  1. قبل أيّ ضغطة. Expected: لا سياق صوت.
  2. `Enter`. Expected: سياق واحد.
  3. اكتب كلمة. Expected: نغمات تزيد (طلقة لكلّ حرف + نغمات القتل) وضجيج واحد على الأقلّ.
  4. حرف خاطئ، وانتظر إطاراً (١٠٠ مللي ثانية). Expected: نغمة واحدة.
- [ ] **Step 2: الإحساس**
  1. اكتب كلمة وراقب `#labels` في نفس اللحظة. Expected: `transform` غير فارغ خلال ٣٠٠ مللي ثانية (هزّة القتل).
  2. ثلاث كلمات أخرى. Expected: كومبو بصنف `pulse`، والسفينة بلون أدفأ، ولقطة شاشة.
  3. انتظر ضربة على السفينة. Expected: هزّة، ولقطة شاشة.
- [ ] **Step 3: لوحة الصوت**
  1. `Esc` ثمّ `R` ثمّ «Sound». Expected: صفّا «Mute» و«Effects».
  2. انقر «Mute». Expected: `ws_audio` = `{"music":0.6,"sfx":0.8,"muted":true}`.
  3. جولة جديدة وكلمة. Expected: لا نغمات ولا ضجيج جديد.
- [ ] **Step 4: تقليل الحركة** — سياق Playwright بـ `reducedMotion: 'reduce'`: اقتل كلمة والعب ٤٥ ثانية. Expected: `#labels` بلا `transform` طوال الوقت، و`animation-name` للكومبو = `none`.
- [ ] **Step 5: لا أخطاء في الـ console** في كلّ ما سبق.

لا commit لهذه المهمّة. النتائج وما لم يُتحقَّق منه في وصف الـPR.

---

## ما بعد هذه الخطّة

| الخطّة | مراحل المواصفة |
|-------|---------------|
| ٥ب | الموسيقى (المرحلة ٨)، بعد أن يسمع مو المؤثّرات |
| ٦ | الجوّال + الانتقال (المرحلتان ٩ و١٠) |
