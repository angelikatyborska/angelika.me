document.addEventListener('DOMContentLoaded', function() {
  var html = document.querySelector('html');
  var input = document.querySelector('.dark-mode-switch-input');
  var label = document.querySelector('.dark-mode-switch-label');
  var savedMode = window.localStorage.getItem('dark');

  if (savedMode === 'true') {
    toggleMode();
  }

  function toggleMode() {
    if (html.hasAttribute('data-dark')) {
      html.removeAttribute('data-dark');
      label.innerHTML = '<span class=\"sr-only\">Dark mode </span>☀️'
      window.localStorage.setItem('dark', 'false')
    } else {
      html.setAttribute('data-dark', 'true');
      label.innerHTML = '<span class=\"sr-only\">Dark mode </span>🌘️'
      window.localStorage.setItem('dark', 'true')
    }
  }

  input.addEventListener('click', toggleMode);
});
