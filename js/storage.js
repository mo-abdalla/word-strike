// js/storage.js
// localStorage wrapper. Some browsers throw on access in private mode,
// so reads fall back and writes are skipped instead of crashing the game.

export function load(key, fallback, store = globalThis.localStorage) {
  try {
    const raw = store.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value, store = globalThis.localStorage) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: progress is simply not persisted.
  }
}
