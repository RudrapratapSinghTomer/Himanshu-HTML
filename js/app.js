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

auth.onAuthStateChanged(async (user) => {
  if (user) {
    document.body.classList.add('auth');
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        myRole = data.role || 'user';
      }
      await loadFromFirestore(user.uid);
    } catch (e) { console.error("Auth init error:", e); initApp(); }
  } else {
    document.body.classList.remove('auth');
    myRole = 'user'; state = { ...defaultState }; me = {};
    updateUserUI(); initApp();
  }
});

function updateUserUI() {
  const u = (me && me.firstName) ? me : state;
  const fName = u.firstName || 'User';
  const lName = u.lastName || '';
  const welcomeTitle = document.querySelector('.welcome-title');
  const welcomeSub = document.querySelector('.welcome-sub');
  const sidebarName = document.querySelector('.user-name');
  const avatar = document.querySelector('.avatar');
  const roleBadge = document.querySelector('.user-role');

  if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${fName} 👋`;
  if (welcomeSub) {
    const activePhases = getActivePhases();
    const allWeeks = [].concat(...activePhases.map(p => p.weeks));
    const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
    const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
    welcomeSub.innerHTML = `Today is <span id="today-date" style="color:var(--blue2); font-weight:600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> · You've completed ${pct}% of your roadmap. Keep the momentum!`;
  }
  if (sidebarName) sidebarName.textContent = `${fName} ${lName}`;
  if (avatar) avatar.textContent = (fName[0] || '') + (lName[0] || '');
  if (roleBadge) roleBadge.textContent = (u.role || myRole || 'user').toUpperCase();
  document.querySelectorAll('.host-only').forEach(el => el.style.display = (myRole === 'host') ? 'flex' : 'none');
}

async function loadFromFirestore(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) state = { ...defaultState, ...doc.data() };
  } catch (e) { console.error("Load Progress error:", e); }
  finally { if (auth.currentUser && uid === auth.currentUser.uid) me = { ...state }; updateUserUI(); initApp(); }
}

async function saveState() {
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  try {
    await db.collection('users').doc(targetUid).set(state, { merge: true });
    showToast("Synced!");
  } catch (e) { showToast("Sync failed", true); }
}

function initApp() {
  const keys = ['skillNow', 'projectStatus', 'projectTasks', 'weekStatus', 'logEntries', 'weekReviews'];
  keys.forEach(k => { if (!state[k]) state[k] = (k === 'logEntries' ? [] : {}); });
  SKILLS.forEach(s => { if (state.skillNow[s.key] === undefined) state.skillNow[s.key] = 0; });
  PROJECTS.forEach(p => { 
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
  const renderers = {
    dashboard: renderDashboard, roadmap: renderRoadmap, skills: renderSkills,
    projects: renderProjects, weekly: renderWeekly, resources: renderResources,
    daily: renderLogEntries, 'admin-users': renderAdminUsers
  };
  if (renderers[id]) renderers[id]();
}

// ── RENDERING ────────────────────────────────────────────────────────────────
function renderDashboard() {
  updateKPIs(); renderPhaseProgressBars(); renderHeatmap(); renderRecentLogs(); renderSchedule(); renderLeaderboard();
}

function updateKPIs() {
  updateStreak();
  const activePhases = getActivePhases();
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
  const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
  const kpis = { 
    'kpi-hours': (state.logEntries || []).reduce((s, e) => s + (e.hours || 0), 0).toFixed(1), 
    'kpi-projects': PROJECTS.filter(p => state.projectStatus[p.id] === 'Completed').length, 
    'kpi-skills': SKILLS.filter(s => (state.skillNow[s.key] || 0) >= 3).length, 
    'overall-pct': pct + '%' 
  };
  Object.entries(kpis).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
  const circle = document.getElementById('milestone-progress-bar');
  if (circle) circle.style.strokeDashoffset = 226 - (226 * pct) / 100;

  if (myRole === 'host') {
    const totalProgress = allUsers.reduce((sum, u) => {
      const uRoadmap = ROADMAPS[u.assignedRoadmap || 'Data Analytics'] || ROADMAPS['Data Analytics'];
      const uAllWeeks = [].concat(...uRoadmap.map(p => p.weeks));
      const uDoneWeeks = uAllWeeks.filter(w => (u.weekStatus && u.weekStatus[w]) === 'done').length;
      return sum + (uAllWeeks.length > 0 ? (uDoneWeeks / uAllWeeks.length) : 0);
    }, 0);
    const avgProgress = allUsers.length > 0 ? Math.round((totalProgress / allUsers.length) * 100) : 0;
    
    const hostKPIs = {
      'host-avg-progress': avgProgress + '%',
      'host-active-count': allUsers.length,
      'host-pending-reviews': allUsers.reduce((s, u) => s + Object.keys(u.weekReviews || {}).length, 0) // Simplified
    };
    Object.entries(hostKPIs).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
  }
}

function updateStreak() {
  if (!state.logEntries || state.logEntries.length === 0) {
    state.streak = 0;
  } else {
    const dates = [...new Set(state.logEntries.map(e => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] === today || dates[0] === yesterday) {
      streak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i+1]);
        const diff = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
        if (diff === 1) streak++;
        else break;
      }
    }
    state.streak = streak;
  }
  const el = document.getElementById('streak-count-topbar');
  if (el) el.textContent = state.streak;
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
    const validWeeks = [].concat(...activePhases.map(p => p.weeks));
    let weeks = WEEKS.filter(w => validWeeks.includes(w.w));
    if (activePhaseFilter) weeks = weeks.filter(w => w.phase === activePhaseFilter);
    if (weeks.length === 0) { grid.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3);">No data found.</div>'; return; }
    grid.innerHTML = weeks.map(w => {
      const status = state.weekStatus[w.w] || 'todo';
      return `<div class="week-card ${status === 'active' ? 'current' : ''} ${status === 'done' ? 'done' : ''}"><div class="week-num">WK ${w.w}</div><div class="week-title">${w.title}</div><div class="week-tools">${w.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}</div><div style="font-size:11px;color:var(--text3);margin-top:8px;">${w.goals}</div>${status !== 'done' ? `<div style="display:flex;gap:4px;margin-top:12px;"><button onclick="setWeekStatus(${w.w},'todo')" class="btn-sm">Todo</button><button onclick="setWeekStatus(${w.w},'active')" class="btn-sm">Active</button><button onclick="setWeekStatus(${w.w},'done')" class="btn-sm">Done</button></div>`:''}</div>`;
    }).join('');
  } catch (e) { grid.innerHTML = `<div style="color:var(--red);padding:20px;">Render Error: ${e.message}</div>`; }
}

function setWeekStatus(w, s) { state.weekStatus[w] = s; saveState(); renderRoadmap(); updateKPIs(); }

function renderSkills() {
  const container = document.getElementById('skills-content'); if (!container) return;
  const domainFilter = { all:null, sql:'SQL', python:'Python', pbi:'Power BI', xl:'Excel', core:'Analytics Core' }[state.activeSkillTab] || null;
  container.innerHTML = [...new Set(SKILLS.map(s => s.domain))].map(domain => {
    if (domainFilter && domain !== domainFilter) return '';
    return `<div class="skills-domain"><div class="domain-header">${domain}</div>${SKILLS.filter(s => s.domain === domain).map(s => `<div class="skill-row"><span>${s.name}</span><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width:${(state.skillNow[s.key]||0)*33}%;background:${s.color};"></div></div><select onchange="updateSkill('${s.key}',this.value)" class="form-select"><option value="0" ${state.skillNow[s.key]==0?'selected':''}>None</option><option value="1" ${state.skillNow[s.key]==1?'selected':''}>Beginner</option><option value="2" ${state.skillNow[s.key]==2?'selected':''}>Inter</option><option value="3" ${state.skillNow[s.key]==3?'selected':''}>Expert</option></select></div>`).join('')}</div>`;
  }).join('');
}

function updateSkill(k, v) { state.skillNow[k] = parseInt(v); saveState(); renderSkills(); updateKPIs(); }

function renderProjects() {
  const grid = document.getElementById('project-grid'); if (!grid) return;
  grid.innerHTML = PROJECTS.map(p => `<div class="project-card" style="border-top:4px solid ${p.color};"><div style="display:flex;justify-content:space-between;font-size:10px;"><span>PROJ ${p.num}</span><span class="badge">${state.projectStatus[p.id]||'Not Started'}</span></div><div style="font-weight:700;margin:8px 0;">${p.title}</div><select onchange="updateProjectStatus('${p.id}',this.value)" class="form-select"><option>Not Started</option><option>In Progress</option><option>Completed</option></select></div>`).join('');
}

function updateProjectStatus(id, v) { state.projectStatus[id] = v; saveState(); renderProjects(); updateKPIs(); }

function renderWeekly() {
  const w = state.selectedReviewWeek || 1; const r = (state.weekReviews || {})[w] || {};
  const grid = document.getElementById('review-week-grid');
  if (grid) grid.innerHTML = Array.from({length:20}, (_, i) => `<div class="review-week-btn ${i+1===w?'active':''}" onclick="selectReviewWeek(${i+1})">WK ${i+1}</div>`).join('');
  ['topics', 'handson', 'win', 'blocker', 'focus'].forEach(f => { const d = document.getElementById('display-' + f); if (d) d.textContent = r[f] || 'No entry.'; });
}

function selectReviewWeek(w) { state.selectedReviewWeek = w; renderWeekly(); }

function renderResources() {
  const container = document.getElementById('resource-grid'); if (!container) return;
  const filter = state.activeResourceFilter || 'All';
  const filtered = filter === 'All' ? RESOURCES : RESOURCES.filter(r => r.domain === filter);
  container.innerHTML = filtered.map(r => `<div class="resource-item"><div>${r.name}</div><div style="font-size:10px;color:var(--text3);">${r.domain}</div><a href="${r.url}" target="_blank">Link</a></div>`).join('');
}

function setResourceFilter(f) { state.activeResourceFilter = f; renderResources(); }

function renderLogEntries() {
  const container = document.getElementById('log-entries-list'); if (!container) return;
  container.innerHTML = (state.logEntries || []).map(e => `<div class="card" style="padding:16px;margin-bottom:12px;border-left:4px solid var(--teal);"><div>${e.date} · Week ${e.week}</div><div style="font-weight:700;">${e.topic}</div><div>${e.learned}</div></div>`).join('');
}

async function fetchEmployees() {
  try {
    const snap = await db.collection('users').get();
    allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const list = document.getElementById('employee-progress-list');
    if (list) list.innerHTML = allUsers.map(u => `<div onclick="switchViewUser('${u.id}')" style="padding:10px;cursor:pointer;border-bottom:1px solid var(--border);">${u.firstName} ${u.lastName} <span class="badge">${u.assignedRoadmap||''}</span></div>`).join('');
  } catch (e) { console.error(e); }
}

async function switchViewUser(uid) {
  if (auth.currentUser && uid === auth.currentUser.uid) { viewingUserId = null; await loadFromFirestore(uid); }
  else { viewingUserId = uid; const u = allUsers.find(x => x.id === uid); if (u) { state = { ...defaultState, ...u }; updateUserUI(); renderRoadmap(); } }
}

async function renderAdminUsers() { if (myRole !== 'host') return; await fetchEmployees(); }

function renderHeatmap() {
  const container = document.getElementById('heatmap'); if (!container) return;
  let html = '';
  for (let i = 0; i < 84; i++) { // 12 weeks * 7 days
    const level = Math.floor(Math.random() * 4);
    html += `<div class="heatmap-cell" style="opacity: ${0.2 + level * 0.25}; background: var(--teal);"></div>`;
  }
  container.innerHTML = html;
}

function renderSchedule() {
  const container = document.getElementById('today-schedule-list'); if (!container) return;
  const items = [
    { time: '09:00 AM', task: 'Review SQL Window Functions', status: 'done' },
    { time: '11:30 AM', task: 'Practice LeetCode (Medium)', status: 'active' },
    { time: '03:00 PM', task: 'Project: Retail Sales Dashboard', status: 'todo' }
  ];
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
  const users = [
    { name: 'Priya S.', score: 1240, streak: 12 },
    { name: 'Arjun T.', score: 1150, streak: 8 },
    { name: 'Rohan V.', score: 980, streak: 5 }
  ];
  container.innerHTML = users.map((u, idx) => `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border);">
      <div style="font-weight:800; color:var(--blue2); width:20px;">${idx+1}</div>
      <div style="flex:1; font-size:13px;">${u.name}</div>
      <div style="font-size:11px; color:var(--orange2);">🔥 ${u.streak}d</div>
      <div style="font-size:12px; font-weight:600;">${u.score} pts</div>
    </div>
  `).join('');
}

function renderRecentLogs() {
  // Can be used to show a summary on dashboard
}

async function addLogEntry() {
  const date = document.getElementById('log-date')?.value;
  const week = document.getElementById('log-week')?.value;
  const topic = document.getElementById('log-topic')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  const learned = document.getElementById('log-learned')?.value;
  
  if (!date || !topic || !hours) return alert('Please fill required fields (Date, Topic, Hours)');
  
  const entry = { date, week, topic, hours, learned, timestamp: Date.now() };
  if (!state.logEntries) state.logEntries = [];
  state.logEntries.unshift(entry);
  
  await saveState();
  toggleLogForm();
  renderLogEntries();
  updateKPIs();
  showToast("Session Logged!");
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
    ...WEEKS.filter(w => w.title.toLowerCase().includes(q.toLowerCase())).map(w => ({ type: 'Roadmap', title: w.title, id: 'roadmap' })),
    ...PROJECTS.filter(p => p.title.toLowerCase().includes(q.toLowerCase())).map(p => ({ type: 'Project', title: p.title, id: 'projects' })),
    ...RESOURCES.filter(r => r.name.toLowerCase().includes(q.toLowerCase())).map(r => ({ type: 'Resource', title: r.name, id: 'resources' }))
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

function setMood(m, btn) {
  state.selectedMood = m;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── UTILS ────────────────────────────────────────────────────────────────────
function fixLinks() { document.querySelectorAll('a').forEach(a => { a.target = "_blank"; a.rel = "noopener"; }); }
function showToast(m, e) { const t = document.getElementById('save-toast'); if (t) { t.querySelector('span').textContent = m; t.style.background = e?'var(--red)':'var(--navy2)'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); } }
function getActivePhases() { return ROADMAPS[state.assignedRoadmap || 'Data Analytics'] || ROADMAPS['Data Analytics']; }
function toggleFocusMode() { document.body.classList.toggle('focus-mode'); }
function toggleLogForm() { const el = document.getElementById('log-form-container'); if (el) el.style.display = el.style.display==='none'?'block':'none'; }
function handleAdminAssign() { 
  const uid = document.getElementById('admin-user-select')?.value;
  const roadmap = document.getElementById('admin-roadmap-select')?.value;
  if (!uid || !roadmap) return alert('Select user and roadmap');
  
  db.collection('users').doc(uid).update({ assignedRoadmap: roadmap })
    .then(() => { showToast("Roadmap assigned!"); fetchEmployees(); })
    .catch(e => alert(e.message));
}
