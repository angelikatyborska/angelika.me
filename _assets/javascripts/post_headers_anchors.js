var anchorForId = function (id) {
  var anchor = document.createElement('a');
  anchor.className = 'header-link';
  anchor.href      = '#' + id;
  anchor.innerHTML = '<i class=\'fa fa-link\'></i>';
  return anchor;
};

var linkifyAnchors = function (level, containingElement) {
  var headers = containingElement.getElementsByTagName('h' + level);
  for (var h = 0; h < headers.length; h++) {
    var header = headers[h];

    if (typeof header.id !== 'undefined' && header.id !== '') {
      header.insertAdjacentElement('afterbegin', anchorForId(header.id));
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
