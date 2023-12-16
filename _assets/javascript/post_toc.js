function postToc(article, tocContainer, options) {
  var ARTICLE = document.querySelector(article);
  var HIGHEST_LEVEL = options.highestLevel || 2;
  var CONTAINER = document.querySelector(tocContainer)

  init();

  function init() {
    var headingsPerLevel = getHeadingsPerLevel();
    if (headingsPerLevel.flat().length > 0) {
      markCurrentLink(headingsPerLevel, scrollTop());

      window.addEventListener('scroll', function () {
        markCurrentLink(headingsPerLevel, scrollTop());
      });
    } else {
      // completely clear container if would be empty
      CONTAINER.innerHTML = '';
    }
  }

  function scrollTop() {
    return window.scrollY - startOfArticle();
  }

  function startOfArticle() {
    return ARTICLE.offsetTop
  }

  function endOfArticle() {
    return ARTICLE.offsetTop + ARTICLE.offsetHeight;
  }

  function getHeadingsPerLevel() {
    var headingsPerLevel =  [];

    for (var level = HIGHEST_LEVEL; level <= 6; level++) {
      var headings = Array.prototype.slice.call(document.querySelectorAll(`${article} > h` + level));
      // offset top will change after resizing but that doesn't matter
      // the order will remain the same
      headings = headings.sort(function(a, b) { return a.offsetTop - b.offsetTop });
      headingsPerLevel.push(headings);
    }

    return headingsPerLevel;
  }

  function markCurrentLink(headingsPerLevel, scrollTop) {
    var allArticleHeadings = findAllArticleHeadings(headingsPerLevel, scrollTop);
    allArticleHeadings.forEach(function(heading) {
      var isActive = isHeadingActive(heading.beginningOfScope(), heading.endOfScope(), scrollTop);

      var headerLink = ARTICLE.querySelector(`*[href=\'#${heading.id}\']`)

      if (isActive) {
        headerLink.classList.add('active')
        headerLink.setAttribute('aria-current', 'location')
      } else {
        headerLink.classList.remove('active')
        headerLink.removeAttribute('aria-current')
      }
    });
  }

  function findAllArticleHeadings(headingsPerLevel, scrollTop) {
    var allArticleHeadings = [];

    headingsPerLevel.forEach(function(headings, level) {
      headings.forEach(function (heading) {
        if (heading) {
          var beginningOfScope = () => heading.offsetTop
          var nextHeadingOfSameLevel = headingsPerLevel[level][headingsPerLevel[level].indexOf(heading) + 1];

          var currentHeadingOfHigherLevel = allArticleHeadings.find(h => h.level === level + 1 && h.endOfScope() > beginningOfScope() && h.beginningOfScope() < beginningOfScope())
          var endOfScope = () => calculateEndOfScope(nextHeadingOfSameLevel, currentHeadingOfHigherLevel);

          allArticleHeadings.push({
            id: heading.id,
            tag: heading.tagName.toLowerCase(),
            text: heading.textContent,
            beginningOfScope: beginningOfScope,
            endOfScope: endOfScope,
            level: level + 2
          });

        }
      });
    });

    return allArticleHeadings.sort((a, b) => a.beginningOfScope() - b.beginningOfScope());
  }

  function calculateEndOfScope(nextHeadingOfSameLevel, currentHeadingOfHigherLevel) {
    var endOfScope;

    if (currentHeadingOfHigherLevel) {
      if (nextHeadingOfSameLevel) {
        endOfScope = Math.min(nextHeadingOfSameLevel.offsetTop, currentHeadingOfHigherLevel.endOfScope());
      }
      else {
        endOfScope = currentHeadingOfHigherLevel.endOfScope();
      }
    }
    else {
      if (nextHeadingOfSameLevel) {
        endOfScope = nextHeadingOfSameLevel.offsetTop
      }
      else {
        endOfScope = endOfArticle();
      }
    }

    return endOfScope;
  }

  function isHeadingActive(top, bottom, scrollTop) {
    var offsetForAnchorLinksToBeActiveAfterClicks = 30
    var diffTop = scrollTop - top + offsetForAnchorLinksToBeActiveAfterClicks;
    var diffBottom = bottom - scrollTop - offsetForAnchorLinksToBeActiveAfterClicks;

    return diffTop > 0 && diffBottom > 0;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  postToc('#post-content', '#post-aside', {});
});
