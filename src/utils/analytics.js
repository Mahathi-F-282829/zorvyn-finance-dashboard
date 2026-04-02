export function sortByDateDescending(transactions) {
  return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getOverviewMetrics(transactions) {
  const totals = transactions.reduce(
    (acc, item) => {
      if (item.type === "income") {
        acc.income += item.amount;
      } else {
        acc.expenses += item.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return {
    income: totals.income,
    expenses: totals.expenses,
    balance: totals.income - totals.expenses,
  };
}

export function getCategoryBreakdown(transactions) {
  const expenseTotals = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  const total = Object.values(expenseTotals).reduce((sum, amount) => sum + amount, 0);

  return Object.entries(expenseTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      share: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getTrendData(transactions) {
  const ordered = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningBalance = 0;

  return ordered.map((item) => {
    runningBalance += item.type === "income" ? item.amount : -item.amount;
    return {
      date: item.date,
      balance: runningBalance,
    };
  });
}

export function getInsights(transactions) {
  const categoryBreakdown = getCategoryBreakdown(transactions);
  const topCategory = categoryBreakdown[0];

  const currentMonth = "2026-04";
  const previousMonth = "2026-03";

  const byMonth = transactions.reduce((acc, item) => {
    const monthKey = item.date.slice(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0 };
    }
    acc[monthKey][item.type === "income" ? "income" : "expenses"] += item.amount;
    return acc;
  }, {});

  const thisMonth = byMonth[currentMonth] || { income: 0, expenses: 0 };
  const lastMonth = byMonth[previousMonth] || { income: 0, expenses: 0 };
  const expenseDelta = thisMonth.expenses - lastMonth.expenses;

  const largestExpense = transactions
    .filter((item) => item.type === "expense")
    .sort((a, b) => b.amount - a.amount)[0];

  return [
    {
      title: "Top spending category",
      value: topCategory ? topCategory.category : "No expenses",
      description: topCategory
        ? `${topCategory.share}% of all expenses are in ${topCategory.category}.`
        : "Add expense records to surface category insights.",
      tone: "warm",
    },
    {
      title: "Monthly comparison",
      value:
        expenseDelta === 0
          ? "Flat month"
          : expenseDelta > 0
            ? `+${expenseDelta.toLocaleString("en-IN")}`
            : `${expenseDelta.toLocaleString("en-IN")}`,
      description: `April expenses are ${
        expenseDelta > 0 ? "higher" : expenseDelta < 0 ? "lower" : "unchanged"
      } compared with March.`,
      tone: expenseDelta > 0 ? "alert" : "cool",
    },
    {
      title: "Largest single expense",
      value: largestExpense ? largestExpense.category : "No data",
      description: largestExpense
        ? `${largestExpense.description} is the biggest outflow in the dataset.`
        : "No expenses available yet.",
      tone: "neutral",
    },
  ];
}

export function getFilteredTransactions(transactions, filters) {
  const query = filters.search.trim().toLowerCase();

  return transactions
    .filter((item) => {
      const matchesType = filters.type === "all" || item.type === filters.type;
      const matchesCategory =
        filters.category === "all" || item.category === filters.category;
      const matchesDateFrom = !filters.dateFrom || item.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || item.date <= filters.dateTo;
      const matchesQuery =
        !query ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesType && matchesCategory && matchesDateFrom && matchesDateTo && matchesQuery;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "date-desc":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
}

export function getCategories(transactions) {
  return [...new Set(transactions.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function groupTransactions(transactions, groupBy) {
  if (groupBy === "none") {
    return [{ label: "All transactions", items: transactions }];
  }

  const groups = transactions.reduce((acc, item) => {
    let key = "";

    if (groupBy === "category") {
      key = item.category;
    } else if (groupBy === "month") {
      key = new Date(item.date).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return Object.entries(groups).map(([label, items]) => ({
    label,
    items,
  }));
}
