/* ═══════════════════════════════════════════════════════════
   HisabPro — actions, forms, assistant, lifecycle
   ═══════════════════════════════════════════════════════════ */

/* ─────────── generic refresh ─────────── */
function refresh() {
  if (!state.user) return;
  renderRoute(currentRouteName);
  renderDrawerIfOpen();
  updateChrome();
}
function closeAllOverlays() {
  closeModal(); closeSheet(); closeDrawer();
}

/* ─────────── workspace menu ─────────── */
function renderWorkspaceMenu() {
  const menu = document.getElementById('workspaceMenu');
  if (!menu) return;
  menu.innerHTML = state.workspaces.map((ws) =>
    '<button data-action="switch-workspace" data-id="' + ws.id + '" class="' + (ws.id === state.activeWorkspaceId ? 'is-active' : '') + '" role="option">' +
    '<span class="ws-dot" style="background:' + ws.color + '"></span><span>' + esc(displayWsName(ws)) + '</span>' +
    (ws.id === state.activeWorkspaceId ? '<span style="margin-left:auto">' + icon('check') + '</span>' : '') +
    '</button>'
  ).join('') + '<button class="ws-menu-add" data-action="add-workspace">' + icon('plus') + (HisabI18n.lang() === 'bn' ? 'নতুন ওয়ার্কস্পেস' : 'New workspace') + '</button>';
}
function toggleWorkspaceMenu(force) {
  const menu = document.getElementById('workspaceMenu');
  if (!menu) return;
  const show = typeof force === 'boolean' ? force : menu.classList.contains('hidden');
  if (show) renderWorkspaceMenu();
  menu.classList.toggle('hidden', !show);
}

function createWorkspaceRecord(name, type) {
  const id = 'ws-' + uid('w');
  const names = { personal: 'Personal', family: 'Family', business: 'Business' };
  const namesBn = { personal: 'ব্যক্তিগত', family: 'পরিবার', business: 'ব্যবসা' };
  const colors = { personal: '#0b7a58', family: '#d9922e', business: '#3d7bd9' };
  const userId = state.user.email;
  const ws = {
    id,
    type,
    name: name || names[type],
    nameBn: namesBn[type],
    color: colors[type],
    createdAt: new Date().toISOString(),
    ownerId: 'm-' + id,
    members: [{
      id: 'm-' + id,
      name: state.user.name,
      nameBn: state.user.name,
      email: userId,
      role: 'owner',
      status: 'active',
      initials: initials(state.user.name),
      color: colors[type]
    }]
  };
  const defs = type === 'business'
    ? [{ name: 'Business Current', type: 'bank', opening: 0 }, { name: 'Petty Cash', type: 'cash', opening: 0 }]
    : type === 'family'
      ? [{ name: 'Family Cash', type: 'cash', opening: 0 }, { name: 'Family Bank', type: 'bank', opening: 0 }]
      : [{ name: 'Cash in Hand', type: 'cash', opening: 0 }, { name: 'Bank Account', type: 'bank', opening: 0 }, { name: 'bKash', type: 'bkash', opening: 0 }];
  ws.members[0].id = 'm-' + id;
  state.workspaces.push(ws);
  defs.forEach((d, i) => state.accounts.push({ id: id + '-acc-' + i, workspaceId: id, name: d.name, type: d.type, opening: d.opening, currency: 'BDT', archived: false, createdAt: new Date().toISOString() }));
  HisabSeed.CATEGORY_DEFS.forEach((def) => state.categories.push({ id: id + '-cat-' + def.key, workspaceId: id, key: def.key, type: def.type, name: def.key, emoji: def.emoji, color: def.color, archived: false }));
  state.activeWorkspaceId = id;
  return ws;
}

/* ══════════════════ MODALS — transactions ══════════════════ */
function paymentMethods() { return ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank transfer', 'Card', 'Other']; }

function openTransactionModal(id, presetType) {
  const existing = id ? state.transactions.find((tx) => tx.id === id) : null;
  let type = existing ? existing.type : (presetType === 'transfer' || presetType === 'income' ? presetType : 'expense');
  const accounts = wsAccounts();
  if (!accounts.length) {
    toast(HisabI18n.lang() === 'bn' ? 'প্রথমে একটি অ্যাকাউন্ট যোগ করুন' : 'Add an account first', 'error');
    openAccountModal();
    return;
  }
  const members = memberActive();
  const defaultAccount = existing ? existing.accountId : (accounts.find((a) => a.type === 'bank') || accounts[0]).id;
  const defaultMember = existing && existing.memberId ? existing.memberId : (members.find((m) => m.email === state.user.email) || members[0] || {}).id;
  const catsFor = (kind) => wsCategories(kind);

  function catOptions(kind, selected) {
    return catsFor(kind).map((c) => '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' + esc(catLabel(c)) + '</option>').join('');
  }
  function accOptions(selected) {
    return accounts.map((a) => '<option value="' + a.id + '"' + (selected === a.id ? ' selected' : '') + '>' + esc(a.name) + ' · ' + taka(accountBalance(a.id)) + '</option>').join('');
  }

  const body =
    '<div class="type-toggle">' +
      ['expense', 'income', 'transfer'].map((x) => '<button type="button" data-tx-type="' + x + '" data-type="' + x + '" class="' + (type === x ? 'is-active' : '') + '">' + icon(x === 'income' ? 'arrow-down-left' : x === 'expense' ? 'arrow-up-right' : 'transfer') + (x === 'income' ? t('add.income') : x === 'expense' ? t('add.expense') : t('common.transfer')) + '</button>').join('') +
    '</div>' +
    '<form id="txForm" novalidate>' +
      '<div class="field" style="margin-bottom:14px"><label>' + t('common.amount') + '</label><div class="amount-input"><span class="cur">৳</span><input id="txAmount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0" value="' + (existing ? existing.amount : '') + '" required /></div></div>' +
      '<div class="form-grid">' +
        '<div class="field"><label>' + t('common.date') + '</label><input id="txDate" name="date" type="date" value="' + (existing ? existing.date : todayISO()) + '" required /></div>' +
        '<div class="field" id="txCategoryWrap"><label>' + t('common.category') + '</label><select id="txCategory" name="category">' + catOptions(type, existing ? existing.categoryId : null) + '</select></div>' +
        '<div class="field"><label id="txAccountLabel">' + (type === 'transfer' ? t('tx.fromAccount') : t('common.account')) + '</label><select id="txAccount" name="account">' + accOptions(defaultAccount) + '</select></div>' +
        '<div class="field ' + (type === 'transfer' ? '' : 'hidden') + '" id="txToWrap"><label>' + t('tx.toAccount') + '</label><select id="txToAccount" name="toAccount">' + accOptions(accounts[1] ? accounts[1].id : accounts[0].id) + '</select></div>' +
        '<div class="field"><label>' + t('tx.paymentMethod') + '</label><select id="txMethod" name="method">' + paymentMethods().map((p) => '<option' + ((existing ? existing.paymentMethod : 'Cash') === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
        (members.length > 1 ? '<div class="field"><label>' + (HisabI18n.lang() === 'bn' ? 'যিনি রেকর্ড করছেন' : 'Recorded by') + '</label><select id="txMember" name="member">' + members.map((m) => '<option value="' + m.id + '"' + (defaultMember === m.id ? ' selected' : '') + '>' + esc(HisabI18n.lang() === 'bn' && m.nameBn ? m.nameBn : m.name) + '</option>').join('') + '</select></div>' : '') +
        '<div class="field span-2"><label>' + t('common.description') + ' <span class="muted" style="font-weight:500">(' + t('common.optional') + ')</span></label><input id="txDesc" name="description" type="text" maxlength="120" value="' + esc(existing ? existing.description : '') + '" placeholder="' + (HisabI18n.lang() === 'bn' ? 'যেমন: দুপুরের খাবার' : 'e.g. Lunch with team') + '" /></div>' +
      '</div>' +
      '<p class="form-error hidden" id="txError" style="margin-top:12px"></p>' +
      (type === 'transfer' ? '<div class="modal-note" style="margin-top:14px">' + icon('transfer') + '<span>' + (HisabI18n.lang() === 'bn' ? 'অ্যাকাউন্টের মধ্যে স্থানান্তর আয় বা ব্যয় হিসেবে গণ্য হয় না।' : 'A transfer between accounts is not counted as income or expense.') + '</span></div>' : '') +
    '</form>';

  openModal({
    title: existing ? t('tx.edit') : (type === 'income' ? t('add.income') : type === 'transfer' ? t('common.transfer') : t('add.expense')),
    subtitle: existing ? t('tx.sub') : (type === 'income' ? t('add.income.sub') : type === 'transfer' ? t('add.transfer.sub') : t('add.expense.sub')),
    body,
    wide: true,
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="txForm">' + t('common.save') + '</button>'
  });

  const form = document.getElementById('txForm');
  const errEl = document.getElementById('txError');
  if (!form || !errEl) return;

  function updateType(next) {
    type = next;
    $$('.type-toggle [data-tx-type]').forEach((b) => b.classList.toggle('is-active', b.dataset.txType === type));
    document.getElementById('txCategoryWrap').classList.toggle('hidden', type === 'transfer');
    document.getElementById('txToWrap').classList.toggle('hidden', type !== 'transfer');
    document.getElementById('txAccountLabel').textContent = type === 'transfer' ? t('tx.fromAccount') : t('common.account');
    if (type !== 'transfer') {
      const sel = document.getElementById('txCategory');
      sel.innerHTML = catOptions(type, existing && existing.type === type ? existing.categoryId : null);
    }
  }
  $$('.type-toggle [data-tx-type]').forEach((btn) => btn.addEventListener('click', () => updateType(btn.dataset.txType)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('txAmount').value);
    const dateVal = document.getElementById('txDate').value || todayISO();
    const accountId = document.getElementById('txAccount').value;
    const toId = document.getElementById('txToAccount').value;
    const catId = type === 'transfer' ? null : document.getElementById('txCategory').value;
    if (!amount || amount <= 0) { showFormError(errEl, HisabI18n.lang() === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.'); return; }
    if (!dateVal) { showFormError(errEl, HisabI18n.lang() === 'bn' ? 'তারিখ দিন।' : 'Choose a date.'); return; }
    if (type === 'transfer' && accountId === toId) { showFormError(errEl, HisabI18n.lang() === 'bn' ? 'দুটি ভিন্ন অ্যাকাউন্ট বেছে নিন।' : 'Choose two different accounts.'); return; }
    if (type === 'transfer' && type !== 'expense') {
      // A transfer is allowed to exceed the displayed balance in this demo, but warn.
      const bal = accountBalance(accountId);
      if (amount > bal) { showFormError(errEl, HisabI18n.lang() === 'bn' ? 'এই অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।' : 'This account does not have enough balance.'); return; }
    }
    const memberSel = document.getElementById('txMember');
    const data = {
      workspaceId: activeWs().id,
      type,
      amount: Math.round(amount * 100) / 100,
      date: dateVal,
      categoryId: catId || null,
      accountId,
      toAccountId: type === 'transfer' ? toId : null,
      description: (document.getElementById('txDesc').value || '').trim() || (type === 'transfer' ? t('common.transfer') : catLabel(categoryById(catId))),
      paymentMethod: document.getElementById('txMethod').value,
      memberId: memberSel ? memberSel.value : null,
      goalId: null
    };
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      audit('transaction.updated', { id: existing.id, amount: existing.amount });
    } else {
      state.transactions.unshift({ id: uid('tx'), ...data, createdAt: new Date().toISOString() });
      audit('transaction.created', { amount: data.amount, type });
    }
    saveState();
    closeModal();
    refresh();
    toast(existing ? t('tx.updated') : t('tx.saved'));
  });
}

function showFormError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden');
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/* ══════════════════ MODALS — accounts ══════════════════ */
function openAccountModal(id) {
  const existing = id ? state.accounts.find((a) => a.id === id) : null;
  const types = ['cash', 'bank', 'savings', 'card', 'bkash', 'nagad', 'rocket', 'custom'];
  openModal({
    title: existing ? t('acc.edit') : t('acc.new'),
    subtitle: t('acc.sub'),
    body: '<form id="accountForm" class="form-grid">' +
      '<div class="field span-2"><label>' + (HisabI18n.lang() === 'bn' ? 'অ্যাকাউন্টের নাম' : 'Account name') + '</label><input name="name" type="text" value="' + esc(existing ? existing.name : '') + '" placeholder="e.g. BRAC Bank" required /></div>' +
      '<div class="field"><label>' + t('common.type') + '</label><select name="type">' + types.map((x) => '<option value="' + x + '"' + (existing && existing.type === x ? ' selected' : '') + '>' + accountTypeLabel(x) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('acc.opening') + ' (৳)</label><input name="opening" type="number" step="0.01" value="' + (existing ? existing.opening : 0) + '" /></div>' +
      '<p class="form-error hidden span-2" id="accError"></p>' +
      '</form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="accountForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('accountForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    if (!name) { showFormError(document.getElementById('accError'), HisabI18n.lang() === 'bn' ? 'নাম দিন।' : 'Enter a name.'); return; }
    const data = { name, type: form.type.value, opening: Number(form.opening.value) || 0 };
    if (existing) { Object.assign(existing, data); audit('account.updated', { id: existing.id }); }
    else { state.accounts.push({ id: uid('acc'), workspaceId: activeWs().id, ...data, currency: 'BDT', archived: false, createdAt: new Date().toISOString() }); audit('account.created', { name }); }
    saveState(); closeModal(); refresh(); toast(t('acc.saved'));
  });
}

/* ══════════════════ MODALS — budgets ══════════════════ */
function openBudgetModal(id) {
  const existing = id ? state.budgets.find((b) => b.id === id) : null;
  const cats = wsCategories('expense');
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];
  openModal({
    title: existing ? t('budget.edit') : t('budget.new'),
    subtitle: t('budget.sub'),
    body: '<form id="budgetForm" class="form-grid">' +
      '<div class="field"><label>' + t('budget.period') + '</label><select name="period">' + periods.map((p) => '<option value="' + p + '"' + ((existing ? existing.period : ui.budgetPeriod) === p ? ' selected' : '') + '>' + t('budget.' + p) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('common.amount') + ' (৳)</label><input name="amount" type="number" min="1" step="1" value="' + (existing ? existing.amount : '') + '" required /></div>' +
      '<div class="field span-2"><label>' + t('common.category') + '</label><select name="category"><option value="">' + t('budget.noCategory') + '</option>' + cats.map((c) => '<option value="' + c.key + '"' + (existing && existing.categoryKey === c.key ? ' selected' : '') + '>' + esc(catLabel(c)) + '</option>').join('') + '</select></div>' +
      '<p class="form-error hidden span-2" id="budgetError"></p>' +
      '</form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button>' +
      (existing ? '<button class="btn btn--danger" data-action="delete-budget" data-id="' + existing.id + '">' + t('common.delete') + '</button>' : '') +
      '<button class="btn btn--primary" type="submit" form="budgetForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('budgetForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.amount.value);
    const period = form.period.value;
    const categoryKey = form.category.value || null;
    if (!amount || amount <= 0) { showFormError(document.getElementById('budgetError'), HisabI18n.lang() === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.'); return; }
    const dup = wsBudgets().find((b) => b.period === period && b.categoryKey === categoryKey && (!existing || b.id !== existing.id));
    if (dup) { showFormError(document.getElementById('budgetError'), HisabI18n.lang() === 'bn' ? 'এই বিভাগে এই সময়ের জন্য বাজেট আছে।' : 'A budget already exists for this category and period.'); return; }
    const data = { period, amount, categoryKey, alertThreshold: 80 };
    if (existing) { Object.assign(existing, data); audit('budget.updated', { id: existing.id }); }
    else { state.budgets.push({ id: uid('budget'), workspaceId: activeWs().id, ...data, createdAt: new Date().toISOString() }); audit('budget.created', { amount }); }
    ui.budgetPeriod = period;
    saveState(); closeModal(); refresh(); toast(t('budget.saved'));
  });
}

/* ══════════════════ MODALS — savings ══════════════════ */
function openGoalModal() {
  openModal({
    title: t('savings.new'),
    subtitle: t('savings.sub'),
    body: '<form id="goalForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('common.name') + '</label><input name="name" type="text" placeholder="' + t('savings.namePlaceholder') + '" required /></div>' +
      '<div class="field"><label>' + t('savings.target') + ' (৳)</label><input name="target" type="number" min="1" step="1" required /></div>' +
      '<div class="field"><label>' + t('savings.deadline') + '</label><input name="deadline" type="date" value="' + isoOf(new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1)) + '" required /></div>' +
      '<div class="field"><label>' + (HisabI18n.lang() === 'bn' ? 'আইকন' : 'Icon') + '</label><select name="emoji">' + ['🛟', '🏖️', '💻', '🏠', '🎓', '🚗', '💍', '✈️', '🐖', '🎯'].map((e) => '<option>' + e + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + (HisabI18n.lang() === 'bn' ? 'রং' : 'Colour') + '</label><select name="color"><option value="#0e9f6e">Emerald</option><option value="#3d7bd9">Blue</option><option value="#7c5cd6">Violet</option><option value="#d9922e">Amber</option><option value="#d06ab0">Rose</option></select></div>' +
      '<p class="form-error hidden span-2" id="goalError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="goalForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('goalForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = Number(form.target.value);
    if (!form.name.value.trim() || !target) { showFormError(document.getElementById('goalError'), HisabI18n.lang() === 'bn' ? 'নাম ও লক্ষ্য দিন।' : 'Enter a name and target.'); return; }
    state.goals.push({ id: uid('goal'), workspaceId: activeWs().id, name: form.name.value.trim(), target, saved: 0, deadline: form.deadline.value, emoji: form.emoji.value, color: form.color.value, contributions: [], createdAt: new Date().toISOString() });
    audit('goal.created', { target });
    saveState(); closeModal(); refresh(); toast(t('toast.saved'));
  });
}

function openContributionModal(id) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return;
  const accounts = wsAccounts().filter((a) => a.type !== 'savings').slice().sort((a, b) => accountBalance(b.id) - accountBalance(a.id));
  const savingsAcc = wsAccounts().find((a) => a.type === 'savings');
  if (!accounts.length) { toast(HisabI18n.lang() === 'bn' ? 'প্রথমে একটি অ্যাকাউন্ট যোগ করুন' : 'Add an account first', 'error'); return; }
  openModal({
    title: t('savings.contribution'),
    subtitle: goal.name,
    body: '<form id="contribForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('common.amount') + ' (৳)</label><div class="amount-input"><span class="cur">৳</span><input name="amount" type="number" min="1" step="1" inputmode="decimal" required autofocus /></div></div>' +
      '<div class="field span-2"><label>' + t('savings.fromAccount') + '</label><select name="account">' + accounts.map((a, i) => '<option value="' + a.id + '"' + (i === 0 ? ' selected' : '') + '>' + esc(a.name) + ' · ' + taka(accountBalance(a.id)) + '</option>').join('') + '</select></div>' +
      '<div class="field span-2"><label>' + t('common.date') + '</label><input name="date" type="date" value="' + todayISO() + '" required /></div>' +
      '<p class="form-error hidden span-2" id="contribError"></p>' +
      '<div class="modal-note span-2">' + icon('transfer') + '<span>' + (HisabI18n.lang() === 'bn' ? 'টাকা সঞ্চয় রিজার্ভে স্থানান্তর হবে, ব্যয় হিসেবে গণ্য হবে না।' : 'Money moves to Savings Reserve as a transfer, not an expense.') + '</span></div></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="contribForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('contribForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.amount.value);
    const accId = form.account.value;
    if (!amount || amount <= 0) { showFormError(document.getElementById('contribError'), HisabI18n.lang() === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.'); return; }
    if (amount > accountBalance(accId)) { showFormError(document.getElementById('contribError'), HisabI18n.lang() === 'bn' ? 'এই অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।' : 'This account does not have enough balance.'); return; }
    let reserve = savingsAcc;
    if (!reserve) {
      reserve = { id: uid('acc'), workspaceId: activeWs().id, name: 'Savings Reserve', type: 'savings', opening: 0, currency: 'BDT', archived: false, createdAt: new Date().toISOString() };
      state.accounts.push(reserve);
    }
    const cat = catByKey('savingscat');
    state.transactions.unshift({
      id: uid('tx'), workspaceId: activeWs().id, type: 'transfer', amount, date: form.date.value || todayISO(),
      categoryId: cat ? cat.id : null, accountId: accId, toAccountId: reserve.id,
      description: (HisabI18n.lang() === 'bn' ? 'সঞ্চয় জমা — ' : 'Savings contribution — ') + goal.name,
      paymentMethod: accountName(accId), memberId: (memberActive().find((m) => m.email === state.user.email) || {}).id || null,
      goalId: goal.id, createdAt: new Date().toISOString()
    });
    goal.saved = Number(goal.saved) + amount;
    goal.contributions = goal.contributions || [];
    goal.contributions.push({ date: form.date.value || todayISO(), amount });
    audit('goal.contributed', { goal: goal.id, amount });
    saveState(); closeModal(); refresh(); toast(t('savings.contributed'));
  });
}

/* ══════════════════ MODALS — debts ══════════════════ */
function openDebtModal() {
  openModal({
    title: t('debt.new'),
    subtitle: t('debt.sub'),
    body: '<form id="debtForm" class="form-grid">' +
      '<div class="field"><label>' + t('debt.direction') + '</label><select name="direction"><option value="borrowed">' + t('debt.borrowed') + '</option><option value="lent">' + t('debt.lent') + '</option></select></div>' +
      '<div class="field"><label>' + t('debt.party') + '</label><input name="party" type="text" required /></div>' +
      '<div class="field"><label>' + t('debt.principal') + ' (৳)</label><input name="principal" type="number" min="1" required /></div>' +
      '<div class="field"><label>' + t('debt.rate') + '</label><input name="rate" type="number" min="0" step="0.1" value="0" /></div>' +
      '<div class="field"><label>' + t('debt.startDate') + '</label><input name="startDate" type="date" value="' + todayISO() + '" required /></div>' +
      '<div class="field"><label>' + t('debt.dueDate') + '</label><input name="dueDate" type="date" value="' + isoOf(new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate())) + '" required /></div>' +
      '<p class="form-error hidden span-2" id="debtError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="debtForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('debtForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const principal = Number(form.principal.value);
    if (!form.party.value.trim() || !principal) { showFormError(document.getElementById('debtError'), HisabI18n.lang() === 'bn' ? 'পক্ষ ও মূলধন দিন।' : 'Enter a party and principal.'); return; }
    state.debts.push({ id: uid('debt'), workspaceId: activeWs().id, direction: form.direction.value, party: form.party.value.trim(), principal, outstanding: principal, rate: Number(form.rate.value) || 0, startDate: form.startDate.value, dueDate: form.dueDate.value, payments: [], createdAt: new Date().toISOString() });
    audit('debt.created', { principal });
    saveState(); closeModal(); refresh(); toast(t('debt.created'));
  });
}

function openDebtPaymentModal(id) {
  const debt = state.debts.find((d) => d.id === id);
  if (!debt) return;
  const accounts = wsAccounts().slice().sort((a, b) => accountBalance(b.id) - accountBalance(a.id));
  const interestCat = catByKey('interest');
  openModal({
    title: t('debt.payment'),
    subtitle: debt.party + ' · ' + taka(debt.outstanding) + ' ' + t('debt.remaining'),
    body: '<form id="debtPayForm" class="form-grid">' +
      '<div class="field"><label>' + t('debt.paymentAmount') + ' (৳)</label><input name="amount" type="number" min="1" step="1" value="' + Math.min(debt.outstanding, 10000) + '" required /></div>' +
      '<div class="field"><label>' + t('debt.interestPart') + ' (৳)</label><input name="interest" type="number" min="0" step="1" value="0" /></div>' +
      '<div class="field"><label>' + t('common.account') + '</label><select name="account">' + accounts.map((a, i) => '<option value="' + a.id + '"' + (i === 0 ? ' selected' : '') + '>' + esc(a.name) + ' · ' + taka(accountBalance(a.id)) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('common.date') + '</label><input name="date" type="date" value="' + todayISO() + '" required /></div>' +
      '<p class="form-error hidden span-2" id="debtPayError"></p>' +
      '<div class="modal-note span-2">' + icon('debt') + '<span>' + (HisabI18n.lang() === 'bn' ? 'মূলধন পরিশোধ দায় কমায়; সুদের অংশ ব্যয় হিসেবে রেকর্ড হয়।' : 'Principal reduces the liability; the interest portion is recorded as an expense.') + '</span></div></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="debtPayForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('debtPayForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.amount.value);
    const interest = Math.min(Number(form.interest.value) || 0, amount);
    if (!amount || amount <= 0) { showFormError(document.getElementById('debtPayError'), HisabI18n.lang() === 'bn' ? 'সঠিক পরিমাণ দিন।' : 'Enter a valid amount.'); return; }
    if (amount > debt.outstanding) { showFormError(document.getElementById('debtPayError'), HisabI18n.lang() === 'bn' ? 'বাকির চেয়ে বেশি পরিশোধ করা যাবে না।' : 'Payment cannot exceed the outstanding balance.'); return; }
    const principalPart = amount - interest;
    const accountId = form.account.value;
    const dateVal = form.date.value || todayISO();
    debt.outstanding = Math.max(0, debt.outstanding - principalPart);
    debt.payments = debt.payments || [];
    debt.payments.push({ date: dateVal, amount, interest, principal: principalPart });
    if (interest > 0 && interestCat) {
      state.transactions.unshift({ id: uid('tx'), workspaceId: activeWs().id, type: 'expense', amount: interest, date: dateVal, categoryId: interestCat.id, accountId, toAccountId: null, description: (HisabI18n.lang() === 'bn' ? 'ঋণের সুদ — ' : 'Loan interest — ') + debt.party, paymentMethod: accountName(accountId), memberId: null, goalId: null, createdAt: new Date().toISOString() });
    }
    audit('debt.payment', { debt: debt.id, amount, interest });
    saveState(); closeModal(); refresh(); toast(t('debt.paid'));
  });
}

function openDebtHistoryModal(id) {
  const debt = state.debts.find((d) => d.id === id);
  if (!debt) return;
  const payments = (debt.payments || []).slice().reverse();
  openModal({
    title: t('debt.history'),
    subtitle: debt.party,
    body: payments.length
      ? '<div class="table-wrap"><table class="report-table"><thead><tr><th>' + t('common.date') + '</th><th class="num">' + t('common.amount') + '</th><th class="num">' + t('debt.principal') + '</th><th class="num">' + t('debt.interestPart') + '</th></tr></thead><tbody>' +
        payments.map((p) => '<tr><td>' + esc(HisabI18n.date(p.date)) + '</td><td class="num">' + taka(p.amount) + '</td><td class="num">' + taka(p.principal) + '</td><td class="num">' + taka(p.interest) + '</td></tr>').join('') +
        '</tbody></table></div>'
      : '<p class="muted" style="font-size:12px">' + t('debt.noHistory') + '</p>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.close') + '</button>'
  });
}

/* ══════════════════ MODALS — recurring ══════════════════ */
function openRecurringModal(id) {
  const existing = id ? state.recurring.find((r) => r.id === id) : null;
  const accounts = wsAccounts();
  const cats = wsCategories();
  const type = existing ? existing.type : 'expense';
  openModal({
    title: existing ? t('rec.edit') : t('rec.new'),
    subtitle: t('rec.sub'),
    body: '<form id="recForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('common.name') + '</label><input name="name" type="text" value="' + esc(existing ? existing.name : '') + '" required /></div>' +
      '<div class="field"><label>' + t('common.type') + '</label><select name="type"><option value="expense"' + (type === 'expense' ? ' selected' : '') + '>' + t('common.expense') + '</option><option value="income"' + (type === 'income' ? ' selected' : '') + '>' + t('common.income') + '</option></select></div>' +
      '<div class="field"><label>' + t('common.amount') + ' (৳)</label><input name="amount" type="number" min="1" step="1" value="' + (existing ? existing.amount : '') + '" required /></div>' +
      '<div class="field"><label>' + t('common.category') + '</label><select name="category">' + cats.filter((c) => c.type === type).map((c) => '<option value="' + c.key + '"' + (existing && existing.categoryKey === c.key ? ' selected' : '') + '>' + esc(catLabel(c)) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('common.account') + '</label><select name="account">' + accounts.map((a, i) => '<option value="' + i + '"' + (existing && existing.accountIndex === i ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('rec.frequency') + '</label><select name="frequency">' + ['daily', 'weekly', 'monthly', 'yearly'].map((f) => '<option value="' + f + '"' + (existing && existing.frequency === f ? ' selected' : '') + '>' + t('rec.' + f) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('rec.next') + '</label><input name="nextDate" type="date" value="' + (existing ? existing.nextDate : todayISO()) + '" required /></div>' +
      '<div class="field"><label>' + t('rec.reminder') + '</label><input name="remindDays" type="number" min="0" max="30" value="' + (existing ? existing.remindDays : 2) + '" /></div>' +
      '<p class="form-error hidden span-2" id="recError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="recForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('recForm');
  const typeSel = form.querySelector('select[name="type"]');
  typeSel.addEventListener('change', () => {
    const catSel = form.querySelector('select[name="category"]');
    catSel.innerHTML = wsCategories(typeSel.value).map((c) => '<option value="' + c.key + '">' + esc(catLabel(c)) + '</option>').join('');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(form.amount.value);
    if (!form.name.value.trim() || !amount) { showFormError(document.getElementById('recError'), HisabI18n.lang() === 'bn' ? 'নাম ও পরিমাণ দিন।' : 'Enter a name and amount.'); return; }
    const data = { name: form.name.value.trim(), type: form.type.value, amount, categoryKey: form.category.value, accountIndex: Number(form.account.value), frequency: form.frequency.value, nextDate: form.nextDate.value || todayISO(), remindDays: Number(form.remindDays.value) || 0 };
    if (existing) Object.assign(existing, data);
    else state.recurring.push({ id: uid('rec'), workspaceId: activeWs().id, ...data, active: true, createdAt: new Date().toISOString() });
    audit(existing ? 'recurring.updated' : 'recurring.created', { name: data.name });
    saveState(); closeModal(); refresh(); toast(t('toast.saved'));
  });
}

function advanceRecurringDate(isoDate, frequency) {
  const d = parse(isoDate);
  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return isoOf(d);
}

/* ══════════════════ MODALS — members, workspace, security ══════════════════ */
function openInviteModal() {
  openModal({
    title: t('members.invite'),
    subtitle: t('members.inviteSub'),
    body: '<form id="inviteForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('members.emailLabel') + '</label><input name="email" type="email" placeholder="name@example.com" required /></div>' +
      '<div class="field span-2"><label>' + t('members.roleLabel') + '</label><select name="role">' + ['admin', 'accountant', 'manager', 'member', 'viewer'].map((r) => '<option value="' + r + '"' + (r === 'member' ? ' selected' : '') + '>' + roleLabel(r) + '</option>').join('') + '</select></div>' +
      '<p class="modal-note span-2">' + icon('mail') + '<span>' + t('members.noInvite') + '</span></p>' +
      '<p class="form-error hidden span-2" id="inviteError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="inviteForm">' + t('members.invite') + '</button>'
  });
  const form = document.getElementById('inviteForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormError(document.getElementById('inviteError'), HisabI18n.lang() === 'bn' ? 'সঠিক ইমেইল দিন।' : 'Enter a valid email.'); return; }
    if (wsMembers().some((m) => m.email === email)) { showFormError(document.getElementById('inviteError'), HisabI18n.lang() === 'bn' ? 'এই ইমেইল ইতিমধ্যে সদস্য।' : 'This email is already a member.'); return; }
    activeWs().members.push({ id: uid('member'), name: email.split('@')[0], nameBn: email.split('@')[0], email, role: form.role.value, status: 'pending', initials: initials(email.split('@')[0]), color: '#7c5cd6' });
    audit('member.invited', { email });
    addNotification('info', t('members.invited'), email + ' · ' + roleLabel(form.role.value));
    saveState(); closeModal(); refresh(); toast(t('members.invited'));
  });
}

function openWorkspaceModal() {
  openModal({
    title: t('ws.new'),
    subtitle: t('ws.switch'),
    body: '<form id="newWsForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('ws.name') + '</label><input name="name" type="text" placeholder="e.g. Side business" required /></div>' +
      '<div class="field span-2"><label>' + t('ws.type') + '</label><div class="choice-row">' + ['personal', 'family', 'business'].map((x, i) => '<label class="choice"><input type="radio" name="type" value="' + x + '"' + (i === 0 ? ' checked' : '') + ' /><span><b>' + t('ws.' + x) + '</b><small>' + t('ws.' + x + 'Desc') + '</small></span></label>').join('') + '</div></div>' +
      '<p class="form-error hidden span-2" id="wsError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="newWsForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('newWsForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.name.value.trim()) { showFormError(document.getElementById('wsError'), HisabI18n.lang() === 'bn' ? 'নাম দিন।' : 'Enter a name.'); return; }
    const type = form.querySelector('input[name="type"]:checked').value;
    createWorkspaceRecord(form.name.value.trim(), type);
    audit('workspace.created', { type });
    saveState(); closeModal(); refresh(); toast(t('ws.created'));
  });
}

function openPasswordModal() {
  openModal({
    title: t('set.changePassword'),
    subtitle: t('set.security'),
    body: '<form id="passwordForm" class="form-grid">' +
      '<div class="field span-2"><label>' + t('auth.password') + '</label><input name="password" type="password" minlength="6" required /></div>' +
      '<p class="modal-note span-2">' + icon('shield') + '<span>' + (HisabI18n.lang() === 'bn' ? 'এই ডেমোতে পাসওয়ার্ড শুধু ইন্টারফেসে যাচাই হয়, সার্ভারে সংরক্ষিত হয় না।' : 'In this demo the password is only checked in the interface and is not stored on a server.') + '</span></p>' +
      '<p class="form-error hidden span-2" id="pwError"></p></form>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.cancel') + '</button><button class="btn btn--primary" type="submit" form="passwordForm">' + t('common.save') + '</button>'
  });
  const form = document.getElementById('passwordForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if ((form.password.value || '').length < 6) { showFormError(document.getElementById('pwError'), t('auth.invalid')); return; }
    closeModal(); toast(t('set.passwordChanged'));
  });
}

/* ══════════════════ DAY / DEBT / MISC ══════════════════ */
function openDayModal(isoDate) {
  const list = sortTxDesc(wsTransactions().filter((tx) => tx.date === isoDate));
  const sums = sumByTypes(list);
  openModal({
    title: HisabI18n.date(isoDate, 'long'),
    subtitle: sums.income || sums.expense ? t('tx.in') + ' ' + taka(sums.income) + ' · ' + t('tx.out') + ' ' + taka(sums.expense) : t('cal.noDay'),
    body: list.length ? '<div class="tx-list">' + list.map((tx) => transactionRowHTML(tx, { showMember: true })).join('') + '</div>' : '<p class="muted" style="font-size:12px">' + t('cal.noDay') + '</p>',
    footer: '<button class="btn btn--ghost" data-close-modal>' + t('common.close') + '</button><button class="btn btn--primary" data-action="add-tx" data-type="expense">' + icon('plus') + t('add.expense') + '</button>'
  });
}

/* ══════════════════ ASSISTANT ══════════════════ */
function chatAnswer(query) {
  const q = String(query || '').toLowerCase();
  const bn = HisabI18n.lang() === 'bn';
  const range = rangeFor('month');
  const prev = rangeFor('lastMonth');
  const sums = sumByTypes(txsInRange(range));
  const prevSums = sumByTypes(txsInRange(prev));
  const cats = categoryBreakdown('expense', range);
  const has = (...words) => words.some((w) => q.includes(w));
  const listHTML = (items) => '<ul>' + items.map((i) => '<li><span>' + esc(i.name) + '</span><b>' + taka(i.amount) + '</b></li>').join('') + '</ul>';
  const sourceNote = '<div class="insight-foot" style="margin-top:8px">' + icon('shield') + '<span>' + (bn ? esc(displayWsName()) + ' ওয়ার্কস্পেসের স্থানীয় তথ্য' : 'Based on local data in ' + esc(displayWsName())) + '</span></div>';

  if (has('budget', 'বাজেট')) {
    const list = wsBudgets().filter((b) => b.period === 'monthly');
    if (!list.length) return '<p>' + (bn ? 'এই ওয়ার্কস্পেসে এখনো কোনো মাসিক বাজেট নেই।' : 'There are no monthly budgets in this workspace yet.') + '</p>';
    const rows = list.map((b) => {
      const spent = budgetSpent(b, range);
      const st = budgetStatus(spent, b.amount);
      return { name: (b.categoryKey ? catLabel(catByKey(b.categoryKey)) : t('budget.overall')) + ' · ' + HisabI18n.pct(st.pct, 0), amount: spent, over: st.over };
    });
    const over = rows.filter((r) => r.over);
    return '<p>' + (bn ? 'এই মাসে আপনার বাজেট অবস্থা:' : 'Here is your budget position this month:') + '</p>' +
      '<ul>' + rows.map((r) => '<li><span>' + esc(r.name) + '</span><b class="' + (r.over ? 'neg' : '') + '">' + taka(r.amount) + '</b></li>').join('') + '</ul>' +
      (over.length ? '<p style="margin-top:7px"><b>' + (bn ? 'সীমা ছাড়িয়েছে:' : 'Over budget:') + '</b> ' + over.map((r) => esc(r.name.split(' · ')[0])).join(', ') + '</p>' : '<p style="margin-top:7px">' + (bn ? 'সব বাজেট সীমার মধ্যে আছে।' : 'All budgets are within their limits.') + '</p>') + sourceNote;
  }
  if (has('top', 'most', 'category', 'বিভাগ', 'সবচেয়ে')) {
    if (!cats.length) return '<p>' + (bn ? 'এই মাসে এখনো কোনো ব্যয় নেই।' : 'No expenses recorded this month yet.') + '</p>';
    return '<p>' + (bn ? 'এই মাসে আপনার শীর্ষ ব্যয়ের বিভাগগুলো:' : 'Your top spending categories this month:') + '</p>' +
      listHTML(cats.slice(0, 5).map((c) => ({ name: catLabel(c.cat) + ' · ' + HisabI18n.pct(c.pct, 1), amount: c.amount }))) +
      (cats[0] ? '<p style="margin-top:7px">' + (bn ? 'সবচেয়ে বেশি ব্যয় <b>' + esc(catLabel(cats[0].cat)) + '</b>-এ।' : 'The highest is <b>' + esc(catLabel(cats[0].cat)) + '</b>.') + '</p>' : '') + sourceNote;
  }
  if (has('compare', 'last month', 'গত মাস', 'তুলনা')) {
    const diff = sums.expense - prevSums.expense;
    const pctChange = prevSums.expense ? (diff / prevSums.expense) * 100 : 0;
    return '<p>' + (bn ? 'এই মাসে ব্যয় <b>' + taka(sums.expense) + '</b>, গত মাসে ছিল <b>' + taka(prevSums.expense) + '</b>।' : 'This month you spent <b>' + taka(sums.expense) + '</b>, versus <b>' + taka(prevSums.expense) + '</b> last month.') + '</p>' +
      '<p>' + (bn ? 'পরিবর্তন: <b>' + (diff >= 0 ? '+' : '−') + taka(Math.abs(diff)) + '</b> (' + HisabI18n.pct(Math.abs(pctChange), 1) + ' ' + (diff >= 0 ? 'বৃদ্ধি' : 'হ্রাস') + ')' : 'That is <b>' + (diff >= 0 ? '+' : '−') + taka(Math.abs(diff)) + '</b> (' + HisabI18n.pct(Math.abs(pctChange), 1) + ' ' + (diff >= 0 ? 'higher' : 'lower') + ').') + '</p>' +
      '<p>' + (bn ? 'এই মাসের আয় ' + taka(sums.income) + ', নিট ' + taka(sums.net) + '।' : 'Income this month is ' + taka(sums.income) + ', net ' + taka(sums.net) + '.') + '</p>' + sourceNote;
  }
  if (has('balance', 'ব্যালেন্স', 'account', 'অ্যাকাউন্ট')) {
    const accounts = wsAccounts().map((a) => ({ name: a.name, amount: accountBalance(a.id) })).sort((a, b) => b.amount - a.amount);
    return '<p>' + (bn ? 'আপনার মোট ব্যালেন্স <b>' + taka(totalBalance()) + '</b> (' + HisabI18n.number(accounts.length) + 'টি অ্যাকাউন্ট)।' : 'Your total balance is <b>' + taka(totalBalance()) + '</b> across ' + HisabI18n.number(accounts.length) + ' accounts.') + '</p>' + listHTML(accounts.slice(0, 6)) + sourceNote;
  }
  if (has('saving', 'goal', 'সঞ্চয়', 'লক্ষ্য')) {
    const goals = wsGoals();
    if (!goals.length) return '<p>' + (bn ? 'এই ওয়ার্কস্পেসে এখনো কোনো সঞ্চয় লক্ষ্য নেই।' : 'There are no savings goals in this workspace yet.') + '</p>';
    return '<p>' + (bn ? 'আপনি মোট <b>' + taka(savingsTotal()) + '</b> সঞ্চয় করেছেন ' + HisabI18n.number(goals.length) + 'টি লক্ষ্যে।' : 'You have saved <b>' + taka(savingsTotal()) + '</b> across ' + HisabI18n.number(goals.length) + ' goals.') + '</p>' +
      '<ul>' + goals.map((g) => '<li><span>' + esc(g.name) + ' · ' + HisabI18n.pct(pctOf(g.saved, g.target), 0) + '</span><b>' + taka(g.saved) + ' / ' + taka(g.target) + '</b></li>').join('') + '</ul>' + sourceNote;
  }
  if (has('debt', 'loan', 'ঋণ', 'ধার')) {
    const totals = debtsTotals();
    return '<p>' + (bn ? 'আপনি <b>' + taka(totals.borrowed) + '</b> ধার নিয়েছেন এবং <b>' + taka(totals.lent) + '</b> ধার দিয়েছেন।' : 'You have borrowed <b>' + taka(totals.borrowed) + '</b> and lent <b>' + taka(totals.lent) + '</b>.') + '</p>' +
      '<p>' + (bn ? 'নিট ঋণ অবস্থান: <b>' + taka(totals.net) + '</b>।' : 'Net debt position: <b>' + taka(totals.net) + '</b>.') + '</p>' +
      '<ul>' + wsDebts().map((d) => '<li><span>' + esc(d.party) + ' · ' + esc(t('debt.' + d.direction)) + '</span><b>' + taka(d.outstanding) + '</b></li>').join('') + '</ul>' + sourceNote;
  }
  if (has('income', 'earned', 'আয়', 'আয়')) {
    return '<p>' + (bn ? 'এই মাসে আপনার আয় <b>' + taka(sums.income) + '</b>।' : 'You earned <b>' + taka(sums.income) + '</b> this month.') + '</p>' +
      '<p>' + (bn ? 'ব্যয় <b>' + taka(sums.expense) + '</b>, নিট সঞ্চয় <b>' + taka(sums.net) + '</b>।' : 'Expenses were <b>' + taka(sums.expense) + '</b>, leaving a net of <b>' + taka(sums.net) + '</b>.') + '</p>' + sourceNote;
  }
  if (has('spend', 'spent', 'expense', 'খরচ', 'ব্যয়')) {
    return '<p>' + (bn ? 'এই মাসে আপনি <b>' + taka(sums.expense) + '</b> ব্যয় করেছেন।' : 'You spent <b>' + taka(sums.expense) + '</b> this month.') + '</p>' +
      (cats.length ? '<p>' + (bn ? 'শীর্ষ বিভাগ:' : 'Biggest categories:') + '</p>' + listHTML(cats.slice(0, 4).map((c) => ({ name: catLabel(c.cat), amount: c.amount }))) : '') +
      '<p style="margin-top:7px">' + (bn ? 'আয় <b>' + taka(sums.income) + '</b> · নিট <b>' + taka(sums.net) + '</b>' : 'Income <b>' + taka(sums.income) + '</b> · Net <b>' + taka(sums.net) + '</b>') + '</p>' + sourceNote;
  }
  return '<p>' + (bn ? 'আমি এই ওয়ার্কস্পেসের আয়, ব্যয়, বাজেট, ব্যালেন্স, সঞ্চয় ও ঋণ সম্পর্কে উত্তর দিতে পারি।' : 'I can answer questions about income, spending, budgets, balances, savings and debt in this workspace.') + '</p>' +
    '<p>' + (bn ? 'উদাহরণ: “এই মাসে কত খরচ করেছি?”, “কোন বিভাগে সবচেয়ে বেশি খরচ?”, “আমার ব্যালেন্স কত?”' : 'Try: “How much did I spend this month?”, “Which category cost the most?”, “What is my balance?”') + '</p>' +
    '<p>' + (bn ? 'বর্তমানে: আয় ' + taka(sums.income) + ', ব্যয় ' + taka(sums.expense) + ', নিট ' + taka(sums.net) + '।' : 'Right now: income ' + taka(sums.income) + ', expenses ' + taka(sums.expense) + ', net ' + taka(sums.net) + '.') + '</p>' + sourceNote;
}

function refreshChat() {
  const body = document.getElementById('chatBody');
  if (body) {
    body.innerHTML = chatMessagesHTML();
    body.scrollTop = body.scrollHeight;
  }
  const input = document.getElementById('chatInput');
  if (input) { input.disabled = ui.chatBusy; input.focus(); }
}
function askAssistant(text) {
  if (!text || ui.chatBusy) return;
  state.chat = state.chat || [];
  state.chat.push({ role: 'user', text, time: new Date().toISOString(), workspaceId: activeWs().id });
  ui.chatBusy = true;
  saveState();
  refreshChat();
  setTimeout(() => {
    const html = chatAnswer(text);
    state.chat.push({ role: 'assistant', html, time: new Date().toISOString(), workspaceId: activeWs().id });
    ui.chatBusy = false;
    saveState();
    refreshChat();
  }, 650);
}

/* ══════════════════ EXPORT / PRINT ══════════════════ */
function csvCell(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function buildReportCSV() {
  const range = rangeFor(ui.reportPeriod);
  const rows = [];
  const push = (arr) => rows.push(arr.map(csvCell).join(','));
  if (ui.reportTab === 'overview' || ui.reportTab === 'cashflow') {
    const series = monthlySeries(ui.reportPeriod === 'year' ? 12 : 6);
    push(['Month', 'Income', 'Expense', 'Net']);
    series.forEach((m) => push([m.full, m.income, m.expense, m.net]));
  } else if (ui.reportTab === 'categories') {
    push(['Category', 'Amount', 'Share %']);
    categoryBreakdown('expense', range).forEach((c) => push([catLabel(c.cat), c.amount, c.pct.toFixed(2)]));
  } else if (ui.reportTab === 'accounts') {
    push(['Account', 'Type', 'Opening', 'Inflow', 'Outflow', 'Closing']);
    wsAccounts().forEach((a) => {
      const flow = accountFlow(a.id, range);
      push([a.name, accountTypeLabel(a.type), a.opening, flow.inflow, flow.outflow, accountBalance(a.id)]);
    });
  } else if (ui.reportTab === 'pl') {
    const sums = sumByTypes(txsInRange(range));
    push(['Line', 'Amount']);
    push(['Revenue', sums.income]);
    push(['Operating expenses', sums.expense]);
    push(['Net profit', sums.net]);
    push(['Margin %', sums.income ? ((sums.net / sums.income) * 100).toFixed(2) : 0]);
  } else {
    push(['Category', 'Spent', 'Budget', 'Utilization %']);
    wsBudgets().filter((b) => b.period === 'monthly').forEach((b) => {
      const spent = budgetSpent(b, rangeFor('month'));
      push([(b.categoryKey ? catLabel(catByKey(b.categoryKey)) : t('budget.overall')), spent, b.amount, pctOf(spent, b.amount).toFixed(2)]);
    });
  }
  return rows.join('\r\n');
}
function exportReportCSV() {
  downloadFile('hisabpro-report-' + todayISO() + '.csv', '\uFEFF' + buildReportCSV(), 'text/csv;charset=utf-8');
  toast(t('report.exported'));
}
function printReport() {
  let header = document.querySelector('.print-header');
  let footer = document.querySelector('.print-footer');
  if (!header) {
    header = document.createElement('div');
    header.className = 'print-header';
    document.getElementById('view').prepend(header);
  }
  header.innerHTML = '<h1>HisabPro — ' + esc(t('report.title')) + '</h1><p>' + esc(displayWsName()) + ' · ' + esc(state.user.name) + ' · ' + esc(rangeLabel(ui.reportPeriod)) + ' · ' + esc(HisabI18n.date(todayISO(), 'long')) + '</p>';
  if (!footer) {
    footer = document.createElement('div');
    footer.className = 'print-footer';
    footer.textContent = 'HisabPro · ' + (HisabI18n.lang() === 'bn' ? 'স্থানীয়ভাবে সংরক্ষিত ডেমো রিপোর্ট' : 'Locally stored demo report') + ' · ' + new Date().toLocaleString();
    document.getElementById('view').appendChild(footer);
  }
  setTimeout(() => window.print(), 100);
}
function exportAllData() {
  downloadFile('hisabpro-backup-' + todayISO() + '.json', JSON.stringify(state, null, 2));
  toast(t('set.exported'));
}
function importDataFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.workspaces) || !Array.isArray(parsed.transactions)) throw new Error('Invalid');
      state = parsed;
      if (!state.user) state.user = { ...DEFAULT_DEMO_USER };
      saveState();
      applyPreferences();
      refresh();
      toast(t('set.imported'));
    } catch (e) {
      toast(t('set.importError'), 'error');
    }
  };
  reader.readAsText(file);
}

/* ══════════════════ EVENT HANDLERS ══════════════════ */
function handleClick(e) {
  const target = e.target;

  if (target.closest('[data-close-modal]')) { closeModal(); return; }
  if (target.closest('[data-close-sheet]')) { closeSheet(); return; }
  if (target.closest('[data-close-drawer]')) { closeDrawer(); return; }

  if (target.closest('#workspaceSwitch')) {
    e.stopPropagation();
    toggleWorkspaceMenu();
    return;
  }
  if (!target.closest('#workspaceMenu')) {
    const menu = document.getElementById('workspaceMenu');
    if (menu) menu.classList.add('hidden');
  }

  if (target.closest('#themeToggle')) {
    const resolved = document.documentElement.getAttribute('data-theme');
    state.settings.theme = resolved === 'dark' ? 'light' : 'dark';
    saveState(true); applyPreferences(); refresh(); toast(t('toast.theme'));
    return;
  }
  if (target.closest('#langToggle')) {
    state.settings.lang = HisabI18n.lang() === 'bn' ? 'en' : 'bn';
    saveState(true); applyPreferences(); refresh(); toast(t('toast.lang'));
    return;
  }
  if (target.closest('#notifBtn')) { navigate('notifications'); return; }
  if (target.closest('#profileBtn')) { ui.settingsTab = 'profile'; navigate('settings'); return; }
  if (target.closest('#searchTrigger')) {
    navigate('transactions');
    setTimeout(() => { const inp = document.getElementById('txSearch'); if (inp) inp.focus(); }, 120);
    return;
  }
  if (target.closest('#mobileMenuBtn') || target.closest('#mobileMoreBtn')) { openDrawer(); return; }
  if (target.closest('#mobileAddBtn')) { openSheet(); return; }
  if (target.closest('#signOutSide')) { signOut(); return; }

  const navEl = target.closest('[data-route]');
  if (navEl) {
    e.preventDefault();
    closeDrawer();
    closeSheet();
    if (navEl.dataset.route === 'auth') return;
    navigate(navEl.dataset.route);
    return;
  }

  const el = target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'switch-workspace': {
      const ws = state.workspaces.find((w) => w.id === id);
      if (!ws) return;
      state.activeWorkspaceId = ws.id;
      ui.txLimit = 40;
      saveState(); toggleWorkspaceMenu(false); closeDrawer(); refresh(); toast(t('toast.ws') + ': ' + displayWsName());
      break;
    }
    case 'add-workspace': toggleWorkspaceMenu(false); openWorkspaceModal(); break;
    case 'add-tx': closeSheet(); closeDrawer(); openTransactionModal(null, el.dataset.type || 'expense'); break;
    case 'edit-tx': openTransactionModal(id); break;
    case 'delete-tx': {
      const tx = state.transactions.find((x) => x.id === id);
      if (!tx) return;
      confirmDialog({ title: t('tx.deleteTitle'), text: t('tx.deleteText'), amount: taka(tx.amount), onConfirm: () => {
        state.transactions = state.transactions.filter((x) => x.id !== id);
        audit('transaction.deleted', { id, amount: tx.amount });
        saveState(); refresh(); toast(t('tx.deleted'));
      } });
      break;
    }
    case 'clear-filters': ui.filters = { q: '', type: 'all', category: 'all', account: 'all', period: 'month' }; renderRoute('transactions'); break;
    case 'tx-load-more': ui.txLimit += 40; refreshTransactionResults(); break;
    case 'add-account': openAccountModal(); break;
    case 'edit-account': openAccountModal(id); break;
    case 'archive-account': {
      const account = state.accounts.find((a) => a.id === id);
      if (!account) return;
      confirmDialog({ title: t('acc.deleteTitle'), text: t('acc.deleteText'), confirmLabel: t('common.confirm'), onConfirm: () => {
        account.archived = true; audit('account.archived', { id }); saveState(); refresh(); toast(t('acc.archived'));
      } });
      break;
    }
    case 'add-budget': openBudgetModal(); break;
    case 'edit-budget': openBudgetModal(id); break;
    case 'delete-budget': {
      state.budgets = state.budgets.filter((b) => b.id !== id); audit('budget.deleted', { id }); saveState(); closeModal(); refresh(); toast(t('toast.deleted')); break;
    }
    case 'budget-period': ui.budgetPeriod = el.dataset.period; renderRoute('budgets'); break;
    case 'add-goal': openGoalModal(); break;
    case 'contribute-goal': openContributionModal(id); break;
    case 'delete-goal': {
      const goal = state.goals.find((g) => g.id === id);
      if (!goal) return;
      confirmDialog({ title: t('common.delete') + ' — ' + goal.name, text: t('tx.deleteText'), onConfirm: () => { state.goals = state.goals.filter((g) => g.id !== id); saveState(); refresh(); toast(t('toast.deleted')); } });
      break;
    }
    case 'add-contribution': closeSheet(); { const goal = wsGoals()[0]; if (goal) openContributionModal(goal.id); else { openGoalModal(); } } break;
    case 'add-debt': openDebtModal(); break;
    case 'pay-debt': openDebtPaymentModal(id); break;
    case 'debt-history': openDebtHistoryModal(id); break;
    case 'delete-debt': {
      const debt = state.debts.find((d) => d.id === id);
      if (!debt) return;
      confirmDialog({ title: t('common.delete') + ' — ' + debt.party, text: t('tx.deleteText'), onConfirm: () => { state.debts = state.debts.filter((d) => d.id !== id); saveState(); refresh(); toast(t('toast.deleted')); } });
      break;
    }
    case 'add-recurring': openRecurringModal(); break;
    case 'edit-recurring': openRecurringModal(id); break;
    case 'toggle-recurring': {
      const rule = state.recurring.find((r) => r.id === id);
      if (!rule) return;
      rule.active = !rule.active; audit('recurring.toggled', { id, active: rule.active }); saveState(); refresh(); break;
    }
    case 'post-recurring': {
      const rule = state.recurring.find((r) => r.id === id);
      if (!rule) return;
      const accounts = wsAccounts();
      const account = accounts[rule.accountIndex] || accounts[0];
      const cat = catByKey(rule.categoryKey);
      if (!account) return;
      state.transactions.unshift({ id: uid('tx'), workspaceId: activeWs().id, type: rule.type, amount: rule.amount, date: rule.nextDate, categoryId: cat ? cat.id : null, accountId: account.id, toAccountId: null, description: rule.name, paymentMethod: account.name, memberId: (memberActive().find((m) => m.email === state.user.email) || {}).id || null, goalId: null, createdAt: new Date().toISOString() });
      rule.nextDate = advanceRecurringDate(rule.nextDate, rule.frequency);
      audit('recurring.posted', { id, amount: rule.amount });
      saveState(); refresh(); toast(t('rec.posted'));
      break;
    }
    case 'invite-member': openInviteModal(); break;
    case 'remove-member': {
      const member = wsMembers().find((m) => m.id === id);
      if (!member) return;
      confirmDialog({ title: t('members.title') + ' — ' + member.name, text: (HisabI18n.lang() === 'bn' ? 'এই সদস্যকে ওয়ার্কস্পেস থেকে সরাবেন?' : 'Remove this member from the workspace?'), onConfirm: () => {
        activeWs().members = activeWs().members.filter((m) => m.id !== id); audit('member.removed', { email: member.email }); saveState(); refresh(); toast(t('members.removed'));
      } });
      break;
    }
    case 'mark-all-read': state.notifications.forEach((n) => { if (n.workspaceId === activeWs().id) n.read = true; }); saveState(); refresh(); toast(t('notif.allRead')); break;
    case 'read-notif': { const n = state.notifications.find((x) => x.id === id); if (n) n.read = true; saveState(); refresh(); break; }
    case 'delete-notif': state.notifications = state.notifications.filter((n) => n.id !== id); saveState(); refresh(); break;
    case 'report-tab': ui.reportTab = el.dataset.tab; renderRoute('reports'); break;
    case 'chart-range': ui.chartRange = el.dataset.range; renderRoute('dashboard'); break;
    case 'settings-tab': ui.settingsTab = el.dataset.tab; renderRoute('settings'); break;
    case 'set-lang': {
      state.settings.lang = el.value || el.dataset.lang || 'en'; saveState(true); applyPreferences(); refresh(); toast(t('toast.lang')); break;
    }
    case 'set-theme': state.settings.theme = el.dataset.theme; saveState(true); applyPreferences(); refresh(); toast(t('toast.theme')); break;
    case 'toggle-setting': toggleSetting(el.dataset.setting); break;
    case 'export-csv': exportReportCSV(); break;
    case 'print-report': printReport(); break;
    case 'export-data': exportAllData(); break;
    case 'import-data': { const input = document.getElementById('importFile'); if (input) input.click(); break; }
    case 'reset-data': {
      confirmDialog({ title: t('set.resetConfirm'), text: t('set.resetText'), confirmLabel: t('set.reset'), onConfirm: () => {
        state = HisabSeed.buildDemoState({ ...DEFAULT_DEMO_USER });
        saveState(); applyPreferences(); refresh(); toast(t('toast.saved'));
      } });
      break;
    }
    case 'sign-out': signOut(); break;
    case 'change-password': openPasswordModal(); break;
    case 'install-app': installApp(); break;
    case 'assistant-suggest': askAssistant(el.dataset.text); break;
    case 'clear-chat': state.chat = (state.chat || []).filter((m) => m.workspaceId !== activeWs().id); saveState(); renderRoute('assistant'); break;
    case 'cal-prev': ui.calendarCursor = new Date(ui.calendarCursor.getFullYear(), ui.calendarCursor.getMonth() - 1, 1); renderRoute('calendar'); break;
    case 'cal-next': ui.calendarCursor = new Date(ui.calendarCursor.getFullYear(), ui.calendarCursor.getMonth() + 1, 1); renderRoute('calendar'); break;
    case 'cal-today': ui.calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1); renderRoute('calendar'); break;
    case 'view-day': openDayModal(el.dataset.date); break;
    default: break;
  }
}

function toggleSetting(setting) {
  const n = state.settings.notifications || (state.settings.notifications = {});
  if (setting === 'twofa') { state.settings.twofa = !state.settings.twofa; }
  else if (setting === 'notif-budget') n.budget = !(n.budget !== false);
  else if (setting === 'notif-bills') n.bills = !(n.bills !== false);
  else if (setting === 'notif-weekly') n.weekly = !(n.weekly !== false);
  else if (setting === 'notif-members') n.members = !(n.members !== false);
  else if (setting === 'notif-quiet') n.quietHours = !(n.quietHours !== false);
  saveState(); renderRoute('settings');
}

function handleChange(e) {
  const el = e.target;
  if (el.id === 'dashRange') { ui.dashRange = el.value; renderRoute('dashboard'); return; }
  if (el.id === 'reportPeriod') { ui.reportPeriod = el.value; renderRoute('reports'); return; }
  if (el.matches('[data-filter]')) {
    ui.filters[el.dataset.filter] = el.value;
    ui.txLimit = 40;
    if (el.dataset.filter === 'type' || el.dataset.filter === 'category' || el.dataset.filter === 'account' || el.dataset.filter === 'period') {
      refreshTransactionResults();
    }
    return;
  }
  if (el.id === 'importFile') { importDataFile(el.files && el.files[0]); el.value = ''; return; }
  if (el.matches('[data-role-member]')) {
    const member = wsMembers().find((m) => m.id === el.dataset.roleMember);
    if (member) { member.role = el.value; audit('member.role', { email: member.email, role: el.value }); saveState(); refresh(); toast(t('members.roleUpdated')); }
    return;
  }
  if (el.matches('[data-action="set-lang"]')) {
    state.settings.lang = el.value; saveState(true); applyPreferences(); refresh(); toast(t('toast.lang'));
    return;
  }
}

function handleInput(e) {
  const el = e.target;
  if (el.id === 'txSearch') {
    ui.filters.q = el.value;
    ui.txLimit = 40;
    refreshTransactionResults();
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  if (form.id === 'authForm') {
    const name = (document.getElementById('authName') || {}).value || '';
    const email = (document.getElementById('authEmail') || {}).value || '';
    const password = (document.getElementById('authPassword') || {}).value || '';
    const err = document.getElementById('authError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      err.textContent = t('auth.invalid');
      err.classList.remove('hidden');
      return;
    }
    if (authMode === 'signup') {
      if (!name.trim()) { err.textContent = t('auth.nameRequired'); err.classList.remove('hidden'); return; }
      const wsType = (form.querySelector('input[name="wsType"]:checked') || {}).value || 'personal';
      const lang = (form.querySelector('input[name="language"]:checked') || {}).value || 'en';
      const user = { name: name.trim(), email: email.trim(), createdAt: new Date().toISOString() };
      state = HisabSeed.buildStarterState(user, wsType, lang);
      saveState();
      enterApp();
      toast(t('auth.welcome') + ', ' + user.name.split(' ')[0] + '!');
    } else {
      const existingUser = state.user || { name: name.trim() || email.split('@')[0], email };
      signIn(existingUser.name, email);
    }
    return;
  }
  if (form.id === 'chatForm') {
    const input = document.getElementById('chatInput');
    const text = input ? input.value.trim() : '';
    if (input) input.value = '';
    askAssistant(text);
    return;
  }
  if (form.id === 'profileForm') {
    const name = form.name.value.trim(); const email = form.email.value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast(t('auth.invalid'), 'error'); return; }
    state.user.name = name; state.user.email = email;
    const owner = (activeWs().members || []).find((m) => m.role === 'owner');
    if (owner) { owner.name = name; owner.email = email; owner.nameBn = name; owner.initials = initials(name); }
    saveState(); refresh(); toast(t('set.profileSaved'));
    return;
  }
  if (form.id === 'workspaceForm') {
    const ws = activeWs();
    ws.name = form.name.value.trim() || ws.name;
    ws.type = form.type.value;
    ws.color = { personal: '#0b7a58', family: '#d9922e', business: '#3d7bd9' }[ws.type] || ws.color;
    audit('workspace.updated', { name: ws.name, type: ws.type });
    saveState(); refresh(); toast(t('toast.saved'));
    return;
  }
}

/* ══════════════════ AUTH UI BINDING ══════════════════ */
function bindAuth() {
  $$('.auth-tab').forEach((btn) => btn.addEventListener('click', () => setAuthMode(btn.dataset.authTab)));
  const demoBtn = document.getElementById('demoBtn');
  if (demoBtn) demoBtn.addEventListener('click', startDemo);
  const toggle = document.getElementById('togglePassword');
  if (toggle) toggle.addEventListener('click', () => {
    const input = document.getElementById('authPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  setAuthMode('signin');
}

/* ══════════════════ INSTALL / SERVICE WORKER ══════════════════ */
function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') toast(HisabI18n.lang() === 'bn' ? 'HisabPro ইনস্টল হয়েছে' : 'HisabPro installed');
      deferredInstallPrompt = null;
    });
    return;
  }
  openModal({
    title: t('nav.settings') + ' · PWA',
    subtitle: HisabI18n.lang() === 'bn' ? 'ডেস্কটপ ও মোবাইলে ইনস্টল' : 'Install on desktop and mobile',
    body: '<p class="confirm-text">' + (HisabI18n.lang() === 'bn'
      ? 'এই অ্যাপটি ইনস্টলযোগ্য। ডেস্কটপে ব্রাউজারের ঠিকানার পাশে ইনস্টল আইকনে ক্লিক করুন। মোবাইলে ব্রাউজার মেনু → “Add to Home Screen” নির্বাচন করুন। অফলাইনেও অ্যাপটি চলবে; তথ্য এই ডিভাইসে থাকবে।'
      : 'This app is installable. On desktop, use the install icon in the browser address bar. On mobile, open the browser menu and choose “Add to Home Screen”. The app works offline and keeps data on this device.') + '</p>',
    footer: '<button class="btn btn--primary" data-close-modal>' + t('common.close') + '</button>'
  });
}
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!location.protocol.startsWith('http')) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker registration failed', err));
  });
}

/* ══════════════════ INIT ══════════════════ */
function initApp() {
  applyPreferences();
  bindAuth();
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (state.user) {
        navigate('transactions');
        setTimeout(() => { const inp = document.getElementById('txSearch'); if (inp) inp.focus(); }, 100);
      }
    }
    if (e.key === 'Escape') closeAllOverlays();
  });
  window.addEventListener('hashchange', () => { if (state.user) renderRoute(currentRoute()); });
  window.addEventListener('online', () => { updateSyncChip(); toast(t('toast.online')); });
  window.addEventListener('offline', () => { updateSyncChip(); toast(t('toast.offline'), 'error'); });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstallPrompt = e; });
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq) mq.addEventListener('change', () => { if (state.settings.theme === 'system') applyPreferences(); });
  registerServiceWorker();
  if (state.user) {
    if (!location.hash) location.hash = '#/dashboard';
    enterApp();
  } else {
    showAuth();
  }
  updateSyncChip();
  const initialChat = state.chat;
  if (Array.isArray(initialChat)) state.chat = initialChat;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
