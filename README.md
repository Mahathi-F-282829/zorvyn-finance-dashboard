# Zorvyn Finance Dashboard

A frontend-only financial activity dashboard built for the assignment scenario. The project focuses on UI decisions, component structure, state handling, and clear presentation of summary, transactions, and lightweight insights without any backend dependency.

## Live links

- Repository: https://github.com/Mahathi-F-282829/zorvyn-finance-dashboard
- Deployment: https://zorvyn-finance-dashboard-zeta.vercel.app

## Features of this Dashboard

- Dashboard overview includes summary cards for total balance, income, and expenses.
- Includes one time-based visualization: balance trend line chart.
- Includes one categorical visualization: spending breakdown donut chart.
- Transactions section supports search, filtering, and sorting.
- Simulates role-based UI on the frontend with `Admin` and `Viewer` modes.
- Insights section highlights top spending category, monthly comparison, and the largest expense.
- Uses a small centralized store to manage transactions, filters, and selected role.
- Handles empty transaction results gracefully.
- Works on desktop and mobile layouts.
- Persists demo state in `localStorage`.
- Includes dark mode with persistence.
- Includes mock API-style loading for demo data.
- Supports CSV and JSON export.
- Supports advanced filters with date range and grouping by category or month.
- Adds subtle motion and transitions across the interface.

## Tech approach

- Plain HTML, CSS, and JavaScript modules
- No backend
- No external chart library
- Mock transaction data with browser persistence

## Project structure

```text
.
├── index.html
├── styles.css
└── src
    ├── components
    │   ├── insights.js
    │   ├── roleSwitcher.js
    │   ├── summary.js
    │   └── transactions.js
    ├── data
    │   └── transactions.js
    ├── utils
    │   ├── analytics.js
    │   └── formatters.js
    ├── main.js
    └── store.js
```

## Run locally

Because this uses ES modules, serve the folder with a local static server.

### Option 1

```bash
cd /Users/mahathigarapati/Desktop/Zorvyn
npm run serve
```

### Option 2

```bash
cd /Users/mahathigarapati/Desktop/Zorvyn
python3 -m http.server 4173
```

Then open `http://localhost:4173`.


