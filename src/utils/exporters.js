function escapeCsv(value) {
  const safeValue = String(value ?? "");
  if (safeValue.includes(",") || safeValue.includes('"') || safeValue.includes("\n")) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsAsCsv(transactions) {
  const header = ["Date", "Description", "Category", "Type", "Amount"];
  const rows = transactions.map((item) => [
    item.date,
    item.description,
    item.category,
    item.type,
    item.amount,
  ]);
  const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadBlob("transactions-export.csv", csv, "text/csv;charset=utf-8");
}

export function exportTransactionsAsJson(transactions) {
  downloadBlob(
    "transactions-export.json",
    JSON.stringify(transactions, null, 2),
    "application/json;charset=utf-8"
  );
}
