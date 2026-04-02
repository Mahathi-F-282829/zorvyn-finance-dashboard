import {
  getCategories,
  getFilteredTransactions,
  groupTransactions,
} from "../utils/analytics.js";
import {
  formatCurrency,
  formatLongDate,
  titleCase,
} from "../utils/formatters.js";
import {
  exportTransactionsAsCsv,
  exportTransactionsAsJson,
} from "../utils/exporters.js";

function createEmptyState() {
  return `
    <div class="empty-state">
      <h3>No matching transactions</h3>
      <p>Try clearing a filter or search term to see more activity.</p>
    </div>
  `;
}

function createLoadingState() {
  return `
    <div class="empty-state loading-state">
      <h3>Loading transactions</h3>
      <p>Pulling demo data from the mock API.</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function createFormMarkup(categories) {
  return `
    <form class="transaction-form" data-transaction-form>
      <div class="form-row">
        <label>
          <span>Description</span>
          <input name="description" required placeholder="Add a short note" />
        </label>
        <label>
          <span>Amount</span>
          <input name="amount" type="number" min="1" required placeholder="1500" />
        </label>
      </div>
      <div class="form-row">
        <label>
          <span>Date</span>
          <input name="date" type="date" required />
        </label>
        <label>
          <span>Type</span>
          <select name="type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <input name="category" list="category-options" required placeholder="Travel, Salary..." />
          <datalist id="category-options">
            ${categories.map((category) => `<option value="${category}"></option>`).join("")}
          </datalist>
        </label>
      </div>
      <button type="submit" class="primary-button">Add transaction</button>
    </form>
  `;
}

function createGroupedRows(groups, state) {
  return groups
    .map(
      (group) => `
        ${state.filters.groupBy !== "none"
          ? `<tr class="group-row">
                <td colspan="${state.role === "admin" ? 6 : 5}">
                  <div class="group-heading">
                    <strong>${group.label}</strong>
                    <span>${group.items.length} item${group.items.length === 1 ? "" : "s"}</span>
                  </div>
                </td>
              </tr>`
          : ""
        }
        ${group.items
          .map(
            (item) => `
              <tr>
                <td>
                  ${state.role === "admin"
                ? `<input
                          class="inline-edit date-input"
                          data-edit-id="${item.id}"
                          data-field="date"
                          type="date"
                          value="${item.date}"
                        />`
                : formatLongDate(item.date)
              }
                </td>
                <td>
                  ${state.role === "admin"
                ? `<input
                          class="inline-edit"
                          data-edit-id="${item.id}"
                          data-field="description"
                          value="${escapeHtml(item.description)}"
                        />`
                : `<span>${item.description}</span>`
              }
                </td>
                <td>
                  ${state.role === "admin"
                ? `<input
                          class="inline-edit category-input"
                          data-edit-id="${item.id}"
                          data-field="category"
                          value="${escapeHtml(item.category)}"
                        />`
                : item.category
              }
                </td>
                <td>
                  ${state.role === "admin"
                ? `<select class="inline-edit type-input" data-edit-id="${item.id}" data-field="type">
                          <option value="income" ${item.type === "income" ? "selected" : ""}>Income</option>
                          <option value="expense" ${item.type === "expense" ? "selected" : ""}>Expense</option>
                        </select>`
                : `<span class="chip ${item.type === "income" ? "positive" : "negative"}">${titleCase(item.type)}</span>`
              }
                </td>
                <td class="${item.type === "income" ? "amount-positive" : "amount-negative"}">
                  ${state.role === "admin"
                ? `<input
                          class="inline-edit amount-input ${item.type === "income" ? "tone-income" : "tone-expense"}"
                          data-edit-id="${item.id}"
                          data-field="amount"
                          type="number"
                          min="1"
                          value="${item.amount}"
                        />`
                : `${item.type === "income" ? "+" : "-"}${formatCurrency(item.amount)}`
              }
                </td>
                ${state.role === "admin"
                ? `<td>
                        <button
                          class="danger-button icon-button"
                          data-delete-id="${item.id}"
                          type="button"
                          aria-label="Delete transaction"
                          title="Delete transaction"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </td>`
                : ""
              }
              </tr>
            `
          )
          .join("")}
      `
    )
    .join("");
}

export function renderTransactions(container, state, store) {
  const categories = getCategories(state.transactions);
  const filtered = getFilteredTransactions(state.transactions, state.filters);
  const grouped = groupTransactions(filtered, state.filters.groupBy);

  container.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Transactions</h2>
      </div>
    </div>

    <div class="panel toolbar-panel">
      <div class="toolbar-actions">
        <button class="secondary-button" type="button" data-export="csv">Export CSV</button>
        <button class="secondary-button" type="button" data-export="json">Export JSON</button>
      </div>
      <div class="toolbar-grid">
        <label>
          <span>Search</span>
          <input data-filter="search" value="${state.filters.search}" placeholder="Search description or category" />
        </label>
        <label>
          <span>Type</span>
          <select data-filter="type">
            <option value="all" ${state.filters.type === "all" ? "selected" : ""}>All</option>
            <option value="income" ${state.filters.type === "income" ? "selected" : ""}>Income</option>
            <option value="expense" ${state.filters.type === "expense" ? "selected" : ""}>Expense</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select data-filter="category">
            <option value="all" ${state.filters.category === "all" ? "selected" : ""}>All categories</option>
            ${categories
      .map(
        (category) => `
                  <option value="${category}" ${state.filters.category === category ? "selected" : ""}>
                    ${category}
                  </option>
                `
      )
      .join("")}
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select data-filter="sortBy">
            <option value="date-desc" ${state.filters.sortBy === "date-desc" ? "selected" : ""}>Newest first</option>
            <option value="date-asc" ${state.filters.sortBy === "date-asc" ? "selected" : ""}>Oldest first</option>
            <option value="amount-desc" ${state.filters.sortBy === "amount-desc" ? "selected" : ""}>Highest amount</option>
            <option value="amount-asc" ${state.filters.sortBy === "amount-asc" ? "selected" : ""}>Lowest amount</option>
          </select>
        </label>
        <label>
          <span>Date from</span>
          <input data-filter="dateFrom" type="date" value="${state.filters.dateFrom}" />
        </label>
        <label>
          <span>Date to</span>
          <input data-filter="dateTo" type="date" value="${state.filters.dateTo}" />
        </label>
        <label>
          <span>Group by</span>
          <select data-filter="groupBy">
            <option value="none" ${state.filters.groupBy === "none" ? "selected" : ""}>None</option>
            <option value="category" ${state.filters.groupBy === "category" ? "selected" : ""}>Category</option>
            <option value="month" ${state.filters.groupBy === "month" ? "selected" : ""}>Month</option>
          </select>
        </label>
      </div>
    </div>

    ${state.role === "admin"
      ? `<div class="panel admin-panel">
            <div class="admin-panel-copy">
              <h3>Add a new transaction</h3>
            </div>
            ${createFormMarkup(categories)}
          </div>`
      : `<div class="panel viewer-note">
            <p class="panel-label">Viewer mode</p>
            <p>Creation and editing controls are hidden for the viewer.</p>
          </div>`
    }

    <div class="panel table-panel">
      ${state.loading
      ? createLoadingState()
      : filtered.length
        ? `<div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    ${state.role === "admin" ? "<th>Actions</th>" : ""}
                  </tr>
                </thead>
                <tbody>
                  ${createGroupedRows(grouped, state)}
                </tbody>
              </table>
            </div>`
        : createEmptyState()
    }
    </div>
  `;

  container.querySelectorAll("[data-filter]").forEach((element) => {
    element.addEventListener("input", (event) => {
      const key = event.target.dataset.filter;
      store.updateFilters({ [key]: event.target.value });
    });
    element.addEventListener("change", (event) => {
      const key = event.target.dataset.filter;
      store.updateFilters({ [key]: event.target.value });
    });
  });

  container.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.currentTarget.dataset.export === "csv") {
        exportTransactionsAsCsv(filtered);
        return;
      }
      exportTransactionsAsJson(filtered);
    });
  });

  if (state.role === "admin") {
    const form = container.querySelector("[data-transaction-form]");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      store.addTransaction({
        id: `txn-${Date.now()}`,
        description: formData.get("description"),
        amount: Number(formData.get("amount")),
        date: formData.get("date"),
        category: formData.get("category"),
        type: formData.get("type"),
      });
      form.reset();
    });

    container.querySelectorAll("[data-edit-id]").forEach((input) => {
      if (input.dataset.field === "type") {
        input.classList.toggle("tone-income", input.value === "income");
        input.classList.toggle("tone-expense", input.value === "expense");
      }
      input.addEventListener("change", (event) => {
        const field = event.target.dataset.field;
        const nextValue = field === "amount" ? Number(event.target.value) : event.target.value;
        store.updateTransaction(event.target.dataset.editId, {
          [field]: nextValue,
        });
      });
    });

    container.querySelectorAll("[data-delete-id]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = event.currentTarget.dataset.deleteId;
        if (window.confirm("Delete this transaction?")) {
          store.deleteTransaction(id);
        }
      });
    });
  }
}
