// js/render/labels.js
// Enemy words as DOM elements so Arabic letters shape and join correctly.
const LABEL_OFFSET_Y = 22;
const BOSS_LABEL_OFFSET_Y = 58;

export function createLabels(container) {
  const nodes = new Map(); // enemy id -> { el, typedEl, restEl, word, typed }

  function create(lang, type) {
    const el = document.createElement('div');
    el.className = lang === 'ar' ? 'label arabic' : 'label';
    if (type === 'boss') el.classList.add('boss');
    const typedEl = document.createElement('span');
    typedEl.className = 'typed';
    const restEl = document.createElement('span');
    el.append(typedEl, restEl);
    container.append(el);
    return { el, typedEl, restEl, word: '', typed: -1 };
  }

  function sync(enemies, lockId, lang) {
    const seen = new Set();
    for (const e of enemies) {
      if (e.dead) continue;
      seen.add(e.id);
      let node = nodes.get(e.id);
      if (!node) {
        node = create(lang, e.type);
        nodes.set(e.id, node);
      }
      if (node.typed !== e.typed || node.word !== e.word) {
        node.typedEl.textContent = e.word.slice(0, e.typed);
        node.restEl.textContent = e.word.slice(e.typed);
        node.typed = e.typed;
        node.word = e.word;
      }
      node.el.classList.toggle('locked', e.id === lockId);
      const offset = e.type === 'boss' ? BOSS_LABEL_OFFSET_Y : LABEL_OFFSET_Y;
      node.el.style.transform = `translate(${e.x}px, ${e.y + offset}px) translateX(-50%)`;
    }
    for (const [id, node] of nodes) {
      if (!seen.has(id)) {
        node.el.remove();
        nodes.delete(id);
      }
    }
  }

  function clear() {
    for (const node of nodes.values()) node.el.remove();
    nodes.clear();
  }

  function flashMiss(id) {
    const node = nodes.get(id);
    if (!node) return;
    node.el.classList.remove('miss');
    void node.el.offsetWidth; // restart the animation
    node.el.classList.add('miss');
  }

  return { sync, clear, flashMiss };
}
