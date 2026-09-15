(function () {
  'use strict';

  function renameCaseClient() {
    var navItem = document.querySelector('.nav-item[data-page="case-client"]');
    if (navItem) {
      var label = navItem.querySelector('span:not(.nav-icon)');
      if (label) label.textContent = 'Clients & Cases';
    }

    var headings = document.querySelectorAll('h1, h2, h3, h4, .page-title, .section-title');
    headings.forEach(function (heading) {
      if (heading.textContent.trim() === 'Case & Client' || heading.textContent.trim() === 'All Cases') {
        heading.textContent = 'Clients & Cases';
      }
    });
  }

  renameCaseClient();
  setTimeout(renameCaseClient, 0);
  setTimeout(renameCaseClient, 150);
  setTimeout(renameCaseClient, 500);

  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-page="case-client"]');
    if (item) {
      setTimeout(renameCaseClient, 20);
      setTimeout(renameCaseClient, 150);
    }
  }, true);
})();
