# Word Strike — خطة التحسينات

مهام التحسين مقسّمة إلى: (1) السريعة عالية الأثر، ثم (2) فكرة خارج الصندوق.
علامة ✓ = مكتمل. تعليق بين قوسين = ملاحظة/مشكلة.

## المرحلة الأولى — أفكار سريعة عالية الأثر

- [x] 1. نظام الثيمات (Themes): زر تبديل في الـHUD + 4 ثيمات (Cyber/Synth/Matrix/Vapor) + حفظ في localStorage
      ✓ مطبّق عبر `applyTheme()`/`cycleTheme()` و`THEMES` + زر `#btn-theme`. كل الألوان تتبع متغيرات `--neon-*` فأُعيد تلوين الواجهة تلقائياً.
- [x] 2. نظام الإنجازات (Achievements): 8 إنجازات + حفظ + بانر احتفالي `#ach-banner` + عرض شرائح في شاشة النهاية `#ach-list`
      ✓ مطبّق: first_blood / century / combo8 / level10 / flawless / perfect / speedster / boss_slayer. حُفظت في `ws_ach` + `ws_words_total`.
- [x] 3. بطاقة المشاركة (Share Card): توليد صورة canvas 600×800 بنتيجة اللعبة + زر مشاركة (Web Share API) وتنزيل
      ✓ مطبّق: `buildShareCard()`/`showShareCard()`/`shareShareCard()`/`downloadShareCard()` + معاينة `#share-preview`.

## المرحلة الثانية — فكرة خارج الصندوق

- [x] 4. معارك الزعماء (Boss Fights): زعيم ثابت في المستوى 5 و10 بشريط حياة `#boss-bar` + مؤقّت 45ث + انفجار متعدد + مكافأة نقاط
      ✓ مطبّق: `startBoss()`/`endBoss()`/`updateBossBar()`/`isBossLevel()`. البلاطة بسرعة 0 فلا تتحرك؛ المؤقّت يتجمّد عند الإيقاف المؤقت (`_pauseLeft`).

## ملاحظات ما بعد التنفيذ

- [x] تحديث CLAUDE.md بمخطط الأنماط الجديدة (حقول state: boss/bossActive/levelErrors/levelWords + طبقات z-index جديدة 14 و18 + دورة الحياة)
- [~] اختبار يدوي في المتصفح مُستحسن (لا يتوفّر متصفح هنا؛ تم التحقق عبر `node --check` + مراجعة منطقية).
      ملاحظة: تأكد من (أ) ظهور الزعيم عند بلوغ المستوى 5، (ب) تبديل الثيمات يُعيد تلوين الكيبورد والجزيئات، (ج) زر المشاركة ينتج صورة صحيحة (خاصة بالعربية RTL).
