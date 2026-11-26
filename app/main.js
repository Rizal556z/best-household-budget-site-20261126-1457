// Anggrek Household Budget — main.js
// Hash router and page controls. Renders the view for the current hash, draws
// the charts, and handles every control through one delegated listener, so a
// button that does nothing is a bug, not a decoration.

import {
  loadStore, saveStore, resetStore, money, monthLabel, categorySpent,
  categoryOf, escapeHtml, nextId, TREND_MONTHS, TREND_PRIOR, monthTotals,
} from './data.js';
import { drawDonut, drawTrendBars, drawCategoryBars } from './charts.js';
import {
  viewDashboard, viewIncome, viewExpenses, viewPlanner, viewGoals,
  viewBills, viewReports, viewSettings, viewSearch,
} from './views.js';

const app = document.getElementById('app');
const navLinks = document.getElementById('nav-links');
const monthChip = document.getElementById('month-chip');
let doc = loadStore();

const ROUTES = {
  '': viewDashboard,
  'income': viewIncome,
  'expenses': viewExpenses,
  'planner': viewPlanner,
  'goals': viewGoals,
  'bills': viewBills,
  'reports': viewReports,
  'settings': viewSettings,
  'search': (d, q) => viewSearch(d, q),
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  const params = new URLSearchParams(query || '');
  return { route: path || '', q: params.get('q') || '' };
}

function donutSlices(d) {
  const spent = categorySpent(d, d.month);
  return d.categories
    .map((c) => ({ label: c.name, value: spent[c.id], color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

function render() {
  const { route, q } = parseHash();
  const view = ROUTES[route] || viewDashboard;
  app.innerHTML = view(doc, q);
  document.querySelectorAll('#nav-links a').forEach((a) => {
    a.classList.toggle('active', (a.dataset.route || '') === route);
  });
  monthChip.textContent = monthLabel(doc.month) + ' · ' + money(monthTotals(doc, doc.month).left) + ' left';
  document.title = (route ? route[0].toUpperCase() + route.slice(1) + ' — ' : '') + 'Anggrek Household Budget';

  // Charts, per page.
  const donut = document.getElementById('chart-donut');
  if (donut) {
    const slices = donutSlices(doc);
    drawDonut(donut, slices, money(monthTotals(doc, doc.month).spent), route === '' ? 250 : 320);
    const legend = document.getElementById('donut-legend');
    if (legend) {
      legend.innerHTML = slices.map((s) =>
        `<li><span class="swatch" style="background:${s.color}"></span>${escapeHtml(s.label)} — ${money(s.value)}</li>`).join('');
    }
  }
  const trend = document.getElementById('chart-trend');
  if (trend) {
    const months = TREND_MONTHS.map((ym) => {
      if (TREND_PRIOR[ym]) return { label: ym.slice(5) === '06' ? 'Jun' : ym.slice(5) === '07' ? 'Jul' : 'Aug', ...TREND_PRIOR[ym] };
      const t = monthTotals(doc, ym);
      return { label: ym.slice(5) === '09' ? 'Sep' : ym.slice(5) === '10' ? 'Oct' : 'Nov', income: t.income, spent: t.spent };
    });
    drawTrendBars(trend, months);
  }
  const cats = document.getElementById('chart-cats');
  if (cats) {
    const spent = categorySpent(doc, doc.month);
    const rows = [...doc.categories]
      .map((c) => ({ label: c.name, spent: spent[c.id], budget: c.budget, color: c.color }))
      .sort((a, b) => b.spent - a.spent).slice(0, 5);
    drawCategoryBars(cats, rows);
  }
  window.scrollTo(0, 0);
}

function rerender() {
  saveStore(doc);
  render();
}

// --- CSV ---------------------------------------------------------------
function transactionsCsv(d) {
  const head = 'date,description,category,amount';
  const lines = [...d.transactions]
    .sort((a, b) => a.date.localeCompare(b.date) || b.id.localeCompare(a.id))
    .map((t) => [t.date, '"' + t.desc.replace(/"/g, '""') + '"', t.category, t.amount.toFixed(2)].join(','));
  return head + '\n' + lines.join('\n') + '\n';
}

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

// --- Controls ----------------------------------------------------------
document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'month-prev' || action === 'month-next') {
    doc.month = el.dataset.month;
    rerender();
  } else if (action === 'delete-tx') {
    const t = doc.transactions.find((x) => x.id === el.dataset.id);
    if (t && window.confirm('Delete "' + t.desc + '" (' + money(t.amount) + ')?')) {
      doc.transactions = doc.transactions.filter((x) => x.id !== el.dataset.id);
      rerender();
    }
  } else if (action === 'edit-tx') {
    doc._editing = el.dataset.id;
    const t = doc.transactions.find((x) => x.id === el.dataset.id);
    location.hash = t && t.amount >= 0 ? '#/income' : '#/expenses';
    render();
  } else if (action === 'cancel-edit') {
    delete doc._editing;
    render();
  } else if (action === 'bill-toggle') {
    const bill = doc.bills.find((b) => b.id === el.dataset.id);
    if (!bill) return;
    const wasPaid = !!bill.paidMonths[doc.month];
    if (wasPaid) {
      delete bill.paidMonths[doc.month];
      // Remove the spending line this bill created, if it is still there.
      doc.transactions = doc.transactions.filter((t) => t.id !== 'bill-' + bill.id + '-' + doc.month);
    } else {
      bill.paidMonths[doc.month] = true;
      // Bills belong to the category they pay for, so the planner and the
      // donut chart count them in the right place.
      const billCategory = { rent: 'housing', school: 'education', insurance: 'health', 'car-loan': 'transport' }[bill.id] || 'utilities';
      doc.transactions.push({
        id: 'bill-' + bill.id + '-' + doc.month,
        date: doc.month + '-' + String(bill.dueDay).padStart(2, '0'),
        desc: bill.name,
        category: billCategory,
        amount: -bill.amount,
      });
    }
    rerender();
  } else if (action === 'export-csv') {
    download('anggrek-budget.csv', transactionsCsv(doc), 'text/csv');
  } else if (action === 'export-json') {
    const copy = { ...doc };
    delete copy._editing;
    download('anggrek-budget.json', JSON.stringify(copy, null, 2), 'application/json');
  } else if (action === 'reset-data') {
    if (window.confirm('Reset the budget to the original demo figures? Your changes will be lost.')) {
      doc = resetStore();
      rerender();
    }
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);

  if (form.id === 'tx-form') {
    const amount = Math.abs(parseFloat(data.get('amount')));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const type = data.get('type');
    const editingId = form.dataset.editing;
    const record = {
      date: String(data.get('date')),
      desc: String(data.get('desc')).trim(),
      category: type === 'income' ? 'income' : String(data.get('category')),
      amount: type === 'income' ? amount : -amount,
    };
    if (!record.desc || !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) return;
    if (editingId) {
      const t = doc.transactions.find((x) => x.id === editingId);
      if (t) Object.assign(t, record);
      delete doc._editing;
    } else {
      doc.transactions.push({ id: nextId(doc), ...record });
    }
    doc.month = record.date.slice(0, 7);
    rerender();
  } else if (form.id === 'planner-form') {
    for (const c of doc.categories) {
      const v = parseFloat(data.get('budget-' + c.id));
      if (Number.isFinite(v) && v >= 0) c.budget = Math.round(v);
    }
    saveStore(doc);
    const note = document.getElementById('planner-saved');
    if (note) note.textContent = 'Planner saved.';
    render();
    const note2 = document.getElementById('planner-saved');
    if (note2) note2.textContent = 'Planner saved.';
  } else if (form.classList.contains('goal-form')) {
    const amount = parseFloat(data.get('amount'));
    const goal = doc.goals.find((g) => g.id === form.dataset.goal);
    if (goal && Number.isFinite(amount) && amount > 0) {
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      rerender();
    }
  } else if (form.id === 'goal-form') {
    const target = parseFloat(data.get('target'));
    const name = String(data.get('name')).trim();
    if (name && Number.isFinite(target) && target > 0) {
      doc.goals.push({ id: nextId(doc), name, target: Math.round(target), saved: 0, note: String(data.get('note') || '').trim() });
      rerender();
    }
  } else if (form.id === 'bill-form') {
    const amount = parseFloat(data.get('amount'));
    const name = String(data.get('name')).trim();
    const dueDay = parseInt(data.get('dueDay'), 10);
    if (name && Number.isFinite(amount) && amount > 0 && dueDay >= 1 && dueDay <= 28) {
      doc.bills.push({ id: nextId(doc), name, amount: Math.round(amount * 100) / 100, dueDay, autopay: data.get('autopay') === 'yes', paidMonths: {} });
      rerender();
    }
  } else if (form.id === 'settings-form') {
    doc.household = String(data.get('household')).trim() || doc.household;
    doc.members = String(data.get('members')).trim();
    saveStore(doc);
    const note = document.getElementById('settings-saved');
    if (note) note.textContent = 'Household saved.';
  } else if (form.id === 'search-form') {
    location.hash = '#/search?q=' + encodeURIComponent(String(data.get('q') || '').trim());
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'import-file') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ''));
      let added = 0;
      for (const cells of rows) {
        if (cells.length < 4 || cells[0] === 'date') continue;
        const [date, desc, category, amountRaw] = cells;
        const amount = parseFloat(amountRaw);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !desc || !Number.isFinite(amount)) continue;
        const known = doc.categories.some((c) => c.id === category) || category === 'income';
        doc.transactions.push({ id: nextId(doc), date, desc, category: known ? category : 'misc', amount });
        added++;
      }
      if (added > 0) rerender();
      else window.alert('No transactions could be imported from that file.');
    };
    reader.readAsText(file);
  }
});

// Header search goes to the search page.
document.getElementById('header-search').addEventListener('submit', (event) => {
  event.preventDefault();
  const q = document.getElementById('search-input').value.trim();
  location.hash = '#/search?q=' + encodeURIComponent(q);
});

window.addEventListener('hashchange', render);
render();
