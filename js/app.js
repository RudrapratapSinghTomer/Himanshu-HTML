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
let hostEditMode = false;

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

  if (isSignUp) {
    if (!email.toLowerCase().endsWith('@bestpeers.com')) {
      return alert('Only @bestpeers.com emails are allowed.');
    }
    if (!fname || !lname) return alert('Please enter your full name.');
  }

  try {
    if (isSignUp) {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      const newState = { ...defaultState, firstName: fname, lastName: lname, email: email };
      await db.collection('users').doc(res.user.uid).set(newState);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
  } catch (e) {
    alert(e.message);
  }
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    document.body.classList.add('auth');
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        myRole = data.role || 'user';
        // Auto-assign host for admin email
        if (user.email === 'rudra@bestpeers.com' && data.role !== 'host') {
          myRole = 'host';
          db.collection('users').doc(user.uid).update({ role: 'host' }).catch(console.error);
        }
      }
      await loadFromFirestore(user.uid);
    } catch (error) {
      console.error("Auth error:", error);
    }
  } else {
    document.body.classList.remove('auth');
    myRole = 'user';
    state = { ...defaultState };
    me = {};
    updateUserUI();
    initApp();
  }
});

function updateUserUI() {
  const userToDisplay = (me && me.firstName) ? me : state;
  const fName = userToDisplay.firstName || 'User';
  const lName = userToDisplay.lastName || '';
  const role = userToDisplay.role || myRole || 'user';
  
  const welcomeTitle = document.querySelector('.welcome-title');
  const sidebarName = document.querySelector('.user-name');
  const avatar = document.querySelector('.avatar');
  const roleBadge = document.querySelector('.user-role');

  if (welcomeTitle) welcomeTitle.textContent = `Welcome back, ${fName} 👋`;
  if (sidebarName) sidebarName.textContent = `${fName} ${lName}`;
  if (avatar) avatar.textContent = (fName[0] || '') + (lName[0] || '');
  if (roleBadge) roleBadge.textContent = role.charAt(0).toUpperCase() + role.slice(1);

  document.querySelectorAll('.host-only').forEach(el => {
    el.style.display = (myRole === 'host') ? 'flex' : 'none';
  });
}

// ── STATE SYNC ───────────────────────────────────────────────────────────────
async function loadFromFirestore(uid) {
  state.loading = true;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      state = { ...defaultState, ...doc.data(), loading: false };
      if (auth.currentUser && uid === auth.currentUser.uid) {
        me = { ...state };
      }
    } else {
      state = { ...defaultState, loading: false };
      if (auth.currentUser && uid === auth.currentUser.uid) me = { ...state };
    }
    updateUserUI();
    initApp();
  } catch (e) {
    console.error("Load error:", e);
  }
}

async function saveState() {
  const user = auth.currentUser;
  if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  try {
    await db.collection('users').doc(targetUid).set(state);
    showToast();
  } catch (e) {
    console.error("Save error:", e);
  }
}

// ── INIT ─────────────────────────────────────────────────────────────────────
function initApp() {
  // Ensure state consistency
  const keys = ['skillNow', 'projectStatus', 'projectTasks', 'weekStatus', 'logEntries', 'weekReviews'];
  keys.forEach(k => { if (!state[k]) state[k] = (k === 'logEntries' ? [] : {}); });

  SKILLS.forEach(s => { if (state.skillNow[s.key] === undefined) state.skillNow[s.key] = 0; });
  PROJECTS.forEach(p => { 
    if (!state.projectStatus[p.id]) state.projectStatus[p.id] = p.status; 
    if (!state.projectTasks[p.id]) state.projectTasks[p.id] = p.tasks.map(() => 0);
  });

  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const logDateEl = document.getElementById('log-date');
  if (logDateEl) logDateEl.value = new Date().toISOString().split('T')[0];

  const logWeekSel = document.getElementById('log-week');
  if (logWeekSel) {
    logWeekSel.innerHTML = '<option value="">Select week...</option>' + 
      Array.from({length: 20}, (_, i) => `<option value="${i+1}">Week ${i+1}</option>`).join('');
  }
  
  renderDashboard();
  if (myRole === 'host') fetchEmployees(); 
  fixLinks();
}

// ── UI RENDERING ─────────────────────────────────────────────────────────────
function showPage(id, btn) {
  const pageEl = document.getElementById('page-' + id);
  if (!pageEl) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  pageEl.classList.add('active');
  if (btn) btn.classList.add('active');
  
  const titles = { 
    dashboard: 'Dashboard', roadmap: 'Roadmap', daily: 'Daily Log', 
    skills: 'Skills Tracker', projects: 'Projects', weekly: 'Weekly Review', 
    resources: 'Resources', 'admin-users': 'User Management'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[id] || id;
  
  const renderers = {
    dashboard: renderDashboard, roadmap: renderRoadmap, skills: renderSkills,
    projects: renderProjects, weekly: renderWeekly, resources: renderResources,
    daily: renderLogEntries, 'admin-users': renderAdminUsers
  };
  if (renderers[id]) renderers[id]();
  fixLinks();
}

function showTab(page, tab, btn) {
  state.activeSkillTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSkills();
}

function setMood(m, btn) {
  state.selectedMood = m;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}

// ── LOG ENTRIES ──────────────────────────────────────────────────────────────
function addLogEntry() {
  const topic = document.getElementById('log-topic')?.value.trim();
  if (!topic) return alert('Please add a topic');

  const entry = {
    date: document.getElementById('log-date')?.value || new Date().toISOString().split('T')[0],
    week: document.getElementById('log-week')?.value || '',
    topic: topic,
    tool: document.getElementById('log-tool')?.value || 'General',
    hours: parseFloat(document.getElementById('log-hours')?.value) || 0,
    learned: document.getElementById('log-learned')?.value.trim() || '',
    wins: document.getElementById('log-wins')?.value.trim() || '',
    handson: document.getElementById('log-handson')?.value.trim() || '',
    blockers: document.getElementById('log-blockers')?.value.trim() || '',
    tomorrow: document.getElementById('log-tomorrow')?.value.trim() || '',
    mood: state.selectedMood || 3,
    id: Date.now(),
  };

  state.logEntries.unshift(entry);
  if (entry.week) autoPopulateWeekly(parseInt(entry.week));
  
  saveState();
  renderLogEntries();
  updateKPIs();
  
  ['log-topic', 'log-learned', 'log-wins', 'log-handson', 'log-blockers', 'log-tomorrow', 'log-hours'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  toggleLogForm();
  showToast("Session logged successfully!");
}

function renderLogEntries() {
  const container = document.getElementById('log-entries-list');
  if (!container) return;
  
  const searchTerm = document.getElementById('log-search')?.value.toLowerCase() || '';
  const toolFilter = document.getElementById('log-filter-tool')?.value || '';
  
  const filtered = state.logEntries.filter(e => {
    const matchesSearch = (e.topic + e.learned).toLowerCase().includes(searchTerm);
    return matchesSearch && (!toolFilter || e.tool === toolFilter);
  });

  const tag = document.getElementById('log-count-tag');
  if (tag) tag.textContent = `${filtered.length} entries`;

  if (!filtered.length) {
    container.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:64px;">No entries found.</div>';
    return;
  }

  const moodEmoji = ['', '😴', '😐', '🙂', '😄', '🔥'];
  container.innerHTML = filtered.map(e => `
    <div class="card log-item" style="padding:20px; margin-bottom:16px; border-left:4px solid ${myRole === 'host' ? 'var(--blue)' : 'var(--teal)'};">
      <div style="display:grid; grid-template-columns: 1fr auto; gap:16px;">
        <div>
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <span style="font-family:'JetBrains Mono',monospace; font-size:11px; background:var(--card2); padding:2px 8px; border-radius:4px; color:var(--text3);">${formatDate(e.date)}</span>
            <span style="font-size:11px; color:var(--text3);">Week ${e.week || '?'}</span>
            <span style="font-size:11px; padding:2px 8px; border-radius:4px; background:var(--navy3); color:var(--blue2); font-weight:700;">${e.tool}</span>
          </div>
          <div style="font-size:16px; font-weight:700; margin-bottom:8px;">${e.topic}</div>
          <div style="font-size:13px; color:var(--text2); line-height:1.5; margin-bottom:12px;">${e.learned}</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            ${e.handson ? `<div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; font-weight:800;">Hands-on</div><div style="font-size:12px; color:var(--green2);">✓ ${e.handson}</div></div>` : ''}
            ${e.blockers ? `<div><div style="font-size:10px; color:var(--text3); text-transform:uppercase; font-weight:800;">Blockers</div><div style="font-size:12px; color:var(--red);">⚡ ${e.blockers}</div></div>` : ''}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:var(--blue2);">${(e.hours || 0).toFixed(1)}h</div>
          <div style="font-size:16px;">${moodEmoji[e.mood || 3]}</div>
          ${myRole === 'host' ? `<button onclick="deleteEntry(${e.id})" class="btn-sm-red" style="margin-top:10px;">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function deleteEntry(id) {
  if (myRole !== 'host') return;
  state.logEntries = state.logEntries.filter(e => e.id !== id);
  saveState(); renderLogEntries(); updateKPIs();
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  updateKPIs();
  renderPhaseProgressBars();
  renderHeatmap();
  renderRecentLogs();
  renderSchedule();
  renderLeaderboard();
}

function updateKPIs() {
  const activePhases = getActivePhases();
  const allWeeks = [].concat(...activePhases.map(p => p.weeks));
  const doneWeeks = allWeeks.filter(w => state.weekStatus[w] === 'done').length;
  const pct = allWeeks.length > 0 ? Math.round((doneWeeks / allWeeks.length) * 100) : 0;

  const totalHours = state.logEntries.reduce((s, e) => s + (e.hours || 0), 0);
  const doneProjs = PROJECTS.filter(p => state.projectStatus[p.id] === 'Completed').length;
  const skillsAt3 = SKILLS.filter(s => (state.skillNow[s.key] || 0) >= 3).length;

  const kpis = { 'kpi-hours': totalHours.toFixed(1), 'kpi-projects': doneProjs, 'kpi-skills': skillsAt3, 'overall-pct': pct + '%' };
  Object.entries(kpis).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });

  const circle = document.getElementById('milestone-progress-bar');
  if (circle) circle.style.strokeDashoffset = 226 - (226 * pct) / 100;

  const projLabel = document.getElementById('proj-count-label');
  if (projLabel) projLabel.textContent = `${doneProjs} / ${PROJECTS.length} complete`;
}

function renderPhaseProgressBars() {
  const el = document.getElementById('phase-progress-bars');
  if (!el) return;
  el.innerHTML = getActivePhases().map(p => {
    const done = p.weeks.filter(w => state.weekStatus[w] === 'done').length;
    const pct = Math.round((done / p.weeks.length) * 100);
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
          <span style="font-size:12px;">${p.name}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);">${done}/${p.weeks.length} weeks</span>
        </div>
        <div class="progress-track" style="height:6px;"><div class="progress-fill" style="width:${pct}%;background:${p.color};"></div></div>
      </div>
    `;
  }).join('');
}

function renderHeatmap() {
  const el = document.getElementById('heatmap');
  if (!el) return;
  const dates = state.logEntries.map(e => e.date);
  const today = new Date();
  let html = '';
  for (let r = 0; r < 7; r++) {
    html += '<div class="heatmap-row">';
    for (let c = 0; c < 12; c++) {
      const d = new Date(today); d.setDate(d.getDate() - ((11 - c) * 7 + (6 - r)));
      const ds = d.toISOString().split('T')[0];
      const intensity = dates.includes(ds) ? 'background:var(--blue);opacity:0.8;' : '';
      html += `<div class="heatmap-cell" style="${intensity}" title="${ds}"></div>`;
    }
    html += '</div>';
  }
  el.innerHTML = html;
}

function toggleLogForm() {
  const el = document.getElementById('log-form-container');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function renderRecentLogs() {
  const el = document.getElementById('recent-logs-dash');
  if (!el) return;
  if (!state.logEntries.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:13px;padding:20px;text-align:center;">No sessions logged yet.</div>';
    return;
  }
  el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">` +
    state.logEntries.slice(0, 3).map(e => `
      <div class="card" style="padding:14px;background:var(--navy3);">
        <div style="font-size:10px;color:var(--text3);">${formatDate(e.date)}</div>
        <div style="font-size:13px;font-weight:600;margin:4px 0;">${e.topic}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="tool-pill" style="font-size:9px;">${e.tool}</span>
          <span style="font-weight:800;color:var(--blue2);">${e.hours}h</span>
        </div>
      </div>
    `).join('') + `</div>`;
}

function renderSchedule() {
  const container = document.getElementById('today-schedule-list');
  if (!container) return;
  const currentWeek = WEEKS.find(w => state.weekStatus[w.w] === 'active') || WEEKS[0];
  const tasks = [
    { time: '09:00 AM', title: 'Daily Warmup', type: 'Mindset', status: 'done' },
    { time: '11:00 AM', title: currentWeek.title, type: 'Core Learning', status: 'active' },
    { time: '02:00 PM', title: 'Hands-on Lab', type: 'Practical', status: 'upcoming' },
    { time: '05:00 PM', title: 'Daily Log Submission', type: 'Admin', status: 'upcoming' }
  ];
  container.innerHTML = tasks.map(t => `
    <div style="display:flex; gap:16px; padding-bottom:15px; border-left:2px solid ${t.status === 'done' ? 'var(--blue)' : 'var(--border)'}; margin-left:10px; position:relative;">
      <div style="position:absolute; left:-9px; top:0; width:16px; height:16px; border-radius:50%; background:${t.status === 'active' ? 'var(--blue)' : 'var(--navy4)'}; border:3px solid var(--navy2);"></div>
      <div style="flex:1; padding-left:15px; margin-top:-4px;">
        <div style="font-size:10px; color:var(--text3);">${t.time}</div>
        <div style="font-size:13px; font-weight:700;">${t.title}</div>
      </div>
    </div>
  `).join('');
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;
  const mockUsers = [
    { name: 'Arjun Tomar', xp: 2450, color: 'var(--blue)' },
    { name: 'Priya Singh', xp: 2100, color: 'var(--teal)' },
    { name: 'Rohan Verma', xp: 1850, color: 'var(--purple)' }
  ];
  container.innerHTML = mockUsers.map((u, i) => `
    <div style="display:flex; align-items:center; gap:12px; padding:8px; background:var(--navy3); border-radius:8px;">
      <div style="font-weight:800; font-size:12px; color:var(--text3); width:20px;">#${i+1}</div>
      <div style="flex:1;">
        <div style="font-size:12px; font-weight:600;">${u.name}</div>
        <div style="font-size:10px; color:var(--text3);">${u.xp} XP</div>
      </div>
      <div class="progress-track" style="width:40px;height:4px;"><div class="progress-fill" style="width:${(u.xp/3000)*100}%; background:${u.color};"></div></div>
    </div>
  `).join('');
}

// ── ROADMAP ──────────────────────────────────────────────────────────────────
async function renderRoadmap() {
  const isHost = myRole === 'host';
  const adminSection = document.getElementById('host-admin-section');
  if (adminSection) adminSection.style.display = isHost ? 'block' : 'none';

  const userTitle = document.getElementById('roadmap-user-title');
  if (userTitle) userTitle.textContent = (isHost && viewingUserId) ? "Reviewing Progress" : "Your Learning Path";

  const activePhases = getActivePhases();
  const bar = document.getElementById('phase-filter-bar');
  if (bar) {
    bar.innerHTML = activePhases.map(p => `
      <div class="phase-seg" style="background:${activePhaseFilter === p.id ? p.color : p.color + '33'};" onclick="filterPhase('${p.id}')">
        <div style="font-size:11px;color:#fff;font-weight:700;">P${activePhases.indexOf(p) + 1}</div>
        <div class="phase-name">${p.name.split(' ')[0]}</div>
      </div>
    `).join('') + `<div class="phase-seg" style="background:var(--card2);" onclick="filterPhase(null)"><div style="font-size:10px;">All</div></div>`;
  }

  const grid = document.getElementById('week-grid');
  if (!grid) return;

  const validWeeks = [].concat(...activePhases.map(p => p.weeks));
  let weeks = WEEKS.filter(w => validWeeks.includes(w.w));
  if (activePhaseFilter) weeks = weeks.filter(w => w.phase === activePhaseFilter);

  grid.innerHTML = weeks.map(w => {
    const status = state.weekStatus[w.w] || 'todo';
    const isEditable = !viewingUserId && status !== 'done';
    return `
      <div class="week-card ${status === 'active' ? 'current' : ''} ${status === 'done' ? 'done' : ''}">
        <div class="week-num"><span>WK ${w.w}</span><div class="week-status-dot status-${status}"></div></div>
        <div class="week-title">${w.title}</div>
        <div class="week-tools">${w.tools.map(t => `<span class="tool-pill">${t}</span>`).join('')}</div>
        <div style="font-size:11px;color:var(--text3);margin:8px 0;">${w.goals}</div>
        ${isEditable ? `
          <div style="display:flex;gap:4px;margin-top:10px;">
            <button onclick="setWeekStatus(${w.w},'todo')" class="btn-sm">Todo</button>
            <button onclick="setWeekStatus(${w.w},'active')" class="btn-sm">Active</button>
            <button onclick="setWeekStatus(${w.w},'done')" class="btn-sm">Done</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function setWeekStatus(w, s) { 
  state.weekStatus[w] = s; 
  saveState(); renderRoadmap(); updateKPIs(); 
}

function filterPhase(pid) { activePhaseFilter = pid; renderRoadmap(); }

// ── SKILLS ───────────────────────────────────────────────────────────────────
function renderSkills() {
  const container = document.getElementById('skills-content');
  if (!container) return;
  const levels = ['None', 'Beginner', 'Intermediate', 'Expert'];
  const domainFilter = { all:null, sql:'SQL', python:'Python', pbi:'Power BI', xl:'Excel' }[state.activeSkillTab] || null;

  container.innerHTML = [...new Set(SKILLS.map(s => s.domain))].map(domain => {
    if (domainFilter && domain !== domainFilter) return '';
    const domainSkills = SKILLS.filter(s => s.domain === domain);
    return `
      <div class="skills-domain">
        <div class="domain-header"><div class="domain-name">${domain}</div></div>
        ${domainSkills.map(s => `
          <div class="skill-row">
            <div class="skill-name">${s.name}</div>
            <div class="skill-bar-wrap"><div class="skill-bar-fill" style="width:${(state.skillNow[s.key]||0)*33}%;background:${s.color};"></div></div>
            <select onchange="updateSkill('${s.key}',this.value)" class="form-select">
              ${levels.map((l, i) => `<option value="${i}" ${state.skillNow[s.key] == i ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function updateSkill(key, val) {
  state.skillNow[key] = parseInt(val);
  saveState(); renderSkills(); updateKPIs();
}

// ── PROJECTS ─────────────────────────────────────────────────────────────────
function renderProjects() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;
  grid.innerHTML = PROJECTS.map(p => {
    const status = state.projectStatus[p.id] || 'Not Started';
    return `
      <div class="project-card" style="border-top:4px solid ${p.color};">
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:10px;font-weight:700;">PROJ ${p.num}</span>
          <span class="badge">${status}</span>
        </div>
        <div class="project-title" style="margin:8px 0;">${p.title}</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:12px;">${p.q}</div>
        <select onchange="updateProjectStatus('${p.id}',this.value)" class="form-select">
          <option ${status === 'Not Started' ? 'selected' : ''}>Not Started</option>
          <option ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option ${status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
    `;
  }).join('');
}

function updateProjectStatus(id, val) {
  state.projectStatus[id] = val;
  saveState(); renderProjects(); updateKPIs();
}

// ── WEEKLY REVIEW ─────────────────────────────────────────────────────────────
function renderWeekly() {
  const w = state.selectedReviewWeek || 1;
  const r = state.weekReviews[w] || {};
  const el = document.getElementById('review-week-label');
  if (el) el.textContent = w;

  const grid = document.getElementById('review-week-grid');
  if (grid) {
    grid.innerHTML = Array.from({length:20}, (_, i) => i + 1).map(wnum => `
      <div class="review-week-btn ${wnum === w ? 'active' : ''}" onclick="selectReviewWeek(${wnum})">WK ${wnum}</div>
    `).join('');
  }

  ['topics', 'handson', 'win', 'blocker', 'focus'].forEach(f => {
    const d = document.getElementById('display-' + f);
    if (d) d.textContent = r[f] || 'No entry.';
  });
}

function selectReviewWeek(w) { state.selectedReviewWeek = w; renderWeekly(); }

function autoPopulateWeekly(wNum) {
  const logs = state.logEntries.filter(e => parseInt(e.week) === wNum);
  if (!logs.length) return;
  const r = state.weekReviews[wNum] || {};
  r.topics = [...new Set(logs.map(e => e.topic))].join(', ');
  r.handson = logs.map(e => e.handson).filter(h => h).join('; ');
  state.weekReviews[wNum] = r;
}

// ── RESOURCES ────────────────────────────────────────────────────────────────
function renderResources() {
  const container = document.getElementById('resource-grid');
  if (!container) return;
  const filter = state.activeResourceFilter || 'All';
  const filtered = filter === 'All' ? RESOURCES : RESOURCES.filter(r => r.domain === filter);
  container.innerHTML = filtered.map(r => `
    <div class="resource-item">
      <div style="font-weight:700;">${r.name}</div>
      <div style="font-size:10px;color:var(--text3);">${r.domain} · ${r.type}</div>
      <a href="${r.url}" target="_blank" style="font-size:11px;color:var(--blue2);">Link</a>
    </div>
  `).join('');
}

function setResourceFilter(f) { state.activeResourceFilter = f; renderResources(); }

// ── ADMIN ────────────────────────────────────────────────────────────────────
async function fetchEmployees() {
  try {
    const snap = await db.collection('users').get();
    allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const list = document.getElementById('employee-progress-list');
    if (list) {
      list.innerHTML = allUsers.map(u => `
        <div onclick="switchViewUser('${u.id}')" class="employee-row">
          <span>${u.firstName} ${u.lastName}</span>
        </div>
      `).join('');
    }
  } catch (e) { console.error(e); }
}

async function switchViewUser(uid) {
  if (uid === auth.currentUser?.uid) { viewingUserId = null; await loadFromFirestore(uid); }
  else {
    viewingUserId = uid;
    const u = allUsers.find(user => user.id === uid);
    if (u) { state = { ...defaultState, ...u }; updateUserUI(); renderRoadmap(); }
  }
}

// ── UTILS ────────────────────────────────────────────────────────────────────
function fixLinks() { document.querySelectorAll('a').forEach(a => { a.target = "_blank"; a.rel = "noopener"; }); }
function showToast(msg = "Saved!") { /* toast logic */ }
function getActivePhases() { return ROADMAPS[state.assignedRoadmap || 'Data Analytics'] || ROADMAPS['Data Analytics']; }
function toggleFocusMode() { document.body.classList.toggle('focus-mode'); }
