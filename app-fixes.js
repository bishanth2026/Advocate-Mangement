/* Compatibility and interaction fixes for the local AdvocateDesk build. */
(function () {
  'use strict';

  // app.js uses esc() in several rendered templates. Define it before app.js runs.
  if (typeof window.esc !== 'function') {
    window.esc = function (value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
  }

  // Keep navigation usable on touch devices and prevent accidental double taps.
  document.addEventListener('click', function (event) {
    const item = event.target.closest && event.target.closest('[data-page]');
    if (!item || item.disabled) return;
    item.classList.add('tap-active');
    window.setTimeout(function () { item.classList.remove('tap-active'); }, 180);

    // Close the mobile drawer after selecting a page.
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar && overlay && window.innerWidth <= 900) {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }, false);

  // Make the mobile menu and overlay work even if the main app did not bind them.
  document.addEventListener('click', function (event) {
    const menu = event.target.closest && event.target.closest('#mobileMenu');
    const overlayHit = event.target.closest && event.target.closest('#mobileOverlay');
    if (!menu && !overlayHit) return;
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (!sidebar || !overlay) return;
    const open = menu ? !sidebar.classList.contains('open') : false;
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
  }, false);

  // Show a useful diagnostic in the console instead of silently failing.
  window.addEventListener('error', function (event) {
    console.error('[AdvocateDesk]', event.error || event.message);
  });

  // Small touch-friendly interaction styling.
  const style = document.createElement('style');
  style.textContent = `
    button, a, [role="button"] { -webkit-tap-highlight-color: transparent; }
    button.tap-active { transform: translateY(1px); opacity: .86; }
    @media (max-width: 900px) {
      .sidebar { transition: transform .2s ease; }
      .sidebar.open { transform: translateX(0); }
      .mobile-overlay { display: none; }
      .mobile-overlay.show { display: block; }
    }
  `;
  document.head.appendChild(style);
})();
