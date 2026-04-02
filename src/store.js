import { seedTransactions } from "./data/transactions.js";
import { fetchTransactions } from "./mockApi.js";

const STORAGE_KEY = "zorvyn-finance-dashboard-state";

const defaultState = {
  role: "admin",
  theme: "light",
  loading: false,
  initialized: false,
  filters: {
    search: "",
    type: "all",
    category: "all",
    sortBy: "date-desc",
    dateFrom: "",
    dateTo: "",
    groupBy: "none",
  },
  transactions: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      filters: { ...defaultState.filters, ...parsed.filters },
      transactions: parsed.transactions || [],
    };
  } catch {
    return defaultState;
  }
}

export function createStore() {
  let state = loadState();
  const listeners = new Set();

  function notify() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    listeners.forEach((listener) => listener(state));
  }

  return {
    getState() {
      return state;
    },
    async initialize() {
      if (state.initialized) {
        return;
      }

      if (state.transactions?.length) {
        state = {
          ...state,
          initialized: true,
        };
        notify();
        return;
      }

      state = {
        ...state,
        loading: true,
      };
      notify();

      const transactions = await fetchTransactions();
      state = {
        ...state,
        transactions,
        loading: false,
        initialized: true,
      };
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setRole(role) {
      state = { ...state, role };
      notify();
    },
    updateFilters(partialFilters) {
      state = {
        ...state,
        filters: {
          ...state.filters,
          ...partialFilters,
        },
      };
      notify();
    },
    setTheme(theme) {
      state = { ...state, theme };
      notify();
    },
    addTransaction(transaction) {
      state = {
        ...state,
        transactions: [transaction, ...state.transactions],
      };
      notify();
    },
    updateTransaction(id, updates) {
      state = {
        ...state,
        transactions: state.transactions.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      };
      notify();
    },
    deleteTransaction(id) {
      state = {
        ...state,
        transactions: state.transactions.filter((item) => item.id !== id),
      };
      notify();
    },
    async reloadDemoData() {
      state = {
        ...state,
        loading: true,
      };
      notify();

      const transactions = await fetchTransactions();
      state = {
        ...state,
        transactions,
        loading: false,
        initialized: true,
      };
      notify();
    },
    resetTransactions() {
      state = {
        ...state,
        transactions: structuredClone(seedTransactions),
      };
      notify();
    },
  };
}
