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
let isSignUp = false;
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
function toggleAuthMode() {
  isSignUp = !isSignUp;
  const submitBtn = document.getElementById('auth-submit');
  const signupFields = document.getElementById('signup-fields');
  const toggleEl = document.getElementById('auth-toggle');
  if (submitBtn) submitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
  if (signupFields) signupFields.style.display = isSignUp ? 'block' : 'none';
  if (toggleEl) {
    toggleEl.innerHTML = isSignUp ?
      'Already have an account? <span onclick="toggleAuthMode()" style="color:var(--blue2);cursor:pointer;">Sign In</span>' :
      'Don\'t have an account? <span onclick="toggleAuthMode()" style="color:var(--blue2);cursor:pointer;">Sign Up</span>';
  }
}

async function handleAuth() {
  const email = document.getElementById('auth-email')?.value;
  const password = document.getElementById('auth-password')?.value;
  const fname = document.getElementById('auth-fname')?.value;
  const lname = document.getElementById('auth-lname')?.value;
  if (!email || !password) return alert('Fill all fields');
  if (isSignUp && (!email.toLowerCase().endsWith('@bestpeers.com') || !fname || !lname)) {
    return alert('Invalid signup details.');
  }
  try {
    if (isSignUp) {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(res.user.uid).set({ ...defaultState, firstName: fname, lastName: lname, email: email });
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
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
        if (user.email === 'rudra@bestpeers.com' && data.role !== 'host') {
          myRole = 'host';
          db.collection('users').doc(user.uid).update({ role: 'host' }).catch(console.error);
        }
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
  const sidebarName = document.querySelector('.user-name');
  const avatar = document.querySelector('.avatar');
  const roleBadge = document.querySelector('.user-role');
  if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${fName} 👋`;
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
  const activePhases = getActivePhases();
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
  const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;
  const kpis = { 'kpi-hours': (state.logEntries || []).reduce((s, e) => s + (e.hours || 0), 0).toFixed(1), 'kpi-projects': PROJECTS.filter(p => state.projectStatus[p.id] === 'Completed').length, 'kpi-skills': SKILLS.filter(s => (state.skillNow[s.key] || 0) >= 3).length, 'overall-pct': pct + '%' };
  Object.entries(kpis).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
  const circle = document.getElementById('milestone-progress-bar');
  if (circle) circle.style.strokeDashoffset = 226 - (226 * pct) / 100;
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

// ── UTILS ────────────────────────────────────────────────────────────────────
function fixLinks() { document.querySelectorAll('a').forEach(a => { a.target = "_blank"; a.rel = "noopener"; }); }
function showToast(m, e) { const t = document.getElementById('save-toast'); if (t) { t.querySelector('span').textContent = m; t.style.background = e?'var(--red)':'var(--navy2)'; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 3000); } }
function getActivePhases() { return ROADMAPS[state.assignedRoadmap || 'Data Analytics'] || ROADMAPS['Data Analytics']; }
function toggleFocusMode() { document.body.classList.toggle('focus-mode'); }
function toggleLogForm() { const el = document.getElementById('log-form-container'); if (el) el.style.display = el.style.display==='none'?'block':'none'; }
function handleAdminAssign() { /* simplified */ }
function handleGlobalSearch(q) { /* simplified */ }
