function showPage(id, btn, pushState = true) {
  const pageEl = document.getElementById('page-' + id);
  if (!pageEl) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  pageEl.classList.add('active');
  if (btn) btn.classList.add('active');
  else {
    const matchingBtn = document.querySelector(`.nav-item[onclick*="showPage('${id}'"]`);
    if (matchingBtn) matchingBtn.classList.add('active');
  }
  
  // History API
  if (pushState) {
    history.pushState({ pageId: id }, '', `#${id}`);
  }
  
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    const titles = {
      dashboard: 'Dashboard', roadmap: 'Curriculum Roadmap', daily: 'Learning Logs',
      skills: 'Skills Tracker', projects: 'Portfolio Projects', weekly: 'Weekly Performance',
      quiz: 'QuizGPT — AI Tutor',
      resources: 'Knowledge Base', 'admin-users': 'User Management', 
      'admin-content': 'Content Manager', profile: 'My Profile'
    };
    titleEl.textContent = titles[id] || 'Learning Portal';
  }

  const renderers = {
    dashboard: renderDashboard, roadmap: renderRoadmap, skills: renderSkills,
    projects: renderProjects, weekly: renderWeekly, resources: renderResources,
    quiz: renderQuiz,
    daily: (typeof renderRecentLogs === 'function') ? renderRecentLogs : null,
    'admin-users': (typeof renderAdminUsers === 'function') ? renderAdminUsers : null, 
    'admin-content': (typeof renderAdminContent === 'function') ? renderAdminContent : null,
    profile: (typeof renderProfile === 'function') ? renderProfile : null
  };
  if (renderers[id]) renderers[id]();
}

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.pageId) {
    showPage(e.state.pageId, null, false);
  } else {
    const hash = window.location.hash.replace('#', '');
    showPage(hash || 'dashboard', null, false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    // Slightly delay to ensure renderers are loaded
    setTimeout(() => showPage(hash, null, false), 50);
  } else {
    // Initial history state
    history.replaceState({ pageId: 'dashboard' }, '', '#dashboard');
  }
});

const handleGlobalSearch = debounce(function(query) {
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
      <div class="card search-result-item" onclick="showPage('${r.page}', document.querySelector('.nav-item[onclick*=\\'${r.page}\\']')); document.getElementById('global-search-results').classList.remove('active');" style="margin-bottom:8px; padding:12px;">
        <!-- Injected Elements -->
        <div class="light-wrap"><div class="light-color"></div></div>
        <div class="noise-overlay"></div>

        <div class="result-icon" style="position:relative; z-index:2;">${r.icon}</div>
        <div class="result-content" style="position:relative; z-index:2;">
          <div class="result-type">${r.type}</div>
          <div class="result-title">${r.title}</div>
        </div>
      </div>
    `).join('');
  }

  container.classList.add('active');
}, 300);

