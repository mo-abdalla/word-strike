// js/game.js
// One run: spawning, movement, collisions, kills. Pure logic; the browser layer drains run.events.
import { waveConfig, pickEnemyType, tierForType, pickWord } from './waves.js';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from './enemies.js';
import { handleChar, releaseLock } from './targeting.js';
import { registerKill, registerMiss } from './scoring.js';

export const START_HP = 5;
const SPAWN_MARGIN = 60;
const SPAWN_Y = -20;
const SHIP_OFFSET = 70;
const REFERENCE_HEIGHT = 800;
const WPM_WINDOW_SEC = 10;

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
    mods: { magnet: 0, shortCircuit: 0 },
    events: [],
  };
}

export function resize(run, width, height) {
  run.width = width;
  run.height = height;
  run.ship.x = width / 2;
  run.ship.y = height - SHIP_OFFSET;
}

export function startWave(run, n) {
  run.wave = n;
  run.cfg = waveConfig(n);
  run.toSpawn = run.cfg.count;
  run.spawnTimer = 0;
  run.waveCleared = false;
  run.events.push({ type: 'waveStart', wave: n });
}

const alive = run => run.enemies.filter(e => !e.dead);
const onScreenWords = run => alive(run).map(e => e.word);

function spawnEnemy(run) {
  const type = pickEnemyType(run.wave, run.rand);
  const tier = tierForType(type, run.wave, run.rand);
  const word = pickWord(run.words[tier], onScreenWords(run), run.rand);
  const x = SPAWN_MARGIN + run.rand() * (run.width - 2 * SPAWN_MARGIN);
  const speed = run.cfg.baseSpeed * ENEMY_TYPES[type].speedMul * (run.height / REFERENCE_HEIGHT);
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

function kill(run, e) {
  e.dead = true;
  releaseLock(run);
  run.kills += 1;
  const points = registerKill(run, e.word.length);
  run.events.push({ type: 'kill', id: e.id, x: e.x, y: e.y, enemyType: e.type, points });
  if (e.type === 'splitter' && !run.mods.shortCircuit) {
    const taken = onScreenWords(run);
    const w1 = pickWord(run.words[1], taken, run.rand);
    const w2 = pickWord(run.words[1], [...taken, w1], run.rand);
    run.enemies.push(...splitChildren(e, [w1, w2], [run.nextId++, run.nextId++], run.ship));
  }
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

  for (const e of run.enemies) {
    if (e.dead) continue;
    updateEnemy(e, dt, run.ship);
    if (reachedShip(e, run.ship)) hurt(run, e);
    if (run.over) break;
  }
  run.enemies = run.enemies.filter(e => !e.dead);

  if (!run.over && !run.waveCleared && run.toSpawn === 0 && run.enemies.length === 0) {
    run.waveCleared = true;
    run.events.push({ type: 'waveClear', wave: run.wave });
  }
}

export function onChar(run, key) {
  if (run.over || run.waveCleared) return;
  run.totalKeys += 1;
  const res = handleChar(run, key);
  if (res.kind === 'miss') {
    registerMiss(run);
    run.events.push({ type: 'miss', id: res.enemy ? res.enemy.id : null });
    return;
  }
  run.correctKeys += 1;
  run.samples.push({ t: run.time, chars: 1 });
  run.events.push({ type: 'shot', id: res.enemy.id, x: res.enemy.x, y: res.enemy.y });
  if (res.kind === 'kill') kill(run, res.enemy);
}

export function onBackspace(run) {
  releaseLock(run);
}
