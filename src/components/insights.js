import { getInsights } from "../utils/analytics.js";

export function renderInsights(container, state) {
  if (state.loading && !state.transactions.length) {
    container.innerHTML = `
      <div class="section-heading">
        <div>
          <h2>Insights</h2>
        </div>
      </div>
      <div class="panel empty-state loading-state">
        <h3>Loading insights</h3>
      </div>
    `;
    return;
  }

  const insights = getInsights(state.transactions);

  container.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Insights</h2>
      </div>
    </div>
    <div class="insight-grid">
      ${insights
        .map(
          (item) => `
            <article class="panel insight-card tone-${item.tone}">
              <p class="panel-label">${item.title}</p>
              <h3>${item.value}</h3>
              <p>${item.description}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}
