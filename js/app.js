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
 






// ── DYNAMIC DATA ─────────────────────────────────────────────────────────────






// ── AUTH LOGIC ───────────────────────────────────────────────────────────────
async function handleAuth() {
  console.log('Login attempt started');
  const email = document.getElementById('auth-email')?.value;
  const password = document.getElementById('auth-password')?.value;
  const btn = document.querySelector('.login-card .login-btn');
  
  if (!email || !password) return showToast('Please enter both email and password', true);
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Signing In... <span style="display:inline-block; animation:spin 1s linear infinite;">⏳</span>';
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showToast('Login successful!');
  } catch (e) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
    let msg = 'Login failed. Please check your credentials.';
    if (e.code === 'auth/user-not-found') msg = 'No user found with this email.';
    if (e.code === 'auth/wrong-password') msg = 'Incorrect password.';
    if (e.code === 'auth/invalid-email') msg = 'Invalid email format.';
    showToast(msg, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Login';
    }
  }
}

function logout() { auth.signOut().then(() => window.location.reload()); }

// ── REAL-TIME LISTENERS ──────────────────────────────────────────────────────





auth.onAuthStateChanged(async (user) => {
  if (userUnsub) userUnsub();
  if (allUsersUnsub) allUsersUnsub();
  if (configUnsub) configUnsub();

  if (user) {
    document.body.classList.add('auth');
    
    // Ensure clean page state on login
    if (!document.querySelector('.page.active')) {
      showPage('dashboard');
    }
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
          if (document.getElementById('page-quiz')?.classList.contains('active')) renderQuiz();
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






// ── DATA FETCHING ────────────────────────────────────────────────────────────
let dataUnsubs = [];

function loadDynamicData() {
  dataUnsubs.forEach(u => u && u());
  dataUnsubs = [];

  configUnsub = db.collection('config').doc('roadmaps').onSnapshot(doc => {
    if (doc.exists) { 
      const data = doc.data();
      if (!data['Data Engineering'] || data['Data Analyst']) {
        console.warn("Stale global roadmap detected. Prioritizing local logic-first curriculum.");
        ROADMAPS_DB = ROADMAPS;
      } else {
        ROADMAPS_DB = data;
      }
    } else {
      ROADMAPS_DB = ROADMAPS;
    }
    renderDashboard(); renderRoadmap(); 
  });
  dataUnsubs.push(configUnsub);

  const wUnsub = db.collection('weeks').onSnapshot(snap => {
    if (!snap.empty) { 
      const data = snap.docs.map(d => d.data()).sort((a,b) => a.w - b.w);
      if (!data.some(w => w.phase && w.phase.includes('da'))) {
         WEEKS_DB = WEEKS;
      } else {
         WEEKS_DB = data;
      }
    } else {
      WEEKS_DB = WEEKS || []; // Fallback
    }
    renderRoadmap(); 
  });
  dataUnsubs.push(wUnsub);

  const pUnsub = db.collection('projects').onSnapshot(snap => {
    if (!snap.empty) { PROJECTS_DB = snap.docs.map(d => d.data()).sort((a,b) => a.num - b.num); }
    else { PROJECTS_DB = PROJECTS || []; } // Fallback
    renderProjects();
  });
  dataUnsubs.push(pUnsub);

  const rUnsub = db.collection('resources').onSnapshot(snap => {
    if (!snap.empty) { RESOURCES_DB = snap.docs.map(d => d.data()); }
    else { RESOURCES_DB = RESOURCES || []; } // Fallback
    renderResources();
  });
  dataUnsubs.push(rUnsub);

  const sUnsub = db.collection('skills').onSnapshot(snap => {
    if (!snap.empty) { SKILLS_DB = snap.docs.map(d => d.data()); }
    else { SKILLS_DB = SKILLS || []; } // Fallback
    renderSkills();
  });
  dataUnsubs.push(sUnsub);
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


// ── PAGE RENDERERS ───────────────────────────────────────────────────────────






















function renderRecentLogs() {
  const container = document.getElementById('log-entries-list'); if (!container) return;
  const user = auth.currentUser; if (!user) return;
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
  if (logsUnsub) logsUnsub();
  logsUnsub = db.collection('users').doc(targetUid).collection('logs').orderBy('createdAt','desc').onSnapshot(snap => {
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Calculate Streak based on unique days
    const streak = calculateStreak(logs);
    if (state.streak !== streak) {
      state.streak = streak;
      db.collection('users').doc(targetUid).update({ streak: streak });
    }
    updateKPIs(); // Refresh UI with new streak

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
  const user = auth.currentUser;
  if (!user) return showToast("You must be logged in", true);

  const topic = document.getElementById('log-topic')?.value;
  const learned = document.getElementById('log-learned')?.value;
  const hours = parseFloat(document.getElementById('log-hours')?.value || 0);
  const date = document.getElementById('log-date')?.value || new Date().toISOString().split('T')[0];
  const week = document.getElementById('log-week')?.value;
  const tool = document.getElementById('log-tool')?.value;
  const handson = document.getElementById('log-handson')?.value;
  const tomorrow = document.getElementById('log-tomorrow')?.value;

  if (!topic || !learned) return showToast("Fill topic and learned fields", true);

  const entry = { 
    topic, learned, hours, date, week, tool, handson, tomorrow,
    createdAt: firebase.firestore.FieldValue.serverTimestamp() 
  };

  try {
    const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : user.uid;
    const userRef = db.collection('users').doc(targetUid);
    await userRef.collection('logs').add(entry);
    const updateObj = { 
      totalHours: firebase.firestore.FieldValue.increment(hours)
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











function fixLinks() {}
isHostEditMode = false;






// Add call to renderReviewWeeks in renderWeekly





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

  // Quiz Topic Selection
  document.getElementById('quiz-topic-select')?.addEventListener('change', (e) => {
    quizState.selectedTopic = e.target.value;
    state.selectedQuizTopic = e.target.value;
    saveState();
  });
});

// ── QUIZ LOGIC ───────────────────────────────────────────────────────────────
quizState = {
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
    const startBtn = document.getElementById('quiz-start-btn');
    if (select) {
      const roadmap = state.assignedRoadmap || 'Data Engineering';
      const myPhases = ROADMAPS[roadmap]?.map(p => p.id) || [];
      const doneWeekNums = Object.keys(state.weekStatus || {}).filter(w => state.weekStatus[w] === 'done').map(Number);
      
      const completedTopics = WEEKS_DB
        .filter(w => doneWeekNums.includes(w.w) && myPhases.includes(w.phase))
        .map(w => w.title);
      
      const uniqueTopics = [...new Set(completedTopics)];
      
      if (uniqueTopics.length === 0) {
        select.innerHTML = '<option value="none">No Topics Completed Yet</option>';
        if (startBtn) {
          startBtn.disabled = true;
          startBtn.style.opacity = '0.5';
          startBtn.textContent = 'Complete a topic to unlock';
        }
      } else {
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.style.opacity = '1';
          startBtn.textContent = 'Start AI Quiz';
        }
        select.innerHTML = '<option value="all">Anywhere (All Completed Topics)</option>' + 
          uniqueTopics.map(t => `<option value="${t}">${t}</option>`).join('');
        
        // Restore selection
        if (state.selectedQuizTopic) {
          if (uniqueTopics.includes(state.selectedQuizTopic) || state.selectedQuizTopic === 'all') {
            select.value = state.selectedQuizTopic;
            quizState.selectedTopic = state.selectedQuizTopic;
          } else {
            select.value = 'all';
            quizState.selectedTopic = 'all';
            state.selectedQuizTopic = 'all';
          }
        }
      }
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
  const myPhases = ROADMAPS[roadmap]?.map(p => p.id) || [];
  const completedTopicTitles = WEEKS_DB
    .filter(w => doneWeekNums.includes(w.w) && myPhases.includes(w.phase))
    .map(w => w.title);

  const combinedPool = [
    ...ALL_QUESTIONS,
    ...CODING_CHALLENGES,
    ...(typeof EXTRACTED_MCQS !== 'undefined' ? EXTRACTED_MCQS : []),
    ...(typeof EXTRACTED_CODE !== 'undefined' ? EXTRACTED_CODE : [])
  ];

  let filteredPool = [];
  if (selectedTopic !== 'all' && selectedTopic !== 'none') {
    filteredPool = combinedPool.filter(q => q.topic === selectedTopic);
  } else {
    // Broadened filter to ensure larger variety (All questions for your roadmap)
    filteredPool = combinedPool.filter(q => q.tags.includes(roadmap));
  }

  // ENSURE 20 QUESTIONS: If the selected topic or roadmap pool is too small,
  // supplement with ANY available questions to reach the 20 target.
  if (filteredPool.length < 20) {
    const fallbackPool = combinedPool.filter(q => !filteredPool.includes(q));
    // Shuffle fallback to get random variety
    for (let i = fallbackPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fallbackPool[i], fallbackPool[j]] = [fallbackPool[j], fallbackPool[i]];
    }
    filteredPool = [...filteredPool, ...fallbackPool];
  }

  // Shuffle logic (Fisher-Yates)
  for (let i = filteredPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredPool[i], filteredPool[j]] = [filteredPool[j], filteredPool[i]];
  }

  quizState = {
    active: true,
    currentQuestion: null,
    index: 0,
    total: Math.min(20, filteredPool.length),
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




