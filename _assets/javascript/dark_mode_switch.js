document.addEventListener('DOMContentLoaded', function() {
  var html = document.querySelector('html');
  var button = document.querySelector('.dark-mode-switch');
  var savedMode = window.localStorage.getItem('dark');

  if (savedMode === 'true') {
    toggleMode();
  }

  function toggleMode() {
    if (html.hasAttribute('data-dark')) {
      html.removeAttribute('data-dark');
      button.innerHTML = '☀️'
      window.localStorage.setItem('dark', 'false')
    } else {
      html.setAttribute('data-dark', 'true');
      button.innerHTML = '🌘️'
      window.localStorage.setItem('dark', 'true')
    }
  }

  button.addEventListener('click', toggleMode);
});
