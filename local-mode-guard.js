/* AdvocateDesk local-only mode.
   This file deliberately prevents stale cloud integrations from blocking
   the local application after the Supabase connection was removed. */
(function(){
  'use strict';
  window.ADVOCATE_LOCAL_MODE = true;
  window.ADSupabase = null;
  window.supabaseClient = null;
  window.supabase = null;
  window.ADSupabaseReady = false;
  window.ADCloud = {
    enabled: false,
    ready: false,
    isReady: function(){ return false; },
    save: function(){ return Promise.resolve(null); },
    update: function(){ return Promise.resolve(null); },
    remove: function(){ return Promise.resolve(null); }
  };
})();
