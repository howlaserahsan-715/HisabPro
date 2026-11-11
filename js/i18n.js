/* ═══════════════════════════════════════════════════════════
   HisabPro — bilingual strings and formatters
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const STRINGS = {
    en: {
      'nav.dashboard': 'Dashboard', 'nav.reports': 'Reports', 'nav.analytics': 'Analytics',
      'nav.transactions': 'Transactions', 'nav.accounts': 'Accounts', 'nav.budgets': 'Budgets',
      'nav.savings': 'Savings', 'nav.debts': 'Debts', 'nav.recurring': 'Recurring',
      'nav.calendar': 'Calendar', 'nav.assistant': 'AI Assistant', 'nav.notifications': 'Notifications',
      'nav.members': 'Members', 'nav.settings': 'Settings',
      'nav.group.overview': 'Overview', 'nav.group.money': 'Money', 'nav.group.planning': 'Planning',
      'nav.group.intelligence': 'Intelligence', 'nav.group.workspace': 'Workspace',
      'nav.home': 'Home', 'nav.activity': 'Activity', 'nav.more': 'More', 'nav.quickActions': 'Quick actions',
      'common.add': 'Add', 'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete',
      'common.edit': 'Edit', 'common.search': 'Search', 'common.all': 'All', 'common.income': 'Income',
      'common.expense': 'Expense', 'common.transfer': 'Transfer', 'common.total': 'Total',
      'common.thisMonth': 'This month', 'common.lastMonth': 'Last month', 'common.workspace': 'Workspace',
      'common.account': 'Account', 'common.category': 'Category', 'common.date': 'Date', 'common.amount': 'Amount',
      'common.description': 'Description', 'common.actions': 'Actions', 'common.viewAll': 'View all',
      'common.export': 'Export', 'common.print': 'Print', 'common.close': 'Close', 'common.confirm': 'Confirm',
      'common.today': 'Today', 'common.yesterday': 'Yesterday', 'common.thisWeek': 'This week',
      'common.lastWeek': 'Last week', 'common.thisYear': 'This year', 'common.custom': 'Custom range',
      'common.from': 'From', 'common.to': 'To', 'common.status': 'Status', 'common.member': 'Member',
      'common.role': 'Role', 'common.email': 'Email', 'common.name': 'Name', 'common.type': 'Type',
      'common.notes': 'Notes', 'common.optional': 'Optional', 'common.none': 'None', 'common.back': 'Back',
      'common.next': 'Next', 'common.finish': 'Finish', 'common.learnMore': 'Learn more', 'common.overview': 'Overview',
      'common.balance': 'Balance', 'common.details': 'Details', 'common.on': 'On', 'common.off': 'Off',
      'period.today': 'Today', 'period.week': 'This week', 'period.month': 'This month', 'period.lastMonth': 'Last month',
      'period.year': 'This year', 'period.6m': 'Last 6 months', 'period.12m': 'Last 12 months', 'period.all': 'All time',
      'dash.greeting.morning': 'Good morning', 'dash.greeting.afternoon': 'Good afternoon', 'dash.greeting.evening': 'Good evening',
      'dash.subtitle': 'Here is your financial picture', 'dash.tagline': 'Your financial picture at a glance', 'dash.balance': 'Total balance',
      'dash.income': 'Income', 'dash.expenses': 'Expenses', 'dash.savings': 'Net savings',
      'dash.vsPrev': 'vs previous period', 'dash.cashflow': 'Cash flow', 'dash.cashflow.sub': 'Money in versus money out over time',
      'dash.category': 'Spending by category', 'dash.category.sub': 'Where your money went', 'dash.recent': 'Recent transactions',
      'dash.budget': 'Budget utilization', 'dash.budget.sub': 'This month', 'dash.remaining': 'Remaining',
      'dash.upcoming': 'Upcoming bills', 'dash.accounts': 'Accounts', 'dash.quick': 'Quick actions',
      'dash.insight': 'Smart insight', 'dash.net': 'Net cash movement', 'dash.saved': 'Saved',
      'dash.noData': 'No activity in this period yet.',
      'add.income': 'Add income', 'add.expense': 'Add expense', 'add.transfer': 'Transfer',
      'add.contribution': 'Savings contribution', 'add.income.sub': 'Record money coming in',
      'add.expense.sub': 'Record money going out', 'add.transfer.sub': 'Move funds between accounts',
      'tx.title': 'Transactions', 'tx.sub': 'Search, filter and manage every record',
      'tx.new': 'New transaction', 'tx.edit': 'Edit transaction', 'tx.searchPlaceholder': 'Search description, category or account…',
      'tx.allTypes': 'All types', 'tx.allCategories': 'All categories', 'tx.allAccounts': 'All accounts',
      'tx.count': 'transactions', 'tx.in': 'In', 'tx.out': 'Out', 'tx.net': 'Net',
      'tx.empty': 'No transactions match your filters', 'tx.emptySub': 'Try clearing the filters or add your first record.',
      'tx.deleteTitle': 'Delete this transaction?', 'tx.deleteText': 'This will permanently remove the record and update account balances. This cannot be undone.',
      'tx.fromAccount': 'From account', 'tx.toAccount': 'To account', 'tx.paymentMethod': 'Payment method',
      'tx.attachment': 'Receipt or attachment', 'tx.recurring': 'Make this recurring',
      'tx.split': 'Split across categories', 'tx.splitHint': 'Splits are available in a future release.',
      'tx.saved': 'Transaction saved', 'tx.updated': 'Transaction updated', 'tx.deleted': 'Transaction deleted',
      'acc.title': 'Accounts & wallets', 'acc.sub': 'Cash, bank, card and mobile wallet balances',
      'acc.new': 'Add account', 'acc.transfer': 'Transfer', 'acc.opening': 'Opening balance',
      'acc.current': 'Current balance', 'acc.activity': 'activity', 'acc.edit': 'Edit account',
      'acc.deleteTitle': 'Archive this account?', 'acc.deleteText': 'Accounts with transaction history cannot be deleted. This demo will archive the account and keep the records.',
      'acc.type.cash': 'Cash', 'acc.type.bank': 'Bank account', 'acc.type.savings': 'Savings account',
      'acc.type.card': 'Card', 'acc.type.bkash': 'bKash', 'acc.type.nagad': 'Nagad', 'acc.type.rocket': 'Rocket',
      'acc.type.custom': 'Custom wallet', 'acc.saved': 'Account saved', 'acc.archived': 'Account archived',
      'acc.owner': 'Owner', 'acc.currency': 'Currency', 'acc.in': 'Money in', 'acc.out': 'Money out',
      'budget.title': 'Budgets', 'budget.sub': 'Plan spending and keep every category on track',
      'budget.new': 'New budget', 'budget.spent': 'Spent', 'budget.of': 'of', 'budget.remaining': 'remaining',
      'budget.utilized': 'utilized', 'budget.over': 'Over budget', 'budget.onTrack': 'On track',
      'budget.warning': 'Approaching limit', 'budget.overBy': 'over by', 'budget.left': 'left',
      'budget.overall': 'Overall budget', 'budget.categoryBudget': 'Category budget', 'budget.period': 'Period',
      'budget.alerts': 'Budget alerts', 'budget.alertsSub': 'Configurable thresholds', 'budget.noAlerts': 'No budget alerts right now.',
      'budget.daily': 'Daily', 'budget.weekly': 'Weekly', 'budget.monthly': 'Monthly', 'budget.yearly': 'Yearly',
      'budget.saved': 'Budget saved', 'budget.edit': 'Edit budget', 'budget.noCategory': 'Overall (all categories)',
      'savings.title': 'Savings & goals', 'savings.sub': 'Build the future one contribution at a time',
      'savings.new': 'New goal', 'savings.target': 'Target', 'savings.saved': 'Saved', 'savings.progress': 'Progress',
      'savings.contribute': 'Contribute', 'savings.deadline': 'Target date', 'savings.monthlyNeeded': 'Monthly needed',
      'savings.contribution': 'Add contribution', 'savings.contributionSub': 'Move money into this goal',
      'savings.completed': 'Goal reached', 'savings.contributed': 'Contribution recorded',
      'savings.totalSaved': 'Total saved', 'savings.activeGoals': 'Active goals', 'savings.reached': 'Goals reached',
      'savings.fromAccount': 'Contribute from account', 'savings.namePlaceholder': 'e.g. Emergency fund',
      'debt.title': 'Debt & loans', 'debt.sub': 'Track what you owe and what is owed to you',
      'debt.new': 'Add debt', 'debt.borrowed': 'Borrowed', 'debt.lent': 'Lent', 'debt.outstanding': 'Outstanding',
      'debt.totalBorrowed': 'Total borrowed', 'debt.totalLent': 'Total lent', 'debt.netPosition': 'Net debt position',
      'debt.party': 'Lender / borrower', 'debt.principal': 'Principal', 'debt.rate': 'Interest rate (%)',
      'debt.startDate': 'Start date', 'debt.dueDate': 'Final due date', 'debt.payment': 'Record payment',
      'debt.paymentSub': 'Reduce the outstanding balance', 'debt.paymentAmount': 'Payment amount',
      'debt.interestPart': 'Interest portion', 'debt.paid': 'Payment recorded', 'debt.noDebts': 'No debt records yet',
      'debt.overdue': 'Overdue', 'debt.due': 'Due', 'debt.created': 'Debt record added', 'debt.direction': 'Direction',
      'debt.remaining': 'outstanding', 'debt.history': 'Payment history', 'debt.noHistory': 'No payments yet',
      'report.title': 'Reports', 'report.sub': 'Reconciled, explainable summaries you can export',
      'report.overview': 'Overview', 'report.categories': 'Category report', 'report.accounts': 'Account report',
      'report.cashflow': 'Cash flow', 'report.pl': 'Profit & loss', 'report.budget': 'Budget vs actual',
      'report.period': 'Reporting period', 'report.generated': 'Generated', 'report.revenue': 'Revenue',
      'report.cogs': 'Operating expenses', 'report.gross': 'Gross profit', 'report.netProfit': 'Net profit',
      'report.margin': 'Profit margin', 'report.exportCsv': 'Export CSV', 'report.exported': 'Report exported',
      'report.noData': 'No data for this period', 'report.share': 'Share', 'report.month': 'Month',
      'report.incomeExpense': 'Income & expenses', 'report.account': 'Account', 'report.opening': 'Opening',
      'report.closing': 'Closing', 'report.inflow': 'Inflow', 'report.outflow': 'Outflow',
      'analytics.title': 'Smart analytics', 'analytics.sub': 'Patterns and estimates grounded in your records',
      'analytics.topCategory': 'Top spending category', 'analytics.mom': 'Month-over-month',
      'analytics.savingsRate': 'Savings rate', 'analytics.avgDaily': 'Average daily spend',
      'analytics.budgetUse': 'Budget utilization', 'analytics.forecast': 'Next month forecast (estimate)',
      'analytics.weekday': 'Spending by weekday', 'analytics.trend': 'Six-month trend', 'analytics.anomaly': 'Possible anomaly',
      'analytics.estimate': 'Estimates are based on historical averages and are not guarantees.',
      'analytics.insight1': 'You spend the most on', 'analytics.insight2': 'Spending is', 'analytics.insight3': 'You keep about',
      'analytics.insight4': 'of every taka earned. A healthy target is often 20% or more.',
      'cal.title': 'Financial calendar', 'cal.sub': 'Transactions, bills and due dates in one view',
      'cal.upcoming': 'Upcoming schedule', 'cal.due': 'Due', 'cal.noEvents': 'Nothing scheduled this month.',
      'cal.day': 'Day', 'cal.viewDay': 'Transactions on this day', 'cal.noDay': 'No transactions on this day.',
      'rec.title': 'Recurring payments', 'rec.sub': 'Scheduled income and expenses, with reminders',
      'rec.new': 'New rule', 'rec.next': 'Next', 'rec.frequency': 'Frequency', 'rec.paused': 'Paused',
      'rec.active': 'Active', 'rec.postNow': 'Post now', 'rec.posted': 'Transaction posted', 'rec.edit': 'Edit rule',
      'rec.weekly': 'Weekly', 'rec.monthly': 'Monthly', 'rec.yearly': 'Yearly', 'rec.daily': 'Daily',
      'rec.reminder': 'Remind me', 'rec.daysBefore': 'days before',
      'ai.title': 'AI Financial Assistant', 'ai.sub': 'Ask questions about your own records',
      'ai.online': 'Grounded in your active workspace', 'ai.placeholder': 'Ask about your spending, budgets or savings…',
      'ai.disclaimer': 'AI answers are drafts, not financial advice. Every figure is calculated from your local records. Nothing is changed without your confirmation.',
      'ai.capabilities': 'What I can help with', 'ai.cap1': 'Summarise income and spending', 'ai.cap2': 'Find your top categories',
      'ai.cap3': 'Compare months and budgets', 'ai.cap4': 'Explain savings and debt position',
      'ai.welcome': 'Hi! I can answer questions about this workspace using your recorded data. Try one of the suggestions below.',
      'ai.suggestion1': 'How much did I spend this month?', 'ai.suggestion2': 'Which category cost the most?',
      'ai.suggestion3': 'How does this month compare to last month?', 'ai.suggestion4': 'Where am I exceeding my budget?',
      'ai.suggestion5': 'What is my total balance?', 'ai.suggestion6': 'How are my savings goals doing?',
      'ai.clear': 'Clear conversation', 'ai.you': 'You',
      'notif.title': 'Notifications', 'notif.sub': 'Alerts, reminders and workspace activity',
      'notif.markAll': 'Mark all read', 'notif.allRead': 'All notifications marked read', 'notif.empty': 'You are all caught up.',
      'notif.unread': 'unread', 'notif.budget': 'Budget alert', 'notif.bill': 'Bill reminder',
      'notif.goal': 'Savings goal', 'notif.member': 'Workspace', 'notif.summary': 'Monthly summary',
      'set.title': 'Settings', 'set.sub': 'Profile, preferences, security and data',
      'set.profile': 'Profile', 'set.preferences': 'Preferences', 'set.workspace': 'Workspace',
      'set.security': 'Security', 'set.notifications': 'Notifications', 'set.data': 'Data & privacy',
      'set.about': 'About', 'set.language': 'Language', 'set.languageHint': 'Interface language across the app.',
      'set.theme': 'Appearance', 'set.themeHint': 'Light, dark, or match your device.',
      'set.light': 'Light', 'set.dark': 'Dark', 'set.system': 'System',
      'set.currency': 'Primary currency', 'set.currencyHint': 'BDT is the launch currency. Multi-currency is designed for a future release.',
      'set.numberFormat': 'Number format', 'set.numberFormatHint': 'Bengali numerals are used when the interface is in বাংলা.',
      'set.notifHints': 'Notification preferences', 'set.notifHintsHint': 'Control which alerts appear in the app.',
      'set.budgetAlerts': 'Budget threshold alerts', 'set.billReminders': 'Bill and due-date reminders',
      'set.weeklySummary': 'Weekly summary', 'set.memberActivity': 'Member activity', 'set.quietHours': 'Quiet hours',
      'set.quietHoursHint': 'Pause non-critical notifications between 10 PM and 7 AM.',
      'set.twofa': 'Two-factor authentication', 'set.twofaHint': 'Optional 2FA. Not connected in this local demo.',
      'set.sessions': 'Active sessions', 'set.sessionsHint': 'This device · Local demo session',
      'set.changePassword': 'Change password', 'set.passwordChanged': 'Password updated (demo only)',
      'set.exportData': 'Export all data', 'set.exportDataHint': 'Download a JSON backup of every workspace and record.',
      'set.importData': 'Import backup', 'set.importDataHint': 'Restore from a previously exported HisabPro JSON file.',
      'set.reset': 'Reset demo data', 'set.resetHint': 'Delete local changes and restore the sample workspace.',
      'set.resetConfirm': 'Reset all local data?', 'set.resetText': 'This deletes your local workspaces, transactions and settings, then reloads fresh demo data. It cannot be undone.',
      'set.signOut': 'Sign out', 'set.signOutHint': 'Return to the sign-in screen. Local data stays on this device.',
      'set.saveProfile': 'Save profile', 'set.profileSaved': 'Profile updated', 'set.exported': 'Backup downloaded',
      'set.imported': 'Backup restored', 'set.importError': 'That file could not be read as a HisabPro backup.',
      'set.aboutText': 'HisabPro is a planning-stage financial intelligence platform for individuals, families and businesses in Bangladesh. This build is a responsive offline-capable demo.',
      'set.version': 'Version', 'set.owner': 'Workspace owner',
      'members.title': 'Workspace members', 'members.sub': 'People with access to this workspace',
      'members.invite': 'Invite member', 'members.inviteSub': 'Send an invitation to collaborate',
      'members.emailLabel': 'Email address', 'members.roleLabel': 'Role',
      'members.pending': 'Pending', 'members.active': 'Active', 'members.owner': 'Owner', 'members.admin': 'Admin',
      'members.accountant': 'Accountant', 'members.manager': 'Manager', 'members.member': 'Member', 'members.viewer': 'Viewer',
      'members.invited': 'Invitation sent', 'members.removed': 'Member removed', 'members.roleUpdated': 'Role updated',
      'members.you': 'You', 'members.noInvite': 'Invitations are simulated in this local demo.',
      'role.owner': 'Owner', 'role.admin': 'Admin', 'role.accountant': 'Accountant', 'role.manager': 'Manager',
      'role.member': 'Member', 'role.viewer': 'Viewer',
      'ws.personal': 'Personal', 'ws.family': 'Family', 'ws.business': 'Business',
      'ws.personalDesc': 'Private personal finances', 'ws.familyDesc': 'Shared household finances', 'ws.businessDesc': 'Company books and operations',
      'ws.new': 'New workspace', 'ws.switch': 'Switch workspace', 'ws.name': 'Workspace name',
      'ws.created': 'Workspace created', 'ws.type': 'Workspace type',
      'auth.welcome': 'Welcome to HisabPro', 'auth.signinTitle': 'Sign in to your account',
      'auth.signinSub': 'Your financial intelligence workspace is ready.', 'auth.signupTitle': 'Create your account',
      'auth.signupSub': 'Set up your first workspace in under a minute.', 'auth.signin': 'Sign in', 'auth.signup': 'Create account',
      'auth.name': 'Full name', 'auth.email': 'Email address', 'auth.password': 'Password', 'auth.firstWs': 'First workspace',
      'auth.language': 'Language', 'auth.demo': 'Try the demo with sample data', 'auth.divider': 'or explore instantly',
      'auth.note': 'Demo authentication. No server, no real banking connection.',
      'auth.demoName': 'Rahim Ahmed', 'auth.demoEmail': 'rahim@hisabpro.app', 'auth.invalid': 'Please enter a valid email and a password of at least 6 characters.',
      'auth.nameRequired': 'Please enter your name.', 'auth.welcomeBack': 'Welcome back',
      'toast.saved': 'Saved successfully', 'toast.deleted': 'Deleted', 'toast.error': 'Something went wrong',
      'toast.copied': 'Copied to clipboard', 'toast.offline': 'You are offline. Changes are saved on this device.',
      'toast.online': 'Back online. Everything is saved.', 'toast.lang': 'Language switched',
      'toast.theme': 'Theme updated', 'toast.ws': 'Workspace switched',
      'empty.addFirst': 'Add your first record',
      'cat.food': 'Food & grocery', 'cat.transport': 'Transportation', 'cat.housing': 'Housing & rent',
      'cat.utilities': 'Utilities', 'cat.health': 'Healthcare', 'cat.education': 'Education', 'cat.shopping': 'Shopping',
      'cat.entertainment': 'Entertainment', 'cat.family': 'Family', 'cat.business': 'Business', 'cat.personal': 'Personal',
      'cat.other': 'Other', 'cat.salary': 'Salary', 'cat.revenue': 'Business revenue', 'cat.freelance': 'Freelancing',
      'cat.investment': 'Investment return', 'cat.rental': 'Rental income', 'cat.gift': 'Gift', 'cat.commission': 'Commission',
      'cat.interest': 'Loan interest', 'cat.savingscat': 'Savings & investments',
      'range.today': 'Today', 'range.yesterday': 'Yesterday', 'range.thisWeek': 'This week', 'range.lastWeek': 'Last week',
      'range.thisMonth': 'This month', 'range.lastMonth': 'Last month', 'range.thisYear': 'This year', 'range.custom': 'Custom'
    },
    bn: {
      'nav.dashboard': 'ড্যাশবোর্ড', 'nav.reports': 'রিপোর্ট', 'nav.analytics': 'বিশ্লেষণ',
      'nav.transactions': 'লেনদেন', 'nav.accounts': 'অ্যাকাউন্ট', 'nav.budgets': 'বাজেট',
      'nav.savings': 'সঞ্চয়', 'nav.debts': 'ঋণ', 'nav.recurring': 'নিয়মিত পেমেন্ট',
      'nav.calendar': 'ক্যালেন্ডার', 'nav.assistant': 'এআই সহকারী', 'nav.notifications': 'বিজ্ঞপ্তি',
      'nav.members': 'সদস্য', 'nav.settings': 'সেটিংস',
      'nav.group.overview': 'সারসংক্ষেপ', 'nav.group.money': 'টাকা-পয়সা', 'nav.group.planning': 'পরিকল্পনা',
      'nav.group.intelligence': 'বুদ্ধিমত্তা', 'nav.group.workspace': 'ওয়ার্কস্পেস',
      'nav.home': 'হোম', 'nav.activity': 'কার্যক্রম', 'nav.more': 'আরও', 'nav.quickActions': 'দ্রুত কাজ',
      'common.add': 'যোগ করুন', 'common.save': 'সংরক্ষণ', 'common.cancel': 'বাতিল', 'common.delete': 'মুছুন',
      'common.edit': 'সম্পাদনা', 'common.search': 'খুঁজুন', 'common.all': 'সব', 'common.income': 'আয়',
      'common.expense': 'ব্যয়', 'common.transfer': 'স্থানান্তর', 'common.total': 'মোট',
      'common.thisMonth': 'এই মাস', 'common.lastMonth': 'গত মাস', 'common.workspace': 'ওয়ার্কস্পেস',
      'common.account': 'অ্যাকাউন্ট', 'common.category': 'বিভাগ', 'common.date': 'তারিখ', 'common.amount': 'পরিমাণ',
      'common.description': 'বিবরণ', 'common.actions': 'কার্যক্রম', 'common.viewAll': 'সব দেখুন',
      'common.export': 'এক্সপোর্ট', 'common.print': 'প্রিন্ট', 'common.close': 'বন্ধ', 'common.confirm': 'নিশ্চিত করুন',
      'common.today': 'আজ', 'common.yesterday': 'গতকাল', 'common.thisWeek': 'এই সপ্তাহ',
      'common.lastWeek': 'গত সপ্তাহ', 'common.thisYear': 'এই বছর', 'common.custom': 'কাস্টম সময়',
      'common.from': 'থেকে', 'common.to': 'পর্যন্ত', 'common.status': 'অবস্থা', 'common.member': 'সদস্য',
      'common.role': 'ভূমিকা', 'common.email': 'ইমেইল', 'common.name': 'নাম', 'common.type': 'ধরন',
      'common.notes': 'নোট', 'common.optional': 'ঐচ্ছিক', 'common.none': 'কিছু নেই', 'common.back': 'পেছনে',
      'common.next': 'পরবর্তী', 'common.finish': 'শেষ করুন', 'common.learnMore': 'আরও জানুন', 'common.overview': 'সারসংক্ষেপ',
      'common.balance': 'ব্যালেন্স', 'common.details': 'বিস্তারিত', 'common.on': 'চালু', 'common.off': 'বন্ধ',
      'period.today': 'আজ', 'period.week': 'এই সপ্তাহ', 'period.month': 'এই মাস', 'period.lastMonth': 'গত মাস',
      'period.year': 'এই বছর', 'period.6m': 'গত ৬ মাস', 'period.12m': 'গত ১২ মাস', 'period.all': 'সর্বকালীন',
      'dash.greeting.morning': 'শুভ সকাল', 'dash.greeting.afternoon': 'শুভ দুপুর', 'dash.greeting.evening': 'শুভ সন্ধ্যা',
      'dash.subtitle': 'আপনার আর্থিক চিত্র', 'dash.tagline': 'এক নজরে আপনার আর্থিক অবস্থা', 'dash.balance': 'মোট ব্যালেন্স',
      'dash.income': 'আয়', 'dash.expenses': 'ব্যয়', 'dash.savings': 'নিট সঞ্চয়',
      'dash.vsPrev': 'আগের সময়ের তুলনায়', 'dash.cashflow': 'নগদ প্রবাহ', 'dash.cashflow.sub': 'সময়ের সাথে আয় ও ব্যয়',
      'dash.category': 'বিভাগ অনুযায়ী ব্যয়', 'dash.category.sub': 'আপনার টাকা কোথায় গেছে', 'dash.recent': 'সাম্প্রতিক লেনদেন',
      'dash.budget': 'বাজেট ব্যবহার', 'dash.budget.sub': 'এই মাস', 'dash.remaining': 'বাকি',
      'dash.upcoming': 'আসন্ন বিল', 'dash.accounts': 'অ্যাকাউন্ট', 'dash.quick': 'দ্রুত কাজ',
      'dash.insight': 'স্মার্ট অন্তর্দৃষ্টি', 'dash.net': 'নিট নগদ প্রবাহ', 'dash.saved': 'সঞ্চিত',
      'dash.noData': 'এই সময়ে এখনো কোনো লেনদেন নেই।',
      'add.income': 'আয় যোগ করুন', 'add.expense': 'ব্যয় যোগ করুন', 'add.transfer': 'স্থানান্তর',
      'add.contribution': 'সঞ্চয় জমা', 'add.income.sub': 'প্রাপ্ত টাকা লিপিবদ্ধ করুন',
      'add.expense.sub': 'খরচ লিপিবদ্ধ করুন', 'add.transfer.sub': 'অ্যাকাউন্টের মধ্যে টাকা সরান',
      'tx.title': 'লেনদেন', 'tx.sub': 'প্রতিটি রেকর্ড খুঁজুন, ফিল্টার করুন ও পরিচালনা করুন',
      'tx.new': 'নতুন লেনদেন', 'tx.edit': 'লেনদেন সম্পাদনা', 'tx.searchPlaceholder': 'বিবরণ, বিভাগ বা অ্যাকাউন্ট খুঁজুন…',
      'tx.allTypes': 'সব ধরন', 'tx.allCategories': 'সব বিভাগ', 'tx.allAccounts': 'সব অ্যাকাউন্ট',
      'tx.count': 'টি লেনদেন', 'tx.in': 'আয়', 'tx.out': 'ব্যয়', 'tx.net': 'নিট',
      'tx.empty': 'ফিল্টারে কোনো লেনদেন পাওয়া যায়নি', 'tx.emptySub': 'ফিল্টার মুছুন অথবা প্রথম রেকর্ড যোগ করুন।',
      'tx.deleteTitle': 'এই লেনদেন মুছবেন?', 'tx.deleteText': 'এটি স্থায়ীভাবে রেকর্ডটি মুছে ফেলবে এবং অ্যাকাউন্টের ব্যালেন্স হালনাগাদ করবে। এটি ফেরানো যাবে না।',
      'tx.fromAccount': 'যে অ্যাকাউন্ট থেকে', 'tx.toAccount': 'যে অ্যাকাউন্টে', 'tx.paymentMethod': 'পেমেন্ট পদ্ধতি',
      'tx.attachment': 'রসিদ বা সংযুক্তি', 'tx.recurring': 'এটি নিয়মিত করুন',
      'tx.split': 'বিভাগে ভাগ করুন', 'tx.splitHint': 'ভাগ করার সুবিধা ভবিষ্যৎ সংস্করণে আসবে।',
      'tx.saved': 'লেনদেন সংরক্ষিত হয়েছে', 'tx.updated': 'লেনদেন হালনাগাদ হয়েছে', 'tx.deleted': 'লেনদেন মুছে ফেলা হয়েছে',
      'acc.title': 'অ্যাকাউন্ট ও ওয়ালেট', 'acc.sub': 'নগদ, ব্যাংক, কার্ড ও মোবাইল ওয়ালেটের ব্যালেন্স',
      'acc.new': 'অ্যাকাউন্ট যোগ করুন', 'acc.transfer': 'স্থানান্তর', 'acc.opening': 'প্রারম্ভিক ব্যালেন্স',
      'acc.current': 'বর্তমান ব্যালেন্স', 'acc.activity': 'টি লেনদেন', 'acc.edit': 'অ্যাকাউন্ট সম্পাদনা',
      'acc.deleteTitle': 'এই অ্যাকাউন্ট আর্কাইভ করবেন?', 'acc.deleteText': 'লেনদেন থাকা অ্যাকাউন্ট মুছে ফেলা যায় না। এই ডেমোতে অ্যাকাউন্টটি আর্কাইভ হবে এবং রেকর্ড থাকবে।',
      'acc.type.cash': 'নগদ', 'acc.type.bank': 'ব্যাংক অ্যাকাউন্ট', 'acc.type.savings': 'সঞ্চয় অ্যাকাউন্ট',
      'acc.type.card': 'কার্ড', 'acc.type.bkash': 'বিকাশ', 'acc.type.nagad': 'নগদ', 'acc.type.rocket': 'রকেট',
      'acc.type.custom': 'কাস্টম ওয়ালেট', 'acc.saved': 'অ্যাকাউন্ট সংরক্ষিত', 'acc.archived': 'অ্যাকাউন্ট আর্কাইভ হয়েছে',
      'acc.owner': 'মালিক', 'acc.currency': 'মুদ্রা', 'acc.in': 'আগত', 'acc.out': 'বহির্গত',
      'budget.title': 'বাজেট', 'budget.sub': 'ব্যয় পরিকল্পনা করুন এবং প্রতিটি বিভাগ নিয়ন্ত্রণে রাখুন',
      'budget.new': 'নতুন বাজেট', 'budget.spent': 'ব্যয়', 'budget.of': 'এর মধ্যে', 'budget.remaining': 'বাকি',
      'budget.utilized': 'ব্যবহৃত', 'budget.over': 'বাজেট ছাড়িয়েছে', 'budget.onTrack': 'সঠিক পথে',
      'budget.warning': 'সীমার কাছাকাছি', 'budget.overBy': 'অতিরিক্ত', 'budget.left': 'বাকি',
      'budget.overall': 'সামগ্রিক বাজেট', 'budget.categoryBudget': 'বিভাগীয় বাজেট', 'budget.period': 'সময়কাল',
      'budget.alerts': 'বাজেট সতর্কতা', 'budget.alertsSub': 'সমন্বয়যোগ্য সীমা', 'budget.noAlerts': 'এই মুহূর্তে কোনো বাজেট সতর্কতা নেই।',
      'budget.daily': 'দৈনিক', 'budget.weekly': 'সাপ্তাহিক', 'budget.monthly': 'মাসিক', 'budget.yearly': 'বার্ষিক',
      'budget.saved': 'বাজেট সংরক্ষিত', 'budget.edit': 'বাজেট সম্পাদনা', 'budget.noCategory': 'সামগ্রিক (সব বিভাগ)',
      'savings.title': 'সঞ্চয় ও লক্ষ্য', 'savings.sub': 'প্রতিটি জমা দিয়ে ভবিষ্যৎ গড়ুন',
      'savings.new': 'নতুন লক্ষ্য', 'savings.target': 'লক্ষ্য', 'savings.saved': 'সঞ্চিত', 'savings.progress': 'অগ্রগতি',
      'savings.contribute': 'জমা দিন', 'savings.deadline': 'লক্ষ্য তারিখ', 'savings.monthlyNeeded': 'মাসিক প্রয়োজন',
      'savings.contribution': 'জমা যোগ করুন', 'savings.contributionSub': 'এই লক্ষ্যে টাকা সরান',
      'savings.completed': 'লক্ষ্য অর্জিত', 'savings.contributed': 'জমা লিপিবদ্ধ হয়েছে',
      'savings.totalSaved': 'মোট সঞ্চয়', 'savings.activeGoals': 'সক্রিয় লক্ষ্য', 'savings.reached': 'অর্জিত লক্ষ্য',
      'savings.fromAccount': 'যে অ্যাকাউন্ট থেকে জমা', 'savings.namePlaceholder': 'যেমন: জরুরি তহবিল',
      'debt.title': 'ঋণ ও ধার', 'debt.sub': 'আপনি যা পাওনা এবং যা দেনা তা ট্র্যাক করুন',
      'debt.new': 'ঋণ যোগ করুন', 'debt.borrowed': 'ধার নিয়েছেন', 'debt.lent': 'ধার দিয়েছেন', 'debt.outstanding': 'বাকি',
      'debt.totalBorrowed': 'মোট ধার', 'debt.totalLent': 'মোট পাওনা', 'debt.netPosition': 'নিট ঋণ অবস্থান',
      'debt.party': 'ঋণদাতা / ঋণগ্রহীতা', 'debt.principal': 'মূলধন', 'debt.rate': 'সুদের হার (%)',
      'debt.startDate': 'শুরুর তারিখ', 'debt.dueDate': 'শেষ পরিশোধের তারিখ', 'debt.payment': 'পরিশোধ লিপিবদ্ধ করুন',
      'debt.paymentSub': 'বাকি ব্যালেন্স কমান', 'debt.paymentAmount': 'পরিশোধের পরিমাণ',
      'debt.interestPart': 'সুদের অংশ', 'debt.paid': 'পরিশোধ লিপিবদ্ধ হয়েছে', 'debt.noDebts': 'এখনো কোনো ঋণ রেকর্ড নেই',
      'debt.overdue': 'মেয়াদোত্তীর্ণ', 'debt.due': 'পরিশোধের তারিখ', 'debt.created': 'ঋণ রেকর্ড যোগ হয়েছে', 'debt.direction': 'দিক',
      'debt.remaining': 'বাকি', 'debt.history': 'পরিশোধের ইতিহাস', 'debt.noHistory': 'এখনো কোনো পরিশোধ নেই',
      'report.title': 'রিপোর্ট', 'report.sub': 'মিলিত ও ব্যাখ্যাযোগ্য সারসংক্ষেপ, এক্সপোর্টযোগ্য',
      'report.overview': 'সারসংক্ষেপ', 'report.categories': 'বিভাগীয় রিপোর্ট', 'report.accounts': 'অ্যাকাউন্ট রিপোর্ট',
      'report.cashflow': 'নগদ প্রবাহ', 'report.pl': 'লাভ ও ক্ষতি', 'report.budget': 'বাজেট বনাম বাস্তব',
      'report.period': 'রিপোর্টের সময়কাল', 'report.generated': 'তৈরি', 'report.revenue': 'আয়',
      'report.cogs': 'পরিচালন ব্যয়', 'report.gross': 'মোট লাভ', 'report.netProfit': 'নিট লাভ',
      'report.margin': 'লাভের হার', 'report.exportCsv': 'CSV এক্সপোর্ট', 'report.exported': 'রিপোর্ট এক্সপোর্ট হয়েছে',
      'report.noData': 'এই সময়ের কোনো তথ্য নেই', 'report.share': 'অংশ', 'report.month': 'মাস',
      'report.incomeExpense': 'আয় ও ব্যয়', 'report.account': 'অ্যাকাউন্ট', 'report.opening': 'প্রারম্ভিক',
      'report.closing': 'সমাপনী', 'report.inflow': 'আগত', 'report.outflow': 'বহির্গত',
      'analytics.title': 'স্মার্ট বিশ্লেষণ', 'analytics.sub': 'আপনার রেকর্ডের ভিত্তিতে ধরন ও অনুমান',
      'analytics.topCategory': 'সর্বোচ্চ ব্যয়ের বিভাগ', 'analytics.mom': 'মাসে মাসে পরিবর্তন',
      'analytics.savingsRate': 'সঞ্চয়ের হার', 'analytics.avgDaily': 'দৈনিক গড় ব্যয়',
      'analytics.budgetUse': 'বাজেট ব্যবহার', 'analytics.forecast': 'আগামী মাসের পূর্বাভাস (অনুমান)',
      'analytics.weekday': 'সপ্তাহের দিন অনুযায়ী ব্যয়', 'analytics.trend': 'ছয় মাসের প্রবণতা', 'analytics.anomaly': 'সম্ভাব্য অস্বাভাবিকতা',
      'analytics.estimate': 'অনুমান ঐতিহাসিক গড়ের ভিত্তিতে; এটি নিশ্চয়তা নয়।',
      'analytics.insight1': 'আপনি সবচেয়ে বেশি ব্যয় করেন', 'analytics.insight2': 'ব্যয়',
      'analytics.insight3': 'আপনি প্রায়', 'analytics.insight4': 'প্রতি টাকা আয়ের সঞ্চয় করছেন। সুস্থ লক্ষ্য সাধারণত ২০% বা তার বেশি।',
      'cal.title': 'আর্থিক ক্যালেন্ডার', 'cal.sub': 'লেনদেন, বিল ও পরিশোধের তারিখ একসাথে',
      'cal.upcoming': 'আসন্ন সময়সূচি', 'cal.due': 'পরিশোধ', 'cal.noEvents': 'এই মাসে কিছু নির্ধারিত নেই।',
      'cal.day': 'দিন', 'cal.viewDay': 'এই দিনের লেনদেন', 'cal.noDay': 'এই দিনে কোনো লেনদেন নেই।',
      'rec.title': 'নিয়মিত পেমেন্ট', 'rec.sub': 'নির্ধারিত আয় ও ব্যয়, রিমাইন্ডারসহ',
      'rec.new': 'নতুন নিয়ম', 'rec.next': 'পরবর্তী', 'rec.frequency': 'পুনরাবৃত্তি', 'rec.paused': 'বিরত',
      'rec.active': 'সক্রিয়', 'rec.postNow': 'এখনই যোগ করুন', 'rec.posted': 'লেনদেন যোগ হয়েছে', 'rec.edit': 'নিয়ম সম্পাদনা',
      'rec.weekly': 'সাপ্তাহিক', 'rec.monthly': 'মাসিক', 'rec.yearly': 'বার্ষিক', 'rec.daily': 'দৈনিক',
      'rec.reminder': 'মনে করান', 'rec.daysBefore': 'দিন আগে',
      'ai.title': 'এআই আর্থিক সহকারী', 'ai.sub': 'আপনার নিজের রেকর্ড সম্পর্কে প্রশ্ন করুন',
      'ai.online': 'সক্রিয় ওয়ার্কস্পেসের তথ্যের ভিত্তিতে', 'ai.placeholder': 'ব্যয়, বাজেট বা সঞ্চয় সম্পর্কে জিজ্ঞাসা করুন…',
      'ai.disclaimer': 'এআই উত্তর খসড়া, আর্থিক পরামর্শ নয়। প্রতিটি সংখ্যা আপনার স্থানীয় রেকর্ড থেকে গণনা করা। আপনার নিশ্চিতকরণ ছাড়া কিছু পরিবর্তন হয় না।',
      'ai.capabilities': 'যেসব বিষয়ে সাহায্য করতে পারি', 'ai.cap1': 'আয় ও ব্যয়ের সারসংক্ষেপ', 'ai.cap2': 'শীর্ষ বিভাগ খুঁজে দেওয়া',
      'ai.cap3': 'মাস ও বাজেট তুলনা', 'ai.cap4': 'সঞ্চয় ও ঋণের অবস্থা ব্যাখ্যা',
      'ai.welcome': 'হ্যালো! আপনার রেকর্ড করা তথ্য ব্যবহার করে এই ওয়ার্কস্পেস সম্পর্কে প্রশ্নের উত্তর দিতে পারি। নিচের একটি পরামর্শ বেছে নিন।',
      'ai.suggestion1': 'এই মাসে কত খরচ করেছি?', 'ai.suggestion2': 'কোন বিভাগে সবচেয়ে বেশি খরচ হয়েছে?',
      'ai.suggestion3': 'এই মাস গত মাসের তুলনায় কেমন?', 'ai.suggestion4': 'কোথায় বাজেট ছাড়াচ্ছি?',
      'ai.suggestion5': 'আমার মোট ব্যালেন্স কত?', 'ai.suggestion6': 'আমার সঞ্চয় লক্ষ্যগুলো কেমন চলছে?',
      'ai.clear': 'কথোপকথন মুছুন', 'ai.you': 'আপনি',
      'notif.title': 'বিজ্ঞপ্তি', 'notif.sub': 'সতর্কতা, রিমাইন্ডার ও ওয়ার্কস্পেস কার্যক্রম',
      'notif.markAll': 'সব পঠিত হিসেবে চিহ্নিত করুন', 'notif.allRead': 'সব বিজ্ঞপ্তি পঠিত হয়েছে', 'notif.empty': 'সব দেখা হয়ে গেছে।',
      'notif.unread': 'টি অপঠিত', 'notif.budget': 'বাজেট সতর্কতা', 'notif.bill': 'বিল রিমাইন্ডার',
      'notif.goal': 'সঞ্চয় লক্ষ্য', 'notif.member': 'ওয়ার্কস্পেস', 'notif.summary': 'মাসিক সারসংক্ষেপ',
      'set.title': 'সেটিংস', 'set.sub': 'প্রোফাইল, পছন্দ, নিরাপত্তা ও তথ্য',
      'set.profile': 'প্রোফাইল', 'set.preferences': 'পছন্দ', 'set.workspace': 'ওয়ার্কস্পেস',
      'set.security': 'নিরাপত্তা', 'set.notifications': 'বিজ্ঞপ্তি', 'set.data': 'তথ্য ও গোপনীয়তা',
      'set.about': 'সম্পর্কে', 'set.language': 'ভাষা', 'set.languageHint': 'অ্যাপের ইন্টারফেস ভাষা।',
      'set.theme': 'অ্যাপিয়ারেন্স', 'set.themeHint': 'লাইট, ডার্ক বা ডিভাইস অনুযায়ী।',
      'set.light': 'লাইট', 'set.dark': 'ডার্ক', 'set.system': 'সিস্টেম',
      'set.currency': 'প্রধান মুদ্রা', 'set.currencyHint': 'শুরুর মুদ্রা টাকা (BDT)। ভবিষ্যতে বহু-মুদ্রা সমর্থন আসবে।',
      'set.numberFormat': 'সংখ্যার ধরন', 'set.numberFormatHint': 'বাংলা ইন্টারফেসে বাংলা সংখ্যা ব্যবহৃত হয়।',
      'set.notifHints': 'বিজ্ঞপ্তির পছন্দ', 'set.notifHintsHint': 'অ্যাপে কোন সতর্কতা দেখাবে তা নিয়ন্ত্রণ করুন।',
      'set.budgetAlerts': 'বাজেট সীমার সতর্কতা', 'set.billReminders': 'বিল ও পরিশোধের রিমাইন্ডার',
      'set.weeklySummary': 'সাপ্তাহিক সারসংক্ষেপ', 'set.memberActivity': 'সদস্যদের কার্যক্রম', 'set.quietHours': 'নীরব সময়',
      'set.quietHoursHint': 'রাত ১০টা থেকে সকাল ৭টা পর্যন্ত অ-জরুরি বিজ্ঞপ্তি বন্ধ।',
      'set.twofa': 'দুই-ধাপ যাচাই', 'set.twofaHint': 'ঐচ্ছিক 2FA। এই স্থানীয় ডেমোতে সংযুক্ত নয়।',
      'set.sessions': 'সক্রিয় সেশন', 'set.sessionsHint': 'এই ডিভাইস · স্থানীয় ডেমো সেশন',
      'set.changePassword': 'পাসওয়ার্ড পরিবর্তন', 'set.passwordChanged': 'পাসওয়ার্ড হালনাগাদ হয়েছে (শুধু ডেমো)',
      'set.exportData': 'সব তথ্য এক্সপোর্ট', 'set.exportDataHint': 'প্রতিটি ওয়ার্কস্পেস ও রেকর্ডের JSON ব্যাকআপ ডাউনলোড করুন।',
      'set.importData': 'ব্যাকআপ আমদানি', 'set.importDataHint': 'আগে এক্সপোর্ট করা HisabPro JSON ফাইল থেকে পুনরুদ্ধার করুন।',
      'set.reset': 'ডেমো তথ্য রিসেট', 'set.resetHint': 'স্থানীয় পরিবর্তন মুছে নমুনা ওয়ার্কস্পেস ফিরিয়ে আনুন।',
      'set.resetConfirm': 'সব স্থানীয় তথ্য রিসেট করবেন?', 'set.resetText': 'এটি আপনার স্থানীয় ওয়ার্কস্পেস, লেনদেন ও সেটিংস মুছে নতুন ডেমো তথ্য লোড করবে। এটি ফেরানো যাবে না।',
      'set.signOut': 'সাইন আউট', 'set.signOutHint': 'সাইন-ইন স্ক্রিনে ফিরুন। স্থানীয় তথ্য এই ডিভাইসে থাকবে।',
      'set.saveProfile': 'প্রোফাইল সংরক্ষণ', 'set.profileSaved': 'প্রোফাইল হালনাগাদ হয়েছে', 'set.exported': 'ব্যাকআপ ডাউনলোড হয়েছে',
      'set.imported': 'ব্যাকআপ পুনরুদ্ধার হয়েছে', 'set.importError': 'ফাইলটি HisabPro ব্যাকআপ হিসেবে পড়া যায়নি।',
      'set.aboutText': 'হিসাবপ্রো বাংলাদেশের ব্যক্তি, পরিবার ও ব্যবসার জন্য একটি পরিকল্পনাধীন আর্থিক প্ল্যাটফর্ম। এই সংস্করণ একটি রেসপন্সিভ, অফলাইন-সক্ষম ডেমো।',
      'set.version': 'সংস্করণ', 'set.owner': 'ওয়ার্কস্পেস মালিক',
      'members.title': 'ওয়ার্কস্পেস সদস্য', 'members.sub': 'এই ওয়ার্কস্পেসে যাদের প্রবেশাধিকার আছে',
      'members.invite': 'সদস্য আমন্ত্রণ', 'members.inviteSub': 'সহযোগিতার জন্য আমন্ত্রণ পাঠান',
      'members.emailLabel': 'ইমেইল ঠিকানা', 'members.roleLabel': 'ভূমিকা',
      'members.pending': 'অপেক্ষমাণ', 'members.active': 'সক্রিয়', 'members.owner': 'মালিক', 'members.admin': 'অ্যাডমিন',
      'members.accountant': 'হিসাবরক্ষক', 'members.manager': 'ম্যানেজার', 'members.member': 'সদস্য', 'members.viewer': 'দর্শক',
      'members.invited': 'আমন্ত্রণ পাঠানো হয়েছে', 'members.removed': 'সদস্য সরানো হয়েছে', 'members.roleUpdated': 'ভূমিকা হালনাগাদ হয়েছে',
      'members.you': 'আপনি', 'members.noInvite': 'এই স্থানীয় ডেমোতে আমন্ত্রণ অনুকরণ করা হয়।',
      'role.owner': 'মালিক', 'role.admin': 'অ্যাডমিন', 'role.accountant': 'হিসাবরক্ষক', 'role.manager': 'ম্যানেজার',
      'role.member': 'সদস্য', 'role.viewer': 'দর্শক',
      'ws.personal': 'ব্যক্তিগত', 'ws.family': 'পরিবার', 'ws.business': 'ব্যবসা',
      'ws.personalDesc': 'ব্যক্তিগত আর্থিক বিষয়', 'ws.familyDesc': 'পরিবারের যৌথ অর্থ', 'ws.businessDesc': 'প্রতিষ্ঠানের হিসাব ও পরিচালনা',
      'ws.new': 'নতুন ওয়ার্কস্পেস', 'ws.switch': 'ওয়ার্কস্পেস পরিবর্তন', 'ws.name': 'ওয়ার্কস্পেসের নাম',
      'ws.created': 'ওয়ার্কস্পেস তৈরি হয়েছে', 'ws.type': 'ওয়ার্কস্পেসের ধরন',
      'auth.welcome': 'হিসাবপ্রো-তে স্বাগতম', 'auth.signinTitle': 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
      'auth.signinSub': 'আপনার আর্থিক বুদ্ধিমত্তার ওয়ার্কস্পেস প্রস্তুত।', 'auth.signupTitle': 'আপনার অ্যাকাউন্ট তৈরি করুন',
      'auth.signupSub': 'এক মিনিটেরও কম সময়ে প্রথম ওয়ার্কস্পেস সেট করুন।', 'auth.signin': 'সাইন ইন', 'auth.signup': 'অ্যাকাউন্ট তৈরি',
      'auth.name': 'পূর্ণ নাম', 'auth.email': 'ইমেইল ঠিকানা', 'auth.password': 'পাসওয়ার্ড', 'auth.firstWs': 'প্রথম ওয়ার্কস্পেস',
      'auth.language': 'ভাষা', 'auth.demo': 'নমুনা তথ্যসহ ডেমো দেখুন', 'auth.divider': 'অথবা সরাসরি দেখুন',
      'auth.note': 'ডেমো প্রমাণীকরণ। কোনো সার্ভার বা প্রকৃত ব্যাংক সংযোগ নেই।',
      'auth.demoName': 'রহিম আহমেদ', 'auth.demoEmail': 'rahim@hisabpro.app', 'auth.invalid': 'সঠিক ইমেইল এবং অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।',
      'auth.nameRequired': 'আপনার নাম লিখুন।', 'auth.welcomeBack': 'স্বাগতম',
      'toast.saved': 'সফলভাবে সংরক্ষিত', 'toast.deleted': 'মুছে ফেলা হয়েছে', 'toast.error': 'কিছু একটা সমস্যা হয়েছে',
      'toast.copied': 'ক্লিপবোর্ডে কপি হয়েছে', 'toast.offline': 'আপনি অফলাইনে। পরিবর্তন এই ডিভাইসে সংরক্ষিত।',
      'toast.online': 'আবার অনলাইনে। সব সংরক্ষিত হয়েছে।', 'toast.lang': 'ভাষা পরিবর্তন হয়েছে',
      'toast.theme': 'থিম হালনাগাদ হয়েছে', 'toast.ws': 'ওয়ার্কস্পেস পরিবর্তন হয়েছে',
      'empty.addFirst': 'প্রথম রেকর্ড যোগ করুন',
      'cat.food': 'খাবার ও মুদি', 'cat.transport': 'যাতায়াত', 'cat.housing': 'বাসস্থান ও ভাড়া',
      'cat.utilities': 'ইউটিলিটি', 'cat.health': 'স্বাস্থ্যসেবা', 'cat.education': 'শিক্ষা', 'cat.shopping': 'কেনাকাটা',
      'cat.entertainment': 'বিনোদন', 'cat.family': 'পরিবার', 'cat.business': 'ব্যবসা', 'cat.personal': 'ব্যক্তিগত',
      'cat.other': 'অন্যান্য', 'cat.salary': 'বেতন', 'cat.revenue': 'ব্যবসার আয়', 'cat.freelance': 'ফ্রিল্যান্সিং',
      'cat.investment': 'বিনিয়োগের মুনাফা', 'cat.rental': 'ভাড়া আয়', 'cat.gift': 'উপহার', 'cat.commission': 'কমিশন',
      'cat.interest': 'ঋণের সুদ', 'cat.savingscat': 'সঞ্চয় ও বিনিয়োগ',
      'range.today': 'আজ', 'range.yesterday': 'গতকাল', 'range.thisWeek': 'এই সপ্তাহ', 'range.lastWeek': 'গত সপ্তাহ',
      'range.thisMonth': 'এই মাস', 'range.lastMonth': 'গত মাস', 'range.thisYear': 'এই বছর', 'range.custom': 'কাস্টম'
    }
  };

  function lang() {
    return document.documentElement.getAttribute('data-lang') || 'en';
  }

  function t(key, vars) {
    const dict = STRINGS[lang()] || STRINGS.en;
    let value = dict[key] ?? STRINGS.en[key] ?? key;
    if (vars) {
      Object.keys(vars).forEach((k) => { value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
    }
    return value;
  }

  function locale() {
    return lang() === 'bn' ? 'bn-BD' : 'en-IN';
  }

  function money(value, opts = {}) {
    const n = Number(value) || 0;
    const decimals = opts.decimals ?? 0;
    const abs = Math.abs(n);
    let formatted;
    try {
      formatted = new Intl.NumberFormat(locale(), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(abs);
    } catch (e) {
      formatted = abs.toFixed(decimals);
    }
    return (n < 0 ? '−' : '') + '৳' + formatted;
  }

  function moneyCompact(value) {
    const n = Number(value) || 0;
    try {
      const formatted = new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(Math.abs(n));
      return (n < 0 ? '−' : '') + '৳' + formatted;
    } catch (e) {
      return money(n);
    }
  }

  function number(value, decimals = 0) {
    try {
      return new Intl.NumberFormat(locale(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(value) || 0);
    } catch (e) { return String(value); }
  }

  function pct(value, decimals = 0) {
    return number(value, decimals) + '%';
  }

  function parseDate(iso) {
    if (!iso) return new Date();
    if (iso instanceof Date) return iso;
    const parts = String(iso).slice(0, 10).split('-').map(Number);
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    return new Date(iso);
  }

  function date(iso, style = 'medium') {
    const d = parseDate(iso);
    const options = style === 'short'
      ? { day: 'numeric', month: 'short' }
      : style === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' };
    try { return new Intl.DateTimeFormat(locale(), options).format(d); } catch (e) { return d.toLocaleDateString(); }
  }

  function monthLabel(iso, style = 'short') {
    const d = parseDate(iso);
    const options = style === 'long' ? { month: 'long', year: 'numeric' } : { month: 'short' };
    try { return new Intl.DateTimeFormat(locale(), options).format(d); } catch (e) { return d.toLocaleDateString(); }
  }

  function weekdayShort(iso) {
    try { return new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(parseDate(iso)); } catch (e) { return ''; }
  }

  function weekdayLong(iso) {
    try { return new Intl.DateTimeFormat(locale(), { weekday: 'long' }).format(parseDate(iso)); } catch (e) { return ''; }
  }

  function relativeDay(iso) {
    const d = parseDate(iso); d.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return t('common.today');
    if (diff === -1) return t('common.yesterday');
    if (diff === 1) return lang() === 'bn' ? 'আগামীকাল' : 'Tomorrow';
    return date(iso, 'short');
  }

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  global.HisabI18n = { STRINGS, t, lang, locale, money, moneyCompact, number, pct, parseDate, date, monthLabel, weekdayShort, weekdayLong, relativeDay, escapeHtml };
  global.t = t;
  global.money = money;
  global.moneyCompact = moneyCompact;
  global.num = number;
  global.pct = pct;
  global.fmtDate = date;
  global.monthLabel = monthLabel;
  global.escapeHtml = escapeHtml;
})(window);
