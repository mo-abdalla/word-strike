// js/input.js
// Desktop keyboard on document, and the phone keyboard through a hidden field.
// Keys typed into other text fields (the leaderboard name) stay there and never reach the game.
import { keysFromChange } from './mobile-input.js';

const SPECIAL_KEYS = ['Enter', 'Escape', 'Backspace'];
// One character always sits in the hidden field so the phone's delete key has something to delete.
const SENTINEL = '​';

export function attachInput(handleKey, mobileEl = null) {
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target === mobileEl) {
      // Letters and delete from the hidden field arrive through its input event; only Enter and Escape come here.
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleKey(e.key);
      }
      return;
    }
    if (e.target instanceof HTMLInputElement) return;
    if (e.key.length !== 1 && !SPECIAL_KEYS.includes(e.key)) return;
    e.preventDefault();
    handleKey(e.key);
  });

  if (!mobileEl) return { focusMobile() {}, blurMobile() {} };

  let prev = '';
  let composing = false;
  const reset = () => {
    mobileEl.value = SENTINEL;
    prev = SENTINEL;
  };
  const take = () => {
    const next = mobileEl.value;
    for (const key of keysFromChange(prev, next)) handleKey(key);
    prev = next;
  };
  mobileEl.addEventListener('compositionstart', () => { composing = true; });
  // Browsers differ on whether the last input comes before or after compositionend, so take any change here too.
  mobileEl.addEventListener('compositionend', () => {
    composing = false;
    take();
    reset();
  });
  mobileEl.addEventListener('input', () => {
    take();
    // Mid-composition the keyboard owns the field; clearing it then would break the next letter.
    if (!composing) reset();
  });
  reset();

  return {
    // Must run synchronously inside a tap handler, or iOS will not open the keyboard.
    focusMobile() {
      mobileEl.focus({ preventScroll: true });
      reset();
    },
    blurMobile() {
      mobileEl.blur();
    },
  };
}
