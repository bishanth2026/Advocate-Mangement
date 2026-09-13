/* Compatibility and interaction fixes for the local AdvocateDesk build. */
(function () {
  'use strict';

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

  function closeMobileNav() {
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('mobileOverlay');
    if (sidebar && overlay && window.innerWidth <= 900) {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-page]');
    if (item && !item.disabled) {
      item.classList.add('tap-active');
      window.setTimeout(function () { item.classList.remove('tap-active'); }, 180);
      closeMobileNav();
    }

    var menu = event.target.closest && event.target.closest('#mobileMenu');
    var overlayHit = event.target.closest && event.target.closest('#mobileOverlay');
    if (menu || overlayHit) {
      var sidebar = document.querySelector('.sidebar');
      var overlay = document.getElementById('mobileOverlay');
      if (sidebar && overlay) {
        var open = !!menu && !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', open);
        overlay.classList.toggle('show', open);
        overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
    }

    // Close any modal when its backdrop is tapped, including on iPhone.
    if (event.target.classList && event.target.classList.contains('modal')) {
      event.target.classList.remove('show');
      event.target.setAttribute('aria-hidden', 'true');
    }
  }, false);

  // Avoid dead buttons when a browser restores a stale disabled state.
  document.addEventListener('touchstart', function (event) {
    var target = event.target.closest && event.target.closest('button, a, [role="button"]');
    if (target) target.classList.add('touch-active');
  }, { passive: true });
  document.addEventListener('touchend', function (event) {
    var target = event.target.closest && event.target.closest('button, a, [role="button"]');
    if (target) target.classList.remove('touch-active');
  }, { passive: true });

  window.addEventListener('error', function (event) {
    console.error('[AdvocateDesk]', event.error || event.message);
  });

  var style = document.createElement('style');
  style.textContent = '\n    button, a, [role="button"] { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }\n    button.tap-active, button.touch-active { transform: translateY(1px); opacity: .86; }\n    @media (max-width: 900px) {\n      .sidebar { transition: transform .2s ease; }\n      .sidebar.open { transform: translateX(0); }\n      .mobile-overlay { display: none; }\n      .mobile-overlay.show { display: block; }\n    }\n  ';
  document.head.appendChild(style);
})();