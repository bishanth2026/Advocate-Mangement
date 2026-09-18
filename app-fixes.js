/* AdvocateDesk compatibility fixes */
(function () {
  'use strict';
  if (typeof window.esc !== 'function') window.esc = function (v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');
  };
  function data() {
    try {
      return JSON.parse(localStorage.getItem('advocateDeskData') || '{}') || {};
    } catch (_) { return {}; }
  }
  function date(v) { if (!v) return null; var d = new Date(String(v).slice(0, 10) + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; }
  function norm(v) { return String(v || '').replace(/[*:\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function control(labelText, root) {
    var scope = root || document, wanted = norm(labelText);
    var labels = Array.from(scope.querySelectorAll('label'));
    var label = labels.find(function (l) { return norm(l.textContent) === wanted || norm(l.textContent).indexOf(wanted) === 0; });
    if (label) {
      var field = label.closest('.field') || label.parentElement;
      var found = field && field.querySelector('input,select,textarea');
      if (found) return found;
      if (label.htmlFor) { found = document.getElementById(label.htmlFor); if (found) return found; }
    }
    var candidates = Array.from(scope.querySelectorAll('input,select,textarea'));
    return candidates.find(function (el) {
      return norm(el.getAttribute('aria-label')) === wanted || norm(el.getAttribute('placeholder')) === wanted;
    }) || null;
  }
  function caseClient(c, all) {
    var ids = Array.isArray(c.clientIds) ? c.clientIds : (c.clientId ? [c.clientId] : []);
    var clients = all && Array.isArray(all.clients) ? all.clients : [];
    var linked = clients.find(function (x) { return ids.indexOf(x.id) !== -1; });
    return c.client || (linked && linked.name) || '';
  }
  function setValue(el, value, readonly) {
    if (!el) return;
    var next = value || '';
    try {
      var setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
      if (setter && setter.set) setter.set.call(el, next); else el.value = next;
    } catch (_) { el.value = next; }
    if (readonly) { el.readOnly = true; el.setAttribute('aria-readonly', 'true'); }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function fillHearingCase(modal, id) {
    var all = data(), list = Array.isArray(all.cases) ? all.cases : [];
    var c = list.find(function (x) { return String(x.id) === String(id) || String(x.number) === String(id); });
    if (!c) return;
    setValue(control('Case Title', modal), c.title || '', false);
    setValue(control('Client', modal), caseClient(c, all), true);
    setValue(control('Court', modal), c.court || '', false);
    setValue(control('Stage', modal), c.stage || '', false);
    var hidden = modal.querySelector('input[name="caseId"], input[data-case-id]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'caseId';
      modal.appendChild(hidden);
    }
    hidden.value = c.id || '';
  }
  function enhanceHearing() {
    var modal = Array.from(document.querySelectorAll('.modal,[role="dialog"]')).find(function (m) {
      return (m.offsetWidth || m.offsetHeight || m.getClientRects().length) && /Schedule Hearing|Edit Hearing/i.test(m.textContent || '');
    });
    if (!modal) return;
    var all = data(), cases = Array.isArray(all.cases) ? all.cases : [];
    var original = control('Case Number', modal);
    if (!original || !cases.length) return;
    if (original.dataset.advocateSearchReady === '1') return;
    original.dataset.advocateSearchReady = '1';
    var wrap = document.createElement('div');
    wrap.className = 'adv-case-search';
    wrap.style.cssText = 'position:relative;width:100%;z-index:10050;';
    original.parentNode.insertBefore(wrap, original);
    wrap.appendChild(original);
    original.type = 'text';
    original.readOnly = false;
    original.disabled = false;
    original.autocomplete = 'off';
    original.placeholder = 'Search case number, title or client';
    original.setAttribute('role', 'combobox');
    original.setAttribute('aria-expanded', 'false');
    var menu = document.createElement('div');
    menu.className = 'adv-case-menu';
    menu.style.cssText = 'display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:260px;overflow:auto;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 12px 30px rgba(15,23,42,.18);z-index:10060;';
    wrap.appendChild(menu);
    var selectedId = '';
    function label(c) { return (c.number || c.title || c.id || '') + (c.client ? ' — ' + c.client : ''); }
    function close() { menu.style.display = 'none'; original.setAttribute('aria-expanded', 'false'); }
    function render(query) {
      var q = norm(query);
      var filtered = cases.filter(function (c) {
        return !q || [c.number,c.title,c.client,c.court,c.stage,c.id].some(function (v) { return norm(v).indexOf(q) !== -1; });
      });
      menu.innerHTML = filtered.length ? filtered.map(function (c) {
        return '<button type="button" class="adv-case-option" data-case-id="' + esc(c.id || c.number) + '" style="display:block;width:100%;text-align:left;padding:10px 12px;border:0;border-bottom:1px solid #eef2f7;background:#fff;cursor:pointer;color:#172033"><strong style="display:block">' + esc(c.number || c.id || '—') + '</strong><span style="display:block;font-size:13px">' + esc(c.title || 'Untitled case') + '</span><small style="display:block;color:#64748b">' + esc([c.client, c.court].filter(Boolean).join(' • ') || 'Details unavailable') + '</small></button>';
      }).join('') : '<div style="padding:12px;color:#64748b">No cases found</div>';
      menu.style.display = 'block';
      original.setAttribute('aria-expanded', 'true');
    }
    function choose(id) {
      var c = cases.find(function (x) { return String(x.id) === String(id) || String(x.number) === String(id); });
      if (!c) return;
      selectedId = c.id || c.number;
      original.value = label(c);
      original.dataset.caseId = selectedId;
      fillHearingCase(modal, selectedId);
      close();
    }
    original.addEventListener('focus', function () { render(original.value); });
    original.addEventListener('input', function () { selectedId = ''; original.dataset.caseId = ''; render(original.value); });
    original.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowDown') { e.preventDefault(); var first = menu.querySelector('.adv-case-option'); if (first) first.focus(); }
    });
    menu.addEventListener('click', function (e) {
      var option = e.target.closest('.adv-case-option');
      if (option) choose(option.getAttribute('data-case-id'));
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); }, true);
    var existing = cases.find(function (c) { return String(c.id) === String(original.value) || String(c.number) === String(original.value) || String(c.id) === String(original.dataset.caseId); });
    if (existing) choose(existing.id || existing.number);
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
  style.textContent = 'button,a,[role="button"]{-webkit-tap-highlight-color:transparent;touch-action:manipulation}@media(max-width:900px){.sidebar{transition:transform .2s ease}.sidebar.open{transform:translateX(0)}.mobile-overlay{display:none}.mobile-overlay.show{display:block}.adv-case-option:focus{background:#eef4ff!important}}';
  document.head.appendChild(style);
})();