# HisabPro — BDT-first personal & family finance PWA

A responsive, bilingual (English / বাংলা), offline-capable finance dashboard built from the
`HisabPro_Complete_Product_Blueprint.docx` product specification. No backend or build step is
required: it is a static Progressive Web App that keeps all data in the browser.

## Live app

**https://hisabpro.pages.dev**

Hosted on Cloudflare Pages. Every push to the `main` branch deploys automatically.
Use **“Try the demo with sample data”** on the sign-in screen to explore it.

## Run it

1. Double-click **`serve.bat`** (uses Python's built-in HTTP server).
2. Open <http://127.0.0.1:8080> if the browser does not open automatically.
3. Click **“Try the demo with sample data”** to explore three populated workspaces.

You can also serve the folder manually:

```powershell
cd hisabpro
python -m http.server 8080 --bind 127.0.0.1
```

> Opening `index.html` directly from disk works for basic testing, but the service worker
> (offline mode / install prompt) only runs over `http://localhost` or HTTPS.

### Test on a phone (same Wi-Fi)

```powershell
cd hisabpro
python -m http.server 8080 --bind 0.0.0.0
```

Find your PC's local IP (for example `192.168.0.12`) and open `http://192.168.0.12:8080` on the
phone. The responsive layout works in the mobile browser. Installing it as a PWA from a LAN address
requires HTTPS; `localhost` on the PC is treated as a secure context automatically.

## Deploy on Cloudflare Pages

This repository is already connected to Cloudflare Pages through the GitHub integration:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | *(empty — no build step)* |
| Build output directory | repository root |

To publish an update, commit and push to `main`. Cloudflare Pages builds and deploys it
automatically. No API token or GitHub Actions workflow is required.

## Install as an app

- **Desktop (Chrome/Edge):** click the install icon in the address bar.
- **Android / iPhone:** open the browser menu and choose **Add to Home Screen** / **Install app**.

## What is included

- **Workspaces:** Personal, Family, Business — each with isolated accounts, transactions, budgets,
  goals, debts, recurring rules and members.
- **Dashboard:** total balance, income, expenses, net savings, cash-flow chart, category donut,
  budget health, recent activity, upcoming bills and local insight cards.
- **Money:** income / expense / account-to-account transfers, search, filters, accounts & wallets,
  category budgets with alerts, savings goals and contributions.
- **Planning:** debts and loans with principal/interest payment history, recurring income/expense
  rules with posting, and a financial calendar.
- **Reports & analytics:** monthly overview, category, account, cash-flow, P&L and budget reports;
  CSV export and print-friendly layout.
- **AI assistant:** a local, rule-based assistant that answers questions from your own records.
  It is explicitly labelled as estimates/drafts and never calls an external API.
- **Settings:** light/dark/system theme, English/Bengali, notification preferences, members & roles,
  JSON backup/restore/reset, CSV export and PWA install guidance.

## Data & privacy

- All data is stored in this browser's `localStorage`; nothing is uploaded.
- Use **Settings → Data & privacy → Export data** for a JSON backup before clearing browser data.
- A service worker caches the app shell so the interface keeps working offline after the first load.
- Demo authentication is local-only. It does not connect to a bank or a server.

## Project structure

```
hisabpro/
├─ index.html              app shell, auth screen, SVG icon sprite
├─ serve.bat               one-click local server
├─ manifest.webmanifest    PWA manifest and shortcuts
├─ sw.js                   offline app-shell cache
├─ css/
│  ├─ styles.css           design system, components and responsive rules
│  └─ print.css            print-friendly report styles
├─ js/
│  ├─ i18n.js              English/Bengali strings and BDT formatters
│  ├─ seed.js              deterministic demo data for 3 workspaces
│  ├─ core.js              state, calculations, charts, routing, chrome
│  ├─ views.js             all page renders
│  └─ actions.js           event handling, forms, CRUD, assistant, export
└─ assets/icons/           PWA icons
```

## Updating the app

When you edit CSS or JavaScript, bump the `?v=` query on the asset links in `index.html` and the
`VERSION` constant in `sw.js`. That prevents browsers and the service worker from serving stale
assets after an update.

## Notes and limitations

- This is a planning-stage product demo, not a production accounting system.
- Data is per browser/device. There is no multi-device sync or real authentication.
- The assistant is a deterministic local rule engine, not a hosted language model.
- Savings contributions are recorded as transfers to **Savings Reserve**, never as expenses.
- Loan principal repayment reduces the outstanding liability; the interest portion is recorded as
  an expense, following the blueprint's accounting rule.
