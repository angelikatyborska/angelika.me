var anchorForId = function (id) {
  var anchorWrapper = document.createElement('span');
  var anchor = document.createElement('a');
  anchorWrapper.className = 'header-link';
  anchor.href = '#' + id;
  anchor.innerHTML = '<i class=\'fas fa-link\'></i>';
  // I am imitating GitHub here, they hide those links too
  anchor.setAttribute('aria-hidden', 'true');
  anchorWrapper.appendChild(anchor)
  return anchorWrapper;
};

var linkifyAnchors = function (level, containingElement) {
  var headers = containingElement.getElementsByTagName('h' + level);
  for (var h = 0; h < headers.length; h++) {
    var header = headers[h];

    if (typeof header.id !== 'undefined' && header.id !== '') {
      header.insertAdjacentElement('beforeend', anchorForId(header.id));
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
    var post = document.getElementsByClassName('post')[0];

    if (post) {
      for (var level = 1; level <= 6; level++) {
        linkifyAnchors(level, post);
      }
    }
});
