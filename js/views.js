/* ═══════════════════════════════════════════════════════════
   HisabPro — page views
   ═══════════════════════════════════════════════════════════ */

function sortTxDesc(list) {
  return list.slice().sort((a, b) => (String(b.date) + String(b.createdAt || '')).localeCompare(String(a.date) + String(a.createdAt || '')));
}
function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'dash.greeting.morning' : h < 17 ? 'dash.greeting.afternoon' : 'dash.greeting.evening';
}
function upcomingItems(days = 45) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const items = [];
  wsRecurring().filter((r) => r.active).forEach((r) => {
    const diff = daysBetween(todayISO(), r.nextDate);
    if (diff >= -1 && diff <= days) items.push({ date: r.nextDate, name: r.name, meta: typeLabel(r.type) + ' · ' + accountName(state.accounts.filter((a) => a.workspaceId === activeWs().id)[r.accountIndex] ? state.accounts.filter((a) => a.workspaceId === activeWs().id)[r.accountIndex].id : ''), amount: r.amount, type: r.type, diff });
  });
  wsDebts().filter((d) => d.outstanding > 0 && d.dueDate).forEach((d) => {
    const diff = daysBetween(todayISO(), d.dueDate);
    if (diff >= -1 && diff <= days) items.push({ date: d.dueDate, name: (d.direction === 'borrowed' ? t('debt.borrowed') : t('debt.lent')) + ' · ' + d.party, meta: t('debt.remaining'), amount: d.outstanding, type: d.direction === 'borrowed' ? 'expense' : 'income', diff });
  });
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
function dateBadge(iso) {
  const d = parse(iso);
  return '<span class="due-date"><b>' + HisabI18n.number(d.getDate()) + '</b><small>' + HisabI18n.monthLabel(iso) + '</small></span>';
}

/* ══════════════════ DASHBOARD ══════════════════ */
function viewDashboard() {
  const range = rangeFor(ui.dashRange);
  const prevRange = previousRange(ui.dashRange);
  const sums = sumByTypes(txsInRange(range));
  const prev = sumByTypes(txsInRange(prevRange));
  const balance = totalBalance();
  const accounts = wsAccounts();
  const monthlyBudget = overallBudgetFor('month');
  const monthSpent = monthlyBudget ? budgetSpent(monthlyBudget) : sumByTypes(txsInRange(rangeFor('month'))).expense;
  const budgetStat = budgetStatus(monthSpent, monthlyBudget ? monthlyBudget.amount : monthSpent || 1);
  const topCat = topExpenseCategory(range);
  const catList = categoryBreakdown('expense', range);
  const cats = catList.slice(0, 5);
  const series = monthlySeries(ui.chartRange === '12m' ? 12 : 6);
  const recent = sortTxDesc(wsTransactions()).slice(0, 6);
  const upcoming = upcomingItems(40).slice(0, 5);
  const active = wsMembers().filter((m) => m.status === 'active').length;
  const expensePct = sums.income > 0 ? (sums.expense / sums.income) * 100 : 0;
  const savingsRateNow = sums.income > 0 ? (sums.net / sums.income) * 100 : 0;

  const kpi = (label, value, iconName, cls, trend, footLeft, footRight) =>
    '<article class="kpi">' +
    '<div class="kpi-top"><span class="kpi-icon ' + cls + '">' + icon(iconName) + '</span><span class="kpi-label">' + esc(label) + '</span>' + (trend || '') + '</div>' +
    '<div class="kpi-value">' + value + '</div>' +
    '<div class="kpi-foot"><span>' + footLeft + '</span><span>' + footRight + '</span></div>' +
    '</article>';

  const insight = topCat
    ? '<div class="insight-card"><div class="insight-top"><span class="insight-icon">' + icon('spark') + '</span><h4>' + t('dash.insight') + '</h4></div>' +
      '<p>' + (HisabI18n.lang() === 'bn'
        ? 'এই মাসে আপনি সবচেয়ে বেশি ব্যয় করেছেন <b>' + esc(catLabel(topCat.cat)) + '</b>-এ — মোট ব্যয়ের ' + HisabI18n.pct(topCat.pct, 1) + '।'
        : 'You spent the most on <b>' + esc(catLabel(topCat.cat)) + '</b> this month — ' + HisabI18n.pct(topCat.pct, 1) + ' of total expenses.') + '</p>' +
      '<div class="insight-foot">' + icon('clock') + '<span>' + (monthlyBudget ? (budgetStat.over ? t('budget.over') : t('budget.utilized') + ' ' + HisabI18n.pct(budgetStat.pct, 0)) : t('analytics.estimate')) + '</span></div></div>'
    : '<div class="insight-card"><div class="insight-top"><span class="insight-icon">' + icon('spark') + '</span><h4>' + t('dash.insight') + '</h4></div><p>' + t('dash.noData') + '</p></div>';

  return '' +
    '<div class="dash-hero">' +
      '<div><h2>' + t(greetingKey()) + ', <span>' + esc(state.user.name.split(' ')[0]) + '</span></h2>' +
      '<p>' + t('dash.subtitle') + ' · ' + esc(HisabI18n.date(todayISO(), 'long')) + ' · ' + esc(displayWsName()) + '</p></div>' +
      '<div class="dash-actions">' +
        '<select class="range-chip" id="dashRange" aria-label="Date range" style="padding-right:34px">' +
          ['month', 'lastMonth', 'week', 'year'].map((k) => '<option value="' + k + '"' + (ui.dashRange === k ? ' selected' : '') + '>' + rangeLabel(k) + '</option>').join('') +
        '</select>' +
        '<button class="btn btn--primary" data-action="add-tx" data-type="expense">' + icon('plus') + t('add.expense') + '</button>' +
        '<button class="btn btn--ghost" data-action="add-tx" data-type="income">' + icon('arrow-down-left') + t('add.income') + '</button>' +
        '<button class="btn btn--ghost" data-action="add-tx" data-type="transfer">' + icon('transfer') + t('common.transfer') + '</button>' +
      '</div>' +
    '</div>' +

    '<div class="grid grid--4" style="margin-bottom:14px">' +
      kpi(t('dash.balance'), taka(balance), 'wallet', '', '', HisabI18n.number(accounts.length) + ' ' + (HisabI18n.lang() === 'bn' ? 'টি অ্যাকাউন্ট' : 'accounts'), active + ' ' + (HisabI18n.lang() === 'bn' ? 'জন সদস্য' : 'members')) +
      kpi(t('dash.income'), taka(sums.income), 'arrow-down-left', 'income', trendPill(trendValue(sums.income, prev.income)), rangeLabel(ui.dashRange), t('dash.vsPrev')) +
      kpi(t('dash.expenses'), taka(sums.expense), 'arrow-up-right', 'expense', trendPill(trendValue(sums.expense, prev.expense), true), rangeLabel(ui.dashRange), HisabI18n.pct(expensePct, 0) + ' ' + (HisabI18n.lang() === 'bn' ? 'আয়ের' : 'of income')) +
      kpi(t('dash.savings'), taka(sums.net), 'savings', 'savings', trendPill(trendValue(sums.net, prev.net)), rangeLabel(ui.dashRange), HisabI18n.pct(savingsRateNow, 0) + ' ' + (HisabI18n.lang() === 'bn' ? 'সঞ্চয় হার' : 'savings rate')) +
    '</div>' +

    '<div class="grid grid--dash">' +
      '<div class="stack">' +
        '<section class="card chart-card">' +
          '<div class="chart-head"><div><h3>' + t('dash.cashflow') + '</h3><p>' + t('dash.cashflow.sub') + '</p></div>' +
            '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
              '<div class="chart-legend"><span><i class="legend-dot" style="background:#0e9f6e"></i>' + t('common.income') + '</span><span><i class="legend-dot" style="background:#e0645a"></i>' + t('common.expense') + '</span></div>' +
              '<div class="segmented"><button data-action="chart-range" data-range="6m" class="' + (ui.chartRange === '6m' ? 'is-active' : '') + '">6M</button><button data-action="chart-range" data-range="12m" class="' + (ui.chartRange === '12m' ? 'is-active' : '') + '">1Y</button></div>' +
            '</div>' +
          '</div>' +
          lineChartSVG(series) +
        '</section>' +

        '<section class="card card--pad">' +
          sectionHead(t('dash.category'), t('dash.category.sub'), 'analytics', t('common.viewAll')) +
          (cats.length
            ? '<div class="donut-wrap"><div class="donut">' + donutSVG(cats.map((c) => ({ amount: c.amount, color: catColor(c.cat) })), catList.reduce((s, c) => s + c.amount, 0)) + '<div class="donut-center"><small>' + t('dash.expenses') + '</small><b>' + takaShort(sums.expense) + '</b></div></div>' +
              '<div class="cat-list">' + cats.map((c) => '<div class="cat-row"><i class="cat-dot" style="background:' + catColor(c.cat) + '"></i><span class="cat-name">' + esc(catLabel(c.cat)) + '</span><span class="cat-val">' + takaShort(c.amount) + '</span><span class="cat-pct">' + HisabI18n.pct(c.pct, 0) + '</span></div>').join('') + '</div></div>'
            : '<p class="muted" style="font-size:11.5px;padding:8px 0 4px">' + t('dash.noData') + '</p>') +
        '</section>' +

        '<section class="card card--pad">' +
          sectionHead(t('dash.recent'), '', 'transactions', t('common.viewAll')) +
          (recent.length
            ? '<div class="tx-list">' + recent.map((tx) => transactionRowHTML(tx, { showMember: false })).join('') + '</div>'
            : emptyState('transactions', t('tx.empty'), t('tx.emptySub'), '<button class="btn btn--primary" data-action="add-tx" data-type="expense">' + t('empty.addFirst') + '</button>')) +
        '</section>' +
      '</div>' +

      '<div class="stack">' +
        '<section class="card card--pad">' +
          sectionHead(t('dash.budget'), t('dash.budget.sub'), 'budgets', t('common.details')) +
          (monthlyBudget
            ? '<div class="budget-hero"><div><small>' + t('budget.spent') + '</small><strong>' + taka(monthSpent) + '</strong><small>' + t('budget.of') + ' ' + taka(monthlyBudget.amount) + '</small></div>' +
              '<div class="ring">' + ringSVG(budgetStat.pct, budgetStat.over ? 'var(--danger)' : budgetStat.warning ? 'var(--warning)' : 'var(--brand)') + '<span class="ring-label">' + HisabI18n.pct(Math.min(999, budgetStat.pct), 0) + '</span></div></div>' +
              '<div class="progress ' + (budgetStat.over ? 'is-danger' : budgetStat.warning ? 'is-warning' : '') + '" style="margin-top:14px"><i style="width:' + clamp(budgetStat.pct, 0, 100) + '%"></i></div>' +
              '<div class="budget-line"><span>' + (budgetStat.over ? t('budget.overBy') + ' ' + taka(monthSpent - monthlyBudget.amount) : t('dash.remaining') + ' ' + taka(budgetStat.remaining)) + '</span><span>' + HisabI18n.pct(budgetStat.pct, 0) + ' ' + t('budget.utilized') + '</span></div>'
            : '<p class="muted" style="font-size:11.5px;padding:6px 0 12px">' + t('budget.noAlerts') + '</p><button class="btn btn--soft btn--full" data-action="add-budget">' + icon('plus') + t('budget.new') + '</button>') +
        '</section>' +

        insight +

        '<section class="card card--pad">' +
          '<div class="section-head"><div><h3>' + t('dash.upcoming') + '</h3><p>' + (upcoming.length + ' ' + (HisabI18n.lang() === 'bn' ? 'টি নির্ধারিত' : 'scheduled')) + '</p></div><a class="link" href="#/recurring" data-route="recurring">' + t('nav.recurring') + icon('arrow-up-right') + '</a></div>' +
          (upcoming.length
            ? upcoming.map((u) => '<div class="upcoming-row">' + dateBadge(u.date) +
              '<div class="upcoming-main"><b>' + esc(u.name) + '</b><small>' + esc(u.meta) + ' · ' + (u.diff < 0 ? t('debt.overdue') : u.diff === 0 ? t('common.today') : HisabI18n.number(u.diff) + (HisabI18n.lang() === 'bn' ? ' দিনে' : 'd left')) + '</small></div>' +
              '<span class="upcoming-amt">' + taka(u.amount) + '</span></div>').join('')
            : '<p class="muted" style="font-size:11.5px;padding:6px 0 2px">' + t('cal.noEvents') + '</p>') +
        '</section>' +

        '<section class="card card--pad">' +
          sectionHead(t('dash.accounts'), '', 'accounts', t('common.viewAll')) +
          '<div class="account-strip" style="grid-template-columns:repeat(2,minmax(0,1fr))">' +
          accounts.slice(0, 4).map((a) => {
            const col = HisabSeed.ACCOUNT_COLORS[a.type] || HisabSeed.ACCOUNT_COLORS.custom;
            return '<div class="mini-account"><div class="mini-account-top"><span class="acc-dot" style="background:' + col.soft + ';color:' + col.ink + '">' + icon(a.type === 'bank' ? 'bank' : a.type === 'card' ? 'card' : a.type === 'cash' ? 'cash' : a.type === 'savings' ? 'savings' : 'mobile') + '</span><span>' + esc(a.name) + '</span></div><b>' + taka(accountBalance(a.id)) + '</b></div>';
          }).join('') +
          '</div>' +
        '</section>' +
      '</div>' +
    '</div>';
}

/* ══════════════════ TRANSACTIONS ══════════════════ */
function filteredTransactions() {
  const range = rangeFor(ui.filters.period);
  const q = ui.filters.q.trim().toLowerCase();
  return sortTxDesc(wsTransactions().filter((tx) => {
    if (!inRange(tx.date, range)) return false;
    if (ui.filters.type !== 'all' && tx.type !== ui.filters.type) return false;
    if (ui.filters.category !== 'all' && tx.categoryId !== ui.filters.category) return false;
    if (ui.filters.account !== 'all' && tx.accountId !== ui.filters.account && tx.toAccountId !== ui.filters.account) return false;
    if (q) {
      const cat = categoryById(tx.categoryId);
      const hay = [tx.description, catLabel(cat), accountName(tx.accountId), accountName(tx.toAccountId), tx.paymentMethod, tx.amount, tx.date].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }));
}
function txResultsHTML() {
  const list = filteredTransactions();
  const sums = sumByTypes(list);
  const shown = list.slice(0, ui.txLimit);
  const groups = new Map();
  shown.forEach((tx) => { if (!groups.has(tx.date)) groups.set(tx.date, []); groups.get(tx.date).push(tx); });
  let html = '';
  groups.forEach((txsOnDay, day) => {
    const daySums = sumByTypes(txsOnDay);
    html += '<div class="tx-group"><div class="tx-group-head"><span>' + esc(HisabI18n.relativeDay(day)) + ' · ' + esc(HisabI18n.date(day, 'short')) + '</span><b>' + (daySums.net >= 0 ? '+' : '−') + taka(Math.abs(daySums.net)) + '</b></div>' +
      txsOnDay.map((tx) => transactionRowHTML(tx, { showMember: wsMembers().length > 1 })).join('') + '</div>';
  });
  if (!list.length) {
    html = emptyState('search', t('tx.empty'), t('tx.emptySub'), '<button class="btn btn--ghost" data-action="clear-filters">' + t('common.all') + '</button>');
  } else if (list.length > shown.length) {
    html += '<div style="text-align:center;margin-top:14px"><button class="btn btn--ghost" data-action="tx-load-more">' + (HisabI18n.lang() === 'bn' ? 'আরও দেখুন' : 'Load more') + ' (' + HisabI18n.number(list.length - shown.length) + ')</button></div>';
  }
  const summary = '<div class="tx-summary" id="txSummary"><span><b>' + HisabI18n.number(list.length) + '</b> ' + t('tx.count') + '</span><span>' + t('tx.in') + ' <b class="pos">' + taka(sums.income) + '</b></span><span>' + t('tx.out') + ' <b class="neg">' + taka(sums.expense) + '</b></span><span>' + t('tx.net') + ' <b>' + (sums.net >= 0 ? '+' : '−') + taka(Math.abs(sums.net)) + '</b></span></div>';
  return { html, summary };
}
function refreshTransactionResults() {
  const data = txResultsHTML();
  const results = document.getElementById('txResults');
  const summary = document.getElementById('txSummary');
  if (results) results.innerHTML = data.html;
  if (summary) summary.outerHTML = data.summary;
}
function viewTransactions() {
  const accounts = wsAccounts();
  const cats = wsCategories();
  const data = txResultsHTML();
  const periods = ['month', 'all', 'today', 'week', 'lastMonth', 'year'];
  return '' +
    '<div class="page-head"><div><h2>' + t('tx.title') + '</h2><p>' + t('tx.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="add-tx" data-type="expense">' + icon('plus') + t('tx.new') + '</button></div></div>' +
    '<div class="toolbar">' +
      '<div class="filter-search">' + icon('search') + '<input id="txSearch" type="search" placeholder="' + t('tx.searchPlaceholder') + '" value="' + esc(ui.filters.q) + '" autocomplete="off" /></div>' +
      '<select data-filter="type" aria-label="Type"><option value="all">' + t('tx.allTypes') + '</option>' + ['income', 'expense', 'transfer'].map((x) => '<option value="' + x + '"' + (ui.filters.type === x ? ' selected' : '') + '>' + typeLabel(x) + '</option>').join('') + '</select>' +
      '<select data-filter="category" aria-label="Category"><option value="all">' + t('tx.allCategories') + '</option>' + cats.map((c) => '<option value="' + c.id + '"' + (ui.filters.category === c.id ? ' selected' : '') + '>' + esc(catLabel(c)) + '</option>').join('') + '</select>' +
      '<select data-filter="account" aria-label="Account"><option value="all">' + t('tx.allAccounts') + '</option>' + accounts.map((a) => '<option value="' + a.id + '"' + (ui.filters.account === a.id ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('') + '</select>' +
      '<select data-filter="period" aria-label="Period">' + periods.map((p) => '<option value="' + p + '"' + (ui.filters.period === p ? ' selected' : '') + '>' + rangeLabel(p) + '</option>').join('') + '</select>' +
      '<button class="icon-btn" data-action="clear-filters" title="' + t('common.all') + '">' + icon('filter') + '</button>' +
    '</div>' +
    data.summary +
    '<div id="txResults">' + data.html + '</div>';
}

/* ══════════════════ ACCOUNTS ══════════════════ */
function viewAccounts() {
  const accounts = wsAccounts();
  const total = totalBalance();
  return '' +
    '<div class="page-head"><div><h2>' + t('acc.title') + '</h2><p>' + t('acc.sub') + '</p></div>' +
      '<div class="page-head-actions">' +
        '<button class="btn btn--ghost" data-action="add-tx" data-type="transfer">' + icon('transfer') + t('acc.transfer') + '</button>' +
        '<button class="btn btn--primary" data-action="add-account">' + icon('plus') + t('acc.new') + '</button>' +
      '</div></div>' +
    '<section class="card card--pad" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
      '<div><span class="kpi-label">' + t('dash.balance') + '</span><div style="font-size:28px;font-weight:750;letter-spacing:-.045em;margin-top:3px">' + taka(total) + '</div>' +
      '<small class="muted" style="font-size:10.5px">' + HisabI18n.number(accounts.length) + ' ' + (HisabI18n.lang() === 'bn' ? 'টি সক্রিয় অ্যাকাউন্ট' : 'active accounts') + ' · ' + t('acc.currency') + ': BDT (৳)</small></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip--brand">' + icon('shield') + (HisabI18n.lang() === 'bn' ? 'ওয়ার্কস্পেস আলাদা' : 'Workspace isolated') + '</span><span class="chip chip--muted">' + icon('check') + (HisabI18n.lang() === 'bn' ? 'স্থানীয়ভাবে সংরক্ষিত' : 'Saved locally') + '</span></div>' +
    '</section>' +
    (accounts.length
      ? '<div class="account-grid">' + accounts.map((a) => {
        const col = HisabSeed.ACCOUNT_COLORS[a.type] || HisabSeed.ACCOUNT_COLORS.custom;
        const balance = accountBalance(a.id);
        const txCount = accountTxCount(a.id);
        const iconName = a.type === 'bank' ? 'bank' : a.type === 'card' ? 'card' : a.type === 'cash' ? 'cash' : a.type === 'savings' ? 'savings' : 'mobile';
        return '<article class="account-card" style="--acc-soft:' + col.soft + ';--acc-ink:' + col.ink + '">' +
          '<div class="account-card-top"><span class="account-type-icon">' + icon(iconName) + '</span><div><b>' + esc(a.name) + '</b><small>' + esc(accountTypeLabel(a.type)) + '</small></div></div>' +
          '<div class="acc-balance">' + taka(balance) + '<small>' + t('acc.opening') + ': ' + taka(a.opening) + '</small></div>' +
          '<div class="account-card-foot"><span>' + HisabI18n.number(txCount) + ' ' + t('acc.activity') + '</span><span style="display:flex;gap:2px">' +
            '<button class="icon-btn" data-action="edit-account" data-id="' + a.id + '" aria-label="' + t('common.edit') + '">' + icon('edit') + '</button>' +
            '<button class="icon-btn" data-action="archive-account" data-id="' + a.id + '" aria-label="Archive">' + icon('trash') + '</button>' +
          '</span></div></article>';
      }).join('') + '</div>'
      : emptyState('wallet', t('acc.title'), t('acc.sub'), '<button class="btn btn--primary" data-action="add-account">' + t('acc.new') + '</button>')) +
    '<section class="card card--pad" style="margin-top:14px">' +
      sectionHead(HisabI18n.lang() === 'bn' ? 'সাম্প্রতিক অ্যাকাউন্ট কার্যক্রম' : 'Recent account activity', '', 'transactions', t('common.viewAll')) +
      '<div class="tx-list">' + sortTxDesc(wsTransactions()).slice(0, 5).map((tx) => transactionRowHTML(tx)).join('') + '</div>' +
    '</section>';
}

/* ══════════════════ BUDGETS ══════════════════ */
function viewBudgets() {
  const period = ui.budgetPeriod;
  const list = wsBudgets().filter((b) => b.period === period);
  const overall = list.find((b) => !b.categoryKey);
  const cats = list.filter((b) => b.categoryKey);
  const range = budgetRange(period);
  const spent = overall ? budgetSpent(overall, range) : sumByTypes(txsInRange(range)).expense;
  const amount = overall ? overall.amount : 0;
  const stat = budgetStatus(spent, amount || 1);
  const alerts = list.map((b) => ({ b, s: budgetSpent(b, range), st: budgetStatus(budgetSpent(b, range), b.amount) })).filter((x) => x.st.pct >= 80).sort((a, b) => b.st.pct - a.st.pct);
  return '' +
    '<div class="page-head"><div><h2>' + t('budget.title') + '</h2><p>' + t('budget.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="add-budget">' + icon('plus') + t('budget.new') + '</button></div></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">' +
      '<div class="segmented">' + ['daily', 'weekly', 'monthly', 'yearly'].map((p) => '<button data-action="budget-period" data-period="' + p + '" class="' + (period === p ? 'is-active' : '') + '">' + t('budget.' + p) + '</button>').join('') + '</div>' +
      '<span class="muted" style="font-size:10.5px">' + esc(HisabI18n.date(range.start, 'short')) + ' – ' + esc(HisabI18n.date(range.end, 'short')) + ' · ' + t('budget.alertsSub') + ' 50 / 80 / 100%</span>' +
    '</div>' +
    '<div class="budget-overview">' +
      (overall
        ? '<section class="budget-spotlight"><span class="eyebrow">' + t('budget.overall') + ' · ' + t('budget.' + period) + '</span>' +
          '<h3>' + (stat.over ? t('budget.over') : t('budget.onTrack')) + '</h3>' +
          '<div class="spot-num">' + taka(spent) + '</div><div class="spot-sub">' + t('budget.of') + ' ' + taka(amount) + '</div>' +
          '<div class="progress"><i style="width:' + clamp(stat.pct, 0, 100) + '%"></i></div>' +
          '<div class="spot-foot"><span>' + (stat.over ? t('budget.overBy') + ' <b>' + taka(spent - amount) + '</b>' : t('budget.remaining') + ' <b>' + taka(stat.remaining) + '</b>') + '</span><span><b>' + HisabI18n.pct(stat.pct, 0) + '</b> ' + t('budget.utilized') + '</span></div></section>'
        : '<section class="card card--pad" style="display:grid;place-items:center;text-align:center"><div><div class="empty-icon" style="width:46px;height:46px;margin-bottom:10px">' + icon('target') + '</div><h3 style="font-size:15px;margin-bottom:4px">' + t('budget.overall') + '</h3><p class="muted" style="font-size:11px;margin-bottom:12px">' + t('budget.noAlerts') + '</p><button class="btn btn--primary" data-action="add-budget">' + icon('plus') + t('budget.new') + '</button></div></section>') +
      '<section class="card budget-alert-list">' + sectionHead(t('budget.alerts'), t('budget.alertsSub')) +
        (alerts.length ? alerts.slice(0, 4).map(({ b, s, st }) => {
          const c = b.categoryKey ? catByKey(b.categoryKey) : null;
          return '<div class="budget-alert"><i class="ba-dot" style="background:' + (st.over ? 'var(--danger)' : 'var(--warning)') + '"></i><div><b>' + esc(c ? catLabel(c) : t('budget.overall')) + '</b><small>' + (st.over ? t('budget.overBy') + ' ' + taka(s - b.amount) : t('budget.remaining') + ' ' + taka(st.remaining)) + '</small></div><span class="ba-val">' + HisabI18n.pct(st.pct, 0) + '</span></div>';
        }).join('') : '<p class="muted" style="font-size:11px;padding:4px 0">' + t('budget.noAlerts') + '</p>') +
      '</section>' +
    '</div>' +
    (cats.length
      ? '<section class="card card--flush"><div class="section-head" style="padding:15px 16px 0;margin-bottom:0"><div><h3>' + t('budget.categoryBudget') + '</h3><p>' + t('budget.sub') + '</p></div></div><div class="budget-list">' +
        cats.map((b) => {
          const c = catByKey(b.categoryKey);
          const s = budgetSpent(b, range);
          const st = budgetStatus(s, b.amount);
          const cls = st.over ? 'is-danger' : st.warning ? 'is-warning' : '';
          return '<div class="budget-item"><div class="budget-item-top"><span class="budget-cat-icon">' + catEmoji(c) + '</span>' +
            '<div class="budget-item-main"><b>' + esc(catLabel(c)) + '</b><small>' + (st.over ? t('budget.over') : st.warning ? t('budget.warning') : t('budget.onTrack')) + ' · ' + t('budget.' + b.period) + '</small></div>' +
            '<div class="bi-amount"><b>' + taka(s) + ' <span class="muted" style="font-weight:500">/ ' + taka(b.amount) + '</span></b><small>' + (st.over ? t('budget.overBy') + ' ' + taka(s - b.amount) : taka(st.remaining) + ' ' + t('budget.left')) + '</small></div>' +
            '<button class="icon-btn" data-action="edit-budget" data-id="' + b.id + '" aria-label="' + t('common.edit') + '">' + icon('edit') + '</button></div>' +
            '<div class="progress ' + cls + '"><i style="width:' + clamp(st.pct, 0, 100) + '%"></i></div></div>';
        }).join('') + '</div></section>'
      : emptyState('target', t('budget.categoryBudget'), t('budget.sub'), '<button class="btn btn--primary" data-action="add-budget">' + t('budget.new') + '</button>'));
}

/* ══════════════════ SAVINGS ══════════════════ */
function viewSavings() {
  const goals = wsGoals();
  const saved = savingsTotal();
  const reached = goals.filter((g) => g.saved >= g.target).length;
  return '' +
    '<div class="page-head"><div><h2>' + t('savings.title') + '</h2><p>' + t('savings.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="add-goal">' + icon('plus') + t('savings.new') + '</button></div></div>' +
    '<div class="insight-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:14px">' +
      '<div class="analytic-card"><div class="ac-top"><span class="ac-icon">' + icon('savings') + '</span></div><small>' + t('savings.totalSaved') + '</small><b>' + taka(saved) + '</b><p>' + (HisabI18n.lang() === 'bn' ? 'সব সক্রিয় লক্ষ্য মিলিয়ে' : 'Across all active goals') + '</p></div>' +
      '<div class="analytic-card"><div class="ac-top"><span class="ac-icon">' + icon('target') + '</span></div><small>' + t('savings.activeGoals') + '</small><b>' + HisabI18n.number(goals.length) + '</b><p>' + (HisabI18n.lang() === 'bn' ? 'বর্তমানে চলমান' : 'Currently in progress') + '</p></div>' +
      '<div class="analytic-card"><div class="ac-top"><span class="ac-icon">' + icon('check') + '</span></div><small>' + t('savings.reached') + '</small><b>' + HisabI18n.number(reached) + '</b><p>' + (HisabI18n.lang() === 'bn' ? 'লক্ষ্য সম্পন্ন' : 'Completed goals') + '</p></div>' +
    '</div>' +
    (goals.length
      ? '<div class="goal-grid">' + goals.map((g) => {
        const pct = clamp(pctOf(g.saved, g.target), 0, 100);
        const monthsLeft = Math.max(1, Math.ceil(daysBetween(todayISO(), g.deadline) / 30));
        const monthly = Math.max(0, Math.ceil((g.target - g.saved) / monthsLeft));
        return '<article class="goal-card">' +
          '<div class="goal-card-top"><span class="goal-emoji" style="background:' + g.color + '18">' + esc(g.emoji || '🎯') + '</span>' +
            '<div class="goal-ring">' + ringSVG(pct, g.color) + '<span class="ring-label">' + HisabI18n.pct(pct, 0) + '</span></div></div>' +
          '<h4>' + esc(HisabI18n.lang() === 'bn' && g.nameBn ? g.nameBn : g.name) + '</h4>' +
          '<div class="goal-deadline">' + icon('calendar') + t('savings.deadline') + ': ' + esc(HisabI18n.date(g.deadline, 'short')) + '</div>' +
          '<div class="goal-progress-line"><b>' + taka(g.saved) + '</b><small>' + t('budget.of') + ' ' + taka(g.target) + '</small></div>' +
          '<div class="progress"><i style="width:' + pct + '%;background:' + g.color + '"></i></div>' +
          '<div class="goal-foot"><small>' + (pct >= 100 ? t('savings.completed') : t('savings.monthlyNeeded') + ': ' + taka(monthly)) + '</small>' +
            '<span style="display:flex;gap:4px"><button class="btn btn--soft" data-action="contribute-goal" data-id="' + g.id + '">' + icon('plus') + t('savings.contribute') + '</button>' +
            '<button class="icon-btn" data-action="delete-goal" data-id="' + g.id + '" aria-label="' + t('common.delete') + '" style="width:30px;height:30px">' + icon('trash') + '</button></span></div>' +
          '</article>';
      }).join('') + '</div>'
      : emptyState('savings', t('savings.title'), t('savings.sub'), '<button class="btn btn--primary" data-action="add-goal">' + t('savings.new') + '</button>')) +
    '<div class="modal-note" style="margin-top:14px">' + icon('shield') + '<span>' + (HisabI18n.lang() === 'bn' ? 'সঞ্চয় জমা অ্যাকাউন্ট থেকে সঞ্চয় রিজার্ভে স্থানান্তর হিসেবে রেকর্ড হয় — এটি ব্যয় নয়।' : 'Savings contributions are recorded as transfers from your account to Savings Reserve — not as expenses.') + '</span></div>';
}

/* ══════════════════ DEBTS ══════════════════ */
function viewDebts() {
  const debts = wsDebts();
  const totals = debtsTotals();
  return '' +
    '<div class="page-head"><div><h2>' + t('debt.title') + '</h2><p>' + t('debt.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="add-debt">' + icon('plus') + t('debt.new') + '</button></div></div>' +
    '<div class="debt-summary">' +
      '<div class="debt-stat"><small>' + icon('arrow-up-right') + t('debt.totalBorrowed') + '</small><b class="neg">' + taka(totals.borrowed) + '</b></div>' +
      '<div class="debt-stat"><small>' + icon('arrow-down-left') + t('debt.totalLent') + '</small><b class="pos">' + taka(totals.lent) + '</b></div>' +
      '<div class="debt-stat"><small>' + icon('debt') + t('debt.netPosition') + '</small><b>' + taka(totals.net) + '</b></div>' +
    '</div>' +
    (debts.length
      ? '<div class="debt-list">' + debts.map((d) => {
        const overdue = d.dueDate && d.dueDate < todayISO();
        const paidPct = clamp(pctOf(d.principal - d.outstanding, d.principal), 0, 100);
        return '<div class="debt-item">' +
          '<span class="debt-icon ' + d.direction + '">' + (d.direction === 'borrowed' ? '📥' : '📤') + '</span>' +
          '<div class="debt-main"><b>' + esc(d.party) + '</b><small>' + t('debt.' + d.direction) + ' · ' + HisabI18n.pct(paidPct, 0) + ' ' + (HisabI18n.lang() === 'bn' ? 'পরিশোধিত' : 'repaid') + (d.rate ? ' · ' + HisabI18n.number(d.rate, 1) + '% ' + (HisabI18n.lang() === 'bn' ? 'সুদ' : 'interest') : '') + '</small></div>' +
          '<div class="debt-amt"><b>' + taka(d.outstanding) + '</b><small>' + (overdue ? '<span class="neg">' + t('debt.overdue') + '</span>' : t('debt.due') + ' ' + esc(HisabI18n.date(d.dueDate, 'short'))) + '</small></div>' +
          '<div class="debt-actions"><button class="btn btn--soft" data-action="pay-debt" data-id="' + d.id + '">' + t('debt.payment') + '</button>' +
            '<button class="icon-btn" data-action="debt-history" data-id="' + d.id + '" style="width:30px;height:30px" aria-label="History">' + icon('clock') + '</button>' +
            '<button class="icon-btn" data-action="delete-debt" data-id="' + d.id + '" style="width:30px;height:30px" aria-label="Delete">' + icon('trash') + '</button></div>' +
        '</div>';
      }).join('') + '</div>'
      : emptyState('debt', t('debt.title'), t('debt.noDebts'), '<button class="btn btn--primary" data-action="add-debt">' + t('debt.new') + '</button>')) +
    '<div class="modal-note" style="margin-top:14px">' + icon('shield') + '<span>' + (HisabI18n.lang() === 'bn' ? 'মূলধন পরিশোধ দায় কমায়, সুদ ব্যয় হিসেবে গণ্য হয়।' : 'Principal repayment reduces the liability; interest is treated as an expense.') + '</span></div>';
}

/* ══════════════════ REPORTS ══════════════════ */
function reportTabButton(id, label) {
  return '<button data-action="report-tab" data-tab="' + id + '" class="' + (ui.reportTab === id ? 'is-active' : '') + '">' + label + '</button>';
}
function monthRowsHTML(series) {
  return '<div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('report.month') + '</th><th class="num">' + t('common.income') + '</th><th class="num">' + t('common.expense') + '</th><th class="num">' + t('tx.net') + '</th></tr></thead><tbody>' +
    series.map((m) => '<tr><td>' + esc(m.full) + '</td><td class="num pos">' + taka(m.income) + '</td><td class="num neg">' + taka(m.expense) + '</td><td class="num" style="font-weight:700">' + (m.net >= 0 ? '+' : '−') + taka(Math.abs(m.net)) + '</td></tr>').join('') +
    '</tbody></table></div>';
}
function reportCategoriesHTML() {
  const range = rangeFor(ui.reportPeriod);
  const list = categoryBreakdown('expense', range);
  const total = list.reduce((s, c) => s + c.amount, 0);
  if (!list.length) return emptyState('reports', t('report.noData'), t('tx.emptySub'), '');
  return '<div class="report-grid"><section class="card card--pad"><div class="donut-wrap" style="flex-direction:column;align-items:center"><div class="donut">' + donutSVG(list.map((c) => ({ amount: c.amount, color: catColor(c.cat) })), total) + '<div class="donut-center"><small>' + t('common.total') + '</small><b>' + takaShort(total) + '</b></div></div>' +
    '<p class="muted" style="font-size:10.5px;text-align:center">' + t('report.categories') + ' · ' + esc(rangeLabel(ui.reportPeriod)) + '</p></div></section>' +
    '<section class="card card--pad"><div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('common.category') + '</th><th class="num">' + t('common.amount') + '</th><th class="num">' + t('report.share') + '</th><th class="bar-cell"></th></tr></thead><tbody>' +
    list.map((c) => '<tr><td><span style="display:inline-flex;align-items:center;gap:6px">' + catEmoji(c.cat) + ' ' + esc(catLabel(c.cat)) + '</span></td><td class="num">' + taka(c.amount) + '</td><td class="num">' + HisabI18n.pct(c.pct, 1) + '</td><td class="bar-cell"><div class="mini-bar"><i style="width:' + c.pct + '%;background:' + catColor(c.cat) + '"></i></div></td></tr>').join('') +
    '</tbody></table></div></section></div>';
}
function reportAccountsHTML() {
  const range = rangeFor(ui.reportPeriod);
  const accounts = wsAccounts();
  return '<section class="card card--pad"><div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('report.account') + '</th><th class="num">' + t('report.opening') + '</th><th class="num">' + t('report.inflow') + '</th><th class="num">' + t('report.outflow') + '</th><th class="num">' + t('report.closing') + '</th></tr></thead><tbody>' +
    accounts.map((a) => {
      let opening = Number(a.opening) || 0;
      wsTransactions().forEach((tx) => {
        if (tx.date >= range.start) return;
        if (tx.type === 'income' && tx.accountId === a.id) opening += Number(tx.amount);
        else if (tx.type === 'expense' && tx.accountId === a.id) opening -= Number(tx.amount);
        else if (tx.type === 'transfer') {
          if (tx.accountId === a.id) opening -= Number(tx.amount);
          if (tx.toAccountId === a.id) opening += Number(tx.amount);
        }
      });
      const flow = accountFlow(a.id, range);
      const closing = opening + flow.inflow - flow.outflow;
      return '<tr><td><b>' + esc(a.name) + '</b><br><span class="muted" style="font-size:9px">' + esc(accountTypeLabel(a.type)) + '</span></td><td class="num">' + taka(opening) + '</td><td class="num pos">' + taka(flow.inflow) + '</td><td class="num neg">' + taka(flow.outflow) + '</td><td class="num" style="font-weight:700">' + taka(closing) + '</td></tr>';
    }).join('') +
    '</tbody></table></div></section>';
}
function reportCashflowHTML() {
  const series = monthlySeries(ui.reportPeriod === 'year' ? 12 : 6);
  return '<section class="card chart-card"><div class="chart-head"><div><h3>' + t('report.cashflow') + '</h3><p>' + t('dash.cashflow.sub') + '</p></div><div class="chart-legend"><span><i class="legend-dot" style="background:#0e9f6e"></i>' + t('common.income') + '</span><span><i class="legend-dot" style="background:#e0645a"></i>' + t('common.expense') + '</span></div></div>' + lineChartSVG(series) + '</section>' +
    '<section class="card card--pad" style="margin-top:14px">' + monthRowsHTML(series) + '</section>';
}
function reportPLHTML() {
  const range = rangeFor(ui.reportPeriod);
  const sums = sumByTypes(txsInRange(range));
  const margin = sums.income > 0 ? (sums.net / sums.income) * 100 : 0;
  const cats = categoryBreakdown('expense', range);
  return '<div class="report-grid"><section class="card card--pad"><h3 style="font-size:14px;margin-bottom:12px">' + t('report.pl') + '</h3><div class="summary-rows">' +
    '<div class="summary-row"><span>' + t('report.revenue') + '</span><b class="pos">' + taka(sums.income) + '</b></div>' +
    '<div class="summary-row"><span>' + t('report.cogs') + '</span><b class="neg">' + taka(sums.expense) + '</b></div>' +
    '<div class="summary-row total"><span>' + t('report.netProfit') + '</span><b>' + taka(sums.net) + '</b></div>' +
    '<div class="summary-row"><span>' + t('report.margin') + '</span><b>' + HisabI18n.pct(margin, 1) + '</b></div>' +
    '</div><div class="modal-note" style="margin-top:14px">' + icon('clock') + '<span>' + t('analytics.estimate') + '</span></div></section>' +
    '<section class="card card--pad"><h3 style="font-size:14px;margin-bottom:12px">' + t('report.categories') + '</h3><div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('common.category') + '</th><th class="num">' + t('common.amount') + '</th><th class="num">' + t('report.share') + '</th></tr></thead><tbody>' +
    cats.map((c) => '<tr><td>' + catEmoji(c.cat) + ' ' + esc(catLabel(c.cat)) + '</td><td class="num">' + taka(c.amount) + '</td><td class="num">' + HisabI18n.pct(c.pct, 1) + '</td></tr>').join('') +
    '</tbody></table></div></section></div>';
}
function reportBudgetHTML() {
  const list = wsBudgets().filter((b) => b.period === 'monthly');
  const range = rangeFor('month');
  if (!list.length) return emptyState('target', t('report.noData'), t('budget.sub'), '<button class="btn btn--primary" data-action="add-budget">' + t('budget.new') + '</button>');
  return '<section class="card card--pad"><div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('common.category') + '</th><th class="num">' + t('budget.spent') + '</th><th class="num">' + t('common.total') + '</th><th class="num">' + t('budget.utilized') + '</th><th class="bar-cell"></th></tr></thead><tbody>' +
    list.map((b) => {
      const c = b.categoryKey ? catByKey(b.categoryKey) : null;
      const spent = budgetSpent(b, range);
      const st = budgetStatus(spent, b.amount);
      return '<tr><td>' + (c ? catEmoji(c) + ' ' + esc(catLabel(c)) : '<b>' + t('budget.overall') + '</b>') + '</td><td class="num">' + taka(spent) + '</td><td class="num">' + taka(b.amount) + '</td><td class="num ' + (st.over ? 'neg' : '') + '">' + HisabI18n.pct(st.pct, 0) + '</td><td class="bar-cell"><div class="mini-bar"><i style="width:' + clamp(st.pct, 0, 100) + '%;background:' + (st.over ? 'var(--danger)' : st.warning ? 'var(--warning)' : 'var(--brand)') + '"></i></div></td></tr>';
    }).join('') + '</tbody></table></div><p class="muted" style="font-size:9.5px;margin-top:10px">' + esc(HisabI18n.date(range.start, 'short')) + ' – ' + esc(HisabI18n.date(range.end, 'short')) + ' · ' + t('budget.monthly') + '</p></section>';
}
function viewReports() {
  const range = rangeFor(ui.reportPeriod);
  const sums = sumByTypes(txsInRange(range));
  const tabs = ['overview', 'categories', 'accounts', 'cashflow', 'pl', 'budget'];
  let content = '';
  if (ui.reportTab === 'overview') {
    const series = monthlySeries(ui.reportPeriod === 'year' ? 12 : 6);
    content = '<div class="grid grid--3" style="margin-bottom:14px">' +
      '<div class="analytic-card"><small>' + t('common.income') + '</small><b class="pos">' + taka(sums.income) + '</b><p>' + esc(rangeLabel(ui.reportPeriod)) + '</p></div>' +
      '<div class="analytic-card"><small>' + t('common.expense') + '</small><b class="neg">' + taka(sums.expense) + '</b><p>' + esc(rangeLabel(ui.reportPeriod)) + '</p></div>' +
      '<div class="analytic-card"><small>' + t('tx.net') + '</small><b>' + taka(sums.net) + '</b><p>' + HisabI18n.pct(savingsRate(range), 0) + ' ' + t('analytics.savingsRate') + '</p></div>' +
      '</div><section class="card chart-card" style="margin-bottom:14px"><div class="chart-head"><div><h3>' + t('report.incomeExpense') + '</h3><p>' + t('dash.cashflow.sub') + '</p></div><div class="chart-legend"><span><i class="legend-dot" style="background:#0e9f6e"></i>' + t('common.income') + '</span><span><i class="legend-dot" style="background:#e0645a"></i>' + t('common.expense') + '</span></div></div>' + barChartSVG(series) + '</section>' +
      '<section class="card card--pad">' + monthRowsHTML(series) + '</section>';
  } else if (ui.reportTab === 'categories') content = reportCategoriesHTML();
  else if (ui.reportTab === 'accounts') content = reportAccountsHTML();
  else if (ui.reportTab === 'cashflow') content = reportCashflowHTML();
  else if (ui.reportTab === 'pl') content = reportPLHTML();
  else content = reportBudgetHTML();
  return '' +
    '<div class="page-head"><div><h2>' + t('report.title') + '</h2><p>' + t('report.sub') + '</p></div>' +
      '<div class="page-head-actions">' +
        '<select id="reportPeriod" style="width:auto;height:38px" aria-label="' + t('report.period') + '">' + ['month', 'lastMonth', 'week', 'year', '6m', 'all'].map((p) => '<option value="' + p + '"' + (ui.reportPeriod === p ? ' selected' : '') + '>' + rangeLabel(p) + '</option>').join('') + '</select>' +
        '<button class="btn btn--ghost" data-action="export-csv">' + icon('download') + t('report.exportCsv') + '</button>' +
        '<button class="btn btn--primary" data-action="print-report">' + icon('printer') + t('common.print') + '</button>' +
      '</div></div>' +
    '<div class="report-tabs">' + tabs.map((x) => reportTabButton(x, t('report.' + x))).join('') + '</div>' +
    content;
}

/* ══════════════════ ANALYTICS ══════════════════ */
function viewAnalytics() {
  const range = rangeFor('month');
  const prev = categoryBreakdown('expense', rangeFor('lastMonth'));
  const cats = categoryBreakdown('expense', range);
  const top = cats[0];
  const sums = sumByTypes(txsInRange(range));
  const prevSums = sumByTypes(txsInRange(rangeFor('lastMonth')));
  const mom = trendValue(sums.expense, prevSums.expense);
  const rate = savingsRate(range);
  const avgDaily = sums.expense / Math.max(1, new Date().getDate());
  const budget = overallBudgetFor('month');
  const budgetUse = budget ? pctOf(budgetSpent(budget), budget.amount) : 0;
  const forecast = nextMonthForecast();
  const series = monthlySeries(6);
  const weekdays = weekdaySpend(range);
  const maxWeekday = Math.max(1, ...weekdays);
  const dayNames = [0, 1, 2, 3, 4, 5, 6].map((i) => HisabI18n.weekdayShort(isoOf(new Date(2024, 0, 7 + i))));
  let anomaly = null;
  if (top) {
    const prevAvg = prev.length ? prev.reduce((s, c) => s + c.amount, 0) / prev.length : 0;
    if (prevAvg > 0 && top.amount > prevAvg * 1.5) anomaly = top;
  }
  const card = (label, value, note, iconName) =>
    '<div class="analytic-card"><div class="ac-top"><span class="ac-icon">' + icon(iconName) + '</span></div><small>' + esc(label) + '</small><b>' + value + '</b><p>' + note + '</p></div>';
  return '' +
    '<div class="page-head"><div><h2>' + t('analytics.title') + '</h2><p>' + t('analytics.sub') + '</p></div>' +
      '<div class="page-head-actions"><span class="chip chip--brand">' + icon('spark') + t('period.month') + '</span></div></div>' +
    '<div class="insight-grid">' +
      card(t('analytics.topCategory'), top ? esc(catLabel(top.cat)) : '—', top ? taka(top.amount) + ' · ' + HisabI18n.pct(top.pct, 1) + ' ' + (HisabI18n.lang() === 'bn' ? 'মোট ব্যয়ের' : 'of expenses') : t('report.noData'), 'target') +
      card(t('analytics.mom'), HisabI18n.pct(Math.abs(mom), 1), (mom > 0 ? (HisabI18n.lang() === 'bn' ? 'ব্যয় বেড়েছে' : 'Spending increased') : (HisabI18n.lang() === 'bn' ? 'ব্যয় কমেছে' : 'Spending decreased')) + ' · ' + esc(rangeLabel('lastMonth')), mom > 0 ? 'arrow-up-right' : 'arrow-down-left') +
      card(t('analytics.savingsRate'), HisabI18n.pct(rate, 1), (HisabI18n.lang() === 'bn' ? 'আয়ের তুলনায় নিট সঞ্চয়' : 'Net savings against income'), 'savings') +
      card(t('analytics.avgDaily'), taka(avgDaily), (HisabI18n.lang() === 'bn' ? 'চলতি মাসের প্রতিদিনের গড়' : 'Average per day this month'), 'analytics') +
      card(t('analytics.budgetUse'), HisabI18n.pct(budgetUse, 0), budget ? taka(budgetSpent(budget)) + ' / ' + taka(budget.amount) : t('budget.noAlerts'), 'target') +
      card(t('analytics.forecast'), taka(forecast), t('analytics.estimate'), 'assistant') +
    '</div>' +
    '<div class="report-grid">' +
      '<div class="stack">' +
        '<section class="card chart-card"><div class="chart-head"><div><h3>' + t('analytics.trend') + '</h3><p>' + t('dash.cashflow.sub') + '</p></div><div class="chart-legend"><span><i class="legend-dot" style="background:#0e9f6e"></i>' + t('common.income') + '</span><span><i class="legend-dot" style="background:#e0645a"></i>' + t('common.expense') + '</span></div></div>' + lineChartSVG(series, { height: 260 }) + '</section>' +
        '<section class="card card--pad"><div class="section-head"><div><h3>' + t('analytics.weekday') + '</h3><p>' + t('period.month') + '</p></div></div>' +
          '<div class="weekday-chart">' + weekdays.map((v, i) => '<div class="weekday-col"><b>' + (v ? takaShort(v) : '—') + '</b><i style="height:' + Math.max(3, (v / maxWeekday) * 100) + '%;' + (i === 5 || i === 0 ? 'background:var(--brand);opacity:.95' : '') + '"></i><small>' + dayNames[i] + '</small></div>').join('') + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="stack">' +
        '<section class="card card--pad"><div class="section-head"><div><h3>' + t('dash.category') + '</h3><p>' + t('period.month') + '</p></div></div>' +
          (cats.length ? '<div class="donut-wrap" style="flex-direction:column;align-items:center;gap:16px"><div class="donut">' + donutSVG(cats.map((c) => ({ amount: c.amount, color: catColor(c.cat) })), sums.expense) + '<div class="donut-center"><small>' + t('common.total') + '</small><b>' + takaShort(sums.expense) + '</b></div></div><div class="cat-list" style="width:100%">' + cats.slice(0, 7).map((c) => '<div class="cat-row"><i class="cat-dot" style="background:' + catColor(c.cat) + '"></i><span class="cat-name">' + esc(catLabel(c.cat)) + '</span><span class="cat-val">' + takaShort(c.amount) + '</span><span class="cat-pct">' + HisabI18n.pct(c.pct, 0) + '</span></div>').join('') + '</div></div>' : '<p class="muted" style="font-size:11.5px">' + t('dash.noData') + '</p>') +
        '</section>' +
        (anomaly ? '<div class="insight-card"><div class="insight-top"><span class="insight-icon">' + icon('spark') + '</span><h4>' + t('analytics.anomaly') + '</h4></div><p>' + (HisabI18n.lang() === 'bn' ? '<b>' + esc(catLabel(anomaly.cat)) + '</b>-এ ব্যয় গত মাসগুলোর গড়ের তুলনায় উল্লেখযোগ্যভাবে বেশি।' : '<b>' + esc(catLabel(anomaly.cat)) + '</b> is spending noticeably above its recent monthly average.') + '</p><div class="insight-foot">' + icon('clock') + '<span>' + t('analytics.estimate') + '</span></div></div>' : '') +
        '<div class="modal-note">' + icon('assistant') + '<span>' + t('analytics.estimate') + '</span></div>' +
      '</div>' +
    '</div>';
}

/* ══════════════════ CALENDAR ══════════════════ */
function viewCalendar() {
  const cursor = ui.calendarCursor;
  const y = cursor.getFullYear(); const m = cursor.getMonth();
  const first = new Date(y, m, 1);
  const startOffset = first.getDay();
  const gridStart = addDays(first, -startOffset);
  const cells = [];
  for (let i = 0; i < 42; i += 1) cells.push(addDays(gridStart, i));
  const range = { start: isoOf(first), end: isoOf(new Date(y, m + 1, 0)) };
  const monthTxs = txsInRange(range);
  const sums = sumByTypes(monthTxs);
  const nowISO = todayISO();
  const dayNames = [0, 1, 2, 3, 4, 5, 6].map((i) => HisabI18n.weekdayShort(isoOf(new Date(2024, 0, 7 + i))));
  const monthTitle = new Intl.DateTimeFormat(HisabI18n.locale(), { month: 'long', year: 'numeric' }).format(first);
  const upcoming = upcomingItems(60);
  return '' +
    '<div class="page-head"><div><h2>' + t('cal.title') + '</h2><p>' + t('cal.sub') + '</p></div>' +
      '<div class="page-head-actions"><span class="chip chip--income">' + t('tx.in') + ' ' + taka(sums.income) + '</span><span class="chip chip--expense">' + t('tx.out') + ' ' + taka(sums.expense) + '</span></div></div>' +
    '<div class="calendar-layout">' +
      '<section class="card calendar-card">' +
        '<div class="calendar-head"><h3>' + esc(monthTitle) + '</h3><div class="calendar-nav">' +
          '<button class="icon-btn" data-action="cal-prev" aria-label="Previous month">' + icon('chevron-down', 'cal-prev-icon') + '</button>' +
          '<button class="btn btn--ghost btn--sm" data-action="cal-today">' + t('common.today') + '</button>' +
          '<button class="icon-btn" data-action="cal-next" aria-label="Next month">' + icon('chevron-down', 'cal-next-icon') + '</button>' +
        '</div></div>' +
        '<div class="calendar-weekdays">' + dayNames.map((d) => '<span>' + esc(d) + '</span>').join('') + '</div>' +
        '<div class="calendar-grid">' + cells.map((d) => {
          const iso = isoOf(d);
          const dayTxs = monthTxs.filter((tx) => tx.date === iso);
          const ds = sumByTypes(dayTxs);
          const outside = d.getMonth() !== m;
          return '<div class="cal-day ' + (outside ? 'is-outside ' : '') + (iso === nowISO ? 'is-today ' : '') + '" data-action="view-day" data-date="' + iso + '">' +
            '<span class="cal-num">' + HisabI18n.number(d.getDate()) + '</span>' +
            (ds.net ? '<span class="cal-amt ' + (ds.net >= 0 ? 'pos' : 'neg') + '">' + (ds.net >= 0 ? '+' : '−') + takaShort(Math.abs(ds.net)) + '</span>' : '') +
            '<span class="cal-events">' + dayTxs.slice(0, 4).map((tx) => '<i class="' + (tx.type === 'income' ? 'income' : tx.type === 'expense' ? 'expense' : '') + '"></i>').join('') + '</span>' +
            '</div>';
        }).join('') + '</div>' +
        '<div class="cal-legend"><span><i style="background:var(--income)"></i>' + t('common.income') + '</span><span><i style="background:var(--expense)"></i>' + t('common.expense') + '</span><span><i style="background:var(--brand)"></i>' + t('common.transfer') + '</span></div>' +
      '</section>' +
      '<section class="card card--pad">' + sectionHead(t('cal.upcoming'), '', 'recurring', t('common.viewAll')) +
        (upcoming.length ? upcoming.map((u) => '<div class="upcoming-row">' + dateBadge(u.date) + '<div class="upcoming-main"><b>' + esc(u.name) + '</b><small>' + (u.diff < 0 ? t('debt.overdue') : u.diff === 0 ? t('common.today') : HisabI18n.number(u.diff) + (HisabI18n.lang() === 'bn' ? ' দিনে' : ' days')) + '</small></div><span class="upcoming-amt">' + taka(u.amount) + '</span></div>').join('') : '<p class="muted" style="font-size:11.5px">' + t('cal.noEvents') + '</p>') +
      '</section>' +
    '</div>';
}

/* ══════════════════ RECURRING ══════════════════ */
function viewRecurring() {
  const list = wsRecurring();
  const active = list.filter((r) => r.active);
  const monthlyExpense = active.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
  const monthlyIncome = active.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
  const accounts = wsAccounts();
  return '' +
    '<div class="page-head"><div><h2>' + t('rec.title') + '</h2><p>' + t('rec.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="add-recurring">' + icon('plus') + t('rec.new') + '</button></div></div>' +
    '<div class="grid grid--3" style="margin-bottom:14px">' +
      '<div class="analytic-card"><small>' + t('common.expense') + '</small><b class="neg">' + taka(monthlyExpense) + '</b><p>' + (HisabI18n.lang() === 'bn' ? 'মাসিক নির্ধারিত ব্যয়' : 'Scheduled monthly outflow') + '</p></div>' +
      '<div class="analytic-card"><small>' + t('common.income') + '</small><b class="pos">' + taka(monthlyIncome) + '</b><p>' + (HisabI18n.lang() === 'bn' ? 'মাসিক নির্ধারিত আয়' : 'Scheduled monthly inflow') + '</p></div>' +
      '<div class="analytic-card"><small>' + t('rec.title') + '</small><b>' + HisabI18n.number(active.length) + '</b><p>' + t('rec.active') + ' / ' + HisabI18n.number(list.length) + '</p></div>' +
    '</div>' +
    (list.length
      ? '<div class="recurring-list">' + list.map((r) => {
        const c = catByKey(r.categoryKey);
        const acc = accounts[r.accountIndex] || null;
        return '<div class="recurring-item ' + (r.active ? '' : 'is-paused') + '">' +
          '<span class="recurring-icon">' + (r.type === 'income' ? '💰' : catEmoji(c)) + '</span>' +
          '<div class="recurring-main"><b>' + esc(r.name) + '</b><small>' + (c ? esc(catLabel(c)) : typeLabel(r.type)) + ' · ' + esc(acc ? acc.name : '—') + ' · ' + t('rec.' + r.frequency) + '</small></div>' +
          '<div class="recurring-amt"><b class="' + (r.type === 'income' ? 'pos' : '') + '">' + taka(r.amount) + '</b><small>' + t('rec.next') + ': ' + esc(HisabI18n.date(r.nextDate, 'short')) + '</small></div>' +
          '<button class="btn btn--soft btn--sm" data-action="post-recurring" data-id="' + r.id + '">' + t('rec.postNow') + '</button>' +
          '<button class="switch ' + (r.active ? 'is-on' : '') + '" data-action="toggle-recurring" data-id="' + r.id + '" role="switch" aria-checked="' + (r.active ? 'true' : 'false') + '" aria-label="Toggle"></button>' +
          '<button class="icon-btn" data-action="edit-recurring" data-id="' + r.id + '" aria-label="Edit">' + icon('edit') + '</button>' +
        '</div>';
      }).join('') + '</div>'
      : emptyState('recurring', t('rec.title'), t('rec.sub'), '<button class="btn btn--primary" data-action="add-recurring">' + t('rec.new') + '</button>')) +
    '<div class="modal-note" style="margin-top:14px">' + icon('bell') + '<span>' + (HisabI18n.lang() === 'bn' ? '“এখনই যোগ করুন” পরবর্তী নির্ধারিত তারিখে একটি লেনদেন তৈরি করে এবং পরবর্তী তারিখ এগিয়ে দেয়।' : '“Post now” creates a transaction on the next scheduled date and advances the schedule.') + '</span></div>';
}

/* ══════════════════ ASSISTANT ══════════════════ */
function chatMessagesHTML() {
  const chat = Array.isArray(state.chat) ? state.chat.filter((m) => m.workspaceId === activeWs().id) : [];
  if (!chat.length) {
    return '<div class="msg"><span class="msg-avatar">' + icon('assistant') + '</span><div><div class="msg-bubble">' + esc(t('ai.welcome')) + '</div><div class="msg-time">' + (HisabI18n.lang() === 'bn' ? 'এখন' : 'Just now') + '</div></div></div>';
  }
  return chat.map((m) => m.role === 'user'
    ? '<div class="msg msg--user"><span class="msg-avatar">' + icon('users') + '</span><div><div class="msg-bubble">' + esc(m.text) + '</div><div class="msg-time">' + esc(HisabI18n.date(m.time, 'short')) + '</div></div></div>'
    : '<div class="msg"><span class="msg-avatar">' + icon('assistant') + '</span><div><div class="msg-bubble">' + m.html + '</div><div class="msg-time">' + (HisabI18n.lang() === 'bn' ? 'এআই · স্থানীয় তথ্য' : 'AI · local data') + '</div></div></div>'
  ).join('') + (ui.chatBusy ? '<div class="msg"><span class="msg-avatar">' + icon('assistant') + '</span><div class="msg-bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>' : '');
}
function viewAssistant() {
  const suggestions = [t('ai.suggestion1'), t('ai.suggestion2'), t('ai.suggestion3'), t('ai.suggestion4'), t('ai.suggestion5'), t('ai.suggestion6')];
  return '' +
    '<div class="page-head"><div><h2>' + t('ai.title') + '</h2><p>' + t('ai.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--ghost btn--sm" data-action="clear-chat">' + icon('trash') + t('ai.clear') + '</button></div></div>' +
    '<div class="assistant-layout">' +
      '<section class="card chat-card">' +
        '<div class="chat-head"><span class="chat-avatar">' + icon('assistant') + '</span><div><b>Hisab AI</b><small>' + t('ai.online') + '</small></div><span class="chip chip--brand" style="margin-left:auto">' + icon('shield') + (HisabI18n.lang() === 'bn' ? 'স্থানীয়' : 'Local') + '</span></div>' +
        '<div class="chat-body" id="chatBody">' + chatMessagesHTML() + '</div>' +
        '<div class="chat-suggestions">' + suggestions.map((s) => '<button class="suggestion" data-action="assistant-suggest" data-text="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div>' +
        '<form class="chat-input" id="chatForm"><input id="chatInput" type="text" placeholder="' + t('ai.placeholder') + '" autocomplete="off" ' + (ui.chatBusy ? 'disabled' : '') + ' /><button class="btn btn--primary" type="submit" aria-label="Send">' + icon('send') + '</button></form>' +
        '<div class="chat-note">' + t('ai.disclaimer') + '</div>' +
      '</section>' +
      '<aside class="stack">' +
        '<section class="card ai-side-card"><h4>' + t('ai.capabilities') + '</h4>' +
          [t('ai.cap1'), t('ai.cap2'), t('ai.cap3'), t('ai.cap4')].map((cap) => '<div class="ai-cap">' + icon('check') + '<span>' + esc(cap) + '</span></div>').join('') +
        '</section>' +
        '<div class="ai-disclaimer">' + icon('shield') + '<span>' + t('ai.disclaimer') + '</span></div>' +
        '<section class="card ai-side-card"><h4>' + (HisabI18n.lang() === 'bn' ? 'সক্রিয় ওয়ার্কস্পেস' : 'Active workspace') + '</h4><div class="summary-rows">' +
          '<div class="summary-row"><span>' + t('common.balance') + '</span><b>' + taka(totalBalance()) + '</b></div>' +
          '<div class="summary-row"><span>' + t('dash.income') + '</span><b class="pos">' + taka(sumByTypes(txsInRange(rangeFor('month'))).income) + '</b></div>' +
          '<div class="summary-row"><span>' + t('dash.expenses') + '</span><b class="neg">' + taka(sumByTypes(txsInRange(rangeFor('month'))).expense) + '</b></div>' +
          '<div class="summary-row total"><span>' + t('tx.net') + '</span><b>' + taka(sumByTypes(txsInRange(rangeFor('month'))).net) + '</b></div>' +
        '</div></section>' +
      '</aside>' +
    '</div>';
}

/* ══════════════════ NOTIFICATIONS ══════════════════ */
function viewNotifications() {
  const list = state.notifications.filter((n) => n.workspaceId === activeWs().id);
  const unread = list.filter((n) => !n.read).length;
  const iconMap = { warning: 'bell', danger: 'clock', brand: 'check', info: 'users' };
  return '' +
    '<div class="page-head"><div><h2>' + t('notif.title') + '</h2><p>' + t('notif.sub') + (unread ? ' · ' + HisabI18n.number(unread) + ' ' + t('notif.unread') : '') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--ghost" data-action="mark-all-read">' + icon('check') + t('notif.markAll') + '</button></div></div>' +
    (list.length
      ? '<div class="notif-list">' + list.map((n) => '<article class="notif-item ' + (n.read ? '' : 'is-unread') + '">' +
        '<span class="notif-icon ' + n.type + '">' + icon(iconMap[n.type] || 'bell') + '</span>' +
        '<div class="notif-main"><b>' + esc(n.title) + '</b><p>' + esc(n.text) + '</p><small>' + esc(timeAgo(n.time)) + '</small></div>' +
        '<div style="display:flex;gap:2px;align-items:flex-start">' + (!n.read ? '<button class="icon-btn" data-action="read-notif" data-id="' + n.id + '" title="' + t('notif.markAll') + '">' + icon('check') + '</button>' : '') +
        '<button class="icon-btn" data-action="delete-notif" data-id="' + n.id + '" title="' + t('common.delete') + '">' + icon('trash') + '</button></div>' +
        '</article>').join('') + '</div>'
      : emptyState('bell', t('notif.empty'), t('notif.sub'), '')) +
    '<div class="modal-note" style="margin-top:14px">' + icon('bell') + '<span>' + (HisabI18n.lang() === 'bn' ? 'বিজ্ঞপ্তিগুলো এই ডিভাইসে সংরক্ষিত। ইমেইল বা ব্রাউজার পুশ এই ডেমোতে সংযুক্ত নয়।' : 'Notifications are stored on this device. Email and browser push are not connected in this demo.') + '</span></div>';
}
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return HisabI18n.lang() === 'bn' ? 'এখন' : 'Just now';
  if (diff < 3600) return HisabI18n.number(Math.floor(diff / 60)) + (HisabI18n.lang() === 'bn' ? ' মিনিট আগে' : ' min ago');
  if (diff < 86400) return HisabI18n.number(Math.floor(diff / 3600)) + (HisabI18n.lang() === 'bn' ? ' ঘণ্টা আগে' : ' h ago');
  if (diff < 604800) return HisabI18n.number(Math.floor(diff / 86400)) + (HisabI18n.lang() === 'bn' ? ' দিন আগে' : ' d ago');
  return HisabI18n.date(iso, 'short');
}

/* ══════════════════ MEMBERS ══════════════════ */
function viewMembers() {
  const members = wsMembers();
  const active = members.filter((m) => m.status === 'active').length;
  const pending = members.length - active;
  return '' +
    '<div class="page-head"><div><h2>' + t('members.title') + '</h2><p>' + t('members.sub') + '</p></div>' +
      '<div class="page-head-actions"><button class="btn btn--primary" data-action="invite-member">' + icon('plus') + t('members.invite') + '</button></div></div>' +
    '<section class="card card--pad" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">' +
      '<div style="display:flex;align-items:center;gap:12px"><span class="ws-avatar" style="width:42px;height:42px;background:' + activeWs().color + '20;color:' + activeWs().color + ';border:1px solid ' + activeWs().color + '35">' + esc(displayWsName().slice(0, 1)) + '</span><div><b style="font-size:15px;display:block">' + esc(displayWsName()) + '</b><small class="muted" style="font-size:10.5px">' + esc(t('ws.' + activeWs().type + 'Desc') || '') + '</small></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip--brand">' + HisabI18n.number(active) + ' ' + t('members.active') + '</span>' + (pending ? '<span class="chip chip--warning">' + HisabI18n.number(pending) + ' ' + t('members.pending') + '</span>' : '') + '<span class="chip chip--muted">' + icon('shield') + roleLabel(workspaceRole()) + '</span></div>' +
    '</section>' +
    '<section class="card card--flush"><div class="member-list">' + members.map((m) => {
      const isOwner = m.role === 'owner';
      return '<div class="member-row"><span class="status-dot ' + (m.status === 'pending' ? 'pending' : '') + '" title="' + (m.status === 'pending' ? t('members.pending') : t('members.active')) + '"></span>' +
        '<span class="avatar" style="background:' + memberInitialsColor(m) + '20;color:' + memberInitialsColor(m) + ';border-color:' + memberInitialsColor(m) + '35">' + esc(m.initials || initials(m.name)) + '</span>' +
        '<div class="member-info"><b>' + esc(HisabI18n.lang() === 'bn' && m.nameBn ? m.nameBn : m.name) + (m.email === (state.user && state.user.email) ? ' <span class="muted" style="font-weight:500">(' + t('members.you') + ')</span>' : '') + '</b><small>' + esc(m.email || '') + ' · ' + (m.status === 'pending' ? t('members.pending') : t('members.active')) + '</small></div>' +
        (isOwner
          ? '<span class="chip chip--brand">' + icon('shield') + t('members.owner') + '</span>'
          : '<select data-role-member="' + m.id + '" aria-label="' + t('common.role') + '">' + ['admin', 'accountant', 'manager', 'member', 'viewer'].map((r) => '<option value="' + r + '"' + (m.role === r ? ' selected' : '') + '>' + roleLabel(r) + '</option>').join('') + '</select>' +
            '<button class="icon-btn" data-action="remove-member" data-id="' + m.id + '" aria-label="' + t('common.delete') + '">' + icon('trash') + '</button>') +
        '</div>';
    }).join('') + '</div></section>' +
    '<div class="modal-note" style="margin-top:14px">' + icon('mail') + '<span>' + t('members.noInvite') + '</span></div>';
}

/* ══════════════════ SETTINGS ══════════════════ */
function settingRow(title, hint, control) {
  return '<div class="setting-row"><div class="setting-row-main"><b>' + esc(title) + '</b>' + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>' + control + '</div>';
}
function switchHTML(on, action, id) {
  return '<button class="switch ' + (on ? 'is-on' : '') + '" data-action="toggle-setting" data-setting="' + action + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '"></button>';
}
function viewSettings() {
  const tabs = ['profile', 'preferences', 'workspace', 'security', 'notifications', 'data', 'about'];
  const tabIcons = { profile: 'users', preferences: 'settings', workspace: 'wallet', security: 'shield', notifications: 'bell', data: 'file', about: 'assistant' };
  let panel = '';
  if (ui.settingsTab === 'profile') {
    panel = '<section class="card setting-card"><h3>' + t('set.profile') + '</h3><p>' + t('set.sub') + '</p>' +
      '<div class="profile-block"><span class="profile-avatar">' + esc(initials(state.user.name)) + '</span><div><b>' + esc(state.user.name) + '</b><small>' + esc(state.user.email) + '</small><br><span class="chip chip--brand">' + icon('shield') + roleLabel(workspaceRole()) + '</span></div></div>' +
      '<form id="profileForm" class="form-grid" style="margin-top:16px"><div class="field"><label>' + t('auth.name') + '</label><input name="name" type="text" value="' + esc(state.user.name) + '" required /></div>' +
      '<div class="field"><label>' + t('auth.email') + '</label><input name="email" type="email" value="' + esc(state.user.email) + '" required /></div>' +
      '<div class="span-2" style="display:flex;justify-content:flex-end"><button class="btn btn--primary" type="submit">' + t('set.saveProfile') + '</button></div></form>' +
      '</section>';
  } else if (ui.settingsTab === 'preferences') {
    panel = '<section class="card setting-card"><h3>' + t('set.preferences') + '</h3><p>' + t('set.languageHint') + '</p>' +
      settingRow(t('set.language'), t('set.languageHint'), '<div class="choice-row choice-row--2" style="width:220px"><label class="choice"><input type="radio" name="setLang" value="en" ' + (state.settings.lang !== 'bn' ? 'checked' : '') + ' data-action="set-lang" /><span><b>English</b><small>English</small></span></label><label class="choice"><input type="radio" name="setLang" value="bn" ' + (state.settings.lang === 'bn' ? 'checked' : '') + ' data-action="set-lang" /><span><b>বাংলা</b><small>Bengali</small></span></label></div>') +
      settingRow(t('set.theme'), t('set.themeHint'), '<div class="segmented" style="flex:none"><button data-action="set-theme" data-theme="light" class="' + (state.settings.theme === 'light' ? 'is-active' : '') + '">' + t('set.light') + '</button><button data-action="set-theme" data-theme="dark" class="' + (state.settings.theme === 'dark' ? 'is-active' : '') + '">' + t('set.dark') + '</button><button data-action="set-theme" data-theme="system" class="' + (state.settings.theme === 'system' ? 'is-active' : '') + '">' + t('set.system') + '</button></div>') +
      settingRow(t('set.currency'), t('set.currencyHint'), '<select class="select-inline" disabled><option>BDT (৳)</option></select>') +
      settingRow(t('set.numberFormat'), t('set.numberFormatHint'), '<span class="chip chip--muted">' + (state.settings.lang === 'bn' ? 'বাংলা সংখ্যা' : 'English numerals') + '</span>') +
      '</section>';
  } else if (ui.settingsTab === 'workspace') {
    panel = '<section class="card setting-card"><h3>' + t('set.workspace') + '</h3><p>' + t('ws.' + activeWs().type + 'Desc') + '</p>' +
      '<form id="workspaceForm" class="form-grid"><div class="field"><label>' + t('ws.name') + '</label><input name="name" type="text" value="' + esc(activeWs().name) + '" required /></div>' +
      '<div class="field"><label>' + t('ws.type') + '</label><select name="type">' + ['personal', 'family', 'business'].map((x) => '<option value="' + x + '"' + (activeWs().type === x ? ' selected' : '') + '>' + t('ws.' + x) + '</option>').join('') + '</select></div>' +
      '<div class="span-2"><div class="summary-rows"><div class="summary-row"><span>' + t('members.title') + '</span><b>' + HisabI18n.number(wsMembers().length) + '</b></div><div class="summary-row"><span>' + t('common.balance') + '</span><b>' + taka(totalBalance()) + '</b></div><div class="summary-row"><span>' + t('nav.transactions') + '</span><b>' + HisabI18n.number(wsTransactions().length) + '</b></div></div></div>' +
      '<div class="span-2" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><a class="btn btn--ghost" href="#/members" data-route="members">' + icon('users') + t('nav.members') + '</a><button class="btn btn--primary" type="submit">' + t('common.save') + '</button></div></form>' +
      '</section>';
  } else if (ui.settingsTab === 'security') {
    panel = '<section class="card setting-card"><h3>' + t('set.security') + '</h3><p>' + t('set.sub') + '</p>' +
      settingRow(t('set.twofa'), t('set.twofaHint'), switchHTML(false, 'twofa')) +
      settingRow(t('set.sessions'), t('set.sessionsHint'), '<button class="btn btn--ghost btn--sm" data-action="change-password">' + t('set.changePassword') + '</button>') +
      settingRow(t('set.signOut'), t('set.signOutHint'), '<button class="btn btn--danger btn--sm" data-action="sign-out">' + t('set.signOut') + '</button>') +
      '</section>';
  } else if (ui.settingsTab === 'notifications') {
    const n = state.settings.notifications || {};
    panel = '<section class="card setting-card"><h3>' + t('set.notifHints') + '</h3><p>' + t('set.notifHintsHint') + '</p>' +
      settingRow(t('set.budgetAlerts'), t('budget.alertsSub'), switchHTML(n.budget !== false, 'notif-budget')) +
      settingRow(t('set.billReminders'), t('notif.bill'), switchHTML(n.bills !== false, 'notif-bills')) +
      settingRow(t('set.weeklySummary'), t('notif.summary'), switchHTML(n.weekly !== false, 'notif-weekly')) +
      settingRow(t('set.memberActivity'), t('notif.member'), switchHTML(n.members !== false, 'notif-members')) +
      settingRow(t('set.quietHours'), t('set.quietHoursHint'), switchHTML(n.quietHours !== false, 'notif-quiet')) +
      '</section>';
  } else if (ui.settingsTab === 'data') {
    panel = '<section class="card setting-card"><h3>' + t('set.data') + '</h3><p>' + t('set.exportDataHint') + '</p>' +
      settingRow(t('set.exportData'), t('set.exportDataHint'), '<button class="btn btn--ghost btn--sm" data-action="export-data">' + icon('download') + t('common.export') + '</button>') +
      settingRow(t('set.importData'), t('set.importDataHint'), '<button class="btn btn--ghost btn--sm" data-action="import-data">' + icon('upload') + t('set.importData') + '</button><input type="file" id="importFile" accept="application/json,.json" class="hidden" />') +
      settingRow(t('set.reset'), t('set.resetHint'), '<button class="btn btn--danger btn--sm" data-action="reset-data">' + t('set.reset') + '</button>') +
      '</section>';
  } else {
    panel = '<section class="card setting-card"><h3>HisabPro</h3><p>' + t('set.aboutText') + '</p>' +
      settingRow(t('set.version'), '1.0.0 · PWA', '<span class="chip chip--brand">' + (navigator.onLine ? (HisabI18n.lang() === 'bn' ? 'অনলাইন' : 'Online') : (HisabI18n.lang() === 'bn' ? 'অফলাইন' : 'Offline')) + '</span>') +
      settingRow(t('set.currency'), 'BDT · ৳', '<span class="chip chip--muted">Bangladesh</span>') +
      settingRow(t('set.language'), 'English + বাংলা', '<span class="chip chip--muted">i18n</span>') +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn btn--primary" data-action="install-app">' + icon('download') + (HisabI18n.lang() === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install app') + '</button><button class="btn btn--ghost" data-action="print-report">' + icon('printer') + t('common.print') + '</button></div>' +
      '</section>';
  }
  return '' +
    '<div class="page-head"><div><h2>' + t('set.title') + '</h2><p>' + t('set.sub') + '</p></div></div>' +
    '<div class="settings-layout"><nav class="settings-nav">' + tabs.map((tab) => '<button data-action="settings-tab" data-tab="' + tab + '" class="' + (ui.settingsTab === tab ? 'is-active' : '') + '">' + icon(tabIcons[tab]) + t('set.' + tab) + '</button>').join('') + '</nav><div class="settings-panel">' + panel + '</div></div>';
}

/* ══════════════════ AUTH (static markup lives in HTML) ══════════════════ */
