// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace, triggerNova } from './game.js';
import { drawUpgrades, applyUpgrade, upgradeById } from './upgrades.js';
import { isBossWave } from './waves.js';
import { wordsFor } from './words.js';
import { accuracy, finalWpm } from './scoring.js';
import { applyStrings, t } from './i18n.js';
import { load, save } from './storage.js';
import { startLoop } from './loop.js';
import { attachInput } from './input.js';
import { createStarfield } from './render/starfield.js';
import { drawShip, drawHpRing, aimAngle, turnToward, SHIP_TURN_RATE } from './render/ship.js';
import { drawEnemy, drawBoss } from './render/enemies.js';
import { drawFx, drawFlashes } from './render/fx.js';
import { createGlow } from './render/glow.js';
import { heatColor } from './render/color.js';
import { createFeel, feelEvent, updateFeel, shakeOffset } from './feel.js';
import { AUDIO_KEY, audioSettings, soundFor } from './sound.js';
import { createAudio } from './audio.js';
import { createLabels } from './render/labels.js';
import { createCards } from './render/cards.js';
import { THEME_KEY, THEMES, themeIndex, applyTheme } from './meta/themes.js';
import { ACH_KEY, WORDS_TOTAL_KEY, ACHIEVEMENTS, achievementById, unlockedFrom, newAchievements } from './meta/achievements.js';
import { LEADERBOARD_KEY, cleanRecords, mergeBoard, qualifies, makeRecord, addRecord } from './meta/leaderboard.js';
import { drawShareCard, shareCard } from './meta/share.js';

const BANNER_SEC = 1.5;
const PICK_FLASH_SEC = 0.35;
const HIGH_SCORE_KEY = 'ws_hs';
const BEST_WAVE_KEY = 'ws_best_wave';
const TOAST_SEC = 3;

const $ = id => document.getElementById(id);
const gameCanvas = $('game');
const gctx = gameCanvas.getContext('2d');
const starfield = createStarfield($('bg'));
const labels = createLabels($('labels'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const glow = createGlow(window.devicePixelRatio || 1);
let feel = createFeel({ reducedMotion });
let shipAngle = 0;
let lastCombo = 1;
let audioPrefs = audioSettings(load(AUDIO_KEY, null));
const audio = createAudio(audioPrefs);
const cards = createCards($('upgrade-cards'), pickUpgrade);

let lang = 'en';
let run = null;
let width = 0;
let height = 0;
let bannerTimer = 0;
let offered = [];
let pickedIndex = -1;
let pickTimer = 0;
let best = load(HIGH_SCORE_KEY, 0);
let bestWave = load(BEST_WAVE_KEY, 0);
let theme = themeIndex(load(THEME_KEY, 0));
applyTheme(document.documentElement, theme);
let colors = readColors();

let unlocked = unlockedFrom(load(ACH_KEY, {}));
let wordsBefore = Number(load(WORDS_TOTAL_KEY, 0)) || 0;
let runAch = [];
const toastQueue = [];
let toastTimer = 0;

let globalBoard = [];
let localBoard = cleanRecords(load(LEADERBOARD_KEY, []));
let result = null;
let savedRecord = null;
let panel = null;
const shareCanvas = document.createElement('canvas');

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = name => cs.getPropertyValue(name).trim();
  return {
    bg: v('--bg'), text: v('--text'), dim: v('--dim'),
    cyan: v('--neon-cyan'), green: v('--neon-green'), pink: v('--neon-pink'),
    yellow: v('--neon-yellow'), purple: v('--neon-purple'),
  };
}

const phase = createPhaseMachine(next => {
  $('screen-menu').hidden = next !== 'menu';
  $('screen-pause').hidden = next !== 'paused';
  $('screen-gameover').hidden = next !== 'gameover';
  $('screen-upgrade').hidden = next !== 'upgradePick';
  $('hud').hidden = !(next === 'playing' || next === 'paused' || next === 'upgradePick');
  if (next === 'gameover') labels.clear();
  if (next === 'menu') {
    labels.clear();
    run = null;
    $('wave-banner').hidden = true;
    renderBestLine();
  }
});

function resize() {
  width = window.innerWidth;
  height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  starfield.resize(width, height, dpr);
  gameCanvas.width = width * dpr;
  gameCanvas.height = height * dpr;
  gameCanvas.style.width = `${width}px`;
  gameCanvas.style.height = `${height}px`;
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (run) resizeRun(run, width, height);
}

function setLang(next) {
  lang = next;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyStrings(document, lang);
  $('record-name').placeholder = t(lang, 'enterName');
  renderBestLine();
}

function renderBestLine() {
  $('best-line').textContent = t(lang, 'bestLine', best.toLocaleString('en'), bestWave);
}

function cycleTheme() {
  theme = themeIndex(theme + 1);
  save(THEME_KEY, theme);
  applyTheme(document.documentElement, theme);
  colors = readColors();
  glow.clear();
  $('theme-name').textContent = THEMES[theme].name;
}

// --- Sound settings ---

function setAudio(next) {
  audioPrefs = next;
  audio.apply(next);
  save(AUDIO_KEY, next);
}

function soundPanel() {
  const box = cell('div', '', 'sound-panel');
  const mute = document.createElement('input');
  mute.type = 'checkbox';
  mute.id = 'sound-mute';
  mute.checked = audioPrefs.muted;
  mute.addEventListener('change', () => {
    setAudio({ ...audioPrefs, muted: mute.checked });
    mute.blur();
  });
  const range = document.createElement('input');
  range.type = 'range';
  range.id = 'sound-sfx';
  range.min = '0';
  range.max = '100';
  range.value = String(Math.round(audioPrefs.sfx * 100));
  range.addEventListener('input', () => setAudio({ ...audioPrefs, sfx: Number(range.value) / 100 }));
  range.addEventListener('change', () => {
    audio.play(soundFor({ type: 'pick' }));
    range.blur();
  });
  const muteRow = cell('label', t(lang, 'mute'), 'sound-row');
  muteRow.prepend(mute);
  const sfxRow = cell('label', t(lang, 'effects'), 'sound-row');
  sfxRow.append(range);
  box.append(muteRow, sfxRow);
  return box;
}

// --- Achievements ---

function checkAchievements() {
  const ids = newAchievements(run, wordsBefore, unlocked);
  if (!ids.length) return;
  for (const id of ids) {
    unlocked[id] = true;
    runAch.push(id);
    toastQueue.push(id);
  }
  save(ACH_KEY, unlocked);
}

function showNextToast() {
  const a = achievementById(toastQueue.shift());
  $('ach-toast-icon').textContent = a.icon;
  $('ach-toast-name').textContent = a.name[lang];
  $('ach-toast').hidden = false;
  toastTimer = TOAST_SEC;
}

function updateToast(dt) {
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) $('ach-toast').hidden = true;
  }
  if (toastTimer <= 0 && toastQueue.length) showNextToast();
}

// --- Panels over the menu ---

function cell(tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

// Board rows are copies, so the record saved this session is found by its fields.
function isSaved(r) {
  return savedRecord !== null && r.name === savedRecord.name && r.score === savedRecord.score && r.date === savedRecord.date;
}

function boardTable() {
  const board = mergeBoard(globalBoard, localBoard);
  if (!board.length) return cell('p', t(lang, 'noScores'), 'empty');
  const table = document.createElement('table');
  table.className = 'board';
  const head = document.createElement('tr');
  for (const h of ['#', t(lang, 'name'), t(lang, 'score'), t(lang, 'wave'), t(lang, 'wpm')]) head.append(cell('th', h));
  table.append(head);
  board.forEach((r, i) => {
    const row = document.createElement('tr');
    if (isSaved(r)) row.className = 'mine';
    row.append(
      cell('td', String(i + 1)),
      cell('td', String(r.name || '???'), 'name'),
      cell('td', r.score.toLocaleString('en')),
      cell('td', r.wave ? String(r.wave) : '—'),
      cell('td', String(Number(r.wpm) || 0)),
    );
    table.append(row);
  });
  return table;
}

function achievementList() {
  const list = document.createElement('div');
  for (const a of ACHIEVEMENTS) {
    const row = cell('div', '', unlocked[a.id] ? 'ach-row' : 'ach-row locked');
    row.append(cell('span', a.icon, 'ach-icon'), cell('span', a.name[lang]));
    list.append(row);
  }
  return list;
}

function openPanel(kind) {
  panel = kind;
  $('panel-title').textContent = t(lang, kind);
  const body = { leaderboard: boardTable, achievements: achievementList, sound: soundPanel }[kind];
  $('panel-body').replaceChildren(body());
  $('panel').hidden = false;
}

function closePanel() {
  panel = null;
  $('panel').hidden = true;
}

// --- Game over ---

function chipRow(container, title, chips) {
  container.replaceChildren(cell('span', title, 'chips-label'), ...chips.map(text => cell('span', text, 'chip')));
  container.hidden = chips.length === 0;
}

function saveRecord(e) {
  e.preventDefault();
  savedRecord = makeRecord({
    name: $('record-name').value, score: result.score, wave: result.wave, wpm: result.wpm,
    lang, date: new Date().toISOString().slice(0, 10),
  });
  localBoard = addRecord(localBoard, savedRecord);
  save(LEADERBOARD_KEY, localBoard);
  $('record-form').hidden = true;
}

function shareResult() {
  drawShareCard(shareCanvas, result, colors, {
    lang,
    sub: t(lang, 'yourRun'),
    labels: {
      score: t(lang, 'score'), wave: t(lang, 'wave'), wpm: t(lang, 'wpm'),
      accuracy: t(lang, 'accuracy'), maxCombo: t(lang, 'maxCombo'),
    },
    font: getComputedStyle(document.body).fontFamily,
  });
  shareCard(shareCanvas);
}

function showBanner(text) {
  const banner = $('wave-banner');
  banner.textContent = text;
  banner.hidden = false;
  bannerTimer = BANNER_SEC;
}

function waveBanner(n) {
  return isBossWave(n) ? t(lang, 'bossBanner', n) : t(lang, 'waveBanner', n);
}

function newRun() {
  labels.clear();
  runAch = [];
  feel = createFeel({ reducedMotion });
  shipAngle = 0;
  lastCombo = 1;
  run = createRun({ lang, words: wordsFor(lang), width, height });
  startWave(run, 1);
  showBanner(waveBanner(1));
  phase.set('playing');
}

function endRun() {
  checkAchievements();
  wordsBefore += run.kills;
  save(WORDS_TOTAL_KEY, wordsBefore);

  const isRecord = run.score > best;
  if (isRecord) {
    best = run.score;
    save(HIGH_SCORE_KEY, best);
  }
  if (run.wave > bestWave) {
    bestWave = run.wave;
    save(BEST_WAVE_KEY, bestWave);
  }

  const icons = run.picked.map(id => upgradeById(id).icon);
  result = {
    score: run.score, wave: run.wave, wpm: finalWpm(run.correctKeys, run.time),
    acc: Math.round(accuracy(run.correctKeys, run.totalKeys) * 100), maxCombo: run.maxCombo, icons,
  };
  $('final-score').textContent = result.score.toLocaleString('en');
  $('new-record').hidden = !isRecord;
  $('final-wave').textContent = result.wave;
  $('final-wpm').textContent = result.wpm;
  $('final-acc').textContent = `${result.acc}%`;
  $('final-combo').textContent = `×${result.maxCombo}`;
  chipRow($('final-upgrades'), t(lang, 'upgradesTaken'), icons);
  chipRow($('final-ach'), t(lang, 'newAchievements'),
    runAch.map(id => { const a = achievementById(id); return `${a.icon} ${a.name[lang]}`; }));

  savedRecord = null;
  const form = $('record-form');
  form.hidden = !qualifies(result.score, mergeBoard(globalBoard, localBoard));
  phase.set('gameover');
  if (!form.hidden) {
    $('record-name').value = '';
    $('record-name').focus();
  }
}

function openUpgrades() {
  offered = drawUpgrades(run);
  pickedIndex = -1;
  $('upgrade-title').textContent = isBossWave(run.wave) ? t(lang, 'bossDown') : t(lang, 'waveClear', run.wave);
  cards.show(offered, lang, rarity => t(lang, rarity));
  phase.set('upgradePick');
}

function pickUpgrade(index) {
  if (phase.get() !== 'upgradePick' || pickedIndex !== -1 || index >= offered.length) return;
  pickedIndex = index;
  pickTimer = PICK_FLASH_SEC;
  cards.flash(index);
  audio.play(soundFor({ type: 'pick' }));
}

function finishPick() {
  applyUpgrade(run, offered[pickedIndex].id);
  startWave(run, run.wave + 1);
  showBanner(waveBanner(run.wave));
  phase.set('playing');
}

function drainEvents() {
  for (const ev of run.events) {
    feelEvent(feel, ev, run.ship);
    audio.play(soundFor(ev, run.combo));
    if (ev.type === 'miss' && ev.id !== null) labels.flashMiss(ev.id);
    else if (ev.type === 'waveClear') openUpgrades();
    else if (ev.type === 'gameOver') endRun();
  }
  run.events.length = 0;
}

function drawRun(dt) {
  const locked = run.enemies.find(e => e.id === run.lockId && !e.dead) || null;
  for (const e of run.enemies) {
    if (e.dead) continue;
    if (e.type === 'boss') drawBoss(gctx, glow, e, e === locked ? colors.cyan : colors.yellow, colors.pink, colors.dim, e === locked);
    else drawEnemy(gctx, glow, e, e === locked ? colors.cyan : colors.pink, e === locked);
  }
  shipAngle = turnToward(shipAngle, aimAngle(run.ship, locked), SHIP_TURN_RATE * dt);
  drawShip(gctx, glow, run.ship, shipAngle, heatColor(run.combo, colors.cyan, colors.yellow), colors.yellow, feel.recoil, Math.random());
  drawHpRing(gctx, run.ship, run.hp, run.maxHp, colors.cyan, colors.dim);
  labels.sync(run.enemies, run.lockId, run.lang);

  $('hud-score').textContent = run.score.toLocaleString('en');
  $('hud-wave').textContent = run.wave;
  $('hud-best').textContent = Math.max(best, run.score).toLocaleString('en');
  const combo = $('hud-combo');
  combo.textContent = run.combo > 1 ? `×${run.combo}` : '';
  if (run.combo > lastCombo) {
    combo.classList.remove('pulse');
    void combo.offsetWidth; // restart the animation
    combo.classList.add('pulse');
  }
  lastCombo = run.combo;
  combo.style.transform = `translate(${run.ship.x + 48}px, ${run.ship.y - 12}px)`;
  const nova = $('hud-nova');
  nova.hidden = !run.novaReady;
  nova.style.transform = `translate(${run.ship.x - 64}px, ${run.ship.y - 12}px)`;
}

function frame(dt) {
  starfield.draw(dt, colors, run ? run.wave : 1);
  gctx.clearRect(0, 0, width, height);
  const p = phase.get();
  const playing = p === 'playing';
  updateFeel(feel, p === 'paused' ? 0 : dt);

  if (playing && bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('wave-banner').hidden = true;
  }
  // Hitstop: a kill holds the game logic for a few frames; effects keep moving.
  if (run && playing && feel.hitstop === 0) {
    update(run, dt);
    drainEvents();
    if (phase.get() !== 'gameover') checkAchievements();
  }
  updateToast(dt);
  if (p === 'upgradePick' && pickedIndex !== -1) {
    pickTimer -= dt;
    if (pickTimer <= 0) finishPick();
  }

  const shake = shakeOffset(feel);
  $('labels').style.transform = shake.x || shake.y ? `translate(${shake.x}px, ${shake.y}px)` : '';
  gctx.save();
  gctx.translate(shake.x, shake.y);
  // Read the phase again: a game over raised during this frame must not redraw the labels just cleared.
  if (run && phase.get() !== 'gameover') drawRun(dt);
  drawFx(gctx, feel, colors);
  gctx.restore();
  drawFlashes(gctx, feel, colors, width, height);
}

function handleKey(key) {
  const p = phase.get();
  if (panel) {
    if (key === 'Escape') closePanel();
  } else if (p === 'menu') {
    if (key === 'Enter') newRun();
  } else if (p === 'playing') {
    if (key === 'Escape') phase.set('paused');
    else if (key === 'Backspace') onBackspace(run);
    else if (key === 'Enter') triggerNova(run);
    else if (key !== ' ') onChar(run, key);
  } else if (p === 'upgradePick') {
    if (key === '1' || key === '2' || key === '3') pickUpgrade(Number(key) - 1);
  } else if (p === 'paused') {
    if (key === 'Escape' || key === 'Enter') phase.set('playing');
    else if (key === 'r' || key === 'R') phase.set('menu');
  } else if (p === 'gameover') {
    if (key === 'Enter') newRun();
    else if (key === 'r' || key === 'R') phase.set('menu');
  }
}

$('btn-start').addEventListener('click', newRun);
$('btn-resume').addEventListener('click', () => phase.set('playing'));
$('btn-pause-menu').addEventListener('click', () => phase.set('menu'));
$('btn-again').addEventListener('click', newRun);
$('btn-over-menu').addEventListener('click', () => phase.set('menu'));
$('btn-share').addEventListener('click', shareResult);
$('record-form').addEventListener('submit', saveRecord);
$('btn-leaderboard').addEventListener('click', () => openPanel('leaderboard'));
$('btn-achievements').addEventListener('click', () => openPanel('achievements'));
$('btn-panel-close').addEventListener('click', closePanel);
$('btn-theme').addEventListener('click', cycleTheme);
$('btn-sound').addEventListener('click', () => openPanel('sound'));
// Audio may only start inside a user gesture.
document.addEventListener('pointerdown', () => audio.unlock());
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

// The static board is optional: offline or opened from disk, only local results show.
fetch('leaderboard.json')
  .then(r => (r.ok ? r.json() : []))
  .then(data => { globalBoard = cleanRecords(data); })
  .catch(() => { globalBoard = []; });

attachInput(key => {
  audio.unlock();
  handleKey(key);
});
resize();
setLang('en');
$('theme-name').textContent = THEMES[theme].name;
startLoop(frame);
