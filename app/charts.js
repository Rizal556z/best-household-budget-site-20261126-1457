// Anggrek Household Budget — charts.js
// Plain-canvas charts, no libraries. Every chart draws from the numbers it is
// handed, so the pictures always match the tables beside them.

function setupCanvas(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function fitWidth(canvas, maxWidth) {
  const available = canvas.parentElement ? canvas.parentElement.clientWidth - 8 : maxWidth;
  return Math.max(240, Math.min(maxWidth, available || maxWidth));
}

// Donut: spending by category. `slices` = [{label, value, color}].
// `maxSize` caps the diameter so the dashboard's donut fits above the fold.
export function drawDonut(canvas, slices, totalLabel, maxSize = 320) {
  const size = fitWidth(canvas, maxSize);
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, hole = r * 0.58;
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    ctx.fillStyle = '#5a6b62';
    ctx.font = '15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const s of slices) {
    const sweep = (s.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, hole, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#22302a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(totalLabel, cx, cy - 2);
  ctx.fillStyle = '#5a6b62';
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillText('spent this month', cx, cy + 18);
}

// Grouped bars: income vs spending per month. `months` = [{label, income, spent}].
export function drawTrendBars(canvas, months) {
  const w = fitWidth(canvas, 560);
  const h = 260;
  const ctx = setupCanvas(canvas, w, h);
  const padL = 52, padR = 10, padT = 14, padB = 30;
  const maxV = Math.max(...months.flatMap((m) => [m.income, m.spent]), 1);
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const groupW = plotW / months.length;
  const barW = Math.min(26, groupW / 3);

  ctx.strokeStyle = '#dfe5dd';
  ctx.fillStyle = '#5a6b62';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = (maxV / 4) * i;
    const y = padT + plotH - (plotH * i) / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillText('$' + Math.round(v).toLocaleString('en-US'), padL - 6, y + 4);
  }
  months.forEach((m, i) => {
    const gx = padL + groupW * i + groupW / 2;
    const incomeH = (m.income / maxV) * plotH;
    const spentH = (m.spent / maxV) * plotH;
    ctx.fillStyle = '#1d5c46';
    ctx.fillRect(gx - barW - 3, padT + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = '#c77f1a';
    ctx.fillRect(gx + 3, padT + plotH - spentH, barW, spentH);
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'center';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText(m.label, gx, h - 10);
  });
  // Legend
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1d5c46'; ctx.fillRect(padL, 2, 10, 10);
  ctx.fillStyle = '#22302a'; ctx.fillText('Income', padL + 14, 11);
  ctx.fillStyle = '#c77f1a'; ctx.fillRect(padL + 80, 2, 10, 10);
  ctx.fillStyle = '#22302a'; ctx.fillText('Spending', padL + 94, 11);
}

// Horizontal bars: one row per category, spent vs budget.
export function drawCategoryBars(canvas, rows) {
  // rows = [{label, spent, budget, color}]
  const w = fitWidth(canvas, 560);
  const rowH = 30, h = rows.length * rowH + 8;
  const ctx = setupCanvas(canvas, w, h);
  const maxV = Math.max(...rows.map((r) => Math.max(r.spent, r.budget)), 1);
  const labelW = 110, barX = labelW + 8, barW = w - barX - 70;
  rows.forEach((r, i) => {
    const y = 8 + i * rowH;
    ctx.fillStyle = '#22302a';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(r.label, labelW, y + 13);
    ctx.fillStyle = '#e8ede8';
    ctx.fillRect(barX, y, barW, 14);
    ctx.fillStyle = r.spent > r.budget ? '#b3372e' : r.color;
    ctx.fillRect(barX, y, Math.max(2, (r.spent / maxV) * barW), 14);
    // budget marker
    ctx.fillStyle = '#22302a';
    ctx.fillRect(barX + (r.budget / maxV) * barW - 1, y - 2, 2, 18);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#5a6b62';
    ctx.fillText('$' + Math.round(r.spent).toLocaleString('en-US'), barX + barW + 6, y + 13);
  });
}
