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
        const roadmapWeeks = [].concat(...activePhases.map(p => p.weeks));
        const currentWeekNum = getCurrentWeek();
        const dataWeeks = [...Object.keys(state.weekStatus || {}), ...Object.keys(state.weekReviews || {})].map(Number);
        
        const allUniqueWeeks = [...new Set([...roadmapWeeks, ...dataWeeks, currentWeekNum])];
        const doneWeeks = allUniqueWeeks.filter(w => state.weekStatus[w] === 'done').length;
        const pct = allUniqueWeeks.length > 0 ? Math.round((doneWeeks / allUniqueWeeks.length) * 100) : 0;
        
        welcomeSub.innerHTML = `Today is <span style="color:var(--blue2); font-weight:600;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> · You've completed ${pct}% of your roadmap. Keep the momentum!`;
      }
    } catch (e) { }

    if (sidebarName) sidebarName.textContent = `${fName} ${lName}`;
    if (avatar) avatar.textContent = (fName[0] || '') + (lName[0] || '');
    if (roleBadge) roleBadge.textContent = (u.role || myRole || 'user').toUpperCase();
    document.querySelectorAll('.host-only').forEach(el => el.style.display = (myRole === 'host') ? 'flex' : 'none');
  } catch (e) { console.error("UI Update Error:", e); }
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

function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(b) - new Date(a));
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  const lastLog = new Date(uniqueDates[0]);
  lastLog.setHours(0,0,0,0);

  // Use Math.round to avoid daylight saving time offset issues
  const diffInDays = Math.round((today - lastLog) / 86400000);

  if (diffInDays <= 1) { // logged today or yesterday
    streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i+1]);
      d1.setHours(0,0,0,0);
      d2.setHours(0,0,0,0);
      if (Math.round((d1 - d2) / 86400000) === 1) {
        streak++;
      } else {
        break;
      }
    }
  }
  return streak;
}

function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// For Jest testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentWeek,
    calculateWeekFromDate,
    calculateStreak
  };
}

