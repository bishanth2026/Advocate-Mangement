(function () {
  'use strict';

  function renameCaseClient() {
    var navItem = document.querySelector('.nav-item[data-page="case-client"]');
    if (navItem) {
      var label = navItem.querySelector('span:not(.nav-icon)');
      if (label && label.textContent !== 'Clients & Cases') label.textContent = 'Clients & Cases';
    }

    // Only rename the actual page title. Do not rename client-section headings.
    var pageTitle = document.querySelector('#content .page-title h1');
    if (pageTitle && (pageTitle.textContent.trim() === 'Case & Client' || pageTitle.textContent.trim() === 'Clients & Cases')) {
      pageTitle.textContent = 'All Cases';
    }
  }

  function run() { renameCaseClient(); }
  run();
  setTimeout(run, 0);
  setTimeout(run, 150);
  setTimeout(run, 500);

  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-page="case-client"]');
    if (item) {
      setTimeout(run, 20);
      setTimeout(run, 150);
    }
  }, true);
})();
