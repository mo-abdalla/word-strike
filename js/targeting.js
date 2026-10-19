// js/targeting.js
// Lock-on and letter matching. Matching is strict: the key must equal the next letter exactly.

export function findTarget(enemies, key) {
  let best = null;
  for (const e of enemies) {
    if (e.dead || e.word[e.typed] !== key) continue;
    if (!best || e.y > best.y) best = e;
  }
  return best;
}

export function lockedEnemy(run) {
  if (run.lockId === null) return null;
  const e = run.enemies.find(x => x.id === run.lockId);
  if (!e || e.dead) {
    run.lockId = null;
    return null;
  }
  return e;
}

export function handleChar(run, key) {
  let e = lockedEnemy(run);
  if (!e) {
    e = findTarget(run.enemies, key);
    if (!e) return { kind: 'miss', enemy: null };
    run.lockId = e.id;
  } else if (e.word[e.typed] !== key) {
    return { kind: 'miss', enemy: e };
  }
  e.typed += 1;
  return { kind: e.typed === e.word.length ? 'kill' : 'hit', enemy: e };
}

export function releaseLock(run) {
  run.lockId = null;
}
