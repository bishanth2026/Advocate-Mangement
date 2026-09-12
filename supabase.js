/* AdvocateDesk Supabase client bootstrap. */
(function () {
  'use strict';
  function load() {
    if (window.supabase || document.querySelector('script[data-supabase-sdk]')) return;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.async = true;
    s.setAttribute('data-supabase-sdk', '1');
    s.onload = function () {
      if (!window.supabase || !window.AD_SUPABASE_CONFIG || !window.AD_SUPABASE_CONFIG.url || !window.AD_SUPABASE_CONFIG.publishableKey) return;
      window.ADsupabase = window.supabase.createClient(
        window.AD_SUPABASE_CONFIG.url,
        window.AD_SUPABASE_CONFIG.publishableKey,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
      );
      window.dispatchEvent(new CustomEvent('ad-supabase-ready'));
    };
    document.head.appendChild(s);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
  else load();
})();
