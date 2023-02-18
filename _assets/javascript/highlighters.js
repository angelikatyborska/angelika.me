document.addEventListener('DOMContentLoaded', function() {
  var root = document.querySelector(':root');
  var defaultColor = 'magenta';
  var savedColor = window.localStorage.getItem('--highlight');

  var colors = ['magenta', 'cyan', 'green', 'yellow']
  var highlighters = colors.map(function (color) {
    return document.querySelector(`input[name=highlight][value=${color}]`);
  })

  if (savedColor) {
    var savedHighlighter = highlighters[colors.findIndex(function (x) { return x === savedColor })]
    setCurrent(savedHighlighter, savedColor)
  } else {
    var defaultHighlighter = highlighters[colors.findIndex(function (x) { return x === defaultColor })]
    setCurrent(defaultHighlighter, defaultColor)
  }

  function setCurrent(highlighter, color) {
    console.log('set current', highlighter)
    root.style.setProperty('--highlight', `var(--${color}-highlight)`);
    window.localStorage.setItem('--highlight', color);

    highlighters.forEach(function(el) {
      el.removeAttribute('checked')
    });

    highlighter.setAttribute('checked', 'checked')
  }

  highlighters.forEach(function (highlighter, index) {
    var color = colors[index]
    highlighter.addEventListener('click', function () { setCurrent(highlighter, color) });
  })
});
