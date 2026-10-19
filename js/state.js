// js/state.js
// The game phase machine. Every phase change goes through set().

const ALLOWED = {
  menu: ['playing'],
  playing: ['paused', 'upgradePick', 'gameover'],
  paused: ['playing', 'menu'],
  upgradePick: ['playing'],
  gameover: ['playing', 'menu'],
};

export function createPhaseMachine(onChange) {
  let phase = 'menu';
  onChange(phase, null);
  return {
    get: () => phase,
    set(next) {
      if (!ALLOWED[phase].includes(next)) {
        throw new Error(`Invalid phase transition: ${phase} -> ${next}`);
      }
      const prev = phase;
      phase = next;
      onChange(next, prev);
    },
  };
}
