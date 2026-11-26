// Anggrek Household Budget — views.js
// One function per page. Each returns HTML; main.js renders it and wires the
// controls. Nothing here fetches anything — every figure comes from the store.

import {
  money, moneyShort, monthLabel, monthShort, shiftMonth, transactionsIn,
  monthTotals, categorySpent, categoryOf, escapeHtml, TREND_MONTHS, TREND_PRIOR,
} from './data.js';

function monthSwitcher(doc) {
  const prev = shiftMonth(doc.month, -1);
  const next = shiftMonth(doc.month, 1);
  return `<p class="month-switch" role="group" aria-label="Choose month">
    <button type="button" data-action="month-prev" data-month="${prev}" aria-label="Previous month">&larr; ${monthShort(prev)}</button>
    <span class="current">${monthLabel(doc.month)}</span>
    <button type="button" data-action="month-next" data-month="${next}" aria-label="Next month">${monthShort(next)} &rarr;</button>
  </p>`;
}

function statCard(label, value, note, cls) {
  return `<div class="card stat"><p class="label">${label}</p>
    <p class="value ${cls || ''}">${value}</p><p class="note">${note}</p></div>`;
}

function transactionRows(doc, list, showCategory) {
  if (!list.length) return '<p class="muted">Nothing here yet for this month.</p>';
  const rows = list.map((t) => {
    const cat = categoryOf(doc, t.category);
    const cls = t.amount >= 0 ? 'income-row' : 'expense';
    return `<tr class="${cls}">
      <td>${escapeHtml(t.date.slice(5))}<span class="sub">${escapeHtml(t.date.slice(0, 4))}</span></td>
      <td>${escapeHtml(t.desc)}${showCategory ? `<span class="sub">${cat.icon} ${escapeHtml(cat.name)}</span>` : ''}</td>
      <td class="num amount">${money(t.amount)}</td>
      <td class="num"><button type="button" class="link-btn" data-action="edit-tx" data-id="${t.id}">Edit</button>
      <button type="button" class="link-btn danger" data-action="delete-tx" data-id="${t.id}">Delete</button></td>
    </tr>`;
  }).join('');
  return `<div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Description</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function addTransactionForm(doc, editing) {
  const t = editing || { date: doc.month + '-26', desc: '', category: 'groceries', amount: '' };
  const isIncome = editing ? editing.amount >= 0 : false;
  const catOptions = doc.categories.map((c) =>
    `<option value="${c.id}"${t.category === c.id ? ' selected' : ''}>${c.icon} ${escapeHtml(c.name)}</option>`).join('');
  return `<form class="stacked" id="tx-form" data-editing="${editing ? editing.id : ''}">
    <h3>${editing ? 'Edit transaction' : 'Add a transaction'}</h3>
    <div class="form-row">
      <div><label for="tx-date">Date</label>
        <input id="tx-date" name="date" type="date" value="${escapeHtml(t.date)}" required></div>
      <div><label for="tx-type">Type</label>
        <select id="tx-type" name="type">
          <option value="expense"${!isIncome ? ' selected' : ''}>Spending</option>
          <option value="income"${isIncome ? ' selected' : ''}>Income</option>
        </select></div>
    </div>
    <label for="tx-desc">Description</label>
    <input id="tx-desc" name="desc" type="text" maxlength="80" placeholder="e.g. Weekly shop — Green Mart" value="${escapeHtml(t.desc)}" required>
    <div class="form-row">
      <div><label for="tx-category">Category</label>
        <select id="tx-category" name="category">${catOptions}
          <option value="income"${t.category === 'income' ? ' selected' : ''}>💰 Income</option></select></div>
      <div><label for="tx-amount">Amount ($)</label>
        <input id="tx-amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00"
          value="${t.amount === '' ? '' : Math.abs(t.amount)}" required></div>
    </div>
    <div class="form-actions">
      <button type="submit">${editing ? 'Save changes' : 'Add transaction'}</button>
      ${editing ? '<button type="button" class="btn secondary" data-action="cancel-edit">Cancel</button>' : ''}
    </div>
  </form>`;
}

// --- Dashboard -------------------------------------------------------------
export function viewDashboard(doc) {
  const totals = monthTotals(doc, doc.month);
  const spent = categorySpent(doc, doc.month);
  const over = doc.categories.filter((c) => spent[c.id] > c.budget);
  const biggest = [...doc.categories].sort((a, b) => spent[b.id] - spent[a.id])[0];
  const recent = [...transactionsIn(doc, doc.month)]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 8);
  const dueSoon = doc.bills
    .filter((b) => !b.paidMonths[doc.month])
    .sort((a, b) => a.dueDay - b.dueDay).slice(0, 4);
  const goalsTotal = doc.goals.reduce((s, g) => s + g.saved, 0);
  const goalsTarget = doc.goals.reduce((s, g) => s + g.target, 0);

  return `
  <h1>Good morning, Anggrek family</h1>
  <p class="lede">November is nearly done: you have <strong>${money(totals.left)}</strong> left of this
  month&rsquo;s income, and ${over.length ? `<strong>${over.length} categor${over.length === 1 ? 'y is' : 'ies are'} over budget</strong>` : 'every category is still inside its plan'}.
  Maya, Dedi, Nia and Bima share this budget.</p>
  ${monthSwitcher(doc)}
  <div class="grid four" style="margin-top:14px">
    ${statCard('Income · ' + monthShort(doc.month), money(totals.income), 'Salaries, tutoring and interest', 'positive')}
    ${statCard('Spent · ' + monthShort(doc.month), money(totals.spent), biggest ? 'Biggest: ' + biggest.name + ' ' + money(spent[biggest.id]) : '', 'negative')}
    ${statCard('Left to spend', money(totals.left), totals.left >= 0 ? 'On track — keep it green' : 'Over income this month', totals.left >= 0 ? 'positive' : 'negative')}
    ${statCard('Savings goals', money(goalsTotal), 'of ' + money(goalsTarget) + ' across ' + doc.goals.length + ' goals', '')}
  </div>
  ${over.length ? `<div class="callout"><strong>Heads up:</strong> ${over.map((c) => escapeHtml(c.name) + ' is ' + money(spent[c.id] - c.budget) + ' over its ' + money(c.budget) + ' plan').join('; ')}.
  <a href="#/planner">Open the planner</a> to move money between categories.</div>` : ''}
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Where November&rsquo;s money went</h2>
      <div class="chart-box"><canvas id="chart-donut" width="320" height="320" role="img" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend" id="donut-legend"></ul></div>
      <p class="muted"><a href="#/reports">See the full reports &rarr;</a></p>
    </section>
    <section class="card">
      <h2>Latest transactions</h2>
      ${transactionRows(doc, recent, true)}
      <p class="muted"><a href="#/expenses">All expenses &rarr;</a> &middot; <a href="#/income">All income &rarr;</a></p>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Bills still to pay in ${monthShort(doc.month)}</h2>
      ${dueSoon.length ? dueSoon.map((b) => `<div class="bill-row">
          <div><strong>${escapeHtml(b.name)}</strong><div class="due">Due ${monthShort(doc.month)} ${b.dueDay} &middot; ${b.autopay ? 'autopay' : 'pay by hand'}</div></div>
          <span class="amount">${money(b.amount)}</span>
          <button type="button" class="btn small" data-action="bill-toggle" data-id="${b.id}">Mark paid</button>
        </div>`).join('') : '<p class="muted">Every bill this month is paid. Nice work.</p>'}
      <p class="muted"><a href="#/bills">Full bills calendar &rarr;</a></p>
    </section>
    <section class="card">
      <h2>Savings at a glance</h2>
      ${doc.goals.map((g) => {
        const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
        return `<p><strong>${escapeHtml(g.name)}</strong> — ${money(g.saved)} of ${money(g.target)} (${pct}%)</p>
        <div class="bar" role="img" aria-label="${escapeHtml(g.name)} ${pct}% funded"><span style="width:${pct}%"></span></div>`;
      }).join('')}
      <p class="muted"><a href="#/goals">Manage savings goals &rarr;</a></p>
    </section>
  </div>`;
}

// --- Income ----------------------------------------------------------------
export function viewIncome(doc) {
  const list = transactionsIn(doc, doc.month).filter((t) => t.amount >= 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, t) => s + t.amount, 0);
  const editing = doc._editing ? doc.transactions.find((t) => t.id === doc._editing) : null;
  return `
  <h1>Income</h1>
  <p class="lede">Every dollar coming into the household in ${monthLabel(doc.month)}.
  Salaries land on the 1st; tutoring is paid after each weekend session.</p>
  ${monthSwitcher(doc)}
  <div class="grid three" style="margin-top:14px">
    ${statCard('Total income', money(total), doc.incomeSources.length + ' regular sources', 'positive')}
    ${statCard('Planned income', money(doc.incomeSources.reduce((s, x) => s + x.amount, 0)), 'What the family expects each month', '')}
    ${statCard('After spending', money(monthTotals(doc, doc.month).left), 'Income minus spending this month', monthTotals(doc, doc.month).left >= 0 ? 'positive' : 'negative')}
  </div>
  <div class="section-head"><h2>Expected sources</h2></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Source</th><th class="num">Expected / month</th></tr></thead>
    <tbody>${doc.incomeSources.map((s) => `<tr><td>${escapeHtml(s.name)}</td><td class="num">${money(s.amount)}</td></tr>`).join('')}</tbody>
  </table></div></div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Income in ${monthShort(doc.month)}</h2>
      ${transactionRows(doc, list, false)}
    </section>
    <section class="card">${addTransactionForm(doc, editing && editing.amount >= 0 ? editing : null)}
      <p class="muted">Tip: pick &ldquo;Income&rdquo; as the type and the amount is added to this month&rsquo;s income. Income entries appear on the dashboard and in reports at once.</p>
    </section>
  </div>`;
}

// --- Expenses --------------------------------------------------------------
export function viewExpenses(doc) {
  const list = transactionsIn(doc, doc.month).filter((t) => t.amount < 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, t) => s + -t.amount, 0);
  const editing = doc._editing ? doc.transactions.find((t) => t.id === doc._editing) : null;
  return `
  <h1>Expenses</h1>
  <p class="lede">Everything the household spent in ${monthLabel(doc.month)} — ${list.length} payments,
  ${money(total)} in all. Add, edit or delete any line; the dashboard, planner and reports update immediately.</p>
  ${monthSwitcher(doc)}
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Spending in ${monthShort(doc.month)}</h2>
      ${transactionRows(doc, list, true)}
    </section>
    <section class="card">${addTransactionForm(doc, editing && editing.amount < 0 ? editing : null)}
      <p class="muted">Spending is shown as a positive amount here and stored as a negative one. Pick the category carefully — the planner and the donut chart group by it.</p>
    </section>
  </div>`;
}

// --- Planner ---------------------------------------------------------------
export function viewPlanner(doc) {
  const spent = categorySpent(doc, doc.month);
  const planned = doc.categories.reduce((s, c) => s + c.budget, 0);
  const spentTotal = Object.values(spent).reduce((s, v) => s + v, 0);
  return `
  <h1>Monthly planner</h1>
  <p class="lede">The plan for ${monthLabel(doc.month)}: ${money(planned)} set aside across
  ${doc.categories.length} categories, ${money(spentTotal)} spent so far. Change any monthly budget below
  and save — the dashboard&rsquo;s over/under flags follow the new numbers.</p>
  ${monthSwitcher(doc)}
  <div class="grid three" style="margin-top:14px">
    ${statCard('Planned', money(planned), 'Sum of all category budgets', '')}
    ${statCard('Spent so far', money(spentTotal), 'Across all categories', 'negative')}
    ${statCard('Still in the plan', money(planned - spentTotal), planned - spentTotal >= 0 ? 'Room left in the budget' : 'Plan already exceeded', planned - spentTotal >= 0 ? 'positive' : 'negative')}
  </div>
  <form class="card" id="planner-form" style="margin-top:16px">
    <h2>Category budgets — ${monthShort(doc.month)}</h2>
    ${doc.categories.map((c) => {
      const s = spent[c.id];
      const pct = c.budget > 0 ? Math.round((s / c.budget) * 100) : 0;
      const cls = s > c.budget ? 'over' : pct >= 80 ? 'near' : '';
      const pill = s > c.budget ? '<span class="pill over">over by ' + money(s - c.budget) + '</span>'
        : pct >= 80 ? '<span class="pill warn">' + pct + '% used</span>'
        : '<span class="pill ok">' + pct + '% used</span>';
      return `<div class="budget-row">
        <div class="cat">${c.icon} ${escapeHtml(c.name)}<span class="sub">${money(s)} of ${money(c.budget)} ${pill}</span></div>
        <div class="bar" role="img" aria-label="${escapeHtml(c.name)} ${pct}% of budget used"><span class="${cls}" style="width:${Math.min(100, pct)}%"></span></div>
        <div class="fig"><label class="visually-hidden" for="budget-${c.id}">Monthly budget for ${escapeHtml(c.name)}</label>
        <input type="number" id="budget-${c.id}" name="budget-${c.id}" min="0" step="1" value="${c.budget}" style="width:92px;text-align:right"> / mo</div>
      </div>`;
    }).join('')}
    <div class="form-actions"><button type="submit">Save planner</button>
    <span class="muted" id="planner-saved" aria-live="polite"></span></div>
  </form>
  <div class="callout"><strong>How the Anggrek family plans:</strong> housing and bills are fixed first,
  groceries get what is left after savings, and dining out is the first thing cut when a month runs hot.
  The 50/30/20 split for this plan is roughly ${money(Math.round(planned * 0.5))} needs, ${money(Math.round(planned * 0.3))} wants, ${money(Math.round(planned * 0.2))} savings.</div>`;
}

// --- Goals -----------------------------------------------------------------
export function viewGoals(doc) {
  const totalSaved = doc.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = doc.goals.reduce((s, g) => s + g.target, 0);
  const pct = Math.round((totalSaved / totalTarget) * 100);
  return `
  <h1>Savings goals</h1>
  <p class="lede">Four things the family is saving for: ${money(totalSaved)} saved toward
  ${money(totalTarget)} in total (${pct}%). Add money to a goal whenever there is spare cash at month&rsquo;s end.</p>
  <div class="grid two">
    ${doc.goals.map((g) => {
      const p = Math.min(100, Math.round((g.saved / g.target) * 100));
      const left = g.target - g.saved;
      return `<section class="card goal">
        <div class="goal-head"><strong>${escapeHtml(g.name)}</strong>
        <span class="pill ${p >= 100 ? 'ok' : p >= 50 ? 'warn' : 'due'}">${p}% funded</span></div>
        <p class="muted">${escapeHtml(g.note)}</p>
        <div class="bar" role="img" aria-label="${escapeHtml(g.name)} ${p}% funded"><span style="width:${p}%"></span></div>
        <p>${money(g.saved)} saved of ${money(g.target)} &middot; ${left > 0 ? money(left) + ' to go' : 'Goal reached!'}</p>
        <form class="goal-form" data-goal="${g.id}">
          <label class="visually-hidden" for="add-${g.id}">Add to ${escapeHtml(g.name)}</label>
          <input id="add-${g.id}" name="amount" type="number" min="1" step="1" placeholder="Add $&hellip;" required>
          <button type="submit">Add savings</button>
        </form>
      </section>`;
    }).join('')}
  </div>
  <section class="card" style="margin-top:16px">
    <h2>Start a new goal</h2>
    <form class="stacked" id="goal-form">
      <div class="form-row">
        <div><label for="goal-name">Goal name</label>
        <input id="goal-name" name="name" type="text" maxlength="60" placeholder="e.g. New washing machine" required></div>
        <div><label for="goal-target">Target ($)</label>
        <input id="goal-target" name="target" type="number" min="1" step="1" placeholder="1000" required></div>
      </div>
      <label for="goal-note">Why this matters</label>
      <input id="goal-note" name="note" type="text" maxlength="120" placeholder="e.g. The old one leaks every wash">
      <div class="form-actions"><button type="submit">Create goal</button></div>
    </form>
  </section>`;
}

// --- Bills -----------------------------------------------------------------
export function viewBills(doc) {
  const ym = doc.month;
  const paid = doc.bills.filter((b) => b.paidMonths[ym]);
  const unpaid = doc.bills.filter((b) => !b.paidMonths[ym]);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const rows = (list) => list.map((b) => `<div class="bill-row">
      <div><strong>${escapeHtml(b.name)}</strong>
      <div class="due">Due ${monthShort(ym)} ${b.dueDay} &middot; ${b.autopay ? 'autopay on' : 'pay by hand'}</div></div>
      <span class="amount">${money(b.amount)}</span>
      <button type="button" class="btn small ${b.paidMonths[ym] ? 'secondary' : ''}" data-action="bill-toggle" data-id="${b.id}">
        ${b.paidMonths[ym] ? 'Paid ✓ — undo' : 'Mark paid'}</button>
    </div>`).join('');
  return `
  <h1>Bills calendar</h1>
  <p class="lede">Every recurring bill for ${monthLabel(ym)}: ${money(paidTotal)} already paid,
  ${money(unpaidTotal)} still to go across ${unpaid.length} bill${unpaid.length === 1 ? '' : 's'}.
  Marking a bill paid here also records it as spending for the month.</p>
  ${monthSwitcher(doc)}
  <div class="grid two" style="margin-top:16px">
    <section class="card"><h2>Still to pay (${unpaid.length})</h2>
      ${unpaid.length ? rows(unpaid) : '<p class="muted">All bills paid — enjoy the quiet.</p>'}</section>
    <section class="card"><h2>Paid (${paid.length})</h2>
      ${paid.length ? rows(paid) : '<p class="muted">Nothing paid yet this month.</p>'}</section>
  </div>
  <section class="card" style="margin-top:16px">
    <h2>Add a bill</h2>
    <form class="stacked" id="bill-form">
      <div class="form-row">
        <div><label for="bill-name">Bill name</label>
        <input id="bill-name" name="name" type="text" maxlength="60" placeholder="e.g. Streaming bundle" required></div>
        <div><label for="bill-amount">Amount ($)</label>
        <input id="bill-amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>
      </div>
      <div class="form-row">
        <div><label for="bill-day">Due day of month</label>
        <input id="bill-day" name="dueDay" type="number" min="1" max="28" value="15" required></div>
        <div><label for="bill-autopay">Payment</label>
        <select id="bill-autopay" name="autopay"><option value="yes">Autopay</option><option value="no">Pay by hand</option></select></div>
      </div>
      <div class="form-actions"><button type="submit">Add bill</button></div>
    </form>
  </section>`;
}

// --- Reports ---------------------------------------------------------------
export function viewReports(doc) {
  const spent = categorySpent(doc, doc.month);
  const totals = monthTotals(doc, doc.month);
  const topCats = [...doc.categories]
    .map((c) => ({ ...c, spent: spent[c.id] }))
    .sort((a, b) => b.spent - a.spent).slice(0, 5);
  const trend = TREND_MONTHS.map((ym) => {
    if (TREND_PRIOR[ym]) return { label: monthShort(ym), ...TREND_PRIOR[ym] };
    const t = monthTotals(doc, ym);
    return { label: monthShort(ym), income: t.income, spent: t.spent };
  });
  const avgSpent = Math.round(trend.reduce((s, m) => s + m.spent, 0) / trend.length);
  const bestMonth = trend.reduce((a, b) => (b.income - b.spent > a.income - a.spent ? b : a));
  return `
  <h1>Reports</h1>
  <p class="lede">Six months of the Anggrek family&rsquo;s money at a glance. Average monthly spending is
  ${money(avgSpent)}; the best month for saving was <strong>${bestMonth.label}</strong> (${money(bestMonth.income - bestMonth.spent)} kept).</p>
  ${monthSwitcher(doc)}
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Income vs spending — last 6 months</h2>
      <div class="chart-box"><canvas id="chart-trend" width="560" height="260" role="img" aria-label="Bar chart of income versus spending for the last six months"></canvas></div>
    </section>
    <section class="card">
      <h2>Spending by category — ${monthShort(doc.month)}</h2>
      <div class="chart-box"><canvas id="chart-donut" width="320" height="320" role="img" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend" id="donut-legend"></ul></div>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card">
      <h2>Top spending categories — ${monthShort(doc.month)}</h2>
      <div class="chart-box"><canvas id="chart-cats" width="560" height="170" role="img" aria-label="Bar chart of top spending categories against budget"></canvas></div>
      <dl class="kv" style="margin-top:12px">
        ${topCats.map((c) => `<dt>${c.icon} ${escapeHtml(c.name)}</dt><dd>${money(c.spent)} of ${money(c.budget)} planned</dd>`).join('')}
      </dl>
    </section>
    <section class="card">
      <h2>${monthShort(doc.month)} in numbers</h2>
      <dl class="kv">
        <dt>Income</dt><dd>${money(totals.income)}</dd>
        <dt>Spent</dt><dd>${money(totals.spent)}</dd>
        <dt>Left over</dt><dd>${money(totals.left)}</dd>
        <dt>Savings rate</dt><dd>${totals.income > 0 ? Math.round((totals.left / totals.income) * 100) : 0}% of income kept</dd>
        <dt>Transactions</dt><dd>${transactionsIn(doc, doc.month).length} this month</dd>
        <dt>Biggest single spend</dt><dd>${(() => { const e = transactionsIn(doc, doc.month).filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount)[0]; return e ? escapeHtml(e.desc) + ' — ' + money(-e.amount) : '—'; })()}</dd>
        <dt>Most frequent payee</dt><dd>Green Mart — ${transactionsIn(doc, doc.month).filter((t) => t.desc.includes('Green Mart')).length} visits</dd>
      </dl>
      <p class="muted">Tip: export the month as CSV from <a href="#/settings">Settings</a> to keep a copy outside the browser.</p>
    </section>
  </div>`;
}

// --- Settings --------------------------------------------------------------
export function viewSettings(doc) {
  const totalTx = doc.transactions.length;
  return `
  <h1>Settings</h1>
  <p class="lede">Household details, your data, and a way back to the fresh demo figures.
  Everything is stored only in this browser.</p>
  <div class="grid two">
    <section class="card">
      <h2>Household</h2>
      <form class="stacked" id="settings-form">
        <label for="set-household">Household name</label>
        <input id="set-household" name="household" type="text" maxlength="60" value="${escapeHtml(doc.household)}" required>
        <label for="set-members">Members</label>
        <input id="set-members" name="members" type="text" maxlength="120" value="${escapeHtml(doc.members)}">
        <div class="form-actions"><button type="submit">Save household</button>
        <span class="muted" id="settings-saved" aria-live="polite"></span></div>
      </form>
    </section>
    <section class="card">
      <h2>Your data</h2>
      <p>${totalTx} transactions, ${doc.goals.length} savings goals and ${doc.bills.length} recurring bills are stored in this browser&rsquo;s local storage.</p>
      <div class="form-actions">
        <button type="button" class="btn secondary" data-action="export-csv">Download CSV</button>
        <button type="button" class="btn secondary" data-action="export-json">Download JSON</button>
      </div>
      <form class="stacked" id="import-form" style="margin-top:10px">
        <label for="import-file">Import transactions from CSV</label>
        <input id="import-file" name="file" type="file" accept=".csv,text/csv">
        <p class="muted">CSV columns: date (YYYY-MM-DD), description, category, amount. Amounts are negative for spending.</p>
      </form>
      <hr>
      <p><strong>Start over?</strong> Restore the original demo figures for the Anggrek family.</p>
      <button type="button" class="btn danger" data-action="reset-data">Reset demo data</button>
    </section>
  </div>
  <section class="card" style="margin-top:16px">
    <h2>About this budget</h2>
    <p>The Anggrek family is fictional, and so are these figures — they exist to show how a real household budget
    works: plan each category, record every payment, pay the bills on time, and move what is left into savings goals.
    The site runs entirely offline; there are no accounts, no tracking and no network requests.</p>
    <p class="muted">Built for the make.fun &ldquo;Make the best household budget site&rdquo; bounty.</p>
  </section>`;
}

// --- Search ----------------------------------------------------------------
export function viewSearch(doc, query) {
  const q = (query || '').trim().toLowerCase();
  const matches = q ? doc.transactions.filter((t) =>
    t.desc.toLowerCase().includes(q) || categoryOf(doc, t.category).name.toLowerCase().includes(q) ||
    t.date.includes(q)) : [];
  const billMatches = q ? doc.bills.filter((b) => b.name.toLowerCase().includes(q)) : [];
  const goalMatches = q ? doc.goals.filter((g) => g.name.toLowerCase().includes(q)) : [];
  return `
  <h1>Search</h1>
  <p class="lede">${q ? `Results for &ldquo;${escapeHtml(query)}&rdquo;` : 'Search transactions, bills and goals across the whole budget.'}</p>
  <form class="stacked" id="search-form" style="max-width:520px">
    <label for="search-box">Search the budget</label>
    <input id="search-box" name="q" type="search" value="${escapeHtml(query || '')}" placeholder="e.g. Green Mart, mortgage, cinema" autocomplete="off">
    <div class="form-actions"><button type="submit">Search</button></div>
  </form>
  ${q ? `
  <div class="section-head"><h2>Transactions (${matches.length})</h2></div>
  <div class="card">${transactionRows(doc, [...matches].sort((a, b) => b.date.localeCompare(a.date)), true)}</div>
  ${billMatches.length || goalMatches.length ? `<div class="section-head"><h2>Also found</h2></div>
  <div class="card">
    ${billMatches.map((b) => `<p>🧾 Bill: <strong>${escapeHtml(b.name)}</strong> — ${money(b.amount)}, due day ${b.dueDay}. <a href="#/bills">Open bills &rarr;</a></p>`).join('')}
    ${goalMatches.map((g) => `<p>🎯 Goal: <strong>${escapeHtml(g.name)}</strong> — ${money(g.saved)} of ${money(g.target)}. <a href="#/goals">Open goals &rarr;</a></p>`).join('')}
  </div>` : ''}
  ${!matches.length && !billMatches.length && !goalMatches.length ? '<div class="notice warn">Nothing matched. Try a payee (Green Mart), a category (groceries) or a date (2026-11).</div>' : ''}
  ` : '<p class="muted">Try &ldquo;Green Mart&rdquo;, &ldquo;mortgage&rdquo; or &ldquo;cinema&rdquo;.</p>'}`;
}
