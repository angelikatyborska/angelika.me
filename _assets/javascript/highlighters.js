document.addEventListener('DOMContentLoaded', function() {
  var root = document.querySelector(':root');
  var defaultColor = 'yellow';
  var savedColor = window.localStorage.getItem('--highlight');

  var colors = ['magenta', 'cyan', 'green', 'yellow']
  var highlighters = colors.map(function (color) {
    return document.querySelector(`.highlighter.${color}`);
  })

  if (savedColor) {
    var savedHighlighter = highlighters[colors.findIndex(function (x) { return x === savedColor })]
    setCurrent(savedHighlighter, savedColor)
  } else {
    var defaultHighlighter = highlighters[colors.findIndex(function (x) { return x === defaultColor })]
    setCurrent(defaultHighlighter, defaultColor)
  }

  function setCurrent(highlighter, color) {
    root.style.setProperty('--highlight', `var(--${color}-highlight)`);
    window.localStorage.setItem('--highlight', color);

    highlighters.forEach(function(el) {
      el.classList.remove('active');
    });

    highlighter.classList.add('active');
  }

  highlighters.forEach(function (highlighter, index) {
    var color = colors[index]
    highlighter.addEventListener('click', function () { setCurrent(highlighter, color) });
  })
});
