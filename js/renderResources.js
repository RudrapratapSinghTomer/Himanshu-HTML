function renderResources() {
  const container = document.getElementById('resource-grid');
  const filterBar = document.getElementById('resource-filter');
  if (!container || !filterBar) return;

  const domains = ['All', ...new Set(RESOURCES_DB.map(r => r.domain))];
  filterBar.innerHTML = domains.map(d => `
    <button class="phase-btn ${ (state.activeResourceFilter || 'All') === d ? 'active' : '' }" 
            onclick="setResourceFilter('${d}')">${d}</button>
  `).join('');

  const filter = state.activeResourceFilter || 'All';
  const filtered = filter === 'All' ? RESOURCES_DB : RESOURCES_DB.filter(r => r.domain === filter);
  container.innerHTML = filtered.map(r => `
    <div class="resource-item">
      <div style="font-weight:700; margin-bottom:4px;">${r.name}</div>
      <div style="font-size:11px; color:var(--text3); margin-bottom:12px;">${r.type} · ${r.domain}</div>
      <a href="${r.url}" target="_blank" class="btn-sm" style="text-decoration:none; display:inline-block;">Open Resource</a>
    </div>`).join('');
}

function setResourceFilter(f) { state.activeResourceFilter = f; renderResources(); }

