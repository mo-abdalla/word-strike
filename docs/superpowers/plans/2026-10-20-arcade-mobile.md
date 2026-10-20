# Word Strike Arcade — الخطّة ٦: الجوّال والانتقال

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (أ) لعبة الأركيد قابلة للعب على الجوّال بنسخة أبسط. (ب) بعد موافقة مو المنفصلة: `index.html` يصبح اللعبة الحيّة على Vercel، ويُحذف القديم، وتُحدَّث الوثائق.

**Architecture:** وحدتان منطقيّتان جديدتان بلا `document`: `js/layout.js` (المقاسات والحدود بحسب الشاشة) و`js/mobile-input.js` (تحويل أحداث الحقل المخفيّ إلى مفاتيح). `input.js` يجمع المسارين ويستدعي `handleKey` نفسه. الرسم يقرأ `run.scale`.

**Tech Stack:** كالخطط السابقة. Node v22 في السحابة. Playwright + Chromium للتحقّق.

**Spec:** `docs/superpowers/specs/2026-10-19-arcade-redesign-design.md` — المرحلتان ٩ و١٠ من القسم ١٢ (القسم ٤-١ «الإدخال»، والقسم ٦ «الجوّال»، والقسم ١١ «النشر والانتقال»).

**الفرع:** `claude/project-thread-1mr4ls` من `master` (بعد دمج PR #6). الجزء (ب) PR منفصل يُفتح بعد دمج (أ).

## Global Constraints

- كلّ قيود الخطط ١–٥ب سارية: لا مكتبات، `import` نسبيّ بـ `.js`، وحدات المنطق بلا `document`.
- قيود الجوّال الموثّقة في `CLAUDE.md` سارية حرفيّاً:
  - `focus()` على الحقل المخفيّ **متزامن** داخل حدث المستخدم. لا `setTimeout`.
  - `font-size: 16px` على الحقل (يمنع تكبير iOS).
  - الحقل داخل الشاشة (`top:0; left:0`, 1×1, `opacity:0`).
  - ارتفاع الساحة من `visualViewport.height` فقط.
- `typing-game.html` لا يُلمس في الجزء (أ).
- كلّ commit يترك اللعبة تعمل. أمر الاختبارات: `node --test 'tests/*.test.js'`.
- لا push ولا PR ولا دمج قبل سؤال مو.

## قرارات ليست في المواصفة

1. **حدّ الجوّال:** `width ≤ 520` أو جهاز لمس بعرض ≤ ٨٠٠. اللمس وحده لا يكفي (أجهزة لوحيّة بكيبورد).
2. **المقياس:** `scale = clamp(height / 800, 0.6, 1)` على الجوّال فقط، و١ على الحاسوب. يطبَّق على نصف قطر السفينة والأعداء والزعيم، ومسافة السفينة من الأسفل، ونصف قطر الاصطدام، وخطّ الأسماء (`--label-scale`).
3. **الجزيئات:** الحدّ ٢٠٠ على الجوّال (المواصفة)، و٤٠٠ على الحاسوب كما هو.
4. **الإدخال على الجوّال:** `beforeinput` بدل `input`، لأنّه يعطي `inputType`:
   - `insertText` / `insertCompositionText` ← كلّ حرف في `data` مفتاح مستقلّ (الإكمال التلقائيّ قد يرسل كلمة كاملة).
   - `deleteContentBackward` ← `Backspace` (فكّ القفل). الحقل يبقى فيه حرف حارس واحد كي يعمل الحذف دائماً.
   - `insertLineBreak` / `Enter` في `keydown` ← `Enter` (نوفا).
   - المسافة تُتجاهل كما في الحاسوب.
   - الحقل نفسه `autocapitalize=off autocorrect=off autocomplete=off spellcheck=false enterkeyhint=go`.
5. **`input.js` يستثني `#mobile-input`** من قاعدة «الحقول النصّيّة لا تصل للعبة»، وإلّا ضاع `Enter` و`Esc` منه.
6. **متى يُفتح الكيبورد:** عند `newRun`، والاستئناف، واختيار ترقية بالنقر، وكلّها داخل حدث نقر. يُغلق (`blur`) عند الإيقاف والترقية والنهاية والقائمة.
7. **تلميح «انقر للكتابة»:** `#tap-hint` يظهر إن فقد الحقل التركيز أثناء `playing`. النقر عليه أو على الساحة يعيد التركيز. نصّه في `i18n` (`tapToType`).
8. **زرّ إيقاف للّمس:** لا `Esc` على الجوّال، فيُضاف `#btn-pause` صغير أعلى الزاوية (يظهر في `playing` على الجوّال فقط).
9. **HUD الجوّال:** النقاط والموجة فقط (المواصفة). «الأفضل» يُخفى.
10. **بطاقات الترقية عموديّة** على الجوّال، وتُختار بالنقر. أرقام المفاتيح تُخفى.
11. **فقدان تركيز النافذة** يبقى يُوقف اللعبة. إخفاء الكيبورد ليس فقداناً للنافذة، فلا يُوقفها.

## تعديلات أثناء التنفيذ

- **الإدخال بالفرق بدل `beforeinput`:** كيبورد أندرويد يركّب الكلمة (`c` ثمّ `ca` ثمّ `cat`)، و`beforeinput` في التركيب لا يُلغى ويعيد الكلمة كلّها. لذلك `keysFromChange(prev, next)` تقارن قيمة الحقل قبل وبعد: الحروف الجديدة مفاتيح، والمحذوف `Backspace`. الحقل يُفرَّغ إلى الحرف الحارس بعد كلّ إدخال خارج التركيب، وعند `compositionend`.
- **حدّ أدنى لخطّ الأسماء:** `labelScale = max(0.85, scale)`. عند ٠٫٦ صار الخطّ ٩ بكسل، صعب القراءة.
- **موقع «انقر للكتابة»:** فوق السفينة (`bottom: 150px`) لا تحتها، كي لا يغطّيها.

## خارج هذه الخطّة

- مطابقة متساهلة لأشكال الألف (خارج النطاق في المواصفة).
- وضع أفقيّ مخصّص للجوّال: يعمل بالمقياس نفسه، ولا تخطيط خاصّ.

## خريطة الملفّات

| الملفّ | التغيير |
|-------|--------|
| `js/layout.js` | جديد: `layoutFor({width, height, touch})` ← `{compact, scale, particleCap, shipOffset}` |
| `js/mobile-input.js` | جديد: `keysFromBeforeInput(inputType, data)` ← قائمة مفاتيح |
| `js/input.js` | تعديل: الحقل المخفيّ، `focusMobile()` / `blurMobile()` |
| `js/game.js` | تعديل: `run.scale`، و`shipOffset` من التخطيط في `createRun` و`resize` |
| `js/enemies.js` | تعديل: نصف قطر الاصطدام × `scale` |
| `js/render/ship.js`, `js/render/enemies.js` | تعديل: معامل `scale` اختياريّ (افتراضيّ ١) |
| `js/main.js` | تعديل: التخطيط، التركيز، التلميح، زرّ الإيقاف، `cap` الجزيئات |
| `js/i18n.js` | تعديل: `tapToType`، `pause` |
| `index.html` | تعديل: `#mobile-input`، `#tap-hint`، `#btn-pause` |
| `css/base.css` | تعديل: `@media (max-width: 520px)` + `--label-scale` |
| `tests/layout.test.js`, `tests/mobile-input.test.js` | جديد |
| `tests/i18n.test.js`, `tests/game.test.js` | تعديل |

---

## الجزء (أ): الجوّال

### Task 1: التخطيط كبيانات (`js/layout.js`)

- [ ] اختبار أوّلاً `tests/layout.test.js`:
  - ١٢٨٠×٨٠٠ بلا لمس ← `compact: false, scale: 1, particleCap: 400`.
  - ٣٧٥×٨١٢ لمس ← `compact: true, scale ≈ 1, particleCap: 200`.
  - ٣٧٥×٥٦٠ ← `scale = 0.7`. ٣٧٥×٤٠٠ (الكيبورد مفتوح) ← ٠٫٥ يُقصّ إلى الحدّ الأدنى `0.6`.
  - ٧٦٨×١٠٢٤ لمس ← `compact: true`. ١٠٢٤×٧٦٨ لمس ← `compact: false`.
  - `shipOffset = round(70 × scale)`.
- [ ] التنفيذ:

```js
// js/layout.js
// Sizes that depend on the screen. Desktop keeps today's numbers; phones scale by the play-area height.
const COMPACT_WIDTH = 520;
const TOUCH_COMPACT_WIDTH = 800;
const REFERENCE_HEIGHT = 800;
const MIN_SCALE = 0.6;
const SHIP_OFFSET = 70;

export function layoutFor({ width, height, touch = false }) {
  const compact = width <= COMPACT_WIDTH || (touch && width <= TOUCH_COMPACT_WIDTH);
  const scale = compact ? Math.min(1, Math.max(MIN_SCALE, height / REFERENCE_HEIGHT)) : 1;
  return { compact, scale, particleCap: compact ? 200 : 400, shipOffset: Math.round(SHIP_OFFSET * scale) };
}
```

- [ ] commit: `feat(arcade): add screen layout rules for phones`

### Task 2: المقياس في المنطق والرسم

- [ ] اختبار في `tests/game.test.js`: `createRun({..., scale: 0.6})` ← `run.ship.y = height - 42`، وعدوّ على بعد ٢٠ بكسل يصطدم (٢٨×٠٫٦ = ١٦٫٨ ← لا يصطدم؛ على بعد ١٥ ← يصطدم). `scale` غائب ← السلوك الحاليّ حرفيّاً (الاختبارات القديمة تمرّ بلا تعديل).
- [ ] `game.js`: `createRun` و`resize` يأخذان `scale` (افتراضيّ ١) ويخزّنانه في `run.scale`، و`SHIP_OFFSET × scale`.
- [ ] `enemies.js`: `hitsShip(e, ship, scale = 1)` ← `SHIP_RADIUS * scale`.
- [ ] `render/ship.js` و`render/enemies.js`: آخر معامل `scale = 1`، يضرب الأنصاف والأطوال (السفينة، اللهب، الأعداء، الزعيم، شريط حياته). `glow` يخبّئ بالمقياس ضمن المفتاح.
- [ ] `labels.js` لا يتغيّر. الإزاحة والخطّ عبر `--label-scale` في CSS.
- [ ] commit: `feat(arcade): scale the ship, enemies and hit radius with the play area`

### Task 3: إدخال الجوّال

- [ ] اختبار أوّلاً `tests/mobile-input.test.js` لـ `keysFromBeforeInput`:
  - `('insertText', 'a')` ← `['a']`. `('insertText', 'cat')` ← `['c','a','t']`.
  - `('insertText', ' ')` ← `[]`. `('insertText', 'ب')` ← `['ب']`.
  - `('deleteContentBackward', null)` ← `['Backspace']`.
  - `('insertLineBreak', null)` ← `['Enter']`.
  - أيّ نوع آخر ← `[]`.
- [ ] `index.html`: `<input id="mobile-input" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" aria-hidden="true">`.
- [ ] `css`: الحقل `position:fixed; top:0; left:0; width:1px; height:1px; opacity:0; font-size:16px`.
- [ ] `input.js`: `attachInput(handleKey, mobileEl)`:
  - `keydown` يستثني `mobileEl` من قاعدة الحقول، ويمرّر `Enter`/`Escape` منه. الحروف منه تأتي من `beforeinput` فقط (لا مضاعفة).
  - `beforeinput` على `mobileEl`: `preventDefault()`، ثمّ كلّ مفتاح من `keysFromBeforeInput` ← `handleKey`. الحقل يُبقى على حرف حارس واحد.
  - يعيد `{ focusMobile, blurMobile }`. `focusMobile` لا يفعل شيئاً على الحاسوب (`compact` = false).
- [ ] commit: `feat(arcade): add phone keyboard input through a hidden field`

### Task 4: الواجهات على الجوّال

- [ ] `i18n.js`: `tapToType` (Tap to type / انقر للكتابة)، `pause` (Pause / إيقاف). تحديث `tests/i18n.test.js`.
- [ ] `index.html`: `#tap-hint` (z-index ٦) و`#btn-pause` داخل `#hud`.
- [ ] `main.js`:
  - `resize()` يحسب `layout = layoutFor({ width, height, touch })` ويمرّر `scale` للـrun، ويضع `--label-scale` و`body.compact`.
  - `newRun()` يُنشئ `feel` بـ `cap: layout.particleCap`.
  - `focusMobile()` مباشرة داخل: `btn-start`، `btn-resume`، `btn-again`، النقر على بطاقة ترقية، `#tap-hint`، النقر على الساحة في `playing`.
  - `blurMobile()` في `onChange` للمراحل `paused` / `upgradePick` / `gameover` / `menu`.
  - `blur` على الحقل أثناء `playing` ← يظهر `#tap-hint`. `focus` ← يختفي.
  - `#btn-pause` ← `phase.set('paused')`.
  - تمرير `run.scale` لدوالّ الرسم.
- [ ] `css/base.css` داخل `@media (max-width: 520px)` و`body.compact`:
  - `.hud-best` مخفيّ. خطّ الـHUD أصغر.
  - `.cards { flex-direction: column }`، بطاقات بعرض كامل وارتفاع أقلّ، `.card-key` مخفيّ.
  - `kbd` مخفيّ في الأزرار.
  - `.label { font-size: calc(15px * var(--label-scale)) }` ومثله للعربيّة والزعيم.
  - القائمة والنهاية تلتفّ وتقبل التمرير العموديّ إن ضاقت.
- [ ] commit: `feat(arcade): fit the screens, hud and upgrade cards to phones`

### Task 5: التحقّق في المتصفّح

Playwright + Chromium على `python3 -m http.server 3737`. مقاسان: ١٢٨٠×٨٠٠ (حاسوب) و٣٧٥×٨١٢ بـ `hasTouch` و`isMobile` (جوّال). لقطة شاشة لكلّ خطوة.

- [ ] **الحاسوب لم يتغيّر:** جولة بالكيبورد حتى الموجة ٣، ولقطات مقارنة مع `master` قبل التغيير. Expected: نفس المقاسات، `#mobile-input` لا يأخذ التركيز.
- [ ] **الجوّال، القائمة:** كلّ الأزرار ظاهرة بلا تمرير أفقيّ، بالإنجليزيّة والعربيّة.
- [ ] **الجوّال، اللعب:** النقر على «ابدأ» ← `document.activeElement` هو `#mobile-input`. حروف عبر `insertText` تقتل الأعداء. `deleteContentBackward` يفكّ القفل. HUD فيه النقاط والموجة فقط. السفينة أصغر عند ارتفاع ٤٠٠ (محاكاة كيبورد مفتوح بتصغير النافذة).
- [ ] **الجوّال، التلميح:** `blur` للحقل ← يظهر «انقر للكتابة». نقره ← يختفي والتركيز عاد.
- [ ] **الجوّال، الترقية:** البطاقات عموديّة، والنقر يختار.
- [ ] **الجوّال، الإيقاف:** `#btn-pause` ← شاشة الإيقاف، والحقل فقد التركيز.
- [ ] **العربيّة على الجوّال:** الأسماء متّصلة الحروف، والواجهة معكوسة.
- [ ] **لا أخطاء في الـconsole.**

**لا يمكن التحقّق منه هنا:** ظهور كيبورد iOS/Android الفعليّ، و`visualViewport` الحقيقيّ مع الكيبورد. يجرّبه مو على هاتفه من رابط معاينة Vercel للفرع (إن كانت المعاينات مفعّلة) أو بعد الدمج.

لا commit لهذه المهمّة. النتائج وما لم يُتحقَّق منه في وصف الـPR.

---

## الجزء (ب): الانتقال — يحتاج موافقة مو المنفصلة

يبدأ بعد دمج (أ) وتجربة مو على الهاتف. **هذا الجزء يغيّر الموقع الحيّ:** Vercel يعيد النشر من `master`، والزوّار يرون اللعبة الجديدة بدل القديمة.

### Task 6: عرض الفرق قبل أيّ حذف

- [ ] عرض ما سيتغيّر على مو والانتظار:
  - حذف `typing-game.html`.
  - حذف `vercel.json` (لا يحوي إلّا قاعدة إعادة التوجيه) ← Vercel يخدم `index.html` افتراضيّاً.
  - إعادة كتابة `README.md` و`CLAUDE.md` للبنية الجديدة.
  - سؤال مو عن `TODO.md` (يصف ميزات اللعبة القديمة): يُحذف أم يُستبدل بقائمة الأركيد؟

### Task 7: الحذف وتحديث الوثائق

- [ ] حذف الملفّين بعد الموافقة.
- [ ] `CLAUDE.md`: البنية الجديدة (الوحدات، `state.phase`، الحلقة الواحدة، الطبقات، المفاتيح، الجوّال، الصوت والموسيقى، مفاتيح التخزين، أمر الاختبارات). تصحيح: `Node` متوفّر، وحذف مسار `gh.exe` القديم. الإبقاء على قيود الجوّال والعربيّة الموثّقة.
- [ ] `README.md`: وصف اللعبة الجديدة، التشغيل المحلّيّ، الاختبارات.
- [ ] `.superpowers/` موجود في `.gitignore` مسبقاً (لا تغيير).
- [ ] commit: `chore: make the arcade the live game and retire the old file`

### Task 8: التحقّق

- [ ] `python3 -m http.server 3737` ← `/` يفتح الأركيد. `/typing-game.html` ← 404.
- [ ] كلّ الاختبارات تمرّ.
- [ ] بعد الدمج: فتح رابط Vercel الحيّ والتأكّد من الأركيد (يتحقّق مو أو أنا إن كان الرابط معروفاً).

---

## ما بعد هذه الخطّة

كلّ مراحل المواصفة الـ١٠ مكتملة. ما يبقى أفكار جديدة تحتاج مواصفة.
