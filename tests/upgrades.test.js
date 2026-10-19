// tests/upgrades.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UPGRADES, drawUpgrades, applyUpgrade, availableUpgrades, stacksOf } from '../js/upgrades.js';
import { createRun, START_HP } from '../js/game.js';

const WORDS = { 1: ['ab'], 2: ['abcd'], 3: ['abcdef'], 4: ['abcdefgh'], 5: ['abcdefghijk'] };

function runAtWave(wave) {
  const run = createRun({ lang: 'en', words: WORDS, width: 800, height: 800 });
  run.wave = wave;
  return run;
}

const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

test('twelve upgrades, each named and described in both languages', () => {
  assert.equal(UPGRADES.length, 12);
  for (const u of UPGRADES) {
    for (const lang of ['en', 'ar']) assert.ok(u.name[lang] && u.desc[lang], `${u.id} ${lang}`);
  }
});

test('draws three different cards', () => {
  for (let i = 0; i < 200; i++) {
    const ids = drawUpgrades(runAtWave(5)).map(u => u.id);
    assert.equal(ids.length, 3);
    assert.equal(new Set(ids).size, 3);
  }
});

test('rarity roll follows the weights', () => {
  assert.equal(drawUpgrades(runAtWave(5), () => 0)[0].rarity, 'common');
  assert.equal(drawUpgrades(runAtWave(5), () => 0.7)[0].rarity, 'rare');
  assert.equal(drawUpgrades(runAtWave(5), seq(0.95, 0))[0].rarity, 'epic');
});

test('no epic before wave 3', () => {
  for (let i = 0; i < 200; i++) {
    assert.ok(drawUpgrades(runAtWave(2)).every(u => u.rarity !== 'epic'));
  }
  assert.ok(availableUpgrades(runAtWave(3)).some(u => u.rarity === 'epic'));
});

test('a maxed upgrade is not drawn', () => {
  const run = runAtWave(5);
  applyUpgrade(run, 'focus');
  for (let i = 0; i < 200; i++) assert.ok(drawUpgrades(run).every(u => u.id !== 'focus'));
  applyUpgrade(run, 'magnet');
  applyUpgrade(run, 'magnet');
  assert.equal(stacksOf(run, 'magnet'), 2);
  assert.ok(availableUpgrades(run).some(u => u.id === 'magnet'));
  applyUpgrade(run, 'magnet');
  assert.ok(!availableUpgrades(run).some(u => u.id === 'magnet'));
});

test('repair is offered alone when everything else is maxed', () => {
  const run = runAtWave(5);
  for (const u of UPGRADES) {
    if (u.id === 'repair') continue;
    for (let i = 0; i < u.maxStacks; i++) applyUpgrade(run, u.id);
  }
  assert.deepEqual(drawUpgrades(run).map(u => u.id), ['repair']);
});

test('shield and repair change hp', () => {
  const run = runAtWave(1);
  applyUpgrade(run, 'shield');
  assert.deepEqual([run.hp, run.maxHp], [START_HP + 1, START_HP + 1]);
  run.hp = 1;
  applyUpgrade(run, 'repair');
  assert.equal(run.hp, run.maxHp);
});

test('every other upgrade bumps its mod and is recorded', () => {
  const mods = {
    slow_field: 'slowField', focus: 'focus', combo_guard: 'comboGuard', chain: 'chain',
    turret: 'turret', pulse: 'pulse', magnet: 'magnet', short_circuit: 'shortCircuit',
    overdrive: 'overdrive', nova: 'nova',
  };
  for (const [id, mod] of Object.entries(mods)) {
    const run = runAtWave(1);
    applyUpgrade(run, id);
    assert.equal(run.mods[mod], 1, id);
    assert.deepEqual(run.picked, [id]);
  }
});
