function renderRoadmap() {
  const grid = document.getElementById('week-grid'); if (!grid) return;
  try {
    const activePhases = getActivePhases();
    const roadmapId = state.assignedRoadmap || 'Data Engineering';
    const titleEl = document.getElementById('roadmap-user-title');
    if (titleEl) titleEl.textContent = roadmapId + ' Path';

    renderPhaseFilters(activePhases);

    const roadmapWeeks = [].concat(...activePhases.map(p => p.weeks));
    const currentWeekNum = getCurrentWeek();
    const dataWeeks = [...Object.keys(state.weekStatus || {}), ...Object.keys(state.weekReviews || {})].map(Number);
    const allUniqueWeeks = [...new Set([...roadmapWeeks, ...dataWeeks, currentWeekNum])]
      .sort((a,b)=>a-b)
      .filter(wNum => {
        const inRoadmap = roadmapWeeks.includes(wNum);
        const hasContent = WEEKS_DB.some(x => x.w === wNum);
        const isStarted = (state.weekStatus?.[wNum] && state.weekStatus[wNum] !== 'todo') || state.weekReviews?.[wNum];
        return inRoadmap || hasContent || isStarted;
      });

    let displayWeeks;
    if (activePhaseFilter === 'all') {
      displayWeeks = allUniqueWeeks; 
    } else {
      const filteredPhases = activePhases.filter(p => p.id === activePhaseFilter);
      displayWeeks = [].concat(...filteredPhases.map(p => p.weeks));
    }
    
    grid.innerHTML = displayWeeks.map(wNum => {
      const phase = activePhases.find(p => p.weeks.includes(wNum)) || { color: '#ccc' };
      const w = WEEKS_DB.find(x => x.w === wNum && x.phase === phase.id) || { title: 'TBD', goals: '' };
      const status = state.weekStatus[wNum] || 'todo';
      
      const goalsArray = w.goals.split('Day-').filter(Boolean).map(g => 'Day-' + g.trim());
      const goalsHtml = goalsArray.length > 0 ? goalsArray.map((goalStr) => {
        const match = goalStr.match(/Day-(\d+):\s*(.*)/);
        if (!match) return `<div style="font-size:11px; margin-bottom:8px;">${goalStr}</div>`;
        const dNum = match[1];
        const dText = match[2];
        const dStatus = (state.dayStatus?.[wNum] || {})[dNum] || 'todo';
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 11px; margin-bottom: 8px;">
            <span style="flex:1;"><strong>Day-${dNum}:</strong> ${dText}</span>
            <select onchange="setDayStatus(${wNum}, ${dNum}, this.value)" class="form-select" style="width:auto; height:24px; font-size:10px; padding:0 4px; border-radius:4px; flex-shrink:0;">
              <option value="todo" ${dStatus==='todo'?'selected':''}>Todo</option>
              <option value="doing" ${dStatus==='doing'?'selected':''}>Doing</option>
              <option value="done" ${dStatus==='done'?'selected':''}>Done</option>
            </select>
          </div>
        `;
      }).join('') : '<div style="font-size:11px; color:var(--text3);">No daily goals set for this week.</div>';

      return `
        <div class="week-card ${status==='done'?'done':''}" style="border-top:4px solid ${phase.color}">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span class="badge" style="background:${phase.color}22; color:${phase.color};">WK ${wNum}</span>
            <select onchange="setWeekStatus(${wNum}, this.value)" class="form-select" style="width:auto; height:24px; font-size:10px; padding:0 4px; border-radius:4px;">
              <option value="todo" ${status==='todo'?'selected':''}>Not Started</option>
              <option value="doing" ${status==='doing'?'selected':''}>In Progress</option>
              <option value="done" ${status==='done'?'selected':''}>Completed</option>
            </select>
          </div>
          <div class="week-title" style="margin-bottom:8px;">${w.title}</div>
          ${w.url ? `
            <a href="${w.url}" target="_blank" class="btn-sm" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px; margin-bottom:16px; background:${w.url.includes('youtube.com') || w.url.includes('youtu.be') ? '#FF0000' : 'var(--blue)'}; color:#FFFFFF; border:none; width:fit-content; font-size:12px; font-weight:600; padding:8px 12px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
              ${w.url.includes('youtube.com') || w.url.includes('youtu.be') ? 
                `<svg style="width:14px; height:14px;" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` : 
                `<svg style="width:14px; height:14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>`
              }
              ${w.url.includes('youtube.com') || w.url.includes('youtu.be') ? 'Watch Tutorial' : 'Open Course Material'}
            </a>` : ''}
          <details class="week-details" style="cursor:pointer; font-size:12px; color:var(--text2);" ${status === 'doing' ? 'open' : ''}>
            <summary style="outline:none; list-style:none; color:var(--blue2); font-weight:500;">View Daily Goals</summary>
            <div class="week-goals" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">${goalsHtml}</div>
          </details>
        </div>
      `;
    }).join('');
  } catch (e) { grid.innerHTML = `<div class="render-error">Error: ${e.message}</div>`; }
}

function renderPhaseFilters(phases) {
  const bar = document.getElementById('phase-filter-bar'); if (!bar) return;
  bar.innerHTML = `<button class="phase-btn ${activePhaseFilter==='all'?'active':''}" onclick="setPhaseFilter('all')">All Phases</button>` + 
    phases.map(p => `<button class="phase-btn ${activePhaseFilter===p.id?'active':''}" onclick="setPhaseFilter('${p.id}')">${p.name}</button>`).join('');
}

function setPhaseFilter(p) { activePhaseFilter = p; renderRoadmap(); }

function switchRoadmap(name, btn) {
  state.assignedRoadmap = name;
  activePhaseFilter = 'all'; // Reset phase filter when switching roadmaps
  
  // Update UI buttons
  if (btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  
  renderRoadmap();
}

function setWeekStatus(w, s) { state.weekStatus[w] = s; saveState(); renderRoadmap(); updateKPIs(); }

function setDayStatus(w, d, s) {
  if (!state.dayStatus) state.dayStatus = {};
  if (!state.dayStatus[w]) state.dayStatus[w] = {};
  state.dayStatus[w][d] = s;
  
  // Auto-set week to "doing" if a day is started
  if (s === 'doing' || s === 'done') {
    if (state.weekStatus[w] === 'todo') state.weekStatus[w] = 'doing';
  }
  
  saveState();
  renderRoadmap();
  updateKPIs();
}

