function headingBreadcrumbs(article, breadcrumbsContainer, options) {
  var ARTICLE = document.querySelector(article);
  var CONTAINER = document.querySelector(breadcrumbsContainer);
  var END_OF_ARTICLE = ARTICLE.offsetTop + ARTICLE.offsetHeight;
  var HIGHEST_LEVEL = options.highestLevel || 2;
  var FADING_DISTANCE = options.fadingDistance || 100;
  var OFFSET_END_OF_SCOPE = options.offsetEndOfScope || 100;

  init();

  function init() {
    var headingsPerLevel = getHeadingsPerLevel();
    makeBreadcrumbs(headingsPerLevel);

    window.addEventListener('scroll', function() {
      makeBreadcrumbs(headingsPerLevel);
    });
  }

  function makeBreadcrumbs(headingsPerLevel) {
    CONTAINER.innerHTML = getBreadcrumbs(headingsPerLevel, scrollTop());
  }

  function scrollTop() {
    return window.scrollY;
  }

  function getHeadingsPerLevel() {
    var headingsPerLevel =  [];

    for (var level = HIGHEST_LEVEL; level <= 6; level++) {
      var headings = Array.prototype.slice.call(ARTICLE.querySelectorAll('h' + level));
      headings = headings.sort(function(a, b) { return b.offsetTop - a.offsetTop });
      headingsPerLevel.push(headings);
    }

    return headingsPerLevel;
  }

  function getBreadcrumbs(headingsPerLevel, scrollTop) {
    var breadcrumbs = [];
    var headingsInScope = findHeadingsInScope(headingsPerLevel, scrollTop);

    headingsInScope.forEach(function(heading) {
      var opacity = calculateOpacity(heading.beginningOfScope, heading.endOfScope, scrollTop);

      var html = '<a href="#' + heading.id
        + '" class="' + heading.tag
        + '" style="opacity:' + opacity
        + '; pointer-events: ' + (opacity > 0.5 ? 'auto' : 'none')
        + '">' + heading.text
        + '</a>';

      breadcrumbs.push(html);
    });

    return breadcrumbs.join('');
  }

  function findHeadingsInScope(headingsPerLevel, scrollTop) {
    var headingsInScope = [];
    var previousHeadingOffset = 0;

    headingsPerLevel.forEach(function(headings, level) {
      var heading = headings.find(function(node) {
        return node.offsetTop < scrollTop && node.offsetTop > previousHeadingOffset
      });

      if (heading) {
        var nextHeadingOfSameLevel = headingsPerLevel[level][headingsPerLevel[level].indexOf(heading) - 1];
        var currentHeadingOfHigherLevel = headingsInScope[headingsInScope.length - 1];
        var endOfScope = calculateEndOfScope(nextHeadingOfSameLevel, currentHeadingOfHigherLevel);

        headingsInScope.push({
          id: heading.id,
          tag: heading.tagName.toLowerCase(),
          text: heading.textContent,
          beginningOfScope: heading.offsetTop + heading.offsetHeight,
          endOfScope: endOfScope
        });

        previousHeadingOffset = heading.offsetTop;
      }
      else {
        previousHeadingOffset = END_OF_ARTICLE;
      }
    });

    return headingsInScope;
  }

  function calculateEndOfScope(nextHeadingOfSameLevel, currentHeadingOfHigherLevel) {
    var endOfScope;

    if (currentHeadingOfHigherLevel) {
      if (nextHeadingOfSameLevel) {
        endOfScope = Math.min(nextHeadingOfSameLevel.offsetTop, currentHeadingOfHigherLevel.endOfScope);
      }
      else {
        endOfScope = currentHeadingOfHigherLevel.endOfScope;
      }
    }
    else {
      if (nextHeadingOfSameLevel) {
        endOfScope = nextHeadingOfSameLevel.offsetTop
      }
      else {
        endOfScope = END_OF_ARTICLE;
      }
    }

    return endOfScope;
  }

  function calculateOpacity(top, bottom, scrollTop) {
    var diffTop = scrollTop - top;
    var opacityTop = diffTop > FADING_DISTANCE ? 1 : diffTop / FADING_DISTANCE;

    var diffBottom = bottom - scrollTop - OFFSET_END_OF_SCOPE;
    var opacityBottom = diffBottom > FADING_DISTANCE ? 1 : diffBottom / FADING_DISTANCE;

    return Math.min(opacityTop, opacityBottom);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  headingBreadcrumbs('.post', '.post + aside', {});
});
