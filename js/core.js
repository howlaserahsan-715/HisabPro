/* ═══════════════════════════════════════════════════════════
   HisabPro — core: state, data engine, charts, chrome, router
   ═══════════════════════════════════════════════════════════ */
'use strict';

const STORE_KEY = 'hisabpro.v1';
const DEFAULT_DEMO_USER = { name: 'Rahim Ahmed', email: 'rahim@hisabpro.app', createdAt: new Date().toISOString() };

let state = loadState() || HisabSeed.buildDemoState(null);
let currentRouteName = 'dashboard';
let authMode = 'signin';
let lastRenderedRoute = null;
let deferredInstallPrompt = null;

const ui = {
  filters: { q: '', type: 'all', category: 'all', account: 'all', period: 'month' },
  txLimit: 40,
  chartRange: '6m',
  dashRange: 'month',
  dashboardChartMetric: 'both',
  reportTab: 'overview',
  reportPeriod: 'month',
  budgetPeriod: 'monthly',
  settingsTab: 'profile',
  calendarCursor: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  chatBusy: false
};

/* ─────────── storage ─────────── */
function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.workspaces) || !Array.isArray(parsed.transactions)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function saveState(silent) {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    updateSyncChip(true);
  } catch (e) {
    if (!silent) toast(t('toast.error'), 'error');
  }
}

function updateSyncChip(saved) {
  const chip = document.getElementById('syncChip');
  const text = document.getElementById('syncText');
  if (!chip || !text) return;
  if (!navigator.onLine) {
    chip.classList.add('is-offline');
    text.textContent = HisabI18n.lang() === 'bn' ? 'অফলাইন · এই ডিভাইসে সংরক্ষিত' : 'Offline · saved on this device';
  } else {
    chip.classList.remove('is-offline');
    text.textContent = HisabI18n.lang() === 'bn' ? 'এই ডিভাইসে সংরক্ষিত' : 'Saved on this device';
  }
}

/* ─────────── small utilities ─────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => HisabI18n.escapeHtml(s);
const parse = (iso) => HisabI18n.parseDate(iso);
const taka = (n, opts) => HisabI18n.money(n, opts);
const takaShort = (n) => HisabI18n.moneyCompact(n);

function icon(name, cls = '') {
  return '<svg class="icon ' + cls + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
}
function initials(name) {
  return String(name || '?').trim().split(/\s+/).map((p) => p[0] || '').join('').slice(0, 2).toUpperCase();
}
function uid(prefix) { return HisabSeed.uid(prefix); }
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function isoOf(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function pctOf(part, whole) { return whole > 0 ? (part / whole) * 100 : 0; }

/* ─────────── workspace data access ─────────── */
function activeWs() {
  return state.workspaces.find((w) => w.id === state.activeWorkspaceId) || state.workspaces[0];
}
function displayWsName(ws = activeWs()) {
  if (!ws) return '';
  if (HisabI18n.lang() === 'bn') return ws.nameBn || t('ws.' + ws.type) || ws.name;
  return ws.name || t('ws.' + ws.type);
}
function wsAccounts(includeArchived = false) {
  return state.accounts.filter((a) => a.workspaceId === activeWs().id && (includeArchived || !a.archived));
}
function wsCategories(type) {
  return state.categories.filter((c) => c.workspaceId === activeWs().id && !c.archived && (!type || c.type === type));
}
function wsTransactions() {
  return state.transactions.filter((tx) => tx.workspaceId === activeWs().id);
}
function wsBudgets() { return state.budgets.filter((b) => b.workspaceId === activeWs().id); }
function wsGoals() { return state.goals.filter((g) => g.workspaceId === activeWs().id); }
function wsDebts() { return state.debts.filter((d) => d.workspaceId === activeWs().id); }
function wsRecurring() { return state.recurring.filter((r) => r.workspaceId === activeWs().id); }
function wsMembers() {
  const ws = activeWs();
  return (ws && ws.members) ? ws.members : [];
}
function accountById(id) { return state.accounts.find((a) => a.id === id); }
function categoryById(id) { return state.categories.find((c) => c.id === id); }
function catByKey(key) { return state.categories.find((c) => c.workspaceId === activeWs().id && c.key === key); }
function catLabel(cat) {
  if (!cat) return t('common.none');
  if (cat.name && cat.name !== cat.key) return cat.name;
  return t('cat.' + cat.key);
}
function catEmoji(cat) { return cat ? cat.emoji || '•' : '•'; }
function catColor(cat) { return cat ? cat.color || 'var(--brand)' : 'var(--muted)'; }
function accountName(id) { const a = accountById(id); return a ? a.name : '—'; }
function accountTypeLabel(type) { return t('acc.type.' + type) || type; }
function memberName(id) {
  const m = wsMembers().find((x) => x.id === id);
  if (!m) return '';
  return HisabI18n.lang() === 'bn' ? (m.nameBn || m.name) : m.name;
}
function memberById(id) { return wsMembers().find((x) => x.id === id); }
function roleLabel(role) { return t('role.' + role) || role; }
function workspaceRole() {
  const me = wsMembers().find((m) => m.role === 'owner') || wsMembers()[0];
  return me ? me.role : 'owner';
}
function memberActive() { return wsMembers().filter((m) => m.status === 'active'); }

/* ─────────── date ranges ─────────── */
function rangeFor(key) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const y = now.getFullYear(); const m = now.getMonth(); const d = now.getDate();
  const iso = isoOf;
  const startOfWeek = (date) => { const x = new Date(date); x.setDate(x.getDate() - x.getDay()); return x; };
  const lastDay = (yy, mm) => new Date(yy, mm + 1, 0);
  switch (key) {
    case 'today': return { start: iso(now), end: iso(now) };
    case 'yesterday': { const x = addDays(now, -1); return { start: iso(x), end: iso(x) }; }
    case 'week': { const s = startOfWeek(now); return { start: iso(s), end: iso(addDays(s, 6)) }; }
    case 'lastWeek': { const s = addDays(startOfWeek(now), -7); return { start: iso(s), end: iso(addDays(s, 6)) }; }
    case 'month': return { start: iso(new Date(y, m, 1)), end: iso(lastDay(y, m)) };
    case 'lastMonth': return { start: iso(new Date(y, m - 1, 1)), end: iso(lastDay(y, m - 1)) };
    case 'year': return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
    case 'lastYear': return { start: iso(new Date(y - 1, 0, 1)), end: iso(new Date(y - 1, 11, 31)) };
    case '6m': return { start: iso(new Date(y, m - 5, 1)), end: iso(lastDay(y, m)) };
    case '12m': return { start: iso(new Date(y, m - 11, 1)), end: iso(lastDay(y, m)) };
    case 'all': return { start: '0000-01-01', end: '9999-12-31' };
    default: return { start: iso(new Date(y, m, 1)), end: iso(lastDay(y, m)) };
  }
}
function previousRange(key) {
  switch (key) {
    case 'month': return rangeFor('lastMonth');
    case 'lastMonth': { const now = new Date(); const y = now.getFullYear(); const m = now.getMonth(); return { start: isoOf(new Date(y, m - 2, 1)), end: isoOf(new Date(y, m - 1, 0)) }; }
    case 'year': return rangeFor('lastYear');
    case 'week': return rangeFor('lastWeek');
    case 'today': return rangeFor('yesterday');
    case '6m': return { start: isoOf(new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)), end: isoOf(new Date(new Date().getFullYear(), new Date().getMonth() - 5, 0)) };
    case '12m': return { start: isoOf(new Date(new Date().getFullYear(), new Date().getMonth() - 23, 1)), end: isoOf(new Date(new Date().getFullYear(), new Date().getMonth() - 11, 0)) };
    default: return rangeFor('lastMonth');
  }
}
function rangeLabel(key) {
  return t('period.' + key) || t('period.month');
}
function inRange(iso, range) { return iso >= range.start && iso <= range.end; }
function txsInRange(range) { return wsTransactions().filter((tx) => inRange(tx.date, range)); }
function sumType(txs, type) {
  return txs.filter((tx) => tx.type === type).reduce((s, tx) => s + Number(tx.amount || 0), 0);
}
function sumByTypes(txs) {
  const income = sumType(txs, 'income');
  const expense = sumType(txs, 'expense');
  return { income, expense, net: income - expense };
}

/* ─────────── balances & analytics ─────────── */
function accountBalance(accountId, asOf) {
  const acc = accountById(accountId);
  if (!acc) return 0;
  let balance = Number(acc.opening) || 0;
  state.transactions.forEach((tx) => {
    if (tx.workspaceId !== acc.workspaceId) return;
    if (asOf && tx.date > asOf) return;
    if (tx.type === 'income' && tx.accountId === accountId) balance += Number(tx.amount);
    else if (tx.type === 'expense' && tx.accountId === accountId) balance -= Number(tx.amount);
    else if (tx.type === 'transfer') {
      if (tx.accountId === accountId) balance -= Number(tx.amount);
      if (tx.toAccountId === accountId) balance += Number(tx.amount);
    }
    // Savings-style expenses can also name a destination
    if (tx.type === 'expense' && tx.toAccountId === accountId) balance += Number(tx.amount);
  });
  return balance;
}
function totalBalance() {
  return wsAccounts().reduce((s, a) => s + accountBalance(a.id), 0);
}
function accountTxCount(accountId) {
  return wsTransactions().filter((tx) => tx.accountId === accountId || tx.toAccountId === accountId).length;
}
function accountFlow(accountId, range) {
  let inflow = 0; let outflow = 0;
  wsTransactions().forEach((tx) => {
    if (!inRange(tx.date, range)) return;
    if (tx.type === 'income' && tx.accountId === accountId) inflow += Number(tx.amount);
    else if (tx.type === 'expense' && tx.accountId === accountId) outflow += Number(tx.amount);
    else if (tx.type === 'transfer') {
      if (tx.accountId === accountId) outflow += Number(tx.amount);
      if (tx.toAccountId === accountId) inflow += Number(tx.amount);
    }
  });
  return { inflow, outflow };
}
function monthlySeries(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const startD = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endD = new Date(startD.getFullYear(), startD.getMonth() + 1, 0);
    const range = { start: isoOf(startD), end: isoOf(endD) };
    const txs = txsInRange(range);
    const sums = sumByTypes(txs);
    out.push({ key: isoOf(startD).slice(0, 7), label: HisabI18n.monthLabel(isoOf(startD)), full: HisabI18n.monthLabel(isoOf(startD), 'long'), income: sums.income, expense: sums.expense, net: sums.net, start: range.start, end: range.end });
  }
  return out;
}
function categoryBreakdown(type, range) {
  const txs = txsInRange(range).filter((tx) => tx.type === type);
  const total = txs.reduce((s, tx) => s + Number(tx.amount), 0);
  const map = new Map();
  txs.forEach((tx) => {
    const cat = categoryById(tx.categoryId);
    const key = cat ? cat.id : 'uncategorized';
    if (!map.has(key)) map.set(key, { cat, amount: 0, count: 0 });
    const item = map.get(key);
    item.amount += Number(tx.amount);
    item.count += 1;
  });
  return Array.from(map.values())
    .map((item) => ({ ...item, pct: pctOf(item.amount, total) }))
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({ ...item, total }));
}
function budgetRange(period) {
  if (period === 'daily') return rangeFor('today');
  if (period === 'weekly') return rangeFor('week');
  if (period === 'yearly') return rangeFor('year');
  return rangeFor('month');
}
function budgetSpent(budget, range) {
  const r = range || budgetRange(budget.period);
  const txs = txsInRange(r).filter((tx) => tx.type === 'expense');
  if (!budget.categoryKey) return txs.reduce((s, tx) => s + Number(tx.amount), 0);
  const cat = catByKey(budget.categoryKey);
  if (!cat) return 0;
  return txs.filter((tx) => tx.categoryId === cat.id).reduce((s, tx) => s + Number(tx.amount), 0);
}
function overallBudgetFor(period) {
  const list = wsBudgets().filter((b) => b.period === period);
  return list.find((b) => !b.categoryKey) || null;
}
function budgetStatus(spent, amount) {
  const pct = pctOf(spent, amount);
  return { pct, over: spent > amount, warning: pct >= 80, remaining: Math.max(0, amount - spent) };
}
function savingsTotal() { return wsGoals().reduce((s, g) => s + Number(g.saved || 0), 0); }
function debtsTotals() {
  const debts = wsDebts();
  const borrowed = debts.filter((d) => d.direction === 'borrowed').reduce((s, d) => s + Number(d.outstanding || 0), 0);
  const lent = debts.filter((d) => d.direction === 'lent').reduce((s, d) => s + Number(d.outstanding || 0), 0);
  return { borrowed, lent, net: borrowed - lent };
}
function savingsRate(range) {
  const sums = sumByTypes(txsInRange(range));
  return sums.income > 0 ? (sums.net / sums.income) * 100 : 0;
}
function topExpenseCategory(range) {
  const list = categoryBreakdown('expense', range);
  return list[0] || null;
}
function trendValue(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
function trendPill(value, invert = false) {
  const positive = value >= 0;
  const good = invert ? !positive : positive;
  const cls = Math.abs(value) < 0.05 ? 'flat' : good ? 'up' : 'down';
  const arrow = value >= 0 ? 'arrow-up-right' : 'arrow-down-left';
  return '<span class="trend ' + cls + '">' + icon(arrow) + HisabI18n.pct(Math.abs(value), 1) + '</span>';
}
function nextMonthForecast() {
  const series = monthlySeries(4).slice(0, 3);
  const avg = series.length ? series.reduce((s, m) => s + m.expense, 0) / series.length : 0;
  return avg;
}
function weekdaySpend(range) {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  txsInRange(range).filter((tx) => tx.type === 'expense').forEach((tx) => {
    const d = parse(tx.date);
    totals[d.getDay()] += Number(tx.amount);
  });
  return totals;
}

/* ─────────── charts ─────────── */
function niceMax(value) {
  if (value <= 0) return 1000;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}
function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return 'M' + points[0].x + ',' + points[0].y;
  let d = 'M' + points[0].x.toFixed(2) + ',' + points[0].y.toFixed(2);
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i]; const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ' C' + cx.toFixed(2) + ',' + p0.y.toFixed(2) + ' ' + cx.toFixed(2) + ',' + p1.y.toFixed(2) + ' ' + p1.x.toFixed(2) + ',' + p1.y.toFixed(2);
  }
  return d;
}
function lineChartSVG(series, opts = {}) {
  const w = 760; const h = opts.height || 250;
  const pad = { l: 48, r: 14, t: 18, b: 30 };
  const allValues = series.flatMap((m) => [m.income, m.expense]);
  const max = niceMax(Math.max(1, ...allValues));
  const xFor = (i) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, series.length - 1);
  const yFor = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const gid = 'grad-' + Math.random().toString(36).slice(2, 8);
  let grid = '';
  for (let i = 0; i <= 4; i += 1) {
    const value = (max / 4) * i;
    const y = yFor(value);
    grid += '<line class="grid-line" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y + '" y2="' + y + '"/>';
    grid += '<text class="axis-label" x="' + (pad.l - 8) + '" y="' + (y + 3.5) + '" text-anchor="end">' + takaShort(value) + '</text>';
  }
  const pointsIncome = series.map((m, i) => ({ x: xFor(i), y: yFor(m.income), v: m.income }));
  const pointsExpense = series.map((m, i) => ({ x: xFor(i), y: yFor(m.expense), v: m.expense }));
  const pathIncome = smoothPath(pointsIncome);
  const pathExpense = smoothPath(pointsExpense);
  const areaIncome = pathIncome + ' L' + xFor(series.length - 1) + ',' + (h - pad.b) + ' L' + xFor(0) + ',' + (h - pad.b) + ' Z';
  const areaExpense = pathExpense + ' L' + xFor(series.length - 1) + ',' + (h - pad.b) + ' L' + xFor(0) + ',' + (h - pad.b) + ' Z';
  let xLabels = '';
  series.forEach((m, i) => {
    if (series.length > 8 && i % 2 !== 0) return;
    xLabels += '<text class="axis-label" x="' + xFor(i) + '" y="' + (h - 9) + '" text-anchor="middle">' + esc(m.label) + '</text>';
  });
  let dots = '';
  const last = series.length - 1;
  if (last >= 0) {
    dots += '<circle class="chart-point" cx="' + pointsIncome[last].x + '" cy="' + pointsIncome[last].y + '" r="4" fill="#0e9f6e"/>';
    dots += '<circle class="chart-point" cx="' + pointsExpense[last].x + '" cy="' + pointsExpense[last].y + '" r="4" fill="#b8453d"/>';
  }
  return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Income and expense chart">' +
    '<defs>' +
    '<linearGradient id="' + gid + '-i" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e9f6e" stop-opacity=".20"/><stop offset="100%" stop-color="#0e9f6e" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="' + gid + '-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8453d" stop-opacity=".12"/><stop offset="100%" stop-color="#b8453d" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    grid +
    '<path d="' + areaIncome + '" fill="url(#' + gid + '-i)"/>' +
    '<path d="' + areaExpense + '" fill="url(#' + gid + '-e)"/>' +
    '<path class="chart-line" d="' + pathIncome + '" stroke="#0e9f6e"/>' +
    '<path class="chart-line" d="' + pathExpense + '" stroke="#b8453d"/>' +
    dots + xLabels + '</svg>';
}
function barChartSVG(series, opts = {}) {
  const w = 760; const h = opts.height || 260;
  const pad = { l: 48, r: 14, t: 18, b: 34 };
  const max = niceMax(Math.max(1, ...series.flatMap((m) => [m.income, m.expense])));
  const groupW = (w - pad.l - pad.r) / Math.max(1, series.length);
  const barW = Math.min(20, groupW * 0.26);
  const yFor = (v) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  let grid = '';
  for (let i = 0; i <= 4; i += 1) {
    const value = (max / 4) * i;
    const y = yFor(value);
    grid += '<line class="grid-line" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y + '" y2="' + y + '"/>';
    grid += '<text class="axis-label" x="' + (pad.l - 8) + '" y="' + (y + 3.5) + '" text-anchor="end">' + takaShort(value) + '</text>';
  }
  let bars = '';
  series.forEach((m, i) => {
    const cx = pad.l + groupW * i + groupW / 2;
    const yi = yFor(m.income); const ye = yFor(m.expense);
    bars += '<rect class="chart-bar" x="' + (cx - barW - 2) + '" y="' + yi + '" width="' + barW + '" height="' + Math.max(1, (h - pad.b) - yi) + '" fill="#0e9f6e" opacity=".9"/>';
    bars += '<rect class="chart-bar" x="' + (cx + 2) + '" y="' + ye + '" width="' + barW + '" height="' + Math.max(1, (h - pad.b) - ye) + '" fill="#b8453d" opacity=".82"/>';
    bars += '<text class="axis-label" x="' + cx + '" y="' + (h - 10) + '" text-anchor="middle">' + esc(m.label) + '</text>';
  });
  return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Income and expense bars">' + grid + bars + '</svg>';
}
function donutSVG(items, total, size = 128, thickness = 15) {
  const r = 50; const c = 2 * Math.PI * r;
  let offset = 0;
  let segments = '';
  const safeTotal = total || items.reduce((s, i) => s + i.amount, 0) || 1;
  items.forEach((item) => {
    const len = (item.amount / safeTotal) * c;
    if (len <= 0) return;
    const gap = Math.min(2.6, len * 0.18);
    segments += '<circle cx="60" cy="60" r="' + r + '" stroke="' + item.color + '" stroke-width="' + thickness + '" stroke-dasharray="' + Math.max(0.1, len - gap) + ' ' + (c - Math.max(0.1, len - gap)) + '" stroke-dashoffset="' + (-offset) + '"/>';
    offset += len;
  });
  return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="' + r + '" stroke="var(--surface-3)" stroke-width="' + thickness + '"/>' + segments + '</svg>';
}
function ringSVG(pct, color = 'var(--brand)', size = 64, thickness = 6) {
  const r = 50; const c = 2 * Math.PI * r;
  const value = clamp(pct, 0, 100);
  const len = (value / 100) * c;
  return '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="' + r + '" stroke="var(--surface-3)" stroke-width="' + thickness + '"/><circle cx="60" cy="60" r="' + r + '" stroke="' + color + '" stroke-width="' + thickness + '" stroke-dasharray="' + len + ' ' + (c - len) + '"/></svg>';
}

/* ─────────── chrome ─────────── */
function applyStaticI18n() {
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  const nav = document.querySelector('.side-nav');
  if (nav) nav.setAttribute('aria-label', t('nav.group.overview'));
  const search = document.getElementById('searchTrigger');
  if (search) search.setAttribute('aria-label', t('common.search') + ' ⌘ K');
  const lang = document.getElementById('langToggle');
  if (lang) {
    const code = state.settings.lang === 'bn' ? 'বাং' : 'EN';
    lang.title = t('set.language');
    lang.setAttribute('aria-label', t('set.language') + ' ' + code);
  }
  const theme = document.getElementById('themeToggle');
  if (theme) { theme.title = t('set.theme'); theme.setAttribute('aria-label', t('set.theme')); }
  const notif = document.getElementById('notifBtn');
  if (notif) { notif.title = t('nav.notifications'); notif.setAttribute('aria-label', t('nav.notifications')); }
  const add = document.getElementById('mobileAddBtn');
  if (add) add.setAttribute('aria-label', t('tx.new'));
  const more = document.getElementById('mobileMoreBtn');
  if (more) more.setAttribute('aria-label', t('nav.more'));
}
function applyPreferences() {
  const theme = state.settings.theme || 'light';
  const resolved = theme === 'system'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-lang', state.settings.lang || 'en');
  document.documentElement.setAttribute('lang', state.settings.lang === 'bn' ? 'bn' : 'en');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0a110e' : '#0a5c4a');
  applyStaticI18n();
}
function updateChrome() {
  const wasAuth = !state.user;
  document.getElementById('authView').classList.toggle('hidden', !wasAuth);
  document.getElementById('app').classList.toggle('hidden', wasAuth);
  if (wasAuth) return;
  const ws = activeWs();
  const user = state.user;
  const wsAvatar = document.getElementById('wsAvatar');
  if (wsAvatar) wsAvatar.textContent = (displayWsName(ws) || 'P').slice(0, 1).toUpperCase();
  const wsName = document.getElementById('wsName');
  if (wsName) wsName.textContent = displayWsName(ws);
  const avatar = document.getElementById('sideAvatar');
  if (avatar) avatar.textContent = initials(user.name);
  const sideName = document.getElementById('sideUserName');
  if (sideName) sideName.textContent = HisabI18n.lang() === 'bn' && state.settings.ownerNameBn ? state.settings.ownerNameBn : user.name;
  const role = document.getElementById('sideUserRole');
  if (role) role.textContent = roleLabel(workspaceRole()) + ' · ' + displayWsName(ws);
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.textContent = initials(user.name);
    profileBtn.setAttribute('aria-label', initials(user.name) + ' — ' + t('set.profile'));
  }
  const langCode = document.getElementById('langCode');
  if (langCode) langCode.textContent = HisabI18n.lang() === 'bn' ? 'বাং' : 'EN';
  const txCount = document.getElementById('txNavCount');
  if (txCount) {
    const count = wsTransactions().length;
    txCount.textContent = count ? (count > 999 ? '999+' : HisabI18n.number(count)) : '';
    txCount.style.display = count ? '' : 'none';
  }
  const unread = state.notifications.filter((n) => !n.read).length;
  const notifDot = document.getElementById('notifDot');
  if (notifDot) notifDot.classList.toggle('hidden', !unread);
  const notifNav = document.getElementById('notifNavCount');
  if (notifNav) {
    notifNav.textContent = unread ? HisabI18n.number(unread) : '';
    notifNav.style.display = unread ? '' : 'none';
  }
  updateSyncChip();
}

function setPageMeta(title, subtitle) {
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  document.title = title + ' · HisabPro';
}

function syncNav(route) {
  $$('.nav-item').forEach((el) => el.classList.toggle('is-active', el.dataset.route === route));
  $$('.bottom-item[data-route]').forEach((el) => el.classList.toggle('is-active', el.dataset.route === route));
}

function renderDrawer() {
  const nav = $('.side-nav');
  const drawerNav = document.getElementById('drawerNav');
  if (!nav || !drawerNav) return;
  const wsButtons = state.workspaces.map((ws) =>
    '<button class="workspace-switch" data-action="switch-workspace" data-id="' + ws.id + '" style="margin-bottom:6px">' +
    '<span class="ws-avatar" style="background:' + ws.color + '22;color:' + ws.color + ';border:1px solid ' + ws.color + '33">' + esc(displayWsName(ws).slice(0, 1)) + '</span>' +
    '<span class="ws-meta"><small>' + t('common.workspace') + '</small><b>' + esc(displayWsName(ws)) + '</b></span>' +
    (ws.id === state.activeWorkspaceId ? icon('check') : icon('chevron-down')) +
    '</button>'
  ).join('');
  drawerNav.innerHTML = wsButtons + nav.innerHTML;
  const drawerFoot = document.getElementById('drawerFoot');
  if (drawerFoot) {
    drawerFoot.innerHTML =
      '<div class="side-user" style="padding:8px 6px">' +
      '<span class="avatar">' + esc(initials(state.user.name)) + '</span>' +
      '<span class="side-user-meta"><b>' + esc(state.user.name) + '</b><small>' + esc(roleLabel(workspaceRole())) + '</small></span>' +
      '<button class="icon-btn subtle" data-action="sign-out" aria-label="Sign out">' + icon('logout') + '</button>' +
      '</div>';
  }
}

function openDrawer() {
  renderDrawer();
  document.getElementById('drawerRoot').classList.remove('hidden');
  document.body.classList.add('is-locked');
}
function closeDrawer() {
  document.getElementById('drawerRoot').classList.add('hidden');
  if (document.getElementById('modalRoot').classList.contains('hidden') && document.getElementById('sheetRoot').classList.contains('hidden')) document.body.classList.remove('is-locked');
}

function renderDrawerIfOpen() {
  if (!document.getElementById('drawerRoot').classList.contains('hidden')) renderDrawer();
}

/* ─────────── auth ─────────── */
function setAuthMode(mode) {
  authMode = mode;
  $$('.auth-tab').forEach((b) => {
    const on = b.dataset.authTab === mode;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  $$('.signup-only').forEach((el) => el.classList.toggle('hidden', mode !== 'signup'));
  const title = document.getElementById('authTitle');
  const sub = document.getElementById('authSubtitle');
  const submit = document.getElementById('authSubmit');
  if (title) title.textContent = t(mode === 'signup' ? 'auth.signupTitle' : 'auth.signinTitle');
  if (sub) sub.textContent = t(mode === 'signup' ? 'auth.signupSub' : 'auth.signinSub');
  if (submit) submit.textContent = t(mode === 'signup' ? 'auth.signup' : 'auth.signin');
  const err = document.getElementById('authError');
  if (err) err.classList.add('hidden');
}
function showAuth() {
  applyPreferences();
  updateChrome();
  setAuthMode('signin');
  document.body.classList.remove('is-locked');
}
function enterApp() {
  updateChrome();
  applyPreferences();
  const route = currentRoute();
  renderRoute(route || 'dashboard');
  if (!location.hash) location.hash = '#/dashboard';
}
function signIn(name, email) {
  state.user = { name: name || (email || 'User').split('@')[0], email: email || 'user@hisabpro.app', createdAt: new Date().toISOString() };
  saveState();
  enterApp();
}
function startDemo() {
  if (!state.transactions || state.transactions.length === 0) {
    state = HisabSeed.buildDemoState(DEFAULT_DEMO_USER);
  }
  if (!state.user) state.user = { ...DEFAULT_DEMO_USER };
  saveState();
  enterApp();
  toast(t('auth.welcomeBack') + ', ' + state.user.name.split(' ')[0] + '!', 'success');
}
function signOut() {
  state.user = null;
  saveState();
  showAuth();
}

/* ─────────── routing ─────────── */
const PAGE_META = {
  dashboard: ['nav.dashboard', 'dash.tagline'],
  transactions: ['tx.title', 'tx.sub'],
  accounts: ['acc.title', 'acc.sub'],
  budgets: ['budget.title', 'budget.sub'],
  savings: ['savings.title', 'savings.sub'],
  debts: ['debt.title', 'debt.sub'],
  reports: ['report.title', 'report.sub'],
  analytics: ['analytics.title', 'analytics.sub'],
  calendar: ['cal.title', 'cal.sub'],
  recurring: ['rec.title', 'rec.sub'],
  assistant: ['ai.title', 'ai.sub'],
  notifications: ['notif.title', 'notif.sub'],
  members: ['members.title', 'members.sub'],
  settings: ['set.title', 'set.sub']
};

function currentRoute() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const name = raw.split('?')[0];
  return PAGE_META[name] ? name : 'dashboard';
}

function navigate(route) {
  const target = '#/' + route;
  if (location.hash === target) {
    renderRoute(route);
    return;
  }
  location.hash = target;
}

function renderRoute(route) {
  if (!state.user) { showAuth(); return; }
  route = PAGE_META[route] ? route : 'dashboard';
  currentRouteName = route;
  applyPreferences();
  const meta = PAGE_META[route];
  setPageMeta(t(meta[0]), t(meta[1]));
  const view = document.getElementById('view');
  const renderers = {
    dashboard: viewDashboard,
    transactions: viewTransactions,
    accounts: viewAccounts,
    budgets: viewBudgets,
    savings: viewSavings,
    debts: viewDebts,
    reports: viewReports,
    analytics: viewAnalytics,
    calendar: viewCalendar,
    recurring: viewRecurring,
    assistant: viewAssistant,
    notifications: viewNotifications,
    members: viewMembers,
    settings: viewSettings
  };
  try {
    view.innerHTML = renderers[route] ? renderers[route]() : viewDashboard();
  } catch (err) {
    console.error(err);
    view.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('assistant') + '</div><h4>Something went wrong</h4><p>' + esc(String(err && err.message || err)) + '</p><button class="btn btn--primary" data-route="dashboard">Back to dashboard</button></div>';
  }
  syncNav(route);
  updateChrome();
  if (lastRenderedRoute !== route) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    lastRenderedRoute = route;
  }
  const q = new URLSearchParams((location.hash.split('?')[1] || ''));
  if (q.get('add')) {
    const type = q.get('add');
    history.replaceState(null, '', location.pathname + location.search + '#/' + route);
    setTimeout(() => openTransactionModal(null, type === 'income' || type === 'transfer' ? type : 'expense'), 80);
  }
}

/* ─────────── modal / toast / sheet ─────────── */
function openModal(opts) {
  const root = document.getElementById('modalRoot');
  const modal = root.querySelector('.modal');
  modal.classList.toggle('modal--wide', !!opts.wide);
  document.getElementById('modalTitle').textContent = opts.title || '';
  const sub = document.getElementById('modalSubtitle');
  sub.textContent = opts.subtitle || '';
  sub.style.display = opts.subtitle ? '' : 'none';
  document.getElementById('modalBody').innerHTML = opts.body || '';
  const foot = document.getElementById('modalFoot');
  foot.innerHTML = opts.footer || '';
  foot.style.display = opts.footer ? '' : 'none';
  root.classList.remove('hidden');
  document.body.classList.add('is-locked');
  const focusable = root.querySelector('input:not([type="hidden"]), select, textarea, button');
  if (focusable) setTimeout(() => focusable.focus(), 60);
}
function closeModal() {
  document.getElementById('modalRoot').classList.add('hidden');
  if (document.getElementById('sheetRoot').classList.contains('hidden') && document.getElementById('drawerRoot').classList.contains('hidden')) {
    document.body.classList.remove('is-locked');
  }
}
function confirmDialog(opts) {
  const danger = opts.danger !== false;
  openModal({
    title: opts.title || t('common.confirm'),
    subtitle: opts.subtitle || '',
    body: '<p class="confirm-text">' + esc(opts.text || '') + '</p>' + (opts.amount ? '<div class="confirm-amount">' + esc(opts.amount) + '</div>' : ''),
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button>' +
      '<button class="btn ' + (danger ? 'btn--danger' : 'btn--primary') + '" id="confirmAction">' + esc(opts.confirmLabel || t('common.confirm')) + '</button>'
  });
  const btn = document.getElementById('confirmAction');
  if (btn) {
    btn.addEventListener('click', () => {
      closeModal();
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    });
  }
}
function toast(message, type = 'success') {
  const root = document.getElementById('toastRoot');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = icon(type === 'error' ? 'close' : 'check') + '<span>' + esc(message) + '</span>';
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 260);
  }, 2800);
}
function openSheet() {
  const actions = [
    { type: 'income', label: t('add.income'), icon: 'arrow-down-left', cls: '' },
    { type: 'expense', label: t('add.expense'), icon: 'arrow-up-right', cls: 'expense' },
    { type: 'transfer', label: t('common.transfer'), icon: 'transfer', cls: 'transfer' },
    { type: 'savings', label: t('savings.contribute'), icon: 'savings', cls: 'savings' }
  ];
  const el = document.getElementById('sheetActions');
  el.innerHTML = actions.map((a) =>
    '<button class="sheet-action" data-action="' + (a.type === 'savings' ? 'add-contribution' : 'add-tx') + '" data-type="' + (a.type === 'savings' ? '' : a.type) + '">' +
    '<span class="qt-icon ' + a.cls + '">' + icon(a.icon) + '</span><span>' + esc(a.label) + '</span></button>'
  ).join('');
  document.getElementById('sheetRoot').classList.remove('hidden');
  document.body.classList.add('is-locked');
}
function closeSheet() {
  document.getElementById('sheetRoot').classList.add('hidden');
  if (document.getElementById('modalRoot').classList.contains('hidden') && document.getElementById('drawerRoot').classList.contains('hidden')) {
    document.body.classList.remove('is-locked');
  }
}

/* ─────────── misc helpers ─────────── */
function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function audit(action, meta) {
  state.audit = state.audit || [];
  state.audit.unshift({
    id: uid('audit'),
    time: new Date().toISOString(),
    workspaceId: activeWs() ? activeWs().id : null,
    user: state.user ? state.user.email : 'system',
    action,
    meta: meta || {}
  });
  state.audit = state.audit.slice(0, 250);
}
function addNotification(type, title, text) {
  state.notifications.unshift({
    id: uid('notif'),
    workspaceId: activeWs().id,
    type,
    title,
    text,
    time: new Date().toISOString(),
    read: false
  });
}
function memberInitialsColor(m) { return m.color || '#0b7a58'; }
function typeLabel(type) { return t('common.' + type); }
function typeChip(type) {
  const cls = type === 'income' ? 'chip--income' : type === 'expense' ? 'chip--expense' : 'chip--transfer';
  return '<span class="chip ' + cls + '">' + typeLabel(type) + '</span>';
}
function signedAmount(tx) {
  if (tx.type === 'income') return '<b class="income">+ ' + taka(tx.amount) + '</b>';
  if (tx.type === 'expense') return '<b class="expense">− ' + taka(tx.amount) + '</b>';
  return '<b class="transfer">' + taka(tx.amount) + '</b>';
}
function transactionRowHTML(tx, opts = {}) {
  const cat = categoryById(tx.categoryId);
  const isTransfer = tx.type === 'transfer';
  const title = tx.description || (isTransfer ? t('common.transfer') : catLabel(cat));
  const subParts = [];
  if (isTransfer) {
    subParts.push(accountName(tx.accountId) + ' → ' + accountName(tx.toAccountId));
  } else {
    subParts.push(catLabel(cat));
    subParts.push(accountName(tx.accountId));
  }
  if (opts.showMember && tx.memberId) subParts.push(memberName(tx.memberId));
  subParts.push(HisabI18n.date(tx.date, 'short'));
  return '<div class="tx-item" data-tx-id="' + esc(tx.id) + '">' +
    '<span class="tx-icon" style="background:' + catColor(cat) + '16;color:' + catColor(cat) + '">' + (isTransfer ? icon('transfer') : catEmoji(cat)) + '</span>' +
    '<div class="tx-main"><b>' + esc(title) + '</b><small>' + esc(subParts.filter(Boolean).join(' · ')) + '</small></div>' +
    '<div class="tx-amount">' + signedAmount(tx) + '<small>' + esc(tx.paymentMethod || '') + '</small></div>' +
    '<div class="tx-actions">' +
    '<button class="icon-btn" data-action="edit-tx" data-id="' + esc(tx.id) + '" aria-label="Edit">' + icon('edit') + '</button>' +
    '<button class="icon-btn danger" data-action="delete-tx" data-id="' + esc(tx.id) + '" aria-label="Delete">' + icon('trash') + '</button>' +
    '</div></div>';
}
function sectionHead(title, sub, linkRoute, linkText) {
  return '<div class="section-head"><div><h3>' + esc(title) + '</h3>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' +
    (linkRoute ? '<a class="link" href="#/' + linkRoute + '" data-route="' + linkRoute + '">' + esc(linkText || t('common.viewAll')) + icon('arrow-up-right') + '</a>' : '') + '</div>';
}
function emptyState(iconName, title, text, actionHTML) {
  return '<div class="empty-state"><div class="empty-icon">' + icon(iconName) + '</div><h4>' + esc(title) + '</h4><p>' + esc(text) + '</p>' + (actionHTML || '') + '</div>';
}
