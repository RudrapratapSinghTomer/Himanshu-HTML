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
let activePhaseFilter = null;

// ── ERROR HANDLING ──────────────────────────────────────────────────────────
window.onerror = (m, s, l, c, e) => { console.error("Global Error:", m, e); return false; };
window.onunhandledrejection = (e) => { console.error("Unhandled Rejection:", e.reason); };

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

    // 2. Listen to App Config (Roadmaps, etc.)
    configUnsub = db.collection('config').onSnapshot(snap => {
      snap.forEach(doc => {
        if (doc.id === 'roadmaps') ROADMAPS_DB = doc.data();
      });
      renderRoadmap();
    });

    // 3. Listen to All Users (Host Only)
    // We check role after first self-load
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
    }, 1000);

    initApp();
  } else {
    document.body.classList.remove('auth');
    myRole = 'user'; state = { ...defaultState }; me = {}; allUsers = [];
    updateUserUI();
  }
});

function getActivePhases() {
  const roadmapName = state.assignedRoadmap || 'Data Analytics';
  return ROADMAPS_DB[roadmapName] || ROADMAPS_DB['Data Analytics'] || [];
}

function updateUserUI() {
  try {
    const u = (me && me.firstName) ? me : state;
    const emailPrefix = (auth.currentUser?.email || 'User').split('@')[0];
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
        welcomeSub.innerHTML = `Today is <span id="today-date" style="color:var(--blue2); font-weight:600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> · You've completed ${pct}% of your roadmap. Keep the momentum!`;
      }
    } catch (e) { console.error("Sub-UI error:", e); }

    if (sidebarName) sidebarName.textContent = `${fName} ${lName}`;
    if (avatar) avatar.textContent = (fName[0] || '') + (lName[0] || '');
    if (roleBadge) roleBadge.textContent = (u.role || myRole || 'user').toUpperCase();
    document.querySelectorAll('.host-only').forEach(el => el.style.display = (myRole === 'host') ? 'flex' : 'none');
  } catch (e) { console.error("Global UI Update Error:", e); }
}

async function saveState() {
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  try {
    // If we are editing ourselves, we update 'state'
    // If we are host editing someone else, 'state' already holds that user's data
    await db.collection('users').doc(targetUid).set({
      ...state,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    showToast("Saved to Cloud");
  } catch (e) { showToast("Sync failed", true); }
}

// ── DYNAMIC DATA ─────────────────────────────────────────────────────────────
let ROADMAPS_DB = ROADMAPS;
let WEEKS_DB = WEEKS;
let PROJECTS_DB = PROJECTS;
let RESOURCES_DB = RESOURCES;
let SKILLS_DB = SKILLS;

async function loadDynamicData() {
  // Listen to Global Roadmaps
  db.collection('config').doc('roadmaps').onSnapshot(doc => {
    if (doc.exists) {
      ROADMAPS_DB = doc.data();
      if (myRole === 'host') renderAdminContent();
      renderDashboard(); renderRoadmap();
    }
  });

  // Listen to Weeks
  db.collection('weeks').onSnapshot(snap => {
    if (!snap.empty) {
      WEEKS_DB = snap.docs.map(d => d.data()).sort((a,b) => a.w - b.w);
      if (myRole === 'host') renderAdminContent();
      renderDashboard(); renderRoadmap();
    }
  });

  // Listen to Projects
  db.collection('projects').onSnapshot(snap => {
    if (!snap.empty) {
      PROJECTS_DB = snap.docs.map(d => d.data()).sort((a,b) => a.num - b.num);
      if (myRole === 'host') renderAdminContent();
      renderDashboard(); renderProjects();
    }
  });

  // Listen to Resources
  db.collection('resources').onSnapshot(snap => {
    if (!snap.empty) {
      RESOURCES_DB = snap.docs.map(d => d.data());
      renderResources();
    }
  });

  // Listen to Skills
  db.collection('skills').onSnapshot(snap => {
    if (!snap.empty) {
      SKILLS_DB = snap.docs.map(d => d.data());
      renderSkills();
    }
  });
}

async function initApp() {
  await loadDynamicData();
  const keys = ['skillNow', 'projectStatus', 'projectTasks', 'weekStatus', 'logEntries', 'weekReviews'];
  keys.forEach(k => { if (!state[k]) state[k] = (k === 'logEntries' ? [] : {}); });
  
  SKILLS_DB.forEach(s => { if (state.skillNow[s.key] === undefined) state.skillNow[s.key] = 0; });
  PROJECTS_DB.forEach(p => { 
    if (!state.projectStatus[p.id]) state.projectStatus[p.id] = p.status; 
    if (!state.projectTasks[p.id]) state.projectTasks[p.id] = p.tasks.map(() => 0);
  });
  
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  
  const logWeekSel = document.getElementById('log-week');
  if (logWeekSel) logWeekSel.innerHTML = Array.from({length: 20}, (_, i) => `<option value="${i+1}">Week ${i+1}</option>`).join('');
  
  renderDashboard();
  if (myRole === 'host') fetchEmployees();
  fixLinks();
}

function showPage(id, btn) {
  const pageEl = document.getElementById('page-' + id);
  if (!pageEl) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  pageEl.classList.add('active');
  if (btn) btn.classList.add('active');
  
  // Update Topbar Title
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

async function handleAdminAssign() {
  const userId = document.getElementById('admin-user-select')?.value;
  const roadmapId = document.getElementById('admin-roadmap-select')?.value;
  if (!userId || !roadmapId) return showToast("Select user and roadmap", true);
  
  try {
    await db.collection('users').doc(userId).update({ assignedRoadmap: roadmapId });
    showToast("Roadmap assigned!");
  } catch (e) { showToast("Assignment failed", true); }
}

function renderProfile() {
  const bio = document.getElementById('profile-bio');
  const dept = document.getElementById('profile-dept');
  const join = document.getElementById('profile-join');
  if (bio) bio.value = state.bio || '';
  if (dept) dept.value = state.department || '';
  if (join) join.value = state.joiningDate || '';
  updateUserUI(); // Update avatar/name on profile page
}

async function saveProfile() {
  state.bio = document.getElementById('profile-bio')?.value;
  state.department = document.getElementById('profile-dept')?.value;
  state.joiningDate = document.getElementById('profile-join')?.value;
  await saveState();
}

function renderAdminContent() {
  if (myRole !== 'host') return;
  
  // 1. Roadmaps Editor
  const roadmapsList = document.getElementById('admin-roadmaps-list');
  if (roadmapsList) {
    roadmapsList.innerHTML = Object.entries(ROADMAPS_DB).map(([name, phases]) => `
      <div class="card" style="padding:16px; background:var(--navy4); border:1px solid var(--border);">
        <div style="font-weight:800; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <span>${name}</span>
          <span style="font-size:10px; color:var(--text3);">${phases.length} Phases</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${phases.map((p, pIdx) => `
            <div style="font-size:12px; padding:12px; background:var(--navy3); border-radius:8px; border:1px solid var(--border);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <input type="text" value="${p.name}" onchange="updateRoadmapPhase('${name}', ${pIdx}, 'name', this.value)" 
                  style="background:transparent; border:none; color:var(--text); font-weight:700; width:70%; border-bottom:1px solid transparent; hover:border-border;">
                <button class="btn-sm" style="background:var(--red)22; color:var(--red); font-size:9px;" onclick="deleteRoadmapPhase('${name}', ${pIdx})">Remove</button>
              </div>
              <div style="font-size:10px; color:var(--text3); margin-bottom:4px;">Weeks (Comma separated)</div>
              <input type="text" value="${p.weeks.join(', ')}" onchange="updateRoadmapPhase('${name}', ${pIdx}, 'weeks', this.value)"
                style="background:var(--navy4); border:1px solid var(--border); border-radius:4px; color:var(--text2); font-size:11px; width:100%; padding:4px 8px;">
            </div>
          `).join('')}
          <button class="btn-sm" style="margin-top:8px; width:100%;" onclick="addRoadmapPhase('${name}')">+ Add Phase to ${name}</button>
        </div>
      </div>
    `).join('');
  }

  // 2. Weeks Editor
  const weeksList = document.getElementById('admin-weeks-list');
  if (weeksList) {
    weeksList.innerHTML = WEEKS_DB.map(w => `
      <div style="padding:12px; background:var(--navy3); border-radius:8px; border:1px solid var(--border); position:relative;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <div style="font-weight:700; font-size:10px; color:var(--text3);">WEEK ${w.w}</div>
          <button onclick="deleteDBItem('weeks', '${w.w}')" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:14px;">&times;</button>
        </div>
        <input type="text" value="${w.title}" onchange="updateDBItem('weeks', '${w.w}', 'title', this.value)" 
          style="background:transparent; border:none; color:var(--text); font-size:14px; width:100%; border-bottom:1px solid transparent; hover:border-border;">
      </div>
    `).join('');
  }

  // 3. Projects Editor
  const projectsList = document.getElementById('admin-projects-list');
  if (projectsList) {
    projectsList.innerHTML = PROJECTS_DB.map(p => `
      <div style="padding:12px; background:var(--navy3); border-radius:8px; border:1px solid var(--border);">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <div style="font-weight:700; font-size:10px; color:var(--text3);">PROJ ${p.num}</div>
          <button onclick="deleteDBItem('projects', '${p.id}')" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:14px;">&times;</button>
        </div>
        <input type="text" value="${p.title}" onchange="updateDBItem('projects', '${p.id}', 'title', this.value)" 
          style="background:transparent; border:none; color:var(--text); font-size:14px; width:100%; border-bottom:1px solid transparent; hover:border-border;">
      </div>
    `).join('');
  }
}

async function updateRoadmapPhase(rName, pIdx, field, value) {
  const roadmap = ROADMAPS_DB[rName];
  if (field === 'weeks') {
    roadmap[pIdx].weeks = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  } else {
    roadmap[pIdx][field] = value;
  }
  await db.collection('config').doc('roadmaps').update({ [rName]: roadmap });
  showToast("Roadmap updated");
}

async function addRoadmapPhase(rName) {
  const roadmap = ROADMAPS_DB[rName];
  roadmap.push({ name: 'New Phase', weeks: [] });
  await db.collection('config').doc('roadmaps').update({ [rName]: roadmap });
}

async function deleteRoadmapPhase(rName, pIdx) {
  if (!confirm('Delete this phase?')) return;
  const roadmap = ROADMAPS_DB[rName];
  roadmap.splice(pIdx, 1);
  await db.collection('config').doc('roadmaps').update({ [rName]: roadmap });
}

async function updateDBItem(collection, id, field, value) {
  try {
    await db.collection(collection).doc(id).set({ [field]: value }, { merge: true });
    showToast(`Updated ${collection}`);
  } catch (e) { showToast("Update failed", true); }
}

async function deleteDBItem(collection, id) {
  if (!confirm(`Delete item ${id} from ${collection}?`)) return;
  try {
    await db.collection(collection).doc(id).delete();
    showToast("Deleted item");
  } catch (e) { showToast("Delete failed", true); }
}

async function addWeekItem() {
  const nextW = (WEEKS_DB.length > 0 ? Math.max(...WEEKS_DB.map(w => w.w)) : 0) + 1;
  await db.collection('weeks').doc(nextW.toString()).set({ w: nextW, title: 'New Week Title' });
}

async function addProjectItem() {
  const nextNum = (PROJECTS_DB.length > 0 ? Math.max(...PROJECTS_DB.map(p => p.num)) : 0) + 1;
  const id = 'proj' + nextNum;
  await db.collection('projects').doc(id).set({ id, num: nextNum, title: 'New Project', tasks: ['Task 1'], color: '#4cc9f0' });
}

// ── UTILS ────────────────────────────────────────────────────────────────────
function getActivePhases() {
  const roadmapName = state.assignedRoadmap || 'Data Analytics';
  return ROADMAPS_DB[roadmapName] || ROADMAPS_DB['Data Analytics'] || [];
}

// ── RENDERING ────────────────────────────────────────────────────────────────
function renderDashboard() {
  updateKPIs(); renderPhaseProgressBars(); renderHeatmap(); renderRecentLogs(); renderSchedule(); renderLeaderboard();
}


function renderRecentLogs() {
  const container = document.getElementById('recent-logs-list'); if (!container) return;
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;

  db.collection('users').doc(targetUid).collection('logs')
    .orderBy('createdAt', 'desc').limit(3).get()
    .then(snap => {
      const recent = snap.docs.map(d => d.data());
      if (recent.length === 0) { container.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:10px;">No logs yet.</div>'; return; }
      container.innerHTML = recent.map(e => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:var(--navy3); border-radius:8px; margin-bottom:8px;">
          <div>
            <div style="font-size:13px; font-weight:600;">${e.topic}</div>
            <div style="font-size:10px; color:var(--text3);">${e.date}</div>
          </div>
          <div class="badge" style="background:var(--navy4);">${e.hours}h</div>
        </div>
      `).join('');
    });
}

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
  const circle = document.getElementById('circle-progress-done');
  if (circle) circle.style.strokeDashoffset = 226 - (226 * pct) / 100;
  
  const streakEl = document.getElementById('kpi-streak');
  if (streakEl) streakEl.textContent = state.streak || 0;

  if (myRole === 'host') {
    const totalProgress = allUsers.reduce((sum, u) => {
      const uRoadmap = ROADMAPS_DB[u.assignedRoadmap || 'Data Analytics'] || ROADMAPS_DB['Data Analytics'];
      const uAllWeeks = [].concat(...uRoadmap.map(p => p.weeks));
      const uDoneWeeks = uAllWeeks.filter(w => (u.weekStatus && u.weekStatus[w]) === 'done').length;
      return sum + (uAllWeeks.length > 0 ? (uDoneWeeks / uAllWeeks.length) : 0);
    }, 0);
    const avgProgress = allUsers.length > 0 ? Math.round((totalProgress / allUsers.length) * 100) : 0;
    
    const hostKpis = {
      'host-kpi-avg': avgProgress + '%',
      'host-kpi-active': allUsers.length,
      'host-kpi-reviews': allUsers.filter(u => Object.values(u.weekReviews || {}).some(r => r.status === 'Submitted')).length
    };
    Object.entries(hostKpis).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
  }
}


function renderPhaseProgressBars() {
  const el = document.getElementById('phase-progress-bars'); if (!el) return;
  el.innerHTML = getActivePhases().map(p => {
    const done = p.weeks.filter(w => state.weekStatus[w] === 'done').length;
    const pct = Math.round((done / p.weeks.length) * 100);
    return `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:11px;"><span>${p.name}</span><span>${pct}%</span></div><div class="progress-track" style="height:4px;"><div class="progress-fill" style="width:${pct}%;background:${p.color};"></div></div></div>`;
  }).join('');
}

function renderRoadmap() {
  const grid = document.getElementById('week-grid'); if (!grid) return;
  try {
    const activePhases = getActivePhases();
    renderPhaseFilters(activePhases);
    const validWeeks = [].concat(...activePhases.map(p => p.weeks));
    let weeks = WEEKS_DB.filter(w => validWeeks.includes(w.w));
    if (activePhaseFilter) weeks = weeks.filter(w => w.phase === activePhaseFilter);
    if (weeks.length === 0) { grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3);">No data found.</div>'; return; }
    grid.innerHTML = weeks.map(w => {
      const status = state.weekStatus[w.w] || 'todo';
      return `<div class="week-card ${status === 'active' ? 'current' : ''} ${status === 'done' ? 'done' : ''}"><div class="week-num">WK ${w.w}</div><div class="week-title">${w.title}</div><div class="week-tools">${w.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}</div><div style="font-size:11px;color:var(--text3);margin-top:8px;">${w.goals}</div>${status !== 'done' ? `<div style="display:flex;gap:4px;margin-top:12px;"><button onclick="setWeekStatus(${w.w},'todo')" class="btn-sm">Todo</button><button onclick="setWeekStatus(${w.w},'active')" class="btn-sm">Active</button><button onclick="setWeekStatus(${w.w},'done')" class="btn-sm">Done</button></div>`:''}</div>`;
    }).join('');
  } catch (e) { grid.innerHTML = `<div style="color:var(--red);padding:20px;">Render Error: ${e.message}</div>`; }
}

function renderPhaseFilters(phases) {
  const container = document.getElementById('phase-filter-bar'); if (!container) return;
  const allBtn = `<button class="phase-btn ${!activePhaseFilter?'active':''}" onclick="setPhaseFilter(null)">All Phases</button>`;
  container.innerHTML = allBtn + phases.map(p => `<button class="phase-btn ${activePhaseFilter===p.name?'active':''}" onclick="setPhaseFilter('${p.name}')">${p.name}</button>`).join('');
}

function renderRoadmap() {
  const container = document.getElementById('week-grid'); if (!container) return;
  try {
    const activePhases = getActivePhases();
    const roadmapId = state.assignedRoadmap || 'Data Analytics';
    
    // Header update
    const titleEl = document.getElementById('roadmap-user-title');
    if (titleEl) titleEl.textContent = roadmapId + ' Path';

    renderPhaseFilters(activePhases);

    const filteredPhases = activePhaseFilter === 'all' ? activePhases : activePhases.filter(p => p.id === activePhaseFilter);
    const allWeeks = [].concat(...filteredPhases.map(p => p.weeks));
    
    container.innerHTML = allWeeks.map(wNum => {
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
          <div style="margin-top:auto; font-size:10px; color:var(--text3); border-top:1px solid var(--border); padding-top:8px;">
             ${w.tools ? (Array.isArray(w.tools) ? w.tools.join(' · ') : w.tools) : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) { 
    console.error(e);
    container.innerHTML = `<div style="color:var(--red); padding:20px;">Render Error: ${e.message}</div>`; 
  }
}

let activePhaseFilter = 'all';
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
        <div style="display:flex;justify-content:space-between;font-size:10px;">
          <span>PROJ ${p.num}</span>
          <span class="badge ${status==='Completed'?'status-done':''}">${status}</span>
        </div>
        <div style="font-weight:700;margin:12px 0 8px 0; font-size:15px;">${p.title}</div>
        
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:4px;">
            <span>Tasks</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-track" style="height:4px; background:var(--navy3);">
            <div class="progress-fill" style="width:${pct}%; background:${p.color};"></div>
          </div>
        </div>

        <div class="project-tasks" style="display:flex; flex-direction:column; gap:6px; margin-bottom:16px;">
          ${p.tasks.map((t, idx) => `
            <label style="display:flex; align-items:center; gap:8px; font-size:11px; cursor:pointer; opacity:${taskStatus[idx]?'0.6':'1'};">
              <input type="checkbox" ${taskStatus[idx]?'checked':''} onchange="toggleProjectTask('${p.id}', ${idx})" style="accent-color:${p.color};">
              <span style="${taskStatus[idx]?'text-decoration:line-through;':''}">${t}</span>
            </label>
          `).join('')}
        </div>

        <select onchange="updateProjectStatus('${p.id}',this.value)" class="form-select" style="font-size:11px; height:32px; padding:0 8px;">
          <option value="Not Started" ${status==='Not Started'?'selected':''}>Not Started</option>
          <option value="In Progress" ${status==='In Progress'?'selected':''}>In Progress</option>
          <option value="Completed" ${status==='Completed'?'selected':''}>Completed</option>
        </select>
      </div>
    `;
  }).join('');
}

function toggleProjectTask(pid, tidx) {
  if (!state.projectTasks[pid]) state.projectTasks[pid] = PROJECTS_DB.find(p => p.id === pid).tasks.map(() => 0);
  state.projectTasks[pid][tidx] = state.projectTasks[pid][tidx] ? 0 : 1;
  saveState();
  renderProjects();
  updateKPIs();
}

function updateProjectStatus(id, v) { state.projectStatus[id] = v; saveState(); renderProjects(); updateKPIs(); }


function renderResources() {
  const container = document.getElementById('resource-grid'); if (!container) return;
  const filter = state.activeResourceFilter || 'All';
  const filtered = filter === 'All' ? RESOURCES_DB : RESOURCES_DB.filter(r => r.domain === filter);
  container.innerHTML = filtered.map(r => `<div class="resource-item"><div>${r.name}</div><div style="font-size:10px;color:var(--text3);">${r.domain}</div><a href="${r.url}" target="_blank">Link</a></div>`).join('');
  renderResourceFilters();
}

function renderResourceFilters() {
  const container = document.getElementById('resource-filter'); if (!container) return;
  const domains = ['All', ...new Set(RESOURCES_DB.map(r => r.domain))];
  const active = state.activeResourceFilter || 'All';
  container.innerHTML = domains.map(d => `<button class="tab-btn ${d===active?'active':''}" onclick="setResourceFilter('${d}')">${d}</button>`).join('');
}

function setResourceFilter(f) { state.activeResourceFilter = f; renderResources(); }

async function saveLogEntry() {
  const week = document.getElementById('log-week')?.value;
  const tool = document.getElementById('log-tool')?.value;
  const topic = document.getElementById('log-topic')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  const learned = document.getElementById('log-learned')?.value;
  
  if (!topic || !learned) { showToast("Please fill all fields", true); return; }
  
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;

  const entry = {
    date: new Date().toISOString().split('T')[0],
    week: parseInt(week),
    tool,
    topic,
    hours,
    learned,
    mood: state.selectedMood || 3,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Streak logic
  let newStreak = state.streak || 0;
  const lastDate = state.lastLogDate;
  const today = new Date().toISOString().split('T')[0];
  if (lastDate !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (lastDate === yStr) newStreak++;
    else newStreak = 1;
  }

  try {
    const batch = db.batch();
    const logRef = db.collection('users').doc(targetUid).collection('logs').doc();
    batch.set(logRef, entry);
    
    const userRef = db.collection('users').doc(targetUid);
    batch.set(userRef, { 
      totalHours: firebase.firestore.FieldValue.increment(hours),
      lastLogDate: today,
      streak: newStreak
    }, { merge: true });
    
    await batch.commit();
    
    toggleLogForm();
    showToast("Session logged!");
    
    // Clear form
    document.getElementById('log-topic').value = '';
    document.getElementById('log-learned').value = '';
  } catch (e) { showToast("Failed to log session", true); }
}

let logsUnsub = null;
function renderLogEntries() {
  const container = document.getElementById('log-entries-list'); if (!container) return;
  const q = document.getElementById('log-search')?.value.toLowerCase() || '';
  const tool = document.getElementById('log-filter-tool')?.value || '';
  
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;

  if (logsUnsub) logsUnsub();
  
  logsUnsub = db.collection('users').doc(targetUid).collection('logs')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      let filtered = snap.docs.map(d => d.data());
      if (q) filtered = filtered.filter(e => (e.topic||'').toLowerCase().includes(q) || (e.learned||'').toLowerCase().includes(q));
      if (tool) filtered = filtered.filter(e => e.tool === tool);

      if (filtered.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text3);">No entries found.</div>';
        return;
      }

      container.innerHTML = filtered.map(e => `
        <div class="card" style="padding:20px; margin-bottom:16px; border-left:4px solid var(--teal); position:relative;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <div style="font-size:11px; color:var(--text3);">${e.date} · Week ${e.week}</div>
            <div class="tag">${e.tool || 'General'}</div>
          </div>
          <div style="font-size:16px; font-weight:700; margin-bottom:8px; color:var(--text);">${e.topic}</div>
          <div style="font-size:13px; color:var(--text2); line-height:1.6; margin-bottom:12px;">${e.learned}</div>
          <div style="display:flex; gap:12px; font-size:11px; color:var(--text3);">
            <span>⏱️ ${e.hours}h</span>
            ${e.mood ? `<span>🎭 Mood: ${['','😴','','🙂','','🔥'][e.mood] || '🙂'}</span>` : ''}
          </div>
        </div>
      `).join('');
      
      const tag = document.getElementById('log-count-tag');
      if (tag) tag.textContent = `${filtered.length} entries`;
    });
}

async function fetchEmployees() {
  try {
    const snap = await db.collection('users').get();
    allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Roadmap Page List
    const list = document.getElementById('employee-progress-list');
    if (list) list.innerHTML = allUsers.map(u => `
      <div onclick="switchViewUser('${u.id}')" style="display:flex; justify-content:space-between; align-items:center; padding:12px; cursor:pointer; border-bottom:1px solid var(--border); hover:background:var(--navy3); border-radius:8px;">
        <div>
          <div style="font-size:14px; font-weight:600;">${u.firstName} ${u.lastName}</div>
          <div style="font-size:11px; color:var(--text3);">${u.assignedRoadmap || 'No Roadmap'}</div>
        </div>
        <div class="badge">${u.role || 'user'}</div>
      </div>
    `).join('');
    
    // Admin Page List
    const adminList = document.getElementById('admin-users-list');
    if (adminList) adminList.innerHTML = allUsers.map(u => {
      const hours = (u.logEntries || []).reduce((s, e) => s + (e.hours || 0), 0);
      return `
        <div class="card" style="padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700;">${u.firstName} ${u.lastName}</div>
            <div style="font-size:11px; color:var(--text3);">${u.email}</div>
          </div>
          <div style="display:flex; gap:20px; align-items:center;">
            <div style="text-align:right;">
              <div style="font-size:10px; color:var(--text3); text-transform:uppercase;">Effort</div>
              <div style="font-weight:700; color:var(--teal2);">${hours.toFixed(1)}h</div>
            </div>
            <button class="btn-sm" onclick="switchViewUser('${u.id}')">View Details</button>
          </div>
        </div>
      `;
    }).join('');

    const select = document.getElementById('admin-user-select');
    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">Select an employee...</option>' + 
        allUsers.map(u => `<option value="${u.id}" ${u.id===currentVal?'selected':''}>${u.firstName} ${u.lastName}</option>`).join('');
    }
    
    const countTag = document.getElementById('employee-count-tag');
    if (countTag) countTag.textContent = `${allUsers.length} Employees`;
    
    const adminCount = document.getElementById('admin-user-count');
    if (adminCount) adminCount.textContent = `${allUsers.length} Users`;
  } catch (e) { console.error(e); }
}

async function switchViewUser(uid) {
  if (auth.currentUser && uid === auth.currentUser.uid) { viewingUserId = null; await loadFromFirestore(uid); }
  else { viewingUserId = uid; const u = allUsers.find(x => x.id === uid); if (u) { state = { ...defaultState, ...u }; updateUserUI(); renderRoadmap(); } }
}

async function renderAdminUsers() { if (myRole !== 'host') return; await fetchEmployees(); }

function renderHeatmap() {
  const container = document.getElementById('heatmap'); if (!container) return;
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;

  // Fetch all logs to build heatmap map
  db.collection('users').doc(targetUid).collection('logs').get().then(snap => {
    const logMap = {};
    snap.docs.forEach(doc => {
      const e = doc.data();
      if (e.date) logMap[e.date] = (logMap[e.date] || 0) + 1;
    });

    let html = '';
    const now = new Date();
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = logMap[dateStr] || 0;
      const level = Math.min(count, 4);
      html += `<div class="heatmap-cell" style="opacity: ${0.1 + level * 0.22}; background: var(--teal);" title="${dateStr}: ${count} sessions"></div>`;
    }
    container.innerHTML = html;
  });
}

function renderSchedule() {
  const container = document.getElementById('today-schedule-list'); if (!container) return;
  const activePhases = getActivePhases();
  const validWeeks = [].concat(...activePhases.map(p => p.weeks));
  const currentWeekNum = Object.keys(state.weekStatus).find(w => state.weekStatus[w] === 'active') || validWeeks[0];
  const weekData = WEEKS_DB.find(w => w.w == currentWeekNum);
  
  if (!weekData) {
    container.innerHTML = '<div style="font-size:12px; color:var(--text3); padding:10px;">No active roadmap goals for today.</div>';
    return;
  }

  const items = weekData.goals.split(',').slice(0, 3).map((goal, idx) => ({
    time: ['09:00 AM', '11:30 AM', '03:00 PM'][idx] || 'TBD',
    task: goal.trim(),
    status: idx === 0 ? 'done' : (idx === 1 ? 'active' : 'todo')
  }));

  container.innerHTML = items.map(i => `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; padding:10px; background:var(--navy3); border-radius:8px;">
      <div style="font-size:10px; color:var(--text3); width:60px;">${i.time}</div>
      <div style="flex:1; font-size:13px; color:var(--text); ${i.status==='done'?'text-decoration:line-through;opacity:0.6':''}">${i.task}</div>
      <div class="status-dot status-${i.status}" style="width:8px; height:8px; border-radius:50%;"></div>
    </div>
  `).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list'); if (!container) return;
  
  const userScores = allUsers.map(u => {
    const hours = (u.logEntries || []).reduce((s, e) => s + (e.hours || 0), 0);
    const projects = Object.values(u.projectStatus || {}).filter(s => s === 'Completed').length;
    const streak = u.streak || 0;
    return { name: `${u.firstName} ${u.lastName[0]}.`, score: Math.round(hours + (projects * 20)), streak };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  if (userScores.length === 0) {
    container.innerHTML = '<div style="font-size:12px; color:var(--text3); padding:10px;">No learners yet.</div>';
    return;
  }

  container.innerHTML = userScores.map((u, idx) => `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border);">
      <div style="font-weight:800; color:var(--blue2); width:20px;">${idx+1}</div>
      <div style="flex:1; font-size:13px;">${u.name}</div>
      <div style="font-size:11px; color:var(--orange2);">🔥 ${u.streak}d</div>
      <div style="font-size:12px; font-weight:600;">${u.score} pts</div>
    </div>
  `).join('');
}

function handleGlobalSearch(q) {
  const resultsDiv = document.getElementById('search-results');
  if (!q || q.length < 2) { if (resultsDiv) resultsDiv.style.display = 'none'; return; }
  
  if (!resultsDiv) {
    const div = document.createElement('div');
    div.id = 'search-results';
    div.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:var(--navy3); border:1px solid var(--border); border-radius:12px; max-height:300px; overflow-y:auto; z-index:1000; margin-top:8px; box-shadow:var(--shadow);';
    document.querySelector('.global-search-wrap').appendChild(div);
  }
  
  const resultsDivFixed = document.getElementById('search-results');
  resultsDivFixed.style.display = 'block';
  
  const matches = [
    ...WEEKS_DB.filter(w => w.title.toLowerCase().includes(q.toLowerCase())).map(w => ({ type: 'Roadmap', title: w.title, id: 'roadmap' })),
    ...PROJECTS_DB.filter(p => p.title.toLowerCase().includes(q.toLowerCase())).map(p => ({ type: 'Project', title: p.title, id: 'projects' })),
    ...RESOURCES_DB.filter(r => r.name.toLowerCase().includes(q.toLowerCase())).map(r => ({ type: 'Resource', title: r.name, id: 'resources' }))
  ];
  
  if (matches.length === 0) {
    resultsDivFixed.innerHTML = '<div style="padding:12px; font-size:12px; color:var(--text3);">No results found</div>';
  } else {
    resultsDivFixed.innerHTML = matches.map(m => `
      <div onclick="showPage('${m.id}'); document.getElementById('search-results').style.display='none';" style="padding:10px 16px; cursor:pointer; border-bottom:1px solid var(--border); hover:background:var(--navy4);">
        <div style="font-size:10px; color:var(--blue2); text-transform:uppercase;">${m.type}</div>
        <div style="font-size:13px;">${m.title}</div>
      </div>
    `).join('');
  }
}

function showTab(page, tab, btn) {
  if (page === 'skills') {
    state.activeSkillTab = tab;
    document.querySelectorAll('#page-skills .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSkills();
  }
}

let hostEditMode = false;
function toggleHostEditMode() {
  hostEditMode = !hostEditMode;
  const btn = document.getElementById('host-edit-mode-btn');
  if (btn) {
    btn.textContent = `Edit Mode: ${hostEditMode ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', hostEditMode);
  }
  
  const displayEls = ['topics', 'handson', 'win', 'blocker', 'focus'];
  displayEls.forEach(id => {
    const d = document.getElementById('display-' + id);
    const e = document.getElementById('edit-' + id);
    if (d && e) {
      d.style.display = hostEditMode ? 'none' : 'block';
      e.style.display = hostEditMode ? 'block' : 'none';
      if (hostEditMode) e.value = d.textContent.trim() === 'No entry.' ? '' : d.textContent.trim();
    }
  });
  
  const saveBtn = document.getElementById('review-save-btn');
  const actionBtn = document.getElementById('review-action-btn');
  if (saveBtn) saveBtn.style.display = hostEditMode ? 'block' : 'none';
  if (actionBtn) actionBtn.style.display = hostEditMode ? 'none' : 'block';
}

async function renderWeekly() {
  const w = state.selectedReviewWeek || 1; 
  const r = (state.weekReviews || {})[w] || { status: 'Draft' };
  
  const weekLabel = document.getElementById('review-week-label');
  if (weekLabel) weekLabel.textContent = w;

  const grid = document.getElementById('review-week-grid');
  if (grid) grid.innerHTML = Array.from({length:20}, (_, i) => `
    <div class="review-week-btn ${i+1===w?'active':''} ${state.weekReviews?.[i+1]?.status === 'Submitted' ? 'submitted' : ''}" 
         onclick="selectReviewWeek(${i+1})">WK ${i+1}</div>
  `).join('');

  // Listen to logs for this week in real-time
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  
  if (window.weeklyLogsUnsub) window.weeklyLogsUnsub();
  
  window.weeklyLogsUnsub = db.collection('users').doc(targetUid).collection('logs')
    .where('week', '==', w)
    .onSnapshot(snap => {
      const weekLogs = snap.docs.map(d => d.data());
      const weekHours = weekLogs.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      
      const logsSummary = document.getElementById('weekly-logs-summary');
      if (logsSummary) {
        if (weekLogs.length === 0) {
          logsSummary.innerHTML = '<span style="font-size:12px; color:var(--text3);">No daily logs found for this week.</span>';
        } else {
          logsSummary.innerHTML = weekLogs.map(l => `
            <span class="tag" style="background:var(--navy3); border:1px solid var(--border);">${l.topic} (${l.hours}h)</span>
          `).join('');
        }
      }

      const hoursDisplay = document.getElementById('review-hours-display');
      if (hoursDisplay) hoursDisplay.textContent = weekHours.toFixed(1);
    });

  const statusBadge = document.getElementById('review-status-badge');
  if (statusBadge) {
    statusBadge.textContent = r.status || 'Draft';
    statusBadge.className = 'badge ' + (r.status === 'Submitted' ? 'success' : 'warning');
  }

  const isSubmitted = r.status === 'Submitted';
  const displayEls = ['topics', 'handson', 'win', 'blocker', 'focus'];
  
  displayEls.forEach(f => {
    const d = document.getElementById('display-' + f);
    const e = document.getElementById('edit-' + f);
    if (d && e) {
      if (isSubmitted) {
        d.style.display = 'block';
        e.style.display = 'none';
        d.textContent = r[f] || 'No entry.';
      } else {
        d.style.display = 'none';
        e.style.display = 'block';
        e.value = r[f] || '';
        e.placeholder = `Describe your ${f} for week ${w}...`;
      }
    }
  });

  const actionBtn = document.getElementById('review-action-btn');
  if (actionBtn) {
    actionBtn.style.display = isSubmitted ? 'none' : 'block';
    actionBtn.textContent = 'Submit Review ✓';
  }
}

async function submitWeeklyReview() {
  const w = state.selectedReviewWeek || 1;
  if (!state.weekReviews) state.weekReviews = {};
  const r = state.weekReviews[w] || {};

  ['topics', 'handson', 'win', 'blocker', 'focus'].forEach(f => {
    const val = document.getElementById('edit-' + f)?.value;
    r[f] = val;
  });

  r.status = 'Submitted';
  r.submittedAt = new Date().toISOString();
  
  state.weekReviews[w] = r;
  await saveState();
  renderWeekly();
  showToast("Weekly review submitted!");
}

function handleSignOut() {
  auth.signOut().then(() => { window.location.href = 'index.html'; });
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('collapsed');
  document.querySelector('.main-content').classList.toggle('expanded');
}

function closeGlobalSearch() {
  const resultsDivFixed = document.getElementById('search-results-fixed');
  if (resultsDivFixed) resultsDivFixed.style.display = 'none';
  const input = document.getElementById('global-search-input');
  if (input) input.value = '';
}

// Ensure clicks outside close things
document.addEventListener('click', (e) => {
  const searchContainer = document.querySelector('.search-container');
  const resultsDivFixed = document.getElementById('search-results-fixed');
  if (searchContainer && !searchContainer.contains(e.target) && resultsDivFixed) {
    resultsDivFixed.style.display = 'none';
  }
});
