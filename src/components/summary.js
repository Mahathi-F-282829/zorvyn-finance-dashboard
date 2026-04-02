import {
  getCategoryBreakdown,
  getOverviewMetrics,
  getTrendData,
} from "../utils/analytics.js";
import { formatCurrency, formatMonthDay } from "../utils/formatters.js";

function getTrendScale(points, width, height, padding) {
  const values = points.map((item) => item.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return {
    min,
    max,
    range,
    getX(index) {
      return padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    },
    getY(value) {
      return height - padding - ((value - min) / range) * (height - padding * 2);
    },
  };
}

function buildTrendPath(points, scale) {
  if (!points.length) {
    return "";
  }

  return points
    .map((point, index) => {
      const x = scale.getX(index);
      const y = scale.getY(point.balance);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildTrendArea(points, scale, width, height, padding) {
  if (!points.length) {
    return "";
  }

  const line = buildTrendPath(points, scale);
  const lastX = scale.getX(points.length - 1);
  const firstX = scale.getX(0);

  return `${line} L ${lastX.toFixed(2)} ${(height - padding).toFixed(2)} L ${firstX.toFixed(2)} ${(height - padding).toFixed(2)} Z`;
}

function createTrendChart(trendData) {
  if (!trendData.length) {
    return `<div class="empty-inline">No trend data available.</div>`;
  }

  const width = 560;
  const height = 240;
  const padding = 28;
  const scale = getTrendScale(trendData, width, height, padding);
  const path = buildTrendPath(trendData, scale);
  const areaPath = buildTrendArea(trendData, scale, width, height, padding);
  const lastPoint = trendData[trendData.length - 1];
  const firstPoint = trendData[0];
  const peakPoint = trendData.reduce((best, point) =>
    point.balance > best.balance ? point : best
  );
  const lowPoint = trendData.reduce((best, point) =>
    point.balance < best.balance ? point : best
  );
  const midValue = scale.min + scale.range / 2;
  const netChange = lastPoint.balance - firstPoint.balance;
  const guideValues = [scale.max, midValue, scale.min];

  return `
    <div class="chart-shell trend-shell">
      <div class="chart-header">
        <div>
          <h3>Balance trend</h3>
        </div>
        <span class="chart-badge">Current ${formatCurrency(lastPoint.balance)}</span>
      </div>
      <div class="trend-plot">
        <div class="trend-axis-labels">
          ${guideValues
            .map((value) => `<span>${formatCurrency(Math.round(value))}</span>`)
            .join("")}
        </div>
        <svg viewBox="0 0 ${width} ${height}" class="trend-chart" aria-label="Balance trend line chart">
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#00c2a8" />
            <stop offset="100%" stop-color="#ff8a5b" />
          </linearGradient>
          <linearGradient id="trendAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0a7cff" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#0a7cff" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        ${guideValues
          .map(
            (value) => `
              <line
                x1="${padding}"
                y1="${scale.getY(value).toFixed(2)}"
                x2="${width - padding}"
                y2="${scale.getY(value).toFixed(2)}"
                class="trend-guide"
              />
            `
          )
          .join("")}
        <path d="${areaPath}" fill="url(#trendAreaGradient)" />
        <path d="${path}" fill="none" stroke="url(#trendGradient)" stroke-width="4" stroke-linecap="round" />
        ${trendData
          .map(
            (point, index) => `
              <circle
                cx="${scale.getX(index).toFixed(2)}"
                cy="${scale.getY(point.balance).toFixed(2)}"
                r="${index === trendData.length - 1 ? 5 : 3.5}"
                class="trend-point"
              >
                <title>${formatMonthDay(point.date)}: ${formatCurrency(point.balance)}</title>
              </circle>
            `
          )
          .join("")}
        </svg>
      </div>
      <div class="trend-labels">
        <span>${formatMonthDay(trendData[0].date)}</span>
        <span>${formatMonthDay(lastPoint.date)}</span>
      </div>
      <div class="trend-stats">
        <div class="trend-stat">
          <span>Start</span>
          <strong>${formatCurrency(firstPoint.balance)}</strong>
        </div>
        <div class="trend-stat">
          <span>Peak</span>
          <strong>${formatCurrency(peakPoint.balance)}</strong>
          <small>${formatMonthDay(peakPoint.date)}</small>
        </div>
        <div class="trend-stat">
          <span>Lowest</span>
          <strong>${formatCurrency(lowPoint.balance)}</strong>
          <small>${formatMonthDay(lowPoint.date)}</small>
        </div>
        <div class="trend-stat">
          <span>Net change</span>
          <strong class="${netChange >= 0 ? "stat-positive" : "stat-negative"}">
            ${netChange >= 0 ? "+" : ""}${formatCurrency(netChange)}
          </strong>
        </div>
      </div>
    </div>
  `;
}

function createBreakdownChart(categories) {
  const topFive = categories.slice(0, 5);
  const gradient = topFive
    .map((item, index) => {
      const colors = ["#ff8a5b", "#ffb347", "#00c2a8", "#0a7cff", "#7c5cff"];
      return `${colors[index]} ${index === 0 ? 0 : topFive
        .slice(0, index)
        .reduce((sum, entry) => sum + entry.share, 0)}% ${topFive
        .slice(0, index + 1)
        .reduce((sum, entry) => sum + entry.share, 0)}%`;
    })
    .join(", ");

  if (!topFive.length) {
    return `<div class="empty-inline">No expense categories available.</div>`;
  }

  return `
    <div class="chart-shell breakdown-shell">
      <div class="chart-header">
        <div>
          <h3>Spending breakdown</h3>
        </div>
      </div>
      <div class="breakdown-layout single-column">
        <div class="breakdown-visual">
          <div class="donut-chart xlarge" style="background: conic-gradient(${gradient})">
            <div class="donut-hole">
              <span>Top ${topFive.length}</span>
              <strong>Categories</strong>
            </div>
          </div>
        </div>
      </div>
      <div class="category-strip">
        ${topFive
          .map(
            (item, index) => `
              <div class="category-pill">
                <span class="legend-dot color-${index + 1}"></span>
                <div class="category-pill-copy">
                  <strong>${item.category}</strong>
                  <small>${formatCurrency(item.amount)}</small>
                </div>
                <span>${item.share}%</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

export function renderSummary(container, state) {
  if (state.loading && !state.transactions.length) {
    container.innerHTML = `
      <div class="summary-grid">
        <article class="panel metric-card"><h2>Loading...</h2></article>
        <article class="panel metric-card"><h2>Loading...</h2></article>
        <article class="panel metric-card"><h2>Loading...</h2></article>
      </div>
      <div class="viz-grid">
        <article class="panel chart-panel">
          <div class="empty-state loading-state">
            <h3>Loading overview</h3>
          </div>
        </article>
        <article class="panel chart-panel">
          <div class="empty-state loading-state">
            <h3>Loading breakdown</h3>
          </div>
        </article>
      </div>
    `;
    return;
  }

  const metrics = getOverviewMetrics(state.transactions);
  const breakdown = getCategoryBreakdown(state.transactions);
  const trendData = getTrendData(state.transactions);

  container.innerHTML = `
    <div class="summary-grid">
      <article class="panel metric-card balance">
        <p class="panel-label">Total balance</p>
        <h2>${formatCurrency(metrics.balance)}</h2>
        <span class="chip positive">Net position</span>
      </article>
      <article class="panel metric-card">
        <p class="panel-label">Income</p>
        <h2>${formatCurrency(metrics.income)}</h2>
        <span class="chip positive">Cash in</span>
      </article>
      <article class="panel metric-card">
        <p class="panel-label">Expenses</p>
        <h2>${formatCurrency(metrics.expenses)}</h2>
        <span class="chip negative">Cash out</span>
      </article>
    </div>

    <div class="viz-grid">
      <article class="panel chart-panel">
        ${createTrendChart(trendData)}
      </article>
      <article class="panel chart-panel">
        ${createBreakdownChart(breakdown)}
      </article>
    </div>
  `;
}
