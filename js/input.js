// js/input.js
// Desktop keyboard. Mobile input arrives in a later plan.
const SPECIAL_KEYS = ['Enter', 'Escape', 'Backspace'];

export function attachInput(handleKey) {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1 && !SPECIAL_KEYS.includes(e.key)) return;
    e.preventDefault();
    handleKey(e.key);
  });
}
