// js/mobile-input.js
// Turns a change in the hidden phone field into game keys.
// Phone keyboards compose words (the field grows "c", "ca", "cat"), so only the new characters count.
// Characters removed from the end are Backspace. Spaces are ignored as on desktop.

export function keysFromChange(prev, next) {
  let same = 0;
  while (same < prev.length && same < next.length && prev[same] === next[same]) same++;
  const keys = [];
  for (let i = same; i < prev.length; i++) keys.push('Backspace');
  for (const ch of next.slice(same)) if (ch !== ' ') keys.push(ch);
  return keys;
}
