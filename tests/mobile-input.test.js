// tests/mobile-input.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keysFromChange } from '../js/mobile-input.js';

const S = '​';

test('a typed letter is one key', () => {
  assert.deepEqual(keysFromChange(S, `${S}a`), ['a']);
  assert.deepEqual(keysFromChange(S, `${S}ب`), ['ب']);
});

test('a composing keyboard only adds the new letter each time', () => {
  assert.deepEqual(keysFromChange(`${S}c`, `${S}ca`), ['a']);
  assert.deepEqual(keysFromChange(`${S}ca`, `${S}cat`), ['t']);
});

test('an autocompleted word becomes one key per letter', () => {
  assert.deepEqual(keysFromChange(S, `${S}cat`), ['c', 'a', 't']);
});

test('spaces are ignored', () => {
  assert.deepEqual(keysFromChange(S, `${S} `), []);
  assert.deepEqual(keysFromChange(S, `${S}a b`), ['a', 'b']);
});

test('removed characters are Backspace', () => {
  assert.deepEqual(keysFromChange(S, ''), ['Backspace']);
  assert.deepEqual(keysFromChange(`${S}ca`, `${S}c`), ['Backspace']);
});

test('no change gives no keys', () => {
  assert.deepEqual(keysFromChange(S, S), []);
});
