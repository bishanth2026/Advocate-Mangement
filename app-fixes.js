/* AdvocateDesk compatibility fixes */
(function () {
  'use strict';
  if (typeof window.esc !== 'function') window.esc = function (v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  function data() { try { return JSON.parse(localStorage.getItem('advocateDeskData') || '{}') || {}; } catch (_) { return {}; } }
  function date(v) { if (!v) return null; var d = new Date(String(v).slice(0, 10) + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; }
  function control(labelText, root) {
    var scope = root || document;
    var labels = Array.from(scope.querySelectorAll('label'));
    var label = labels.find(function (l) { return l.textContent.replace(/\*/g, '').trim().toLowerCase() === labelText.toLowerCase(); });
    if (!label) return null;
    var field = label.closest('.field') || label.parentElement;
    return field ? field.querySelector('input,select,textarea') : null;
  }
  function fillHearingCase(modal, id) {
    var list = Array.isArray(data().cases) ? data().cases : [];
    var c = list.find(function (x) { return String(x.id) === String(id) || String(x.number) === String(id); });
    if (!c) return;
    var title = control('Case Title', modal), client = control('Client', modal), court = control('Court', modal);
    function set(el, value, readonly) {
      if (!el) return;
      el.value = value || '';
      if (readonly) { el.readOnly = true; el.setAttribute('aria-readonly', 'true'); }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    set(title, c.title, false);
    set(client, c.client, true);
    set(court, c.court, false);
    var hidden = modal.querySelector('input[name="caseId"], input[data-case-id]');
    if (hidden) hidden.value = c.id;
  }
  function enhanceHearing() {
    var modal = Array.from(document.querySelectorAll('.modal,[role="dialog"]')).find(function (m) {
      return (m.offsetWidth || m.offsetHeight || m.getClientRects().length) && /Schedule Hearing|Edit Hearing/i.test(m.textContent || '');
    });
    if (!modal) return;
    var cases = Array.isArray(data().cases) ? data().cases : [];
    if (!cases.length) return;
    var original = control('Case Number', modal);
    if (!original) return;
    var select = original;
    if (select.tagName !== 'SELECT' || select.dataset.advocateCaseSelect !== '1') {
      var previous = original.value || '';
      if (original.tagName !== 'SELECT') {
        select = document.createElement('select');
        select.className = original.className || '';
        select.name = original.name || 'caseId';
        select.id = original.id || '';
        select.required = original.required;
        original.replaceWith(select);
      }
      select.dataset.advocateCaseSelect = '1';
      select.innerHTML = '<option value="">Select a case</option>' + cases.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc((c.number || c.title || c.id) + (c.client ? ' — ' + c.client : '')) + '</option>';
      }).join('');
      var match = cases.find(function (c) { return String(c.id) === previous || String(c.number) === previous; });
      if (match) select.value = match.id;
    }
    if (select.dataset.autofillBound !== '1') {
      var apply = function () { fillHearingCase(modal, select.value); };
      select.addEventListener('change', apply);
      select.addEventListener('input', apply);
      select.addEventListener('click', function () { window.setTimeout(apply, 0); });
      select.dataset.autofillBound = '1';
    }
    if (select.value) { fillHearingCase(modal, select.value); window.setTimeout(function () { fillHearingCase(modal, select.value); }, 80); }
  }
  function hidePast() {
    var table = document.getElementById('hearingTable'); if (!table) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    table.querySelectorAll('tbody tr').forEach(function (row) {
      var cell = row.querySelector('td'), d = cell && date(cell.textContent.trim());
      if (d) row.style.display = d < today ? 'none' : '';
    });
  }
  function dashboardFix() {
    var content = document.getElementById('content'); if (!content || !content.querySelector('.cards')) return;
    var now = new Date(), hour = now.getHours();
    var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    var title = content.querySelector('.page-title h1');
    if (title) title.textContent = greeting + ', Advocate';
    var subtitle = content.querySelector('.page-title p');
    if (subtitle) subtitle.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) + ' • Demo Workspace';
    var hearings = Array.isArray(data().hearings) ? data().hearings : [], start = new Date(now); start.setHours(0, 0, 0, 0), end = new Date(start); end.setDate(end.getDate() + 30);
    var count = hearings.filter(function (h) { var d = date(h.date); return d && d >= start && d <= end; }).length;
    var cards = content.querySelectorAll('.stat'), value = cards[1] && cards[1].querySelector('.stat-value');
    if (value) value.textContent = String(count);
  }
  function mobileNav() {
    var sidebar = document.querySelector('.sidebar'), overlay = document.getElementById('mobileOverlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('open'); overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true');
  }
  function run() { enhanceHearing(); hidePast(); dashboardFix(); }
  document.addEventListener('click', function (e) {
    var page = e.target.closest && e.target.closest('[data-page]');
    if (page) { mobileNav(); window.setTimeout(run, 80); }
    window.setTimeout(run, 80);
  }, false);
  document.addEventListener('change', function (e) {
    if (e.target && e.target.closest && e.target.closest('.modal,[role="dialog"]')) window.setTimeout(run, 20);
  }, false);
  window.addEventListener('hashchange', function () { window.setTimeout(run, 80); });
  run();
  window.setInterval(run, 1500);
  var style = document.createElement('style');
  style.textContent = 'button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation}@media(max-width:900px){.sidebar{transition:transform .2s ease}.sidebar.open{transform:translateX(0)}.mobile-overlay{display:none}.mobile-overlay.show{display:block}}';
  document.head.appendChild(style);
})();