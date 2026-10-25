(function () {
  try {
    const savedTheme = localStorage.getItem('gym_theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || ((!savedTheme || savedTheme === 'auto') && systemDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) { /* localStorage bloqueado — ignora */ }
})();