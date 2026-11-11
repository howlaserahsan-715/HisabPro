/* ═══════════════════════════════════════════════════════════
   HisabPro — demo data engine
   Deterministic sample data for Personal, Family & Business.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const CATEGORY_DEFS = [
    { key: 'food', type: 'expense', emoji: '🛒', color: '#e86a4a' },
    { key: 'transport', type: 'expense', emoji: '🚌', color: '#3d7bd9' },
    { key: 'housing', type: 'expense', emoji: '🏠', color: '#8b6ad6' },
    { key: 'utilities', type: 'expense', emoji: '💡', color: '#d9922e' },
    { key: 'health', type: 'expense', emoji: '💊', color: '#e05575' },
    { key: 'education', type: 'expense', emoji: '🎓', color: '#2f9e8f' },
    { key: 'shopping', type: 'expense', emoji: '🛍️', color: '#d06ab0' },
    { key: 'entertainment', type: 'expense', emoji: '🎬', color: '#7c5cd6' },
    { key: 'family', type: 'expense', emoji: '👨‍👩‍👧', color: '#e08a3d' },
    { key: 'business', type: 'expense', emoji: '💼', color: '#4a7c59' },
    { key: 'personal', type: 'expense', emoji: '✨', color: '#b08968' },
    { key: 'interest', type: 'expense', emoji: '🏦', color: '#b45309' },
    { key: 'savingscat', type: 'expense', emoji: '🐖', color: '#0e9f6e' },
    { key: 'salary', type: 'income', emoji: '💼', color: '#0e9f6e' },
    { key: 'revenue', type: 'income', emoji: '📈', color: '#14b981' },
    { key: 'freelance', type: 'income', emoji: '💻', color: '#3d7bd9' },
    { key: 'investment', type: 'income', emoji: '📊', color: '#8b6ad6' },
    { key: 'rental', type: 'income', emoji: '🏘️', color: '#d9922e' },
    { key: 'gift', type: 'income', emoji: '🎁', color: '#e05575' },
    { key: 'commission', type: 'income', emoji: '🤝', color: '#2f9e8f' },
    { key: 'other', type: 'income', emoji: '➕', color: '#6f8078' }
  ];

  const ACCOUNT_COLORS = {
    cash: { soft: '#e4f3e6', ink: '#2e7d32' },
    bank: { soft: '#e3f0fb', ink: '#1565c0' },
    savings: { soft: '#ddf3ef', ink: '#00695c' },
    card: { soft: '#fbe4ec', ink: '#ad1457' },
    bkash: { soft: '#fde7f0', ink: '#c2185b' },
    nagad: { soft: '#fff1e0', ink: '#e65100' },
    rocket: { soft: '#f1e6fa', ink: '#6a1b9a' },
    custom: { soft: '#e2f4ec', ink: '#0b7a58' }
  };

  let counter = 0;
  function uid(prefix = 'id') {
    counter += 1;
    return prefix + '-' + Date.now().toString(36) + '-' + counter.toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function dateInMonth(offset, day) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    d.setDate(Math.min(day, daysInMonth(d.getFullYear(), d.getMonth())));
    d.setHours(12, 0, 0, 0);
    return d;
  }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(12, 0, 0, 0); return x; }
  function addMonths(d, n) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
  function startOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function between(rng, min, max, step = 1) {
    const value = min + rng() * (max - min);
    return Math.round(value / step) * step;
  }

  function makeWorkspaceMeta() {
    return [
      { id: 'ws-personal', type: 'personal', name: 'Personal', nameBn: 'ব্যক্তিগত', color: '#0b7a58', createdAt: new Date().toISOString() },
      { id: 'ws-family', type: 'family', name: 'Family', nameBn: 'পরিবার', color: '#d9922e', createdAt: new Date().toISOString() },
      { id: 'ws-business', type: 'business', name: 'Business', nameBn: 'ব্যবসা', color: '#3d7bd9', createdAt: new Date().toISOString() }
    ];
  }

  function makeMembers(wsId) {
    if (wsId === 'ws-personal') {
      return [
        { id: 'm-rahim', name: 'Rahim Ahmed', nameBn: 'রহিম আহমেদ', email: 'rahim@hisabpro.app', role: 'owner', status: 'active', initials: 'RA', color: '#0b7a58' },
        { id: 'm-ayesha', name: 'Ayesha Ahmed', nameBn: 'আয়েশা আহমেদ', email: 'ayesha@example.com', role: 'viewer', status: 'active', initials: 'AA', color: '#d06ab0' }
      ];
    }
    if (wsId === 'ws-family') {
      return [
        { id: 'm-rahim', name: 'Rahim Ahmed', nameBn: 'রহিম আহমেদ', email: 'rahim@hisabpro.app', role: 'owner', status: 'active', initials: 'RA', color: '#0b7a58' },
        { id: 'm-ayesha', name: 'Ayesha Ahmed', nameBn: 'আয়েশা আহমেদ', email: 'ayesha@example.com', role: 'admin', status: 'active', initials: 'AA', color: '#d06ab0' },
        { id: 'm-fatima', name: 'Fatima Begum', nameBn: 'ফাতিমা বেগম', email: 'fatima@example.com', role: 'member', status: 'active', initials: 'FB', color: '#d9922e' },
        { id: 'm-sabbir', name: 'Sabbir Hasan', nameBn: 'সাব্বির হাসান', email: 'sabbir@example.com', role: 'viewer', status: 'pending', initials: 'SH', color: '#3d7bd9' }
      ];
    }
    return [
      { id: 'm-rahim', name: 'Rahim Ahmed', nameBn: 'রহিম আহমেদ', email: 'rahim@hisabpro.app', role: 'owner', status: 'active', initials: 'RA', color: '#0b7a58' },
      { id: 'm-karim', name: 'Karim Uddin', nameBn: 'করিম উদ্দিন', email: 'karim@example.com', role: 'accountant', status: 'active', initials: 'KU', color: '#3d7bd9' },
      { id: 'm-nusrat', name: 'Nusrat Jahan', nameBn: 'নুসরাত জাহান', email: 'nusrat@example.com', role: 'manager', status: 'active', initials: 'NJ', color: '#7c5cd6' }
    ];
  }

  function makeCategories(wsId) {
    return CATEGORY_DEFS.map((def, i) => ({
      id: wsId + '-cat-' + def.key,
      workspaceId: wsId,
      key: def.key,
      type: def.type,
      name: def.key,
      emoji: def.emoji,
      color: def.color,
      order: i,
      archived: false
    }));
  }

  function makeAccounts(wsId) {
    let defs;
    if (wsId === 'ws-personal') {
      defs = [
        { name: 'Cash in Hand', type: 'cash', opening: 80000 },
        { name: 'BRAC Bank', type: 'bank', opening: 148000 },
        { name: 'bKash', type: 'bkash', opening: 35000 },
        { name: 'Nagad', type: 'nagad', opening: 6200 },
        { name: 'City Bank Card', type: 'card', opening: -6500 },
        { name: 'Savings Reserve', type: 'savings', opening: 85000 }
      ];
    } else if (wsId === 'ws-family') {
      defs = [
        { name: 'Family Cash', type: 'cash', opening: 140000 },
        { name: 'Dutch-Bangla Bank', type: 'bank', opening: 240000 },
        { name: 'bKash Family', type: 'bkash', opening: 19800 },
        { name: 'Family Savings', type: 'savings', opening: 120000 }
      ];
    } else {
      defs = [
        { name: 'Business Current', type: 'bank', opening: 620000 },
        { name: 'Petty Cash', type: 'cash', opening: 35000 },
        { name: 'bKash Merchant', type: 'bkash', opening: 48000 },
        { name: 'Business Reserve', type: 'savings', opening: 250000 }
      ];
    }
    return defs.map((d, i) => ({
      id: wsId + '-acc-' + i,
      workspaceId: wsId,
      name: d.name,
      type: d.type,
      opening: d.opening,
      currency: 'BDT',
      archived: false,
      createdAt: new Date().toISOString()
    }));
  }

  function makeBudgets(wsId) {
    const map = {
      'ws-personal': [
        { key: null, amount: 65000 },
        { key: 'food', amount: 15000 },
        { key: 'transport', amount: 5000 },
        { key: 'housing', amount: 18000 },
        { key: 'utilities', amount: 4500 },
        { key: 'shopping', amount: 8000 },
        { key: 'entertainment', amount: 3000 },
        { key: 'health', amount: 4000 },
        { key: 'education', amount: 5000 },
        { key: 'personal', amount: 3000 },
        { key: 'family', amount: 5000 }
      ],
      'ws-family': [
        { key: null, amount: 90000 },
        { key: 'food', amount: 30000 },
        { key: 'housing', amount: 25000 },
        { key: 'utilities', amount: 7000 },
        { key: 'education', amount: 12000 },
        { key: 'health', amount: 6000 },
        { key: 'family', amount: 10000 }
      ],
      'ws-business': [
        { key: null, amount: 200000 },
        { key: 'business', amount: 140000 },
        { key: 'utilities', amount: 12000 },
        { key: 'transport', amount: 15000 },
        { key: 'personal', amount: 10000 }
      ]
    };
    return (map[wsId] || []).map((b, i) => ({
      id: wsId + '-budget-' + i,
      workspaceId: wsId,
      period: 'monthly',
      categoryKey: b.key,
      amount: b.amount,
      alertThreshold: 80,
      createdAt: new Date().toISOString()
    }));
  }

  function makeGoals(wsId) {
    const now = new Date();
    const map = {
      'ws-personal': [
        { name: 'Emergency fund', nameBn: 'জরুরি তহবিল', target: 300000, saved: 42000, months: 10, emoji: '🛟', color: '#0e9f6e' },
        { name: "Cox's Bazar trip", nameBn: 'কক্সবাজার ভ্রমণ', target: 60000, saved: 18000, months: 6, emoji: '🏖️', color: '#3d7bd9' },
        { name: 'New laptop', nameBn: 'নতুন ল্যাপটপ', target: 120000, saved: 25000, months: 9, emoji: '💻', color: '#7c5cd6' }
      ],
      'ws-family': [
        { name: 'Home renovation', nameBn: 'বাড়ি সংস্কার', target: 400000, saved: 80000, months: 18, emoji: '🏠', color: '#d9922e' },
        { name: "Children's education", nameBn: 'সন্তানদের শিক্ষা', target: 500000, saved: 40000, months: 36, emoji: '🎓', color: '#2f9e8f' }
      ],
      'ws-business': [
        { name: 'Equipment fund', nameBn: 'যন্ত্রপাতি তহবিল', target: 600000, saved: 250000, months: 12, emoji: '🏭', color: '#3d7bd9' }
      ]
    };
    return (map[wsId] || []).map((g, i) => ({
      id: wsId + '-goal-' + i,
      workspaceId: wsId,
      name: g.name,
      target: g.target,
      saved: g.saved,
      deadline: iso(addMonths(now, g.months)),
      emoji: g.emoji,
      color: g.color,
      contributions: [],
      createdAt: new Date().toISOString()
    }));
  }

  function makeDebts(wsId) {
    const now = new Date();
    const map = {
      'ws-personal': [
        { direction: 'borrowed', party: 'BRAC Bank', principal: 1500000, outstanding: 920000, rate: 8.5, start: -24, due: 96 },
        { direction: 'lent', party: 'Sabbir (friend)', principal: 25000, outstanding: 15000, rate: 0, start: -4, due: 2 }
      ],
      'ws-family': [
        { direction: 'borrowed', party: 'Uncle — Karim Chowdhury', principal: 100000, outstanding: 60000, rate: 0, start: -8, due: 6 }
      ],
      'ws-business': [
        { direction: 'borrowed', party: 'City Bank — equipment loan', principal: 500000, outstanding: 320000, rate: 9, start: -14, due: 34 },
        { direction: 'lent', party: 'Orion Ltd (receivable)', principal: 120000, outstanding: 95000, rate: 0, start: -2, due: 1 }
      ]
    };
    return (map[wsId] || []).map((d, i) => ({
      id: wsId + '-debt-' + i,
      workspaceId: wsId,
      direction: d.direction,
      party: d.party,
      principal: d.principal,
      outstanding: d.outstanding,
      rate: d.rate,
      startDate: iso(addMonths(now, d.start)),
      dueDate: iso(addMonths(now, d.due)),
      payments: [],
      createdAt: new Date().toISOString()
    }));
  }

  function nextOccurrence(day, frequency = 'monthly') {
    const now = new Date();
    if (frequency === 'monthly') {
      let d = new Date(now.getFullYear(), now.getMonth(), Math.min(day, daysInMonth(now.getFullYear(), now.getMonth())), 12);
      if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(day, daysInMonth(now.getFullYear(), now.getMonth() + 1)), 12);
      return iso(d);
    }
    if (frequency === 'weekly') return iso(addDays(now, ((7 - now.getDay()) % 7) + 1));
    if (frequency === 'yearly') return iso(new Date(now.getFullYear() + 1, now.getMonth(), Math.min(day, 28), 12));
    return iso(addDays(now, 1));
  }

  function makeRecurring(wsId) {
    const defs = {
      'ws-personal': [
        { name: 'Apartment rent', amount: 18000, type: 'expense', cat: 'housing', acc: 1, day: 3, freq: 'monthly', remind: 3 },
        { name: 'Internet — Link3', amount: 1200, type: 'expense', cat: 'utilities', acc: 2, day: 10, freq: 'monthly', remind: 2 },
        { name: 'Netflix subscription', amount: 650, type: 'expense', cat: 'entertainment', acc: 4, day: 15, freq: 'monthly', remind: 1 },
        { name: 'Monthly salary', amount: 85000, type: 'income', cat: 'salary', acc: 1, day: 2, freq: 'monthly', remind: 0 },
        { name: 'Gym membership', amount: 1500, type: 'expense', cat: 'personal', acc: 2, day: 5, freq: 'monthly', remind: 1 },
        { name: 'Mobile bill — Grameenphone', amount: 700, type: 'expense', cat: 'utilities', acc: 2, day: 20, freq: 'monthly', remind: 2 }
      ],
      'ws-family': [
        { name: 'House rent', amount: 25000, type: 'expense', cat: 'housing', acc: 1, day: 3, freq: 'monthly', remind: 3 },
        { name: 'School tuition', amount: 12000, type: 'expense', cat: 'education', acc: 1, day: 7, freq: 'monthly', remind: 4 },
        { name: 'Gas & water bill', amount: 2400, type: 'expense', cat: 'utilities', acc: 0, day: 12, freq: 'monthly', remind: 2 },
        { name: 'Household contribution', amount: 40000, type: 'income', cat: 'other', acc: 1, day: 5, freq: 'monthly', remind: 0 }
      ],
      'ws-business': [
        { name: 'Office rent', amount: 35000, type: 'expense', cat: 'business', acc: 0, day: 1, freq: 'monthly', remind: 3 },
        { name: 'Payroll', amount: 95000, type: 'expense', cat: 'business', acc: 0, day: 28, freq: 'monthly', remind: 2 },
        { name: 'Cloud software', amount: 3200, type: 'expense', cat: 'utilities', acc: 0, day: 8, freq: 'monthly', remind: 2 },
        { name: 'Office internet', amount: 4500, type: 'expense', cat: 'utilities', acc: 0, day: 10, freq: 'monthly', remind: 2 }
      ]
    };
    return (defs[wsId] || []).map((r, i) => ({
      id: wsId + '-rec-' + i,
      workspaceId: wsId,
      name: r.name,
      amount: r.amount,
      type: r.type,
      categoryKey: r.cat,
      accountIndex: r.acc,
      frequency: r.freq,
      nextDate: nextOccurrence(r.day, r.freq),
      remindDays: r.remind,
      active: true,
      createdAt: new Date().toISOString()
    }));
  }

  function makeNotifications() {
    const now = Date.now();
    return [
      { id: 'n-1', workspaceId: 'ws-personal', type: 'warning', title: 'Food budget at 82%', text: 'You have used ৳12,300 of your ৳15,000 food budget with 9 days left this month.', time: new Date(now - 1000 * 60 * 38).toISOString(), read: false },
      { id: 'n-2', workspaceId: 'ws-personal', type: 'danger', title: 'Rent due in 3 days', text: 'Apartment rent of ৳18,000 is scheduled from BRAC Bank. Make sure the balance is ready.', time: new Date(now - 1000 * 60 * 60 * 5).toISOString(), read: false },
      { id: 'n-3', workspaceId: 'ws-personal', type: 'brand', title: 'Savings goal progress', text: 'Emergency fund is now 14% funded. Add ৳5,000 to keep your monthly pace.', time: new Date(now - 1000 * 60 * 60 * 26).toISOString(), read: false },
      { id: 'n-4', workspaceId: 'ws-family', type: 'info', title: 'Fatima joined the Family workspace', text: 'Fatima Begum accepted your invitation as a Member.', time: new Date(now - 1000 * 60 * 60 * 50).toISOString(), read: true },
      { id: 'n-5', workspaceId: 'ws-business', type: 'brand', title: 'Monthly summary is ready', text: 'Revenue and operating expenses for this month are available in Reports.', time: new Date(now - 1000 * 60 * 60 * 72).toISOString(), read: true }
    ];
  }

  function sortTx(a, b) {
    return (b.date + b.createdAt).localeCompare(a.date + a.createdAt);
  }

  function makeTransactions(wsId) {
    const rng = mulberry32(wsId === 'ws-personal' ? 1207 : wsId === 'ws-family' ? 887 : 4412);
    const categories = makeCategories(wsId);
    const accounts = makeAccounts(wsId);
    const cat = (key) => wsId + '-cat-' + key;
    const acc = (i) => wsId + '-acc-' + i;
    const list = [];
    let seq = 0;
    const today = startOfToday();

    function add(monthOffset, day, type, amount, categoryKey, accountIndex, description, opts = {}) {
      const d = dateInMonth(monthOffset, day);
      if (d > today) return;
      if (amount <= 0) return;
      seq += 1;
      list.push({
        id: wsId + '-tx-' + String(seq).padStart(4, '0'),
        workspaceId: wsId,
        type,
        amount: Math.round(amount),
        date: iso(d),
        categoryId: categoryKey ? cat(categoryKey) : null,
        accountId: acc(accountIndex),
        toAccountId: opts.toAccountIndex != null ? acc(opts.toAccountIndex) : null,
        description,
        paymentMethod: opts.paymentMethod || (accounts[accountIndex] ? accounts[accountIndex].name : 'Cash'),
        memberId: opts.memberId || 'm-rahim',
        goalId: opts.goalId || null,
        createdAt: new Date(d.getTime() + 1000 * seq).toISOString()
      });
    }

    if (wsId === 'ws-personal') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      for (let m = -5; m <= 0; m += 1) {
        const dt = dateInMonth(m, 1);
        const mn = monthNames[dt.getMonth()];
        add(m, 2, 'income', 85000, 'salary', 1, 'Monthly salary — ' + mn, { memberId: 'm-rahim' });
        if (rng() > 0.25) add(m, between(rng, 8, 20), 'income', between(rng, 8000, 24000, 500), 'freelance', 2, 'Freelance project payment');
        if (m % 2 === 0) add(m, 22, 'income', between(rng, 900, 2600, 100), 'investment', 1, 'Income fund dividend');
        if (m === -3) add(m, 14, 'income', 12000, 'gift', 0, 'Eid gift from family');

        // fixed bills
        add(m, 3, 'expense', 18000, 'housing', 1, 'Apartment rent');
        add(m, 4, 'expense', between(rng, 2000, 3000, 50), 'utilities', 1, 'Electricity — DPDC');
        add(m, 10, 'expense', 1200, 'utilities', 2, 'Internet — Link3');
        add(m, 15, 'expense', 650, 'entertainment', 4, 'Netflix subscription');
        add(m, 20, 'expense', between(rng, 600, 900, 10), 'utilities', 2, 'Mobile bill — Grameenphone');
        add(m, 5, 'expense', 1500, 'personal', 2, 'Gym membership');
        add(m, 7, 'transfer', 5000, null, 1, 'Savings contribution — Emergency fund', { toAccountIndex: 5 });

        // variable spending
        for (let i = 0; i < between(rng, 3, 5); i += 1) {
          add(m, between(rng, 2, 28), 'expense', between(rng, 550, 4200, 50), 'food', pick(rng, [0, 2, 4]), pick(rng, ['Groceries — Karwan Bazar', 'Lunch with team', 'Family dinner', 'Coffee & snacks', 'Agora grocery run', 'Street food']));
        }
        for (let i = 0; i < between(rng, 3, 5); i += 1) {
          add(m, between(rng, 2, 28), 'expense', between(rng, 80, 780, 10), 'transport', pick(rng, [0, 2]), pick(rng, ['Bus fare', 'Pathao ride', 'CNG fare', 'Fuel — bike', 'Uber to office']));
        }
        if (rng() > 0.25) add(m, between(rng, 9, 26), 'expense', between(rng, 1200, 5800, 100), 'shopping', 4, pick(rng, ['New shirt', 'Electronics accessories', 'Home supplies', 'Online order']));
        if (rng() > 0.4) add(m, between(rng, 8, 24), 'expense', between(rng, 450, 2200, 50), 'entertainment', pick(rng, [0, 4]), pick(rng, ['Cinema tickets', 'Concert', 'Weekend outing', 'Book purchase']));
        if (rng() > 0.5) add(m, between(rng, 6, 22), 'expense', between(rng, 600, 2800, 50), 'health', 2, pick(rng, ['Medicine — Lazz Pharma', 'Doctor consultation', 'Diagnostic test']));
        add(m, between(rng, 4, 12), 'expense', between(rng, 1800, 4200, 100), 'education', 1, pick(rng, ['Online course', 'Books & stationery', 'Workshop fee']));
        if (rng() > 0.45) add(m, between(rng, 8, 25), 'expense', between(rng, 900, 3200, 100), 'family', 0, pick(rng, ['Support for parents', 'Family outing', 'Gift for cousin']));
        if (rng() > 0.55) add(m, between(rng, 12, 27), 'expense', between(rng, 400, 1800, 50), 'personal', 2, pick(rng, ['Haircut', 'Skincare', 'Subscription']));
      }
    } else if (wsId === 'ws-family') {
      for (let m = -5; m <= 0; m += 1) {
        add(m, 5, 'income', 40000, 'other', 1, 'Rahim — household contribution', { memberId: 'm-rahim' });
        add(m, 6, 'income', 25000, 'other', 1, 'Ayesha — household contribution', { memberId: 'm-ayesha' });
        if (m % 2 === 0) add(m, 18, 'income', between(rng, 4000, 9000, 500), 'rental', 1, 'Rental income — Gulshan flat');

        add(m, 3, 'expense', 25000, 'housing', 1, 'House rent');
        add(m, 7, 'expense', 12000, 'education', 1, 'School tuition — two children');
        add(m, 10, 'expense', between(rng, 2000, 3200, 50), 'utilities', 0, 'Electricity & water');
        add(m, 12, 'expense', 2400, 'utilities', 0, 'Gas bill');
        add(m, 15, 'expense', between(rng, 1200, 2000, 50), 'health', 0, 'Family medicine');
        add(m, 20, 'transfer', between(rng, 5000, 7000, 100), null, 1, 'Family savings contribution', { toAccountIndex: 3 });
        for (let i = 0; i < between(rng, 5, 8); i += 1) {
          add(m, between(rng, 2, 28), 'expense', between(rng, 900, 6500, 50), 'food', pick(rng, [0, 1]), pick(rng, ['Weekly groceries', 'Vegetable market', 'Fish & meat', 'Family dinner', 'Rice & staples']), { memberId: pick(rng, ['m-ayesha', 'm-fatima']) });
        }
        for (let i = 0; i < 2; i += 1) {
          add(m, between(rng, 4, 26), 'expense', between(rng, 300, 1400, 50), 'transport', 0, pick(rng, ['School van', 'Rickshaw & bus', 'CNG fare']), { memberId: pick(rng, ['m-ayesha', 'm-fatima']) });
        }
        if (rng() > 0.3) add(m, between(rng, 8, 25), 'expense', between(rng, 1500, 5500, 100), 'family', 0, pick(rng, ['Eid shopping', 'Visit to village', 'Family event']), { memberId: 'm-ayesha' });
      }
    } else {
      for (let m = -5; m <= 0; m += 1) {
        add(m, 4, 'expense', 95000, 'business', 0, 'Staff payroll');
        add(m, 1, 'expense', 35000, 'business', 0, 'Office rent');
        add(m, 8, 'expense', 3200, 'utilities', 0, 'Cloud software subscriptions');
        add(m, 10, 'expense', 4500, 'utilities', 0, 'Office internet');
        add(m, 12, 'expense', between(rng, 8000, 22000, 500), 'business', 0, 'Marketing & advertising');
        add(m, 18, 'expense', between(rng, 15000, 45000, 500), 'business', 0, 'Supplier payment');
        add(m, 22, 'expense', between(rng, 2500, 7000, 100), 'transport', 2, 'Delivery & logistics');
        add(m, 25, 'expense', between(rng, 2000, 5000, 100), 'personal', 0, 'Staff refreshments');
        add(m, 26, 'transfer', between(rng, 5000, 15000, 500), null, 0, 'Reserve transfer', { toAccountIndex: 3 });

        for (let i = 0; i < between(rng, 4, 7); i += 1) {
          add(m, between(rng, 2, 28), 'income', between(rng, 25000, 98000, 500), 'revenue', pick(rng, [0, 2]), pick(rng, ['Client invoice — Orion Ltd', 'Client invoice — Meghna Foods', 'Retail sales', 'Consulting fee', 'Wholesale order']), { memberId: pick(rng, ['m-rahim', 'm-nusrat']) });
        }
        if (m % 2 === 0) add(m, 20, 'income', between(rng, 5000, 14000, 500), 'commission', 0, 'Referral commission');
      }
    }

    return list.sort(sortTx);
  }

  function buildDemoState(user) {
    const workspaces = makeWorkspaceMeta().map((ws) => ({
      ...ws,
      members: makeMembers(ws.id),
      ownerId: 'm-rahim'
    }));
    const accounts = [];
    const categories = [];
    const transactions = [];
    const budgets = [];
    const goals = [];
    const debts = [];
    const recurring = [];
    workspaces.forEach((ws) => {
      accounts.push(...makeAccounts(ws.id));
      categories.push(...makeCategories(ws.id));
      transactions.push(...makeTransactions(ws.id));
      budgets.push(...makeBudgets(ws.id));
      goals.push(...makeGoals(ws.id));
      debts.push(...makeDebts(ws.id));
      recurring.push(...makeRecurring(ws.id));
    });
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: user || null,
      settings: {
        lang: 'en',
        theme: 'light',
        currency: 'BDT',
        notifications: { budget: true, bills: true, weekly: true, members: true, quietHours: true }
      },
      activeWorkspaceId: 'ws-personal',
      workspaces,
      accounts,
      categories,
      transactions,
      budgets,
      goals,
      debts,
      recurring,
      notifications: makeNotifications(),
      audit: [],
      chat: []
    };
  }

  function buildStarterState(user, workspaceType = 'personal', language = 'en') {
    const type = ['personal', 'family', 'business'].includes(workspaceType) ? workspaceType : 'personal';
    const wsId = 'ws-' + type;
    const names = { personal: 'Personal', family: 'Family', business: 'Business' };
    const namesBn = { personal: 'ব্যক্তিগত', family: 'পরিবার', business: 'ব্যবসা' };
    const colors = { personal: '#0b7a58', family: '#d9922e', business: '#3d7bd9' };
    const accounts = makeAccounts(wsId);
    const categories = makeCategories(wsId);
    const workspace = {
      id: wsId,
      type,
      name: names[type],
      nameBn: namesBn[type],
      color: colors[type],
      createdAt: new Date().toISOString(),
      ownerId: 'm-owner',
      members: [{
        id: 'm-owner',
        name: user ? user.name : 'You',
        nameBn: user ? user.name : 'আপনি',
        email: user ? user.email : '',
        role: 'owner',
        status: 'active',
        initials: (user && user.name ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2) : 'YO').toUpperCase(),
        color: colors[type]
      }]
    };
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user,
      settings: {
        lang: language === 'bn' ? 'bn' : 'en',
        theme: 'light',
        currency: 'BDT',
        notifications: { budget: true, bills: true, weekly: true, members: true, quietHours: true }
      },
      activeWorkspaceId: wsId,
      workspaces: [workspace],
      accounts,
      categories,
      transactions: [],
      budgets: [],
      goals: [],
      debts: [],
      recurring: [],
      notifications: [],
      audit: [],
      chat: []
    };
  }

  global.HisabSeed = { buildDemoState, buildStarterState, CATEGORY_DEFS, ACCOUNT_COLORS, uid };
})(window);
