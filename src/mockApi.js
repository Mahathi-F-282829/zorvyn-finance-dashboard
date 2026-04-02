import { seedTransactions } from "./data/transactions.js";

const MOCK_DELAY_MS = 650;

export function fetchTransactions() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(structuredClone(seedTransactions));
    }, MOCK_DELAY_MS);
  });
}
