(function () {
  'use strict';

  function data() {
    try { return JSON.parse(localStorage.getItem('advocateDeskData') || '{}'); }
    catch (_) { return {}; }
  }

  function goToCase(caseId, caseNumber) {
    var d = data();
    var cases = Array.isArray(d.cases) ? d.cases : [];
    var found = cases.find(function (c) {
      return String(c.id || '') === String(caseId || '') ||
        String(c.caseNumber || c.number || '').toLowerCase() === String(caseNumber || '').toLowerCase();
    });
    if (!found) return false;
    window.currentCaseId = found.id;
    try { sessionStorage.setItem('advocateDeskOpenCaseId', String(found.id)); } catch (_) {}
    var nav = document.querySelector('[data-page="cases"]');
    if (nav) nav.click();
    setTimeout(function () {
      var btn = document.querySelector('[data-case-id="' + CSS.escape(String(found.id)) + '"]');
      if (btn) btn.click();
      else if (typeof window.openCase360 === 'function') window.openCase360(found.id);
    }, 150);
    return true;
  }

  function enhance() {
    if (!location.hash && !document.querySelector('[data-page="hearings"].active')) return;
    document.querySelectorAll('tr, .hearing-row, .hearing-card, .card').forEach(function (row) {
      if (row.dataset.caseNavEnhanced === '1') return;
      var text = row.textContent || '';
      var caseId = row.dataset.caseId || row.getAttribute('data-case') || '';
      var caseNumber = row.dataset.caseNumber || '';
      if (!caseId && !caseNumber) {
        var d = data();
        var cases = Array.isArray(d.cases) ? d.cases : [];
        var match = cases.find(function (c) { return c.caseNumber && text.indexOf(c.caseNumber) !== -1; });
        if (match) { caseId = match.id; caseNumber = match.caseNumber; }
      }
      if (!caseId && !caseNumber) return;
      row.dataset.caseNavEnhanced = '1';
      row.style.cursor = 'pointer';
      row.title = 'Open related Case 360';
      row.addEventListener('click', function (event) {
        if (event.target.closest('button, a, input, select, textarea')) return;
        if (goToCase(caseId, caseNumber)) event.preventDefault();
      });
    });
  }

  setInterval(enhance, 700);
  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-open-case], [data-case-id]');
    if (!el || !el.closest('#content')) return;
    var id = el.dataset.openCase || el.dataset.caseId;
    if (id) goToCase(id, el.dataset.caseNumber || '');
  });
})();
