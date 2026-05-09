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
        db.collection('users').doc(user.uid).set(initialDoc);
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
  const roadmapName = state.assignedRoadmap || 'Data Analytics';
  return ROADMAPS_DB[roadmapName] || ROADMAPS_DB['Data Analytics'] || [];
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
  } catch (e) { showToast("Sync failed", true); }
}

// ── DATA FETCHING ────────────────────────────────────────────────────────────
function loadDynamicData() {
  db.collection('config').doc('roadmaps').onSnapshot(doc => {
    if (doc.exists) { ROADMAPS_DB = doc.data(); renderDashboard(); renderRoadmap(); }
  });
  db.collection('weeks').onSnapshot(snap => {
    if (!snap.empty) { WEEKS_DB = snap.docs.map(d => d.data()).sort((a,b) => a.w - b.w); renderRoadmap(); }
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
      resources: 'Knowledge Base', 'admin-users': 'User Management', 
      'admin-content': 'Content Manager', profile: 'My Profile'
    };
    titleEl.textContent = titles[id] || 'Learning Portal';
  }

  const renderers = {
    dashboard: renderDashboard, roadmap: renderRoadmap, skills: renderSkills,
    projects: renderProjects, weekly: renderWeekly, resources: renderResources,
    daily: renderLogEntries, 'admin-users': renderAdminUsers, 
    'admin-content': renderAdminContent, profile: renderProfile
  };
  if (renderers[id]) renderers[id]();
}

// ── PAGE RENDERERS ───────────────────────────────────────────────────────────
function renderDashboard() {
  updateKPIs(); renderPhaseProgressBars(); renderHeatmap(); renderRecentLogs(); renderSchedule(); renderLeaderboard();
}

function renderRoadmap() {
  const grid = document.getElementById('week-grid'); if (!grid) return;
  try {
    const activePhases = getActivePhases();
    const roadmapId = state.assignedRoadmap || 'Data Analytics';
    const titleEl = document.getElementById('roadmap-user-title');
    if (titleEl) titleEl.textContent = roadmapId + ' Path';

    renderPhaseFilters(activePhases);

    const filteredPhases = activePhaseFilter === 'all' ? activePhases : activePhases.filter(p => p.id === activePhaseFilter);
    const allWeeks = [].concat(...filteredPhases.map(p => p.weeks));
    
    grid.innerHTML = allWeeks.map(wNum => {
      const w = WEEKS_DB.find(x => x.w === wNum) || { title: 'TBD', goals: '' };
      const status = state.weekStatus[wNum] || 'todo';
      const phase = activePhases.find(p => p.weeks.includes(wNum)) || { color: '#ccc' };
      
      return `
        <div class="week-card ${status==='done'?'done':''}" style="border-top:4px solid ${phase.color}">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span class="badge" style="background:${phase.color}22; color:${phase.color};">WK ${wNum}</span>
            <select onchange="setWeekStatus(${wNum}, this.value)" class="form-select" style="width:auto; height:24px; font-size:10px; padding:0 4px;">
              <option value="todo" ${status==='todo'?'selected':''}>To Do</option>
              <option value="doing" ${status==='doing'?'selected':''}>In Progress</option>
              <option value="done" ${status==='done'?'selected':''}>Completed</option>
            </select>
          </div>
          <div class="week-title">${w.title}</div>
          <div class="week-goals">${w.goals}</div>
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
function setWeekStatus(w, s) { state.weekStatus[w] = s; saveState(); renderRoadmap(); updateKPIs(); }

function renderSkills() {
  const container = document.getElementById('skills-content'); if (!container) return;
  const domainFilter = { all:null, sql:'SQL', python:'Python', powerbi:'Power BI', excel:'Excel', core:'Analytics Core' }[state.activeSkillTab] || null;
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
  const container = document.getElementById('resource-grid'); if (!container) return;
  const filter = state.activeResourceFilter || 'All';
  const filtered = filter === 'All' ? RESOURCES_DB : RESOURCES_DB.filter(r => r.domain === filter);
  container.innerHTML = filtered.map(r => `<div class="resource-item"><div>${r.name}</div><a href="${r.url}" target="_blank">Link</a></div>`).join('');
}

function renderLogEntries() {
  const container = document.getElementById('log-entries-list'); if (!container) return;
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  if (logsUnsub) logsUnsub();
  logsUnsub = db.collection('users').doc(targetUid).collection('logs').orderBy('createdAt','desc').onSnapshot(snap => {
    const logs = snap.docs.map(d => d.data());
    container.innerHTML = logs.map(e => `<div class="card" style="padding:16px; margin-bottom:12px;"><strong>${e.topic}</strong><br><small>${e.date} · ${e.hours}h</small><p>${e.learned}</p></div>`).join('');
  });
}

// ── KPI HELPERS ──────────────────────────────────────────────────────────────
function updateKPIs() {
  const activePhases = getActivePhases();
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
  const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
  const kpis = { 
    'kpi-hours': (state.totalHours || 0).toFixed(1), 
    'kpi-projects': PROJECTS_DB.filter(p => state.projectStatus[p.id] === 'Completed').length, 
    'kpi-skills': SKILLS_DB.filter(s => (state.skillNow[s.key] || 0) >= 3).length, 
    'overall-pct': pct + '%' 
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
    const logMap = {}; snap.docs.forEach(doc => { const e = doc.data(); if (e.date) logMap[e.date] = (logMap[e.date] || 0) + 1; });
    let html = ''; const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date(); d.setDate(now.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const count = logMap[ds] || 0;
      html += `<div class="heatmap-cell" style="opacity: ${0.1 + count * 0.22}; background: var(--teal);" title="${ds}"></div>`;
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
  document.getElementById('profile-bio').value = state.bio || '';
  document.getElementById('profile-dept').value = state.department || '';
  document.getElementById('profile-join').value = state.joiningDate || '';
}
async function saveProfile() {
  state.bio = document.getElementById('profile-bio')?.value;
  state.department = document.getElementById('profile-dept')?.value;
  state.joiningDate = document.getElementById('profile-join')?.value;
  await saveState();
}
async function saveLogEntry() {
  const topic = document.getElementById('log-topic')?.value;
  const learned = document.getElementById('log-learned')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  if (!topic || !learned) return alert("Fill all fields");
  const entry = { topic, learned, hours, date: new Date().toISOString().split('T')[0], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
  await db.collection('users').doc(auth.currentUser.uid).collection('logs').add(entry);
  await db.collection('users').doc(auth.currentUser.uid).update({ totalHours: firebase.firestore.FieldValue.increment(hours) });
  toggleLogForm(); showToast("Logged!");
}
function renderAdminUsers() { fetchEmployees(); }
async function fetchEmployees() {
  const snap = await db.collection('users').get();
  allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function switchViewUser(uid) { viewingUserId = uid; const u = allUsers.find(x => x.id === uid); if (u) { state = { ...defaultState, ...u }; updateUserUI(); renderDashboard(); } }
function toggleLogForm() { const el = document.getElementById('log-form-container'); el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function showToast(msg, isErr) { alert(msg); }
function fixLinks() {}
function renderWeekly() {}
function handleGlobalSearch() {}
function toggleHostEditMode() {}
function renderAdminContent() {}
