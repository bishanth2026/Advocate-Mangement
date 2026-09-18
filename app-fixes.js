/* Compatibility and interaction fixes for the local AdvocateDesk build. */
(function () {
  'use strict';
  if (typeof window.esc !== 'function') {
    window.esc = function (value) { return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };
  }
  function closeMobileNav() {
    var sidebar = document.querySelector('.sidebar'), overlay = document.getElementById('mobileOverlay');
    if (sidebar && overlay && window.innerWidth <= 900) { sidebar.classList.remove('open'); overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true'); }
  }
  function makeCourtTypeahead() {
    document.querySelectorAll('.field select').forEach(function (select) {
      if (select.dataset.courtTypeahead === '1') return;
      var field = select.closest('.field'), label = field && field.querySelector('label');
      if (!label || !/^court$/i.test(label.textContent.trim())) return;
      var listId = 'courtOptionsTypeahead', input = document.createElement('input');
      input.type = 'text'; input.setAttribute('list', listId); input.autocomplete = 'off'; input.placeholder = 'Type to search court...'; input.className = select.className || '';
      input.value = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : '';
      var datalist = document.getElementById(listId);
      if (!datalist) { datalist = document.createElement('datalist'); datalist.id = listId; document.body.appendChild(datalist); }
      Array.from(select.options).forEach(function (option) { if (option.value && !Array.from(datalist.options).some(function (x) { return x.value === option.text; })) { var item = document.createElement('option'); item.value = option.text; datalist.appendChild(item); } });
      function syncCourt() { var value = input.value.trim().toLowerCase(); var match = Array.from(select.options).find(function (option) { return option.text.trim().toLowerCase() === value || option.value.trim().toLowerCase() === value; }); if (match) { select.value = match.value; select.dispatchEvent(new Event('change', { bubbles: true })); } }
      input.addEventListener('input', syncCourt); input.addEventListener('change', syncCourt); select.style.display = 'none'; select.dataset.courtTypeahead = '1'; select.insertAdjacentElement('afterend', input);
    });
  }
  function readData() { try { return JSON.parse(localStorage.getItem('advocateDeskData') || 'null') || {}; } catch (e) { return {}; } }
  function parseDate(value) {
    if (!value) return null;
    var d = new Date(String(value).slice(0, 10) + 'T00:00:00');
    if (!isNaN(d.getTime())) return d;
    d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  function hidePastHearings() {
    var table = document.getElementById('hearingTable');
    if (!table) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    table.querySelectorAll('tbody tr').forEach(function (row) {
      var cell = row.querySelector('td');
      if (!cell) return;
      var date = parseDate(cell.textContent.trim());
      if (date) row.style.display = date < today ? 'none' : '';
    });
  }
  function fieldControl(labelText, root) {
    var scope = root || document;
    var labels = Array.from(scope.querySelectorAll('label'));
    var label = labels.find(function (x) { return x.textContent.trim().toLowerCase() === labelText.toLowerCase(); });
    if (!label) return null;
    var field = label.closest('.field') || label.parentElement;
    return field ? field.querySelector('input,select,textarea') : null;
  }
  function enhanceHearingModal() {
    var modal = Array.from(document.querySelectorAll('.modal, [role="dialog"]')).find(function (x) {
      var visible = !!(x.offsetWidth || x.offsetHeight || x.getClientRects().length);
      return visible && /Schedule Hearing|Edit Hearing/i.test(x.textContent || '');
    });
    if (!modal) return;
    var data = readData(), cases = Array.isArray(data.cases) ? data.cases : [];
    if (!cases.length) return;
    var caseControl = fieldControl('Case Number', modal);
    if (!caseControl) return;
    if (caseControl.tagName !== 'SELECT') {
      var select = document.createElement('select');
      select.className = caseControl.className || 'filter';
      select.id = caseControl.id || '';
      select.name = caseControl.name || 'caseId';
      select.required = caseControl.required;
      var oldValue = caseControl.dataset.caseId || caseControl.value || '';
      caseControl.replaceWith(select);
      caseControl = select;
      caseControl.dataset.previousValue = oldValue;
    }
    var current = caseControl.value || caseControl.dataset.previousValue || '';
    caseControl.innerHTML = '<option value="">Select a case</option>' + cases.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc((c.number || c.title || c.id) + (c.client ? ' — ' + c.client : '')) + '</option>';
    }).join('');
    caseControl.value = cases.some(function (c) { return c.id === current || c.number === current; }) ? (cases.find(function (c) { return c.id === current || c.number === current; }) || {}).id : '';
    function fillCase(id) {
      var c = cases.find(function (x) { return x.id === id || x.number === id; });
      if (!c) return;
      var title = fieldControl('Case Title', modal); if (title) { title.value = c.title || ''; title.dispatchEvent(new Event('input', { bubbles: true })); }
      var client = fieldControl('Client', modal); if (client) { client.value = c.client || ''; client.readOnly = true; client.setAttribute('aria-readonly', 'true'); client.dispatchEvent(new Event('input', { bubbles: true })); }
      var court = fieldControl('Court', modal); if (court) { court.value = c.court || ''; court.dispatchEvent(new Event('change', { bubbles: true })); }
      var hidden = modal.querySelector('input[name="caseId"],input[data-case-id]'); if (hidden) hidden.value = c.id;
    }
    if (caseControl.dataset.hearingBound !== '1') {
      caseControl.addEventListener('change', function () { fillCase(caseControl.value); });
      caseControl.dataset.hearingBound = '1';
    }
    if (caseControl.value) fillCase(caseControl.value);
  }
  function fixDashboardDateAndCount() {
    var content = document.getElementById('content');
    if (!content || !content.querySelector('.cards')) return;
    var now = new Date();
    var hour = now.getHours();
    var greeting = hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');
    var title = content.querySelector('.page-title h1');
    if (title) title.textContent = greeting + ', Advocate';
    var subtitle = content.querySelector('.page-title p');
    if (subtitle) subtitle.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) + ' • Demo Workspace';
    var data = readData(), hearings = Array.isArray(data.hearings) ? data.hearings : [];
    var start = new Date(now); start.setHours(0, 0, 0, 0);
    var end = new Date(start); end.setDate(end.getDate() + 30);
    var count = hearings.filter(function (h) { var d = parseDate(h.date); return d && d >= start && d <= end; }).length;
    var cards = content.querySelectorAll('.stat');
    if (cards[1]) { var value = cards[1].querySelector('.stat-value'); if (value) value.textContent = count; }
  }
  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-page]');
    if (item && !item.disabled) { item.classList.add('tap-active'); window.setTimeout(function () { item.classList.remove('tap-active'); }, 180); closeMobileNav(); }
    var menu = event.target.closest && event.target.closest('#mobileMenu'), overlayHit = event.target.closest && event.target.closest('#mobileOverlay');
    if (menu || overlayHit) { var sidebar = document.querySelector('.sidebar'), overlay = document.getElementById('mobileOverlay'); if (sidebar && overlay) { var open = !!menu && !sidebar.classList.contains('open'); sidebar.classList.toggle('open', open); overlay.classList.toggle('show', open); overlay.setAttribute('aria-hidden', open ? 'false' : 'true'); } }
    if (event.target.classList && event.target.classList.contains('modal')) { event.target.classList.remove('show'); event.target.setAttribute('aria-hidden', 'true'); }
  }, false);
  document.addEventListener('touchstart', function (event) { var target = event.target.closest && event.target.closest('button, a, [role="button"]'); if (target) target.classList.add('touch-active'); }, { passive: true });
  document.addEventListener('touchend', function (event) { var target = event.target.closest && event.target.closest('button, a, [role="button"]'); if (target) target.classList.remove('touch-active'); }, { passive: true });
  window.addEventListener('error', function (event) { console.error('[AdvocateDesk]', event.error || event.message); });
  var observer = new MutationObserver(function () { makeCourtTypeahead(); hidePastHearings(); enhanceHearingModal(); fixDashboardDateAndCount(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  makeCourtTypeahead(); hidePastHearings(); enhanceHearingModal(); fixDashboardDateAndCount();
  window.setInterval(function () { hidePastHearings(); enhanceHearingModal(); fixDashboardDateAndCount(); }, 500);
  var style = document.createElement('style'); style.textContent = 'button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation}button.tap-active,button.touch-active{transform:translateY(1px);opacity:.86}@media(max-width:900px){.sidebar{transition:transform .2s ease}.sidebar.open{transform:translateX(0)}.mobile-overlay{display:none}.mobile-overlay.show{display:block}}'; document.head.appendChild(style);
})();