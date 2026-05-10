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
async function saveLogEntry() {
  const topic = document.getElementById('log-topic')?.value;
  const learned = document.getElementById('log-learned')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  const date = document.getElementById('log-date')?.value || new Date().toISOString().split('T')[0];
  const week = document.getElementById('log-week')?.value;
  const tool = document.getElementById('log-tool')?.value;
  const mood = state.selectedMood || 3;
  const wins = document.getElementById('log-wins')?.value;
  const handson = document.getElementById('log-handson')?.value;
  const blockers = document.getElementById('log-blockers')?.value;
  const tomorrow = document.getElementById('log-tomorrow')?.value;

  if (!topic || !learned) return alert("Fill topic and learned fields");

  const entry = { 
    topic, learned, hours, date, week, tool, mood, wins, handson, blockers, tomorrow,
    createdAt: firebase.firestore.FieldValue.serverTimestamp() 
  };

  try {
    const userRef = db.collection('users').doc(auth.currentUser.uid);
    await userRef.collection('logs').add(entry);
    await userRef.update({ 
      totalHours: firebase.firestore.FieldValue.increment(hours),
      streak: firebase.firestore.FieldValue.increment(1) // Simple streak increment for now
    });
    toggleLogForm(); 
    showToast("Session Logged!");
    renderDashboard();
  } catch (e) { showToast("Failed to save log", true); }
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
    <div class="user-item" onclick="switchViewUser('${u.id}')" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--navy3); border-radius:8px; cursor:pointer; margin-bottom:8px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <div class="avatar" style="width:32px; height:32px; font-size:12px;">${(u.firstName?.[0]||'')+ (u.lastName?.[0]||'')}</div>
        <div>
          <div style="font-weight:600; font-size:13px;">${u.firstName} ${u.lastName || ''}</div>
          <div style="font-size:10px; color:var(--text3);">${u.role?.toUpperCase() || 'USER'}</div>
        </div>
      </div>
      <div class="badge" style="background:var(--blue)22; color:var(--blue2);">${u.assignedRoadmap || 'None'}</div>
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
  } catch (e) { showToast("Failed to assign", true); }
}

async function switchViewUser(uid) { 
  viewingUserId = uid; 
  const u = allUsers.find(x => x.id === uid); 
  if (u) { 
    state = { ...defaultState, ...u }; 
    updateUserUI(); 
    renderDashboard(); 
    showPage('dashboard', document.querySelector('.nav-item[onclick*="dashboard"]'));
  } 
}

function toggleLogForm() { const el = document.getElementById('log-form-container'); el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function showToast(msg, isErr) {
  const toast = document.getElementById('save-toast');
  const text = document.getElementById('save-toast-text');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.style.background = isErr ? 'var(--red)' : 'var(--blue)';
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 3000);
}

function toggleFocusMode() {
  document.body.classList.toggle('focus-active');
  const btn = document.getElementById('focus-mode-btn');
  if (btn) {
    const isActive = document.body.classList.contains('focus-active');
    btn.innerHTML = isActive ? 'Exit Focus' : '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> Focus Mode';
  }
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
    } else if (filter === 'sql' && header === 'sql') {
      shouldShow = true;
    } else if (filter === 'python' && header === 'python') {
      shouldShow = true;
    } else if (filter === 'powerbi' && header === 'power bi') {
      shouldShow = true;
    } else if (filter === 'excel' && header === 'excel') {
      shouldShow = true;
    } else if (filter === 'core' && header === 'analytics core') {
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
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  
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
// ... rest of the function exists ...
  const review = state.weekReviews?.[weekNum] || {};
  
  // Update UI Elements
  const elements = {
    'review-week-label': weekNum,
    'display-topics': review.topics || 'No logs for this week yet.',
    'display-handson': review.handson || 'No practical work logged.',
    'display-win': review.wins || 'No breakthroughs recorded.',
    'display-blocker': review.blockers || 'No blockers reported.',
    'display-focus': review.focus || 'Next week focus not set.',
    'review-hours-display': review.hours || 0,
    'review-status-badge': review.status || 'Draft'
  };

  Object.entries(elements).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // Toggle Edit Visibility
  const editFields = ['topics', 'handson', 'win', 'blocker', 'focus', 'hours'];
  editFields.forEach(f => {
    const display = document.getElementById('display-' + f);
    const edit = document.getElementById('edit-' + f);
    if (display && edit) {
      display.style.display = isHostEditMode ? 'none' : 'block';
      edit.style.display = isHostEditMode ? 'block' : 'none';
      if (isHostEditMode) edit.value = review[f] || display.textContent;
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
  WEEKS_DB.push({ w: nextW, title: 'New Week', goals: 'Enter goals here', phase: 'p1' });
  renderAdminContent();
}

function addProjectItem() {
  const nextNum = PROJECTS_DB.length + 1;
  PROJECTS_DB.push({ id: 'proj' + nextNum, num: nextNum.toString().padStart(2, '0'), title: 'New Project', color: '#3B82F6', tools: ['SQL'], tasks: ['Task 1'], status: 'Not Started' });
  renderAdminContent();
}

async function saveRoadmapConfig() {
  try {
    await db.collection('config').doc('roadmaps').set(ROADMAPS_DB);
    // For weeks/projects, we might need to batch update or set whole collection if small
    // Simpler: just loop and set for now if counts are low
    const batch = db.batch();
    WEEKS_DB.forEach(w => batch.set(db.collection('weeks').doc('w'+w.w), w));
    PROJECTS_DB.forEach(p => batch.set(db.collection('projects').doc(p.id), p));
    await batch.commit();
    showToast("Content Saved Globally");
  } catch (e) { showToast("Global Save Failed", true); }
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
});
