(function () {
  'use strict';

  function data() {
    try { return JSON.parse(localStorage.getItem('advocateDeskData') || '{}'); }
    catch (_) { return {}; }
  }

  function findCaseCard(id) {
    var wanted = String(id || '');
    var nodes = document.querySelectorAll('[data-case-id]');
    for (var i = 0; i < nodes.length; i += 1) {
      if (String(nodes[i].getAttribute('data-case-id') || '') === wanted) return nodes[i];
    }
    return null;
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
      var btn = findCaseCard(found.id);
      if (btn) btn.click();
      else if (typeof window.openCase360 === 'function') window.openCase360(found.id);
    }, 150);
    return true;
  }

  function addOpenButton(row, caseId, caseNumber) {
    if (row.querySelector('.hearing-open-case-btn')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'hearing-open-case-btn';
    button.textContent = 'Open Case 360';
    button.style.cssText = 'margin-left:8px;padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:transparent;color:inherit;cursor:pointer;font-size:12px;';
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      goToCase(caseId, caseNumber);
    });
    row.appendChild(button);
  }

  function enhance() {
    var hearingPage = document.querySelector('[data-page="hearings"].active') ||
      document.querySelector('[data-page="hearings"][aria-current="page"]');
    if (!hearingPage && !location.hash) return;
    document.querySelectorAll('tr, .hearing-row, .hearing-card').forEach(function (row) {
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
      row.setAttribute('role', row.getAttribute('role') || 'button');
      row.setAttribute('tabindex', row.getAttribute('tabindex') || '0');
      addOpenButton(row, caseId, caseNumber);
      function activate(event) {
        if (event.target.closest('button, a, input, select, textarea')) return;
        if (goToCase(caseId, caseNumber)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
      row.addEventListener('click', activate);
      row.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') activate(event);
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
