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
