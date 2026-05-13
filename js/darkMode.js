function initDarkMode() {
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    toggleBtn.textContent = '🌙';
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggleBtn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggleBtn.textContent = '☀️';
    }
  });
}

// Initialize immediately or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
  initDarkMode();
}
