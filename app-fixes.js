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
  var observer = new MutationObserver(function () { makeCourtTypeahead(); }); observer.observe(document.documentElement, { childList: true, subtree: true }); makeCourtTypeahead();
  var style = document.createElement('style'); style.textContent = 'button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation}button.tap-active,button.touch-active{transform:translateY(1px);opacity:.86}@media(max-width:900px){.sidebar{transition:transform .2s ease}.sidebar.open{transform:translateX(0)}.mobile-overlay{display:none}.mobile-overlay.show{display:block}}'; document.head.appendChild(style);

  function parseDate(value) { if (!value) return null; var text = String(value).trim(); var date = new Date(text.slice(0, 10) + 'T00:00:00'); if (!isNaN(date.getTime())) return date; date = new Date(text); return isNaN(date.getTime()) ? null : date; }
  function getHearings() { try { var stored = JSON.parse(localStorage.getItem('advocateDeskData') || 'null'); return stored && Array.isArray(stored.hearings) ? stored.hearings : []; } catch (error) { return []; } }
  function fixDashboard() {
    var content = document.getElementById('content'); if (!content || !content.querySelector('.cards')) return;
    var now = new Date(), hour = now.getHours(), greeting = hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');
    var title = content.querySelector('.page-title h1'); if (title && /Good morning|Good afternoon|Good evening/.test(title.textContent)) title.textContent = greeting + ', Advocate';
    var subtitle = content.querySelector('.page-title p'); if (subtitle) subtitle.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) + ' • Demo Workspace';
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()), end = new Date(start); end.setDate(end.getDate() + 30);
    var upcoming = getHearings().filter(function (hearing) { var date = parseDate(hearing && hearing.date); return date && date >= start && date <= end; });
    if (!upcoming.length) {
      var panel = Array.from(content.querySelectorAll('.panel')).find(function (node) { return /Upcoming Hearings/i.test(node.textContent || ''); });
      if (panel) { var rows = panel.querySelectorAll('.list-row'); if (rows.length) upcoming = new Array(rows.length).fill({}); }
    }
    var cards = content.querySelectorAll('.stat'); if (cards.length > 1) { var value = cards[1].querySelector('.stat-value'); if (value) value.textContent = upcoming.length; }
  }
  var dashboardObserver = new MutationObserver(function () { window.setTimeout(fixDashboard, 0); }); dashboardObserver.observe(document.getElementById('content') || document.body, { childList: true, subtree: true });
  [0, 250, 800].forEach(function (delay) { window.setTimeout(fixDashboard, delay); });
  window.addEventListener('hashchange', function () { window.setTimeout(fixDashboard, 0); });
})();