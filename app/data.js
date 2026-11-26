// Anggrek Household Budget — data.js
// Every figure is invented for the fictional Anggrek family. The store keeps
// one household document in localStorage; all math in the app reads from it,
// so the site works fully offline and every change persists on this device.

export const STORE_KEY = 'anggrek-budget-v1';
export const DEFAULT_MONTH = '2026-11';

// Monthly spending plan per category (USD). `budget` is the plan for one month.
export const CATEGORY_PLAN = [
  { id: 'groceries',    name: 'Groceries',     budget: 700, color: '#1d5c46', icon: '🛒' },
  { id: 'housing',      name: 'Housing',       budget: 1450, color: '#2f6f8f', icon: '🏠' },
  { id: 'utilities',    name: 'Utilities',     budget: 310, color: '#7a6a2f', icon: '💡' },
  { id: 'transport',    name: 'Transport',     budget: 390, color: '#5b4a8a', icon: '🚗' },
  { id: 'dining',       name: 'Dining out',    budget: 180, color: '#c77f1a', icon: '🍽️' },
  { id: 'health',       name: 'Health',        budget: 250, color: '#8a3b5c', icon: '🩺' },
  { id: 'education',    name: 'Education',     budget: 400, color: '#3f7d5a', icon: '📚' },
  { id: 'entertainment', name: 'Entertainment', budget: 120, color: '#b3372e', icon: '🎬' },
  { id: 'clothing',     name: 'Clothing',      budget: 90,  color: '#47617a', icon: '👕' },
  { id: 'misc',         name: 'Everything else', budget: 150, color: '#6b6b6b', icon: '🧺' },
];

export const INCOME_SOURCES = [
  { id: 'salary-maya', name: 'Maya — teaching salary', amount: 2850 },
  { id: 'salary-dedi', name: 'Dedi — nursing salary', amount: 3120 },
  { id: 'freelance',   name: 'Weekend tutoring',       amount: 420 },
  { id: 'interest',    name: 'Savings interest',       amount: 38 },
];

export const GOALS_SEED = [
  { id: 'emergency', name: 'Emergency fund', target: 5000, saved: 3420, note: 'Six months of essentials, one deposit at a time.' },
  { id: 'holiday',   name: 'Family holiday — Lombok', target: 2400, saved: 1150, note: 'Flights and a week by the beach next July.' },
  { id: 'laptop',    name: 'New laptop for Maya', target: 1200, saved: 860, note: 'The old one dies every time it renders a video.' },
  { id: 'car',       name: 'Replace the family car', target: 8000, saved: 1980, note: 'The 2011 sedan is on its last tyres.' },
];

export const BILLS_SEED = [
  { id: 'rent',      name: 'Mortgage — Anggrek house', amount: 1450, dueDay: 1,  autopay: true },
  { id: 'electric',  name: 'Electricity',             amount: 118,  dueDay: 8,  autopay: true },
  { id: 'water',     name: 'Water',                   amount: 46,   dueDay: 10, autopay: false },
  { id: 'internet',  name: 'Internet & TV',           amount: 79,   dueDay: 12, autopay: true },
  { id: 'phone',     name: 'Mobile phones (2 lines)', amount: 64,   dueDay: 15, autopay: true },
  { id: 'insurance', name: 'Health insurance',        amount: 212,  dueDay: 18, autopay: true },
  { id: 'car-loan',  name: 'Car loan',                amount: 287,  dueDay: 22, autopay: true },
  { id: 'school',    name: 'School fees — Nia & Bima', amount: 340, dueDay: 25, autopay: false },
];

// Seed transactions. Positive = money in, negative = money out.
// November is the current month (26 Nov 2026); October and September are history.
export const TRANSACTIONS_SEED = [
  // November 2026 — income
  { id: 't-nov-01', date: '2026-11-01', desc: 'Maya — teaching salary', category: 'income', amount: 2850 },
  { id: 't-nov-02', date: '2026-11-01', desc: 'Dedi — nursing salary', category: 'income', amount: 3120 },
  { id: 't-nov-03', date: '2026-11-07', desc: 'Weekend tutoring — the Rahmans', category: 'income', amount: 210 },
  { id: 't-nov-04', date: '2026-11-14', desc: 'Weekend tutoring — the Rahmans', category: 'income', amount: 210 },
  { id: 't-nov-05', date: '2026-11-21', desc: 'Savings interest', category: 'income', amount: 38 },
  // November 2026 — spending
  { id: 't-nov-06', date: '2026-11-01', desc: 'Mortgage — Anggrek house', category: 'housing', amount: -1450 },
  { id: 't-nov-07', date: '2026-11-02', desc: 'Weekly shop — Green Mart', category: 'groceries', amount: -148 },
  { id: 't-nov-08', date: '2026-11-03', desc: 'Petrol — Shell Anggrek', category: 'transport', amount: -52 },
  { id: 't-nov-09', date: '2026-11-05', desc: 'Electricity bill', category: 'utilities', amount: -118 },
  { id: 't-nov-10', date: '2026-11-06', desc: 'Dinner — Warung Sari', category: 'dining', amount: -46 },
  { id: 't-nov-11', date: '2026-11-08', desc: 'Weekly shop — Green Mart', category: 'groceries', amount: -132 },
  { id: 't-nov-12', date: '2026-11-09', desc: 'Pharmacy — flu medicine', category: 'health', amount: -34 },
  { id: 't-nov-13', date: '2026-11-10', desc: 'Water bill', category: 'utilities', amount: -46 },
  { id: 't-nov-14', date: '2026-11-12', desc: 'Internet & TV', category: 'utilities', amount: -79 },
  { id: 't-nov-15', date: '2026-11-13', desc: 'School books — Nia', category: 'education', amount: -86 },
  { id: 't-nov-16', date: '2026-11-14', desc: 'Weekly shop — Green Mart', category: 'groceries', amount: -157 },
  { id: 't-nov-17', date: '2026-11-15', desc: 'Mobile phones (2 lines)', category: 'utilities', amount: -64 },
  { id: 't-nov-18', date: '2026-11-16', desc: 'Cinema — family film night', category: 'entertainment', amount: -38 },
  { id: 't-nov-19', date: '2026-11-18', desc: 'Health insurance', category: 'health', amount: -212 },
  { id: 't-nov-20', date: '2026-11-19', desc: 'Bus passes — November', category: 'transport', amount: -48 },
  { id: 't-nov-21', date: '2026-11-20', desc: 'Weekly shop — Green Mart', category: 'groceries', amount: -141 },
  { id: 't-nov-22', date: '2026-11-21', desc: 'Takeaway — Friday pizza', category: 'dining', amount: -32 },
  { id: 't-nov-23', date: '2026-11-22', desc: 'Car loan', category: 'transport', amount: -287 },
  { id: 't-nov-24', date: '2026-11-23', desc: 'Winter jackets — Bima', category: 'clothing', amount: -74 },
  { id: 't-nov-25', date: '2026-11-24', desc: 'School fees — Nia & Bima', category: 'education', amount: -340 },
  { id: 't-nov-26', date: '2026-11-25', desc: 'Weekly shop — Green Mart', category: 'groceries', amount: -119 },
  { id: 't-nov-27', date: '2026-11-26', desc: 'Dentist check-up — Dedi', category: 'health', amount: -58 },
  // October 2026
  { id: 't-oct-01', date: '2026-10-01', desc: 'Maya — teaching salary', category: 'income', amount: 2850 },
  { id: 't-oct-02', date: '2026-10-01', desc: 'Dedi — nursing salary', category: 'income', amount: 3120 },
  { id: 't-oct-03', date: '2026-10-10', desc: 'Weekend tutoring', category: 'income', amount: 420 },
  { id: 't-oct-04', date: '2026-10-01', desc: 'Mortgage — Anggrek house', category: 'housing', amount: -1450 },
  { id: 't-oct-05', date: '2026-10-05', desc: 'Groceries — October', category: 'groceries', amount: -612 },
  { id: 't-oct-06', date: '2026-10-08', desc: 'Electricity + water', category: 'utilities', amount: -171 },
  { id: 't-oct-07', date: '2026-10-12', desc: 'Internet & TV', category: 'utilities', amount: -79 },
  { id: 't-oct-08', date: '2026-10-14', desc: 'Petrol + bus passes', category: 'transport', amount: -296 },
  { id: 't-oct-09', date: '2026-10-16', desc: 'Dining out — October', category: 'dining', amount: -164 },
  { id: 't-oct-10', date: '2026-10-18', desc: 'Health insurance + pharmacy', category: 'health', amount: -238 },
  { id: 't-oct-11', date: '2026-10-21', desc: 'School fees + books', category: 'education', amount: -402 },
  { id: 't-oct-12', date: '2026-10-24', desc: 'Cinema + streaming', category: 'entertainment', amount: -96 },
  { id: 't-oct-13', date: '2026-10-27', desc: 'Clothing — autumn', category: 'clothing', amount: -118 },
  { id: 't-oct-14', date: '2026-10-30', desc: 'Car loan', category: 'transport', amount: -287 },
  // September 2026
  { id: 't-sep-01', date: '2026-09-01', desc: 'Salaries — Maya & Dedi', category: 'income', amount: 5970 },
  { id: 't-sep-02', date: '2026-09-12', desc: 'Weekend tutoring', category: 'income', amount: 380 },
  { id: 't-sep-03', date: '2026-09-01', desc: 'Mortgage — Anggrek house', category: 'housing', amount: -1450 },
  { id: 't-sep-04', date: '2026-09-07', desc: 'Groceries — September', category: 'groceries', amount: -588 },
  { id: 't-sep-05', date: '2026-09-10', desc: 'Utilities — September', category: 'utilities', amount: -243 },
  { id: 't-sep-06', date: '2026-09-15', desc: 'Transport — September', category: 'transport', amount: -301 },
  { id: 't-sep-07', date: '2026-09-19', desc: 'Dining out — September', category: 'dining', amount: -141 },
  { id: 't-sep-08', date: '2026-09-22', desc: 'Health — September', category: 'health', amount: -196 },
  { id: 't-sep-09', date: '2026-09-25', desc: 'Education — September', category: 'education', amount: -356 },
  { id: 't-sep-10', date: '2026-09-28', desc: 'Entertainment + clothing', category: 'entertainment', amount: -132 },
  { id: 't-sep-11', date: '2026-09-30', desc: 'Car loan', category: 'transport', amount: -287 },
];

// Monthly totals for the six-month trend (Jun–Aug are summaries; Sep–Nov are
// derived from the transactions above at runtime and must match these).
export const TREND_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
export const TREND_PRIOR = {
  '2026-06': { income: 6230, spent: 3980 },
  '2026-07': { income: 6410, spent: 4215 },
  '2026-08': { income: 6380, spent: 4090 },
};

function seedDocument() {
  return {
    household: 'The Anggrek Family',
    members: 'Maya (teacher) · Dedi (nurse) · Nia (12) · Bima (9)',
    currency: '$',
    month: DEFAULT_MONTH,
    categories: CATEGORY_PLAN.map((c) => ({ ...c })),
    incomeSources: INCOME_SOURCES.map((s) => ({ ...s })),
    goals: GOALS_SEED.map((g) => ({ ...g })),
    bills: BILLS_SEED.map((b) => ({ ...b, paidMonths: {} })),
    transactions: TRANSACTIONS_SEED.map((t) => ({ ...t })),
    created: '2026-11-26',
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const doc = JSON.parse(raw);
      if (doc && Array.isArray(doc.transactions) && Array.isArray(doc.categories)) return doc;
    }
  } catch { /* corrupted storage: fall through to a fresh seed */ }
  const doc = seedDocument();
  saveStore(doc);
  return doc;
}

export function saveStore(doc) {
  localStorage.setItem(STORE_KEY, JSON.stringify(doc));
}

export function resetStore() {
  const doc = seedDocument();
  saveStore(doc);
  return doc;
}

// --- small helpers the views share -----------------------------------------

export function money(n) {
  const sign = n < 0 ? '−' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(n) {
  return (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function monthShort(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

export function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function transactionsIn(doc, ym) {
  return doc.transactions.filter((t) => t.date.startsWith(ym));
}

export function monthTotals(doc, ym) {
  let income = 0, spent = 0;
  for (const t of transactionsIn(doc, ym)) {
    if (t.amount >= 0) income += t.amount; else spent += -t.amount;
  }
  return { income, spent, left: income - spent };
}

export function categorySpent(doc, ym) {
  const out = {};
  for (const c of doc.categories) out[c.id] = 0;
  for (const t of transactionsIn(doc, ym)) {
    if (t.amount < 0 && out[t.category] !== undefined) out[t.category] += -t.amount;
  }
  return out;
}

export function categoryOf(doc, id) {
  return doc.categories.find((c) => c.id === id) || { id, name: 'Uncategorised', budget: 0, color: '#6b6b6b', icon: '🧺' };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

export function nextId(doc) {
  return 't-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
}
