export function renderRoleSwitcher(container, state, store) {
  container.innerHTML = `
    <div class="panel role-panel">
      <div>
        <h2>Current mode</h2>
      </div>
      <label class="role-select">
        <select data-role-select>
          <option value="admin" ${state.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="viewer" ${state.role === "viewer" ? "selected" : ""}>Viewer</option>
        </select>
      </label>
    </div>
  `;

  container.querySelector("[data-role-select]").addEventListener("change", (event) => {
    store.setRole(event.target.value);
  });
}
