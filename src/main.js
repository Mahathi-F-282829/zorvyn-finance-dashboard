import { renderInsights } from "./components/insights.js";
import { renderRoleSwitcher } from "./components/roleSwitcher.js";
import { renderSummary } from "./components/summary.js";
import { renderTransactions } from "./components/transactions.js";
import { createStore } from "./store.js";

const store = createStore();

const elements = {
  themeToggle: document.querySelector("#theme-toggle"),
  roleSwitcher: document.querySelector("#role-switcher"),
  summary: document.querySelector("#summary-section"),
  insights: document.querySelector("#insights-section"),
  transactions: document.querySelector("#transactions-section"),
};

function renderThemeToggle(container, state, store) {
  container.innerHTML = `
    <button
      class="theme-icon-button"
      type="button"
      data-theme-toggle
      aria-label="${state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}"
      title="${state.theme === "dark" ? "Light mode" : "Dark mode"}"
    >
      ${
        state.theme === "dark"
          ? `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>`
          : `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>`
      }
    </button>
  `;

  container.querySelector("[data-theme-toggle]").addEventListener("click", () => {
    store.setTheme(state.theme === "dark" ? "light" : "dark");
  });
}

function renderApp(state) {
  document.documentElement.dataset.theme = state.theme;
  renderThemeToggle(elements.themeToggle, state, store);
  renderRoleSwitcher(elements.roleSwitcher, state, store);
  renderSummary(elements.summary, state);
  renderInsights(elements.insights, state);
  renderTransactions(elements.transactions, state, store);
}

store.subscribe(renderApp);
store.initialize();
renderApp(store.getState());
