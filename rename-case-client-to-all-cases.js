(function () {
  'use strict';

  function renameCaseClient() {
    // Keep the left sidebar label unchanged.
    var navItem = document.querySelector('.nav-item[data-page="case-client"]');
    if (navItem) {
      var label = navItem.querySelector('span:not(.nav-icon)');
      if (label) label.textContent = 'Clients & Cases';
    }

    // Change only the page/module heading to All Cases.
    var headings = document.querySelectorAll('h1, h2, h3, h4, .page-title, .section-title');
    headings.forEach(function (heading) {
      var text = heading.textContent.trim();
      if (text === 'Case & Client' || text === 'Clients & Cases') {
        heading.textContent = 'All Cases';
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
