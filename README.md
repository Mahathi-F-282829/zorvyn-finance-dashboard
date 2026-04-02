# Zorvyn Finance Dashboard

A frontend-only financial activity dashboard built for the assignment scenario. The project focuses on UI decisions, component structure, state handling, and clear presentation of summary, transactions, and lightweight insights without any backend dependency.

## Live links

- Repository: https://github.com/Mahathi-F-282829/zorvyn-finance-dashboard
- Deployment: https://zorvyn-finance-dashboard-zeta.vercel.app

## Why this fits the assignment

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

This was intentionally built without a framework so it can run immediately in any modern browser while still showing clear component separation and state management.

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

### Option 3

Use any static server extension or local server tool that serves the folder root.

## Feature notes

### Role-based UI

- `Viewer`: read-only access to summary, insights, and transactions.
- `Admin`: can add transactions and edit descriptions inline.

### State management

The app uses a simple store in [`src/store.js`](/Users/mahathigarapati/Desktop/Zorvyn/src/store.js) to keep:

- selected role
- selected theme
- transaction data
- active filters
- loading state for the mock API flow

State changes trigger a full re-render and are saved in `localStorage`.

### Design decisions

- Warm neutral base with bright accent colors to keep the dashboard readable but less generic than default fintech UI.
- Strong typography pairing with `Space Grotesk` for headings and `Manrope` for body content.
- Responsive stacked layouts for tablets and phones.
- Simple motion on the categorical chart and buttons for a more polished feel.

### Optional enhancements implemented

- Dark mode
- Data persistence with `localStorage`
- Mock API integration through a delayed demo fetch
- Animations and transitions
- Export as CSV or JSON
- Advanced filtering with date range plus transaction grouping

## Submission guidance

If you submit this project, include:

- a short overview of the scenario and what you focused on
- mention that the app is frontend-only and uses mock data
- highlight the role switcher, transaction filtering, and insights section
- add a repository link and, if possible, a deployment link from GitHub Pages, Netlify, or Vercel

## Possible extensions

- dark mode toggle
- CSV export
- category grouping
- modal-based edit flow
- mock API layer
