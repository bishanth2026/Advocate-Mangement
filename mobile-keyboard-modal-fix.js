/* Keeps focused fields visible above the iOS/Android keyboard. */
(function () {
  'use strict';
  function keepFieldVisible(event) {
    var field = event.target;
    if (!field || !field.matches || !field.matches('#modal input, #modal select, #modal textarea')) return;
    window.setTimeout(function () {
      var modalCard = document.querySelector('#modal .modal-card');
      if (!modalCard || !document.getElementById('modal') || document.getElementById('modal').classList.contains('hidden')) return;
      try {
        field.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
      } catch (error) {
        field.scrollIntoView(false);
      }
    }, 250);
  }
  document.addEventListener('focusin', keepFieldVisible, true);
})();
