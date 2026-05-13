let myRole = 'user'; 
let state = { ...defaultState };
let me = {};
let allUsers = [];
let viewingUserId = null;
let activePhaseFilter = 'all';

let ROADMAPS_DB = ROADMAPS;
let WEEKS_DB = WEEKS;
let PROJECTS_DB = PROJECTS;
let RESOURCES_DB = RESOURCES;
let SKILLS_DB = SKILLS;

let globalUnsubs = [];

function registerListener(unsub) {
  if (typeof unsub === 'function') {
    globalUnsubs.push(unsub);
  }
}

function clearAllListeners() {
  globalUnsubs.forEach(u => u && u());
  globalUnsubs = [];
  if (typeof userUnsub !== 'undefined' && userUnsub) { userUnsub(); userUnsub = null; }
  if (typeof allUsersUnsub !== 'undefined' && allUsersUnsub) { allUsersUnsub(); allUsersUnsub = null; }
  if (typeof configUnsub !== 'undefined' && configUnsub) { configUnsub(); configUnsub = null; }
  if (typeof logsUnsub !== 'undefined' && logsUnsub) { logsUnsub(); logsUnsub = null; }
}

let userUnsub = null;
let allUsersUnsub = null;
let configUnsub = null;
let logsUnsub = null;

let isHostEditMode = false;

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

async function saveState() {
  const targetUid = (myRole === 'host' && viewingUserId) ? viewingUserId : auth.currentUser?.uid;
  if (!targetUid) return;
  try {
    const userRef = db.collection('users').doc(targetUid);
    const updateObj = {
      assignedRoadmap: state.assignedRoadmap || null,
      weekStatus: state.weekStatus || {},
      dayStatus: state.dayStatus || {},
      skillNow: state.skillNow || {},
      skillTarget: state.skillTarget || {},
      projectStatus: state.projectStatus || {},
      resourceStatus: state.resourceStatus || {},
      weekReviews: state.weekReviews || {},
      quizScores: state.quizScores || []
    };
    await userRef.update(updateObj);
    if (myRole !== 'host' || !viewingUserId) {
      me = { ...me, ...updateObj };
    }
  } catch (e) {
    console.error("Save state error:", e);
  }
}
