// js/meta/themes.js
// The four colour themes from the old game. Applying one writes CSS variables; everything drawn reads them back.

export const THEME_KEY = 'ws_theme';

export const THEMES = [
  { name: 'Cyber',  vars: { '--neon-cyan': '#00f5ff', '--neon-green': '#39ff14', '--neon-pink': '#ff2d78', '--neon-yellow': '#ffe600', '--neon-purple': '#bf5fff', '--bg': '#060610', '--tile-bg': 'rgba(10,10,40,0.92)', '--text': '#e8e8ff', '--dim': '#555577' } },
  { name: 'Synth',  vars: { '--neon-cyan': '#2de2e6', '--neon-green': '#39ff14', '--neon-pink': '#ff2e97', '--neon-yellow': '#ff9e2c', '--neon-purple': '#b14aed', '--bg': '#160a26', '--tile-bg': 'rgba(40,16,60,0.92)', '--text': '#ffe8ff', '--dim': '#7a5a8a' } },
  { name: 'Matrix', vars: { '--neon-cyan': '#39ff14', '--neon-green': '#00ff66', '--neon-pink': '#ff3b3b', '--neon-yellow': '#aaff00', '--neon-purple': '#7CFC00', '--bg': '#020a02', '--tile-bg': 'rgba(6,26,6,0.92)', '--text': '#d8ffd8', '--dim': '#3a6a3a' } },
  { name: 'Vapor',  vars: { '--neon-cyan': '#01cdfe', '--neon-green': '#05ffa1', '--neon-pink': '#ff71ce', '--neon-yellow': '#fffb96', '--neon-purple': '#b967ff', '--bg': '#241046', '--tile-bg': 'rgba(60,30,100,0.9)', '--text': '#fde8ff', '--dim': '#9a7ac0' } },
];

// Any stored value becomes a valid index: the old game saved it as a string.
export function themeIndex(value) {
  const n = THEMES.length;
  return (((Math.trunc(Number(value)) || 0) % n) + n) % n;
}

export function applyTheme(root, value) {
  const theme = THEMES[themeIndex(value)];
  for (const [name, color] of Object.entries(theme.vars)) root.style.setProperty(name, color);
  return theme;
}
