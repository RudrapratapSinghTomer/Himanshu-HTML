function renderProjects() {
  const grid = document.getElementById('project-grid'); if (!grid) return;
  grid.innerHTML = PROJECTS_DB.map(p => {
    const status = state.projectStatus[p.id] || 'Not Started';
    const taskStatus = state.projectTasks[p.id] || p.tasks.map(() => 0);
    const completedTasks = taskStatus.filter(t => t === 1).length;
    const pct = Math.round((completedTasks / p.tasks.length) * 100);
    return `
      <div class="project-card" style="border-top:4px solid ${p.color};">
        <!-- Injected Elements -->
        <div class="light-wrap"><div class="light-color"></div></div>
        <div class="noise-overlay"></div>

        <div style="display:flex;justify-content:space-between;font-size:10px;"><span>PROJ ${p.num}</span><span class="badge">${status}</span></div>
        <div style="font-weight:700;margin:12px 0 8px 0; font-size:15px;">${p.title}</div>
        <div class="project-tasks">
          ${p.tasks.map((t, idx) => `<label style="display:flex;gap:8px;font-size:11px;"><input type="checkbox" ${taskStatus[idx]?'checked':''} onchange="toggleProjectTask('${p.id}',${idx})"> ${t}</label>`).join('')}
        </div>
        <select onchange="updateProjectStatus('${p.id}',this.value)" class="form-select" style="margin-top:12px;">
          <option value="Not Started" ${status==='Not Started'?'selected':''}>Not Started</option>
          <option value="In Progress" ${status==='In Progress'?'selected':''}>In Progress</option>
          <option value="Completed" ${status==='Completed'?'selected':''}>Completed</option>
        </select>
      </div>`;
  }).join('');
}

function toggleProjectTask(pid, tidx) {
  if (!state.projectTasks[pid]) state.projectTasks[pid] = PROJECTS_DB.find(p => p.id === pid).tasks.map(() => 0);
  state.projectTasks[pid][tidx] = state.projectTasks[pid][tidx] ? 0 : 1;
  saveState(); renderProjects(); updateKPIs();
}

function updateProjectStatus(id, v) { state.projectStatus[id] = v; saveState(); renderProjects(); updateKPIs(); }

