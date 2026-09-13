/* Compatibility fixes for the local AdvocateDesk build. */
(function () {
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
})();
