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
