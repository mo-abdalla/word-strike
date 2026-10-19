// js/main.js
// Wires logic, rendering, input and screens together.
import { createPhaseMachine } from './state.js';
import { createRun, resize as resizeRun, startWave, update, onChar, onBackspace } from './game.js';
import { wordsFor } from './words.js';
import { accuracy, finalWpm } from './scoring.js';
import { applyStrings, t } from './i18n.js';
import { load, save } from './storage.js';
import { startLoop } from './loop.js';
import { attachInput } from './input.js';
import { createStarfield } from './render/starfield.js';
import { drawShip, drawHpRing, aimAngle } from './render/ship.js';
import { drawEnemy } from './render/enemies.js';
import { createFx } from './render/fx.js';
import { createLabels } from './render/labels.js';

const BANNER_SEC = 1.5;
const HIGH_SCORE_KEY = 'ws_hs';

const $ = id => document.getElementById(id);
const gameCanvas = $('game');
const gctx = gameCanvas.getContext('2d');
const starfield = createStarfield($('bg'));
const labels = createLabels($('labels'));
const fx = createFx();

let lang = 'en';
let run = null;
let width = 0;
let height = 0;
let bannerTimer = 0;
let nextWaveTimer = 0;
let best = load(HIGH_SCORE_KEY, 0);
let colors = readColors();

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
  $('hud').hidden = !(next === 'playing' || next === 'paused');
  if (next === 'menu') {
    labels.clear();
    run = null;
    $('wave-banner').hidden = true;
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
}

function showBanner(text) {
  const banner = $('wave-banner');
  banner.textContent = text;
  banner.hidden = false;
  bannerTimer = BANNER_SEC;
}

function newRun() {
  labels.clear();
  nextWaveTimer = 0;
  run = createRun({ lang, words: wordsFor(lang), width, height });
  startWave(run, 1);
  showBanner(t(lang, 'waveBanner', 1));
  phase.set('playing');
}

function endRun() {
  if (run.score > best) {
    best = run.score;
    save(HIGH_SCORE_KEY, best);
  }
  $('final-score').textContent = run.score.toLocaleString('en');
  $('final-wave').textContent = run.wave;
  $('final-wpm').textContent = finalWpm(run.correctKeys, run.time);
  $('final-acc').textContent = `${Math.round(accuracy(run.correctKeys, run.totalKeys) * 100)}%`;
  $('final-combo').textContent = `×${run.maxCombo}`;
  phase.set('gameover');
}

function drainEvents() {
  for (const ev of run.events) {
    if (ev.type === 'shot') fx.beam(run.ship, ev);
    else if (ev.type === 'kill' || ev.type === 'hurt') fx.burst(ev.x, ev.y);
    else if (ev.type === 'miss' && ev.id !== null) labels.flashMiss(ev.id);
    else if (ev.type === 'waveClear') {
      showBanner(t(lang, 'waveClear', ev.wave));
      nextWaveTimer = BANNER_SEC;
    } else if (ev.type === 'gameOver') endRun();
  }
  run.events.length = 0;
}

function drawRun() {
  const locked = run.enemies.find(e => e.id === run.lockId && !e.dead) || null;
  for (const e of run.enemies) {
    if (!e.dead) drawEnemy(gctx, e, e === locked ? colors.cyan : colors.pink, e === locked);
  }
  drawShip(gctx, run.ship, aimAngle(run.ship, locked), colors.cyan);
  drawHpRing(gctx, run.ship, run.hp, run.maxHp, colors.cyan, colors.dim);
  labels.sync(run.enemies, run.lockId, run.lang);

  $('hud-score').textContent = run.score.toLocaleString('en');
  $('hud-wave').textContent = run.wave;
  $('hud-best').textContent = Math.max(best, run.score).toLocaleString('en');
  const combo = $('hud-combo');
  combo.textContent = run.combo > 1 ? `×${run.combo}` : '';
  combo.style.transform = `translate(${run.ship.x + 48}px, ${run.ship.y - 12}px)`;
}

function frame(dt) {
  starfield.draw(dt, colors);
  gctx.clearRect(0, 0, width, height);
  const playing = phase.get() === 'playing';

  if (playing && bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) $('wave-banner').hidden = true;
  }
  if (run && playing) {
    update(run, dt);
    if (nextWaveTimer > 0) {
      nextWaveTimer -= dt;
      if (nextWaveTimer <= 0) {
        startWave(run, run.wave + 1);
        showBanner(t(lang, 'waveBanner', run.wave));
      }
    }
    drainEvents();
  }

  fx.update(playing ? dt : 0);
  if (run) drawRun();
  fx.draw(gctx, colors);
}

function handleKey(key) {
  const p = phase.get();
  if (p === 'menu') {
    if (key === 'Enter') newRun();
  } else if (p === 'playing') {
    if (key === 'Escape') phase.set('paused');
    else if (key === 'Backspace') onBackspace(run);
    else if (key !== 'Enter' && key !== ' ') onChar(run, key);
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
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
window.addEventListener('blur', () => { if (phase.get() === 'playing') phase.set('paused'); });
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);

attachInput(handleKey);
resize();
setLang('en');
startLoop(frame);
