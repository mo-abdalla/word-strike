// js/meta/leaderboard.js
// The static leaderboard.json merged with local results from ws_leaderboard. Top ten by score.

export const LEADERBOARD_KEY = 'ws_leaderboard';
export const BOARD_SIZE = 10;
const NAME_MAX = 12;
const DEFAULT_NAME = 'PLAYER';

// Old-game records have `level` and no `wave`; they stay, and their wave shows as a dash.
export function cleanRecords(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(r => r && typeof r === 'object')
    .map(r => ({ ...r, score: Number(r.score) || 0 }));
}

const byScore = (a, b) => b.score - a.score;

export function mergeBoard(globalRecords, localRecords) {
  return [...cleanRecords(globalRecords), ...cleanRecords(localRecords)].sort(byScore).slice(0, BOARD_SIZE);
}

export function qualifies(score, board) {
  if (score <= 0) return false;
  return board.length < BOARD_SIZE || score > board[board.length - 1].score;
}

export function makeRecord({ name, score, wave, wpm, lang, date }) {
  return { name: (name.trim() || DEFAULT_NAME).slice(0, NAME_MAX), score, wave, wpm, lang, date };
}

export function addRecord(localRecords, record) {
  return [...cleanRecords(localRecords), record].sort(byScore).slice(0, BOARD_SIZE);
}
