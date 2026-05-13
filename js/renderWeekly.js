function renderReviewWeeks() {
  const grid = document.getElementById('review-week-grid'); if (!grid) return;
  const activePhases = getActivePhases();
  const roadmapWeeks = [].concat(...activePhases.map(p => p.weeks));
  const currentWeekNum = getCurrentWeek();
  const dataWeeks = [...Object.keys(state.weekStatus || {}), ...Object.keys(state.weekReviews || {})].map(Number);
  
  // Shifted Focus: Show weeks 20 through 52
  const startW = 20;
  const endW = Math.max(52, currentWeekNum, ...dataWeeks);
  const allWeeks = Array.from({ length: endW - startW + 1 }, (_, i) => i + startW);
  
  grid.innerHTML = allWeeks.map(w => {
    const isSelected = (state.selectedReviewWeek || 20) == w;
    const status = state.weekReviews?.[w]?.status || 'Empty';
    return `<button class="week-sel-btn ${isSelected?'active':''}" onclick="setReviewWeek(${w})">W${w}<br><small style="font-size:8px;">${status}</small></button>`;
  }).join('');
}

function setReviewWeek(w) {
  state.selectedReviewWeek = w;
  renderReviewWeeks();
  renderWeekly();
}

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

function toggleHostEditMode() {
  isHostEditMode = !isHostEditMode;
  const btn = document.getElementById('host-edit-mode-btn');
  if (btn) btn.textContent = `Edit Mode: ${isHostEditMode ? 'ON' : 'OFF'}`;
  renderWeekly();
}

