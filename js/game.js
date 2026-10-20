// js/game.js
// One run: spawning, movement, collisions, kills, upgrade effects and boss waves.
// Pure logic; the browser layer drains run.events. Effects read run.mods only.
import { waveConfig, pickEnemyType, tierForType, pickWord, isBossWave } from './waves.js';
import { ENEMY_TYPES, createEnemy, updateEnemy, reachedShip, splitChildren } from './enemies.js';
import { handleChar, lockedEnemy, releaseLock } from './targeting.js';
import { registerKill, registerAssistKill, registerMiss } from './scoring.js';
import { BOSS_Y, BOSS_REWARD, MISSILE_SPEED_MUL, bossHp, fireInterval, bossWordTier, missileLetters, missileSpawn } from './boss.js';

export const START_HP = 5;
const SPAWN_MARGIN = 60;
const SPAWN_Y = -20;
const SHIP_OFFSET = 70;
const REFERENCE_HEIGHT = 800;
const WPM_WINDOW_SEC = 10;
const SLOW_ZONE = 2 / 3;
const SLOW_STEP = 0.2;
const CHAIN_MIN_COMBO = 4;
const TURRET_SEC = 10;
const PULSE_EVERY = 15;
const PULSE_SEC = 2;
const OVERDRIVE_WPM = 60;

export function createMods() {
  return {
    magnet: 0, shortCircuit: 0, slowField: 0, focus: 0, comboGuard: 0,
    chain: 0, turret: 0, pulse: 0, overdrive: 0, nova: 0,
  };
}

// scale shrinks the ship and its hit radius on small screens (see layout.js); 1 on desktop.
export function createRun({ lang, words, width, height, rand = Math.random, scale = 1 }) {
  return {
    lang, words, rand, width, height, scale,
    ship: { x: width / 2, y: height - Math.round(SHIP_OFFSET * scale) },
    hp: START_HP, maxHp: START_HP,
    score: 0, streak: 0, combo: 1, maxCombo: 1,
    correctKeys: 0, totalKeys: 0, kills: 0,
    time: 0, samples: [],
    enemies: [], nextId: 1, lockId: null,
    wave: 0, toSpawn: 0, spawnTimer: 0, cfg: null,
    waveCleared: false, over: false,
    mods: createMods(), picked: [],
    guardsLeft: 0, novaReady: false, turretTimer: 0, pulseKills: 0, freezeTimer: 0,
    waveMisses: 0, wavesCleared: 0, flawlessWaves: 0, bossKills: 0,
    events: [],
  };
}

export function resize(run, width, height, scale = run.scale) {
  run.width = width;
  run.height = height;
  run.scale = scale;
  run.ship.x = width / 2;
  run.ship.y = height - Math.round(SHIP_OFFSET * scale);
  const boss = bossOf(run);
  if (boss) boss.x = width / 2;
}

const turretInterval = run => (run.mods.turret ? TURRET_SEC / run.mods.turret : 0);

export function startWave(run, n) {
  run.wave = n;
  run.cfg = waveConfig(n);
  run.toSpawn = run.cfg.count;
  run.spawnTimer = 0;
  run.waveCleared = false;
  run.guardsLeft = run.mods.comboGuard;
  run.novaReady = run.mods.nova > 0;
  run.turretTimer = turretInterval(run);
  run.freezeTimer = 0;
  run.waveMisses = 0;
  run.events.push({ type: 'waveStart', wave: n });
  if (isBossWave(n)) {
    run.toSpawn = 0;
    spawnBoss(run);
  }
}

const alive = run => run.enemies.filter(e => !e.dead);
const onScreenWords = run => alive(run).map(e => e.word);
const bossOf = run => run.enemies.find(e => e.type === 'boss' && !e.dead) || null;

function speedFor(run, mul) {
  return run.cfg.baseSpeed * mul * (run.height / REFERENCE_HEIGHT);
}

function spawnBoss(run) {
  const hp = bossHp(run.wave);
  const word = pickWord(run.words[bossWordTier(run.rand)], onScreenWords(run), run.rand);
  const boss = createEnemy({ id: run.nextId++, type: 'boss', word, x: run.width / 2, y: BOSS_Y, speed: 0, target: run.ship });
  run.enemies.push(Object.assign(boss, { hp, maxHp: hp, fireTimer: fireInterval(run.wave) }));
  run.events.push({ type: 'bossSpawn', x: boss.x, y: boss.y });
}

function fireMissile(run, boss) {
  const letter = pickWord(missileLetters(run.words), onScreenWords(run), run.rand);
  const { x, y } = missileSpawn(boss);
  const speed = speedFor(run, MISSILE_SPEED_MUL);
  run.enemies.push(createEnemy({ id: run.nextId++, type: 'missile', word: letter, x, y, speed, target: run.ship }));
}

function bossFire(run, dt, frozen) {
  const boss = bossOf(run);
  if (!boss || frozen) return;
  boss.fireTimer -= dt;
  if (boss.fireTimer > 0) return;
  fireMissile(run, boss);
  boss.fireTimer = fireInterval(run.wave);
}

function spawnEnemy(run) {
  const type = pickEnemyType(run.wave, run.rand);
  const tier = tierForType(type, run.wave, run.rand);
  const word = pickWord(run.words[tier], onScreenWords(run), run.rand);
  const x = SPAWN_MARGIN + run.rand() * (run.width - 2 * SPAWN_MARGIN);
  const speed = speedFor(run, ENEMY_TYPES[type].speedMul);
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

function countKill(run) {
  run.kills += 1;
  if (!run.mods.pulse) return;
  run.pulseKills += 1;
  if (run.pulseKills >= PULSE_EVERY) {
    run.pulseKills = 0;
    run.freezeTimer = PULSE_SEC;
    run.events.push({ type: 'pulse' });
  }
}

function destroy(run, e, points) {
  e.dead = true;
  if (run.lockId === e.id) releaseLock(run);
  run.events.push({ type: 'kill', id: e.id, x: e.x, y: e.y, enemyType: e.type, points });
  if (e.type === 'splitter' && !run.mods.shortCircuit) {
    const taken = onScreenWords(run);
    const w1 = pickWord(run.words[1], taken, run.rand);
    const w2 = pickWord(run.words[1], [...taken, w1], run.rand);
    run.enemies.push(...splitChildren(e, [w1, w2], [run.nextId++, run.nextId++], run.ship));
  }
  countKill(run);
}

// A finished boss word costs it one hp. At zero it falls, its missiles with it.
function hitBoss(run, boss, points) {
  if (run.lockId === boss.id) releaseLock(run);
  boss.hp -= 1;
  run.events.push({ type: 'bossHit', id: boss.id, x: boss.x, y: boss.y, points, hp: boss.hp });
  if (boss.hp > 0) {
    boss.word = pickWord(run.words[bossWordTier(run.rand)], onScreenWords(run), run.rand);
    boss.typed = 0;
  } else {
    boss.dead = true;
    run.score += BOSS_REWARD * boss.maxHp;
    for (const m of alive(run)) {
      m.dead = true;
      run.events.push({ type: 'pop', x: m.x, y: m.y });
    }
    releaseLock(run);
    run.bossKills += 1;
    run.events.push({ type: 'bossDown', x: boss.x, y: boss.y, points: BOSS_REWARD * boss.maxHp });
  }
  countKill(run);
}

// Every way a word can be finished ends here: typing, chain or turret.
function finishWord(run, e, points) {
  if (e.type === 'boss') hitBoss(run, e, points);
  else destroy(run, e, points);
}

// Upgrades remove letters as if typed. Finishing the word kills at the current combo.
function strip(run, e, letters) {
  e.typed = Math.min(e.word.length, e.typed + letters);
  if (e.typed === e.word.length) finishWord(run, e, registerAssistKill(run, e.word.length));
}

function closestToShip(run) {
  let best = null;
  for (const e of alive(run)) if (!best || e.y > best.y) best = e;
  return best;
}

// Speed of the final lock on this word: letters typed since locking, over the time since locking.
function wordWpm(e, now) {
  const minutes = (now - e.lockAt) / 60;
  return minutes > 0 ? e.lockChars / 5 / minutes : Infinity;
}

function kill(run, e) {
  const clean = e.lockMisses === 0 && wordWpm(e, run.time) >= OVERDRIVE_WPM;
  const points = registerKill(run, e.word.length, run.mods.overdrive && clean ? 2 : 1);
  finishWord(run, e, points);
  if (run.mods.chain && run.combo >= CHAIN_MIN_COMBO) {
    const target = closestToShip(run);
    if (target) {
      run.events.push({ type: 'zap', from: { x: e.x, y: e.y }, to: { x: target.x, y: target.y } });
      strip(run, target, run.mods.chain);
    }
  }
}

function fireTurret(run, dt) {
  if (!run.mods.turret) return;
  run.turretTimer -= dt;
  if (run.turretTimer > 0) return;
  const targets = alive(run).filter(e => e.id !== run.lockId);
  if (!targets.length) return;
  const e = targets[Math.floor(run.rand() * targets.length)];
  run.events.push({ type: 'zap', from: { x: run.ship.x, y: run.ship.y }, to: { x: e.x, y: e.y } });
  strip(run, e, 1);
  run.turretTimer = turretInterval(run);
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

  fireTurret(run, dt);

  const frozen = run.freezeTimer > 0;
  run.freezeTimer = Math.max(0, run.freezeTimer - dt);
  bossFire(run, dt, frozen);
  const slow = 1 - SLOW_STEP * run.mods.slowField;
  for (const e of run.enemies) {
    if (e.dead || frozen) continue;
    if (run.mods.focus && e.id === run.lockId) continue;
    updateEnemy(e, e.y > run.height * SLOW_ZONE ? dt * slow : dt, run.ship);
    if (reachedShip(e, run.ship, run.scale)) hurt(run, e);
    if (run.over) break;
  }
  run.enemies = run.enemies.filter(e => !e.dead);

  if (!run.over && !run.waveCleared && run.toSpawn === 0 && run.enemies.length === 0) {
    run.waveCleared = true;
    run.wavesCleared += 1;
    if (run.waveMisses === 0) run.flawlessWaves += 1;
    run.events.push({ type: 'waveClear', wave: run.wave });
  }
}

export function onChar(run, key) {
  if (run.over || run.waveCleared) return;
  run.totalKeys += 1;
  const before = lockedEnemy(run);
  const res = handleChar(run, key);
  if (res.kind === 'miss') {
    run.waveMisses += 1;
    if (res.enemy) res.enemy.lockMisses += 1;
    if (run.guardsLeft > 0) run.guardsLeft -= 1;
    else registerMiss(run);
    run.events.push({ type: 'miss', id: res.enemy ? res.enemy.id : null });
    return;
  }
  const e = res.enemy;
  if (e !== before) {
    e.lockAt = run.time;
    e.lockChars = 0;
    e.lockMisses = 0;
  }
  e.lockChars += 1;
  run.correctKeys += 1;
  run.samples.push({ t: run.time, chars: 1 });
  run.events.push({ type: 'shot', id: e.id, x: e.x, y: e.y });
  if (res.kind === 'kill') kill(run, e);
}

export function onBackspace(run) {
  releaseLock(run);
}

// Nova: wipes every enemy on screen except the boss, once per wave. No points, no kills, no splitting.
export function triggerNova(run) {
  if (!run.novaReady || run.over || run.waveCleared) return;
  run.novaReady = false;
  releaseLock(run);
  for (const e of alive(run)) {
    if (e.type === 'boss') continue;
    e.dead = true;
    run.events.push({ type: 'novaHit', x: e.x, y: e.y });
  }
  run.events.push({ type: 'nova' });
}
