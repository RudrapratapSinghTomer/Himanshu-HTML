function renderDashboard() {
  updateKPIs(); renderPhaseProgressBars(); renderHeatmap(); renderRecentLogs(); renderSchedule(); renderLeaderboard(); renderWeekly();
}

function updateKPIs() {
  const activePhases = getActivePhases();
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
  const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
  
  const completedProjects = PROJECTS_DB.filter(p => state.projectStatus[p.id] === 'Completed').length;
  const projLabel = `${completedProjects} / ${PROJECTS_DB.length} complete`;

  const kpis = { 
    'kpi-hours': (state.totalHours || 0).toFixed(1), 
    'kpi-projects': completedProjects, 
    'kpi-skills': SKILLS_DB.filter(s => (state.skillNow[s.key] || 0) >= 1).length, 
    'overall-pct': pct + '%',
    'kpi-streak': state.streak || 0,
    'proj-count-label': projLabel,
    'proj-count-label-projects': projLabel
  };
  Object.entries(kpis).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

function renderPhaseProgressBars() {
  const el = document.getElementById('phase-progress-bars'); if (!el) return;
  el.innerHTML = getActivePhases().map(p => {
    const done = p.weeks.filter(w => state.weekStatus[w] === 'done').length;
    const pct = Math.round((done / p.weeks.length) * 100);
    return `<div style="margin-bottom:8px;"><span>${p.name} (${pct}%)</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${p.color};"></div></div></div>`;
  }).join('');
}

function renderHeatmap() {
  const container = document.getElementById('heatmap'); if (!container) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : auth.currentUser?.uid;
  if (!targetUid) return;

  db.collection('users').doc(targetUid).collection('logs').get().then(snap => {
    const logMap = {}; 
    snap.docs.forEach(doc => { 
      const e = doc.data(); 
      if (e.date) {
        const hrs = parseFloat(e.hours || 0);
        logMap[e.date] = (logMap[e.date] || 0) + hrs; 
      }
    });

    let html = ''; 
    const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(); 
      d.setDate(now.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const hours = logMap[ds] || 0;
      
      // Calculate intensity based on hours (0-8 range for max intensity)
      const intensity = Math.min(hours / 8, 1);
      const opacity = 0.1 + (intensity * 0.9);
      const isToday = ds === now.toISOString().split('T')[0];
      const borderStyle = isToday ? 'outline: 1px solid white;' : '';

      html += `<div class="heatmap-cell" style="opacity: ${opacity}; background: var(--teal); ${borderStyle}" title="${ds}: ${hours.toFixed(1)} hours logged"></div>`;
    }
    container.innerHTML = html;
  });
}

function renderSchedule() {
  const container = document.getElementById('today-schedule-list'); if (!container) return;
  const activePhases = getActivePhases();
  const currentWeekNum = Object.keys(state.weekStatus).find(w => state.weekStatus[w] === 'active') || activePhases[0]?.weeks[0];
  const weekData = WEEKS_DB.find(w => w.w == currentWeekNum);
  if (!weekData) { container.innerHTML = '<div style="font-size:12px;padding:10px;">Focus on your next goal!</div>'; return; }
  container.innerHTML = weekData.goals.split(',').slice(0, 3).map(g => `<div style="margin-bottom:8px;padding:8px;background:var(--navy3);border-radius:8px;">${g.trim()}</div>`).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list'); if (!container) return;
  const top = allUsers.map(u => ({ name: u.firstName, score: Math.round((u.totalHours||0) + (Object.values(u.projectStatus||{}).filter(s=>s==='Completed').length * 20)) })).sort((a,b)=>b.score-a.score).slice(0,3);
  container.innerHTML = top.map((u,idx) => `<div style="display:flex;justify-content:space-between;padding:4px 0;"><span>${idx+1}. ${u.name}</span><span>${u.score} pts</span></div>`).join('');
}

