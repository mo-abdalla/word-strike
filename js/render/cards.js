// js/render/cards.js
// The upgrade cards as DOM, so Arabic text shapes and the row follows the page direction (card 1 is first in reading order).

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

export function createCards(container, onPick) {
  let buttons = [];

  function show(upgrades, lang, rarityName) {
    container.replaceChildren();
    buttons = upgrades.map((u, i) => {
      const b = document.createElement('button');
      b.className = `card rarity-${u.rarity}`;
      b.style.animationDelay = `${i * 0.08}s`;
      b.append(
        el('kbd', 'card-key', String(i + 1)),
        el('div', 'card-icon', u.icon),
        el('div', 'card-name', u.name[lang]),
        el('div', 'card-desc', u.desc[lang]),
        el('div', 'card-rarity', rarityName(u.rarity)),
      );
      b.addEventListener('click', () => onPick(i));
      container.append(b);
      return b;
    });
  }

  function flash(index) {
    buttons[index].classList.add('chosen');
  }

  return { show, flash };
}
