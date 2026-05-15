function renderSkills() {
  const container = document.getElementById('skills-content'); if (!container) return;
  
  const filterMap = {
    all: null,
    python: 'Python',
    powerbi: 'Power BI',
    sql: 'SQL',
    ml: 'Machine Learning'
  };
  
  const domainFilter = filterMap[state.activeSkillTab] || null;
  
  container.innerHTML = [...new Set(SKILLS_DB.map(s => s.domain))].map(domain => {
    if (domainFilter && domain !== domainFilter) return '';
    return `<div class="skills-domain">
      <!-- Injected Elements -->
      <div class="light-wrap"><div class="light-color"></div></div>
      <div class="noise-overlay"></div>
      <div class="domain-header">${domain}</div>${SKILLS_DB.filter(s => s.domain === domain).map(s => `<div class="skill-row"><span>${s.name}</span><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width:${(state.skillNow[s.key]||0)*33}%;background:${s.color};"></div></div><select onchange="updateSkill('${s.key}',this.value)" class="form-select"><option value="0" ${state.skillNow[s.key]==0?'selected':''}>None</option><option value="1" ${state.skillNow[s.key]==1?'selected':''}>Beginner</option><option value="2" ${state.skillNow[s.key]==2?'selected':''}>Inter</option><option value="3" ${state.skillNow[s.key]==3?'selected':''}>Expert</option></select></div>`).join('')}</div>`;
  }).join('');
}

function updateSkill(k, v) { state.skillNow[k] = parseInt(v); saveState(); renderSkills(); updateKPIs(); }

window.showTab = function(type, filter, btn) {
  if (type !== 'skills') return;

  state.activeSkillTab = filter;
  saveState();
  const parent = btn.parentElement;
  if (parent) {
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderSkills();
};

