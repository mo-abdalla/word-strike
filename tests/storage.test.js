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
