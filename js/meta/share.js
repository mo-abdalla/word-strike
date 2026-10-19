// js/meta/share.js
// The 600×800 result card drawn on a canvas, handed to the system share sheet or downloaded.

export const CARD_W = 600;
export const CARD_H = 800;
const FILE_NAME = 'word-strike-result.png';
const GRID = 30;
const ROW_START = 240;
const ROW_STEP = 92;
const REVOKE_MS = 1000;

// stats: {score, wave, wpm, acc, maxCombo, icons}; text: {lang, sub, labels: {score, wave, wpm, accuracy, maxCombo}, font}
export function drawShareCard(canvas, stats, colors, text) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= CARD_W; x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CARD_H); ctx.stroke(); }
  for (let y = 0; y <= CARD_H; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CARD_W, y); ctx.stroke(); }

  const label = text.lang === 'ar' ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  const grad = ctx.createLinearGradient(40, 0, CARD_W - 40, 0);
  grad.addColorStop(0, colors.cyan);
  grad.addColorStop(0.5, colors.purple);
  grad.addColorStop(1, colors.pink);
  ctx.direction = 'ltr';
  ctx.fillStyle = grad;
  ctx.font = 'bold 56px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillText('WORD STRIKE', CARD_W / 2, 110);
  ctx.direction = label;
  ctx.fillStyle = colors.text;
  ctx.font = `20px ${text.font}`;
  ctx.fillText(text.sub, CARD_W / 2, 158);

  const rows = [
    [text.labels.score, stats.score.toLocaleString('en')],
    [text.labels.wave, String(stats.wave)],
    [text.labels.wpm, String(stats.wpm)],
    [text.labels.accuracy, `${stats.acc}%`],
    [text.labels.maxCombo, `×${stats.maxCombo}`],
  ];
  rows.forEach(([name, value], i) => {
    const y = ROW_START + i * ROW_STEP;
    ctx.direction = label;
    ctx.fillStyle = colors.dim;
    ctx.font = `18px ${text.font}`;
    ctx.fillText(name, CARD_W / 2, y);
    ctx.direction = 'ltr';
    ctx.fillStyle = colors.cyan;
    ctx.font = 'bold 40px ui-monospace, Menlo, Consolas, monospace';
    ctx.fillText(value, CARD_W / 2, y + 42);
  });

  if (stats.icons.length) {
    ctx.direction = 'ltr';
    ctx.font = '34px system-ui, sans-serif';
    ctx.fillText(stats.icons.join(' '), CARD_W / 2, CARD_H - 50);
  }
}

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILE_NAME;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_MS);
}

// The share sheet where the browser supports files, a download elsewhere. Cancelling the sheet does nothing.
export function shareCard(canvas) {
  canvas.toBlob(blob => {
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Word Strike' }).catch(err => {
        if (err.name !== 'AbortError') download(blob);
      });
    } else {
      download(blob);
    }
  }, 'image/png');
}
