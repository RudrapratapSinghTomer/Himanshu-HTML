// ── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCK0nu8Q7u_CejlJAJxoGIjx792GXH_WnA",
  authDomain: "bestpeers-learning-dashboard.firebaseapp.com",
  projectId: "bestpeers-learning-dashboard",
  storageBucket: "bestpeers-learning-dashboard.firebasestorage.app",
  messagingSenderId: "864682735295",
  appId: "1:864682735295:web:10f6a324b016df7aa3780a",
  measurementId: "G-TXZG2KEVDR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── APP STATE ────────────────────────────────────────────────────────────────
let myRole = 'user'; 
let state = { ...defaultState };
let me = {};
let allUsers = [];
let viewingUserId = null;
let activePhaseFilter = 'all';

// ── DYNAMIC DATA ─────────────────────────────────────────────────────────────
let ROADMAPS_DB = ROADMAPS;
let WEEKS_DB = WEEKS;
let PROJECTS_DB = PROJECTS;
let RESOURCES_DB = RESOURCES;
let SKILLS_DB = SKILLS;

// ── AUTH LOGIC ───────────────────────────────────────────────────────────────
async function handleAuth() {
  const email = document.getElementById('auth-email')?.value;
  const password = document.getElementById('auth-password')?.value;
  if (!email || !password) return alert('Fill all fields');
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) { alert(e.message); }
}

function logout() { auth.signOut().then(() => window.location.reload()); }

// ── REAL-TIME LISTENERS ──────────────────────────────────────────────────────
let userUnsub = null;
let allUsersUnsub = null;
let configUnsub = null;
let logsUnsub = null;

auth.onAuthStateChanged(async (user) => {
  if (userUnsub) userUnsub();
  if (allUsersUnsub) allUsersUnsub();
  if (configUnsub) configUnsub();

  if (user) {
    document.body.classList.add('auth');
    
    // 1. Listen to Self
    userUnsub = db.collection('users').doc(user.uid).onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        myRole = data.role || 'user';
        state = { ...defaultState, ...data };
        me = { ...state };
        if (!viewingUserId) {
          updateUserUI();
          renderDashboard();
          renderWeekly();
        }
      } else {
        // New user: Create initial profile doc
        const emailPrefix = user.email.split('@')[0];
        const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        const initialDoc = { 
          ...defaultState, 
          firstName: firstName, 
          email: user.email, 
          role: 'user',
          id: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection('users').doc(user.uid).set(initialDoc)
          .catch(e => console.error("Error creating initial profile:", e));
      }
    });

    // 2. Listen to Global Config
    loadDynamicData();

    // 3. Listen to All Users (Host Only)
    setTimeout(() => {
      if (myRole === 'host') {
        allUsersUnsub = db.collection('users').onSnapshot(snap => {
          allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          updateKPIs();
          if (document.getElementById('page-admin-users')?.classList.contains('active')) renderAdminUsers();
          if (viewingUserId) {
            const updated = allUsers.find(u => u.id === viewingUserId);
            if (updated) { state = { ...defaultState, ...updated }; updateUserUI(); renderDashboard(); }
          }
        });
      }
    }, 1500);

    initApp();
  } else {
    document.body.classList.remove('auth');
    myRole = 'user'; state = { ...defaultState }; me = {}; allUsers = [];
    updateUserUI();
  }
});

// ── UTILS ────────────────────────────────────────────────────────────────────
function getActivePhases() {
  const roadmapName = state.assignedRoadmap || 'Data Engineering';
  return ROADMAPS_DB[roadmapName] || ROADMAPS_DB['Data Engineering'] || [];
}

function updateUserUI() {
  try {
    const u = (me && me.firstName) ? me : state;
    const userEmail = auth.currentUser?.email || '';
    const emailPrefix = userEmail ? userEmail.split('@')[0] : 'User';
    const fName = u.firstName || emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    const lName = u.lastName || '';
    
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSub = document.querySelector('.welcome-sub');
    const sidebarName = document.querySelector('.user-name');
    const avatar = document.querySelector('.avatar');
    const roleBadge = document.querySelector('.user-role');

    if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${fName} 👋`;
    
    try {
      if (welcomeSub) {
        const activePhases = getActivePhases();
        const allWeeks = [].concat(...activePhases.map(p => p.weeks));
        const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
        const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
        welcomeSub.innerHTML = `Today is <span style="color:var(--blue2); font-weight:600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> · You've completed ${pct}% of your roadmap. Keep the momentum!`;
      }
    } catch (e) { }

    if (sidebarName) sidebarName.textContent = `${fName} ${lName}`;
    if (avatar) avatar.textContent = (fName[0] || '') + (lName[0] || '');
    if (roleBadge) roleBadge.textContent = (u.role || myRole || 'user').toUpperCase();
    document.querySelectorAll('.host-only').forEach(el => el.style.display = (myRole === 'host') ? 'flex' : 'none');
  } catch (e) { console.error("UI Update Error:", e); }
}

async function saveState() {
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  try {
    await db.collection('users').doc(targetUid).set({
      ...state,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    showToast("Saved to Cloud");
  } catch (e) { 
    console.error("Firestore Sync Error:", e);
    showToast("Sync failed", true); 
  }
}

// ── DATA FETCHING ────────────────────────────────────────────────────────────
function loadDynamicData() {
  db.collection('config').doc('roadmaps').onSnapshot(doc => {
    if (doc.exists) { 
      const data = doc.data();
      // Auto-upgrade stale database if new tracks are missing
      if (!data['Data Engineering'] || data['Data Analyst']) {
        console.warn("Stale global roadmap detected. Prioritizing local logic-first curriculum.");
        ROADMAPS_DB = ROADMAPS;
        if (myRole === 'host') {
          showToast("Upgrading global curriculum...");
          saveRoadmapConfig();
        }
      } else {
        ROADMAPS_DB = data;
      }
      renderDashboard(); renderRoadmap(); 
    }
  });
  db.collection('weeks').onSnapshot(snap => {
    // If we have weeks in DB, we use them, but we check if they are the new ones
    if (!snap.empty) { 
      const data = snap.docs.map(d => d.data()).sort((a,b) => a.w - b.w);
      // If none of the weeks have a 'phase' property, they are old
      if (!data.some(w => w.phase && w.phase.includes('da'))) {
         WEEKS_DB = WEEKS;
      } else {
         WEEKS_DB = data;
      }
      renderRoadmap(); 
    }
  });
  db.collection('projects').onSnapshot(snap => {
    if (!snap.empty) { PROJECTS_DB = snap.docs.map(d => d.data()).sort((a,b) => a.num - b.num); renderProjects(); }
  });
  db.collection('resources').onSnapshot(snap => {
    if (!snap.empty) { RESOURCES_DB = snap.docs.map(d => d.data()); renderResources(); }
  });
  db.collection('skills').onSnapshot(snap => {
    if (!snap.empty) { SKILLS_DB = snap.docs.map(d => d.data()); renderSkills(); }
  });
}

function initApp() {
  updateUserUI();
  renderDashboard();
  renderRoadmap();
  renderSkills();
  renderProjects();
  renderResources();
  renderWeekly();
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
function showPage(id, btn) {
  const pageEl = document.getElementById('page-' + id);
  if (!pageEl) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  pageEl.classList.add('active');
  if (btn) btn.classList.add('active');
  
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard', roadmap: 'Curriculum Roadmap', daily: 'Learning Logs',
      skills: 'Skills Tracker', projects: 'Portfolio Projects', weekly: 'Weekly Performance',
      quiz: 'QuizGPT — AI Tutor',
      resources: 'Knowledge Base', 'admin-users': 'User Management', 
      'admin-content': 'Content Manager', profile: 'My Profile'
    };
    titleEl.textContent = titles[id] || 'Learning Portal';
  }

  const renderers = {
    dashboard: renderDashboard, roadmap: renderRoadmap, skills: renderSkills,
    projects: renderProjects, weekly: renderWeekly, resources: renderResources,
    quiz: renderQuiz,
    daily: renderRecentLogs, 'admin-users': renderAdminUsers, 
    'admin-content': renderAdminContent, profile: renderProfile
  };
  if (renderers[id]) renderers[id]();
}

// ── PAGE RENDERERS ───────────────────────────────────────────────────────────
function renderDashboard() {
  updateKPIs(); renderPhaseProgressBars(); renderHeatmap(); renderRecentLogs(); renderSchedule(); renderLeaderboard(); renderWeekly();
}

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
    const maxW = Math.max(...roadmapWeeks, currentWeekNum, ...dataWeeks);

    let displayWeeks;
    if (activePhaseFilter === 'all') {
      displayWeeks = roadmapWeeks; // Only show weeks defined in the roadmap
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
    return `<div class="skills-domain"><div class="domain-header">${domain}</div>${SKILLS_DB.filter(s => s.domain === domain).map(s => `<div class="skill-row"><span>${s.name}</span><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width:${(state.skillNow[s.key]||0)*33}%;background:${s.color};"></div></div><select onchange="updateSkill('${s.key}',this.value)" class="form-select"><option value="0" ${state.skillNow[s.key]==0?'selected':''}>None</option><option value="1" ${state.skillNow[s.key]==1?'selected':''}>Beginner</option><option value="2" ${state.skillNow[s.key]==2?'selected':''}>Inter</option><option value="3" ${state.skillNow[s.key]==3?'selected':''}>Expert</option></select></div>`).join('')}</div>`;
  }).join('');
}

function updateSkill(k, v) { state.skillNow[k] = parseInt(v); saveState(); renderSkills(); updateKPIs(); }

function renderProjects() {
  const grid = document.getElementById('project-grid'); if (!grid) return;
  grid.innerHTML = PROJECTS_DB.map(p => {
    const status = state.projectStatus[p.id] || 'Not Started';
    const taskStatus = state.projectTasks[p.id] || p.tasks.map(() => 0);
    const completedTasks = taskStatus.filter(t => t === 1).length;
    const pct = Math.round((completedTasks / p.tasks.length) * 100);
    return `
      <div class="project-card" style="border-top:4px solid ${p.color};">
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

function renderRecentLogs() {
  const container = document.getElementById('log-entries-list'); if (!container) return;
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  if (logsUnsub) logsUnsub();
  logsUnsub = db.collection('users').doc(targetUid).collection('logs').orderBy('createdAt','desc').onSnapshot(snap => {
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    container.innerHTML = logs.map(e => `
      <div class="card" style="padding:16px; margin-bottom:12px; position:relative;">
        <strong>${e.topic}</strong><br>
        <small>${e.date} · ${e.hours}h</small>
        <p>${e.learned}</p>
        ${myRole === 'host' ? `<button onclick="deleteLogEntry('${e.id}')" style="position:absolute; top:10px; right:10px; background:rgba(239,68,68,0.1); border:none; color:var(--red); width:24px; height:24px; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px;">&times;</button>` : ''}
      </div>`).join('');
  });
}

// ── KPI HELPERS ──────────────────────────────────────────────────────────────
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

// ── MISC ─────────────────────────────────────────────────────────────────────
function renderProfile() {
  document.getElementById('profile-first-name').value = state.firstName || '';
  document.getElementById('profile-last-name').value = state.lastName || '';
  document.getElementById('profile-bio').value = state.bio || '';
  document.getElementById('profile-dept').value = state.department || '';
  document.getElementById('profile-join').value = state.joiningDate || '';
}
async function saveProfile() {
  state.firstName = document.getElementById('profile-first-name')?.value;
  state.lastName = document.getElementById('profile-last-name')?.value;
  state.bio = document.getElementById('profile-bio')?.value;
  state.department = document.getElementById('profile-dept')?.value;
  state.joiningDate = document.getElementById('profile-join')?.value;
  await saveState();
}

function showToast(msg, isErr) {
  const toast = document.getElementById('save-toast');
  const text = document.getElementById('save-toast-text');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.style.background = isErr ? 'var(--red)' : 'var(--blue)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function saveLogEntry() {
  const user = auth.currentUser;
  if (!user) return showToast("You must be logged in", true);

  const topic = document.getElementById('log-topic')?.value;
  const learned = document.getElementById('log-learned')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  const date = document.getElementById('log-date')?.value || new Date().toISOString().split('T')[0];
  const week = document.getElementById('log-week')?.value;
  const tool = document.getElementById('log-tool')?.value;
  const mood = state.selectedMood || 3;
  const handson = document.getElementById('log-handson')?.value;
  const tomorrow = document.getElementById('log-tomorrow')?.value;

  if (!topic || !learned) return showToast("Fill topic and learned fields", true);

  const entry = { 
    topic, learned, hours, date, week, tool, mood, handson, tomorrow,
    createdAt: firebase.firestore.FieldValue.serverTimestamp() 
  };

  try {
    const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
    const userRef = db.collection('users').doc(targetUid);
    await userRef.collection('logs').add(entry);
    const updateObj = { 
      totalHours: firebase.firestore.FieldValue.increment(hours),
      streak: firebase.firestore.FieldValue.increment(1) 
    };

    // Ensure the week is tracked in both local state and DB to trigger dynamic scaling
    if (week && (!state.weekStatus || !state.weekStatus[week])) {
      if (!state.weekStatus) state.weekStatus = {};
      state.weekStatus[week] = 'todo';
      updateObj[`weekStatus.${week}`] = 'todo';
    }

    await userRef.update(updateObj);
    toggleLogForm(); 
    showToast("Session Logged!");
    renderDashboard();
    renderRecentLogs();
    renderWeekly();
  } catch (e) { 
    console.error("Firestore Save Error:", e);
    showToast(`Failed to save log: ${e.message}`, true); 
  }
}
async function fetchEmployees() {
  const snap = await db.collection('users').get();
  allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderAdminUsers();
}

function renderAdminUsers() {
  const userList = document.getElementById('admin-users-list');
  const pendingList = document.getElementById('pending-requests-list');
  const userSelect = document.getElementById('admin-user-select');
  const userCount = document.getElementById('admin-user-count');
  
  if (!userList || !allUsers.length) return;

  if (userCount) userCount.textContent = `${allUsers.length} Users`;

  // Directory
  userList.innerHTML = allUsers.map(u => `
    <div class="user-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy3); border-radius:8px; margin-bottom:8px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="avatar" style="width:32px; height:32px; font-size:12px;">${(u.firstName?.[0]||'')+ (u.lastName?.[0]||'')}</div>
        <div>
          <div style="font-weight:600; font-size:13px;">${u.firstName} ${u.lastName || ''}</div>
          <div style="font-size:10px; color:var(--text3);">${u.role?.toUpperCase() || 'USER'}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <div class="badge" style="background:var(--blue)22; color:var(--blue2);">${u.assignedRoadmap || 'None'}</div>
        <button onclick="switchViewUser('${u.id}')" class="btn" style="padding:4px 10px; font-size:11px; background:var(--navy4);">Edit</button>
        <button onclick="deleteUser('${u.id}')" class="btn" style="padding:4px 10px; font-size:11px; background:var(--red)22; color:var(--red); border-color:var(--red)44;">Delete</button>
      </div>
    </div>
  `).join('');

  // Select for assignment
  if (userSelect) {
    userSelect.innerHTML = '<option value="">Select an employee...</option>' + 
      allUsers.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName || ''}</option>`).join('');
  }
}

async function handleAdminAssign() {
  const uid = document.getElementById('admin-user-select')?.value;
  const roadmap = document.getElementById('admin-roadmap-select')?.value;
  if (!uid || !roadmap) return alert("Select user and roadmap");
  
  try {
    await db.collection('users').doc(uid).update({ assignedRoadmap: roadmap });
    showToast("Roadmap Assigned!");
    fetchEmployees();
  } catch (e) { 
    console.error("Admin Assign Error:", e);
    showToast("Failed to assign", true); 
  }
}

async function switchViewUser(uid) { 
  viewingUserId = uid; 
  const u = allUsers.find(x => x.id === uid); 
  if (u) { 
    state = { ...defaultState, ...u }; 
    updateUserUI(); 
    renderDashboard(); 
    updateViewingStatus(`${u.firstName} ${u.lastName || ''}`);
    showPage('dashboard', document.querySelector('.nav-item[onclick*="dashboard"]'));
  } 
}

async function deleteUser(userId) {
  if (myRole !== 'host') return alert("Unauthorized");
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await db.collection('users').doc(userId).delete();
    showToast("User deleted successfully");
    // If you were viewing this user, clear the view
    if (viewingUserId === userId) {
      viewingUserId = null;
      state = { ...me };
      renderDashboard();
      updateViewingStatus(null);
    }
    // Refresh the user list
    fetchEmployees();
  } catch (e) {
    console.error("Delete error:", e);
    showToast("Delete failed", true);
  }
}

async function deleteLogEntry(logId) {
  if (myRole !== 'host') return;
  if (!confirm("Are you sure you want to delete this log entry?")) return;
  
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : auth.currentUser?.uid;
  if (!targetUid) return;

  try {
    const logRef = db.collection('users').doc(targetUid).collection('logs').doc(logId);
    const doc = await logRef.get();
    if (doc.exists) {
      const hours = doc.data().hours || 0;
      await logRef.delete();
      await db.collection('users').doc(targetUid).update({
        totalHours: firebase.firestore.FieldValue.increment(-hours)
      });
      showToast("Log entry deleted");
      renderWeekly(); // Refresh weekly aggregation
    }
  } catch (e) {
    console.error("Delete Log Error:", e);
    showToast("Failed to delete log", true);
  }
}

function updateViewingStatus(userName) {
  const msgEl = document.getElementById('currently-viewing-msg');
  if (!msgEl) return;
  if (userName) {
    msgEl.textContent = `Currently Viewing: ${userName}`;
    msgEl.style.display = 'block';
  } else {
    msgEl.style.display = 'none';
  }
}

function toggleLogForm() {
  const el = document.getElementById('log-form-container');
  if (!el) return;
  const isOpening = el.style.display === 'none';
  el.style.display = isOpening ? 'block' : 'none';
  
  if (isOpening) {
    const weekSelect = document.getElementById('log-week');
    if (weekSelect) {
      const activePhases = getActivePhases();
      const roadmapWeeks = [].concat(...activePhases.map(p => p.weeks));
      const currentWeekNum = getCurrentWeek();
      const dataWeeks = [...Object.keys(state.weekStatus || {}), ...Object.keys(state.weekReviews || {})].map(Number);
      const maxW = Math.max(...roadmapWeeks, currentWeekNum, ...dataWeeks);
      const allWeeks = Array.from({length: maxW}, (_, i) => i + 1);
      weekSelect.innerHTML = allWeeks.map(w => `<option value="${w}">Week ${w}</option>`).join('');
      
      // Auto-select the currently active week if available
      const currentWeek = Object.keys(state.weekStatus).find(w => state.weekStatus[w] === 'active');
      if (currentWeek) weekSelect.value = currentWeek;
    }
    // Set default date to today
    const dateInput = document.getElementById('log-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
      updateLogWeek(dateInput.value); // Initial calculation
    }
  }
}

function getCurrentWeek() {
  const startOfFirstWeek = new Date('2025-12-29');
  const now = new Date();
  const diffInMs = now - startOfFirstWeek;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.max(1, Math.ceil((diffInDays + 1) / 7));
}

function updateLogWeek(dateVal) {
  const selectedDate = new Date(dateVal);
  if (isNaN(selectedDate)) return;
  
  const weekNumber = calculateWeekFromDate(selectedDate);
  
  const weekSelect = document.getElementById('log-week');
  if (weekSelect && weekNumber >= 1 && weekNumber <= 52) {
    let optionExists = Array.from(weekSelect.options).some(opt => opt.value == weekNumber);
    if (!optionExists) {
      const newOpt = document.createElement('option');
      newOpt.value = weekNumber;
      newOpt.textContent = `Week ${weekNumber}`;
      weekSelect.appendChild(newOpt);
    }
    weekSelect.value = weekNumber;
  }
}

function calculateWeekFromDate(date) {
  const startOfFirstWeek = new Date('2025-12-29');
  const diffInMs = date - startOfFirstWeek;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.ceil((diffInDays + 1) / 7);
}



function setMood(val, btn) {
  state.selectedMood = val;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

window.showTab = function(type, filter, btn) {
  if (type !== 'skills') return;
  
  // 1. Update active button state
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // 2. Filter skill domains
  const skillDomains = document.querySelectorAll('.skills-domain');
  skillDomains.forEach(domain => {
    const header = domain.querySelector('.domain-header').textContent.toLowerCase().trim();
    
    // Mapping filter values to actual header text
    let shouldShow = false;
    if (filter === 'all') {
      shouldShow = true;
    } else if (filter === 'python' && header.includes('python')) {
      shouldShow = true;
    } else if (filter === 'powerbi' && header.includes('power bi')) {
      shouldShow = true;
    } else if (filter === 'sql' && header === 'sql') {
      shouldShow = true;
    } else if (filter === 'ml' && header.includes('machine learning')) {
      shouldShow = true;
    }

    
    domain.style.display = shouldShow ? 'block' : 'none';
  });
};
function fixLinks() {}
let isHostEditMode = false;
function toggleHostEditMode() {
  isHostEditMode = !isHostEditMode;
  const btn = document.getElementById('host-edit-mode-btn');
  if (btn) btn.textContent = `Edit Mode: ${isHostEditMode ? 'ON' : 'OFF'}`;
  renderWeekly();
}

function renderReviewWeeks() {
  const grid = document.getElementById('review-week-grid'); if (!grid) return;
  const activePhases = getActivePhases();
  const roadmapWeeks = [].concat(...activePhases.map(p => p.weeks));
  const currentWeekNum = getCurrentWeek();
  const dataWeeks = [...Object.keys(state.weekStatus || {}), ...Object.keys(state.weekReviews || {})].map(Number);
  
  // Show all weeks in roadmap + any weeks elapsed + any weeks with data
  const maxW = Math.max(...roadmapWeeks, currentWeekNum, ...dataWeeks);
  const allWeeks = roadmapWeeks;
  
  grid.innerHTML = allWeeks.map(w => {
    const isSelected = (state.selectedReviewWeek || 1) == w;
    const status = state.weekReviews?.[w]?.status || 'Empty';
    return `<button class="week-sel-btn ${isSelected?'active':''}" onclick="setReviewWeek(${w})">W${w}<br><small style="font-size:8px;">${status}</small></button>`;
  }).join('');
}

function setReviewWeek(w) {
  state.selectedReviewWeek = w;
  renderReviewWeeks();
  renderWeekly();
}

// Add call to renderReviewWeeks in renderWeekly
async function renderWeekly() {
  renderReviewWeeks();
  const weekNum = state.selectedReviewWeek || 1;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : auth.currentUser?.uid;
  if (!targetUid) return;

  // 1. Fetch logs for this week to aggregate data
  const logsSnap = await db.collection('users').doc(targetUid).collection('logs').where('week', '==', weekNum.toString()).get();
  const weeklyLogs = logsSnap.docs.map(d => d.data());

  // 2. Aggregate data from logs
  const aggregated = {
    topics: weeklyLogs.map(l => l.topic).filter(Boolean).join(', '),
    handson: weeklyLogs.map(l => l.handson).filter(Boolean).join('. '),
    focus: weeklyLogs.map(l => l.tomorrow).filter(Boolean).slice(-1)[0] || '', 
    hours: weeklyLogs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0)
  };

  const review = state.weekReviews?.[weekNum] || {};
  
  // Use aggregated data if review fields are empty
  const displayData = {
    topics: review.topics || aggregated.topics || 'No logs for this week yet.',
    handson: review.handson || aggregated.handson || 'No practical work logged.',
    wins: review.wins || aggregated.wins || 'No breakthroughs recorded.',
    blockers: review.blockers || aggregated.blockers || 'No blockers reported.',
    focus: review.focus || aggregated.focus || 'Next week focus not set.',
    hours: (review.hours !== undefined) ? review.hours : aggregated.hours,
    status: review.status || (weeklyLogs.length > 0 ? 'Draft' : 'Empty'),
    rating: review.rating || 0
  };

  // 3. Auto-Calculate Rating if not manually set
  if (!displayData.rating && displayData.hours > 0) {
    if (displayData.hours >= 7) displayData.rating = 5;
    else if (displayData.hours >= 6) displayData.rating = 4;
    else if (displayData.hours >= 4) displayData.rating = 3;
    else if (displayData.hours >= 2) displayData.rating = 2;
    else displayData.rating = 1;
  }

  // Calculate Star String
  const maxStars = 5;
  const rating = displayData.rating || 0;
  const starString = "⭐".repeat(rating) + "☆".repeat(maxStars - rating);

  // 3. Update UI Elements
  const elements = {
    'review-week-label': weekNum,
    'display-topics': displayData.topics,
    'display-handson': displayData.handson,
    'display-win': displayData.wins,
    'display-blocker': displayData.blockers,
    'display-focus': displayData.focus,
    'review-hours-display': displayData.hours,
    'review-status-badge': displayData.status,
    'review-rating-display': (rating > 0) ? starString : 'No Rating'
  };

  Object.entries(elements).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // 4. Update the mini log summary tags
  const logSummaryContainer = document.getElementById('weekly-logs-summary');
  if (logSummaryContainer) {
    logSummaryContainer.innerHTML = weeklyLogs.map(l => `<span class="badge" style="background:var(--blue)22; color:var(--blue2); font-size:10px; margin-bottom:4px;">${l.date}: ${l.topic} (${l.hours}h)</span>`).join('');
  }

  // Toggle Edit Visibility
  const editFields = ['topics', 'handson', 'win', 'blocker', 'focus', 'hours', 'rating'];
  editFields.forEach(f => {
    const display = document.getElementById('display-' + f);
    const edit = document.getElementById('edit-' + f);
    if (display && edit) {
      display.style.display = isHostEditMode ? 'none' : 'block';
      edit.style.display = isHostEditMode ? 'block' : 'none';
      if (isHostEditMode) {
        const fieldKey = f === 'win' ? 'wins' : (f === 'blocker' ? 'blockers' : f);
        edit.value = (f === 'rating') ? (review.rating || 0) : (review[fieldKey] || display.textContent);
      }
    }
  });

  const saveBtn = document.getElementById('review-save-btn');
  const submitBtn = document.getElementById('review-action-btn');
  if (saveBtn && submitBtn) {
    saveBtn.style.display = isHostEditMode ? 'block' : 'none';
    submitBtn.style.display = isHostEditMode ? 'none' : 'block';
  }
}

async function submitWeeklyReview() {
  const weekNum = state.selectedReviewWeek || 1;
  if (!state.weekReviews) state.weekReviews = {};
  
  if (isHostEditMode) {
    state.weekReviews[weekNum] = {
      ...state.weekReviews[weekNum],
      topics: document.getElementById('edit-topics')?.value,
      handson: document.getElementById('edit-handson')?.value,
      wins: document.getElementById('edit-win')?.value,
      blockers: document.getElementById('edit-blocker')?.value,
      focus: document.getElementById('edit-focus')?.value,
      hours: parseFloat(document.getElementById('edit-hours')?.value || 0),
      rating: parseInt(document.getElementById('edit-rating')?.value || 0),
      status: 'Reviewed',
      reviewedAt: new Date().toISOString()
    };
    isHostEditMode = false;
    const btn = document.getElementById('host-edit-mode-btn');
    if (btn) btn.textContent = `Edit Mode: OFF`;
  } else {
    state.weekReviews[weekNum] = {
      ...state.weekReviews[weekNum],
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    };
  }
  
  await saveState();
  renderWeekly();
}
function handleGlobalSearch(query) {
  const container = document.getElementById('global-search-results');
  if (!container) return;

  if (!query || query.trim().length < 2) {
    container.classList.remove('active');
    container.innerHTML = '';
    return;
  }

  const q = query.toLowerCase();
  const results = [];

  // 1. Search Roadmap (WEEKS_DB)
  WEEKS_DB.forEach(w => {
    if (w.title.toLowerCase().includes(q) || (w.goals && w.goals.toLowerCase().includes(q))) {
      results.push({
        type: 'Roadmap',
        title: `Week ${w.w}: ${w.title}`,
        page: 'roadmap',
        icon: '📚'
      });
    }
  });

  // 2. Search Projects (PROJECTS_DB)
  PROJECTS_DB.forEach(p => {
    if (p.title.toLowerCase().includes(q) || (p.tasks && p.tasks.some(t => t.toLowerCase().includes(q)))) {
      results.push({
        type: 'Project',
        title: p.title,
        page: 'projects',
        icon: '🚀'
      });
    }
  });

  // 3. Search Resources (RESOURCES_DB)
  RESOURCES_DB.forEach(r => {
    if (r.name.toLowerCase().includes(q) || (r.domain && r.domain.toLowerCase().includes(q))) {
      results.push({
        type: 'Resource',
        title: r.name,
        page: 'resources',
        icon: '🔗'
      });
    }
  });

  if (results.length === 0) {
    container.innerHTML = '<div class="no-results">No matches found for "' + query + '"</div>';
  } else {
    container.innerHTML = results.slice(0, 10).map(r => `
      <div class="search-result-item" onclick="showPage('${r.page}', document.querySelector('.nav-item[onclick*=\\'${r.page}\\']')); document.getElementById('global-search-results').classList.remove('active');">
        <div class="result-icon">${r.icon}</div>
        <div class="result-content">
          <div class="result-type">${r.type}</div>
          <div class="result-title">${r.title}</div>
        </div>
      </div>
    `).join('');
  }

  container.classList.add('active');
}

// Click outside to close search results
document.addEventListener('click', (e) => {
  const container = document.getElementById('global-search-results');
  const searchWrap = document.querySelector('.global-search-wrap');
  if (container && !searchWrap.contains(e.target)) {
    container.classList.remove('active');
  }
});
function renderAdminContent() {
  const roadmapList = document.getElementById('admin-roadmaps-list');
  const weeksList = document.getElementById('admin-weeks-list');
  const projectsList = document.getElementById('admin-projects-list');
  
  if (roadmapList) {
    roadmapList.innerHTML = Object.entries(ROADMAPS_DB).map(([name, phases]) => `
      <div class="card" style="padding:16px; background:var(--navy3);">
        <div style="font-weight:700; margin-bottom:12px;">${name}</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${phases.map((p, idx) => `
            <div style="display:flex; gap:8px;">
              <input type="text" class="form-input" value="${p.name}" onchange="updateRoadmapPhase('${name}', ${idx}, 'name', this.value)">
              <input type="color" value="${p.color}" onchange="updateRoadmapPhase('${name}', ${idx}, 'color', this.value)" style="width:40px; padding:0;">
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  if (weeksList) {
    weeksList.innerHTML = WEEKS_DB.map((w, idx) => `
      <div class="card" style="padding:12px; background:var(--navy3); margin-bottom:8px;">
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <input type="number" class="form-input" value="${w.w}" style="width:60px;" onchange="updateWeekItem(${idx}, 'w', this.value)">
          <input type="text" class="form-input" value="${w.title}" onchange="updateWeekItem(${idx}, 'title', this.value)">
        </div>
        <textarea class="form-textarea" style="font-size:11px; height:60px;" onchange="updateWeekItem(${idx}, 'goals', this.value)">${w.goals}</textarea>
      </div>
    `).join('');
  }

  if (projectsList) {
    projectsList.innerHTML = PROJECTS_DB.map((p, idx) => `
      <div class="card" style="padding:12px; background:var(--navy3); margin-bottom:8px;">
        <div style="display:flex; gap:8px; margin-bottom:8px;">
          <input type="text" class="form-input" value="${p.title}" onchange="updateProjectItem(${idx}, 'title', this.value)">
          <input type="color" value="${p.color}" style="width:40px;" onchange="updateProjectItem(${idx}, 'color', this.value)">
        </div>
        <input type="text" class="form-input" value="${p.tools.join(', ')}" style="font-size:11px;" onchange="updateProjectItem(${idx}, 'tools', this.value.split(','))">
      </div>
    `).join('');
  }
}

function updateRoadmapPhase(roadmap, idx, key, val) { ROADMAPS_DB[roadmap][idx][key] = val; }
function updateWeekItem(idx, key, val) { WEEKS_DB[idx][key] = (key === 'w') ? parseInt(val) : val; }
function updateProjectItem(idx, key, val) { PROJECTS_DB[idx][key] = val; }

function addWeekItem() {
  const nextW = (WEEKS_DB[WEEKS_DB.length-1]?.w || 0) + 1;
  WEEKS_DB.push({ w: nextW, title: 'New Week', goals: 'Enter goals here', phase: 'da1' });
  renderAdminContent();
}

function addProjectItem() {
  const nextNum = PROJECTS_DB.length + 1;
  PROJECTS_DB.push({ id: 'proj' + nextNum, num: nextNum.toString().padStart(2, '0'), title: 'New Project', color: '#3B82F6', tools: ['SQL'], tasks: ['Task 1'], status: 'Not Started' });
  renderAdminContent();
}

async function saveRoadmapConfig() {
  try {
    await db.collection('config').doc('roadmaps').set(ROADMAPS);
    
    // Clear old weeks to prevent overlap
    const oldWeeks = await db.collection('weeks').get();
    const deleteBatch = db.batch();
    oldWeeks.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    const batch = db.batch();
    WEEKS.forEach(w => {
      const docId = w.phase + '_w' + w.w; 
      batch.set(db.collection('weeks').doc(docId), w);
    });
    PROJECTS.forEach(p => batch.set(db.collection('projects').doc(p.id), p));
    SKILLS.forEach(s => batch.set(db.collection('skills').doc(s.key), s));
    RESOURCES.forEach((r, idx) => batch.set(db.collection('resources').doc('res_' + idx), r));
    
    await batch.commit();
    showToast("Global Content Synchronized!");
  } catch (e) { 
    console.error("Global Save Error:", e);
    showToast("Global Save Failed", true); 
  }
}

// ── INITIALIZATION & LISTENERS ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Force date picker to open on click for profile join date
  const dateInput = document.getElementById('profile-join');
  if (dateInput) {
    dateInput.addEventListener('click', (e) => {
      try {
        if (typeof dateInput.showPicker === 'function') {
          dateInput.showPicker();
        }
      } catch (err) {
        console.warn("Manual picker opening failed", err);
      }
    });
  }

  // Log Form Toggles
  document.getElementById('btn-log-session')?.addEventListener('click', toggleLogForm);
  document.getElementById('btn-new-session')?.addEventListener('click', toggleLogForm);
  document.getElementById('btn-cancel-log')?.addEventListener('click', toggleLogForm);

  // Date to Week Auto-calculation
  document.getElementById('log-date')?.addEventListener('change', (e) => updateLogWeek(e.target.value));
});

// ── QUIZ LOGIC ───────────────────────────────────────────────────────────────
let quizState = {
  active: false,
  currentQuestion: null,
  index: 0,
  total: 10,
  score: 0,
  history: [],
  selectedTopic: 'all',
  pool: []
};


function renderQuiz() {
  if (!quizState.active) {
    document.getElementById('quiz-start-view').style.display = 'block';
    document.getElementById('quiz-question-view').style.display = 'none';
    document.getElementById('quiz-result-view').style.display = 'none';

    // Populate topic dropdown
    const select = document.getElementById('quiz-topic-select');
    if (select) {
      const activePhases = getActivePhases();
      const doneWeekNums = Object.keys(state.weekStatus).filter(w => state.weekStatus[w] === 'done').map(Number);
      
      const completedTopics = WEEKS_DB
        .filter(w => doneWeekNums.includes(w.w))
        .map(w => w.title);
      
      const uniqueTopics = [...new Set(completedTopics)];
      
      select.innerHTML = '<option value="all">Anywhere (All Completed Topics)</option>' + 
        uniqueTopics.map(t => `<option value="${t}">${t}</option>`).join('');
    }
  }
}

async function startQuiz() {
  const topicSelect = document.getElementById('quiz-topic-select');
  const selectedTopic = topicSelect ? topicSelect.value : 'all';

  // Pre-calculate and Shuffle Pool
  const roadmap = state.assignedRoadmap || 'Data Engineering';
  const userSkills = Object.keys(state.skillNow).filter(s => state.skillNow[s] > 0);
  const doneWeekNums = Object.keys(state.weekStatus).filter(w => state.weekStatus[w] === 'done').map(Number);
  const completedTopicTitles = WEEKS_DB.filter(w => doneWeekNums.includes(w.w)).map(w => w.title);

  const combinedPool = [
    ...ALL_QUESTIONS,
    ...CODING_CHALLENGES,
    ...(typeof EXTRACTED_MCQS !== 'undefined' ? EXTRACTED_MCQS : []),
    ...(typeof EXTRACTED_CODE !== 'undefined' ? EXTRACTED_CODE : [])
  ];

  let filteredPool = [];
  if (selectedTopic !== 'all') {
    filteredPool = combinedPool.filter(q => q.topic === selectedTopic);
  } else {
    filteredPool = combinedPool.filter(q => 
      (q.tags.includes(roadmap) || q.tags.some(tag => userSkills.includes(tag))) &&
      (completedTopicTitles.includes(q.topic) || q.topic === "General")
    );
  }

  // Fallback if empty
  if (filteredPool.length === 0) filteredPool = combinedPool.filter(q => q.tags.includes(roadmap));
  
  // Shuffle logic (Fisher-Yates)
  for (let i = filteredPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredPool[i], filteredPool[j]] = [filteredPool[j], filteredPool[i]];
  }

  quizState = {
    active: true,
    currentQuestion: null,
    index: 0,
    total: Math.min(10, filteredPool.length),
    score: 0,
    history: [],
    selectedTopic: selectedTopic,
    pool: filteredPool
  };
  
  document.getElementById('quiz-start-view').style.display = 'none';
  document.getElementById('quiz-result-view').style.display = 'none';
  document.getElementById('quiz-question-view').style.display = 'block';
  document.getElementById('quiz-score-tag').textContent = `Score: 0`;
  
  await fetchQuizQuestion();
}



async function fetchQuizQuestion() {
  const questionEl = document.getElementById('quiz-question-text');
  const optionsEl = document.getElementById('quiz-options-list');
  const nextBtn = document.getElementById('quiz-next-btn');
  
  questionEl.textContent = "Generating your question via AI...";
  optionsEl.innerHTML = '';
  nextBtn.style.display = 'none';
  
  // Update Progress
  document.getElementById('quiz-progress-text').textContent = `Question ${quizState.index + 1} of ${quizState.total}`;
  document.getElementById('quiz-progress-bar').style.width = `${((quizState.index + 1) / quizState.total) * 100}%`;

  try {
    // Determine context for AI
    const roadmap = state.assignedRoadmap || 'Data Engineering';
    const skills = Object.keys(state.skillNow).filter(k => state.skillNow[k] > 0);
    
    // Solution 3: Difficulty calculation
    const activePhases = getActivePhases();
    const allWeeks = [].concat(...activePhases.map(p => p.weeks));
    const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
    const completionPct = allWeeks.length > 0 ? (doneWeeks / allWeeks.length) : 0;
    const difficulty = completionPct > 0.5 ? 'Advanced' : 'Beginner';

    // Call Firebase Cloud Function (Proxy)
    const functionUrl = 'https://us-central1-bestpeers-learning-dashboard.cloudfunctions.net/getQuizQuestion';
    
    let data;
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: auth.currentUser?.uid,
          roadmap: roadmap,
          skills: skills,
          index: quizState.index,
          difficulty: difficulty,
          topic: quizState.selectedTopic
        })
      });
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error("Function not available");
      }
    } catch (e) {
      console.warn("Using shuffled local quiz pool (AI Function Offline)");
      data = quizState.pool[quizState.index % quizState.pool.length];
    }


    quizState.currentQuestion = data;
    renderQuestion(data);
  } catch (e) {
    questionEl.textContent = "Error loading question. Please try again.";
    console.error(e);
  }
}


function renderQuestion(q) {
  const questionEl = document.getElementById('quiz-question-text');
  const optionsEl = document.getElementById('quiz-options-list');
  const codeWrap = document.getElementById('quiz-code-input-wrap');
  const submitCodeBtn = document.getElementById('quiz-submit-code-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  const feedbackEl = document.getElementById('quiz-ai-feedback');

  questionEl.textContent = q.question;
  feedbackEl.style.display = 'none';
  nextBtn.style.display = 'none';

  if (q.type === 'code') {
    optionsEl.style.display = 'none';
    codeWrap.style.display = 'flex';
    submitCodeBtn.style.display = 'block';
    document.getElementById('quiz-code-input').value = q.initialCode || '';
    document.getElementById('quiz-code-input').disabled = false;
  } else {
    optionsEl.style.display = 'flex';
    codeWrap.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    optionsEl.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option" onclick="selectQuizOption(${i})">
        <div class="option-letter">${String.fromCharCode(65 + i)}</div>
        <span>${opt}</span>
      </button>
    `).join('');
  }
}

async function submitCodeAnswer() {
  const code = document.getElementById('quiz-code-input').value;
  const feedbackEl = document.getElementById('quiz-ai-feedback');
  const feedbackContent = document.getElementById('quiz-feedback-content');
  const submitBtn = document.getElementById('quiz-submit-code-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  
  submitBtn.disabled = true;
  submitBtn.textContent = "AI Reviewing...";
  
  try {
    const functionUrl = 'https://us-central1-bestpeers-learning-dashboard.cloudfunctions.net/evaluateCodeAnswer';
    
    let result;
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code,
          question: quizState.currentQuestion.question,
          topic: quizState.currentQuestion.topic
        })
      });
      if (response.ok) {
        result = await response.json();
      } else {
        throw new Error("Evaluation failed");
      }
    } catch (e) {
      // Offline/Fallback Feedback
      console.warn("Using local pattern-based review");
      const keywords = quizState.currentQuestion.expectedKeywords || [];
      const missing = keywords.filter(k => !code.toLowerCase().includes(k.toLowerCase()));
      
      if (missing.length === 0) {
        result = {
          correct: true,
          feedback: "Great work! Your code uses all the expected concepts. (Local Review)"
        };
      } else {
        result = {
          correct: false,
          feedback: `Your code is a good start, but it seems to be missing some key concepts like: ${missing.join(', ')}. Keep refining! (Local Review)`
        };
      }
    }

    feedbackEl.style.display = 'block';
    feedbackContent.innerHTML = `<p style="color: ${result.correct ? 'var(--green2)' : 'var(--orange)'}; font-weight: 600;">${result.correct ? 'Correct Logic' : 'Needs Improvement'}</p><p>${result.feedback}</p>`;
    
    if (result.correct) quizState.score++;
    document.getElementById('quiz-score-tag').textContent = `Score: ${quizState.score}`;
    
    document.getElementById('quiz-code-input').disabled = true;
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'block';
    
  } catch (e) {
    console.error(e);
    alert("Error reviewing code.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit for AI Review";
  }
}


function selectQuizOption(idx) {
  if (!quizState.currentQuestion) return;
  
  const options = document.querySelectorAll('.quiz-option');
  const correctIdx = quizState.currentQuestion.correctIndex;
  const isCorrect = idx === correctIdx;
  
  // Disable all options
  options.forEach(opt => opt.disabled = true);
  
  // Show correct/incorrect
  options[idx].classList.add(isCorrect ? 'correct' : 'incorrect');
  if (!isCorrect) {
    options[correctIdx].classList.add('correct');
    options[idx].classList.add('incorrect-shake');
  }
  
  if (isCorrect) {
    quizState.score++;
    document.getElementById('quiz-score-tag').textContent = `Score: ${quizState.score}`;
  }
  
  quizState.history.push({ question: quizState.currentQuestion.question, correct: isCorrect });
  
  document.getElementById('quiz-next-btn').style.display = 'block';
  document.getElementById('quiz-next-btn').textContent = (quizState.index + 1 >= quizState.total) ? 'Finish Quiz' : 'Next Question';
}

function nextQuizQuestion() {
  quizState.index++;
  if (quizState.index < quizState.total) {
    fetchQuizQuestion();
  } else {
    finishQuiz();
  }
}

async function finishQuiz() {
  quizState.active = false;
  document.getElementById('quiz-question-view').style.display = 'none';
  document.getElementById('quiz-result-view').style.display = 'block';
  
  const finalScore = quizState.score;
  document.getElementById('quiz-final-score').textContent = `${finalScore}/${quizState.total}`;
  
  let feedback = "";
  if (finalScore === quizState.total) feedback = "Perfect score! You're mastering the roadmap.";
  else if (finalScore >= 3) feedback = "Good job! Keep practicing to fill the gaps.";
  else feedback = "Keep learning! Review your roadmap and try again.";
  
  document.getElementById('quiz-feedback').textContent = feedback;
  
  // Save results to user profile
  if (!state.quizScores) state.quizScores = [];
  state.quizScores.push({
    score: finalScore,
    total: quizState.total,
    date: new Date().toISOString()
  });
  
  await saveState();
}

// Explicitly expose to global scope
window.startQuiz = startQuiz;
window.selectQuizOption = selectQuizOption;
window.nextQuizQuestion = nextQuizQuestion;
window.renderQuiz = renderQuiz;
window.submitCodeAnswer = submitCodeAnswer;

